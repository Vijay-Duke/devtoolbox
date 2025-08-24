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
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">YAML ↔ JSON Converter</h1>
          <p class="text-gray-600 dark:text-gray-400">Convert between YAML and JSON formats for configuration files</p>
        </div>
        
        <div class="mb-6 flex flex-wrap justify-between gap-4">
          <div class="flex gap-2">
            <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-mode="yaml-to-json">YAML → JSON</button>
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-mode="json-to-yaml">JSON → YAML</button>
          </div>
          <div class="flex gap-2">
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="swap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="17 1 21 5 17 9"/>
                <polyline points="3 11 7 7 11 11"/>
                <path d="M21 5H9"/>
                <path d="M3 19h12"/>
                <polyline points="7 23 3 19 7 15"/>
              </svg>
              Swap
            </button>
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="copy">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy
            </button>
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="clear">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Clear
            </button>
          </div>
        </div>
        
        <div class="mb-6 flex flex-wrap gap-4">
          <label class="flex items-center">
            <input type="checkbox" id="pretty-print" checked class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2" />
            <span class="text-sm text-gray-700 dark:text-gray-300">Pretty print output</span>
          </label>
          <label class="flex items-center">
            <input type="checkbox" id="preserve-comments" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2" />
            <span class="text-sm text-gray-700 dark:text-gray-300">Preserve comments (limited support)</span>
          </label>
        </div>
        
        <div class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded hidden" data-error></div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label for="yaml-json-input" class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">YAML</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">Example: key: value</span>
            </label>
            <textarea 
              id="yaml-json-input" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm" 
              placeholder="Enter YAML or JSON..."
              spellcheck="false"
              rows="15"
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
          
          <div>
            <label for="yaml-json-output" class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">JSON</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">0 lines</span>
            </label>
            <pre id="yaml-json-output" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm overflow-auto" style="min-height: 360px; max-height: 500px;"></pre>
          </div>
        </div>
        
        <div class="mt-4 flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <div class="flex gap-4">
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
        btn.className = 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
      } else {
        btn.className = 'px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
      }
    });
    
    // Update labels
    const inputLabel = this.container.querySelector('label[for="yaml-json-input"] span:first-child');
    const outputLabel = this.container.querySelector('label[for="yaml-json-output"] span:first-child');
    const inputExample = this.container.querySelector('label[for="yaml-json-input"] span:last-child');
    
    if (mode === 'yaml-to-json') {
      if (inputLabel) inputLabel.textContent = 'YAML';
      if (outputLabel) outputLabel.textContent = 'JSON';
      if (inputExample) inputExample.textContent = 'Example: key: value';
      this.inputArea.placeholder = 'Enter YAML data...';
    } else {
      if (inputLabel) inputLabel.textContent = 'JSON';
      if (outputLabel) outputLabel.textContent = 'YAML';
      if (inputExample) inputExample.textContent = 'Example: {"key": "value"}';
      this.inputArea.placeholder = 'Enter JSON data...';
    }
  }
  
  convert() {
    const input = this.inputArea.value.trim();
    if (!input) {
      this.outputArea.textContent = '';
      this.clearError();
      this.updateStatsLabel(0);
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
      this.updateStatsLabel(0);
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
        return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
      }
      return value;
    }
    return JSON.stringify(value);
  }
  
  displayOutput(output) {
    // Display as plain text (pre elements don't support HTML)
    this.outputArea.textContent = output;
    
    // Update output lines count
    const lines = output.split('\n').length;
    this.updateStatsLabel(lines);
  }
  
  updateStatsLabel(lines) {
    const statsLabel = this.container.querySelector('label[for="yaml-json-output"] span:last-child');
    if (statsLabel) {
      statsLabel.textContent = `${lines} lines`;
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
      const originalClasses = btn.className;
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Copied!
      `;
      btn.className = 'px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2';
      
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.className = originalClasses;
      }, 2000);
    });
  }
  
  clear() {
    this.inputArea.value = '';
    this.outputArea.textContent = '';
    this.clearError();
    this.updateStats();
    this.updateStatsLabel(0);
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