import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    EzProvider,
    useEzServiceRegistry,
    LayoutService,
    NotificationPanel
} from 'ezux';
import 'ezux/dist/ezux.css';
import './index.css';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Initialize Services for the application
import { showcaseTranslations } from './translations';

// Exported for non-React context usage (route guards)
export const layoutService = new LayoutService();

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
        },
    },
});

const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <EzProvider translations={showcaseTranslations}>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
                <NotificationPanel />
            </QueryClientProvider>
        </EzProvider>
    </React.StrictMode>
);
