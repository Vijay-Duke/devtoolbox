import { test, expect } from '@playwright/test';

test.describe('Theme Toggle Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage to start fresh
    await page.evaluate(() => localStorage.clear());
  });

  test('defaults to system preference', async ({ page }) => {
    // Check if theme follows system preference
    const isDarkMode = await page.evaluate(() => 
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
    
    const htmlElement = page.locator('html');
    if (isDarkMode) {
      await expect(htmlElement).toHaveAttribute('data-theme', 'dark');
    } else {
      const theme = await htmlElement.getAttribute('data-theme');
      expect(theme === null || theme === 'light').toBeTruthy();
    }
  });

  test('toggles between light and dark themes', async ({ page }) => {
    const themeToggle = page.locator('[data-theme-toggle]');
    const htmlElement = page.locator('html');
    
    // Get initial theme
    const initialTheme = await htmlElement.getAttribute('data-theme') || 'light';
    
    // Click toggle
    await themeToggle.click();
    
    // Check theme changed
    const newTheme = await htmlElement.getAttribute('data-theme');
    expect(newTheme).not.toBe(initialTheme);
    
    // Toggle back
    await themeToggle.click();
    const finalTheme = await htmlElement.getAttribute('data-theme');
    expect(finalTheme).toBe(initialTheme === 'light' ? 'light' : 'dark');
  });

  test('persists theme preference in localStorage', async ({ page }) => {
    const themeToggle = page.locator('[data-theme-toggle]');
    
    // Set to dark theme
    await themeToggle.click();
    const htmlElement = page.locator('html');
    const currentTheme = await htmlElement.getAttribute('data-theme');
    
    // Check localStorage
    const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBe(currentTheme);
    
    // Reload page and verify theme persists
    await page.reload();
    await expect(htmlElement).toHaveAttribute('data-theme', currentTheme);
  });

  test('theme toggle with keyboard shortcut (T)', async ({ page }) => {
    const htmlElement = page.locator('html');
    const initialTheme = await htmlElement.getAttribute('data-theme') || 'light';
    
    // Press T key
    await page.keyboard.press('t');
    
    // Check theme changed
    const newTheme = await htmlElement.getAttribute('data-theme');
    expect(newTheme).not.toBe(initialTheme);
  });

  test('correct icons display for each theme', async ({ page }) => {
    const htmlElement = page.locator('html');
    const lightIcon = page.locator('.theme-icon-light');
    const darkIcon = page.locator('.theme-icon-dark');
    
    // Set to light theme
    await htmlElement.evaluate(el => el.setAttribute('data-theme', 'light'));
    
    // In light theme, dark icon should be visible (to switch to dark)
    const lightIconStyle = await lightIcon.evaluate(el => window.getComputedStyle(el).display);
    const darkIconStyle = await darkIcon.evaluate(el => window.getComputedStyle(el).display);
    
    expect(lightIconStyle).toBe('none');
    expect(darkIconStyle).not.toBe('none');
  });
});