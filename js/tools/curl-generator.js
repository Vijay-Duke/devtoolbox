export class CurlGenerator {
  constructor() {
    this.container = null;
    this.method = 'GET';
    this.headers = [];
    this.queryParams = [];
    this.errorDisplay = null;
  }
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.render();
    this.attachEventListeners();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="tool-container">
        <div class="tool-header">
          <h1>cURL Command Generator</h1>
          <p class="tool-description">Build cURL commands visually with support for headers, authentication, and request bodies</p>
        </div>
        
        <div class="tool-controls">
          <button class="btn btn-primary" data-action="generate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="4 17 10 11 4 5"/>
              <line x1="12" y1="19" x2="20" y2="19"/>
            </svg>
            Generate cURL
          </button>
          <button class="btn btn-secondary" data-action="copy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy
          </button>
          <button class="btn btn-secondary" data-action="clear">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear
          </button>
        </div>
        
        <div class="curl-builder">
          <div class="request-section">
            <h3>Request Configuration</h3>
            
            <div class="form-group">
              <label for="method-select">Method</label>
              <select id="method-select" class="form-select">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
                <option value="HEAD">HEAD</option>
                <option value="OPTIONS">OPTIONS</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="url-input">URL</label>
              <input 
                type="text" 
                id="url-input" 
                class="form-input" 
                placeholder="https://api.example.com/endpoint"
                value="https://api.example.com/users"
              />
            </div>
            
            <div class="form-group">
              <label>Authentication</label>
              <select id="auth-type" class="form-select">
                <option value="none">None</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
                <option value="api-key">API Key</option>
              </select>
              <div id="auth-fields" class="auth-fields" hidden></div>
            </div>
          </div>
          
          <div class="headers-section">
            <h3>Headers</h3>
            <div id="headers-list" class="param-list">
              <div class="param-item">
                <input type="text" class="param-key" placeholder="Header name" value="Content-Type" />
                <input type="text" class="param-value" placeholder="Header value" value="application/json" />
                <button class="btn-icon btn-remove" data-remove="header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
            <button class="btn btn-sm" data-add="header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Header
            </button>
          </div>
          
          <div class="params-section">
            <h3>Query Parameters</h3>
            <div id="params-list" class="param-list"></div>
            <button class="btn btn-sm" data-add="param">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Parameter
            </button>
          </div>
          
          <div class="body-section">
            <h3>Request Body</h3>
            <div class="body-type-selector">
              <label class="radio-label">
                <input type="radio" name="body-type" value="none" checked />
                <span>None</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="body-type" value="json" />
                <span>JSON</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="body-type" value="form" />
                <span>Form Data</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="body-type" value="raw" />
                <span>Raw</span>
              </label>
            </div>
            <div id="body-content" class="body-content" hidden></div>
          </div>
          
          <div class="options-section">
            <h3>Options</h3>
            <div class="options-grid">
              <label class="checkbox-label">
                <input type="checkbox" id="opt-verbose" />
                <span>Verbose (-v)</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="opt-follow" checked />
                <span>Follow redirects (-L)</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="opt-insecure" />
                <span>Allow insecure (-k)</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="opt-include" />
                <span>Include headers (-i)</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="opt-silent" />
                <span>Silent mode (-s)</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="opt-compressed" checked />
                <span>Compressed (--compressed)</span>
              </label>
            </div>
            <div class="form-group">
              <label for="timeout-input">Timeout (seconds)</label>
              <input type="number" id="timeout-input" class="form-input" placeholder="30" />
            </div>
          </div>
        </div>
        
        <div class="error-display" data-error hidden></div>
        
        <div class="output-section">
          <h3>Generated cURL Command</h3>
          <pre id="curl-output" class="code-output curl-output"></pre>
        </div>
        
        <div class="examples-section">
          <h3>Quick Examples</h3>
          <div class="examples-grid">
            <button class="example-btn" data-example="get-json">
              GET JSON API
            </button>
            <button class="example-btn" data-example="post-json">
              POST JSON Data
            </button>
            <button class="example-btn" data-example="auth-bearer">
              Bearer Auth
            </button>
            <button class="example-btn" data-example="form-upload">
              Form Upload
            </button>
            <button class="example-btn" data-example="graphql">
              GraphQL Query
            </button>
            <button class="example-btn" data-example="rest-crud">
              REST CRUD
            </button>
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
        e.target.closest('.param-item').remove();
        this.generateCurl();
      }
      if (e.target.closest('[data-remove="param"]')) {
        e.target.closest('.param-item').remove();
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
      if (e.target.matches('.param-key, .param-value, .body-input, #auth-fields input')) {
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
    this.container.querySelectorAll('#headers-list .param-item').forEach(item => {
      const key = item.querySelector('.param-key').value;
      const value = item.querySelector('.param-value').value;
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
        bodyContent.querySelectorAll('.param-item').forEach(item => {
          const key = item.querySelector('.param-key').value;
          const value = item.querySelector('.param-value').value;
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
    this.container.querySelectorAll('#params-list .param-item').forEach(item => {
      const key = item.querySelector('.param-key').value;
      const value = item.querySelector('.param-value').value;
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
          <input type="text" id="auth-token" class="form-input" placeholder="Enter bearer token" />
        `;
        break;
      case 'basic':
        authFields.hidden = false;
        authFields.innerHTML = `
          <div class="auth-basic-fields">
            <input type="text" id="auth-username" class="form-input" placeholder="Username" />
            <input type="password" id="auth-password" class="form-input" placeholder="Password" />
          </div>
        `;
        break;
      case 'api-key':
        authFields.hidden = false;
        authFields.innerHTML = `
          <div class="auth-api-fields">
            <input type="text" id="api-key-name" class="form-input" placeholder="Header name (e.g., X-API-Key)" value="X-API-Key" />
            <input type="text" id="api-key-value" class="form-input" placeholder="API key value" />
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
          <textarea id="json-body" class="body-input" placeholder='{"key": "value"}' rows="8">{
  "name": "John Doe",
  "email": "john@example.com"
}</textarea>
        `;
        break;
      case 'form':
        bodyContent.hidden = false;
        bodyContent.innerHTML = `
          <div id="form-fields" class="param-list">
            <div class="param-item">
              <input type="text" class="param-key" placeholder="Field name" value="name" />
              <input type="text" class="param-value" placeholder="Field value" value="John Doe" />
              <button class="btn-icon btn-remove" data-remove="form">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
          <button class="btn btn-sm" onclick="this.parentElement.querySelector('#form-fields').insertAdjacentHTML('beforeend', this.parentElement.querySelector('.param-item').outerHTML)">Add Field</button>
        `;
        break;
      case 'raw':
        bodyContent.hidden = false;
        bodyContent.innerHTML = `
          <textarea id="raw-body" class="body-input" placeholder="Raw body content" rows="8"></textarea>
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
    newHeader.className = 'param-item';
    newHeader.innerHTML = `
      <input type="text" class="param-key" placeholder="Header name" />
      <input type="text" class="param-value" placeholder="Header value" />
      <button class="btn-icon btn-remove" data-remove="header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;
    headersList.appendChild(newHeader);
    
    // Focus on the new input
    newHeader.querySelector('.param-key').focus();
  }
  
  addQueryParam() {
    const paramsList = this.container.querySelector('#params-list');
    const newParam = document.createElement('div');
    newParam.className = 'param-item';
    newParam.innerHTML = `
      <input type="text" class="param-key" placeholder="Parameter name" />
      <input type="text" class="param-value" placeholder="Parameter value" />
      <button class="btn-icon btn-remove" data-remove="param">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;
    paramsList.appendChild(newParam);
    
    // Focus on the new input
    newParam.querySelector('.param-key').focus();
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
    const existingHeaders = headersList.querySelectorAll('.param-item');
    
    // Check if we need to use the existing empty header or create new
    let headerItem = null;
    for (const item of existingHeaders) {
      const keyInput = item.querySelector('.param-key');
      if (!keyInput.value) {
        headerItem = item;
        break;
      }
    }
    
    if (!headerItem) {
      this.addHeader();
      headerItem = headersList.lastElementChild;
    }
    
    headerItem.querySelector('.param-key').value = key;
    headerItem.querySelector('.param-value').value = value;
  }
  
  copyCurl() {
    const command = this.outputArea.textContent;
    if (!command || command === 'curl [URL]') {
      this.showError('No command to copy');
      return;
    }
    
    navigator.clipboard.writeText(command).then(() => {
      const btn = this.container.querySelector('[data-action="copy"]');
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('btn-success');
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('btn-success');
      }, 2000);
    });
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
      <div class="param-item">
        <input type="text" class="param-key" placeholder="Header name" />
        <input type="text" class="param-value" placeholder="Header value" />
        <button class="btn-icon btn-remove" data-remove="header">
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
    this.errorDisplay.textContent = message;
    this.errorDisplay.hidden = false;
  }
  
  clearError() {
    this.errorDisplay.textContent = '';
    this.errorDisplay.hidden = true;
  }
}