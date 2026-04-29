import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';

const EzTablePivotDemoWrapper = lazy(() => import('@/demos/layout/EzTablePivotDemoWrapper').then(m => ({ default: m.EzTablePivotDemoWrapper })));

export const Route = createFileRoute('/_auth/table/pivot')({
    component: PivotPage,
});

function PivotPage() {

    return (
        <DemoWrapper
            title="Pivot Table"
            description="Virtualized pivot table with dynamic multi-dimensional grouping, aggregation, and granular date filtering."
            codeLoader={() => import('@/demos/layout/EzTablePivotDemoWrapper?raw').then(m => m.default)} componentName="EzTable"
        >
            <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
                <EzTablePivotDemoWrapper />
            </Suspense>
        </DemoWrapper>
    );
}
