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
      <div class="tool-container">
        <div class="tool-header">
          <h1>Image Converter</h1>
          <p>Convert images between different formats, resize, and compress</p>
        </div>
        
        <div class="upload-section">
          <div class="upload-area" id="upload-area">
            <input type="file" id="image-input" accept="image/*" hidden>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p>Drop image here or click to browse</p>
            <p class="upload-hint">Supports JPG, PNG, WebP, GIF, BMP</p>
          </div>
        </div>
        
        <div class="image-preview" id="image-preview" hidden>
          <div class="preview-container">
            <canvas id="preview-canvas"></canvas>
            <div class="image-info" id="image-info"></div>
          </div>
        </div>
        
        <div class="conversion-options" id="conversion-options" hidden>
          <div class="option-group">
            <label for="output-format">Output Format</label>
            <select id="output-format" class="select-input">
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
              <option value="bmp">BMP</option>
            </select>
          </div>
          
          <div class="option-group">
            <label for="quality">Quality: <span id="quality-display">90</span>%</label>
            <input type="range" id="quality" min="10" max="100" value="90" step="5" class="range-input">
            <div class="quality-hints">
              <span>Lower file size</span>
              <span>Higher quality</span>
            </div>
          </div>
          
          <div class="resize-options">
            <h3>Resize Options</h3>
            <div class="resize-grid">
              <div class="option-group">
                <label for="resize-width">Width (px)</label>
                <input type="number" id="resize-width" class="input-field" placeholder="Auto">
              </div>
              <div class="option-group">
                <label for="resize-height">Height (px)</label>
                <input type="number" id="resize-height" class="input-field" placeholder="Auto">
              </div>
              <label class="checkbox-label">
                <input type="checkbox" id="maintain-aspect" checked>
                <span>Maintain aspect ratio</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="resize-percentage">
                <span>Use percentage</span>
              </label>
            </div>
            
            <div class="preset-sizes">
              <button class="preset-btn" data-preset="thumbnail">Thumbnail (150x150)</button>
              <button class="preset-btn" data-preset="small">Small (640x480)</button>
              <button class="preset-btn" data-preset="medium">Medium (1024x768)</button>
              <button class="preset-btn" data-preset="large">Large (1920x1080)</button>
              <button class="preset-btn" data-preset="original">Original Size</button>
            </div>
          </div>
          
          <div class="filters-section">
            <h3>Filters & Adjustments</h3>
            <div class="filter-controls">
              <div class="filter-group">
                <label for="brightness">Brightness</label>
                <input type="range" id="brightness" min="-100" max="100" value="0" class="range-input">
                <span class="filter-value">0</span>
              </div>
              <div class="filter-group">
                <label for="contrast">Contrast</label>
                <input type="range" id="contrast" min="-100" max="100" value="0" class="range-input">
                <span class="filter-value">0</span>
              </div>
              <div class="filter-group">
                <label for="saturation">Saturation</label>
                <input type="range" id="saturation" min="-100" max="100" value="0" class="range-input">
                <span class="filter-value">0</span>
              </div>
              <div class="filter-group">
                <label for="blur">Blur</label>
                <input type="range" id="blur" min="0" max="20" value="0" class="range-input">
                <span class="filter-value">0</span>
              </div>
            </div>
            <div class="filter-actions">
              <button class="btn btn-secondary" data-action="reset-filters">Reset Filters</button>
              <button class="btn btn-secondary" data-action="grayscale">Grayscale</button>
              <button class="btn btn-secondary" data-action="sepia">Sepia</button>
              <button class="btn btn-secondary" data-action="invert">Invert</button>
            </div>
          </div>
          
          <div class="action-buttons">
            <button class="btn btn-primary" data-action="convert">Convert & Download</button>
            <button class="btn btn-secondary" data-action="reset">Reset</button>
            <button class="btn btn-secondary" data-action="compare">Compare</button>
          </div>
        </div>
        
        <div class="batch-converter" id="batch-mode" hidden>
          <h3>Batch Conversion</h3>
          <div class="batch-list" id="batch-list"></div>
          <div class="batch-actions">
            <button class="btn btn-primary" data-action="convert-all">Convert All</button>
            <button class="btn btn-secondary" data-action="clear-batch">Clear</button>
          </div>
        </div>
        
        <div class="output-info" id="output-info" hidden>
          <h3>Conversion Result</h3>
          <div class="result-stats"></div>
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