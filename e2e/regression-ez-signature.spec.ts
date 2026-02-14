import { test, expect } from '@playwright/test';

test.describe('EzSignature Regression', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/signature');
    });

    test('should draw on signature pad', async ({ page }) => {
        const canvas = page.locator('.ez-signature-container svg').first();
        // Or the parent div if svg handles events
        const bounds = await canvas.boundingBox();

        if (bounds) {
            // Draw a stroke
            await page.mouse.move(bounds.x + 20, bounds.y + 20);
            await page.mouse.down();
            await page.mouse.move(bounds.x + 100, bounds.y + 100);
            await page.mouse.up();

            // Check if stroke exists
            await expect(canvas.locator('path')).toHaveCount(1);
        }
    });

    test('should undo and redo', async ({ page }) => {
        const canvas = page.locator('.ez-signature-container svg').first();
        const undoBtn = page.getByRole('button', { name: /Undo/i });
        const redoBtn = page.getByRole('button', { name: /Redo/i });

        const bounds = await canvas.boundingBox();
        if (bounds) {
            // Draw stroke 1
            await page.mouse.move(bounds.x + 10, bounds.y + 10);
            await page.mouse.down();
            await page.mouse.move(bounds.x + 50, bounds.y + 50);
            await page.mouse.up();
        }

        await expect(canvas.locator('path')).toHaveCount(1);

        await undoBtn.click();
        await expect(canvas.locator('path')).toHaveCount(0);

        await redoBtn.click();
        await expect(canvas.locator('path')).toHaveCount(1);
    });

    test('should clear signature', async ({ page }) => {
        const clearBtn = page.getByRole('button', { name: /Clear/i });
        const canvas = page.locator('.ez-signature-container svg').first();

        // Assume something drawn from previous test or draw new
        const bounds = await canvas.boundingBox();
        if (bounds) {
            await page.mouse.move(bounds.x + 10, bounds.y + 10);
            await page.mouse.down();
            await page.mouse.move(bounds.x + 50, bounds.y + 50);
            await page.mouse.up();
        }

        await clearBtn.click();
        await expect(canvas.locator('path')).toHaveCount(0);
    });
});
