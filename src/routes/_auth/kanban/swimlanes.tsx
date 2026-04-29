import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';

const SwimlaneDemo = lazy(() => import('@/demos/kanban/SwimlaneDemo').then(m => ({ default: m.SwimlaneDemo })));

export const Route = createFileRoute('/_auth/kanban/swimlanes')({
    component: () => {

        return (
            <DemoWrapper
                title="Swimlane Organization"
                description="Group cards horizontally by team, priority, or custom categories. Swimlanes provide an additional layer of organization to complex workflows."
                codeLoader={() => import('@/demos/kanban/SwimlaneDemo?raw').then(m => m.default)} componentName="EzKanban"
            >
                <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
                    <SwimlaneDemo />
                </Suspense>
            </DemoWrapper>
        );
    },
});
