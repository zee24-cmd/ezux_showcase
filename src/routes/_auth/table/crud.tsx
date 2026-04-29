import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';

const EzTableCRUDDemoWrapper = lazy(() => import('@/demos/layout/EzTableCRUDDemoWrapper').then(m => ({ default: m.EzTableCRUDDemoWrapper })));

export const Route = createFileRoute('/_auth/table/crud')({
    component: TableCRUDPage,
});

function TableCRUDPage() {

    return (
        <DemoWrapper
            title="CRUD Operations"
            description="Full-featured CRUD Data Grid with batch editing, validation, and optimistic updates."
            codeLoader={() => import('@/demos/layout/EzTableCRUDDemoWrapper?raw').then(m => m.default)} componentName="EzTable"
        >
            <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
                <EzTableCRUDDemoWrapper />
            </Suspense>
        </DemoWrapper>
    );
}
