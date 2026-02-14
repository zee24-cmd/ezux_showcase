import { test, expect } from '@playwright/test';

test.describe('EzTable Enhancements', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        // Navigate to the Interactive Variants demo which has the relevant configurations
        await page.goto('/table/variants');
        await page.waitForLoadState('networkidle');
    });

    test('should auto-fit column width on double-click', async ({ page }) => {
        // Wait for table to be fully rendered
        await page.waitForSelector('[role="columnheader"]');
        await page.waitForTimeout(1000); // Hydration wait

        const headerText = 'Feature Name';
        const header = page.getByRole('columnheader').filter({ hasText: headerText }).first();
        const initialBox = await header.boundingBox();
        const initialWidth = initialBox!.width;
        console.log('Initial width:', initialWidth);

        // Find the resizer - it's a div with role="separator" inside the header
        const resizer = header.locator('[role="separator"]');

        // Manual expand first to have room to shrink
        const resizerBox = await resizer.boundingBox();
        const startX = resizerBox!.x + resizerBox!.width / 2;
        const startY = resizerBox!.y + resizerBox!.height / 2;

        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(startX + 200, startY, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(500);

        const expandedBox = await header.boundingBox();
        console.log('Expanded width:', expandedBox!.width);
        expect(expandedBox!.width).toBeGreaterThan(initialWidth + 50);

        // Double-click to auto-fit
        const newResizerBox = await resizer.boundingBox();
        const newX = newResizerBox!.x + newResizerBox!.width / 2;
        const newY = newResizerBox!.y + newResizerBox!.height / 2;
        await page.mouse.dblclick(newX, newY);

        // Wait for resize to take effect
        await page.waitForTimeout(1000);

        const finalBox = await header.boundingBox();
        const finalWidth = finalBox!.width;
        console.log('Final width:', finalWidth);

        // It should shrink significantly from the expanded width
        expect(finalWidth).toBeLessThan(expandedBox!.width);
        expect(finalWidth).toBeGreaterThan(50);
    });

    test('should show tooltip for truncated cell content', async ({ page }) => {
        await page.waitForSelector('[role="cell"]');
        await page.waitForTimeout(1000);

        const headerText = 'Feature Name';
        const header = page.getByRole('columnheader').filter({ hasText: headerText }).last();

        // Use evaluate to force column sizing via the exposed table instance
        // This is more reliable for testing the effect (truncation) rather than the cause (resizing)
        console.log('Forcing column sizing to 50px...');
        await page.evaluate(() => {
            const table = (window as any).ezTable;
            if (table) {
                table.setColumnSizing({
                    feature: 50
                });
            }
        });

        await page.waitForTimeout(1000);

        const afterHeaderBox = await header.boundingBox();
        console.log('Header width after force sizing:', afterHeaderBox?.width);

        const cell = page.getByRole('cell').filter({ hasText: 'User Authentication' }).first();

        // Force truncation via CSS for reliable testing
        console.log('Forcing cell width to 40px via CSS...');
        await cell.evaluate(el => {
            (el as HTMLElement).style.width = '40px';
            (el as HTMLElement).style.flex = '0 0 40px';
        });

        await page.waitForTimeout(500);

        const finalCellBox = await cell.boundingBox();
        console.log('Cell width after CSS force:', finalCellBox?.width);

        await cell.hover({ force: true });
        await page.waitForTimeout(500); // 300ms delayDuration

        // Check for tooltip
        const tooltip = page.locator('[role="tooltip"]');
        await expect(tooltip).toBeVisible({ timeout: 5000 });
        await expect(tooltip).toContainText('User Authentication');
    });

    test('should show search highlighting', async ({ page }) => {
        await page.waitForSelector('input[placeholder="Filter all columns..."]');
        const filterInput = page.getByPlaceholder('Filter all columns...');

        await filterInput.fill('Active');
        await page.waitForTimeout(1000);

        const mark = page.locator('mark').first();
        await expect(mark).toBeVisible({ timeout: 5000 });
        await expect(mark).toContainText('Active');

        const color = await mark.evaluate(el => window.getComputedStyle(el).backgroundColor);
        console.log('Highlight mark background color:', color);
        expect(color).not.toBe('rgba(0, 0, 0, 0)');
        expect(color).not.toBe('rgb(255, 255, 255)');
    });
});
