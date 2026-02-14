import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';

const TimelineDemo = lazy(() => import('@/demos/kanban/TimelineDemo').then(m => ({ default: m.TimelineDemo })));

export const Route = createFileRoute('/_auth/kanban/timeline')({
    component: () => {
        const [code, setCode] = useState('');

        useEffect(() => {
            // @ts-ignore
            import('@/demos/kanban/TimelineDemo?raw').then((m) => {
                setCode(m.default);
            });
        }, []);

        return (
            <DemoWrapper
                title="Timeline View"
                description="Visualize your tasks over time. Manage deadlines and identify bottlenecks."
                code={code} componentName="EzKanban"
            >
                <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
                    <TimelineDemo />
                </Suspense>
            </DemoWrapper>
        );
    },
});
