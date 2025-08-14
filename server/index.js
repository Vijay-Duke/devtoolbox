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
const connMeta = new Map()  // Map<connectionId, inboxId>
const connHeartbeats = new Map() // Map<connectionId, lastHeartbeat>

// TTL tracking for automatic expiry
const inboxTtl = new Map()    // Map<inboxId, createdTimestamp>
const subscriberTtl = new Map() // Map<connectionId, createdTimestamp>

// Event tracking for message replay
const eventCounters = new Map() // Map<inboxId, currentEventId>
const ringBuffers = new Map()   // Map<inboxId, CircularBuffer>

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
function addConnection(connectionId, inboxId, stream) {
  const now = Date.now()
  
  // Add to reverse lookup
  connMeta.set(connectionId, inboxId)
  
  // Add to inbox subscribers
  if (!inboxSubs.has(inboxId)) {
    inboxSubs.set(inboxId, new Map())
  }
  inboxSubs.get(inboxId).set(connectionId, stream)
  
  // Initialize heartbeat tracking
  connHeartbeats.set(connectionId, now)
  
  // Initialize TTL tracking for subscriber
  subscriberTtl.set(connectionId, now)
  
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
  
  console.log(`Connection added: ${connectionId} for inbox ${inboxId}`)
}

function removeConnection(connectionId) {
  const inboxId = connMeta.get(connectionId)
  if (!inboxId) return
  
  // Remove from reverse lookup
  connMeta.delete(connectionId)
  
  // Remove heartbeat tracking
  connHeartbeats.delete(connectionId)
  
  // Remove TTL tracking for subscriber
  subscriberTtl.delete(connectionId)
  
  // Remove from inbox subscribers
  const subscribers = inboxSubs.get(inboxId)
  if (subscribers) {
    subscribers.delete(connectionId)
    
    // Clean up empty inbox subscription maps and check if inbox should be cleaned
    if (subscribers.size === 0) {
      inboxSubs.delete(inboxId)
      
      // If no subscribers and TTL enabled, the inbox may be cleaned up by TTL cleanup
      console.log(`No remaining subscribers for inbox ${inboxId}`)
    }
  }
  
  console.log(`Connection removed: ${connectionId} from inbox ${inboxId}`)
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
  
  // Create event with ID for ring buffer
  const eventData = {
    id: eventId,
    type: 'email',
    data: email,
    timestamp: Date.now()
  }
  
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
  
  // Single stringify per email - don't JSON.stringify for every subscriber
  const serializedEmail = JSON.stringify({ type: 'email', data: email })
  
  // Create array of failed connections to clean up
  const failedConnections = []
  let writeCount = 0
  
  // Broadcast with backpressure management
  if (config.broadcasting.enableBackpressure) {
    // Non-blocking writes: fire and catch errors, then prune failed clients
    const writePromises = []
    
    for (const [connectionId, stream] of cappedSubscribers) {
      const writePromise = stream.writeSSE({
        id: config.sse.enableEventIds ? eventId.toString() : undefined,
        data: serializedEmail,
        event: 'email',
        retry: config.sse.retryMs
      }).catch(error => {
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
    for (const [connectionId, stream] of cappedSubscribers) {
      try {
        await stream.writeSSE({
          id: config.sse.enableEventIds ? eventId.toString() : undefined,
          data: serializedEmail,
          event: 'email',
          retry: config.sse.retryMs
        })
        
        writeCount++
        
        // Write scheduling: batch microtasks after configured batch size to keep event loop responsive
        if (config.broadcasting.enableWriteScheduling && 
            writeCount % config.broadcasting.writeSchedulingBatchSize === 0) {
          await new Promise(resolve => queueMicrotask(resolve))
        }
        
      } catch (error) {
        console.log(`Failed to send email to connection ${connectionId}, marking for removal:`, error.message)
        failedConnections.push(connectionId)
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

// SSE endpoint for real-time email streaming
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

// Simulate incoming email (for testing)
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
      ringBuffers: ringBuffers.size
    },
    config: {
      ttlEnabled: config.ttl.enableAutoExpiry,
      backpressureEnabled: config.broadcasting.enableBackpressure,
      inboxTtlHours: config.ttl.inboxTtlHours,
      subscriberTtlHours: config.ttl.subscriberTtlHours,
      ringBufferSize: config.sse.ringBufferSize,
      maxRecipientsPerInbox: config.broadcasting.maxRecipientsPerInbox
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

serve({
  fetch: app.fetch,
  port: parseInt(port)
})