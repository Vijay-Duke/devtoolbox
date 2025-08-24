export class DateDurationCalculator {
  constructor() {
    this.container = null;
    // Duration mode inputs
    this.startDateInput = null;
    this.endDateInput = null;
    this.includeEndDateCheckbox = null;
    this.excludeWeekendsCheckbox = null;
    // Holiday functionality
    this.userCountry = null;
    this.userState = null;
    this.availableCountries = [];
    this.holidayCache = new Map();
    this.countrySelector = null;
    this.stateSelector = null;
    this.excludeHolidaysCheckbox = null;
    this.loadSettings();
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();
    this.attachEventListeners();
    setTimeout(() => this.calculateDuration(), 100); // Initial calculation after UI is ready
  }

  render() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Date Calculator</h1>
          <p class="text-gray-600 dark:text-gray-400">Calculate duration between dates and add/subtract time from any date</p>
        </div>
        
        
        <div class="grid lg:grid-cols-2 gap-8 mb-8">
          <!-- Duration Mode -->
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6" id="duration-inputs">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">Duration Between Dates</h3>
            
            <div class="space-y-6">
              <div>
                <label for="start-date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                <input 
                  type="date" 
                  id="start-date"
                  value="${this.formatDateForInput(today)}"
                  class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label for="end-date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                <input 
                  type="date" 
                  id="end-date"
                  value="${this.formatDateForInput(tomorrow)}"
                  class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  id="include-end-date"
                  class="w-4 h-4 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label for="include-end-date" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Include end date in calculation
                </label>
              </div>
            </div>
            
            <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <details class="group" open>
                <summary class="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  <span>More options</span>
                  <svg class="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </summary>
                <div class="mt-4 space-y-4">
                  <div>
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Quick Presets</h4>
                    <div class="grid grid-cols-2 gap-2">
                      <button class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded hover:bg-gray-200 dark:hover:bg-gray-600" data-preset="today-tomorrow">
                        Today → Tomorrow
                      </button>
                      <button class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded hover:bg-gray-200 dark:hover:bg-gray-600" data-preset="this-week">
                        This Week
                      </button>
                      <button class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded hover:bg-gray-200 dark:hover:bg-gray-600" data-preset="this-month">
                        This Month
                      </button>
                      <button class="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 rounded hover:bg-gray-200 dark:hover:bg-gray-600" data-preset="this-year">
                        This Year
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Business Days Settings</h4>
                    <div class="flex items-center mb-2">
                      <input 
                        type="checkbox" 
                        id="exclude-weekends"
                        checked
                        class="w-4 h-4 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label for="exclude-weekends" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Exclude weekends from business days
                      </label>
                    </div>
                    <div class="flex items-center mb-2">
                      <input 
                        type="checkbox" 
                        id="exclude-holidays"
                        checked
                        class="w-4 h-4 text-blue-600 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label for="exclude-holidays" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Exclude holidays from business days
                      </label>
                    </div>
                  </div>
                  <div>
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Holiday Settings</h4>
                    <div class="space-y-3">
                      <div>
                        <label for="country-select" class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Country</label>
                        <select 
                          id="country-select"
                          class="w-full px-2 py-1 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Loading countries...</option>
                        </select>
                      </div>
                      <div>
                        <label for="state-select" class="block text-sm text-gray-700 dark:text-gray-300 mb-1">State/Region</label>
                        <select 
                          id="state-select"
                          class="w-full px-2 py-1 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled
                        >
                          <option value="">Select country first</option>
                        </select>
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400" id="location-status">
                        Detecting your location...
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>
          
          
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6" id="results-panel">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6" id="results-title">Duration Results</h3>
            
            <!-- Duration Results -->
            <div class="space-y-3" id="duration-results">
              <div class="flex justify-between items-center py-2 px-4 bg-gray-50 dark:bg-gray-900 rounded">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Years, Months, Days:</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-mono text-gray-900 dark:text-white" id="result-detailed"></span>
                  <button class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" data-copy="result-detailed" title="Copy">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="flex justify-between items-center py-2 px-4 bg-gray-50 dark:bg-gray-900 rounded">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Days:</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-mono text-gray-900 dark:text-white" id="result-total-days"></span>
                  <button class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" data-copy="result-total-days" title="Copy">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="flex justify-between items-center py-2 px-4 bg-gray-50 dark:bg-gray-900 rounded">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Business Days:</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-mono text-gray-900 dark:text-white" id="result-business-days"></span>
                  <button class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" data-copy="result-business-days" title="Copy">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="flex justify-between items-center py-2 px-4 bg-gray-50 dark:bg-gray-900 rounded">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Weeks:</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-mono text-gray-900 dark:text-white" id="result-weeks"></span>
                  <button class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" data-copy="result-weeks" title="Copy">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="flex justify-between items-center py-2 px-4 bg-gray-50 dark:bg-gray-900 rounded">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Hours:</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-mono text-gray-900 dark:text-white" id="result-hours"></span>
                  <button class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" data-copy="result-hours" title="Copy">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              <!-- Holidays in Range -->
              <div id="holidays-display" class="hidden">
                <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Holidays in Range</h4>
                  <div class="space-y-2" id="holidays-list">
                    <!-- Holiday items will be inserted here -->
                  </div>
                </div>
              </div>
              
              <!-- Long Weekends -->
              <div id="long-weekends-display" class="hidden">
                <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Long Weekends</h4>
                  <div class="space-y-2" id="long-weekends-list">
                    <!-- Long weekend items will be inserted here -->
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    `;

    // Duration mode elements
    this.startDateInput = this.container.querySelector('#start-date');
    this.endDateInput = this.container.querySelector('#end-date');
    this.includeEndDateCheckbox = this.container.querySelector('#include-end-date');
    this.excludeWeekendsCheckbox = this.container.querySelector('#exclude-weekends');


    // Holiday elements
    this.countrySelector = this.container.querySelector('#country-select');
    this.stateSelector = this.container.querySelector('#state-select');
    this.excludeHolidaysCheckbox = this.container.querySelector('#exclude-holidays');
    this.locationStatus = this.container.querySelector('#location-status');

    // Apply saved settings
    if (this.settings) {
      this.excludeWeekendsCheckbox.checked = this.settings.excludeWeekends;
      if (this.settings.excludeHolidays !== undefined) {
        this.excludeHolidaysCheckbox.checked = this.settings.excludeHolidays;
      }
      if (this.settings.selectedCountry) {
        this.userCountry = this.settings.selectedCountry;
      }
      if (this.settings.selectedState) {
        this.userState = this.settings.selectedState;
      }
    }

    // Initialize holiday functionality
    this.initializeHolidayUI();
  }

  attachEventListeners() {

    // Auto-calculate when dates change
    this.startDateInput.addEventListener('change', () => {
      setTimeout(() => this.calculateDuration(), 0);
    });

    this.endDateInput.addEventListener('change', () => {
      setTimeout(() => this.calculateDuration(), 0);
    });

    // Auto-calculate when checkboxes change
    this.includeEndDateCheckbox.addEventListener('change', () => {
      setTimeout(() => this.calculateDuration(), 0);
    });

    this.excludeWeekendsCheckbox.addEventListener('change', () => {
      this.saveSettings();
      setTimeout(() => this.calculateDuration(), 0);
    });


    // Preset buttons (duration mode)
    this.container.querySelectorAll('[data-preset]').forEach(button => {
      button.addEventListener('click', () => {
        this.applyPreset(button.dataset.preset);
      });
    });


    // Copy buttons
    this.container.querySelectorAll('[data-copy]').forEach(button => {
      button.addEventListener('click', () => {
        const targetId = button.dataset.copy;
        const targetElement = this.container.querySelector(`#${targetId}`);
        if (targetElement && targetElement.textContent) {
          this.copyToClipboard(targetElement.textContent, button);
        }
      });
    });

    // Holiday settings event listeners
    this.countrySelector.addEventListener('change', () => {
      this.onCountryChange();
    });

    this.stateSelector.addEventListener('change', () => {
      this.onStateChange();
    });

    this.excludeHolidaysCheckbox.addEventListener('change', () => {
      this.saveSettings();
      setTimeout(() => this.calculateDuration(), 0);
    });
  }

  async calculateDuration() {
    const startDate = new Date(this.startDateInput.value);
    const endDate = new Date(this.endDateInput.value);
    const includeEndDate = this.includeEndDateCheckbox.checked;

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      this.clearResults();
      return;
    }

    // Adjust end date if including end date
    const adjustedEndDate = new Date(endDate);
    if (includeEndDate) {
      adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
    }

    // Get holidays if needed
    let holidays = [];
    const excludeHolidays = this.excludeHolidaysCheckbox ? this.excludeHolidaysCheckbox.checked : false;
    if (excludeHolidays && this.userCountry) {
      try {
        holidays = await this.getHolidaysInRange(startDate, adjustedEndDate, this.userCountry, this.userState);
      } catch (error) {
        console.warn('Failed to fetch holidays for duration calculation:', error);
      }
    }

    const duration = this.getDuration(startDate, adjustedEndDate, holidays);
    this.updateResults(duration, startDate, endDate, includeEndDate, holidays);
  }

  getDuration(startDate, endDate, holidays = []) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate total milliseconds
    const totalMs = Math.abs(end - start);

    // Calculate detailed breakdown
    let years = 0;
    let months = 0;
    let days = 0;

    // Work with a copy for calculation
    const calcDate = new Date(start);

    if (start < end) {
      // Calculate years
      while (calcDate.getFullYear() < end.getFullYear() ||
      (calcDate.getFullYear() === end.getFullYear() &&
          calcDate.getMonth() < end.getMonth()) ||
      (calcDate.getFullYear() === end.getFullYear() &&
          calcDate.getMonth() === end.getMonth() &&
          calcDate.getDate() < end.getDate())) {

        const nextYear = new Date(calcDate);
        nextYear.setFullYear(nextYear.getFullYear() + 1);

        if (nextYear <= end) {
          years++;
          calcDate.setFullYear(calcDate.getFullYear() + 1);
        } else {
          break;
        }
      }

      // Calculate months
      while (calcDate.getMonth() < end.getMonth() ||
      (calcDate.getMonth() === end.getMonth() && calcDate.getDate() < end.getDate()) ||
      (calcDate.getMonth() > end.getMonth() && calcDate.getFullYear() < end.getFullYear())) {

        const nextMonth = new Date(calcDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        if (nextMonth <= end) {
          months++;
          calcDate.setMonth(calcDate.getMonth() + 1);
        } else {
          break;
        }
      }

      // Calculate remaining days
      days = Math.floor((end - calcDate) / (1000 * 60 * 60 * 24));
    }

    // Calculate other units
    const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = Math.floor(totalMs / (1000 * 60 * 60));

    // Calculate business days
    let businessDays = 0;
    const current = new Date(start);
    const excludeWeekends = this.excludeWeekendsCheckbox ? this.excludeWeekendsCheckbox.checked : true;
    const excludeHolidays = this.excludeHolidaysCheckbox ? this.excludeHolidaysCheckbox.checked : false;

    while (current < end) {
      let isBusinessDay = true;

      // Check weekends
      if (excludeWeekends) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday (0) or Saturday (6)
          isBusinessDay = false;
        }
      }

      // Check holidays
      if (isBusinessDay && excludeHolidays && holidays.length > 0) {
        const currentDateStr = current.toISOString().split('T')[0];
        const isHolidayDay = holidays.some(holiday => holiday.date === currentDateStr);
        if (isHolidayDay) {
          isBusinessDay = false;
        }
      }

      if (isBusinessDay) {
        businessDays++;
      }

      current.setDate(current.getDate() + 1);
    }

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalHours,
      businessDays,
      isNegative: start > end
    };
  }

  updateResults(duration, startDate, endDate, includeEndDate, holidays = []) {
    const sign = duration.isNegative ? '-' : '';

    // Update detailed result
    let detailedResult = '';
    if (duration.years > 0) {
      detailedResult += `${duration.years} year${duration.years !== 1 ? 's' : ''}`;
    }
    if (duration.months > 0) {
      if (detailedResult) detailedResult += ', ';
      detailedResult += `${duration.months} month${duration.months !== 1 ? 's' : ''}`;
    }
    if (duration.days > 0) {
      if (detailedResult) detailedResult += ', ';
      detailedResult += `${duration.days} day${duration.days !== 1 ? 's' : ''}`;
    }
    if (!detailedResult) {
      detailedResult = '0 days';
    }

    this.container.querySelector('#result-detailed').textContent = sign + detailedResult;
    this.container.querySelector('#result-total-days').textContent = sign + duration.totalDays.toLocaleString();
    this.container.querySelector('#result-business-days').textContent = sign + duration.businessDays.toLocaleString();
    this.container.querySelector('#result-weeks').textContent = sign + duration.totalWeeks.toLocaleString() + ' weeks';
    this.container.querySelector('#result-hours').textContent = sign + duration.totalHours.toLocaleString() + ' hours';

    // Display holidays in range if available
    this.displayHolidaysInResults(holidays);
    
    // Display long weekends if available
    this.displayLongWeekends(holidays);
  }

  clearResults() {
    this.container.querySelector('#result-detailed').textContent = '';
    this.container.querySelector('#result-total-days').textContent = '';
    this.container.querySelector('#result-business-days').textContent = '';
    this.container.querySelector('#result-weeks').textContent = '';
    this.container.querySelector('#result-hours').textContent = '';

    // Clear holiday display
    this.displayHolidaysInResults([]);
    
    // Clear long weekends display
    this.displayLongWeekends([]);
  }

  applyPreset(preset) {
    const today = new Date();
    let startDate, endDate;

    switch (preset) {
      case 'today-tomorrow':
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 1);
        break;

      case 'this-week':
        // Start of week (Monday)
        startDate = new Date(today);
        const dayOfWeek = startDate.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 0
        startDate.setDate(startDate.getDate() - daysToSubtract);

        // End of week (Sunday)
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        break;

      case 'this-month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;

      case 'this-year':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;

      default:
        return;
    }

    this.startDateInput.value = this.formatDateForInput(startDate);
    this.endDateInput.value = this.formatDateForInput(endDate);
    setTimeout(() => this.calculateDuration(), 0);
  }

  formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async copyToClipboard(text, button) {
    try {
      await navigator.clipboard.writeText(text);

      // Change icon to checkmark
      const svg = button.querySelector('svg');
      const originalSvg = svg.outerHTML;

      svg.outerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      `;

      // Restore original icon after 2 seconds
      setTimeout(() => {
        const newSvg = button.querySelector('svg');
        if (newSvg) {
          newSvg.outerHTML = originalSvg;
        }
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }

  loadSettings() {
    try {
      const settings = localStorage.getItem('date-duration-settings');
      if (settings) {
        this.settings = JSON.parse(settings);
      } else {
        this.settings = {
          excludeWeekends: true,
          excludeHolidays: true
        };
      }
      
      // Restore country and state selections
      if (this.settings.selectedCountry) {
        this.userCountry = this.settings.selectedCountry;
      }
      if (this.settings.selectedState) {
        this.userState = this.settings.selectedState;
      }
    } catch (error) {
      this.settings = {
        excludeWeekends: true,
        excludeHolidays: true
      };
    }
  }

  saveSettings() {
    try {
      const settings = {
        excludeWeekends: this.excludeWeekendsCheckbox.checked,
        excludeHolidays: this.excludeHolidaysCheckbox ? this.excludeHolidaysCheckbox.checked : false,
        selectedCountry: this.userCountry,
        selectedState: this.userState
      };
      localStorage.setItem('date-duration-settings', JSON.stringify(settings));
      this.settings = settings;
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error);
    }
  }



  // Holiday Display Methods
  displayHolidaysInResults(holidays) {
    const holidaysDisplay = this.container.querySelector('#holidays-display');
    const holidaysList = this.container.querySelector('#holidays-list');

    if (!holidays || holidays.length === 0) {
      holidaysDisplay.classList.add('hidden');
      return;
    }

    // Show holidays display
    holidaysDisplay.classList.remove('hidden');

    // Clear existing holidays
    holidaysList.innerHTML = '';

    // Sort holidays by date
    const sortedHolidays = holidays.sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedHolidays.forEach(holiday => {
      const date = new Date(holiday.date);
      const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });

      const holidayItem = document.createElement('div');
      holidayItem.className = 'flex justify-between items-center py-1 px-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm';
      holidayItem.innerHTML = `
        <span class="text-gray-900 dark:text-white">${holiday.name || holiday.localName}</span>
        <span class="text-gray-600 dark:text-gray-400">${dateStr}</span>
      `;

      holidaysList.appendChild(holidayItem);
    });

    // Show count if more than 5 holidays
    if (holidays.length > 5) {
      const countDisplay = document.createElement('div');
      countDisplay.className = 'text-xs text-gray-500 dark:text-gray-400 text-center pt-2';
      countDisplay.textContent = `Total: ${holidays.length} holidays`;
      holidaysList.appendChild(countDisplay);
    }
  }

  identifyLongWeekends(holidays) {
    const longWeekends = [];
    
    // Sort holidays by date
    const sortedHolidays = holidays.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedHolidays.forEach((holiday, index) => {
      const date = new Date(holiday.date);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      
      // Check for natural 3-day weekends
      if (dayOfWeek === 1) { // Holiday on Monday
        const friday = new Date(date);
        friday.setDate(date.getDate() - 3);
        const sunday = new Date(date);
        sunday.setDate(date.getDate() - 1);
        
        longWeekends.push({
          holiday: holiday,
          type: '3-day weekend',
          startDate: friday,
          endDate: date,
          days: 3,
          vacationDaysNeeded: 0
        });
      } else if (dayOfWeek === 5) { // Holiday on Friday
        const sunday = new Date(date);
        sunday.setDate(date.getDate() + 2);
        
        longWeekends.push({
          holiday: holiday,
          type: '3-day weekend',
          startDate: date,
          endDate: sunday,
          days: 3,
          vacationDaysNeeded: 0
        });
      }
      
      // Check for potential 4-day weekends with bridge days
      else if (dayOfWeek === 2) { // Holiday on Tuesday
        const saturday = new Date(date);
        saturday.setDate(date.getDate() - 3);
        const sunday = new Date(date);
        sunday.setDate(date.getDate() - 2);
        
        longWeekends.push({
          holiday: holiday,
          type: '4-day weekend (take Monday off)',
          startDate: saturday,
          endDate: date,
          days: 4,
          vacationDaysNeeded: 1,
          bridgeDay: 'Monday'
        });
      } else if (dayOfWeek === 4) { // Holiday on Thursday
        const sunday = new Date(date);
        sunday.setDate(date.getDate() + 3);
        
        longWeekends.push({
          holiday: holiday,
          type: '4-day weekend (take Friday off)',
          startDate: date,
          endDate: sunday,
          days: 4,
          vacationDaysNeeded: 1,
          bridgeDay: 'Friday'
        });
      }
      
      // Check for consecutive holidays (extended weekends)
      if (index < sortedHolidays.length - 1) {
        const nextHoliday = sortedHolidays[index + 1];
        const nextDate = new Date(nextHoliday.date);
        const daysDiff = (nextDate - date) / (1000 * 60 * 60 * 24);
        
        if (daysDiff === 1) { // Consecutive days
          // Find the end of consecutive holidays
          let endHolidayIndex = index + 1;
          while (endHolidayIndex < sortedHolidays.length - 1) {
            const currentHoliday = sortedHolidays[endHolidayIndex];
            const nextHolidayInSequence = sortedHolidays[endHolidayIndex + 1];
            const currentDate = new Date(currentHoliday.date);
            const nextDateInSequence = new Date(nextHolidayInSequence.date);
            const sequenceDaysDiff = (nextDateInSequence - currentDate) / (1000 * 60 * 60 * 24);
            
            if (sequenceDaysDiff === 1) {
              endHolidayIndex++;
            } else {
              break;
            }
          }
          
          const endHoliday = sortedHolidays[endHolidayIndex];
          const endDate = new Date(endHoliday.date);
          const totalDays = (endDate - date) / (1000 * 60 * 60 * 24) + 1;
          
          // Check if consecutive holidays are purely on weekends (don't create long weekends)
          const startDayOfWeek = date.getDay();
          const endDayOfWeek = endDate.getDay();
          const isPureWeekendSequence = (startDayOfWeek === 6 && endDayOfWeek === 0) || 
                                       (startDayOfWeek === 0 && endDayOfWeek === 6);
          
          if (totalDays > 1 && !isPureWeekendSequence) {
            const holidayNames = sortedHolidays.slice(index, endHolidayIndex + 1)
              .map(h => h.name || h.localName).join(', ');
            
            longWeekends.push({
              holiday: { name: holidayNames, date: holiday.date },
              type: `${totalDays + 2}-day extended weekend`,
              startDate: date,
              endDate: endDate,
              days: totalDays + 2, // Include adjacent weekend days
              vacationDaysNeeded: 0,
              isConsecutive: true
            });
          }
        }
      }
    });
    
    // Remove duplicates and sort by start date
    const uniqueLongWeekends = longWeekends.filter((weekend, index, self) => 
      index === self.findIndex(w => w.startDate.getTime() === weekend.startDate.getTime())
    );
    
    return uniqueLongWeekends.sort((a, b) => a.startDate - b.startDate);
  }

  displayLongWeekends(holidays) {
    const longWeekendsDisplay = this.container.querySelector('#long-weekends-display');
    const longWeekendsList = this.container.querySelector('#long-weekends-list');
    
    if (!holidays || holidays.length === 0) {
      longWeekendsDisplay.classList.add('hidden');
      return;
    }
    
    const longWeekends = this.identifyLongWeekends(holidays);
    
    if (longWeekends.length === 0) {
      longWeekendsDisplay.classList.add('hidden');
      return;
    }
    
    // Show long weekends display
    longWeekendsDisplay.classList.remove('hidden');
    
    // Clear existing long weekends
    longWeekendsList.innerHTML = '';
    
    longWeekends.forEach(weekend => {
      const startDateStr = weekend.startDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      const endDateStr = weekend.endDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: weekend.endDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
      
      const weekendItem = document.createElement('div');
      weekendItem.className = 'flex justify-between items-start py-2 px-3 bg-green-50 dark:bg-green-900/20 rounded text-sm';
      
      let detailText = weekend.type;
      if (weekend.vacationDaysNeeded > 0) {
        detailText += ` • Take ${weekend.bridgeDay} off`;
      }
      
      weekendItem.innerHTML = `
        <div class="flex-1">
          <div class="font-medium text-gray-900 dark:text-white">${startDateStr} - ${endDateStr}</div>
          <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">${weekend.holiday.name}</div>
          <div class="text-xs text-green-700 dark:text-green-300 mt-1">${detailText}</div>
        </div>
        <div class="text-right">
          <div class="text-sm font-medium text-gray-900 dark:text-white">${weekend.days} days</div>
          ${weekend.vacationDaysNeeded > 0 ? `<div class="text-xs text-orange-600 dark:text-orange-400">${weekend.vacationDaysNeeded} vacation day</div>` : ''}
        </div>
      `;
      
      longWeekendsList.appendChild(weekendItem);
    });
  }

  // Holiday UI Methods
  async initializeHolidayUI() {
    try {
      // Update location status
      this.updateLocationStatus('Loading countries...');

      // Detect user location if not already detected
      if (!this.userCountry) {
        await this.detectUserLocation();
      }

      // Fetch available countries
      await this.fetchAvailableCountries();
      this.populateCountrySelector();

      // Populate state selector if we have a saved country
      if (this.userCountry) {
        this.updateLocationStatus(`Selected: ${this.getCountryName(this.userCountry)}`);
        await this.populateStateSelector(this.userCountry);
        if (this.userState) {
          this.stateSelector.value = this.userState;
        }
      } else {
        this.updateLocationStatus('No country selected - please select manually');
      }
    } catch (error) {
      console.error('Failed to initialize holiday UI:', error);
      this.updateLocationStatus('Failed to load countries');
    }
  }

  populateCountrySelector() {
    const selector = this.countrySelector;
    selector.innerHTML = '<option value="">Select a country...</option>';

    this.availableCountries.forEach(country => {
      const option = document.createElement('option');
      option.value = country.countryCode;
      option.textContent = country.name;
      selector.appendChild(option);
    });

    // Restore saved country selection
    if (this.userCountry) {
      selector.value = this.userCountry;
    }
  }

  async populateStateSelector(countryCode) {
    const selector = this.stateSelector;
    selector.innerHTML = '<option value="">Nationwide holidays</option>';

    if (!countryCode) {
      selector.disabled = true;
      return;
    }

    // Add state options for supported countries
    const stateOptions = this.getStateOptions(countryCode);
    if (stateOptions.length > 0) {
      stateOptions.forEach(state => {
        const option = document.createElement('option');
        option.value = state.code;
        option.textContent = state.name;
        selector.appendChild(option);
      });
      selector.disabled = false;
    } else {
      selector.disabled = true;
    }
  }

  getStateOptions(countryCode) {
    // Define state/province options for countries with regional holidays
    const stateMap = {
      'US': [
        { code: 'US-AL', name: 'Alabama' },
        { code: 'US-AK', name: 'Alaska' },
        { code: 'US-AZ', name: 'Arizona' },
        { code: 'US-AR', name: 'Arkansas' },
        { code: 'US-CA', name: 'California' },
        { code: 'US-CO', name: 'Colorado' },
        { code: 'US-CT', name: 'Connecticut' },
        { code: 'US-DE', name: 'Delaware' },
        { code: 'US-FL', name: 'Florida' },
        { code: 'US-GA', name: 'Georgia' },
        { code: 'US-HI', name: 'Hawaii' },
        { code: 'US-ID', name: 'Idaho' },
        { code: 'US-IL', name: 'Illinois' },
        { code: 'US-IN', name: 'Indiana' },
        { code: 'US-IA', name: 'Iowa' },
        { code: 'US-KS', name: 'Kansas' },
        { code: 'US-KY', name: 'Kentucky' },
        { code: 'US-LA', name: 'Louisiana' },
        { code: 'US-ME', name: 'Maine' },
        { code: 'US-MD', name: 'Maryland' },
        { code: 'US-MA', name: 'Massachusetts' },
        { code: 'US-MI', name: 'Michigan' },
        { code: 'US-MN', name: 'Minnesota' },
        { code: 'US-MS', name: 'Mississippi' },
        { code: 'US-MO', name: 'Missouri' },
        { code: 'US-MT', name: 'Montana' },
        { code: 'US-NE', name: 'Nebraska' },
        { code: 'US-NV', name: 'Nevada' },
        { code: 'US-NH', name: 'New Hampshire' },
        { code: 'US-NJ', name: 'New Jersey' },
        { code: 'US-NM', name: 'New Mexico' },
        { code: 'US-NY', name: 'New York' },
        { code: 'US-NC', name: 'North Carolina' },
        { code: 'US-ND', name: 'North Dakota' },
        { code: 'US-OH', name: 'Ohio' },
        { code: 'US-OK', name: 'Oklahoma' },
        { code: 'US-OR', name: 'Oregon' },
        { code: 'US-PA', name: 'Pennsylvania' },
        { code: 'US-RI', name: 'Rhode Island' },
        { code: 'US-SC', name: 'South Carolina' },
        { code: 'US-SD', name: 'South Dakota' },
        { code: 'US-TN', name: 'Tennessee' },
        { code: 'US-TX', name: 'Texas' },
        { code: 'US-UT', name: 'Utah' },
        { code: 'US-VT', name: 'Vermont' },
        { code: 'US-VA', name: 'Virginia' },
        { code: 'US-WA', name: 'Washington' },
        { code: 'US-WV', name: 'West Virginia' },
        { code: 'US-WI', name: 'Wisconsin' },
        { code: 'US-WY', name: 'Wyoming' }
      ],
      'CA': [
        { code: 'CA-AB', name: 'Alberta' },
        { code: 'CA-BC', name: 'British Columbia' },
        { code: 'CA-MB', name: 'Manitoba' },
        { code: 'CA-NB', name: 'New Brunswick' },
        { code: 'CA-NL', name: 'Newfoundland and Labrador' },
        { code: 'CA-NT', name: 'Northwest Territories' },
        { code: 'CA-NS', name: 'Nova Scotia' },
        { code: 'CA-NU', name: 'Nunavut' },
        { code: 'CA-ON', name: 'Ontario' },
        { code: 'CA-PE', name: 'Prince Edward Island' },
        { code: 'CA-QC', name: 'Quebec' },
        { code: 'CA-SK', name: 'Saskatchewan' },
        { code: 'CA-YT', name: 'Yukon' }
      ],
      'AU': [
        { code: 'AU-NSW', name: 'New South Wales' },
        { code: 'AU-VIC', name: 'Victoria' },
        { code: 'AU-QLD', name: 'Queensland' },
        { code: 'AU-WA', name: 'Western Australia' },
        { code: 'AU-SA', name: 'South Australia' },
        { code: 'AU-TAS', name: 'Tasmania' },
        { code: 'AU-NT', name: 'Northern Territory' },
        { code: 'AU-ACT', name: 'Australian Capital Territory' }
      ]
    };

    return stateMap[countryCode] || [];
  }

  getCountryName(countryCode) {
    const country = this.availableCountries.find(c => c.countryCode === countryCode);
    return country ? country.name : countryCode;
  }

  updateLocationStatus(message) {
    if (this.locationStatus) {
      this.locationStatus.textContent = message;
    }
  }

  async onCountryChange() {
    const selectedCountry = this.countrySelector.value;
    this.userCountry = selectedCountry;
    this.userState = null;

    if (selectedCountry) {
      await this.populateStateSelector(selectedCountry);
      this.updateLocationStatus(`Selected: ${this.getCountryName(selectedCountry)}`);
    } else {
      this.stateSelector.innerHTML = '<option value="">Select country first</option>';
      this.stateSelector.disabled = true;
      this.updateLocationStatus('No country selected');
    }

    this.saveSettings();

    // Recalculate
    setTimeout(() => this.calculateDuration(), 0);
  }

  onStateChange() {
    const selectedState = this.stateSelector.value;
    this.userState = selectedState || null;

    if (selectedState) {
      const stateName = this.stateSelector.options[this.stateSelector.selectedIndex].textContent;
      this.updateLocationStatus(`${this.getCountryName(this.userCountry)} - ${stateName}`);
    } else {
      this.updateLocationStatus(`${this.getCountryName(this.userCountry)} (Nationwide)`);
    }

    this.saveSettings();

    // Recalculate
    setTimeout(() => this.calculateDuration(), 0);
  }

  // Holiday API Methods
  async fetchAvailableCountries() {
    try {
      const cacheKey = 'available_countries';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        this.availableCountries = cached;
        return cached;
      }

      const response = await fetch('https://date.nager.at/api/v3/AvailableCountries');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const countries = await response.json();
      this.availableCountries = countries;
      this.setCache(cacheKey, countries, 7 * 24 * 60 * 60 * 1000); // Cache for 7 days
      return countries;
    } catch (error) {
      console.error('Failed to fetch available countries:', error);
      return [];
    }
  }

  async fetchPublicHolidays(year, countryCode) {
    try {
      const cacheKey = `holidays_${countryCode}_${year}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await fetch(`https://date.nager.at/api/v3/publicholidays/${year}/${countryCode}`);
      if (!response.ok) {
        if (response.status === 404) {
          // Country not supported or no holidays for this year
          console.warn(`No holidays found for ${countryCode} in ${year}`);
          return [];
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const holidays = await response.json();
      this.setCache(cacheKey, holidays, 24 * 60 * 60 * 1000); // Cache for 24 hours
      return holidays;
    } catch (error) {
      console.error(`Failed to fetch holidays for ${countryCode} ${year}:`, error);
      return [];
    }
  }

  filterHolidaysByState(holidays, stateCode) {
    if (!stateCode) return holidays;

    return holidays.filter(holiday => {
      // Include global holidays (nationwide)
      if (holiday.global) return true;

      // Include holidays that apply to the specific state
      if (holiday.counties && holiday.counties.includes(stateCode)) return true;

      return false;
    });
  }

  getHolidaysInRange(startDate, endDate, countryCode, stateCode = null) {
    const holidays = [];
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    // Get holidays for all years in the range
    const yearPromises = [];
    for (let year = startYear; year <= endYear; year++) {
      yearPromises.push(this.fetchPublicHolidays(year, countryCode));
    }

    return Promise.all(yearPromises).then(yearHolidays => {
      const allHolidays = yearHolidays.flat();

      // Filter by state if specified
      const filteredHolidays = stateCode ?
          this.filterHolidaysByState(allHolidays, stateCode) :
          allHolidays;

      // Filter by date range
      return filteredHolidays.filter(holiday => {
        const holidayDate = new Date(holiday.date);
        return holidayDate >= startDate && holidayDate <= endDate;
      }).sort((a, b) => new Date(a.date) - new Date(b.date));
    });
  }

  isHoliday(date, countryCode, stateCode = null) {
    const year = date.getFullYear();
    const cacheKey = `holidays_${countryCode}_${year}`;
    const holidays = this.getFromCache(cacheKey);

    if (!holidays) {
      // If holidays are not cached, we can't determine synchronously
      return null;
    }

    const filteredHolidays = stateCode ?
        this.filterHolidaysByState(holidays, stateCode) :
        holidays;

    const dateStr = date.toISOString().split('T')[0];
    return filteredHolidays.find(holiday => holiday.date === dateStr) || null;
  }

  // Cache Management
  getFromCache(key) {
    try {
      const item = localStorage.getItem(`holiday_cache_${key}`);
      if (!item) return null;

      const data = JSON.parse(item);
      const now = Date.now();

      if (data.expiry && now > data.expiry) {
        localStorage.removeItem(`holiday_cache_${key}`);
        return null;
      }

      return data.value;
    } catch (error) {
      console.warn('Failed to read from cache:', error);
      return null;
    }
  }

  setCache(key, value, ttlMs = 24 * 60 * 60 * 1000) {
    try {
      const data = {
        value: value,
        expiry: Date.now() + ttlMs
      };
      localStorage.setItem(`holiday_cache_${key}`, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to write to cache:', error);
    }
  }

  clearHolidayCache() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('holiday_cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear holiday cache:', error);
    }
  }

  // Location Detection Methods
  async detectUserLocation() {
    try {
      // First try timezone-based detection
      const countryFromTimezone = this.detectCountryFromTimezone();
      if (countryFromTimezone) {
        this.userCountry = countryFromTimezone.country;
        this.userState = countryFromTimezone.state;
        return;
      }

      // Fallback to IP geolocation
      await this.detectCountryFromIP();
    } catch (error) {
      console.warn('Location detection failed:', error);
      // Default to US if detection fails
      this.userCountry = 'US';
    }
  }

  detectCountryFromTimezone() {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Common timezone to country/state mappings
      const timezoneMap = {
        // United States
        'America/New_York': { country: 'US', state: 'US-NY' },
        'America/Chicago': { country: 'US', state: 'US-IL' },
        'America/Denver': { country: 'US', state: 'US-CO' },
        'America/Los_Angeles': { country: 'US', state: 'US-CA' },
        'America/Phoenix': { country: 'US', state: 'US-AZ' },
        'America/Anchorage': { country: 'US', state: 'US-AK' },
        'Pacific/Honolulu': { country: 'US', state: 'US-HI' },

        // Canada
        'America/Toronto': { country: 'CA', state: 'CA-ON' },
        'America/Vancouver': { country: 'CA', state: 'CA-BC' },
        'America/Edmonton': { country: 'CA', state: 'CA-AB' },
        'America/Montreal': { country: 'CA', state: 'CA-QC' },
        'America/Halifax': { country: 'CA', state: 'CA-NS' },

        // Europe
        'Europe/London': { country: 'GB' },
        'Europe/Berlin': { country: 'DE' },
        'Europe/Paris': { country: 'FR' },
        'Europe/Rome': { country: 'IT' },
        'Europe/Madrid': { country: 'ES' },
        'Europe/Amsterdam': { country: 'NL' },
        'Europe/Brussels': { country: 'BE' },
        'Europe/Vienna': { country: 'AT' },
        'Europe/Zurich': { country: 'CH' },
        'Europe/Stockholm': { country: 'SE' },
        'Europe/Oslo': { country: 'NO' },
        'Europe/Copenhagen': { country: 'DK' },
        'Europe/Helsinki': { country: 'FI' },
        'Europe/Warsaw': { country: 'PL' },
        'Europe/Prague': { country: 'CZ' },
        'Europe/Budapest': { country: 'HU' },
        'Europe/Dublin': { country: 'IE' },

        // Asia Pacific
        'Asia/Tokyo': { country: 'JP' },
        'Asia/Shanghai': { country: 'CN' },
        'Asia/Hong_Kong': { country: 'HK' },
        'Asia/Singapore': { country: 'SG' },
        'Asia/Seoul': { country: 'KR' },
        'Asia/Kolkata': { country: 'IN' },
        'Australia/Sydney': { country: 'AU', state: 'AU-NSW' },
        'Australia/Melbourne': { country: 'AU', state: 'AU-VIC' },
        'Australia/Perth': { country: 'AU', state: 'AU-WA' },
        'Pacific/Auckland': { country: 'NZ' },

        // Others
        'America/Sao_Paulo': { country: 'BR' },
        'America/Mexico_City': { country: 'MX' },
        'America/Argentina/Buenos_Aires': { country: 'AR' },
        'Africa/Johannesburg': { country: 'ZA' },
      };

      return timezoneMap[timezone] || null;
    } catch (error) {
      console.warn('Timezone detection failed:', error);
      return null;
    }
  }

  async detectCountryFromIP() {
    try {
      // Use ip-api.com - free, no auth required, CORS enabled
      const response = await fetch('http://ip-api.com/json/', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        this.userCountry = data.countryCode;
        // For US, try to get state code
        if (data.countryCode === 'US' && data.region) {
          this.userState = `US-${data.region}`;
        }
        // For Canada
        if (data.countryCode === 'CA' && data.region) {
          this.userState = `CA-${data.region}`;
        }
      } else {
        throw new Error('IP geolocation failed');
      }
    } catch (error) {
      // Fallback to HTTPS endpoint if HTTP fails
      try {
        const response = await fetch('https://ipapi.co/json/', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        this.userCountry = data.country_code;
        if (data.country_code === 'US' && data.region_code) {
          this.userState = `US-${data.region_code}`;
        }
      } catch (fallbackError) {
        console.warn('All IP geolocation methods failed:', fallbackError);
        throw error;
      }
    }
  }
}