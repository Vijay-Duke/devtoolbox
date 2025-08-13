export class QRGenerator {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.qrData = null;
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
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">QR Code Generator</h1>
          <p class="text-gray-600 dark:text-gray-300">Create QR codes for text, URLs, WiFi, contacts, and more with customizable styling</p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div class="flex flex-wrap gap-2 mb-6">
              <button class="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-tab active" data-type="text">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                <span class="text-sm">Text</span>
              </button>
              <button class="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-tab" data-type="url">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                <span class="text-sm">URL</span>
              </button>
              <button class="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-tab" data-type="email">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span class="text-sm">Email</span>
              </button>
              <button class="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-tab" data-type="phone">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span class="text-sm">Phone</span>
              </button>
              <button class="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-tab" data-type="sms">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span class="text-sm">SMS</span>
              </button>
              <button class="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-tab" data-type="wifi">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9z"/>
                  <path d="M5 13l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.24 9.24 8.76 9.24 5 13z"/>
                  <path d="M9 17l2 2c.87-.87 2.13-.87 3 0l2-2C14.24 15.24 9.76 15.24 9 17z"/>
                </svg>
                <span class="text-sm">WiFi</span>
              </button>
              <button class="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-tab" data-type="vcard">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span class="text-sm">Contact</span>
              </button>
              <button class="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-tab" data-type="location">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span class="text-sm">Location</span>
              </button>
            </div>
        
            <div class="mb-6">
              <div id="input-text" class="input-panel">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" for="text-input">Text or Data</label>
                  <textarea 
                    id="text-input" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" 
                    placeholder="Enter any text or data..."
                    rows="4"
                  >Hello, World!</textarea>
                </div>
              </div>
          
                  <div id="input-url" class="input-panel hidden">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" for="url-input">Website URL</label>
                  <input 
                    type="url" 
                    id="url-input" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" 
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              
              <div id="input-email" class="input-panel hidden">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" for="email-to">Email Address</label>
                    <input type="email" id="email-to" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="user@example.com" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" for="email-subject">Subject (optional)</label>
                    <input type="text" id="email-subject" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Email subject" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" for="email-body">Message (optional)</label>
                    <textarea id="email-body" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Email message..." rows="3"></textarea>
                  </div>
                </div>
              </div>
          
              <div id="input-phone" class="input-panel hidden">
                <label for="phone-number" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                <input type="tel" id="phone-number" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="+1234567890" />
              </div>
          
              <div id="input-sms" class="input-panel hidden">
                <div class="space-y-4">
                  <div>
                    <label for="sms-number" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                    <input type="tel" id="sms-number" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="+1234567890" />
                  </div>
                  <div>
                    <label for="sms-message" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                    <textarea id="sms-message" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="SMS message..." rows="3"></textarea>
                  </div>
                </div>
              </div>
          
              <div id="input-wifi" class="input-panel hidden">
                <div class="space-y-4">
                  <div>
                    <label for="wifi-ssid" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Network Name (SSID)</label>
                    <input type="text" id="wifi-ssid" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="MyWiFiNetwork" />
                  </div>
                  <div>
                    <label for="wifi-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                    <input type="password" id="wifi-password" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Password" />
                  </div>
                  <div>
                    <label for="wifi-security" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Security Type</label>
                    <select id="wifi-security" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">No Password</option>
                    </select>
                  </div>
                  <label class="flex items-center">
                    <input type="checkbox" id="wifi-hidden" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Hidden Network</span>
                  </label>
                </div>
              </div>
          
              <div id="input-vcard" class="input-panel hidden">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="vcard-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                    <input type="text" id="vcard-name" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="John Doe" />
                  </div>
                  <div>
                    <label for="vcard-org" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Organization</label>
                    <input type="text" id="vcard-org" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="Company Inc." />
                  </div>
                  <div>
                    <label for="vcard-phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                    <input type="tel" id="vcard-phone" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="+1234567890" />
                  </div>
                  <div>
                    <label for="vcard-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                    <input type="email" id="vcard-email" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label for="vcard-url" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website</label>
                    <input type="url" id="vcard-url" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="https://example.com" />
                  </div>
                  <div>
                    <label for="vcard-address" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                    <input type="text" id="vcard-address" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="123 Main St, City, Country" />
                  </div>
                </div>
              </div>
          
              <div id="input-location" class="input-panel hidden">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label for="location-lat" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Latitude</label>
                    <input type="number" id="location-lat" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="37.7749" step="0.0001" />
                  </div>
                  <div>
                    <label for="location-lng" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Longitude</label>
                    <input type="number" id="location-lng" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder="-122.4194" step="0.0001" />
                  </div>
                </div>
              </div>
            </div>
        
            <div class="space-y-4">
              <div>
                <label for="qr-size" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Size: <span id="size-display">256</span>px</label>
                <input type="range" id="qr-size" min="128" max="512" value="256" step="32" class="w-full" />
              </div>
          
              <div>
                <label for="error-correction" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Error Correction</label>
                <select id="error-correction" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  <option value="L">Low (7%)</option>
                  <option value="M" selected>Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>
          
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="fg-color" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Foreground</label>
                  <input type="color" id="fg-color" value="#000000" class="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md" />
                </div>
                <div>
                  <label for="bg-color" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Background</label>
                  <input type="color" id="bg-color" value="#FFFFFF" class="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        
          <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
            <canvas id="qr-canvas" width="256" height="256" class="mx-auto border border-gray-200 dark:border-gray-600 rounded"></canvas>
            <div class="flex justify-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
              <span id="qr-data-size">0 bytes</span>
              <span id="qr-modules">0 modules</span>
            </div>
          </div>
          
          <div class="flex flex-wrap gap-2 mb-6">
            <button class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="generate">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
              </svg>
              Generate QR Code
            </button>
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="download-png">Download PNG</button>
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="download-svg">Download SVG</button>
            <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-action="copy">Copy Image</button>
          </div>
          
          <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-3">Quick Templates</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-template="website">My Website</button>
              <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-template="email">Contact Email</button>
              <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-template="wifi-guest">Guest WiFi</button>
              <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-template="business-card">Business Card</button>
              <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-template="app-store">App Store Link</button>
              <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-template="social">Social Media</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.canvas = this.container.querySelector('#qr-canvas');
    this.ctx = this.canvas.getContext('2d');
  }
  
  attachEventListeners() {
    // Type selector
    this.container.querySelectorAll('.type-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectType(btn.dataset.type);
      });
    });
    
    // Generate button
    this.container.querySelector('[data-action="generate"]').addEventListener('click', () => this.generateQR());
    
    // Download buttons
    this.container.querySelector('[data-action="download-png"]').addEventListener('click', () => this.downloadPNG());
    this.container.querySelector('[data-action="download-svg"]').addEventListener('click', () => this.downloadSVG());
    this.container.querySelector('[data-action="copy"]').addEventListener('click', () => this.copyImage());
    
    // Options
    const sizeSlider = this.container.querySelector('#qr-size');
    const sizeDisplay = this.container.querySelector('#size-display');
    sizeSlider.addEventListener('input', (e) => {
      sizeDisplay.textContent = e.target.value;
      this.resizeCanvas(parseInt(e.target.value));
      this.generateQR();
    });
    
    this.container.querySelector('#error-correction').addEventListener('change', () => this.generateQR());
    this.container.querySelector('#fg-color').addEventListener('change', () => this.generateQR());
    this.container.querySelector('#bg-color').addEventListener('change', () => this.generateQR());
    
    // Auto-generate on input
    this.container.querySelectorAll('.input-field, .select-input').forEach(input => {
      input.addEventListener('input', () => {
        clearTimeout(this.generateTimeout);
        this.generateTimeout = setTimeout(() => this.generateQR(), 500);
      });
    });
    
    // Templates
    this.container.querySelectorAll('[data-template]').forEach(btn => {
      btn.addEventListener('click', () => this.loadTemplate(btn.dataset.template));
    });
  }
  
  selectType(type) {
    // Update buttons
    this.container.querySelectorAll('.type-tab').forEach(btn => {
      const isActive = btn.dataset.type === type;
      if (isActive) {
        btn.className = 'flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-tab active';
      } else {
        btn.className = 'flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 type-tab';
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
    
    // Generate new QR
    this.generateQR();
  }
  
  generateQR() {
    const type = this.container.querySelector('.type-tab.active').dataset.type;
    const data = this.getDataForType(type);
    
    if (!data) {
      this.clearCanvas();
      return;
    }
    
    const size = parseInt(this.container.querySelector('#qr-size').value);
    const errorCorrection = this.container.querySelector('#error-correction').value;
    const fgColor = this.container.querySelector('#fg-color').value;
    const bgColor = this.container.querySelector('#bg-color').value;
    
    // Generate QR code data
    this.qrData = this.generateQRData(data, errorCorrection);
    
    // Draw QR code
    this.drawQR(this.qrData, size, fgColor, bgColor);
    
    // Update info
    this.updateInfo(data, this.qrData);
  }
  
  getDataForType(type) {
    switch (type) {
      case 'text':
        return this.container.querySelector('#text-input').value;
        
      case 'url':
        const url = this.container.querySelector('#url-input').value;
        return url ? (url.startsWith('http') ? url : 'https://' + url) : '';
        
      case 'email':
        const email = this.container.querySelector('#email-to').value;
        const subject = this.container.querySelector('#email-subject').value;
        const body = this.container.querySelector('#email-body').value;
        if (!email) return '';
        let mailto = `mailto:${email}`;
        const params = [];
        if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
        if (body) params.push(`body=${encodeURIComponent(body)}`);
        if (params.length) mailto += '?' + params.join('&');
        return mailto;
        
      case 'phone':
        const phone = this.container.querySelector('#phone-number').value;
        return phone ? `tel:${phone}` : '';
        
      case 'sms':
        const smsNumber = this.container.querySelector('#sms-number').value;
        const smsMessage = this.container.querySelector('#sms-message').value;
        if (!smsNumber) return '';
        return `sms:${smsNumber}${smsMessage ? '?body=' + encodeURIComponent(smsMessage) : ''}`;
        
      case 'wifi':
        const ssid = this.container.querySelector('#wifi-ssid').value;
        const password = this.container.querySelector('#wifi-password').value;
        const security = this.container.querySelector('#wifi-security').value;
        const hidden = this.container.querySelector('#wifi-hidden').checked;
        if (!ssid) return '';
        return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden ? 'true' : 'false'};;`;
        
      case 'vcard':
        const name = this.container.querySelector('#vcard-name').value;
        const org = this.container.querySelector('#vcard-org').value;
        const phone2 = this.container.querySelector('#vcard-phone').value;
        const email2 = this.container.querySelector('#vcard-email').value;
        const url2 = this.container.querySelector('#vcard-url').value;
        const address = this.container.querySelector('#vcard-address').value;
        
        let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
        if (name) vcard += `FN:${name}\n`;
        if (org) vcard += `ORG:${org}\n`;
        if (phone2) vcard += `TEL:${phone2}\n`;
        if (email2) vcard += `EMAIL:${email2}\n`;
        if (url2) vcard += `URL:${url2}\n`;
        if (address) vcard += `ADR:;;${address}\n`;
        vcard += 'END:VCARD';
        return vcard;
        
      case 'location':
        const lat = this.container.querySelector('#location-lat').value;
        const lng = this.container.querySelector('#location-lng').value;
        if (!lat || !lng) return '';
        return `geo:${lat},${lng}`;
        
      default:
        return '';
    }
  }
  
  generateQRData(text, errorCorrection) {
    // Simplified QR code generation (in production, use a proper library)
    // This is a basic implementation for demonstration
    const qr = {
      text: text,
      size: 25, // 25x25 modules for version 2
      modules: [],
      errorCorrection: errorCorrection
    };
    
    // Create a simple pattern based on text
    // In reality, this would involve Reed-Solomon error correction,
    // data encoding, mask patterns, etc.
    const hash = this.simpleHash(text);
    
    for (let row = 0; row < qr.size; row++) {
      qr.modules[row] = [];
      for (let col = 0; col < qr.size; col++) {
        // Finder patterns (top-left, top-right, bottom-left)
        if ((row < 7 && col < 7) || // Top-left
            (row < 7 && col >= qr.size - 7) || // Top-right
            (row >= qr.size - 7 && col < 7)) { // Bottom-left
          qr.modules[row][col] = this.isFinderPattern(row, col, qr.size);
        }
        // Timing patterns
        else if (row === 6 || col === 6) {
          qr.modules[row][col] = (row + col) % 2 === 0;
        }
        // Data area (simplified)
        else {
          const index = row * qr.size + col;
          const charCode = text.charCodeAt(index % text.length) || 0;
          qr.modules[row][col] = ((hash + charCode + index) % 2) === 0;
        }
      }
    }
    
    return qr;
  }
  
  isFinderPattern(row, col, size) {
    // Adjust coordinates for finder pattern position
    let r = row;
    let c = col;
    
    if (row < 7 && col >= size - 7) {
      c = col - (size - 7);
    } else if (row >= size - 7 && col < 7) {
      r = row - (size - 7);
    }
    
    // Finder pattern: 7x7 with specific pattern
    if (r === 0 || r === 6 || c === 0 || c === 6) return true;
    if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
    return false;
  }
  
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  drawQR(qrData, size, fgColor, bgColor) {
    const moduleSize = Math.floor(size / qrData.size);
    const actualSize = moduleSize * qrData.size;
    
    this.canvas.width = actualSize;
    this.canvas.height = actualSize;
    
    // Background
    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(0, 0, actualSize, actualSize);
    
    // Modules
    this.ctx.fillStyle = fgColor;
    for (let row = 0; row < qrData.size; row++) {
      for (let col = 0; col < qrData.size; col++) {
        if (qrData.modules[row][col]) {
          this.ctx.fillRect(
            col * moduleSize,
            row * moduleSize,
            moduleSize,
            moduleSize
          );
        }
      }
    }
  }
  
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  resizeCanvas(size) {
    this.canvas.width = size;
    this.canvas.height = size;
  }
  
  updateInfo(data, qrData) {
    const bytes = new Blob([data]).size;
    const modules = qrData.size * qrData.size;
    
    this.container.querySelector('#qr-data-size').textContent = `${bytes} bytes`;
    this.container.querySelector('#qr-modules').textContent = `${modules} modules`;
  }
  
  downloadPNG() {
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = this.canvas.toDataURL();
    link.click();
  }
  
  downloadSVG() {
    if (!this.qrData) return;
    
    const size = parseInt(this.container.querySelector('#qr-size').value);
    const fgColor = this.container.querySelector('#fg-color').value;
    const bgColor = this.container.querySelector('#bg-color').value;
    const moduleSize = Math.floor(size / this.qrData.size);
    
    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${bgColor}"/>`;
    
    for (let row = 0; row < this.qrData.size; row++) {
      for (let col = 0; col < this.qrData.size; col++) {
        if (this.qrData.modules[row][col]) {
          svg += `
  <rect x="${col * moduleSize}" y="${row * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${fgColor}"/>`;
        }
      }
    }
    
    svg += '\n</svg>';
    
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'qrcode.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }
  
  async copyImage() {
    try {
      const blob = await new Promise(resolve => this.canvas.toBlob(resolve));
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      
      const btn = this.container.querySelector('[data-action="copy"]');
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = originalText, 2000);
    } catch (error) {
      console.error('Failed to copy image:', error);
    }
  }
  
  loadTemplate(template) {
    switch (template) {
      case 'website':
        this.selectType('url');
        this.container.querySelector('#url-input').value = 'https://example.com';
        break;
      case 'email':
        this.selectType('email');
        this.container.querySelector('#email-to').value = 'contact@example.com';
        this.container.querySelector('#email-subject').value = 'Hello';
        break;
      case 'wifi-guest':
        this.selectType('wifi');
        this.container.querySelector('#wifi-ssid').value = 'GuestNetwork';
        this.container.querySelector('#wifi-password').value = 'guest123';
        this.container.querySelector('#wifi-security').value = 'WPA';
        break;
      case 'business-card':
        this.selectType('vcard');
        this.container.querySelector('#vcard-name').value = 'John Doe';
        this.container.querySelector('#vcard-org').value = 'Example Corp';
        this.container.querySelector('#vcard-phone').value = '+1234567890';
        this.container.querySelector('#vcard-email').value = 'john@example.com';
        break;
      case 'app-store':
        this.selectType('url');
        this.container.querySelector('#url-input').value = 'https://apps.apple.com/app/id123456789';
        break;
      case 'social':
        this.selectType('url');
        this.container.querySelector('#url-input').value = 'https://twitter.com/username';
        break;
    }
    this.generateQR();
  }
}