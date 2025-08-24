import { ToolTemplate } from './tool-template.js';

export class GraphQLTester extends ToolTemplate {
  constructor() {
    super();
    this.config = {
      name: 'GraphQL Tester',
      description: 'Test GraphQL queries and mutations with variables, headers, and introspection',
      version: '1.0.0',
      author: 'DevToolbox',
      category: 'Developer Tools',
      keywords: ['graphql', 'query', 'mutation', 'api', 'testing', 'variables', 'introspection']
    };
    
    this.queryHistory = [];
    this.variables = {};
    this.headers = {};
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
          <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="execute">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Execute Query
          </button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="prettify">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="4 7 4 4 20 4 20 7"/>
              <line x1="9" y1="20" x2="15" y2="20"/>
              <line x1="12" y1="4" x2="12" y2="20"/>
            </svg>
            Prettify
          </button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="copy-query">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy Query
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
          <div>
            <div class="mb-4">
              <label for="endpoint-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GraphQL Endpoint</label>
              <input 
                type="text" 
                id="endpoint-input" 
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" 
                placeholder="https://api.example.com/graphql"
                value="https://countries.trevorblades.com/"
              />
            </div>
            
            <div>
              <div class="flex mb-2 border-b border-gray-200 dark:border-gray-700">
                <button class="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400" data-tab="query">Query</button>
                <button class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" data-tab="variables">Variables</button>
                <button class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" data-tab="headers">Headers</button>
              </div>
              
              <div>
                <div class="tab-pane block" data-pane="query">
                  <textarea 
                    id="query-editor" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                    placeholder="# Write your GraphQL query here
query {
  field
}"
                    spellcheck="false"
                    rows="10"
                  ></textarea>
                </div>
                
                <div class="tab-pane hidden" data-pane="variables">
                  <textarea 
                    id="variables-editor" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                    placeholder='{
  "variableName": "value"
}'
                    spellcheck="false"
                    rows="10"
                  >{}</textarea>
                </div>
                
                <div class="tab-pane hidden" data-pane="headers">
                  <div id="headers-list" class="space-y-2 mb-3">
                    <div class="flex gap-2">
                      <input type="text" name="graphql-header-name" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Header name" value="Content-Type" />
                      <input type="text" name="graphql-header-value" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Header value" value="application/json" />
                      <button class="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md" data-remove="header">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <button class="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30" data-add="header">Add Header</button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Response</h3>
              <div class="text-sm text-gray-600 dark:text-gray-400" id="response-meta"></div>
            </div>
            <pre id="response-output" class="w-full p-4 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white font-mono text-sm overflow-x-auto" style="min-height: 200px; max-height: 400px;">
<span class="text-gray-500 dark:text-gray-400">Execute a query to see the response here</span>
            </pre>
            <button class="mt-3 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="copy-response" hidden>
              Copy Response
            </button>
          </div>
        </div>
        
        <div class="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Query History</h3>
          <div id="query-history" class="space-y-2"></div>
        </div>
        
        <div class="mt-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Example Queries</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="countries">Countries API</button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="spacex">SpaceX API</button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="github">GitHub API</button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="pokemon">Pokemon API</button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="introspection">Introspection</button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="mutation">Mutation Example</button>
          </div>
        </div>
        </div>
      </div>
      </div>
    `;
  }
  
  attachEventListeners() {
    this.loadExampleQuery();
    
    // Execute query
    this.container.querySelector('[data-action="execute"]').addEventListener('click', () => {
      this.executeQuery();
    });
    
    // Prettify query
    this.container.querySelector('[data-action="prettify"]').addEventListener('click', () => {
      this.prettifyQuery();
    });
    
    // Copy query
    this.container.querySelector('[data-action="copy-query"]').addEventListener('click', () => {
      this.copyQuery();
    });
    
    // Copy response
    this.container.querySelector('[data-action="copy-response"]').addEventListener('click', () => {
      this.copyResponse();
    });
    
    // Clear
    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => {
      this.clear();
    });
    
    // Tab switching
    this.container.querySelectorAll('.tab-button').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });
    
    // Add header
    this.container.querySelector('[data-add="header"]').addEventListener('click', () => {
      this.addHeader();
    });
    
    // Remove header (delegated)
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('[data-remove="header"]')) {
        e.target.closest('.flex.gap-2').remove();
      }
    });
    
    // Example queries
    this.container.querySelectorAll('[data-example]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.loadExample(btn.dataset.example);
      });
    });
    
    // Query history (delegated)
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('.history-item')) {
        const index = parseInt(e.target.closest('.history-item').dataset.index);
        this.loadFromHistory(index);
      }
    });
    
    // Line numbers for query editor
    const queryEditor = this.container.querySelector('#query-editor');
    queryEditor.addEventListener('input', () => this.updateLineNumbers());
    queryEditor.addEventListener('scroll', () => this.syncLineNumberScroll());
    
    // Keyboard shortcuts
    queryEditor.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Enter to execute
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        this.executeQuery();
      }
      // Ctrl/Cmd + Shift + P to prettify
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        this.prettifyQuery();
      }
    });
    
    // Initialize line numbers
    this.updateLineNumbers();
  }
  
  switchTab(tab) {
    // Update buttons
    this.container.querySelectorAll('[data-tab]').forEach(btn => {
      if (btn.dataset.tab === tab) {
        btn.className = 'px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400';
      } else {
        btn.className = 'px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white';
      }
    });
    
    // Update panes
    this.container.querySelectorAll('.tab-pane').forEach(pane => {
      if (pane.dataset.pane === tab) {
        pane.classList.remove('hidden');
        pane.classList.add('block');
      } else {
        pane.classList.remove('block');
        pane.classList.add('hidden');
      }
    });
  }
  
  async executeQuery() {
    const endpoint = this.container.querySelector('#endpoint-input').value.trim();
    const query = this.container.querySelector('#query-editor').value.trim();
    
    if (!endpoint) {
      this.showError('Please enter a GraphQL endpoint');
      return;
    }
    
    if (!query) {
      this.showError('Please enter a GraphQL query');
      return;
    }
    
    // Parse variables
    let variables = {};
    try {
      const variablesText = this.container.querySelector('#variables-editor').value.trim();
      if (variablesText) {
        variables = JSON.parse(variablesText);
      }
    } catch (e) {
      this.showError('Invalid JSON in variables: ' + e.message);
      return;
    }
    
    // Collect headers
    const headers = {
      'Content-Type': 'application/json'
    };
    this.container.querySelectorAll('#headers-list .flex.gap-2').forEach(item => {
      const inputs = item.querySelectorAll('input');
      const key = inputs[0]?.value.trim();
      const value = inputs[1]?.value.trim();
      if (key) headers[key] = value;
    });
    
    // Show loading state
    const responseOutput = this.container.querySelector('#response-output');
    const responseMeta = this.container.querySelector('#response-meta');
    responseOutput.innerHTML = '<span class="text-gray-500 dark:text-gray-400">Executing query...</span>';
    responseMeta.textContent = '';
    
    const startTime = performance.now();
    
    try {
      // Simulate GraphQL request (in real app, would make actual request)
      const response = await this.simulateGraphQLRequest(endpoint, query, variables);
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      // Display response
      this.displayResponse(response, duration);
      
      // Add to history
      this.addToHistory(query, endpoint, variables);
      
      // Show copy button
      this.container.querySelector('[data-action="copy-response"]').hidden = false;
    } catch (error) {
      this.showError(`Request failed: ${error.message}`);
    }
  }
  
  async simulateGraphQLRequest(endpoint, query, variables) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
    
    // Parse query to determine type
    const isIntrospection = query.includes('__schema') || query.includes('__type');
    const isMutation = query.trim().startsWith('mutation');
    
    // Generate appropriate mock response
    if (isIntrospection) {
      return this.generateIntrospectionResponse();
    } else if (isMutation) {
      return this.generateMutationResponse(query, variables);
    } else {
      return this.generateQueryResponse(query, variables, endpoint);
    }
  }
  
  generateQueryResponse(query, variables, endpoint) {
    // Generate different responses based on endpoint
    if (endpoint.includes('countries')) {
      return {
        data: {
          countries: [
            { code: 'US', name: 'United States', emoji: '🇺🇸', capital: 'Washington D.C.' },
            { code: 'GB', name: 'United Kingdom', emoji: '🇬🇧', capital: 'London' },
            { code: 'JP', name: 'Japan', emoji: '🇯🇵', capital: 'Tokyo' }
          ]
        }
      };
    } else if (endpoint.includes('spacex')) {
      return {
        data: {
          launches: [
            { id: '1', mission_name: 'FalconSat', launch_year: '2006', launch_success: false },
            { id: '2', mission_name: 'DemoSat', launch_year: '2007', launch_success: false },
            { id: '3', mission_name: 'Trailblazer', launch_year: '2008', launch_success: false }
          ]
        }
      };
    } else if (endpoint.includes('github')) {
      return {
        data: {
          viewer: {
            login: 'octocat',
            name: 'The Octocat',
            repositories: {
              totalCount: 42,
              nodes: [
                { name: 'Hello-World', stargazerCount: 100 },
                { name: 'octocat.github.io', stargazerCount: 50 }
              ]
            }
          }
        }
      };
    } else {
      // Generic response
      return {
        data: {
          result: 'Success',
          timestamp: new Date().toISOString(),
          message: 'Query executed successfully'
        }
      };
    }
  }
  
  generateMutationResponse(query, variables) {
    return {
      data: {
        createItem: {
          id: Math.random().toString(36).substr(2, 9),
          ...variables,
          createdAt: new Date().toISOString(),
          success: true
        }
      }
    };
  }
  
  generateIntrospectionResponse() {
    return {
      data: {
        __schema: {
          queryType: { name: 'Query' },
          mutationType: { name: 'Mutation' },
          subscriptionType: { name: 'Subscription' },
          types: [
            {
              kind: 'OBJECT',
              name: 'Query',
              fields: [
                { name: 'user', type: { name: 'User' } },
                { name: 'posts', type: { name: 'Post' } }
              ]
            },
            {
              kind: 'OBJECT',
              name: 'User',
              fields: [
                { name: 'id', type: { name: 'ID' } },
                { name: 'name', type: { name: 'String' } },
                { name: 'email', type: { name: 'String' } }
              ]
            }
          ]
        }
      }
    };
  }
  
  displayResponse(response, duration) {
    const responseOutput = this.container.querySelector('#response-output');
    const responseMeta = this.container.querySelector('#response-meta');
    
    // Format response
    const formatted = JSON.stringify(response, null, 2);
    
    // Syntax highlight
    const highlighted = this.syntaxHighlightJSON(formatted);
    
    responseOutput.innerHTML = highlighted;
    responseMeta.innerHTML = `
      <span class="response-status ${response.errors ? 'error' : 'success'}">
        ${response.errors ? 'Error' : 'Success'}
      </span>
      <span class="response-time">${duration}ms</span>
      <span class="response-size">${new Blob([formatted]).size} bytes</span>
    `;
  }
  
  syntaxHighlightJSON(json) {
    return json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
      .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
      .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
      .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
      .replace(/: null/g, ': <span class="json-null">null</span>');
  }
  
  prettifyQuery() {
    const queryEditor = this.container.querySelector('#query-editor');
    const query = queryEditor.value;
    
    if (!query.trim()) return;
    
    try {
      // Basic GraphQL prettification
      const prettified = this.prettifyGraphQL(query);
      queryEditor.value = prettified;
      this.updateLineNumbers();
    } catch (e) {
      this.showError('Failed to prettify query');
    }
  }
  
  prettifyGraphQL(query) {
    // Remove extra whitespace and newlines
    let formatted = query.trim();
    
    // Add proper indentation
    let indent = 0;
    const lines = formatted.split('\n');
    const result = [];
    
    for (let line of lines) {
      const trimmed = line.trim();
      
      // Decrease indent for closing braces
      if (trimmed.startsWith('}') || trimmed.startsWith(')')) {
        indent = Math.max(0, indent - 1);
      }
      
      // Add indented line
      if (trimmed) {
        result.push('  '.repeat(indent) + trimmed);
      } else {
        result.push('');
      }
      
      // Increase indent for opening braces
      if (trimmed.endsWith('{') || trimmed.endsWith('(')) {
        indent++;
      }
    }
    
    return result.join('\n');
  }
  
  updateLineNumbers() {
    const queryEditor = this.container.querySelector('#query-editor');
    const lineNumbers = this.container.querySelector('#line-numbers');
    
    // Skip if elements don't exist (simplified editor)
    if (!lineNumbers || !queryEditor) return;
    
    const lines = queryEditor.value.split('\n').length;
    const numbers = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
    
    lineNumbers.textContent = numbers;
  }
  
  syncLineNumberScroll() {
    const queryEditor = this.container.querySelector('#query-editor');
    const lineNumbers = this.container.querySelector('#line-numbers');
    
    // Skip if elements don't exist (simplified editor)
    if (!lineNumbers || !queryEditor) return;
    
    lineNumbers.scrollTop = queryEditor.scrollTop;
  }
  
  addHeader() {
    const headersList = this.container.querySelector('#headers-list');
    const headerItem = document.createElement('div');
    headerItem.className = 'flex gap-2';
    headerItem.innerHTML = `
      <input type="text" name="graphql-header-name-new" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Header name" />
      <input type="text" name="graphql-header-value-new" class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Header value" />
      <button class="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-md" data-remove="header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;
    headersList.appendChild(headerItem);
  }
  
  addToHistory(query, endpoint, variables) {
    this.queryHistory.unshift({
      query,
      endpoint,
      variables,
      timestamp: new Date().toISOString()
    });
    
    // Limit history
    if (this.queryHistory.length > 10) {
      this.queryHistory.pop();
    }
    
    this.updateHistoryDisplay();
  }
  
  updateHistoryDisplay() {
    const historyDiv = this.container.querySelector('#query-history');
    
    if (this.queryHistory.length === 0) {
      historyDiv.innerHTML = '<div class="placeholder-message">No query history yet</div>';
      return;
    }
    
    historyDiv.innerHTML = this.queryHistory.map((item, index) => {
      const queryPreview = item.query.split('\n')[0].substring(0, 50) + '...';
      const time = new Date(item.timestamp).toLocaleTimeString();
      
      return `
        <div class="history-item" data-index="${index}">
          <div class="history-query">${queryPreview}</div>
          <div class="history-meta">
            <span class="history-endpoint">${new URL(item.endpoint).hostname}</span>
            <span class="history-time">${time}</span>
          </div>
        </div>
      `;
    }).join('');
  }
  
  loadFromHistory(index) {
    const item = this.queryHistory[index];
    if (!item) return;
    
    this.container.querySelector('#endpoint-input').value = item.endpoint;
    this.container.querySelector('#query-editor').value = item.query;
    this.container.querySelector('#variables-editor').value = JSON.stringify(item.variables, null, 2);
    
    this.updateLineNumbers();
    this.switchTab('query');
  }
  
  copyQuery() {
    const query = this.container.querySelector('#query-editor').value;
    navigator.clipboard.writeText(query).then(() => {
      this.showSuccess('Query copied to clipboard');
    });
  }
  
  copyResponse() {
    const response = this.container.querySelector('#response-output').textContent;
    navigator.clipboard.writeText(response).then(() => {
      this.showSuccess('Response copied to clipboard');
    });
  }
  
  clear() {
    this.container.querySelector('#query-editor').value = '';
    this.container.querySelector('#variables-editor').value = '{}';
    this.container.querySelector('#response-output').innerHTML = '<span class="placeholder">Execute a query to see the response here</span>';
    this.container.querySelector('#response-meta').textContent = '';
    this.container.querySelector('[data-action="copy-response"]').hidden = true;
    
    // Reset headers to default
    const headersList = this.container.querySelector('#headers-list');
    headersList.innerHTML = `
      <div class="header-item">
        <input type="text" name="graphql-header-key" class="header-key" placeholder="Header name" value="Content-Type" />
        <input type="text" name="graphql-header-value" class="header-value" placeholder="Header value" value="application/json" />
        <button class="btn-icon btn-remove" data-remove="header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `;
    
    this.updateLineNumbers();
  }
  
  showError(message) {
    const responseOutput = this.container.querySelector('#response-output');
    const responseMeta = this.container.querySelector('#response-meta');
    
    // Escape HTML to prevent XSS from error messages
    const escapedMessage = this.escapeHtml(message);
    responseOutput.innerHTML = `<span class="error">${escapedMessage}</span>`;
    responseMeta.innerHTML = '<span class="response-status error">Error</span>';
  }
  
  showSuccess(message) {
    // Show temporary success message
    const btn = event.target.closest('button');
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = message;
      btn.classList.add('btn-success');
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('btn-success');
      }, 2000);
    }
  }
  
  loadExample(type) {
    const examples = {
      countries: {
        endpoint: 'https://countries.trevorblades.com/',
        query: `query GetCountries {
  countries {
    code
    name
    emoji
    capital
    currency
    languages {
      code
      name
    }
  }
}`,
        variables: {}
      },
      spacex: {
        endpoint: 'https://api.spacex.land/graphql/',
        query: `query GetLaunches($limit: Int!) {
  launches(limit: $limit) {
    id
    mission_name
    launch_year
    launch_success
    rocket {
      rocket_name
      rocket_type
    }
  }
}`,
        variables: { limit: 10 }
      },
      github: {
        endpoint: 'https://api.github.com/graphql',
        query: `query GetUserInfo($login: String!) {
  user(login: $login) {
    name
    bio
    avatarUrl
    repositories(first: 10) {
      nodes {
        name
        description
        stargazerCount
      }
    }
  }
}`,
        variables: { login: 'octocat' }
      },
      pokemon: {
        endpoint: 'https://graphql-pokemon2.vercel.app/',
        query: `query GetPokemon($name: String!) {
  pokemon(name: $name) {
    id
    number
    name
    types
    resistant
    weaknesses
    attacks {
      fast {
        name
        type
        damage
      }
    }
  }
}`,
        variables: { name: 'Pikachu' }
      },
      introspection: {
        endpoint: 'https://countries.trevorblades.com/',
        query: `query IntrospectionQuery {
  __schema {
    queryType { name }
    mutationType { name }
    subscriptionType { name }
    types {
      ...FullType
    }
  }
}

fragment FullType on __Type {
  kind
  name
  description
  fields(includeDeprecated: true) {
    name
    description
    args {
      ...InputValue
    }
    type {
      ...TypeRef
    }
    isDeprecated
    deprecationReason
  }
}

fragment InputValue on __InputValue {
  name
  description
  type { ...TypeRef }
  defaultValue
}

fragment TypeRef on __Type {
  kind
  name
  ofType {
    kind
    name
  }
}`,
        variables: {}
      },
      mutation: {
        endpoint: 'https://api.example.com/graphql',
        query: `mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
    createdAt
  }
}`,
        variables: {
          input: {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'secure123'
          }
        }
      }
    };
    
    const example = examples[type];
    if (example) {
      this.container.querySelector('#endpoint-input').value = example.endpoint;
      this.container.querySelector('#query-editor').value = example.query;
      this.container.querySelector('#variables-editor').value = JSON.stringify(example.variables, null, 2);
      this.updateLineNumbers();
    }
  }
  
  loadExampleQuery() {
    this.loadExample('countries');
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}