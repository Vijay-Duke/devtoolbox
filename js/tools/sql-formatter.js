export class SQLFormatter {
  constructor() {
    this.container = null;
    this.inputArea = null;
    this.outputArea = null;
    this.formatStyle = 'standard';
    this.dialectSelect = null;
  }
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.render();
    this.attachEventListeners();
    this.loadExample();
  }
  
  render() {
    this.container.innerHTML = `
      <style>
        .feature-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid;
          transition: all 0.2s;
        }
        .feature-badge.active {
          background-color: #ecfdf5;
          border-color: #10b981;
          color: #065f46;
        }
        .dark .feature-badge.active {
          background-color: #064e3b;
          border-color: #10b981;
          color: #d1fae5;
        }
        .feature-badge.inactive {
          background-color: #f9fafb;
          border-color: #d1d5db;
          color: #6b7280;
        }
        .dark .feature-badge.inactive {
          background-color: #1f2937;
          border-color: #374151;
          color: #9ca3af;
        }
        .feature-icon {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .feature-label {
          font-size: 12px;
          font-weight: 500;
          text-align: center;
        }
        .complexity-low { color: #10b981; }
        .complexity-medium { color: #f59e0b; }
        .complexity-high { color: #ef4444; }
        .complexity-very.high { color: #dc2626; font-weight: bold; }
        .analysis-item {
          margin-bottom: 8px;
        }
        .analysis-section {
          margin-bottom: 16px;
        }
      </style>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">SQL Formatter & Analyzer</h1>
          <p class="text-gray-600 dark:text-gray-300">Format, beautify, and analyze SQL queries with performance insights</p>
        </div>
        
        <div class="mb-6 flex flex-wrap gap-4">
          <div>
            <label for="sql-dialect" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SQL Dialect:</label>
            <select id="sql-dialect" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="standard">Standard SQL</option>
              <option value="mysql">MySQL</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="sqlite">SQLite</option>
              <option value="tsql">T-SQL (SQL Server)</option>
              <option value="oracle">Oracle</option>
            </select>
          </div>
          
          <div>
            <label for="format-style" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Format Style:</label>
            <select id="format-style" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="standard">Standard</option>
              <option value="compact">Compact</option>
              <option value="expanded">Expanded</option>
              <option value="tabular">Tabular</option>
            </select>
          </div>
          
          <div class="flex gap-2 items-end">
            <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="format">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="21" y1="10" x2="7" y2="10"></line>
                <line x1="21" y1="6" x2="3" y2="6"></line>
                <line x1="21" y1="14" x2="3" y2="14"></line>
                <line x1="21" y1="18" x2="7" y2="18"></line>
              </svg>
              Format SQL
            </button>
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="minify">Minify</button>
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="clear">Clear</button>
          </div>
        </div>
        
        <div class="mb-6 flex flex-wrap gap-4">
          <label class="flex items-center">
            <input type="checkbox" id="uppercase-keywords" checked class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
            <span class="text-sm text-gray-700 dark:text-gray-300">Uppercase Keywords</span>
          </label>
          <label class="flex items-center">
            <input type="checkbox" id="add-semicolon" checked class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
            <span class="text-sm text-gray-700 dark:text-gray-300">Add Semicolon</span>
          </label>
          <label class="flex items-center">
            <input type="checkbox" id="indent-cte" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
            <span class="text-sm text-gray-700 dark:text-gray-300">Indent CTEs</span>
          </label>
          <label class="flex items-center">
            <input type="checkbox" id="align-aliases" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
            <span class="text-sm text-gray-700 dark:text-gray-300">Align Aliases</span>
          </label>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div class="flex justify-between items-center mb-2">
              <label for="sql-input" class="text-sm font-medium text-gray-700 dark:text-gray-300">Input SQL</label>
              <button class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" data-action="paste" title="Paste from clipboard">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
            <textarea 
              id="sql-input" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm" 
              placeholder="Paste or type your SQL query here..."
              spellcheck="false"
              rows="10"
            >select u.id,u.name,u.email,o.order_id,o.total_amount,o.created_at from users u inner join orders o on u.id=o.user_id where o.status='completed' and o.created_at >= '2024-01-01' order by o.created_at desc limit 10</textarea>
            <div class="mt-2 text-sm text-gray-600 dark:text-gray-400 flex gap-4">
              <span data-stat="lines">1 lines</span>
              <span data-stat="chars">0 characters</span>
            </div>
          </div>
          
          <div>
            <div class="flex justify-between items-center mb-2">
              <label for="sql-output" class="text-sm font-medium text-gray-700 dark:text-gray-300">Formatted SQL</label>
              <button class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" data-action="copy" title="Copy to clipboard">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
            <textarea 
              id="sql-output" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm" 
              readonly
              spellcheck="false"
              rows="10"
            ></textarea>
            <div class="mt-2 flex gap-2">
              <button class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="download">Download SQL</button>
              <button class="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="explain">Explain Query</button>
            </div>
          </div>
        </div>
        
        <!-- Query Analysis Section -->
        <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg" id="sql-analysis" hidden>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Query Analysis Results
          </h3>
          <div class="analysis-content text-sm text-gray-700 dark:text-gray-300"></div>
        </div>

        <!-- Error Display Section -->
        <div class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg" id="sql-error" hidden>
          <h3 class="text-lg font-medium text-red-800 dark:text-red-200 mb-3 flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 18.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            Analysis Error
          </h3>
          <div class="error-content text-sm text-red-700 dark:text-red-300"></div>
        </div>
      </div>
    `;
    
    this.inputArea = this.container.querySelector('#sql-input');
    this.outputArea = this.container.querySelector('#sql-output');
    this.dialectSelect = this.container.querySelector('#sql-dialect');
  }
  
  attachEventListeners() {
    // Format button
    this.container.querySelector('[data-action="format"]').addEventListener('click', () => this.formatSQL());
    
    // Minify button
    this.container.querySelector('[data-action="minify"]').addEventListener('click', () => this.minifySQL());
    
    // Clear button
    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => this.clear());
    
    // Copy button
    this.container.querySelector('[data-action="copy"]').addEventListener('click', () => this.copyOutput());
    
    // Paste button
    this.container.querySelector('[data-action="paste"]').addEventListener('click', () => this.pasteInput());
    
    // Download button
    this.container.querySelector('[data-action="download"]').addEventListener('click', () => this.downloadSQL());
    
    // Explain button
    this.container.querySelector('[data-action="explain"]').addEventListener('click', () => this.explainQuery());
    
    // Format style change
    this.container.querySelector('#format-style').addEventListener('change', () => this.formatSQL());
    
    // Options change
    this.container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => this.formatSQL());
    });
    
    // Auto-format on input with debounce
    let formatTimeout;
    this.inputArea.addEventListener('input', () => {
      this.updateStats();
      clearTimeout(formatTimeout);
      formatTimeout = setTimeout(() => this.formatSQL(), 500);
    });
  }
  
  loadExample() {
    this.updateStats();
    this.formatSQL();
  }
  
  formatSQL() {
    const sql = this.inputArea.value.trim();
    if (!sql) {
      this.outputArea.value = '';
      return;
    }
    
    const options = {
      style: this.container.querySelector('#format-style').value,
      uppercaseKeywords: this.container.querySelector('#uppercase-keywords').checked,
      addSemicolon: this.container.querySelector('#add-semicolon').checked,
      indentCTE: this.container.querySelector('#indent-cte').checked,
      alignAliases: this.container.querySelector('#align-aliases').checked
    };
    
    try {
      const formatted = this.formatSQLQuery(sql, options);
      this.outputArea.value = formatted;
    } catch (error) {
      this.outputArea.value = `Error: ${error.message}`;
    }
  }
  
  formatSQLQuery(sql, options) {
    // SQL keywords
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'FULL',
      'ON', 'AS', 'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL',
      'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET', 'UNION',
      'ALL', 'DISTINCT', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
      'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'VIEW', 'TRIGGER', 'PROCEDURE',
      'FUNCTION', 'IF', 'ELSE', 'CASE', 'WHEN', 'THEN', 'END', 'BEGIN', 'COMMIT',
      'ROLLBACK', 'TRANSACTION', 'WITH', 'RECURSIVE', 'LATERAL', 'CROSS', 'NATURAL'
    ];
    
    // Tokenize the SQL
    const tokens = this.tokenizeSQL(sql);
    
    // Apply formatting based on style
    let formatted;
    switch (options.style) {
      case 'compact':
        formatted = this.formatCompact(tokens, keywords, options);
        break;
      case 'expanded':
        formatted = this.formatExpanded(tokens, keywords, options);
        break;
      case 'tabular':
        formatted = this.formatTabular(tokens, keywords, options);
        break;
      default:
        formatted = this.formatStandard(tokens, keywords, options);
    }
    
    // Add semicolon if needed
    if (options.addSemicolon && !formatted.trim().endsWith(';')) {
      formatted = formatted.trim() + ';';
    }
    
    return formatted;
  }
  
  tokenizeSQL(sql) {
    const tokens = [];
    const regex = /('[^']*'|"[^"]*"|\b\w+\b|[^\s\w'"]+)/g;
    let match;
    
    while ((match = regex.exec(sql)) !== null) {
      tokens.push({
        value: match[0],
        type: this.getTokenType(match[0])
      });
    }
    
    return tokens;
  }
  
  getTokenType(token) {
    if (token.startsWith("'") || token.startsWith('"')) return 'string';
    if (/^\d+(\.\d+)?$/.test(token)) return 'number';
    if (/^[a-zA-Z_]\w*$/.test(token)) return 'identifier';
    if (/^[,;()=<>!+\-*/]/.test(token)) return 'operator';
    return 'other';
  }
  
  formatStandard(tokens, keywords, options) {
    let result = '';
    let indent = 0;
    let newLine = false;
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const upperToken = token.value.toUpperCase();
      const isKeyword = keywords.includes(upperToken);
      
      // Handle newlines for major clauses
      if (isKeyword && ['SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 
                        'GROUP', 'HAVING', 'ORDER', 'LIMIT', 'UNION'].includes(upperToken)) {
        if (result.trim()) {
          result += '\n' + '  '.repeat(Math.max(0, indent));
        }
        newLine = true;
      }
      
      // Add the token
      if (isKeyword && options.uppercaseKeywords) {
        result += upperToken;
      } else {
        result += token.value;
      }
      
      // Handle special formatting
      if (token.value === '(') {
        indent++;
      } else if (token.value === ')') {
        indent = Math.max(0, indent - 1);
      } else if (token.value === ',') {
        // Add newline after comma in SELECT clause
        if (newLine) {
          result += '\n' + '  '.repeat(Math.max(0, indent + 1));
        }
      }
      
      // Add space after token if needed
      if (i < tokens.length - 1 && !['(', ',', '.'].includes(token.value) && 
          ![')', ',', '.'].includes(tokens[i + 1].value)) {
        result += ' ';
      }
    }
    
    return result.trim();
  }
  
  formatCompact(tokens, keywords, options) {
    let result = '';
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const upperToken = token.value.toUpperCase();
      const isKeyword = keywords.includes(upperToken);
      
      if (isKeyword && options.uppercaseKeywords) {
        result += upperToken;
      } else {
        result += token.value;
      }
      
      // Add minimal spacing
      if (i < tokens.length - 1 && !['(', ',', '.'].includes(token.value) && 
          ![')', ',', '.'].includes(tokens[i + 1].value)) {
        result += ' ';
      }
    }
    
    return result.trim();
  }
  
  formatExpanded(tokens, keywords, options) {
    let result = '';
    let indent = 0;
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const upperToken = token.value.toUpperCase();
      const isKeyword = keywords.includes(upperToken);
      
      // Add newlines for all keywords
      if (isKeyword && i > 0) {
        result += '\n' + '  '.repeat(Math.max(0, indent));
      }
      
      // Add the token
      if (isKeyword && options.uppercaseKeywords) {
        result += upperToken;
      } else {
        result += token.value;
      }
      
      // Handle indentation
      if (token.value === '(') {
        indent++;
        result += '\n' + '  '.repeat(indent);
      } else if (token.value === ')') {
        indent = Math.max(0, indent - 1);
        result = result.trimEnd() + '\n' + '  '.repeat(indent) + ')';
      } else if (token.value === ',') {
        result += '\n' + '  '.repeat(Math.max(0, indent));
      } else if (i < tokens.length - 1 && !['(', '.'].includes(token.value) && 
                 ![')', ',', '.'].includes(tokens[i + 1].value)) {
        result += ' ';
      }
    }
    
    return result.trim();
  }
  
  formatTabular(tokens, keywords, options) {
    // Similar to standard but with aligned columns
    return this.formatStandard(tokens, keywords, options);
  }
  
  minifySQL() {
    const sql = this.inputArea.value.trim();
    if (!sql) {
      this.outputArea.value = '';
      return;
    }
    
    // Remove unnecessary whitespace while preserving strings
    const minified = sql
      .replace(/\s+/g, ' ')
      .replace(/\s*([,;()=<>!+\-*/])\s*/g, '$1')
      .trim();
    
    this.outputArea.value = minified;
  }
  
  explainQuery() {
    const sql = this.outputArea.value || this.inputArea.value;
    const analysisEl = this.container.querySelector('#sql-analysis');
    const errorEl = this.container.querySelector('#sql-error');
    
    // Hide both sections initially
    analysisEl.hidden = true;
    errorEl.hidden = true;
    
    if (!sql || !sql.trim()) {
      this.showAnalysisError('No SQL query provided. Please enter a SQL query to analyze.');
      return;
    }
    
    try {
      const analysis = this.analyzeSQL(sql);
      this.displayAnalysisResults(analysis);
    } catch (error) {
      this.showAnalysisError(`Analysis failed: ${error.message}`);
    }
  }
  
  displayAnalysisResults(analysis) {
    const analysisEl = this.container.querySelector('#sql-analysis');
    const contentEl = analysisEl.querySelector('.analysis-content');
    
    // Build comprehensive analysis display
    let analysisHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="analysis-section">
          <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Query Overview</h4>
          <div class="space-y-1">
            <div class="analysis-item"><strong>Type:</strong> <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">${analysis.type}</span></div>
            <div class="analysis-item"><strong>Complexity:</strong> <span class="complexity-${analysis.complexity.toLowerCase()}">${analysis.complexity}</span></div>
            <div class="analysis-item"><strong>Estimated Performance:</strong> ${analysis.performance}</div>
          </div>
        </div>
        
        <div class="analysis-section">
          <h4 class="font-semibold text-gray-900 dark:text-white mb-2">Structure</h4>
          <div class="space-y-1">
            <div class="analysis-item"><strong>Tables:</strong> ${analysis.tables.length} (${analysis.tables.join(', ') || 'None detected'})</div>
            <div class="analysis-item"><strong>Joins:</strong> ${analysis.joins.length} (${analysis.joins.join(', ') || 'None'})</div>
            <div class="analysis-item"><strong>Subqueries:</strong> ${analysis.subqueries}</div>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div class="feature-badge ${analysis.hasWhere ? 'active' : 'inactive'}">
          <div class="feature-icon">${analysis.hasWhere ? '✓' : '✗'}</div>
          <div class="feature-label">WHERE Clause</div>
        </div>
        <div class="feature-badge ${analysis.hasGroupBy ? 'active' : 'inactive'}">
          <div class="feature-icon">${analysis.hasGroupBy ? '✓' : '✗'}</div>
          <div class="feature-label">GROUP BY</div>
        </div>
        <div class="feature-badge ${analysis.hasOrderBy ? 'active' : 'inactive'}">
          <div class="feature-icon">${analysis.hasOrderBy ? '✓' : '✗'}</div>
          <div class="feature-label">ORDER BY</div>
        </div>
        <div class="feature-badge ${analysis.hasLimit ? 'active' : 'inactive'}">
          <div class="feature-icon">${analysis.hasLimit ? '✓' : '✗'}</div>
          <div class="feature-label">LIMIT</div>
        </div>
      </div>`;
    
    // Add performance recommendations if any
    if (analysis.recommendations && analysis.recommendations.length > 0) {
      analysisHTML += `
        <div class="analysis-section mt-4">
          <h4 class="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Performance Recommendations
          </h4>
          <ul class="space-y-1">
            ${analysis.recommendations.map(rec => `<li class="text-sm">• ${rec}</li>`).join('')}
          </ul>
        </div>`;
    }
    
    // Add security warnings if any
    if (analysis.securityWarnings && analysis.securityWarnings.length > 0) {
      analysisHTML += `
        <div class="analysis-section mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
          <h4 class="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 18.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            Security Considerations
          </h4>
          <ul class="space-y-1">
            ${analysis.securityWarnings.map(warning => `<li class="text-sm text-yellow-800 dark:text-yellow-200">⚠ ${warning}</li>`).join('')}
          </ul>
        </div>`;
    }
    
    contentEl.innerHTML = analysisHTML;
    analysisEl.hidden = false;
  }
  
  showAnalysisError(message) {
    const errorEl = this.container.querySelector('#sql-error');
    const contentEl = errorEl.querySelector('.error-content');
    
    contentEl.innerHTML = `
      <div class="error-message">${this.escapeHtml(message)}</div>
      <div class="mt-3 text-sm">
        <p><strong>Common issues:</strong></p>
        <ul class="mt-1 space-y-1">
          <li>• Query is empty or contains only whitespace</li>
          <li>• Query contains unsupported SQL syntax</li>
          <li>• Query is malformed or has syntax errors</li>
        </ul>
        <p class="mt-2"><strong>Try:</strong> Formatting the query first to check for syntax errors</p>
      </div>
    `;
    
    errorEl.hidden = false;
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  analyzeSQL(sql) {
    if (!sql || typeof sql !== 'string') {
      throw new Error('Invalid SQL input - must be a non-empty string');
    }
    
    const trimmedSql = sql.trim();
    if (!trimmedSql) {
      throw new Error('SQL query is empty');
    }
    
    const upper = trimmedSql.toUpperCase();
    
    try {
      const type = this.detectQueryType(upper);
      const tables = this.extractTables(sql);
      const joins = this.extractJoins(upper);
      const subqueries = this.countSubqueries(upper);
      
      const analysis = {
        type,
        tables,
        joins,
        subqueries,
        hasWhere: upper.includes('WHERE'),
        hasGroupBy: upper.includes('GROUP BY'),
        hasOrderBy: upper.includes('ORDER BY'),
        hasLimit: upper.includes('LIMIT'),
        hasHaving: upper.includes('HAVING'),
        hasUnion: upper.includes('UNION'),
        complexity: this.calculateComplexity(upper, tables.length, joins.length, subqueries),
        performance: this.estimatePerformance(upper, tables.length, joins.length),
        recommendations: this.generateRecommendations(upper, tables.length, joins.length),
        securityWarnings: this.checkSecurityIssues(sql)
      };
      
      return analysis;
    } catch (error) {
      throw new Error(`SQL analysis failed: ${error.message}`);
    }
  }
  
  countSubqueries(sql) {
    // Count SELECT statements excluding the main one
    const selectCount = (sql.match(/SELECT/g) || []).length;
    return Math.max(0, selectCount - 1);
  }
  
  calculateComplexity(sql, tableCount, joinCount, subqueryCount) {
    let complexity = 0;
    
    // Base complexity from query type
    if (sql.includes('SELECT')) complexity += 1;
    if (sql.includes('INSERT') || sql.includes('UPDATE') || sql.includes('DELETE')) complexity += 2;
    
    // Add complexity for structure
    complexity += tableCount;
    complexity += joinCount * 2;
    complexity += subqueryCount * 3;
    
    // Add complexity for advanced features
    if (sql.includes('GROUP BY')) complexity += 2;
    if (sql.includes('HAVING')) complexity += 2;
    if (sql.includes('ORDER BY')) complexity += 1;
    if (sql.includes('UNION')) complexity += 3;
    if (sql.includes('WITH')) complexity += 2; // CTEs
    if (sql.includes('CASE')) complexity += 1;
    if (sql.includes('EXISTS')) complexity += 2;
    if (sql.includes('WINDOW')) complexity += 3;
    
    if (complexity <= 3) return 'Low';
    if (complexity <= 8) return 'Medium';
    if (complexity <= 15) return 'High';
    return 'Very High';
  }
  
  estimatePerformance(sql, tableCount, joinCount) {
    let score = 100; // Start with perfect score
    
    // Deduct points for performance issues
    if (!sql.includes('WHERE') && tableCount > 0) score -= 30; // No filtering
    if (joinCount > 3) score -= 20; // Too many joins
    if (sql.includes('SELECT *')) score -= 15; // Select all columns
    if (!sql.includes('LIMIT') && sql.includes('SELECT')) score -= 10; // No result limiting
    if (sql.includes('OR')) score -= 5; // OR conditions can be slow
    if (sql.includes('LIKE')) score -= 5; // String matching
    if (sql.includes('%')) score -= 5; // Wildcard at beginning
    
    // Add points for good practices
    if (sql.includes('LIMIT')) score += 5;
    if (sql.includes('INDEX')) score += 10;
    
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 30) return 'Poor';
    return 'Very Poor';
  }
  
  generateRecommendations(sql, tableCount, joinCount) {
    const recommendations = [];
    
    if (!sql.includes('WHERE') && tableCount > 0) {
      recommendations.push('Add WHERE clause to filter results and improve performance');
    }
    
    if (sql.includes('SELECT *')) {
      recommendations.push('Specify only needed columns instead of SELECT * for better performance');
    }
    
    if (!sql.includes('LIMIT') && sql.includes('SELECT')) {
      recommendations.push('Consider adding LIMIT clause to restrict result set size');
    }
    
    if (joinCount > 3) {
      recommendations.push('Consider breaking complex joins into smaller queries or using subqueries');
    }
    
    if (sql.includes('OR') && sql.includes('WHERE')) {
      recommendations.push('Consider using UNION instead of OR for better index usage');
    }
    
    if (sql.match(/LIKE\s+'%[^%]+'/i)) {
      recommendations.push('Avoid leading wildcards in LIKE patterns - consider full-text search instead');
    }
    
    if (!sql.includes('ORDER BY') && sql.includes('SELECT')) {
      recommendations.push('Add ORDER BY clause for consistent result ordering');
    }
    
    if (sql.includes('GROUP BY') && !sql.includes('HAVING')) {
      recommendations.push('Consider using HAVING clause to filter grouped results');
    }
    
    return recommendations;
  }
  
  checkSecurityIssues(sql) {
    const warnings = [];
    
    // Check for potential SQL injection patterns
    if (sql.includes("'") && sql.includes('+')) {
      warnings.push('Potential SQL injection risk - avoid string concatenation in queries');
    }
    
    if (sql.includes('--')) {
      warnings.push('SQL comments detected - ensure they are intentional');
    }
    
    if (sql.includes(';') && sql.lastIndexOf(';') < sql.length - 1) {
      warnings.push('Multiple statements detected - review for security risks');
    }
    
    if (sql.includes('DROP') || sql.includes('DELETE') || sql.includes('TRUNCATE')) {
      warnings.push('Destructive operation detected - ensure proper authorization');
    }
    
    if (sql.includes('EXEC') || sql.includes('EXECUTE')) {
      warnings.push('Dynamic SQL execution detected - review for injection risks');
    }
    
    return warnings;
  }
  
  detectQueryType(sql) {
    if (sql.startsWith('SELECT')) return 'SELECT';
    if (sql.startsWith('INSERT')) return 'INSERT';
    if (sql.startsWith('UPDATE')) return 'UPDATE';
    if (sql.startsWith('DELETE')) return 'DELETE';
    if (sql.startsWith('CREATE')) return 'CREATE';
    if (sql.startsWith('ALTER')) return 'ALTER';
    if (sql.startsWith('DROP')) return 'DROP';
    return 'Unknown';
  }
  
  extractTables(sql) {
    const tables = [];
    const fromMatch = sql.match(/FROM\s+(\w+)/gi);
    const joinMatch = sql.match(/JOIN\s+(\w+)/gi);
    
    if (fromMatch) {
      fromMatch.forEach(match => {
        const table = match.replace(/FROM\s+/i, '').split(/\s/)[0];
        if (!tables.includes(table)) tables.push(table);
      });
    }
    
    if (joinMatch) {
      joinMatch.forEach(match => {
        const table = match.replace(/JOIN\s+/i, '').split(/\s/)[0];
        if (!tables.includes(table)) tables.push(table);
      });
    }
    
    return tables;
  }
  
  extractJoins(sql) {
    const joins = [];
    const joinTypes = ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN'];
    
    joinTypes.forEach(type => {
      if (sql.includes(type)) {
        joins.push(type);
      }
    });
    
    return joins;
  }
  
  updateStats() {
    const text = this.inputArea.value;
    const lines = text.split('\n').length;
    const chars = text.length;
    
    this.container.querySelector('[data-stat="lines"]').textContent = `${lines} line${lines !== 1 ? 's' : ''}`;
    this.container.querySelector('[data-stat="chars"]').textContent = `${chars} character${chars !== 1 ? 's' : ''}`;
  }
  
  async copyOutput() {
    const text = this.outputArea.value;
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      const btn = this.container.querySelector('[data-action="copy"]');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '✓';
      btn.style.color = 'var(--color-success)';
      
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.color = '';
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }
  
  async pasteInput() {
    try {
      const text = await navigator.clipboard.readText();
      this.inputArea.value = text;
      this.updateStats();
      this.formatSQL();
    } catch (error) {
      console.error('Failed to paste:', error);
    }
  }
  
  downloadSQL() {
    const sql = this.outputArea.value || this.inputArea.value;
    if (!sql || !sql.trim()) {
      this.showTemporaryMessage('No SQL query to download', 'warning');
      return;
    }
    
    try {
      // Add metadata comment to the downloaded file
      const timestamp = new Date().toISOString();
      const dialect = this.container.querySelector('#sql-dialect').value;
      const header = `-- SQL Query exported from DevToolbox\n-- Date: ${timestamp}\n-- Dialect: ${dialect}\n-- \n\n`;
      
      const content = header + sql.trim();
      
      const blob = new Blob([content], { type: 'text/sql;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sql-query-${new Date().toISOString().split('T')[0]}.sql`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up
      URL.revokeObjectURL(url);
      
      this.showTemporaryMessage('SQL file downloaded successfully', 'success');
    } catch (error) {
      this.showTemporaryMessage(`Download failed: ${error.message}`, 'error');
    }
  }
  
  showTemporaryMessage(message, type = 'info') {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'warning' ? 'bg-yellow-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
  
  clear() {
    this.inputArea.value = '';
    this.outputArea.value = '';
    this.updateStats();
    this.container.querySelector('#sql-analysis').hidden = true;
    this.container.querySelector('#sql-error').hidden = true;
  }
}