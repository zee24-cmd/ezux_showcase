import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';

const EzSchedulerDemoWrapper = lazy(() => import('@/demos/layout/EzSchedulerDemoWrapper').then(m => ({ default: m.EzSchedulerDemoWrapper })));

export const Route = createFileRoute('/_auth/scheduler/workdays')({
    component: WorkDaysPage,
});

function WorkDaysPage() {

    return (
        <DemoWrapper
            title="Custom Work Days"
            description="Configure custom working days and hours for flexible scheduling scenarios."
            codeLoader={() => import('@/demos/layout/EzSchedulerDemoWrapper?raw').then(m => m.default)} componentName="EzScheduler"
        >
            <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
                <EzSchedulerDemoWrapper initialScenario="workdays" />
            </Suspense>
        </DemoWrapper>
    );
}
