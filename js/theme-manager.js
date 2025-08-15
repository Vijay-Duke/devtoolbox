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
    // Determine initial theme from settings or system preference
    const initialTheme = this.getInitialTheme();
    this.applyTheme(initialTheme, false); // Don't save on init
    
    // Listen for system theme changes when in auto mode
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const settings = this.getSettings();
      if (settings.theme === 'auto') {
        const newTheme = e.matches ? 'dark' : 'light';
        this.applyTheme(newTheme, false); // Don't save system changes
      }
    });
  }
  
  getInitialTheme() {
    try {
      // Check settings manager first
      const settings = this.getSettings();
      if (settings.theme && settings.theme !== 'auto') {
        return settings.theme;
      }
      
      // Check legacy localStorage
      const legacyTheme = localStorage.getItem('theme');
      if (legacyTheme && legacyTheme !== 'auto') {
        return legacyTheme;
      }
      
      // Auto mode or no preference - use system
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      // Fallback to system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
  }
  
  getSettings() {
    try {
      const saved = localStorage.getItem('devtoolbox-settings');
      if (saved) {
        const settings = JSON.parse(saved);
        return settings;
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
    // Handle auto theme
    let effectiveTheme = theme;
    if (theme === 'auto') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    // Update HTML class and data attribute
    this.html.classList.remove('dark');
    if (effectiveTheme === 'dark') {
      this.html.classList.add('dark');
    }
    this.html.setAttribute('data-theme', effectiveTheme);
    
    // Update button states
    this.updateThemeButtons(effectiveTheme);
    
    // Store current theme
    this.currentTheme = effectiveTheme;
    
    // Save to both settings and legacy localStorage if requested
    if (save) {
      this.saveTheme(theme); // Save original theme (including 'auto')
    }
    
    // Notify listeners
    this.notifyListeners(effectiveTheme, theme);
  }
  
  saveTheme(theme) {
    // Update settings manager
    try {
      const settings = this.getSettings();
      settings.theme = theme;
      localStorage.setItem('devtoolbox-settings', JSON.stringify(settings));
      
      // Update settings manager instance if available
      if (window.settingsManager) {
        window.settingsManager.settings.theme = theme;
      }
    } catch (e) {
      console.warn('Failed to save theme to settings:', e);
    }
    
    // Update legacy localStorage for compatibility
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
  }
  
  updateThemeButtons(effectiveTheme) {
    // Update toggle buttons
    const lightButton = document.querySelector('button[data-theme="light"]');
    const darkButton = document.querySelector('button[data-theme="dark"]');
    
    if (lightButton && darkButton) {
      // Reset both buttons to inactive state
      const inactiveClasses = 'px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-md flex items-center gap-1';
      const activeClasses = 'px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 transition-colors rounded-md flex items-center gap-1';
      
      lightButton.className = effectiveTheme === 'light' ? activeClasses : inactiveClasses;
      darkButton.className = effectiveTheme === 'dark' ? activeClasses : inactiveClasses;
    }
  }
  
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
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