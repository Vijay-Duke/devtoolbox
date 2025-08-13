// Webhook Tester - Test and debug webhooks locally
export class WebhookTester {
  constructor() {
    this.container = null;
    this.webhookUrl = null;
    this.requests = [];
    this.activeConnections = new Map();
    this.maxRequests = 100;
  }
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.render();
    this.attachEventListeners();
    this.generateWebhookUrl();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Webhook Tester</h1>
          <p class="text-gray-600 dark:text-gray-300">Test webhooks with a unique URL and inspect incoming requests</p>
        </div>
        
        <div class="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Your Webhook URL</h3>
          <div class="flex gap-2 mb-3">
            <input type="text" id="webhook-url" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white" readonly>
            <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="copy-url">Copy URL</button>
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="regenerate">New URL</button>
          </div>
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Send HTTP requests to this URL to test your webhooks. All methods supported.</p>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 bg-green-500 rounded-full" id="status-indicator"></span>
              <span id="status-text" class="text-sm text-gray-600 dark:text-gray-400">Ready to receive requests</span>
            </div>
          </div>
        </div>
        
        <div class="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Quick Test</h3>
          <div class="flex gap-2 mb-4">
            <select id="test-method" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white">
              <option value="GET">GET</option>
              <option value="POST" selected>POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
            <input type="text" id="test-path" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white" placeholder="/api/test" value="/test">
            <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="send-test">Send Test Request</button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label for="test-body" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Request Body (JSON)</label>
              <textarea id="test-body" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white font-mono text-sm" rows="5">{
  "test": true,
  "timestamp": "${new Date().toISOString()}",
  "message": "Hello from Webhook Tester!"
}</textarea>
            </div>
            
            <div>
              <label for="test-headers" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom Headers (one per line, format: Header: Value)</label>
              <textarea id="test-headers" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white font-mono text-sm" rows="3">Content-Type: application/json
X-Custom-Header: test-value</textarea>
            </div>
          </div>
        </div>
        
        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Incoming Requests <span class="request-count text-gray-500 dark:text-gray-400">(0)</span></h3>
            <div class="flex items-center gap-2">
              <button class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="clear-all">Clear All</button>
              <button class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="export-har">Export HAR</button>
              <label class="flex items-center">
                <input type="checkbox" id="auto-scroll" checked class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Auto-scroll</span>
              </label>
            </div>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto" id="requests-list">
            <div class="text-center py-8">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto text-gray-400 mb-4">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              <p class="text-gray-500 dark:text-gray-400 mb-2">No requests received yet</p>
              <p class="text-sm text-gray-400 dark:text-gray-500">Send a request to your webhook URL to see it here</p>
            </div>
          </div>
        </div>
        
        <div class="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4" id="request-detail" hidden>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">Request Details</h3>
            <button class="p-2 text-gray-600 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-md" data-action="close-detail">×</button>
          </div>
          <div id="detail-content" class="text-sm text-gray-700 dark:text-gray-300"></div>
        </div>
        
        <div class="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Custom Response</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label for="response-status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status Code</label>
              <select id="response-status" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white">
                <option value="200">200 OK</option>
                <option value="201">201 Created</option>
                <option value="204">204 No Content</option>
                <option value="400">400 Bad Request</option>
                <option value="401">401 Unauthorized</option>
                <option value="403">403 Forbidden</option>
                <option value="404">404 Not Found</option>
                <option value="500">500 Internal Server Error</option>
              </select>
            </div>
            
            <div>
              <label for="response-delay" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Response Delay (ms)</label>
              <input type="number" id="response-delay" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white" value="0" min="0" max="10000">
            </div>
          </div>
          
          <div class="mb-4">
            <label for="response-body" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Response Body</label>
            <textarea id="response-body" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white font-mono text-sm" rows="4">{
  "success": true,
  "message": "Webhook received"
}</textarea>
          </div>
          
          <label class="flex items-center">
            <input type="checkbox" id="enable-custom-response" checked class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
            <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Enable custom response</span>
          </label>
        </div>
        
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Testing Tools</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button class="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-tool="simulate-github">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span class="text-sm">GitHub Push</span>
            </button>
            <button class="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-tool="simulate-stripe">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
              </svg>
              <span class="text-sm">Stripe Payment</span>
            </button>
            <button class="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-tool="simulate-slack">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
              </svg>
              <span class="text-sm">Slack Event</span>
            </button>
            <button class="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-tool="simulate-custom">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                <path d="M2 17L12 22L22 17"/>
                <path d="M2 12L12 17L22 12"/>
              </svg>
              <span class="text-sm">Custom Event</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }
  
  attachEventListeners() {
    // URL actions
    this.container.querySelector('[data-action="copy-url"]').addEventListener('click', () => this.copyWebhookUrl());
    this.container.querySelector('[data-action="regenerate"]').addEventListener('click', () => this.generateWebhookUrl());
    
    // Test request
    this.container.querySelector('[data-action="send-test"]').addEventListener('click', () => this.sendTestRequest());
    
    // Request list actions
    this.container.querySelector('[data-action="clear-all"]').addEventListener('click', () => this.clearAllRequests());
    this.container.querySelector('[data-action="export-har"]').addEventListener('click', () => this.exportHAR());
    
    // Detail view
    this.container.querySelector('[data-action="close-detail"]').addEventListener('click', () => {
      this.container.querySelector('#request-detail').hidden = true;
    });
    
    // Testing tools
    this.container.querySelectorAll('[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => this.simulateWebhook(btn.dataset.tool));
    });
  }
  
  generateWebhookUrl() {
    // Generate a unique webhook URL (in production, this would be a real endpoint)
    const id = Math.random().toString(36).substring(2, 15);
    this.webhookUrl = `https://webhook.devtoolbox.app/${id}`;
    
    const urlInput = this.container.querySelector('#webhook-url');
    urlInput.value = this.webhookUrl;
    
    // Simulate webhook connection
    this.simulateWebhookConnection();
  }
  
  simulateWebhookConnection() {
    // In a real implementation, this would establish a WebSocket or SSE connection
    const indicator = this.container.querySelector('#status-indicator');
    const statusText = this.container.querySelector('#status-text');
    
    indicator.className = 'w-2 h-2 bg-green-500 rounded-full';
    statusText.textContent = 'Connected - Ready to receive requests';
  }
  
  copyWebhookUrl() {
    const urlInput = this.container.querySelector('#webhook-url');
    urlInput.select();
    navigator.clipboard.writeText(urlInput.value).then(() => {
      const btn = this.container.querySelector('[data-action="copy-url"]');
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = originalText, 2000);
    });
  }
  
  sendTestRequest() {
    const method = this.container.querySelector('#test-method').value;
    const path = this.container.querySelector('#test-path').value;
    const body = this.container.querySelector('#test-body').value;
    const headers = this.container.querySelector('#test-headers').value;
    
    // Parse headers
    const headersObj = {};
    headers.split('\n').forEach(line => {
      const [key, value] = line.split(':').map(s => s.trim());
      if (key && value) {
        headersObj[key] = value;
      }
    });
    
    // Simulate receiving this request
    const request = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      method,
      path,
      headers: headersObj,
      body: body ? JSON.parse(body) : null,
      query: {},
      ip: '127.0.0.1',
      origin: 'Test Client'
    };
    
    this.addRequest(request);
  }
  
  addRequest(request) {
    this.requests.unshift(request);
    
    // Limit stored requests
    if (this.requests.length > this.maxRequests) {
      this.requests = this.requests.slice(0, this.maxRequests);
    }
    
    this.renderRequests();
    this.updateRequestCount();
    
    // Auto-scroll if enabled
    if (this.container.querySelector('#auto-scroll').checked) {
      const list = this.container.querySelector('#requests-list');
      list.scrollTop = 0;
    }
  }
  
  renderRequests() {
    const list = this.container.querySelector('#requests-list');
    
    if (this.requests.length === 0) {
      list.innerHTML = `
        <div class="text-center py-8">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto text-gray-400 mb-4">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          <p class="text-gray-500 dark:text-gray-400 mb-2">No requests received yet</p>
          <p class="text-sm text-gray-400 dark:text-gray-500">Send a request to your webhook URL to see it here</p>
        </div>
      `;
      return;
    }
    
    list.innerHTML = this.requests.map(req => `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 border border-gray-200 dark:border-gray-600 hover:shadow-md cursor-pointer" data-id="${req.id}">
        <div class="flex items-center justify-between mb-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">${req.method}</span>
          <span class="text-sm text-gray-600 dark:text-gray-400">${req.path}</span>
          <span class="text-sm text-gray-500 dark:text-gray-500">${new Date(req.timestamp).toLocaleTimeString()}</span>
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400">
          ${req.body ? `<pre class="bg-gray-50 dark:bg-gray-900 p-2 rounded text-xs overflow-hidden">${JSON.stringify(req.body, null, 2).substring(0, 100)}...</pre>` : '<span class="italic">No body</span>'}
        </div>
      </div>
    `).join('');
    
    // Add click handlers
    list.querySelectorAll('[data-id]').forEach(item => {
      item.addEventListener('click', () => {
        const id = parseInt(item.dataset.id);
        const request = this.requests.find(r => r.id === id);
        if (request) {
          this.showRequestDetail(request);
        }
      });
    });
  }
  
  showRequestDetail(request) {
    const detail = this.container.querySelector('#request-detail');
    const content = this.container.querySelector('#detail-content');
    
    content.innerHTML = `
      <div class="mb-6">
        <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">General</h4>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Method:</span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">${request.method}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Path:</span>
            <span class="font-mono text-sm">${request.path}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">Time:</span>
            <span class="text-sm">${new Date(request.timestamp).toLocaleString()}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600 dark:text-gray-400">IP:</span>
            <span class="font-mono text-sm">${request.ip}</span>
          </div>
        </div>
      </div>
      
      <div class="mb-6">
        <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">Headers</h4>
        <pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm font-mono overflow-x-auto">${JSON.stringify(request.headers, null, 2)}</pre>
      </div>
      
      ${request.query && Object.keys(request.query).length > 0 ? `
        <div class="mb-6">
          <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">Query Parameters</h4>
          <pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm font-mono overflow-x-auto">${JSON.stringify(request.query, null, 2)}</pre>
        </div>
      ` : ''}
      
      ${request.body ? `
        <div class="mb-6">
          <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">Body</h4>
          <pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm font-mono overflow-x-auto">${JSON.stringify(request.body, null, 2)}</pre>
        </div>
      ` : ''}
      
      <div class="mb-6">
        <h4 class="text-md font-medium text-gray-900 dark:text-white mb-3">Raw Request</h4>
        <pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm font-mono overflow-x-auto">${this.formatRawRequest(request)}</pre>
      </div>
    `;
    
    detail.hidden = false;
  }
  
  formatRawRequest(request) {
    let raw = `${request.method} ${request.path} HTTP/1.1\n`;
    raw += `Host: webhook.devtoolbox.app\n`;
    
    Object.entries(request.headers).forEach(([key, value]) => {
      raw += `${key}: ${value}\n`;
    });
    
    if (request.body) {
      raw += `\n${JSON.stringify(request.body, null, 2)}`;
    }
    
    return raw;
  }
  
  updateRequestCount() {
    const count = this.container.querySelector('.request-count');
    count.textContent = `(${this.requests.length})`;
  }
  
  clearAllRequests() {
    this.requests = [];
    this.renderRequests();
    this.updateRequestCount();
  }
  
  exportHAR() {
    const har = {
      log: {
        version: '1.2',
        creator: {
          name: 'DevToolbox Webhook Tester',
          version: '1.0'
        },
        entries: this.requests.map(req => ({
          startedDateTime: req.timestamp,
          request: {
            method: req.method,
            url: `${this.webhookUrl}${req.path}`,
            headers: Object.entries(req.headers).map(([name, value]) => ({ name, value })),
            postData: req.body ? {
              mimeType: 'application/json',
              text: JSON.stringify(req.body)
            } : undefined
          }
        }))
      }
    };
    
    const blob = new Blob([JSON.stringify(har, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webhook-test-${Date.now()}.har`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  simulateWebhook(type) {
    let request;
    
    switch(type) {
      case 'simulate-github':
        request = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          method: 'POST',
          path: '/webhooks/github',
          headers: {
            'Content-Type': 'application/json',
            'X-GitHub-Event': 'push',
            'X-GitHub-Delivery': Math.random().toString(36).substring(2)
          },
          body: {
            ref: 'refs/heads/main',
            repository: {
              name: 'example-repo',
              full_name: 'user/example-repo'
            },
            pusher: {
              name: 'developer',
              email: 'developer@example.com'
            },
            commits: [
              {
                message: 'Update README.md',
                author: {
                  name: 'developer',
                  email: 'developer@example.com'
                }
              }
            ]
          },
          query: {},
          ip: '192.30.252.1',
          origin: 'GitHub'
        };
        break;
        
      case 'simulate-stripe':
        request = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          method: 'POST',
          path: '/webhooks/stripe',
          headers: {
            'Content-Type': 'application/json',
            'Stripe-Signature': 't=' + Date.now()
          },
          body: {
            id: 'evt_' + Math.random().toString(36).substring(2),
            object: 'event',
            type: 'payment_intent.succeeded',
            data: {
              object: {
                id: 'pi_' + Math.random().toString(36).substring(2),
                amount: 2000,
                currency: 'usd',
                status: 'succeeded'
              }
            }
          },
          query: {},
          ip: '54.187.174.169',
          origin: 'Stripe'
        };
        break;
        
      case 'simulate-slack':
        request = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          method: 'POST',
          path: '/webhooks/slack',
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            type: 'event_callback',
            event: {
              type: 'message',
              channel: 'C1234567890',
              user: 'U1234567890',
              text: 'Hello from Slack!',
              ts: Date.now() / 1000
            }
          },
          query: {},
          ip: '54.230.200.1',
          origin: 'Slack'
        };
        break;
        
      default:
        request = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          method: 'POST',
          path: '/webhooks/custom',
          headers: {
            'Content-Type': 'application/json',
            'X-Custom-Header': 'custom-value'
          },
          body: {
            event: 'custom.event',
            data: {
              message: 'Custom webhook test',
              timestamp: new Date().toISOString()
            }
          },
          query: {},
          ip: '10.0.0.1',
          origin: 'Custom'
        };
    }
    
    this.addRequest(request);
  }
}