export class CronParser {
  constructor() {
    this.container = null;
    this.cronInput = null;
    this.errorDisplay = null;
  }
  
  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.render();
    this.attachEventListeners();
    this.loadExample();
  }
  
  render() {
    this.container.innerHTML = `
      <div class="max-w-7xl mx-auto p-6">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Cron Parser</h1>
          <p class="text-gray-600 dark:text-gray-400">Parse and understand cron expressions with human-readable explanations</p>
        </div>
        
        <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <label for="cron-expression" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cron Expression</label>
          <div class="flex gap-2 mb-3">
            <input 
              type="text" 
              id="cron-expression" 
              class="flex-1 p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0 0 * * MON-FRI"
              value="0 0 * * MON-FRI"
              spellcheck="false"
            />
            <button class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors" data-action="parse">Parse</button>
          </div>
          
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Format: <code class="px-2 py-1 bg-white dark:bg-gray-900 rounded font-mono">minute hour day month weekday</code> or <code class="px-2 py-1 bg-white dark:bg-gray-900 rounded font-mono">@yearly</code>
          </div>
        </div>
        
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6" data-error hidden></div>
        
        <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6" id="cron-breakdown">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expression Breakdown</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <span class="block text-sm font-medium text-gray-700 dark:text-gray-300">Minute</span>
              <span class="block font-mono text-lg text-gray-900 dark:text-white" id="field-minute">-</span>
              <span class="block text-xs text-gray-500 dark:text-gray-400">(0-59)</span>
            </div>
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <span class="block text-sm font-medium text-gray-700 dark:text-gray-300">Hour</span>
              <span class="block font-mono text-lg text-gray-900 dark:text-white" id="field-hour">-</span>
              <span class="block text-xs text-gray-500 dark:text-gray-400">(0-23)</span>
            </div>
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <span class="block text-sm font-medium text-gray-700 dark:text-gray-300">Day of Month</span>
              <span class="block font-mono text-lg text-gray-900 dark:text-white" id="field-day">-</span>
              <span class="block text-xs text-gray-500 dark:text-gray-400">(1-31)</span>
            </div>
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <span class="block text-sm font-medium text-gray-700 dark:text-gray-300">Month</span>
              <span class="block font-mono text-lg text-gray-900 dark:text-white" id="field-month">-</span>
              <span class="block text-xs text-gray-500 dark:text-gray-400">(1-12 or JAN-DEC)</span>
            </div>
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <span class="block text-sm font-medium text-gray-700 dark:text-gray-300">Day of Week</span>
              <span class="block font-mono text-lg text-gray-900 dark:text-white" id="field-weekday">-</span>
              <span class="block text-xs text-gray-500 dark:text-gray-400">(0-7 or SUN-SAT)</span>
            </div>
          </div>
        </div>
        
        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Human-Readable Description</h3>
          <div class="text-gray-700 dark:text-gray-300" id="description-text">
            Enter a cron expression to see its description
          </div>
        </div>
        
        <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Next Execution Times</h3>
          <div class="space-y-2" id="next-runs-list">
            <div class="text-gray-500 dark:text-gray-400 text-center py-4">Parse a cron expression to see upcoming execution times</div>
          </div>
        </div>
        
        <div class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Common Expressions</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left" data-cron="* * * * *">
              <span class="block font-mono text-sm text-gray-900 dark:text-white">* * * * *</span>
              <span class="block text-xs text-gray-600 dark:text-gray-400 mt-1">Every minute</span>
            </button>
            <button class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left" data-cron="0 * * * *">
              <span class="block font-mono text-sm text-gray-900 dark:text-white">0 * * * *</span>
              <span class="block text-xs text-gray-600 dark:text-gray-400 mt-1">Every hour</span>
            </button>
            <button class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left" data-cron="0 0 * * *">
              <span class="block font-mono text-sm text-gray-900 dark:text-white">0 0 * * *</span>
              <span class="block text-xs text-gray-600 dark:text-gray-400 mt-1">Daily at midnight</span>
            </button>
            <button class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left" data-cron="0 9 * * MON-FRI">
              <span class="block font-mono text-sm text-gray-900 dark:text-white">0 9 * * MON-FRI</span>
              <span class="block text-xs text-gray-600 dark:text-gray-400 mt-1">Weekdays at 9 AM</span>
            </button>
            <button class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left" data-cron="0 0 1 * *">
              <span class="block font-mono text-sm text-gray-900 dark:text-white">0 0 1 * *</span>
              <span class="block text-xs text-gray-600 dark:text-gray-400 mt-1">Monthly on the 1st</span>
            </button>
            <button class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left" data-cron="0 0 1 1 *">
              <span class="block font-mono text-sm text-gray-900 dark:text-white">0 0 1 1 *</span>
              <span class="block text-xs text-gray-600 dark:text-gray-400 mt-1">Yearly on Jan 1st</span>
            </button>
            <button class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left" data-cron="*/5 * * * *">
              <span class="block font-mono text-sm text-gray-900 dark:text-white">*/5 * * * *</span>
              <span class="block text-xs text-gray-600 dark:text-gray-400 mt-1">Every 5 minutes</span>
            </button>
            <button class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left" data-cron="0 */2 * * *">
              <span class="block font-mono text-sm text-gray-900 dark:text-white">0 */2 * * *</span>
              <span class="block text-xs text-gray-600 dark:text-gray-400 mt-1">Every 2 hours</span>
            </button>
            <button class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left" data-cron="0 0 * * SUN">
              <span class="block font-mono text-sm text-gray-900 dark:text-white">0 0 * * SUN</span>
              <span class="block text-xs text-gray-600 dark:text-gray-400 mt-1">Every Sunday</span>
            </button>
            <button class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left" data-cron="30 3 15 * *">
              <span class="block font-mono text-sm text-gray-900 dark:text-white">30 3 15 * *</span>
              <span class="block text-xs text-gray-600 dark:text-gray-400 mt-1">15th at 3:30 AM</span>
            </button>
            <button class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left" data-cron="@hourly">
              <span class="block font-mono text-sm text-gray-900 dark:text-white">@hourly</span>
              <span class="block text-xs text-gray-600 dark:text-gray-400 mt-1">Start of every hour</span>
            </button>
            <button class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left" data-cron="@daily">
              <span class="block font-mono text-sm text-gray-900 dark:text-white">@daily</span>
              <span class="block text-xs text-gray-600 dark:text-gray-400 mt-1">Start of every day</span>
            </button>
          </div>
        </div>
        
        <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Reference</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200 dark:border-gray-700">
                  <th class="text-left py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Character</th>
                  <th class="text-left py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Description</th>
                  <th class="text-left py-2 font-medium text-gray-700 dark:text-gray-300">Example</th>
                </tr>
              </thead>
              <tbody class="text-gray-700 dark:text-gray-300">
                <tr class="border-b border-gray-100 dark:border-gray-800">
                  <td class="py-2 pr-4"><code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">*</code></td>
                  <td class="py-2 pr-4">Any value</td>
                  <td class="py-2">* in hour field = every hour</td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-800">
                  <td class="py-2 pr-4"><code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">,</code></td>
                  <td class="py-2 pr-4">Value list separator</td>
                  <td class="py-2">1,3,5 = at 1, 3, and 5</td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-800">
                  <td class="py-2 pr-4"><code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">-</code></td>
                  <td class="py-2 pr-4">Range of values</td>
                  <td class="py-2">1-5 = 1 through 5</td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-800">
                  <td class="py-2 pr-4"><code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">/</code></td>
                  <td class="py-2 pr-4">Step values</td>
                  <td class="py-2">*/15 = every 15 units</td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-800">
                  <td class="py-2 pr-4"><code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">@yearly</code></td>
                  <td class="py-2 pr-4">Annually</td>
                  <td class="py-2">0 0 1 1 *</td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-800">
                  <td class="py-2 pr-4"><code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">@monthly</code></td>
                  <td class="py-2 pr-4">Monthly</td>
                  <td class="py-2">0 0 1 * *</td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-800">
                  <td class="py-2 pr-4"><code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">@weekly</code></td>
                  <td class="py-2 pr-4">Weekly</td>
                  <td class="py-2">0 0 * * 0</td>
                </tr>
                <tr class="border-b border-gray-100 dark:border-gray-800">
                  <td class="py-2 pr-4"><code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">@daily</code></td>
                  <td class="py-2 pr-4">Daily</td>
                  <td class="py-2">0 0 * * *</td>
                </tr>
                <tr>
                  <td class="py-2 pr-4"><code class="px-2 py-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded font-mono">@hourly</code></td>
                  <td class="py-2 pr-4">Hourly</td>
                  <td class="py-2">0 * * * *</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    
    this.cronInput = this.container.querySelector('#cron-expression');
    this.errorDisplay = this.container.querySelector('[data-error]');
  }
  
  attachEventListeners() {
    // Auto-parse on input with debounce
    let parseTimeout;
    this.cronInput.addEventListener('input', () => {
      clearTimeout(parseTimeout);
      parseTimeout = setTimeout(() => {
        this.parse();
      }, 300); // 300ms debounce
    });
    
    // Parse button (kept for explicit parsing)
    this.container.querySelector('[data-action="parse"]').addEventListener('click', () => this.parse());
    
    // Common expressions
    this.container.querySelectorAll('[data-cron]').forEach(card => {
      card.addEventListener('click', () => {
        this.cronInput.value = card.dataset.cron;
        this.parse();
      });
    });
  }
  
  loadExample() {
    this.parse();
  }
  
  parse() {
    const expression = this.cronInput.value.trim();
    if (!expression) {
      this.clearResults();
      return;
    }
    
    try {
      // Handle special expressions
      const specialExpressions = {
        '@yearly': '0 0 1 1 *',
        '@annually': '0 0 1 1 *',
        '@monthly': '0 0 1 * *',
        '@weekly': '0 0 * * 0',
        '@daily': '0 0 * * *',
        '@midnight': '0 0 * * *',
        '@hourly': '0 * * * *'
      };
      
      const normalizedExpression = specialExpressions[expression.toLowerCase()] || expression;
      const parts = normalizedExpression.split(/\s+/);
      
      if (parts.length !== 5) {
        throw new Error('Cron expression must have exactly 5 fields');
      }
      
      const [minute, hour, day, month, weekday] = parts;
      
      // Validate and display fields
      this.validateField(minute, 0, 59, 'minute');
      this.validateField(hour, 0, 23, 'hour');
      this.validateField(day, 1, 31, 'day');
      this.validateField(month, 1, 12, 'month');
      this.validateField(weekday, 0, 7, 'weekday');
      
      // Update field display
      this.container.querySelector('#field-minute').textContent = minute;
      this.container.querySelector('#field-hour').textContent = hour;
      this.container.querySelector('#field-day').textContent = day;
      this.container.querySelector('#field-month').textContent = this.expandMonth(month);
      this.container.querySelector('#field-weekday').textContent = this.expandWeekday(weekday);
      
      // Generate description
      const description = this.generateDescription(minute, hour, day, month, weekday);
      this.container.querySelector('#description-text').textContent = description;
      
      // Calculate next runs
      const nextRuns = this.calculateNextRuns(minute, hour, day, month, weekday);
      this.displayNextRuns(nextRuns);
      
      this.clearError();
    } catch (error) {
      this.showError(error.message);
      this.clearResults();
    }
  }
  
  validateField(field, min, max, name) {
    // Allow wildcards
    if (field === '*') return true;
    
    // Handle lists
    if (field.includes(',')) {
      const values = field.split(',');
      for (const value of values) {
        this.validateField(value.trim(), min, max, name);
      }
      return true;
    }
    
    // Handle ranges
    if (field.includes('-')) {
      const [start, end] = field.split('-');
      this.validateSingleValue(start, min, max, name);
      this.validateSingleValue(end, min, max, name);
      return true;
    }
    
    // Handle steps
    if (field.includes('/')) {
      const [range, step] = field.split('/');
      if (range !== '*') {
        this.validateField(range, min, max, name);
      }
      const stepNum = parseInt(step);
      if (isNaN(stepNum) || stepNum < 1) {
        throw new Error(`Invalid step value in ${name} field`);
      }
      return true;
    }
    
    // Validate single value
    this.validateSingleValue(field, min, max, name);
    return true;
  }
  
  validateSingleValue(value, min, max, name) {
    // Handle month names
    if (name === 'month') {
      const monthMap = {
        'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4, 'MAY': 5, 'JUN': 6,
        'JUL': 7, 'AUG': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12
      };
      if (monthMap[value.toUpperCase()]) return true;
    }
    
    // Handle weekday names
    if (name === 'weekday') {
      const weekdayMap = {
        'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6
      };
      if (weekdayMap[value.toUpperCase()]) return true;
    }
    
    const num = parseInt(value);
    if (isNaN(num) || num < min || num > max) {
      throw new Error(`Invalid value "${value}" in ${name} field (must be ${min}-${max})`);
    }
  }
  
  expandMonth(month) {
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    if (month === '*') return 'Every month';
    
    // Replace month names with numbers for display
    let expanded = month;
    monthNames.forEach((name, index) => {
      expanded = expanded.replace(new RegExp(name, 'gi'), index + 1);
    });
    
    return expanded;
  }
  
  expandWeekday(weekday) {
    const weekdayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    
    if (weekday === '*') return 'Every day';
    
    // Replace weekday names with numbers for display
    let expanded = weekday;
    weekdayNames.forEach((name, index) => {
      expanded = expanded.replace(new RegExp(name, 'gi'), index);
    });
    
    // Handle 7 as Sunday
    expanded = expanded.replace(/7/g, '0');
    
    return expanded;
  }
  
  generateDescription(minute, hour, day, month, weekday) {
    let description = 'Runs ';
    
    // Time description
    if (minute === '*' && hour === '*') {
      description += 'every minute';
    } else if (minute === '*') {
      const hourDesc = this.describeValue(hour, 'hour');
      if (hourDesc.startsWith('every')) {
        description += `every minute during ${hourDesc}`;
      } else {
        description += `every minute of ${hourDesc === hour ? 'hour ' + hour : hourDesc}`;
      }
    } else if (hour === '*') {
      const minuteDesc = this.describeValue(minute, 'minute');
      if (minuteDesc.startsWith('every')) {
        description += `${minuteDesc} of every hour`;
      } else {
        description += `at ${minuteDesc === minute ? 'minute ' + minute : minuteDesc} past every hour`;
      }
    } else {
      description += `at ${this.describeTime(hour, minute)}`;
    }
    
    // Day description
    if (day !== '*' && weekday === '*') {
      description += ` on day ${this.describeValue(day, 'day')} of the month`;
    } else if (day === '*' && weekday !== '*') {
      description += ` on ${this.describeWeekday(weekday)}`;
    } else if (day !== '*' && weekday !== '*') {
      description += ` on day ${this.describeValue(day, 'day')} of the month and on ${this.describeWeekday(weekday)}`;
    }
    
    // Month description
    if (month !== '*') {
      description += ` in ${this.describeMonth(month)}`;
    }
    
    return description;
  }
  
  describeValue(value, type) {
    if (value === '*') return 'every ' + type;
    
    if (value.includes('/')) {
      const [range, step] = value.split('/');
      const stepNum = parseInt(step);
      const pluralType = stepNum === 1 ? type : type + 's';
      
      if (range === '*') {
        return `every ${step} ${pluralType}`;
      } else {
        return `every ${step} ${pluralType} in range ${range}`;
      }
    }
    
    if (value.includes('-')) {
      return value;
    }
    
    if (value.includes(',')) {
      return value;
    }
    
    return value;
  }
  
  describeTime(hour, minute) {
    const h = this.parseTimeValue(hour);
    const m = this.parseTimeValue(minute);
    
    if (h.includes(',') || m.includes(',')) {
      return `${hour}:${minute}`;
    }
    
    if (h.includes('every')) {
      return `minute ${minute} past ${h}`;
    }
    
    if (m.includes('every')) {
      return `${m} past hour ${hour}`;
    }
    
    // Format as time
    const hourNum = parseInt(hour);
    const minuteNum = parseInt(minute);
    if (!isNaN(hourNum) && !isNaN(minuteNum)) {
      const period = hourNum >= 12 ? 'PM' : 'AM';
      const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
      const displayMinute = minuteNum.toString().padStart(2, '0');
      return `${displayHour}:${displayMinute} ${period}`;
    }
    
    return `${hour}:${minute}`;
  }
  
  parseTimeValue(value) {
    if (value === '*') return 'every';
    if (value.includes('/')) {
      const [, step] = value.split('/');
      return `every ${step}`;
    }
    return value;
  }
  
  describeWeekday(weekday) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Map day names
    let normalized = weekday.toUpperCase();
    normalized = normalized.replace('SUN', '0').replace('MON', '1').replace('TUE', '2')
                          .replace('WED', '3').replace('THU', '4').replace('FRI', '5')
                          .replace('SAT', '6');
    
    if (normalized === '*') return 'every day';
    
    if (normalized.includes('-')) {
      const [start, end] = normalized.split('-');
      return `${days[parseInt(start)]} through ${days[parseInt(end)]}`;
    }
    
    if (normalized.includes(',')) {
      const dayList = normalized.split(',').map(d => days[parseInt(d)]);
      return dayList.join(', ');
    }
    
    const dayNum = parseInt(normalized);
    return days[dayNum % 7];
  }
  
  describeMonth(month) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Map month names
    let normalized = month.toUpperCase();
    const monthMap = {
      'JAN': '1', 'FEB': '2', 'MAR': '3', 'APR': '4', 'MAY': '5', 'JUN': '6',
      'JUL': '7', 'AUG': '8', 'SEP': '9', 'OCT': '10', 'NOV': '11', 'DEC': '12'
    };
    
    Object.keys(monthMap).forEach(name => {
      normalized = normalized.replace(name, monthMap[name]);
    });
    
    if (normalized === '*') return 'every month';
    
    if (normalized.includes('-')) {
      const [start, end] = normalized.split('-');
      return `${months[parseInt(start) - 1]} through ${months[parseInt(end) - 1]}`;
    }
    
    if (normalized.includes(',')) {
      const monthList = normalized.split(',').map(m => months[parseInt(m) - 1]);
      return monthList.join(', ');
    }
    
    return months[parseInt(normalized) - 1];
  }
  
  calculateNextRuns(minute, hour, day, month, weekday) {
    const runs = [];
    const now = new Date();
    let testDate = new Date(now);
    testDate.setSeconds(0);
    testDate.setMilliseconds(0);
    
    // Start from next minute
    testDate.setMinutes(testDate.getMinutes() + 1);
    
    let count = 0;
    let iterations = 0;
    const maxIterations = 525600; // One year of minutes
    
    while (count < 10 && iterations < maxIterations) {
      if (this.matchesCron(testDate, minute, hour, day, month, weekday)) {
        runs.push(new Date(testDate));
        count++;
      }
      testDate.setMinutes(testDate.getMinutes() + 1);
      iterations++;
    }
    
    return runs;
  }
  
  matchesCron(date, minute, hour, day, month, weekday) {
    const dateMinute = date.getMinutes();
    const dateHour = date.getHours();
    const dateDay = date.getDate();
    const dateMonth = date.getMonth() + 1;
    const dateWeekday = date.getDay();
    
    return this.matchesField(dateMinute, minute, 0, 59) &&
           this.matchesField(dateHour, hour, 0, 23) &&
           this.matchesField(dateDay, day, 1, 31) &&
           this.matchesField(dateMonth, month, 1, 12) &&
           this.matchesField(dateWeekday, weekday, 0, 6);
  }
  
  matchesField(value, pattern, min, max) {
    if (pattern === '*') return true;
    
    // Handle step values
    if (pattern.includes('/')) {
      const [range, step] = pattern.split('/');
      const stepNum = parseInt(step);
      
      if (range === '*') {
        return value % stepNum === 0;
      } else {
        const [rangeMin, rangeMax] = this.parseRange(range, min, max);
        return value >= rangeMin && value <= rangeMax && ((value - rangeMin) % stepNum === 0);
      }
    }
    
    // Handle lists
    if (pattern.includes(',')) {
      const values = pattern.split(',');
      return values.some(v => this.matchesField(value, v.trim(), min, max));
    }
    
    // Handle ranges
    if (pattern.includes('-')) {
      const [rangeMin, rangeMax] = this.parseRange(pattern, min, max);
      return value >= rangeMin && value <= rangeMax;
    }
    
    // Direct comparison
    return value === parseInt(pattern);
  }
  
  parseRange(range, min, max) {
    const [start, end] = range.split('-');
    return [parseInt(start) || min, parseInt(end) || max];
  }
  
  displayNextRuns(runs) {
    if (runs.length === 0) {
      this.container.querySelector('#next-runs-list').innerHTML = 
        '<div class="text-gray-500 dark:text-gray-400 text-center py-4">No upcoming executions found</div>';
      return;
    }
    
    const html = runs.map((date, index) => {
      const relative = this.getRelativeTime(date);
      return `
        <div class="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <span class="font-semibold text-green-600 dark:text-green-400 text-sm">${index + 1}.</span>
          <span class="font-mono text-sm text-gray-900 dark:text-white">${date.toLocaleString()}</span>
          <span class="text-sm text-gray-600 dark:text-gray-400">${relative}</span>
        </div>
      `;
    }).join('');
    
    this.container.querySelector('#next-runs-list').innerHTML = html;
  }
  
  getRelativeTime(date) {
    const now = new Date();
    const diff = date - now;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 60) {
      return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (hours < 24) {
      const mins = minutes % 60;
      return `in ${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
    } else {
      return `in ${days} day${days !== 1 ? 's' : ''}`;
    }
  }
  
  clearResults() {
    this.container.querySelector('#field-minute').textContent = '-';
    this.container.querySelector('#field-hour').textContent = '-';
    this.container.querySelector('#field-day').textContent = '-';
    this.container.querySelector('#field-month').textContent = '-';
    this.container.querySelector('#field-weekday').textContent = '-';
    this.container.querySelector('#description-text').textContent = 'Enter a cron expression to see its description';
    this.container.querySelector('#next-runs-list').innerHTML = 
      '<div class="text-gray-500 dark:text-gray-400 text-center py-4">Parse a cron expression to see upcoming execution times</div>';
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