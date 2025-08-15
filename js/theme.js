(function() {
  // Get stored theme preference (can be 'light' or 'dark')
  const storedTheme = localStorage.getItem('theme');
  
  // Default to dark theme
  let shouldUseDark = true;
  
  if (storedTheme === 'light') {
    // User explicitly chose light
    shouldUseDark = false;
  } else {
    // Default to dark (including when storedTheme is null or 'dark')
    shouldUseDark = true;
    // Store dark as default if nothing was stored
    if (!storedTheme) {
      localStorage.setItem('theme', 'dark');
    }
  }
  
  // Apply the theme
  if (shouldUseDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();