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
      <div class="tool-container">
        <div class="tool-header">
          <h1>Regex Tester</h1>
          <p class="tool-description">Test regular expressions with real-time pattern matching and highlighting</p>
        </div>
        
        <div class="regex-pattern-section">
          <div class="pattern-input-group">
            <label for="regex-pattern">Regular Expression</label>
            <div class="pattern-wrapper">
              <span class="pattern-delimiter">/</span>
              <input 
                type="text" 
                id="regex-pattern" 
                class="pattern-input"
                placeholder="[a-zA-Z0-9]+@[a-zA-Z0-9]+\\.[a-zA-Z]+"
                spellcheck="false"
              />
              <span class="pattern-delimiter">/</span>
              <div class="flags-container">
                <label class="flag-label" title="Global match">
                  <input type="checkbox" id="flag-g" checked />
                  <span>g</span>
                </label>
                <label class="flag-label" title="Case insensitive">
                  <input type="checkbox" id="flag-i" />
                  <span>i</span>
                </label>
                <label class="flag-label" title="Multiline">
                  <input type="checkbox" id="flag-m" />
                  <span>m</span>
                </label>
                <label class="flag-label" title="Dot matches newline">
                  <input type="checkbox" id="flag-s" />
                  <span>s</span>
                </label>
                <label class="flag-label" title="Unicode">
                  <input type="checkbox" id="flag-u" />
                  <span>u</span>
                </label>
              </div>
            </div>
          </div>
          
          <div class="common-patterns">
            <label>Common Patterns:</label>
            <div class="pattern-buttons">
              <button class="btn btn-sm" data-pattern="email">Email</button>
              <button class="btn btn-sm" data-pattern="url">URL</button>
              <button class="btn btn-sm" data-pattern="phone">Phone</button>
              <button class="btn btn-sm" data-pattern="ipv4">IPv4</button>
              <button class="btn btn-sm" data-pattern="date">Date</button>
              <button class="btn btn-sm" data-pattern="hex">Hex Color</button>
              <button class="btn btn-sm" data-pattern="uuid">UUID</button>
              <button class="btn btn-sm" data-pattern="creditcard">Credit Card</button>
            </div>
          </div>
        </div>
        
        <div class="error-display" data-error hidden></div>
        
        <div class="tool-content">
          <div class="input-section">
            <label for="test-string">Test String</label>
            <textarea 
              id="test-string" 
              class="code-input" 
              placeholder="Enter text to test against the regex pattern..."
              spellcheck="false"
            >Contact us at support@example.com or sales@company.org for more information.
Our phone numbers are (555) 123-4567 and 555-987-6543.
Visit our website at https://www.example.com</textarea>
          </div>
          
          <div class="output-section">
            <label>Highlighted Matches</label>
            <div id="highlighted-output" class="highlighted-output"></div>
          </div>
        </div>
        
        <div class="matches-section">
          <h3>Match Information</h3>
          <div class="match-stats">
            <span class="stat-item">
              <strong>Total Matches:</strong>
              <span id="match-count">0</span>
            </span>
            <span class="stat-item">
              <strong>Pattern Valid:</strong>
              <span id="pattern-valid" class="status-indicator">✓</span>
            </span>
          </div>
          
          <div class="matches-grid" id="matches-grid"></div>
        </div>
        
        <div class="regex-reference">
          <h3>Quick Reference</h3>
          <div class="reference-grid">
            <div class="reference-item">
              <code>.</code>
              <span>Any character except newline</span>
            </div>
            <div class="reference-item">
              <code>\\d</code>
              <span>Digit (0-9)</span>
            </div>
            <div class="reference-item">
              <code>\\w</code>
              <span>Word character (a-z, A-Z, 0-9, _)</span>
            </div>
            <div class="reference-item">
              <code>\\s</code>
              <span>Whitespace</span>
            </div>
            <div class="reference-item">
              <code>^</code>
              <span>Start of string</span>
            </div>
            <div class="reference-item">
              <code>$</code>
              <span>End of string</span>
            </div>
            <div class="reference-item">
              <code>*</code>
              <span>0 or more</span>
            </div>
            <div class="reference-item">
              <code>+</code>
              <span>1 or more</span>
            </div>
            <div class="reference-item">
              <code>?</code>
              <span>0 or 1</span>
            </div>
            <div class="reference-item">
              <code>{n,m}</code>
              <span>Between n and m</span>
            </div>
            <div class="reference-item">
              <code>[abc]</code>
              <span>Character class</span>
            </div>
            <div class="reference-item">
              <code>(abc)</code>
              <span>Capture group</span>
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
      this.container.querySelector('#pattern-valid').textContent = '✓';
      this.container.querySelector('#pattern-valid').style.color = 'var(--color-success)';
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
      this.container.querySelector('#pattern-valid').textContent = '✗';
      this.container.querySelector('#pattern-valid').style.color = 'var(--color-error)';
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
      html += `<mark class="regex-match">${this.escapeHtml(match.text)}</mark>`;
      lastIndex = match.index + match.text.length;
    });
    
    // Add remaining text
    html += this.escapeHtml(text.substring(lastIndex));
    
    this.outputArea.innerHTML = html;
  }
  
  displayMatches(matches) {
    if (matches.length === 0) {
      this.matchesArea.innerHTML = '<div class="no-matches">No matches found</div>';
      return;
    }
    
    const matchesHtml = matches.map((match, index) => `
      <div class="match-item">
        <div class="match-header">
          <span class="match-number">Match ${index + 1}</span>
          <span class="match-position">Position: ${match.index}</span>
        </div>
        <div class="match-text">
          <code>${this.escapeHtml(match.text)}</code>
        </div>
        ${match.groups.length > 0 ? `
          <div class="match-groups">
            <span class="groups-label">Groups:</span>
            ${match.groups.map((group, i) => `
              <span class="group-item">
                <span class="group-number">${i + 1}:</span>
                <code>${group ? this.escapeHtml(group) : '(empty)'}</code>
              </span>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('');
    
    this.matchesArea.innerHTML = matchesHtml;
  }
  
  clearResults() {
    this.outputArea.textContent = this.testInput.value;
    this.matchesArea.innerHTML = '<div class="no-matches">No matches found</div>';
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