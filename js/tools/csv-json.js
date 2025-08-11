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
      <div class="tool-container">
        <div class="tool-header">
          <h1>CSV ↔ JSON Converter</h1>
          <p class="tool-description">Convert between CSV and JSON formats with automatic type detection</p>
        </div>
        
        <div class="tool-controls">
          <div class="mode-toggle">
            <button class="btn btn-primary" data-mode="csv-to-json">CSV → JSON</button>
            <button class="btn btn-secondary" data-mode="json-to-csv">JSON → CSV</button>
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
        
        <div class="conversion-options">
          <div class="options-group">
            <label class="checkbox-label">
              <input type="checkbox" id="has-headers" checked />
              <span>First row contains headers</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" id="auto-type" checked />
              <span>Auto-detect data types</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" id="pretty-print" checked />
              <span>Pretty print JSON</span>
            </label>
          </div>
          <div class="delimiter-group">
            <label for="delimiter">Delimiter:</label>
            <select id="delimiter" class="delimiter-select">
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>
        </div>
        
        <div class="error-display" data-error hidden></div>
        
        <div class="tool-content">
          <div class="input-section">
            <label for="csv-json-input">
              <span class="input-label">CSV</span>
              <span class="example-hint">Example: name,age,city</span>
            </label>
            <textarea 
              id="csv-json-input" 
              class="code-input" 
              placeholder="Enter CSV data or JSON array..."
              spellcheck="false"
            >name,age,city,active
John Doe,30,New York,true
Jane Smith,25,Los Angeles,false
Bob Johnson,35,Chicago,true</textarea>
          </div>
          
          <div class="output-section">
            <label for="csv-json-output">
              <span class="output-label">JSON</span>
              <span class="stats-label">0 rows, 0 columns</span>
            </label>
            <pre id="csv-json-output" class="code-output"></pre>
          </div>
        </div>
        
        <div class="tool-footer">
          <div class="stats">
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
    const exampleHint = this.container.querySelector('.example-hint');
    
    if (mode === 'csv-to-json') {
      inputLabel.textContent = 'CSV';
      outputLabel.textContent = 'JSON';
      exampleHint.textContent = 'Example: name,age,city';
      this.inputArea.placeholder = 'Enter CSV data...';
    } else {
      inputLabel.textContent = 'JSON';
      outputLabel.textContent = 'CSV';
      exampleHint.textContent = 'Example: [{"name": "John", "age": 30}]';
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
      // Display CSV as plain text
      this.outputArea.textContent = output;
    }
  }
  
  updateStatsLabel(rows, columns) {
    const statsLabel = this.container.querySelector('.stats-label');
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