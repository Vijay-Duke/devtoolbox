import { feedback } from '../utils/feedback.js';
import { generateUUID } from '../utils/common.js';

export class UUIDGenerator {
  constructor() {
    this.container = null;
    this.outputArea = null;
    this.history = [];
  }
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.render();
    this.attachEventListeners();
    this.generate(); // Generate one on load
  }
  
  render() {
    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">UUID Generator</h1>
          <p class="text-gray-600 dark:text-gray-400">Generate universally unique identifiers (UUIDs) in various formats</p>
        </div>
        
        <div class="flex flex-wrap gap-4 mb-8">
          <button class="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="generate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
              <path d="M23 4v6h-6"/>
              <path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Generate New
          </button>
          <button class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="generate-bulk">Generate Bulk</button>
          <button class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="copy-all">Copy All History</button>
          <button class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="clear">Clear</button>
        </div>
        
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <div class="text-center mb-6">
            <div class="text-2xl font-mono font-bold text-gray-900 dark:text-white cursor-pointer select-all p-4 bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600" id="uuid-output" title="Click to copy"></div>
          </div>
          
          <div class="space-y-3">
            <div class="flex items-center justify-between py-2 px-4 bg-white dark:bg-gray-900 rounded">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Uppercase:</span>
              <code class="font-mono text-sm text-gray-900 dark:text-white cursor-pointer select-all" id="uuid-upper" title="Click to copy"></code>
            </div>
            <div class="flex items-center justify-between py-2 px-4 bg-white dark:bg-gray-900 rounded">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Without dashes:</span>
              <code class="font-mono text-sm text-gray-900 dark:text-white cursor-pointer select-all" id="uuid-nodash" title="Click to copy"></code>
            </div>
            <div class="flex items-center justify-between py-2 px-4 bg-white dark:bg-gray-900 rounded">
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400">URN:</span>
              <code class="font-mono text-sm text-gray-900 dark:text-white cursor-pointer select-all" id="uuid-urn" title="Click to copy"></code>
            </div>
          </div>
        </div>
        
        <div class="grid md:grid-cols-3 gap-6 mb-6">
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</label>
            <input type="number" id="uuid-count" min="1" max="1000" value="10" class="w-20 px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white" />
          </div>
          <label class="flex items-center space-x-2">
            <input type="checkbox" id="uuid-uppercase" class="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-blue-600 focus:ring-blue-500 focus:ring-2" />
            <span class="text-sm text-gray-700 dark:text-gray-300">Uppercase</span>
          </label>
          <label class="flex items-center space-x-2">
            <input type="checkbox" id="uuid-hyphens" checked class="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-blue-600 focus:ring-blue-500 focus:ring-2" />
            <span class="text-sm text-gray-700 dark:text-gray-300">Include hyphens</span>
          </label>
        </div>
        
        <div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Generated UUIDs</h3>
          <textarea 
            id="uuid-history" 
            class="w-full h-64 p-4 font-mono text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg" 
            placeholder="Generated UUIDs will appear here..."
            spellcheck="false"
            readonly
          ></textarea>
        </div>
      </div>
    `;
    
    this.outputArea = this.container.querySelector('#uuid-history');
  }
  
  attachEventListeners() {
    this.container.querySelector('[data-action="generate"]').addEventListener('click', () => this.generate());
    this.container.querySelector('[data-action="generate-bulk"]').addEventListener('click', () => this.generateBulk());
    this.container.querySelector('[data-action="copy-all"]').addEventListener('click', () => this.copyAll());
    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => this.clear());
    
    // Copy individual format variations on click
    ['#uuid-upper', '#uuid-nodash', '#uuid-urn'].forEach(selector => {
      this.container.querySelector(selector).addEventListener('click', () => {
        const element = this.container.querySelector(selector);
        const text = element.textContent;
        if (text) {
          feedback.copyToClipboard(text, 'UUID format copied');
          feedback.highlightElement(element);
        }
      });
    });
    
    // Main UUID click to copy
    this.container.querySelector('#uuid-output').addEventListener('click', () => {
      const element = this.container.querySelector('#uuid-output');
      const uuid = element.textContent;
      if (uuid) {
        feedback.copyToClipboard(uuid, 'UUID copied');
        feedback.highlightElement(element);
      }
    });
  }
  
  generateUUID() {
    // Use the common utility for consistent UUID generation
    return generateUUID();
  }
  
  generate() {
    const uuid = this.generateUUID();
    const uppercase = this.container.querySelector('#uuid-uppercase').checked;
    const hyphens = this.container.querySelector('#uuid-hyphens').checked;
    
    let displayUuid = uuid;
    if (uppercase) displayUuid = displayUuid.toUpperCase();
    if (!hyphens) displayUuid = displayUuid.replace(/-/g, '');
    
    // Display main UUID
    this.container.querySelector('#uuid-output').textContent = displayUuid;
    
    // Display format variations
    this.container.querySelector('#uuid-upper').textContent = uuid.toUpperCase();
    this.container.querySelector('#uuid-nodash').textContent = uuid.replace(/-/g, '');
    this.container.querySelector('#uuid-urn').textContent = `urn:uuid:${uuid}`;
    
    // Add to history
    this.history.unshift(displayUuid);
    if (this.history.length > 100) this.history.pop();
    this.updateHistory();
  }
  
  generateBulk() {
    const count = Math.min(1000, Math.max(1, parseInt(this.container.querySelector('#uuid-count').value) || 10));
    const uppercase = this.container.querySelector('#uuid-uppercase').checked;
    const hyphens = this.container.querySelector('#uuid-hyphens').checked;
    
    const uuids = [];
    for (let i = 0; i < count; i++) {
      let uuid = this.generateUUID();
      if (uppercase) uuid = uuid.toUpperCase();
      if (!hyphens) uuid = uuid.replace(/-/g, '');
      uuids.push(uuid);
    }
    
    this.history = [...uuids, ...this.history].slice(0, 1000);
    this.updateHistory();
    
    // Update main display with first one
    this.container.querySelector('#uuid-output').textContent = uuids[0];
    const firstUuid = this.generateUUID();
    this.container.querySelector('#uuid-upper').textContent = firstUuid.toUpperCase();
    this.container.querySelector('#uuid-nodash').textContent = firstUuid.replace(/-/g, '');
    this.container.querySelector('#uuid-urn').textContent = `urn:uuid:${firstUuid}`;
  }
  
  updateHistory() {
    this.outputArea.value = this.history.join('\n');
  }
  
  
  copyAll() {
    if (this.history.length === 0) {
      feedback.showToast('No UUIDs to copy', 'warning');
      return;
    }
    
    feedback.copyToClipboard(
      this.history.join('\n'), 
      `All ${this.history.length} UUIDs copied`
    );
  }
  
  clear() {
    this.history = [];
    this.outputArea.value = '';
    this.container.querySelector('#uuid-output').textContent = '';
    this.container.querySelector('#uuid-upper').textContent = '';
    this.container.querySelector('#uuid-nodash').textContent = '';
    this.container.querySelector('#uuid-urn').textContent = '';
  }
}