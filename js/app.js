import { enableSwipeGestures } from './swipe.js';
import { searchTools, highlightMatch } from './fuzzy-search.js';
import { Router } from './router-lazy.js';
import { KeyboardShortcuts } from './keyboard-shortcuts.js';
import { ShareableLinks } from './shareable-links.js';
import { HistoryPersistence } from './history-persistence.js';
import { SettingsManager } from './settings-manager.js';
import { SearchAliases } from './search-aliases.js';

// Theme Management with System Default
const themeToggle = document.querySelector('[data-theme-toggle]');
const html = document.documentElement;

// Detect system preference
function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Apply theme
function applyTheme(theme) {
  if (theme === 'dark') {
    html.classList.add('dark');
    html.setAttribute('data-theme', 'dark');
  } else {
    html.classList.remove('dark');
    html.setAttribute('data-theme', 'light');
  }
}

// Initialize theme: use saved preference or fall back to system default
const savedTheme = localStorage.getItem('theme');
const initialTheme = savedTheme || getSystemTheme();
applyTheme(initialTheme);

// Only listen for system changes if no manual preference is saved
if (!savedTheme) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Only update if user hasn't manually set a preference
    if (!localStorage.getItem('theme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      applyTheme(newTheme);
    }
  });
}

// Manual theme toggle functionality
themeToggle?.addEventListener('click', () => {
  const isDark = html.classList.contains('dark');
  const newTheme = isDark ? 'light' : 'dark';
  
  applyTheme(newTheme);
  localStorage.setItem('theme', newTheme);
});

// Mobile Menu Toggle
const menuToggle = document.querySelector('[data-menu-toggle]');
const sidebar = document.querySelector('#sidebar');
const sidebarOverlay = document.querySelector('[data-sidebar-overlay]');

menuToggle?.addEventListener('click', () => {
  const isOpen = !sidebar.classList.contains('-translate-x-full');
  
  if (isOpen) {
    // Close sidebar
    sidebar.classList.add('-translate-x-full');
    sidebarOverlay.classList.add('hidden');
    menuToggle.setAttribute('aria-expanded', 'false');
  } else {
    // Open sidebar
    sidebar.classList.remove('-translate-x-full');
    sidebarOverlay.classList.remove('hidden');
    menuToggle.setAttribute('aria-expanded', 'true');
  }
});

sidebarOverlay?.addEventListener('click', () => {
  sidebar.classList.add('-translate-x-full');
  sidebarOverlay.classList.add('hidden');
  menuToggle.setAttribute('aria-expanded', 'false');
});

// Enable swipe gestures for mobile
if ('ontouchstart' in window) {
  enableSwipeGestures(sidebar, sidebarOverlay, menuToggle);
}

// Search Functionality
const searchInput = document.querySelector('input[type="search"]');
const searchClear = document.querySelector('.search-clear') || document.querySelector('button[aria-label="Clear search"]');
const searchResults = document.querySelector('#search-results');
const categoryFilter = document.querySelector('.category-filter');

// Enhanced tools data with keywords for better fuzzy matching
const tools = [
  { name: 'JSON Formatter', href: '#json-formatter', category: 'Text & Data', keywords: ['json', 'format', 'validate', 'pretty', 'beautify'] },
  { name: 'JWT Decoder', href: '#jwt-decoder', category: 'Text & Data', keywords: ['jwt', 'token', 'decode', 'verify', 'auth'] },
  { name: 'Base64 Encode/Decode', href: '#base64', category: 'Text & Data', keywords: ['base64', 'encode', 'decode', 'binary'] },
  { name: 'URL Encode/Decode', href: '#url-encode', category: 'Text & Data', keywords: ['url', 'uri', 'encode', 'decode', 'percent'] },
  { name: 'UUID Generator', href: '#uuid', category: 'Generators', keywords: ['uuid', 'guid', 'generate', 'random', 'unique'] },
  { name: 'Unix Time Converter', href: '#unix-time', category: 'Converters', keywords: ['unix', 'timestamp', 'epoch', 'time', 'date'] },
  { name: 'Regex Tester', href: '#regex-tester', category: 'Developer Tools', keywords: ['regex', 'regexp', 'pattern', 'match', 'test'] },
  { name: 'Cron Parser', href: '#cron', category: 'Developer Tools', keywords: ['cron', 'schedule', 'job', 'time', 'expression'] },
  { name: 'Diff Tool', href: '#diff', category: 'Text & Data', keywords: ['diff', 'compare', 'difference', 'merge', 'text'] },
  { name: 'CSV ↔ JSON Converter', href: '#csv-json', category: 'Converters', keywords: ['csv', 'json', 'convert', 'table', 'data', 'excel'] },
  { name: 'YAML ↔ JSON Converter', href: '#yaml-json', category: 'Converters', keywords: ['yaml', 'json', 'convert', 'config', 'configuration'] },
  { name: 'Hash Generator', href: '#hash', category: 'Generators', keywords: ['hash', 'md5', 'sha', 'sha256', 'sha512', 'crypto', 'checksum'] },
  { name: 'Markdown Preview', href: '#markdown', category: 'Text & Data', keywords: ['markdown', 'md', 'preview', 'render', 'github', 'gfm'] },
  { name: 'cURL Generator', href: '#curl', category: 'Developer Tools', keywords: ['curl', 'http', 'api', 'request', 'rest', 'command'] },
  { name: 'API Mock Generator', href: '#api-mock', category: 'Developer Tools', keywords: ['api', 'mock', 'server', 'express', 'json-server', 'postman', 'openapi'] },
  { name: 'DNS Lookup', href: '#dns-lookup', category: 'Networking & Cloud', keywords: ['dns', 'lookup', 'domain', 'nameserver', 'mx', 'txt', 'a', 'aaaa', 'cname'] },
  { name: 'GraphQL Tester', href: '#graphql', category: 'Developer Tools', keywords: ['graphql', 'query', 'mutation', 'introspection', 'api', 'test'] },
  { name: 'Fake Data Generator', href: '#fake-data', category: 'Generators', keywords: ['fake', 'data', 'mock', 'test', 'generator', 'random', 'person', 'address'] },
  { name: 'SQL Formatter', href: '#sql-formatter', category: 'Developer Tools', keywords: ['sql', 'format', 'query', 'database', 'beautify', 'minify', 'mysql', 'postgresql'] },
  { name: 'XML Formatter', href: '#xml-formatter', category: 'Text & Data', keywords: ['xml', 'format', 'validate', 'xpath', 'tree', 'beautify', 'minify'] },
  { name: 'Password Generator', href: '#password-generator', category: 'Generators', keywords: ['password', 'secure', 'random', 'passphrase', 'generator', 'strength'] },
  { name: 'Binary Converter', href: '#binary-converter', category: 'Converters', keywords: ['binary', 'decimal', 'hex', 'hexadecimal', 'octal', 'ascii', 'base64', 'converter'] },
  { name: 'QR Code Generator', href: '#qr-generator', category: 'Generators', keywords: ['qr', 'code', 'barcode', 'generator', 'wifi', 'vcard', 'contact'] },
  { name: 'ASCII Art Generator', href: '#ascii-art', category: 'Generators', keywords: ['ascii', 'art', 'text', 'banner', 'figlet', 'generator'] },
  { name: 'Image Converter', href: '#image-converter', category: 'Converters', keywords: ['image', 'convert', 'resize', 'compress', 'jpeg', 'png', 'webp', 'format'] },
  { name: 'Webhook Tester', href: '#webhook-tester', category: 'Developer Tools', keywords: ['webhook', 'test', 'debug', 'http', 'request', 'endpoint', 'api'] },
  { name: 'Temporary Email', href: '#temp-email', category: 'Developer Tools', keywords: ['email', 'temp', 'otp', 'disposable', 'inbox', 'testing', 'throwaway'] },
  // Networking & Cloud Tools
  { name: 'IP Address Lookup', href: '#ip-lookup', category: 'Networking & Cloud', keywords: ['ip', 'address', 'lookup', 'geolocation', 'geo', 'isp', 'location', 'ipv4', 'ipv6'] },
  { name: 'CIDR Calculator', href: '#cidr-calculator', category: 'Networking & Cloud', keywords: ['cidr', 'subnet', 'calculator', 'network', 'ip', 'mask', 'range', 'ipv4'] },
  { name: 'WHOIS Lookup', href: '#whois-lookup', category: 'Networking & Cloud', keywords: ['whois', 'domain', 'registration', 'owner', 'registrar', 'expiry'] },
  { name: 'S3 Pre-signed URL Generator', href: '#s3-presigned-url', category: 'Networking & Cloud', keywords: ['s3', 'aws', 'presigned', 'url', 'upload', 'download', 'bucket', 'amazon'] },
  { name: 'AWS IAM Policy Visualizer', href: '#iam-policy-visualizer', category: 'Networking & Cloud', keywords: ['iam', 'aws', 'policy', 'visualizer', 'permissions', 'security', 'access'] },
];

let searchDebounceTimer;
let selectedResultIndex = -1;

searchInput?.addEventListener('input', (e) => {
  clearTimeout(searchDebounceTimer);
  const query = e.target.value.trim();
  
  if (query) {
    searchClear.hidden = false;
    searchDebounceTimer = setTimeout(() => performSearch(query), 200);
  } else if (!categoryFilter?.value) {
    searchClear.hidden = true;
    searchResults.hidden = true;
    selectedResultIndex = -1;
  } else {
    searchClear.hidden = true;
    searchDebounceTimer = setTimeout(() => performSearch(''), 200);
  }
});

// Category filter change
categoryFilter?.addEventListener('change', () => {
  const query = searchInput.value.trim();
  if (query || categoryFilter?.value) {
    performSearch(query);
  } else {
    searchResults.hidden = true;
  }
});

searchClear?.addEventListener('click', () => {
  searchInput.value = '';
  searchClear.hidden = true;
  searchResults.hidden = true;
  searchInput.focus();
  selectedResultIndex = -1;
});

function performSearch(query) {
  let filtered = tools;
  
  // Apply category filter
  const category = categoryFilter?.value;
  if (category) {
    filtered = filtered.filter(tool => tool.category === category);
  }
  
  // Apply search query
  if (query) {
    // Smart abbreviation matching first
    const smartMatch = findSmartMatch(query, filtered);
    if (smartMatch) {
      window.location.hash = smartMatch.href;
      searchResults.hidden = true;
      searchInput.value = '';
      searchClear.hidden = true;
      return;
    }
    
    filtered = searchTools(query, filtered);
    
    // Auto-navigate if exactly one match
    if (filtered.length === 1) {
      window.location.hash = filtered[0].href;
      searchResults.hidden = true;
      searchInput.value = '';
      searchClear.hidden = true;
      return;
    }
  }
  
  if (filtered.length > 0) {
    displaySearchResults(filtered, query);
  } else {
    searchResults.innerHTML = '<div style="padding: 16px; color: var(--color-text-secondary);">No tools found</div>';
    searchResults.hidden = false;
  }
  selectedResultIndex = -1;
}

function findSmartMatch(query, toolsList) {
  const q = query.toLowerCase().trim();
  
  // Abbreviation patterns for quick access
  const abbreviations = {
    // JSON Tools
    'jf': 'JSON Formatter',
    'json': 'JSON Formatter', 
    'jd': 'JWT Decoder',
    'jwt': 'JWT Decoder',
    
    // Encoders/Decoders  
    'b64': 'Base64 Encode/Decode',
    'base64': 'Base64 Encode/Decode',
    'url': 'URL Encode/Decode',
    'uri': 'URL Encode/Decode',
    
    // Generators
    'uuid': 'UUID Generator',
    'guid': 'UUID Generator',
    'pg': 'Password Generator',
    'pass': 'Password Generator',
    'pw': 'Password Generator',
    'qr': 'QR Code Generator',
    'hash': 'Hash Generator',
    'ascii': 'ASCII Art Generator',
    'fake': 'Fake Data Generator',
    
    // Converters
    'unix': 'Unix Time Converter',
    'time': 'Unix Time Converter',
    'csv': 'CSV ↔ JSON Converter',
    'yaml': 'YAML ↔ JSON Converter',
    'yml': 'YAML ↔ JSON Converter',
    'binary': 'Binary Converter',
    'bin': 'Binary Converter',
    'img': 'Image Converter',
    'image': 'Image Converter',
    
    // Developer Tools
    'regex': 'Regex Tester',
    'regexp': 'Regex Tester',
    're': 'Regex Tester',
    'cron': 'Cron Parser',
    'diff': 'Diff Tool',
    'curl': 'cURL Generator',
    'graphql': 'GraphQL Tester',
    'gql': 'GraphQL Tester',
    'sql': 'SQL Formatter',
    'xml': 'XML Formatter',
    'webhook': 'Webhook Tester',
    'wh': 'Webhook Tester',
    'api': 'API Mock Generator',
    'mock': 'API Mock Generator',
    'email': 'Temporary Email',
    'temp': 'Temporary Email',
    'otp': 'Temporary Email',
    'inbox': 'Temporary Email',
    
    // Text & Data
    'md': 'Markdown Preview',
    'markdown': 'Markdown Preview',
    
    // Networking & Cloud
    'ip': 'IP Address Lookup',
    'dns': 'DNS Lookup',
    'cidr': 'CIDR Calculator',
    'subnet': 'CIDR Calculator',
    'whois': 'WHOIS Lookup',
    's3': 'S3 Pre-signed URL Generator',
    'aws': 'S3 Pre-signed URL Generator',
    'iam': 'AWS IAM Policy Visualizer',
    'policy': 'AWS IAM Policy Visualizer'
  };
  
  // Check for exact abbreviation match
  if (abbreviations[q]) {
    return toolsList.find(tool => tool.name === abbreviations[q]);
  }
  
  // Check for unique prefix match
  const prefixMatches = toolsList.filter(tool => 
    tool.name.toLowerCase().startsWith(q) ||
    tool.keywords.some(keyword => keyword.toLowerCase().startsWith(q))
  );
  
  if (prefixMatches.length === 1) {
    return prefixMatches[0];
  }
  
  // Fuzzy match - check if query letters appear in sequence within tool names
  const fuzzyMatches = toolsList.filter(tool => {
    return fuzzyMatch(q, tool.name.toLowerCase()) || 
           tool.keywords.some(keyword => fuzzyMatch(q, keyword.toLowerCase()));
  });
  
  // Return if exactly one fuzzy match with high confidence
  if (fuzzyMatches.length === 1) {
    return fuzzyMatches[0];
  }
  
  return null;
}

// Fuzzy matching function - checks if query letters appear in sequence
function fuzzyMatch(query, text) {
  if (query.length === 0) return false;
  if (query.length > text.length) return false;
  
  let queryIndex = 0;
  
  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (text[i] === query[queryIndex]) {
      queryIndex++;
    }
  }
  
  return queryIndex === query.length;
}

function displaySearchResults(results, query) {
  searchResults.innerHTML = results.map((tool, index) => `
    <a href="${tool.href}" 
       class="search-result-item" 
       data-index="${index}"
       style="display: block; padding: 12px 16px; color: var(--color-text); transition: background-color 150ms; outline: none;">
      <div style="font-weight: 500;">${highlightMatch(tool.name, query)}</div>
      <div style="font-size: 0.875rem; color: var(--color-text-secondary);">${tool.category}</div>
    </a>
  `).join('');
  searchResults.hidden = false;
  
  // Add hover and focus effects
  const resultItems = searchResults.querySelectorAll('.search-result-item');
  resultItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      clearSelectedResult();
      item.style.backgroundColor = 'var(--color-bg-secondary)';
      selectedResultIndex = parseInt(item.dataset.index);
    });
    item.addEventListener('mouseleave', () => {
      item.style.backgroundColor = 'transparent';
    });
    item.addEventListener('focus', () => {
      clearSelectedResult();
      item.style.backgroundColor = 'var(--color-bg-secondary)';
      selectedResultIndex = parseInt(item.dataset.index);
    });
  });
}

function clearSelectedResult() {
  const results = searchResults.querySelectorAll('.search-result-item');
  results.forEach(item => {
    item.style.backgroundColor = 'transparent';
  });
}

function selectResult(index) {
  const results = searchResults.querySelectorAll('.search-result-item');
  if (index >= 0 && index < results.length) {
    clearSelectedResult();
    results[index].style.backgroundColor = 'var(--color-bg-secondary)';
    results[index].focus();
    selectedResultIndex = index;
  }
}

// Enhanced Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
  // Focus search with /
  if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    e.preventDefault();
    searchInput?.focus();
  }
  
  // Clear search with Escape
  if (e.key === 'Escape') {
    if (document.activeElement === searchInput || searchResults.contains(document.activeElement)) {
      searchInput.value = '';
      searchClear.hidden = true;
      searchResults.hidden = true;
      searchInput.blur();
      selectedResultIndex = -1;
    }
  }
  
  // Arrow navigation in search results
  if (!searchResults.hidden && (document.activeElement === searchInput || searchResults.contains(document.activeElement))) {
    const results = searchResults.querySelectorAll('.search-result-item');
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedResultIndex = Math.min(selectedResultIndex + 1, results.length - 1);
      selectResult(selectedResultIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (selectedResultIndex === -1) {
        selectedResultIndex = results.length - 1;
      } else {
        selectedResultIndex = Math.max(selectedResultIndex - 1, 0);
      }
      selectResult(selectedResultIndex);
    } else if (e.key === 'Enter' && selectedResultIndex >= 0) {
      e.preventDefault();
      results[selectedResultIndex]?.click();
    }
  }
  
  // Toggle theme with T
  if (e.key === 't' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    themeToggle?.click();
  }
});

// Active link highlighting
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    // Close mobile menu after selection
    if (window.innerWidth <= 768) {
      sidebar.classList.add('-translate-x-full');
      sidebarOverlay.classList.add('hidden');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

// Mark styles for search highlighting
const style = document.createElement('style');
style.textContent = `
  mark {
    background-color: var(--color-warning);
    color: var(--color-text);
    padding: 0 2px;
    border-radius: 2px;
  }
`;
document.head.appendChild(style);

// Initialize router
const router = new Router();

// Initialize keyboard shortcuts
const shortcuts = new KeyboardShortcuts();
window.shortcuts = shortcuts; // Make available globally for settings

// Initialize shareable links
const shareableLinks = new ShareableLinks();


// Initialize history persistence
const historyPersistence = new HistoryPersistence();
window.historyPersistence = historyPersistence; // Make available globally for settings

// Initialize settings manager
const settingsManager = new SettingsManager();

// Initialize search aliases
const searchAliases = new SearchAliases();

// System Notification Function
function showSystemNotification(message, type = 'info') {
  const notification = document.createElement('div');
  const bgColor = type === 'error' ? 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200' :
                   type === 'success' ? 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200' :
                   type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200' :
                   'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200';
  
  notification.className = `fixed top-4 right-4 max-w-sm p-4 rounded-lg border shadow-lg z-50 transition-all duration-300 ${bgColor}`;
  notification.innerHTML = `
    <div class="flex items-center">
      <span class="flex-1">${message}</span>
      <button class="ml-3 text-current opacity-70 hover:opacity-100" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 4 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 4000);
}

// Clear Everything Function
function clearEverything() {
  if (confirm('This will clear all storage (localStorage, sessionStorage), disconnect from all services, and return to the home page. Continue?')) {
    // Clear all localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear any cookies for this domain
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Close any open EventSource connections (for tools like temp-email)
    if (window.tempEmailTool && window.tempEmailTool.disconnect) {
      window.tempEmailTool.disconnect();
    }
    
    // Reset to system theme
    const systemTheme = getSystemTheme();
    applyTheme(systemTheme);
    
    // Navigate to home
    window.location.href = '/';
    
    showSystemNotification('All storage cleared successfully', 'success');
  }
}

// DevToolbox Navigation (go to home)
function navigateHome() {
  // Close mobile sidebar if open
  if (sidebar && !sidebar.classList.contains('-translate-x-full')) {
    sidebar.classList.add('-translate-x-full');
    if (sidebarOverlay) sidebarOverlay.classList.add('hidden');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
  }
  
  // Navigate to home
  window.location.href = '/';
}

// Add DevToolbox click handler
const devToolboxTitle = document.querySelector('header .flex.items-center.space-x-2');
if (devToolboxTitle) {
  devToolboxTitle.style.cursor = 'pointer';
  devToolboxTitle.addEventListener('click', navigateHome);
}

// Make functions available globally
window.showSystemNotification = showSystemNotification;
window.clearEverything = clearEverything;
window.navigateHome = navigateHome;