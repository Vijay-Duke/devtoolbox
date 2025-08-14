import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { streamSSE } from 'hono/streaming'
import { v4 as uuidv4 } from 'uuid'

const app = new Hono()

// In-memory storage for inboxes and emails
const inboxes = new Map()

// Dual-index SSE connection tracking for O(k) broadcasting performance
const inboxSubs = new Map() // Map<inboxId, Map<connectionId, stream>>
const connMeta = new Map()  // Map<connectionId, inboxId>
const connHeartbeats = new Map() // Map<connectionId, lastHeartbeat>

// Helper functions for connection management
function addConnection(connectionId, inboxId, stream) {
  // Add to reverse lookup
  connMeta.set(connectionId, inboxId)
  
  // Add to inbox subscribers
  if (!inboxSubs.has(inboxId)) {
    inboxSubs.set(inboxId, new Map())
  }
  inboxSubs.get(inboxId).set(connectionId, stream)
  
  // Initialize heartbeat tracking
  connHeartbeats.set(connectionId, Date.now())
  
  console.log(`Connection added: ${connectionId} for inbox ${inboxId}`)
}

function removeConnection(connectionId) {
  const inboxId = connMeta.get(connectionId)
  if (!inboxId) return
  
  // Remove from reverse lookup
  connMeta.delete(connectionId)
  
  // Remove heartbeat tracking
  connHeartbeats.delete(connectionId)
  
  // Remove from inbox subscribers
  const subscribers = inboxSubs.get(inboxId)
  if (subscribers) {
    subscribers.delete(connectionId)
    
    // Clean up empty inbox subscription maps
    if (subscribers.size === 0) {
      inboxSubs.delete(inboxId)
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
  
  // Bounded broadcast: cap max recipients per inbox to prevent hot inbox starvation
  const MAX_RECIPIENTS = 20
  const cappedSubscribers = subscriberCount > MAX_RECIPIENTS 
    ? Array.from(subscribers.entries()).slice(0, MAX_RECIPIENTS)
    : subscribers.entries()
  
  if (subscriberCount > MAX_RECIPIENTS) {
    console.log(`Capping broadcast to ${MAX_RECIPIENTS} recipients (${subscriberCount} total)`)
  }
  
  // Single stringify per email - don't JSON.stringify for every subscriber
  const serializedEmail = JSON.stringify({ type: 'email', data: email })
  
  // Create array of failed connections to clean up
  const failedConnections = []
  let writeCount = 0
  
  // Broadcast to subscribers with write scheduling for responsiveness
  for (const [connectionId, stream] of cappedSubscribers) {
    try {
      await stream.writeSSE({
        data: serializedEmail,
        event: 'email'
      })
      
      writeCount++
      
      // Write scheduling: batch microtasks after every ~100 writes to keep event loop responsive
      if (writeCount % 100 === 0) {
        await new Promise(resolve => queueMicrotask(resolve))
      }
      
    } catch (error) {
      console.log(`Failed to send email to connection ${connectionId}, marking for removal:`, error.message)
      failedConnections.push(connectionId)
    }
  }
  
  // Clean up failed connections
  for (const connectionId of failedConnections) {
    removeConnection(connectionId)
  }
}

// CORS configuration
app.use('*', cors({
  origin: ['http://localhost:8081', 'http://127.0.0.1:8081', 'http://localhost:52474', 'http://127.0.0.1:52474'],
  allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Accept', 'Cache-Control', 'X-Requested-With', 'Authorization'],
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
  
  inboxes.set(inboxId, {
    id: inboxId,
    email,
    emails: [],
    createdAt: new Date().toISOString()
  })
  
  return c.json({
    success: true,
    data: {
      id: inboxId,
      email,
      createdAt: new Date().toISOString()
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
      // Send existing emails immediately
      const inbox = inboxes.get(inboxId)
      console.log(`Sending ${inbox.emails.length} existing emails to new connection`)
      for (const email of inbox.emails) {
        try {
          await stream.writeSSE({
            data: JSON.stringify({ type: 'email', data: email }),
            event: 'email'
          })
        } catch (writeError) {
          console.log('Error writing existing email to stream:', writeError.message)
          removeConnection(connectionId)
          throw writeError
        }
      }
      
      // Send initial connection confirmation
      await stream.writeSSE({
        data: JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() }),
        event: 'connected'
      })
      console.log(`Connection confirmation sent to ${connectionId}`)
      
    } catch (error) {
      console.log('Error setting up SSE stream:', error.message)
      removeConnection(connectionId)
      throw error
    }
    
    // Send keepalive ping with aggressive timeout management
    const PING_INTERVAL = 30000 // 30 seconds
    const HEARTBEAT_TIMEOUT = 60000 // 60 seconds (2 intervals)
    
    pingInterval = setInterval(async () => {
      if (connMeta.has(connectionId)) {
        const lastHeartbeat = connHeartbeats.get(connectionId)
        const now = Date.now()
        
        // Check if connection is idle/dead - remove if no heartbeat within 2 intervals
        if (now - lastHeartbeat > HEARTBEAT_TIMEOUT) {
          console.log(`Connection ${connectionId} timed out, removing`)
          clearInterval(pingInterval)
          removeConnection(connectionId)
          return
        }
        
        try {
          await stream.writeSSE({
            data: JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }),
            event: 'ping'
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
    }, PING_INTERVAL)
    
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
  
  inboxes.delete(inboxId)
  
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
      activeInboxSubscriptions: inboxSubs.size
    }
  })
})

// Cleanup old inboxes (run every 5 minutes)
setInterval(() => {
  const now = new Date()
  const maxAge = 2 * 60 * 60 * 1000 // 2 hours
  
  for (const [inboxId, inbox] of inboxes.entries()) {
    const createdAt = new Date(inbox.createdAt)
    if (now - createdAt > maxAge) {
      console.log(`Cleaning up old inbox: ${inbox.email}`)
      
      // Close connections using O(k) cleanup
      const subscribers = inboxSubs.get(inboxId)
      if (subscribers) {
        for (const connectionId of subscribers.keys()) {
          removeConnection(connectionId)
        }
      }
      
      inboxes.delete(inboxId)
    }
  }
}, 5 * 60 * 1000)

// Global cleanup for dead connections (run every 2 minutes)
setInterval(() => {
  const now = Date.now()
  const GLOBAL_TIMEOUT = 120000 // 2 minutes
  const deadConnections = []
  
  for (const [connectionId, lastHeartbeat] of connHeartbeats.entries()) {
    if (now - lastHeartbeat > GLOBAL_TIMEOUT) {
      deadConnections.push(connectionId)
    }
  }
  
  if (deadConnections.length > 0) {
    console.log(`Global cleanup: removing ${deadConnections.length} dead connections`)
    for (const connectionId of deadConnections) {
      removeConnection(connectionId)
    }
  }
}, 2 * 60 * 1000)

const port = process.env.PORT || 54322
console.log(`🚀 Temporary Email Server starting on port ${port}`)

serve({
  fetch: app.fetch,
  port: parseInt(port)
})