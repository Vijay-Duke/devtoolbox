import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { streamSSE } from 'hono/streaming'
import { v4 as uuidv4 } from 'uuid'
import { readFileSync } from 'fs'

// Load configuration
const config = JSON.parse(readFileSync(new URL('./config.json', import.meta.url), 'utf8'))

const app = new Hono()

// In-memory storage for inboxes and emails
const inboxes = new Map()

// Dual-index SSE connection tracking for O(k) broadcasting performance
const inboxSubs = new Map() // Map<inboxId, Map<connectionId, stream>>
const connMeta = new Map()  // Map<connectionId, Set<inboxId>> - updated for multi-inbox support
const connHeartbeats = new Map() // Map<connectionId, lastHeartbeat>

// TTL tracking for automatic expiry
const inboxTtl = new Map()    // Map<inboxId, createdTimestamp>
const subscriberTtl = new Map() // Map<connectionId, createdTimestamp>

// Event tracking for message replay
const eventCounters = new Map() // Map<inboxId, currentEventId>
const ringBuffers = new Map()   // Map<inboxId, CircularBuffer>

// Performance optimizations: Global Connection Manager
class GlobalConnectionManager {
  constructor() {
    this.connections = new Map() // Map<connectionId, {stream, inboxIds, lastActivity, connectionType}>
    this.globalHeartbeatTimer = null
    this.isStarted = false
  }

  addConnection(connectionId, inboxIds, stream, connectionType = 'multi') {
    const now = Date.now()
    this.connections.set(connectionId, {
      stream,
      inboxIds: Array.isArray(inboxIds) ? inboxIds : [inboxIds],
      lastActivity: now,
      connectionType,
      created: now
    })

    if (!this.isStarted) {
      this.startGlobalHeartbeat()
    }
  }

  removeConnection(connectionId) {
    this.connections.delete(connectionId)
    
    // Stop global heartbeat if no connections
    if (this.connections.size === 0 && this.globalHeartbeatTimer) {
      clearInterval(this.globalHeartbeatTimer)
      this.globalHeartbeatTimer = null
      this.isStarted = false
    }
  }

  updateActivity(connectionId) {
    const conn = this.connections.get(connectionId)
    if (conn) {
      conn.lastActivity = Date.now()
    }
  }

  startGlobalHeartbeat() {
    if (this.globalHeartbeatTimer) return
    
    this.globalHeartbeatTimer = setInterval(() => {
      this.performGlobalHeartbeat()
    }, config.timeouts.pingIntervalMs)
    
    this.isStarted = true
    console.log('Global heartbeat manager started')
  }

  async performGlobalHeartbeat() {
    const now = Date.now()
    const deadConnections = []
    const pingPromises = []

    for (const [connectionId, conn] of this.connections.entries()) {
      // Check for dead connections
      if (now - conn.lastActivity > config.timeouts.heartbeatTimeoutMs) {
        deadConnections.push(connectionId)
        continue
      }

      // Dynamic ping intervals based on connection age and activity
      const connectionAge = now - conn.created
      const timeSinceActivity = now - conn.lastActivity
      
      // Skip ping if very recent activity (< 15s)
      if (timeSinceActivity < 15000) {
        continue
      }

      // Longer intervals for older, stable connections
      const pingInterval = connectionAge > 300000 ? // 5 minutes
        config.timeouts.pingIntervalMs * 2 : // Double interval for old connections
        config.timeouts.pingIntervalMs

      if (timeSinceActivity >= pingInterval) {
        const pingPromise = this.sendPing(connectionId, conn).catch(error => {
          console.log(`Ping failed for ${connectionId}:`, error.message)
          deadConnections.push(connectionId)
        })
        pingPromises.push(pingPromise)
      }
    }

    // Send all pings concurrently
    if (pingPromises.length > 0) {
      await Promise.allSettled(pingPromises)
    }

    // Clean up dead connections
    for (const connectionId of deadConnections) {
      console.log(`Removing dead connection: ${connectionId}`)
      removeConnection(connectionId)
      this.removeConnection(connectionId)
    }

    if (this.connections.size > 0) {
      console.log(`Global heartbeat: ${this.connections.size} active connections, ${pingPromises.length} pings sent, ${deadConnections.length} removed`)
    }
  }

  async sendPing(connectionId, conn) {
    try {
      await conn.stream.writeSSE({
        data: JSON.stringify({ 
          type: 'ping', 
          timestamp: new Date().toISOString(),
          connectionId: connectionId.slice(0, 8) // Short ID for debugging
        }),
        event: 'ping',
        retry: config.sse.retryMs
      })
      
      conn.lastActivity = Date.now()
      connHeartbeats.set(connectionId, Date.now())
    } catch (error) {
      throw error
    }
  }

  getStats() {
    const connectionTypes = {}
    const totalConnections = this.connections.size
    
    for (const [, conn] of this.connections.entries()) {
      connectionTypes[conn.connectionType] = (connectionTypes[conn.connectionType] || 0) + 1
    }

    return {
      totalConnections,
      connectionTypes,
      globalHeartbeatActive: this.isStarted
    }
  }
}

// Global connection manager instance
const globalConnectionManager = new GlobalConnectionManager()

// Memory Pool for Object Reuse
class MemoryPool {
  constructor() {
    this.emailEventPool = []
    this.broadcastPayloadPool = []
    this.sseEventPool = []
    this.maxPoolSize = 1000 // Prevent unbounded growth
  }

  // Get or create email event object
  getEmailEvent() {
    const obj = this.emailEventPool.pop() || {
      id: null,
      type: 'email',
      timestamp: null,
      data: null
    }
    
    // Reset object state
    obj.id = null
    obj.type = 'email'
    obj.timestamp = null
    obj.data = null
    
    return obj
  }

  // Return email event object to pool
  returnEmailEvent(obj) {
    if (this.emailEventPool.length < this.maxPoolSize) {
      // Clear any references to prevent memory leaks
      if (obj.data) {
        obj.data = null
      }
      this.emailEventPool.push(obj)
    }
  }

  // Get or create broadcast payload object
  getBroadcastPayload() {
    const obj = this.broadcastPayloadPool.pop() || {
      type: null,
      timestamp: null,
      data: null,
      inboxId: null,
      connectionId: null
    }
    
    // Reset object state
    obj.type = null
    obj.timestamp = null
    obj.data = null
    obj.inboxId = null
    obj.connectionId = null
    
    return obj
  }

  // Return broadcast payload object to pool
  returnBroadcastPayload(obj) {
    if (this.broadcastPayloadPool.length < this.maxPoolSize) {
      // Clear any references
      obj.data = null
      this.broadcastPayloadPool.push(obj)
    }
  }

  // Get or create SSE event object
  getSSEEvent() {
    const obj = this.sseEventPool.pop() || {
      data: null,
      event: null,
      id: null,
      retry: null
    }
    
    // Reset object state
    obj.data = null
    obj.event = null
    obj.id = null
    obj.retry = null
    
    return obj
  }

  // Return SSE event object to pool
  returnSSEEvent(obj) {
    if (this.sseEventPool.length < this.maxPoolSize) {
      this.sseEventPool.push(obj)
    }
  }

  // Get pool statistics
  getStats() {
    return {
      emailEventPool: this.emailEventPool.length,
      broadcastPayloadPool: this.broadcastPayloadPool.length,
      sseEventPool: this.sseEventPool.length,
      maxPoolSize: this.maxPoolSize
    }
  }

  // Warm up pools with initial objects
  warmUp(size = 50) {
    console.log(`Warming up memory pools with ${size} objects each...`)
    
    for (let i = 0; i < size; i++) {
      this.emailEventPool.push({
        id: null,
        type: 'email',
        timestamp: null,
        data: null
      })
      
      this.broadcastPayloadPool.push({
        type: null,
        timestamp: null,
        data: null,
        inboxId: null,
        connectionId: null
      })
      
      this.sseEventPool.push({
        data: null,
        event: null,
        id: null,
        retry: null
      })
    }
    
    console.log('Memory pools warmed up')
  }
}

// Global memory pool instance
const memoryPool = new MemoryPool()
memoryPool.warmUp() // Pre-populate with objects

// Selective Serialization for Different Connection Types
class SelectiveSerializer {
  constructor() {
    this.serializationCache = new Map() // Cache for repeated serializations
    this.maxCacheSize = 500 // Prevent unbounded cache growth
  }

  // Create optimized payload based on connection type
  createPayload(email, inboxId, connectionType = 'multi') {
    const cacheKey = `${connectionType}-${JSON.stringify(email)}-${inboxId}`
    
    // Check cache first
    if (this.serializationCache.has(cacheKey)) {
      return this.serializationCache.get(cacheKey)
    }

    let payload
    switch (connectionType) {
      case 'single':
        // Single inbox connections don't need inboxId in payload
        payload = {
          type: 'email',
          data: email
        }
        break
      
      case 'multi':
        // Multi-inbox connections need inboxId for routing
        payload = {
          type: 'email',
          inboxId: inboxId,
          data: email
        }
        break
      
      case 'minimal':
        // Minimal payload for bandwidth-constrained connections
        payload = {
          type: 'email',
          inboxId: inboxId,
          data: {
            id: email.id,
            from: email.from,
            subject: email.subject,
            timestamp: email.timestamp,
            // Omit body and attachments for minimal mode
            hasBody: !!email.body,
            hasAttachments: !!(email.attachments && email.attachments.length > 0)
          }
        }
        break
      
      default:
        // Default to multi-inbox format
        payload = {
          type: 'email',
          inboxId: inboxId,
          data: email
        }
    }

    const serialized = JSON.stringify(payload)
    
    // Cache the result if cache isn't full
    if (this.serializationCache.size < this.maxCacheSize) {
      this.serializationCache.set(cacheKey, serialized)
    } else if (this.serializationCache.size >= this.maxCacheSize) {
      // Simple cache eviction: clear oldest entries
      const keysToDelete = Array.from(this.serializationCache.keys()).slice(0, 100)
      keysToDelete.forEach(key => this.serializationCache.delete(key))
      this.serializationCache.set(cacheKey, serialized)
    }

    return serialized
  }

  // Clear cache when needed
  clearCache() {
    this.serializationCache.clear()
  }

  // Get cache statistics
  getCacheStats() {
    return {
      cacheSize: this.serializationCache.size,
      maxCacheSize: this.maxCacheSize,
      hitRate: this.calculateHitRate()
    }
  }

  calculateHitRate() {
    // This would require tracking hits/misses in a real implementation
    // For now, return cache utilization as a proxy
    return this.serializationCache.size / this.maxCacheSize
  }
}

// Global selective serializer instance
const selectiveSerializer = new SelectiveSerializer()

// Write Streaming for Large Subscriber Lists
class WriteStreamManager {
  constructor() {
    this.streamingThreshold = 50 // Start streaming for more than 50 subscribers
    this.chunkSize = 10 // Process subscribers in chunks
    this.activeStreams = new Map() // Track active streaming operations
  }

  // Determine if we should use streaming for this broadcast
  shouldUseStreaming(subscriberCount) {
    return subscriberCount > this.streamingThreshold
  }

  // Stream writes for large subscriber lists
  async streamBroadcast(connectionsByType, eventId, email, inboxId, failedConnections) {
    const streamId = `${inboxId}-${eventId}-${Date.now()}`
    this.activeStreams.set(streamId, { startTime: Date.now(), subscriberCount: 0 })
    
    try {
      let totalWriteCount = 0
      const chunkPromises = []

      // Process each connection type
      for (const [connectionType, connections] of connectionsByType.entries()) {
        // Create serialized payload once per connection type
        const serializedEmail = selectiveSerializer.createPayload(email, inboxId, connectionType)
        
        // Split connections into chunks for streaming
        const chunks = this.chunkArray(connections, this.chunkSize)
        
        for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
          const chunk = chunks[chunkIndex]
          
          // Create chunk promise that processes a batch of connections
          const chunkPromise = this.processChunk(
            chunk, 
            serializedEmail, 
            eventId, 
            streamId,
            chunkIndex
          ).then(result => {
            totalWriteCount += result.successCount
            failedConnections.push(...result.failedConnections)
            return result
          })
          
          chunkPromises.push(chunkPromise)
          
          // Yield control after each chunk to keep event loop responsive
          if (chunkIndex % 3 === 0) { // Every 3 chunks
            await new Promise(resolve => setImmediate(resolve))
          }
        }
      }

      // Wait for all chunks to complete
      const chunkResults = await Promise.allSettled(chunkPromises)
      
      // Log any chunk failures
      chunkResults.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.log(`Chunk ${index} failed:`, result.reason)
        }
      })

      const streamInfo = this.activeStreams.get(streamId)
      if (streamInfo) {
        const duration = Date.now() - streamInfo.startTime
        console.log(`Streaming broadcast completed: ${totalWriteCount} writes in ${duration}ms`)
      }

      return { writeCount: totalWriteCount }
      
    } finally {
      this.activeStreams.delete(streamId)
    }
  }

  // Process a chunk of connections
  async processChunk(connections, serializedEmail, eventId, streamId, chunkIndex) {
    const chunkStart = Date.now()
    const writePromises = []
    const chunkFailedConnections = []
    let successCount = 0

    for (const [connectionId, stream] of connections) {
      // Use memory pool for SSE event object
      const sseEvent = memoryPool.getSSEEvent()
      sseEvent.id = config.sse.enableEventIds ? eventId.toString() : undefined
      sseEvent.data = serializedEmail
      sseEvent.event = 'email'
      sseEvent.retry = config.sse.retryMs
      
      const writePromise = stream.writeSSE(sseEvent).then(() => {
        // Return SSE event object to pool after successful write
        memoryPool.returnSSEEvent(sseEvent)
        successCount++
      }).catch(error => {
        // Return SSE event object to pool even on error
        memoryPool.returnSSEEvent(sseEvent)
        console.log(`Chunk ${chunkIndex} - Failed to send email to connection ${connectionId}:`, error.message)
        chunkFailedConnections.push(connectionId)
      })
      
      writePromises.push(writePromise)
    }

    // Wait for all writes in this chunk
    await Promise.allSettled(writePromises)
    
    const chunkDuration = Date.now() - chunkStart
    console.log(`Chunk ${chunkIndex} processed: ${successCount}/${connections.length} successful in ${chunkDuration}ms`)

    return {
      successCount,
      failedConnections: chunkFailedConnections,
      chunkIndex,
      duration: chunkDuration
    }
  }

  // Utility to split array into chunks
  chunkArray(array, chunkSize) {
    const chunks = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }

  // Get streaming statistics
  getStats() {
    return {
      streamingThreshold: this.streamingThreshold,
      chunkSize: this.chunkSize,
      activeStreams: this.activeStreams.size,
      activeStreamDetails: Array.from(this.activeStreams.entries()).map(([id, info]) => ({
        streamId: id,
        duration: Date.now() - info.startTime,
        subscriberCount: info.subscriberCount
      }))
    }
  }

  // Update configuration
  updateConfig(threshold, chunkSize) {
    this.streamingThreshold = Math.max(1, threshold || this.streamingThreshold)
    this.chunkSize = Math.max(1, chunkSize || this.chunkSize)
  }
}

// Global write stream manager instance
const writeStreamManager = new WriteStreamManager()

// Circular buffer for message replay with email summaries
class CircularBuffer {
  constructor(size, summaryFields = []) {
    this.size = size
    this.buffer = new Array(size)
    this.head = 0
    this.count = 0
    this.summaryFields = summaryFields
  }
  
  add(item) {
    // Store only summary fields to reduce memory usage
    const summary = this.createSummary(item)
    this.buffer[this.head] = summary
    this.head = (this.head + 1) % this.size
    if (this.count < this.size) {
      this.count++
    }
  }
  
  createSummary(item) {
    if (!this.summaryFields.length || !item.data) {
      return item // Store full item if no summary fields configured
    }
    
    const summary = {
      id: item.id,
      type: item.type,
      timestamp: item.timestamp,
      data: {}
    }
    
    // Extract only configured summary fields from email data
    for (const field of this.summaryFields) {
      if (item.data.hasOwnProperty(field)) {
        summary.data[field] = item.data[field]
      }
    }
    
    return summary
  }
  
  getFromId(eventId) {
    if (this.count === 0) return []
    
    const messages = []
    let current = this.head - this.count
    if (current < 0) current += this.size
    
    for (let i = 0; i < this.count; i++) {
      const msg = this.buffer[current]
      if (msg && msg.id > eventId) {
        messages.push(msg)
      }
      current = (current + 1) % this.size
    }
    
    return messages
  }
  
  getAll() {
    if (this.count === 0) return []
    
    const messages = []
    let current = this.head - this.count
    if (current < 0) current += this.size
    
    for (let i = 0; i < this.count; i++) {
      const msg = this.buffer[current]
      if (msg) messages.push(msg)
      current = (current + 1) % this.size
    }
    
    return messages
  }
}

// Helper functions for connection management
function addConnection(connectionId, inboxIds, stream) {
  const now = Date.now()
  
  // Convert single inboxId to array for backward compatibility
  if (typeof inboxIds === 'string') {
    inboxIds = [inboxIds]
  }
  
  // Add to reverse lookup (now stores Set of inboxIds)
  connMeta.set(connectionId, new Set(inboxIds))
  
  // Add to inbox subscribers for each inbox
  for (const inboxId of inboxIds) {
    if (!inboxSubs.has(inboxId)) {
      inboxSubs.set(inboxId, new Map())
    }
    inboxSubs.get(inboxId).set(connectionId, stream)
    
    // Initialize event tracking for this inbox
    if (!eventCounters.has(inboxId)) {
      eventCounters.set(inboxId, 0)
      ringBuffers.set(inboxId, new CircularBuffer(
        config.sse.ringBufferSize, 
        config.sse.emailSummaryFields
      ))
      
      // Initialize inbox TTL if not already set
      if (!inboxTtl.has(inboxId)) {
        inboxTtl.set(inboxId, now)
      }
    }
  }
  
  // Initialize heartbeat tracking
  connHeartbeats.set(connectionId, now)
  
  // Initialize TTL tracking for subscriber
  subscriberTtl.set(connectionId, now)
  
  console.log(`Connection added: ${connectionId} for inboxes [${inboxIds.join(', ')}]`)
}

function removeConnection(connectionId) {
  const inboxIds = connMeta.get(connectionId)
  if (!inboxIds || inboxIds.size === 0) return
  
  // Remove from reverse lookup
  connMeta.delete(connectionId)
  
  // Remove heartbeat tracking
  connHeartbeats.delete(connectionId)
  
  // Remove TTL tracking for subscriber
  subscriberTtl.delete(connectionId)
  
  // Remove from all inbox subscribers
  for (const inboxId of inboxIds) {
    const subscribers = inboxSubs.get(inboxId)
    if (subscribers) {
      subscribers.delete(connectionId)
      
      // Clean up empty inbox subscription maps
      if (subscribers.size === 0) {
        inboxSubs.delete(inboxId)
        console.log(`No remaining subscribers for inbox ${inboxId}`)
      }
    }
  }
  
  console.log(`Connection removed: ${connectionId} from inboxes [${Array.from(inboxIds).join(', ')}]`)
}

async function broadcastEmail(inboxId, email) {
  const subscribers = inboxSubs.get(inboxId)
  if (!subscribers || subscribers.size === 0) {
    return
  }
  
  const subscriberCount = subscribers.size
  console.log(`Broadcasting email to ${subscriberCount} subscribers for inbox ${inboxId}`)
  
  // Generate event ID
  const eventId = eventCounters.get(inboxId) + 1
  eventCounters.set(inboxId, eventId)
  
  // Create event with ID for ring buffer using memory pool
  const eventData = memoryPool.getEmailEvent()
  eventData.id = eventId
  eventData.type = 'email'
  eventData.data = email
  eventData.timestamp = Date.now()
  
  // Add to ring buffer for replay capability
  const ringBuffer = ringBuffers.get(inboxId)
  if (ringBuffer) {
    ringBuffer.add(eventData)
  }
  
  // Bounded broadcast: cap max recipients per inbox to prevent hot inbox starvation
  const maxRecipients = config.broadcasting.maxRecipientsPerInbox
  const cappedSubscribers = subscriberCount > maxRecipients 
    ? Array.from(subscribers.entries()).slice(0, maxRecipients)
    : subscribers.entries()
  
  if (subscriberCount > maxRecipients) {
    console.log(`Capping broadcast to ${maxRecipients} recipients (${subscriberCount} total)`)
  }
  
  // Group connections by type for selective serialization
  const connectionsByType = new Map()
  for (const [connectionId, stream] of cappedSubscribers) {
    const connectionInfo = globalConnectionManager.connections.get(connectionId)
    const connectionType = connectionInfo?.connectionType || 'multi'
    
    if (!connectionsByType.has(connectionType)) {
      connectionsByType.set(connectionType, [])
    }
    connectionsByType.get(connectionType).push([connectionId, stream])
  }
  
  // Create array of failed connections to clean up
  const failedConnections = []
  let writeCount = 0
  
  // Determine if we should use write streaming for large subscriber lists
  const effectiveSubscriberCount = Math.min(subscriberCount, maxRecipients)
  if (writeStreamManager.shouldUseStreaming(effectiveSubscriberCount)) {
    console.log(`Using write streaming for ${effectiveSubscriberCount} subscribers (threshold: ${writeStreamManager.streamingThreshold})`)
    
    try {
      const streamResult = await writeStreamManager.streamBroadcast(
        connectionsByType, 
        eventId, 
        email, 
        inboxId, 
        failedConnections
      )
      writeCount = streamResult.writeCount
      
      // Clean up failed connections if configured to drop them
      if (config.broadcasting.dropFailedClients && failedConnections.length > 0) {
        console.log(`Dropping ${failedConnections.length} failed clients from streaming broadcast`)
        for (const connectionId of failedConnections) {
          removeConnection(connectionId)
        }
      }
      
      return // Exit early - streaming handled everything
      
    } catch (error) {
      console.log('Write streaming failed, falling back to standard broadcast:', error.message)
      // Clear failed connections array since we're falling back
      failedConnections.length = 0
    }
  }
  
  // Broadcast with backpressure management (fallback or small subscriber lists)
  if (config.broadcasting.enableBackpressure) {
    // Non-blocking writes: fire and catch errors, then prune failed clients
    const writePromises = []
    
    // Process each connection type separately with optimized serialization
    for (const [connectionType, connections] of connectionsByType.entries()) {
      // Create serialized payload once per connection type
      const serializedEmail = selectiveSerializer.createPayload(email, inboxId, connectionType)
      
      for (const [connectionId, stream] of connections) {
        // Use memory pool for SSE event object
        const sseEvent = memoryPool.getSSEEvent()
        sseEvent.id = config.sse.enableEventIds ? eventId.toString() : undefined
        sseEvent.data = serializedEmail
        sseEvent.event = 'email'
        sseEvent.retry = config.sse.retryMs
        
        const writePromise = stream.writeSSE(sseEvent).then(() => {
          // Return SSE event object to pool after successful write
          memoryPool.returnSSEEvent(sseEvent)
        }).catch(error => {
          // Return SSE event object to pool even on error
          memoryPool.returnSSEEvent(sseEvent)
          console.log(`Failed to send email to connection ${connectionId}, marking for removal:`, error.message)
          return { failed: true, connectionId }
        })
        
        writePromises.push(writePromise)
        writeCount++
        
        // Write scheduling: batch microtasks after configured batch size to keep event loop responsive
        if (config.broadcasting.enableWriteScheduling && 
            writeCount % config.broadcasting.writeSchedulingBatchSize === 0) {
          await new Promise(resolve => queueMicrotask(resolve))
        }
      }
    }
    
    // Wait for all writes to complete and collect failed connections
    const results = await Promise.allSettled(writePromises)
    
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value?.failed) {
        failedConnections.push(result.value.connectionId)
      } else if (result.status === 'rejected') {
        console.log('Write promise rejected:', result.reason)
      }
    }
    
  } else {
    // Sequential writes (legacy behavior)
    for (const [connectionType, connections] of connectionsByType.entries()) {
      // Create serialized payload once per connection type
      const serializedEmail = selectiveSerializer.createPayload(email, inboxId, connectionType)
      
      for (const [connectionId, stream] of connections) {
        // Use memory pool for SSE event object
        const sseEvent = memoryPool.getSSEEvent()
        sseEvent.id = config.sse.enableEventIds ? eventId.toString() : undefined
        sseEvent.data = serializedEmail
        sseEvent.event = 'email'
        sseEvent.retry = config.sse.retryMs
        
        try {
          await stream.writeSSE(sseEvent)
          // Return SSE event object to pool after successful write
          memoryPool.returnSSEEvent(sseEvent)
        
          writeCount++
          
          // Write scheduling: batch microtasks after configured batch size to keep event loop responsive
          if (config.broadcasting.enableWriteScheduling && 
              writeCount % config.broadcasting.writeSchedulingBatchSize === 0) {
            await new Promise(resolve => queueMicrotask(resolve))
          }
          
        } catch (error) {
          // Return SSE event object to pool even on error
          memoryPool.returnSSEEvent(sseEvent)
          console.log(`Failed to send email to connection ${connectionId}, marking for removal:`, error.message)
          failedConnections.push(connectionId)
        }
      }
    }
  }
  
  // Clean up failed connections if configured to drop them
  if (config.broadcasting.dropFailedClients && failedConnections.length > 0) {
    console.log(`Dropping ${failedConnections.length} failed clients due to backpressure`)
    for (const connectionId of failedConnections) {
      removeConnection(connectionId)
    }
  }
}

// CORS configuration
app.use('*', cors({
  origin: config.server.cors.origins,
  allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Accept', 'Cache-Control', 'X-Requested-With', 'Authorization', 'Last-Event-ID'],
  credentials: false
}))

// Utility functions
function generateRandomEmail() {
  const domains = ['temp-mail.dev', 'throwaway.dev', 'test-inbox.dev']
  const randomString = Math.random().toString(36).substring(2, 10)
  const domain = domains[Math.floor(Math.random() * domains.length)]
  return `${randomString}@${domain}`
}

function getOrCreateInboxByEmail(emailAddress) {
  // Find existing inbox by email
  for (const [inboxId, inbox] of inboxes.entries()) {
    if (inbox.email === emailAddress) {
      return { inboxId, inbox }
    }
  }
  
  // Create new inbox if not found
  const inboxId = uuidv4()
  const now = Date.now()
  const isoString = new Date(now).toISOString()
  
  const newInbox = {
    id: inboxId,
    email: emailAddress,
    emails: [],
    createdAt: isoString
  }
  
  inboxes.set(inboxId, newInbox)
  inboxTtl.set(inboxId, now)
  
  console.log(`Auto-created inbox for email: ${emailAddress} (${inboxId})`)
  return { inboxId, inbox: newInbox }
}

function extractOTPCodes(text) {
  // Common OTP patterns: 4-8 digits
  const otpRegex = /\b\d{4,8}\b/g
  const matches = text.match(otpRegex) || []
  
  // Filter out obvious non-OTP numbers (like years, phone numbers)
  return matches.filter(match => {
    const num = parseInt(match)
    return num >= 1000 && num <= 99999999 && match.length >= 4 && match.length <= 8
  })
}

function generateMockEmail(toAddress) {
  const senders = [
    'noreply@github.com',
    'security@google.com', 
    'notifications@stripe.com',
    'support@amazonaws.com',
    'alerts@vercel.com',
    'team@netlify.com'
  ]
  
  const subjects = [
    'Your verification code',
    'Security alert: New sign-in',
    'Confirm your email address',
    'Two-factor authentication code',
    'Login verification required',
    'Account security notification'
  ]
  
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
  const sender = senders[Math.floor(Math.random() * senders.length)]
  const subject = subjects[Math.floor(Math.random() * subjects.length)]
  
  const bodies = [
    `Your verification code is: ${otpCode}. This code will expire in 10 minutes.`,
    `Hi there! Your security code is ${otpCode}. Please enter this code to continue.`,
    `Use verification code ${otpCode} to complete your sign-in. Don't share this code.`,
    `Your two-factor authentication code: ${otpCode}. Valid for 5 minutes only.`,
    `To verify your account, please use code: ${otpCode}. Keep this code secure.`
  ]
  
  const body = bodies[Math.floor(Math.random() * bodies.length)]
  
  return {
    id: uuidv4(),
    from: sender,
    to: toAddress,
    subject,
    body,
    timestamp: new Date().toISOString(),
    otpCodes: extractOTPCodes(body)
  }
}

// Routes

// Generate new temporary inbox
app.get('/api/inbox/generate', (c) => {
  const email = generateRandomEmail()
  const inboxId = uuidv4()
  const now = Date.now()
  const isoString = new Date(now).toISOString()
  
  inboxes.set(inboxId, {
    id: inboxId,
    email,
    emails: [],
    createdAt: isoString
  })
  
  // Set TTL for inbox
  inboxTtl.set(inboxId, now)
  
  return c.json({
    success: true,
    data: {
      id: inboxId,
      email,
      createdAt: isoString
    }
  })
})

// OPTIONS handler for SSE endpoint (preflight support)
app.options('/api/emails/:inboxId/stream', (c) => {
  // Explicit CORS headers for EventSource preflight
  c.header('Access-Control-Allow-Origin', c.req.header('Origin') || '*')
  c.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Cache-Control, X-Requested-With')
  c.header('Access-Control-Max-Age', '86400')
  return c.text('', 200)
})

// Multi-inbox SSE endpoint for real-time email streaming
app.get('/api/emails/stream', (c) => {
  if (!config.sse.enableMultiInboxSubscription) {
    return c.json({ error: 'Multi-inbox subscription disabled' }, 403)
  }
  
  const emailsParam = c.req.query('emails')
  if (!emailsParam) {
    return c.json({ error: 'Missing emails parameter. Use ?emails=email1@test.com,email2@test.com' }, 400)
  }
  
  const emailAddresses = emailsParam.split(',').map(email => email.trim()).filter(email => email.length > 0)
  
  if (emailAddresses.length === 0) {
    return c.json({ error: 'No valid email addresses provided' }, 400)
  }
  
  if (emailAddresses.length > config.sse.maxInboxesPerConnection) {
    return c.json({ 
      error: `Too many emails. Maximum ${config.sse.maxInboxesPerConnection} allowed per connection` 
    }, 400)
  }
  
  // Get or create inboxes for all email addresses
  const inboxIds = []
  const emailToInboxMap = new Map()
  
  for (const emailAddress of emailAddresses) {
    const { inboxId, inbox } = getOrCreateInboxByEmail(emailAddress)
    inboxIds.push(inboxId)
    emailToInboxMap.set(emailAddress, { inboxId, inbox })
  }
  
  return streamSSE(c, async (stream) => {
    // Store this connection using dual-index system for multiple inboxes
    const connectionId = uuidv4()
    addConnection(connectionId, inboxIds, stream)
    
    let pingInterval
    
    // Clean up on connection close
    stream.onAbort(() => {
      console.log(`Multi-inbox SSE connection aborted: ${connectionId} for emails [${emailAddresses.join(', ')}]`)
      if (pingInterval) clearInterval(pingInterval)
      removeConnection(connectionId)
    })
    
    try {
      // Handle Last-Event-ID for message replay across all inboxes
      const lastEventId = c.req.header('Last-Event-ID')
      let totalReplayedCount = 0
      
      if (lastEventId && config.sse.enableEventIds) {
        const lastId = parseInt(lastEventId)
        
        if (!isNaN(lastId)) {
          for (const inboxId of inboxIds) {
            const ringBuffer = ringBuffers.get(inboxId)
            if (ringBuffer) {
              const missedMessages = ringBuffer.getFromId(lastId)
              console.log(`Replaying ${missedMessages.length} missed messages from inbox ${inboxId}, event ID ${lastId}`)
              
              for (const msg of missedMessages) {
                try {
                  await stream.writeSSE({
                    id: config.sse.enableEventIds ? msg.id.toString() : undefined,
                    data: JSON.stringify({ type: msg.type, inboxId: inboxId, data: msg.data }),
                    event: msg.type,
                    retry: config.sse.retryMs
                  })
                  totalReplayedCount++
                } catch (writeError) {
                  console.log('Error replaying message:', writeError.message)
                  removeConnection(connectionId)
                  throw writeError
                }
              }
            }
          }
        }
      } else {
        // Send existing emails for all inboxes (for new connections without Last-Event-ID)
        for (const inboxId of inboxIds) {
          const inbox = inboxes.get(inboxId)
          if (inbox) {
            console.log(`Sending ${inbox.emails.length} existing emails from inbox ${inboxId} to new connection`)
            for (const email of inbox.emails) {
              try {
                // Generate event IDs for existing emails if not replaying
                const eventId = eventCounters.get(inboxId) + 1
                eventCounters.set(inboxId, eventId)
                
                await stream.writeSSE({
                  id: config.sse.enableEventIds ? eventId.toString() : undefined,
                  data: JSON.stringify({ type: 'email', inboxId: inboxId, data: email }),
                  event: 'email',
                  retry: config.sse.retryMs
                })
              } catch (writeError) {
                console.log('Error writing existing email to stream:', writeError.message)
                removeConnection(connectionId)
                throw writeError
              }
            }
          }
        }
      }
      
      // Send initial connection confirmation with replay info
      const confirmationData = {
        type: 'connected',
        timestamp: new Date().toISOString(),
        subscribedEmails: emailAddresses,
        subscribedInboxes: inboxIds,
        replayedMessages: totalReplayedCount
      }
      
      await stream.writeSSE({
        data: JSON.stringify(confirmationData),
        event: 'connected',
        retry: config.sse.retryMs
      })
      console.log(`Multi-inbox connection confirmation sent to ${connectionId}, monitoring ${emailAddresses.length} emails [${emailAddresses.join(', ')}], replayed ${totalReplayedCount} messages`)
      
    } catch (error) {
      console.log('Error setting up multi-inbox SSE stream:', error.message)
      removeConnection(connectionId)
      throw error
    }
    
    // Send keepalive ping with aggressive timeout management
    pingInterval = setInterval(async () => {
      if (connMeta.has(connectionId)) {
        const lastHeartbeat = connHeartbeats.get(connectionId)
        const now = Date.now()
        
        // Check if connection is idle/dead - remove if no heartbeat within timeout
        if (now - lastHeartbeat > config.timeouts.heartbeatTimeoutMs) {
          console.log(`Multi-inbox connection ${connectionId} timed out, removing`)
          clearInterval(pingInterval)
          removeConnection(connectionId)
          return
        }
        
        try {
          await stream.writeSSE({
            data: JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }),
            event: 'ping',
            retry: config.sse.retryMs
          })
          
          // Update heartbeat on successful ping
          connHeartbeats.set(connectionId, now)
          
        } catch (error) {
          console.log('Multi-inbox ping failed, connection closed:', error.message)
          clearInterval(pingInterval)
          removeConnection(connectionId)
        }
      } else {
        clearInterval(pingInterval)
      }
    }, config.timeouts.pingIntervalMs)
    
    // Keep the stream alive - this is important for SSE
    await new Promise((resolve) => {
      // The stream will stay open until the client disconnects or an error occurs
      // This promise will never resolve, keeping the function alive
    })
  })
})

// SSE endpoint for real-time email streaming (single inbox - backward compatibility)
app.get('/api/emails/:inboxId/stream', (c) => {
  const inboxId = c.req.param('inboxId')
  
  if (!inboxes.has(inboxId)) {
    return c.json({ error: 'Inbox not found' }, 404)
  }
  
  return streamSSE(c, async (stream) => {
    // Store this connection using dual-index system
    const connectionId = uuidv4()
    addConnection(connectionId, inboxId, stream)
    
    let pingInterval
    
    // Clean up on connection close
    stream.onAbort(() => {
      console.log(`SSE connection aborted: ${connectionId} for inbox ${inboxId}`)
      if (pingInterval) clearInterval(pingInterval)
      removeConnection(connectionId)
    })
    
    try {
      // Handle Last-Event-ID for message replay
      const lastEventId = c.req.header('Last-Event-ID')
      let replayedCount = 0
      
      if (lastEventId && config.sse.enableEventIds) {
        const lastId = parseInt(lastEventId)
        const ringBuffer = ringBuffers.get(inboxId)
        
        if (ringBuffer && !isNaN(lastId)) {
          const missedMessages = ringBuffer.getFromId(lastId)
          console.log(`Replaying ${missedMessages.length} missed messages from event ID ${lastId}`)
          
          for (const msg of missedMessages) {
            try {
              await stream.writeSSE({
                id: config.sse.enableEventIds ? msg.id.toString() : undefined,
                data: JSON.stringify({ type: msg.type, data: msg.data }),
                event: msg.type,
                retry: config.sse.retryMs
              })
              replayedCount++
            } catch (writeError) {
              console.log('Error replaying message:', writeError.message)
              removeConnection(connectionId)
              throw writeError
            }
          }
        }
      } else {
        // Send existing emails immediately (for new connections without Last-Event-ID)
        const inbox = inboxes.get(inboxId)
        console.log(`Sending ${inbox.emails.length} existing emails to new connection`)
        for (const email of inbox.emails) {
          try {
            // Generate event IDs for existing emails if not replaying
            const eventId = eventCounters.get(inboxId) + 1
            eventCounters.set(inboxId, eventId)
            
            await stream.writeSSE({
              id: config.sse.enableEventIds ? eventId.toString() : undefined,
              data: JSON.stringify({ type: 'email', data: email }),
              event: 'email',
              retry: config.sse.retryMs
            })
          } catch (writeError) {
            console.log('Error writing existing email to stream:', writeError.message)
            removeConnection(connectionId)
            throw writeError
          }
        }
      }
      
      // Send initial connection confirmation with replay info
      const confirmationData = {
        type: 'connected',
        timestamp: new Date().toISOString(),
        replayedMessages: replayedCount
      }
      
      await stream.writeSSE({
        data: JSON.stringify(confirmationData),
        event: 'connected',
        retry: config.sse.retryMs
      })
      console.log(`Connection confirmation sent to ${connectionId}, replayed ${replayedCount} messages`)
      
    } catch (error) {
      console.log('Error setting up SSE stream:', error.message)
      removeConnection(connectionId)
      throw error
    }
    
    // Send keepalive ping with aggressive timeout management
    pingInterval = setInterval(async () => {
      if (connMeta.has(connectionId)) {
        const lastHeartbeat = connHeartbeats.get(connectionId)
        const now = Date.now()
        
        // Check if connection is idle/dead - remove if no heartbeat within timeout
        if (now - lastHeartbeat > config.timeouts.heartbeatTimeoutMs) {
          console.log(`Connection ${connectionId} timed out, removing`)
          clearInterval(pingInterval)
          removeConnection(connectionId)
          return
        }
        
        try {
          await stream.writeSSE({
            data: JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }),
            event: 'ping',
            retry: config.sse.retryMs
          })
          
          // Update heartbeat on successful ping
          connHeartbeats.set(connectionId, now)
          
        } catch (error) {
          console.log('Ping failed, connection closed:', error.message)
          clearInterval(pingInterval)
          removeConnection(connectionId)
        }
      } else {
        clearInterval(pingInterval)
      }
    }, config.timeouts.pingIntervalMs)
    
    // Keep the stream alive - this is important for SSE
    await new Promise((resolve) => {
      // The stream will stay open until the client disconnects or an error occurs
      // This promise will never resolve, keeping the function alive
    })
  })
})

// Get emails for an inbox (REST fallback)
app.get('/api/emails/:inboxId', (c) => {
  const inboxId = c.req.param('inboxId')
  
  if (!inboxes.has(inboxId)) {
    return c.json({ error: 'Inbox not found' }, 404)
  }
  
  const inbox = inboxes.get(inboxId)
  return c.json({
    success: true,
    data: {
      inbox: {
        id: inbox.id,
        email: inbox.email,
        createdAt: inbox.createdAt
      },
      emails: inbox.emails
    }
  })
})

// Simulate incoming email by email address (for testing)
app.post('/api/emails/send', async (c) => {
  let body
  try {
    body = await c.req.json()
  } catch (error) {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }
  
  const toEmail = body.to
  if (!toEmail) {
    return c.json({ error: 'Missing "to" field with email address' }, 400)
  }
  
  // Get or create inbox for this email address
  const { inboxId, inbox } = getOrCreateInboxByEmail(toEmail)
  
  let email
  
  if (body.auto === true) {
    // Generate mock email
    email = generateMockEmail(toEmail)
  } else {
    // Use provided email data
    email = {
      id: uuidv4(),
      from: body.from || 'test@example.com',
      to: toEmail,
      subject: body.subject || 'Test Email',
      body: body.body || 'This is a test email.',
      timestamp: new Date().toISOString(),
      otpCodes: extractOTPCodes(body.body || '')
    }
  }
  
  // Add email to inbox
  inbox.emails.push(email)
  
  // Broadcast using optimized O(k) dispatch
  await broadcastEmail(inboxId, email)
  
  return c.json({
    success: true,
    data: email
  })
})

// Simulate incoming email (for testing) - legacy endpoint by inboxId
app.post('/api/emails/:inboxId', async (c) => {
  const inboxId = c.req.param('inboxId')
  
  if (!inboxes.has(inboxId)) {
    return c.json({ error: 'Inbox not found' }, 404)
  }
  
  const inbox = inboxes.get(inboxId)
  let email
  
  try {
    const body = await c.req.json()
    
    if (body.auto === true) {
      // Generate mock email
      email = generateMockEmail(inbox.email)
    } else {
      // Use provided email data
      email = {
        id: uuidv4(),
        from: body.from || 'test@example.com',
        to: inbox.email,
        subject: body.subject || 'Test Email',
        body: body.body || 'This is a test email.',
        timestamp: new Date().toISOString(),
        otpCodes: extractOTPCodes(body.body || '')
      }
    }
  } catch (error) {
    // If no body provided, generate mock email
    email = generateMockEmail(inbox.email)
  }
  
  // Add email to inbox
  inbox.emails.push(email)
  
  // Broadcast using optimized O(k) dispatch
  await broadcastEmail(inboxId, email)
  
  return c.json({
    success: true,
    data: email
  })
})

// Delete inbox and cleanup
app.delete('/api/inbox/:inboxId', (c) => {
  const inboxId = c.req.param('inboxId')
  
  if (!inboxes.has(inboxId)) {
    return c.json({ error: 'Inbox not found' }, 404)
  }
  
  // Close all connections for this inbox using O(k) lookup
  const subscribers = inboxSubs.get(inboxId)
  if (subscribers) {
    // Remove all connections for this inbox
    for (const connectionId of subscribers.keys()) {
      removeConnection(connectionId)
    }
  }
  
  // Clean up all tracking for this inbox
  inboxes.delete(inboxId)
  inboxTtl.delete(inboxId)
  eventCounters.delete(inboxId)
  ringBuffers.delete(inboxId)
  
  return c.json({
    success: true,
    message: 'Inbox deleted successfully'
  })
})

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    stats: {
      activeInboxes: inboxes.size,
      activeConnections: connMeta.size,
      activeInboxSubscriptions: inboxSubs.size,
      inboxTtlTracking: inboxTtl.size,
      subscriberTtlTracking: subscriberTtl.size,
      eventCounters: eventCounters.size,
      ringBuffers: ringBuffers.size,
      globalConnectionManager: globalConnectionManager.getStats(),
      memoryPool: memoryPool.getStats(),
      selectiveSerializer: selectiveSerializer.getCacheStats(),
      writeStreamManager: writeStreamManager.getStats()
    },
    config: {
      ttlEnabled: config.ttl.enableAutoExpiry,
      backpressureEnabled: config.broadcasting.enableBackpressure,
      multiInboxEnabled: config.sse.enableMultiInboxSubscription,
      inboxTtlHours: config.ttl.inboxTtlHours,
      subscriberTtlHours: config.ttl.subscriberTtlHours,
      ringBufferSize: config.sse.ringBufferSize,
      maxRecipientsPerInbox: config.broadcasting.maxRecipientsPerInbox,
      maxInboxesPerConnection: config.sse.maxInboxesPerConnection
    }
  })
})

// TTL cleanup for inboxes and subscribers
setInterval(() => {
  if (!config.ttl.enableAutoExpiry) return
  
  const now = Date.now()
  const inboxTtlMs = config.ttl.inboxTtlHours * 60 * 60 * 1000
  const subscriberTtlMs = config.ttl.subscriberTtlHours * 60 * 60 * 1000
  
  // Clean up expired inboxes
  const expiredInboxes = []
  for (const [inboxId, createdTimestamp] of inboxTtl.entries()) {
    if (now - createdTimestamp > inboxTtlMs) {
      expiredInboxes.push(inboxId)
    }
  }
  
  for (const inboxId of expiredInboxes) {
    const inbox = inboxes.get(inboxId)
    console.log(`TTL cleanup: inbox ${inbox?.email || inboxId} expired after ${config.ttl.inboxTtlHours}h`)
    
    // Close connections using O(k) cleanup
    const subscribers = inboxSubs.get(inboxId)
    if (subscribers) {
      for (const connectionId of subscribers.keys()) {
        removeConnection(connectionId)
      }
    }
    
    // Clean up all tracking for this inbox
    inboxes.delete(inboxId)
    inboxTtl.delete(inboxId)
    eventCounters.delete(inboxId)
    ringBuffers.delete(inboxId)
  }
  
  // Clean up expired subscribers
  const expiredSubscribers = []
  for (const [connectionId, createdTimestamp] of subscriberTtl.entries()) {
    if (now - createdTimestamp > subscriberTtlMs) {
      expiredSubscribers.push(connectionId)
    }
  }
  
  if (expiredSubscribers.length > 0) {
    console.log(`TTL cleanup: removing ${expiredSubscribers.length} expired subscribers after ${config.ttl.subscriberTtlHours}h`)
    for (const connectionId of expiredSubscribers) {
      removeConnection(connectionId)
    }
  }
  
  if (expiredInboxes.length > 0 || expiredSubscribers.length > 0) {
    console.log(`TTL cleanup completed: ${expiredInboxes.length} inboxes, ${expiredSubscribers.length} subscribers removed`)
  }
  
}, config.ttl.cleanupIntervalMinutes * 60 * 1000)

// Global cleanup for dead connections
setInterval(() => {
  const now = Date.now()
  const deadConnections = []
  
  for (const [connectionId, lastHeartbeat] of connHeartbeats.entries()) {
    if (now - lastHeartbeat > config.timeouts.connectionTimeoutMs) {
      deadConnections.push(connectionId)
    }
  }
  
  if (deadConnections.length > 0) {
    console.log(`Global cleanup: removing ${deadConnections.length} dead connections`)
    for (const connectionId of deadConnections) {
      removeConnection(connectionId)
    }
  }
}, config.timeouts.globalCleanupIntervalMs)

const port = process.env.PORT || config.server.port
console.log(`🚀 Temporary Email Server starting on port ${port}`)
console.log(`Config port: ${config.server.port}, ENV PORT: ${process.env.PORT}, Final port: ${port}`)

serve({
  fetch: app.fetch,
  port: parseInt(port)
})