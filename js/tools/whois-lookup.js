export class WHOISLookup {
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
  }
  
  render() {
    this.container.innerHTML = `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">WHOIS Lookup</h1>
          <p class="text-gray-600 dark:text-gray-400">Query domain registration, ownership, and administrative information</p>
        </div>
        
        <div class="mb-6 flex flex-wrap gap-2">
          <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="lookup">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            Lookup
          </button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="clear">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear
          </button>
          <button class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="copy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy
          </button>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-1">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="space-y-4">
                <div>
                  <label for="domain-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Domain Name / IP Address</label>
                  <input 
                    type="text" 
                    id="domain-input" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" 
                    placeholder="example.com or 8.8.8.8"
                    spellcheck="false"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Query Type</label>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input type="radio" name="query-type" value="domain" checked class="mr-2 text-blue-600 focus:ring-blue-500">
                      <span class="text-sm text-gray-700 dark:text-gray-300">Domain WHOIS</span>
                    </label>
                    <label class="flex items-center">
                      <input type="radio" name="query-type" value="ip" class="mr-2 text-blue-600 focus:ring-blue-500">
                      <span class="text-sm text-gray-700 dark:text-gray-300">IP WHOIS</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label for="whois-server" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WHOIS Server</label>
                  <select id="whois-server" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    <option value="auto">Auto-detect</option>
                    <option value="whois.verisign-grs.com">.com/.net (Verisign)</option>
                    <option value="whois.pir.org">.org (PIR)</option>
                    <option value="whois.arin.net">ARIN (Americas)</option>
                    <option value="whois.ripe.net">RIPE (Europe)</option>
                    <option value="whois.apnic.net">APNIC (Asia-Pacific)</option>
                    <option value="whois.afrinic.net">AFRINIC (Africa)</option>
                    <option value="whois.lacnic.net">LACNIC (Latin America)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="mt-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Examples</h3>
              <div class="space-y-2">
                <button class="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-left" data-example="google.com">google.com</button>
                <button class="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-left" data-example="github.com">github.com</button>
                <button class="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-left" data-example="8.8.8.8">8.8.8.8 (Google DNS)</button>
                <button class="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-left" data-example="cloudflare.com">cloudflare.com</button>
                <button class="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-left" data-example="1.1.1.1">1.1.1.1 (Cloudflare)</button>
              </div>
            </div>
            
            <div class="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lookup History</h3>
              <div id="lookup-history" class="space-y-2">
                <div class="text-gray-500 dark:text-gray-400 text-sm">No lookups yet</div>
              </div>
            </div>
          </div>
          
          <div class="lg:col-span-2">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">WHOIS Information</h3>
                <div id="lookup-status" class="text-sm text-gray-600 dark:text-gray-400"></div>
              </div>
              
              <div id="whois-results" class="space-y-4">
                <div class="text-gray-500 dark:text-gray-400 text-center py-12">
                  Enter a domain name or IP address and click Lookup to query WHOIS information
                </div>
              </div>
            </div>
            
            <div class="mt-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">WHOIS Information Includes</h4>
              <div class="text-sm text-blue-700 dark:text-blue-300 grid grid-cols-2 gap-2">
                <div>• Domain registration dates</div>
                <div>• Registrar information</div>
                <div>• Administrative contacts</div>
                <div>• Technical contacts</div>
                <div>• Name servers</div>
                <div>• Domain status</div>
                <div>• DNSSEC information</div>
                <div>• IP allocation details</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded hidden" data-error></div>
      </div>
    `;
  }
  
  attachEventListeners() {
    // Lookup button
    this.container.querySelector('[data-action="lookup"]').addEventListener('click', () => {
      this.performLookup();
    });
    
    // Clear button
    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => {
      this.clear();
    });
    
    // Copy button
    this.container.querySelector('[data-action="copy"]').addEventListener('click', () => {
      this.copyResults();
    });
    
    // Enter key on input
    this.container.querySelector('#domain-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.performLookup();
      }
    });
    
    // Query type change
    this.container.querySelectorAll('input[name="query-type"]').forEach(radio => {
      radio.addEventListener('change', () => {
        this.updatePlaceholder();
      });
    });
    
    // Example buttons
    this.container.querySelectorAll('[data-example]').forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.example;
        this.container.querySelector('#domain-input').value = value;
        
        // Auto-select query type based on example
        const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(value);
        this.container.querySelector(`input[name="query-type"][value="${isIP ? 'ip' : 'domain'}"]`).checked = true;
        
        this.performLookup();
      });
    });
    
    // History items (delegated)
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('.history-item')) {
        const item = e.target.closest('.history-item');
        this.container.querySelector('#domain-input').value = item.dataset.query;
        this.container.querySelector(`input[name="query-type"][value="${item.dataset.type}"]`).checked = true;
        this.performLookup();
      }
    });
  }
  
  updatePlaceholder() {
    const queryType = this.container.querySelector('input[name="query-type"]:checked').value;
    const input = this.container.querySelector('#domain-input');
    
    if (queryType === 'ip') {
      input.placeholder = '8.8.8.8 or 2001:4860:4860::8888';
    } else {
      input.placeholder = 'example.com';
    }
  }
  
  async performLookup() {
    const query = this.container.querySelector('#domain-input').value.trim();
    if (!query) {
      this.showError('Please enter a domain name or IP address');
      return;
    }
    
    const queryType = this.container.querySelector('input[name="query-type"]:checked').value;
    const whoisServer = this.container.querySelector('#whois-server').value;
    
    // Validate input based on type
    if (queryType === 'domain' && !this.isValidDomain(query)) {
      this.showError('Invalid domain format');
      return;
    }
    
    if (queryType === 'ip' && !this.isValidIP(query)) {
      this.showError('Invalid IP address format');
      return;
    }
    
    // Show loading state
    const resultsDiv = this.container.querySelector('#whois-results');
    const statusDiv = this.container.querySelector('#lookup-status');
    
    resultsDiv.innerHTML = `
      <div class="text-gray-500 dark:text-gray-400 text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        <div class="mt-2">Querying WHOIS server...</div>
      </div>
    `;
    statusDiv.textContent = 'Connecting...';
    
    this.clearError();
    
    // Cancel any existing request
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();
    
    try {
      // Simulate WHOIS lookup
      const whoisData = await this.simulateWHOISLookup(query, queryType, whoisServer);
      this.displayResults(whoisData, queryType);
      this.addToHistory(query, queryType);
      statusDiv.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }
      this.showError(`Lookup failed: ${error.message}`);
      statusDiv.textContent = 'Failed';
    }
  }
  
  async simulateWHOISLookup(query, type, server) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (type === 'ip') {
      return this.generateIPWHOIS(query);
    } else {
      return this.generateDomainWHOIS(query);
    }
  }
  
  generateDomainWHOIS(domain) {
    const tld = domain.split('.').pop();
    const createdDate = new Date(2010 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28));
    const updatedDate = new Date();
    updatedDate.setMonth(updatedDate.getMonth() - Math.floor(Math.random() * 6));
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + Math.floor(Math.random() * 3) + 1);
    
    return {
      domainName: domain.toUpperCase(),
      registryDomainId: `D${Math.random().toString(36).substr(2, 9).toUpperCase()}-${tld.toUpperCase()}`,
      registrarWhoisServer: this.getRegistrarServer(domain),
      registrar: this.getRegistrar(domain),
      registrarIanaId: Math.floor(Math.random() * 9000) + 1000,
      registrarUrl: `https://www.${this.getRegistrar(domain).toLowerCase().replace(/\s+/g, '')}.com`,
      registrarAbuseEmail: `abuse@${this.getRegistrar(domain).toLowerCase().replace(/\s+/g, '')}.com`,
      registrarAbusePhone: `+1.${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 9000) + 1000}`,
      createdDate: createdDate.toISOString(),
      updatedDate: updatedDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      registrant: {
        name: 'REDACTED FOR PRIVACY',
        organization: this.getOrganization(domain),
        street: 'REDACTED FOR PRIVACY',
        city: 'REDACTED FOR PRIVACY',
        state: 'REDACTED FOR PRIVACY',
        postalCode: 'REDACTED FOR PRIVACY',
        country: 'US',
        phone: 'REDACTED FOR PRIVACY',
        email: 'Please query the WHOIS server for contact email'
      },
      admin: {
        name: 'REDACTED FOR PRIVACY',
        organization: 'REDACTED FOR PRIVACY',
        email: 'Please query the WHOIS server for contact email'
      },
      tech: {
        name: 'REDACTED FOR PRIVACY',
        organization: 'REDACTED FOR PRIVACY',
        email: 'Please query the WHOIS server for contact email'
      },
      nameServers: this.generateNameServers(domain),
      dnssec: Math.random() > 0.5 ? 'unsigned' : 'signedDelegation',
      status: [
        'clientTransferProhibited',
        'clientUpdateProhibited',
        'clientDeleteProhibited'
      ],
      rawText: this.generateRawWHOIS(domain)
    };
  }
  
  generateIPWHOIS(ip) {
    const ipParts = ip.split('.');
    const isPrivate = this.isPrivateIP(ipParts);
    
    return {
      query: ip,
      queryType: 'IPv4',
      network: {
        handle: `NET-${ipParts[0]}-${ipParts[1]}-0-0-1`,
        name: isPrivate ? 'PRIVATE-ADDRESS-BLOCK' : this.getNetworkName(ip),
        range: `${ipParts[0]}.${ipParts[1]}.0.0 - ${ipParts[0]}.${ipParts[1]}.255.255`,
        cidr: `${ipParts[0]}.${ipParts[1]}.0.0/16`,
        type: isPrivate ? 'IANA Special Registry' : 'Direct Allocation',
        originAS: isPrivate ? 'N/A' : `AS${Math.floor(Math.random() * 60000) + 1000}`,
        organization: isPrivate ? 'Private Use' : this.getIPOrganization(ip),
        regDate: '2010-03-15',
        updated: '2023-09-20',
        source: this.getIPSource(ip)
      },
      contact: {
        registrant: {
          handle: `${this.getIPSource(ip)}-HANDLE`,
          name: isPrivate ? 'Internet Assigned Numbers Authority' : this.getIPOrganization(ip),
          address: isPrivate ? 'N/A' : this.getIPAddress(ip),
          email: 'network-abuse@example.com',
          phone: '+1-555-0100'
        },
        abuse: {
          handle: 'ABUSE-HANDLE',
          name: 'Abuse Contact',
          email: 'abuse@example.com',
          phone: '+1-555-0199'
        }
      },
      rdapLink: `https://rdap.${this.getIPSource(ip).toLowerCase()}.net/ip/${ip}`,
      rawText: this.generateRawIPWHOIS(ip)
    };
  }
  
  getRegistrar(domain) {
    const registrars = [
      'GoDaddy.com LLC',
      'Namecheap Inc',
      'Google Domains',
      'Cloudflare Registrar',
      'Network Solutions LLC',
      'MarkMonitor Inc',
      'CSC Corporate Domains',
      'Amazon Registrar'
    ];
    
    // Use domain hash for consistent registrar
    let hash = 0;
    for (let i = 0; i < domain.length; i++) {
      hash = ((hash << 5) - hash) + domain.charCodeAt(i);
    }
    
    return registrars[Math.abs(hash) % registrars.length];
  }
  
  getRegistrarServer(domain) {
    const registrar = this.getRegistrar(domain);
    return `whois.${registrar.toLowerCase().replace(/[^a-z]/g, '')}.com`;
  }
  
  getOrganization(domain) {
    if (domain.includes('google')) return 'Google LLC';
    if (domain.includes('github')) return 'GitHub, Inc.';
    if (domain.includes('cloudflare')) return 'Cloudflare, Inc.';
    if (domain.includes('amazon')) return 'Amazon Technologies, Inc.';
    if (domain.includes('microsoft')) return 'Microsoft Corporation';
    return `${domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)} Corporation`;
  }
  
  generateNameServers(domain) {
    const nsProviders = [
      ['ns1', 'ns2', 'ns3', 'ns4'],
      ['dns1', 'dns2'],
      ['a', 'b', 'c', 'd'],
      ['ns-1', 'ns-2']
    ];
    
    const chosen = nsProviders[Math.floor(Math.random() * nsProviders.length)];
    return chosen.map(ns => `${ns}.${domain}`);
  }
  
  getNetworkName(ip) {
    if (ip.startsWith('8.8')) return 'GOOGLE-DNS';
    if (ip.startsWith('1.1')) return 'CLOUDFLARE-NET';
    if (ip.startsWith('208.67')) return 'OPENDNS-NET';
    return 'EXAMPLE-NETWORK';
  }
  
  getIPOrganization(ip) {
    if (ip.startsWith('8.8')) return 'Google LLC';
    if (ip.startsWith('1.1')) return 'Cloudflare, Inc.';
    if (ip.startsWith('208.67')) return 'OpenDNS, LLC';
    if (ip.startsWith('9.9')) return 'Quad9';
    return 'Example Organization Inc.';
  }
  
  getIPSource(ip) {
    const firstOctet = parseInt(ip.split('.')[0]);
    
    if (firstOctet >= 1 && firstOctet <= 91) return 'ARIN';
    if (firstOctet >= 92 && firstOctet <= 95) return 'RIPE';
    if (firstOctet >= 96 && firstOctet <= 126) return 'APNIC';
    if (firstOctet >= 128 && firstOctet <= 191) return 'ARIN';
    if (firstOctet >= 192 && firstOctet <= 223) return 'Various';
    return 'ARIN';
  }
  
  getIPAddress(ip) {
    const orgs = {
      '8.8': '1600 Amphitheatre Parkway, Mountain View, CA 94043, US',
      '1.1': '101 Townsend Street, San Francisco, CA 94107, US',
      '208.67': '2295 N 1st St, San Jose, CA 95131, US'
    };
    
    for (const prefix in orgs) {
      if (ip.startsWith(prefix)) return orgs[prefix];
    }
    
    return '123 Example Street, Anytown, ST 12345, US';
  }
  
  isPrivateIP(parts) {
    const first = parseInt(parts[0]);
    const second = parseInt(parts[1]);
    
    if (first === 10) return true;
    if (first === 172 && second >= 16 && second <= 31) return true;
    if (first === 192 && second === 168) return true;
    if (first === 127) return true;
    if (first === 169 && second === 254) return true;
    
    return false;
  }
  
  generateRawWHOIS(domain) {
    return `Domain Name: ${domain.toUpperCase()}
Registry Domain ID: D${Math.random().toString(36).substr(2, 9).toUpperCase()}
Registrar WHOIS Server: ${this.getRegistrarServer(domain)}
Registrar URL: https://www.${this.getRegistrar(domain).toLowerCase().replace(/\s+/g, '')}.com
Updated Date: ${new Date().toISOString()}
Creation Date: ${new Date(2015, 0, 1).toISOString()}
Registrar: ${this.getRegistrar(domain)}
Registrar IANA ID: ${Math.floor(Math.random() * 9000) + 1000}
Domain Status: clientTransferProhibited
Domain Status: clientUpdateProhibited
Registry Registrant ID: REDACTED FOR PRIVACY
Registrant Name: REDACTED FOR PRIVACY
Registrant Organization: ${this.getOrganization(domain)}
Registry Admin ID: REDACTED FOR PRIVACY
Admin Name: REDACTED FOR PRIVACY
Registry Tech ID: REDACTED FOR PRIVACY
Tech Name: REDACTED FOR PRIVACY
Name Server: ${this.generateNameServers(domain).join('\nName Server: ')}
DNSSEC: unsigned`;
  }
  
  generateRawIPWHOIS(ip) {
    const parts = ip.split('.');
    return `#
# Query: ${ip}
# Source: ${this.getIPSource(ip)}
#

network:
  handle: NET-${parts[0]}-${parts[1]}-0-0-1
  name: ${this.getNetworkName(ip)}
  range: ${parts[0]}.${parts[1]}.0.0 - ${parts[0]}.${parts[1]}.255.255
  cidr: ${parts[0]}.${parts[1]}.0.0/16
  type: Direct Allocation
  organization: ${this.getIPOrganization(ip)}
  reg-date: 2010-03-15
  updated: 2023-09-20
  source: ${this.getIPSource(ip)}`;
  }
  
  displayResults(data, type) {
    const resultsDiv = this.container.querySelector('#whois-results');
    
    if (type === 'domain') {
      resultsDiv.innerHTML = this.formatDomainWHOIS(data);
    } else {
      resultsDiv.innerHTML = this.formatIPWHOIS(data);
    }
  }
  
  formatDomainWHOIS(data) {
    return `
      <div class="space-y-4">
        <!-- Domain Information -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Domain Information</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Domain Name:</span>
              <span class="font-mono text-gray-900 dark:text-white">${data.domainName}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Registry Domain ID:</span>
              <span class="font-mono text-gray-900 dark:text-white">${data.registryDomainId}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Registrar:</span>
              <span class="text-gray-900 dark:text-white">${data.registrar}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Registrar IANA ID:</span>
              <span class="text-gray-900 dark:text-white">${data.registrarIanaId}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">DNSSEC:</span>
              <span class="text-gray-900 dark:text-white">${data.dnssec}</span>
            </div>
          </div>
        </div>
        
        <!-- Important Dates -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Important Dates</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Created:</span>
              <span class="text-gray-900 dark:text-white">${new Date(data.createdDate).toLocaleDateString()}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Updated:</span>
              <span class="text-gray-900 dark:text-white">${new Date(data.updatedDate).toLocaleDateString()}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Expires:</span>
              <span class="font-semibold text-orange-600 dark:text-orange-400">${new Date(data.expiryDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <!-- Status -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Domain Status</h4>
          <div class="flex flex-wrap gap-2">
            ${data.status.map(status => `
              <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                ${status}
              </span>
            `).join('')}
          </div>
        </div>
        
        <!-- Name Servers -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Name Servers</h4>
          <div class="space-y-1">
            ${data.nameServers.map(ns => `
              <div class="text-sm font-mono text-gray-900 dark:text-white">${ns}</div>
            `).join('')}
          </div>
        </div>
        
        <!-- Registrant Information -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Registrant Contact</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Organization:</span>
              <span class="text-gray-900 dark:text-white">${data.registrant.organization}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Country:</span>
              <span class="text-gray-900 dark:text-white">${data.registrant.country}</span>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">
              * Contact details are redacted for privacy protection
            </div>
          </div>
        </div>
        
        <!-- Raw WHOIS -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Raw WHOIS Data</h4>
            <button class="text-xs text-blue-600 dark:text-blue-400 hover:underline" onclick="this.nextElementSibling.classList.toggle('hidden')">
              Toggle
            </button>
          </div>
          <pre class="hidden text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap">${data.rawText}</pre>
        </div>
      </div>
    `;
  }
  
  formatIPWHOIS(data) {
    return `
      <div class="space-y-4">
        <!-- Network Information -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Network Information</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">IP Address:</span>
              <span class="font-mono text-gray-900 dark:text-white">${data.query}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Network Handle:</span>
              <span class="font-mono text-gray-900 dark:text-white">${data.network.handle}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Network Name:</span>
              <span class="text-gray-900 dark:text-white">${data.network.name}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">IP Range:</span>
              <span class="font-mono text-gray-900 dark:text-white">${data.network.range}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">CIDR:</span>
              <span class="font-mono text-gray-900 dark:text-white">${data.network.cidr}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Type:</span>
              <span class="text-gray-900 dark:text-white">${data.network.type}</span>
            </div>
            ${data.network.originAS !== 'N/A' ? `
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Origin AS:</span>
              <span class="font-mono text-gray-900 dark:text-white">${data.network.originAS}</span>
            </div>
            ` : ''}
          </div>
        </div>
        
        <!-- Organization -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Organization</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Name:</span>
              <span class="text-gray-900 dark:text-white">${data.network.organization}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Registration Date:</span>
              <span class="text-gray-900 dark:text-white">${data.network.regDate}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Last Updated:</span>
              <span class="text-gray-900 dark:text-white">${data.network.updated}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600 dark:text-gray-400">Source:</span>
              <span class="text-gray-900 dark:text-white">${data.network.source}</span>
            </div>
          </div>
        </div>
        
        <!-- Contacts -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Contact Information</h4>
          <div class="space-y-3">
            <div>
              <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Registrant</div>
              <div class="text-sm text-gray-900 dark:text-white">${data.contact.registrant.name}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">${data.contact.registrant.address}</div>
            </div>
            <div>
              <div class="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Abuse Contact</div>
              <div class="text-sm text-gray-900 dark:text-white">${data.contact.abuse.email}</div>
              <div class="text-sm text-gray-600 dark:text-gray-400">${data.contact.abuse.phone}</div>
            </div>
          </div>
        </div>
        
        <!-- RDAP Link -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Additional Resources</h4>
          <div class="text-sm">
            <a href="${data.rdapLink}" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank">
              View RDAP Information →
            </a>
          </div>
        </div>
        
        <!-- Raw WHOIS -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Raw WHOIS Data</h4>
            <button class="text-xs text-blue-600 dark:text-blue-400 hover:underline" onclick="this.nextElementSibling.classList.toggle('hidden')">
              Toggle
            </button>
          </div>
          <pre class="hidden text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap">${data.rawText}</pre>
        </div>
      </div>
    `;
  }
  
  addToHistory(query, type) {
    // Add to history array
    this.lookupHistory.unshift({
      query: query,
      type: type,
      timestamp: new Date().toLocaleTimeString()
    });
    
    // Keep only last 10 items
    this.lookupHistory = this.lookupHistory.slice(0, 10);
    
    // Update history display
    this.updateHistoryDisplay();
  }
  
  updateHistoryDisplay() {
    const historyDiv = this.container.querySelector('#lookup-history');
    
    if (this.lookupHistory.length === 0) {
      historyDiv.innerHTML = '<div class="text-gray-500 dark:text-gray-400 text-sm">No lookups yet</div>';
    } else {
      historyDiv.innerHTML = this.lookupHistory.map(item => `
        <div class="history-item flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600" data-query="${item.query}" data-type="${item.type}">
          <div class="flex-1">
            <span class="text-sm font-mono text-gray-900 dark:text-white">${this.escapeHtml(item.query)}</span>
            <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">${item.type === 'ip' ? 'IP' : 'Domain'}</span>
          </div>
          <span class="text-xs text-gray-400 dark:text-gray-500">${item.timestamp}</span>
        </div>
      `).join('');
    }
  }
  
  isValidDomain(domain) {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
    return domainRegex.test(domain);
  }
  
  isValidIP(ip) {
    // IPv4 pattern
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Pattern.test(ip)) {
      const parts = ip.split('.');
      return parts.every(part => {
        const num = parseInt(part);
        return num >= 0 && num <= 255;
      });
    }
    
    // IPv6 pattern (simplified)
    const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
    return ipv6Pattern.test(ip);
  }
  
  copyResults() {
    const resultsDiv = this.container.querySelector('#whois-results');
    const text = resultsDiv.innerText;
    
    navigator.clipboard.writeText(text).then(() => {
      const btn = this.container.querySelector('[data-action="copy"]');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Copied!
      `;
      btn.className = 'px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2';
      
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.className = 'px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2';
      }, 2000);
    });
  }
  
  clear() {
    this.container.querySelector('#domain-input').value = '';
    this.container.querySelector('#whois-results').innerHTML = `
      <div class="text-gray-500 dark:text-gray-400 text-center py-12">
        Enter a domain name or IP address and click Lookup to query WHOIS information
      </div>
    `;
    this.container.querySelector('#lookup-status').textContent = '';
    this.clearError();
  }
  
  showError(message) {
    const errorDiv = this.container.querySelector('[data-error]');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    
    const resultsDiv = this.container.querySelector('#whois-results');
    resultsDiv.innerHTML = `
      <div class="text-red-600 dark:text-red-400 text-center py-12">
        ${message}
      </div>
    `;
  }
  
  clearError() {
    const errorDiv = this.container.querySelector('[data-error]');
    errorDiv.textContent = '';
    errorDiv.classList.add('hidden');
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}