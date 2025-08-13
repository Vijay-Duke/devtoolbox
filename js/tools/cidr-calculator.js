export class CIDRCalculator {
  constructor() {
    this.container = null;
    this.history = [];
  }
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.render();
    this.attachEventListeners();
    this.calculate(); // Calculate with default values
  }
  
  render() {
    this.container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">CIDR Calculator</h1>
          <p class="text-gray-600 dark:text-gray-400">Calculate IP ranges, subnet masks, and network information from CIDR notation</p>
        </div>
        
        <div class="mb-6 flex flex-wrap gap-2">
          <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="calculate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v20M2 12h20"/>
            </svg>
            Calculate
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
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Input</h3>
              
              <div class="space-y-4">
                <div>
                  <label for="cidr-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CIDR Notation</label>
                  <input 
                    type="text" 
                    id="cidr-input" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono" 
                    placeholder="192.168.1.0/24"
                    value="192.168.1.0/24"
                    spellcheck="false"
                  />
                </div>
                
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  <p>Enter an IP address with CIDR notation (e.g., 10.0.0.0/8)</p>
                </div>
                
                <div>
                  <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Or Convert From:</h4>
                  <div class="space-y-3">
                    <div>
                      <label for="ip-address" class="block text-xs text-gray-600 dark:text-gray-400 mb-1">IP Address</label>
                      <input 
                        type="text" 
                        id="ip-address" 
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm" 
                        placeholder="192.168.1.0"
                      />
                    </div>
                    <div>
                      <label for="subnet-mask" class="block text-xs text-gray-600 dark:text-gray-400 mb-1">Subnet Mask</label>
                      <input 
                        type="text" 
                        id="subnet-mask" 
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm" 
                        placeholder="255.255.255.0"
                      />
                    </div>
                    <button class="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30" data-action="convert">
                      Convert to CIDR
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Common CIDR Blocks</h3>
              <div class="grid grid-cols-2 gap-2">
                <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="10.0.0.0/8">10.0.0.0/8 (Class A)</button>
                <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="172.16.0.0/12">172.16.0.0/12 (Private)</button>
                <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="192.168.0.0/16">192.168.0.0/16 (Private)</button>
                <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="192.168.1.0/24">192.168.1.0/24 (Subnet)</button>
                <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="0.0.0.0/0">0.0.0.0/0 (Any)</button>
                <button class="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="10.10.10.0/28">10.10.10.0/28 (Small)</button>
              </div>
            </div>
          </div>
          
          <div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Results</h3>
              <div id="calculation-results" class="space-y-3">
                <div class="text-gray-500 dark:text-gray-400 text-center py-8">
                  Enter CIDR notation to see calculations
                </div>
              </div>
            </div>
            
            <div class="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subnet Division</h3>
              <div class="mb-3">
                <label for="subnet-bits" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Divide into subnets (bits to borrow)
                </label>
                <div class="flex gap-2">
                  <input 
                    type="number" 
                    id="subnet-bits" 
                    class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" 
                    min="0"
                    max="8"
                    value="0"
                  />
                  <button class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2" data-action="divide">
                    Divide
                  </button>
                </div>
              </div>
              <div id="subnet-results" class="space-y-2"></div>
            </div>
          </div>
        </div>
        
        <div class="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">IP Range Visualizer</h3>
          <div id="ip-visualizer" class="space-y-2"></div>
        </div>
        
        <div class="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Quick Reference</h4>
          <div class="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <p><strong>/8:</strong> 16,777,216 hosts (Class A)</p>
            <p><strong>/16:</strong> 65,536 hosts (Class B)</p>
            <p><strong>/24:</strong> 256 hosts (Class C)</p>
            <p><strong>/28:</strong> 16 hosts (Small subnet)</p>
            <p><strong>/30:</strong> 4 hosts (Point-to-point)</p>
            <p><strong>/32:</strong> 1 host (Single host)</p>
          </div>
        </div>
        
        <div class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded hidden" data-error></div>
      </div>
    `;
  }
  
  attachEventListeners() {
    // Calculate button
    this.container.querySelector('[data-action="calculate"]').addEventListener('click', () => {
      this.calculate();
    });
    
    // Clear button
    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => {
      this.clear();
    });
    
    // Convert button
    this.container.querySelector('[data-action="convert"]').addEventListener('click', () => {
      this.convertToCIDR();
    });
    
    // Divide button
    this.container.querySelector('[data-action="divide"]').addEventListener('click', () => {
      this.divideSubnets();
    });
    
    // Enter key on CIDR input
    this.container.querySelector('#cidr-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.calculate();
      }
    });
    
    // Auto-calculate on input change
    this.container.querySelector('#cidr-input').addEventListener('input', () => {
      this.clearError();
    });
    
    // Example buttons
    this.container.querySelectorAll('[data-example]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelector('#cidr-input').value = btn.dataset.example;
        this.calculate();
      });
    });
    
    // Subnet bits change
    this.container.querySelector('#subnet-bits').addEventListener('change', () => {
      if (this.currentCIDR) {
        this.divideSubnets();
      }
    });
  }
  
  calculate() {
    const cidrInput = this.container.querySelector('#cidr-input').value.trim();
    if (!cidrInput) {
      this.showError('Please enter CIDR notation');
      return;
    }
    
    try {
      const cidr = this.parseCIDR(cidrInput);
      if (!cidr) {
        this.showError('Invalid CIDR notation format');
        return;
      }
      
      this.currentCIDR = cidr;
      const results = this.calculateCIDRInfo(cidr);
      this.displayResults(results);
      this.visualizeIPRange(results);
      this.clearError();
      
      // Reset subnet division
      this.container.querySelector('#subnet-bits').value = '0';
      this.container.querySelector('#subnet-results').innerHTML = '';
      
    } catch (error) {
      this.showError(error.message);
    }
  }
  
  parseCIDR(cidrStr) {
    const match = cidrStr.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/);
    if (!match) return null;
    
    const [, ...octets] = match.slice(0, 5).map(Number);
    const prefix = parseInt(match[5]);
    
    // Validate octets
    if (octets.some(o => o < 0 || o > 255)) {
      throw new Error('Invalid IP address: octets must be 0-255');
    }
    
    // Validate prefix
    if (prefix < 0 || prefix > 32) {
      throw new Error('Invalid CIDR prefix: must be 0-32');
    }
    
    return {
      ip: octets,
      prefix: prefix,
      ipString: octets.join('.')
    };
  }
  
  calculateCIDRInfo(cidr) {
    const { ip, prefix } = cidr;
    
    // Calculate subnet mask
    const subnetMask = this.prefixToSubnetMask(prefix);
    
    // Calculate network address
    const networkAddress = ip.map((octet, i) => octet & subnetMask[i]);
    
    // Calculate broadcast address
    const hostBits = 32 - prefix;
    const broadcastAddress = networkAddress.map((octet, i) => {
      const wildcardOctet = 255 - subnetMask[i];
      return octet | wildcardOctet;
    });
    
    // Calculate first and last usable host
    const firstHost = [...networkAddress];
    const lastHost = [...broadcastAddress];
    
    if (prefix < 31) {
      firstHost[3] += 1;
      lastHost[3] -= 1;
    }
    
    // Calculate total hosts
    const totalHosts = Math.pow(2, hostBits);
    const usableHosts = prefix === 32 ? 1 : (prefix === 31 ? 2 : totalHosts - 2);
    
    // Determine IP class
    const ipClass = this.getIPClass(ip[0]);
    
    // Check if private
    const isPrivate = this.isPrivateIP(ip);
    
    return {
      cidr: `${cidr.ipString}/${prefix}`,
      networkAddress: networkAddress.join('.'),
      broadcastAddress: broadcastAddress.join('.'),
      subnetMask: subnetMask.join('.'),
      wildcardMask: subnetMask.map(o => 255 - o).join('.'),
      prefix: prefix,
      hostBits: hostBits,
      totalHosts: totalHosts,
      usableHosts: usableHosts,
      firstHost: firstHost.join('.'),
      lastHost: lastHost.join('.'),
      ipClass: ipClass,
      isPrivate: isPrivate,
      binary: {
        network: this.toBinary(networkAddress),
        subnet: this.toBinary(subnetMask)
      }
    };
  }
  
  prefixToSubnetMask(prefix) {
    const mask = [];
    let bits = prefix;
    
    for (let i = 0; i < 4; i++) {
      if (bits >= 8) {
        mask.push(255);
        bits -= 8;
      } else if (bits > 0) {
        mask.push(256 - Math.pow(2, 8 - bits));
        bits = 0;
      } else {
        mask.push(0);
      }
    }
    
    return mask;
  }
  
  subnetMaskToPrefix(mask) {
    const octets = mask.split('.').map(Number);
    let prefix = 0;
    
    for (const octet of octets) {
      if (octet === 255) {
        prefix += 8;
      } else if (octet === 0) {
        break;
      } else {
        // Count bits in partial octet
        let val = octet;
        while (val & 0x80) {
          prefix++;
          val = (val << 1) & 0xFF;
        }
        break;
      }
    }
    
    return prefix;
  }
  
  getIPClass(firstOctet) {
    if (firstOctet >= 1 && firstOctet <= 126) return 'A';
    if (firstOctet >= 128 && firstOctet <= 191) return 'B';
    if (firstOctet >= 192 && firstOctet <= 223) return 'C';
    if (firstOctet >= 224 && firstOctet <= 239) return 'D (Multicast)';
    if (firstOctet >= 240 && firstOctet <= 255) return 'E (Reserved)';
    return 'Unknown';
  }
  
  isPrivateIP(ip) {
    // 10.0.0.0/8
    if (ip[0] === 10) return true;
    // 172.16.0.0/12
    if (ip[0] === 172 && ip[1] >= 16 && ip[1] <= 31) return true;
    // 192.168.0.0/16
    if (ip[0] === 192 && ip[1] === 168) return true;
    // 127.0.0.0/8 (loopback)
    if (ip[0] === 127) return true;
    // 169.254.0.0/16 (link-local)
    if (ip[0] === 169 && ip[1] === 254) return true;
    
    return false;
  }
  
  toBinary(octets) {
    return octets.map(o => o.toString(2).padStart(8, '0')).join('.');
  }
  
  displayResults(results) {
    const resultsDiv = this.container.querySelector('#calculation-results');
    
    resultsDiv.innerHTML = `
      <div class="space-y-2">
        <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
          <span class="text-sm text-gray-600 dark:text-gray-400">Network Address:</span>
          <span class="text-sm font-mono font-semibold text-gray-900 dark:text-white">${results.networkAddress}</span>
        </div>
        <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
          <span class="text-sm text-gray-600 dark:text-gray-400">Broadcast Address:</span>
          <span class="text-sm font-mono font-semibold text-gray-900 dark:text-white">${results.broadcastAddress}</span>
        </div>
        <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
          <span class="text-sm text-gray-600 dark:text-gray-400">Subnet Mask:</span>
          <span class="text-sm font-mono font-semibold text-gray-900 dark:text-white">${results.subnetMask}</span>
        </div>
        <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
          <span class="text-sm text-gray-600 dark:text-gray-400">Wildcard Mask:</span>
          <span class="text-sm font-mono font-semibold text-gray-900 dark:text-white">${results.wildcardMask}</span>
        </div>
        <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
          <span class="text-sm text-gray-600 dark:text-gray-400">Total Hosts:</span>
          <span class="text-sm font-semibold text-gray-900 dark:text-white">${results.totalHosts.toLocaleString()}</span>
        </div>
        <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
          <span class="text-sm text-gray-600 dark:text-gray-400">Usable Hosts:</span>
          <span class="text-sm font-semibold text-gray-900 dark:text-white">${results.usableHosts.toLocaleString()}</span>
        </div>
        <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
          <span class="text-sm text-gray-600 dark:text-gray-400">First Host:</span>
          <span class="text-sm font-mono font-semibold text-gray-900 dark:text-white">${results.firstHost}</span>
        </div>
        <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
          <span class="text-sm text-gray-600 dark:text-gray-400">Last Host:</span>
          <span class="text-sm font-mono font-semibold text-gray-900 dark:text-white">${results.lastHost}</span>
        </div>
        <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
          <span class="text-sm text-gray-600 dark:text-gray-400">IP Class:</span>
          <span class="text-sm font-semibold text-gray-900 dark:text-white">Class ${results.ipClass}</span>
        </div>
        <div class="flex justify-between py-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">Network Type:</span>
          <span class="text-sm font-semibold ${results.isPrivate ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}">
            ${results.isPrivate ? 'Private' : 'Public'}
          </span>
        </div>
      </div>
      
      <div class="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
        <h4 class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Binary Representation</h4>
        <div class="space-y-1">
          <div class="text-xs">
            <span class="text-gray-600 dark:text-gray-400">Network:</span>
            <span class="font-mono text-gray-900 dark:text-white ml-2">${results.binary.network}</span>
          </div>
          <div class="text-xs">
            <span class="text-gray-600 dark:text-gray-400">Mask:</span>
            <span class="font-mono text-gray-900 dark:text-white ml-7">${results.binary.subnet}</span>
          </div>
        </div>
      </div>
    `;
  }
  
  visualizeIPRange(results) {
    const visualizer = this.container.querySelector('#ip-visualizer');
    
    const networkOctets = results.networkAddress.split('.').map(Number);
    const broadcastOctets = results.broadcastAddress.split('.').map(Number);
    
    let html = '<div class="space-y-2">';
    
    // Show IP range bar
    html += `
      <div class="bg-gradient-to-r from-blue-500 to-green-500 h-8 rounded-lg relative">
        <div class="absolute left-2 top-1/2 transform -translate-y-1/2 text-white text-xs font-mono">
          ${results.networkAddress}
        </div>
        <div class="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-xs font-mono">
          ${results.broadcastAddress}
        </div>
      </div>
    `;
    
    // Show size indicator
    const sizeClass = results.prefix <= 8 ? 'bg-red-500' :
                     results.prefix <= 16 ? 'bg-orange-500' :
                     results.prefix <= 24 ? 'bg-yellow-500' :
                     results.prefix <= 28 ? 'bg-green-500' :
                     'bg-blue-500';
    
    const sizePercent = Math.min(100, (results.usableHosts / 16777216) * 100);
    
    html += `
      <div class="bg-gray-200 dark:bg-gray-600 h-4 rounded-lg overflow-hidden">
        <div class="${sizeClass} h-full transition-all duration-500" style="width: ${Math.max(5, sizePercent)}%"></div>
      </div>
      <div class="text-xs text-gray-600 dark:text-gray-400 text-center">
        Network size: ${results.usableHosts.toLocaleString()} hosts (/${results.prefix})
      </div>
    `;
    
    html += '</div>';
    visualizer.innerHTML = html;
  }
  
  convertToCIDR() {
    const ipAddress = this.container.querySelector('#ip-address').value.trim();
    const subnetMask = this.container.querySelector('#subnet-mask').value.trim();
    
    if (!ipAddress || !subnetMask) {
      this.showError('Please enter both IP address and subnet mask');
      return;
    }
    
    try {
      // Validate IP
      if (!this.isValidIP(ipAddress)) {
        this.showError('Invalid IP address format');
        return;
      }
      
      // Validate subnet mask
      if (!this.isValidSubnetMask(subnetMask)) {
        this.showError('Invalid subnet mask format');
        return;
      }
      
      // Convert subnet mask to prefix
      const prefix = this.subnetMaskToPrefix(subnetMask);
      
      // Update CIDR input and calculate
      this.container.querySelector('#cidr-input').value = `${ipAddress}/${prefix}`;
      this.calculate();
      
    } catch (error) {
      this.showError(error.message);
    }
  }
  
  isValidIP(ip) {
    const octets = ip.split('.');
    if (octets.length !== 4) return false;
    
    return octets.every(octet => {
      const num = parseInt(octet);
      return !isNaN(num) && num >= 0 && num <= 255;
    });
  }
  
  isValidSubnetMask(mask) {
    if (!this.isValidIP(mask)) return false;
    
    const octets = mask.split('.').map(Number);
    const binary = octets.map(o => o.toString(2).padStart(8, '0')).join('');
    
    // Check if it's a valid subnet mask (contiguous 1s followed by 0s)
    const firstZero = binary.indexOf('0');
    if (firstZero === -1) return true; // All 1s (255.255.255.255)
    
    // Check no 1s after first 0
    return !binary.substring(firstZero).includes('1');
  }
  
  divideSubnets() {
    if (!this.currentCIDR) {
      this.showError('Please calculate a CIDR first');
      return;
    }
    
    const subnetBits = parseInt(this.container.querySelector('#subnet-bits').value) || 0;
    
    if (subnetBits === 0) {
      this.container.querySelector('#subnet-results').innerHTML = '';
      return;
    }
    
    const results = this.calculateCIDRInfo(this.currentCIDR);
    const newPrefix = this.currentCIDR.prefix + subnetBits;
    
    if (newPrefix > 32) {
      this.showError('Cannot create subnets with prefix > 32');
      return;
    }
    
    const numSubnets = Math.pow(2, subnetBits);
    const hostsPerSubnet = Math.pow(2, 32 - newPrefix);
    
    const subnets = [];
    const networkOctets = results.networkAddress.split('.').map(Number);
    let currentIP = this.ipToNumber(networkOctets);
    
    for (let i = 0; i < Math.min(numSubnets, 16); i++) {
      const subnetIP = this.numberToIP(currentIP);
      subnets.push({
        network: `${subnetIP.join('.')}/${newPrefix}`,
        firstHost: this.numberToIP(currentIP + 1).join('.'),
        lastHost: this.numberToIP(currentIP + hostsPerSubnet - 2).join('.'),
        broadcast: this.numberToIP(currentIP + hostsPerSubnet - 1).join('.'),
        hosts: hostsPerSubnet - 2
      });
      currentIP += hostsPerSubnet;
    }
    
    this.displaySubnets(subnets, numSubnets);
  }
  
  ipToNumber(octets) {
    return (octets[0] << 24) + (octets[1] << 16) + (octets[2] << 8) + octets[3];
  }
  
  numberToIP(num) {
    return [
      (num >>> 24) & 0xFF,
      (num >>> 16) & 0xFF,
      (num >>> 8) & 0xFF,
      num & 0xFF
    ];
  }
  
  displaySubnets(subnets, total) {
    const resultsDiv = this.container.querySelector('#subnet-results');
    
    let html = `
      <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
        Showing ${subnets.length} of ${total} subnets
      </div>
    `;
    
    html += '<div class="space-y-2 max-h-64 overflow-y-auto">';
    
    subnets.forEach((subnet, i) => {
      html += `
        <div class="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
          <div class="flex justify-between items-center">
            <span class="text-sm font-semibold text-gray-900 dark:text-white">Subnet ${i + 1}</span>
            <span class="text-xs font-mono text-blue-600 dark:text-blue-400">${subnet.network}</span>
          </div>
          <div class="mt-1 text-xs text-gray-600 dark:text-gray-400">
            <div>Range: ${subnet.firstHost} - ${subnet.lastHost}</div>
            <div>Broadcast: ${subnet.broadcast} | Hosts: ${subnet.hosts}</div>
          </div>
        </div>
      `;
    });
    
    if (total > subnets.length) {
      html += `
        <div class="text-center text-xs text-gray-500 dark:text-gray-400 py-2">
          ... and ${total - subnets.length} more subnets
        </div>
      `;
    }
    
    html += '</div>';
    resultsDiv.innerHTML = html;
  }
  
  clear() {
    this.container.querySelector('#cidr-input').value = '';
    this.container.querySelector('#ip-address').value = '';
    this.container.querySelector('#subnet-mask').value = '';
    this.container.querySelector('#subnet-bits').value = '0';
    this.container.querySelector('#calculation-results').innerHTML = `
      <div class="text-gray-500 dark:text-gray-400 text-center py-8">
        Enter CIDR notation to see calculations
      </div>
    `;
    this.container.querySelector('#subnet-results').innerHTML = '';
    this.container.querySelector('#ip-visualizer').innerHTML = '';
    this.currentCIDR = null;
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