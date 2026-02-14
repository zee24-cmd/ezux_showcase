import { test, expect } from '@playwright/test';

test.describe('EzScheduler Interactions', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log(`[BROWSER]: ${msg.text()}`));
        await page.clock.setFixedTime(new Date('2026-01-25T10:00:00'));
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('/scheduler');
    });

    test('should open New Event modal on empty slot double-click', async ({ page }) => {
        // Wait for grid
        await expect(page.getByTestId('scheduler-scroll-container')).toBeVisible();
        const scrollContainer = page.getByTestId('scheduler-scroll-container');
        await scrollContainer.evaluate(e => e.scrollTop = 12 * 64); // Scroll to 12 PM

        // Find an empty slot at 1 PM (Jan 25 is today in mock)
        // Jan 25 is index 0 in day view
        const slot = page.locator('div[data-testid^="slot-"]').nth(20);

        await slot.dblclick({ force: true });

        // Modal should open
        await expect(page.getByTestId('ez-event-modal')).toBeVisible({ timeout: 5000 });
    });

    test('should open Edit Event modal on existing event double-click', async ({ page }) => {
        const event = page.getByTestId('scheduler-event-1');
        const scrollContainer = page.getByTestId('scheduler-scroll-container');
        await scrollContainer.evaluate(e => e.scrollTop = 10 * 64 - 100);

        // Use dblclick with force
        await event.dblclick();

        // Modal should open
        await expect(page.getByTestId('ez-event-modal')).toBeVisible({ timeout: 5000 });
    });
});
