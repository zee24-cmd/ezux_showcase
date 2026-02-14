import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';

const EzTableCRUDDemoWrapper = lazy(() => import('@/demos/layout/EzTableCRUDDemoWrapper').then(m => ({ default: m.EzTableCRUDDemoWrapper })));

export const Route = createFileRoute('/_auth/table/crud')({
    component: TableCRUDPage,
});

function TableCRUDPage() {
    const [code, setCode] = useState('');

    useEffect(() => {
        // @ts-ignore
        import('@/demos/layout/EzTableCRUDDemoWrapper?raw').then((m) => {
            setCode(m.default);
        });
    }, []);

    return (
        <DemoWrapper
            title="CRUD Operations"
            description="Full-featured CRUD Data Grid with batch editing, validation, and optimistic updates."
            code={code} componentName="EzTable"
        >
            <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
                <EzTableCRUDDemoWrapper />
            </Suspense>
        </DemoWrapper>
    );
}
