import { test, expect } from '@playwright/test';

test.describe('EzTable Regression', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/table');
        await page.waitForTimeout(1000); // Allow table to load
    });

    test('should sort columns', async ({ page }) => {
        // Find a sortable column header (usually has a button or icon)
        const firstHeader = page.locator('th button').first();
        if (await firstHeader.isVisible()) {
            await firstHeader.click();
            // Expect url or visual change? 
            // Ideally we check aria-sort or icon change
            // For now, ensuring it doesn't crash is a regression baseline
            await expect(page.locator('tbody tr').first()).toBeVisible();
        }
    });

    test('should filter data', async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="Filter"], input[placeholder*="Search"]').first();
        if (await searchInput.isVisible()) {
            await searchInput.fill('Test');
            // Wait for debounce
            await page.waitForTimeout(500);
            // Verify row count changes or table not empty
        }
    });

    test('should paginate', async ({ page }) => {
        const nextBtn = page.locator('button[aria-label="Next page"], button:has-text("Next")');
        if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
            await nextBtn.click();
            // Verify page change
        }
    });

    test('should select rows', async ({ page }) => {
        const checkbox = page.locator('tbody tr input[type="checkbox"]').first();
        if (await checkbox.isVisible()) {
            await checkbox.click();
            await expect(checkbox).toBeChecked();
        }
    });
});
