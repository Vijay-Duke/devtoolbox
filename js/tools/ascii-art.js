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
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">ASCII Art Generator</h1>
          <p class="text-gray-600 dark:text-gray-300">Create ASCII art from text, images, and shapes</p>
        </div>
        
        <div class="flex flex-wrap gap-2 mb-6">
          <button class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-btn active" data-type="text">Text Art</button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-btn" data-type="image">Image to ASCII</button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-btn" data-type="shapes">Shapes</button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-btn" data-type="banner">Banner</button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-btn" data-type="table">Table</button>
        </div>
        
        <div class="mb-6">
          <div id="input-text" class="input-panel active">
            <label for="text-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Enter Text</label>
            <input 
              type="text" 
              id="text-input" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" 
              placeholder="Enter text to convert..."
              value="ASCII"
            />
            
            <label for="font-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">Font Style</label>
            <select id="font-select" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
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
          
          <div id="input-image" class="input-panel hidden">
            <label for="image-upload" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Image</label>
            <input 
              type="file" 
              id="image-upload" 
              accept="image/*"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <div class="mt-4 p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center hover:border-blue-400 cursor-pointer" id="upload-area">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto text-gray-400">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <p class="mt-2 text-gray-600 dark:text-gray-400">Drop image here or click to upload</p>
            </div>
            
            <canvas id="image-canvas" width="200" height="200" hidden></canvas>
            
            <div class="mt-4 space-y-4">
              <div>
                <label for="ascii-width" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Width: <span id="width-display">80</span> chars</label>
                <input type="range" id="ascii-width" min="40" max="200" value="80" step="10" class="w-full" />
              </div>
              
              <div>
                <label for="char-set" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Character Set</label>
                <select id="char-set" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  <option value="standard">Standard</option>
                  <option value="detailed">Detailed</option>
                  <option value="blocks">Blocks</option>
                  <option value="binary">Binary</option>
                </select>
              </div>
              
              <label class="flex items-center">
                <input type="checkbox" id="invert-chars" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Invert (for dark backgrounds)</span>
              </label>
            </div>
          </div>
          
          <div id="input-shapes" class="input-panel hidden">
            <label for="shape-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Shape</label>
            <select id="shape-select" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="rectangle">Rectangle</option>
              <option value="triangle">Triangle</option>
              <option value="circle">Circle</option>
              <option value="diamond">Diamond</option>
              <option value="star">Star</option>
              <option value="heart">Heart</option>
              <option value="arrow">Arrow</option>
              <option value="tree">Tree</option>
            </select>
            
            <div class="mt-4 space-y-4">
              <div>
                <label for="shape-width" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Width: <span id="shape-width-display">20</span></label>
                <input type="range" id="shape-width" min="5" max="50" value="20" class="w-full" />
              </div>
              
              <div>
                <label for="shape-height" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Height: <span id="shape-height-display">10</span></label>
                <input type="range" id="shape-height" min="5" max="30" value="10" class="w-full" />
              </div>
              
              <div>
                <label for="shape-char" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fill Character</label>
                <input type="text" id="shape-char" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" value="*" maxlength="1" />
              </div>
            </div>
          </div>
          
          <div id="input-banner" class="input-panel hidden">
            <label for="banner-text" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Banner Text</label>
            <input 
              type="text" 
              id="banner-text" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" 
              placeholder="Enter banner text..."
              value="WELCOME"
            />
            
            <label for="banner-style" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">Banner Style</label>
            <select id="banner-style" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="simple">Simple</option>
              <option value="double">Double Line</option>
              <option value="ascii">ASCII Border</option>
              <option value="stars">Stars</option>
              <option value="dashed">Dashed</option>
            </select>
            
            <div class="mt-4">
              <label for="banner-width" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Width: <span id="banner-width-display">60</span></label>
              <input type="range" id="banner-width" min="30" max="100" value="60" class="w-full" />
            </div>
          </div>
          
          <div id="input-table" class="input-panel hidden">
            <label for="table-data" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Table Data (CSV format)</label>
            <textarea 
              id="table-data" 
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" 
              placeholder="Header1,Header2,Header3&#10;Data1,Data2,Data3"
              rows="5"
            >Name,Age,City
John Doe,30,New York
Jane Smith,25,Los Angeles
Bob Johnson,35,Chicago</textarea>
            
            <label for="table-style" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">Table Style</label>
            <select id="table-style" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="simple">Simple</option>
              <option value="grid">Grid</option>
              <option value="pipe">Pipe</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>
        </div>
        
        <div class="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">ASCII Art Output</h3>
            <div class="flex gap-2">
              <button class="p-2 text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md" data-action="copy" title="Copy ASCII Art">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
              <button class="p-2 text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md" data-action="download" title="Download as Text">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
            </div>
          </div>
          <pre id="ascii-output" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-4 font-mono text-sm overflow-auto max-h-96"></pre>
          <div class="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span id="output-lines">0 lines</span>
            <span id="output-chars">0 characters</span>
          </div>
        </div>
        
        <div class="flex gap-3 mb-6">
          <button class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="generate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Generate ASCII Art
          </button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="clear">Clear</button>
        </div>
        
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Quick Examples</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-example="smiley">Smiley Face</button>
            <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-example="cat">Cat</button>
            <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-example="coffee">Coffee Cup</button>
            <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-example="computer">Computer</button>
            <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-example="music">Music Note</button>
            <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-example="rocket">Rocket</button>
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
      const display = this.container.querySelector(`#${range.id.replace(/^.*?-/, '')}-display`);
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
      const isActive = btn.dataset.type === type;
      if (isActive) {
        btn.className = 'px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-btn active';
      } else {
        btn.className = 'px-4 py-2 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-btn';
      }
    });
    
    // Update panels
    this.container.querySelectorAll('.input-panel').forEach(panel => {
      const isActive = panel.id === `input-${type}`;
      if (isActive) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
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