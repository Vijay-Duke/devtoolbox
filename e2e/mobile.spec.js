import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {
  test.beforeEach(async ({ page, viewport }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
  });

  test('hamburger menu is visible on mobile', async ({ page }) => {
    const menuToggle = page.locator('[data-menu-toggle]');
    await expect(menuToggle).toBeVisible();
    
    // Logo should be visible
    const logo = page.locator('.flex.items-center.space-x-2.text-xl.font-bold');
    await expect(logo).toBeVisible();
  });

  test('sidebar is hidden by default on mobile', async ({ page }) => {
    const sidebar = page.locator('#sidebar');
    
    // Check sidebar is off-screen (has -translate-x-full class)
    const transform = await sidebar.evaluate(el => 
      window.getComputedStyle(el).transform
    );
    expect(transform).toContain('matrix');
  });

  test('sidebar toggles on hamburger click', async ({ page }) => {
    const menuToggle = page.locator('[data-menu-toggle]');
    const sidebar = page.locator('#sidebar');
    const overlay = page.locator('[data-sidebar-overlay]');
    
    // Click hamburger
    await menuToggle.click();
    
    // Wait for animation and check sidebar classes
    await page.waitForTimeout(100);
    
    // Sidebar should not have -translate-x-full (should be visible)
    const hasTransform = await sidebar.evaluate(el => 
      el.classList.contains('-translate-x-full')
    );
    expect(hasTransform).toBeFalsy();
    
    // Check aria-expanded
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
    
    // Click overlay to close
    await overlay.click();
    await page.waitForTimeout(100);
    
    // Sidebar should be hidden again
    const hasTransformAfter = await sidebar.evaluate(el => 
      el.classList.contains('-translate-x-full')
    );
    expect(hasTransformAfter).toBeTruthy();
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('navigation links work on mobile', async ({ page }) => {
    const menuToggle = page.locator('[data-menu-toggle]');
    const sidebar = page.locator('#sidebar');
    
    // Open menu
    await menuToggle.click();
    await page.waitForTimeout(100);
    
    // Check sidebar is visible
    const hasTransform = await sidebar.evaluate(el => 
      el.classList.contains('-translate-x-full')
    );
    expect(hasTransform).toBeFalsy();
    
    // Click a nav link
    const jsonLink = page.locator('a[href="#json-formatter"]');
    await jsonLink.click();
    
    // Wait for navigation and sidebar animation
    await page.waitForTimeout(100);
    
    // Sidebar should auto-close after selection
    const hasTransformAfter = await sidebar.evaluate(el => 
      el.classList.contains('-translate-x-full')
    );
    expect(hasTransformAfter).toBeTruthy();
    
    // Link should be marked active
    await expect(jsonLink).toHaveClass(/active/);
  });

  test('search works on mobile', async ({ page }) => {
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible();
    
    // Should be responsive width  
    const searchContainer = page.locator('.relative').first();
    const width = await searchContainer.evaluate(el => el.offsetWidth);
    expect(width).toBeLessThan(400);
    
    // Search should still function
    await searchInput.fill('json');
    await page.waitForTimeout(250);
    
    const searchResults = page.locator('#search-results');
    await expect(searchResults).toBeVisible();
  });

  test('touch targets are adequate size', async ({ page }) => {
    const menuToggle = page.locator('[data-menu-toggle]');
    const themeToggle = page.locator('[data-theme-toggle]');
    
    // Check button sizes (should be at least 44x44 for touch)
    const menuSize = await menuToggle.evaluate(el => ({
      width: el.offsetWidth,
      height: el.offsetHeight
    }));
    
    const themeSize = await themeToggle.evaluate(el => ({
      width: el.offsetWidth,
      height: el.offsetHeight
    }));
    
    expect(menuSize.width).toBeGreaterThanOrEqual(40);
    expect(menuSize.height).toBeGreaterThanOrEqual(40);
    expect(themeSize.width).toBeGreaterThanOrEqual(40);
    expect(themeSize.height).toBeGreaterThanOrEqual(40);
  });
});

test.describe('Tablet Responsiveness', () => {
  test('layout adapts for tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto('/');
    
    // Sidebar should be visible on tablet
    const sidebar = page.locator('#sidebar');
    await expect(sidebar).toBeVisible();
    
    // Menu toggle should be hidden on large screens
    const menuToggle = page.locator('[data-menu-toggle]');
    await expect(menuToggle).not.toBeVisible();
    
    // Should use flex layout
    const appContainer = page.locator('.flex.flex-1.overflow-hidden');
    const display = await appContainer.evaluate(el => 
      window.getComputedStyle(el).display
    );
    expect(display).toBe('flex');
  });
});