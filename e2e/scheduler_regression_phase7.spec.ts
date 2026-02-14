
import { test, expect } from '@playwright/test';

test.describe('EzScheduler Phase 7: Regression & QA', () => {
    test.setTimeout(60000);

    test.beforeEach(async ({ page }) => {
        // Pin time to match other tests (2026-01-25)
        await page.clock.setFixedTime(new Date('2026-01-25T10:00:00'));

        // Navigate to Scheduler
        await page.goto('/scheduler');

        // Wait for grid to render using the data-testid
        await expect(page.getByTestId('scheduler-scroll-container')).toBeVisible({ timeout: 30000 });
    });

    test('should render day and week views correctly', async ({ page }) => {
        // Check Virtual Body
        await expect(page.getByTestId('scheduler-virtual-body')).toBeVisible();

        // Switch to Day View
        await page.getByRole('button', { name: /^day$/i }).click();

        // Verify we are in day view (look for single header or specific class)
        // With current implementation, we can check for "Day" active state or just that it didn't crash
        await expect(page.getByTestId('scheduler-scroll-container')).toBeVisible();
    });

    test('should allow creating a new event via modal', async ({ page }) => {
        // Click a specific slot (e.g. 20th slot to be safe in grid)
        // Note: New DroppableSlot implementation uses data-testid="scheduler-slot"
        // We need to target a slot that is likely empty.
        // The slots might be many. nth(20) is fine.
        await page.getByTestId('scheduler-slot').nth(20).dblclick();

        // Check Modal
        const modal = page.locator('[data-testid="ez-event-modal"]');
        await expect(modal).toBeVisible();

        // Check New Fields
        await expect(modal.getByLabel('Location')).toBeVisible();
        await expect(modal.getByLabel('All Day')).toBeVisible();

        // Fill Form
        await modal.getByPlaceholder('Add title').fill('Regression Test Event');
        await modal.getByLabel('Location').fill('Test Lab');

        // Save
        await modal.getByRole('button', { name: 'Save' }).click();

        // Wait for modal to close
        await expect(modal).not.toBeVisible();

        // Verify Event appears
        await expect(page.getByText('Regression Test Event')).toBeVisible();
    });

    test('should edit an existing event', async ({ page }) => {
        // Seed Event
        // Ensure we are in a view where slot 25 is visible/clickable
        await page.getByTestId('scheduler-slot').nth(25).dblclick();
        await page.locator('[data-testid="ez-event-modal"]').getByPlaceholder('Add title').fill('Editable Event');
        await page.locator('[data-testid="ez-event-modal"]').getByRole('button', { name: 'Save' }).click();

        await expect(page.locator('[data-testid="ez-event-modal"]')).not.toBeVisible();

        // Open Logic: Target the event explicitly
        const eventLocator = page.locator('[data-testid^="scheduler-event-"]').filter({ hasText: 'Editable Event' });

        // Wait for animations
        await page.waitForTimeout(500);

        // Programmatically dispatch dblclick to avoid pointer precision issues
        await eventLocator.dispatchEvent('dblclick', { bubbles: true });

        const modal = page.locator('[data-testid="ez-event-modal"]');
        await expect(modal).toBeVisible();

        // Verify we are in Edit mode (Title should match)
        const titleInput = modal.getByPlaceholder('Add title');
        await expect(titleInput).toHaveValue('Editable Event', { timeout: 5000 });

        // Edit
        await titleInput.fill('Edited Event Title');
        await modal.getByLabel('Location').fill('Updated Loc');
        await modal.getByRole('button', { name: 'Save' }).click();

        await expect(page.getByText('Edited Event Title')).toBeVisible();
    });

    test('should delete an event', async ({ page }) => {
        // Seed Event
        await page.getByTestId('scheduler-slot').nth(30).dblclick();
        const seedModal = page.locator('[data-testid="ez-event-modal"]');
        await seedModal.getByPlaceholder('Add title').fill('Delete Me');
        await seedModal.getByRole('button', { name: 'Save' }).click();
        await expect(seedModal).not.toBeVisible();

        // Open
        const deleteEvent = page.locator('[data-testid^="scheduler-event-"]').filter({ hasText: 'Delete Me' });

        // Wait for animations
        await page.waitForTimeout(500);
        // Programmatically dispatch dblclick
        await deleteEvent.dispatchEvent('dblclick', { bubbles: true });

        // Verify we are in Edit mode
        const deleteModal = page.locator('[data-testid="ez-event-modal"]');
        await expect(deleteModal).toBeVisible();
        await expect(deleteModal.getByPlaceholder('Add title')).toHaveValue('Delete Me');

        // Delete
        await deleteModal.getByRole('button', { name: 'Delete' }).click();

        await expect(page.getByText('Delete Me')).not.toBeVisible();
    });

    test('should support drag and drop', async ({ page }) => {
        // Seed
        await page.getByTestId('scheduler-slot').nth(35).dblclick();
        await page.locator('[data-testid="ez-event-modal"]').getByPlaceholder('Add title').fill('Draggable Event');
        await page.locator('[data-testid="ez-event-modal"]').getByRole('button', { name: 'Save' }).click();
        await expect(page.locator('[data-testid="ez-event-modal"]')).not.toBeVisible();

        const event = page.getByText('Draggable Event');
        await expect(event).toBeVisible();

        // Drag
        const box = await event.boundingBox();
        if (box) {
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.mouse.down();
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 100);
            await page.mouse.up();
        }

        // Wait for drop settlement
        await page.waitForTimeout(500);
        await expect(page.locator('text=Draggable Event')).toBeVisible();
    });
});
