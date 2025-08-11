export class URLEncodeTool {
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
          <h1>URL Encode/Decode</h1>
          <p class="tool-description">Encode and decode URLs with support for query parameters</p>
        </div>
        
        <div class="tool-controls">
          <div class="mode-toggle">
            <button class="btn btn-primary" data-mode="encode">Encode</button>
            <button class="btn btn-secondary" data-mode="decode">Decode</button>
            <button class="btn btn-secondary" data-mode="encodeComponent">Encode Component</button>
          </div>
          <div class="action-buttons">
            <button class="btn btn-secondary" data-action="copy">Copy</button>
            <button class="btn btn-secondary" data-action="clear">Clear</button>
          </div>
        </div>
        
        <div class="error-display" data-error hidden></div>
        
        <div class="tool-content">
          <div class="input-section">
            <label for="url-input">Input</label>
            <textarea 
              id="url-input" 
              class="code-input" 
              placeholder="Enter URL or text to encode/decode..."
              spellcheck="false"
            >https://example.com/search?q=hello world&lang=en</textarea>
          </div>
          
          <div class="output-section">
            <label for="url-output">Output</label>
            <textarea 
              id="url-output" 
              class="code-input" 
              placeholder="Result will appear here..."
              spellcheck="false"
              readonly
            ></textarea>
          </div>
        </div>
        
        <div class="query-params" id="query-params" hidden>
          <h3>Query Parameters</h3>
          <div class="params-grid" id="params-grid"></div>
        </div>
      </div>
    `;
    
    this.inputArea = this.container.querySelector('#url-input');
    this.outputArea = this.container.querySelector('#url-output');
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
    this.container.querySelector('[data-action="copy"]').addEventListener('click', () => this.copy());
    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => this.clear());
    
    // Auto-process on input with debounce
    let processTimeout;
    this.inputArea.addEventListener('input', () => {
      clearTimeout(processTimeout);
      processTimeout = setTimeout(() => {
        this.process();
      }, 300);
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
  }
  
  process() {
    const input = this.inputArea.value;
    if (!input) {
      this.outputArea.value = '';
      this.hideQueryParams();
      this.clearError();
      return;
    }
    
    try {
      let result;
      
      switch(this.mode) {
        case 'encode':
          result = encodeURI(input);
          this.parseQueryParams(input);
          break;
        case 'decode':
          result = decodeURI(input);
          this.parseQueryParams(result);
          break;
        case 'encodeComponent':
          result = encodeURIComponent(input);
          this.hideQueryParams();
          break;
      }
      
      this.outputArea.value = result;
      this.clearError();
    } catch (error) {
      this.outputArea.value = '';
      this.showError(`Failed to ${this.mode}: ${error.message}`);
      this.hideQueryParams();
    }
  }
  
  parseQueryParams(url) {
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);
      
      if (params.toString()) {
        const paramsContainer = this.container.querySelector('#query-params');
        const paramsGrid = this.container.querySelector('#params-grid');
        
        const paramsHtml = Array.from(params.entries()).map(([key, value]) => `
          <div class="param-item">
            <span class="param-key">${this.escapeHtml(key)}</span>
            <span class="param-value">${this.escapeHtml(value)}</span>
          </div>
        `).join('');
        
        paramsGrid.innerHTML = paramsHtml;
        paramsContainer.hidden = false;
      } else {
        this.hideQueryParams();
      }
    } catch {
      this.hideQueryParams();
    }
  }
  
  hideQueryParams() {
    this.container.querySelector('#query-params').hidden = true;
  }
  
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  
  copy() {
    const output = this.outputArea.value;
    if (!output) {
      this.showError('Nothing to copy');
      return;
    }
    
    navigator.clipboard.writeText(output).then(() => {
      const btn = this.container.querySelector('[data-action="copy"]');
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
    this.outputArea.value = '';
    this.hideQueryParams();
    this.clearError();
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