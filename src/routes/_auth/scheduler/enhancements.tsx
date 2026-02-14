import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';

const EzSchedulerDemoWrapper = lazy(() => import('@/demos/layout/EzSchedulerDemoWrapper').then(m => ({ default: m.EzSchedulerDemoWrapper })));

export const Route = createFileRoute('/_auth/scheduler/enhancements')({
    component: EnhancementsPage,
});

function EnhancementsPage() {
    const [code, setCode] = useState('');

    useEffect(() => {
        // @ts-ignore
        import('@/demos/layout/EzSchedulerDemoWrapper?raw').then((m) => {
            setCode(m.default);
        });
    }, []);

    return (
        <DemoWrapper
            title="Scheduler Enhancements"
            description="Development testing ground for new scheduler features, visual updates, and interaction improvements."
            code={code} componentName="EzScheduler"
        >
            <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
                <EzSchedulerDemoWrapper initialScenario="test-enhancements" />
            </Suspense>
        </DemoWrapper>
    );
}
