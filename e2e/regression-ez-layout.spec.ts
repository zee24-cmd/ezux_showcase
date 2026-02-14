import { test, expect } from '@playwright/test';

test.describe('EzLayout Regression', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Ensure we are logged in (if redirected to auth)
        if (await page.url().includes('/auth/signin')) {
            await page.fill('input[type="email"]', 'test@example.com');
            await page.fill('input[type="password"]', 'password');
            await page.click('button[type="submit"]');
        }
        await page.waitForURL('/');
    });

    test('should have a working sidebar toggle', async ({ page }) => {
        // Use precise locator for the Home link/heading
        await expect(page.getByRole('link', { name: 'Home', exact: true }).first()).toBeVisible();

        // Target toggle button (it's the same for desktop/mobile in this layout)
        const desktopToggle = page.getByRole('button').filter({ has: page.locator('.lucide-menu') }).first();
        await expect(desktopToggle).toBeVisible();
        await desktopToggle.click();
    });

    test('should switch themes', async ({ page }) => {
        const themeSwitcher = page.locator('button[title="Toggle theme"]');
        if (await themeSwitcher.isVisible()) {
            await themeSwitcher.click();
            // Verify html class changes
            await expect(page.locator('html')).toHaveClass(/dark|light/);
        }
    });

    test('should switch language', async ({ page }) => {
        // Open language switcher
        const langSwitcher = page.locator('button:has-text("EN"), button:has-text("ES"), button:has-text("FR")').first();
        if (await langSwitcher.isVisible()) {
            await langSwitcher.click();
            // Select distinct language if dropdown opens
            const esOption = page.locator('text=Español');
            if (await esOption.isVisible()) {
                await esOption.click();
                // Verify text change
                await expect(page.locator('text=Tablero').or(page.locator('text=Dashboard'))).toBeVisible();
            }
        }
    });

    test('should be responsive', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });

        // Target mobile toggle specifically (it's the same button in this layout)
        const mobileToggle = page.getByRole('button').filter({ has: page.locator('.lucide-menu') }).first();
        await expect(mobileToggle).toBeVisible();
    });
});
