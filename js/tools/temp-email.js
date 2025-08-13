import { ToolTemplate } from './tool-template.js';

export class TempEmailTool extends ToolTemplate {
  constructor() {
    super();
    this.config = {
      name: 'Temporary Email',
      description: 'Generate temporary email addresses and receive emails in real-time. Perfect for testing OTPs and email flows.',
      version: '1.0.0',
      author: 'DevToolbox',
      category: 'Developer Tools',
      keywords: ['email', 'temp', 'otp', 'disposable', 'inbox', 'testing']
    };
    
    this.state = {
      currentInbox: null,
      emails: [],
      filters: {
        search: '',
        regex: '',
        sender: '',
        showOTPOnly: false
      },
      serverUrl: 'http://localhost:3001'
    };
    
    this.eventSource = null;
    this.isConnected = false;
  }

  render() {
    this.container.innerHTML = `
      <div class="temp-email-tool">
        <!-- Header -->
        <div class="tool-header mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">${this.config.name}</h1>
          <p class="text-gray-600 dark:text-gray-400">${this.config.description}</p>
        </div>

        <!-- Server Status -->
        <div id="server-status" class="mb-4 p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 hidden">
          <div class="flex items-center">
            <div class="status-indicator w-3 h-3 rounded-full mr-2"></div>
            <span class="status-text text-sm font-medium"></span>
          </div>
        </div>

        <!-- Inbox Section -->
        <div class="inbox-section mb-6">
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <button 
              id="generate-inbox-btn" 
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Generate New Inbox
            </button>
            
            <button 
              id="simulate-email-btn" 
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              Simulate Email
            </button>
            
            <button 
              id="clear-emails-btn" 
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              Clear Inbox
            </button>
          </div>

          <!-- Current Inbox Info -->
          <div id="current-inbox" class="hidden p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <div class="flex items-center justify-between">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Email Address:</label>
                <div class="flex items-center gap-2">
                  <code id="inbox-email" class="text-lg font-mono bg-white dark:bg-gray-900 px-3 py-1 rounded border text-blue-600 dark:text-blue-400"></code>
                  <button 
                    id="copy-email-btn" 
                    class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    title="Copy email address"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-500 dark:text-gray-400">Connection Status:</div>
                <div class="flex items-center">
                  <div id="connection-indicator" class="w-2 h-2 rounded-full mr-2 bg-gray-400"></div>
                  <span id="connection-status" class="text-sm font-medium">Disconnected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters Section -->
        <div id="filters-section" class="hidden mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
              <input 
                type="text" 
                id="search-filter"
                placeholder="Search in subject/body..."
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sender Filter</label>
              <input 
                type="text" 
                id="sender-filter"
                placeholder="Filter by sender..."
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Regex Pattern</label>
              <input 
                type="text" 
                id="regex-filter"
                placeholder="Regex pattern..."
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div class="flex items-end">
              <label class="flex items-center">
                <input 
                  type="checkbox" 
                  id="otp-only-filter"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">OTP emails only</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Email Count -->
        <div id="email-stats" class="hidden mb-4 text-sm text-gray-600 dark:text-gray-400">
          <span id="email-count">0 emails</span> • <span id="filtered-count">0 visible</span>
        </div>

        <!-- Emails List -->
        <div id="emails-container" class="hidden">
          <div id="emails-list" class="space-y-3"></div>
          
          <!-- Empty State -->
          <div id="empty-state" class="text-center py-12 text-gray-500 dark:text-gray-400">
            <div class="text-4xl mb-4">📧</div>
            <h3 class="text-lg font-medium mb-2">No emails yet</h3>
            <p>Emails will appear here in real-time when they arrive.</p>
            <p class="text-sm mt-2">Try clicking "Simulate Email" to test the functionality.</p>
          </div>
        </div>

        <!-- Server Connection Error -->
        <div id="server-error" class="hidden p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
            <div>
              <h4 class="font-medium text-red-800 dark:text-red-200">Server Connection Failed</h4>
              <p class="text-sm text-red-600 dark:text-red-300 mt-1">
                Please make sure the email server is running on <code>http://localhost:3001</code>
                <br>
                Run: <code class="font-mono bg-red-100 dark:bg-red-800 px-1 rounded">cd server && npm run dev</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Generate inbox button
    const generateBtn = this.container.querySelector('#generate-inbox-btn');
    generateBtn.addEventListener('click', () => this.generateInbox());

    // Simulate email button
    const simulateBtn = this.container.querySelector('#simulate-email-btn');
    simulateBtn.addEventListener('click', () => this.simulateEmail());

    // Clear emails button
    const clearBtn = this.container.querySelector('#clear-emails-btn');
    clearBtn.addEventListener('click', () => this.clearEmails());

    // Copy email button
    const copyBtn = this.container.querySelector('#copy-email-btn');
    copyBtn.addEventListener('click', () => this.copyEmailAddress());

    // Filter inputs
    const searchFilter = this.container.querySelector('#search-filter');
    const senderFilter = this.container.querySelector('#sender-filter');
    const regexFilter = this.container.querySelector('#regex-filter');
    const otpFilter = this.container.querySelector('#otp-only-filter');

    const updateFilters = this.debounce(() => this.updateFilters(), 300);
    
    searchFilter.addEventListener('input', updateFilters);
    senderFilter.addEventListener('input', updateFilters);
    regexFilter.addEventListener('input', updateFilters);
    otpFilter.addEventListener('change', updateFilters);
  }

  async generateInbox() {
    try {
      const response = await fetch(`${this.state.serverUrl}/api/inbox/generate`);
      
      if (!response.ok) {
        throw new Error('Failed to connect to server');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Cleanup existing connection
        this.disconnect();
        
        this.state.currentInbox = data.data;
        this.state.emails = [];
        
        this.showInboxInfo();
        this.connectToSSE();
        this.enableButtons();
        this.hideServerError();
        this.showNotification('New inbox created successfully!');
        
        this.saveState();
      } else {
        throw new Error('Failed to create inbox');
      }
    } catch (error) {
      console.error('Error generating inbox:', error);
      this.showServerError();
      this.showNotification('Failed to generate inbox. Check if server is running.', 'error');
    }
  }

  async simulateEmail() {
    if (!this.state.currentInbox) return;
    
    try {
      const response = await fetch(`${this.state.serverUrl}/api/emails/${this.state.currentInbox.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ auto: true })
      });
      
      if (response.ok) {
        this.showNotification('Mock email sent!');
      }
    } catch (error) {
      console.error('Error simulating email:', error);
      this.showNotification('Failed to simulate email', 'error');
    }
  }

  clearEmails() {
    this.state.emails = [];
    this.renderEmails();
    this.showNotification('Emails cleared');
    this.saveState();
  }

  copyEmailAddress() {
    if (this.state.currentInbox) {
      this.copyToClipboard(this.state.currentInbox.email);
    }
  }

  connectToSSE() {
    if (!this.state.currentInbox) return;
    
    this.disconnect(); // Close any existing connection
    
    const url = `${this.state.serverUrl}/api/emails/${this.state.currentInbox.id}/stream`;
    this.eventSource = new EventSource(url);
    
    this.eventSource.onopen = () => {
      console.log('SSE connection opened');
      this.isConnected = true;
      this.updateConnectionStatus('Connected', 'bg-green-500');
    };
    
    this.eventSource.addEventListener('email', (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'email') {
        this.addEmail(data.data);
      }
    });
    
    this.eventSource.addEventListener('ping', () => {
      // Keepalive ping - just update last activity
      console.log('Received keepalive ping');
    });
    
    this.eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      this.isConnected = false;
      this.updateConnectionStatus('Connection Error', 'bg-red-500');
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (this.state.currentInbox && !this.isConnected) {
          console.log('Attempting to reconnect...');
          this.connectToSSE();
        }
      }, 5000);
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnected = false;
    this.updateConnectionStatus('Disconnected', 'bg-gray-400');
  }

  addEmail(email) {
    // Add to beginning of array (newest first)
    this.state.emails.unshift(email);
    this.renderEmails();
    this.saveState();
    
    // Show notification for new emails with OTPs
    if (email.otpCodes && email.otpCodes.length > 0) {
      this.showNotification(`New email with OTP: ${email.otpCodes.join(', ')}`, 'success');
    }
  }

  updateFilters() {
    this.state.filters.search = this.container.querySelector('#search-filter').value.toLowerCase();
    this.state.filters.sender = this.container.querySelector('#sender-filter').value.toLowerCase();
    this.state.filters.regex = this.container.querySelector('#regex-filter').value;
    this.state.filters.showOTPOnly = this.container.querySelector('#otp-only-filter').checked;
    
    this.renderEmails();
    this.saveState();
  }

  getFilteredEmails() {
    return this.state.emails.filter(email => {
      // Search filter
      if (this.state.filters.search) {
        const searchText = `${email.subject} ${email.body}`.toLowerCase();
        if (!searchText.includes(this.state.filters.search)) {
          return false;
        }
      }
      
      // Sender filter
      if (this.state.filters.sender) {
        if (!email.from.toLowerCase().includes(this.state.filters.sender)) {
          return false;
        }
      }
      
      // Regex filter
      if (this.state.filters.regex) {
        try {
          const regex = new RegExp(this.state.filters.regex, 'i');
          const testText = `${email.subject} ${email.body}`;
          if (!regex.test(testText)) {
            return false;
          }
        } catch (e) {
          // Invalid regex, skip this filter
        }
      }
      
      // OTP only filter
      if (this.state.filters.showOTPOnly) {
        if (!email.otpCodes || email.otpCodes.length === 0) {
          return false;
        }
      }
      
      return true;
    });
  }

  renderEmails() {
    const container = this.container.querySelector('#emails-list');
    const emptyState = this.container.querySelector('#empty-state');
    const emailStats = this.container.querySelector('#email-stats');
    const emailCount = this.container.querySelector('#email-count');
    const filteredCount = this.container.querySelector('#filtered-count');
    
    const filteredEmails = this.getFilteredEmails();
    
    // Update stats
    emailCount.textContent = `${this.state.emails.length} email${this.state.emails.length !== 1 ? 's' : ''}`;
    filteredCount.textContent = `${filteredEmails.length} visible`;
    
    if (filteredEmails.length === 0) {
      container.innerHTML = '';
      emptyState.classList.remove('hidden');
      emailStats.classList.add('hidden');
    } else {
      emptyState.classList.add('hidden');
      emailStats.classList.remove('hidden');
      
      container.innerHTML = filteredEmails.map(email => this.renderEmailCard(email)).join('');
      
      // Add copy OTP functionality
      container.querySelectorAll('.copy-otp-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const otp = e.target.dataset.otp;
          this.copyToClipboard(otp);
        });
      });
    }
  }

  renderEmailCard(email) {
    const timeAgo = this.getTimeAgo(new Date(email.timestamp));
    const hasOTP = email.otpCodes && email.otpCodes.length > 0;
    
    return `
      <div class="email-card p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow ${hasOTP ? 'border-green-300 dark:border-green-600' : ''}">
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-medium text-gray-900 dark:text-white truncate">${this.escapeHtml(email.subject)}</h3>
              ${hasOTP ? '<span class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full font-medium">OTP</span>' : ''}
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 truncate">${this.escapeHtml(email.from)}</p>
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400 ml-4">${timeAgo}</div>
        </div>
        
        <div class="text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">${this.highlightOTPs(this.escapeHtml(email.body), email.otpCodes)}</div>
        
        ${hasOTP ? `
          <div class="flex flex-wrap gap-2">
            ${email.otpCodes.map(otp => `
              <button 
                class="copy-otp-btn px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded font-mono text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                data-otp="${otp}"
                title="Click to copy OTP"
              >
                ${otp}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  highlightOTPs(text, otpCodes) {
    if (!otpCodes || otpCodes.length === 0) return text;
    
    let result = text;
    otpCodes.forEach(otp => {
      const regex = new RegExp(`\\b${otp}\\b`, 'g');
      result = result.replace(regex, `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">${otp}</mark>`);
    });
    
    return result;
  }

  getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  showInboxInfo() {
    const inboxSection = this.container.querySelector('#current-inbox');
    const emailElement = this.container.querySelector('#inbox-email');
    const filtersSection = this.container.querySelector('#filters-section');
    const emailsContainer = this.container.querySelector('#emails-container');
    
    inboxSection.classList.remove('hidden');
    filtersSection.classList.remove('hidden');
    emailsContainer.classList.remove('hidden');
    emailElement.textContent = this.state.currentInbox.email;
  }

  enableButtons() {
    this.container.querySelector('#simulate-email-btn').disabled = false;
    this.container.querySelector('#clear-emails-btn').disabled = false;
  }

  updateConnectionStatus(status, colorClass) {
    const indicator = this.container.querySelector('#connection-indicator');
    const statusText = this.container.querySelector('#connection-status');
    
    indicator.className = `w-2 h-2 rounded-full mr-2 ${colorClass}`;
    statusText.textContent = status;
  }

  showServerError() {
    this.container.querySelector('#server-error').classList.remove('hidden');
  }

  hideServerError() {
    this.container.querySelector('#server-error').classList.add('hidden');
  }

  applyState() {
    if (this.state.currentInbox) {
      this.showInboxInfo();
      this.connectToSSE();
      this.enableButtons();
      this.renderEmails();
      
      // Restore filter values
      this.container.querySelector('#search-filter').value = this.state.filters.search || '';
      this.container.querySelector('#sender-filter').value = this.state.filters.sender || '';
      this.container.querySelector('#regex-filter').value = this.state.filters.regex || '';
      this.container.querySelector('#otp-only-filter').checked = this.state.filters.showOTPOnly || false;
    }
  }

  destroy() {
    this.disconnect();
    super.destroy();
  }
}