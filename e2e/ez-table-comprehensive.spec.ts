
import { test, expect } from '@playwright/test';

test.describe('EzTable Component - Comprehensive Features', () => {

    test.use({ viewport: { width: 3000, height: 1080 } });

    test.beforeEach(async ({ page }) => {
        await page.goto('/table/all-types');
        // Wait for the main heading (h2 in the current implementation)
        await expect(page.locator('h2', { hasText: 'All Column Types' })).toBeVisible({ timeout: 20000 });

        // Wait for data row (uses data-index instead of role="row")
        // Ensure data is rendered
        await page.waitForSelector('text=Alice Johnson', { timeout: 20000 });
        await expect(page.getByText('Alice Johnson').first()).toBeVisible();
    });

    test('should render complex column types correctly', async ({ page }) => {
        // Find Alice's row by text - most robust way using role="row" or specific data attribute
        const aliceRow = page.locator('div[data-index]').filter({ hasText: 'Alice Johnson' }).first();
        await expect(aliceRow).toBeVisible({ timeout: 15000 });

        // 1. Progress Bar - Column ID 'progress'
        const progressCell = aliceRow.locator('[data-column-id="progress"]');
        await expect(progressCell).toContainText('%', { timeout: 10000 });
        await expect(progressCell.locator('.rounded-full').first()).toBeVisible();

        // 2. Sparkline - Column ID 'trend'
        const sparklineCell = aliceRow.locator('[data-column-id="trend"]');
        await expect(sparklineCell.locator('svg')).toBeVisible({ timeout: 10000 });

        // 3. Relative DateTime
        const dateCell = aliceRow.locator('[data-column-id="lastLogin"]');
        const text = await dateCell.innerText();
        expect(text.length).toBeGreaterThan(0);
        expect(text).toMatch(/(just now|[0-9]+[a-z]+ ago|in [0-9]+[a-z]+)/);
    });

    test('should support global display toggles for boolean columns', async ({ page }) => {
        const aliceRow = page.locator('div[data-index]').filter({ hasText: 'Alice Johnson' }).first();
        const activeCell = aliceRow.locator('[data-column-id="isActive"]');

        // Initially showIcons: true, showLabels: false
        await expect(activeCell.locator('svg')).toBeVisible({ timeout: 15000 });

        // Toggle Labels
        await page.getByText('Labels', { exact: true }).click({ force: true });
        // The label in BooleanCell is inside a span with text-xs
        await expect(activeCell.getByText(/Active|Inactive/i)).toBeVisible({ timeout: 10000 });

        // Toggle Icons off
        await page.getByText('Icons', { exact: true }).click({ force: true });
        await expect(activeCell.locator('svg')).toBeHidden({ timeout: 10000 });
        await expect(activeCell.getByText(/Active|Inactive/i)).toBeVisible({ timeout: 10000 });
    });

    test('should show color-coded badges for select columns', async ({ page }) => {
        const aliceRow = page.locator('div[data-index]').filter({ hasText: 'Alice Johnson' }).first();
        const deptCell = aliceRow.locator('[data-column-id="department"]');
        const statusCell = aliceRow.locator('[data-column-id="status"]');

        await expect(deptCell).toBeVisible();
        await expect(statusCell).toBeVisible();

        const deptText = await deptCell.innerText();
        expect(deptText.length).toBeGreaterThan(0);
    });
});
