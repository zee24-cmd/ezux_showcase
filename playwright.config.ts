import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:3101';

export default defineConfig({
    testDir: './tests',
    timeout: 30_000,
    expect: {
        timeout: 15_000,
    },
    use: {
        baseURL,
        trace: 'on-first-retry',
    },
    webServer: {
        command: 'npm run dev -- --host 127.0.0.1 --port 3101 --strictPort',
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
