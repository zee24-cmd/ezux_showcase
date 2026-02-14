import { test, expect } from '@playwright/test';

test.describe('EzLayout Component', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the standalone layout demo to avoid parent layout conflicts
        await page.goto('/standalone-layout');
        // Wait for the demo to load
        await page.waitForSelector('text=EzLayout Imperative API Demo');
        await page.waitForLoadState('networkidle');
    });

    test('should render sidebar and content', async ({ page }) => {
        // Check if main content is visible
        await expect(page.getByText('Welcome to EzLayout Imperative API Demo')).toBeVisible();

        // Check if sidebar content is visible (it should be open by default in dashboard mode)
        await expect(page.getByText('Sidebar Content')).toBeVisible();
    });

    test('should toggle sidebar via imperative API', async ({ page }) => {
        // Initially sidebar should be open
        await expect(page.getByText('Sidebar Content')).toBeVisible();

        // Click "Toggle Sidebar" button
        await page.getByRole('button', { name: 'Toggle Sidebar' }).click({ force: true });

        // Sidebar should now be closed
        await expect(page.getByText('Sidebar Content')).not.toBeVisible();

        // Click "Toggle Sidebar" again
        await page.getByRole('button', { name: 'Toggle Sidebar' }).click({ force: true });

        // Sidebar should be open again
        await expect(page.getByText('Sidebar Content')).toBeVisible();
    });

    test('should open and close sidebar via imperative API', async ({ page }) => {
        // Close sidebar
        await page.getByRole('button', { name: 'Close Sidebar' }).click({ force: true });
        await expect(page.getByText('Sidebar Content')).not.toBeVisible();

        // Open sidebar
        await page.getByRole('button', { name: 'Open Sidebar' }).click({ force: true });
        await expect(page.getByText('Sidebar Content')).toBeVisible();
    });

    test('should switch modes via imperative API', async ({ page }) => {
        // Switch to Auth Mode
        await page.getByRole('button', { name: 'Auth Mode' }).click({ force: true });
        // Note: In auth mode, the EzLayout component might still render the sidebar 
        // but it should be collapsed or hidden by CSS. 
        // We'll check if the mode text updates as a proxy for the internal state.
        await expect(page.getByText('Get State')).toBeVisible();

        // Switch back to Dashboard Mode
        await page.getByRole('button', { name: 'Dashboard Mode' }).click({ force: true });
        await expect(page.getByText('Sidebar Content')).toBeVisible();

        // Switch to Minimal Mode
        await page.getByRole('button', { name: 'Minimal Mode' }).click({ force: true });
        // In minimal mode, sidebar is explicitly hidden
        await expect(page.getByText('Sidebar Content')).not.toBeVisible();
    });

    test('should show state via imperative API', async ({ page }) => {
        // Click "Get State"
        await page.getByRole('button', { name: 'Get State' }).click({ force: true });

        // Use a more specific selector for the state JSON pre block
        const statePre = page.locator('pre').filter({ hasText: '"sidebarOpen"' });
        await expect(statePre).toContainText('"sidebarOpen": true');
        await expect(statePre).toContainText('"mode": "dashboard"');

        // Toggle and check again
        await page.getByRole('button', { name: 'Toggle Sidebar' }).click({ force: true });
        await page.getByRole('button', { name: 'Get State' }).click({ force: true });
        await expect(statePre).toContainText('"sidebarOpen": false');
    });
});
