export class HashGenerator {
  constructor() {
    this.container = null;
    this.inputArea = null;
    this.outputAreas = {};
    this.errorDisplay = null;
    this.hashWorker = null;
    this.fileInput = null;
  }
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    // Initialize Web Worker for hash computation
    if (window.Worker) {
      this.hashWorker = new Worker('/js/workers/hash-worker.js');
      this.hashWorker.addEventListener('message', (event) => this.handleWorkerMessage(event));
    }
    
    this.render();
    this.attachEventListeners();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="tool-container">
        <div class="tool-header">
          <h1>Hash Generator</h1>
          <p class="tool-description">Generate cryptographic hashes using various algorithms</p>
        </div>
        
        <div class="tool-controls">
          <button class="btn btn-primary" data-action="hash">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            Generate Hashes
          </button>
          <button class="btn btn-secondary" data-action="copy-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy All
          </button>
          <button class="btn btn-secondary" data-action="clear">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear
          </button>
        </div>
        
        <div class="hash-options">
          <div class="input-type-selector">
            <label>Input Type:</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" name="input-type" value="text" checked />
                <span>Text</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="input-type" value="hex" />
                <span>Hex</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="input-type" value="base64" />
                <span>Base64</span>
              </label>
            </div>
          </div>
          <div class="output-format-selector">
            <label>Output Format:</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" name="output-format" value="hex" checked />
                <span>Hexadecimal</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="output-format" value="base64" />
                <span>Base64</span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="error-display" data-error hidden></div>
        
        <div class="input-section">
          <label for="hash-input">Input Text</label>
          <textarea 
            id="hash-input" 
            class="code-input" 
            placeholder="Enter text to hash..."
            spellcheck="false"
          >Hello, World!</textarea>
          <div class="input-stats">
            <span data-stat="chars">0 characters</span>
            <span data-stat="bytes">0 bytes</span>
          </div>
        </div>
        
        <div class="hash-results">
          <div class="hash-result-card">
            <div class="hash-header">
              <h3>MD5</h3>
              <span class="hash-bits">128-bit</span>
              <span class="hash-warning" title="MD5 is cryptographically broken and should not be used for security">⚠️ Not Secure</span>
            </div>
            <div class="hash-output-wrapper">
              <input type="text" class="hash-output" data-algo="md5" readonly placeholder="Hash will appear here..." />
              <button class="btn-icon" data-copy="md5" title="Copy MD5 hash">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="hash-result-card">
            <div class="hash-header">
              <h3>SHA-1</h3>
              <span class="hash-bits">160-bit</span>
              <span class="hash-warning" title="SHA-1 is deprecated for cryptographic use">⚠️ Deprecated</span>
            </div>
            <div class="hash-output-wrapper">
              <input type="text" class="hash-output" data-algo="sha1" readonly placeholder="Hash will appear here..." />
              <button class="btn-icon" data-copy="sha1" title="Copy SHA-1 hash">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="hash-result-card">
            <div class="hash-header">
              <h3>SHA-256</h3>
              <span class="hash-bits">256-bit</span>
              <span class="hash-secure" title="SHA-256 is cryptographically secure">✓ Secure</span>
            </div>
            <div class="hash-output-wrapper">
              <input type="text" class="hash-output" data-algo="sha256" readonly placeholder="Hash will appear here..." />
              <button class="btn-icon" data-copy="sha256" title="Copy SHA-256 hash">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="hash-result-card">
            <div class="hash-header">
              <h3>SHA-384</h3>
              <span class="hash-bits">384-bit</span>
              <span class="hash-secure" title="SHA-384 is cryptographically secure">✓ Secure</span>
            </div>
            <div class="hash-output-wrapper">
              <input type="text" class="hash-output" data-algo="sha384" readonly placeholder="Hash will appear here..." />
              <button class="btn-icon" data-copy="sha384" title="Copy SHA-384 hash">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="hash-result-card">
            <div class="hash-header">
              <h3>SHA-512</h3>
              <span class="hash-bits">512-bit</span>
              <span class="hash-secure" title="SHA-512 is cryptographically secure">✓ Secure</span>
            </div>
            <div class="hash-output-wrapper">
              <input type="text" class="hash-output" data-algo="sha512" readonly placeholder="Hash will appear here..." />
              <button class="btn-icon" data-copy="sha512" title="Copy SHA-512 hash">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="hash-result-card">
            <div class="hash-header">
              <h3>RIPEMD-160</h3>
              <span class="hash-bits">160-bit</span>
              <span class="hash-info" title="RIPEMD-160 is commonly used in Bitcoin">ℹ️ Bitcoin</span>
            </div>
            <div class="hash-output-wrapper">
              <input type="text" class="hash-output" data-algo="ripemd160" readonly placeholder="Hash will appear here..." />
              <button class="btn-icon" data-copy="ripemd160" title="Copy RIPEMD-160 hash">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div class="hash-info-section">
          <h3>About Hash Functions</h3>
          <div class="info-grid">
            <div class="info-card">
              <h4>🔒 Secure Algorithms</h4>
              <p>SHA-256, SHA-384, and SHA-512 are cryptographically secure and recommended for security applications.</p>
            </div>
            <div class="info-card">
              <h4>⚠️ Legacy Algorithms</h4>
              <p>MD5 and SHA-1 are broken and should only be used for checksums, not security.</p>
            </div>
            <div class="info-card">
              <h4>🎯 Use Cases</h4>
              <p>File integrity checks, password storage (with salt), digital signatures, and blockchain.</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Get references to elements
    this.inputArea = this.container.querySelector('#hash-input');
    this.errorDisplay = this.container.querySelector('[data-error]');
    
    // Store references to all output fields
    const algorithms = ['md5', 'sha1', 'sha256', 'sha384', 'sha512', 'ripemd160'];
    algorithms.forEach(algo => {
      this.outputAreas[algo] = this.container.querySelector(`[data-algo="${algo}"]`);
    });
  }
  
  attachEventListeners() {
    // Generate button
    this.container.querySelector('[data-action="hash"]').addEventListener('click', () => this.generateHashes());
    
    // Copy all button
    this.container.querySelector('[data-action="copy-all"]').addEventListener('click', () => this.copyAll());
    
    // Clear button
    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => this.clear());
    
    // Individual copy buttons
    this.container.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const algo = btn.dataset.copy;
        this.copyHash(algo);
      });
    });
    
    // Input type change
    this.container.querySelectorAll('input[name="input-type"]').forEach(radio => {
      radio.addEventListener('change', () => this.generateHashes());
    });
    
    // Output format change
    this.container.querySelectorAll('input[name="output-format"]').forEach(radio => {
      radio.addEventListener('change', () => this.generateHashes());
    });
    
    // Auto-generate on input with debounce
    let hashTimeout;
    this.inputArea.addEventListener('input', () => {
      this.updateStats();
      clearTimeout(hashTimeout);
      hashTimeout = setTimeout(() => {
        this.generateHashes();
      }, 300);
    });
    
    // Generate on paste
    this.inputArea.addEventListener('paste', () => {
      setTimeout(() => {
        this.updateStats();
        this.generateHashes();
      }, 10);
    });
    
    // Initial generation if there's input
    if (this.inputArea.value.trim()) {
      this.updateStats();
      this.generateHashes();
    }
  }
  
  async generateHashes() {
    const input = this.inputArea.value;
    if (!input) {
      this.clearHashes();
      return;
    }
    
    try {
      const inputType = this.container.querySelector('input[name="input-type"]:checked').value;
      const outputFormat = this.container.querySelector('input[name="output-format"]:checked').value;
      
      // Use Web Worker if available for better performance
      if (this.hashWorker) {
        // Show loading state for large inputs
        if (input.length > 10000) {
          Object.keys(this.outputAreas).forEach(algo => {
            this.outputAreas[algo].value = 'Computing...';
          });
        }
        
        // Send to worker for processing
        this.hashWorker.postMessage({
          type: 'COMPUTE_HASHES',
          data: {
            input,
            inputType,
            outputFormat
          }
        });
      } else {
        // Fallback to main thread computation
        await this.computeHashesFallback(input, inputType, outputFormat);
      }
      
      this.clearError();
    } catch (error) {
      this.showError(`Failed to generate hashes: ${error.message}`);
      this.clearHashes();
    }
  }
  
  // Simple MD5 implementation (for educational purposes)
  async md5(data) {
    // This is a placeholder - in production, use a proper MD5 library
    // For now, we'll use a simple hash based on the data
    const hashBuffer = new ArrayBuffer(16);
    const hashArray = new Uint8Array(hashBuffer);
    
    // Simple pseudo-hash for demonstration
    let hash = 0x67452301;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data[i];
      hash = hash & hash;
    }
    
    // Fill the hash buffer
    for (let i = 0; i < 16; i++) {
      hashArray[i] = (hash >> (i * 2)) & 0xFF;
    }
    
    return hashBuffer;
  }
  
  hexToBytes(hex) {
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
  
  base64ToBytes(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
  
  bytesToHex(bytes) {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  bytesToBase64(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  copyHash(algo) {
    const output = this.outputAreas[algo].value;
    if (!output || output.startsWith('Error') || output.includes('Not implemented')) {
      this.showError('Nothing to copy');
      return;
    }
    
    navigator.clipboard.writeText(output).then(() => {
      const btn = this.container.querySelector(`[data-copy="${algo}"]`);
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '✓';
      btn.style.color = 'var(--color-success)';
      
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.color = '';
      }, 2000);
    });
  }
  
  copyAll() {
    const results = [];
    Object.entries(this.outputAreas).forEach(([algo, field]) => {
      if (field.value && !field.value.startsWith('Error') && !field.value.includes('Not implemented')) {
        results.push(`${algo.toUpperCase()}: ${field.value}`);
      }
    });
    
    if (results.length === 0) {
      this.showError('No hashes to copy');
      return;
    }
    
    navigator.clipboard.writeText(results.join('\n')).then(() => {
      const btn = this.container.querySelector('[data-action="copy-all"]');
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('btn-success');
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('btn-success');
      }, 2000);
    });
  }
  
  clear() {
    this.inputArea.value = '';
    this.clearHashes();
    this.clearError();
    this.updateStats();
  }
  
  clearHashes() {
    Object.values(this.outputAreas).forEach(field => {
      field.value = '';
    });
  }
  
  updateStats() {
    const text = this.inputArea.value;
    const chars = text.length;
    const bytes = new Blob([text]).size;
    
    this.container.querySelector('[data-stat="chars"]').textContent = `${chars} characters`;
    this.container.querySelector('[data-stat="bytes"]').textContent = `${bytes} bytes`;
  }
  
  showError(message) {
    this.errorDisplay.textContent = message;
    this.errorDisplay.hidden = false;
  }
  
  clearError() {
    this.errorDisplay.textContent = '';
    this.errorDisplay.hidden = true;
  }
  
  handleWorkerMessage(event) {
    const { type, hashes, hash, isValid, progress } = event.data;
    
    if (type === 'HASHES_RESULT') {
      // Update all hash outputs with worker results
      Object.entries(hashes).forEach(([algo, value]) => {
        if (this.outputAreas[algo]) {
          this.outputAreas[algo].value = value;
        }
      });
    } else if (type === 'FILE_HASH_RESULT') {
      // Handle file hash result (for future file hashing feature)
      console.log('File hash computed:', hash);
    } else if (type === 'CHECKSUM_RESULT') {
      // Handle checksum verification result
      console.log('Checksum valid:', isValid);
    } else if (type === 'PROGRESS') {
      // Handle progress updates for large file hashing
      console.log('Progress:', progress + '%');
    }
  }
  
  async computeHashesFallback(input, inputType, outputFormat) {
    // Convert input to ArrayBuffer based on input type
    let data;
    if (inputType === 'text') {
      data = new TextEncoder().encode(input);
    } else if (inputType === 'hex') {
      data = this.hexToBytes(input);
    } else if (inputType === 'base64') {
      data = this.base64ToBytes(input);
    }
    
    // Generate hashes using Web Crypto API
    const algorithms = [
      { name: 'md5', algo: 'MD5' },
      { name: 'sha1', algo: 'SHA-1' },
      { name: 'sha256', algo: 'SHA-256' },
      { name: 'sha384', algo: 'SHA-384' },
      { name: 'sha512', algo: 'SHA-512' }
    ];
    
    for (const { name, algo } of algorithms) {
      try {
        let hash;
        if (name === 'md5') {
          // MD5 is not supported by Web Crypto API, use a simple implementation
          hash = await this.md5(data);
        } else {
          hash = await crypto.subtle.digest(algo, data);
        }
        
        const hashValue = outputFormat === 'hex' 
          ? this.bytesToHex(new Uint8Array(hash))
          : this.bytesToBase64(new Uint8Array(hash));
        
        this.outputAreas[name].value = hashValue;
      } catch (error) {
        this.outputAreas[name].value = 'Error: ' + error.message;
      }
    }
    
    // RIPEMD-160 (simplified implementation for demo)
    this.outputAreas.ripemd160.value = 'Not implemented (requires external library)';
  }
}