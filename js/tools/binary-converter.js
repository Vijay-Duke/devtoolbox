export class BinaryConverter {
  constructor() {
    this.container = null;
    this.inputs = {};
    this.autoConvert = true;
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
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Binary Converter</h1>
          <p class="text-gray-600 dark:text-gray-300">Convert between binary, decimal, hexadecimal, octal, and ASCII</p>
        </div>
        
        <div class="flex items-center justify-between mb-6">
          <label class="flex items-center">
            <input type="checkbox" id="auto-convert" checked class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
            <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Auto-convert on input</span>
          </label>
          <div class="flex gap-2">
            <button class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="convert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 3 21 3 21 8"></polyline>
                <line x1="4" y1="20" x2="21" y2="3"></line>
                <polyline points="21 16 21 21 16 21"></polyline>
                <line x1="15" y1="15" x2="21" y2="21"></line>
                <line x1="4" y1="4" x2="9" y2="9"></line>
              </svg>
              Convert All
            </button>
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="clear">Clear All</button>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Binary (Base 2)</h3>
              <button class="p-2 text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md" data-copy="binary" title="Copy">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
            <textarea 
              id="binary-input" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white font-mono text-sm" 
              placeholder="Enter binary (e.g., 11111111)"
              spellcheck="false"
              rows="3"
            >01001000 01100101 01101100 01101100 01101111</textarea>
            <div class="flex gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
              <span data-info="binary-bits">0 bits</span>
              <span data-info="binary-bytes">0 bytes</span>
            </div>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Decimal (Base 10)</h3>
              <button class="p-2 text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md" data-copy="decimal" title="Copy">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
            <textarea 
              id="decimal-input" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white font-mono text-sm" 
              placeholder="Enter decimal (e.g., 255)"
              spellcheck="false"
              rows="3"
            ></textarea>
            <div class="mt-2 text-xs text-gray-600 dark:text-gray-400">
              <span data-info="decimal-value">Value: 0</span>
            </div>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Hexadecimal (Base 16)</h3>
              <button class="p-2 text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md" data-copy="hex" title="Copy">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
            <textarea 
              id="hex-input" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white font-mono text-sm" 
              placeholder="Enter hexadecimal (e.g., FF)"
              spellcheck="false"
              rows="3"
            ></textarea>
            <div class="mt-2 text-xs text-gray-600 dark:text-gray-400">
              <span data-info="hex-format">Format: 0x00</span>
            </div>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Octal (Base 8)</h3>
              <button class="p-2 text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md" data-copy="octal" title="Copy">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
            <textarea 
              id="octal-input" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white font-mono text-sm" 
              placeholder="Enter octal (e.g., 377)"
              spellcheck="false"
              rows="3"
            ></textarea>
            <div class="mt-2 text-xs text-gray-600 dark:text-gray-400">
              <span data-info="octal-format">Format: 0o00</span>
            </div>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">ASCII Text</h3>
              <button class="p-2 text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md" data-copy="ascii" title="Copy">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
            <textarea 
              id="ascii-input" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white" 
              placeholder="Enter ASCII text"
              spellcheck="false"
              rows="3"
            ></textarea>
            <div class="mt-2 text-xs text-gray-600 dark:text-gray-400">
              <span data-info="ascii-chars">0 characters</span>
            </div>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Base64</h3>
              <button class="p-2 text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md" data-copy="base64" title="Copy">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
            <textarea 
              id="base64-input" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white font-mono text-sm" 
              placeholder="Enter Base64"
              spellcheck="false"
              rows="3"
            ></textarea>
            <div class="mt-2 text-xs text-gray-600 dark:text-gray-400">
              <span data-info="base64-size">0 bytes</span>
            </div>
          </div>
        </div>
        
        <div class="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Conversion Options</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <label class="flex items-center">
              <input type="checkbox" id="group-binary" checked class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Group Binary by 8 bits</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" id="prefix-hex" checked class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Add 0x Prefix to Hex</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" id="prefix-octal" checked class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Add 0o Prefix to Octal</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" id="uppercase-hex" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Uppercase Hex</span>
            </label>
          </div>
        </div>
        
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Tools</h3>
          <div class="flex flex-wrap gap-2">
            <button class="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="flip-bits">Flip Bits</button>
            <button class="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="shift-left">Shift Left</button>
            <button class="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="shift-right">Shift Right</button>
            <button class="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="ones-complement">1's Complement</button>
            <button class="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="twos-complement">2's Complement</button>
            <button class="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="byte-swap">Byte Swap</button>
          </div>
        </div>
        
        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4" id="conversion-table">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">ASCII Character Table</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-gray-700 dark:text-gray-300">
              <thead class="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th class="px-3 py-2 text-left font-medium text-gray-900 dark:text-white">Char</th>
                  <th class="px-3 py-2 text-left font-medium text-gray-900 dark:text-white">Dec</th>
                  <th class="px-3 py-2 text-left font-medium text-gray-900 dark:text-white">Hex</th>
                  <th class="px-3 py-2 text-left font-medium text-gray-900 dark:text-white">Oct</th>
                  <th class="px-3 py-2 text-left font-medium text-gray-900 dark:text-white">Binary</th>
                </tr>
              </thead>
              <tbody id="ascii-table-body" class="divide-y divide-gray-200 dark:divide-gray-600"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    
    // Store references to inputs
    this.inputs = {
      binary: this.container.querySelector('#binary-input'),
      decimal: this.container.querySelector('#decimal-input'),
      hex: this.container.querySelector('#hex-input'),
      octal: this.container.querySelector('#octal-input'),
      ascii: this.container.querySelector('#ascii-input'),
      base64: this.container.querySelector('#base64-input')
    };
  }
  
  attachEventListeners() {
    // Auto-convert checkbox
    this.container.querySelector('#auto-convert').addEventListener('change', (e) => {
      this.autoConvert = e.target.checked;
    });
    
    // Convert button
    this.container.querySelector('[data-action="convert"]').addEventListener('click', () => this.convertAll());
    
    // Clear button
    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => this.clearAll());
    
    // Copy buttons
    this.container.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.copy;
        this.copyValue(type);
      });
    });
    
    // Input listeners for auto-convert
    Object.entries(this.inputs).forEach(([type, input]) => {
      input.addEventListener('input', () => {
        if (this.autoConvert) {
          this.convertFrom(type);
        }
        this.updateInfo(type);
      });
    });
    
    // Options change
    this.container.querySelectorAll('#group-binary, #prefix-hex, #prefix-octal, #uppercase-hex').forEach(cb => {
      cb.addEventListener('change', () => {
        if (this.autoConvert) {
          // Re-convert with new options
          const activeInput = this.getActiveInput();
          if (activeInput) {
            this.convertFrom(activeInput);
          }
        }
      });
    });
    
    // Quick tools
    this.container.querySelector('[data-action="flip-bits"]').addEventListener('click', () => this.flipBits());
    this.container.querySelector('[data-action="shift-left"]').addEventListener('click', () => this.shiftBits('left'));
    this.container.querySelector('[data-action="shift-right"]').addEventListener('click', () => this.shiftBits('right'));
    this.container.querySelector('[data-action="ones-complement"]').addEventListener('click', () => this.onesComplement());
    this.container.querySelector('[data-action="twos-complement"]').addEventListener('click', () => this.twosComplement());
    this.container.querySelector('[data-action="byte-swap"]').addEventListener('click', () => this.byteSwap());
  }
  
  loadExample() {
    this.generateASCIITable();
    this.convertFrom('binary');
  }
  
  convertFrom(sourceType) {
    const value = this.inputs[sourceType].value.trim();
    if (!value) {
      this.clearAllExcept(sourceType);
      return;
    }
    
    try {
      let decimalValue;
      
      // Convert to decimal first
      switch (sourceType) {
        case 'binary':
          decimalValue = this.binaryToDecimal(value);
          break;
        case 'decimal':
          decimalValue = parseInt(value, 10);
          break;
        case 'hex':
          decimalValue = this.hexToDecimal(value);
          break;
        case 'octal':
          decimalValue = this.octalToDecimal(value);
          break;
        case 'ascii':
          this.asciiToAll(value);
          return;
        case 'base64':
          this.base64ToAll(value);
          return;
      }
      
      if (isNaN(decimalValue)) {
        throw new Error('Invalid input');
      }
      
      // Convert decimal to all other formats
      this.decimalToAll(decimalValue, sourceType);
      
    } catch (error) {
      console.error('Conversion error:', error);
    }
  }
  
  binaryToDecimal(binary) {
    // Remove spaces and validate
    binary = binary.replace(/\s/g, '');
    if (!/^[01]+$/.test(binary)) {
      throw new Error('Invalid binary');
    }
    return parseInt(binary, 2);
  }
  
  hexToDecimal(hex) {
    // Remove 0x prefix if present
    hex = hex.replace(/^0x/i, '').replace(/\s/g, '');
    if (!/^[0-9a-f]+$/i.test(hex)) {
      throw new Error('Invalid hexadecimal');
    }
    return parseInt(hex, 16);
  }
  
  octalToDecimal(octal) {
    // Remove 0o prefix if present
    octal = octal.replace(/^0o/i, '').replace(/\s/g, '');
    if (!/^[0-7]+$/.test(octal)) {
      throw new Error('Invalid octal');
    }
    return parseInt(octal, 8);
  }
  
  decimalToAll(decimal, skipType) {
    const groupBinary = this.container.querySelector('#group-binary').checked;
    const prefixHex = this.container.querySelector('#prefix-hex').checked;
    const prefixOctal = this.container.querySelector('#prefix-octal').checked;
    const uppercaseHex = this.container.querySelector('#uppercase-hex').checked;
    
    // Binary
    if (skipType !== 'binary') {
      let binary = decimal.toString(2);
      if (groupBinary) {
        // Pad to multiple of 8 and group
        const padding = 8 - (binary.length % 8);
        if (padding < 8) {
          binary = '0'.repeat(padding) + binary;
        }
        binary = binary.match(/.{1,8}/g).join(' ');
      }
      this.inputs.binary.value = binary;
    }
    
    // Decimal
    if (skipType !== 'decimal') {
      this.inputs.decimal.value = decimal.toString();
    }
    
    // Hexadecimal
    if (skipType !== 'hex') {
      let hex = decimal.toString(16);
      if (uppercaseHex) {
        hex = hex.toUpperCase();
      }
      if (prefixHex) {
        hex = '0x' + hex;
      }
      this.inputs.hex.value = hex;
    }
    
    // Octal
    if (skipType !== 'octal') {
      let octal = decimal.toString(8);
      if (prefixOctal) {
        octal = '0o' + octal;
      }
      this.inputs.octal.value = octal;
    }
    
    // ASCII (if valid ASCII range)
    if (skipType !== 'ascii') {
      if (decimal >= 0 && decimal <= 127) {
        this.inputs.ascii.value = String.fromCharCode(decimal);
      } else {
        this.inputs.ascii.value = '';
      }
    }
    
    // Base64
    if (skipType !== 'base64') {
      if (decimal >= 0 && decimal <= 255) {
        const byte = String.fromCharCode(decimal);
        this.inputs.base64.value = btoa(byte);
      } else {
        this.inputs.base64.value = '';
      }
    }
    
    // Update all info displays
    Object.keys(this.inputs).forEach(type => {
      if (type !== skipType) {
        this.updateInfo(type);
      }
    });
  }
  
  asciiToAll(ascii) {
    const bytes = [];
    for (let i = 0; i < ascii.length; i++) {
      bytes.push(ascii.charCodeAt(i));
    }
    
    // Binary
    const groupBinary = this.container.querySelector('#group-binary').checked;
    let binary = bytes.map(b => {
      let bin = b.toString(2).padStart(8, '0');
      return bin;
    });
    this.inputs.binary.value = groupBinary ? binary.join(' ') : binary.join('');
    
    // Decimal
    this.inputs.decimal.value = bytes.join(' ');
    
    // Hexadecimal
    const prefixHex = this.container.querySelector('#prefix-hex').checked;
    const uppercaseHex = this.container.querySelector('#uppercase-hex').checked;
    let hex = bytes.map(b => {
      let h = b.toString(16).padStart(2, '0');
      if (uppercaseHex) h = h.toUpperCase();
      if (prefixHex && bytes.length === 1) h = '0x' + h;
      return h;
    }).join(' ');
    this.inputs.hex.value = hex;
    
    // Octal
    const prefixOctal = this.container.querySelector('#prefix-octal').checked;
    let octal = bytes.map(b => {
      let o = b.toString(8);
      if (prefixOctal && bytes.length === 1) o = '0o' + o;
      return o;
    }).join(' ');
    this.inputs.octal.value = octal;
    
    // Base64
    this.inputs.base64.value = btoa(ascii);
    
    // Update info
    Object.keys(this.inputs).forEach(type => {
      if (type !== 'ascii') {
        this.updateInfo(type);
      }
    });
  }
  
  base64ToAll(base64) {
    try {
      const ascii = atob(base64);
      this.inputs.ascii.value = ascii;
      this.asciiToAll(ascii);
    } catch (error) {
      console.error('Invalid Base64:', error);
    }
  }
  
  flipBits() {
    const binary = this.inputs.binary.value.replace(/\s/g, '');
    if (!binary) return;
    
    const flipped = binary.split('').map(bit => bit === '0' ? '1' : '0').join('');
    this.inputs.binary.value = this.formatBinary(flipped);
    this.convertFrom('binary');
  }
  
  shiftBits(direction) {
    const binary = this.inputs.binary.value.replace(/\s/g, '');
    if (!binary) return;
    
    let shifted;
    if (direction === 'left') {
      shifted = binary.slice(1) + '0';
    } else {
      shifted = '0' + binary.slice(0, -1);
    }
    
    this.inputs.binary.value = this.formatBinary(shifted);
    this.convertFrom('binary');
  }
  
  onesComplement() {
    const binary = this.inputs.binary.value.replace(/\s/g, '');
    if (!binary) return;
    
    const complement = binary.split('').map(bit => bit === '0' ? '1' : '0').join('');
    this.inputs.binary.value = this.formatBinary(complement);
    this.convertFrom('binary');
  }
  
  twosComplement() {
    const binary = this.inputs.binary.value.replace(/\s/g, '');
    if (!binary) return;
    
    // First get one's complement
    let complement = binary.split('').map(bit => bit === '0' ? '1' : '0').join('');
    
    // Add 1
    let carry = 1;
    let result = '';
    for (let i = complement.length - 1; i >= 0; i--) {
      const bit = parseInt(complement[i]) + carry;
      result = (bit % 2) + result;
      carry = Math.floor(bit / 2);
    }
    
    this.inputs.binary.value = this.formatBinary(result);
    this.convertFrom('binary');
  }
  
  byteSwap() {
    const hex = this.inputs.hex.value.replace(/^0x/i, '').replace(/\s/g, '');
    if (!hex || hex.length % 2 !== 0) return;
    
    const bytes = hex.match(/.{2}/g);
    const swapped = bytes.reverse().join('');
    
    const prefixHex = this.container.querySelector('#prefix-hex').checked;
    this.inputs.hex.value = (prefixHex ? '0x' : '') + swapped;
    this.convertFrom('hex');
  }
  
  formatBinary(binary) {
    const groupBinary = this.container.querySelector('#group-binary').checked;
    if (groupBinary) {
      const padding = 8 - (binary.length % 8);
      if (padding < 8) {
        binary = '0'.repeat(padding) + binary;
      }
      return binary.match(/.{1,8}/g).join(' ');
    }
    return binary;
  }
  
  updateInfo(type) {
    const value = this.inputs[type].value;
    
    switch (type) {
      case 'binary':
        const bits = value.replace(/\s/g, '').length;
        const bytes = Math.ceil(bits / 8);
        this.container.querySelector('[data-info="binary-bits"]').textContent = `${bits} bits`;
        this.container.querySelector('[data-info="binary-bytes"]').textContent = `${bytes} bytes`;
        break;
      case 'decimal':
        this.container.querySelector('[data-info="decimal-value"]').textContent = `Value: ${value || '0'}`;
        break;
      case 'hex':
        const hexClean = value.replace(/^0x/i, '').replace(/\s/g, '');
        this.container.querySelector('[data-info="hex-format"]').textContent = `Format: 0x${hexClean.substring(0, 8)}...`;
        break;
      case 'octal':
        const octClean = value.replace(/^0o/i, '').replace(/\s/g, '');
        this.container.querySelector('[data-info="octal-format"]').textContent = `Format: 0o${octClean.substring(0, 8)}...`;
        break;
      case 'ascii':
        this.container.querySelector('[data-info="ascii-chars"]').textContent = `${value.length} characters`;
        break;
      case 'base64':
        const size = value ? Math.ceil(value.length * 3 / 4) : 0;
        this.container.querySelector('[data-info="base64-size"]').textContent = `~${size} bytes`;
        break;
    }
  }
  
  generateASCIITable() {
    const tbody = this.container.querySelector('#ascii-table-body');
    let html = '';
    
    for (let i = 33; i <= 126; i++) {
      const char = String.fromCharCode(i);
      const hex = i.toString(16).toUpperCase();
      const oct = i.toString(8);
      const bin = i.toString(2).padStart(8, '0');
      
      html += `
        <tr class="hover:bg-gray-100 dark:hover:bg-gray-600">
          <td class="px-3 py-2 font-mono">${char}</td>
          <td class="px-3 py-2 font-mono">${i}</td>
          <td class="px-3 py-2 font-mono">0x${hex}</td>
          <td class="px-3 py-2 font-mono">0o${oct}</td>
          <td class="px-3 py-2 font-mono">${bin}</td>
        </tr>
      `;
    }
    
    tbody.innerHTML = html;
  }
  
  getActiveInput() {
    for (const [type, input] of Object.entries(this.inputs)) {
      if (input.value.trim()) {
        return type;
      }
    }
    return null;
  }
  
  convertAll() {
    const activeInput = this.getActiveInput();
    if (activeInput) {
      this.convertFrom(activeInput);
    }
  }
  
  clearAll() {
    Object.values(this.inputs).forEach(input => {
      input.value = '';
    });
    Object.keys(this.inputs).forEach(type => {
      this.updateInfo(type);
    });
  }
  
  clearAllExcept(exceptType) {
    Object.entries(this.inputs).forEach(([type, input]) => {
      if (type !== exceptType) {
        input.value = '';
      }
    });
  }
  
  copyValue(type) {
    const value = this.inputs[type].value;
    if (!value) return;
    
    navigator.clipboard.writeText(value).then(() => {
      const btn = this.container.querySelector(`[data-copy="${type}"]`);
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '✓';
      btn.style.color = 'var(--color-success)';
      
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.color = '';
      }, 2000);
    });
  }
}