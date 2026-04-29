import { expect, test } from '@playwright/test';

const routes = [
    {
        name: 'home',
        path: '/',
        text: 'TanStack First Advanced Components Suite',
    },
    {
        name: 'table',
        path: '/table/basic-table',
        text: 'Table View',
    },
    {
        name: 'scheduler',
        path: '/scheduler',
        text: 'Scheduler',
    },
    {
        name: 'kanban',
        path: '/kanban/basic',
        text: 'Standard Kanban Board',
    },
    {
        name: 'signature',
        path: '/signature',
        text: 'EzSignature',
    },
    {
        name: 'flow',
        path: '/flow/',
        text: 'EzFlow Workflow Builder',
    },
];

for (const route of routes) {
    test(`${route.name} renders without JS errors`, async ({ page }) => {
        const errors: string[] = [];

        page.on('pageerror', (error) => {
            errors.push(`pageerror: ${error.message}`);
        });
        page.on('console', (message) => {
            if (message.type() === 'error') {
                errors.push(`console error: ${message.text()}`);
            }
        });

        const response = await page.goto(route.path);

        expect(response?.ok()).toBe(true);
        await expect(page.locator('body')).toContainText(route.text);
        await page.waitForLoadState('networkidle').catch(() => undefined);
        await page.waitForTimeout(500);

        expect(errors).toEqual([]);
    });
}
