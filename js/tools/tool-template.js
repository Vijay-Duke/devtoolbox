// Tool Template - Base class for creating new tools
export class ToolTemplate {
  constructor() {
    this.container = null;
    this.state = {};
    this.config = {
      name: 'Tool Name',
      description: 'Tool description',
      version: '1.0.0',
      author: 'DevToolbox',
      category: 'Category',
      keywords: []
    };
  }
  
  // Required methods for all tools
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container ${containerId} not found`);
      return;
    }
    
    this.render();
    this.attachEventListeners();
    this.loadState();
  }
  
  render() {
    // Override this method to render your tool's UI
    this.container.innerHTML = `
      <div class="tool-container">
        <div class="tool-header">
          <h1>${this.config.name}</h1>
          <p>${this.config.description}</p>
        </div>
        
        <div class="tool-body">
          <!-- Tool content goes here -->
        </div>
      </div>
    `;
  }
  
  attachEventListeners() {
    // Override this method to attach event listeners
  }
  
  // Optional lifecycle methods
  loadState() {
    // Load saved state from localStorage or URL params
    try {
      const saved = localStorage.getItem(`tool-state-${this.config.name}`);
      if (saved) {
        this.state = JSON.parse(saved);
        this.applyState();
      }
    } catch (e) {
      console.error('Failed to load state:', e);
    }
  }
  
  saveState() {
    // Save current state
    try {
      localStorage.setItem(`tool-state-${this.config.name}`, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }
  
  applyState() {
    // Apply loaded state to UI
    // Override this method based on your tool's needs
  }
  
  destroy() {
    // Cleanup when navigating away
    // Override if you need to clean up timers, workers, etc.
    this.saveState();
  }
  
  // Utility methods
  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `tool-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  copyToClipboard(text) {
    return navigator.clipboard.writeText(text).then(() => {
      this.showNotification('Copied to clipboard');
      return true;
    }).catch(err => {
      console.error('Failed to copy:', err);
      this.showNotification('Failed to copy', 'error');
      return false;
    });
  }
  
  downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Performance monitoring
  measurePerformance(name, func) {
    const start = performance.now();
    const result = func();
    const end = performance.now();
    
    console.log(`${name} took ${(end - start).toFixed(2)}ms`);
    
    return result;
  }
  
  // Error handling
  handleError(error, userMessage = 'An error occurred') {
    console.error(error);
    this.showNotification(userMessage, 'error');
  }
  
  // Validation helpers
  isValidJSON(str) {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
  
  isValidURL(str) {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }
  
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}

// Export a factory function for creating new tools
export function createTool(config) {
  return class extends ToolTemplate {
    constructor() {
      super();
      this.config = { ...this.config, ...config };
    }
  };
}