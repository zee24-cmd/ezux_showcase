import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { globalServiceRegistry, LayoutService, I18nService, ThemeService, NotificationService, NotificationPanel } from 'ezux';
import 'ezux/dist/ezux.css';
import './index.css';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Initialize Services for the application
import { showcaseTranslations } from './translations';

const layoutService = new LayoutService();
const i18nService = new I18nService();
// Register showcase translations
Object.keys(showcaseTranslations).forEach(locale => {
    i18nService.registerTranslations(locale, showcaseTranslations[locale] as Record<string, string>);
});
const themeService = new ThemeService();

globalServiceRegistry.register('LayoutService', layoutService);
globalServiceRegistry.register('I18nService', i18nService);
globalServiceRegistry.register('ThemeService', themeService);
globalServiceRegistry.register('NotificationService', new NotificationService());

// Create a new router instance
const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

// Create Query Client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <NotificationPanel />
        </QueryClientProvider>
    </React.StrictMode>
);
