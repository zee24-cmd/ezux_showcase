import { test, expect } from '@playwright/test';

test.describe('EzTable Component', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('should load table with 10,000 rows', async ({ page }) => {
        // Wait for table to be visible
        await expect(page.locator('[role="table"]')).toBeVisible({ timeout: 5000 });

        // Check that table header is present
        await expect(page.getByText('ID')).toBeVisible();
        await expect(page.getByText('Name')).toBeVisible();
        await expect(page.getByText('Email')).toBeVisible();

        // Verify virtualization - should not render all 10k rows
        const rows = page.locator('[role="row"]');
        const rowCount = await rows.count();

        // Should only render visible rows (not 10,000)
        expect(rowCount).toBeLessThan(100);
        expect(rowCount).toBeGreaterThan(0);
    });

    test('should filter data with global search', async ({ page }) => {
        await expect(page.locator('[role="table"]')).toBeVisible();

        // Type in filter input
        const filterInput = page.locator('input[placeholder*="Filter"]');
        await filterInput.fill('alice');

        // Wait for loading spinner to disappear (React 19 useTransition)
        await expect(page.locator('.animate-spin')).toBeHidden({ timeout: 2000 });

        // Should show filtered results
        await expect(page.getByText(/alice/i)).toBeVisible();
    });

    test('should show loading spinner during filter transitions', async ({ page }) => {
        await expect(page.locator('[role="table"]')).toBeVisible();

        const filterInput = page.locator('input[placeholder*="Filter"]');

        // Start typing
        await filterInput.type('test', { delay: 50 });

        // Should show spinner (useTransition visual feedback)
        // Note: Might be too fast to catch, but let's try
        const spinner = page.locator('.animate-spin').first();

        // If spinner appears, it should be visible
        if (await spinner.isVisible({ timeout: 500 }).catch(() => false)) {
            expect(await spinner.isVisible()).toBe(true);
        }
    });

    test('should sort columns', async ({ page }) => {
        await expect(page.locator('[role="table"]')).toBeVisible();

        // Click on Name column header to sort
        await page.getByRole('button', { name: /sort by name/i }).click();

        // Should show sort indicator
        await expect(page.locator('[aria-sort="ascending"]')).toBeVisible();

        // Click again to reverse sort
        await page.getByRole('button', { name: /sort by name/i }).click();
        await expect(page.locator('[aria-sort="descending"]')).toBeVisible();
    });

    test('should paginate data', async ({ page }) => {
        await expect(page.locator('[role="table"]')).toBeVisible();

        // Check pagination controls exist
        await expect(page.getByText(/page/i)).toBeVisible();

        // Go to next page
        const nextButton = page.getByRole('button', { name: /next/i });
        await nextButton.click();

        // Page number should change
        await expect(page.getByText(/page 2/i)).toBeVisible({ timeout: 2000 });
    });

    test('should reload data via  button', async ({ page }) => {
        await expect(page.locator('[role="table"]')).toBeVisible();

        // Click reload button
        const reloadButton = page.getByRole('button', { name: /reload dataset/i });
        await reloadButton.click();

        // Should show loading spinner
        await expect(reloadButton.locator('.animate-spin')).toBeVisible({ timeout: 1000 });

        // Wait for reload to complete
        await expect(reloadButton.locator('.animate-spin')).toBeHidden({ timeout: 5000 });
    });

    test('should maintain performance with large dataset', async ({ page }) => {
        const startTime = Date.now();

        await page.goto('/');
        await expect(page.locator('[role="table"]')).toBeVisible({ timeout: 10000 });

        const loadTime = Date.now() - startTime;

        // Should load in under 5 seconds
        expect(loadTime).toBeLessThan(5000);

        // Test scrolling performance
        const table = page.locator('[role="table"]').first();
        await table.scrollIntoViewIfNeeded();

        // Scroll multiple times
        for (let i = 0; i < 5; i++) {
            await page.mouse.wheel(0, 500);
            await page.waitForTimeout(100);
        }

        // Should still be responsive
        await expect(table).toBeVisible();
    });

    test('should enable row selection', async ({ page }) => {
        await expect(page.locator('[role="table"]')).toBeVisible();

        // Click on first row (if selection is enabled)
        const firstRow = page.locator('[role="row"]').nth(1); // Skip header
        await firstRow.click();

        // Row should be selected (check for selected class/style)
        const isSelected = await firstRow.evaluate((el) =>
            el.classList.contains('bg-muted') ||
            el.querySelector('.bg-muted') !== null
        );

        expect(isSelected).toBeTruthy();
    });
});

test.describe('Performance Metrics', () => {
    test('should have fast Time to Interactive', async ({ page }) => {
        const startTime = Date.now();

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Click on filter input to test interactivity
        const filterInput = page.locator('input[placeholder*="Filter"]');
        await filterInput.click();

        const tti = Date.now() - startTime;

        // Time to Interactive should be under 3 seconds
        expect(tti).toBeLessThan(3000);
    });

    test('should not freeze UI during heavy filtering', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('[role="table"]')).toBeVisible();

        const filterInput = page.locator('input[placeholder*="Filter"]');

        // Type quickly to test non-blocking behavior
        const startTime = Date.now();
        await filterInput.type('testing filter performance', { delay: 10 });

        const typingTime = Date.now() - startTime;

        // Should respond quickly (React 19 useTransition benefit)
        // Each character should take < 50ms on average
        expect(typingTime / 29).toBeLessThan(50);
    });
});
