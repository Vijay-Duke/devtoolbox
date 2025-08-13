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

  test('smart search auto-navigates for exact matches', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    
    // Type abbreviation that should auto-navigate
    await searchInput.fill('jf');
    
    // Should auto-navigate to JSON Formatter
    await expect(page).toHaveURL(/#json-formatter/, { timeout: 5000 });
    
    // Search input should be cleared after auto-navigation
    await expect(searchInput).toHaveValue('');
  });

  test('clear button appears and works', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    const clearButton = page.locator('button[aria-label="Clear search"]');
    
    // Initially hidden
    await expect(clearButton).toBeHidden();
    
    // Type in search that shows multiple results (won't auto-navigate)
    await searchInput.fill('gen');
    
    // Wait for debounce and clear button to appear
    await page.waitForTimeout(300);
    await expect(clearButton).toBeVisible();
    
    // Click clear button
    await clearButton.click();
    
    // Search should be cleared
    await expect(searchInput).toHaveValue('');
    await expect(clearButton).toBeHidden();
  });

  test('no results message appears for non-matching query', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    const searchResults = page.locator('#search-results');
    
    // Type non-matching query
    await searchInput.fill('xyz123notfound');
    
    // Wait for debounce
    await page.waitForTimeout(250);
    
    // Should show no results message
    await expect(searchResults).toBeVisible();
    await expect(searchResults).toContainText('No tools found');
  });

  test('search shows multiple results when no single match', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    const searchResults = page.locator('#search-results');
    
    // Search for "generator" - should show multiple generator tools
    await searchInput.fill('generator');
    await page.waitForTimeout(300);
    
    // Should show results (not auto-navigate because multiple matches)
    await expect(searchResults).toBeVisible();
    const results = page.locator('.search-result-item');
    await expect(results).toHaveCount.greaterThan(1);
    
    // Should include generator tools
    await expect(searchResults).toContainText('Generator');
  });
});