import { feedback } from '../utils/feedback.js';
import { formatBytes } from '../utils/common.js';
import { ToolEnhancements } from '../utils/tool-enhancements.js';

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
      <style>
        .error-diff-line {
          font-family: 'Courier New', monospace;
          padding: 8px 12px;
          border-left: 3px solid transparent;
          white-space: pre-wrap;
          font-size: 14px;
          line-height: 1.4;
        }
        .error-diff-line-number {
          display: inline-block;
          width: 40px;
          text-align: right;
          margin-right: 12px;
          color: #6b7280;
          font-weight: 500;
          user-select: none;
        }
        .error-diff-line.error {
          background-color: #fef2f2;
          border-left-color: #ef4444;
        }
        .dark .error-diff-line.error {
          background-color: #450a0a;
          border-left-color: #ef4444;
        }
        .error-diff-line.context {
          background-color: #f9fafb;
        }
        .dark .error-diff-line.context {
          background-color: #111827;
        }
        .error-indicator {
          display: inline-block;
          color: #ef4444;
          font-weight: bold;
          margin-left: 4px;
        }
        .error-char-highlight {
          background-color: #fca5a5;
          border-radius: 2px;
          padding: 1px 2px;
        }
        .dark .error-char-highlight {
          background-color: #dc2626;
          color: white;
        }
        .error-suggestion {
          background-color: #ecfdf5;
          border: 1px solid #d1fae5;
          border-radius: 6px;
          padding: 12px;
          margin-top: 12px;
          font-size: 13px;
        }
        .dark .error-suggestion {
          background-color: #064e3b;
          border-color: #065f46;
        }
        .error-suggestion-title {
          font-weight: 600;
          color: #065f46;
          margin-bottom: 4px;
        }
        .dark .error-suggestion-title {
          color: #34d399;
        }
      </style>
      <div class="max-w-7xl mx-auto p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">JSON Formatter & Validator</h1>
          <p class="text-gray-600 dark:text-gray-400">Format, validate, and minify JSON data with syntax highlighting and detailed error analysis</p>
        </div>
        
        <div class="flex flex-wrap gap-2 mb-6">
          <button class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="format">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <line x1="9" y1="9" x2="15" y2="9"/>
              <line x1="9" y1="12" x2="15" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            Format & Validate
          </button>
          <button class="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="minify">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
              <polyline points="4 14 10 14 10 20"/>
              <polyline points="20 10 14 10 14 4"/>
              <line x1="14" y1="10" x2="21" y2="3"/>
              <line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
            Minify
          </button>
          <button class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="copy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy Result
          </button>
          <div id="download-button-container" class="inline-flex"></div>
          <button class="inline-flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="clear">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear All
          </button>
        </div>
        
        <div class="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <label class="flex items-center space-x-2">
            <input type="checkbox" id="pretty-print" checked class="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-blue-600 focus:ring-blue-500 focus:ring-2" />
            <span class="text-sm text-gray-700 dark:text-gray-300">Pretty Print JSON</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="checkbox" id="validate-only" class="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-blue-600 focus:ring-blue-500 focus:ring-2" />
            <span class="text-sm text-gray-700 dark:text-gray-300">Validation Only</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="checkbox" id="sort-keys" class="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-blue-600 focus:ring-blue-500 focus:ring-2" />
            <span class="text-sm text-gray-700 dark:text-gray-300">Sort Keys Alphabetically</span>
          </label>
        </div>
        
        <div class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 hidden" data-error></div>
        
        <!-- Line-by-line error diff view -->
        <div id="error-diff-view" class="hidden mb-6">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-750 rounded-t-lg">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                <svg class="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 18.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
                JSON Syntax Error Analysis
              </h3>
            </div>
            <div id="error-diff-content" class="p-0">
              <!-- Error diff content will be inserted here -->
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label for="json-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Input JSON</label>
            <div class="relative">
              <textarea 
                id="json-input" 
                class="w-full h-96 p-4 font-mono text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Paste your JSON here..."
                spellcheck="false"
              >{
  "example": "data",
  "number": 123,
  "nested": {
    "array": [1, 2, 3]
  }
}</textarea>
              <div class="absolute inset-0 pointer-events-none hidden" id="error-overlay"></div>
            </div>
          </div>
          
          <div>
            <label for="json-output" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Formatted Output</label>
            <pre id="json-output" class="w-full h-96 p-4 font-mono text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-auto"></pre>
          </div>
        </div>
        
        <div class="mt-6 flex gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span data-stat="chars">0 characters</span>
          <span data-stat="lines">0 lines</span>
          <span data-stat="size">0 bytes</span>
        </div>
      </div>
    `;
    
    // Get references to elements
    this.inputArea = this.container.querySelector('#json-input');
    this.outputArea = this.container.querySelector('#json-output');
    this.errorDisplay = this.container.querySelector('[data-error]');
    this.errorOverlay = this.container.querySelector('#error-overlay');
    this.errorDiffView = this.container.querySelector('#error-diff-view');
    this.errorDiffContent = this.container.querySelector('#error-diff-content');
    this.formatBtn = this.container.querySelector('[data-action="format"]');
    this.minifyBtn = this.container.querySelector('[data-action="minify"]');
    this.copyBtn = this.container.querySelector('[data-action="copy"]');
    this.clearBtn = this.container.querySelector('[data-action="clear"]');
  }
  
  attachEventListeners() {
    // Initialize tool enhancements
    this.initializeEnhancements();
    
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
            this.showErrorDiffView(errorLocation, input);
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
            this.showErrorDiffView(errorLocation, input);
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
  
  initializeEnhancements() {
    // Add tooltips to checkboxes
    const prettyPrintCheckbox = this.container.querySelector('#pretty-print');
    const validationOnlyCheckbox = this.container.querySelector('#validate-only');
    const sortKeysCheckbox = this.container.querySelector('#sort-keys');
    
    ToolEnhancements.enhanceCheckbox(
      prettyPrintCheckbox,
      "Format output with proper indentation and line breaks for better readability"
    );
    
    ToolEnhancements.enhanceCheckbox(
      validationOnlyCheckbox,
      "Only validate JSON structure without formatting - useful for checking syntax without changing layout"
    );
    
    ToolEnhancements.enhanceCheckbox(
      sortKeysCheckbox,
      "Sort object keys alphabetically for consistent output and easier comparison",
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys"
    );
    
    // Enhance copy button
    ToolEnhancements.enhanceCopyButton(this.copyBtn, () => {
      return this.outputArea.textContent || this.inputArea.value;
    }, 'Copy Result');
    
    // Add download functionality
    const downloadContainer = this.container.querySelector('#download-button-container');
    const downloadButton = ToolEnhancements.createDownloadButton(
      () => this.getFormattedOutput(),
      'formatted.json',
      'application/json',
      'Download JSON'
    );
    downloadContainer.appendChild(downloadButton);
    
    // Add tooltip to ratio statistic
    const ratioElement = this.container.querySelector('[data-stat="ratio"]');
    ToolEnhancements.addRatioTooltip(ratioElement, "Shows the size change when formatting JSON - formatted JSON is typically larger due to added whitespace");
  }
  
  format() {
    const input = this.inputArea.value.trim();
    if (!input) {
      feedback.showToast('Please enter some JSON data', 'warning');
      return;
    }
    
    const validationOnly = this.container.querySelector('#validation-only').checked;
    const sortKeys = this.container.querySelector('#sort-keys').checked;
    
    try {
      let parsed = JSON.parse(input);
      
      // Sort keys if requested
      if (sortKeys) {
        parsed = this.sortObjectKeys(parsed);
      }
      
      if (validationOnly) {
        this.clearError();
        feedback.showToast('JSON is valid!', 'success');
        return;
      }
      
      const formatted = JSON.stringify(parsed, null, 2);
      this.displayOutput(formatted);
      // When Format button is clicked, also update the input to formatted version
      this.inputArea.value = formatted;
      this.clearError();
      this.updateStats();
      feedback.showToast('JSON formatted successfully', 'success');
    } catch (error) {
      const errorLocation = this.getErrorLocation(error.message, input);
      this.showInlineError(errorLocation, input);
      this.showErrorDiffView(errorLocation, input);
      this.outputArea.textContent = '';
      feedback.showToast(`JSON formatting failed: ${error.message}`, 'error');
    }
  }
  
  minify() {
    const input = this.inputArea.value.trim();
    if (!input) {
      feedback.showToast('Please enter some JSON data', 'warning');
      return;
    }
    
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      this.displayOutput(minified);
      this.inputArea.value = minified;
      this.clearError();
      this.updateStats();
      feedback.showToast('JSON minified successfully', 'success');
    } catch (error) {
      feedback.showToast(`Invalid JSON: ${error.message}`, 'error');
      this.outputArea.textContent = '';
    }
  }
  
  copy() {
    const output = this.outputArea.textContent || this.inputArea.value;
    if (!output) {
      feedback.showToast('Nothing to copy', 'warning');
      return;
    }
    
    feedback.copyToClipboard(output, 'JSON copied to clipboard');
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
    this.errorDiffView.classList.add('hidden');
    this.errorDiffContent.innerHTML = '';
  }
  
  updateStats() {
    const text = this.inputArea.value;
    const chars = text.length;
    const lines = text.split('\n').length;
    const bytes = new Blob([text]).size;
    
    this.container.querySelector('[data-stat="chars"]').textContent = `${chars.toLocaleString()} characters`;
    this.container.querySelector('[data-stat="lines"]').textContent = `${lines.toLocaleString()} lines`;
    this.container.querySelector('[data-stat="size"]').textContent = formatBytes(bytes);
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
  
  sortObjectKeys(obj) {
    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item));
    } else if (obj !== null && typeof obj === 'object') {
      const sorted = {};
      Object.keys(obj).sort().forEach(key => {
        sorted[key] = this.sortObjectKeys(obj[key]);
      });
      return sorted;
    }
    return obj;
  }
  
  showErrorDiffView(errorLocation, jsonString) {
    const { line, column, message, position } = errorLocation;
    const lines = jsonString.split('\n');
    
    // Show context around the error (3 lines before and after)
    const contextBefore = 3;
    const contextAfter = 3;
    const startLine = Math.max(0, line - 1 - contextBefore);
    const endLine = Math.min(lines.length - 1, line - 1 + contextAfter);
    
    let diffHtml = '';
    
    for (let i = startLine; i <= endLine; i++) {
      const lineNumber = i + 1;
      const lineContent = lines[i] || '';
      const isErrorLine = lineNumber === line;
      const lineClass = isErrorLine ? 'error' : 'context';
      
      let displayContent = this.escapeHtml(lineContent);
      
      if (isErrorLine && column > 0) {
        // Highlight the specific character where the error occurred
        const beforeError = this.escapeHtml(lineContent.substring(0, column - 1));
        const errorChar = this.escapeHtml(lineContent.charAt(column - 1) || ' ');
        const afterError = this.escapeHtml(lineContent.substring(column));
        
        displayContent = `${beforeError}<span class="error-char-highlight">${errorChar}</span>${afterError}`;
        
        // Add error indicator
        if (column <= lineContent.length) {
          displayContent += '<span class="error-indicator"> ← Error here</span>';
        }
      }
      
      diffHtml += `
        <div class="error-diff-line ${lineClass}">
          <span class="error-diff-line-number">${lineNumber}</span>${displayContent}
        </div>
      `;
    }
    
    // Add error analysis and suggestions
    const suggestions = this.getErrorSuggestions(message, lines[line - 1], column);
    if (suggestions.length > 0) {
      diffHtml += `
        <div class="error-suggestion">
          <div class="error-suggestion-title">💡 Possible fixes:</div>
          ${suggestions.map(suggestion => `<div>• ${suggestion}</div>`).join('')}
        </div>
      `;
    }
    
    this.errorDiffContent.innerHTML = diffHtml;
    this.errorDiffView.classList.remove('hidden');
  }
  
  getErrorSuggestions(errorMessage, errorLine, column) {
    const suggestions = [];
    const message = errorMessage.toLowerCase();
    
    if (message.includes('unexpected token')) {
      if (message.includes("'")) {
        suggestions.push("Replace single quotes with double quotes - JSON requires double quotes for strings");
      }
      if (message.includes(',')) {
        suggestions.push("Remove trailing comma - JSON doesn't allow trailing commas in objects or arrays");
      }
      if (message.includes('}') || message.includes(']')) {
        suggestions.push("Check for missing comma before this closing bracket");
      }
      if (errorLine && column > 0) {
        const char = errorLine.charAt(column - 1);
        if (char === "'" || char === "'") {
          suggestions.push(`Change '${char}' to double quotes (") for JSON string values`);
        }
      }
    }
    
    if (message.includes('unexpected end')) {
      suggestions.push("Check for missing closing brackets: }, ], or )");
      suggestions.push("Ensure all opened objects and arrays are properly closed");
    }
    
    if (message.includes('expected') && message.includes('property name')) {
      suggestions.push("Object property names must be in double quotes");
      suggestions.push("Example: {\"propertyName\": \"value\"} not {propertyName: \"value\"}");
    }
    
    if (message.includes('duplicate') && message.includes('key')) {
      suggestions.push("Remove duplicate property names in the object");
      suggestions.push("Each property name can only appear once per object level");
    }
    
    if (errorLine) {
      // Check for common patterns in the error line
      if (errorLine.includes('undefined') || errorLine.includes('null')) {
        suggestions.push("Wrap undefined values in quotes if they should be strings, or use null for JSON null values");
      }
      
      if (/[a-zA-Z_$][a-zA-Z0-9_$]*\s*:/.test(errorLine)) {
        suggestions.push("Add double quotes around property names");
      }
      
      if (errorLine.includes('//') || errorLine.includes('/*')) {
        suggestions.push("Remove comments - JSON doesn't support comments");
      }
    }
    
    // Generic suggestions
    if (suggestions.length === 0) {
      suggestions.push("Validate JSON structure: check brackets, quotes, and commas");
      suggestions.push("Use a JSON validator to identify all syntax issues");
    }
    
    return suggestions;
  }

  getFormattedOutput() {
    const output = this.outputArea.textContent || this.inputArea.value;
    if (!output.trim()) {
      throw new Error('No content to download');
    }
    return output;
  }
}