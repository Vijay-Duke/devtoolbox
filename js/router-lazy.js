// Lazy-loading router with code splitting
export class Router {
  constructor() {
    this.routes = new Map();
    this.currentTool = null;
    this.mainContent = document.querySelector('#main');
    this.loadingTemplate = `
      <div class="flex items-center justify-center h-64">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mb-4 mx-auto"></div>
          <p class="text-gray-600 dark:text-gray-400">Loading tool...</p>
        </div>
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
      { path: 'webhook-tester', name: 'Webhook Tester', module: './tools/webhook-tester.js', className: 'WebhookTester' },
      // Networking & Cloud Tools
      { path: 'ip-lookup', name: 'IP Address Lookup', module: './tools/ip-lookup.js', className: 'IPLookup' },
      { path: 'cidr-calculator', name: 'CIDR Calculator', module: './tools/cidr-calculator.js', className: 'CIDRCalculator' },
      { path: 'whois-lookup', name: 'WHOIS Lookup', module: './tools/whois-lookup.js', className: 'WHOISLookup' },
      { path: 's3-presigned-url', name: 'S3 Pre-signed URL Generator', module: './tools/s3-presigned-url.js', className: 'S3PresignedURL' },
      { path: 'iam-policy-visualizer', name: 'AWS IAM Policy Visualizer', module: './tools/iam-policy-visualizer.js', className: 'IAMPolicyVisualizer' }
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
        
        // Validate that the expected class exists in the module
        if (!module[route.className]) {
          throw new Error(`Class ${route.className} not found in module ${route.module}`);
        }
        
        route.ToolClass = module[route.className];
        route.loaded = true;
      }
      
      // Create tool instance if needed
      if (!route.instance) {
        route.instance = new route.ToolClass();
      }
      
      // Clear loading and create container
      this.mainContent.innerHTML = `<div id="tool-root"></div>`;
      
      // Ensure the tool has an init method
      if (typeof route.instance.init !== 'function') {
        throw new Error(`Tool ${route.className} does not have an init method`);
      }
      
      // Initialize tool
      route.instance.init('tool-root');
      this.currentTool = route.instance;
      
      // Update document title
      document.title = `${route.name} - DevToolbox`;
      
      // Track tool usage for favorites
      this.trackToolUsage(route.name);
      
      // Prefetch related tools for better performance
      this.prefetchRelatedTools(route);
    } catch (error) {
      console.error(`Failed to load tool: ${route.name}`, error);
      this.showError(route.name, error.message);
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
      <div class="max-w-4xl mx-auto px-6 py-12">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">Welcome to DevToolbox</h1>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">Select a tool from the sidebar or use search to get started.</p>
          
          <div class="inline-block text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <p class="font-semibold text-gray-900 dark:text-white mb-3">Keyboard shortcuts:</p>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center space-x-2">
                <kbd class="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">/</kbd>
                <span class="text-gray-600 dark:text-gray-400">Focus search</span>
              </li>
              <li class="flex items-center space-x-2">
                <kbd class="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">Esc</kbd>
                <span class="text-gray-600 dark:text-gray-400">Clear search</span>
              </li>
              <li class="flex items-center space-x-2">
                <kbd class="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono">T</kbd>
                <span class="text-gray-600 dark:text-gray-400">Toggle theme</span>
              </li>
            </ul>
          </div>
          
          <div class="mt-8">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Frequently Used Tools</h3>
            <div id="frequent-tools"></div>
          </div>
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
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        ${sorted.map(([name, count]) => {
          const route = Array.from(this.routes.values()).find(r => r.name === name);
          const path = Array.from(this.routes.entries()).find(([_, r]) => r.name === name)?.[0];
          return route ? `
            <a href="#${path}" class="block p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow">
              <div class="font-medium text-gray-900 dark:text-white">${name}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">${count} uses</div>
            </a>
          ` : '';
        }).join('')}
      </div>
    `;
  }
  
  show404() {
    this.mainContent.innerHTML = `
      <div class="flex items-center justify-center h-64">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Tool Not Found</h1>
          <p class="text-gray-600 dark:text-gray-400 mb-6">The tool you're looking for doesn't exist yet.</p>
          <a href="#" class="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Go Home</a>
        </div>
      </div>
    `;
  }
  
  showError(toolName, errorMessage = '') {
    const errorDetails = errorMessage ? `<p class="text-sm text-gray-500 dark:text-gray-500 mt-2">${errorMessage}</p>` : '';
    this.mainContent.innerHTML = `
      <div class="flex items-center justify-center h-64">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Failed to Load Tool</h1>
          <p class="text-gray-600 dark:text-gray-400 mb-6">Sorry, we couldn't load ${toolName}. Please try again.</p>
          ${errorDetails}
          <div class="space-x-4">
            <button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onclick="location.reload()">Reload Page</button>
            <a href="#" class="inline-block px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Go Home</a>
          </div>
        </div>
      </div>
    `;
  }
  
  // Prefetch related tools for better performance
  prefetchRelatedTools(currentRoute) {
    // Get tools in the same category
    const relatedTools = [];
    this.routes.forEach((route, path) => {
      if (route.category === currentRoute.category && 
          path !== currentRoute.path && 
          !route.loaded) {
        relatedTools.push(route);
      }
    });
    
    // Prefetch up to 2 related tools
    const toolsToPrefetch = relatedTools.slice(0, 2);
    
    // Use requestIdleCallback for non-blocking prefetch
    if ('requestIdleCallback' in window && toolsToPrefetch.length > 0) {
      requestIdleCallback(() => {
        toolsToPrefetch.forEach(route => {
          import(route.module).then(module => {
            if (module[route.className]) {
              route.ToolClass = module[route.className];
              route.loaded = true;
            }
          }).catch(() => {}); // Silent fail for prefetch
        });
      });
    }
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