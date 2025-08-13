import { feedback } from '../utils/feedback.js';
import { formatBytes, sanitizeInput } from '../utils/common.js';

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
      <div class="max-w-7xl mx-auto p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Base64 Encode/Decode</h1>
          <p class="text-gray-600 dark:text-gray-400">Encode and decode Base64 strings with support for UTF-8</p>
        </div>
        
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div class="inline-flex rounded-lg border border-gray-200 dark:border-gray-700">
            <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-l-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" data-mode="encode">Encode</button>
            <button class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-r-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" data-mode="decode">Decode</button>
          </div>
          <div class="flex gap-2">
            <button class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="swap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
                <polyline points="17 1 21 5 17 9"/>
                <polyline points="3 11 7 7 11 11"/>
                <path d="M21 5H9"/>
                <path d="M3 19h12"/>
                <polyline points="7 23 3 19 7 15"/>
              </svg>
              Swap
            </button>
            <button class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="copy">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy
            </button>
            <button class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="clear">Clear</button>
          </div>
        </div>
        
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 hidden" data-error>
          <p class="text-red-800 dark:text-red-300 text-sm"></p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-6 mb-6">
          <div class="space-y-2">
            <label for="base64-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Input</label>
            <textarea 
              id="base64-input" 
              class="w-full h-64 p-4 font-mono text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Enter text to encode or Base64 to decode..."
              spellcheck="false"
            >Hello, World!</textarea>
          </div>
          
          <div class="space-y-2">
            <label for="base64-output" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Output</label>
            <textarea 
              id="base64-output" 
              class="w-full h-64 p-4 font-mono text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg" 
              placeholder="Result will appear here..."
              spellcheck="false"
              readonly
            ></textarea>
          </div>
        </div>
        
        <div class="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div class="flex gap-6 text-sm">
            <span class="text-gray-600 dark:text-gray-400"><span class="font-medium text-gray-900 dark:text-white" data-stat="input-size">0 bytes</span> input</span>
            <span class="text-gray-600 dark:text-gray-400"><span class="font-medium text-gray-900 dark:text-white" data-stat="output-size">0 bytes</span> output</span>
            <span class="text-gray-600 dark:text-gray-400" data-stat="ratio">Ratio: 0%</span>
          </div>
          <label class="flex items-center space-x-2 text-sm">
            <input type="checkbox" id="url-safe" class="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-blue-600 focus:ring-blue-500 focus:ring-2" />
            <span class="text-gray-700 dark:text-gray-300">URL Safe (RFC 4648)</span>
          </label>
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
    const rawInput = this.inputArea.value;
    if (!rawInput) {
      this.outputArea.value = '';
      this.clearError();
      return;
    }
    
    // Sanitize input for security
    const input = sanitizeInput(rawInput, { maxLength: 10000000 }); // 10MB limit
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
      feedback.showToast(`Failed to ${this.mode}: ${error.message}`, 'error');
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
      feedback.showToast('Nothing to copy', 'warning');
      return;
    }
    
    feedback.copyToClipboard(output, `${this.mode === 'encode' ? 'Encoded' : 'Decoded'} result copied`);
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
    
    this.container.querySelector('[data-stat="input-size"]').textContent = formatBytes(inputBytes);
    this.container.querySelector('[data-stat="output-size"]').textContent = formatBytes(outputBytes);
    
    if (inputBytes > 0) {
      const ratio = Math.round((outputBytes / inputBytes) * 100);
      this.container.querySelector('[data-stat="ratio"]').textContent = `Ratio: ${ratio}%`;
    } else {
      this.container.querySelector('[data-stat="ratio"]').textContent = 'Ratio: 0%';
    }
  }
  
  showError(message) {
    this.errorDisplay.querySelector('p').textContent = message;
    this.errorDisplay.classList.remove('hidden');
  }
  
  clearError() {
    this.errorDisplay.querySelector('p').textContent = '';
    this.errorDisplay.classList.add('hidden');
  }
}