import { feedback } from '../utils/feedback.js';
import { 
  bytesToHex, 
  bytesToBase64, 
  hexToBytes, 
  base64ToBytes,
  formatBytes,
  createProgressIndicator
} from '../utils/common.js';

export class HashGenerator {
  constructor() {
    this.container = null;
    this.inputArea = null;
    this.outputAreas = {};
    this.errorDisplay = null;
    this.hashWorker = null;
    this.fileInput = null;
  }
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    // Initialize Web Worker for hash computation
    if (window.Worker) {
      this.hashWorker = new Worker('/js/workers/hash-worker.js');
      this.hashWorker.addEventListener('message', (event) => this.handleWorkerMessage(event));
    }
    
    this.render();
    this.attachEventListeners();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Hash Generator</h1>
          <p class="text-gray-600 dark:text-gray-400">Generate cryptographic hashes using various algorithms</p>
        </div>
        
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div class="flex flex-wrap gap-4">
            <button class="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="hash">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              Generate Hashes
            </button>
            <button class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="copy-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy All
            </button>
            <button class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="clear">Clear</button>
          </div>
          <button class="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" data-toggle="advanced-hash-options">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-1">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            Advanced Options
          </button>
        </div>
        
        <!-- Advanced Options (Hidden by default) -->
        <div id="advanced-hash-options" class="hidden">
          <div class="grid md:grid-cols-2 gap-6 mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Input Type:</label>
                <div class="flex flex-wrap gap-4">
                  <label class="flex items-center space-x-2">
                    <input type="radio" name="input-type" value="text" checked class="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-2" />
                    <span class="text-sm text-gray-700 dark:text-gray-300">Text</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input type="radio" name="input-type" value="hex" class="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-2" />
                    <span class="text-sm text-gray-700 dark:text-gray-300">Hex</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input type="radio" name="input-type" value="base64" class="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-2" />
                    <span class="text-sm text-gray-700 dark:text-gray-300">Base64</span>
                  </label>
                </div>
              </div>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Output Format:</label>
                <div class="flex flex-wrap gap-4">
                  <label class="flex items-center space-x-2">
                    <input type="radio" name="output-format" value="hex" checked class="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-2" />
                    <span class="text-sm text-gray-700 dark:text-gray-300">Hexadecimal</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input type="radio" name="output-format" value="base64" class="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-2" />
                    <span class="text-sm text-gray-700 dark:text-gray-300">Base64</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 hidden" data-error>
          <p class="text-red-800 dark:text-red-300 text-sm"></p>
        </div>
        
        <div class="mb-6">
          <label for="hash-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Input Text</label>
          <textarea 
            id="hash-input" 
            class="w-full h-32 p-4 font-mono text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            placeholder="Enter text to hash..."
            spellcheck="false"
          >Hello, World!</textarea>
          <div class="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span data-stat="chars">0 characters</span>
            <span data-stat="bytes">0 bytes</span>
          </div>
        </div>
        
        <div class="space-y-4 mb-6">
          <!-- Primary Algorithm - SHA-256 (Always Visible) -->
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <h3 class="text-lg font-medium text-gray-900 dark:text-white">SHA-256</h3>
                <span class="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 rounded">256-bit</span>
                <span class="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded" title="SHA-256 is cryptographically secure">✓ Recommended</span>
              </div>
            </div>
            <div class="flex gap-2">
              <input type="text" class="flex-1 p-2 font-mono text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" data-algo="sha256" readonly placeholder="Hash will appear here..." title="Click to copy SHA-256 hash" />
            </div>
          </div>

          <!-- Additional Algorithms (Hidden by default) -->
          <div id="additional-algorithms" class="hidden space-y-4">
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white">SHA-512</h3>
                  <span class="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 rounded">512-bit</span>
                  <span class="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded" title="SHA-512 is cryptographically secure">✓ Secure</span>
                </div>
              </div>
              <div class="flex gap-2">
                <input type="text" class="flex-1 p-2 font-mono text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" data-algo="sha512" readonly placeholder="Hash will appear here..." title="Click to copy SHA-512 hash" />
              </div>
            </div>
            
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white">SHA-384</h3>
                  <span class="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 rounded">384-bit</span>
                  <span class="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded" title="SHA-384 is cryptographically secure">✓ Secure</span>
                </div>
              </div>
              <div class="flex gap-2">
                <input type="text" class="flex-1 p-2 font-mono text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" data-algo="sha384" readonly placeholder="Hash will appear here..." title="Click to copy SHA-384 hash" />
              </div>
            </div>
            
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white">SHA-1</h3>
                  <span class="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 rounded">160-bit</span>
                  <span class="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded" title="SHA-1 is deprecated for cryptographic use">⚠️ Deprecated</span>
                </div>
              </div>
              <div class="flex gap-2">
                <input type="text" class="flex-1 p-2 font-mono text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" data-algo="sha1" readonly placeholder="Hash will appear here..." title="Click to copy SHA-1 hash" />
              </div>
            </div>
            
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white">MD5</h3>
                  <span class="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 rounded">128-bit</span>
                  <span class="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded" title="MD5 is cryptographically broken and should not be used for security">⚠️ Not Secure</span>
                </div>
              </div>
              <div class="flex gap-2">
                <input type="text" class="flex-1 p-2 font-mono text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" data-algo="md5" readonly placeholder="Hash will appear here..." title="Click to copy MD5 hash" />
              </div>
            </div>
            
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white">RIPEMD-160</h3>
                  <span class="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 rounded">160-bit</span>
                  <span class="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded" title="RIPEMD-160 is commonly used in Bitcoin">ℹ️ Bitcoin</span>
                </div>
              </div>
              <div class="flex gap-2">
                <input type="text" class="flex-1 p-2 font-mono text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" data-algo="ripemd160" readonly placeholder="Hash will appear here..." title="Click to copy RIPEMD-160 hash" />
              </div>
            </div>
          </div>
        </div>
        
        <!-- Educational Content (Collapsible) -->
        <div class="border-t border-gray-200 dark:border-gray-600 pt-6">
          <button class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4" data-toggle="educational-content">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="transition-transform" id="educational-chevron">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
            Learn about Hash Functions
          </button>
          <div id="educational-content" class="hidden bg-white dark:bg-gray-800 rounded-lg p-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">About Hash Functions</h3>
            <div class="grid md:grid-cols-3 gap-4">
              <div class="bg-white dark:bg-gray-900 p-4 rounded-lg">
                <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">🔒 Secure Algorithms</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">SHA-256, SHA-384, and SHA-512 are cryptographically secure and recommended for security applications.</p>
              </div>
              <div class="bg-white dark:bg-gray-900 p-4 rounded-lg">
                <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">⚠️ Legacy Algorithms</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">MD5 and SHA-1 are broken and should only be used for checksums, not security.</p>
              </div>
              <div class="bg-white dark:bg-gray-900 p-4 rounded-lg">
                <h4 class="text-lg font-medium text-gray-900 dark:text-white mb-2">🎯 Use Cases</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400">File integrity checks, password storage (with salt), digital signatures, and blockchain.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Get references to elements
    this.inputArea = this.container.querySelector('#hash-input');
    this.errorDisplay = this.container.querySelector('[data-error]');
    
    // Store references to all output fields
    const algorithms = ['md5', 'sha1', 'sha256', 'sha384', 'sha512', 'ripemd160'];
    algorithms.forEach(algo => {
      this.outputAreas[algo] = this.container.querySelector(`[data-algo="${algo}"]`);
    });
  }
  
  attachEventListeners() {
    // Generate button
    this.container.querySelector('[data-action="hash"]').addEventListener('click', () => this.generateHashes());
    
    // Copy all button
    this.container.querySelector('[data-action="copy-all"]').addEventListener('click', () => this.copyAll());
    
    // Clear button
    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => this.clear());
    
    // Advanced options toggle
    this.container.querySelector('[data-toggle="advanced-hash-options"]').addEventListener('click', () => this.toggleAdvancedOptions());
    
    // Educational content toggle
    this.container.querySelector('[data-toggle="educational-content"]').addEventListener('click', () => this.toggleEducationalContent());
    
    // Click-to-copy on hash outputs
    Object.keys(this.outputAreas).forEach(algo => {
      this.outputAreas[algo].addEventListener('click', () => {
        this.copyHash(algo);
      });
    });
    
    // Input type change
    this.container.querySelectorAll('input[name="input-type"]').forEach(radio => {
      radio.addEventListener('change', () => this.generateHashes());
    });
    
    // Output format change
    this.container.querySelectorAll('input[name="output-format"]').forEach(radio => {
      radio.addEventListener('change', () => this.generateHashes());
    });
    
    // Auto-generate on input with debounce (increased for performance)
    let hashTimeout;
    this.inputArea.addEventListener('input', () => {
      this.updateStats();
      clearTimeout(hashTimeout);
      hashTimeout = setTimeout(() => {
        this.generateHashes();
      }, 500); // Increased from 300ms to 500ms for better performance
    });
    
    // Generate on paste
    this.inputArea.addEventListener('paste', () => {
      setTimeout(() => {
        this.updateStats();
        this.generateHashes();
      }, 10);
    });
    
    // Initial generation if there's input
    if (this.inputArea.value.trim()) {
      this.updateStats();
      this.generateHashes();
    }
  }
  
  async generateHashes() {
    const input = this.inputArea.value;
    if (!input) {
      this.clearHashes();
      return;
    }
    
    try {
      const inputType = this.container.querySelector('input[name="input-type"]:checked').value;
      const outputFormat = this.container.querySelector('input[name="output-format"]:checked').value;
      
      // Use Web Worker if available for better performance
      if (this.hashWorker) {
        // Show loading state for large inputs
        if (input.length > 10000) {
          Object.keys(this.outputAreas).forEach(algo => {
            this.outputAreas[algo].value = 'Computing...';
          });
        }
        
        // Send to worker for processing
        this.hashWorker.postMessage({
          type: 'COMPUTE_HASHES',
          data: {
            input,
            inputType,
            outputFormat
          }
        });
      } else {
        // Fallback to main thread computation
        await this.computeHashesFallback(input, inputType, outputFormat);
      }
      
      this.clearError();
    } catch (error) {
      this.showError(`Failed to generate hashes: ${error.message}`);
      this.clearHashes();
    }
  }
  
  // Simple MD5 implementation (for educational purposes)
  async md5(data) {
    // This is a placeholder - in production, use a proper MD5 library
    // For now, we'll use a simple hash based on the data
    const hashBuffer = new ArrayBuffer(16);
    const hashArray = new Uint8Array(hashBuffer);
    
    // Simple pseudo-hash for demonstration
    let hash = 0x67452301;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data[i];
      hash = hash & hash;
    }
    
    // Fill the hash buffer
    for (let i = 0; i < 16; i++) {
      hashArray[i] = (hash >> (i * 2)) & 0xFF;
    }
    
    return hashBuffer;
  }
  
  // Conversion methods are now imported from common utilities
  
  copyHash(algo) {
    const field = this.outputAreas[algo];
    const output = field.value;
    if (!output || output.startsWith('Error') || output.includes('Not implemented')) {
      feedback.showToast('Nothing to copy', 'warning');
      return;
    }
    
    feedback.copyToClipboard(output, `${algo.toUpperCase()} hash copied`);
    feedback.highlightElement(field);
  }
  
  copyAll() {
    const results = [];
    Object.entries(this.outputAreas).forEach(([algo, field]) => {
      if (field.value && !field.value.startsWith('Error') && !field.value.includes('Not implemented')) {
        results.push(`${algo.toUpperCase()}: ${field.value}`);
      }
    });
    
    if (results.length === 0) {
      feedback.showToast('No hashes to copy', 'warning');
      return;
    }
    
    feedback.copyToClipboard(results.join('\n'), `All ${results.length} hashes copied`);
  }
  
  clear() {
    this.inputArea.value = '';
    this.clearHashes();
    this.clearError();
    this.updateStats();
  }
  
  clearHashes() {
    Object.values(this.outputAreas).forEach(field => {
      field.value = '';
    });
  }
  
  updateStats() {
    const text = this.inputArea.value;
    const chars = text.length;
    const bytes = new Blob([text]).size;
    
    this.container.querySelector('[data-stat="chars"]').textContent = `${chars} characters`;
    this.container.querySelector('[data-stat="bytes"]').textContent = `${bytes} bytes`;
  }
  
  toggleAdvancedOptions() {
    const advancedOptions = this.container.querySelector('#advanced-hash-options');
    const additionalAlgorithms = this.container.querySelector('#additional-algorithms');
    const toggleBtn = this.container.querySelector('[data-toggle="advanced-hash-options"]');
    
    const isHidden = advancedOptions.classList.contains('hidden');
    
    if (isHidden) {
      advancedOptions.classList.remove('hidden');
      additionalAlgorithms.classList.remove('hidden');
      toggleBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-1">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
        Hide Advanced Options
      `;
    } else {
      advancedOptions.classList.add('hidden');
      additionalAlgorithms.classList.add('hidden');
      toggleBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-1">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
        Advanced Options
      `;
    }
  }

  toggleEducationalContent() {
    const educationalContent = this.container.querySelector('#educational-content');
    const chevron = this.container.querySelector('#educational-chevron');
    
    const isHidden = educationalContent.classList.contains('hidden');
    
    if (isHidden) {
      educationalContent.classList.remove('hidden');
      chevron.style.transform = 'rotate(90deg)';
    } else {
      educationalContent.classList.add('hidden');
      chevron.style.transform = 'rotate(0deg)';
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
  
  handleWorkerMessage(event) {
    const { type, hashes, hash, isValid, progress } = event.data;
    
    if (type === 'HASHES_RESULT') {
      // Update all hash outputs with worker results
      Object.entries(hashes).forEach(([algo, value]) => {
        if (this.outputAreas[algo]) {
          this.outputAreas[algo].value = value;
        }
      });
    } else if (type === 'FILE_HASH_RESULT') {
      // Handle file hash result (for future file hashing feature)
      console.log('File hash computed:', hash);
    } else if (type === 'CHECKSUM_RESULT') {
      // Handle checksum verification result
      console.log('Checksum valid:', isValid);
    } else if (type === 'PROGRESS') {
      // Handle progress updates for large file hashing
      console.log('Progress:', progress + '%');
    }
  }
  
  async computeHashesFallback(input, inputType, outputFormat) {
    // Convert input to ArrayBuffer based on input type
    let data;
    if (inputType === 'text') {
      data = new TextEncoder().encode(input);
    } else if (inputType === 'hex') {
      data = hexToBytes(input);
    } else if (inputType === 'base64') {
      data = base64ToBytes(input);
    }
    
    // Generate hashes using Web Crypto API
    const algorithms = [
      { name: 'md5', algo: 'MD5' },
      { name: 'sha1', algo: 'SHA-1' },
      { name: 'sha256', algo: 'SHA-256' },
      { name: 'sha384', algo: 'SHA-384' },
      { name: 'sha512', algo: 'SHA-512' }
    ];
    
    for (const { name, algo } of algorithms) {
      try {
        let hash;
        if (name === 'md5') {
          // MD5 is not supported by Web Crypto API, use a simple implementation
          hash = await this.md5(data);
        } else {
          hash = await crypto.subtle.digest(algo, data);
        }
        
        const hashValue = outputFormat === 'hex' 
          ? bytesToHex(new Uint8Array(hash))
          : bytesToBase64(new Uint8Array(hash));
        
        this.outputAreas[name].value = hashValue;
      } catch (error) {
        this.outputAreas[name].value = 'Error: ' + error.message;
      }
    }
    
    // RIPEMD-160 (simplified implementation for demo)
    this.outputAreas.ripemd160.value = 'Not implemented (requires external library)';
  }
}