export class UnixTimeConverter {
  constructor() {
    this.container = null;
    this.unixInput = null;
    this.dateInput = null;
    this.updateInterval = null;
  }
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.render();
    this.attachEventListeners();
    this.startLiveClock();
  }
  
  render() {
    const now = new Date();
    const unixNow = Math.floor(now.getTime() / 1000);
    
    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Unix Time Converter</h1>
          <p class="text-gray-600 dark:text-gray-400">Convert between Unix timestamps and human-readable dates</p>
        </div>
        
        <div class="grid md:grid-cols-2 gap-6 mb-8">
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div class="text-sm font-medium text-blue-600 dark:text-blue-300 mb-1">Current Unix Time</div>
            <div class="text-2xl font-mono font-bold text-blue-900 dark:text-blue-100" id="live-unix">${unixNow}</div>
          </div>
          <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div class="text-sm font-medium text-green-600 dark:text-green-300 mb-1">Current Time</div>
            <div class="text-lg font-medium text-green-900 dark:text-green-100" id="live-date">${now.toLocaleString()}</div>
          </div>
        </div>
        
        <div class="grid lg:grid-cols-2 gap-8 mb-8">
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Unix Timestamp → Date</h3>
            
            <div class="space-y-4 mb-6">
              <div>
                <label for="unix-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unix Timestamp</label>
                <input 
                  type="text" 
                  id="unix-input" 
                  placeholder="1516239022 or 1516239022000"
                  value="${unixNow}"
                  class="w-full px-3 py-2 font-mono text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span id="detected-unit">Auto-detected: Seconds</span>
                </div>
              </div>
            </div>
            
            <div class="space-y-3" id="unix-output">
              <div class="flex justify-between items-center py-2 px-4 bg-gray-50 dark:bg-gray-900 rounded">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Local:</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-mono text-gray-900 dark:text-white" id="unix-local"></span>
                  <button class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" data-copy="unix-local" title="Copy">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-center py-2 px-4 bg-gray-50 dark:bg-gray-900 rounded">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">UTC:</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-mono text-gray-900 dark:text-white" id="unix-utc"></span>
                  <button class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" data-copy="unix-utc" title="Copy">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-center py-2 px-4 bg-gray-50 dark:bg-gray-900 rounded">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">ISO 8601:</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-mono text-gray-900 dark:text-white" id="unix-iso"></span>
                  <button class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" data-copy="unix-iso" title="Copy">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-center py-2 px-4 bg-gray-50 dark:bg-gray-900 rounded">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Relative:</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-900 dark:text-white" id="unix-relative"></span>
                  <button class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" data-copy="unix-relative" title="Copy">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Date → Unix Timestamp</h3>
            
            <div class="space-y-4 mb-6">
              <div>
                <label for="date-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date & Time</label>
                <input 
                  type="datetime-local" 
                  id="date-input"
                  value="${this.formatDateTimeLocal(now)}"
                  class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div class="flex gap-2">
                <button class="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded hover:bg-gray-200 dark:hover:bg-gray-600" data-action="date-now">Now</button>
                <button class="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded hover:bg-gray-200 dark:hover:bg-gray-600" data-action="date-today">Today</button>
                <button class="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded hover:bg-gray-200 dark:hover:bg-gray-600" data-action="date-yesterday">Yesterday</button>
              </div>
            </div>
            
            <div class="space-y-3" id="date-output">
              <div class="flex justify-between items-center py-2 px-4 bg-gray-50 dark:bg-gray-900 rounded">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Seconds:</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-mono text-gray-900 dark:text-white" id="date-seconds"></span>
                  <button class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" data-copy="date-seconds" title="Copy">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-center py-2 px-4 bg-gray-50 dark:bg-gray-900 rounded">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Milliseconds:</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-mono text-gray-900 dark:text-white" id="date-milliseconds"></span>
                  <button class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" data-copy="date-milliseconds" title="Copy">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-center py-2 px-4 bg-gray-50 dark:bg-gray-900 rounded">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Hex:</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-mono text-gray-900 dark:text-white" id="date-hex"></span>
                  <button class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" data-copy="date-hex" title="Copy">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Common Timestamps</h3>
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white dark:bg-gray-900 p-4 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors" data-unix="0">
              <div class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Unix Epoch</div>
              <div class="text-lg font-mono font-bold text-gray-900 dark:text-white mb-1">0</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Jan 1, 1970</div>
            </div>
            <div class="bg-white dark:bg-gray-900 p-4 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors" data-unix="1000000000">
              <div class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">1 Billion Seconds</div>
              <div class="text-lg font-mono font-bold text-gray-900 dark:text-white mb-1">1000000000</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Sep 9, 2001</div>
            </div>
            <div class="bg-white dark:bg-gray-900 p-4 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors" data-unix="2147483647">
              <div class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">32-bit Max</div>
              <div class="text-lg font-mono font-bold text-gray-900 dark:text-white mb-1">2147483647</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Jan 19, 2038</div>
            </div>
            <div class="bg-white dark:bg-gray-900 p-4 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors" data-unix="1234567890">
              <div class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">1234567890</div>
              <div class="text-lg font-mono font-bold text-gray-900 dark:text-white mb-1">1234567890</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Feb 13, 2009</div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.unixInput = this.container.querySelector('#unix-input');
    this.dateInput = this.container.querySelector('#date-input');
  }
  
  attachEventListeners() {
    // Auto-convert Unix to Date on input
    this.unixInput.addEventListener('input', () => {
      this.detectUnitAndConvert();
    });
    
    // Auto-convert Date to Unix on input
    this.dateInput.addEventListener('input', () => {
      this.convertDateToUnix();
    });
    
    // Date shortcuts
    this.container.querySelector('[data-action="date-now"]').addEventListener('click', () => {
      const now = new Date();
      this.dateInput.value = this.formatDateTimeLocal(now);
      this.convertDateToUnix();
    });
    
    this.container.querySelector('[data-action="date-today"]').addEventListener('click', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      this.dateInput.value = this.formatDateTimeLocal(today);
      this.convertDateToUnix();
    });
    
    this.container.querySelector('[data-action="date-yesterday"]').addEventListener('click', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      this.dateInput.value = this.formatDateTimeLocal(yesterday);
      this.convertDateToUnix();
    });
    
    // Common timestamps - use the data-unix attribute directly
    this.container.querySelectorAll('[data-unix]').forEach(item => {
      item.addEventListener('click', () => {
        const unix = item.dataset.unix;
        this.unixInput.value = unix;
        this.detectUnitAndConvert();
      });
    });
    
    // Copy buttons
    this.container.querySelectorAll('[data-copy]').forEach(button => {
      button.addEventListener('click', () => {
        const targetId = button.dataset.copy;
        const targetElement = this.container.querySelector(`#${targetId}`);
        if (targetElement && targetElement.textContent) {
          this.copyToClipboard(targetElement.textContent, button);
        }
      });
    });
    
    // Auto-convert on load
    this.detectUnitAndConvert();
    this.convertDateToUnix();
  }
  
  startLiveClock() {
    this.updateInterval = setInterval(() => {
      const now = new Date();
      const unixNow = Math.floor(now.getTime() / 1000);
      
      const unixElement = this.container.querySelector('#live-unix');
      const dateElement = this.container.querySelector('#live-date');
      
      if (unixElement) unixElement.textContent = unixNow;
      if (dateElement) dateElement.textContent = now.toLocaleString();
    }, 1000);
  }
  
  detectUnitAndConvert() {
    const input = this.unixInput.value.trim();
    if (!input) return;
    
    const timestamp = parseInt(input);
    
    if (isNaN(timestamp)) {
      this.clearUnixOutput();
      return;
    }
    
    // Auto-detect: timestamps before year 3000 in seconds would be < 32503680000
    // timestamps in milliseconds for reasonable dates are > 1000000000000 (Sep 2001)
    // So we can use a threshold around 10000000000 (10 digits vs 13 digits)
    const isMilliseconds = timestamp > 10000000000;
    
    // Update the detection indicator
    const detectedUnit = this.container.querySelector('#detected-unit');
    if (detectedUnit) {
      detectedUnit.textContent = `Auto-detected: ${isMilliseconds ? 'Milliseconds' : 'Seconds'}`;
    }
    
    this.convertUnixToDate(isMilliseconds);
  }
  
  convertUnixToDate(isMilliseconds = false) {
    const input = this.unixInput.value.trim();
    if (!input) return;
    
    const timestamp = parseInt(input);
    
    if (isNaN(timestamp)) {
      this.clearUnixOutput();
      return;
    }
    
    const date = new Date(isMilliseconds ? timestamp : timestamp * 1000);
    
    if (isNaN(date.getTime())) {
      this.clearUnixOutput();
      return;
    }
    
    // Update outputs
    this.container.querySelector('#unix-local').textContent = date.toLocaleString();
    this.container.querySelector('#unix-utc').textContent = date.toUTCString();
    this.container.querySelector('#unix-iso').textContent = date.toISOString();
    this.container.querySelector('#unix-relative').textContent = this.getRelativeTime(date);
  }
  
  convertDateToUnix() {
    const dateValue = this.dateInput.value;
    if (!dateValue) return;
    
    const date = new Date(dateValue);
    
    if (isNaN(date.getTime())) {
      this.clearDateOutput();
      return;
    }
    
    const seconds = Math.floor(date.getTime() / 1000);
    const milliseconds = date.getTime();
    
    this.container.querySelector('#date-seconds').textContent = seconds;
    this.container.querySelector('#date-milliseconds').textContent = milliseconds;
    this.container.querySelector('#date-hex').textContent = '0x' + seconds.toString(16).toUpperCase();
  }
  
  formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  
  getRelativeTime(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const years = Math.floor(days / 365);
    
    if (seconds < 0) {
      return 'in the future';
    } else if (seconds < 60) {
      return `${seconds} seconds ago`;
    } else if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (days < 365) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ago`;
    }
  }
  
  clearUnixOutput() {
    this.container.querySelector('#unix-local').textContent = '';
    this.container.querySelector('#unix-utc').textContent = '';
    this.container.querySelector('#unix-iso').textContent = '';
    this.container.querySelector('#unix-relative').textContent = '';
  }
  
  clearDateOutput() {
    this.container.querySelector('#date-seconds').textContent = '';
    this.container.querySelector('#date-milliseconds').textContent = '';
    this.container.querySelector('#date-hex').textContent = '';
  }
  
  async copyToClipboard(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      
      // Change icon to checkmark
      const svg = button.querySelector('svg');
      const originalSvg = svg.outerHTML;
      
      svg.outerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      `;
      
      // Restore original icon after 2 seconds
      setTimeout(() => {
        const newSvg = button.querySelector('svg');
        if (newSvg) {
          newSvg.outerHTML = originalSvg;
        }
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }
  
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}