import { ToolTemplate } from './tool-template.js';

export class CurlGenerator extends ToolTemplate {
  constructor() {
    super();
    this.config = {
      name: 'cURL Generator',
      description: 'Build cURL commands visually with support for headers, authentication, and request bodies',
      version: '1.0.0',
      author: 'DevToolbox',
      category: 'Developer Tools',
      keywords: ['curl', 'http', 'api', 'request', 'command', 'header', 'auth']
    };
    
    this.method = 'GET';
    this.headers = [];
    this.queryParams = [];
    this.errorDisplay = null;
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
          <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="generate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="4 17 10 11 4 5"/>
              <line x1="12" y1="19" x2="20" y2="19"/>
            </svg>
            Generate cURL
          </button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="copy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy
          </button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="clear">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear
          </button>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="space-y-6">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Request Configuration</h3>
              
              <div class="space-y-4">
                <div>
                  <label for="method-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Method</label>
                  <select id="method-select" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
                <option value="HEAD">HEAD</option>
                <option value="OPTIONS">OPTIONS</option>
                  </select>
                </div>
                
                <div>
                  <label for="url-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
                  <input 
                    type="text" 
                    id="url-input" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" 
                    placeholder="https://api.example.com/endpoint"
                    value="https://api.example.com/users"
                  />
                </div>
            
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Authentication</label>
                  <select id="auth-type" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    <option value="none">None</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                    <option value="api-key">API Key</option>
                  </select>
                  <div id="auth-fields" class="mt-2" hidden></div>
                </div>
              </div>
            </div>
          
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Headers</h3>
              <div id="headers-list" class="space-y-2 mb-3">
                <div class="flex gap-2">
                  <input type="text" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Header name" value="Content-Type" />
                  <input type="text" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Header value" value="application/json" />
                  <button class="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md" data-remove="header">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
              <button class="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30 flex items-center gap-2" data-add="header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Header
              </button>
            </div>
          
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Query Parameters</h3>
              <div id="params-list" class="space-y-2 mb-3"></div>
              <button class="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30 flex items-center gap-2" data-add="param">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Parameter
              </button>
            </div>
          </div>
          
          <div class="space-y-6">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Request Body</h3>
              <div class="flex flex-wrap gap-4 mb-4">
                <label class="flex items-center">
                  <input type="radio" name="body-type" value="none" checked class="mr-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-blue-600 focus:ring-blue-500" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">None</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" name="body-type" value="json" class="mr-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-blue-600 focus:ring-blue-500" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">JSON</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" name="body-type" value="form" class="mr-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-blue-600 focus:ring-blue-500" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">Form Data</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" name="body-type" value="raw" class="mr-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-blue-600 focus:ring-blue-500" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">Raw</span>
                </label>
              </div>
              <div id="body-content" hidden></div>
            </div>
          
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Options</h3>
              <div class="grid grid-cols-2 gap-3 mb-4">
                <label class="flex items-center">
                  <input type="checkbox" id="opt-verbose" class="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">Verbose (-v)</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" id="opt-follow" checked class="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">Follow redirects (-L)</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" id="opt-insecure" class="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">Allow insecure (-k)</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" id="opt-include" class="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">Include headers (-i)</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" id="opt-silent" class="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">Silent mode (-s)</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" id="opt-compressed" checked class="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">Compressed</span>
                </label>
              </div>
              <div>
                <label for="timeout-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timeout (seconds)</label>
                <input type="number" id="timeout-input" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="30" />
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded hidden" data-error></div>
        
        <div class="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generated cURL Command</h3>
          <pre id="curl-output" class="w-full p-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white font-mono text-sm overflow-x-auto"></pre>
        </div>
        
        <div class="mt-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Examples</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="get-json">
              GET JSON API
            </button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="post-json">
              POST JSON Data
            </button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="auth-bearer">
              Bearer Auth
            </button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="form-upload">
              Form Upload
            </button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="graphql">
              GraphQL Query
            </button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="rest-crud">
              REST CRUD
            </button>
          </div>
        </div>
      </div>
      </div>
    `;
    
    this.errorDisplay = this.container.querySelector('[data-error]');
    this.outputArea = this.container.querySelector('#curl-output');
  }
  
  attachEventListeners() {
    // Generate button
    this.container.querySelector('[data-action="generate"]').addEventListener('click', () => this.generateCurl());
    
    // Copy button
    this.container.querySelector('[data-action="copy"]').addEventListener('click', () => this.copyCurl());
    
    // Clear button
    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => this.clear());
    
    // Method change
    this.container.querySelector('#method-select').addEventListener('change', (e) => {
      this.method = e.target.value;
      this.generateCurl();
    });
    
    // URL input
    this.container.querySelector('#url-input').addEventListener('input', () => {
      this.generateCurl();
    });
    
    // Auth type change
    this.container.querySelector('#auth-type').addEventListener('change', (e) => {
      this.updateAuthFields(e.target.value);
      this.generateCurl();
    });
    
    // Add header button
    this.container.querySelector('[data-add="header"]').addEventListener('click', () => {
      this.addHeader();
    });
    
    // Add param button
    this.container.querySelector('[data-add="param"]').addEventListener('click', () => {
      this.addQueryParam();
    });
    
    // Remove buttons (delegated)
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('[data-remove="header"]')) {
        e.target.closest('.flex.gap-2').remove();
        this.generateCurl();
      }
      if (e.target.closest('[data-remove="param"]')) {
        e.target.closest('.flex.gap-2').remove();
        this.generateCurl();
      }
    });
    
    // Body type change
    this.container.querySelectorAll('input[name="body-type"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.updateBodyFields(e.target.value);
        this.generateCurl();
      });
    });
    
    // Options change
    this.container.querySelectorAll('.options-section input').forEach(input => {
      input.addEventListener('change', () => this.generateCurl());
    });
    
    // Example buttons
    this.container.querySelectorAll('[data-example]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.loadExample(btn.dataset.example);
      });
    });
    
    // Auto-generate on input changes (delegated)
    this.container.addEventListener('input', (e) => {
      if (e.target.matches('#headers-list input, #params-list input, textarea, #auth-fields input')) {
        this.generateCurl();
      }
    });
    
    // Initial generation
    this.generateCurl();
  }
  
  generateCurl() {
    const url = this.container.querySelector('#url-input').value;
    if (!url) {
      this.outputArea.textContent = 'curl [URL]';
      return;
    }
    
    let command = ['curl'];
    
    // Add options
    if (this.container.querySelector('#opt-verbose').checked) command.push('-v');
    if (this.container.querySelector('#opt-follow').checked) command.push('-L');
    if (this.container.querySelector('#opt-insecure').checked) command.push('-k');
    if (this.container.querySelector('#opt-include').checked) command.push('-i');
    if (this.container.querySelector('#opt-silent').checked) command.push('-s');
    if (this.container.querySelector('#opt-compressed').checked) command.push('--compressed');
    
    // Add timeout
    const timeout = this.container.querySelector('#timeout-input').value;
    if (timeout) {
      command.push(`--max-time ${timeout}`);
    }
    
    // Add method (if not GET)
    const method = this.container.querySelector('#method-select').value;
    if (method !== 'GET') {
      command.push(`-X ${method}`);
    }
    
    // Add authentication
    const authType = this.container.querySelector('#auth-type').value;
    if (authType !== 'none') {
      const authCommand = this.getAuthCommand(authType);
      if (authCommand) command.push(authCommand);
    }
    
    // Add headers
    const headers = this.getHeaders();
    headers.forEach(header => {
      if (header.key && header.value) {
        command.push(`-H "${header.key}: ${header.value}"`);
      }
    });
    
    // Add body
    const bodyType = this.container.querySelector('input[name="body-type"]:checked').value;
    if (bodyType !== 'none') {
      const bodyCommand = this.getBodyCommand(bodyType);
      if (bodyCommand) command.push(bodyCommand);
    }
    
    // Build URL with query params
    const fullUrl = this.buildUrlWithParams(url);
    command.push(`"${fullUrl}"`);
    
    // Format the command
    const formattedCommand = this.formatCurlCommand(command);
    this.outputArea.textContent = formattedCommand;
  }
  
  formatCurlCommand(parts) {
    // Single line for short commands
    if (parts.join(' ').length < 80) {
      return parts.join(' ');
    }
    
    // Multi-line with backslashes for long commands
    return parts.join(' \\\n  ');
  }
  
  getAuthCommand(type) {
    const authFields = this.container.querySelector('#auth-fields');
    
    switch(type) {
      case 'bearer':
        const token = authFields.querySelector('#auth-token')?.value;
        if (token) return `-H "Authorization: Bearer ${token}"`;
        break;
      case 'basic':
        const username = authFields.querySelector('#auth-username')?.value;
        const password = authFields.querySelector('#auth-password')?.value;
        if (username && password) return `-u "${username}:${password}"`;
        break;
      case 'api-key':
        const keyName = authFields.querySelector('#api-key-name')?.value || 'X-API-Key';
        const keyValue = authFields.querySelector('#api-key-value')?.value;
        if (keyValue) return `-H "${keyName}: ${keyValue}"`;
        break;
    }
    return null;
  }
  
  getHeaders() {
    const headers = [];
    this.container.querySelectorAll('#headers-list .flex.gap-2').forEach(item => {
      const inputs = item.querySelectorAll('input');
      const key = inputs[0]?.value;
      const value = inputs[1]?.value;
      if (key) headers.push({ key, value });
    });
    return headers;
  }
  
  getBodyCommand(type) {
    const bodyContent = this.container.querySelector('#body-content');
    
    switch(type) {
      case 'json':
        const jsonData = bodyContent.querySelector('#json-body')?.value;
        if (jsonData) {
          try {
            // Validate and minify JSON
            const parsed = JSON.parse(jsonData);
            return `-d '${JSON.stringify(parsed)}'`;
          } catch {
            return `-d '${jsonData}'`;
          }
        }
        break;
      case 'form':
        const formData = [];
        bodyContent.querySelectorAll('.flex.gap-2').forEach(item => {
          const inputs = item.querySelectorAll('input');
          const key = inputs[0]?.value;
          const value = inputs[1]?.value;
          if (key) formData.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        });
        if (formData.length > 0) {
          return `-d "${formData.join('&')}"`;
        }
        break;
      case 'raw':
        const rawData = bodyContent.querySelector('#raw-body')?.value;
        if (rawData) return `-d '${rawData}'`;
        break;
    }
    return null;
  }
  
  buildUrlWithParams(baseUrl) {
    const params = [];
    this.container.querySelectorAll('#params-list .flex.gap-2').forEach(item => {
      const inputs = item.querySelectorAll('input');
      const key = inputs[0]?.value;
      const value = inputs[1]?.value;
      if (key) params.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    });
    
    if (params.length === 0) return baseUrl;
    
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${params.join('&')}`;
  }
  
  updateAuthFields(type) {
    const authFields = this.container.querySelector('#auth-fields');
    
    switch(type) {
      case 'none':
        authFields.hidden = true;
        authFields.innerHTML = '';
        break;
      case 'bearer':
        authFields.hidden = false;
        authFields.innerHTML = `
          <input type="text" id="auth-token" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Enter bearer token" />
        `;
        break;
      case 'basic':
        authFields.hidden = false;
        authFields.innerHTML = `
          <div class="grid grid-cols-2 gap-2">
            <input type="text" id="auth-username" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Username" />
            <input type="password" id="auth-password" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Password" />
          </div>
        `;
        break;
      case 'api-key':
        authFields.hidden = false;
        authFields.innerHTML = `
          <div class="space-y-2">
            <input type="text" id="api-key-name" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Header name (e.g., X-API-Key)" value="X-API-Key" />
            <input type="text" id="api-key-value" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="API key value" />
          </div>
        `;
        break;
    }
    
    // Re-attach listeners for new inputs
    authFields.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => this.generateCurl());
    });
  }
  
  updateBodyFields(type) {
    const bodyContent = this.container.querySelector('#body-content');
    
    switch(type) {
      case 'none':
        bodyContent.hidden = true;
        bodyContent.innerHTML = '';
        break;
      case 'json':
        bodyContent.hidden = false;
        bodyContent.innerHTML = `
          <textarea id="json-body" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm" placeholder='{"key": "value"}' rows="8">{
  "name": "John Doe",
  "email": "john@example.com"
}</textarea>
        `;
        break;
      case 'form':
        bodyContent.hidden = false;
        bodyContent.innerHTML = `
          <div id="form-fields" class="space-y-2 mb-3">
            <div class="flex gap-2">
              <input type="text" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Field name" value="name" />
              <input type="text" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Field value" value="John Doe" />
              <button class="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md" data-remove="form">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
          <button class="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30" onclick="this.parentElement.querySelector('#form-fields').insertAdjacentHTML('beforeend', this.parentElement.querySelector('.flex.gap-2').outerHTML)">Add Field</button>
        `;
        break;
      case 'raw':
        bodyContent.hidden = false;
        bodyContent.innerHTML = `
          <textarea id="raw-body" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm" placeholder="Raw body content" rows="8"></textarea>
        `;
        break;
    }
    
    // Re-attach listeners for new inputs
    bodyContent.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', () => this.generateCurl());
    });
  }
  
  addHeader() {
    const headersList = this.container.querySelector('#headers-list');
    const newHeader = document.createElement('div');
    newHeader.className = 'flex gap-2';
    newHeader.innerHTML = `
      <input type="text" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Header name" />
      <input type="text" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Header value" />
      <button class="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md" data-remove="header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;
    headersList.appendChild(newHeader);
    
    // Focus on the new input
    newHeader.querySelector('input').focus();
  }
  
  addQueryParam() {
    const paramsList = this.container.querySelector('#params-list');
    const newParam = document.createElement('div');
    newParam.className = 'flex gap-2';
    newParam.innerHTML = `
      <input type="text" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Parameter name" />
      <input type="text" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Parameter value" />
      <button class="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md" data-remove="param">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;
    paramsList.appendChild(newParam);
    
    // Focus on the new input
    newParam.querySelector('input').focus();
  }
  
  loadExample(example) {
    // Clear current settings
    this.clear();
    
    switch(example) {
      case 'get-json':
        this.container.querySelector('#method-select').value = 'GET';
        this.container.querySelector('#url-input').value = 'https://jsonplaceholder.typicode.com/posts/1';
        this.addHeaderWithValues('Accept', 'application/json');
        break;
        
      case 'post-json':
        this.container.querySelector('#method-select').value = 'POST';
        this.container.querySelector('#url-input').value = 'https://jsonplaceholder.typicode.com/posts';
        this.addHeaderWithValues('Content-Type', 'application/json');
        this.container.querySelector('input[name="body-type"][value="json"]').checked = true;
        this.updateBodyFields('json');
        this.container.querySelector('#json-body').value = JSON.stringify({
          title: 'New Post',
          body: 'This is the post content',
          userId: 1
        }, null, 2);
        break;
        
      case 'auth-bearer':
        this.container.querySelector('#method-select').value = 'GET';
        this.container.querySelector('#url-input').value = 'https://api.github.com/user';
        this.container.querySelector('#auth-type').value = 'bearer';
        this.updateAuthFields('bearer');
        this.container.querySelector('#auth-token').value = 'your-token-here';
        break;
        
      case 'form-upload':
        this.container.querySelector('#method-select').value = 'POST';
        this.container.querySelector('#url-input').value = 'https://httpbin.org/post';
        this.container.querySelector('input[name="body-type"][value="form"]').checked = true;
        this.updateBodyFields('form');
        break;
        
      case 'graphql':
        this.container.querySelector('#method-select').value = 'POST';
        this.container.querySelector('#url-input').value = 'https://api.example.com/graphql';
        this.addHeaderWithValues('Content-Type', 'application/json');
        this.container.querySelector('input[name="body-type"][value="json"]').checked = true;
        this.updateBodyFields('json');
        this.container.querySelector('#json-body').value = JSON.stringify({
          query: `query GetUser($id: ID!) {
            user(id: $id) {
              id
              name
              email
            }
          }`,
          variables: { id: "123" }
        }, null, 2);
        break;
        
      case 'rest-crud':
        this.container.querySelector('#method-select').value = 'PUT';
        this.container.querySelector('#url-input').value = 'https://api.example.com/users/123';
        this.addHeaderWithValues('Content-Type', 'application/json');
        this.addHeaderWithValues('Accept', 'application/json');
        this.container.querySelector('input[name="body-type"][value="json"]').checked = true;
        this.updateBodyFields('json');
        this.container.querySelector('#json-body').value = JSON.stringify({
          name: 'Updated Name',
          email: 'updated@example.com'
        }, null, 2);
        break;
    }
    
    this.generateCurl();
  }
  
  addHeaderWithValues(key, value) {
    const headersList = this.container.querySelector('#headers-list');
    const existingHeaders = headersList.querySelectorAll('.flex.gap-2');
    
    // Check if we need to use the existing empty header or create new
    let headerItem = null;
    for (const item of existingHeaders) {
      const inputs = item.querySelectorAll('input');
      if (!inputs[0].value) {
        headerItem = item;
        break;
      }
    }
    
    if (!headerItem) {
      this.addHeader();
      headerItem = headersList.lastElementChild;
    }
    
    const inputs = headerItem.querySelectorAll('input');
    inputs[0].value = key;
    inputs[1].value = value;
  }
  
  copyCurl() {
    const command = this.outputArea.textContent;
    if (!command || command === 'curl [URL]') {
      this.showError('No command to copy');
      return;
    }
    
    this.copyToClipboard(command);
  }
  
  clear() {
    // Reset form
    this.container.querySelector('#method-select').value = 'GET';
    this.container.querySelector('#url-input').value = '';
    this.container.querySelector('#auth-type').value = 'none';
    this.updateAuthFields('none');
    
    // Clear headers (except first)
    const headersList = this.container.querySelector('#headers-list');
    headersList.innerHTML = `
      <div class="flex gap-2">
        <input type="text" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Header name" />
        <input type="text" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Header value" />
        <button class="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md" data-remove="header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `;
    
    // Clear params
    this.container.querySelector('#params-list').innerHTML = '';
    
    // Reset body
    this.container.querySelector('input[name="body-type"][value="none"]').checked = true;
    this.updateBodyFields('none');
    
    // Reset options
    this.container.querySelector('#opt-verbose').checked = false;
    this.container.querySelector('#opt-follow').checked = true;
    this.container.querySelector('#opt-insecure').checked = false;
    this.container.querySelector('#opt-include').checked = false;
    this.container.querySelector('#opt-silent').checked = false;
    this.container.querySelector('#opt-compressed').checked = true;
    this.container.querySelector('#timeout-input').value = '';
    
    // Clear output
    this.outputArea.textContent = 'curl [URL]';
    this.clearError();
  }
  
  showError(message) {
    this.showNotification(message, 'error');
  }
  
  clearError() {
    // ToolTemplate handles notification cleanup automatically
  }
}