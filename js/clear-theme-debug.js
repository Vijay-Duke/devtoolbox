// Debug script to test theme system
console.log('=== Theme Debug Info ===');
console.log('Current localStorage theme:', localStorage.getItem('theme'));
console.log('System prefers dark:', window.matchMedia('(prefers-color-scheme: dark)').matches);
console.log('Document has dark class:', document.documentElement.classList.contains('dark'));
console.log('Document data-theme:', document.documentElement.getAttribute('data-theme'));

// Clear theme to test system default
if (confirm('Clear theme preference to test system default?')) {
  localStorage.removeItem('theme');
  console.log('Theme cleared - reloading...');
  location.reload();
}