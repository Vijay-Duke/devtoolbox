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
      <div class="tool-container">
        <div class="tool-header">
          <h1>Binary Converter</h1>
          <p class="tool-description">Convert between binary, decimal, hexadecimal, octal, and ASCII</p>
        </div>
        
        <div class="tool-controls">
          <div class="control-group">
            <label class="checkbox-label">
              <input type="checkbox" id="auto-convert" checked>
              <span>Auto-convert on input</span>
            </label>
          </div>
          <div class="action-buttons">
            <button class="btn btn-primary" data-action="convert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 3 21 3 21 8"></polyline>
                <line x1="4" y1="20" x2="21" y2="3"></line>
                <polyline points="21 16 21 21 16 21"></polyline>
                <line x1="15" y1="15" x2="21" y2="21"></line>
                <line x1="4" y1="4" x2="9" y2="9"></line>
              </svg>
              Convert All
            </button>
            <button class="btn btn-secondary" data-action="clear">Clear All</button>
          </div>
        </div>
        
        <div class="converter-grid">
          <div class="converter-box">
            <div class="converter-header">
              <h3>Binary (Base 2)</h3>
              <button class="btn-icon" data-copy="binary" title="Copy">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
            <textarea 
              id="binary-input" 
              class="converter-input" 
              placeholder="Enter binary (e.g., 11111111)"
              spellcheck="false"
            >01001000 01100101 01101100 01101100 01101111</textarea>
            <div class="input-info">
              <span data-info="binary-bits">0 bits</span>
              <span data-info="binary-bytes">0 bytes</span>
            </div>
          </div>
          
          <div class="converter-box">
            <div class="converter-header">
              <h3>Decimal (Base 10)</h3>
              <button class="btn-icon" data-copy="decimal" title="Copy">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
            <textarea 
              id="decimal-input" 
              class="converter-input" 
              placeholder="Enter decimal (e.g., 255)"
              spellcheck="false"
            ></textarea>
            <div class="input-info">
              <span data-info="decimal-value">Value: 0</span>
            </div>
          </div>
          
          <div class="converter-box">
            <div class="converter-header">
              <h3>Hexadecimal (Base 16)</h3>
              <button class="btn-icon" data-copy="hex" title="Copy">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
            <textarea 
              id="hex-input" 
              class="converter-input" 
              placeholder="Enter hexadecimal (e.g., FF)"
              spellcheck="false"
            ></textarea>
            <div class="input-info">
              <span data-info="hex-format">Format: 0x00</span>
            </div>
          </div>
          
          <div class="converter-box">
            <div class="converter-header">
              <h3>Octal (Base 8)</h3>
              <button class="btn-icon" data-copy="octal" title="Copy">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
            <textarea 
              id="octal-input" 
              class="converter-input" 
              placeholder="Enter octal (e.g., 377)"
              spellcheck="false"
            ></textarea>
            <div class="input-info">
              <span data-info="octal-format">Format: 0o00</span>
            </div>
          </div>
          
          <div class="converter-box">
            <div class="converter-header">
              <h3>ASCII Text</h3>
              <button class="btn-icon" data-copy="ascii" title="Copy">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
            <textarea 
              id="ascii-input" 
              class="converter-input" 
              placeholder="Enter ASCII text"
              spellcheck="false"
            ></textarea>
            <div class="input-info">
              <span data-info="ascii-chars">0 characters</span>
            </div>
          </div>
          
          <div class="converter-box">
            <div class="converter-header">
              <h3>Base64</h3>
              <button class="btn-icon" data-copy="base64" title="Copy">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
            <textarea 
              id="base64-input" 
              class="converter-input" 
              placeholder="Enter Base64"
              spellcheck="false"
            ></textarea>
            <div class="input-info">
              <span data-info="base64-size">0 bytes</span>
            </div>
          </div>
        </div>
        
        <div class="conversion-options">
          <h3>Conversion Options</h3>
          <div class="options-grid">
            <label class="checkbox-label">
              <input type="checkbox" id="group-binary" checked>
              <span>Group Binary by 8 bits</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" id="prefix-hex" checked>
              <span>Add 0x Prefix to Hex</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" id="prefix-octal" checked>
              <span>Add 0o Prefix to Octal</span>
            </label>
            <label class="checkbox-label">
              <input type="checkbox" id="uppercase-hex">
              <span>Uppercase Hex</span>
            </label>
          </div>
        </div>
        
        <div class="conversion-tools">
          <h3>Quick Tools</h3>
          <div class="tools-grid">
            <button class="btn btn-sm" data-action="flip-bits">Flip Bits</button>
            <button class="btn btn-sm" data-action="shift-left">Shift Left</button>
            <button class="btn btn-sm" data-action="shift-right">Shift Right</button>
            <button class="btn btn-sm" data-action="ones-complement">1's Complement</button>
            <button class="btn btn-sm" data-action="twos-complement">2's Complement</button>
            <button class="btn btn-sm" data-action="byte-swap">Byte Swap</button>
          </div>
        </div>
        
        <div class="conversion-table" id="conversion-table">
          <h3>ASCII Character Table</h3>
          <div class="table-container">
            <table class="ascii-table">
              <thead>
                <tr>
                  <th>Char</th>
                  <th>Dec</th>
                  <th>Hex</th>
                  <th>Oct</th>
                  <th>Binary</th>
                </tr>
              </thead>
              <tbody id="ascii-table-body"></tbody>
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
    this.container.querySelectorAll('.conversion-options input').forEach(cb => {
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
        <tr>
          <td>${char}</td>
          <td>${i}</td>
          <td>0x${hex}</td>
          <td>0o${oct}</td>
          <td>${bin}</td>
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