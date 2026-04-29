import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-vite-plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// When EZUX_LOCAL=true, resolve all ezux imports from the sibling source
// directory instead of node_modules. Vercel builds skip this (no env var).
const EZUX_LOCAL = process.env.EZUX_LOCAL === 'true';
const ezuxSrc = path.resolve(__dirname, '../ezux/src');
// Build alias array — specific paths MUST come before the general 'ezux' entry
// so Vite matches them first (array aliases are checked in order).
const ezuxLocalAliases = EZUX_LOCAL
    ? [
        // CSS assets — most specific, must match before 'ezux' prefix
        { find: 'ezux/dist/ezux.css', replacement: path.resolve(ezuxSrc, 'style.css') },
        { find: 'ezux/dist/theme-vars.css', replacement: path.resolve(ezuxSrc, 'theme-vars.css') },
        // Sub-path exports
        { find: 'ezux/scheduler', replacement: path.resolve(ezuxSrc, 'components/EzScheduler/index.tsx') },
        { find: 'ezux/kanban', replacement: path.resolve(ezuxSrc, 'components/EzKanban/index.tsx') },
        { find: 'ezux/layout', replacement: path.resolve(ezuxSrc, 'components/EzLayout/index.tsx') },
        { find: 'ezux/table', replacement: path.resolve(ezuxSrc, 'components/EzTable/index.tsx') },
        { find: 'ezux/treeview', replacement: path.resolve(ezuxSrc, 'components/EzTreeView/index.tsx') },
        { find: 'ezux/signature', replacement: path.resolve(ezuxSrc, 'components/EzSignature/index.tsx') },
        // General entry — catches `import ... from 'ezux'`
        { find: 'ezux', replacement: path.resolve(ezuxSrc, 'index.ts') },
    ]
    : [];

export default defineConfig({
    plugins: [
        tailwindcss(),
        TanStackRouterVite({
            routesDirectory: './src/routes',
            generatedRouteTree: './src/routeTree.gen.ts',
            enableRouteGeneration: true,
            autoCodeSplitting: true
        }),
        react()
    ],
    resolve: {
        alias: [
            { find: '@', replacement: path.resolve(__dirname, './src') },
            { find: 'react', replacement: path.resolve(__dirname, './node_modules/react') },
            { find: 'react-dom', replacement: path.resolve(__dirname, './node_modules/react-dom') },
            { find: 'use-sync-external-store/shim/with-selector.js', replacement: 'use-sync-external-store/shim/with-selector' },
            ...ezuxLocalAliases,
        ]
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
        // Always exclude ezux from pre-bundling — either it's aliased to
        // source files (EZUX_LOCAL) or it's an ESM package (npm).
        exclude: ['ezux']
    },
    server: {
        port: 3001,
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
                manualChunks(id) {
                    if (!id.includes('node_modules')) return;
                    if (id.includes('/react/') || id.includes('/react-dom/')) return 'vendor-react';
                    if (id.includes('/@tanstack/')) return 'vendor-tanstack';
                    if (
                        id.includes('/lucide-react/') ||
                        id.includes('/clsx/') ||
                        id.includes('/tailwind-merge/')
                    ) {
                        return 'vendor-ui';
                    }
                }
            }
        }
    }
});
