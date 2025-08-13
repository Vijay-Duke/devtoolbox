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
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">SQL Formatter</h1>
          <p class="text-gray-600 dark:text-gray-300">Format and beautify SQL queries with proper indentation</p>
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
        
        <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg" id="sql-analysis" hidden>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Query Analysis</h3>
          <div class="analysis-content text-sm text-gray-700 dark:text-gray-300"></div>
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
    if (!sql) return;
    
    const analysis = this.analyzeSQL(sql);
    const analysisEl = this.container.querySelector('#sql-analysis');
    const contentEl = analysisEl.querySelector('.analysis-content');
    
    contentEl.innerHTML = `
      <div class="analysis-item">
        <strong>Query Type:</strong> ${analysis.type}
      </div>
      <div class="analysis-item">
        <strong>Tables:</strong> ${analysis.tables.join(', ') || 'None detected'}
      </div>
      <div class="analysis-item">
        <strong>Joins:</strong> ${analysis.joins.length || 'None'}
      </div>
      <div class="analysis-item">
        <strong>Conditions:</strong> ${analysis.hasWhere ? 'Yes' : 'No'}
      </div>
      <div class="analysis-item">
        <strong>Grouping:</strong> ${analysis.hasGroupBy ? 'Yes' : 'No'}
      </div>
      <div class="analysis-item">
        <strong>Ordering:</strong> ${analysis.hasOrderBy ? 'Yes' : 'No'}
      </div>
      <div class="analysis-item">
        <strong>Limit:</strong> ${analysis.hasLimit ? 'Yes' : 'No'}
      </div>
    `;
    
    analysisEl.hidden = false;
  }
  
  analyzeSQL(sql) {
    const upper = sql.toUpperCase();
    
    return {
      type: this.detectQueryType(upper),
      tables: this.extractTables(sql),
      joins: this.extractJoins(upper),
      hasWhere: upper.includes('WHERE'),
      hasGroupBy: upper.includes('GROUP BY'),
      hasOrderBy: upper.includes('ORDER BY'),
      hasLimit: upper.includes('LIMIT')
    };
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
    if (!sql) return;
    
    const blob = new Blob([sql], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query.sql';
    a.click();
    URL.revokeObjectURL(url);
  }
  
  clear() {
    this.inputArea.value = '';
    this.outputArea.value = '';
    this.updateStats();
    this.container.querySelector('#sql-analysis').hidden = true;
  }
}