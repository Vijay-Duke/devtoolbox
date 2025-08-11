// Global keyboard shortcuts for DevToolbox
export class KeyboardShortcuts {
  constructor() {
    this.shortcuts = new Map();
    this.enabled = true;
    this.modal = null;
    this.init();
  }
  
  init() {
    this.registerShortcuts();
    this.attachListeners();
    this.createHelpModal();
  }
  
  registerShortcuts() {
    // Navigation shortcuts
    this.register('/', 'Focus search', () => {
      document.querySelector('.search-input')?.focus();
    });
    
    this.register('Escape', 'Clear search / Close modals', () => {
      const searchInput = document.querySelector('.search-input');
      const searchResults = document.querySelector('.search-results');
      
      if (document.activeElement === searchInput || searchResults?.contains(document.activeElement)) {
        searchInput.value = '';
        searchResults.hidden = true;
        searchInput.blur();
      } else if (this.modal?.classList.contains('active')) {
        this.hideHelp();
      }
    });
    
    this.register('t', 'Toggle theme', () => {
      document.querySelector('[data-theme-toggle]')?.click();
    });
    
    this.register('?', 'Show help', () => {
      this.toggleHelp();
    });
    
    this.register('h', 'Go home', () => {
      window.location.hash = '';
    });
    
    // Quick navigation to tools (Ctrl/Cmd + number)
    this.register('ctrl+1', 'JSON Formatter', () => {
      window.location.hash = '#json-formatter';
    });
    
    this.register('ctrl+2', 'Base64 Encode/Decode', () => {
      window.location.hash = '#base64';
    });
    
    this.register('ctrl+3', 'UUID Generator', () => {
      window.location.hash = '#uuid';
    });
    
    this.register('ctrl+4', 'Hash Generator', () => {
      window.location.hash = '#hash';
    });
    
    this.register('ctrl+5', 'Regex Tester', () => {
      window.location.hash = '#regex-tester';
    });
    
    // Quick tool search (Ctrl/Cmd + K)
    this.register('ctrl+k', 'Quick tool search', (e) => {
      e.preventDefault();
      this.showQuickSearch();
    });
    
    this.register('cmd+k', 'Quick tool search', (e) => {
      e.preventDefault();
      this.showQuickSearch();
    });
    
    // Tool-specific shortcuts
    this.register('ctrl+enter', 'Execute/Generate in current tool', () => {
      const generateBtn = document.querySelector('[data-action="generate"], [data-action="format"], [data-action="convert"], [data-action="hash"]');
      generateBtn?.click();
    });
    
    this.register('ctrl+c', 'Copy result', (e) => {
      const copyBtn = document.querySelector('[data-action="copy"]');
      if (copyBtn && !window.getSelection().toString()) {
        e.preventDefault();
        copyBtn.click();
      }
    });
    
    this.register('ctrl+shift+c', 'Clear current tool', () => {
      const clearBtn = document.querySelector('[data-action="clear"]');
      clearBtn?.click();
    });
    
    // Navigation between tools
    this.register('alt+ArrowLeft', 'Previous tool', () => {
      this.navigateTool(-1);
    });
    
    this.register('alt+ArrowRight', 'Next tool', () => {
      this.navigateTool(1);
    });
    
    // Favorites
    this.register('ctrl+d', 'Add to favorites', () => {
      this.toggleFavorite();
    });
    
    this.register('ctrl+b', 'Show favorites', () => {
      this.showFavorites();
    });
  }
  
  register(keys, description, handler) {
    this.shortcuts.set(keys, { description, handler });
  }
  
  attachListeners() {
    document.addEventListener('keydown', (e) => {
      if (!this.enabled) return;
      
      // Skip if user is typing in an input/textarea (except for some shortcuts)
      const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
      const allowedWhileTyping = ['Escape', 'ctrl+enter', 'cmd+enter'];
      
      const key = this.getKeyCombo(e);
      
      if (isTyping && !allowedWhileTyping.includes(key)) {
        if (key !== '/' && !key.includes('ctrl') && !key.includes('cmd')) {
          return;
        }
      }
      
      const shortcut = this.shortcuts.get(key);
      if (shortcut) {
        shortcut.handler(e);
      }
    });
  }
  
  getKeyCombo(e) {
    const parts = [];
    
    if (e.ctrlKey) parts.push('ctrl');
    if (e.metaKey) parts.push('cmd');
    if (e.altKey) parts.push('alt');
    if (e.shiftKey) parts.push('shift');
    
    let key = e.key;
    
    // Normalize key names
    if (key === ' ') key = 'Space';
    if (key === 'ArrowLeft') key = 'ArrowLeft';
    if (key === 'ArrowRight') key = 'ArrowRight';
    if (key === 'ArrowUp') key = 'ArrowUp';
    if (key === 'ArrowDown') key = 'ArrowDown';
    if (key === 'Enter') key = 'enter';
    
    // Handle special characters
    if (key.length === 1) {
      key = key.toLowerCase();
    }
    
    parts.push(key);
    
    return parts.join('+');
  }
  
  createHelpModal() {
    const modal = document.createElement('div');
    modal.className = 'keyboard-shortcuts-modal';
    modal.innerHTML = `
      <div class="modal-overlay" data-close></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>Keyboard Shortcuts</h2>
          <button class="modal-close" data-close>×</button>
        </div>
        <div class="modal-body">
          <div class="shortcuts-grid">
            ${this.renderShortcuts()}
          </div>
        </div>
        <div class="modal-footer">
          <p>Press <kbd>?</kbd> to toggle this help</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.modal = modal;
    
    // Close handlers
    modal.querySelectorAll('[data-close]').forEach(el => {
      el.addEventListener('click', () => this.hideHelp());
    });
  }
  
  renderShortcuts() {
    const categories = {
      'Navigation': [],
      'Tools': [],
      'Actions': []
    };
    
    this.shortcuts.forEach((shortcut, keys) => {
      const item = `
        <div class="shortcut-item">
          <kbd>${this.formatKeys(keys)}</kbd>
          <span>${shortcut.description}</span>
        </div>
      `;
      
      if (keys.includes('ctrl+') && keys.match(/\d/)) {
        categories['Tools'].push(item);
      } else if (keys.includes('Arrow') || keys === '/' || keys === 'h' || keys.includes('+k')) {
        categories['Navigation'].push(item);
      } else {
        categories['Actions'].push(item);
      }
    });
    
    return Object.entries(categories).map(([category, items]) => `
      <div class="shortcuts-category">
        <h3>${category}</h3>
        ${items.join('')}
      </div>
    `).join('');
  }
  
  formatKeys(keys) {
    return keys
      .split('+')
      .map(key => {
        switch(key) {
          case 'ctrl': return '⌃';
          case 'cmd': return '⌘';
          case 'alt': return '⌥';
          case 'shift': return '⇧';
          case 'ArrowLeft': return '←';
          case 'ArrowRight': return '→';
          case 'ArrowUp': return '↑';
          case 'ArrowDown': return '↓';
          case 'enter': return '⏎';
          default: return key.toUpperCase();
        }
      })
      .join(' ');
  }
  
  toggleHelp() {
    if (this.modal.classList.contains('active')) {
      this.hideHelp();
    } else {
      this.showHelp();
    }
  }
  
  showHelp() {
    this.modal.classList.add('active');
  }
  
  hideHelp() {
    this.modal.classList.remove('active');
  }
  
  showQuickSearch() {
    const searchInput = document.querySelector('.search-input');
    searchInput?.focus();
    searchInput?.select();
  }
  
  navigateTool(direction) {
    const currentHash = window.location.hash.slice(1);
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const currentIndex = navLinks.findIndex(link => link.getAttribute('href') === `#${currentHash}`);
    
    if (currentIndex !== -1) {
      const newIndex = (currentIndex + direction + navLinks.length) % navLinks.length;
      navLinks[newIndex]?.click();
    } else if (navLinks.length > 0) {
      navLinks[0].click();
    }
  }
  
  toggleFavorite() {
    const currentHash = window.location.hash.slice(1);
    if (!currentHash) return;
    
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.indexOf(currentHash);
    
    if (index === -1) {
      favorites.push(currentHash);
      this.showNotification('Added to favorites');
    } else {
      favorites.splice(index, 1);
      this.showNotification('Removed from favorites');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    this.updateFavoriteIndicator();
  }
  
  showFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (favorites.length === 0) {
      this.showNotification('No favorites yet. Press Ctrl+D to add current tool.');
      return;
    }
    
    // Create favorites modal
    const modal = document.createElement('div');
    modal.className = 'favorites-modal active';
    modal.innerHTML = `
      <div class="modal-overlay" data-close></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>Favorite Tools</h2>
          <button class="modal-close" data-close>×</button>
        </div>
        <div class="modal-body">
          <div class="favorites-list">
            ${favorites.map(fav => {
              const link = document.querySelector(`.nav-link[href="#${fav}"]`);
              const name = link?.textContent || fav;
              return `
                <a href="#${fav}" class="favorite-item">
                  <span class="favorite-icon">⭐</span>
                  <span>${name}</span>
                </a>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close handlers
    modal.querySelectorAll('[data-close]').forEach(el => {
      el.addEventListener('click', () => {
        modal.remove();
      });
    });
    
    modal.querySelectorAll('.favorite-item').forEach(item => {
      item.addEventListener('click', () => {
        modal.remove();
      });
    });
  }
  
  updateFavoriteIndicator() {
    const currentHash = window.location.hash.slice(1);
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const isFavorite = favorites.includes(currentHash);
    
    // Update visual indicator (if you have one in the UI)
    const indicator = document.querySelector('.favorite-indicator');
    if (indicator) {
      indicator.classList.toggle('active', isFavorite);
    }
  }
  
  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'keyboard-notification';
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

// Add styles for shortcuts modal and notifications
const style = document.createElement('style');
style.textContent = `
  .keyboard-shortcuts-modal,
  .favorites-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    display: none;
  }
  
  .keyboard-shortcuts-modal.active,
  .favorites-modal.active {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
  }
  
  .modal-content {
    position: relative;
    background: var(--color-bg);
    border-radius: 8px;
    max-width: 600px;
    max-height: 80vh;
    overflow: auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  }
  
  .modal-header {
    padding: 20px;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
  }
  
  .modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--color-text-secondary);
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-footer {
    padding: 15px 20px;
    border-top: 1px solid var(--color-border);
    text-align: center;
    color: var(--color-text-secondary);
  }
  
  .shortcuts-grid {
    display: grid;
    gap: 30px;
  }
  
  .shortcuts-category h3 {
    margin: 0 0 15px 0;
    color: var(--color-primary);
    font-size: 1.1rem;
  }
  
  .shortcut-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--color-border-light);
  }
  
  .shortcut-item kbd {
    background: var(--color-bg-secondary);
    padding: 4px 8px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.9rem;
    border: 1px solid var(--color-border);
  }
  
  .favorites-list {
    display: grid;
    gap: 10px;
  }
  
  .favorite-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: var(--color-bg-secondary);
    border-radius: 4px;
    text-decoration: none;
    color: var(--color-text);
    transition: background-color 150ms;
  }
  
  .favorite-item:hover {
    background: var(--color-bg-tertiary);
  }
  
  .keyboard-notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--color-bg-secondary);
    color: var(--color-text);
    padding: 12px 20px;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(100px);
    opacity: 0;
    transition: all 300ms;
    z-index: 10001;
  }
  
  .keyboard-notification.show {
    transform: translateY(0);
    opacity: 1;
  }
`;
document.head.appendChild(style);