import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';

const EzTableComprehensiveDemoWrapper = lazy(() => import('@/demos/layout/EzTableComprehensiveDemoWrapper').then(m => ({ default: m.EzTableComprehensiveDemoWrapper })));

export const Route = createFileRoute('/_auth/table/all-types')({
    component: AllTypesPage,
});

function AllTypesPage() {
    const [code, setCode] = useState('');

    useEffect(() => {
        // @ts-ignore
        import('@/demos/layout/EzTableComprehensiveDemoWrapper?raw').then((m) => {
            setCode(m.default);
        });
    }, []);

    return (
        <DemoWrapper
            title="Comprehensive Grid"
            description="Full schema showcase including rich text, charts, dates, currency, and custom aggregations."
            code={code} componentName="EzTable"
        >
            <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
                <EzTableComprehensiveDemoWrapper />
            </Suspense>
        </DemoWrapper>
    );
}
