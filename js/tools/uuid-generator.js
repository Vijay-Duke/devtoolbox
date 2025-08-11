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
      <div class="tool-container">
        <div class="tool-header">
          <h1>UUID Generator</h1>
          <p class="tool-description">Generate universally unique identifiers (UUIDs) in various formats</p>
        </div>
        
        <div class="tool-controls">
          <button class="btn btn-primary" data-action="generate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6"/>
              <path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Generate New
          </button>
          <button class="btn btn-secondary" data-action="generate-bulk">Generate Bulk</button>
          <button class="btn btn-secondary" data-action="copy">Copy</button>
          <button class="btn btn-secondary" data-action="copy-all">Copy All</button>
          <button class="btn btn-secondary" data-action="clear">Clear</button>
        </div>
        
        <div class="uuid-display">
          <div class="uuid-main" id="uuid-output"></div>
          <div class="uuid-formats">
            <div class="format-item">
              <span class="format-label">Uppercase:</span>
              <code id="uuid-upper"></code>
            </div>
            <div class="format-item">
              <span class="format-label">Without dashes:</span>
              <code id="uuid-nodash"></code>
            </div>
            <div class="format-item">
              <span class="format-label">URN:</span>
              <code id="uuid-urn"></code>
            </div>
          </div>
        </div>
        
        <div class="uuid-options">
          <label class="input-group">
            <span>Quantity:</span>
            <input type="number" id="uuid-count" min="1" max="1000" value="10" />
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="uuid-uppercase" />
            <span>Uppercase</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" id="uuid-hyphens" checked />
            <span>Include hyphens</span>
          </label>
        </div>
        
        <div class="uuid-history">
          <h3>Generated UUIDs</h3>
          <textarea 
            id="uuid-history" 
            class="code-input" 
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
    this.container.querySelector('[data-action="copy"]').addEventListener('click', () => this.copy());
    this.container.querySelector('[data-action="copy-all"]').addEventListener('click', () => this.copyAll());
    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => this.clear());
    
    // Copy individual format on click
    this.container.querySelectorAll('.uuid-formats code').forEach(elem => {
      elem.style.cursor = 'pointer';
      elem.addEventListener('click', () => {
        navigator.clipboard.writeText(elem.textContent).then(() => {
          elem.style.backgroundColor = 'var(--color-success)';
          elem.style.color = 'white';
          setTimeout(() => {
            elem.style.backgroundColor = '';
            elem.style.color = '';
          }, 500);
        });
      });
    });
    
    // Main UUID click to copy
    this.container.querySelector('#uuid-output').addEventListener('click', () => {
      const uuid = this.container.querySelector('#uuid-output').textContent;
      navigator.clipboard.writeText(uuid).then(() => {
        const elem = this.container.querySelector('#uuid-output');
        elem.style.backgroundColor = 'var(--color-success)';
        elem.style.color = 'white';
        setTimeout(() => {
          elem.style.backgroundColor = '';
          elem.style.color = '';
        }, 500);
      });
    });
  }
  
  generateUUID() {
    // Generate RFC4122 version 4 UUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
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
  
  copy() {
    const uuid = this.container.querySelector('#uuid-output').textContent;
    if (!uuid) return;
    
    navigator.clipboard.writeText(uuid).then(() => {
      const btn = this.container.querySelector('[data-action="copy"]');
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('btn-success');
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('btn-success');
      }, 2000);
    });
  }
  
  copyAll() {
    if (this.history.length === 0) return;
    
    navigator.clipboard.writeText(this.history.join('\n')).then(() => {
      const btn = this.container.querySelector('[data-action="copy-all"]');
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('btn-success');
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('btn-success');
      }, 2000);
    });
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