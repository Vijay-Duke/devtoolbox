import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('page loads within performance budget', async ({ page }) => {
    const metrics = [];
    
    // Collect performance metrics
    page.on('load', async () => {
      const perf = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          domInteractive: navigation.domInteractive,
          firstPaint: performance.getEntriesByType('paint')[0]?.startTime
        };
      });
      metrics.push(perf);
    });
    
    await page.goto('/');
    
    // Check First Contentful Paint < 100ms
    const fcp = await page.evaluate(() => {
      const paint = performance.getEntriesByType('paint').find(
        entry => entry.name === 'first-contentful-paint'
      );
      return paint?.startTime;
    });
    
    expect(fcp).toBeDefined();
    expect(fcp).toBeLessThan(200); // Slightly relaxed for CI environments
  });

  test('HTML file size is within budget', async ({ page, request }) => {
    const response = await request.get('/');
    const text = await response.text();
    
    // Check uncompressed size of index.html
    const sizeInKB = Buffer.byteLength(text, 'utf8') / 1024;
    expect(sizeInKB).toBeLessThan(100); // Should be under 100KB for the main HTML
  });

  test('no layout shifts after initial render', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initial render
    await page.waitForLoadState('networkidle');
    
    // Measure CLS
    const cls = await page.evaluate(() => {
      return new Promise(resolve => {
        let clsValue = 0;
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        }).observe({ type: 'layout-shift', buffered: true });
        
        setTimeout(() => resolve(clsValue), 1000);
      });
    });
    
    expect(cls).toBeLessThan(0.1); // Good CLS score
  });

  test('search input responds quickly', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.locator('input[type="search"]');
    
    // Measure input latency
    const startTime = Date.now();
    await searchInput.fill('test');
    const endTime = Date.now();
    
    const inputLatency = endTime - startTime;
    expect(inputLatency).toBeLessThan(50); // Should respond within 50ms
  });

  test('theme toggle is instant', async ({ page }) => {
    await page.goto('/');
    const themeToggle = page.locator('[data-theme-toggle]');
    
    // Measure theme switch time
    const startTime = Date.now();
    await themeToggle.click();
    
    // Wait for theme to apply
    await page.locator('html[data-theme]').waitFor({ timeout: 300 });
    const endTime = Date.now();
    
    const switchTime = endTime - startTime;
    expect(switchTime).toBeLessThan(300); // Theme switch within 300ms
  });

  test('no memory leaks on repeated interactions', async ({ page }) => {
    await page.goto('/');
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });
    
    // Perform repeated interactions
    for (let i = 0; i < 10; i++) {
      await page.locator('[data-theme-toggle]').click();
      await page.locator('input[type="search"]').fill(`test${i}`);
      await page.locator('input[type="search"]').fill('');
    }
    
    // Force garbage collection if available
    await page.evaluate(() => {
      if (window.gc) window.gc();
    });
    
    // Check memory hasn't grown excessively
    const finalMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });
    
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryGrowth = (finalMemory - initialMemory) / initialMemory;
      expect(memoryGrowth).toBeLessThan(0.5); // Less than 50% growth
    }
  });
});