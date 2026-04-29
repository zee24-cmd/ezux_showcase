import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';
import { MetaTags } from '@/components/MetaTags';

const EzFlowDemo = lazy(() => import('@/demos/flow/EzFlowDemo').then(m => ({ default: m.EzFlowDemo })));

export const Route = createFileRoute('/_auth/flow/')({
    component: FlowPage,
});

function FlowPage() {
    return (
        <div className="h-full">
            <MetaTags
                title="EzFlow Workflow Builder"
                description="Visual workflow builder with typed nodes, validation, import/export, and service-backed save and publish actions."
                keywords="React workflow builder, EzFlow, node editor, workflow validation, workflow automation"
            />
            <DemoWrapper
                title="EzFlow Workflow Builder"
                description="Build and validate workflow graphs with typed nodes, branch logic, save, publish, and JSON export."
                codeLoader={() => import('@/demos/flow/EzFlowDemo?raw').then(m => m.default)}
                componentName="EzFlow"
            >
                <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" /></div>}>
                    <EzFlowDemo />
                </Suspense>
            </DemoWrapper>
        </div>
    );
}
