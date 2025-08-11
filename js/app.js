import { enableSwipeGestures } from './swipe.js';
import { searchTools, highlightMatch } from './fuzzy-search.js';
import { Router } from './router-lazy.js';
import { KeyboardShortcuts } from './keyboard-shortcuts.js';
import { ShareableLinks } from './shareable-links.js';
import { HistoryPersistence } from './history-persistence.js';
import { SettingsManager } from './settings-manager.js';
import { SearchAliases } from './search-aliases.js';

// Theme Toggle
const themeToggle = document.querySelector('[data-theme-toggle]');
const html = document.documentElement;

themeToggle?.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});

// Mobile Menu Toggle
const menuToggle = document.querySelector('[data-menu-toggle]');
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.querySelector('[data-sidebar-overlay]');

menuToggle?.addEventListener('click', () => {
  const isOpen = sidebar.classList.contains('active');
  
  if (isOpen) {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
  } else {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
  }
});

sidebarOverlay?.addEventListener('click', () => {
  sidebar.classList.remove('active');
  sidebarOverlay.classList.remove('active');
  menuToggle.setAttribute('aria-expanded', 'false');
});

// Enable swipe gestures for mobile
if ('ontouchstart' in window) {
  enableSwipeGestures(sidebar, sidebarOverlay, menuToggle);
}

// Search Functionality
const searchInput = document.querySelector('.search-input');
const searchClear = document.querySelector('.search-clear');
const searchResults = document.querySelector('.search-results');
const categoryFilter = document.querySelector('.category-filter');

// Enhanced tools data with keywords for better fuzzy matching - Initial Release
const tools = [
  { name: 'UUID Generator', href: '#uuid', category: 'Generators', keywords: ['uuid', 'guid', 'generate', 'random', 'unique'] },
  { name: 'Password Generator', href: '#password-generator', category: 'Generators', keywords: ['password', 'secure', 'random', 'passphrase', 'generator', 'strength'] },
  { name: 'QR Code Generator', href: '#qr-generator', category: 'Generators', keywords: ['qr', 'code', 'barcode', 'generator', 'wifi', 'vcard', 'contact'] },
  { name: 'ASCII Art Generator', href: '#ascii-art', category: 'Generators', keywords: ['ascii', 'art', 'text', 'banner', 'figlet', 'generator'] },
  { name: 'cURL Generator', href: '#curl', category: 'Developer Tools', keywords: ['curl', 'http', 'api', 'request', 'rest', 'command'] },
  { name: 'Fake Data Generator', href: '#fake-data', category: 'Generators', keywords: ['fake', 'data', 'mock', 'test', 'generator', 'random', 'person', 'address'] },
];

let searchDebounceTimer;
let selectedResultIndex = -1;

searchInput?.addEventListener('input', (e) => {
  clearTimeout(searchDebounceTimer);
  const query = e.target.value.trim();
  
  if (query) {
    searchClear.hidden = false;
    searchDebounceTimer = setTimeout(() => performSearch(query), 200);
  } else if (!categoryFilter.value) {
    clearSearch();
  } else {
    searchDebounceTimer = setTimeout(() => performSearch(''), 200);
  }
});

function performSearch(query) {
  const category = categoryFilter?.value || '';
  
  let filteredTools = tools;
  if (category) {
    filteredTools = tools.filter(tool => tool.category === category);
  }
  
  if (query) {
    const results = searchTools(query, filteredTools);
    showSearchResults(results, query);
  } else if (category) {
    showSearchResults(filteredTools, '');
  } else {
    clearSearch();
  }
}

function showSearchResults(results, query) {
  selectedResultIndex = -1;
  
  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-no-results">No tools found</div>';
  } else {
    const resultsHtml = results.map((result, index) => {
      const nameHtml = query ? highlightMatch(result.name, query) : result.name;
      return `
        <a href="${result.href}" class="search-result-item" data-index="${index}">
          <span class="search-result-name">${nameHtml}</span>
          <span class="search-result-category">${result.category}</span>
        </a>
      `;
    }).join('');
    
    searchResults.innerHTML = resultsHtml;
  }
  
  searchResults.hidden = false;
}

function clearSearch() {
  searchResults.hidden = true;
  searchResults.innerHTML = '';
  selectedResultIndex = -1;
  if (searchInput) {
    searchClear.hidden = searchInput.value.length === 0;
  }
}

// Search keyboard navigation
searchInput?.addEventListener('keydown', (e) => {
  const resultItems = searchResults.querySelectorAll('.search-result-item');
  
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedResultIndex = Math.min(selectedResultIndex + 1, resultItems.length - 1);
    updateSelectedResult(resultItems);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedResultIndex = Math.max(selectedResultIndex - 1, -1);
    updateSelectedResult(resultItems);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (selectedResultIndex >= 0 && resultItems[selectedResultIndex]) {
      resultItems[selectedResultIndex].click();
    }
  } else if (e.key === 'Escape') {
    clearSearch();
    searchInput.value = '';
    searchInput.blur();
  }
});

function updateSelectedResult(resultItems) {
  resultItems.forEach((item, index) => {
    item.classList.toggle('selected', index === selectedResultIndex);
  });
}

// Clear search button
searchClear?.addEventListener('click', () => {
  searchInput.value = '';
  clearSearch();
  searchInput.focus();
});

// Category filter
categoryFilter?.addEventListener('change', () => {
  const query = searchInput?.value.trim() || '';
  performSearch(query);
});

// Click outside to close search
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-container')) {
    clearSearch();
  }
});

// Global keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Focus search with "/"
  if (e.key === '/' && !e.target.matches('input, textarea, [contenteditable]')) {
    e.preventDefault();
    searchInput?.focus();
    return;
  }
  
  // Toggle theme with "t"
  if (e.key === 't' && !e.target.matches('input, textarea, [contenteditable]')) {
    e.preventDefault();
    themeToggle?.click();
    return;
  }
  
  // Clear search with Escape
  if (e.key === 'Escape' && !searchResults.hidden) {
    clearSearch();
    if (searchInput) {
      searchInput.value = '';
      searchInput.blur();
    }
    return;
  }
});

// Initialize the router
const router = new Router();

// Initialize other features
const keyboardShortcuts = new KeyboardShortcuts();
const shareableLinks = new ShareableLinks();
const historyPersistence = new HistoryPersistence();
const settingsManager = new SettingsManager();
const searchAliases = new SearchAliases();