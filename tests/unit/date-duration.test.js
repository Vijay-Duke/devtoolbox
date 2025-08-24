import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DateDurationCalculator } from '../../js/tools/date-duration.js';

// Mock localStorage for testing
const mockLocalStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value.toString();
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock DOM elements
const mockElement = {
  innerHTML: '',
  querySelector: vi.fn(() => mockElement),
  querySelectorAll: vi.fn(() => []),
  addEventListener: vi.fn(),
  classList: {
    add: vi.fn(),
    remove: vi.fn()
  },
  textContent: '',
  value: '',
  checked: false,
  appendChild: vi.fn(),
  createElement: vi.fn(() => mockElement),
  className: ''
};

// Mock document
global.document = {
  getElementById: vi.fn(() => mockElement),
  createElement: vi.fn(() => mockElement)
};

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('DateDurationCalculator', () => {
  let calculator;

  beforeEach(() => {
    mockLocalStorage.clear();
    mockFetch.mockClear();
    calculator = new DateDurationCalculator();
    calculator.container = mockElement;
    
    // Mock the essential DOM elements that the calculator expects
    calculator.startDateInput = mockElement;
    calculator.endDateInput = mockElement;
    calculator.includeEndDateCheckbox = mockElement;
    calculator.excludeWeekendsCheckbox = mockElement;
    calculator.excludeHolidaysCheckbox = mockElement;
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with correct default values', () => {
      const newCalculator = new DateDurationCalculator();
      expect(newCalculator).toBeDefined();
      expect(newCalculator.container).toBeNull();
      expect(newCalculator.startDateInput).toBeNull();
      expect(newCalculator.endDateInput).toBeNull();
      expect(newCalculator.userCountry).toBeNull();
      expect(newCalculator.settings).toBeDefined();
      expect(newCalculator.settings.excludeWeekends).toBe(true);
      expect(newCalculator.settings.excludeHolidays).toBe(true);
    });

    it('should be able to import DateDurationCalculator class', async () => {
      const { DateDurationCalculator } = await import('../../js/tools/date-duration.js');
      expect(DateDurationCalculator).toBeDefined();
      expect(typeof DateDurationCalculator).toBe('function');
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly for input', () => {
      const date = new Date('2024-03-15');
      const formatted = calculator.formatDateForInput(date);
      expect(formatted).toBe('2024-03-15');
    });

    it('should handle edge case dates', () => {
      const date = new Date('2024-01-01');
      const formatted = calculator.formatDateForInput(date);
      expect(formatted).toBe('2024-01-01');
    });
  });

  describe('Duration Calculations', () => {
    it('should calculate basic duration correctly', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-02');
      const duration = calculator.getDuration(startDate, endDate);
      
      expect(duration.years).toBe(0);
      expect(duration.months).toBe(0);
      expect(duration.days).toBe(1);
      expect(duration.totalDays).toBe(1);
      expect(duration.isNegative).toBe(false);
    });

    it('should calculate duration with months and years', () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2024-03-15');
      const duration = calculator.getDuration(startDate, endDate);
      
      expect(duration.years).toBe(1);
      expect(duration.months).toBe(2);
      expect(duration.days).toBe(14);
      expect(duration.isNegative).toBe(false);
    });

    it('should handle negative duration', () => {
      const startDate = new Date('2024-01-02');
      const endDate = new Date('2024-01-01');
      const duration = calculator.getDuration(startDate, endDate);
      
      expect(duration.isNegative).toBe(true);
    });

    it('should calculate business days excluding weekends', () => {
      // Monday to Friday (5 business days)
      const startDate = new Date('2024-01-01'); // Monday
      const endDate = new Date('2024-01-06'); // Saturday
      const duration = calculator.getDuration(startDate, endDate);
      
      expect(duration.totalDays).toBe(5);
    });

    it('should calculate total weeks and hours correctly', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-15'); // 14 days
      const duration = calculator.getDuration(startDate, endDate);
      
      expect(duration.totalDays).toBe(14);
      expect(duration.totalWeeks).toBe(2);
      expect(duration.totalHours).toBe(14 * 24);
    });
  });

  describe('Settings Management', () => {
    it('should save settings to localStorage', () => {
      calculator.excludeWeekendsCheckbox = { checked: false };
      calculator.excludeHolidaysCheckbox = { checked: true };
      calculator.userCountry = 'US';
      calculator.userState = 'CA';
      
      calculator.saveSettings();
      
      const saved = JSON.parse(mockLocalStorage.getItem('date-duration-settings'));
      expect(saved.excludeWeekends).toBe(false);
      expect(saved.excludeHolidays).toBe(true);
      expect(saved.selectedCountry).toBe('US');
      expect(saved.selectedState).toBe('CA');
    });

    it('should load settings from localStorage', () => {
      const testSettings = {
        excludeWeekends: false,
        excludeHolidays: true,
        selectedCountry: 'GB',
        selectedState: null
      };
      mockLocalStorage.setItem('date-duration-settings', JSON.stringify(testSettings));
      
      calculator.loadSettings();
      
      expect(calculator.settings.excludeWeekends).toBe(false);
      expect(calculator.settings.excludeHolidays).toBe(true);
      expect(calculator.settings.selectedCountry).toBe('GB');
    });

    it('should use default settings when localStorage is empty', () => {
      calculator.loadSettings();
      
      expect(calculator.settings.excludeWeekends).toBe(true);
      expect(calculator.settings.excludeHolidays).toBe(true);
    });
  });

  describe('Preset Applications', () => {
    beforeEach(() => {
      calculator.startDateInput = { value: '' };
      calculator.endDateInput = { value: '' };
    });

    it('should apply today-tomorrow preset correctly', () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      calculator.applyPreset('today-tomorrow');
      
      expect(calculator.startDateInput.value).toBe(calculator.formatDateForInput(today));
      expect(calculator.endDateInput.value).toBe(calculator.formatDateForInput(tomorrow));
    });

    it('should apply this-week preset correctly', () => {
      calculator.applyPreset('this-week');
      
      expect(calculator.startDateInput.value).toBeDefined();
      expect(calculator.endDateInput.value).toBeDefined();
    });

    it('should apply this-month preset correctly', () => {
      const today = new Date();
      calculator.applyPreset('this-month');
      
      const expectedStart = calculator.formatDateForInput(new Date(today.getFullYear(), today.getMonth(), 1));
      const expectedEnd = calculator.formatDateForInput(new Date(today.getFullYear(), today.getMonth() + 1, 0));
      
      expect(calculator.startDateInput.value).toBe(expectedStart);
      expect(calculator.endDateInput.value).toBe(expectedEnd);
    });

    it('should apply this-year preset correctly', () => {
      const today = new Date();
      calculator.applyPreset('this-year');
      
      const expectedStart = calculator.formatDateForInput(new Date(today.getFullYear(), 0, 1));
      const expectedEnd = calculator.formatDateForInput(new Date(today.getFullYear(), 11, 31));
      
      expect(calculator.startDateInput.value).toBe(expectedStart);
      expect(calculator.endDateInput.value).toBe(expectedEnd);
    });

    it('should handle invalid preset gracefully', () => {
      const originalStartValue = calculator.startDateInput.value;
      calculator.applyPreset('invalid-preset');
      
      expect(calculator.startDateInput.value).toBe(originalStartValue);
    });
  });

  describe('Holiday Functionality', () => {
    it('should detect country from timezone', () => {
      // Mock Intl.DateTimeFormat
      global.Intl = {
        DateTimeFormat: vi.fn(() => ({
          resolvedOptions: () => ({ timeZone: 'America/New_York' })
        }))
      };
      
      const result = calculator.detectCountryFromTimezone();
      expect(result).toEqual({ country: 'US', state: 'US-NY' });
    });

    it('should return null for unknown timezone', () => {
      global.Intl = {
        DateTimeFormat: vi.fn(() => ({
          resolvedOptions: () => ({ timeZone: 'Unknown/Timezone' })
        }))
      };
      
      const result = calculator.detectCountryFromTimezone();
      expect(result).toBeNull();
    });

    it('should filter holidays by state correctly', () => {
      const holidays = [
        { date: '2024-01-01', name: 'New Year', global: true },
        { date: '2024-01-15', name: 'State Holiday', global: false, counties: ['US-CA'] },
        { date: '2024-02-14', name: 'Valentine', global: false, counties: ['US-NY'] }
      ];
      
      const filtered = calculator.filterHolidaysByState(holidays, 'US-CA');
      expect(filtered).toHaveLength(2); // Global + CA specific
      expect(filtered.find(h => h.name === 'State Holiday')).toBeDefined();
      expect(filtered.find(h => h.name === 'Valentine')).toBeUndefined();
    });

    it('should return all holidays when no state specified', () => {
      const holidays = [
        { date: '2024-01-01', name: 'New Year', global: true },
        { date: '2024-01-15', name: 'State Holiday', global: false, counties: ['US-CA'] }
      ];
      
      const filtered = calculator.filterHolidaysByState(holidays, null);
      expect(filtered).toEqual(holidays);
    });
  });

  describe('Cache Management', () => {
    it('should store and retrieve from cache', () => {
      const testData = { test: 'data' };
      calculator.setCache('test-key', testData, 1000);
      
      const retrieved = calculator.getFromCache('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('should return null for expired cache', () => {
      const testData = { test: 'data' };
      calculator.setCache('test-key', testData, -1000); // Expired
      
      const retrieved = calculator.getFromCache('test-key');
      expect(retrieved).toBeNull();
    });

    it('should return null for non-existent cache key', () => {
      const retrieved = calculator.getFromCache('non-existent-key');
      expect(retrieved).toBeNull();
    });

    it('should handle cache errors gracefully', () => {
      // Mock localStorage to throw error
      mockLocalStorage.getItem = vi.fn(() => {
        throw new Error('Storage error');
      });
      
      const retrieved = calculator.getFromCache('test-key');
      expect(retrieved).toBeNull();
    });
  });

  describe('State Options', () => {
    it('should return US states correctly', () => {
      const usStates = calculator.getStateOptions('US');
      expect(usStates).toHaveLength(50);
      expect(usStates.find(s => s.code === 'US-CA' && s.name === 'California')).toBeDefined();
      expect(usStates.find(s => s.code === 'US-NY' && s.name === 'New York')).toBeDefined();
    });

    it('should return Canadian provinces correctly', () => {
      const caProvinces = calculator.getStateOptions('CA');
      expect(caProvinces.length).toBeGreaterThan(0);
      expect(caProvinces.find(s => s.code === 'CA-ON' && s.name === 'Ontario')).toBeDefined();
    });

    it('should return Australian states correctly', () => {
      const auStates = calculator.getStateOptions('AU');
      expect(auStates.length).toBeGreaterThan(0);
      expect(auStates.find(s => s.code === 'AU-NSW' && s.name === 'New South Wales')).toBeDefined();
    });

    it('should return empty array for unsupported country', () => {
      const unknownStates = calculator.getStateOptions('ZZ');
      expect(unknownStates).toEqual([]);
    });
  });

  describe('Country Name Resolution', () => {
    it('should return country name when available', () => {
      calculator.availableCountries = [
        { countryCode: 'US', name: 'United States' },
        { countryCode: 'GB', name: 'United Kingdom' }
      ];
      
      expect(calculator.getCountryName('US')).toBe('United States');
      expect(calculator.getCountryName('GB')).toBe('United Kingdom');
    });

    it('should return country code when name not available', () => {
      calculator.availableCountries = [];
      expect(calculator.getCountryName('US')).toBe('US');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid dates gracefully in duration calculation', () => {
      const invalidDate = new Date('invalid');
      const validDate = new Date('2024-01-01');
      
      const duration = calculator.getDuration(invalidDate, validDate);
      expect(isNaN(duration.totalDays)).toBe(true);
    });

    it('should handle localStorage errors when saving settings', () => {
      calculator.excludeWeekendsCheckbox = { checked: true };
      calculator.excludeHolidaysCheckbox = { checked: false };
      
      // Mock localStorage to throw error
      mockLocalStorage.setItem = vi.fn(() => {
        throw new Error('Storage error');
      });
      
      expect(() => calculator.saveSettings()).not.toThrow();
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      const countries = await calculator.fetchAvailableCountries();
      expect(countries).toEqual([]);
    });
  });

  describe('UI Updates', () => {
    let mockElements;
    
    beforeEach(() => {
      // Create mock elements that can track textContent changes
      mockElements = {
        '#result-detailed': { textContent: '' },
        '#result-total-days': { textContent: '' },
        '#result-business-days': { textContent: '' },
        '#result-weeks': { textContent: '' },
        '#result-hours': { textContent: '' },
        '#holidays-display': { classList: { add: vi.fn(), remove: vi.fn() } },
        '#holidays-list': { innerHTML: '' }
      };
      
      calculator.container = {
        querySelector: vi.fn((selector) => {
          return mockElements[selector] || mockElement;
        })
      };
    });

    it('should update results correctly', () => {
      const duration = {
        years: 1,
        months: 2,
        days: 15,
        totalDays: 440,
        totalWeeks: 62,
        totalHours: 10560,
        businessDays: 314,
        isNegative: false
      };
      
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2024-03-16');
      
      calculator.updateResults(duration, startDate, endDate, false, []);
      
      expect(mockElements['#result-detailed'].textContent).toBe('1 year, 2 months, 15 days');
      expect(mockElements['#result-total-days'].textContent).toBe('440');
    });

    it('should handle zero duration correctly', () => {
      const duration = {
        years: 0,
        months: 0,
        days: 0,
        totalDays: 0,
        totalWeeks: 0,
        totalHours: 0,
        businessDays: 0,
        isNegative: false
      };
      
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-01');
      
      calculator.updateResults(duration, startDate, endDate, false, []);
      
      expect(mockElements['#result-detailed'].textContent).toBe('0 days');
    });
  });

  describe('Long Weekend Functionality', () => {
    beforeEach(() => {
      // Add mock elements for long weekends
      calculator.container = {
        querySelector: vi.fn((selector) => {
          const mockElements = {
            '#long-weekends-display': { 
              classList: { add: vi.fn(), remove: vi.fn() } 
            },
            '#long-weekends-list': { innerHTML: '', appendChild: vi.fn() }
          };
          return mockElements[selector] || mockElement;
        })
      };
    });

    describe('identifyLongWeekends', () => {
      it('should identify holiday on Monday as 3-day weekend', () => {
        const holidays = [
          { 
            date: '2024-01-15', // Monday
            name: 'Martin Luther King Jr. Day' 
          }
        ];

        const longWeekends = calculator.identifyLongWeekends(holidays);
        
        expect(longWeekends).toHaveLength(1);
        expect(longWeekends[0].type).toBe('3-day weekend');
        expect(longWeekends[0].days).toBe(3);
        expect(longWeekends[0].vacationDaysNeeded).toBe(0);
      });

      it('should identify holiday on Friday as 3-day weekend', () => {
        const holidays = [
          { 
            date: '2024-07-04', // Thursday - but let's test with a Friday
            name: 'Independence Day' 
          }
        ];
        
        // Mock a Friday holiday
        const fridayHoliday = [
          { 
            date: '2024-07-05', // Assuming this is a Friday
            name: 'Independence Day Observed' 
          }
        ];

        const longWeekends = calculator.identifyLongWeekends(fridayHoliday);
        
        expect(longWeekends).toHaveLength(1);
        expect(longWeekends[0].type).toBe('3-day weekend');
        expect(longWeekends[0].days).toBe(3);
      });

      it('should identify holiday on Thursday as 4-day weekend opportunity', () => {
        const holidays = [
          { 
            date: '2024-07-04', // Thursday
            name: 'Independence Day' 
          }
        ];

        const longWeekends = calculator.identifyLongWeekends(holidays);
        
        expect(longWeekends).toHaveLength(1);
        expect(longWeekends[0].type).toBe('4-day weekend (take Friday off)');
        expect(longWeekends[0].days).toBe(4);
        expect(longWeekends[0].vacationDaysNeeded).toBe(1);
        expect(longWeekends[0].bridgeDay).toBe('Friday');
      });

      it('should identify holiday on Tuesday as 4-day weekend opportunity', () => {
        const holidays = [
          { 
            date: '2024-11-05', // Assuming this is a Tuesday
            name: 'Election Day' 
          }
        ];

        const longWeekends = calculator.identifyLongWeekends(holidays);
        
        expect(longWeekends).toHaveLength(1);
        expect(longWeekends[0].type).toBe('4-day weekend (take Monday off)');
        expect(longWeekends[0].days).toBe(4);
        expect(longWeekends[0].vacationDaysNeeded).toBe(1);
        expect(longWeekends[0].bridgeDay).toBe('Monday');
      });

      it('should handle consecutive holidays', () => {
        const holidays = [
          { 
            date: '2024-12-24', 
            name: 'Christmas Eve' 
          },
          { 
            date: '2024-12-25', 
            name: 'Christmas Day' 
          }
        ];

        const longWeekends = calculator.identifyLongWeekends(holidays);
        
        // Should find the consecutive holiday pattern
        const consecutiveWeekend = longWeekends.find(w => w.isConsecutive);
        expect(consecutiveWeekend).toBeDefined();
        expect(consecutiveWeekend.type).toContain('extended weekend');
      });

      it('should handle no holidays gracefully', () => {
        const longWeekends = calculator.identifyLongWeekends([]);
        expect(longWeekends).toHaveLength(0);
      });

      it('should handle holidays on weekends (no long weekend)', () => {
        const holidays = [
          { 
            date: '2024-01-06', // Saturday
            name: 'Epiphany' 
          },
          { 
            date: '2024-01-07', // Sunday
            name: 'Orthodox Christmas' 
          }
        ];

        const longWeekends = calculator.identifyLongWeekends(holidays);
        
        // Weekends don't create long weekends by themselves (Saturday=6, Sunday=0)
        expect(longWeekends).toHaveLength(0);
      });

      it('should remove duplicates and sort by date', () => {
        const holidays = [
          { date: '2024-02-19', name: 'Presidents Day' }, // Monday
          { date: '2024-01-15', name: 'MLK Day' }, // Monday
        ];

        const longWeekends = calculator.identifyLongWeekends(holidays);
        
        expect(longWeekends).toHaveLength(2);
        // Should be sorted by start date (January before February)
        expect(new Date(longWeekends[0].holiday.date) < new Date(longWeekends[1].holiday.date)).toBe(true);
      });
    });

    describe('displayLongWeekends', () => {
      it('should hide display when no holidays provided', () => {
        const mockDisplay = { classList: { add: vi.fn(), remove: vi.fn() } };
        calculator.container.querySelector = vi.fn(() => mockDisplay);

        calculator.displayLongWeekends([]);

        expect(mockDisplay.classList.add).toHaveBeenCalledWith('hidden');
      });

      it('should hide display when no long weekends found', () => {
        const holidays = [
          { date: '2024-07-06', name: 'Saturday Holiday' } // Saturday - no long weekend
        ];
        
        const mockDisplay = { classList: { add: vi.fn(), remove: vi.fn() } };
        calculator.container.querySelector = vi.fn(() => mockDisplay);

        calculator.displayLongWeekends(holidays);

        expect(mockDisplay.classList.add).toHaveBeenCalledWith('hidden');
      });

      it('should show display when long weekends are found', () => {
        const holidays = [
          { date: '2024-01-15', name: 'MLK Day' } // Monday
        ];
        
        const mockDisplay = { classList: { add: vi.fn(), remove: vi.fn() } };
        const mockList = { innerHTML: '', appendChild: vi.fn() };
        
        calculator.container.querySelector = vi.fn((selector) => {
          if (selector === '#long-weekends-display') return mockDisplay;
          if (selector === '#long-weekends-list') return mockList;
          return mockElement;
        });

        calculator.displayLongWeekends(holidays);

        expect(mockDisplay.classList.remove).toHaveBeenCalledWith('hidden');
        expect(mockList.appendChild).toHaveBeenCalled();
      });
    });
  });
});