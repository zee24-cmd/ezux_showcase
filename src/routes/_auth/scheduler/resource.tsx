import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';

const EzSchedulerDemoWrapper = lazy(() => import('@/demos/layout/EzSchedulerDemoWrapper').then(m => ({ default: m.EzSchedulerDemoWrapper })));

export const Route = createFileRoute('/_auth/scheduler/resource')({
    component: ResourcePage,
});

function ResourcePage() {
    const [code, setCode] = useState('');

    useEffect(() => {
        // @ts-ignore
        import('@/demos/layout/EzSchedulerDemoWrapper?raw').then((m) => {
            setCode(m.default);
        });
    }, []);

    return (
        <DemoWrapper
            title="Resource View"
            description="Manage multiple resources (doctors, equipment, etc.) with specialized views for resource allocation."
            code={code} componentName="EzScheduler"
        >
            <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
                <EzSchedulerDemoWrapper initialScenario="resource" />
            </Suspense>
        </DemoWrapper>
    );
}
