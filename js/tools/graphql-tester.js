export class GraphQLTester {
  constructor() {
    this.container = null;
    this.queryHistory = [];
    this.variables = {};
    this.headers = {};
  }
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.render();
    this.attachEventListeners();
    this.loadExampleQuery();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="tool-container">
        <div class="tool-header">
          <h1>GraphQL Tester</h1>
          <p class="tool-description">Test GraphQL queries and mutations with variables, headers, and introspection</p>
        </div>
        
        <div class="tool-controls">
          <button class="btn btn-primary" data-action="execute">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Execute Query
          </button>
          <button class="btn btn-secondary" data-action="prettify">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="4 7 4 4 20 4 20 7"/>
              <line x1="9" y1="20" x2="15" y2="20"/>
              <line x1="12" y1="4" x2="12" y2="20"/>
            </svg>
            Prettify
          </button>
          <button class="btn btn-secondary" data-action="copy-query">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy Query
          </button>
          <button class="btn btn-secondary" data-action="clear">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear
          </button>
        </div>
        
        <div class="graphql-container">
          <div class="config-section">
            <div class="form-group">
              <label for="endpoint-input">GraphQL Endpoint</label>
              <input 
                type="text" 
                id="endpoint-input" 
                class="form-input" 
                placeholder="https://api.example.com/graphql"
                value="https://countries.trevorblades.com/"
              />
            </div>
            
            <div class="tabs">
              <div class="tab-buttons">
                <button class="tab-button active" data-tab="query">Query</button>
                <button class="tab-button" data-tab="variables">Variables</button>
                <button class="tab-button" data-tab="headers">Headers</button>
              </div>
              
              <div class="tab-content">
                <div class="tab-pane active" data-pane="query">
                  <div class="editor-wrapper">
                    <div class="line-numbers" id="line-numbers"></div>
                    <textarea 
                      id="query-editor" 
                      class="code-editor"
                      placeholder="# Write your GraphQL query here
query {
  field
}"
                      spellcheck="false"
                    ></textarea>
                  </div>
                </div>
                
                <div class="tab-pane" data-pane="variables">
                  <textarea 
                    id="variables-editor" 
                    class="code-editor"
                    placeholder='{
  "variableName": "value"
}'
                    spellcheck="false"
                  >{}</textarea>
                </div>
                
                <div class="tab-pane" data-pane="headers">
                  <div id="headers-list" class="headers-list">
                    <div class="header-item">
                      <input type="text" class="header-key" placeholder="Header name" value="Content-Type" />
                      <input type="text" class="header-value" placeholder="Header value" value="application/json" />
                      <button class="btn-icon btn-remove" data-remove="header">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <button class="btn btn-sm" data-add="header">Add Header</button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="response-section">
            <div class="response-header">
              <h3>Response</h3>
              <div class="response-meta" id="response-meta"></div>
            </div>
            <pre id="response-output" class="response-output">
<span class="placeholder">Execute a query to see the response here</span>
            </pre>
            <button class="btn btn-secondary" data-action="copy-response" hidden>
              Copy Response
            </button>
          </div>
        </div>
        
        <div class="query-history-section">
          <h3>Query History</h3>
          <div id="query-history" class="query-history"></div>
        </div>
        
        <div class="examples-section">
          <h3>Example Queries</h3>
          <div class="examples-grid">
            <button class="example-btn" data-example="countries">Countries API</button>
            <button class="example-btn" data-example="spacex">SpaceX API</button>
            <button class="example-btn" data-example="github">GitHub API</button>
            <button class="example-btn" data-example="pokemon">Pokemon API</button>
            <button class="example-btn" data-example="introspection">Introspection</button>
            <button class="example-btn" data-example="mutation">Mutation Example</button>
          </div>
        </div>
      </div>
    `;
  }
  
  attachEventListeners() {
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
        e.target.closest('.header-item').remove();
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
    this.container.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Update panes
    this.container.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.toggle('active', pane.dataset.pane === tab);
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
    this.container.querySelectorAll('#headers-list .header-item').forEach(item => {
      const key = item.querySelector('.header-key').value.trim();
      const value = item.querySelector('.header-value').value.trim();
      if (key) headers[key] = value;
    });
    
    // Show loading state
    const responseOutput = this.container.querySelector('#response-output');
    const responseMeta = this.container.querySelector('#response-meta');
    responseOutput.innerHTML = '<span class="loading">Executing query...</span>';
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
    
    const lines = queryEditor.value.split('\n').length;
    const numbers = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
    
    lineNumbers.textContent = numbers;
  }
  
  syncLineNumberScroll() {
    const queryEditor = this.container.querySelector('#query-editor');
    const lineNumbers = this.container.querySelector('#line-numbers');
    lineNumbers.scrollTop = queryEditor.scrollTop;
  }
  
  addHeader() {
    const headersList = this.container.querySelector('#headers-list');
    const headerItem = document.createElement('div');
    headerItem.className = 'header-item';
    headerItem.innerHTML = `
      <input type="text" class="header-key" placeholder="Header name" />
      <input type="text" class="header-value" placeholder="Header value" />
      <button class="btn-icon btn-remove" data-remove="header">
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
        <input type="text" class="header-key" placeholder="Header name" value="Content-Type" />
        <input type="text" class="header-value" placeholder="Header value" value="application/json" />
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
    
    responseOutput.innerHTML = `<span class="error">${message}</span>`;
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
}