// Common utility functions shared across multiple tools

export class CommonUtils {
  /**
   * Format byte size in human readable format
   * @param {number} bytes - Size in bytes
   * @returns {string} Formatted size string
   */
  static formatBytes(bytes) {
    if (bytes === 0) return '0 bytes';
    const k = 1024;
    const sizes = ['bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Debounce function execution
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  static debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Generate cryptographically secure random bytes
   * @param {number} length - Number of bytes to generate
   * @returns {Uint8Array} Random bytes
   */
  static getRandomBytes(length) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return array;
  }

  /**
   * Convert bytes to hexadecimal string
   * @param {Uint8Array} bytes - Bytes to convert
   * @returns {string} Hex string
   */
  static bytesToHex(bytes) {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Convert hexadecimal string to bytes
   * @param {string} hex - Hex string to convert
   * @returns {Uint8Array} Byte array
   */
  static hexToBytes(hex) {
    hex = hex.replace(/\s/g, '');
    if (hex.length % 2 !== 0) {
      throw new Error('Invalid hex string');
    }
    
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  /**
   * Convert bytes to Base64 string
   * @param {Uint8Array} bytes - Bytes to convert
   * @returns {string} Base64 string
   */
  static bytesToBase64(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 string to bytes
   * @param {string} base64 - Base64 string to convert
   * @returns {Uint8Array} Byte array
   */
  static base64ToBytes(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Validate and sanitize input text
   * @param {string} text - Input text
   * @param {Object} options - Validation options
   * @returns {string} Sanitized text
   */
  static sanitizeInput(text, options = {}) {
    if (!text || typeof text !== 'string') return '';
    
    let sanitized = text;
    
    // Remove null bytes and control characters (except newlines and tabs)
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Trim whitespace if requested
    if (options.trim) {
      sanitized = sanitized.trim();
    }
    
    // Limit length if specified
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }
    
    return sanitized;
  }

  /**
   * Create a progress indicator for long-running operations
   * @param {HTMLElement} container - Container element
   * @param {string} message - Progress message
   * @returns {Object} Progress indicator with update method
   */
  static createProgressIndicator(container, message = 'Processing...') {
    const progressDiv = document.createElement('div');
    progressDiv.className = 'flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-blue-800 dark:text-blue-300 text-sm';
    progressDiv.innerHTML = `
      <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="message">${message}</span>
    `;
    
    container.appendChild(progressDiv);
    
    return {
      element: progressDiv,
      update: (newMessage) => {
        progressDiv.querySelector('.message').textContent = newMessage;
      },
      remove: () => {
        if (progressDiv.parentNode) {
          progressDiv.parentNode.removeChild(progressDiv);
        }
      }
    };
  }

  /**
   * Check if the current environment supports Web Workers
   * @returns {boolean} True if Web Workers are supported
   */
  static supportsWebWorkers() {
    return typeof Worker !== 'undefined';
  }

  /**
   * Check if the current environment supports Web Crypto API
   * @returns {boolean} True if Web Crypto is supported
   */
  static supportsWebCrypto() {
    return typeof crypto !== 'undefined' && 
           typeof crypto.subtle !== 'undefined' &&
           typeof crypto.getRandomValues !== 'undefined';
  }

  /**
   * Generate a secure UUID v4
   * @returns {string} UUID string
   */
  static generateUUID() {
    if (!CommonUtils.supportsWebCrypto()) {
      throw new Error('Web Crypto API not supported');
    }
    
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const array = new Uint8Array(1);
      crypto.getRandomValues(array);
      const r = array[0] % 16;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

// Export individual functions for convenience
export const {
  formatBytes,
  debounce,
  getRandomBytes,
  bytesToHex,
  hexToBytes,
  bytesToBase64,
  base64ToBytes,
  sanitizeInput,
  createProgressIndicator,
  supportsWebWorkers,
  supportsWebCrypto,
  generateUUID
} = CommonUtils;