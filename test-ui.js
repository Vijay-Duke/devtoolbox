// Test UI functionality
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Console error:', msg.text());
    }
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    console.log('Page error:', error.message);
  });
  
  try {
    await page.goto('http://localhost:8081/', { waitUntil: 'networkidle2' });
    
    // Check if main elements exist
    const hasHeader = await page.$('.header') !== null;
    const hasSidebar = await page.$('.sidebar') !== null;
    const hasMain = await page.$('.main') !== null;
    
    console.log('Header exists:', hasHeader);
    console.log('Sidebar exists:', hasSidebar);
    console.log('Main exists:', hasMain);
    
    // Test navigation to a tool
    await page.click('a[href="#json-formatter"]');
    await page.waitForTimeout(1000);
    
    const toolContainer = await page.$('.tool-container');
    console.log('Tool container loaded:', toolContainer !== null);
    
    // Test theme toggle
    await page.click('[data-theme-toggle]');
    await page.waitForTimeout(500);
    
    const isDarkTheme = await page.evaluate(() => {
      return document.documentElement.getAttribute('data-theme') === 'dark';
    });
    console.log('Dark theme toggled:', isDarkTheme);
    
    console.log('UI test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
  
  await browser.close();
})();