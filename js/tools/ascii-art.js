export class ASCIIArtGenerator {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.asciiOutput = null;
  }
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.render();
    this.attachEventListeners();
    this.generateFromText('ASCII');
  }
  
  render() {
    this.container.innerHTML = `
      <div class="tool-container">
        <div class="tool-header">
          <h1>ASCII Art Generator</h1>
          <p class="tool-description">Create ASCII art from text, images, and shapes</p>
        </div>
        
        <div class="art-type-selector">
          <button class="type-btn active" data-type="text">Text Art</button>
          <button class="type-btn" data-type="image">Image to ASCII</button>
          <button class="type-btn" data-type="shapes">Shapes</button>
          <button class="type-btn" data-type="banner">Banner</button>
          <button class="type-btn" data-type="table">Table</button>
        </div>
        
        <div class="art-input-container">
          <div id="input-text" class="input-panel active">
            <label for="text-input">Enter Text</label>
            <input 
              type="text" 
              id="text-input" 
              class="input-field" 
              placeholder="Enter text to convert..."
              value="ASCII"
            />
            
            <label for="font-select">Font Style</label>
            <select id="font-select" class="select-input">
              <option value="standard">Standard</option>
              <option value="big">Big</option>
              <option value="block">Block</option>
              <option value="bubble">Bubble</option>
              <option value="digital">Digital</option>
              <option value="ivrit">Ivrit</option>
              <option value="lean">Lean</option>
              <option value="script">Script</option>
              <option value="shadow">Shadow</option>
              <option value="slant">Slant</option>
            </select>
          </div>
          
          <div id="input-image" class="input-panel">
            <label for="image-upload">Upload Image</label>
            <input 
              type="file" 
              id="image-upload" 
              accept="image/*"
              class="file-input"
            />
            <div class="upload-area" id="upload-area">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <p>Drop image here or click to upload</p>
            </div>
            
            <canvas id="image-canvas" width="200" height="200" hidden></canvas>
            
            <div class="image-options">
              <label for="ascii-width">Width: <span id="width-display">80</span> chars</label>
              <input type="range" id="ascii-width" min="40" max="200" value="80" step="10" />
              
              <label for="char-set">Character Set</label>
              <select id="char-set" class="select-input">
                <option value="standard">Standard</option>
                <option value="detailed">Detailed</option>
                <option value="blocks">Blocks</option>
                <option value="binary">Binary</option>
              </select>
              
              <label class="checkbox-label">
                <input type="checkbox" id="invert-chars">
                <span>Invert (for dark backgrounds)</span>
              </label>
            </div>
          </div>
          
          <div id="input-shapes" class="input-panel">
            <label for="shape-select">Select Shape</label>
            <select id="shape-select" class="select-input">
              <option value="rectangle">Rectangle</option>
              <option value="triangle">Triangle</option>
              <option value="circle">Circle</option>
              <option value="diamond">Diamond</option>
              <option value="star">Star</option>
              <option value="heart">Heart</option>
              <option value="arrow">Arrow</option>
              <option value="tree">Tree</option>
            </select>
            
            <div class="shape-options">
              <label for="shape-width">Width: <span id="shape-width-display">20</span></label>
              <input type="range" id="shape-width" min="5" max="50" value="20" />
              
              <label for="shape-height">Height: <span id="shape-height-display">10</span></label>
              <input type="range" id="shape-height" min="5" max="30" value="10" />
              
              <label for="shape-char">Fill Character</label>
              <input type="text" id="shape-char" class="input-field" value="*" maxlength="1" />
            </div>
          </div>
          
          <div id="input-banner" class="input-panel">
            <label for="banner-text">Banner Text</label>
            <input 
              type="text" 
              id="banner-text" 
              class="input-field" 
              placeholder="Enter banner text..."
              value="WELCOME"
            />
            
            <label for="banner-style">Banner Style</label>
            <select id="banner-style" class="select-input">
              <option value="simple">Simple</option>
              <option value="double">Double Line</option>
              <option value="ascii">ASCII Border</option>
              <option value="stars">Stars</option>
              <option value="dashed">Dashed</option>
            </select>
            
            <label for="banner-width">Width: <span id="banner-width-display">60</span></label>
            <input type="range" id="banner-width" min="30" max="100" value="60" />
          </div>
          
          <div id="input-table" class="input-panel">
            <label for="table-data">Table Data (CSV format)</label>
            <textarea 
              id="table-data" 
              class="input-field" 
              placeholder="Header1,Header2,Header3&#10;Data1,Data2,Data3"
              rows="5"
            >Name,Age,City
John Doe,30,New York
Jane Smith,25,Los Angeles
Bob Johnson,35,Chicago</textarea>
            
            <label for="table-style">Table Style</label>
            <select id="table-style" class="select-input">
              <option value="simple">Simple</option>
              <option value="grid">Grid</option>
              <option value="pipe">Pipe</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>
        </div>
        
        <div class="art-output">
          <div class="output-header">
            <h3>ASCII Art Output</h3>
            <div class="output-actions">
              <button class="btn-icon" data-action="copy" title="Copy ASCII Art">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
              <button class="btn-icon" data-action="download" title="Download as Text">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
            </div>
          </div>
          <pre id="ascii-output" class="ascii-display"></pre>
          <div class="output-info">
            <span id="output-lines">0 lines</span>
            <span id="output-chars">0 characters</span>
          </div>
        </div>
        
        <div class="art-actions">
          <button class="btn btn-primary" data-action="generate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Generate ASCII Art
          </button>
          <button class="btn btn-secondary" data-action="clear">Clear</button>
        </div>
        
        <div class="art-gallery">
          <h3>Quick Examples</h3>
          <div class="gallery-grid">
            <button class="gallery-item" data-example="smiley">Smiley Face</button>
            <button class="gallery-item" data-example="cat">Cat</button>
            <button class="gallery-item" data-example="coffee">Coffee Cup</button>
            <button class="gallery-item" data-example="computer">Computer</button>
            <button class="gallery-item" data-example="music">Music Note</button>
            <button class="gallery-item" data-example="rocket">Rocket</button>
          </div>
        </div>
      </div>
    `;
    
    this.canvas = this.container.querySelector('#image-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.asciiOutput = this.container.querySelector('#ascii-output');
  }
  
  attachEventListeners() {
    // Type selector
    this.container.querySelectorAll('.type-btn').forEach(btn => {
      btn.addEventListener('click', () => this.selectType(btn.dataset.type));
    });
    
    // Generate button
    this.container.querySelector('[data-action="generate"]').addEventListener('click', () => this.generateArt());
    
    // Clear button
    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => this.clear());
    
    // Copy button
    this.container.querySelector('[data-action="copy"]').addEventListener('click', () => this.copyArt());
    
    // Download button
    this.container.querySelector('[data-action="download"]').addEventListener('click', () => this.downloadArt());
    
    // Image upload
    const imageUpload = this.container.querySelector('#image-upload');
    const uploadArea = this.container.querySelector('#upload-area');
    
    imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
    
    uploadArea.addEventListener('click', () => imageUpload.click());
    
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        this.handleImageFile(e.dataTransfer.files[0]);
      }
    });
    
    // Range inputs
    this.container.querySelectorAll('input[type="range"]').forEach(range => {
      const display = this.container.querySelector(`#${range.id.replace('-', '-')}-display`);
      if (display) {
        range.addEventListener('input', () => {
          display.textContent = range.value;
        });
      }
    });
    
    // Examples
    this.container.querySelectorAll('[data-example]').forEach(btn => {
      btn.addEventListener('click', () => this.loadExample(btn.dataset.example));
    });
    
    // Auto-generate for text input
    this.container.querySelector('#text-input').addEventListener('input', () => {
      clearTimeout(this.generateTimeout);
      this.generateTimeout = setTimeout(() => this.generateArt(), 500);
    });
    
    this.container.querySelector('#font-select').addEventListener('change', () => this.generateArt());
  }
  
  selectType(type) {
    // Update buttons
    this.container.querySelectorAll('.type-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });
    
    // Update panels
    this.container.querySelectorAll('.input-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `input-${type}`);
    });
    
    // Generate initial art for the type
    this.generateArt();
  }
  
  generateArt() {
    const type = this.container.querySelector('.type-btn.active').dataset.type;
    
    switch (type) {
      case 'text':
        const text = this.container.querySelector('#text-input').value;
        const font = this.container.querySelector('#font-select').value;
        this.generateFromText(text, font);
        break;
        
      case 'image':
        this.generateFromImage();
        break;
        
      case 'shapes':
        const shape = this.container.querySelector('#shape-select').value;
        this.generateShape(shape);
        break;
        
      case 'banner':
        const bannerText = this.container.querySelector('#banner-text').value;
        const bannerStyle = this.container.querySelector('#banner-style').value;
        const bannerWidth = parseInt(this.container.querySelector('#banner-width').value);
        this.generateBanner(bannerText, bannerStyle, bannerWidth);
        break;
        
      case 'table':
        const tableData = this.container.querySelector('#table-data').value;
        const tableStyle = this.container.querySelector('#table-style').value;
        this.generateTable(tableData, tableStyle);
        break;
    }
  }
  
  generateFromText(text, font = 'standard') {
    if (!text) {
      this.asciiOutput.textContent = '';
      return;
    }
    
    // ASCII font mappings (simplified)
    const fonts = {
      standard: this.getStandardFont(),
      big: this.getBigFont(),
      block: this.getBlockFont(),
      // Add more fonts as needed
    };
    
    const selectedFont = fonts[font] || fonts.standard;
    const lines = ['', '', '', '', ''];
    
    for (const char of text.toUpperCase()) {
      const letter = selectedFont[char] || selectedFont[' '];
      if (letter) {
        letter.forEach((line, i) => {
          lines[i] += line + ' ';
        });
      }
    }
    
    this.asciiOutput.textContent = lines.join('\n');
    this.updateInfo();
  }
  
  getStandardFont() {
    return {
      'A': [
        '  ╔═╗  ',
        '  ╠═╣  ',
        '  ╩ ╩  '
      ],
      'B': [
        '  ╔╗   ',
        '  ╠╩╗  ',
        '  ╚═╝  '
      ],
      'C': [
        '  ╔═╗  ',
        '  ║    ',
        '  ╚═╝  '
      ],
      'D': [
        '  ╔╦╗  ',
        '  ║ ║  ',
        '  ╚═╝  '
      ],
      'E': [
        '  ╔═╗  ',
        '  ╠═   ',
        '  ╚═╝  '
      ],
      'F': [
        '  ╔═╗  ',
        '  ╠═   ',
        '  ╚    '
      ],
      'G': [
        '  ╔═╗  ',
        '  ║ ╦  ',
        '  ╚═╝  '
      ],
      'H': [
        '  ╦ ╦  ',
        '  ╠═╣  ',
        '  ╩ ╩  '
      ],
      'I': [
        '  ╦    ',
        '  ║    ',
        '  ╩    '
      ],
      'J': [
        '    ╦  ',
        '    ║  ',
        '  ╚═╝  '
      ],
      'K': [
        '  ╦╔═  ',
        '  ╠╩╗  ',
        '  ╩ ╩  '
      ],
      'L': [
        '  ╦    ',
        '  ║    ',
        '  ╚═╝  '
      ],
      'M': [
        '  ╔╦╗  ',
        '  ║║║  ',
        '  ╩ ╩  '
      ],
      'N': [
        '  ╔╗╔  ',
        '  ║║║  ',
        '  ╝╚╝  '
      ],
      'O': [
        '  ╔═╗  ',
        '  ║ ║  ',
        '  ╚═╝  '
      ],
      'P': [
        '  ╔═╗  ',
        '  ╠═╝  ',
        '  ╩    '
      ],
      'Q': [
        '  ╔═╗  ',
        '  ║ ║  ',
        '  ╚═╚╗ '
      ],
      'R': [
        '  ╔═╗  ',
        '  ╠╦╝  ',
        '  ╩╚═  '
      ],
      'S': [
        '  ╔═╗  ',
        '  ╚═╗  ',
        '  ╚═╝  '
      ],
      'T': [
        '  ╔╦╗  ',
        '   ║   ',
        '   ╩   '
      ],
      'U': [
        '  ╦ ╦  ',
        '  ║ ║  ',
        '  ╚═╝  '
      ],
      'V': [
        '  ╦  ╦ ',
        '  ╚╗╔╝ ',
        '   ╚╝  '
      ],
      'W': [
        '  ╦ ╦  ',
        '  ║║║  ',
        '  ╚╩╝  '
      ],
      'X': [
        '  ╔╗╔  ',
        '  ╠╬╣  ',
        '  ╚╝╚  '
      ],
      'Y': [
        '  ╦ ╦  ',
        '  ╚╦╝  ',
        '   ╩   '
      ],
      'Z': [
        '  ╔═╗  ',
        '  ╔═╝  ',
        '  ╚═╝  '
      ],
      ' ': [
        '       ',
        '       ',
        '       '
      ]
    };
  }
  
  getBigFont() {
    return {
      'A': [
        '    ███    ',
        '   ██ ██   ',
        '  ███████  ',
        ' ██     ██ ',
        '██       ██'
      ],
      'S': [
        ' ████████  ',
        '██         ',
        ' ████████  ',
        '        ██ ',
        ' ████████  '
      ],
      'C': [
        '  ████████ ',
        ' ██        ',
        '██         ',
        ' ██        ',
        '  ████████ '
      ],
      'I': [
        ' ████████  ',
        '    ██     ',
        '    ██     ',
        '    ██     ',
        ' ████████  '
      ],
      ' ': [
        '           ',
        '           ',
        '           ',
        '           ',
        '           '
      ]
    };
  }
  
  getBlockFont() {
    return {
      'A': ['█▀▀█', '█▄▄█', '▀  ▀'],
      'B': ['█▀▀▄', '█▀▀▄', '█▄▄▀'],
      'C': ['█▀▀▀', '█   ', '█▄▄▄'],
      'D': ['█▀▀▄', '█  █', '█▄▄▀'],
      'E': ['█▀▀▀', '█▀▀ ', '█▄▄▄'],
      'F': ['█▀▀▀', '█▀▀ ', '█   '],
      'G': ['█▀▀▀', '█ ▀█', '█▄▄█'],
      'H': ['█  █', '█▀▀█', '█  █'],
      'I': ['▀█▀', ' █ ', '▄█▄'],
      'J': ['  ▀█', '   █', '█▄▄█'],
      'K': ['█ █▀', '█▀▄ ', '█ ▀▄'],
      'L': ['█   ', '█   ', '█▄▄▄'],
      'M': ['█▀▄▀█', '█ █ █', '█   █'],
      'N': ['█▀▀█', '█  █', '█  █'],
      'O': ['█▀▀█', '█  █', '█▄▄█'],
      'P': ['█▀▀█', '█▄▄▀', '█   '],
      'Q': ['█▀▀█', '█  █', '▀▀▀█'],
      'R': ['█▀▀█', '█▄▄▀', '█  █'],
      'S': ['█▀▀▀', '▀▀▀█', '█▄▄█'],
      'T': ['▀█▀█▀', ' █  ', ' █  '],
      'U': ['█  █', '█  █', '█▄▄█'],
      'V': ['█   █', '▀█ █▀', ' ▀▀▀ '],
      'W': ['█   █', '█ █ █', '█▄▀▄█'],
      'X': ['█ █', '▄▀▄', '█ █'],
      'Y': ['█   █', '▀█▄█▀', '  █  '],
      'Z': ['█▀▀▀█', ' ▄▄▀ ', '█▄▄▄█'],
      ' ': ['     ', '     ', '     ']
    };
  }
  
  handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      this.handleImageFile(file);
    }
  }
  
  handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.canvas.hidden = false;
        this.processImage(img);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  
  processImage(img) {
    const width = parseInt(this.container.querySelector('#ascii-width').value);
    const height = Math.floor((img.height / img.width) * width * 0.5);
    
    this.canvas.width = width;
    this.canvas.height = height;
    
    this.ctx.drawImage(img, 0, 0, width, height);
    this.generateFromImage();
  }
  
  generateFromImage() {
    if (this.canvas.hidden) return;
    
    const width = this.canvas.width;
    const height = this.canvas.height;
    const imageData = this.ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    
    const charSet = this.container.querySelector('#char-set').value;
    const invert = this.container.querySelector('#invert-chars').checked;
    
    const chars = this.getCharSet(charSet);
    if (invert) chars.reverse();
    
    let ascii = '';
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        // Calculate brightness
        const brightness = (r + g + b) / 3;
        const charIndex = Math.floor((brightness / 255) * (chars.length - 1));
        ascii += chars[charIndex];
      }
      ascii += '\n';
    }
    
    this.asciiOutput.textContent = ascii;
    this.updateInfo();
  }
  
  getCharSet(type) {
    switch (type) {
      case 'detailed':
        return ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';
      case 'blocks':
        return ' ░▒▓█';
      case 'binary':
        return ' 01';
      default:
        return ' .:-=+*#%@';
    }
  }
  
  generateShape(shape) {
    const width = parseInt(this.container.querySelector('#shape-width').value);
    const height = parseInt(this.container.querySelector('#shape-height').value);
    const char = this.container.querySelector('#shape-char').value || '*';
    
    let ascii = '';
    
    switch (shape) {
      case 'rectangle':
        for (let y = 0; y < height; y++) {
          ascii += char.repeat(width) + '\n';
        }
        break;
        
      case 'triangle':
        for (let y = 0; y < height; y++) {
          const spaces = ' '.repeat(height - y - 1);
          const stars = char.repeat(2 * y + 1);
          ascii += spaces + stars + '\n';
        }
        break;
        
      case 'circle':
        const radius = Math.min(width, height) / 2;
        for (let y = 0; y < height; y++) {
          let line = '';
          for (let x = 0; x < width; x++) {
            const dx = x - width / 2;
            const dy = y - height / 2;
            const distance = Math.sqrt(dx * dx + dy * dy);
            line += distance <= radius ? char : ' ';
          }
          ascii += line + '\n';
        }
        break;
        
      case 'diamond':
        const mid = Math.floor(height / 2);
        for (let y = 0; y < height; y++) {
          const dist = Math.abs(y - mid);
          const spaces = ' '.repeat(dist);
          const chars = char.repeat((height - dist * 2));
          ascii += spaces + chars + '\n';
        }
        break;
        
      case 'star':
        ascii = `    ${char}\n   ${char}${char}${char}\n  ${char}${char}${char}${char}${char}\n ${char}${char}${char}${char}${char}${char}${char}\n${char}${char}${char}${char}${char}${char}${char}${char}${char}\n  ${char}${char}${char}${char}${char}\n ${char}${char} ${char} ${char}${char}\n${char}${char}   ${char}${char}`;
        break;
        
      case 'heart':
        ascii = ` ${char}${char}${char}   ${char}${char}${char}\n${char}${char}${char}${char}${char} ${char}${char}${char}${char}${char}\n${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}\n ${char}${char}${char}${char}${char}${char}${char}${char}${char}\n  ${char}${char}${char}${char}${char}${char}${char}\n   ${char}${char}${char}${char}${char}\n    ${char}${char}${char}\n     ${char}`;
        break;
        
      case 'arrow':
        ascii = `    ${char}\n   ${char}${char}${char}\n  ${char}${char}${char}${char}${char}\n ${char}${char}${char}${char}${char}${char}${char}\n    ${char}${char}${char}\n    ${char}${char}${char}\n    ${char}${char}${char}`;
        break;
        
      case 'tree':
        ascii = `     ${char}\n    ${char}${char}${char}\n   ${char}${char}${char}${char}${char}\n  ${char}${char}${char}${char}${char}${char}${char}\n ${char}${char}${char}${char}${char}${char}${char}${char}${char}\n${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}${char}\n     |||`;
        break;
    }
    
    this.asciiOutput.textContent = ascii;
    this.updateInfo();
  }
  
  generateBanner(text, style, width) {
    if (!text) {
      this.asciiOutput.textContent = '';
      return;
    }
    
    const padding = Math.max(0, Math.floor((width - text.length - 4) / 2));
    const paddedText = ' '.repeat(padding) + text + ' '.repeat(padding);
    
    let banner = '';
    
    switch (style) {
      case 'simple':
        banner = `${'─'.repeat(width)}\n`;
        banner += `│${paddedText.padEnd(width - 2)}│\n`;
        banner += `${'─'.repeat(width)}`;
        break;
        
      case 'double':
        banner = `╔${'═'.repeat(width - 2)}╗\n`;
        banner += `║${paddedText.padEnd(width - 2)}║\n`;
        banner += `╚${'═'.repeat(width - 2)}╝`;
        break;
        
      case 'ascii':
        banner = `+${'-'.repeat(width - 2)}+\n`;
        banner += `|${paddedText.padEnd(width - 2)}|\n`;
        banner += `+${'-'.repeat(width - 2)}+`;
        break;
        
      case 'stars':
        banner = `${'*'.repeat(width)}\n`;
        banner += `*${paddedText.padEnd(width - 2)}*\n`;
        banner += `${'*'.repeat(width)}`;
        break;
        
      case 'dashed':
        banner = `┌${'┈'.repeat(width - 2)}┐\n`;
        banner += `┊${paddedText.padEnd(width - 2)}┊\n`;
        banner += `└${'┈'.repeat(width - 2)}┘`;
        break;
    }
    
    this.asciiOutput.textContent = banner;
    this.updateInfo();
  }
  
  generateTable(csvData, style) {
    if (!csvData) {
      this.asciiOutput.textContent = '';
      return;
    }
    
    const rows = csvData.trim().split('\n').map(row => row.split(',').map(cell => cell.trim()));
    if (rows.length === 0) return;
    
    // Calculate column widths
    const colWidths = [];
    for (let col = 0; col < rows[0].length; col++) {
      let maxWidth = 0;
      for (let row = 0; row < rows.length; row++) {
        if (rows[row][col]) {
          maxWidth = Math.max(maxWidth, rows[row][col].length);
        }
      }
      colWidths.push(maxWidth + 2);
    }
    
    let table = '';
    
    switch (style) {
      case 'simple':
        rows.forEach((row, i) => {
          row.forEach((cell, j) => {
            table += cell.padEnd(colWidths[j]);
          });
          table += '\n';
          if (i === 0) {
            table += '-'.repeat(colWidths.reduce((a, b) => a + b, 0)) + '\n';
          }
        });
        break;
        
      case 'grid':
        // Top border
        table += '┌' + colWidths.map(w => '─'.repeat(w)).join('┬') + '┐\n';
        
        rows.forEach((row, i) => {
          table += '│';
          row.forEach((cell, j) => {
            table += ' ' + cell.padEnd(colWidths[j] - 1) + '│';
          });
          table += '\n';
          
          if (i === 0) {
            table += '├' + colWidths.map(w => '─'.repeat(w)).join('┼') + '┤\n';
          }
        });
        
        // Bottom border
        table += '└' + colWidths.map(w => '─'.repeat(w)).join('┴') + '┘';
        break;
        
      case 'pipe':
        rows.forEach((row, i) => {
          table += '| ' + row.map((cell, j) => cell.padEnd(colWidths[j] - 2)).join(' | ') + ' |\n';
          if (i === 0) {
            table += '|' + colWidths.map(w => '-'.repeat(w)).join('|') + '|\n';
          }
        });
        break;
        
      case 'markdown':
        rows.forEach((row, i) => {
          table += '| ' + row.map((cell, j) => cell.padEnd(colWidths[j] - 2)).join(' | ') + ' |\n';
          if (i === 0) {
            table += '|' + colWidths.map(w => ':' + '-'.repeat(w - 2) + ':').join('|') + '|\n';
          }
        });
        break;
    }
    
    this.asciiOutput.textContent = table;
    this.updateInfo();
  }
  
  loadExample(example) {
    const examples = {
      smiley: '   ◕ ◡ ◕\n  \\     /\n   \\___/',
      cat: '    /\\_/\\\n   ( o.o )\n    > ^ <',
      coffee: '    ) (\n   (   )\n  |~~~~~|\n  \\___/',
      computer: ' ___________\n|  _______  |\n| |       | |\n| |_______| |\n|___________|',
      music: '    ♪ ♫\n   ♫   ♪\n  ♪  ♫  ♪',
      rocket: '     ^\n    /|\\\n   / | \\\n  |  |  |\n  | === |\n  |  |  |\n /|  |  |\\\n/_|__|__|_\\'
    };
    
    this.asciiOutput.textContent = examples[example] || '';
    this.updateInfo();
  }
  
  updateInfo() {
    const text = this.asciiOutput.textContent;
    const lines = text.split('\n').length;
    const chars = text.length;
    
    this.container.querySelector('#output-lines').textContent = `${lines} lines`;
    this.container.querySelector('#output-chars').textContent = `${chars} characters`;
  }
  
  copyArt() {
    const text = this.asciiOutput.textContent;
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
      const btn = this.container.querySelector('[data-action="copy"]');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '✓';
      btn.style.color = 'var(--color-success)';
      
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.color = '';
      }, 2000);
    });
  }
  
  downloadArt() {
    const text = this.asciiOutput.textContent;
    if (!text) return;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.txt';
    a.click();
    URL.revokeObjectURL(url);
  }
  
  clear() {
    this.asciiOutput.textContent = '';
    this.canvas.hidden = true;
    this.updateInfo();
  }
}