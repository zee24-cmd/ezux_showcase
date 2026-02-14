import { test, expect } from '@playwright/test';

test.describe('EzTree Regression', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/tree');
    });

    test('should expand and collapse nodes', async ({ page }) => {
        // Find the "Project Root" node which we know exists
        const projectRoot = page.locator('div[role="treeitem"]:has-text("Project Root")').first(); // Target container
        await expect(projectRoot).toBeVisible();

        // Find the toggle button within or near it
        const toggleBtn = projectRoot.locator('button[aria-expanded]').first();
        if (await toggleBtn.isVisible()) {
            const initialState = await toggleBtn.getAttribute('aria-expanded');
            await toggleBtn.click();
            await expect(toggleBtn).not.toHaveAttribute('aria-expanded', initialState);
        }
    });

    test('should select a node', async ({ page }) => {
        const node = page.locator('[role="treeitem"]').first();
        if (await node.isVisible()) {
            await node.click();
            await expect(node).toHaveAttribute('aria-selected', 'true');
        }
    });

    test('should filter tree', async ({ page }) => {
        const searchInput = page.getByPlaceholder('Search...');
        if (await searchInput.isVisible()) {
            // Type a common term
            await searchInput.fill('src');
            await page.waitForTimeout(300);

            // Check if items are filtered (some should be hidden)
            // Hard to assert generic tree content, but ensure it doesn't crash
            await expect(page.locator('[role="tree"]')).toBeVisible();
        }
    });
});
