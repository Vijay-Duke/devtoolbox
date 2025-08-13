import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { streamSSE } from 'hono/streaming'
import { v4 as uuidv4 } from 'uuid'

const app = new Hono()

// In-memory storage for inboxes and emails
const inboxes = new Map()
const connections = new Map()

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
    // Store this connection
    const connectionId = uuidv4()
    connections.set(connectionId, { stream, inboxId })
    console.log(`New SSE connection established: ${connectionId} for inbox ${inboxId}`)
    
    let pingInterval
    
    // Clean up on connection close
    stream.onAbort(() => {
      console.log(`SSE connection aborted: ${connectionId} for inbox ${inboxId}`)
      if (pingInterval) clearInterval(pingInterval)
      connections.delete(connectionId)
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
          connections.delete(connectionId)
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
      connections.delete(connectionId)
      throw error
    }
    
    // Send keepalive ping
    pingInterval = setInterval(async () => {
      if (connections.has(connectionId)) {
        try {
          await stream.writeSSE({
            data: JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }),
            event: 'ping'
          })
        } catch (error) {
          console.log('Ping failed, connection closed:', error.message)
          clearInterval(pingInterval)
          connections.delete(connectionId)
        }
      } else {
        clearInterval(pingInterval)
      }
    }, 30000)
    
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
  
  // Broadcast to all connected SSE streams for this inbox
  for (const [connectionId, connection] of connections.entries()) {
    if (connection.inboxId === inboxId) {
      try {
        await connection.stream.writeSSE({
          data: JSON.stringify({ type: 'email', data: email }),
          event: 'email'
        })
      } catch (error) {
        console.log('Failed to send email to connection, removing:', error.message)
        connections.delete(connectionId)
      }
    }
  }
  
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
  
  // Close all connections for this inbox
  for (const [connectionId, connection] of connections.entries()) {
    if (connection.inboxId === inboxId) {
      connections.delete(connectionId)
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
      activeConnections: connections.size
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
      
      // Close connections
      for (const [connectionId, connection] of connections.entries()) {
        if (connection.inboxId === inboxId) {
          connections.delete(connectionId)
        }
      }
      
      inboxes.delete(inboxId)
    }
  }
}, 5 * 60 * 1000)

const port = process.env.PORT || 54322
console.log(`🚀 Temporary Email Server starting on port ${port}`)

serve({
  fetch: app.fetch,
  port: parseInt(port)
})