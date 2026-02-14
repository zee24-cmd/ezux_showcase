import { test, expect } from '@playwright/test';

test.describe('EzScheduler Views and Data', () => {
    test.beforeEach(async ({ page }) => {
        // Capture console logs
        page.on('console', msg => console.log(`[BROWSER]: ${msg.text()}`));

        // Pin time to 2026-01-26 (Monday)
        await page.clock.setFixedTime(new Date('2026-01-26T10:00:00'));

        // Set a large viewport to ensure everything is visible
        await page.setViewportSize({ width: 1920, height: 1080 });

        // Go to the scheduler route
        await page.goto('/scheduler');

        // Wait for grid to render using the data-testid
        await expect(page.getByTestId('scheduler-scroll-container')).toBeVisible({ timeout: 10000 });
    });

    test('should display static data in Day view (default)', async ({ page }) => {
        // Check for the "Global Inbox Item" event which is set for 10:00 AM today in the demo
        const event = page.getByTestId('scheduler-event-test-unassigned');

        // Use the scroll container to find the event
        const scrollContainer = page.getByTestId('scheduler-scroll-container');
        await scrollContainer.evaluate(e => e.scrollTop = 10 * 64 - 100);

        await expect(event).toBeVisible({ timeout: 10000 });
        await expect(event.getByText(/Global Inbox/i)).toBeVisible();

        // Check for Resource headers (e.g. Conference Room A)
        await expect(page.getByText('Conference Room A').first()).toBeVisible();
    });

    test('should switch to Week view and display data', async ({ page }) => {
        // Click Week view button
        await page.getByRole('button', { name: /^week$/i }).click();

        // Wait for transition
        await page.waitForTimeout(1000);

        // Verify data is still there (Global Inbox Item)
        const event = page.getByTestId('scheduler-event-test-unassigned');
        const scrollContainer = page.getByTestId('scheduler-scroll-container');
        await scrollContainer.evaluate(e => e.scrollTop = 10 * 64 - 100);
        await expect(event).toBeVisible({ timeout: 10000 });
    });

    test('should switch to Month view and display data', async ({ page }) => {
        // Click Month view button
        await page.getByRole('button', { name: /^month$/i }).click();

        // Wait for transition
        await page.waitForTimeout(1000);

        // Verify data
        const event = page.getByTestId('scheduler-event-test-unassigned');
        await expect(event).toBeVisible({ timeout: 10000 });
    });

    test('should display correct resource shading in Day View', async ({ page }) => {
        const scrollContainer = page.getByTestId('scheduler-scroll-container');
        await scrollContainer.evaluate(e => e.scrollTop = 8 * 64); // Scroll to 8 AM

        // Wait for the shaded slots to render
        const shadedSlot = page.locator('[data-shaded="true"]');
        await expect(shadedSlot.first()).toBeAttached({ timeout: 15000 });

        // Check if it exists in the DOM at least
        expect(await shadedSlot.count()).toBeGreaterThan(0);
    });

    test('should pivot to Agenda view on mobile', async ({ page }) => {
        // Set mobile viewport and reload
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/scheduler');
        await page.waitForLoadState('networkidle');

        // Go to week view
        await page.getByRole('button', { name: /^week$/i }).click();
        await page.waitForTimeout(1000);

        // On mobile, week view should be AgendaView (list style)
        const event = page.getByTestId('scheduler-event-test-unassigned');
        await expect(event).toBeVisible({ timeout: 15000 });
    });

    test('should support horizontal resource pivot on mobile day view', async ({ page }) => {
        // Set mobile viewport and reload
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/scheduler');

        // Force Day view
        await page.getByRole('button', { name: /^day$/i }).click();

        // Check for snap-x class on the container
        const scrollContainer = page.getByTestId('scheduler-scroll-container');

        // Ensure DayWeekView is rendered by checking one of its sub-elements
        await expect(page.getByText('Conference Room A').first()).toBeVisible({ timeout: 10000 });

        await expect(scrollContainer).toHaveClass(/snap-x/);

        // Check width of the grid content
        const virtualBody = page.getByTestId('scheduler-virtual-body');

        // Wait for it to have width
        await expect(async () => {
            const width = await virtualBody.evaluate(el => el.scrollWidth);
            expect(width).toBeGreaterThan(375 * 2);
        }).toPass({ timeout: 5000 });
    });
});
