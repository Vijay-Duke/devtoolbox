(function() {
  // Get stored theme preference (can be 'light', 'dark', or null for system)
  let storedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Migration: if old 'system' value exists, remove it
  if (storedTheme === 'system') {
    localStorage.removeItem('theme');
    storedTheme = null;
  }
  
  // Determine which theme to apply
  let shouldUseDark = false;
  
  if (storedTheme === 'dark') {
    // User explicitly chose dark
    shouldUseDark = true;
  } else if (storedTheme === 'light') {
    // User explicitly chose light
    shouldUseDark = false;
  } else {
    // No preference stored - use system preference
    shouldUseDark = systemPrefersDark;
  }
  
  // Apply the theme
  if (shouldUseDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  }
  
  // Listen for system theme changes when in auto mode
  if (!storedTheme) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Re-check to make sure we're still in auto mode
      if (!localStorage.getItem('theme')) {
        if (e.matches) {
          document.documentElement.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.setAttribute('data-theme', 'light');
        }
      }
    });
  }
  
  // Debug info
  console.log('Theme initialized:', {
    stored: storedTheme,
    systemPrefersDark: systemPrefersDark,
    appliedDark: shouldUseDark
  });
})();