import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';

const TimelineDemo = lazy(() => import('@/demos/kanban/TimelineDemo').then(m => ({ default: m.TimelineDemo })));

export const Route = createFileRoute('/_auth/kanban/timeline')({
    component: () => {

        return (
            <DemoWrapper
                title="Timeline View"
                description="Visualize your tasks over time. Manage deadlines and identify bottlenecks."
                codeLoader={() => import('@/demos/kanban/TimelineDemo?raw').then(m => m.default)} componentName="EzKanban"
            >
                <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
                    <TimelineDemo />
                </Suspense>
            </DemoWrapper>
        );
    },
});
