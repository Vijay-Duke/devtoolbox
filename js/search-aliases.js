// Search Aliases - Custom shortcuts for quick tool access
export class SearchAliases {
  constructor() {
    this.aliases = this.loadAliases();
    this.init();
  }
  
  init() {
    this.setupDefaultAliases();
    this.interceptSearch();
  }
  
  setupDefaultAliases() {
    const defaults = {
      'j': 'json-formatter',
      'jwt': 'jwt-decoder',
      'b64': 'base64',
      'url': 'url-encode',
      'uuid': 'uuid',
      'time': 'unix-time',
      'regex': 'regex-tester',
      'cron': 'cron',
      'diff': 'diff',
      'color': 'color',
      'csv': 'csv-json',
      'yaml': 'yaml-json',
      'hash': 'hash',
      'md': 'markdown',
      'curl': 'curl',
      'api': 'api-mock',
      'dns': 'dns-lookup',
      'gql': 'graphql',
      'fake': 'fake-data',
      'sql': 'sql-formatter',
      'xml': 'xml-formatter',
      'pass': 'password-generator',
      'pwd': 'password-generator',
      'bin': 'binary-converter',
      'qr': 'qr-generator',
      'ascii': 'ascii-art',
      'img': 'image-converter',
      'webhook': 'webhook-tester',
      'wh': 'webhook-tester',
      
      // Action aliases
      'encode': 'base64',
      'decode': 'base64',
      'format': 'json-formatter',
      'validate': 'json-formatter',
      'convert': 'csv-json',
      'generate': 'uuid',
      'parse': 'cron',
      'compare': 'diff',
      'test': 'regex-tester',
      'mock': 'api-mock',
      'lookup': 'dns-lookup'
    };
    
    // Merge with user aliases
    this.aliases = { ...defaults, ...this.aliases };
  }
  
  loadAliases() {
    try {
      const saved = localStorage.getItem('search-aliases');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }
  
  saveAliases() {
    try {
      // Only save custom aliases (not defaults)
      const customAliases = {};
      const defaults = this.getDefaultAliases();
      
      Object.entries(this.aliases).forEach(([alias, tool]) => {
        if (defaults[alias] !== tool) {
          customAliases[alias] = tool;
        }
      });
      
      localStorage.setItem('search-aliases', JSON.stringify(customAliases));
    } catch (e) {
      console.error('Failed to save aliases:', e);
    }
  }
  
  getDefaultAliases() {
    // Return just the defaults for comparison
    return {
      'j': 'json-formatter',
      'jwt': 'jwt-decoder',
      'b64': 'base64',
      'url': 'url-encode',
      'uuid': 'uuid',
      'time': 'unix-time',
      'regex': 'regex-tester',
      'cron': 'cron',
      'diff': 'diff',
      'color': 'color',
      'csv': 'csv-json',
      'yaml': 'yaml-json',
      'hash': 'hash',
      'md': 'markdown',
      'curl': 'curl',
      'api': 'api-mock',
      'dns': 'dns-lookup',
      'gql': 'graphql',
      'fake': 'fake-data',
      'sql': 'sql-formatter',
      'xml': 'xml-formatter',
      'pass': 'password-generator',
      'pwd': 'password-generator',
      'bin': 'binary-converter',
      'qr': 'qr-generator',
      'ascii': 'ascii-art',
      'img': 'image-converter',
      'webhook': 'webhook-tester',
      'wh': 'webhook-tester'
    };
  }
  
  interceptSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;
    
    // Add command detection
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const value = searchInput.value.trim();
        
        // Check for direct alias
        if (this.aliases[value.toLowerCase()]) {
          e.preventDefault();
          this.navigateToTool(this.aliases[value.toLowerCase()]);
          searchInput.value = '';
          searchInput.blur();
          return;
        }
        
        // Check for command syntax (: prefix)
        if (value.startsWith(':')) {
          e.preventDefault();
          this.handleCommand(value.substring(1));
          searchInput.value = '';
          searchInput.blur();
          return;
        }
        
        // Check for go-to syntax (> prefix)
        if (value.startsWith('>')) {
          e.preventDefault();
          const alias = value.substring(1).trim();
          if (this.aliases[alias.toLowerCase()]) {
            this.navigateToTool(this.aliases[alias.toLowerCase()]);
          }
          searchInput.value = '';
          searchInput.blur();

        }
      }
    });
    
    // Show alias hints
    let originalPlaceholder = searchInput.placeholder;
    searchInput.addEventListener('focus', () => {
      searchInput.placeholder = 'Search tools or use alias (e.g., j for JSON, b64 for Base64)';
    });
    
    searchInput.addEventListener('blur', () => {
      searchInput.placeholder = originalPlaceholder;
    });
  }
  
  handleCommand(command) {
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');
    
    switch(cmd) {
      case 'alias':
        this.handleAliasCommand(args);
        break;
        
      case 'list':
      case 'aliases':
        this.showAliasesList();
        break;
        
      case 'help':
      case '?':
        this.showHelp();
        break;
        
      case 'clear':
        this.clearSearchHistory();
        break;
        
      case 'reset':
        this.resetAliases();
        break;
        
      default:
        // Try as alias
        if (this.aliases[cmd]) {
          this.navigateToTool(this.aliases[cmd]);
        } else {
          this.showNotification(`Unknown command: ${cmd}`);
        }
    }
  }
  
  handleAliasCommand(args) {
    if (!args) {
      this.showAliasesList();
      return;
    }
    
    const [alias, ...toolParts] = args.split(' ');
    const tool = toolParts.join(' ');
    
    if (!tool) {
      // Show current alias
      if (this.aliases[alias]) {
        this.showNotification(`Alias "${alias}" → ${this.aliases[alias]}`);
      } else {
        this.showNotification(`No alias found for "${alias}"`);
      }
    } else {
      // Set new alias
      this.addAlias(alias, tool);
    }
  }
  
  addAlias(alias, tool) {
    // Validate tool exists
    const validTools = [
      'json-formatter', 'jwt-decoder', 'base64', 'url-encode', 'uuid',
      'unix-time', 'regex-tester', 'cron', 'diff', 'color',
      'csv-json', 'yaml-json', 'hash', 'markdown', 'curl',
      'api-mock', 'dns-lookup', 'graphql', 'fake-data',
      'sql-formatter', 'xml-formatter', 'password-generator',
      'binary-converter', 'qr-generator', 'ascii-art',
      'image-converter', 'webhook-tester'
    ];
    
    if (!validTools.includes(tool)) {
      this.showNotification(`Invalid tool: ${tool}`, 'error');
      return;
    }
    
    this.aliases[alias.toLowerCase()] = tool;
    this.saveAliases();
    this.showNotification(`Alias created: "${alias}" → ${tool}`);
  }

  resetAliases() {
    this.aliases = this.getDefaultAliases();
    localStorage.removeItem('search-aliases');
    this.showNotification('Aliases reset to defaults');
  }
  
  navigateToTool(tool) {
    window.location.hash = `#${tool}`;
  }
  
  showAliasesList() {
    const modal = document.createElement('div');
    modal.className = 'aliases-modal active';
    modal.innerHTML = `
      <div class="modal-overlay" data-close></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>Search Aliases</h2>
          <button class="modal-close" data-close>×</button>
        </div>
        <div class="modal-body">
          <p class="aliases-hint">Type these shortcuts in search to quickly navigate to tools</p>
          
          <div class="aliases-grid">
            ${Object.entries(this.aliases)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([alias, tool]) => `
                <div class="alias-item">
                  <kbd>${alias}</kbd>
                  <span>→</span>
                  <span>${this.formatToolName(tool)}</span>
                </div>
              `).join('')}
          </div>
          
          <div class="aliases-help">
            <h3>Commands</h3>
            <div class="command-list">
              <div class="command-item">
                <kbd>:alias name tool</kbd>
                <span>Create new alias</span>
              </div>
              <div class="command-item">
                <kbd>:list</kbd>
                <span>Show all aliases</span>
              </div>
              <div class="command-item">
                <kbd>:reset</kbd>
                <span>Reset to defaults</span>
              </div>
              <div class="command-item">
                <kbd>>alias</kbd>
                <span>Go to tool using alias</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelectorAll('[data-close]').forEach(el => {
      el.addEventListener('click', () => modal.remove());
    });
  }
  
  showHelp() {
    const modal = document.createElement('div');
    modal.className = 'help-modal active';
    modal.innerHTML = `
      <div class="modal-overlay" data-close></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>Search Help</h2>
          <button class="modal-close" data-close>×</button>
        </div>
        <div class="modal-body">
          <h3>Quick Navigation</h3>
          <p>Type an alias and press Enter to go directly to a tool:</p>
          <div class="help-examples">
            <code>j</code> → JSON Formatter<br>
            <code>b64</code> → Base64 Encode/Decode<br>
            <code>hash</code> → Hash Generator
          </div>
          
          <h3>Commands</h3>
          <p>Use <code>:</code> prefix for commands:</p>
          <div class="help-examples">
            <code>:alias pw password-generator</code> - Create alias "pw"<br>
            <code>:list</code> - Show all aliases<br>
            <code>:reset</code> - Reset to default aliases
          </div>
          
          <h3>Direct Navigation</h3>
          <p>Use <code>></code> prefix to go to tool:</p>
          <div class="help-examples">
            <code>>json</code> - Go to JSON Formatter<br>
            <code>>b64</code> - Go to Base64 tool
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelectorAll('[data-close]').forEach(el => {
      el.addEventListener('click', () => modal.remove());
    });
  }
  
  formatToolName(tool) {
    return tool.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
  
  clearSearchHistory() {
    // Clear search-related history
    const searchResults = document.querySelector('.search-results');
    if (searchResults) {
      searchResults.hidden = true;
    }
    
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.value = '';
    }
    
    this.showNotification('Search cleared');
  }
  
  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alias-notification ${type}`;
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
  .aliases-modal,
  .help-modal {
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
  
  .aliases-modal.active,
  .help-modal.active {
    display: flex;
  }
  
  .aliases-hint {
    color: var(--color-text-secondary);
    margin-bottom: 20px;
  }
  
  .aliases-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
    margin-bottom: 30px;
    max-height: 300px;
    overflow-y: auto;
  }
  
  .alias-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--color-bg-secondary);
    border-radius: 4px;
    font-size: 0.9rem;
  }
  
  .alias-item kbd {
    background: var(--color-bg-tertiary);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: monospace;
    font-weight: 600;
  }
  
  .aliases-help {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--color-border);
  }
  
  .command-list {
    margin-top: 15px;
  }
  
  .command-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--color-border-light);
  }
  
  .command-item kbd {
    background: var(--color-bg-secondary);
    padding: 4px 8px;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.9rem;
  }
  
  .help-examples {
    background: var(--color-bg-secondary);
    padding: 15px;
    border-radius: 4px;
    margin: 10px 0 20px;
    font-family: monospace;
    line-height: 1.6;
  }
  
  .help-examples code {
    background: var(--color-bg-tertiary);
    padding: 2px 4px;
    border-radius: 2px;
  }
  
  .alias-notification {
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
    border: 1px solid var(--color-border);
  }
  
  .alias-notification.error {
    background: #dc3545;
    color: white;
    border-color: #dc3545;
  }
  
  .alias-notification.show {
    transform: translateY(0);
    opacity: 1;
  }
`;
document.head.appendChild(style);