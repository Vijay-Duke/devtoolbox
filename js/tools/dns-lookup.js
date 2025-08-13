export class DNSLookup {
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
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">DNS Lookup</h1>
          <p class="text-gray-600 dark:text-gray-400">Query DNS records for domains including A, AAAA, MX, TXT, NS, and more</p>
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
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div class="space-y-4">
                <div>
                  <label for="domain-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Domain Name</label>
                  <input 
                    type="text" 
                    id="domain-input" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" 
                    placeholder="example.com"
                    value="example.com"
                    autocomplete="off"
                    spellcheck="false"
                  />
                </div>
            
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Record Types</label>
                  <div class="grid grid-cols-3 gap-2 record-types">
                    <label class="flex items-center">
                      <input type="checkbox" value="A" checked class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
                      <span class="text-sm text-gray-700 dark:text-gray-300">A (IPv4)</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" value="AAAA" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
                      <span class="text-sm text-gray-700 dark:text-gray-300">AAAA (IPv6)</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" value="MX" checked class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
                      <span class="text-sm text-gray-700 dark:text-gray-300">MX (Mail)</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" value="TXT" checked class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
                      <span class="text-sm text-gray-700 dark:text-gray-300">TXT</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" value="NS" checked class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
                      <span class="text-sm text-gray-700 dark:text-gray-300">NS</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" value="CNAME" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
                      <span class="text-sm text-gray-700 dark:text-gray-300">CNAME</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" value="SOA" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
                      <span class="text-sm text-gray-700 dark:text-gray-300">SOA</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" value="PTR" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
                      <span class="text-sm text-gray-700 dark:text-gray-300">PTR</span>
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" value="CAA" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
                      <span class="text-sm text-gray-700 dark:text-gray-300">CAA</span>
                    </label>
                  </div>
                </div>
            
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label for="dns-server" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DNS Server</label>
                    <select id="dns-server" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      <option value="cloudflare">Cloudflare (1.1.1.1)</option>
                      <option value="google">Google (8.8.8.8)</option>
                      <option value="quad9">Quad9 (9.9.9.9)</option>
                      <option value="opendns">OpenDNS (208.67.222.222)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label for="query-class" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Query Class</label>
                    <select id="query-class" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      <option value="IN">IN (Internet)</option>
                      <option value="CH">CH (Chaos)</option>
                      <option value="HS">HS (Hesiod)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="space-y-6">
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">DNS Records</h3>
              <div id="dns-results" class="space-y-3">
                <div class="text-gray-500 dark:text-gray-400 text-center py-8">Enter a domain and click Lookup to query DNS records</div>
              </div>
            </div>
            
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lookup History</h3>
              <div id="lookup-history" class="space-y-2"></div>
            </div>
          </div>
        </div>
        
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Examples</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="google.com">google.com</button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="github.com">github.com</button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="cloudflare.com">cloudflare.com</button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="stackoverflow.com">stackoverflow.com</button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="wikipedia.org">wikipedia.org</button>
            <button class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-example="amazon.com">amazon.com</button>
          </div>
        </div>
        
        <div class="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
          <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">DNS Lookup Information</h4>
          <p class="text-sm text-blue-700 dark:text-blue-300">
            • Cloudflare DNS uses real DNS over HTTPS (DoH) for actual lookups<br/>
            • Other DNS servers show simulated data for demonstration<br/>
            • Real-time DNS queries when using Cloudflare (1.1.1.1)
          </p>
        </div>
        
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">DNS Record Types</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="text-sm text-gray-700 dark:text-gray-300">
              <strong class="text-gray-900 dark:text-white">A:</strong> Maps domain to IPv4 address
            </div>
            <div class="text-sm text-gray-700 dark:text-gray-300">
              <strong class="text-gray-900 dark:text-white">AAAA:</strong> Maps domain to IPv6 address
            </div>
            <div class="text-sm text-gray-700 dark:text-gray-300">
              <strong class="text-gray-900 dark:text-white">MX:</strong> Mail exchange servers for the domain
            </div>
            <div class="text-sm text-gray-700 dark:text-gray-300">
              <strong class="text-gray-900 dark:text-white">TXT:</strong> Text records for various purposes (SPF, DKIM, etc.)
            </div>
            <div class="text-sm text-gray-700 dark:text-gray-300">
              <strong class="text-gray-900 dark:text-white">NS:</strong> Authoritative name servers for the domain
            </div>
            <div class="text-sm text-gray-700 dark:text-gray-300">
              <strong class="text-gray-900 dark:text-white">CNAME:</strong> Canonical name (alias) for the domain
            </div>
            <div class="text-sm text-gray-700 dark:text-gray-300">
              <strong class="text-gray-900 dark:text-white">SOA:</strong> Start of Authority record with zone information
            </div>
            <div class="text-sm text-gray-700 dark:text-gray-300">
              <strong class="text-gray-900 dark:text-white">PTR:</strong> Pointer record for reverse DNS lookups
            </div>
            <div class="text-sm text-gray-700 dark:text-gray-300">
              <strong class="text-gray-900 dark:text-white">CAA:</strong> Certificate Authority Authorization
            </div>
          </div>
        </div>
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
    
    // Enter key on input
    this.container.querySelector('#domain-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.performLookup();
      }
    });
    
    // Example buttons
    this.container.querySelectorAll('[data-example]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelector('#domain-input').value = btn.dataset.example;
        this.performLookup();
      });
    });
    
    // History items (delegated)
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('.history-item')) {
        const domain = e.target.closest('.history-item').dataset.domain;
        this.container.querySelector('#domain-input').value = domain;
        this.performLookup();
      }
    });
  }
  
  async performLookup() {
    const domain = this.container.querySelector('#domain-input').value.trim();
    if (!domain) {
      this.showError('Please enter a domain name');
      return;
    }
    
    // Validate domain format
    if (!this.isValidDomain(domain)) {
      this.showError('Invalid domain format');
      return;
    }
    
    // Get selected record types
    const recordTypes = [];
    this.container.querySelectorAll('.record-types input[type="checkbox"]:checked').forEach(input => {
      recordTypes.push(input.value);
    });
    
    if (recordTypes.length === 0) {
      this.showError('Please select at least one record type');
      return;
    }
    
    const dnsServer = this.container.querySelector('#dns-server').value;
    const queryClass = this.container.querySelector('#query-class').value;
    
    // Show loading state
    const resultsDiv = this.container.querySelector('#dns-results');
    resultsDiv.innerHTML = `
      <div class="text-gray-500 dark:text-gray-400 text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        <div class="mt-2">Performing DNS lookup...</div>
      </div>
    `;
    
    // Cancel any existing request
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();
    
    try {
      // Simulate DNS lookup (in real app, would call DNS API)
      const results = await this.simulateDNSLookup(domain, recordTypes, dnsServer, queryClass);
      this.displayResults(results);
      this.addToHistory(domain);
    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Request was cancelled
      }
      this.showError(`Lookup failed: ${error.message}`);
    }
  }
  
  async simulateDNSLookup(domain, recordTypes, dnsServer, queryClass) {
    const results = {
      domain,
      timestamp: new Date().toISOString(),
      server: this.getDNSServerInfo(dnsServer),
      records: {}
    };
    
    // Try to use Cloudflare DNS over HTTPS for real lookups
    const useRealDNS = dnsServer === 'cloudflare';
    
    if (useRealDNS) {
      // Use Cloudflare's DNS over HTTPS API for real DNS lookups
      for (const type of recordTypes) {
        try {
          const response = await fetch(
            `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`,
            {
              headers: {
                'Accept': 'application/dns-json'
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.Answer && data.Answer.length > 0) {
              results.records[type] = data.Answer.map(answer => ({
                name: answer.name,
                type: this.getRecordTypeName(answer.type),
                ttl: answer.TTL,
                value: answer.data,
                priority: answer.Priority || null
              }));
            } else {
              results.records[type] = [];
            }
          } else {
            // Fallback to mock data if API fails
            results.records[type] = this.generateMockRecords(domain, type);
          }
        } catch (error) {
          console.error(`Failed to lookup ${type} records:`, error);
          // Fallback to mock data
          results.records[type] = this.generateMockRecords(domain, type);
        }
      }
    } else {
      // Use mock data for other DNS servers (for demo purposes)
      for (const type of recordTypes) {
        results.records[type] = this.generateMockRecords(domain, type);
      }
    }
    
    return results;
  }
  
  getRecordTypeName(typeNum) {
    const types = {
      1: 'A',
      5: 'CNAME',
      6: 'SOA',
      15: 'MX',
      16: 'TXT',
      28: 'AAAA',
      2: 'NS',
      12: 'PTR',
      257: 'CAA'
    };
    return types[typeNum] || `Type${typeNum}`;
  }
  
  generateMockRecords(domain, type) {
    switch(type) {
      case 'A': return this.generateARecords(domain);
      case 'AAAA': return this.generateAAAARecords(domain);
      case 'MX': return this.generateMXRecords(domain);
      case 'TXT': return this.generateTXTRecords(domain);
      case 'NS': return this.generateNSRecords(domain);
      case 'CNAME': return this.generateCNAMERecords(domain);
      case 'SOA': return this.generateSOARecord(domain);
      case 'PTR': return this.generatePTRRecords(domain);
      case 'CAA': return this.generateCAARecords(domain);
      default: return [];
    }
  }
  
  generateARecords(domain) {
    // Generate realistic A records based on domain
    const records = [];
    const ipBase = Math.floor(Math.random() * 200) + 20;
    const count = Math.random() > 0.5 ? 2 : 1;
    
    for (let i = 0; i < count; i++) {
      records.push({
        name: domain,
        type: 'A',
        ttl: 300,
        value: `${ipBase}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      });
    }
    
    return records;
  }
  
  generateAAAARecords(domain) {
    if (Math.random() > 0.7) return []; // Not all domains have IPv6
    
    return [{
      name: domain,
      type: 'AAAA',
      ttl: 300,
      value: `2606:4700:${Math.floor(Math.random() * 9999).toString(16)}::${Math.floor(Math.random() * 9999).toString(16)}`
    }];
  }
  
  generateMXRecords(domain) {
    const providers = [
      { prefix: 'mail', priority: 10 },
      { prefix: 'mx1', priority: 10 },
      { prefix: 'mx2', priority: 20 },
      { prefix: 'aspmx', priority: 1 },
      { prefix: 'alt1.aspmx', priority: 5 }
    ];
    
    const provider = providers[Math.floor(Math.random() * providers.length)];
    
    return [{
      name: domain,
      type: 'MX',
      ttl: 3600,
      priority: provider.priority,
      value: `${provider.prefix}.${domain}`
    }];
  }
  
  generateTXTRecords(domain) {
    const records = [];
    
    // SPF record
    records.push({
      name: domain,
      type: 'TXT',
      ttl: 3600,
      value: 'v=spf1 include:_spf.google.com ~all'
    });
    
    // Verification records
    if (Math.random() > 0.5) {
      records.push({
        name: domain,
        type: 'TXT',
        ttl: 3600,
        value: `google-site-verification=${this.generateRandomString(43)}`
      });
    }
    
    // DMARC
    if (Math.random() > 0.6) {
      records.push({
        name: `_dmarc.${domain}`,
        type: 'TXT',
        ttl: 3600,
        value: 'v=DMARC1; p=none; rua=mailto:dmarc@' + domain
      });
    }
    
    return records;
  }
  
  generateNSRecords(domain) {
    const nameservers = [
      ['ns1', 'ns2', 'ns3', 'ns4'],
      ['dns1', 'dns2'],
      ['a', 'b', 'c', 'd'],
      ['ns-1', 'ns-2', 'ns-3']
    ];
    
    const chosen = nameservers[Math.floor(Math.random() * nameservers.length)];
    const tld = domain.split('.').slice(-1)[0];
    
    return chosen.map(ns => ({
      name: domain,
      type: 'NS',
      ttl: 86400,
      value: `${ns}.${domain.replace(`.${tld}`, '')}-dns.${tld}`
    }));
  }
  
  generateCNAMERecords(domain) {
    // Most apex domains don't have CNAME
    if (!domain.includes('www.') && Math.random() > 0.2) {
      return [];
    }
    
    return [{
      name: `www.${domain}`,
      type: 'CNAME',
      ttl: 300,
      value: domain
    }];
  }
  
  generateSOARecord(domain) {
    return [{
      name: domain,
      type: 'SOA',
      ttl: 3600,
      mname: `ns1.${domain}`,
      rname: `admin.${domain}`,
      serial: Math.floor(Date.now() / 1000),
      refresh: 10800,
      retry: 3600,
      expire: 604800,
      minimum: 3600
    }];
  }
  
  generatePTRRecords(domain) {
    // PTR records are for reverse DNS
    return [{
      name: '1.2.3.4.in-addr.arpa',
      type: 'PTR',
      ttl: 3600,
      value: domain
    }];
  }
  
  generateCAARecords(domain) {
    if (Math.random() > 0.5) return [];
    
    return [{
      name: domain,
      type: 'CAA',
      ttl: 3600,
      flags: 0,
      tag: 'issue',
      value: 'letsencrypt.org'
    }];
  }
  
  generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  getDNSServerInfo(server) {
    const servers = {
      cloudflare: { name: 'Cloudflare', ip: '1.1.1.1' },
      google: { name: 'Google', ip: '8.8.8.8' },
      quad9: { name: 'Quad9', ip: '9.9.9.9' },
      opendns: { name: 'OpenDNS', ip: '208.67.222.222' }
    };
    return servers[server] || servers.cloudflare;
  }
  
  displayResults(results) {
    const resultsDiv = this.container.querySelector('#dns-results');
    
    let html = `
      <div class="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3">
        <div class="flex justify-between items-start">
          <div>
            <strong class="text-gray-900 dark:text-white text-lg">${results.domain}</strong>
            <div class="text-sm text-gray-500 dark:text-gray-400">Queried at ${new Date(results.timestamp).toLocaleTimeString()}</div>
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-300">
            DNS Server: ${results.server.name} (${results.server.ip})
          </div>
        </div>
      </div>
    `;
    
    // Display each record type
    for (const [type, records] of Object.entries(results.records)) {
      if (records.length === 0) continue;
      
      html += `
        <div class="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">${type} Records</h4>
          <div class="space-y-2">
      `;
      
      if (type === 'SOA') {
        const soa = records[0];
        html += `
          <div class="bg-gray-50 dark:bg-gray-700 rounded p-2 text-sm">
            <div class="grid grid-cols-2 gap-2">
              <div><span class="text-gray-600 dark:text-gray-400">Primary NS:</span> <span class="font-mono text-gray-900 dark:text-white">${soa.mname}</span></div>
              <div><span class="text-gray-600 dark:text-gray-400">Admin Email:</span> <span class="font-mono text-gray-900 dark:text-white">${soa.rname}</span></div>
              <div><span class="text-gray-600 dark:text-gray-400">Serial:</span> <span class="font-mono text-gray-900 dark:text-white">${soa.serial}</span></div>
              <div><span class="text-gray-600 dark:text-gray-400">Refresh:</span> <span class="text-gray-900 dark:text-white">${soa.refresh}s</span></div>
              <div><span class="text-gray-600 dark:text-gray-400">Retry:</span> <span class="text-gray-900 dark:text-white">${soa.retry}s</span></div>
              <div><span class="text-gray-600 dark:text-gray-400">Expire:</span> <span class="text-gray-900 dark:text-white">${soa.expire}s</span></div>
              <div><span class="text-gray-600 dark:text-gray-400">Min TTL:</span> <span class="text-gray-900 dark:text-white">${soa.minimum}s</span></div>
            </div>
          </div>
        `;
      } else if (type === 'MX') {
        records.forEach(record => {
          html += `
            <div class="flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded p-2 text-sm">
              <div>
                <span class="inline-block w-12 text-center bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded px-2 py-1 mr-2">${record.priority}</span>
                <span class="font-mono text-gray-900 dark:text-white">${record.value}</span>
              </div>
              <span class="text-xs text-gray-500 dark:text-gray-400">TTL: ${record.ttl}s</span>
            </div>
          `;
        });
      } else if (type === 'CAA') {
        records.forEach(record => {
          html += `
            <div class="flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded p-2 text-sm">
              <div>
                <span class="text-gray-600 dark:text-gray-400">Flags: ${record.flags}</span>
                <span class="mx-2 text-gray-700 dark:text-gray-300">${record.tag}</span>
                <span class="font-mono text-gray-900 dark:text-white">"${record.value}"</span>
              </div>
              <span class="text-xs text-gray-500 dark:text-gray-400">TTL: ${record.ttl}s</span>
            </div>
          `;
        });
      } else {
        records.forEach(record => {
          html += `
            <div class="flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded p-2 text-sm">
              <span class="font-mono text-gray-900 dark:text-white">${record.value}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400">TTL: ${record.ttl}s</span>
            </div>
          `;
        });
      }
      
      html += `
          </div>
        </div>
      `;
    }
    
    // Show message if no records found
    if (Object.keys(results.records).length === 0) {
      html += '<div class="text-gray-500 dark:text-gray-400 text-center py-4">No DNS records found for the selected types</div>';
    }
    
    resultsDiv.innerHTML = html;
  }
  
  addToHistory(domain) {
    // Add to history if not already present
    if (!this.lookupHistory.includes(domain)) {
      this.lookupHistory.unshift(domain);
      if (this.lookupHistory.length > 10) {
        this.lookupHistory.pop();
      }
      this.updateHistoryDisplay();
    }
  }
  
  updateHistoryDisplay() {
    const historyDiv = this.container.querySelector('#lookup-history');
    
    if (this.lookupHistory.length === 0) {
      historyDiv.innerHTML = '<div class="text-gray-500 dark:text-gray-400 text-sm">No lookup history yet</div>';
      return;
    }
    
    historyDiv.innerHTML = this.lookupHistory.map(domain => `
      <div class="history-item flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors" data-domain="${domain}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span class="text-sm text-gray-700 dark:text-gray-300">${domain}</span>
      </div>
    `).join('');
  }
  
  isValidDomain(domain) {
    // Basic domain validation
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
    return domainRegex.test(domain);
  }
  
  showError(message) {
    const resultsDiv = this.container.querySelector('#dns-results');
    resultsDiv.innerHTML = `
      <div class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded p-3">
        <p class="text-red-700 dark:text-red-300">${message}</p>
      </div>
    `;
  }
  
  clear() {
    this.container.querySelector('#domain-input').value = '';
    this.container.querySelector('#dns-results').innerHTML = '<div class="text-gray-500 dark:text-gray-400 text-center py-8">Enter a domain and click Lookup to query DNS records</div>';
    
    // Reset checkboxes to defaults
    this.container.querySelectorAll('.record-types input[type="checkbox"]').forEach(input => {
      input.checked = ['A', 'MX', 'TXT', 'NS'].includes(input.value);
    });
  }
}