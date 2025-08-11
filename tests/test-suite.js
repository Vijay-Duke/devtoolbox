// Test Suite for DevToolbox
export class TestSuite {
  constructor() {
    this.tests = {
      unit: [],
      integration: [],
      performance: []
    };
    this.lastResults = null;
    this.setupTests();
  }
  
  setupTests() {
    // Unit Tests
    this.addUnitTests();
    
    // Integration Tests
    this.addIntegrationTests();
    
    // Performance Tests
    this.addPerformanceTests();
  }
  
  addUnitTests() {
    // Utility function tests
    this.tests.unit.push({
      name: 'Base64 encoding/decoding',
      test: async () => {
        const text = 'Hello, World!';
        const encoded = btoa(text);
        const decoded = atob(encoded);
        assert(decoded === text, 'Base64 round-trip failed');
      }
    });
    
    this.tests.unit.push({
      name: 'JSON validation',
      test: async () => {
        const validJSON = '{"test": true}';
        const invalidJSON = '{test: true}';
        
        assert(this.isValidJSON(validJSON), 'Valid JSON not recognized');
        assert(!this.isValidJSON(invalidJSON), 'Invalid JSON not caught');
      }
    });
    
    this.tests.unit.push({
      name: 'URL validation',
      test: async () => {
        const validURL = 'https://example.com';
        const invalidURL = 'not-a-url';
        
        assert(this.isValidURL(validURL), 'Valid URL not recognized');
        assert(!this.isValidURL(invalidURL), 'Invalid URL not caught');
      }
    });
    
    this.tests.unit.push({
      name: 'Hash generation',
      test: async () => {
        const text = 'test';
        const hash = await this.generateHash(text, 'SHA-256');
        assert(hash.length === 64, 'SHA-256 hash incorrect length');
      }
    });
    
    this.tests.unit.push({
      name: 'UUID generation',
      test: async () => {
        const uuid = this.generateUUID();
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        assert(uuidRegex.test(uuid), 'Invalid UUID format');
      }
    });
    
    this.tests.unit.push({
      name: 'Local storage operations',
      test: async () => {
        const key = 'test-key';
        const value = { test: true };
        
        localStorage.setItem(key, JSON.stringify(value));
        const retrieved = JSON.parse(localStorage.getItem(key));
        localStorage.removeItem(key);
        
        assert(retrieved.test === true, 'LocalStorage round-trip failed');
      }
    });
    
    this.tests.unit.push({
      name: 'Fuzzy search matching',
      test: async () => {
        const items = [
          { name: 'JSON Formatter' },
          { name: 'JWT Decoder' },
          { name: 'Base64 Encoder' }
        ];
        
        const results = this.fuzzySearch('json', items);
        assert(results.length > 0, 'Fuzzy search returned no results');
        assert(results[0].name === 'JSON Formatter', 'Fuzzy search incorrect order');
      }
    });
    
    this.tests.unit.push({
      name: 'Debounce function',
      test: async () => {
        let callCount = 0;
        const debounced = this.debounce(() => callCount++, 100);
        
        debounced();
        debounced();
        debounced();
        
        assert(callCount === 0, 'Debounce called immediately');
        
        await this.wait(150);
        assert(callCount === 1, 'Debounce not called after delay');
      }
    });
  }
  
  addIntegrationTests() {
    this.tests.integration.push({
      name: 'Router navigation',
      test: async () => {
        const originalHash = window.location.hash;
        
        window.location.hash = '#json-formatter';
        await this.wait(500);
        
        const toolContainer = document.querySelector('.tool-container');
        assert(toolContainer !== null, 'Tool container not rendered');
        
        window.location.hash = originalHash;
      }
    });
    
    this.tests.integration.push({
      name: 'Theme switching',
      test: async () => {
        const html = document.documentElement;
        const originalTheme = html.getAttribute('data-theme');
        
        const themeToggle = document.querySelector('[data-theme-toggle]');
        if (themeToggle) {
          themeToggle.click();
          await this.wait(100);
          
          const newTheme = html.getAttribute('data-theme');
          assert(newTheme !== originalTheme, 'Theme did not change');
          
          // Restore original theme
          themeToggle.click();
        }
      }
    });
    
    this.tests.integration.push({
      name: 'Search functionality',
      test: async () => {
        const searchInput = document.querySelector('.search-input');
        const searchResults = document.querySelector('.search-results');
        
        if (searchInput && searchResults) {
          searchInput.value = 'json';
          searchInput.dispatchEvent(new Event('input'));
          
          await this.wait(300);
          
          assert(!searchResults.hidden, 'Search results not shown');
          
          // Clear search
          searchInput.value = '';
          searchInput.dispatchEvent(new Event('input'));
        }
      }
    });
    
    this.tests.integration.push({
      name: 'Service Worker registration',
      test: async () => {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          assert(registration !== undefined, 'Service Worker not registered');
        } else {
          return { skip: true, reason: 'Service Worker not supported' };
        }
      }
    });
    
    this.tests.integration.push({
      name: 'PWA manifest',
      test: async () => {
        const manifestLink = document.querySelector('link[rel="manifest"]');
        assert(manifestLink !== null, 'Manifest link not found');
        
        if (manifestLink) {
          const response = await fetch(manifestLink.href);
          assert(response.ok, 'Manifest file not accessible');
          
          const manifest = await response.json();
          assert(manifest.name !== undefined, 'Manifest missing name');
          assert(manifest.icons !== undefined, 'Manifest missing icons');
        }
      }
    });
    
    this.tests.integration.push({
      name: 'Keyboard shortcuts',
      test: async () => {
        const searchInput = document.querySelector('.search-input');
        
        // Test / shortcut for search
        const event = new KeyboardEvent('keydown', { key: '/' });
        document.dispatchEvent(event);
        
        await this.wait(100);
        
        assert(document.activeElement === searchInput, 'Search not focused with / shortcut');
      }
    });
    
    this.tests.integration.push({
      name: 'Tool lazy loading',
      test: async () => {
        const originalHash = window.location.hash;
        
        // Navigate to a tool
        window.location.hash = '#uuid';
        await this.wait(1000);
        
        // Check if tool loaded
        const toolContainer = document.querySelector('.tool-container');
        assert(toolContainer !== null, 'Tool not loaded');
        
        // Check if UUID specific elements exist
        const generateButton = document.querySelector('[data-action="generate"]');
        assert(generateButton !== null, 'Tool specific elements not found');
        
        window.location.hash = originalHash;
      }
    });
  }
  
  addPerformanceTests() {
    this.tests.performance.push({
      name: 'Initial page load',
      test: async () => {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        
        assert(loadTime < 3000, `Page load took ${loadTime}ms (should be < 3000ms)`);
      }
    });
    
    this.tests.performance.push({
      name: 'Tool switching speed',
      test: async () => {
        const start = performance.now();
        
        window.location.hash = '#base64';
        await this.waitForElement('.tool-container');
        
        const duration = performance.now() - start;
        assert(duration < 1000, `Tool switch took ${duration}ms (should be < 1000ms)`);
      }
    });
    
    this.tests.performance.push({
      name: 'Memory usage',
      test: async () => {
        if (performance.memory) {
          const usedMemory = performance.memory.usedJSHeapSize;
          const limitMemory = performance.memory.jsHeapSizeLimit;
          const percentage = (usedMemory / limitMemory) * 100;
          
          assert(percentage < 50, `Memory usage at ${percentage.toFixed(1)}% (should be < 50%)`);
        } else {
          return { skip: true, reason: 'Memory API not available' };
        }
      }
    });
    
    this.tests.performance.push({
      name: 'Large data processing',
      test: async () => {
        // Generate large JSON
        const largeData = {};
        for (let i = 0; i < 1000; i++) {
          largeData[`key${i}`] = {
            value: Math.random(),
            nested: {
              data: 'test'.repeat(100)
            }
          };
        }
        
        const json = JSON.stringify(largeData);
        const start = performance.now();
        
        // Parse and stringify
        const parsed = JSON.parse(json);
        const formatted = JSON.stringify(parsed, null, 2);
        
        const duration = performance.now() - start;
        assert(duration < 500, `Large JSON processing took ${duration}ms (should be < 500ms)`);
      }
    });
    
    this.tests.performance.push({
      name: 'Search performance',
      test: async () => {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) {
          return { skip: true, reason: 'Search input not found' };
        }
        
        const start = performance.now();
        
        // Simulate rapid typing
        for (let i = 0; i < 10; i++) {
          searchInput.value = 'test'.substring(0, i % 4 + 1);
          searchInput.dispatchEvent(new Event('input'));
        }
        
        const duration = performance.now() - start;
        assert(duration < 200, `Search updates took ${duration}ms (should be < 200ms)`);
      }
    });
  }
  
  async run(type = 'all', options = {}) {
    const startTime = performance.now();
    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      suites: []
    };
    
    const testTypes = type === 'all' ? ['unit', 'integration', 'performance'] : [type];
    
    for (const testType of testTypes) {
      const suite = {
        name: testType.charAt(0).toUpperCase() + testType.slice(1) + ' Tests',
        tests: [],
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      };
      
      const suiteStart = performance.now();
      
      for (const test of this.tests[testType]) {
        const testStart = performance.now();
        let testResult = {
          name: test.name,
          status: 'pass',
          duration: 0,
          error: null
        };
        
        try {
          const result = await test.test();
          
          if (result && result.skip) {
            testResult.status = 'skip';
            testResult.error = result.reason;
            suite.skipped++;
          } else {
            suite.passed++;
          }
        } catch (error) {
          testResult.status = 'fail';
          testResult.error = error.message;
          suite.failed++;
        }
        
        testResult.duration = Math.round(performance.now() - testStart);
        suite.tests.push(testResult);
        results.total++;
        
        if (testResult.status === 'pass') results.passed++;
        else if (testResult.status === 'fail') results.failed++;
        else if (testResult.status === 'skip') results.skipped++;
        
        // Call progress callback
        if (options.onTestComplete) {
          options.onTestComplete({
            ...testResult,
            suite: suite.name
          });
        }
        
        if (options.onProgress) {
          const progress = (results.total / this.getTotalTestCount()) * 100;
          options.onProgress(progress);
        }
      }
      
      suite.duration = Math.round(performance.now() - suiteStart);
      results.suites.push(suite);
    }
    
    results.duration = Math.round(performance.now() - startTime);
    this.lastResults = results;
    
    return results;
  }
  
  getTotalTestCount() {
    return this.tests.unit.length + 
           this.tests.integration.length + 
           this.tests.performance.length;
  }
  
  getLastResults() {
    return this.lastResults;
  }
  
  // Helper methods
  isValidJSON(str) {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
  
  isValidURL(str) {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }
  
  async generateHash(text, algorithm) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  fuzzySearch(query, items) {
    const q = query.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(q)
    ).sort((a, b) => {
      const aIndex = a.name.toLowerCase().indexOf(q);
      const bIndex = b.name.toLowerCase().indexOf(q);
      return aIndex - bIndex;
    });
  }
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async waitForElement(selector, timeout = 5000) {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await this.wait(100);
    }
    
    throw new Error(`Element ${selector} not found after ${timeout}ms`);
  }
}

// Simple assertion helper
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}