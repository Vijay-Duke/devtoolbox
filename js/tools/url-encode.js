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
      <div class="max-w-7xl mx-auto p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">URL Encode/Decode</h1>
          <p class="text-gray-600 dark:text-gray-400">Encode and decode URLs with support for query parameters</p>
        </div>
        
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div class="flex flex-wrap gap-2">
            <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors" data-mode="encode">Encode</button>
            <button class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors" data-mode="decode">Decode</button>
            <button class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors" data-mode="encodeComponent">Encode Component</button>
          </div>
          <div class="flex gap-2">
            <button class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors" data-action="copy">Copy</button>
            <button class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors" data-action="clear">Clear</button>
          </div>
        </div>
        
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6" data-error hidden></div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <label for="url-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Input</label>
            <textarea 
              id="url-input" 
              class="w-full h-40 p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Enter URL or text to encode/decode..."
              spellcheck="false"
            >https://example.com/search?q=hello world&lang=en</textarea>
          </div>
          
          <div>
            <label for="url-output" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Output</label>
            <textarea 
              id="url-output" 
              class="w-full h-40 p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Result will appear here..."
              spellcheck="false"
              readonly
            ></textarea>
          </div>
        </div>
        
        <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4" id="query-params" hidden>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Query Parameters</h3>
          <div class="space-y-2" id="params-grid"></div>
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
        btn.className = 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors';
      } else {
        btn.className = 'px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors';
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
          <div class="flex gap-4 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded">
            <span class="font-semibold text-gray-700 dark:text-gray-300 min-w-0 break-all">${this.escapeHtml(key)}</span>
            <span class="text-gray-900 dark:text-white font-mono text-sm min-w-0 break-all">${this.escapeHtml(value)}</span>
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
      btn.className = 'px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors';
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.className = 'px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors';
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