import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';

const EzTableGroupingDemoWrapper = lazy(() => import('@/demos/layout/EzTableGroupingDemoWrapper').then(m => ({ default: m.EzTableGroupingDemoWrapper })));

export const Route = createFileRoute('/_auth/table/grouping')({
    component: TableGroupingPage,
});

function TableGroupingPage() {

    return (
        <DemoWrapper
            title="Grouping & Hierarchy"
            description="Organize data with multi-level grouping and aggregation. Expand and collapse groups to analyze hierarchical data."
            codeLoader={() => import('@/demos/layout/EzTableGroupingDemoWrapper?raw').then(m => m.default)} componentName="EzTable"
        >
            <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
                <EzTableGroupingDemoWrapper />
            </Suspense>
        </DemoWrapper>
    );
}
