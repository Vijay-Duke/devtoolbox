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
      <div class="tool-container">
        <div class="tool-header">
          <h1>Unix Time Converter</h1>
          <p class="tool-description">Convert between Unix timestamps and human-readable dates</p>
        </div>
        
        <div class="live-time">
          <div class="live-time-item">
            <span class="live-label">Current Unix Time:</span>
            <span class="live-value" id="live-unix">${unixNow}</span>
          </div>
          <div class="live-time-item">
            <span class="live-label">Current Time:</span>
            <span class="live-value" id="live-date">${now.toLocaleString()}</span>
          </div>
        </div>
        
        <div class="converter-grid">
          <div class="converter-section">
            <h3>Unix Timestamp → Date</h3>
            <div class="converter-input">
              <label for="unix-input">Unix Timestamp</label>
              <input 
                type="text" 
                id="unix-input" 
                placeholder="1516239022"
                value="${unixNow}"
              />
              <div class="input-options">
                <label class="radio-label">
                  <input type="radio" name="unix-unit" value="seconds" checked />
                  <span>Seconds</span>
                </label>
                <label class="radio-label">
                  <input type="radio" name="unix-unit" value="milliseconds" />
                  <span>Milliseconds</span>
                </label>
              </div>
            </div>
            
            <button class="btn btn-primary" data-action="unix-to-date">Convert to Date</button>
            
            <div class="converter-output" id="unix-output">
              <div class="output-row">
                <span class="output-label">Local:</span>
                <span class="output-value" id="unix-local"></span>
              </div>
              <div class="output-row">
                <span class="output-label">UTC:</span>
                <span class="output-value" id="unix-utc"></span>
              </div>
              <div class="output-row">
                <span class="output-label">ISO 8601:</span>
                <span class="output-value" id="unix-iso"></span>
              </div>
              <div class="output-row">
                <span class="output-label">Relative:</span>
                <span class="output-value" id="unix-relative"></span>
              </div>
            </div>
          </div>
          
          <div class="converter-section">
            <h3>Date → Unix Timestamp</h3>
            <div class="converter-input">
              <label for="date-input">Date & Time</label>
              <input 
                type="datetime-local" 
                id="date-input"
                value="${this.formatDateTimeLocal(now)}"
              />
              <div class="input-options">
                <button class="btn btn-secondary btn-sm" data-action="date-now">Now</button>
                <button class="btn btn-secondary btn-sm" data-action="date-today">Today</button>
                <button class="btn btn-secondary btn-sm" data-action="date-yesterday">Yesterday</button>
              </div>
            </div>
            
            <button class="btn btn-primary" data-action="date-to-unix">Convert to Unix</button>
            
            <div class="converter-output" id="date-output">
              <div class="output-row">
                <span class="output-label">Seconds:</span>
                <span class="output-value" id="date-seconds"></span>
              </div>
              <div class="output-row">
                <span class="output-label">Milliseconds:</span>
                <span class="output-value" id="date-milliseconds"></span>
              </div>
              <div class="output-row">
                <span class="output-label">Hex:</span>
                <span class="output-value" id="date-hex"></span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="common-timestamps">
          <h3>Common Timestamps</h3>
          <div class="timestamp-grid">
            <div class="timestamp-item" data-unix="0">
              <span class="timestamp-label">Unix Epoch</span>
              <span class="timestamp-value">0</span>
              <span class="timestamp-date">Jan 1, 1970</span>
            </div>
            <div class="timestamp-item" data-unix="1000000000">
              <span class="timestamp-label">1 Billion Seconds</span>
              <span class="timestamp-value">1000000000</span>
              <span class="timestamp-date">Sep 9, 2001</span>
            </div>
            <div class="timestamp-item" data-unix="2147483647">
              <span class="timestamp-label">32-bit Max</span>
              <span class="timestamp-value">2147483647</span>
              <span class="timestamp-date">Jan 19, 2038</span>
            </div>
            <div class="timestamp-item" data-unix="1234567890">
              <span class="timestamp-label">1234567890</span>
              <span class="timestamp-value">1234567890</span>
              <span class="timestamp-date">Feb 13, 2009</span>
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
      this.convertUnixToDate();
    });
    
    // Auto-convert when radio buttons change
    this.container.querySelectorAll('input[name="unix-unit"]').forEach(radio => {
      radio.addEventListener('change', () => {
        this.convertUnixToDate();
      });
    });
    
    // Unix to Date conversion button (kept for explicit conversion)
    this.container.querySelector('[data-action="unix-to-date"]').addEventListener('click', () => {
      this.convertUnixToDate();
    });
    
    // Auto-convert Date to Unix on input
    this.dateInput.addEventListener('input', () => {
      this.convertDateToUnix();
    });
    
    // Date to Unix conversion button (kept for explicit conversion)
    this.container.querySelector('[data-action="date-to-unix"]').addEventListener('click', () => {
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
    
    // Common timestamps
    this.container.querySelectorAll('.timestamp-item').forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        const unix = item.dataset.unix;
        this.unixInput.value = unix;
        this.convertUnixToDate();
      });
    });
    
    // Auto-convert on load
    this.convertUnixToDate();
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
  
  convertUnixToDate() {
    const input = this.unixInput.value.trim();
    if (!input) return;
    
    const isMilliseconds = this.container.querySelector('input[name="unix-unit"]:checked').value === 'milliseconds';
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
  
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}