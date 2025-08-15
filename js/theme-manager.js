// Simple Theme Manager for consistency across tools
export class ThemeManager {
  constructor() {
    // Don't override the existing theme on initialization
    // Just observe for changes
    const observer = new MutationObserver(() => {
      this.notifyListeners();
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });
  }
  
  getCurrentTheme() {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
  
  setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('theme', theme);
  }
  
  toggleTheme() {
    const newTheme = this.getCurrentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    return newTheme;
  }
  
  // For compatibility with existing code
  applyTheme(theme) {
    this.setTheme(theme);
  }
  
  listeners = [];
  
  addListener(callback) {
    this.listeners.push(callback);
  }
  
  notifyListeners() {
    const currentTheme = this.getCurrentTheme();
    this.listeners.forEach(callback => {
      try {
        callback(currentTheme, currentTheme);
      } catch (e) {
        console.warn('Theme listener error:', e);
      }
    });
  }
}

// Create global instance for backward compatibility
window.themeManager = new ThemeManager();