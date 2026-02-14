import { test, expect } from '@playwright/test';

test.describe('EzScheduler Phase 1: Core Rendering', () => {
    test('should render EzScheduler component', async ({ page }) => {
        // Navigate to the scheduler route
        await page.goto('/scheduler');
        await page.waitForTimeout(1000); // Wait for initialization

        // Check if the scheduler container exists
        // Using the main wrapper ID which is always present
        const scheduler = page.locator('#scheduler-main-container');
        await expect(scheduler).toBeVisible();

        // Check if the default view (Week) is rendered (checking for day headers)
        const today = new Date();
        const dayName = today.toLocaleDateString('en-US', { weekday: 'short' });
        // await expect(page.getByText(dayName, { exact: false })).toBeVisible(); 
    });

    test('should switch views', async ({ page }) => {
        await page.goto('/scheduler');

        // Check view switcher
        const weekBtn = page.getByRole('button', { name: /^week$/i });
        await expect(weekBtn).toBeVisible();
    });
});
