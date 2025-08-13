export class RegexTester {
  constructor() {
    this.container = null;
    this.patternInput = null;
    this.testInput = null;
    this.flagsInputs = {};
    this.outputArea = null;
    this.matchesArea = null;
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
      <div class="max-w-7xl mx-auto p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Regex Tester</h1>
          <p class="text-gray-600 dark:text-gray-400">Test regular expressions with real-time pattern matching and highlighting</p>
        </div>
        
        <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <div class="mb-4">
            <label for="regex-pattern" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Regular Expression</label>
            <div class="flex items-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2">
              <span class="text-gray-500 font-mono text-lg">/</span>
              <input 
                type="text" 
                id="regex-pattern" 
                class="flex-1 px-2 py-1 bg-transparent font-mono text-sm focus:outline-none"
                placeholder="[a-zA-Z0-9]+@[a-zA-Z0-9]+\\.[a-zA-Z]+"
                spellcheck="false"
              />
              <span class="text-gray-500 font-mono text-lg">/</span>
              <div class="flex gap-1 ml-2">
                <label class="flex items-center px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer" title="Global match">
                  <input type="checkbox" id="flag-g" class="mr-1" checked />
                  <span class="font-mono">g</span>
                </label>
                <label class="flex items-center px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer" title="Case insensitive">
                  <input type="checkbox" id="flag-i" class="mr-1" />
                  <span class="font-mono">i</span>
                </label>
                <label class="flex items-center px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer" title="Multiline">
                  <input type="checkbox" id="flag-m" class="mr-1" />
                  <span class="font-mono">m</span>
                </label>
                <label class="flex items-center px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer" title="Dot matches newline">
                  <input type="checkbox" id="flag-s" class="mr-1" />
                  <span class="font-mono">s</span>
                </label>
                <label class="flex items-center px-2 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer" title="Unicode">
                  <input type="checkbox" id="flag-u" class="mr-1" />
                  <span class="font-mono">u</span>
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Common Patterns:</label>
            <div class="flex flex-wrap gap-2">
              <button class="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-sm" data-pattern="email">Email</button>
              <button class="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-sm" data-pattern="url">URL</button>
              <button class="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-sm" data-pattern="phone">Phone</button>
              <button class="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-sm" data-pattern="ipv4">IPv4</button>
              <button class="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-sm" data-pattern="date">Date</button>
              <button class="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-sm" data-pattern="hex">Hex Color</button>
              <button class="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-sm" data-pattern="uuid">UUID</button>
              <button class="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-sm" data-pattern="creditcard">Credit Card</button>
            </div>
          </div>
        </div>
        
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6" data-error hidden></div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <label for="test-string" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Test String</label>
            <textarea 
              id="test-string" 
              class="w-full h-40 p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Enter text to test against the regex pattern..."
              spellcheck="false"
            >Contact us at support@example.com or sales@company.org for more information.
Our phone numbers are (555) 123-4567 and 555-987-6543.
Visit our website at https://www.example.com</textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Highlighted Matches</label>
            <div id="highlighted-output" class="h-40 p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm whitespace-pre-wrap overflow-auto"></div>
          </div>
        </div>
        
        <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Match Information</h3>
          <div class="flex gap-6 mb-4 text-sm">
            <span class="text-gray-700 dark:text-gray-300">
              <strong>Total Matches:</strong>
              <span id="match-count" class="ml-1 font-mono">0</span>
            </span>
            <span class="text-gray-700 dark:text-gray-300">
              <strong>Pattern Valid:</strong>
              <span id="pattern-valid" class="ml-1 font-mono text-green-600 dark:text-green-400">✓</span>
            </span>
          </div>
          
          <div class="space-y-3" id="matches-grid"></div>
        </div>
        
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Reference</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">.</code>
              <span class="text-gray-700 dark:text-gray-300">Any character except newline</span>
            </div>
            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">\\d</code>
              <span class="text-gray-700 dark:text-gray-300">Digit (0-9)</span>
            </div>
            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">\\w</code>
              <span class="text-gray-700 dark:text-gray-300">Word character (a-z, A-Z, 0-9, _)</span>
            </div>
            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">\\s</code>
              <span class="text-gray-700 dark:text-gray-300">Whitespace</span>
            </div>
            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">^</code>
              <span class="text-gray-700 dark:text-gray-300">Start of string</span>
            </div>
            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">$</code>
              <span class="text-gray-700 dark:text-gray-300">End of string</span>
            </div>
            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">*</code>
              <span class="text-gray-700 dark:text-gray-300">0 or more</span>
            </div>
            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">+</code>
              <span class="text-gray-700 dark:text-gray-300">1 or more</span>
            </div>
            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">?</code>
              <span class="text-gray-700 dark:text-gray-300">0 or 1</span>
            </div>
            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">{n,m}</code>
              <span class="text-gray-700 dark:text-gray-300">Between n and m</span>
            </div>
            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">[abc]</code>
              <span class="text-gray-700 dark:text-gray-300">Character class</span>
            </div>
            <div class="flex items-center gap-2">
              <code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">(abc)</code>
              <span class="text-gray-700 dark:text-gray-300">Capture group</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.patternInput = this.container.querySelector('#regex-pattern');
    this.testInput = this.container.querySelector('#test-string');
    this.outputArea = this.container.querySelector('#highlighted-output');
    this.matchesArea = this.container.querySelector('#matches-grid');
    this.errorDisplay = this.container.querySelector('[data-error]');
    
    // Store flag inputs
    ['g', 'i', 'm', 's', 'u'].forEach(flag => {
      this.flagsInputs[flag] = this.container.querySelector(`#flag-${flag}`);
    });
  }
  
  attachEventListeners() {
    // Pattern and test string input
    this.patternInput.addEventListener('input', () => this.test());
    this.testInput.addEventListener('input', () => this.test());
    
    // Flags
    Object.values(this.flagsInputs).forEach(input => {
      input.addEventListener('change', () => this.test());
    });
    
    // Common patterns
    this.container.querySelectorAll('[data-pattern]').forEach(btn => {
      btn.addEventListener('click', () => {
        const pattern = this.getCommonPattern(btn.dataset.pattern);
        if (pattern) {
          this.patternInput.value = pattern.regex;
          // Set flags
          Object.keys(this.flagsInputs).forEach(flag => {
            this.flagsInputs[flag].checked = pattern.flags.includes(flag);
          });
          this.test();
        }
      });
    });
  }
  
  getCommonPattern(name) {
    const patterns = {
      email: {
        regex: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
        flags: 'gi'
      },
      url: {
        regex: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&\\/\\/=]*)',
        flags: 'gi'
      },
      phone: {
        regex: '\\(?\\d{3}\\)?[-. ]?\\d{3}[-. ]?\\d{4}',
        flags: 'g'
      },
      ipv4: {
        regex: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
        flags: 'g'
      },
      date: {
        regex: '\\d{4}[-/]\\d{2}[-/]\\d{2}|\\d{2}[-/]\\d{2}[-/]\\d{4}',
        flags: 'g'
      },
      hex: {
        regex: '#[0-9A-Fa-f]{6}\\b',
        flags: 'gi'
      },
      uuid: {
        regex: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
        flags: 'gi'
      },
      creditcard: {
        regex: '\\b(?:\\d[ -]*?){13,16}\\b',
        flags: 'g'
      }
    };
    
    return patterns[name];
  }
  
  loadExample() {
    // Load email pattern as example
    const emailPattern = this.getCommonPattern('email');
    this.patternInput.value = emailPattern.regex;
    this.flagsInputs.g.checked = true;
    this.flagsInputs.i.checked = true;
    this.test();
  }
  
  test() {
    const pattern = this.patternInput.value;
    const testString = this.testInput.value;
    
    if (!pattern) {
      this.clearResults();
      return;
    }
    
    try {
      // Build flags string
      const flags = Object.keys(this.flagsInputs)
        .filter(flag => this.flagsInputs[flag].checked)
        .join('');
      
      // Create regex
      const regex = new RegExp(pattern, flags);
      
      // Mark pattern as valid
      const validIndicator = this.container.querySelector('#pattern-valid');
      validIndicator.textContent = '✓';
      validIndicator.className = 'ml-1 font-mono text-green-600 dark:text-green-400';
      this.clearError();
      
      // Find all matches
      const matches = [];
      let match;
      
      if (regex.global) {
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          matches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1)
          });
        }
      }
      
      // Update match count
      this.container.querySelector('#match-count').textContent = matches.length;
      
      // Highlight matches
      this.highlightMatches(testString, matches);
      
      // Display match details
      this.displayMatches(matches);
      
    } catch (error) {
      const validIndicator = this.container.querySelector('#pattern-valid');
      validIndicator.textContent = '✗';
      validIndicator.className = 'ml-1 font-mono text-red-600 dark:text-red-400';
      this.showError(`Invalid regex: ${error.message}`);
      this.clearResults();
    }
  }
  
  highlightMatches(text, matches) {
    if (!text) {
      this.outputArea.innerHTML = '';
      return;
    }
    
    if (matches.length === 0) {
      this.outputArea.textContent = text;
      return;
    }
    
    // Sort matches by index
    matches.sort((a, b) => a.index - b.index);
    
    let html = '';
    let lastIndex = 0;
    
    matches.forEach(match => {
      // Add text before match
      html += this.escapeHtml(text.substring(lastIndex, match.index));
      // Add highlighted match
      html += `<mark class="bg-yellow-200 dark:bg-yellow-800 text-gray-900 dark:text-white px-1 rounded">${this.escapeHtml(match.text)}</mark>`;
      lastIndex = match.index + match.text.length;
    });
    
    // Add remaining text
    html += this.escapeHtml(text.substring(lastIndex));
    
    this.outputArea.innerHTML = html;
  }
  
  displayMatches(matches) {
    if (matches.length === 0) {
      this.matchesArea.innerHTML = '<div class="text-gray-500 dark:text-gray-400 text-center py-4">No matches found</div>';
      return;
    }
    
    const matchesHtml = matches.map((match, index) => `
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="flex justify-between items-center mb-2">
          <span class="font-semibold text-blue-600 dark:text-blue-400">Match ${index + 1}</span>
          <span class="text-sm text-gray-500 dark:text-gray-400">Position: ${match.index}</span>
        </div>
        <div class="mb-3">
          <code class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm">${this.escapeHtml(match.text)}</code>
        </div>
        ${match.groups.length > 0 ? `
          <div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Groups:</span>
            <div class="flex flex-wrap gap-2">
              ${match.groups.map((group, i) => `
                <div class="flex items-center gap-1">
                  <span class="text-xs text-gray-500 dark:text-gray-400">${i + 1}:</span>
                  <code class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">${group ? this.escapeHtml(group) : '(empty)'}</code>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `).join('');
    
    this.matchesArea.innerHTML = matchesHtml;
  }
  
  clearResults() {
    this.outputArea.textContent = this.testInput.value;
    this.matchesArea.innerHTML = '<div class="text-gray-500 dark:text-gray-400 text-center py-4">No matches found</div>';
    this.container.querySelector('#match-count').textContent = '0';
  }
  
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
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