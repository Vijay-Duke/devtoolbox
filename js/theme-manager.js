// Centralized Theme Management
export class ThemeManager {
  constructor() {
    this.html = document.documentElement;
    this.currentTheme = null;
    this.listeners = [];
    
    // Initialize theme immediately
    this.init();
  }
  
  init() {
    // Apply initial theme
    const initialTheme = this.getInitialTheme();
    this.applyTheme(initialTheme, false);
  }
  
  getInitialTheme() {
    // Try to load saved theme
    const settings = this.getSettings();
    
    if (settings.theme === 'auto') {
      // Detect system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    }
    
    // Use saved theme or default to light
    return settings.theme || 'light';
  }
  
  getSettings() {
    try {
      const saved = localStorage.getItem('devtoolbox-settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load theme settings:', e);
    }
    
    // Default settings
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
  
  applyTheme(theme, save = true) {
    let effectiveTheme = theme;
    
    // Handle 'auto' theme
    if (theme === 'auto') {
      effectiveTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    // Update HTML class and data attribute
    this.html.setAttribute('data-theme', effectiveTheme);
    
    // Update theme buttons if they exist
    this.updateThemeButtons(effectiveTheme);
    
    // Store current theme
    this.currentTheme = effectiveTheme;
    
    // Save theme to settings if requested
    if (save) {
      this.saveTheme(theme);
    }
    
    // Notify listeners
    this.notifyListeners(effectiveTheme, theme);
  }
  
  saveTheme(theme) {
    try {
      // Load existing settings
      let settings = this.getSettings();
      settings.theme = theme;
      
      // Save back to localStorage
      localStorage.setItem('devtoolbox-settings', JSON.stringify(settings));
      
      // Sync with settings manager if it exists
      if (window.settingsManager) {
        window.settingsManager.settings.theme = theme;
      }
    } catch (e) {
      console.warn('Failed to save theme:', e);
    }
  }
  
  updateThemeButtons(effectiveTheme) {
    // Update theme button states
    const lightButton = document.querySelector('button[data-theme="light"]');
    const darkButton = document.querySelector('button[data-theme="dark"]');
    
    if (lightButton) {
      lightButton.classList.toggle('active', effectiveTheme === 'light');
    }
    
    if (darkButton) {
      darkButton.classList.toggle('active', effectiveTheme === 'dark');
    }
  }
  
  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    return newTheme;
  }
  
  getCurrentTheme() {
    return this.currentTheme;
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