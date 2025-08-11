// Lazy-loading router with code splitting
export class Router {
  constructor() {
    this.routes = new Map();
    this.currentTool = null;
    this.mainContent = document.querySelector('.main');
    this.loadingTemplate = `
      <div class="tool-loading">
        <div class="loading-spinner"></div>
        <p>Loading tool...</p>
      </div>
    `;
    
    this.initRoutes();
    this.setupNavigation();
  }
  
  initRoutes() {
    // Register tools with lazy loading
    const toolConfigs = [
      { path: 'json-formatter', name: 'JSON Formatter', module: './tools/json-formatter.js', className: 'JSONFormatter' },
      { path: 'jwt-decoder', name: 'JWT Decoder', module: './tools/jwt-decoder.js', className: 'JWTDecoder' },
      { path: 'base64', name: 'Base64 Encode/Decode', module: './tools/base64.js', className: 'Base64Tool' },
      { path: 'url-encode', name: 'URL Encode/Decode', module: './tools/url-encode.js', className: 'URLEncodeTool' },
      { path: 'uuid', name: 'UUID Generator', module: './tools/uuid-generator.js', className: 'UUIDGenerator' },
      { path: 'unix-time', name: 'Unix Time Converter', module: './tools/unix-time.js', className: 'UnixTimeConverter' },
      { path: 'regex-tester', name: 'Regex Tester', module: './tools/regex-tester.js', className: 'RegexTester' },
      { path: 'cron', name: 'Cron Parser', module: './tools/cron-parser.js', className: 'CronParser' },
      { path: 'diff', name: 'Diff Tool', module: './tools/diff-tool.js', className: 'DiffTool' },
      { path: 'csv-json', name: 'CSV ↔ JSON Converter', module: './tools/csv-json.js', className: 'CSVJSONConverter' },
      { path: 'yaml-json', name: 'YAML ↔ JSON Converter', module: './tools/yaml-json.js', className: 'YAMLJSONConverter' },
      { path: 'hash', name: 'Hash Generator', module: './tools/hash-generator.js', className: 'HashGenerator' },
      { path: 'markdown', name: 'Markdown Preview', module: './tools/markdown-preview.js', className: 'MarkdownPreview' },
      { path: 'curl', name: 'cURL Generator', module: './tools/curl-generator.js', className: 'CurlGenerator' },
      { path: 'api-mock', name: 'API Mock Generator', module: './tools/api-mock.js', className: 'APIMockGenerator' },
      { path: 'dns-lookup', name: 'DNS Lookup', module: './tools/dns-lookup.js', className: 'DNSLookup' },
      { path: 'graphql', name: 'GraphQL Tester', module: './tools/graphql-tester.js', className: 'GraphQLTester' },
      { path: 'fake-data', name: 'Fake Data Generator', module: './tools/fake-data.js', className: 'FakeDataGenerator' },
      { path: 'sql-formatter', name: 'SQL Formatter', module: './tools/sql-formatter.js', className: 'SQLFormatter' },
      { path: 'xml-formatter', name: 'XML Formatter', module: './tools/xml-formatter.js', className: 'XMLFormatter' },
      { path: 'password-generator', name: 'Password Generator', module: './tools/password-generator.js', className: 'PasswordGenerator' },
      { path: 'binary-converter', name: 'Binary Converter', module: './tools/binary-converter.js', className: 'BinaryConverter' },
      { path: 'qr-generator', name: 'QR Code Generator', module: './tools/qr-generator.js', className: 'QRGenerator' },
      { path: 'ascii-art', name: 'ASCII Art Generator', module: './tools/ascii-art.js', className: 'ASCIIArtGenerator' },
      { path: 'image-converter', name: 'Image Converter', module: './tools/image-converter.js', className: 'ImageConverter' },
      { path: 'webhook-tester', name: 'Webhook Tester', module: './tools/webhook-tester.js', className: 'WebhookTester' }
    ];
    
    toolConfigs.forEach(config => {
      this.routes.set(config.path, {
        name: config.name,
        module: config.module,
        className: config.className,
        instance: null,
        loaded: false
      });
    });
  }
  
  setupNavigation() {
    // Handle hash changes
    window.addEventListener('hashchange', () => this.handleRoute());
    
    // Handle initial load
    this.handleRoute();
    
    // Preload tools on hover (optional optimization)
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('mouseenter', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          const path = href.slice(1);
          this.preloadTool(path);
        }
      }, { passive: true });
      
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          window.location.hash = href;
        }
      });
    });
  }
  
  async handleRoute() {
    const hash = window.location.hash.slice(1); // Remove #
    
    if (!hash) {
      this.showWelcome();
      return;
    }
    
    const route = this.routes.get(hash);
    if (route) {
      await this.loadTool(route);
    } else {
      this.show404();
    }
    
    // Update active nav state
    this.updateActiveNav(hash);
  }
  
  async loadTool(route) {
    // Destroy current tool if it has a destroy method
    if (this.currentTool && typeof this.currentTool.destroy === 'function') {
      this.currentTool.destroy();
    }
    
    // Show loading state
    this.mainContent.innerHTML = this.loadingTemplate;
    
    try {
      // Dynamically import the tool module if not loaded
      if (!route.loaded) {
        const module = await import(route.module);
        route.ToolClass = module[route.className];
        route.loaded = true;
      }
      
      // Create tool instance if needed
      if (!route.instance) {
        route.instance = new route.ToolClass();
      }
      
      // Clear loading and create container
      this.mainContent.innerHTML = `<div id="tool-root"></div>`;
      
      // Initialize tool
      route.instance.init('tool-root');
      this.currentTool = route.instance;
      
      // Update document title
      document.title = `${route.name} - DevToolbox`;
      
      // Track tool usage for favorites
      this.trackToolUsage(route.name);
    } catch (error) {
      console.error(`Failed to load tool: ${route.name}`, error);
      this.showError(route.name);
    }
  }
  
  async preloadTool(path) {
    const route = this.routes.get(path);
    if (route && !route.loaded) {
      try {
        const module = await import(route.module);
        route.ToolClass = module[route.className];
        route.loaded = true;
      } catch (error) {
        console.error(`Failed to preload tool: ${route.name}`, error);
      }
    }
  }
  
  trackToolUsage(toolName) {
    // Track tool usage for favorites feature
    const usage = JSON.parse(localStorage.getItem('toolUsage') || '{}');
    usage[toolName] = (usage[toolName] || 0) + 1;
    localStorage.setItem('toolUsage', JSON.stringify(usage));
  }
  
  showWelcome() {
    this.mainContent.innerHTML = `
      <div class="welcome-message">
        <h1>Welcome to DevToolbox</h1>
        <p>Select a tool from the sidebar or use search to get started.</p>
        <div class="shortcuts-hint">
          <p>Keyboard shortcuts:</p>
          <ul>
            <li><kbd>/</kbd> Focus search</li>
            <li><kbd>Esc</kbd> Clear search</li>
            <li><kbd>T</kbd> Toggle theme</li>
            <li><kbd>Ctrl+K</kbd> Quick tool search</li>
            <li><kbd>Ctrl+D</kbd> Add to favorites</li>
            <li><kbd>?</kbd> Show all shortcuts</li>
          </ul>
        </div>
        <div class="frequently-used">
          <h3>Frequently Used Tools</h3>
          <div id="frequent-tools"></div>
        </div>
      </div>
    `;
    
    this.displayFrequentTools();
    document.title = 'DevToolbox - Fast Developer Utilities';
  }
  
  displayFrequentTools() {
    const container = document.getElementById('frequent-tools');
    if (!container) return;
    
    const usage = JSON.parse(localStorage.getItem('toolUsage') || '{}');
    const sorted = Object.entries(usage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    
    if (sorted.length === 0) {
      container.innerHTML = '<p>No frequently used tools yet</p>';
      return;
    }
    
    container.innerHTML = `
      <div class="frequent-tools-grid">
        ${sorted.map(([name, count]) => {
          const route = Array.from(this.routes.values()).find(r => r.name === name);
          const path = Array.from(this.routes.entries()).find(([_, r]) => r.name === name)?.[0];
          return route ? `
            <a href="#${path}" class="frequent-tool-card">
              <div class="tool-name">${name}</div>
              <div class="tool-usage">${count} uses</div>
            </a>
          ` : '';
        }).join('')}
      </div>
    `;
  }
  
  show404() {
    this.mainContent.innerHTML = `
      <div class="error-page">
        <h1>Tool Not Found</h1>
        <p>The tool you're looking for doesn't exist yet.</p>
        <a href="#" class="btn btn-primary">Go Home</a>
      </div>
    `;
  }
  
  showError(toolName) {
    this.mainContent.innerHTML = `
      <div class="error-page">
        <h1>Failed to Load Tool</h1>
        <p>Sorry, we couldn't load ${toolName}. Please try again.</p>
        <button class="btn btn-primary" onclick="location.reload()">Reload Page</button>
        <a href="#" class="btn btn-secondary">Go Home</a>
      </div>
    `;
  }
  
  updateActiveNav(hash) {
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${hash}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}