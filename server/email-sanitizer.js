import { JSDOM } from 'jsdom'
import createDOMPurify from 'dompurify'

// Create a DOM environment for server-side DOMPurify
const window = new JSDOM('').window
const DOMPurify = createDOMPurify(window)

// Email content sanitization configuration
const SANITIZE_CONFIG = {
  // Allow basic HTML formatting tags
  ALLOWED_TAGS: [
    'p', 'br', 'div', 'span', 'strong', 'b', 'em', 'i', 'u', 
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li',
    'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot',
    'a', 'img', 'blockquote', 'pre', 'code'
  ],
  
  // Allow safe attributes
  ALLOWED_ATTR: [
    'class', 'style', 'href', 'src', 'alt', 'title',
    'width', 'height', 'colspan', 'rowspan'
  ],
  
  // Forbid dangerous tags and attributes
  FORBID_TAGS: [
    'script', 'iframe', 'object', 'embed', 'form', 'input', 
    'button', 'textarea', 'select', 'option', 'meta', 'link'
  ],
  
  FORBID_ATTR: [
    'onclick', 'onmouseover', 'onload', 'onerror', 'onsubmit',
    'javascript:', 'vbscript:', 'data:', 'on*'
  ],
  
  // Additional security options
  ALLOW_DATA_ATTR: false,
  SANITIZE_DOM: true,
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false
}

/**
 * Sanitize HTML content from emails
 * @param {string} htmlContent - Raw HTML content
 * @returns {string} - Sanitized HTML
 */
export function sanitizeEmailHTML(htmlContent) {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return ''
  }
  
  try {
    // First pass: Remove dangerous content
    const sanitized = DOMPurify.sanitize(htmlContent, SANITIZE_CONFIG)
    
    // Second pass: Additional custom sanitization
    return sanitized
      // Remove any remaining javascript: or data: protocols
      .replace(/(javascript|vbscript|data):/gi, '')
      // Remove any remaining event handlers
      .replace(/on\w+\s*=/gi, '')
      // Limit external resource loading
      .replace(/src\s*=\s*["']https?:\/\/[^"']*["']/gi, (match) => {
        // Only allow images from trusted domains
        const trustedDomains = ['imgur.com', 'gravatar.com', 'github.com']
        if (trustedDomains.some(domain => match.includes(domain))) {
          return match
        }
        return 'src="#"' // Block untrusted external resources
      })
  } catch (error) {
    console.error('HTML sanitization error:', error)
    return '' // Return empty string if sanitization fails
  }
}

/**
 * Sanitize plain text content
 * @param {string} textContent - Plain text content
 * @returns {string} - Sanitized text
 */
export function sanitizeEmailText(textContent) {
  if (!textContent || typeof textContent !== 'string') {
    return ''
  }
  
  return textContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .trim()
}

/**
 * Extract OTP codes from email content safely
 * @param {string} text - Email text content
 * @returns {Array<string>} - Array of potential OTP codes
 */
export function extractOTPCodes(text) {
  if (!text || typeof text !== 'string') {
    return []
  }
  
  // Remove HTML tags first for plain text extraction
  const plainText = text.replace(/<[^>]*>/g, ' ')
  
  // Enhanced OTP pattern matching
  const otpPatterns = [
    /\b\d{4,8}\b/g,                    // Basic 4-8 digit codes
    /code[:\s]+(\d{4,8})/gi,           // "code: 123456"
    /verification[:\s]+(\d{4,8})/gi,   // "verification: 123456"
    /token[:\s]+(\d{4,8})/gi,          // "token: 123456"
    /pin[:\s]+(\d{4,8})/gi,            // "pin: 123456"
    /otp[:\s]+(\d{4,8})/gi             // "otp: 123456"
  ]
  
  const otpCodes = new Set()
  
  for (const pattern of otpPatterns) {
    const matches = plainText.matchAll(pattern)
    for (const match of matches) {
      const code = match[1] || match[0]
      if (code && /^\d{4,8}$/.test(code)) {
        // Filter out obvious non-OTP numbers
        const num = parseInt(code)
        if (num >= 1000 && num <= 99999999 && 
            code.length >= 4 && code.length <= 8 &&
            !isLikelyDate(code) && !isLikelyPhone(code)) {
          otpCodes.add(code)
        }
      }
    }
  }
  
  return Array.from(otpCodes).slice(0, 5) // Limit to max 5 codes
}

/**
 * Check if a number looks like a date (year, etc.)
 */
function isLikelyDate(code) {
  const num = parseInt(code)
  const currentYear = new Date().getFullYear()
  
  // Years between 1900-2100
  if (code.length === 4 && num >= 1900 && num <= 2100) return true
  
  // MMDD, DDMM patterns
  if (code.length === 4) {
    const mm = parseInt(code.substring(0, 2))
    const dd = parseInt(code.substring(2, 4))
    if ((mm >= 1 && mm <= 12) || (dd >= 1 && dd <= 31)) return true
  }
  
  return false
}

/**
 * Check if a number looks like a phone number
 */
function isLikelyPhone(code) {
  // Very simple phone number detection
  if (code.length > 6 && (code.startsWith('1') || code.startsWith('0'))) {
    return true
  }
  return false
}

/**
 * Create a safe email preview for display
 * @param {Object} emailData - Email object with HTML and text
 * @returns {Object} - Safe email data for frontend
 */
export function createSafeEmailPreview(emailData) {
  const safeEmail = {
    id: emailData.id,
    from: sanitizeEmailText(emailData.from),
    to: sanitizeEmailText(emailData.to),
    subject: sanitizeEmailText(emailData.subject),
    timestamp: emailData.timestamp,
    otpCodes: extractOTPCodes(emailData.text || emailData.body || ''),
    hasHtml: !!(emailData.html || emailData.body),
    hasAttachments: !!(emailData.attachments && emailData.attachments.length > 0)
  }
  
  // Sanitize HTML content if present
  if (emailData.html) {
    safeEmail.html = sanitizeEmailHTML(emailData.html)
  } else if (emailData.body && emailData.body.includes('<')) {
    // Check if body contains HTML
    safeEmail.html = sanitizeEmailHTML(emailData.body)
  }
  
  // Sanitize plain text content
  if (emailData.text) {
    safeEmail.text = sanitizeEmailText(emailData.text)
  } else if (emailData.body && !emailData.body.includes('<')) {
    safeEmail.text = sanitizeEmailText(emailData.body)
  }
  
  // Default to plain text if no content
  if (!safeEmail.html && !safeEmail.text) {
    safeEmail.text = 'No content available'
  }
  
  return safeEmail
}