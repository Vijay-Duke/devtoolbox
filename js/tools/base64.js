export class Base64Tool {
  constructor() {
    this.container = null;
    this.inputArea = null;
    this.outputArea = null;
    this.mode = 'encode';
  }
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.render();
    this.attachEventListeners();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="tool-container">
        <div class="tool-header">
          <h1>Base64 Encode/Decode</h1>
          <p class="tool-description">Encode and decode Base64 strings with support for UTF-8</p>
        </div>
        
        <div class="tool-controls">
          <div class="mode-toggle">
            <button class="btn btn-primary" data-mode="encode">Encode</button>
            <button class="btn btn-secondary" data-mode="decode">Decode</button>
          </div>
          <div class="action-buttons">
            <button class="btn btn-secondary" data-action="swap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="17 1 21 5 17 9"/>
                <polyline points="3 11 7 7 11 11"/>
                <path d="M21 5H9"/>
                <path d="M3 19h12"/>
                <polyline points="7 23 3 19 7 15"/>
              </svg>
              Swap
            </button>
            <button class="btn btn-secondary" data-action="copy">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy
            </button>
            <button class="btn btn-secondary" data-action="clear">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Clear
            </button>
          </div>
        </div>
        
        <div class="error-display" data-error hidden></div>
        
        <div class="tool-content">
          <div class="input-section">
            <label for="base64-input">Input</label>
            <textarea 
              id="base64-input" 
              class="code-input" 
              placeholder="Enter text to encode or Base64 to decode..."
              spellcheck="false"
            >Hello, World!</textarea>
          </div>
          
          <div class="output-section">
            <label for="base64-output">Output</label>
            <textarea 
              id="base64-output" 
              class="code-input" 
              placeholder="Result will appear here..."
              spellcheck="false"
              readonly
            ></textarea>
          </div>
        </div>
        
        <div class="tool-footer">
          <div class="stats">
            <span data-stat="input-size">0 bytes</span>
            <span data-stat="output-size">0 bytes</span>
            <span data-stat="ratio">Ratio: 0%</span>
          </div>
          <div class="options">
            <label class="checkbox-label">
              <input type="checkbox" id="url-safe" />
              <span>URL Safe (RFC 4648)</span>
            </label>
          </div>
        </div>
      </div>
    `;
    
    this.inputArea = this.container.querySelector('#base64-input');
    this.outputArea = this.container.querySelector('#base64-output');
    this.errorDisplay = this.container.querySelector('[data-error]');
  }
  
  attachEventListeners() {
    // Mode toggle
    this.container.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setMode(btn.dataset.mode);
        this.process();
      });
    });
    
    // Action buttons
    this.container.querySelector('[data-action="swap"]').addEventListener('click', () => this.swap());
    this.container.querySelector('[data-action="copy"]').addEventListener('click', () => this.copy());
    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => this.clear());
    
    // Auto-process on input with debounce
    let processTimeout;
    this.inputArea.addEventListener('input', () => {
      clearTimeout(processTimeout);
      processTimeout = setTimeout(() => {
        this.process();
        this.updateStats();
      }, 300);
    });
    
    // URL safe option
    this.container.querySelector('#url-safe').addEventListener('change', () => {
      this.process();
    });
    
    // Process initial input
    if (this.inputArea.value.trim()) {
      this.process();
    }
  }
  
  setMode(mode) {
    this.mode = mode;
    
    // Update button states
    this.container.querySelectorAll('[data-mode]').forEach(btn => {
      if (btn.dataset.mode === mode) {
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-secondary');
      } else {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
      }
    });
    
    // Update placeholders
    if (mode === 'encode') {
      this.inputArea.placeholder = 'Enter text to encode...';
      this.outputArea.placeholder = 'Base64 encoded result will appear here...';
    } else {
      this.inputArea.placeholder = 'Enter Base64 to decode...';
      this.outputArea.placeholder = 'Decoded text will appear here...';
    }
  }
  
  process() {
    const input = this.inputArea.value;
    if (!input) {
      this.outputArea.value = '';
      this.clearError();
      return;
    }
    
    const urlSafe = this.container.querySelector('#url-safe').checked;
    
    try {
      let result;
      
      if (this.mode === 'encode') {
        result = this.encode(input, urlSafe);
      } else {
        result = this.decode(input, urlSafe);
      }
      
      this.outputArea.value = result;
      this.clearError();
      this.updateStats();
    } catch (error) {
      this.outputArea.value = '';
      this.showError(`Failed to ${this.mode}: ${error.message}`);
    }
  }
  
  encode(str, urlSafe = false) {
    // Convert string to base64
    const base64 = btoa(unescape(encodeURIComponent(str)));
    
    if (urlSafe) {
      // Make URL safe
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }
    
    return base64;
  }
  
  decode(str, urlSafe = false) {
    let base64 = str;
    
    if (urlSafe) {
      // Convert from URL safe
      base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
      
      // Add padding if necessary
      const pad = base64.length % 4;
      if (pad) {
        if (pad === 1) {
          throw new Error('Invalid base64 string');
        }
        base64 += new Array(5 - pad).join('=');
      }
    }
    
    try {
      return decodeURIComponent(escape(atob(base64)));
    } catch (e) {
      // Fallback for non-UTF8 strings
      return atob(base64);
    }
  }
  
  swap() {
    const temp = this.inputArea.value;
    this.inputArea.value = this.outputArea.value;
    this.outputArea.value = temp;
    
    // Toggle mode
    this.setMode(this.mode === 'encode' ? 'decode' : 'encode');
    this.process();
  }
  
  copy() {
    const output = this.outputArea.value;
    if (!output) {
      this.showError('Nothing to copy');
      return;
    }
    
    navigator.clipboard.writeText(output).then(() => {
      const btn = this.container.querySelector('[data-action="copy"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = 'Copied!';
      btn.classList.add('btn-success');
      
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('btn-success');
      }, 2000);
    });
  }
  
  clear() {
    this.inputArea.value = '';
    this.outputArea.value = '';
    this.clearError();
    this.updateStats();
  }
  
  updateStats() {
    const inputBytes = new Blob([this.inputArea.value]).size;
    const outputBytes = new Blob([this.outputArea.value]).size;
    
    this.container.querySelector('[data-stat="input-size"]').textContent = this.formatBytes(inputBytes);
    this.container.querySelector('[data-stat="output-size"]').textContent = this.formatBytes(outputBytes);
    
    if (inputBytes > 0) {
      const ratio = Math.round((outputBytes / inputBytes) * 100);
      this.container.querySelector('[data-stat="ratio"]').textContent = `Ratio: ${ratio}%`;
    } else {
      this.container.querySelector('[data-stat="ratio"]').textContent = 'Ratio: 0%';
    }
  }
  
  formatBytes(bytes) {
    if (bytes === 0) return '0 bytes';
    const k = 1024;
    const sizes = ['bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
  
  showError(message) {
    this.errorDisplay.textContent = message;
    this.errorDisplay.hidden = false;
  }
  
  clearError() {
    this.errorDisplay.textContent = '';
    this.errorDisplay.hidden = true;
  }
}