import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';

const EzSchedulerDemoWrapper = lazy(() => import('@/demos/layout/EzSchedulerDemoWrapper').then(m => ({ default: m.EzSchedulerDemoWrapper })));

export const Route = createFileRoute('/_auth/scheduler/timeline')({
    component: TimelinePage,
});

function TimelinePage() {

    return (
        <DemoWrapper
            title="Timeline View"
            description="Horizontal timeline view for visualizing events across a continuous time axis."
            codeLoader={() => import('@/demos/layout/EzSchedulerDemoWrapper?raw').then(m => m.default)} componentName="EzScheduler"
        >
            <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
                <EzSchedulerDemoWrapper initialScenario="timeline" />
            </Suspense>
        </DemoWrapper>
    );
}
