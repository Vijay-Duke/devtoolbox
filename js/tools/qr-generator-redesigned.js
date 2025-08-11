export class QRGeneratorRedesigned {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.qrData = null;
    this.currentType = 'text';
    this.currentSize = 256;
  }
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    // Add class for CSS targeting
    this.container.classList.add('qr-generator');
    
    this.render();
    this.attachEventListeners();
    this.generateQR();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="tool-container">
        <div class="tool-header">
          <h1 class="tool-title">QR Code Generator</h1>
          <p class="tool-description">Create QR codes for text, URLs, WiFi, contacts, and more with customizable styling</p>
        </div>
        
        <div class="qr-main-container">
          <div class="qr-input-section">
            <div class="qr-type-tabs">
              <button class="type-tab active" data-type="text">
                <svg class="type-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
                Text
              </button>
              <button class="type-tab" data-type="url">
                <svg class="type-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                URL
              </button>
              <button class="type-tab" data-type="email">
                <svg class="type-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Email
              </button>
              <button class="type-tab" data-type="wifi">
                <svg class="type-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9z"/>
                  <path d="M5 13l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.24 9.24 8.76 9.24 5 13z"/>
                </svg>
                WiFi
              </button>
            </div>
            
            <div class="qr-input-container">
              <!-- Text Panel -->
              <div id="input-text" class="input-panel active">
                <div class="input-group">
                  <label class="input-label" for="text-input">Text or Data</label>
                  <textarea 
                    id="text-input" 
                    class="textarea-field" 
                    placeholder="Enter any text or data..."
                    rows="4"
                  >Hello, World! Visit devtoolbox.app</textarea>
                </div>
              </div>
              
              <!-- URL Panel -->
              <div id="input-url" class="input-panel">
                <div class="input-group">
                  <label class="input-label" for="url-input">Website URL</label>
                  <input 
                    type="url" 
                    id="url-input" 
                    class="input-field" 
                    placeholder="https://example.com"
                    value="https://devtoolbox.app"
                  />
                </div>
              </div>
              
              <!-- Email Panel -->
              <div id="input-email" class="input-panel">
                <div class="input-group">
                  <label class="input-label" for="email-to">Email Address</label>
                  <input type="email" id="email-to" class="input-field" placeholder="user@example.com" />
                </div>
                <div class="input-group">
                  <label class="input-label" for="email-subject">Subject (optional)</label>
                  <input type="text" id="email-subject" class="input-field" placeholder="Email subject" />
                </div>
                <div class="input-group">
                  <label class="input-label" for="email-body">Message (optional)</label>
                  <textarea id="email-body" class="textarea-field" placeholder="Email message..." rows="3"></textarea>
                </div>
              </div>
              
              <!-- WiFi Panel -->
              <div id="input-wifi" class="input-panel">
                <div class="input-group">
                  <label class="input-label" for="wifi-ssid">Network Name (SSID)</label>
                  <input type="text" id="wifi-ssid" class="input-field" placeholder="MyWiFiNetwork" />
                </div>
                <div class="input-group">
                  <label class="input-label" for="wifi-password">Password</label>
                  <input type="password" id="wifi-password" class="input-field" placeholder="Password" />
                </div>
                <div class="input-group">
                  <label class="input-label" for="wifi-security">Security Type</label>
                  <select id="wifi-security" class="select-field">
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">No Password</option>
                  </select>
                </div>
                <div class="checkbox-group">
                  <input type="checkbox" id="wifi-hidden" class="checkbox-input">
                  <label for="wifi-hidden" class="checkbox-label">Hidden Network</label>
                </div>
              </div>
              
              <!-- Customization Section -->
              <div class="qr-customization">
                <h3 class="customization-title">Customization</h3>
                
                <div class="input-group">
                  <label class="input-label">Size</label>
                  <div class="size-selector">
                    <div class="size-options">
                      <button class="size-btn" data-size="128">128px</button>
                      <button class="size-btn active" data-size="256">256px</button>
                      <button class="size-btn" data-size="384">384px</button>
                      <button class="size-btn" data-size="512">512px</button>
                    </div>
                  </div>
                </div>
                
                <div class="input-group">
                  <label class="input-label" for="error-correction">Error Correction</label>
                  <select id="error-correction" class="select-field">
                    <option value="L">Low (7%)</option>
                    <option value="M" selected>Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                </div>
                
                <div class="color-group">
                  <div class="color-input-group">
                    <label class="color-input-label">Foreground Color</label>
                    <div class="color-input-wrapper">
                      <input type="color" id="fg-color" class="color-input" value="#000000" />
                      <input type="text" class="color-value" value="#000000" readonly />
                    </div>
                  </div>
                  <div class="color-input-group">
                    <label class="color-input-label">Background Color</label>
                    <div class="color-input-wrapper">
                      <input type="color" id="bg-color" class="color-input" value="#FFFFFF" />
                      <input type="text" class="color-value" value="#FFFFFF" readonly />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="qr-preview-section">
            <div class="qr-preview-container">
              <canvas id="qr-canvas" class="qr-canvas" width="256" height="256"></canvas>
              <div class="qr-info">
                <div class="qr-size-info">256 × 256 pixels</div>
                <div>
                  <span id="qr-data-size">0 bytes</span> • 
                  <span id="qr-modules">0 modules</span>
                </div>
              </div>
            </div>
            
            <div class="qr-download-section">
              <h3 class="download-title">Download Options</h3>
              
              <div class="download-options">
                <label class="download-option selected">
                  <input type="radio" name="format" value="png" checked>
                  <span>PNG</span>
                </label>
                <label class="download-option">
                  <input type="radio" name="format" value="svg">
                  <span>SVG</span>
                </label>
              </div>
              
              <button class="download-btn" data-action="download">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.canvas = this.container.querySelector('#qr-canvas');
    this.ctx = this.canvas.getContext('2d');
  }
  
  attachEventListeners() {
    // Type tabs
    this.container.querySelectorAll('.type-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchType(tab.dataset.type);
      });
    });
    
    // Size buttons
    this.container.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.changeSize(parseInt(btn.dataset.size));
      });
    });
    
    // Input changes
    this.container.addEventListener('input', (e) => {
      if (e.target.matches('input, textarea, select')) {
        this.debounceGenerate();
      }
    });
    
    // Color inputs
    this.container.querySelector('#fg-color').addEventListener('change', (e) => {
      this.container.querySelector('.color-value').value = e.target.value;
      this.generateQR();
    });
    
    this.container.querySelector('#bg-color').addEventListener('change', (e) => {
      this.container.querySelector('.color-value').value = e.target.value;
      this.generateQR();
    });
    
    // Download
    this.container.querySelector('[data-action="download"]').addEventListener('click', () => {
      this.downloadQR();
    });
    
    // Format selection
    this.container.querySelectorAll('input[name="format"]').forEach(radio => {
      radio.addEventListener('change', () => {
        this.updateDownloadOptions();
      });
    });
  }
  
  switchType(type) {
    this.currentType = type;
    
    // Update tab state
    this.container.querySelectorAll('.type-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.type === type);
    });
    
    // Show correct panel
    this.container.querySelectorAll('.input-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `input-${type}`);
    });
    
    this.generateQR();
  }
  
  changeSize(size) {
    this.currentSize = size;
    
    // Update button state
    this.container.querySelectorAll('.size-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.size) === size);
    });
    
    // Update canvas and info
    this.canvas.width = size;
    this.canvas.height = size;
    this.container.querySelector('.qr-size-info').textContent = `${size} × ${size} pixels`;
    
    this.generateQR();
  }
  
  debounceGenerate() {
    clearTimeout(this.generateTimeout);
    this.generateTimeout = setTimeout(() => {
      this.generateQR();
    }, 300);
  }
  
  getQRData() {
    const type = this.currentType;
    
    switch (type) {
      case 'text':
        return this.container.querySelector('#text-input').value;
        
      case 'url':
        const url = this.container.querySelector('#url-input').value;
        return url || '';
        
      case 'email':
        const email = this.container.querySelector('#email-to').value;
        const subject = this.container.querySelector('#email-subject').value;
        const body = this.container.querySelector('#email-body').value;
        if (!email) return '';
        
        let mailto = `mailto:${email}`;
        const params = [];
        if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
        if (body) params.push(`body=${encodeURIComponent(body)}`);
        if (params.length > 0) mailto += '?' + params.join('&');
        return mailto;
        
      case 'wifi':
        const ssid = this.container.querySelector('#wifi-ssid').value;
        const password = this.container.querySelector('#wifi-password').value;
        const security = this.container.querySelector('#wifi-security').value;
        const hidden = this.container.querySelector('#wifi-hidden').checked;
        if (!ssid) return '';
        return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden ? 'true' : 'false'};;`;
        
      default:
        return 'Hello, World!';
    }
  }
  
  generateQR() {
    const data = this.getQRData();
    if (!data) {
      this.showError('Please enter some data to generate QR code');
      return;
    }
    
    try {
      // Simple QR code generation (this would normally use a QR library)
      this.qrData = this.createSimpleQR(data);
      this.drawQR();
      this.updateInfo(data);
    } catch (error) {
      this.showError('Error generating QR code: ' + error.message);
    }
  }
  
  createSimpleQR(data) {
    // This is a simplified QR generation for demo purposes
    // In production, you'd use a proper QR code library
    const size = 21; // Standard QR size for demo
    const modules = Array(size).fill().map(() => Array(size).fill(false));
    
    // Add some pattern based on data (very simplified)
    const hash = this.simpleHash(data);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        modules[i][j] = (hash + i * size + j) % 3 === 0;
      }
    }
    
    // Add finder patterns
    this.addFinderPattern(modules, 0, 0);
    this.addFinderPattern(modules, 0, size - 7);
    this.addFinderPattern(modules, size - 7, 0);
    
    return { size, modules };
  }
  
  addFinderPattern(modules, startRow, startCol) {
    const pattern = [
      [1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1]
    ];
    
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (startRow + i < modules.length && startCol + j < modules[0].length) {
          modules[startRow + i][startCol + j] = pattern[i][j] === 1;
        }
      }
    }
  }
  
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  
  drawQR() {
    if (!this.qrData) return;
    
    const canvas = this.canvas;
    const ctx = this.ctx;
    const size = canvas.width;
    const qrSize = this.qrData.size;
    const moduleSize = Math.floor(size / qrSize);
    
    const fgColor = this.container.querySelector('#fg-color').value;
    const bgColor = this.container.querySelector('#bg-color').value;
    
    // Clear canvas
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
    
    // Draw modules
    ctx.fillStyle = fgColor;
    for (let row = 0; row < qrSize; row++) {
      for (let col = 0; col < qrSize; col++) {
        if (this.qrData.modules[row][col]) {
          ctx.fillRect(
            col * moduleSize,
            row * moduleSize,
            moduleSize,
            moduleSize
          );
        }
      }
    }
  }
  
  updateInfo(data) {
    const bytes = new Blob([data]).size;
    const modules = this.qrData ? this.qrData.size * this.qrData.size : 0;
    
    this.container.querySelector('#qr-data-size').textContent = `${bytes} bytes`;
    this.container.querySelector('#qr-modules').textContent = `${modules} modules`;
  }
  
  showError(message) {
    // Show error in the preview area
    const ctx = this.ctx;
    const size = this.canvas.width;
    
    const errorBg = getComputedStyle(document.documentElement).getPropertyValue('--color-error-light').trim() || '#fee2e2';
    const errorText = getComputedStyle(document.documentElement).getPropertyValue('--color-error').trim() || '#dc2626';
    
    ctx.fillStyle = errorBg;
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = errorText;
    ctx.font = '16px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Error', size / 2, size / 2 - 10);
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(message.substring(0, 30) + (message.length > 30 ? '...' : ''), size / 2, size / 2 + 10);
  }
  
  downloadQR() {
    const format = this.container.querySelector('input[name="format"]:checked').value;
    
    if (format === 'png') {
      this.downloadPNG();
    } else if (format === 'svg') {
      this.downloadSVG();
    }
  }
  
  downloadPNG() {
    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.png`;
    link.href = this.canvas.toDataURL();
    link.click();
  }
  
  downloadSVG() {
    if (!this.qrData) return;
    
    const size = this.currentSize;
    const qrSize = this.qrData.size;
    const moduleSize = Math.floor(size / qrSize);
    const fgColor = this.container.querySelector('#fg-color').value;
    const bgColor = this.container.querySelector('#bg-color').value;
    
    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${bgColor}"/>`;
    
    for (let row = 0; row < qrSize; row++) {
      for (let col = 0; col < qrSize; col++) {
        if (this.qrData.modules[row][col]) {
          svg += `\n  <rect x="${col * moduleSize}" y="${row * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${fgColor}"/>`;
        }
      }
    }
    
    svg += '\n</svg>';
    
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }
  
  updateDownloadOptions() {
    const format = this.container.querySelector('input[name="format"]:checked').value;
    // Update download button text or styling based on format
    const btn = this.container.querySelector('.download-btn');
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7,10 12,15 17,10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Download ${format.toUpperCase()}
    `;
  }
}