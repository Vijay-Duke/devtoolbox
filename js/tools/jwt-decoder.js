export class JWTDecoder {
  constructor() {
    this.container = null;
    this.inputArea = null;
    this.headerOutput = null;
    this.payloadOutput = null;
    this.signatureOutput = null;
    this.errorDisplay = null;
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
          <h1>JWT Decoder</h1>
          <p class="tool-description">Decode and inspect JWT tokens without verification</p>
        </div>
        
        <div class="tool-controls">
          <button class="btn btn-primary" data-action="decode">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
            Decode
          </button>
          <button class="btn btn-secondary" data-action="copy-header">Copy Header</button>
          <button class="btn btn-secondary" data-action="copy-payload">Copy Payload</button>
          <button class="btn btn-secondary" data-action="clear">Clear</button>
        </div>
        
        <div class="error-display" data-error hidden></div>
        
        <div class="tool-content">
          <div class="input-section" style="grid-column: 1 / -1;">
            <label for="jwt-input">JWT Token</label>
            <textarea 
              id="jwt-input" 
              class="code-input" 
              placeholder="Paste your JWT token here..."
              spellcheck="false"
              style="min-height: 150px;"
            >eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c</textarea>
          </div>
        </div>
        
        <div class="jwt-parts">
          <div class="jwt-part">
            <h3 class="jwt-part-title">Header</h3>
            <pre id="jwt-header" class="code-output"></pre>
          </div>
          
          <div class="jwt-part">
            <h3 class="jwt-part-title">Payload</h3>
            <pre id="jwt-payload" class="code-output"></pre>
            <div class="jwt-claims" id="jwt-claims"></div>
          </div>
          
          <div class="jwt-part">
            <h3 class="jwt-part-title">Signature</h3>
            <pre id="jwt-signature" class="code-output" style="word-break: break-all;"></pre>
          </div>
        </div>
      </div>
    `;
    
    this.inputArea = this.container.querySelector('#jwt-input');
    this.headerOutput = this.container.querySelector('#jwt-header');
    this.payloadOutput = this.container.querySelector('#jwt-payload');
    this.signatureOutput = this.container.querySelector('#jwt-signature');
    this.errorDisplay = this.container.querySelector('[data-error]');
  }
  
  attachEventListeners() {
    this.container.querySelector('[data-action="decode"]').addEventListener('click', () => this.decode());
    this.container.querySelector('[data-action="copy-header"]').addEventListener('click', () => this.copyPart('header'));
    this.container.querySelector('[data-action="copy-payload"]').addEventListener('click', () => this.copyPart('payload'));
    this.container.querySelector('[data-action="clear"]').addEventListener('click', () => this.clear());
    
    this.inputArea.addEventListener('input', () => {
      this.clearError();
    });
    
    // Auto-decode on paste
    this.inputArea.addEventListener('paste', (e) => {
      setTimeout(() => this.decode(), 10);
    });
    
    // Decode initial token if present
    if (this.inputArea.value.trim()) {
      this.decode();
    }
  }
  
  decode() {
    const token = this.inputArea.value.trim();
    if (!token) {
      this.showError('Please enter a JWT token');
      return;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      this.showError('Invalid JWT format. Expected 3 parts separated by dots.');
      return;
    }
    
    try {
      // Decode header
      const header = this.base64UrlDecode(parts[0]);
      const headerJson = JSON.parse(header);
      this.displayJson(this.headerOutput, headerJson);
      
      // Decode payload
      const payload = this.base64UrlDecode(parts[1]);
      const payloadJson = JSON.parse(payload);
      this.displayJson(this.payloadOutput, payloadJson);
      this.displayClaims(payloadJson);
      
      // Display signature
      this.signatureOutput.textContent = parts[2];
      
      this.clearError();
    } catch (error) {
      this.showError(`Failed to decode JWT: ${error.message}`);
      this.clearOutputs();
    }
  }
  
  base64UrlDecode(str) {
    // Replace URL-safe characters
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    
    // Pad with = if necessary
    const pad = str.length % 4;
    if (pad) {
      if (pad === 1) {
        throw new Error('Invalid base64 string');
      }
      str += new Array(5 - pad).join('=');
    }
    
    // Decode base64
    const decoded = atob(str);
    
    // Handle UTF-8 decoding
    try {
      return decodeURIComponent(decoded.split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
    } catch (e) {
      return decoded;
    }
  }
  
  displayJson(element, obj) {
    const json = JSON.stringify(obj, null, 2);
    const highlighted = json
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-key';
          } else {
            cls = 'json-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
      });
    element.innerHTML = highlighted;
  }
  
  displayClaims(payload) {
    const claimsContainer = this.container.querySelector('#jwt-claims');
    const standardClaims = {
      iss: 'Issuer',
      sub: 'Subject',
      aud: 'Audience',
      exp: 'Expiration Time',
      nbf: 'Not Before',
      iat: 'Issued At',
      jti: 'JWT ID'
    };
    
    const claims = [];
    
    for (const [key, label] of Object.entries(standardClaims)) {
      if (key in payload) {
        let value = payload[key];
        
        // Convert timestamps to readable dates
        if (['exp', 'nbf', 'iat'].includes(key) && typeof value === 'number') {
          const date = new Date(value * 1000);
          value = `${value} (${date.toISOString()})`;
        }
        
        claims.push(`
          <div class="claim-item">
            <span class="claim-label">${label}:</span>
            <span class="claim-value">${value}</span>
          </div>
        `);
      }
    }
    
    // Check token expiration
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < now;
      claims.push(`
        <div class="claim-item">
          <span class="claim-label">Status:</span>
          <span class="claim-value ${isExpired ? 'expired' : 'valid'}">
            ${isExpired ? '❌ Expired' : '✅ Valid'}
          </span>
        </div>
      `);
    }
    
    claimsContainer.innerHTML = claims.length > 0 
      ? `<div class="claims-grid">${claims.join('')}</div>`
      : '';
  }
  
  copyPart(part) {
    let content = '';
    let button = null;
    
    switch(part) {
      case 'header':
        content = this.headerOutput.textContent;
        button = this.container.querySelector('[data-action="copy-header"]');
        break;
      case 'payload':
        content = this.payloadOutput.textContent;
        button = this.container.querySelector('[data-action="copy-payload"]');
        break;
    }
    
    if (!content) {
      this.showError('Nothing to copy');
      return;
    }
    
    navigator.clipboard.writeText(content).then(() => {
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      button.classList.add('btn-success');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('btn-success');
      }, 2000);
    });
  }
  
  clear() {
    this.inputArea.value = '';
    this.clearOutputs();
    this.clearError();
  }
  
  clearOutputs() {
    this.headerOutput.textContent = '';
    this.payloadOutput.textContent = '';
    this.signatureOutput.textContent = '';
    this.container.querySelector('#jwt-claims').innerHTML = '';
  }
  
  showError(message) {
    this.errorDisplay.textContent = message;
    this.errorDisplay.hidden = false;
  }
  
  clearError() {
    this.errorDisplay.textContent = '';
    this.errorDisplay.hidden = true;
  }
}