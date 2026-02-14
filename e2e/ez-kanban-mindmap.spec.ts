import { test, expect } from '@playwright/test';

test.describe('EzKanban and EzMindMap Regression', () => {
    test.beforeEach(async ({ page }) => {
        // Listen to console logs
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
        page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message}`));

        // Start from home
        await page.goto('/');

        // Handle login if redirected (standard pattern from other tests)
        if (await page.url().includes('/auth/signin')) {
            await page.fill('input[type="email"]', 'test@example.com');
            await page.fill('input[type="password"]', 'password');
            await page.click('button[type="submit"]');
            await page.waitForURL('/');
        }
    });

    test('EzKanban should load data asynchronously and display board', async ({ page }) => {
        // Navigate to Kanban demo
        await page.goto('/kanban');

        // Verify async loader appears initially (since we use a worker)
        // We look for a loading spinner or svg with animate-spin class
        const loader = page.locator('.animate-spin').first();
        // It might be very fast, so if it's visible, good. If not, check if content is already loaded.
        if (await loader.isVisible()) {
            await expect(loader).toBeVisible();
            await expect(loader).toBeHidden({ timeout: 10000 }); // Wait for it to disappear
        }

        // Verify Columns exist (To Do, In Progress, Review, Done)
        await expect(page.getByText('To Do')).toBeVisible();
        await expect(page.getByText('In Progress').first()).toBeVisible();
        await expect(page.getByText('Review')).toBeVisible();
        await expect(page.getByText('Done')).toBeVisible();

        // Verify Cards exist (We generate 5 per column by default)
        // Check for at least one card title
        await expect(page.getByText('Implement user authentication').first()).toBeVisible();

        // Basic interaction check: Verify clicking a card logs to console (hard to test console in Playwright without setup, 
        // but we can check if the card is clickable)
        const firstCard = page.getByText('Implement user authentication').first();
        await expect(firstCard).toBeEnabled();
    });

    test('EzMindMap should load data asynchronously and display map', async ({ page }) => {
        // Navigate to MindMap demo
        await page.goto('/mindmap');

        // Verify async loader
        const loader = page.locator('.animate-spin').first();
        if (await loader.isVisible()) {
            await expect(loader).toBeVisible();
            await expect(loader).toBeHidden({ timeout: 10000 });
        }

        // Verify Root Node ('Product Strategy' is default topic passed to generator)
        // Note: Text content might be split across elements depending on rendering, but 'Product Strategy' should be finding-able.
        await expect(page.getByText('Product Strategy').first()).toBeVisible();

        // Verify Branch Nodes (e.g., 'Market Research')
        await expect(page.getByText('Market Research')).toBeVisible();
        await expect(page.getByText('Feature Planning').first()).toBeVisible();

        // Verify connection lines exist (SVG paths)
        const connections = page.locator('svg path');
        expect(await connections.count()).toBeGreaterThan(0);
    });
});
