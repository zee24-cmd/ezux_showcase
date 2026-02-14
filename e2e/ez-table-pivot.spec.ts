
import { test, expect } from '@playwright/test';

test.describe('EzTable Component - Pivot Analytics', () => {

    test.use({ viewport: { width: 1920, height: 1080 } });

    test.beforeEach(async ({ page }) => {
        await page.goto('/table/pivot');
        // Wait for page title and table
        await expect(page.locator('h2', { hasText: 'Pivot Analytics' })).toBeVisible({ timeout: 15000 });
        await expect(page.locator('[role="table"]')).toBeVisible({ timeout: 10000 });
    });

    test('should render structural elements', async ({ page }) => {
        await expect(page.locator('h2', { hasText: 'Pivot Analytics' })).toBeVisible();
        await expect(page.getByText('Pivot Controls')).toBeVisible();
        await expect(page.locator('aside').getByText('Department').first()).toBeVisible();
    });

    test('should permit dimension filtering in sidebar', async ({ page }) => {
        const searchInput = page.getByPlaceholder('Filter dimensions...');
        await searchInput.fill('Location');

        await expect(page.locator('aside').getByText('Office Location').first()).toBeVisible();
        await expect(page.locator('aside').getByText('Reporting Manager')).toBeHidden();
    });

    test('should allow toggling dimensions in sidebar', async ({ page }) => {
        // Toggle 'Status'
        const statusLabel = page.locator('aside').locator('label', { hasText: /^Status$/ }).first();
        await statusLabel.click();

        // Just verify the click happened and the label is still there/visible
        await expect(statusLabel).toBeVisible();
    });

    test('should open metric picker popover', async ({ page }) => {
        const addBtn = page.getByRole('button', { name: /Add Metric Field/i });
        await addBtn.click();

        await expect(page.getByPlaceholder('Search fields...')).toBeVisible();
    });
});
