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
    const lightIcon = page.locator('[data-theme-toggle] svg.block');  // Sun icon (visible in light mode)
    const darkIcon = page.locator('[data-theme-toggle] svg.hidden');   // Moon icon (hidden in light mode)
    
    // Set to light theme
    await htmlElement.evaluate(el => {
      el.classList.remove('dark');
      el.setAttribute('data-theme', 'light');
    });
    
    // Wait for theme change
    await page.waitForTimeout(100);
    
    // In light theme, sun icon should be visible, moon icon should be hidden
    await expect(lightIcon).toBeVisible();
    await expect(darkIcon).toBeHidden();
  });
});