
import { test, expect } from '@playwright/test';

test.describe('EzTable Component - Grouping & Hierarchy', () => {

    test.use({ viewport: { width: 1920, height: 1080 } });

    test.beforeEach(async ({ page }) => {
        await page.goto('/table/grouping');
        await expect(page.locator('h2', { hasText: /Grouping & Hierarchy/i })).toBeVisible({ timeout: 30000 });

        // Wait for first data row
        await expect(page.locator('div[data-index="0"]').first()).toBeVisible({ timeout: 30000 });
    });

    test('should render hierarchical column headers', async ({ page }) => {
        await expect(page.getByText('Personnel Info')).toBeVisible();
        await expect(page.getByText('Organization & Status')).toBeVisible();
        await expect(page.getByText('Compensation')).toBeVisible();
    });

    test('should show grouping rows by default', async ({ page }) => {
        // Group row at data-index 0
        const groupRow = page.locator('div[data-index="0"]').first();
        await expect(groupRow).toBeVisible();

        // Group rows have buttons and count in brackets
        await expect(groupRow.getByRole('button')).toBeVisible();
        const text = await groupRow.innerText();
        expect(text).toMatch(/\([0-9]+\)/);
    });

    test('should allow expanding and collapsing groups', async ({ page }) => {
        const firstGroup = page.locator('div[data-index="0"]').first();
        const initialVisibleRows = await page.locator('div[data-index]').count();

        // Click expansion button
        await firstGroup.getByRole('button').first().click();

        // Verify more rows are rendered virtually
        await expect(async () => {
            const currentCount = await page.locator('div[data-index]').count();
            expect(currentCount).toBeGreaterThan(initialVisibleRows);
        }).toPass();

        // Collapse
        await firstGroup.getByRole('button').first().click();
        await expect(page.locator('div[data-index]')).toHaveCount(initialVisibleRows);
    });

    test('should display aggregated values in grouped rows', async ({ page }) => {
        const firstGroup = page.locator('div[data-index="0"]').first();

        // Salary is the last cell
        const salaryCell = firstGroup.locator('div[role="cell"]').last();
        const salaryText = await salaryCell.innerText();

        expect(salaryText).toMatch(/\$[0-9,.]+/);
    });
});
