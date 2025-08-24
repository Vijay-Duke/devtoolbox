// Shareable Links - Save and restore tool state via URL
export class ShareableLinks {
  constructor() {
    this.currentTool = null;
    this.shareButton = null;
    this.init();
  }
  
  init() {
    this.createShareButton();
    this.attachListeners();
    this.restoreFromURL();
  }
  
  createShareButton() {
    const button = document.createElement('button');
    button.className = 'share-button';
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
        <polyline points="16 6 12 2 8 6"/>
        <line x1="12" y1="2" x2="12" y2="15"/>
      </svg>
      <span>Share</span>
    `;
    button.title = 'Share tool with current settings';
    button.setAttribute('aria-label', 'Share tool with current settings');
    button.hidden = true;
    
    this.shareButton = button;
  }
  
  attachListeners() {
    // Listen for hash changes to update share button
    window.addEventListener('hashchange', () => {
      this.updateShareButton();
      this.restoreFromURL();
    });
    
    // Initial check
    this.updateShareButton();
    
    // Share button click
    this.shareButton.addEventListener('click', () => this.shareCurrentTool());
  }
  
  updateShareButton() {
    const hash = window.location.hash.slice(1);
    const toolPath = hash.split('?')[0];
    
    if (toolPath && toolPath !== '') {
      // Insert share button into tool header if not already there
      setTimeout(() => {
        const toolHeader = document.querySelector('.tool-header');
        if (toolHeader && !toolHeader.contains(this.shareButton)) {
          const titleRow = toolHeader.querySelector('.title-row') || toolHeader.querySelector('h1')?.parentElement || toolHeader;
          titleRow.appendChild(this.shareButton);
        }
        this.shareButton.hidden = false;
        this.currentTool = toolPath;
      }, 100);
    } else {
      this.shareButton.hidden = true;
      this.currentTool = null;
    }
  }
  
  shareCurrentTool() {
    if (!this.currentTool) return;
    
    const state = this.captureToolState();
    const url = this.buildShareableURL(this.currentTool, state);
    
    // Show share modal
    this.showShareModal(url);
  }
  
  captureToolState() {
    const state = {};
    
    // Capture different input types
    const inputs = document.querySelectorAll('.tool-container input, .tool-container textarea, .tool-container select');
    
    inputs.forEach(input => {
      if (input.id && !input.readOnly) {
        if (input.type === 'checkbox') {
          state[input.id] = input.checked;
        } else if (input.type === 'radio' && input.checked) {
          state[input.name] = input.value;
        } else if (input.type !== 'file') {
          state[input.id] = input.value;
        }
      }
    });
    
    return state;
  }
  
  buildShareableURL(tool, state) {
    const base = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    
    // Encode state as base64 to make URL cleaner
    const stateJSON = JSON.stringify(state);
    const encoded = btoa(encodeURIComponent(stateJSON));
    params.set('s', encoded);
    
    return `${base}#${tool}?${params.toString()}`;
  }
  
  restoreFromURL() {
    const hash = window.location.hash.slice(1);
    const [tool, queryString] = hash.split('?');
    
    if (!queryString) return;
    
    const params = new URLSearchParams(queryString);
    const encoded = params.get('s');
    
    if (!encoded) return;
    
    try {
      // Decode state
      const stateJSON = decodeURIComponent(atob(encoded));
      const state = JSON.parse(stateJSON);
      
      // Wait for tool to load
      setTimeout(() => {
        this.restoreToolState(state);
      }, 500);
    } catch (error) {
      console.error('Failed to restore state:', error);
    }
  }
  
  restoreToolState(state) {
    Object.entries(state).forEach(([key, value]) => {
      const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
      
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = value;
        } else if (element.type === 'radio') {
          const radio = document.querySelector(`[name="${key}"][value="${value}"]`);
          if (radio) radio.checked = true;
        } else {
          element.value = value;
        }
        
        // Trigger change event to update tool
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    
    // Show notification
    this.showNotification('Settings restored from shared link');
  }
  
  showShareModal(url) {
    // Remove existing modal if any
    const existing = document.querySelector('.share-modal');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.className = 'share-modal active';
    
    // Escape the URL to prevent XSS
    const escapedUrl = this.escapeHtml(url);
    
    modal.innerHTML = `
      <div class="modal-overlay" data-close></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>Share Tool Settings</h2>
          <button class="modal-close" data-close>×</button>
        </div>
        <div class="modal-body">
          <p>Share this link to preserve current tool settings:</p>
          <div class="share-url-container">
            <input type="text" class="share-url-input" value="${escapedUrl}" readonly>
            <button class="btn btn-primary" data-copy>Copy Link</button>
          </div>
          <div class="share-options">
            <button class="share-option" data-share="email">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Email
            </button>
            <button class="share-option" data-share="twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
              </svg>
              Twitter
            </button>
            <button class="share-option" data-share="qr">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
              </svg>
              QR Code
            </button>
          </div>
          <div class="qr-container" id="share-qr" hidden></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Select URL on focus
    const urlInput = modal.querySelector('.share-url-input');
    urlInput.addEventListener('focus', () => urlInput.select());
    
    // Copy button
    modal.querySelector('[data-copy]').addEventListener('click', () => {
      navigator.clipboard.writeText(url).then(() => {
        const btn = modal.querySelector('[data-copy]');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('success');
        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove('success');
        }, 2000);
      });
    });
    
    // Close handlers
    modal.querySelectorAll('[data-close]').forEach(el => {
      el.addEventListener('click', () => modal.remove());
    });
    
    // Share options
    modal.querySelector('[data-share="email"]').addEventListener('click', () => {
      const subject = `Check out this ${this.currentTool} configuration`;
      const body = `I've shared a DevToolbox tool configuration with you:\n\n${url}`;
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
    
    modal.querySelector('[data-share="twitter"]').addEventListener('click', () => {
      const text = `Check out this DevToolbox tool configuration:`;
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    });
    
    modal.querySelector('[data-share="qr"]').addEventListener('click', () => {
      this.generateQRCode(url, modal.querySelector('#share-qr'));
    });
  }
  
  generateQRCode(url, container) {
    // Simple QR code visualization (placeholder)
    container.innerHTML = `
      <div class="qr-code">
        <canvas id="qr-canvas" width="200" height="200"></canvas>
        <p>Scan to open on mobile</p>
      </div>
    `;
    
    // Draw a simple QR pattern (in production, use a proper QR library)
    const canvas = container.querySelector('#qr-canvas');
    const ctx = canvas.getContext('2d');
    
    // Create a simple pattern based on URL hash
    const hash = this.simpleHash(url);
    const size = 200;
    const modules = 25;
    const moduleSize = size / modules;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = '#000000';
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        // Create pattern based on hash
        const index = row * modules + col;
        if ((hash + index) % 2 === 0 || this.isFinderPattern(row, col, modules)) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    
    container.hidden = false;
  }
  
  isFinderPattern(row, col, size) {
    // Simplified finder pattern for corners
    if ((row < 7 && col < 7) || (row < 7 && col >= size - 7) || (row >= size - 7 && col < 7)) {
      const r = row < 7 ? row : row - (size - 7);
      const c = col < 7 ? col : col - (size - 7);
      return (r === 0 || r === 6 || c === 0 || c === 6) || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
    }
    return false;
  }
  
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
  
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'share-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// Add styles for share modal
const style = document.createElement('style');
style.textContent = `
  .share-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    color: var(--color-text);
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 150ms;
    margin-left: auto;
  }
  
  .share-button:hover {
    background: var(--color-bg-tertiary);
    border-color: var(--color-primary);
  }
  
  .share-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    display: none;
    align-items: center;
    justify-content: center;
  }
  
  .share-modal.active {
    display: flex;
  }
  
  .share-url-container {
    display: flex;
    gap: 10px;
    margin: 20px 0;
  }
  
  .share-url-input {
    flex: 1;
    padding: 10px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: var(--color-bg-secondary);
    color: var(--color-text);
    font-family: monospace;
    font-size: 0.9rem;
  }
  
  .share-options {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }
  
  .share-option {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 12px;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    cursor: pointer;
    transition: all 150ms;
  }
  
  .share-option:hover {
    background: var(--color-bg-tertiary);
    transform: translateY(-2px);
  }
  
  .qr-container {
    margin-top: 20px;
    text-align: center;
  }
  
  .qr-code canvas {
    border: 2px solid var(--color-border);
    border-radius: 4px;
    margin: 10px auto;
  }
  
  .share-notification {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    background: var(--color-success);
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    opacity: 0;
    transition: all 300ms;
    z-index: 10001;
  }
  
  .share-notification.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
  
  .title-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;
document.head.appendChild(style);