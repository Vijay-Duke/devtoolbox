// Image Converter - Convert between different image formats
export class ImageConverter {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.currentImage = null;
    this.originalImage = null;
  }
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.render();
    this.attachEventListeners();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Image Converter</h1>
          <p class="text-gray-600 dark:text-gray-300">Convert images between different formats, resize, and compress</p>
        </div>
        
        <div class="mb-6">
          <div class="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center hover:border-blue-400 cursor-pointer" id="upload-area">
            <input type="file" id="image-input" accept="image/*" hidden>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto text-gray-400 mb-4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Drop image here or click to browse</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Supports JPG, PNG, WebP, GIF, BMP</p>
          </div>
        </div>
        
        <div class="mb-6 bg-gray-50 dark:bg-gray-900 rounded-lg p-4" id="image-preview" hidden>
          <div>
            <canvas id="preview-canvas" class="max-w-full h-auto mx-auto rounded border border-gray-200 dark:border-gray-600"></canvas>
            <div id="image-info" class="mt-4 text-sm text-gray-600 dark:text-gray-400"></div>
          </div>
        </div>
        
        <div class="space-y-6" id="conversion-options" hidden>
          <div>
            <label for="output-format" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Output Format</label>
            <select id="output-format" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
              <option value="bmp">BMP</option>
            </select>
          </div>
          
          <div>
            <label for="quality" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quality: <span id="quality-display">90</span>%</label>
            <input type="range" id="quality" min="10" max="100" value="90" step="5" class="w-full">
            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Lower file size</span>
              <span>Higher quality</span>
            </div>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Resize Options</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="resize-width" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Width (px)</label>
                <input type="number" id="resize-width" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white" placeholder="Auto">
              </div>
              <div>
                <label for="resize-height" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Height (px)</label>
                <input type="number" id="resize-height" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white" placeholder="Auto">
              </div>
            </div>
            
            <div class="flex flex-wrap gap-4 mb-4">
              <label class="flex items-center">
                <input type="checkbox" id="maintain-aspect" checked class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Maintain aspect ratio</span>
              </label>
              <label class="flex items-center">
                <input type="checkbox" id="resize-percentage" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Use percentage</span>
              </label>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
              <button class="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-preset="thumbnail">Thumbnail (150x150)</button>
              <button class="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-preset="small">Small (640x480)</button>
              <button class="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-preset="medium">Medium (1024x768)</button>
              <button class="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-preset="large">Large (1920x1080)</button>
              <button class="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-preset="original">Original Size</button>
            </div>
          </div>
          
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Filters & Adjustments</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="brightness" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brightness</label>
                <input type="range" id="brightness" min="-100" max="100" value="0" class="w-full">
                <span class="filter-value text-sm text-gray-600 dark:text-gray-400">0</span>
              </div>
              <div>
                <label for="contrast" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contrast</label>
                <input type="range" id="contrast" min="-100" max="100" value="0" class="w-full">
                <span class="filter-value text-sm text-gray-600 dark:text-gray-400">0</span>
              </div>
              <div>
                <label for="saturation" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Saturation</label>
                <input type="range" id="saturation" min="-100" max="100" value="0" class="w-full">
                <span class="filter-value text-sm text-gray-600 dark:text-gray-400">0</span>
              </div>
              <div>
                <label for="blur" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Blur</label>
                <input type="range" id="blur" min="0" max="20" value="0" class="w-full">
                <span class="filter-value text-sm text-gray-600 dark:text-gray-400">0</span>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <button class="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="reset-filters">Reset Filters</button>
              <button class="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="grayscale">Grayscale</button>
              <button class="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="sepia">Sepia</button>
              <button class="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="invert">Invert</button>
            </div>
          </div>
          
          <div class="flex flex-wrap gap-3">
            <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="convert">Convert & Download</button>
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="reset">Reset</button>
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="compare">Compare</button>
          </div>
        </div>
        
        <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4" id="batch-mode" hidden>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Batch Conversion</h3>
          <div id="batch-list" class="mb-4"></div>
          <div class="flex gap-3">
            <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="convert-all">Convert All</button>
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="clear-batch">Clear</button>
          </div>
        </div>
        
        <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4" id="output-info" hidden>
          <h3 class="text-lg font-medium text-green-800 dark:text-green-200 mb-2">Conversion Result</h3>
          <div class="result-stats text-sm text-green-700 dark:text-green-300"></div>
        </div>
      </div>
    `;
    
    this.canvas = this.container.querySelector('#preview-canvas');
    this.ctx = this.canvas.getContext('2d');
  }
  
  attachEventListeners() {
    const uploadArea = this.container.querySelector('#upload-area');
    const imageInput = this.container.querySelector('#image-input');
    
    // Upload handlers
    uploadArea.addEventListener('click', () => imageInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (files.length > 0) {
        this.handleImageUpload(files[0]);
      }
    });
    
    imageInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleImageUpload(e.target.files[0]);
      }
    });
    
    // Format and quality
    this.container.querySelector('#output-format').addEventListener('change', () => this.updatePreview());
    
    const qualitySlider = this.container.querySelector('#quality');
    const qualityDisplay = this.container.querySelector('#quality-display');
    qualitySlider.addEventListener('input', (e) => {
      qualityDisplay.textContent = e.target.value;
      this.updatePreview();
    });
    
    // Resize options
    const widthInput = this.container.querySelector('#resize-width');
    const heightInput = this.container.querySelector('#resize-height');
    const maintainAspect = this.container.querySelector('#maintain-aspect');
    
    widthInput.addEventListener('input', () => {
      if (maintainAspect.checked && this.currentImage) {
        const aspectRatio = this.currentImage.height / this.currentImage.width;
        heightInput.value = Math.round(widthInput.value * aspectRatio);
      }
      this.updatePreview();
    });
    
    heightInput.addEventListener('input', () => {
      if (maintainAspect.checked && this.currentImage) {
        const aspectRatio = this.currentImage.width / this.currentImage.height;
        widthInput.value = Math.round(heightInput.value * aspectRatio);
      }
      this.updatePreview();
    });
    
    // Preset sizes
    this.container.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => this.applyPreset(btn.dataset.preset));
    });
    
    // Filters
    ['brightness', 'contrast', 'saturation', 'blur'].forEach(filter => {
      const slider = this.container.querySelector(`#${filter}`);
      const display = slider.parentElement.querySelector('.filter-value');
      slider.addEventListener('input', (e) => {
        display.textContent = e.target.value;
        this.applyFilters();
      });
    });
    
    // Filter actions
    this.container.querySelector('[data-action="reset-filters"]').addEventListener('click', () => this.resetFilters());
    this.container.querySelector('[data-action="grayscale"]').addEventListener('click', () => this.applyEffect('grayscale'));
    this.container.querySelector('[data-action="sepia"]').addEventListener('click', () => this.applyEffect('sepia'));
    this.container.querySelector('[data-action="invert"]').addEventListener('click', () => this.applyEffect('invert'));
    
    // Main actions
    this.container.querySelector('[data-action="convert"]').addEventListener('click', () => this.convertAndDownload());
    this.container.querySelector('[data-action="reset"]').addEventListener('click', () => this.reset());
    this.container.querySelector('[data-action="compare"]').addEventListener('click', () => this.toggleComparison());
  }
  
  handleImageUpload(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.currentImage = img;
        this.originalImage = img;
        this.displayImage(img);
        this.showConversionOptions();
        this.updateImageInfo(file, img);
      };
      img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
  }
  
  displayImage(img) {
    const maxWidth = 800;
    const maxHeight = 600;
    
    let width = img.width;
    let height = img.height;
    
    if (width > maxWidth || height > maxHeight) {
      const aspectRatio = width / height;
      if (width > height) {
        width = maxWidth;
        height = width / aspectRatio;
      } else {
        height = maxHeight;
        width = height * aspectRatio;
      }
    }
    
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.drawImage(img, 0, 0, width, height);
    
    this.container.querySelector('#image-preview').hidden = false;
  }
  
  updateImageInfo(file, img) {
    const info = this.container.querySelector('#image-info');
    const sizeKB = (file.size / 1024).toFixed(2);
    const sizeMB = (file.size / 1048576).toFixed(2);
    
    info.innerHTML = `
      <div class="info-row">
        <span>Original:</span>
        <span>${img.width} × ${img.height}px</span>
      </div>
      <div class="info-row">
        <span>Size:</span>
        <span>${sizeMB > 1 ? sizeMB + ' MB' : sizeKB + ' KB'}</span>
      </div>
      <div class="info-row">
        <span>Type:</span>
        <span>${file.type || 'Unknown'}</span>
      </div>
    `;
  }
  
  showConversionOptions() {
    this.container.querySelector('#conversion-options').hidden = false;
    
    // Set default resize values
    const widthInput = this.container.querySelector('#resize-width');
    const heightInput = this.container.querySelector('#resize-height');
    widthInput.value = this.currentImage.width;
    heightInput.value = this.currentImage.height;
  }
  
  applyPreset(preset) {
    const widthInput = this.container.querySelector('#resize-width');
    const heightInput = this.container.querySelector('#resize-height');
    
    const presets = {
      thumbnail: { width: 150, height: 150 },
      small: { width: 640, height: 480 },
      medium: { width: 1024, height: 768 },
      large: { width: 1920, height: 1080 },
      original: { width: this.originalImage.width, height: this.originalImage.height }
    };
    
    if (presets[preset]) {
      widthInput.value = presets[preset].width;
      heightInput.value = presets[preset].height;
      this.updatePreview();
    }
  }
  
  applyFilters() {
    if (!this.currentImage) return;
    
    const brightness = parseInt(this.container.querySelector('#brightness').value);
    const contrast = parseInt(this.container.querySelector('#contrast').value);
    const saturation = parseInt(this.container.querySelector('#saturation').value);
    const blur = parseInt(this.container.querySelector('#blur').value);
    
    // Clear and redraw
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Apply CSS filters
    let filters = [];
    if (brightness !== 0) filters.push(`brightness(${100 + brightness}%)`);
    if (contrast !== 0) filters.push(`contrast(${100 + contrast}%)`);
    if (saturation !== 0) filters.push(`saturate(${100 + saturation}%)`);
    if (blur > 0) filters.push(`blur(${blur}px)`);
    
    this.ctx.filter = filters.join(' ');
    this.ctx.drawImage(this.currentImage, 0, 0, this.canvas.width, this.canvas.height);
    this.ctx.filter = 'none';
  }
  
  applyEffect(effect) {
    if (!this.currentImage) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    switch(effect) {
      case 'grayscale':
        this.ctx.filter = 'grayscale(100%)';
        break;
      case 'sepia':
        this.ctx.filter = 'sepia(100%)';
        break;
      case 'invert':
        this.ctx.filter = 'invert(100%)';
        break;
    }
    
    this.ctx.drawImage(this.currentImage, 0, 0, this.canvas.width, this.canvas.height);
    this.ctx.filter = 'none';
  }
  
  resetFilters() {
    ['brightness', 'contrast', 'saturation', 'blur'].forEach(filter => {
      const slider = this.container.querySelector(`#${filter}`);
      slider.value = 0;
      slider.parentElement.querySelector('.filter-value').textContent = '0';
    });
    
    this.displayImage(this.currentImage);
  }
  
  updatePreview() {
    if (!this.currentImage) return;
    
    const width = parseInt(this.container.querySelector('#resize-width').value) || this.currentImage.width;
    const height = parseInt(this.container.querySelector('#resize-height').value) || this.currentImage.height;
    
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.drawImage(this.currentImage, 0, 0, width, height);
    
    this.applyFilters();
  }
  
  convertAndDownload() {
    if (!this.currentImage) return;
    
    const format = this.container.querySelector('#output-format').value;
    const quality = parseInt(this.container.querySelector('#quality').value) / 100;
    
    // Get MIME type
    let mimeType = 'image/jpeg';
    let extension = 'jpg';
    
    switch(format) {
      case 'png':
        mimeType = 'image/png';
        extension = 'png';
        break;
      case 'webp':
        mimeType = 'image/webp';
        extension = 'webp';
        break;
      case 'bmp':
        mimeType = 'image/bmp';
        extension = 'bmp';
        break;
    }
    
    // Convert canvas to blob
    this.canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted-image.${extension}`;
      a.click();
      URL.revokeObjectURL(url);
      
      // Show result info
      this.showResultInfo(blob.size);
    }, mimeType, quality);
  }
  
  showResultInfo(newSize) {
    const info = this.container.querySelector('#output-info');
    const stats = info.querySelector('.result-stats');
    
    const originalSize = this.estimateOriginalSize();
    const reduction = ((1 - newSize / originalSize) * 100).toFixed(1);
    
    stats.innerHTML = `
      <div class="stat-row">
        <span>New Size:</span>
        <span>${(newSize / 1024).toFixed(2)} KB</span>
      </div>
      <div class="stat-row">
        <span>Size Reduction:</span>
        <span>${reduction > 0 ? reduction + '%' : 'No reduction'}</span>
      </div>
    `;
    
    info.hidden = false;
  }
  
  estimateOriginalSize() {
    // Rough estimate based on dimensions
    return this.originalImage.width * this.originalImage.height * 4;
  }
  
  toggleComparison() {
    // Toggle between original and converted
    const isOriginal = this.currentImage === this.originalImage;
    
    if (isOriginal) {
      this.updatePreview();
    } else {
      this.displayImage(this.originalImage);
    }
  }
  
  reset() {
    this.currentImage = null;
    this.originalImage = null;
    this.container.querySelector('#image-preview').hidden = true;
    this.container.querySelector('#conversion-options').hidden = true;
    this.container.querySelector('#output-info').hidden = true;
    this.container.querySelector('#image-input').value = '';
    this.resetFilters();
  }
}