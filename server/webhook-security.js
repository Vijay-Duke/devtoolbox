import crypto from 'crypto'
import dns from 'dns'
import { promisify } from 'util'

const reverseLookup = promisify(dns.reverse)

/**
 * Rate limiting store for webhook requests
 */
class RateLimiter {
  constructor(windowMs = 60000, maxRequests = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
    this.requests = new Map()
    
    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000)
  }
  
  isAllowed(ip) {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    if (!this.requests.has(ip)) {
      this.requests.set(ip, [])
    }
    
    const ipRequests = this.requests.get(ip)
    
    // Remove old requests
    const recentRequests = ipRequests.filter(timestamp => timestamp > windowStart)
    this.requests.set(ip, recentRequests)
    
    // Check if under limit
    if (recentRequests.length >= this.maxRequests) {
      return false
    }
    
    // Add current request
    recentRequests.push(now)
    return true
  }
  
  cleanup() {
    const now = Date.now()
    const cutoff = now - this.windowMs
    
    for (const [ip, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(timestamp => timestamp > cutoff)
      if (recentRequests.length === 0) {
        this.requests.delete(ip)
      } else {
        this.requests.set(ip, recentRequests)
      }
    }
  }
  
  getStats() {
    return {
      totalIPs: this.requests.size,
      windowMs: this.windowMs,
      maxRequests: this.maxRequests
    }
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter(60000, 100) // 100 requests per minute

/**
 * Verify HMAC signature from ForwardEmail webhook
 * @param {string} body - Raw request body
 * @param {string} signature - X-Webhook-Signature header
 * @param {string} secret - Webhook secret from environment
 * @returns {boolean} - True if signature is valid
 */
export function verifyWebhookSignature(body, signature, secret) {
  if (!body || !signature || !secret) {
    console.log('Missing required parameters for signature verification')
    return false
  }
  
  try {
    // Remove any prefix like 'sha256=' if present
    const cleanSignature = signature.replace(/^sha256=/, '')
    
    // Compute HMAC-SHA256 signature
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('hex')
    
    // Constant-time comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(computedSignature, 'hex')
    const actualBuffer = Buffer.from(cleanSignature, 'hex')
    
    if (expectedBuffer.length !== actualBuffer.length) {
      return false
    }
    
    return crypto.timingSafeEqual(expectedBuffer, actualBuffer)
    
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

/**
 * Validate that request is coming from ForwardEmail servers
 * @param {string} clientIP - IP address of the request
 * @returns {Promise<boolean>} - True if IP is from ForwardEmail
 */
export async function validateForwardEmailIP(clientIP) {
  if (!clientIP) {
    console.log('No client IP provided for validation')
    return false
  }
  
  try {
    // Perform reverse DNS lookup
    const hostnames = await reverseLookup(clientIP)
    
    // Check if any hostname matches ForwardEmail servers
    const validHostnames = ['mx1.forwardemail.net', 'mx2.forwardemail.net']
    const isValid = hostnames.some(hostname => validHostnames.includes(hostname))
    
    if (!isValid) {
      console.log(`Invalid hostname for IP ${clientIP}: ${hostnames.join(', ')}`)
    }
    
    return isValid
    
  } catch (error) {
    console.error(`Reverse DNS lookup failed for ${clientIP}:`, error.message)
    return false
  }
}

/**
 * Rate limiting check for webhook requests
 * @param {string} clientIP - IP address of the request
 * @returns {boolean} - True if request is within rate limits
 */
export function checkRateLimit(clientIP) {
  if (!clientIP) {
    return false
  }
  
  const isAllowed = rateLimiter.isAllowed(clientIP)
  
  if (!isAllowed) {
    console.log(`Rate limit exceeded for IP: ${clientIP}`)
  }
  
  return isAllowed
}

/**
 * Get client IP from request headers (handles proxies)
 * @param {Object} c - Hono context object
 * @returns {string} - Client IP address
 */
export function getClientIP(c) {
  // Check various headers for the real client IP
  const possibleHeaders = [
    'cf-connecting-ip',      // Cloudflare
    'x-forwarded-for',       // Standard proxy header
    'x-real-ip',             // Nginx proxy
    'x-client-ip',           // Other proxies
    'x-forwarded',
    'forwarded-for',
    'forwarded'
  ]
  
  for (const header of possibleHeaders) {
    const value = c.req.header(header)
    if (value) {
      // X-Forwarded-For can contain multiple IPs, take the first one
      const ip = value.split(',')[0].trim()
      if (ip && ip !== 'unknown') {
        return ip
      }
    }
  }
  
  // Fallback to connection remote address
  return c.req.header('remote-addr') || 'unknown'
}

/**
 * Comprehensive webhook security validation
 * @param {Object} c - Hono context object
 * @param {string} body - Raw request body
 * @param {string} webhookSecret - Secret for signature verification
 * @returns {Promise<Object>} - Validation result
 */
export async function validateWebhookRequest(c, body, webhookSecret) {
  const result = {
    valid: false,
    clientIP: null,
    errors: []
  }
  
  try {
    // Get client IP
    result.clientIP = getClientIP(c)
    
    if (result.clientIP === 'unknown') {
      result.errors.push('Unable to determine client IP address')
      return result
    }
    
    // Check rate limiting
    if (!checkRateLimit(result.clientIP)) {
      result.errors.push('Rate limit exceeded')
      return result
    }
    
    // Validate IP is from ForwardEmail servers
    const isValidIP = await validateForwardEmailIP(result.clientIP)
    if (!isValidIP) {
      result.errors.push('Request not from ForwardEmail servers')
      return result
    }
    
    // Verify webhook signature
    const signature = c.req.header('X-Webhook-Signature')
    if (!signature) {
      result.errors.push('Missing X-Webhook-Signature header')
      return result
    }
    
    const isValidSignature = verifyWebhookSignature(body, signature, webhookSecret)
    if (!isValidSignature) {
      result.errors.push('Invalid webhook signature')
      return result
    }
    
    // All validations passed
    result.valid = true
    
  } catch (error) {
    console.error('Webhook validation error:', error)
    result.errors.push('Internal validation error')
  }
  
  return result
}

/**
 * Get rate limiter statistics
 */
export function getRateLimiterStats() {
  return rateLimiter.getStats()
}