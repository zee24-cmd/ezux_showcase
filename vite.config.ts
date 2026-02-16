import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        tailwindcss(),
        react(),
        TanStackRouterVite({
            routesDirectory: './src/routes',
            generatedRouteTree: './src/routeTree.gen.ts',
            enableRouteGeneration: true
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            'use-sync-external-store/shim/with-selector.js': 'use-sync-external-store/shim/with-selector'
        }
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify('development')
    },
    optimizeDeps: {
        include: [
            '@tanstack/react-store',
            'use-sync-external-store/shim/with-selector',
            'rrule'
        ],
        exclude: ['ezux']
    },
    server: {
        hmr: {
            overlay: true
        }
    },
    build: {
        commonjsOptions: {
            include: [/node_modules/],
            transformMixedEsModules: true
        },
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom'],
                    'vendor-tanstack': ['@tanstack/react-router', '@tanstack/react-table', '@tanstack/react-virtual'],
                    'vendor-ui': ['lucide-react', 'clsx', 'tailwind-merge'],
                }
            }
        }
    }
});
