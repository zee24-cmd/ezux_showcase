import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';
import { MetaTags } from '@/components/MetaTags';

const EzTableDemoWrapper = lazy(() => import('@/demos/layout/EzTableDemoWrapper').then(m => ({ default: m.EzTableDemoWrapper })));

export const Route = createFileRoute('/_auth/table/basic-table')({
    component: TablePage,
});

function TablePage() {
    const [code, setCode] = useState('');

    useEffect(() => {
        // @ts-ignore
        import('@/demos/layout/EzTableDemoWrapper?raw').then((m) => {
            setCode(m.default);
        });
    }, []);

    return (
        <div>
            <MetaTags
                title="Table View"
                description="High-performance React Data Grid with virtualization, sorting, and filtering."
                keywords="React Table, Data Grid, Virtualization, TanStack Table, Grid, Filtering, Sorting"
            />
            <DemoWrapper
                title="Table View"
                description="High-performance data grid with virtualization, sorting, filtering, and infinite scroll."
                code={code} componentName="EzTable"

            >
                <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
                    <EzTableDemoWrapper />
                </Suspense>
            </DemoWrapper>
        </div>
    );
}
