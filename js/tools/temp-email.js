import { ToolTemplate } from './tool-template.js';

export class TempEmailTool extends ToolTemplate {
  constructor() {
    super();
    this.config = {
      name: 'Temporary Email',
      description: 'Generate temporary @encode.click email addresses and receive emails in real-time. Perfect for testing OTPs and email flows.',
      version: '1.0.0',
      author: 'DevToolbox',
      category: 'Developer Tools',
      keywords: ['email', 'temp', 'otp', 'disposable', 'inbox', 'testing']
    };
    
    this.state = {
      subscribedEmails: [], // Array of email addresses being monitored
      subscribedInboxes: [], // Array of inbox objects for multi-inbox mode
      emails: [], // Array of emails with inboxId included
      filters: {
        search: '',
        showOTPOnly: false,
        selectedInboxId: 'all' // Filter by specific inbox or 'all'
      },
      audioSettings: {
        enabled: true,
        soundType: 'notification',
        volume: 0.5, // 0.0 to 1.0
        differentSoundForOTP: false
      },
      serverUrl: window.location.hostname === 'localhost' 
        ? 'http://localhost:8443' 
        : 'https://api.encode.click'
    };
    
    this.eventSource = null;
    this.isConnected = false;
    this.lastEventId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    
    // Performance optimizations
    this.searchRegexCache = new Map(); // Cache compiled regex patterns
    this.lastRenderHash = null; // Track rendered content to avoid unnecessary rebuilds
    this.maxEmailsPerInbox = 100; // Limit emails per inbox to prevent memory growth
    
    // Button removal system
    this.buttonObserver = null;
    this.buttonRemovalTimers = [];
    
    // Audio notification system
    this.audioContext = null;
    this.audioPermissionGranted = false;
  }
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container ${containerId} not found`);
      return;
    }
    
    // Ensure state is properly initialized
    this.ensureStateInitialized();
    
    this.render();
    this.attachEventListeners();
    this.loadState();
  }
  
  ensureStateInitialized() {
    // Backward compatibility: ensure all required state properties exist
    if (!this.state.subscribedInboxes) {
      this.state.subscribedInboxes = [];
    }
    if (!this.state.subscribedEmails) {
      this.state.subscribedEmails = [];
    }
    if (!this.state.emails) {
      this.state.emails = [];
    }
    if (!this.state.filters) {
      this.state.filters = {
        search: '',
        showOTPOnly: false,
        selectedInboxId: 'all'
      };
    }
    if (!this.state.audioSettings) {
      this.state.audioSettings = {
        enabled: true,
        soundType: 'notification',
        volume: 0.5,
        differentSoundForOTP: false
      };
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="temp-email-tool max-w-6xl mx-auto p-6">
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

        <!-- Email Subscription Section -->
        <div class="email-subscription-section mb-6">
          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter @encode.click Email Addresses (comma-separated):
            </label>
            <div class="mb-3 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div class="flex items-start">
                <svg class="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
                <div class="text-xs text-blue-700 dark:text-blue-300">
                  <p><strong>How it works:</strong> Enter any @encode.click email addresses to monitor. Emails sent to these addresses will appear here in real-time.</p>
                  <p class="mt-1"><strong>Example:</strong> Use test123@encode.click, alerts@encode.click, or any custom prefix you want.</p>
                </div>
              </div>
            </div>
            <div class="flex gap-3 mb-3">
              <input 
                type="text" 
                id="emails-input"
                placeholder="user@encode.click, test@encode.click, inbox123@encode.click"
                class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button 
                id="start-monitoring-btn" 
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Start Monitoring
              </button>
            </div>
            
            <div class="flex flex-wrap items-center gap-3">
              <button 
                id="clear-emails-btn" 
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
              >
                Clear Emails
              </button>
              
              <div class="ml-auto flex items-center space-x-3">
                <div class="flex items-center">
                  <div id="connection-indicator" class="w-2 h-2 rounded-full mr-2 bg-gray-400"></div>
                  <span id="connection-status" class="text-sm font-medium">Disconnected</span>
                </div>
                <button 
                  id="connection-toggle-btn" 
                  class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium hidden"
                  data-state="disconnected"
                >
                  Connect
                </button>
              </div>
            </div>
            
            <!-- Subscribed Emails Display -->
            <div id="subscribed-emails" class="hidden mt-4">
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Monitoring:</div>
              <div id="subscribed-emails-list" class="flex flex-wrap gap-2"></div>
            </div>
          </div>
        </div>


        <!-- Filters Section -->
        <div id="filters-section" class="hidden mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search emails</label>
              <div class="relative">
                <input 
                  type="text" 
                  id="search-filter"
                  placeholder="Search in from, to, subject, or body..."
                  class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div id="search-icon" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by inbox</label>
              <select 
                id="inbox-filter"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Inboxes</option>
              </select>
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
                Please make sure the email server is running on <code>http://localhost:54322</code>
                <br>
                Run: <code class="font-mono bg-red-100 dark:bg-red-800 px-1 rounded">cd server && PORT=54322 npm run dev</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Button removal system disabled to prevent notification spam

    // Start monitoring button
    const startBtn = this.container.querySelector('#start-monitoring-btn');
    startBtn.addEventListener('click', () => this.startMonitoring());

    // Emails input (enter key and input changes)
    const emailsInput = this.container.querySelector('#emails-input');
    emailsInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.startMonitoring();
      }
    });
    
    // Update toggle button visibility when input changes
    emailsInput.addEventListener('input', () => {
      this.updateToggleButtonVisibility();
    });


    // Clear emails button
    const clearBtn = this.container.querySelector('#clear-emails-btn');
    clearBtn.addEventListener('click', () => this.clearEmails());

    // Connection toggle button
    const connectionToggleBtn = this.container.querySelector('#connection-toggle-btn');
    connectionToggleBtn.addEventListener('click', () => this.toggleConnection());

    // Audio notification controls
    this.setupAudioControls();

    // Filter inputs
    const searchFilter = this.container.querySelector('#search-filter');
    const inboxFilter = this.container.querySelector('#inbox-filter');
    const otpFilter = this.container.querySelector('#otp-only-filter');

    // Optimized real-time search with progressive debouncing
    const updateFilters = () => {
      // Clear any existing timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      
      // Immediate update for clearing search (better UX)
      const searchValue = this.container.querySelector('#search-filter').value;
      if (!searchValue) {
        this.updateFilters();
        return;
      }
      
      // Progressive debouncing: shorter delay for longer search terms
      const delay = searchValue.length > 3 ? 100 : 150;
      
      this.searchTimeout = setTimeout(() => {
        this.updateFilters();
      }, delay);
    };
    
    searchFilter.addEventListener('input', updateFilters);
    inboxFilter.addEventListener('change', updateFilters);
    otpFilter.addEventListener('change', updateFilters);
    
    // HTML Email View Event Handlers
    this.container.addEventListener('click', (e) => {
      // View HTML button
      if (e.target.classList.contains('view-html-btn')) {
        const emailId = e.target.dataset.emailId;
        this.showEmailHTML(emailId);
      }
      
      // Show Text button
      if (e.target.classList.contains('show-text-btn')) {
        const emailId = e.target.dataset.emailId;
        this.showEmailText(emailId);
      }
    });
  }

  setupButtonRemovalSystem() {
    // Disabled button removal system to prevent notification spam
    // This system was causing excessive "Copied to clipboard" notifications
  }

  removeInjectedButtons() {
    const toolHeader = this.container.querySelector('.tool-header');
    if (!toolHeader) return;
    
    // Remove share button (injected by ShareableLinks service)
    const shareButton = toolHeader.querySelector('.share-button');
    if (shareButton) {
      shareButton.remove();
    }
    
    // Remove history button (injected by HistoryPersistence service)  
    const historyButton = toolHeader.querySelector('.history-button');
    if (historyButton) {
      historyButton.remove();
    }
  }

  setupButtonRemovalObserver() {
    const toolHeader = this.container.querySelector('.tool-header');
    if (!toolHeader) return;
    
    // Create MutationObserver to watch for button injections
    this.buttonObserver = new MutationObserver((mutations) => {
      let buttonsFound = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              // Check if the added node is a button we want to remove
              if (node.classList.contains('share-button') || node.classList.contains('history-button')) {
                buttonsFound = true;
              }
              // Or check if it contains buttons we want to remove
              if (node.querySelector('.share-button, .history-button')) {
                buttonsFound = true;
              }
            }
          });
        }
      });
      
      if (buttonsFound) {
        // Small delay to ensure DOM is stable before removal
        setTimeout(() => {
          this.removeInjectedButtons();
        }, 10);
      }
    });
    
    // Start observing
    this.buttonObserver.observe(toolHeader, {
      childList: true,
      subtree: true
    });
  }

  setupNavigationListener() {
    // Listen for hash changes to detect when user navigates to/from temp-email
    const handleHashChange = () => {
      const currentHash = window.location.hash.slice(1);
      if (currentHash === 'temp-email') {
        // User navigated to temp-email tool, ensure buttons are removed
        setTimeout(() => {
          this.removeInjectedButtons();
        }, 50);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    // Store reference for cleanup
    this.hashChangeListener = handleHashChange;
  }

  // Audio Notification Methods
  
  setupAudioControls() {
    // Audio is always enabled with notification sound at 50% volume
    // No UI controls needed - using defaults
    // Request audio permission on init
    this.requestAudioPermission();
  }
  
  updateAudioControlsVisibility() {
    // No longer needed since audio controls are removed
  }
  
  async requestAudioPermission() {
    if (this.audioPermissionGranted) return;
    
    try {
      // Create audio context on user interaction
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Resume context if suspended (Chrome autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.audioPermissionGranted = true;
    } catch (error) {
      console.warn('Audio permission denied or not supported:', error);
      this.showNotification('Audio notifications may not work in this browser', 'warning');
    }
  }
  
  async playEmailNotificationSound(isOTPEmail = false) {
    if (!this.state.audioSettings.enabled) return;
    
    try {
      // Ensure audio permission
      await this.requestAudioPermission();
      
      if (!this.audioContext || !this.audioPermissionGranted) return;
      
      // Determine which sound to play
      let soundType = this.state.audioSettings.soundType;
      if (isOTPEmail && this.state.audioSettings.differentSoundForOTP) {
        // Use a more prominent sound for OTP emails
        soundType = this.getOTPSoundType(soundType);
      }
      
      // Generate and play the sound
      await this.generateAndPlaySound(soundType);
      
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }
  
  getOTPSoundType(baseSoundType) {
    // Map regular sounds to more prominent OTP sounds
    const otpSoundMap = {
      'beep': 'notification',
      'chime': 'bell',
      'bell': 'notification',
      'notification': 'bell'
    };
    
    return otpSoundMap[baseSoundType] || 'notification';
  }
  
  async generateAndPlaySound(soundType) {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Connect oscillator to gain to destination
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Set volume
    gainNode.gain.value = this.state.audioSettings.volume;
    
    // Configure sound based on type
    const soundConfig = this.getSoundConfig(soundType);
    
    // Generate the sound
    oscillator.type = soundConfig.waveType;
    oscillator.frequency.setValueAtTime(soundConfig.frequency, this.audioContext.currentTime);
    
    // Create envelope for the sound
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.state.audioSettings.volume, now + soundConfig.attack);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + soundConfig.duration);
    
    // Play the sound
    oscillator.start(now);
    oscillator.stop(now + soundConfig.duration);
    
    // Handle multiple tones for complex sounds
    if (soundConfig.secondTone) {
      setTimeout(() => {
        this.playSecondTone(soundConfig.secondTone);
      }, soundConfig.secondTone.delay * 1000);
    }
  }
  
  async playSecondTone(toneConfig) {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = toneConfig.waveType;
    oscillator.frequency.setValueAtTime(toneConfig.frequency, this.audioContext.currentTime);
    
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.state.audioSettings.volume, now + toneConfig.attack);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + toneConfig.duration);
    
    oscillator.start(now);
    oscillator.stop(now + toneConfig.duration);
  }
  
  getSoundConfig(soundType) {
    const configs = {
      beep: {
        waveType: 'square',
        frequency: 800,
        attack: 0.01,
        duration: 0.1
      },
      chime: {
        waveType: 'sine',
        frequency: 800,
        attack: 0.02,
        duration: 0.4,
        secondTone: {
          waveType: 'sine',
          frequency: 600,
          attack: 0.02,
          duration: 0.3,
          delay: 0.1
        }
      },
      bell: {
        waveType: 'sine',
        frequency: 1000,
        attack: 0.01,
        duration: 0.6,
        secondTone: {
          waveType: 'sine',
          frequency: 1200,
          attack: 0.01,
          duration: 0.4,
          delay: 0.15
        }
      },
      notification: {
        waveType: 'triangle',
        frequency: 660,
        attack: 0.02,
        duration: 0.2,
        secondTone: {
          waveType: 'triangle',
          frequency: 880,
          attack: 0.02,
          duration: 0.2,
          delay: 0.25
        }
      }
    };
    
    return configs[soundType] || configs.chime;
  }

  startMonitoring() {
    const emailsInput = this.container.querySelector('#emails-input');
    const emailText = emailsInput.value.trim();
    
    if (!emailText) {
      this.showNotification('Please enter at least one email address', 'error');
      return;
    }
    
    // Parse comma-separated emails
    const emailAddresses = emailText.split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);
    
    if (emailAddresses.length === 0) {
      this.showNotification('Please enter valid email addresses', 'error');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailAddresses.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      this.showNotification(`Invalid email format: ${invalidEmails.join(', ')}`, 'error');
      return;
    }
    
    try {
      // Cleanup existing connection
      this.disconnect();
      
      this.state.subscribedEmails = emailAddresses;
      this.state.emails = [];
      
      this.showSubscribedEmails();
      this.connectToMultiInboxSSE();
      this.enableButtons();
      this.hideServerError();
      this.showNotification(`Monitoring ${emailAddresses.length} email address(es)`);
      
      this.saveState();
    } catch (error) {
      console.error('Error starting monitoring:', error);
      this.showServerError();
      this.showNotification('Failed to start monitoring. Check if server is running.', 'error');
    }
  }

  toggleConnection() {
    const toggleBtn = this.container.querySelector('#connection-toggle-btn');
    const currentState = toggleBtn.getAttribute('data-state');
    
    if (currentState === 'disconnected') {
      // Connect - check if we have emails to monitor
      const emailsInput = this.container.querySelector('#emails-input');
      const emailText = emailsInput.value.trim();
      
      if (!emailText && (!this.state.subscribedEmails || this.state.subscribedEmails.length === 0)) {
        this.showNotification('Please enter email addresses to monitor first', 'warning');
        return;
      }
      
      // If there's text in input, use that, otherwise use existing subscribed emails
      if (emailText) {
        this.startMonitoring();
      } else {
        // Reconnect to existing subscribed emails
        this.connectToMultiInboxSSE();
        this.showNotification(`Reconnected to ${this.state.subscribedEmails.length} email address(es)`);
      }
    } else {
      // Disconnect
      this.disconnect();
      this.showNotification('Disconnected from monitoring', 'success');
    }
  }

  showSubscribedEmails() {
    const subscribedEmailsDiv = this.container.querySelector('#subscribed-emails');
    const subscribedEmailsList = this.container.querySelector('#subscribed-emails-list');
    
    if (this.state.subscribedEmails.length > 0) {
      subscribedEmailsDiv.classList.remove('hidden');
      subscribedEmailsList.innerHTML = this.state.subscribedEmails
        .map(email => `<span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">${email}</span>`)
        .join('');
    } else {
      subscribedEmailsDiv.classList.add('hidden');
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

  toggleMultiInboxMode() {
    this.state.multiInboxMode = !this.state.multiInboxMode;
    
    const toggleBtn = this.container.querySelector('#toggle-multi-inbox-btn');
    const multiInboxControls = this.container.querySelector('#multi-inbox-controls');
    const currentInboxSection = this.container.querySelector('#current-inbox');
    
    if (this.state.multiInboxMode) {
      toggleBtn.textContent = 'Disable Multi-Inbox Mode';
      toggleBtn.className = 'px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium';
      multiInboxControls.classList.remove('hidden');
      currentInboxSection.classList.add('hidden');
      
      // If we have a current inbox, add it to subscribed inboxes
      if (this.state.currentInbox) {
        this.addInboxToSubscription(this.state.currentInbox.id);
      }
      
      this.showFiltersAndEmails();
      this.updateInboxFilter();
      this.connectToMultiInboxSSE();
    } else {
      toggleBtn.textContent = 'Enable Multi-Inbox Mode';
      toggleBtn.className = 'px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium';
      multiInboxControls.classList.add('hidden');
      
      // Disconnect multi-inbox and clear subscriptions
      this.disconnect();
      this.state.subscribedInboxes = [];
      this.renderSubscribedInboxes();
      
      // Return to single inbox mode
      if (this.state.currentInbox) {
        currentInboxSection.classList.remove('hidden');
        this.connectToSSE();
      }
    }
    
    this.saveState();
  }

  async addInboxToSubscription(inboxId = null) {
    const inputInboxId = inboxId || this.container.querySelector('#add-inbox-input').value.trim();
    
    if (!inputInboxId) {
      this.showNotification('Please enter an inbox ID', 'error');
      return;
    }
    
    // Check if already subscribed
    if (this.state.subscribedInboxes.some(inbox => inbox.id === inputInboxId)) {
      this.showNotification('Already subscribed to this inbox', 'error');
      return;
    }
    
    try {
      // Validate inbox exists
      const response = await fetch(`${this.state.serverUrl}/api/emails/${inputInboxId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          this.showNotification('Inbox not found', 'error');
        } else {
          this.showNotification('Failed to validate inbox', 'error');
        }
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        // Add to subscribed inboxes
        this.state.subscribedInboxes.push({
          id: inputInboxId,
          email: data.data.inbox.email
        });
        
        // Clear input
        if (!inboxId) {
          this.container.querySelector('#add-inbox-input').value = '';
        }
        
        this.renderSubscribedInboxes();
        this.updateInboxFilter();
        this.connectToMultiInboxSSE();
        this.showNotification(`Subscribed to ${data.data.inbox.email}`, 'success');
        this.saveState();
      }
    } catch (error) {
      console.error('Error adding inbox to subscription:', error);
      this.showNotification('Failed to subscribe to inbox', 'error');
    }
  }

  removeInboxFromSubscription(inboxId) {
    this.state.subscribedInboxes = this.state.subscribedInboxes.filter(inbox => inbox.id !== inboxId);
    
    // Remove emails from this inbox
    this.state.emails = this.state.emails.filter(email => email.inboxId !== inboxId);
    
    this.renderSubscribedInboxes();
    this.updateInboxFilter();
    this.renderEmails();
    this.connectToMultiInboxSSE();
    this.saveState();
  }

  renderSubscribedInboxes() {
    const container = this.container.querySelector('#subscribed-inboxes-list');
    
    if (this.state.subscribedInboxes.length === 0) {
      container.innerHTML = '<p class="text-sm text-purple-600 dark:text-purple-400">No inboxes subscribed yet</p>';
      return;
    }
    
    container.innerHTML = this.state.subscribedInboxes.map(inbox => `
      <div class="flex items-center justify-between p-3 bg-white dark:bg-purple-800 rounded border border-purple-200 dark:border-purple-600">
        <div>
          <code class="text-sm font-mono text-purple-700 dark:text-purple-300">${inbox.email}</code>
          <span class="text-xs text-purple-500 dark:text-purple-400 ml-2">(${inbox.id.substring(0, 8)}...)</span>
        </div>
        <button 
          class="remove-inbox-btn text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 text-sm font-medium"
          data-inbox-id="${inbox.id}"
        >
          Remove
        </button>
      </div>
    `).join('');
    
    // Add event listeners for remove buttons
    container.querySelectorAll('.remove-inbox-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const inboxId = e.target.dataset.inboxId;
        this.removeInboxFromSubscription(inboxId);
      });
    });
  }

  updateInboxFilter() {
    const inboxFilter = this.container.querySelector('#inbox-filter');
    
    // Clear existing options except "All Inboxes"
    inboxFilter.innerHTML = '<option value="all">All Inboxes</option>';
    
    // Add options for subscribed inboxes
    for (const inbox of this.state.subscribedInboxes) {
      const option = document.createElement('option');
      option.value = inbox.id;
      option.textContent = inbox.email;
      inboxFilter.appendChild(option);
    }
  }

  connectToMultiInboxSSE() {
    if (!this.state.subscribedEmails || this.state.subscribedEmails.length === 0) {
      this.disconnect();
      return;
    }
    
    this.disconnect(); // Close any existing connection
    
    const url = `${this.state.serverUrl}/api/emails/stream?emails=${this.state.subscribedEmails.join(',')}`;
    this.eventSource = new EventSource(url);
    
    this.setupEventSourceHandlers();
  }

  showFiltersAndEmails() {
    const filtersSection = this.container.querySelector('#filters-section');
    const emailsContainer = this.container.querySelector('#emails-container');
    
    filtersSection.classList.remove('hidden');
    emailsContainer.classList.remove('hidden');
  }

  connectToSSE() {
    if (!this.state.currentInbox) return;
    
    this.disconnect(); // Close any existing connection
    
    const url = `${this.state.serverUrl}/api/emails/${this.state.currentInbox.id}/stream`;
    this.eventSource = new EventSource(url);
    
    this.eventSource.onopen = () => {
      // Connection opened
      this.isConnected = true;
      this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      this.updateConnectionStatus('Connected', 'bg-green-500');
    };
    
    this.eventSource.addEventListener('email', (event) => {
      // Store last event ID for reconnection
      if (event.lastEventId) {
        this.lastEventId = event.lastEventId;
      }
      
      const data = JSON.parse(event.data);
      if (data.type === 'email') {
        this.addEmail(data.data);
      }
    });
    
    this.eventSource.addEventListener('connected', (event) => {
      const data = JSON.parse(event.data);
      // Connection confirmed
      
      // Show replay notification if messages were replayed
      if (data.replayedMessages && data.replayedMessages > 0) {
        this.showReconnectionNotification(data.replayedMessages);
      }
      
      this.updateConnectionStatus('Connected', 'bg-green-500');
    });
    
    this.eventSource.addEventListener('ping', () => {
      // Keepalive ping - just update last activity
      // Keepalive ping received
    });
    
    this.eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      this.isConnected = false;
      
      // Check if this is a 404 error (inbox not found)
      if (this.eventSource.readyState === EventSource.CLOSED) {
        // Likely a 404 or server restart - clear the old inbox
        // Inbox not found, clearing old state
        this.state.currentInbox = null;
        this.state.emails = [];
        this.lastEventId = null;
        this.hideInboxInfo();
        this.updateConnectionStatus('Inbox Expired', 'bg-yellow-500');
        this.showNotification('Inbox expired or server restarted. Please generate a new inbox.', 'error');
        this.saveState();
        return;
      }
      
      this.updateConnectionStatus('Reconnecting...', 'bg-yellow-500');
      
      // Attempt to reconnect with exponential backoff
      this.attemptReconnect();
    };
  }
  
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      // Max reconnect attempts reached
      this.updateConnectionStatus('Connection Failed', 'bg-red-500');
      this.showNotification('Connection failed after multiple attempts. Please refresh.', 'error');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Cap at 30 seconds
    
    // Attempting reconnect
    this.updateConnectionStatus(`Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`, 'bg-yellow-500');
    
    setTimeout(() => {
      if (this.state.subscribedEmails && this.state.subscribedEmails.length > 0 && !this.isConnected) {
        this.connectToMultiInboxSSE();
      }
    }, delay);
  }
  
  connectToSSEWithReplay() {
    if (!this.state.currentInbox) return;
    
    this.disconnect(); // Close any existing connection
    
    // Build URL with Last-Event-ID if available
    let url = `${this.state.serverUrl}/api/emails/${this.state.currentInbox.id}/stream`;
    
    // Create EventSource with replay capability
    const eventSourceInitDict = {};
    if (this.lastEventId) {
      // Set Last-Event-ID header for replay
      eventSourceInitDict.headers = {
        'Last-Event-ID': this.lastEventId
      };
    }
    
    this.eventSource = new EventSource(url);
    
    // Set up all the same event handlers as connectToSSE
    this.setupEventSourceHandlers();
  }
  
  setupEventSourceHandlers() {
    this.eventSource.onopen = () => {
      // Connection opened
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.updateConnectionStatus('Connected', 'bg-green-500');
      this.showFiltersAndEmails();
    };
    
    this.eventSource.addEventListener('email', (event) => {
      // Store last event ID for reconnection
      if (event.lastEventId) {
        this.lastEventId = event.lastEventId;
      }
      
      const data = JSON.parse(event.data);
      if (data.type === 'email') {
        // Add email with inbox ID for multi-inbox support
        this.addEmail(data.data, data.inboxId);
      }
    });
    
    this.eventSource.addEventListener('connected', (event) => {
      const data = JSON.parse(event.data);
      // Connection confirmed
      
      // Show replay notification if messages were replayed
      if (data.replayedMessages && data.replayedMessages > 0) {
        this.showReconnectionNotification(data.replayedMessages);
      }
      
      // Show subscription info
      if (data.subscribedEmails && data.subscribedEmails.length > 1) {
        // Monitoring email addresses
        this.updateConnectionStatus(`Connected (${data.subscribedEmails.length} emails)`, 'bg-green-500');
      } else {
        this.updateConnectionStatus('Connected', 'bg-green-500');
      }
    });
    
    this.eventSource.addEventListener('ping', () => {
      // Keepalive ping received
    });
    
    this.eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      this.isConnected = false;
      
      if (this.eventSource.readyState === EventSource.CLOSED) {
        // Connection closed, clearing state
        this.state.subscribedEmails = [];
        this.state.emails = [];
        this.lastEventId = null;
        this.updateConnectionStatus('Connection Expired', 'bg-yellow-500');
        this.showNotification('Connection expired or server restarted. Please enter emails again.', 'error');
        return;
      }
      
      this.updateConnectionStatus('Reconnecting...', 'bg-yellow-500');
      this.attemptReconnect();
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.updateConnectionStatus('Disconnected', 'bg-gray-400');
  }
  
  showReconnectionNotification(replayedCount) {
    const message = `Reconnected; replayed ${replayedCount} message${replayedCount !== 1 ? 's' : ''}`;
    
    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity';
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
        </svg>
        <span class="text-sm font-medium">${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Fade out and remove after 4 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
    
    // Debug message logged
  }

  addEmail(email, inboxId = null) {
    // Add inbox ID to email for multi-inbox support
    if (inboxId) {
      email.inboxId = inboxId;
    } else if (this.state.currentInbox) {
      email.inboxId = this.state.currentInbox.id;
    }
    
    // Add to beginning of array (newest first)
    this.state.emails.unshift(email);
    
    // Limit emails to prevent memory growth
    if (this.state.emails.length > this.maxEmailsPerInbox) {
      const removedCount = this.state.emails.length - this.maxEmailsPerInbox;
      this.state.emails = this.state.emails.slice(0, this.maxEmailsPerInbox);
      
      // Clear render hash to force re-render after cleanup
      this.lastRenderHash = null;
      
      // Email limit reached, removed oldest emails
    }
    
    this.renderEmails();
    this.saveState();
    
    // Play audio notification for new email
    const isOTPEmail = email.otpCodes && email.otpCodes.length > 0;
    this.playEmailNotificationSound(isOTPEmail);
    
    // Show notification for new emails with OTPs
    if (isOTPEmail) {
      const inboxInfo = this.getInboxEmailFromId(email.inboxId);
      const inboxDisplay = inboxInfo ? ` to ${inboxInfo}` : '';
      this.showNotification(`New email with OTP${inboxDisplay}: ${email.otpCodes.join(', ')}`, 'success');
    }
  }

  getInboxEmailFromId(inboxId) {
    // Check current inbox
    if (this.state.currentInbox && this.state.currentInbox.id === inboxId) {
      return this.state.currentInbox.email;
    }
    
    // Initialize subscribedInboxes if undefined (backward compatibility)
    if (!this.state.subscribedInboxes) {
      this.state.subscribedInboxes = [];
    }
    
    // Check subscribed inboxes
    const subscribedInbox = this.state.subscribedInboxes.find(inbox => inbox.id === inboxId);
    return subscribedInbox ? subscribedInbox.email : null;
  }

  updateFilters() {
    this.state.filters.search = this.container.querySelector('#search-filter').value.toLowerCase();
    this.state.filters.selectedInboxId = this.container.querySelector('#inbox-filter').value;
    this.state.filters.showOTPOnly = this.container.querySelector('#otp-only-filter').checked;
    
    this.renderEmails();
    this.saveState();
  }

  getFilteredEmails() {
    return this.state.emails.filter(email => {
      // Inbox filter
      if (this.state.filters.selectedInboxId !== 'all') {
        if (email.inboxId !== this.state.filters.selectedInboxId) {
          return false;
        }
      }
      
      // Fuzzy search across all fields including TO address
      if (this.state.filters.search) {
        const searchTerm = this.state.filters.search;
        const searchableText = `${email.from} ${email.to} ${email.subject} ${email.body}`.toLowerCase();
        
        // Split search term into words for better fuzzy matching
        const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
        
        // Check if all search words are found in the email text
        const allWordsFound = searchWords.every(word => 
          searchableText.includes(word)
        );
        
        if (!allWordsFound) {
          return false;
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
    
    // Create a hash of current render state to avoid unnecessary rebuilds
    const renderHash = JSON.stringify({
      emails: filteredEmails.map(e => e.id),
      search: this.state.filters.search,
      selectedInbox: this.state.filters.selectedInboxId,
      showOTPOnly: this.state.filters.showOTPOnly
    });
    
    // Skip render if nothing changed
    if (this.lastRenderHash === renderHash) {
      return;
    }
    this.lastRenderHash = renderHash;
    
    // Update stats with performance indicator
    const totalEmails = this.state.emails.length;
    const isNearLimit = totalEmails > this.maxEmailsPerInbox * 0.8; // 80% of limit
    const limitText = isNearLimit ? ` (${totalEmails}/${this.maxEmailsPerInbox})` : '';
    
    emailCount.textContent = `${totalEmails} email${totalEmails !== 1 ? 's' : ''}${limitText}`;
    filteredCount.textContent = `${filteredEmails.length} visible`;
    
    if (filteredEmails.length === 0) {
      container.innerHTML = '';
      emptyState.classList.remove('hidden');
      emailStats.classList.add('hidden');
    } else {
      emptyState.classList.add('hidden');
      emailStats.classList.remove('hidden');
      
      // Use document fragment for efficient DOM manipulation
      const fragment = document.createDocumentFragment();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = filteredEmails.map(email => this.renderEmailCard(email)).join('');
      
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      
      // Single DOM update
      container.innerHTML = '';
      container.appendChild(fragment);
      
      // Add copy OTP functionality with event delegation for better performance
      container.addEventListener('click', (e) => {
        if (e.target.classList.contains('copy-otp-btn')) {
          const otp = e.target.dataset.otp;
          this.copyToClipboard(otp);
        }
      });
    }
  }

  highlightSearchTerms(text) {
    if (!this.state.filters.search) return text;
    
    const searchWords = this.state.filters.search.split(/\s+/).filter(word => word.length > 0);
    let highlightedText = text;
    
    searchWords.forEach(word => {
      // Use cached regex or create and cache new one
      let regex = this.searchRegexCache.get(word.toLowerCase());
      if (!regex) {
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        regex = new RegExp(`(${escapedWord})`, 'gi');
        this.searchRegexCache.set(word.toLowerCase(), regex);
        
        // Limit cache size to prevent memory growth
        if (this.searchRegexCache.size > 50) {
          const firstKey = this.searchRegexCache.keys().next().value;
          this.searchRegexCache.delete(firstKey);
        }
      }
      
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600 px-1 rounded">$1</mark>');
    });
    
    return highlightedText;
  }

  renderEmailCard(email) {
    const timeAgo = this.getTimeAgo(new Date(email.timestamp));
    const hasOTP = email.otpCodes && email.otpCodes.length > 0;
    const inboxEmail = this.getInboxEmailFromId(email.inboxId);
    const showInboxInfo = this.state.subscribedEmails && this.state.subscribedEmails.length > 1;
    const hasHtml = email.hasHtml || (email.html && email.html.trim().length > 0);
    const emailId = email.id;
    
    return `
      <div class="email-card p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow ${hasOTP ? 'border-green-300 dark:border-green-600' : ''}" data-email-id="${emailId}">
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-medium text-gray-900 dark:text-white truncate">${this.highlightSearchTerms(this.escapeHtml(email.subject))}</h3>
              ${hasOTP ? '<span class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full font-medium">OTP</span>' : ''}
              ${hasHtml ? '<span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full font-medium">HTML</span>' : ''}
              ${showInboxInfo && inboxEmail ? `<span class="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full font-medium">${inboxEmail}</span>` : ''}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p class="truncate">
                <span class="text-xs font-medium text-gray-500 dark:text-gray-500">FROM:</span> 
                ${this.highlightSearchTerms(this.escapeHtml(email.from))}
              </p>
              <p class="truncate">
                <span class="text-xs font-medium text-gray-500 dark:text-gray-500">TO:</span> 
                <span class="font-medium text-blue-600 dark:text-blue-400">${this.highlightSearchTerms(this.escapeHtml(email.to))}</span>
              </p>
            </div>
          </div>
          <div class="flex flex-col items-end">
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-2">${timeAgo}</div>
            ${hasHtml ? `<button class="view-html-btn text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" data-email-id="${emailId}">View HTML</button>` : ''}
          </div>
        </div>
        
        <!-- Text Content -->
        <div class="email-text-content text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">${this.highlightSearchTerms(this.highlightOTPs(this.escapeHtml(email.text || email.body || 'No content'), email.otpCodes))}</div>
        
        <!-- HTML Content (Initially Hidden) -->
        ${hasHtml ? `
          <div class="email-html-content hidden mb-3">
            <div class="mb-2 p-2 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded text-xs text-yellow-800 dark:text-yellow-200">
              <span class="font-medium">⚠️ Security Notice:</span> HTML content is displayed in a secure sandbox. External resources are blocked.
            </div>
            <div class="border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
              <iframe 
                class="email-html-iframe w-full min-h-96 max-h-96"
                data-email-id="${emailId}"
                sandbox="allow-same-origin"
                style="border: none; background: white;"
                title="Email HTML Content"
              ></iframe>
            </div>
            <div class="mt-2 flex justify-between text-xs">
              <button class="show-text-btn text-blue-600 dark:text-blue-400 hover:underline" data-email-id="${emailId}">Show Text Version</button>
              <span class="text-gray-500 dark:text-gray-400">Content is sandboxed for security</span>
            </div>
          </div>
        ` : ''}
        
        <!-- OTP Codes -->
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

  hideInboxInfo() {
    const inboxSection = this.container.querySelector('#current-inbox');
    const filtersSection = this.container.querySelector('#filters-section');
    const emailsContainer = this.container.querySelector('#emails-container');
    
    inboxSection.classList.add('hidden');
    filtersSection.classList.add('hidden');
    emailsContainer.classList.add('hidden');
    
    // Disable buttons
    this.container.querySelector('#clear-emails-btn').disabled = true;
  }

  enableButtons() {
    this.container.querySelector('#clear-emails-btn').disabled = false;
  }

  updateConnectionStatus(status, colorClass) {
    const indicator = this.container.querySelector('#connection-indicator');
    const statusText = this.container.querySelector('#connection-status');
    const toggleBtn = this.container.querySelector('#connection-toggle-btn');
    
    indicator.className = `w-2 h-2 rounded-full mr-2 ${colorClass}`;
    statusText.textContent = status;
    
    // Update toggle button based on connection status
    if (status === 'Disconnected') {
      toggleBtn.textContent = 'Connect';
      toggleBtn.className = 'px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium';
      toggleBtn.setAttribute('data-state', 'disconnected');
      
      // Show toggle button only if we have subscribed emails or input text
      const emailsInput = this.container.querySelector('#emails-input');
      const hasEmailsToConnect = emailsInput.value.trim() || (this.state.subscribedEmails && this.state.subscribedEmails.length > 0);
      toggleBtn.classList.toggle('hidden', !hasEmailsToConnect);
    } else if (status.startsWith('Connected') || status.startsWith('Reconnecting')) {
      toggleBtn.textContent = 'Disconnect';
      toggleBtn.className = 'px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium';
      toggleBtn.setAttribute('data-state', 'connected');
      toggleBtn.classList.remove('hidden');
    } else {
      // For other states like "Connection Failed", "Inbox Expired", etc.
      toggleBtn.textContent = 'Connect';
      toggleBtn.className = 'px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium';
      toggleBtn.setAttribute('data-state', 'disconnected');
      
      // Show toggle button if we have emails to potentially reconnect to
      const hasEmailsToConnect = this.state.subscribedEmails && this.state.subscribedEmails.length > 0;
      toggleBtn.classList.toggle('hidden', !hasEmailsToConnect);
    }
  }

  updateToggleButtonVisibility() {
    const toggleBtn = this.container.querySelector('#connection-toggle-btn');
    const emailsInput = this.container.querySelector('#emails-input');
    const currentState = toggleBtn.getAttribute('data-state');
    
    // If already connected, always show the disconnect button
    if (currentState === 'connected') {
      toggleBtn.classList.remove('hidden');
      return;
    }
    
    // For disconnected state, show button only if there are emails to connect to
    const hasInputText = emailsInput.value.trim().length > 0;
    const hasSubscribedEmails = this.state.subscribedEmails && this.state.subscribedEmails.length > 0;
    const hasEmailsToConnect = hasInputText || hasSubscribedEmails;
    
    toggleBtn.classList.toggle('hidden', !hasEmailsToConnect);
  }

  showServerError() {
    this.container.querySelector('#server-error').classList.remove('hidden');
  }

  hideServerError() {
    this.container.querySelector('#server-error').classList.add('hidden');
  }

  async applyState() {
    // Ensure buttons are removed when applying state
    this.removeInjectedButtons();
    
    // Restore multi-inbox mode if enabled
    if (this.state.multiInboxMode) {
      this.toggleMultiInboxMode(); // This will set up the UI
      if (this.state.subscribedInboxes && this.state.subscribedInboxes.length > 0) {
        this.renderSubscribedInboxes();
        this.updateInboxFilter();
        this.connectToMultiInboxSSE();
      }
      return;
    }
    
    if (this.state.currentInbox) {
      // Validate that the inbox still exists on the server
      try {
        const response = await fetch(`${this.state.serverUrl}/api/emails/${this.state.currentInbox.id}`);
        
        if (response.ok) {
          // Inbox still exists, restore the full state
          this.showInboxInfo();
          this.connectToSSE();
          this.enableButtons();
          this.renderEmails();
          
          // Restore filter values
          this.container.querySelector('#search-filter').value = this.state.filters.search || '';
          this.container.querySelector('#inbox-filter').value = this.state.filters.selectedInboxId || 'all';
          this.container.querySelector('#otp-only-filter').checked = this.state.filters.showOTPOnly || false;
          
          this.hideServerError();
        } else {
          // Inbox no longer exists (404), clear the state
          // Saved inbox no longer exists, clearing state
          this.state.currentInbox = null;
          this.state.emails = [];
          this.hideInboxInfo();
          this.showNotification('Previous inbox expired. Please generate a new one.', 'error');
          this.saveState();
        }
      } catch (error) {
        console.error('Error validating saved inbox:', error);
        // Server might be down, show error but keep the saved state
        this.showServerError();
      }
    }
  }

  destroy() {
    this.disconnect();
    this.lastEventId = null;
    this.reconnectAttempts = 0;
    
    // Clean up audio context
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.audioPermissionGranted = false;
    
    // Clean up button removal system
    this.cleanupButtonRemovalSystem();
    
    super.destroy();
  }

  cleanupButtonRemovalSystem() {
    // Clear all timers
    this.buttonRemovalTimers.forEach(timer => clearTimeout(timer));
    this.buttonRemovalTimers = [];
    
    // Disconnect MutationObserver
    if (this.buttonObserver) {
      this.buttonObserver.disconnect();
      this.buttonObserver = null;
    }
    
    // Remove navigation listener
    if (this.hashChangeListener) {
      window.removeEventListener('hashchange', this.hashChangeListener);
      this.hashChangeListener = null;
    }
  }

  // Secure HTML Email Display Methods
  
  showEmailHTML(emailId) {
    const emailCard = this.container.querySelector(`[data-email-id="${emailId}"]`);
    if (!emailCard) return;
    
    const textContent = emailCard.querySelector('.email-text-content');
    const htmlContent = emailCard.querySelector('.email-html-content');
    const iframe = emailCard.querySelector('.email-html-iframe');
    
    if (!textContent || !htmlContent || !iframe) return;
    
    // Hide text, show HTML
    textContent.classList.add('hidden');
    htmlContent.classList.remove('hidden');
    
    // Find email data
    const email = this.state.emails.find(e => e.id === emailId);
    if (!email || !email.html) return;
    
    // Create secure HTML document for iframe
    const secureHTML = this.createSecureHTMLDocument(email.html);
    
    // Load HTML into sandboxed iframe
    iframe.onload = () => {
      // HTML email loaded securely
    };
    
    iframe.onerror = () => {
      console.error(`Failed to load HTML email for ${emailId}`);
      iframe.srcdoc = '<p style="padding: 20px; color: #ef4444;">Error loading email content</p>';
    };
    
    // Use srcdoc for secure content loading
    iframe.srcdoc = secureHTML;
  }
  
  showEmailText(emailId) {
    const emailCard = this.container.querySelector(`[data-email-id="${emailId}"]`);
    if (!emailCard) return;
    
    const textContent = emailCard.querySelector('.email-text-content');
    const htmlContent = emailCard.querySelector('.email-html-content');
    
    if (!textContent || !htmlContent) return;
    
    // Show text, hide HTML
    textContent.classList.remove('hidden');
    htmlContent.classList.add('hidden');
  }
  
  createSecureHTMLDocument(emailHTML) {
    // Create a complete HTML document with security headers and CSP
    const secureDoc = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="Content-Security-Policy" content="
          default-src 'none';
          img-src data: https:;
          style-src 'unsafe-inline';
          font-src data: https:;
          script-src 'none';
          object-src 'none';
          media-src 'none';
          frame-src 'none';
          form-action 'none';
          base-uri 'none';
        ">
        <title>Email Content</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 100%;
            margin: 0;
            padding: 16px;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          
          /* Reset potentially dangerous styles */
          * {
            max-width: 100% !important;
            position: static !important;
          }
          
          /* Safe image handling */
          img {
            max-width: 100% !important;
            height: auto !important;
            display: inline-block !important;
          }
          
          /* Block dangerous elements that might have slipped through sanitization */
          script, iframe, object, embed, form, input, button, select, textarea {
            display: none !important;
          }
          
          /* Safe link styling */
          a {
            color: #3b82f6;
            text-decoration: underline;
            pointer-events: none; /* Disable clicking for security */
          }
          
          /* Safe table styling */
          table {
            border-collapse: collapse;
            width: 100%;
            max-width: 100%;
          }
          
          td, th {
            padding: 8px;
            border: 1px solid #e5e7eb;
            word-break: break-word;
          }
          
          /* Prevent layout breaking */
          div, span, p {
            max-width: 100% !important;
          }
        </style>
      </head>
      <body>
        ${emailHTML}
        
        <script>
          // Block any JavaScript execution attempts
          window.eval = function() { return null; };
          window.Function = function() { return function() {}; };
          
          // Remove any remaining script tags or dangerous attributes
          document.querySelectorAll('script, iframe, object, embed').forEach(el => el.remove());
          document.querySelectorAll('*').forEach(el => {
            // Remove dangerous attributes
            ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus'].forEach(attr => {
              if (el.hasAttribute(attr)) {
                el.removeAttribute(attr);
              }
            });
            
            // Remove javascript: and data: protocols from href and src
            ['href', 'src'].forEach(attr => {
              if (el.hasAttribute(attr)) {
                const value = el.getAttribute(attr);
                if (value && (value.startsWith('javascript:') || value.startsWith('data:') || value.startsWith('vbscript:'))) {
                  el.setAttribute(attr, '#blocked-for-security');
                }
              }
            });
          });
        </script>
      </body>
      </html>
    `;
    
    return secureDoc;
  }
}