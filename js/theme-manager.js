// Centralized Theme Management - Dark Theme Only
export class ThemeManager {
  constructor() {
    this.html = document.documentElement;
    this.currentTheme = 'dark'; // Always dark
    this.listeners = [];
    
    // Initialize theme immediately
    this.init();
  }
  
  init() {
    // Always apply dark theme
    this.applyTheme('dark', false);
  }
  
  getInitialTheme() {
    // Always return dark theme
    return 'dark';
  }
  
  getSettings() {
    try {
      const saved = localStorage.getItem('devtoolbox-settings');
      if (saved) {
        const settings = JSON.parse(saved);
        // Force dark theme
        settings.theme = 'dark';
        return settings;
      }
    } catch (e) {
      console.warn('Failed to load theme settings:', e);
    }
    
    // Default settings with dark theme
    return {
      theme: 'dark', // Always dark
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
  
  applyTheme(theme, save = true) {
    // Always force dark theme
    const effectiveTheme = 'dark';
    
    // Update HTML class and data attribute
    this.html.classList.add('dark');
    this.html.setAttribute('data-theme', 'dark');
    
    // Store current theme
    this.currentTheme = 'dark';
    
    // Notify listeners
    this.notifyListeners('dark', 'dark');
  }
  
  saveTheme(theme) {
    // No-op - theme is always dark
  }
  
  updateThemeButtons(effectiveTheme) {
    // No-op - no theme buttons to update
  }
  
  toggleTheme() {
    // No-op - always dark theme
    return 'dark';
  }
  
  getCurrentTheme() {
    return 'dark'; // Always dark
  }
  
  addListener(callback) {
    this.listeners.push(callback);
  }
  
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }
  
  notifyListeners(effectiveTheme, originalTheme) {
    this.listeners.forEach(callback => {
      try {
        callback(effectiveTheme, originalTheme);
      } catch (e) {
        console.warn('Theme listener error:', e);
      }
    });
  }
}

// Create global theme manager instance
window.themeManager = new ThemeManager();

// Expose global function for backwards compatibility
window.applyTheme = (theme) => {
  window.themeManager.applyTheme(theme);
};