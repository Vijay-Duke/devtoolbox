import { test, expect } from '@playwright/test';

test.describe('HTML Structure and Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle('DevToolbox - Fast Developer Utilities');
  });

  test('has proper meta tags', async ({ page }) => {
    const viewport = await page.$('meta[name="viewport"]');
    expect(viewport).toBeTruthy();
    
    const description = await page.$('meta[name="description"]');
    expect(description).toBeTruthy();
    
    const themeColor = await page.$('meta[name="theme-color"]');
    expect(themeColor).toBeTruthy();
  });

  test('has semantic HTML structure', async ({ page }) => {
    await expect(page.locator('header[role="banner"]')).toBeVisible();
    await expect(page.locator('nav[role="navigation"]')).toBeVisible();
    await expect(page.locator('main[role="main"]')).toBeVisible();
    await expect(page.locator('aside[aria-label="Tools sidebar"]')).toBeVisible();
  });

  test('has skip link for accessibility', async ({ page }) => {
    const skipLink = page.locator('a[href="#main"]');
    await expect(skipLink).toHaveClass(/sr-only/);
    
    // Focus the skip link and verify it becomes visible
    await skipLink.focus();
    await expect(skipLink).toBeVisible();
  });

  test('has proper ARIA labels on interactive elements', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toHaveAttribute('aria-label', 'Search tools');
    
    const themeToggle = page.locator('[data-theme-toggle]');
    await expect(themeToggle).toHaveAttribute('aria-label', 'Toggle theme');
    
    const menuToggle = page.locator('[data-menu-toggle]');
    await expect(menuToggle).toHaveAttribute('aria-label', 'Toggle menu');
  });

  test('keyboard shortcuts work', async ({ page }) => {
    // Test / key focuses search
    await page.keyboard.press('/');
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeFocused();
    
    // Test Escape key clears search
    await searchInput.fill('test');
    await page.keyboard.press('Escape');
    await expect(searchInput).toHaveValue('');
  });
});