export class CSVJSONConverter {
  constructor() {
    this.container = null;
    this.inputArea = null;
    this.outputArea = null;
    this.mode = 'csv-to-json';
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
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">CSV ↔ JSON Converter</h1>
          <p class="text-gray-600 dark:text-gray-400">Convert between CSV and JSON formats with automatic type detection</p>
        </div>
        
        <div class="mb-6 flex flex-wrap justify-between gap-4">
          <div class="flex gap-2">
            <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-mode="csv-to-json">CSV → JSON</button>
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-mode="json-to-csv">JSON → CSV</button>
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
        
        <div class="mb-6 flex flex-wrap gap-6">
          <div class="flex flex-wrap gap-4">
            <label class="flex items-center">
              <input type="checkbox" id="has-headers" checked class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2" />
              <span class="text-sm text-gray-700 dark:text-gray-300">First row contains headers</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" id="auto-type" checked class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2" />
              <span class="text-sm text-gray-700 dark:text-gray-300">Auto-detect data types</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" id="pretty-print" checked class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2" />
              <span class="text-sm text-gray-700 dark:text-gray-300">Pretty print JSON</span>
            </label>
          </div>
          <div class="flex items-center gap-2">
            <label for="delimiter" class="text-sm font-medium text-gray-700 dark:text-gray-300">Delimiter:</label>
            <select id="delimiter" class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>
        </div>
        
        <div class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded hidden" data-error></div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label for="csv-json-input" class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">CSV</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">Example: name,age,city</span>
            </label>
            <textarea 
              id="csv-json-input" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm" 
              placeholder="Enter CSV data or JSON array..."
              spellcheck="false"
              rows="12"
            >name,age,city,active
John Doe,30,New York,true
Jane Smith,25,Los Angeles,false
Bob Johnson,35,Chicago,true</textarea>
          </div>
          
          <div>
            <label for="csv-json-output" class="flex justify-between items-center mb-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">JSON</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">0 rows, 0 columns</span>
            </label>
            <pre id="csv-json-output" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm overflow-auto" style="min-height: 288px; max-height: 400px;"></pre>
          </div>
        </div>
        
        <div class="mt-4 flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <div class="flex gap-4">
            <span data-stat="input-size">0 bytes</span>
            <span data-stat="output-size">0 bytes</span>
            <span data-stat="conversion-ratio">Ratio: 0%</span>
          </div>
        </div>
      </div>
    `;
    
    // Get references to elements
    this.inputArea = this.container.querySelector('#csv-json-input');
    this.outputArea = this.container.querySelector('#csv-json-output');
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
    this.container.querySelector('#has-headers').addEventListener('change', () => this.convert());
    this.container.querySelector('#auto-type').addEventListener('change', () => this.convert());
    this.container.querySelector('#pretty-print').addEventListener('change', () => this.convert());
    this.container.querySelector('#delimiter').addEventListener('change', () => this.convert());
    
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
    
    // Update labels - use proper selectors
    const inputLabel = this.container.querySelector('label[for="csv-json-input"] span:first-child');
    const outputLabel = this.container.querySelector('label[for="csv-json-output"] span:first-child');
    const exampleHint = this.container.querySelector('label[for="csv-json-input"] span:last-child');
    
    if (mode === 'csv-to-json') {
      if (inputLabel) inputLabel.textContent = 'CSV';
      if (outputLabel) outputLabel.textContent = 'JSON';
      if (exampleHint) exampleHint.textContent = 'Example: name,age,city';
      this.inputArea.placeholder = 'Enter CSV data...';
    } else {
      if (inputLabel) inputLabel.textContent = 'JSON';
      if (outputLabel) outputLabel.textContent = 'CSV';
      if (exampleHint) exampleHint.textContent = 'Example: [{"name": "John", "age": 30}]';
      this.inputArea.placeholder = 'Enter JSON array...';
    }
  }
  
  convert() {
    const input = this.inputArea.value.trim();
    if (!input) {
      this.outputArea.textContent = '';
      this.clearError();
      this.updateStatsLabel(0, 0);
      return;
    }
    
    try {
      let result;
      
      if (this.mode === 'csv-to-json') {
        result = this.csvToJson(input);
      } else {
        result = this.jsonToCsv(input);
      }
      
      this.displayOutput(result);
      this.clearError();
    } catch (error) {
      this.outputArea.textContent = '';
      this.showError(`Conversion failed: ${error.message}`);
      this.updateStatsLabel(0, 0);
    }
  }
  
  csvToJson(csv) {
    const delimiter = this.container.querySelector('#delimiter').value;
    const hasHeaders = this.container.querySelector('#has-headers').checked;
    const autoType = this.container.querySelector('#auto-type').checked;
    const prettyPrint = this.container.querySelector('#pretty-print').checked;
    
    const lines = csv.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      throw new Error('No data to convert');
    }
    
    // Parse CSV
    const rows = lines.map(line => this.parseCSVLine(line, delimiter));
    
    let result;
    if (hasHeaders && lines.length > 1) {
      const headers = rows[0];
      result = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          let value = row[index] || '';
          if (autoType) {
            value = this.autoDetectType(value);
          }
          obj[header] = value;
        });
        return obj;
      });
    } else {
      result = rows.map(row => {
        return row.map(value => {
          if (autoType) {
            return this.autoDetectType(value);
          }
          return value;
        });
      });
    }
    
    // Update stats
    const rowCount = hasHeaders ? result.length : rows.length;
    const colCount = rows[0] ? rows[0].length : 0;
    this.updateStatsLabel(rowCount, colCount);
    
    return prettyPrint ? JSON.stringify(result, null, 2) : JSON.stringify(result);
  }
  
  jsonToCsv(jsonStr) {
    const delimiter = this.container.querySelector('#delimiter').value;
    const hasHeaders = this.container.querySelector('#has-headers').checked;
    
    let data;
    try {
      data = JSON.parse(jsonStr);
    } catch (e) {
      throw new Error('Invalid JSON format');
    }
    
    if (!Array.isArray(data)) {
      throw new Error('JSON must be an array');
    }
    
    if (data.length === 0) {
      throw new Error('JSON array is empty');
    }
    
    let csv = '';
    
    // Check if array of objects or array of arrays
    if (typeof data[0] === 'object' && !Array.isArray(data[0])) {
      // Array of objects
      const headers = Object.keys(data[0]);
      
      if (hasHeaders) {
        csv = headers.map(h => this.escapeCSVValue(h, delimiter)).join(delimiter) + '\n';
      }
      
      csv += data.map(row => {
        return headers.map(header => {
          const value = row[header];
          return this.escapeCSVValue(this.formatValue(value), delimiter);
        }).join(delimiter);
      }).join('\n');
      
      this.updateStatsLabel(data.length, headers.length);
    } else if (Array.isArray(data[0])) {
      // Array of arrays
      csv = data.map(row => {
        return row.map(value => {
          return this.escapeCSVValue(this.formatValue(value), delimiter);
        }).join(delimiter);
      }).join('\n');
      
      this.updateStatsLabel(data.length, data[0].length);
    } else {
      throw new Error('Invalid data structure. Expected array of objects or array of arrays');
    }
    
    return csv;
  }
  
  parseCSVLine(line, delimiter) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }
  
  escapeCSVValue(value, delimiter) {
    if (value === null || value === undefined) {
      return '';
    }
    
    value = String(value);
    
    // Check if value needs escaping
    if (value.includes(delimiter) || value.includes('"') || value.includes('\n')) {
      // Escape quotes by doubling them
      value = value.replace(/"/g, '""');
      // Wrap in quotes
      return `"${value}"`;
    }
    
    return value;
  }
  
  autoDetectType(value) {
    if (value === '') return '';
    
    // Boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    // Number
    if (!isNaN(value) && value !== '') {
      const num = Number(value);
      if (value.indexOf('.') !== -1) {
        return parseFloat(value);
      }
      return parseInt(value, 10);
    }
    
    // Null
    if (value.toLowerCase() === 'null') return null;
    
    // String
    return value;
  }
  
  formatValue(value) {
    if (value === null) return 'null';
    if (value === undefined) return '';
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
  
  displayOutput(output) {
    if (this.mode === 'csv-to-json') {
      // For JSON output, just display as text since pre elements don't support HTML
      this.outputArea.textContent = output;
    } else {
      // Display CSV as plain text
      this.outputArea.textContent = output;
    }
  }
  
  updateStatsLabel(rows, columns) {
    const statsLabel = this.container.querySelector('label[for="csv-json-output"] span:last-child');
    if (statsLabel) {
      statsLabel.textContent = `${rows} rows, ${columns} columns`;
    }
  }
  
  updateStats() {
    const inputBytes = new Blob([this.inputArea.value]).size;
    const outputText = this.outputArea.textContent || '';
    const outputBytes = new Blob([outputText]).size;
    
    this.container.querySelector('[data-stat="input-size"]').textContent = this.formatBytes(inputBytes);
    this.container.querySelector('[data-stat="output-size"]').textContent = this.formatBytes(outputBytes);
    
    if (inputBytes > 0) {
      const ratio = Math.round((outputBytes / inputBytes) * 100);
      this.container.querySelector('[data-stat="conversion-ratio"]').textContent = `Ratio: ${ratio}%`;
    } else {
      this.container.querySelector('[data-stat="conversion-ratio"]').textContent = 'Ratio: 0%';
    }
  }
  
  formatBytes(bytes) {
    if (bytes === 0) return '0 bytes';
    const k = 1024;
    const sizes = ['bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
  
  swap() {
    const output = this.outputArea.textContent;
    if (!output) {
      this.showError('Nothing to swap');
      return;
    }
    
    this.inputArea.value = output;
    this.setMode(this.mode === 'csv-to-json' ? 'json-to-csv' : 'csv-to-json');
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
    this.updateStatsLabel(0, 0);
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