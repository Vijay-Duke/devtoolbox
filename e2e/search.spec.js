import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('search input is visible and functional', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /Search/);
    
    // Type in search
    await searchInput.fill('json');
    await expect(searchInput).toHaveValue('json');
  });

  test('search with keyboard shortcut (/)', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    // Press / key
    await page.keyboard.press('/');
    
    // Check if search input is focused
    await expect(searchInput).toBeFocused();
  });

  test('clear search with Escape key', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    // Type in search
    await searchInput.fill('test query');
    await expect(searchInput).toHaveValue('test query');
    
    // Press Escape
    await page.keyboard.press('Escape');
    
    // Check if search is cleared
    await expect(searchInput).toHaveValue('');
    await expect(searchInput).not.toBeFocused();
  });

  test('search results appear on input', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    const searchResults = page.locator('.search-results');
    
    // Initially hidden
    await expect(searchResults).toBeHidden();
    
    // Type in search
    await searchInput.fill('json');
    
    // Wait for debounce and check results appear
    await page.waitForTimeout(250);
    await expect(searchResults).toBeVisible();
    
    // Should show JSON Formatter result
    await expect(page.locator('.search-result-item').first()).toContainText('JSON Formatter');
  });

  test('clear button appears and works', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    const clearButton = page.locator('.search-clear');
    
    // Initially hidden
    await expect(clearButton).toBeHidden();
    
    // Type in search
    await searchInput.fill('test');
    
    // Clear button should appear
    await expect(clearButton).toBeVisible();
    
    // Click clear button
    await clearButton.click();
    
    // Search should be cleared
    await expect(searchInput).toHaveValue('');
    await expect(clearButton).toBeHidden();
  });

  test('no results message appears for non-matching query', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    const searchResults = page.locator('.search-results');
    
    // Type non-matching query
    await searchInput.fill('xyz123notfound');
    
    // Wait for debounce
    await page.waitForTimeout(250);
    
    // Should show no results message
    await expect(searchResults).toBeVisible();
    await expect(searchResults).toContainText('No tools found');
  });

  test('search filters tools correctly', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    // Search for "encode"
    await searchInput.fill('encode');
    await page.waitForTimeout(250);
    
    // Should show Base64 and URL encode tools
    const results = page.locator('.search-result-item');
    await expect(results).toHaveCount(2);
    await expect(results.nth(0)).toContainText('Base64');
    await expect(results.nth(1)).toContainText('URL');
  });
});