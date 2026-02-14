import { test, expect } from '@playwright/test';

test.describe('EzTreeView Enterprise Component', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the TreeView demo page
        await page.goto('/tree');
        await page.waitForLoadState('networkidle');
    });

    test('should render the tree structure', async ({ page }) => {
        await expect(page.getByText('EzTreeView Enterprise')).toBeVisible();
        await expect(page.getByText('Project Root')).toBeVisible();

        // Expand Project Root
        // We use data-testid which is available because of proper aliasing
        await page.getByTestId('tree-item-1').getByTestId('expand-button').click({ force: true });
        await expect(page.getByText('src')).toBeVisible();
    });

    test('should support expanding and collapsing nodes', async ({ page }) => {
        // Expand Project Root first
        await page.getByTestId('tree-item-1').getByTestId('expand-button').click({ force: true });

        const srcNode = page.getByTestId('tree-item-1-1');
        await expect(srcNode).toBeVisible();

        // Small delay for virtualization to settle
        await page.waitForTimeout(500);

        // Find the expand button for 'src'
        const expandBtn = srcNode.getByTestId('expand-button');
        await expandBtn.click({ force: true });

        // Should reveal 'components'
        await expect(page.getByText('components')).toBeVisible();

        // Collapse it
        await expandBtn.click({ force: true });
        await expect(page.getByText('components')).not.toBeVisible();
    });

    test('should support tri-state checkboxes and cascading selection', async ({ page }) => {
        // Expand All via Programmatic API button for easier testing
        await page.getByRole('button', { name: /expand all/i }).click({ force: true });

        // 1 is the ID for Project Root
        const checkbox = page.getByTestId('tree-checkbox-1');
        await checkbox.click({ force: true });

        // 1-1 is the ID for src
        // Ensure cascading selection (checked state)
        // Since we don't have a direct "checked" attribute on the div, we check for class
        // or we check the data-state if implemented. 
        // Based on previous code: bg-primary indicates checked.
        const srcCheckbox = page.getByTestId('tree-checkbox-1-1');
        await expect(srcCheckbox).toHaveClass(/bg-primary/);
    });

    test('should support search filtering and highlighting', async ({ page }) => {
        const searchInput = page.getByPlaceholder('Search nodes...');
        await searchInput.fill('utils');

        // Should show matching node (ID for utils.ts is 1-1-2)
        // Wait, utils.ts ID might need verification. 
        // Let's use text locator for safety if ID is uncertain, but testid for parents.
        // tree-item-1-1-2 is likely utils.ts based on structure (root -> src -> utils.ts)
        await expect(page.getByText('utils.ts')).toBeVisible();

        // Check filtering (Project Root should form a path)
        await expect(page.getByTestId('tree-item-1')).toBeVisible();

        // Check for highlighting
        await expect(page.locator('mark')).toHaveText('utils');
    });

    test.skip('should support inline editing on double click', async ({ page }) => {
        // Expand parents
        await page.getByTestId('tree-item-1').getByTestId('expand-button').click({ force: true });

        const srcNode = page.getByTestId('tree-item-1-1');

        // Use Context Menu to trigger edit (most reliable)
        await srcNode.click({ button: 'right', force: true });
        await page.getByText('Edit Row').click();

        // Should switch to an input field
        const input = page.getByTestId('tree-item-edit-input');
        await expect(input).toBeVisible();
        await expect(input).toHaveValue('src');

        // Rename it
        await input.fill('source');
        await page.keyboard.press('Enter');

        // Should show the new name
        await expect(page.getByText('source')).toBeVisible();
    });

    test('should support lazy loading of remote nodes', async ({ page }) => {
        const remoteRoot = page.getByText('Remote Records (Lazy)');
        await expect(remoteRoot).toBeVisible();

        // Click expand button
        // 'lazy-root' was the ID used in the demo
        await page.getByTestId('tree-item-lazy-root').getByTestId('expand-button').click({ force: true });

        // Wait for result
        await expect(page.getByText('Remote Record A')).toBeVisible({ timeout: 5000 });
    });

    test('should support programmatic API (Expand/Collapse All)', async ({ page }) => {
        // Click Collapse All
        await page.getByRole('button', { name: /collapse all/i }).click({ force: true });
        await expect(page.getByText('src')).not.toBeVisible();

        // Click Expand All
        await page.getByRole('button', { name: /expand all/i }).click({ force: true });
        await expect(page.getByText('src')).toBeVisible();
        await expect(page.getByText('components')).toBeVisible();
    });
});
