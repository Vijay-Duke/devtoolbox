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
    // Register tools with lazy loading - Initial Release
    const toolConfigs = [
      { path: 'uuid', name: 'UUID Generator', module: './tools/uuid-generator.js', className: 'UUIDGenerator' },
      { path: 'password-generator', name: 'Password Generator', module: './tools/password-generator.js', className: 'PasswordGenerator' },
      { path: 'qr-generator', name: 'QR Code Generator', module: './tools/qr-generator.js', className: 'QRGenerator' },
      { path: 'ascii-art', name: 'ASCII Art Generator', module: './tools/ascii-art.js', className: 'ASCIIArtGenerator' },
      { path: 'curl', name: 'cURL Generator', module: './tools/curl-generator.js', className: 'CurlGenerator' },
      { path: 'fake-data', name: 'Fake Data Generator', module: './tools/fake-data.js', className: 'FakeDataGenerator' }
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
    // Handle navigation clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        e.preventDefault();
        const hash = link.getAttribute('href').slice(1);
        if (hash) {
          this.navigate(hash);
        }
      }
    });
    
    // Handle browser back/forward
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.slice(1);
      if (hash && this.routes.has(hash)) {
        this.navigate(hash);
      } else if (!hash) {
        this.showWelcome();
      }
    });
    
    // Handle initial load
    const initialHash = window.location.hash.slice(1);
    if (initialHash && this.routes.has(initialHash)) {
      this.navigate(initialHash);
    }
  }
  
  async navigate(toolPath) {
    const route = this.routes.get(toolPath);
    if (!route) {
      console.error(`Tool not found: ${toolPath}`);
      return;
    }
    
    // Update URL
    if (window.location.hash.slice(1) !== toolPath) {
      window.location.hash = `#${toolPath}`;
    }
    
    // Update active nav link
    this.updateActiveNavLink(toolPath);
    
    // Show loading state
    this.showLoading(route.name);
    
    try {
      // Lazy load the tool if not already loaded
      if (!route.loaded) {
        const module = await import(route.module);
        const ToolClass = module[route.className];
        route.instance = new ToolClass();
        route.loaded = true;
      }
      
      // Show tool
      this.showTool(route);
    } catch (error) {
      console.error(`Failed to load tool ${toolPath}:`, error);
      this.showError(`Failed to load ${route.name}. Please try again.`);
    }
  }
  
  updateActiveNavLink(toolPath) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    // Add active class to current link
    const activeLink = document.querySelector(`a[href="#${toolPath}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }
  
  showLoading(toolName) {
    this.mainContent.innerHTML = this.loadingTemplate.replace('Loading tool...', `Loading ${toolName}...`);
  }
  
  showTool(route) {
    this.currentTool = route.instance;
    this.mainContent.innerHTML = `<div id="tool-container-${route.instance.constructor.name.toLowerCase()}"></div>`;
    
    // Initialize the tool
    const containerId = `tool-container-${route.instance.constructor.name.toLowerCase()}`;
    route.instance.init(containerId);
  }
  
  showError(message) {
    this.mainContent.innerHTML = `
      <div class="error-message">
        <div class="error-icon">⚠️</div>
        <h2>Error</h2>
        <p>${message}</p>
        <button onclick="window.location.reload()" class="btn btn-primary">Reload Page</button>
      </div>
    `;
  }
  
  showWelcome() {
    this.currentTool = null;
    this.mainContent.innerHTML = `
      <div class="welcome-message">
        <h1>Welcome to DevToolbox</h1>
        <p>Select a tool from the sidebar to get started.</p>
        <div class="shortcuts-hint">
          <p>Keyboard shortcuts:</p>
          <ul>
            <li><kbd>/</kbd> Focus search</li>
            <li><kbd>Esc</kbd> Clear search</li>
            <li><kbd>T</kbd> Toggle theme</li>
          </ul>
        </div>
      </div>
    `;
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
  }
}