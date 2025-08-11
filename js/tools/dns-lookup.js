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
      <div class="tool-container">
        <div class="tool-header">
          <h1>DNS Lookup</h1>
          <p class="tool-description">Query DNS records for domains including A, AAAA, MX, TXT, NS, and more</p>
        </div>
        
        <div class="tool-controls">
          <button class="btn btn-primary" data-action="lookup">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            Lookup
          </button>
          <button class="btn btn-secondary" data-action="clear">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear
          </button>
        </div>
        
        <div class="dns-container">
          <div class="lookup-section">
            <div class="form-group">
              <label for="domain-input">Domain Name</label>
              <input 
                type="text" 
                id="domain-input" 
                class="form-input" 
                placeholder="example.com"
                value="example.com"
                autocomplete="off"
                spellcheck="false"
              />
            </div>
            
            <div class="form-group">
              <label>Record Types</label>
              <div class="record-types">
                <label class="checkbox-label">
                  <input type="checkbox" value="A" checked>
                  <span>A (IPv4)</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" value="AAAA">
                  <span>AAAA (IPv6)</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" value="MX" checked>
                  <span>MX (Mail)</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" value="TXT" checked>
                  <span>TXT</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" value="NS" checked>
                  <span>NS (Name Server)</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" value="CNAME">
                  <span>CNAME</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" value="SOA">
                  <span>SOA</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" value="PTR">
                  <span>PTR</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" value="CAA">
                  <span>CAA</span>
                </label>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="dns-server">DNS Server</label>
                <select id="dns-server" class="form-select">
                  <option value="cloudflare">Cloudflare (1.1.1.1)</option>
                  <option value="google">Google (8.8.8.8)</option>
                  <option value="quad9">Quad9 (9.9.9.9)</option>
                  <option value="opendns">OpenDNS (208.67.222.222)</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="query-class">Query Class</label>
                <select id="query-class" class="form-select">
                  <option value="IN">IN (Internet)</option>
                  <option value="CH">CH (Chaos)</option>
                  <option value="HS">HS (Hesiod)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="results-section">
            <h3>DNS Records</h3>
            <div id="dns-results" class="dns-results">
              <div class="placeholder-message">Enter a domain and click Lookup to query DNS records</div>
            </div>
          </div>
          
          <div class="history-section">
            <h3>Lookup History</h3>
            <div id="lookup-history" class="lookup-history"></div>
          </div>
        </div>
        
        <div class="examples-section">
          <h3>Quick Examples</h3>
          <div class="examples-grid">
            <button class="example-btn" data-example="google.com">google.com</button>
            <button class="example-btn" data-example="github.com">github.com</button>
            <button class="example-btn" data-example="cloudflare.com">cloudflare.com</button>
            <button class="example-btn" data-example="stackoverflow.com">stackoverflow.com</button>
            <button class="example-btn" data-example="wikipedia.org">wikipedia.org</button>
            <button class="example-btn" data-example="amazon.com">amazon.com</button>
          </div>
        </div>
        
        <div class="info-section">
          <h3>DNS Record Types</h3>
          <div class="dns-info">
            <div class="info-item">
              <strong>A:</strong> Maps domain to IPv4 address
            </div>
            <div class="info-item">
              <strong>AAAA:</strong> Maps domain to IPv6 address
            </div>
            <div class="info-item">
              <strong>MX:</strong> Mail exchange servers for the domain
            </div>
            <div class="info-item">
              <strong>TXT:</strong> Text records for various purposes (SPF, DKIM, etc.)
            </div>
            <div class="info-item">
              <strong>NS:</strong> Authoritative name servers for the domain
            </div>
            <div class="info-item">
              <strong>CNAME:</strong> Canonical name (alias) for the domain
            </div>
            <div class="info-item">
              <strong>SOA:</strong> Start of Authority record with zone information
            </div>
            <div class="info-item">
              <strong>PTR:</strong> Pointer record for reverse DNS lookups
            </div>
            <div class="info-item">
              <strong>CAA:</strong> Certificate Authority Authorization
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
    this.container.querySelectorAll('.record-types input:checked').forEach(input => {
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
    resultsDiv.innerHTML = '<div class="loading">Performing DNS lookup...</div>';
    
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
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate mock DNS records based on domain
    const results = {
      domain,
      timestamp: new Date().toISOString(),
      server: this.getDNSServerInfo(dnsServer),
      records: {}
    };
    
    // Generate appropriate mock data for each record type
    if (recordTypes.includes('A')) {
      results.records.A = this.generateARecords(domain);
    }
    
    if (recordTypes.includes('AAAA')) {
      results.records.AAAA = this.generateAAAARecords(domain);
    }
    
    if (recordTypes.includes('MX')) {
      results.records.MX = this.generateMXRecords(domain);
    }
    
    if (recordTypes.includes('TXT')) {
      results.records.TXT = this.generateTXTRecords(domain);
    }
    
    if (recordTypes.includes('NS')) {
      results.records.NS = this.generateNSRecords(domain);
    }
    
    if (recordTypes.includes('CNAME')) {
      results.records.CNAME = this.generateCNAMERecords(domain);
    }
    
    if (recordTypes.includes('SOA')) {
      results.records.SOA = this.generateSOARecord(domain);
    }
    
    if (recordTypes.includes('PTR')) {
      results.records.PTR = this.generatePTRRecords(domain);
    }
    
    if (recordTypes.includes('CAA')) {
      results.records.CAA = this.generateCAARecords(domain);
    }
    
    return results;
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
      <div class="results-header">
        <div class="domain-info">
          <strong>${results.domain}</strong>
          <span class="timestamp">Queried at ${new Date(results.timestamp).toLocaleTimeString()}</span>
        </div>
        <div class="server-info">
          DNS Server: ${results.server.name} (${results.server.ip})
        </div>
      </div>
    `;
    
    // Display each record type
    for (const [type, records] of Object.entries(results.records)) {
      if (records.length === 0) continue;
      
      html += `
        <div class="record-section">
          <h4 class="record-type">${type} Records</h4>
          <div class="records-list">
      `;
      
      if (type === 'SOA') {
        const soa = records[0];
        html += `
          <div class="record-item soa-record">
            <div class="record-row">
              <span class="record-label">Primary NS:</span>
              <span class="record-value">${soa.mname}</span>
            </div>
            <div class="record-row">
              <span class="record-label">Admin Email:</span>
              <span class="record-value">${soa.rname}</span>
            </div>
            <div class="record-row">
              <span class="record-label">Serial:</span>
              <span class="record-value">${soa.serial}</span>
            </div>
            <div class="record-row">
              <span class="record-label">Refresh:</span>
              <span class="record-value">${soa.refresh}s</span>
            </div>
            <div class="record-row">
              <span class="record-label">Retry:</span>
              <span class="record-value">${soa.retry}s</span>
            </div>
            <div class="record-row">
              <span class="record-label">Expire:</span>
              <span class="record-value">${soa.expire}s</span>
            </div>
            <div class="record-row">
              <span class="record-label">Minimum TTL:</span>
              <span class="record-value">${soa.minimum}s</span>
            </div>
          </div>
        `;
      } else if (type === 'MX') {
        records.forEach(record => {
          html += `
            <div class="record-item">
              <span class="record-priority">${record.priority}</span>
              <span class="record-value">${record.value}</span>
              <span class="record-ttl">TTL: ${record.ttl}s</span>
            </div>
          `;
        });
      } else if (type === 'CAA') {
        records.forEach(record => {
          html += `
            <div class="record-item">
              <span class="record-flags">Flags: ${record.flags}</span>
              <span class="record-tag">${record.tag}</span>
              <span class="record-value">"${record.value}"</span>
              <span class="record-ttl">TTL: ${record.ttl}s</span>
            </div>
          `;
        });
      } else {
        records.forEach(record => {
          html += `
            <div class="record-item">
              <span class="record-value">${record.value}</span>
              <span class="record-ttl">TTL: ${record.ttl}s</span>
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
      html += '<div class="no-records">No DNS records found for the selected types</div>';
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
      historyDiv.innerHTML = '<div class="placeholder-message">No lookup history yet</div>';
      return;
    }
    
    historyDiv.innerHTML = this.lookupHistory.map(domain => `
      <div class="history-item" data-domain="${domain}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>${domain}</span>
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
    resultsDiv.innerHTML = `<div class="error-message">${message}</div>`;
  }
  
  clear() {
    this.container.querySelector('#domain-input').value = '';
    this.container.querySelector('#dns-results').innerHTML = '<div class="placeholder-message">Enter a domain and click Lookup to query DNS records</div>';
    
    // Reset checkboxes to defaults
    this.container.querySelectorAll('.record-types input').forEach(input => {
      input.checked = ['A', 'MX', 'TXT', 'NS'].includes(input.value);
    });
  }
}