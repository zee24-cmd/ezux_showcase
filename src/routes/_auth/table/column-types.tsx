import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';

const EzTableColumnTypesDemoWrapper = lazy(() => import('@/demos/layout/EzTableColumnTypesDemoWrapper').then(m => ({ default: m.EzTableColumnTypesDemoWrapper })));

export const Route = createFileRoute('/_auth/table/column-types')({
    component: ColumnTypesPage,
});

function ColumnTypesPage() {

    return (
        <DemoWrapper
            title="Column Types"
            description="Demonstrates boolean column types with tri-state support (true, false, null) and custom cell rendering."
            codeLoader={() => import('@/demos/layout/EzTableColumnTypesDemoWrapper?raw').then(m => m.default)} componentName="EzTable"
        >
            <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
                <EzTableColumnTypesDemoWrapper />
            </Suspense>
        </DemoWrapper>
    );
}
