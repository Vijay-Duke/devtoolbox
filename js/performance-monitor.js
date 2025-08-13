// Performance Monitor - Track and optimize application performance
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoad: {},
      toolLoad: {},
      operations: {},
      memory: []
    };
    this.observers = new Map();
    this.enabled = this.shouldEnable();
    
    if (this.enabled) {
      this.init();
    }
  }
  
  shouldEnable() {
    // Enable in development or with debug flag
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('debug') || 
           localStorage.getItem('debug-mode') === 'true' ||
           window.location.hostname === 'localhost';
  }
  
  init() {
    this.measurePageLoad();
    this.setupObservers();
    this.monitorMemory();
    this.trackToolLoading();
    this.createDebugPanel();
  }
  
  measurePageLoad() {
    // Use Navigation Timing API
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.metrics.pageLoad = {
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            pageLoad: timing.loadEventEnd - timing.navigationStart,
            domInteractive: timing.domInteractive - timing.navigationStart,
            firstPaint: this.getFirstPaint(),
            resources: this.getResourceTimings()
          };
          
          this.logMetrics('Page Load Metrics', this.metrics.pageLoad);
        }, 0);
      });
    }
  }
  
  getFirstPaint() {
    if (window.performance && window.performance.getEntriesByType) {
      const paintEntries = window.performance.getEntriesByType('paint');
      const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
      const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      
      return {
        firstPaint: firstPaint ? firstPaint.startTime : null,
        firstContentfulPaint: firstContentfulPaint ? firstContentfulPaint.startTime : null
      };
    }
    return null;
  }
  
  getResourceTimings() {
    if (window.performance && window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource');
      
      return resources.map(resource => ({
        name: resource.name.split('/').pop(),
        duration: resource.duration,
        size: resource.transferSize || 0,
        type: resource.initiatorType
      })).sort((a, b) => b.duration - a.duration).slice(0, 10);
    }
    return [];
  }
  
  setupObservers() {
    // Observe long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Tasks longer than 50ms
              console.warn('Long task detected:', {
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name
              });
            }
          }
        });
        
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.set('longtask', longTaskObserver);
      } catch (e) {
        console.log('Long task observer not supported');
      }
      
      // Observe layout shifts
      try {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          let cls = 0;
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              cls += entry.value;
            }
          }
          
          if (cls > 0.1) { // Significant layout shift
            console.warn('Layout shift detected:', cls);
          }
        });
        
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('layout-shift', layoutShiftObserver);
      } catch (e) {
        console.log('Layout shift observer not supported');
      }
    }
  }
  
  monitorMemory() {
    if (performance.memory) {
      setInterval(() => {
        const memoryInfo = {
          timestamp: Date.now(),
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
        
        this.metrics.memory.push(memoryInfo);
        
        // Keep only last 100 entries
        if (this.metrics.memory.length > 100) {
          this.metrics.memory.shift();
        }
        
        // Check for memory leaks
        if (this.metrics.memory.length > 10) {
          const recent = this.metrics.memory.slice(-10);
          const avgGrowth = recent.reduce((acc, curr, i) => {
            if (i === 0) return 0;
            return acc + (curr.usedJSHeapSize - recent[i - 1].usedJSHeapSize);
          }, 0) / 9;
          
          if (avgGrowth > 1000000) { // 1MB average growth
            console.warn('Potential memory leak detected:', {
              averageGrowth: this.formatBytes(avgGrowth),
              currentUsage: this.formatBytes(memoryInfo.usedJSHeapSize)
            });
          }
        }
      }, 10000); // Check every 10 seconds
    }
  }
  
  trackToolLoading() {
    // Track tool loading times
    window.addEventListener('hashchange', () => {
      const tool = window.location.hash.slice(1);
      if (tool) {
        const startTime = performance.now();
        
        // Wait for tool to load
        const checkLoaded = setInterval(() => {
          const toolContainer = document.querySelector('.tool-container');
          if (toolContainer) {
            clearInterval(checkLoaded);
            const loadTime = performance.now() - startTime;
            
            if (!this.metrics.toolLoad[tool]) {
              this.metrics.toolLoad[tool] = [];
            }
            
            this.metrics.toolLoad[tool].push(loadTime);
            
            if (loadTime > 1000) {
              console.warn(`Tool ${tool} took ${loadTime.toFixed(2)}ms to load`);
            }
          }
        }, 10);
        
        // Timeout after 5 seconds
        setTimeout(() => clearInterval(checkLoaded), 5000);
      }
    });
  }
  
  measureOperation(name, operation) {
    const startTime = performance.now();
    const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    
    const result = operation();
    
    const duration = performance.now() - startTime;
    const memoryUsed = performance.memory ? 
      performance.memory.usedJSHeapSize - startMemory : 0;
    
    if (!this.metrics.operations[name]) {
      this.metrics.operations[name] = [];
    }
    
    this.metrics.operations[name].push({
      duration,
      memoryUsed,
      timestamp: Date.now()
    });
    
    if (duration > 100) {
      console.warn(`Operation ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }
  
  createDebugPanel() {
    const panel = document.createElement('div');
    panel.className = 'debug-panel';
    panel.innerHTML = `
      <div class="debug-header">
        <span>Performance Monitor</span>
        <button class="debug-toggle">_</button>
      </div>
      <div class="debug-content">
        <div class="debug-section">
          <h4>Page Metrics</h4>
          <div id="page-metrics"></div>
        </div>
        <div class="debug-section">
          <h4>Memory Usage</h4>
          <div id="memory-metrics"></div>
        </div>
        <div class="debug-section">
          <h4>Tool Load Times</h4>
          <div id="tool-metrics"></div>
        </div>
        <div class="debug-actions">
          <button id="clear-metrics">Clear</button>
          <button id="export-metrics">Export</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);
    
    // Toggle panel
    panel.querySelector('.debug-toggle').addEventListener('click', () => {
      panel.classList.toggle('minimized');
    });
    
    // Clear metrics
    panel.querySelector('#clear-metrics').addEventListener('click', () => {
      this.clearMetrics();
    });
    
    // Export metrics
    panel.querySelector('#export-metrics').addEventListener('click', () => {
      this.exportMetrics();
    });
    
    // Update metrics display
    setInterval(() => this.updateDebugPanel(), 2000);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .debug-panel {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 300px;
        background: rgba(0, 0, 0, 0.9);
        color: #0f0;
        font-family: monospace;
        font-size: 12px;
        border: 1px solid #0f0;
        border-radius: 4px;
        z-index: 99999;
        transition: all 300ms;
      }
      
      .debug-panel.minimized {
        height: 30px;
        overflow: hidden;
      }
      
      .debug-header {
        padding: 8px;
        border-bottom: 1px solid #0f0;
        display: flex;
        justify-content: space-between;
        cursor: move;
      }
      
      .debug-toggle {
        background: none;
        border: 1px solid #0f0;
        color: #0f0;
        cursor: pointer;
        padding: 0 8px;
      }
      
      .debug-content {
        padding: 8px;
        max-height: 400px;
        overflow-y: auto;
      }
      
      .debug-section {
        margin-bottom: 15px;
      }
      
      .debug-section h4 {
        margin: 0 0 5px 0;
        color: #0f0;
        font-size: 11px;
        text-transform: uppercase;
      }
      
      .debug-metric {
        display: flex;
        justify-content: space-between;
        padding: 2px 0;
      }
      
      .debug-metric-label {
        color: #090;
      }
      
      .debug-metric-value {
        color: #0f0;
      }
      
      .debug-actions {
        display: flex;
        gap: 10px;
        margin-top: 10px;
      }
      
      .debug-actions button {
        flex: 1;
        background: none;
        border: 1px solid #0f0;
        color: #0f0;
        padding: 4px;
        cursor: pointer;
      }
      
      .debug-actions button:hover {
        background: #0f0;
        color: #000;
      }
    `;
    document.head.appendChild(style);
    
    // Make panel draggable
    this.makeDraggable(panel);
  }
  
  makeDraggable(element) {
    const header = element.querySelector('.debug-header');
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = element.getBoundingClientRect();
      initialX = rect.left;
      initialY = rect.top;
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      element.style.left = `${initialX + deltaX}px`;
      element.style.top = `${initialY + deltaY}px`;
      element.style.right = 'auto';
      element.style.bottom = 'auto';
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }
  
  updateDebugPanel() {
    // Update page metrics
    const pageMetrics = document.getElementById('page-metrics');
    if (pageMetrics && this.metrics.pageLoad.domContentLoaded) {
      pageMetrics.innerHTML = `
        <div class="debug-metric">
          <span class="debug-metric-label">DOM Ready:</span>
          <span class="debug-metric-value">${this.metrics.pageLoad.domContentLoaded}ms</span>
        </div>
        <div class="debug-metric">
          <span class="debug-metric-label">Page Load:</span>
          <span class="debug-metric-value">${this.metrics.pageLoad.pageLoad}ms</span>
        </div>
      `;
    }
    
    // Update memory metrics
    const memoryMetrics = document.getElementById('memory-metrics');
    if (memoryMetrics && performance.memory) {
      const current = performance.memory;
      memoryMetrics.innerHTML = `
        <div class="debug-metric">
          <span class="debug-metric-label">Used:</span>
          <span class="debug-metric-value">${this.formatBytes(current.usedJSHeapSize)}</span>
        </div>
        <div class="debug-metric">
          <span class="debug-metric-label">Total:</span>
          <span class="debug-metric-value">${this.formatBytes(current.totalJSHeapSize)}</span>
        </div>
      `;
    }
    
    // Update tool metrics
    const toolMetrics = document.getElementById('tool-metrics');
    if (toolMetrics) {
      const recentTools = Object.entries(this.metrics.toolLoad)
        .slice(-5)
        .map(([tool, times]) => {
          const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
          return `
            <div class="debug-metric">
              <span class="debug-metric-label">${tool}:</span>
              <span class="debug-metric-value">${avgTime.toFixed(0)}ms</span>
            </div>
          `;
        }).join('');
      
      toolMetrics.innerHTML = recentTools || '<div>No tools loaded yet</div>';
    }
  }
  
  clearMetrics() {
    this.metrics = {
      pageLoad: {},
      toolLoad: {},
      operations: {},
      memory: []
    };
    console.log('Metrics cleared');
  }
  
  exportMetrics() {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      userAgent: navigator.userAgent,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        pixelRatio: window.devicePixelRatio
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  logMetrics(label, metrics) {
    if (this.enabled) {
      console.group(`📊 ${label}`);
      console.table(metrics);
      console.groupEnd();
    }
  }
  
  destroy() {
    // Clean up observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    // Remove debug panel
    const panel = document.querySelector('.debug-panel');
    if (panel) {
      panel.remove();
    }
  }
}

// Auto-initialize in development
if (window.location.hostname === 'localhost' || new URLSearchParams(window.location.search).has('debug')) {
  window.performanceMonitor = new PerformanceMonitor();
}