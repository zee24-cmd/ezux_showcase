import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const ShowcaseHome = lazy(() => import('@/components/ShowcaseHome').then(m => ({ default: m.ShowcaseHome })));

export const Route = createFileRoute('/_auth/')({
    component: HomePage,
    head: () => ({
        meta: [
            {
                title: 'ezUX | Modern Enterprise UI Suite',
            },
            {
                name: 'description',
                content: 'Experience the next generation of enterprise React components. High-performance tables, schedulers, and kanban boards.',
            },
        ],
    }),
});

function HomePage() {
    return (
        <div className="h-full overflow-y-auto">
            <Suspense fallback={null}>
                <ShowcaseHome />
            </Suspense>
        </div>
    );
}
