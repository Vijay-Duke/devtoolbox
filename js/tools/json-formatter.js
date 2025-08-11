export class JSONFormatter {
  constructor() {
    this.container = null;
    this.inputArea = null;
    this.outputArea = null;
    this.formatBtn = null;
    this.minifyBtn = null;
    this.copyBtn = null;
    this.clearBtn = null;
    this.errorDisplay = null;
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
          <h1>JSON Formatter & Validator</h1>
          <p class="tool-description">Format, validate, and minify JSON data with syntax highlighting</p>
        </div>
        
        <div class="tool-controls">
          <button class="btn btn-primary" data-action="format">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="9" y1="9" x2="15" y2="9"/>
              <line x1="9" y1="12" x2="15" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            Format
          </button>
          <button class="btn btn-secondary" data-action="minify">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="4 14 10 14 10 20"/>
              <polyline points="20 10 14 10 14 4"/>
              <line x1="14" y1="10" x2="21" y2="3"/>
              <line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
            Minify
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
        
        <div class="error-display" data-error hidden></div>
        
        <div class="tool-content">
          <div class="input-section">
            <label for="json-input">Input JSON</label>
            <div class="input-wrapper">
              <textarea 
                id="json-input" 
                class="code-input" 
                placeholder="Paste your JSON here..."
                spellcheck="false"
              >{
  "example": "data",
  "number": 123,
  "nested": {
    "array": [1, 2, 3]
  }
}</textarea>
              <div class="error-overlay" id="error-overlay" hidden></div>
            </div>
          </div>
          
          <div class="output-section">
            <label for="json-output">Formatted Output</label>
            <pre id="json-output" class="code-output"></pre>
          </div>
        </div>
        
        <div class="tool-footer">
          <div class="stats">
            <span data-stat="chars">0 characters</span>
            <span data-stat="lines">0 lines</span>
            <span data-stat="size">0 bytes</span>
          </div>
        </div>
      </div>
    `;
    
    // Get references to elements
    this.inputArea = this.container.querySelector('#json-input');
    this.outputArea = this.container.querySelector('#json-output');
    this.errorDisplay = this.container.querySelector('[data-error]');
    this.errorOverlay = this.container.querySelector('#error-overlay');
    this.formatBtn = this.container.querySelector('[data-action="format"]');
    this.minifyBtn = this.container.querySelector('[data-action="minify"]');
    this.copyBtn = this.container.querySelector('[data-action="copy"]');
    this.clearBtn = this.container.querySelector('[data-action="clear"]');
  }
  
  attachEventListeners() {
    this.formatBtn.addEventListener('click', () => this.format());
    this.minifyBtn.addEventListener('click', () => this.minify());
    this.copyBtn.addEventListener('click', () => this.copy());
    this.clearBtn.addEventListener('click', () => this.clear());
    
    // Handle textarea scrolling to reposition error marker
    this.inputArea.addEventListener('scroll', () => {
      if (!this.errorOverlay.hidden) {
        // Re-calculate error position on scroll
        const errorPointer = this.errorOverlay.querySelector('.error-pointer');
        if (errorPointer) {
          const currentTop = parseFloat(errorPointer.style.top);
          const scrollDiff = this.inputArea.scrollTop;
          // We need to recalculate from the stored error location
          if (this.lastErrorLocation) {
            this.showInlineError(this.lastErrorLocation, this.inputArea.value.trim());
          }
        }
      }
    });
    
    // Auto-format OUTPUT ONLY on input with debounce
    let formatTimeout;
    this.inputArea.addEventListener('input', () => {
      this.updateStats();
      this.clearError();
      
      // Debounce auto-format to avoid formatting while typing
      clearTimeout(formatTimeout);
      formatTimeout = setTimeout(() => {
        const input = this.inputArea.value.trim();
        if (input) {
          try {
            // Try to parse to check if valid JSON
            const parsed = JSON.parse(input);
            const formatted = JSON.stringify(parsed, null, 2);
            // Only update the output, NOT the input
            this.displayOutput(formatted);
            this.clearError();
          } catch (error) {
            // Parse error message to get line/column info
            const errorLocation = this.getErrorLocation(error.message, input);
            this.showInlineError(errorLocation, input);
            this.outputArea.textContent = '';
          }
        } else {
          this.outputArea.textContent = '';
          this.clearError();
        }
      }, 300); // 300ms debounce
    });
    
    // Auto-format OUTPUT on paste (immediate)
    this.inputArea.addEventListener('paste', (e) => {
      setTimeout(() => {
        const input = this.inputArea.value.trim();
        if (input) {
          try {
            const parsed = JSON.parse(input);
            const formatted = JSON.stringify(parsed, null, 2);
            // Only update the output on paste
            this.displayOutput(formatted);
            this.clearError();
            this.updateStats();
          } catch (error) {
            const errorLocation = this.getErrorLocation(error.message, input);
            this.showInlineError(errorLocation, input);
            this.outputArea.textContent = '';
          }
        }
      }, 10);
    });
    
    // Format on load if there's initial content
    if (this.inputArea.value.trim()) {
      // Only format the output, not the input
      try {
        const parsed = JSON.parse(this.inputArea.value.trim());
        const formatted = JSON.stringify(parsed, null, 2);
        this.displayOutput(formatted);
        this.updateStats();
      } catch (error) {
        // Don't show error on initial load
      }
    }
  }
  
  format() {
    const input = this.inputArea.value.trim();
    if (!input) {
      this.showError('Please enter some JSON data');
      return;
    }
    
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      this.displayOutput(formatted);
      // When Format button is clicked, also update the input to formatted version
      this.inputArea.value = formatted;
      this.clearError();
      this.updateStats();
    } catch (error) {
      const errorLocation = this.getErrorLocation(error.message, input);
      this.showInlineError(errorLocation, input);
      this.outputArea.textContent = '';
    }
  }
  
  minify() {
    const input = this.inputArea.value.trim();
    if (!input) {
      this.showError('Please enter some JSON data');
      return;
    }
    
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      this.displayOutput(minified);
      this.inputArea.value = minified;
      this.clearError();
      this.updateStats();
    } catch (error) {
      this.showError(`Invalid JSON: ${error.message}`);
      this.outputArea.textContent = '';
    }
  }
  
  copy() {
    const output = this.outputArea.textContent || this.inputArea.value;
    if (!output) {
      this.showError('Nothing to copy');
      return;
    }
    
    navigator.clipboard.writeText(output).then(() => {
      const originalText = this.copyBtn.textContent;
      this.copyBtn.textContent = 'Copied!';
      this.copyBtn.classList.add('btn-success');
      
      setTimeout(() => {
        this.copyBtn.textContent = originalText;
        this.copyBtn.classList.remove('btn-success');
      }, 2000);
    }).catch(() => {
      this.showError('Failed to copy to clipboard');
    });
  }
  
  clear() {
    this.inputArea.value = '';
    this.outputArea.textContent = '';
    this.clearError();
    this.updateStats();
  }
  
  displayOutput(json) {
    // Simple syntax highlighting
    const highlighted = json
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-key';
          } else {
            cls = 'json-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
      });
    
    this.outputArea.innerHTML = highlighted;
  }
  
  showError(message) {
    this.errorDisplay.textContent = message;
    this.errorDisplay.hidden = false;
  }
  
  clearError() {
    this.errorDisplay.textContent = '';
    this.errorDisplay.hidden = true;
    this.errorOverlay.hidden = true;
    this.errorOverlay.innerHTML = '';
  }
  
  updateStats() {
    const text = this.inputArea.value;
    const chars = text.length;
    const lines = text.split('\n').length;
    const bytes = new Blob([text]).size;
    
    this.container.querySelector('[data-stat="chars"]').textContent = `${chars.toLocaleString()} characters`;
    this.container.querySelector('[data-stat="lines"]').textContent = `${lines.toLocaleString()} lines`;
    this.container.querySelector('[data-stat="size"]').textContent = this.formatBytes(bytes);
  }
  
  formatBytes(bytes) {
    if (bytes === 0) return '0 bytes';
    const k = 1024;
    const sizes = ['bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
  
  getErrorLocation(errorMessage, jsonString) {
    let position = -1;
    let line = 1;
    let column = 1;
    
    // Try to extract position from Chrome/V8 error format
    const positionMatch = errorMessage.match(/at position (\d+)/);
    if (positionMatch) {
      position = parseInt(positionMatch[1]);
    }
    
    // Try to extract line/column from Firefox error format
    const lineColMatch = errorMessage.match(/at line (\d+) column (\d+)/);
    if (lineColMatch) {
      line = parseInt(lineColMatch[1]);
      column = parseInt(lineColMatch[2]);
    } else if (position >= 0) {
      // Calculate line and column from position
      let currentPos = 0;
      const lines = jsonString.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const lineLength = lines[i].length + 1; // +1 for newline
        if (currentPos + lineLength > position) {
          line = i + 1;
          column = position - currentPos + 1;
          break;
        }
        currentPos += lineLength;
      }
    }
    
    return { line, column, position, message: errorMessage };
  }
  
  showInlineError(errorLocation, jsonString) {
    const { line, column, message } = errorLocation;
    
    // Store for scroll updates
    this.lastErrorLocation = errorLocation;
    
    // Clear any existing error
    this.clearError();
    
    // Calculate the position of the error marker
    const lines = jsonString.split('\n');
    if (line > 0 && line <= lines.length) {
      // Get computed styles of the textarea
      const textareaStyles = window.getComputedStyle(this.inputArea);
      const lineHeight = parseFloat(textareaStyles.lineHeight);
      const fontSize = parseFloat(textareaStyles.fontSize);
      const padding = parseFloat(textareaStyles.paddingTop);
      
      // Calculate vertical position (accounting for scrolling)
      const topPosition = padding + (line - 1) * lineHeight - this.inputArea.scrollTop;
      
      // Calculate horizontal position (approximate based on character width)
      const charWidth = fontSize * 0.6; // Approximate for monospace
      const leftPosition = parseFloat(textareaStyles.paddingLeft) + (column - 1) * charWidth;
      
      // Create error indicator
      const errorHtml = `
        <div class="error-pointer" style="top: ${topPosition}px; left: ${leftPosition}px;">
          <div class="error-arrow">▲</div>
          <div class="error-tooltip">
            Line ${line}, Column ${column}<br>
            ${this.escapeHtml(message)}
          </div>
        </div>
      `;
      
      this.errorOverlay.innerHTML = errorHtml;
      this.errorOverlay.hidden = false;
      
      // Also show a simplified message in the error display
      this.errorDisplay.textContent = `Error at line ${line}, column ${column}: ${message}`;
      this.errorDisplay.hidden = false;
    }
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}