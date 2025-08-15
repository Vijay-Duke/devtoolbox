// Settings Manager - Import/Export application settings
export class SettingsManager {
  constructor() {
    this.settings = this.loadSettings();
    this.init();
  }
  
  init() {
    this.createSettingsButton();
    this.createSettingsModal();
    this.attachListeners();
    this.applySettings();
  }
  
  getDefaultSettings() {
    return {
      theme: 'light',
      autoProcess: true,
      debounceDelay: 300,
      maxHistoryItems: 50,
      enableShortcuts: true,
      enableAutoSave: true,
      enableShareableLinks: true,
      defaultFormattingOptions: {
        jsonIndent: 2,
        sqlUppercase: true,
        xmlIndent: 2,
        csvDelimiter: ','
      },
      favorites: [],
      toolUsage: {},
      customShortcuts: {},
      searchAliases: {}
    };
  }
  
  loadSettings() {
    try {
      const saved = localStorage.getItem('devtoolbox-settings');
      if (saved) {
        const settings = JSON.parse(saved);
        return { ...this.getDefaultSettings(), ...settings };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return this.getDefaultSettings();
  }
  
  saveSettings() {
    try {
      localStorage.setItem('devtoolbox-settings', JSON.stringify(this.settings));
      this.applySettings();
      return true;
    } catch (e) {
      console.error('Failed to save settings:', e);
      return false;
    }
  }
  
  applySettings() {
    // Apply theme
    const html = document.documentElement;
    
    // Handle theme setting including 'auto' mode
    let effectiveTheme = this.settings.theme;
    if (effectiveTheme === 'auto') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    // Set data-theme attribute
    html.setAttribute('data-theme', effectiveTheme);
    
    // Toggle dark class for Tailwind CSS
    if (effectiveTheme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    
    // Apply other settings
    if (window.shortcuts) {
      window.shortcuts.enabled = this.settings.enableShortcuts;
    }
    
    if (window.historyPersistence) {
      window.historyPersistence.autoSave = this.settings.enableAutoSave;
      window.historyPersistence.maxHistoryItems = this.settings.maxHistoryItems;
    }
    
    // Apply favorites
    if (this.settings.favorites && this.settings.favorites.length > 0) {
      localStorage.setItem('favorites', JSON.stringify(this.settings.favorites));
    }
    
    // Apply tool usage
    if (this.settings.toolUsage && Object.keys(this.settings.toolUsage).length > 0) {
      localStorage.setItem('toolUsage', JSON.stringify(this.settings.toolUsage));
    }
  }
  
  createSettingsButton() {
    const button = document.createElement('button');
    button.className = 'settings-button';
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M20.46 20.46l-4.24-4.24M4.24 20.46l-4.24-4.24M21 12h-6m-6 0H3"/>
      </svg>
    `;
    button.title = 'Settings';
    
    // Add to header
    const header = document.querySelector('.header');
    if (header) {
      const themeToggle = header.querySelector('.theme-toggle');
      if (themeToggle) {
        header.insertBefore(button, themeToggle);
      } else {
        header.appendChild(button);
      }
    }
    
    button.addEventListener('click', () => this.showSettings());
    this.settingsButton = button;
  }
  
  createSettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    modal.innerHTML = `
      <div class="modal-overlay" data-close></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>Settings</h2>
          <button class="modal-close" data-close>×</button>
        </div>
        <div class="modal-body">
          <div class="settings-tabs">
            <button class="tab-button active" data-tab="general">General</button>
            <button class="tab-button" data-tab="formatting">Formatting</button>
            <button class="tab-button" data-tab="shortcuts">Shortcuts</button>
            <button class="tab-button" data-tab="import-export">Import/Export</button>
          </div>
          
          <div class="settings-tab-content">
            <div class="tab-panel active" data-panel="general">
              <h3>General Settings</h3>
              
              <div class="setting-group">
                <label for="setting-theme">Theme</label>
                <select id="setting-theme" class="select-input">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>
              
              <div class="setting-group">
                <label class="checkbox-label">
                  <input type="checkbox" id="setting-auto-process">
                  <span>Auto-process on input</span>
                </label>
              </div>
              
              <div class="setting-group">
                <label for="setting-debounce">Debounce delay (ms)</label>
                <input type="number" id="setting-debounce" class="input-field" min="100" max="2000" step="100">
              </div>
              
              <div class="setting-group">
                <label for="setting-history-items">Max history items per tool</label>
                <input type="number" id="setting-history-items" class="input-field" min="10" max="100" step="10">
              </div>
              
              <div class="setting-group">
                <label class="checkbox-label">
                  <input type="checkbox" id="setting-shortcuts">
                  <span>Enable keyboard shortcuts</span>
                </label>
              </div>
              
              <div class="setting-group">
                <label class="checkbox-label">
                  <input type="checkbox" id="setting-auto-save">
                  <span>Enable auto-save history</span>
                </label>
              </div>
              
              
              <div class="setting-group">
                <label class="checkbox-label">
                  <input type="checkbox" id="setting-shareable-links">
                  <span>Enable shareable links</span>
                </label>
              </div>
            </div>
            
            <div class="tab-panel" data-panel="formatting">
              <h3>Formatting Defaults</h3>
              
              <div class="setting-group">
                <label for="setting-json-indent">JSON indent spaces</label>
                <input type="number" id="setting-json-indent" class="input-field" min="0" max="8" step="1">
              </div>
              
              <div class="setting-group">
                <label class="checkbox-label">
                  <input type="checkbox" id="setting-sql-uppercase">
                  <span>SQL keywords uppercase</span>
                </label>
              </div>
              
              <div class="setting-group">
                <label for="setting-xml-indent">XML indent spaces</label>
                <input type="number" id="setting-xml-indent" class="input-field" min="0" max="8" step="1">
              </div>
              
              <div class="setting-group">
                <label for="setting-csv-delimiter">CSV delimiter</label>
                <select id="setting-csv-delimiter" class="select-input">
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="\\t">Tab</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
            </div>
            
            <div class="tab-panel" data-panel="shortcuts">
              <h3>Custom Shortcuts</h3>
              <p class="settings-hint">Click on a shortcut to customize it</p>
              
              <div class="shortcuts-list" id="shortcuts-list"></div>
              
              <button class="btn btn-secondary" data-action="reset-shortcuts">Reset to Defaults</button>
            </div>
            
            <div class="tab-panel" data-panel="import-export">
              <h3>Import/Export Settings</h3>
              
              <div class="import-export-section">
                <h4>Export Settings</h4>
                <p>Download all your settings, favorites, and history as a JSON file.</p>
                <button class="btn btn-primary" data-action="export-all">Export All Settings</button>
                <button class="btn btn-secondary" data-action="export-settings">Export Settings Only</button>
                <button class="btn btn-secondary" data-action="export-favorites">Export Favorites Only</button>
              </div>
              
              <div class="import-export-section">
                <h4>Import Settings</h4>
                <p>Import settings from a previously exported JSON file.</p>
                <input type="file" id="import-file" accept=".json" hidden>
                <button class="btn btn-primary" data-action="import">Choose File to Import</button>
                
                <div class="import-options">
                  <label class="checkbox-label">
                    <input type="checkbox" id="import-merge" checked>
                    <span>Merge with existing settings</span>
                  </label>
                </div>
              </div>
              
              <div class="import-export-section">
                <h4>Reset</h4>
                <p>Reset all settings to their default values.</p>
                <button class="btn btn-danger" data-action="reset-all">Reset All Settings</button>
              </div>
              
              <div class="backup-info">
                <p class="info-text">
                  <strong>Tip:</strong> Settings are automatically saved locally. 
                  Export regularly to backup your configuration.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-primary" data-action="save">Save Settings</button>
          <button class="btn btn-secondary" data-close>Cancel</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.modal = modal;
  }
  
  attachListeners() {
    if (!this.modal) return;
    
    // Close handlers
    this.modal.querySelectorAll('[data-close]').forEach(el => {
      el.addEventListener('click', () => this.hideSettings());
    });
    
    // Tab switching
    this.modal.querySelectorAll('.tab-button').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });
    
    // Save button
    this.modal.querySelector('[data-action="save"]').addEventListener('click', () => {
      this.saveFromModal();
    });
    
    // Export actions
    this.modal.querySelector('[data-action="export-all"]').addEventListener('click', () => {
      this.exportAll();
    });
    
    this.modal.querySelector('[data-action="export-settings"]').addEventListener('click', () => {
      this.exportSettings();
    });
    
    this.modal.querySelector('[data-action="export-favorites"]').addEventListener('click', () => {
      this.exportFavorites();
    });
    
    // Import action
    const importFile = this.modal.querySelector('#import-file');
    this.modal.querySelector('[data-action="import"]').addEventListener('click', () => {
      importFile.click();
    });
    
    importFile.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.importSettings(e.target.files[0]);
      }
    });
    
    // Reset actions
    this.modal.querySelector('[data-action="reset-all"]').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
        this.resetAll();
      }
    });
    
    this.modal.querySelector('[data-action="reset-shortcuts"]').addEventListener('click', () => {
      this.resetShortcuts();
    });
  }
  
  showSettings() {
    if (!this.modal) {
      this.createSettingsModal();
      this.attachListeners();
    }
    
    // Load current settings into modal
    this.loadSettingsIntoModal();
    
    // Show modal
    this.modal.classList.add('active');
  }
  
  hideSettings() {
    if (this.modal) {
      this.modal.classList.remove('active');
    }
  }
  
  loadSettingsIntoModal() {
    // General settings
    this.modal.querySelector('#setting-theme').value = this.settings.theme;
    this.modal.querySelector('#setting-auto-process').checked = this.settings.autoProcess;
    this.modal.querySelector('#setting-debounce').value = this.settings.debounceDelay;
    this.modal.querySelector('#setting-history-items').value = this.settings.maxHistoryItems;
    this.modal.querySelector('#setting-shortcuts').checked = this.settings.enableShortcuts;
    this.modal.querySelector('#setting-auto-save').checked = this.settings.enableAutoSave;
    this.modal.querySelector('#setting-shareable-links').checked = this.settings.enableShareableLinks;
    
    // Formatting settings
    this.modal.querySelector('#setting-json-indent').value = this.settings.defaultFormattingOptions.jsonIndent;
    this.modal.querySelector('#setting-sql-uppercase').checked = this.settings.defaultFormattingOptions.sqlUppercase;
    this.modal.querySelector('#setting-xml-indent').value = this.settings.defaultFormattingOptions.xmlIndent;
    this.modal.querySelector('#setting-csv-delimiter').value = this.settings.defaultFormattingOptions.csvDelimiter;
    
    // Load shortcuts
    this.loadShortcutsList();
  }
  
  loadShortcutsList() {
    const list = this.modal.querySelector('#shortcuts-list');
    
    // Get default shortcuts from KeyboardShortcuts
    const defaultShortcuts = [
      { key: '/', description: 'Focus search' },
      { key: 'Escape', description: 'Clear search / Close modals' },
      { key: 't', description: 'Toggle theme' },
      { key: '?', description: 'Show help' },
      { key: 'h', description: 'Go home' },
      { key: 'Ctrl+K', description: 'Quick tool search' },
      { key: 'Ctrl+D', description: 'Add to favorites' },
      { key: 'Ctrl+B', description: 'Show favorites' }
    ];
    
    list.innerHTML = defaultShortcuts.map(shortcut => `
      <div class="shortcut-item">
        <kbd>${shortcut.key}</kbd>
        <span>${shortcut.description}</span>
      </div>
    `).join('');
  }
  
  saveFromModal() {
    // Collect settings from modal
    this.settings.theme = this.modal.querySelector('#setting-theme').value;
    this.settings.autoProcess = this.modal.querySelector('#setting-auto-process').checked;
    this.settings.debounceDelay = parseInt(this.modal.querySelector('#setting-debounce').value);
    this.settings.maxHistoryItems = parseInt(this.modal.querySelector('#setting-history-items').value);
    this.settings.enableShortcuts = this.modal.querySelector('#setting-shortcuts').checked;
    this.settings.enableAutoSave = this.modal.querySelector('#setting-auto-save').checked;
    this.settings.enableShareableLinks = this.modal.querySelector('#setting-shareable-links').checked;
    
    this.settings.defaultFormattingOptions.jsonIndent = parseInt(this.modal.querySelector('#setting-json-indent').value);
    this.settings.defaultFormattingOptions.sqlUppercase = this.modal.querySelector('#setting-sql-uppercase').checked;
    this.settings.defaultFormattingOptions.xmlIndent = parseInt(this.modal.querySelector('#setting-xml-indent').value);
    this.settings.defaultFormattingOptions.csvDelimiter = this.modal.querySelector('#setting-csv-delimiter').value;
    
    // Save and apply
    if (this.saveSettings()) {
      this.showNotification('Settings saved successfully');
      this.hideSettings();
    } else {
      this.showNotification('Failed to save settings', 'error');
    }
  }
  
  switchTab(tabName) {
    // Update buttons
    this.modal.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update panels
    this.modal.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.dataset.panel === tabName);
    });
  }
  
  exportAll() {
    const data = {
      version: '1.0',
      exported: new Date().toISOString(),
      settings: this.settings,
      history: this.getHistory(),
      favorites: this.getFavorites()
    };
    
    this.downloadJSON(data, 'devtoolbox-complete-backup');
  }
  
  exportSettings() {
    const data = {
      version: '1.0',
      exported: new Date().toISOString(),
      settings: this.settings
    };
    
    this.downloadJSON(data, 'devtoolbox-settings');
  }
  
  exportFavorites() {
    const data = {
      version: '1.0',
      exported: new Date().toISOString(),
      favorites: this.getFavorites()
    };
    
    this.downloadJSON(data, 'devtoolbox-favorites');
  }
  
  downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  async importSettings(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const merge = this.modal.querySelector('#import-merge').checked;
      
      if (data.settings) {
        if (merge) {
          this.settings = { ...this.settings, ...data.settings };
        } else {
          this.settings = data.settings;
        }
      }
      
      if (data.history) {
        localStorage.setItem('devtoolbox-history', JSON.stringify(data.history));
      }
      
      if (data.favorites) {
        localStorage.setItem('favorites', JSON.stringify(data.favorites));
      }
      
      this.saveSettings();
      this.loadSettingsIntoModal();
      this.showNotification('Settings imported successfully');
    } catch (e) {
      console.error('Failed to import settings:', e);
      this.showNotification('Failed to import settings', 'error');
    }
  }
  
  resetAll() {
    this.settings = this.getDefaultSettings();
    this.saveSettings();
    this.loadSettingsIntoModal();
    this.showNotification('Settings reset to defaults');
  }
  
  resetShortcuts() {
    this.settings.customShortcuts = {};
    this.saveSettings();
    this.loadShortcutsList();
    this.showNotification('Shortcuts reset to defaults');
  }
  
  getHistory() {
    try {
      const saved = localStorage.getItem('devtoolbox-history');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }
  
  getFavorites() {
    try {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
  
  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `settings-notification ${type}`;
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
}

// Add styles
const style = document.createElement('style');
style.textContent = `
  .settings-button {
    background: none;
    border: none;
    color: var(--color-text);
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 150ms;
  }
  
  .settings-button:hover {
    opacity: 0.7;
  }
  
  .settings-modal {
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
  
  .settings-modal.active {
    display: flex;
  }
  
  .settings-modal .modal-content {
    max-width: 700px;
    max-height: 80vh;
    overflow: auto;
  }
  
  .settings-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--color-border);
  }
  
  .tab-button {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    padding: 10px 15px;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 150ms;
  }
  
  .tab-button:hover {
    color: var(--color-text);
  }
  
  .tab-button.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
  }
  
  .tab-panel {
    display: none;
  }
  
  .tab-panel.active {
    display: block;
  }
  
  .setting-group {
    margin-bottom: 20px;
  }
  
  .setting-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  .settings-hint {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    margin-bottom: 15px;
  }
  
  .shortcuts-list {
    margin-bottom: 20px;
  }
  
  .import-export-section {
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--color-border);
  }
  
  .import-export-section h4 {
    margin: 0 0 10px 0;
  }
  
  .import-options {
    margin-top: 15px;
  }
  
  .backup-info {
    margin-top: 20px;
    padding: 15px;
    background: var(--color-bg-secondary);
    border-radius: 4px;
  }
  
  .info-text {
    margin: 0;
    font-size: 0.9rem;
  }
  
  .btn-danger {
    background: #dc3545;
    color: white;
  }
  
  .btn-danger:hover {
    background: #c82333;
  }
  
  .settings-notification {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    padding: 12px 20px;
    border-radius: 4px;
    opacity: 0;
    transition: all 300ms;
    z-index: 10001;
  }
  
  .settings-notification.success {
    background: var(--color-success);
    color: white;
  }
  
  .settings-notification.error {
    background: #dc3545;
    color: white;
  }
  
  .settings-notification.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
`;
document.head.appendChild(style);