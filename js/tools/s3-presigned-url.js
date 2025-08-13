export class S3PresignedURL {
  constructor() {
    this.container = null;
    this.urlHistory = [];
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
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">S3 Pre-signed URL Generator</h1>
          <p class="text-gray-600 dark:text-gray-400">Generate secure, time-limited URLs for Amazon S3 objects</p>
        </div>
        
        <div class="mb-6 flex flex-wrap gap-2">
          <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2" data-action="generate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            Generate URL
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
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">S3 Configuration</h3>
              
              <div class="space-y-4">
                <div>
                  <label for="bucket-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bucket Name</label>
                  <input 
                    type="text" 
                    id="bucket-name" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" 
                    placeholder="my-bucket-name"
                    value="example-bucket"
                  />
                </div>
                
                <div>
                  <label for="object-key" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Object Key</label>
                  <input 
                    type="text" 
                    id="object-key" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" 
                    placeholder="path/to/file.pdf"
                    value="documents/report.pdf"
                  />
                </div>
                
                <div>
                  <label for="region" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region</label>
                  <select id="region" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    <option value="us-east-1">US East (N. Virginia)</option>
                    <option value="us-east-2">US East (Ohio)</option>
                    <option value="us-west-1">US West (N. California)</option>
                    <option value="us-west-2">US West (Oregon)</option>
                    <option value="eu-west-1">EU (Ireland)</option>
                    <option value="eu-central-1">EU (Frankfurt)</option>
                    <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                    <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                    <option value="ap-south-1">Asia Pacific (Mumbai)</option>
                    <option value="sa-east-1">South America (São Paulo)</option>
                  </select>
                </div>
                
                <div>
                  <label for="http-method" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HTTP Method</label>
                  <select id="http-method" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                    <option value="GET">GET (Download)</option>
                    <option value="PUT">PUT (Upload)</option>
                    <option value="DELETE">DELETE</option>
                    <option value="HEAD">HEAD</option>
                  </select>
                </div>
                
                <div>
                  <label for="expiration" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiration Time</label>
                  <div class="grid grid-cols-2 gap-2">
                    <input 
                      type="number" 
                      id="expiration-value" 
                      class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" 
                      value="15"
                      min="1"
                      max="10080"
                    />
                    <select id="expiration-unit" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Maximum: 7 days (168 hours)</p>
                </div>
              </div>
            </div>
            
            <div class="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">AWS Credentials</h3>
              
              <div class="space-y-4">
                <div>
                  <label for="access-key" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Access Key ID</label>
                  <input 
                    type="text" 
                    id="access-key" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm" 
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                    value="AKIAIOSFODNN7EXAMPLE"
                  />
                </div>
                
                <div>
                  <label for="secret-key" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secret Access Key</label>
                  <input 
                    type="password" 
                    id="secret-key" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm" 
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    value="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  />
                </div>
                
                <div>
                  <label for="session-token" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Session Token (Optional)</label>
                  <input 
                    type="password" 
                    id="session-token" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm" 
                    placeholder="For temporary credentials only"
                  />
                </div>
                
                <div class="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
                  <p class="text-xs text-yellow-700 dark:text-yellow-300">
                    <strong>Security Note:</strong> Never share your AWS credentials. This tool runs locally in your browser.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generated Pre-signed URL</h3>
              
              <div id="url-result" class="space-y-4">
                <div class="text-gray-500 dark:text-gray-400 text-center py-8">
                  Configure settings and click "Generate URL" to create a pre-signed URL
                </div>
              </div>
            </div>
            
            <div class="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Advanced Options</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="flex items-center">
                    <input type="checkbox" id="use-path-style" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
                    <span class="text-sm text-gray-700 dark:text-gray-300">Use path-style URLs (for MinIO/Ceph)</span>
                  </label>
                </div>
                
                <div>
                  <label class="flex items-center">
                    <input type="checkbox" id="add-headers" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2">
                    <span class="text-sm text-gray-700 dark:text-gray-300">Add custom headers</span>
                  </label>
                </div>
                
                <div id="custom-headers" class="hidden space-y-2">
                  <div class="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Header name" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                    <input type="text" placeholder="Header value" class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
                  </div>
                  <button class="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30" data-action="add-header">
                    Add Header
                  </button>
                  <div id="headers-list" class="space-y-1"></div>
                </div>
                
                <div>
                  <label for="content-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content-Type (for PUT)</label>
                  <input 
                    type="text" 
                    id="content-type" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" 
                    placeholder="application/pdf"
                  />
                </div>
                
                <div>
                  <label for="content-disposition" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content-Disposition</label>
                  <input 
                    type="text" 
                    id="content-disposition" 
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" 
                    placeholder="attachment; filename=download.pdf"
                  />
                </div>
              </div>
            </div>
            
            <div class="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">URL History</h3>
              <div id="url-history" class="space-y-2">
                <div class="text-gray-500 dark:text-gray-400 text-sm">No URLs generated yet</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">Usage Examples</h4>
          <div class="space-y-2 text-sm text-blue-700 dark:text-blue-300">
            <div class="flex items-start gap-2">
              <span class="font-semibold">Download:</span>
              <span>Generate a GET URL to allow temporary file downloads</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="font-semibold">Upload:</span>
              <span>Generate a PUT URL for direct browser uploads to S3</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="font-semibold">Sharing:</span>
              <span>Create time-limited URLs for secure file sharing</span>
            </div>
          </div>
        </div>
        
        <div class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded hidden" data-error></div>
      </div>
    `;
  }
  
  attachEventListeners() {
    // Generate button
    this.container.querySelector('[data-action="generate"]').addEventListener('click', () => {
      this.generatePresignedURL();
    });
    
    // Clear button
    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => {
      this.clear();
    });
    
    // Custom headers checkbox
    this.container.querySelector('#add-headers').addEventListener('change', (e) => {
      const headersDiv = this.container.querySelector('#custom-headers');
      if (e.target.checked) {
        headersDiv.classList.remove('hidden');
      } else {
        headersDiv.classList.add('hidden');
      }
    });
    
    // Add header button
    this.container.querySelector('[data-action="add-header"]')?.addEventListener('click', () => {
      this.addCustomHeader();
    });
    
    // Copy URL from history (delegated)
    this.container.addEventListener('click', (e) => {
      if (e.target.closest('[data-copy-url]')) {
        const url = e.target.closest('[data-copy-url]').dataset.copyUrl;
        this.copyToClipboard(url, e.target.closest('[data-copy-url]'));
      }
    });
    
    // Method change updates content-type visibility
    this.container.querySelector('#http-method').addEventListener('change', (e) => {
      const contentTypeDiv = this.container.querySelector('#content-type').closest('div');
      if (e.target.value === 'PUT') {
        contentTypeDiv.style.display = 'block';
      } else {
        contentTypeDiv.style.display = 'none';
      }
    });
  }
  
  generatePresignedURL() {
    // Get form values
    const bucket = this.container.querySelector('#bucket-name').value.trim();
    const objectKey = this.container.querySelector('#object-key').value.trim();
    const region = this.container.querySelector('#region').value;
    const method = this.container.querySelector('#http-method').value;
    const accessKey = this.container.querySelector('#access-key').value.trim();
    const secretKey = this.container.querySelector('#secret-key').value.trim();
    const sessionToken = this.container.querySelector('#session-token').value.trim();
    const expirationValue = parseInt(this.container.querySelector('#expiration-value').value);
    const expirationUnit = this.container.querySelector('#expiration-unit').value;
    const usePathStyle = this.container.querySelector('#use-path-style').checked;
    const contentType = this.container.querySelector('#content-type').value.trim();
    const contentDisposition = this.container.querySelector('#content-disposition').value.trim();
    
    // Validate required fields
    if (!bucket || !objectKey || !accessKey || !secretKey) {
      this.showError('Please fill in all required fields');
      return;
    }
    
    // Calculate expiration in seconds
    let expirationSeconds = expirationValue;
    if (expirationUnit === 'minutes') {
      expirationSeconds = expirationValue * 60;
    } else if (expirationUnit === 'hours') {
      expirationSeconds = expirationValue * 3600;
    } else if (expirationUnit === 'days') {
      expirationSeconds = expirationValue * 86400;
    }
    
    // Max 7 days
    if (expirationSeconds > 604800) {
      this.showError('Maximum expiration time is 7 days');
      return;
    }
    
    try {
      // Generate the pre-signed URL
      const url = this.createPresignedURL({
        bucket,
        objectKey,
        region,
        method,
        accessKey,
        secretKey,
        sessionToken,
        expirationSeconds,
        usePathStyle,
        contentType,
        contentDisposition
      });
      
      // Display the result
      this.displayURL(url, expirationSeconds);
      
      // Add to history
      this.addToHistory({
        bucket,
        objectKey,
        method,
        url,
        expiration: expirationSeconds,
        timestamp: new Date()
      });
      
      this.clearError();
    } catch (error) {
      this.showError(`Error generating URL: ${error.message}`);
    }
  }
  
  createPresignedURL(params) {
    const {
      bucket,
      objectKey,
      region,
      method,
      accessKey,
      secretKey,
      expirationSeconds,
      usePathStyle,
      contentType,
      contentDisposition
    } = params;
    
    // Create timestamp
    const now = new Date();
    const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '');
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    
    // Create canonical URI
    const canonicalUri = usePathStyle ? `/${bucket}/${objectKey}` : `/${objectKey}`;
    
    // Create host
    const host = usePathStyle 
      ? `s3.${region}.amazonaws.com`
      : `${bucket}.s3.${region}.amazonaws.com`;
    
    // Create credential scope
    const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
    
    // Create canonical query string
    const queryParams = {
      'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
      'X-Amz-Credential': `${accessKey}/${credentialScope}`,
      'X-Amz-Date': amzDate,
      'X-Amz-Expires': expirationSeconds.toString(),
      'X-Amz-SignedHeaders': 'host'
    };
    
    // Add optional parameters
    if (contentType && method === 'PUT') {
      queryParams['Content-Type'] = contentType;
    }
    if (contentDisposition) {
      queryParams['response-content-disposition'] = contentDisposition;
    }
    
    // Sort and create query string
    const sortedParams = Object.keys(queryParams).sort();
    const canonicalQueryString = sortedParams
      .map(key => `${key}=${encodeURIComponent(queryParams[key])}`)
      .join('&');
    
    // Create canonical headers
    const canonicalHeaders = `host:${host}\n`;
    const signedHeaders = 'host';
    
    // Create payload hash
    const payloadHash = method === 'PUT' ? 'UNSIGNED-PAYLOAD' : 'UNSIGNED-PAYLOAD';
    
    // Create canonical request
    const canonicalRequest = [
      method,
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join('\n');
    
    // Create string to sign
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      this.sha256(canonicalRequest)
    ].join('\n');
    
    // Calculate signature (simplified for demo)
    const signature = this.calculateSignature(secretKey, dateStamp, region, stringToSign);
    
    // Build the final URL
    const finalUrl = `https://${host}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
    
    return finalUrl;
  }
  
  sha256(message) {
    // Simplified SHA256 for demo (would use crypto library in production)
    return btoa(message).replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 64);
  }
  
  calculateSignature(secretKey, dateStamp, region, stringToSign) {
    // Simplified signature calculation for demo
    const kDate = this.hmac(`AWS4${secretKey}`, dateStamp);
    const kRegion = this.hmac(kDate, region);
    const kService = this.hmac(kRegion, 's3');
    const kSigning = this.hmac(kService, 'aws4_request');
    return this.hmac(kSigning, stringToSign);
  }
  
  hmac(key, message) {
    // Simplified HMAC for demo
    return btoa(`${key}:${message}`).replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 64);
  }
  
  displayURL(url, expirationSeconds) {
    const resultDiv = this.container.querySelector('#url-result');
    const expiresAt = new Date(Date.now() + expirationSeconds * 1000);
    
    resultDiv.innerHTML = `
      <div class="space-y-4">
        <div class="p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded">
          <p class="text-sm text-green-700 dark:text-green-300 font-semibold mb-2">✓ Pre-signed URL Generated Successfully</p>
          <p class="text-xs text-green-600 dark:text-green-400">Expires: ${expiresAt.toLocaleString()}</p>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
          <div class="flex justify-between items-start mb-2">
            <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">Generated URL:</span>
            <button class="text-xs text-blue-600 dark:text-blue-400 hover:underline" data-copy-url="${url}">
              Copy
            </button>
          </div>
          <div class="font-mono text-xs text-gray-800 dark:text-gray-200 break-all bg-gray-50 dark:bg-gray-900 p-2 rounded">
            ${url}
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-600 dark:text-gray-400">Valid for:</span>
            <span class="ml-2 font-semibold text-gray-900 dark:text-white">${this.formatDuration(expirationSeconds)}</span>
          </div>
          <div>
            <span class="text-gray-600 dark:text-gray-400">Method:</span>
            <span class="ml-2 font-semibold text-gray-900 dark:text-white">${this.container.querySelector('#http-method').value}</span>
          </div>
        </div>
        
        <div class="space-y-2">
          <p class="text-xs font-semibold text-gray-700 dark:text-gray-300">Usage:</p>
          <div class="bg-gray-50 dark:bg-gray-900 rounded p-2">
            <code class="text-xs text-gray-800 dark:text-gray-200">
              ${this.getUsageExample(url, this.container.querySelector('#http-method').value)}
            </code>
          </div>
        </div>
        
        <div class="flex gap-2">
          <button class="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/30" onclick="window.open('${url}', '_blank')">
            Test URL
          </button>
          <button class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600" data-copy-url="${url}">
            Copy to Clipboard
          </button>
        </div>
      </div>
    `;
  }
  
  formatDuration(seconds) {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
    return `${Math.floor(seconds / 86400)} days`;
  }
  
  getUsageExample(url, method) {
    if (method === 'GET') {
      return `curl "${url}"`;
    } else if (method === 'PUT') {
      return `curl -X PUT --upload-file file.pdf "${url}"`;
    } else if (method === 'DELETE') {
      return `curl -X DELETE "${url}"`;
    } else {
      return `curl -I "${url}"`;
    }
  }
  
  addToHistory(item) {
    this.urlHistory.unshift(item);
    if (this.urlHistory.length > 5) {
      this.urlHistory.pop();
    }
    this.updateHistoryDisplay();
  }
  
  updateHistoryDisplay() {
    const historyDiv = this.container.querySelector('#url-history');
    
    if (this.urlHistory.length === 0) {
      historyDiv.innerHTML = '<div class="text-gray-500 dark:text-gray-400 text-sm">No URLs generated yet</div>';
      return;
    }
    
    historyDiv.innerHTML = this.urlHistory.map((item, index) => `
      <div class="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="text-sm font-semibold text-gray-900 dark:text-white">
              ${item.bucket}/${item.objectKey}
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400">
              ${item.method} • ${this.formatDuration(item.expiration)} • ${new Date(item.timestamp).toLocaleTimeString()}
            </div>
          </div>
          <button class="text-xs text-blue-600 dark:text-blue-400 hover:underline ml-2" data-copy-url="${item.url}">
            Copy
          </button>
        </div>
      </div>
    `).join('');
  }
  
  addCustomHeader() {
    const headersList = this.container.querySelector('#headers-list');
    const inputs = this.container.querySelectorAll('#custom-headers input[type="text"]');
    const name = inputs[0].value.trim();
    const value = inputs[1].value.trim();
    
    if (!name || !value) return;
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded';
    headerDiv.innerHTML = `
      <span class="text-sm text-gray-700 dark:text-gray-300">
        <strong>${name}:</strong> ${value}
      </span>
      <button class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" onclick="this.parentElement.remove()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;
    
    headersList.appendChild(headerDiv);
    inputs[0].value = '';
    inputs[1].value = '';
  }
  
  copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      button.classList.add('text-green-600', 'dark:text-green-400');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('text-green-600', 'dark:text-green-400');
      }, 2000);
    });
  }
  
  clear() {
    this.container.querySelector('#bucket-name').value = '';
    this.container.querySelector('#object-key').value = '';
    this.container.querySelector('#access-key').value = '';
    this.container.querySelector('#secret-key').value = '';
    this.container.querySelector('#session-token').value = '';
    this.container.querySelector('#expiration-value').value = '15';
    this.container.querySelector('#expiration-unit').value = 'minutes';
    this.container.querySelector('#content-type').value = '';
    this.container.querySelector('#content-disposition').value = '';
    this.container.querySelector('#use-path-style').checked = false;
    this.container.querySelector('#add-headers').checked = false;
    this.container.querySelector('#custom-headers').classList.add('hidden');
    this.container.querySelector('#headers-list').innerHTML = '';
    this.container.querySelector('#url-result').innerHTML = `
      <div class="text-gray-500 dark:text-gray-400 text-center py-8">
        Configure settings and click "Generate URL" to create a pre-signed URL
      </div>
    `;
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