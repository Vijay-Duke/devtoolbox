import { JSONFormatter } from './tools/json-formatter.js';
import { JWTDecoder } from './tools/jwt-decoder.js';
import { Base64Tool } from './tools/base64.js';
import { URLEncodeTool } from './tools/url-encode.js';
import { UUIDGenerator } from './tools/uuid-generator.js';
import { UnixTimeConverter } from './tools/unix-time.js';
import { RegexTester } from './tools/regex-tester.js';
import { CronParser } from './tools/cron-parser.js';
import { DiffTool } from './tools/diff-tool.js';
import { CSVJSONConverter } from './tools/csv-json.js';
import { YAMLJSONConverter } from './tools/yaml-json.js';
import { HashGenerator } from './tools/hash-generator.js';
import { MarkdownPreview } from './tools/markdown-preview.js';
import { CurlGenerator } from './tools/curl-generator.js';
import { APIMockGenerator } from './tools/api-mock.js';
import { DNSLookup } from './tools/dns-lookup.js';
import { GraphQLTester } from './tools/graphql-tester.js';
import { FakeDataGenerator } from './tools/fake-data.js';

export class Router {
  constructor() {
    this.routes = new Map();
    this.currentTool = null;
    this.mainContent = document.querySelector('.main');
    
    this.initRoutes();
    this.setupNavigation();
  }
  
  initRoutes() {
    // Register tools
    this.routes.set('json-formatter', {
      name: 'JSON Formatter',
      tool: JSONFormatter,
      instance: null
    });
    
    this.routes.set('jwt-decoder', {
      name: 'JWT Decoder',
      tool: JWTDecoder,
      instance: null
    });
    
    this.routes.set('base64', {
      name: 'Base64 Encode/Decode',
      tool: Base64Tool,
      instance: null
    });
    
    this.routes.set('url-encode', {
      name: 'URL Encode/Decode',
      tool: URLEncodeTool,
      instance: null
    });
    
    this.routes.set('uuid', {
      name: 'UUID Generator',
      tool: UUIDGenerator,
      instance: null
    });
    
    this.routes.set('unix-time', {
      name: 'Unix Time Converter',
      tool: UnixTimeConverter,
      instance: null
    });
    
    this.routes.set('regex-tester', {
      name: 'Regex Tester',
      tool: RegexTester,
      instance: null
    });
    
    this.routes.set('cron', {
      name: 'Cron Parser',
      tool: CronParser,
      instance: null
    });
    
    this.routes.set('diff', {
      name: 'Diff Tool',
      tool: DiffTool,
      instance: null
    });
    
    
    this.routes.set('csv-json', {
      name: 'CSV ↔ JSON Converter',
      tool: CSVJSONConverter,
      instance: null
    });
    
    this.routes.set('yaml-json', {
      name: 'YAML ↔ JSON Converter',
      tool: YAMLJSONConverter,
      instance: null
    });
    
    this.routes.set('hash', {
      name: 'Hash Generator',
      tool: HashGenerator,
      instance: null
    });
    
    this.routes.set('markdown', {
      name: 'Markdown Preview',
      tool: MarkdownPreview,
      instance: null
    });
    
    this.routes.set('curl', {
      name: 'cURL Generator',
      tool: CurlGenerator,
      instance: null
    });
    
    this.routes.set('api-mock', {
      name: 'API Mock Generator',
      tool: APIMockGenerator,
      instance: null
    });
    
    this.routes.set('dns-lookup', {
      name: 'DNS Lookup',
      tool: DNSLookup,
      instance: null
    });
    
    this.routes.set('graphql', {
      name: 'GraphQL Tester',
      tool: GraphQLTester,
      instance: null
    });
    
    this.routes.set('fake-data', {
      name: 'Fake Data Generator',
      tool: FakeDataGenerator,
      instance: null
    });
    
    // More tools will be added here
  }
  
  setupNavigation() {
    // Handle hash changes
    window.addEventListener('hashchange', () => this.handleRoute());
    
    // Handle initial load
    this.handleRoute();
    
    // Update nav links to use router
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          window.location.hash = href;
        }
      });
    });
  }
  
  handleRoute() {
    const hash = window.location.hash.slice(1); // Remove #
    
    if (!hash) {
      this.showWelcome();
      return;
    }
    
    const route = this.routes.get(hash);
    if (route) {
      this.loadTool(route);
    } else {
      this.show404();
    }
    
    // Update active nav state
    this.updateActiveNav(hash);
  }
  
  loadTool(route) {
    // Destroy current tool if it has a destroy method
    if (this.currentTool && typeof this.currentTool.destroy === 'function') {
      this.currentTool.destroy();
    }
    
    // Clear current content
    this.mainContent.innerHTML = `<div id="tool-root"></div>`;
    
    // Create tool instance if needed
    if (!route.instance) {
      route.instance = new route.tool();
    }
    
    // Initialize tool
    route.instance.init('tool-root');
    this.currentTool = route.instance;
    
    // Update document title
    document.title = `${route.name} - DevToolbox`;
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
          </ul>
        </div>
      </div>
    `;
    document.title = 'DevToolbox - Fast Developer Utilities';
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