export class PasswordGenerator {
  constructor() {
    this.container = null;
    this.outputArea = null;
    this.strengthMeter = null;
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
      <div class="max-w-7xl mx-auto p-6" role="region" aria-label="Password Generator">
        <div class="mb-8">
          <div class="flex items-center justify-between mb-2">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Password Generator</h1>
            <button class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" data-action="regenerate" title="Generate new password (R)" aria-label="Generate new password">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
            </button>
          </div>
          <p class="text-gray-600 dark:text-gray-400">Generate secure, random passwords with customizable options</p>
        </div>

        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <div class="flex gap-3 mb-4">
            <input type="text" id="password-output" class="flex-1 p-3 font-mono text-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" readonly aria-label="Generated password" />
            <button class="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" data-action="copy" title="Copy password (Cmd/Ctrl+C)" aria-label="Copy password">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
          </div>

          <div aria-describedby="strength-label">
            <div class="w-full bg-gray-200 dark:bg-gray-900 rounded-full h-2 mb-3">
              <div class="h-2 rounded-full transition-all duration-300" id="strength-fill"></div>
            </div>
            <div class="flex items-center justify-between">
              <div class="text-sm font-medium text-gray-900 dark:text-white" id="strength-label" aria-live="polite">Calculating...</div>
              <div class="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 rounded" id="entropy-chip" aria-hidden="true"></div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <div class="mb-6">
            <label for="password-length" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Password Length</label>
            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400 min-w-[3rem]" id="length-display">16</div>
                <input type="range" id="password-length" min="4" max="128" value="16" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-900" />
              </div>
              <div class="flex gap-2" role="group" aria-label="Length presets">
                <button class="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded hover:bg-gray-200 dark:hover:bg-gray-600" data-length="8">8</button>
                <button class="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded hover:bg-gray-200 dark:hover:bg-gray-600" data-length="12">12</button>
                <button class="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 active" data-length="16">16</button>
                <button class="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded hover:bg-gray-200 dark:hover:bg-gray-600" data-length="20">20</button>
                <button class="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded hover:bg-gray-200 dark:hover:bg-gray-600" data-length="32">32</button>
              </div>
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-8">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Character Types</h3>
              <div class="space-y-3">
                <label class="flex items-center space-x-3">
                  <input type="checkbox" id="use-uppercase" checked class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700 dark:text-gray-300">Uppercase Letters (A–Z)</span>
                </label>
                <label class="flex items-center space-x-3">
                  <input type="checkbox" id="use-lowercase" checked class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700 dark:text-gray-300">Lowercase Letters (a–z)</span>
                </label>
                <label class="flex items-center space-x-3">
                  <input type="checkbox" id="use-numbers" checked class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700 dark:text-gray-300">Numbers (0–9)</span>
                </label>
                <label class="flex items-center space-x-3">
                  <input type="checkbox" id="use-symbols" checked class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700 dark:text-gray-300">Symbols (!@#$%...)</span>
                </label>
                <label class="flex items-center space-x-3" title="When off, confusable characters are excluded">
                  <input type="checkbox" id="use-similar" checked class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700 dark:text-gray-300">Include Similar Characters (il1Lo0O)</span>
                </label>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Advanced Options</h3>
              <div class="space-y-3">
                <label class="flex items-center space-x-3">
                  <input type="checkbox" id="begin-letter" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700 dark:text-gray-300">Begin With a Letter</span>
                </label>
                <label class="flex items-center space-x-3">
                  <input type="checkbox" id="no-sequential" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700 dark:text-gray-300">No Sequential Characters</span>
                </label>
                <label class="flex items-center space-x-3">
                  <input type="checkbox" id="no-duplicate" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="text-sm text-gray-700 dark:text-gray-300">No Duplicate Characters</span>
                </label>
                <div class="space-y-2">
                  <label for="custom-symbols" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Custom Symbol Set:</label>
                  <input type="text" id="custom-symbols" class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="!@#$%^&*" inputmode="text" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mb-6">
          <button class="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" data-action="generate-multiple" title="Generate 10 passwords">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" class="mr-2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
            </svg>
            Generate Multiple
          </button>
          <button class="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" data-action="show-passphrase">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" class="mr-2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Passphrase Mode
          </button>
          <button class="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" data-action="show-memorable">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" class="mr-2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Memorable
          </button>
        </div>

        <section class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mb-6" id="multiple-passwords" hidden>
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Generated Passwords</h3>
            <button class="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" data-action="copy-all">Copy All</button>
          </div>
          <div class="p-4 space-y-2" id="password-list" role="list"></div>
        </section>

        <section class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mb-6" id="passphrase-mode" hidden>
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Passphrase Generator</h3>
          </div>
          <div class="p-4 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="word-count" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Words:</label>
                <input type="number" id="word-count" value="4" min="3" max="10" class="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
              <div>
                <label for="word-separator" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Separator:</label>
                <input type="text" id="word-separator" value="-" maxlength="3" class="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
            </div>
            <div class="space-y-2">
              <label class="flex items-center space-x-3">
                <input type="checkbox" id="capitalize-words" checked class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                <span class="text-sm text-gray-700 dark:text-gray-300">Capitalize Words</span>
              </label>
              <label class="flex items-center space-x-3">
                <input type="checkbox" id="include-number" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                <span class="text-sm text-gray-700 dark:text-gray-300">Include Number</span>
              </label>
            </div>
            <div class="mt-4" id="passphrase-output"></div>
            <button class="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" data-action="generate-passphrase">Generate Passphrase</button>
          </div>
        </section>

        <section class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mb-6" id="memorable-mode" hidden>
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Memorable Password</h3>
          </div>
          <div class="p-4 space-y-4">
            <div>
              <label for="memorable-pattern" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pattern:</label>
              <select id="memorable-pattern" class="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="word-number-word">Word-Number-Word</option>
                <option value="adjective-noun-number">Adjective-Noun-Number</option>
                <option value="noun-verb-noun">Noun-Verb-Noun</option>
                <option value="custom">Custom Pattern</option>
              </select>
            </div>
            <div class="mt-4" id="memorable-output"></div>
            <button class="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" data-action="generate-memorable">Generate Memorable</button>
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
    this.container.querySelectorAll('[data-length]').forEach(btn => {
      btn.addEventListener('click', () => {
        const length = parseInt(btn.dataset.length, 10);
        lengthSlider.value = length;
        lengthDisplay.textContent = length;
        this.updatePresetButtons(length);
        this.generatePassword();
      });
    });

    // Character options
    this.container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
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
    // Calculate entropy first (most accurate measure)
    const charsetSize = this.getCharsetSize(password);
    const entropy = password.length * Math.log2(Math.max(1, charsetSize));
    
    // Start with base score from entropy
    let strength = 0;
    
    // Entropy-based scoring (primary factor)
    if (entropy < 20) {
      strength = 5; // Very weak
    } else if (entropy < 30) {
      strength = 15; // Weak
    } else if (entropy < 40) {
      strength = 30; // Fair
    } else if (entropy < 50) {
      strength = 45; // Good
    } else if (entropy < 60) {
      strength = 60; // Strong
    } else if (entropy < 70) {
      strength = 75; // Very strong
    } else {
      strength = 90; // Excellent
    }
    
    // Bonus points for character diversity (up to 20 points)
    let diversityScore = 0;
    if (/[a-z]/.test(password)) diversityScore += 5;
    if (/[A-Z]/.test(password)) diversityScore += 5;
    if (/[0-9]/.test(password)) diversityScore += 5;
    if (/[^a-zA-Z0-9]/.test(password)) diversityScore += 5;
    
    // Apply diversity bonus only if password is at least 6 chars
    if (password.length >= 6) {
      strength = Math.min(100, strength + diversityScore);
    }
    
    // Penalties for bad patterns
    if (password.length < 8) {
      strength = Math.min(strength, 25); // Cap at weak for short passwords
    }
    if (password.length < 6) {
      strength = Math.min(strength, 10); // Very weak for very short passwords
    }
    if (/(.)\1{3,}/.test(password)) {
      strength = Math.max(0, strength - 15); // Penalty for repeated characters
    }
    if (/^(12345|password|qwerty|abc123|123456789|111111|1234567890)/i.test(password)) {
      strength = Math.min(strength, 5); // Common passwords are always weak
    }
    
    // UI updates
    const fill = this.container.querySelector('#strength-fill');
    const label = this.container.querySelector('#strength-label');
    const chip  = this.container.querySelector('#entropy-chip');

    // Ensure minimum width for visibility
    fill.style.width = `${Math.max(5, Math.min(100, strength))}%`;

    let text = 'Very Weak';
    let colorClass = 'bg-red-500';
    
    if (strength < 15) {
      colorClass = 'bg-red-500';
      text = 'Very Weak';
    } else if (strength < 35) {
      colorClass = 'bg-orange-500';
      text = 'Weak';
    } else if (strength < 60) {
      colorClass = 'bg-yellow-500';
      text = 'Fair';
    } else if (strength < 80) {
      colorClass = 'bg-blue-500';
      text = 'Strong';
    } else {
      colorClass = 'bg-green-500';
      text = 'Very Strong';
    }
    
    fill.className = `h-2 rounded-full transition-all duration-300 ${colorClass}`;

    const bits = Math.round(entropy);
    label.textContent = text;
    chip.textContent = `${bits} bits`;
    
    // Add detailed feedback for very weak passwords
    if (strength < 15 && password.length < 8) {
      label.textContent = `${text} (${password.length} chars)`;
    }
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
      <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded" role="listitem">
        <span class="text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[2rem]">${i + 1}.</span>
        <input type="text" value="${pwd}" readonly class="flex-1 px-2 py-1 font-mono text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded" aria-label="Password ${i + 1}">
        <button class="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700" data-copy="${pwd}" title="Copy password ${i + 1}">Copy</button>
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
      <div class="flex gap-2">
        <input type="text" value="${result}" readonly class="flex-1 px-3 py-2 font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" aria-label="Generated passphrase">
        <button class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700" data-copy-passphrase="${result}" title="Copy passphrase">Copy</button>
      </div>
    `;
    output.querySelector('[data-copy-passphrase]').addEventListener('click', (e) => {
      navigator.clipboard.writeText(e.target.dataset.copyPassphrase);
      this._announce('Passphrase copied');
      e.target.textContent = '✓';
      setTimeout(() => e.target.textContent = 'Copy', 1400);
    });
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
      <div class="flex gap-2">
        <input type="text" value="${memorable}" readonly class="flex-1 px-3 py-2 font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" aria-label="Memorable password">
        <button class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700" data-copy-memorable="${memorable}" title="Copy memorable">Copy</button>
      </div>
    `;
    output.querySelector('[data-copy-memorable]').addEventListener('click', (e) => {
      navigator.clipboard.writeText(e.target.dataset.copyMemorable);
      this._announce('Memorable password copied');
      e.target.textContent = '✓';
      setTimeout(() => e.target.textContent = 'Copy', 1400);
    });
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
    this.container.querySelectorAll('[data-length]').forEach(btn => {
      const isActive = parseInt(btn.dataset.length, 10) === length;
      if (isActive) {
        btn.className = 'px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700';
      } else {
        btn.className = 'px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded hover:bg-gray-200 dark:hover:bg-gray-600';
      }
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

  _announce(msg) {
    const sr = this.container.querySelector('#announce');
    sr.textContent = '';
    // force change for screen readers
    setTimeout(() => (sr.textContent = msg), 10);
  }
}
