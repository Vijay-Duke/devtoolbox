export class IPLookup {
  constructor() {
    this.container = null;
    this.lookupHistory = [];
    this.abortController = null;
  }
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.render();
    this.attachEventListeners();
    this.detectCurrentIP();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">IP Address Lookup</h1>
          <p class="text-gray-600 dark:text-gray-400">Get geolocation, ISP, and network information for any IP address</p>
        </div>
        
        <div class="mb-6 flex flex-wrap gap-2">
          <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="lookup">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            Lookup
          </button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="current">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            My IP
          </button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="clear">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear
          </button>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="space-y-4">
                <div>
                  <label for="ip-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IP Address</label>
                  <input 
                    type="text" 
                    id="ip-input" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" 
                    placeholder="8.8.8.8 or 2001:4860:4860::8888"
                    spellcheck="false"
                  />
                </div>
                
                <div id="current-ip-display" class="p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded hidden">
                  <div class="text-sm text-blue-700 dark:text-blue-300">Your Current IP</div>
                  <div class="text-lg font-mono font-semibold text-blue-900 dark:text-blue-100" id="current-ip"></div>
                </div>
              </div>
            </div>
            
            <div class="mt-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Examples</h3>
              <div class="grid grid-cols-2 gap-2">
                <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="8.8.8.8">Google DNS</button>
                <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="1.1.1.1">Cloudflare</button>
                <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="140.82.114.4">GitHub</button>
                <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="104.17.24.14">Cloudflare</button>
              </div>
            </div>
          </div>
          
          <div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">IP Information</h3>
              <div id="ip-results" class="space-y-3">
                <div class="text-gray-500 dark:text-gray-400 text-center py-8">
                  Enter an IP address and click Lookup to get information
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lookup History</h3>
          <div id="lookup-history" class="space-y-2">
            <div class="text-gray-500 dark:text-gray-400 text-sm">No lookups yet</div>
          </div>
        </div>
        
        <div class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded hidden" data-error></div>
        
        <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
          <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">API Information</h4>
          <p class="text-sm text-blue-700 dark:text-blue-300">
            This tool uses the free ip-api.com service for real-time geolocation data.
            <br/>• Rate limit: 45 requests per minute
            <br/>• Provides accurate location, ISP, and network information
            <br/>• Works with both IPv4 and IPv6 addresses
          </p>
        </div>
      </div>
    `;
  }
  
  attachEventListeners() {
    // Lookup button
    this.container.querySelector('[data-action="lookup"]').addEventListener('click', () => {
      this.performLookup();
    });
    
    // Current IP button
    this.container.querySelector('[data-action="current"]').addEventListener('click', () => {
      this.detectCurrentIP();
    });
    
    // Clear button
    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => {
      this.clear();
    });
    
    // Enter key on input
    this.container.querySelector('#ip-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.performLookup();
      }
    });
    
    // Example buttons
    this.container.querySelectorAll('[data-example]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelector('#ip-input').value = btn.dataset.example;
        this.performLookup();
      });
    });
    
    // History items (delegated)
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('.history-item')) {
        const ip = e.target.closest('.history-item').dataset.ip;
        this.container.querySelector('#ip-input').value = ip;
        this.performLookup();
      }
    });
  }
  
  async detectCurrentIP() {
    const currentIpDisplay = this.container.querySelector('#current-ip-display');
    const currentIpElement = this.container.querySelector('#current-ip');
    
    try {
      // Simulate getting current IP (in real app, would call an API)
      const currentIP = await this.getCurrentIP();
      currentIpElement.textContent = currentIP;
      currentIpDisplay.classList.remove('hidden');
      
      // Set in input and lookup
      this.container.querySelector('#ip-input').value = currentIP;
      this.performLookup();
    } catch (error) {
      this.showError('Failed to detect current IP');
    }
  }
  
  async getCurrentIP() {
    try {
      // Use ip-api.com to get current IP
      const response = await fetch('http://ip-api.com/json/');
      if (!response.ok) throw new Error('Failed to fetch IP');
      const data = await response.json();
      return data.query; // 'query' field contains the IP address
    } catch (error) {
      console.error('Failed to get current IP from ip-api.com:', error);
      // Fallback to ipify
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
      } catch (fallbackError) {
        console.error('Fallback IP detection failed:', fallbackError);
        throw new Error('Unable to detect current IP address');
      }
    }
  }
  
  async performLookup() {
    const ip = this.container.querySelector('#ip-input').value.trim();
    if (!ip) {
      this.showError('Please enter an IP address');
      return;
    }
    
    // Validate IP format
    if (!this.isValidIP(ip)) {
      this.showError('Invalid IP address format');
      return;
    }
    
    // Show loading state
    const resultsDiv = this.container.querySelector('#ip-results');
    resultsDiv.innerHTML = `
      <div class="text-gray-500 dark:text-gray-400 text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        <div class="mt-2">Looking up IP information...</div>
      </div>
    `;
    
    this.clearError();
    
    try {
      // Simulate API call for IP info
      const ipInfo = await this.getIPInfo(ip);
      this.displayResults(ipInfo);
      this.addToHistory(ip, ipInfo);
    } catch (error) {
      this.showError('Failed to lookup IP information');
      resultsDiv.innerHTML = `
        <div class="text-gray-500 dark:text-gray-400 text-center py-8">
          Failed to retrieve IP information
        </div>
      `;
    }
  }
  
  async getIPInfo(ip) {
    const isIPv6 = ip.includes(':');
    const isPrivate = this.isPrivateIP(ip);
    
    // For private IPs, return local network info
    if (isPrivate) {
      return {
        ip: ip,
        type: isIPv6 ? 'IPv6' : 'IPv4',
        continent: 'N/A',
        continent_code: 'N/A',
        country: 'Private Network',
        country_code: 'N/A',
        region: 'N/A',
        region_code: 'N/A',
        city: 'N/A',
        zip: 'N/A',
        latitude: null,
        longitude: null,
        timezone: 'N/A',
        isp: 'Private Network',
        org: 'Local Network',
        as: 'N/A',
        asname: 'N/A',
        reverse: 'N/A',
        mobile: false,
        proxy: false,
        hosting: false
      };
    }
    
    try {
      // Use ip-api.com for real IP information
      const fields = 'status,message,continent,continentCode,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting,query';
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=${fields}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'fail') {
        throw new Error(data.message || 'IP lookup failed');
      }
      
      // Map API response to our format
      return {
        ip: data.query || ip,
        type: isIPv6 ? 'IPv6' : 'IPv4',
        continent: data.continent || 'Unknown',
        continent_code: data.continentCode || 'N/A',
        country: data.country || 'Unknown',
        country_code: data.countryCode || 'N/A',
        region: data.regionName || data.region || 'Unknown',
        region_code: data.region || 'N/A',
        city: data.city || 'Unknown',
        zip: data.zip || 'N/A',
        latitude: data.lat || null,
        longitude: data.lon || null,
        timezone: data.timezone || 'N/A',
        isp: data.isp || 'Unknown',
        org: data.org || 'Unknown',
        as: data.as || 'N/A',
        asname: data.asname || 'N/A',
        reverse: data.reverse || 'N/A',
        mobile: data.mobile || false,
        proxy: data.proxy || false,
        hosting: data.hosting || false
      };
    } catch (error) {
      console.error('Failed to get IP info:', error);
      // Return basic info on error
      return {
        ip: ip,
        type: isIPv6 ? 'IPv6' : 'IPv4',
        continent: 'Error',
        continent_code: 'N/A',
        country: 'Lookup Failed',
        country_code: 'N/A',
        region: error.message,
        region_code: 'N/A',
        city: 'N/A',
        zip: 'N/A',
        latitude: null,
        longitude: null,
        timezone: 'N/A',
        isp: 'Unknown',
        org: 'Unknown',
        as: 'N/A',
        asname: 'N/A',
        reverse: 'N/A',
        mobile: false,
        proxy: false,
        hosting: false
      };
    }
  }
  
  displayResults(info) {
    const resultsDiv = this.container.querySelector('#ip-results');
    
    resultsDiv.innerHTML = `
      <div class="space-y-3">
        <!-- Basic Info -->
        <div class="border-b border-gray-200 dark:border-gray-600 pb-3">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Basic Information</h4>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="text-gray-500 dark:text-gray-400">IP Address:</span>
              <span class="ml-2 font-mono text-gray-900 dark:text-white">${info.ip}</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Type:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${info.type}</span>
            </div>
            ${info.reverse !== 'N/A' ? `
            <div class="col-span-2">
              <span class="text-gray-500 dark:text-gray-400">Hostname:</span>
              <span class="ml-2 font-mono text-gray-900 dark:text-white text-xs">${info.reverse}</span>
            </div>
            ` : ''}
          </div>
        </div>
        
        <!-- Location -->
        ${info.country !== 'Private Network' ? `
        <div class="border-b border-gray-200 dark:border-gray-600 pb-3">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Location</h4>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="text-gray-500 dark:text-gray-400">Country:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${info.country} (${info.country_code})</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Region:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${info.region}</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">City:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${info.city}</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">ZIP:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${info.zip}</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Timezone:</span>
              <span class="ml-2 text-gray-900 dark:text-white text-xs">${info.timezone}</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Coordinates:</span>
              <span class="ml-2 text-gray-900 dark:text-white text-xs">${info.latitude}, ${info.longitude}</span>
            </div>
          </div>
        </div>
        ` : ''}
        
        <!-- Network -->
        <div class="border-b border-gray-200 dark:border-gray-600 pb-3">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Network Information</h4>
          <div class="space-y-1 text-sm">
            <div>
              <span class="text-gray-500 dark:text-gray-400">ISP:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${info.isp}</span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Organization:</span>
              <span class="ml-2 text-gray-900 dark:text-white">${info.org}</span>
            </div>
            ${info.as !== 'N/A' ? `
            <div>
              <span class="text-gray-500 dark:text-gray-400">AS Number:</span>
              <span class="ml-2 font-mono text-gray-900 dark:text-white">${info.as} (${info.asname})</span>
            </div>
            ` : ''}
          </div>
        </div>
        
        <!-- Flags -->
        <div>
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Attributes</h4>
          <div class="flex flex-wrap gap-2">
            <span class="px-2 py-1 text-xs rounded-full ${info.mobile ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}">
              ${info.mobile ? '📱' : '💻'} ${info.mobile ? 'Mobile' : 'Fixed'}
            </span>
            <span class="px-2 py-1 text-xs rounded-full ${info.proxy ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}">
              ${info.proxy ? '🔄' : '✓'} ${info.proxy ? 'Proxy' : 'Direct'}
            </span>
            <span class="px-2 py-1 text-xs rounded-full ${info.hosting ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}">
              ${info.hosting ? '🖥️' : '🏠'} ${info.hosting ? 'Hosting' : 'Residential'}
            </span>
          </div>
        </div>
      </div>
    `;
  }
  
  addToHistory(ip, info) {
    // Add to history array
    this.lookupHistory.unshift({
      ip: ip,
      country: info.country,
      isp: info.isp,
      timestamp: new Date().toLocaleTimeString()
    });
    
    // Keep only last 10 items
    this.lookupHistory = this.lookupHistory.slice(0, 10);
    
    // Update history display
    const historyDiv = this.container.querySelector('#lookup-history');
    if (this.lookupHistory.length === 0) {
      historyDiv.innerHTML = '<div class="text-gray-500 dark:text-gray-400 text-sm">No lookups yet</div>';
    } else {
      historyDiv.innerHTML = this.lookupHistory.map(item => `
        <div class="history-item flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" data-ip="${item.ip}">
          <div class="flex-1">
            <span class="font-mono text-sm text-gray-900 dark:text-white">${item.ip}</span>
            <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">${item.country} • ${item.isp}</span>
          </div>
          <span class="text-xs text-gray-400 dark:text-gray-500">${item.timestamp}</span>
        </div>
      `).join('');
    }
  }
  
  isValidIP(ip) {
    // IPv4 pattern
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Pattern.test(ip)) {
      const parts = ip.split('.');
      return parts.every(part => parseInt(part) >= 0 && parseInt(part) <= 255);
    }
    
    // IPv6 pattern (simplified)
    const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
    return ipv6Pattern.test(ip);
  }
  
  isPrivateIP(ip) {
    // Handle both single IP and array of IPs
    const ips = Array.isArray(ip) ? ip : [ip];
    
    return ips.some(ipAddr => {
      if (typeof ipAddr !== 'string') return false;
      
      // Check for private IPv4 ranges
      if (ipAddr.startsWith('10.')) return true;
      if (ipAddr.startsWith('172.')) {
        const parts = ipAddr.split('.');
        if (parts.length >= 2) {
          const second = parseInt(parts[1]);
          return second >= 16 && second <= 31;
        }
      }
      if (ipAddr.startsWith('192.168.')) return true;
      if (ipAddr.startsWith('127.')) return true;
      if (ipAddr.startsWith('169.254.')) return true;
      
      // Check for private IPv6 ranges
      if (ipAddr.startsWith('fc') || ipAddr.startsWith('fd') || ipAddr.startsWith('FC') || ipAddr.startsWith('FD')) return true;
      if (ipAddr === '::1') return true; // IPv6 localhost
      
      return false;
    });
  }
  
  clear() {
    this.container.querySelector('#ip-input').value = '';
    this.container.querySelector('#ip-results').innerHTML = `
      <div class="text-gray-500 dark:text-gray-400 text-center py-8">
        Enter an IP address and click Lookup to get information
      </div>
    `;
    this.container.querySelector('#current-ip-display').classList.add('hidden');
    this.clearError();
  }
  
  showError(message) {
    const errorDiv = this.container.querySelector('[data-error]');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
  }
  
  clearError() {
    const errorDiv = this.container.querySelector('[data-error]');
    errorDiv.textContent = '';
    errorDiv.classList.add('hidden');
  }
}