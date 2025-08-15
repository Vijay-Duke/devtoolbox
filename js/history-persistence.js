// History Persistence - Save and restore tool history across sessions
export class HistoryPersistence {
  constructor() {
    this.maxHistoryItems = 50;
    this.history = this.loadHistory();
    this.currentTool = null;
    this.autoSave = true;
    this.init();
  }
  
  init() {
    this.attachListeners();
    this.createHistoryPanel();
  }
  
  attachListeners() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => {
      this.onToolChange();
    });
    
    // Save history on input changes
    document.addEventListener('input', (e) => {
      if (this.autoSave && this.currentTool) {
        this.debouncedSave();
      }
    });
    
    // Save before unload
    window.addEventListener('beforeunload', () => {
      this.saveHistory();
    });
  }
  
  onToolChange() {
    const hash = window.location.hash.slice(1);
    
    if (hash && hash !== '') {
      this.currentTool = hash;
      
      // Try to restore previous state for this tool
      setTimeout(() => {
        this.restoreToolState(hash);
        this.injectHistoryButton();
      }, 300);
    } else {
      this.currentTool = null;
    }
  }
  
  debouncedSave = (() => {
    let timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.saveCurrentState();
      }, 1000);
    };
  })();
  
  saveCurrentState() {
    if (!this.currentTool) return;
    
    const state = this.captureToolState();
    if (!state || Object.keys(state).length === 0) return;
    
    // Add to history
    const historyItem = {
      tool: this.currentTool,
      timestamp: Date.now(),
      state: state,
      title: this.generateTitle(state)
    };
    
    // Get tool history
    if (!this.history[this.currentTool]) {
      this.history[this.currentTool] = [];
    }
    
    // Avoid duplicates
    const lastItem = this.history[this.currentTool][0];
    if (lastItem && JSON.stringify(lastItem.state) === JSON.stringify(state)) {
      return;
    }
    
    // Add to beginning
    this.history[this.currentTool].unshift(historyItem);
    
    // Limit history size
    this.history[this.currentTool] = this.history[this.currentTool].slice(0, this.maxHistoryItems);
    
    // Save to localStorage
    this.saveHistory();
  }
  
  captureToolState() {
    const state = {};
    
    // Capture all inputs, textareas, and selects
    const inputs = document.querySelectorAll('.tool-container input, .tool-container textarea, .tool-container select');
    
    inputs.forEach(input => {
      if (input.id && !input.readOnly) {
        if (input.type === 'checkbox') {
          state[input.id] = input.checked;
        } else if (input.type === 'radio' && input.checked) {
          state[input.name] = input.value;
        } else if (input.type !== 'file' && input.value) {
          state[input.id] = input.value;
        }
      }
    });
    
    return state;
  }
  
  generateTitle(state) {
    // Try to generate a meaningful title from the state
    const keys = Object.keys(state);
    
    if (keys.includes('input') && state.input) {
      return state.input.substring(0, 50) + (state.input.length > 50 ? '...' : '');
    }
    
    if (keys.includes('text-input') && state['text-input']) {
      return state['text-input'].substring(0, 50) + (state['text-input'].length > 50 ? '...' : '');
    }
    
    if (keys.includes('json-input') && state['json-input']) {
      try {
        const json = JSON.parse(state['json-input']);
        return `JSON with ${Object.keys(json).length} keys`;
      } catch {
        return 'JSON data';
      }
    }
    
    return `State at ${new Date().toLocaleTimeString()}`;
  }
  
  restoreToolState(tool) {
    if (!this.history[tool] || this.history[tool].length === 0) return;
    
    // Check if tool has existing content
    const hasContent = this.hasExistingContent();
    
    if (!hasContent) {
      // Restore last state
      const lastState = this.history[tool][0];
      this.applyState(lastState.state);
    }
  }
  
  hasExistingContent() {
    const inputs = document.querySelectorAll('.tool-container input:not([type="checkbox"]):not([type="radio"]), .tool-container textarea');
    
    for (const input of inputs) {
      if (input.value && input.value.trim() !== '') {
        return true;
      }
    }
    
    return false;
  }
  
  applyState(state) {
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
        
        // Trigger events
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }
  
  injectHistoryButton() {
    const toolHeader = document.querySelector('.tool-header');
    if (!toolHeader || toolHeader.querySelector('.history-button')) return;
    
    const button = document.createElement('button');
    button.className = 'history-button';
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="1 4 1 10 7 10"/>
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
      </svg>
      <span>History</span>
    `;
    button.title = 'View history for this tool';
    button.setAttribute('aria-label', 'View history for this tool');
    
    button.addEventListener('click', () => this.showHistory());
    
    const titleRow = toolHeader.querySelector('.title-row') || toolHeader.querySelector('h1')?.parentElement || toolHeader;
    titleRow.appendChild(button);
  }
  
  createHistoryPanel() {
    const panel = document.createElement('div');
    panel.className = 'history-panel';
    panel.innerHTML = `
      <div class="panel-overlay" data-close></div>
      <div class="panel-content">
        <div class="panel-header">
          <h2>Tool History</h2>
          <button class="panel-close" data-close>×</button>
        </div>
        <div class="panel-body">
          <div class="history-controls">
            <button class="btn btn-sm" data-action="clear-history">Clear History</button>
            <button class="btn btn-sm" data-action="export-history">Export</button>
            <label class="checkbox-label">
              <input type="checkbox" id="auto-save-history" checked>
              <span>Auto-save</span>
            </label>
          </div>
          <div class="history-list" id="history-list"></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);
    this.panel = panel;
    
    // Attach handlers
    panel.querySelectorAll('[data-close]').forEach(el => {
      el.addEventListener('click', () => this.hideHistory());
    });
    
    panel.querySelector('[data-action="clear-history"]').addEventListener('click', () => {
      this.clearToolHistory();
    });
    
    panel.querySelector('[data-action="export-history"]').addEventListener('click', () => {
      this.exportHistory();
    });
    
    panel.querySelector('#auto-save-history').addEventListener('change', (e) => {
      this.autoSave = e.target.checked;
    });
  }
  
  showHistory() {
    if (!this.currentTool) return;
    
    const list = this.panel.querySelector('#history-list');
    const toolHistory = this.history[this.currentTool] || [];
    
    if (toolHistory.length === 0) {
      list.innerHTML = '<div class="empty-state">No history for this tool yet</div>';
    } else {
      list.innerHTML = toolHistory.map((item, index) => `
        <div class="history-item" data-index="${index}">
          <div class="history-time">${new Date(item.timestamp).toLocaleString()}</div>
          <div class="history-title">${this.escapeHtml(item.title)}</div>
          <div class="history-actions">
            <button class="btn-sm" data-restore="${index}">Restore</button>
            <button class="btn-sm" data-delete="${index}">Delete</button>
          </div>
        </div>
      `).join('');
      
      // Attach handlers
      list.querySelectorAll('[data-restore]').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.restore);
          this.restoreHistoryItem(index);
        });
      });
      
      list.querySelectorAll('[data-delete]').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.dataset.delete);
          this.deleteHistoryItem(index);
        });
      });
    }
    
    this.panel.classList.add('active');
  }
  
  hideHistory() {
    this.panel.classList.remove('active');
  }
  
  restoreHistoryItem(index) {
    const toolHistory = this.history[this.currentTool];
    if (!toolHistory || !toolHistory[index]) return;
    
    const item = toolHistory[index];
    this.applyState(item.state);
    this.hideHistory();
    this.showNotification('History restored');
  }
  
  deleteHistoryItem(index) {
    const toolHistory = this.history[this.currentTool];
    if (!toolHistory || !toolHistory[index]) return;
    
    toolHistory.splice(index, 1);
    this.saveHistory();
    this.showHistory(); // Refresh display
  }
  
  clearToolHistory() {
    if (this.currentTool) {
      delete this.history[this.currentTool];
      this.saveHistory();
      this.showHistory(); // Refresh display
      this.showNotification('History cleared');
    }
  }
  
  exportHistory() {
    const data = {
      version: '1.0',
      exported: new Date().toISOString(),
      history: this.history
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devtoolbox-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  saveHistory() {
    try {
      localStorage.setItem('devtoolbox-history', JSON.stringify(this.history));
    } catch (e) {
      console.error('Failed to save history:', e);
      // If storage is full, remove oldest items
      this.pruneHistory();
    }
  }
  
  loadHistory() {
    try {
      const saved = localStorage.getItem('devtoolbox-history');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }
  
  pruneHistory() {
    // Remove oldest items from each tool
    Object.keys(this.history).forEach(tool => {
      this.history[tool] = this.history[tool].slice(0, Math.floor(this.maxHistoryItems / 2));
    });
    
    try {
      this.saveHistory();
    } catch {
      // If still failing, clear all history
      this.history = {};
      localStorage.removeItem('devtoolbox-history');
    }
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'history-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }
}

// Add styles
const style = document.createElement('style');
style.textContent = `
  .history-button {
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
    margin-left: 10px;
  }
  
  .history-button:hover {
    background: var(--color-bg-tertiary);
    border-color: var(--color-primary);
  }
  
  .history-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 400px;
    max-width: 90vw;
    background: var(--color-bg);
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    transform: translateX(100%);
    transition: transform 300ms;
    z-index: 9999;
  }
  
  .history-panel.active {
    transform: translateX(0);
  }
  
  .panel-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    opacity: 0;
    pointer-events: none;
    transition: opacity 300ms;
  }
  
  .history-panel.active .panel-overlay {
    opacity: 1;
    pointer-events: auto;
  }
  
  .panel-content {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--color-bg);
  }
  
  .panel-header {
    padding: 20px;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .panel-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--color-text-secondary);
  }
  
  .panel-body {
    flex: 1;
    overflow: auto;
    padding: 20px;
  }
  
  .history-controls {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    align-items: center;
  }
  
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .history-item {
    background: var(--color-bg-secondary);
    padding: 12px;
    border-radius: 4px;
    border: 1px solid var(--color-border);
  }
  
  .history-time {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
    margin-bottom: 5px;
  }
  
  .history-title {
    margin-bottom: 10px;
    font-family: monospace;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .history-actions {
    display: flex;
    gap: 8px;
  }
  
  .history-notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--color-bg-secondary);
    color: var(--color-text);
    padding: 12px 20px;
    border-radius: 4px;
    transform: translateY(100px);
    opacity: 0;
    transition: all 300ms;
    z-index: 10001;
  }
  
  .history-notification.show {
    transform: translateY(0);
    opacity: 1;
  }
`;
document.head.appendChild(style);