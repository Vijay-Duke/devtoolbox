export class PasswordGenerator {
  constructor() {
    this.container = null;
    this.outputArea = null;
    this.strengthMeter = null;
    this.passwordHistory = [];
    this._regenDebounce = null;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    // Add class for CSS targeting
    this.container.classList.add('password-generator');

    this.render();
    this.attachEventListeners();
    this.generatePassword();
  }

  render() {
    this.container.innerHTML = `
      <div class="tool-container" role="region" aria-label="Password Generator">
        <div class="tool-header">
          <div class="title-row">
            <h1 class="tool-title">Password Generator</h1>
            <div class="title-actions">
              <button class="btn-icon" data-action="regenerate" title="Generate new password (R)" aria-label="Generate new password">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
              </button>
            </div>
          </div>
          <p class="tool-description">Generate secure, random passwords with customizable options</p>
        </div>

        <div class="password-output-container">
          <div class="password-display">
            <input type="text" id="password-output" class="password-output" readonly aria-label="Generated password" />
            <div class="password-actions">
              <button class="btn-icon" data-action="copy" title="Copy password (Cmd/Ctrl+C)" aria-label="Copy password">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="strength-meter" aria-describedby="strength-label">
            <div class="strength-bar">
              <div class="strength-fill" id="strength-fill" style="transition:width .35s ease;"></div>
            </div>
            <div class="strength-row">
              <div class="strength-label" id="strength-label" aria-live="polite">Calculating...</div>
              <div class="entropy-chip" id="entropy-chip" aria-hidden="true"></div>
            </div>
          </div>
        </div>

        <div class="password-options">
          <div class="option-group">
            <label for="password-length">Password Length</label>
            <div class="length-controls">
              <div class="length-display" id="length-display">16</div>
              <input type="range" id="password-length" min="4" max="128" value="16" class="range-input" />
              <div class="length-presets" role="group" aria-label="Length presets">
                <button class="preset-btn" data-length="8">8</button>
                <button class="preset-btn" data-length="12">12</button>
                <button class="preset-btn active" data-length="16">16</button>
                <button class="preset-btn" data-length="20">20</button>
                <button class="preset-btn" data-length="32">32</button>
              </div>
            </div>
          </div>

          <div class="options-grid">
            <div class="character-options">
              <h3>Character Types</h3>
              <label class="checkbox-label">
                <input type="checkbox" id="use-uppercase" checked><span>Uppercase Letters (A–Z)</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="use-lowercase" checked><span>Lowercase Letters (a–z)</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="use-numbers" checked><span>Numbers (0–9)</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="use-symbols" checked><span>Symbols (!@#$%...)</span>
              </label>
              <label class="checkbox-label" title="When off, confusable characters are excluded">
                <input type="checkbox" id="use-similar" checked><span>Include Similar Characters (il1Lo0O)</span>
              </label>
            </div>

            <div class="advanced-options">
              <h3>Advanced Options</h3>
              <label class="checkbox-label">
                <input type="checkbox" id="begin-letter"><span>Begin With a Letter</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="no-sequential"><span>No Sequential Characters</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="no-duplicate"><span>No Duplicate Characters</span>
              </label>
              <div class="custom-symbols-group">
                <label for="custom-symbols">Custom Symbol Set:</label>
                <input type="text" id="custom-symbols" class="input-field" placeholder="!@#$%^&*" inputmode="text" />
              </div>
            </div>
          </div>
        </div>

        <div class="password-tools">
          <div class="tool-buttons">
            <button class="btn btn-primary" data-action="generate-multiple" title="Generate 10 passwords">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
              </svg>
              Generate Multiple
            </button>
            <button class="btn btn-secondary" data-action="show-passphrase">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Passphrase Mode
            </button>
            <button class="btn btn-secondary" data-action="show-memorable">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Memorable
            </button>
          </div>
        </div>

        <div class="two-up">
          <section class="panel" id="multiple-passwords" hidden>
            <div class="panel-head">
              <h3>Generated Passwords</h3>
              <button class="btn btn-sm" data-action="copy-all">Copy All</button>
            </div>
            <div class="password-list" id="password-list" role="list"></div>
          </section>

          <section class="panel" id="password-history">
            <div class="panel-head">
              <h3>Password History <span class="history-count">(Last 10)</span></h3>
              <button class="btn btn-sm" data-action="clear-history">Clear</button>
            </div>
            <div class="history-list" id="history-list" role="list"></div>
          </section>
        </div>

        <section class="panel" id="passphrase-mode" hidden>
          <div class="panel-head"><h3>Passphrase Generator</h3></div>
          <div class="passphrase-options">
            <label>Words: <input type="number" id="word-count" value="4" min="3" max="10" class="input-field input-sm"></label>
            <label>Separator: <input type="text" id="word-separator" value="-" maxlength="3" class="input-field input-sm"></label>
            <label class="checkbox-label"><input type="checkbox" id="capitalize-words" checked><span>Capitalize Words</span></label>
            <label class="checkbox-label"><input type="checkbox" id="include-number"><span>Include Number</span></label>
          </div>
          <div class="passphrase-output" id="passphrase-output"></div>
          <div class="panel-actions">
            <button class="btn btn-primary" data-action="generate-passphrase">Generate Passphrase</button>
          </div>
        </section>

        <section class="panel" id="memorable-mode" hidden>
          <div class="panel-head"><h3>Memorable Password</h3></div>
          <div class="memorable-pattern">
            <label>Pattern:</label>
            <select id="memorable-pattern" class="select-input">
              <option value="word-number-word">Word-Number-Word</option>
              <option value="adjective-noun-number">Adjective-Noun-Number</option>
              <option value="noun-verb-noun">Noun-Verb-Noun</option>
              <option value="custom">Custom Pattern</option>
            </select>
          </div>
          <div class="memorable-output" id="memorable-output"></div>
          <div class="panel-actions">
            <button class="btn btn-primary" data-action="generate-memorable">Generate Memorable</button>
          </div>
        </section>

        <div class="sr-only" aria-live="polite" id="announce"></div>
      </div>
    `;

    this.outputArea = this.container.querySelector('#password-output');
    this.strengthMeter = this.container.querySelector('#strength-fill');
  }

  attachEventListeners() {
    const onDebouncedRegen = () => {
      clearTimeout(this._regenDebounce);
      this._regenDebounce = setTimeout(() => this.generatePassword(), 80);
    };

    // Main actions
    this.container.querySelector('[data-action="copy"]').addEventListener('click', () => this.copyPassword());
    this.container.querySelector('[data-action="regenerate"]').addEventListener('click', () => this.generatePassword());

    // Keyboard shortcuts
    this.container.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault(); this.copyPassword();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault(); this.generatePassword();
      }
    });

    // Length control
    const lengthSlider = this.container.querySelector('#password-length');
    const lengthDisplay = this.container.querySelector('#length-display');
    lengthSlider.addEventListener('input', (e) => {
      lengthDisplay.textContent = e.target.value;
      this.updatePresetButtons(parseInt(e.target.value, 10));
      onDebouncedRegen();
    });
    lengthSlider.addEventListener('change', () => this.generatePassword());
    lengthSlider.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.generatePassword();
    });

    // Length presets
    this.container.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const length = parseInt(btn.dataset.length, 10);
        lengthSlider.value = length;
        lengthDisplay.textContent = length;
        this.updatePresetButtons(length);
        this.generatePassword();
      });
    });

    // Character options
    this.container.querySelectorAll('.character-options input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => this.generatePassword());
    });

    // Advanced options
    this.container.querySelectorAll('.advanced-options input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => this.generatePassword());
    });

    // Custom symbols
    this.container.querySelector('#custom-symbols').addEventListener('input', () => this.generatePassword());

    // Tool buttons
    this.container.querySelector('[data-action="generate-multiple"]').addEventListener('click', () => this.generateMultiple());
    this.container.querySelector('[data-action="show-passphrase"]').addEventListener('click', () => this.togglePassphraseMode());
    this.container.querySelector('[data-action="show-memorable"]').addEventListener('click', () => this.toggleMemorableMode());

    // Multiple/passwords controls are bound when shown
    this.container.querySelector('[data-action="generate-passphrase"]')?.addEventListener('click', () => this.generatePassphrase());
    this.container.querySelector('[data-action="generate-memorable"]')?.addEventListener('click', () => this.generateMemorable());

    // History
    this.container.querySelector('[data-action="clear-history"]').addEventListener('click', () => this.clearHistory());
  }

  generatePassword() {
    const length = parseInt(this.container.querySelector('#password-length').value, 10);
    const useUppercase = this.container.querySelector('#use-uppercase').checked;
    const useLowercase = this.container.querySelector('#use-lowercase').checked;
    const useNumbers   = this.container.querySelector('#use-numbers').checked;
    const useSymbols   = this.container.querySelector('#use-symbols').checked;
    const useSimilar   = this.container.querySelector('#use-similar').checked;
    const beginLetter  = this.container.querySelector('#begin-letter').checked;
    const noSequential = this.container.querySelector('#no-sequential').checked;
    const noDuplicate  = this.container.querySelector('#no-duplicate').checked;
    const customSymbols = this.container.querySelector('#custom-symbols').value;

    // Character sets
    const uppercase = useSimilar ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : 'ABCDEFGHJKMNPQRSTUVWXYZ'; // remove ILO
    const lowercase = useSimilar ? 'abcdefghijklmnopqrstuvwxyz' : 'abcdefghjkmnpqrstuvwxyz'; // remove ilo
    const numbers   = useSimilar ? '0123456789' : '23456789'; // remove 0,1
    const symbols   = (customSymbols && customSymbols.length) ? customSymbols : '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let charset = '';
    if (useUppercase) charset += uppercase;
    if (useLowercase) charset += lowercase;
    if (useNumbers)   charset += numbers;
    if (useSymbols)   charset += symbols;

    if (!charset) {
      this.outputArea.value = 'Select at least one character type';
      return;
    }

    // Ensure at least one from each selected type (respecting similar-char toggle)
    const pools = [];
    if (useUppercase) pools.push(uppercase);
    if (useLowercase) pools.push(lowercase);
    if (useNumbers)   pools.push(numbers);
    if (useSymbols)   pools.push(symbols);

    let password = '';
    const used = new Set();

    // Reserve required chars first
    const requiredChars = pools.map(p => this.getRandomChar(p));

    // Fill remaining
    for (let i = 0; i < Math.max(0, length - requiredChars.length); i++) {
      let ch, attempts = 0;
      do {
        ch = this.getRandomChar(charset);
        attempts++;
        if (attempts > 200) break;
      } while (
          (noDuplicate && used.has(ch)) ||
          (noSequential && password.length > 0 && this.isSequential(password[password.length - 1], ch))
          );
      password += ch;
      used.add(ch);
    }

    // Insert required chars at random positions
    for (const ch of requiredChars) {
      const pos = this.secureRandomIndex(password.length + 1);
      password = password.slice(0, pos) + ch + password.slice(pos);
      used.add(ch);
    }

    // Begin with a letter if required
    if (beginLetter && password.length > 0 && !/^[a-zA-Z]/.test(password)) {
      const lettersPool = ((useUppercase ? uppercase : '') + (useLowercase ? lowercase : '')) || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      password = this.getRandomChar(lettersPool) + password.slice(1);
    }

    // Truncate/Pad safety (should be exact, but just in case)
    if (password.length > length) password = password.slice(0, length);

    this.outputArea.value = password;
    this.evaluateStrength(password);
    this.addToHistory(password);
  }

  getRandomChar(str) {
    const idx = this.secureRandomIndex(str.length);
    return str[idx];
  }

  secureRandomIndex(mod) {
    // unbiased modulo using 32-bit
    const uint = new Uint32Array(1);
    const max = Math.floor(0xFFFFFFFF / mod) * mod;
    let r;
    do {
      crypto.getRandomValues(uint);
      r = uint[0];
    } while (r >= max);
    return r % mod;
  }

  isSequential(a, b) {
    const ca = a.charCodeAt(0), cb = b.charCodeAt(0);
    return Math.abs(ca - cb) === 1;
  }

  evaluateStrength(password) {
    let strength = 0;

    // Length
    if (password.length >= 8)  strength += 20;
    if (password.length >= 12) strength += 20;
    if (password.length >= 16) strength += 20;

    // Diversity
    if (/[a-z]/.test(password)) strength += 10;
    if (/[A-Z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;

    // Patterns
    if (!/(.)\1{2,}/.test(password)) strength += 5;
    if (!/012|123|234|345|456|567|678|789|890|abc|bcd|cde|def/.test(password.toLowerCase())) strength += 5;

    // Entropy estimate (bits)
    const charsetSize = this.getCharsetSize(password);
    const entropy = password.length * Math.log2(Math.max(1, charsetSize));
    if (entropy > 50) strength = Math.min(100, strength + 20);

    // UI updates
    const fill = this.container.querySelector('#strength-fill');
    const label = this.container.querySelector('#strength-label');
    const chip  = this.container.querySelector('#entropy-chip');

    fill.style.width = `${Math.max(2, Math.min(100, strength))}%`;

    let text = 'Weak';
    if (strength < 40) {
      fill.className = 'strength-fill strength-weak';
      text = 'Weak';
    } else if (strength < 70) {
      fill.className = 'strength-fill strength-medium';
      text = 'Medium';
    } else if (strength < 90) {
      fill.className = 'strength-fill strength-strong';
      text = 'Strong';
    } else {
      fill.className = 'strength-fill strength-very-strong';
      text = 'Very Strong';
    }

    const bits = Math.round(entropy);
    label.textContent = `${text}`;
    chip.textContent = `${bits} bits`;
  }

  getCharsetSize(password) {
    let size = 0;
    if (/[a-z]/.test(password)) size += 26;
    if (/[A-Z]/.test(password)) size += 26;
    if (/[0-9]/.test(password)) size += 10;
    if (/[^a-zA-Z0-9]/.test(password)) size += 32; // rough symbol set
    return size || 1;
  }

  generateMultiple() {
    const container = this.container.querySelector('#multiple-passwords');
    const list = this.container.querySelector('#password-list');

    const items = [];
    for (let i = 0; i < 10; i++) {
      this.generatePassword();
      items.push(this.outputArea.value);
    }

    list.innerHTML = items.map((pwd, i) => `
      <div class="password-item" role="listitem">
        <span class="password-index">${i + 1}.</span>
        <input type="text" value="${pwd}" readonly class="password-field" aria-label="Password ${i + 1}">
        <button class="btn-icon btn-sm" data-copy="${pwd}" title="Copy password ${i + 1}">Copy</button>
      </div>
    `).join('');

    list.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.copy);
        this._announce('Password copied');
        btn.textContent = '✓';
        setTimeout(() => btn.textContent = 'Copy', 1400);
      });
    });

    this.container.querySelector('[data-action="copy-all"]')?.addEventListener('click', () => this.copyAllPasswords());
    container.hidden = false;
  }

  generatePassphrase() {
    const wordCount = parseInt(this.container.querySelector('#word-count').value, 10);
    const separator = this.container.querySelector('#word-separator').value;
    const capitalize = this.container.querySelector('#capitalize-words').checked;
    const includeNumber = this.container.querySelector('#include-number').checked;

    const words = [
      'correct','horse','battery','staple','mountain','river','forest','ocean',
      'thunder','lightning','rainbow','sunset','galaxy','planet','crystal','diamond',
      'eagle','falcon','phoenix','dragon','wizard','knight','castle','bridge',
      'hammer','shield','arrow','sword','compass','anchor','beacon','torch',
      'silver','golden','bronze','copper','marble','granite','emerald','sapphire'
    ];

    const chosen = [];
    for (let i = 0; i < wordCount; i++) {
      let w = words[this.secureRandomIndex(words.length)];
      if (capitalize) w = w.charAt(0).toUpperCase() + w.slice(1);
      chosen.push(w);
    }

    if (includeNumber) {
      const n = this.secureRandomIndex(100); // 0..99 crypto-based
      chosen.push(n);
    }

    const result = chosen.join(separator || '-');
    const output = this.container.querySelector('#passphrase-output');
    output.innerHTML = `
      <div class="passphrase-result">
        <input type="text" value="${result}" readonly class="password-field" aria-label="Generated passphrase">
        <button class="btn-icon" data-copy-passphrase="${result}" title="Copy passphrase">Copy</button>
      </div>
    `;
    output.querySelector('[data-copy-passphrase]').addEventListener('click', (e) => {
      navigator.clipboard.writeText(e.target.dataset.copyPassphrase);
      this._announce('Passphrase copied');
      e.target.textContent = '✓';
      setTimeout(() => e.target.textContent = 'Copy', 1400);
    });

    this.addToHistory(result);
  }

  generateMemorable() {
    const pattern = this.container.querySelector('#memorable-pattern').value;

    const adjectives = ['happy','quick','bright','clever','brave'];
    const nouns = ['tiger','eagle','mountain','river','forest'];
    const verbs = ['runs','jumps','flies','swims','climbs'];

    const rnd = arr => arr[this.secureRandomIndex(arr.length)];
    let memorable = '';

    switch (pattern) {
      case 'word-number-word':
        memorable = `${rnd(nouns)}${this.secureRandomIndex(100)}${rnd(nouns)}`;
        break;
      case 'adjective-noun-number':
        memorable = `${rnd(adjectives)}${rnd(nouns)}${this.secureRandomIndex(100)}`;
        break;
      case 'noun-verb-noun':
        memorable = `${rnd(nouns)}${rnd(verbs)}${rnd(nouns)}`;
        break;
      default:
        memorable = `${rnd(adjectives)}${rnd(nouns)}${this.secureRandomIndex(100)}`;
        break;
    }

    const output = this.container.querySelector('#memorable-output');
    output.innerHTML = `
      <div class="memorable-result">
        <input type="text" value="${memorable}" readonly class="password-field" aria-label="Memorable password">
        <button class="btn-icon" data-copy-memorable="${memorable}" title="Copy memorable">Copy</button>
      </div>
    `;
    output.querySelector('[data-copy-memorable]').addEventListener('click', (e) => {
      navigator.clipboard.writeText(e.target.dataset.copyMemorable);
      this._announce('Memorable password copied');
      e.target.textContent = '✓';
      setTimeout(() => e.target.textContent = 'Copy', 1400);
    });

    this.addToHistory(memorable);
  }

  togglePassphraseMode() {
    const mode = this.container.querySelector('#passphrase-mode');
    mode.hidden = !mode.hidden;
    if (!mode.hidden) this.generatePassphrase();
  }

  toggleMemorableMode() {
    const mode = this.container.querySelector('#memorable-mode');
    mode.hidden = !mode.hidden;
    if (!mode.hidden) this.generateMemorable();
  }

  updatePresetButtons(length) {
    this.container.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.length, 10) === length);
    });
  }

  copyPassword() {
    const password = this.outputArea.value;
    if (!password) return;

    navigator.clipboard.writeText(password).then(() => {
      this._announce('Password copied');
      const btn = this.container.querySelector('[data-action="copy"]');
      const original = btn.innerHTML;
      btn.innerHTML = '✓';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.innerHTML = original;
        btn.classList.remove('copied');
      }, 1400);
    });
  }

  copyAllPasswords() {
    const passwords = Array.from(this.container.querySelectorAll('#password-list .password-field'))
        .map(input => input.value)
        .join('\\n');

    navigator.clipboard.writeText(passwords).then(() => {
      this._announce('All passwords copied');
      const btn = this.container.querySelector('[data-action="copy-all"]');
      const text = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => (btn.textContent = text), 1400);
    });
  }

  addToHistory(password) {
    this.passwordHistory.unshift({ password, timestamp: new Date().toLocaleTimeString() });
    this.passwordHistory = this.passwordHistory.slice(0, 10);
    this.updateHistoryDisplay();
  }

  updateHistoryDisplay() {
    const list = this.container.querySelector('#history-list');
    list.innerHTML = this.passwordHistory.map((item, i) => `
      <div class="history-item" role="listitem">
        <span class="history-time" title="${item.timestamp}">${item.timestamp}</span>
        <input type="text" value="${item.password}" readonly class="password-field" aria-label="History password ${i + 1}">
        <button class="btn-icon btn-sm" data-copy-history="${item.password}" title="Copy history item">Copy</button>
      </div>
    `).join('');

    list.querySelectorAll('[data-copy-history]').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.copyHistory);
        this._announce('Password copied');
        btn.textContent = '✓';
        setTimeout(() => btn.textContent = 'Copy', 1400);
      });
    });
  }

  clearHistory() {
    this.passwordHistory = [];
    this.updateHistoryDisplay();
    this._announce('History cleared');
  }

  _announce(msg) {
    const sr = this.container.querySelector('#announce');
    sr.textContent = '';
    // force change for screen readers
    setTimeout(() => (sr.textContent = msg), 10);
  }
}
