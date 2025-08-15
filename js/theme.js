(function() {
  // Get stored theme preference (can be 'light', 'dark', or 'system')
  const storedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Determine which theme to apply
  let shouldUseDark = false;
  
  if (storedTheme === 'dark') {
    // User explicitly chose dark
    shouldUseDark = true;
  } else if (storedTheme === 'light') {
    // User explicitly chose light
    shouldUseDark = false;
  } else {
    // No preference stored or 'system' - use system preference
    shouldUseDark = systemPrefersDark;
    // Don't store anything - keep following system
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
  if (!storedTheme || storedTheme === 'system') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme') || localStorage.getItem('theme') === 'system') {
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
})();