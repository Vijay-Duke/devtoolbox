export class YAMLJSONConverter {
  constructor() {
    this.container = null;
    this.inputArea = null;
    this.outputArea = null;
    this.mode = 'yaml-to-json';
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
          <h1>YAML ↔ JSON Converter</h1>
          <p class="tool-description">Convert between YAML and JSON formats for configuration files</p>
        </div>
        
        <div class="tool-controls">
          <div class="mode-toggle">
            <button class="btn btn-primary" data-mode="yaml-to-json">YAML → JSON</button>
            <button class="btn btn-secondary" data-mode="json-to-yaml">JSON → YAML</button>
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
        
        <div class="yaml-options">
          <label class="checkbox-label">
            <input type="checkbox" id="pretty-print" checked />
            <span>Pretty print output</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="preserve-comments" />
            <span>Preserve comments (limited support)</span>
          </label>
        </div>
        
        <div class="error-display" data-error hidden></div>
        
        <div class="tool-content">
          <div class="input-section">
            <label for="yaml-json-input">
              <span class="input-label">YAML</span>
            </label>
            <textarea 
              id="yaml-json-input" 
              class="code-input" 
              placeholder="Enter YAML or JSON..."
              spellcheck="false"
            >name: John Doe
age: 30
city: New York
active: true
hobbies:
  - reading
  - swimming
  - coding
address:
  street: 123 Main St
  zip: 10001
settings:
  theme: dark
  notifications: true</textarea>
          </div>
          
          <div class="output-section">
            <label for="yaml-json-output">
              <span class="output-label">JSON</span>
            </label>
            <pre id="yaml-json-output" class="code-output"></pre>
          </div>
        </div>
        
        <div class="tool-footer">
          <div class="stats">
            <span data-stat="input-lines">0 lines</span>
            <span data-stat="output-lines">0 lines</span>
            <span data-stat="nesting-depth">Depth: 0</span>
          </div>
        </div>
      </div>
    `;
    
    // Get references to elements
    this.inputArea = this.container.querySelector('#yaml-json-input');
    this.outputArea = this.container.querySelector('#yaml-json-output');
    this.errorDisplay = this.container.querySelector('[data-error]');
  }
  
  attachEventListeners() {
    // Mode toggle
    this.container.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setMode(btn.dataset.mode);
        this.convert();
      });
    });
    
    // Action buttons
    this.container.querySelector('[data-action="swap"]').addEventListener('click', () => this.swap());
    this.container.querySelector('[data-action="copy"]').addEventListener('click', () => this.copy());
    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => this.clear());
    
    // Options
    this.container.querySelector('#pretty-print').addEventListener('change', () => this.convert());
    
    // Auto-convert on input with debounce
    let convertTimeout;
    this.inputArea.addEventListener('input', () => {
      clearTimeout(convertTimeout);
      convertTimeout = setTimeout(() => {
        this.convert();
        this.updateStats();
      }, 300);
    });
    
    // Convert on paste
    this.inputArea.addEventListener('paste', () => {
      setTimeout(() => {
        this.convert();
        this.updateStats();
      }, 10);
    });
    
    // Initial conversion
    if (this.inputArea.value.trim()) {
      this.convert();
      this.updateStats();
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
    
    // Update labels
    const inputLabel = this.container.querySelector('.input-label');
    const outputLabel = this.container.querySelector('.output-label');
    
    if (mode === 'yaml-to-json') {
      inputLabel.textContent = 'YAML';
      outputLabel.textContent = 'JSON';
      this.inputArea.placeholder = 'Enter YAML data...';
    } else {
      inputLabel.textContent = 'JSON';
      outputLabel.textContent = 'YAML';
      this.inputArea.placeholder = 'Enter JSON data...';
    }
  }
  
  convert() {
    const input = this.inputArea.value.trim();
    if (!input) {
      this.outputArea.textContent = '';
      this.clearError();
      return;
    }
    
    try {
      let result;
      
      if (this.mode === 'yaml-to-json') {
        result = this.yamlToJson(input);
      } else {
        result = this.jsonToYaml(input);
      }
      
      this.displayOutput(result);
      this.clearError();
    } catch (error) {
      this.outputArea.textContent = '';
      this.showError(`Conversion failed: ${error.message}`);
    }
  }
  
  yamlToJson(yaml) {
    const prettyPrint = this.container.querySelector('#pretty-print').checked;
    
    try {
      // Parse YAML into JavaScript object
      const obj = this.parseYAML(yaml);
      
      // Convert to JSON
      return prettyPrint ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
    } catch (error) {
      throw new Error(`Invalid YAML: ${error.message}`);
    }
  }
  
  parseYAML(yaml) {
    const lines = yaml.split('\n');
    const result = {};
    const stack = [{ obj: result, indent: -1 }];
    let currentList = null;
    let listIndent = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      // Calculate indentation
      const indent = line.length - line.trimStart().length;
      
      // Handle list items
      if (trimmed.startsWith('- ')) {
        const value = trimmed.substring(2).trim();
        
        // Pop stack to correct level
        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
          stack.pop();
        }
        
        const parent = stack[stack.length - 1].obj;
        
        // Initialize array if needed
        if (!Array.isArray(parent)) {
          const lastKey = Object.keys(parent).pop();
          if (lastKey && parent[lastKey] === undefined) {
            parent[lastKey] = [];
            currentList = parent[lastKey];
            listIndent = indent;
          }
        } else {
          currentList = parent;
        }
        
        if (currentList) {
          // Parse the list item value
          const parsedValue = this.parseValue(value);
          
          // Check if this is a nested object in the list
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1];
            const nextIndent = nextLine.length - nextLine.trimStart().length;
            if (nextIndent > indent && !nextLine.trim().startsWith('- ')) {
              // This list item has nested properties
              const listItem = {};
              currentList.push(listItem);
              stack.push({ obj: listItem, indent: indent });
            } else {
              currentList.push(parsedValue);
            }
          } else {
            currentList.push(parsedValue);
          }
        }
        continue;
      }
      
      // Handle key-value pairs
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();
        
        // Pop stack to correct level
        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
          stack.pop();
          currentList = null;
        }
        
        const parent = stack[stack.length - 1].obj;
        
        if (value) {
          // Simple key-value pair
          parent[key] = this.parseValue(value);
        } else {
          // Key with no value (likely has nested content)
          parent[key] = undefined;
          
          // Check if next line is indented (nested object)
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1];
            const nextIndent = nextLine.length - nextLine.trimStart().length;
            
            if (nextIndent > indent) {
              if (nextLine.trim().startsWith('- ')) {
                // Next line is a list
                parent[key] = [];
              } else {
                // Next line is a nested object
                parent[key] = {};
                stack.push({ obj: parent[key], indent: indent });
              }
            } else {
              parent[key] = null;
            }
          } else {
            parent[key] = null;
          }
        }
      }
    }
    
    return result;
  }
  
  parseValue(value) {
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    
    // Boolean
    if (value === 'true' || value === 'yes' || value === 'on') return true;
    if (value === 'false' || value === 'no' || value === 'off') return false;
    
    // Null
    if (value === 'null' || value === '~' || value === '') return null;
    
    // Number
    if (!isNaN(value) && value !== '') {
      if (value.includes('.')) {
        return parseFloat(value);
      }
      return parseInt(value, 10);
    }
    
    // String
    return value;
  }
  
  jsonToYaml(jsonStr) {
    try {
      const obj = JSON.parse(jsonStr);
      return this.toYAML(obj, 0);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
  }
  
  toYAML(obj, indent = 0) {
    const spaces = '  '.repeat(indent);
    let yaml = '';
    
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          yaml += `${spaces}- \n`;
          const itemYaml = this.toYAML(item, indent + 1);
          // Adjust indentation for first level of object in array
          const lines = itemYaml.split('\n');
          lines.forEach((line, i) => {
            if (line.trim()) {
              yaml += `${spaces}  ${line.trim()}\n`;
            }
          });
        } else {
          yaml += `${spaces}- ${this.formatYAMLValue(item)}\n`;
        }
      });
    } else if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          yaml += `${spaces}${key}:\n`;
          yaml += this.toYAML(value, indent + 1);
        } else if (typeof value === 'object' && value !== null) {
          yaml += `${spaces}${key}:\n`;
          yaml += this.toYAML(value, indent + 1);
        } else {
          yaml += `${spaces}${key}: ${this.formatYAMLValue(value)}\n`;
        }
      });
    } else {
      yaml += `${spaces}${this.formatYAMLValue(obj)}\n`;
    }
    
    return yaml;
  }
  
  formatYAMLValue(value) {
    if (value === null) return 'null';
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') {
      // Quote strings that contain special characters
      if (value.includes(':') || value.includes('#') || value.includes('@') || 
          value.includes('|') || value.includes('>') || value.includes('"') ||
          value.includes("'") || value.startsWith(' ') || value.endsWith(' ')) {
        return `"${value.replace(/"/g, '\\"')}"`;
      }
      return value;
    }
    return JSON.stringify(value);
  }
  
  displayOutput(output) {
    if (this.mode === 'yaml-to-json') {
      // Syntax highlight JSON
      const highlighted = output
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
    } else {
      // Display YAML with basic syntax highlighting
      const highlighted = output
        .replace(/^(\s*)([a-zA-Z0-9_-]+):/gm, '$1<span class="yaml-key">$2</span>:')
        .replace(/:\s*(true|false|yes|no|on|off)\b/g, ': <span class="yaml-boolean">$1</span>')
        .replace(/:\s*(null|~)/g, ': <span class="yaml-null">$1</span>')
        .replace(/:\s*(-?\d+(?:\.\d+)?)/g, ': <span class="yaml-number">$1</span>')
        .replace(/^(\s*)- /gm, '$1<span class="yaml-list">-</span> ')
        .replace(/#.*/g, '<span class="yaml-comment">$&</span>');
      
      this.outputArea.innerHTML = highlighted;
    }
  }
  
  updateStats() {
    const inputLines = this.inputArea.value.split('\n').length;
    const outputText = this.outputArea.textContent || '';
    const outputLines = outputText.split('\n').length;
    
    // Calculate nesting depth
    let depth = 0;
    let maxDepth = 0;
    const text = this.mode === 'yaml-to-json' ? outputText : this.inputArea.value;
    
    for (const char of text) {
      if (char === '{' || char === '[') {
        depth++;
        maxDepth = Math.max(maxDepth, depth);
      } else if (char === '}' || char === ']') {
        depth--;
      }
    }
    
    this.container.querySelector('[data-stat="input-lines"]').textContent = `${inputLines} lines`;
    this.container.querySelector('[data-stat="output-lines"]').textContent = `${outputLines} lines`;
    this.container.querySelector('[data-stat="nesting-depth"]').textContent = `Depth: ${maxDepth}`;
  }
  
  swap() {
    const output = this.outputArea.textContent;
    if (!output) {
      this.showError('Nothing to swap');
      return;
    }
    
    this.inputArea.value = output;
    this.setMode(this.mode === 'yaml-to-json' ? 'json-to-yaml' : 'yaml-to-json');
    this.convert();
  }
  
  copy() {
    const output = this.outputArea.textContent;
    if (!output) {
      this.showError('Nothing to copy');
      return;
    }
    
    navigator.clipboard.writeText(output).then(() => {
      const btn = this.container.querySelector('[data-action="copy"]');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = 'Copied!';
      btn.classList.add('btn-success');
      
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.classList.remove('btn-success');
      }, 2000);
    });
  }
  
  clear() {
    this.inputArea.value = '';
    this.outputArea.textContent = '';
    this.clearError();
    this.updateStats();
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