import { ToolTemplate } from './tool-template.js';

export class APIMockGenerator extends ToolTemplate {
  constructor() {
    super();
    this.config = {
      name: 'API Mock Generator',
      description: 'Create mock API endpoints with custom responses, status codes, and headers for testing',
      version: '1.0.0',
      author: 'DevToolbox',
      category: 'Developer Tools',
      keywords: ['api', 'mock', 'testing', 'endpoints', 'json', 'server', 'response']
    };
    
    this.mockData = {
      endpoints: [],
      globalHeaders: {},
      delay: 0
    };
    this.activeEndpointIndex = -1;
  }
  
  render() {
    this.container.innerHTML = `
      <div class="tool-container">
        <div class="tool-header">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">${this.config.name}</h1>
          <p class="text-gray-600 dark:text-gray-400">${this.config.description}</p>
        </div>
        
        <div class="tool-body bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        
        <div class="mb-6 flex flex-wrap gap-2">
          <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="add-endpoint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Endpoint
          </button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="export">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="import">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Import
          </button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="clear">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear All
          </button>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div class="lg:col-span-1">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Global Settings</h3>
              <div class="space-y-4">
                <div>
                  <label for="base-url" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base URL</label>
                  <input type="text" id="base-url" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="https://api.example.com" value="https://api.example.com" />
                </div>
                <div>
                  <label for="response-delay" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Response Delay (ms)</label>
                  <input type="number" id="response-delay" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="0" value="0" min="0" max="5000" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Global Headers</label>
                  <div id="global-headers" class="space-y-2 mb-2"></div>
                  <button class="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30" data-add="global-header">Add Header</button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="lg:col-span-2">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Endpoints</h3>
              <div id="endpoints-list" class="space-y-3"></div>
            </div>
          </div>
        </div>
          
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mock Server Code</h3>
          <div class="flex flex-wrap gap-2 mb-4">
            <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" data-type="express">Express.js</button>
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500" data-type="json-server">JSON Server</button>
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500" data-type="postman">Postman</button>
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500" data-type="openapi">OpenAPI</button>
          </div>
          <pre id="code-output" class="w-full p-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white font-mono text-sm overflow-x-auto mb-4" style="max-height: 400px;"></pre>
          <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="copy-code">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy Code
          </button>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Examples</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="rest-api">REST API</button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="graphql">GraphQL</button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="auth-api">Auth API</button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="crud">CRUD Operations</button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="pagination">Paginated API</button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="errors">Error Responses</button>
          </div>
        </div>
        
        <input type="file" id="import-file" accept=".json" style="display: none;" />
        </div>
      </div>
      </div>
    `;
  }
  
  attachEventListeners() {
    this.loadExampleAPI();
    // Add endpoint
    this.container.querySelector('[data-action="add-endpoint"]').addEventListener('click', () => {
      this.addEndpoint();
    });
    
    // Export/Import
    this.container.querySelector('[data-action="export"]').addEventListener('click', () => {
      this.exportMock();
    });
    
    this.container.querySelector('[data-action="import"]').addEventListener('click', () => {
      this.container.querySelector('#import-file').click();
    });
    
    this.container.querySelector('#import-file').addEventListener('change', (e) => {
      this.importMock(e.target.files[0]);
    });
    
    // Clear all
    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => {
      if (confirm('Clear all endpoints and settings?')) {
        this.clearAll();
      }
    });
    
    // Global settings
    this.container.querySelector('#base-url').addEventListener('input', () => {
      this.generateCode();
    });
    
    this.container.querySelector('#response-delay').addEventListener('input', (e) => {
      this.mockData.delay = parseInt(e.target.value) || 0;
      this.generateCode();
    });
    
    // Add global header
    this.container.querySelector('[data-add="global-header"]').addEventListener('click', () => {
      this.addGlobalHeader();
    });
    
    // Code type selection
    this.container.querySelectorAll('[data-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('[data-type]').forEach(b => {
          b.classList.remove('bg-blue-600', 'text-white');
          b.classList.add('bg-gray-200', 'dark:bg-gray-600', 'text-gray-700', 'dark:text-gray-200');
        });
        btn.classList.add('bg-blue-600', 'text-white');
        btn.classList.remove('bg-gray-200', 'dark:bg-gray-600', 'text-gray-700', 'dark:text-gray-200');
        this.generateCode();
      });
    });
    
    // Copy code
    this.container.querySelector('[data-action="copy-code"]').addEventListener('click', () => {
      this.copyCode();
    });
    
    // Examples
    this.container.querySelectorAll('[data-example]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.loadExample(btn.dataset.example);
      });
    });
    
    // Delegated events
    this.container.addEventListener('click', (e) => {
      // Remove endpoint
      if (e.target.closest('[data-remove="endpoint"]')) {
        const index = parseInt(e.target.closest('.endpoint-item').dataset.index);
        this.removeEndpoint(index);
      }
      
      // Toggle endpoint
      if (e.target.closest('.endpoint-header')) {
        const item = e.target.closest('.endpoint-item');
        const index = parseInt(item.dataset.index);
        this.toggleEndpoint(index);
      }
      
      // Remove header
      if (e.target.closest('[data-remove="header"]')) {
        e.target.closest('.header-item').remove();
        this.generateCode();
      }
    });
    
    // Input changes
    this.container.addEventListener('input', (e) => {
      if (e.target.matches('.endpoint-input, .header-input, .response-input')) {
        this.updateEndpointData();
        this.generateCode();
      }
    });
    
    // Select changes
    this.container.addEventListener('change', (e) => {
      if (e.target.matches('.method-select, .status-select, .response-type-select')) {
        this.updateEndpointData();
        this.generateCode();
      }
    });
  }
  
  addEndpoint() {
    const endpoint = {
      method: 'GET',
      path: '/api/resource',
      status: 200,
      headers: {},
      responseType: 'json',
      response: '{\n  "message": "Success"\n}',
      description: ''
    };
    
    this.mockData.endpoints.push(endpoint);
    this.renderEndpoint(this.mockData.endpoints.length - 1);
    this.generateCode();
  }
  
  renderEndpoint(index) {
    const endpoint = this.mockData.endpoints[index];
    const endpointsList = this.container.querySelector('#endpoints-list');
    
    const endpointEl = document.createElement('div');
    endpointEl.className = 'endpoint-item';
    endpointEl.dataset.index = index;
    endpointEl.innerHTML = `
      <div class="endpoint-header">
        <span class="method-badge method-${endpoint.method.toLowerCase()}">${endpoint.method}</span>
        <span class="endpoint-path">${endpoint.path}</span>
        <button class="btn-icon btn-remove" data-remove="endpoint">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="endpoint-body" ${index === this.activeEndpointIndex ? '' : 'hidden'}>
        <div class="endpoint-config">
          <div class="form-row">
            <div class="form-group">
              <label>Method</label>
              <select class="method-select form-select">
                <option value="GET" ${endpoint.method === 'GET' ? 'selected' : ''}>GET</option>
                <option value="POST" ${endpoint.method === 'POST' ? 'selected' : ''}>POST</option>
                <option value="PUT" ${endpoint.method === 'PUT' ? 'selected' : ''}>PUT</option>
                <option value="PATCH" ${endpoint.method === 'PATCH' ? 'selected' : ''}>PATCH</option>
                <option value="DELETE" ${endpoint.method === 'DELETE' ? 'selected' : ''}>DELETE</option>
              </select>
            </div>
            <div class="form-group flex-grow">
              <label>Path</label>
              <input type="text" class="endpoint-input form-input" data-field="path" value="${endpoint.path}" />
            </div>
            <div class="form-group">
              <label>Status</label>
              <select class="status-select form-select">
                <option value="200" ${endpoint.status === 200 ? 'selected' : ''}>200 OK</option>
                <option value="201" ${endpoint.status === 201 ? 'selected' : ''}>201 Created</option>
                <option value="204" ${endpoint.status === 204 ? 'selected' : ''}>204 No Content</option>
                <option value="400" ${endpoint.status === 400 ? 'selected' : ''}>400 Bad Request</option>
                <option value="401" ${endpoint.status === 401 ? 'selected' : ''}>401 Unauthorized</option>
                <option value="403" ${endpoint.status === 403 ? 'selected' : ''}>403 Forbidden</option>
                <option value="404" ${endpoint.status === 404 ? 'selected' : ''}>404 Not Found</option>
                <option value="500" ${endpoint.status === 500 ? 'selected' : ''}>500 Server Error</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label>Description</label>
            <input type="text" class="endpoint-input form-input" data-field="description" value="${endpoint.description}" placeholder="Optional endpoint description" />
          </div>
          
          <div class="form-group">
            <label>Response Headers</label>
            <div class="endpoint-headers"></div>
            <button class="btn btn-sm" onclick="this.parentElement.querySelector('.endpoint-headers').insertAdjacentHTML('beforeend', '<div class=\\'header-item\\'><input type=\\'text\\' class=\\'header-input header-key\\' placeholder=\\'Header name\\' /><input type=\\'text\\' class=\\'header-input header-value\\' placeholder=\\'Header value\\' /><button class=\\'btn-icon btn-remove\\' data-remove=\\'header\\'><svg width=\\'16\\' height=\\'16\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\'><line x1=\\'18\\' y1=\\'6\\' x2=\\'6\\' y2=\\'18\\'/><line x1=\\'6\\' y1=\\'6\\' x2=\\'18\\' y2=\\'18\\'/></svg></button></div>')">Add Header</button>
          </div>
          
          <div class="form-group">
            <label>Response Type</label>
            <select class="response-type-select form-select">
              <option value="json" ${endpoint.responseType === 'json' ? 'selected' : ''}>JSON</option>
              <option value="text" ${endpoint.responseType === 'text' ? 'selected' : ''}>Text</option>
              <option value="html" ${endpoint.responseType === 'html' ? 'selected' : ''}>HTML</option>
              <option value="xml" ${endpoint.responseType === 'xml' ? 'selected' : ''}>XML</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Response Body</label>
            <textarea class="response-input form-textarea" rows="8">${endpoint.response}</textarea>
          </div>
        </div>
      </div>
    `;
    
    endpointsList.appendChild(endpointEl);
  }
  
  toggleEndpoint(index) {
    const item = this.container.querySelector(`.endpoint-item[data-index="${index}"]`);
    const body = item.querySelector('.endpoint-body');
    
    if (this.activeEndpointIndex === index) {
      body.hidden = true;
      this.activeEndpointIndex = -1;
    } else {
      // Hide previously active
      if (this.activeEndpointIndex >= 0) {
        const prevItem = this.container.querySelector(`.endpoint-item[data-index="${this.activeEndpointIndex}"]`);
        if (prevItem) {
          prevItem.querySelector('.endpoint-body').hidden = true;
        }
      }
      body.hidden = false;
      this.activeEndpointIndex = index;
    }
  }
  
  removeEndpoint(index) {
    this.mockData.endpoints.splice(index, 1);
    this.renderAllEndpoints();
    this.generateCode();
  }
  
  renderAllEndpoints() {
    const endpointsList = this.container.querySelector('#endpoints-list');
    endpointsList.innerHTML = '';
    this.mockData.endpoints.forEach((_, index) => {
      this.renderEndpoint(index);
    });
  }
  
  updateEndpointData() {
    const items = this.container.querySelectorAll('.endpoint-item');
    items.forEach((item, index) => {
      if (!this.mockData.endpoints[index]) return;
      
      const endpoint = this.mockData.endpoints[index];
      endpoint.method = item.querySelector('.method-select')?.value || 'GET';
      endpoint.path = item.querySelector('[data-field="path"]')?.value || '/';
      endpoint.status = parseInt(item.querySelector('.status-select')?.value) || 200;
      endpoint.description = item.querySelector('[data-field="description"]')?.value || '';
      endpoint.responseType = item.querySelector('.response-type-select')?.value || 'json';
      endpoint.response = item.querySelector('.response-input')?.value || '';
      
      // Update headers
      endpoint.headers = {};
      item.querySelectorAll('.endpoint-headers .header-item').forEach(headerItem => {
        const key = headerItem.querySelector('.header-key')?.value;
        const value = headerItem.querySelector('.header-value')?.value;
        if (key) endpoint.headers[key] = value;
      });
      
      // Update method badge
      const badge = item.querySelector('.method-badge');
      badge.textContent = endpoint.method;
      badge.className = `method-badge method-${endpoint.method.toLowerCase()}`;
      
      // Update path display
      item.querySelector('.endpoint-path').textContent = endpoint.path;
    });
  }
  
  addGlobalHeader() {
    const headersList = this.container.querySelector('#global-headers');
    const headerItem = document.createElement('div');
    headerItem.className = 'header-item';
    headerItem.innerHTML = `
      <input type="text" name="header-key" class="header-input header-key" placeholder="Header name" />
      <input type="text" name="header-value" class="header-input header-value" placeholder="Header value" />
      <button class="btn-icon btn-remove" data-remove="header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;
    headersList.appendChild(headerItem);
  }
  
  generateCode() {
    const activeBtn = this.container.querySelector('[data-type].bg-blue-600') || 
                      this.container.querySelector('[data-type="express"]');
    const codeType = activeBtn?.dataset.type || 'express';
    const baseUrl = this.container.querySelector('#base-url').value || 'http://localhost:3000';
    
    // Update global headers
    this.mockData.globalHeaders = {};
    this.container.querySelectorAll('#global-headers .header-item').forEach(item => {
      const key = item.querySelector('.header-key')?.value;
      const value = item.querySelector('.header-value')?.value;
      if (key) this.mockData.globalHeaders[key] = value;
    });
    
    let code = '';
    
    switch(codeType) {
      case 'express':
        code = this.generateExpressCode(baseUrl);
        break;
      case 'json-server':
        code = this.generateJsonServerCode();
        break;
      case 'postman':
        code = this.generatePostmanCollection(baseUrl);
        break;
      case 'openapi':
        code = this.generateOpenAPISpec(baseUrl);
        break;
    }
    
    this.container.querySelector('#code-output').textContent = code;
  }
  
  generateExpressCode(baseUrl) {
    let code = `const express = require('express');
const app = express();
const port = ${new URL(baseUrl).port || 3000};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
`;
    
    // Add global headers
    for (const [key, value] of Object.entries(this.mockData.globalHeaders)) {
      code += `  res.header('${key}', '${value}');\n`;
    }
    
    code += `  next();
});
`;
    
    if (this.mockData.delay > 0) {
      code += `
// Response delay middleware
app.use((req, res, next) => {
  setTimeout(next, ${this.mockData.delay});
});
`;
    }
    
    // Add endpoints
    this.mockData.endpoints.forEach(endpoint => {
      const method = endpoint.method.toLowerCase();
      code += `
// ${endpoint.description || endpoint.method + ' ' + endpoint.path}
app.${method}('${endpoint.path}', (req, res) => {`;
      
      // Add endpoint headers
      for (const [key, value] of Object.entries(endpoint.headers)) {
        code += `
  res.header('${key}', '${value}');`;
      }
      
      // Set content type based on response type
      const contentTypes = {
        json: 'application/json',
        text: 'text/plain',
        html: 'text/html',
        xml: 'application/xml'
      };
      code += `
  res.header('Content-Type', '${contentTypes[endpoint.responseType]}');`;
      
      // Send response
      if (endpoint.responseType === 'json') {
        try {
          const parsed = JSON.parse(endpoint.response);
          code += `
  res.status(${endpoint.status}).json(${JSON.stringify(parsed, null, 2).split('\n').join('\n  ')});`;
        } catch {
          code += `
  res.status(${endpoint.status}).send('${endpoint.response.replace(/'/g, "\\'")}');`;
        }
      } else {
        code += `
  res.status(${endpoint.status}).send(\`${endpoint.response.replace(/`/g, '\\`')}\`);`;
      }
      
      code += `
});
`;
    });
    
    code += `
app.listen(port, () => {
  console.log(\`Mock API server running at http://localhost:\${port}\`);
});`;
    
    return code;
  }
  
  generateJsonServerCode() {
    const db = {
      endpoints: []
    };
    
    // Create JSON Server db structure
    this.mockData.endpoints.forEach((endpoint, index) => {
      if (endpoint.method === 'GET' && endpoint.responseType === 'json') {
        try {
          const response = JSON.parse(endpoint.response);
          const resourceName = endpoint.path.split('/').filter(p => p && !p.startsWith(':')).pop() || `resource${index}`;
          
          if (Array.isArray(response)) {
            db[resourceName] = response;
          } else {
            db[resourceName] = [response];
          }
        } catch {
          // Skip non-JSON responses
        }
      }
    });
    
    let code = `// db.json for json-server
// Install: npm install -g json-server
// Run: json-server --watch db.json --port 3000`;
    
    if (this.mockData.delay > 0) {
      code += ` --delay ${this.mockData.delay}`;
    }
    
    code += `

${JSON.stringify(db, null, 2)}

// Custom routes (routes.json)
${JSON.stringify(this.generateJsonServerRoutes(), null, 2)}`;
    
    return code;
  }
  
  generateJsonServerRoutes() {
    const routes = {};
    this.mockData.endpoints.forEach(endpoint => {
      if (endpoint.path !== '/' && !endpoint.path.includes(':')) {
        const resourceName = endpoint.path.split('/').filter(p => p).pop();
        routes[endpoint.path] = `/${resourceName}`;
      }
    });
    return routes;
  }
  
  generatePostmanCollection(baseUrl) {
    const collection = {
      info: {
        name: 'Mock API Collection',
        description: 'Generated mock API collection',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: []
    };
    
    this.mockData.endpoints.forEach(endpoint => {
      const item = {
        name: endpoint.description || `${endpoint.method} ${endpoint.path}`,
        request: {
          method: endpoint.method,
          header: [],
          url: {
            raw: baseUrl + endpoint.path,
            host: [new URL(baseUrl).hostname],
            path: endpoint.path.split('/').filter(p => p)
          }
        },
        response: [
          {
            name: 'Mock Response',
            status: this.getStatusText(endpoint.status),
            code: endpoint.status,
            header: [],
            body: endpoint.response
          }
        ]
      };
      
      // Add headers
      for (const [key, value] of Object.entries({...this.mockData.globalHeaders, ...endpoint.headers})) {
        item.request.header.push({ key, value });
      }
      
      collection.item.push(item);
    });
    
    return JSON.stringify(collection, null, 2);
  }
  
  generateOpenAPISpec(baseUrl) {
    const spec = {
      openapi: '3.0.0',
      info: {
        title: 'Mock API',
        version: '1.0.0',
        description: 'Generated mock API specification'
      },
      servers: [
        {
          url: baseUrl
        }
      ],
      paths: {}
    };
    
    // Group endpoints by path
    this.mockData.endpoints.forEach(endpoint => {
      if (!spec.paths[endpoint.path]) {
        spec.paths[endpoint.path] = {};
      }
      
      const operation = {
        summary: endpoint.description || `${endpoint.method} ${endpoint.path}`,
        responses: {}
      };
      
      // Add response
      operation.responses[endpoint.status] = {
        description: this.getStatusText(endpoint.status),
        headers: {}
      };
      
      // Add headers
      for (const [key, value] of Object.entries(endpoint.headers)) {
        operation.responses[endpoint.status].headers[key] = {
          schema: { type: 'string' },
          example: value
        };
      }
      
      // Add response body
      if (endpoint.response) {
        const mediaType = {
          json: 'application/json',
          text: 'text/plain',
          html: 'text/html',
          xml: 'application/xml'
        }[endpoint.responseType];
        
        operation.responses[endpoint.status].content = {
          [mediaType]: {
            example: endpoint.responseType === 'json' ? JSON.parse(endpoint.response) : endpoint.response
          }
        };
      }
      
      spec.paths[endpoint.path][endpoint.method.toLowerCase()] = operation;
    });
    
    return JSON.stringify(spec, null, 2);
  }
  
  getStatusText(code) {
    const statusTexts = {
      200: 'OK',
      201: 'Created',
      204: 'No Content',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error'
    };
    return statusTexts[code] || 'Unknown';
  }
  
  exportMock() {
    const exportData = {
      version: '1.0',
      baseUrl: this.container.querySelector('#base-url').value,
      ...this.mockData
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api-mock.json';
    a.click();
    URL.revokeObjectURL(url);
  }
  
  importMock(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        this.container.querySelector('#base-url').value = data.baseUrl || '';
        this.container.querySelector('#response-delay').value = data.delay || 0;
        this.mockData = {
          endpoints: data.endpoints || [],
          globalHeaders: data.globalHeaders || {},
          delay: data.delay || 0
        };
        
        // Render global headers
        const globalHeadersList = this.container.querySelector('#global-headers');
        globalHeadersList.innerHTML = '';
        for (const [key, value] of Object.entries(this.mockData.globalHeaders)) {
          const item = document.createElement('div');
          item.className = 'header-item';
          item.innerHTML = `
            <input type="text" class="header-input header-key" value="${key}" />
            <input type="text" class="header-input header-value" value="${value}" />
            <button class="btn-icon btn-remove" data-remove="header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          `;
          globalHeadersList.appendChild(item);
        }
        
        this.renderAllEndpoints();
        this.generateCode();
      } catch (err) {
        alert('Invalid mock file format');
      }
    };
    reader.readAsText(file);
  }
  
  clearAll() {
    this.mockData = {
      endpoints: [],
      globalHeaders: {},
      delay: 0
    };
    this.activeEndpointIndex = -1;
    this.container.querySelector('#base-url').value = 'https://api.example.com';
    this.container.querySelector('#response-delay').value = '0';
    this.container.querySelector('#global-headers').innerHTML = '';
    this.container.querySelector('#endpoints-list').innerHTML = '';
    this.generateCode();
  }
  
  copyCode() {
    const code = this.container.querySelector('#code-output').textContent;
    navigator.clipboard.writeText(code).then(() => {
      const btn = this.container.querySelector('[data-action="copy-code"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = 'Copied!';
      btn.classList.add('btn-success');
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('btn-success');
      }, 2000);
    });
  }
  
  loadExample(type) {
    this.clearAll();
    
    switch(type) {
      case 'rest-api':
        this.loadRESTExample();
        break;
      case 'graphql':
        this.loadGraphQLExample();
        break;
      case 'auth-api':
        this.loadAuthExample();
        break;
      case 'crud':
        this.loadCRUDExample();
        break;
      case 'pagination':
        this.loadPaginationExample();
        break;
      case 'errors':
        this.loadErrorsExample();
        break;
    }
    
    this.renderAllEndpoints();
    this.generateCode();
  }
  
  loadRESTExample() {
    this.mockData.endpoints = [
      {
        method: 'GET',
        path: '/api/users',
        status: 200,
        headers: { 'X-Total-Count': '100' },
        responseType: 'json',
        response: JSON.stringify([
          { id: 1, name: 'John Doe', email: 'john@example.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
        ], null, 2),
        description: 'Get all users'
      },
      {
        method: 'GET',
        path: '/api/users/:id',
        status: 200,
        headers: {},
        responseType: 'json',
        response: JSON.stringify({ id: 1, name: 'John Doe', email: 'john@example.com', created: '2024-01-01' }, null, 2),
        description: 'Get user by ID'
      },
      {
        method: 'POST',
        path: '/api/users',
        status: 201,
        headers: { 'Location': '/api/users/3' },
        responseType: 'json',
        response: JSON.stringify({ id: 3, name: 'New User', email: 'new@example.com' }, null, 2),
        description: 'Create new user'
      }
    ];
  }
  
  loadGraphQLExample() {
    this.mockData.endpoints = [
      {
        method: 'POST',
        path: '/graphql',
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        responseType: 'json',
        response: JSON.stringify({
          data: {
            user: {
              id: '1',
              name: 'John Doe',
              posts: [
                { id: '1', title: 'First Post' },
                { id: '2', title: 'Second Post' }
              ]
            }
          }
        }, null, 2),
        description: 'GraphQL query endpoint'
      }
    ];
  }
  
  loadAuthExample() {
    this.mockData.endpoints = [
      {
        method: 'POST',
        path: '/auth/login',
        status: 200,
        headers: {},
        responseType: 'json',
        response: JSON.stringify({
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: { id: 1, email: 'user@example.com' }
        }, null, 2),
        description: 'User login'
      },
      {
        method: 'POST',
        path: '/auth/refresh',
        status: 200,
        headers: {},
        responseType: 'json',
        response: JSON.stringify({
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }, null, 2),
        description: 'Refresh token'
      },
      {
        method: 'POST',
        path: '/auth/logout',
        status: 204,
        headers: {},
        responseType: 'text',
        response: '',
        description: 'User logout'
      }
    ];
  }
  
  loadCRUDExample() {
    const resource = {
      id: 1,
      title: 'Sample Item',
      description: 'This is a sample item',
      status: 'active'
    };
    
    this.mockData.endpoints = [
      {
        method: 'GET',
        path: '/api/items',
        status: 200,
        headers: {},
        responseType: 'json',
        response: JSON.stringify([resource], null, 2),
        description: 'List items'
      },
      {
        method: 'GET',
        path: '/api/items/:id',
        status: 200,
        headers: {},
        responseType: 'json',
        response: JSON.stringify(resource, null, 2),
        description: 'Get item'
      },
      {
        method: 'POST',
        path: '/api/items',
        status: 201,
        headers: {},
        responseType: 'json',
        response: JSON.stringify({...resource, id: 2}, null, 2),
        description: 'Create item'
      },
      {
        method: 'PUT',
        path: '/api/items/:id',
        status: 200,
        headers: {},
        responseType: 'json',
        response: JSON.stringify({...resource, updated: true}, null, 2),
        description: 'Update item'
      },
      {
        method: 'DELETE',
        path: '/api/items/:id',
        status: 204,
        headers: {},
        responseType: 'text',
        response: '',
        description: 'Delete item'
      }
    ];
  }
  
  loadPaginationExample() {
    this.mockData.endpoints = [
      {
        method: 'GET',
        path: '/api/posts?page=1&limit=10',
        status: 200,
        headers: {
          'X-Total-Count': '100',
          'X-Page': '1',
          'X-Per-Page': '10'
        },
        responseType: 'json',
        response: JSON.stringify({
          data: Array.from({length: 10}, (_, i) => ({
            id: i + 1,
            title: `Post ${i + 1}`,
            content: `Content for post ${i + 1}`
          })),
          pagination: {
            page: 1,
            perPage: 10,
            total: 100,
            totalPages: 10
          }
        }, null, 2),
        description: 'Paginated posts'
      }
    ];
  }
  
  loadErrorsExample() {
    this.mockData.endpoints = [
      {
        method: 'GET',
        path: '/api/error/400',
        status: 400,
        headers: {},
        responseType: 'json',
        response: JSON.stringify({
          error: 'Bad Request',
          message: 'Invalid parameters provided'
        }, null, 2),
        description: 'Bad request error'
      },
      {
        method: 'GET',
        path: '/api/error/401',
        status: 401,
        headers: {},
        responseType: 'json',
        response: JSON.stringify({
          error: 'Unauthorized',
          message: 'Authentication required'
        }, null, 2),
        description: 'Unauthorized error'
      },
      {
        method: 'GET',
        path: '/api/error/404',
        status: 404,
        headers: {},
        responseType: 'json',
        response: JSON.stringify({
          error: 'Not Found',
          message: 'Resource not found'
        }, null, 2),
        description: 'Not found error'
      },
      {
        method: 'GET',
        path: '/api/error/500',
        status: 500,
        headers: {},
        responseType: 'json',
        response: JSON.stringify({
          error: 'Internal Server Error',
          message: 'An unexpected error occurred'
        }, null, 2),
        description: 'Server error'
      }
    ];
  }
  
  loadExampleAPI() {
    this.loadRESTExample();
    this.renderAllEndpoints();
    this.generateCode();
  }
}