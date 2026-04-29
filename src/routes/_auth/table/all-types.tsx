import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';

const EzTableComprehensiveDemoWrapper = lazy(() => import('@/demos/layout/EzTableComprehensiveDemoWrapper').then(m => ({ default: m.EzTableComprehensiveDemoWrapper })));

export const Route = createFileRoute('/_auth/table/all-types')({
    component: AllTypesPage,
});

function AllTypesPage() {

    return (
        <DemoWrapper
            title="Comprehensive Grid"
            description="Full schema showcase including rich text, charts, dates, currency, and custom aggregations."
            codeLoader={() => import('@/demos/layout/EzTableComprehensiveDemoWrapper?raw').then(m => m.default)} componentName="EzTable"
        >
            <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
                <EzTableComprehensiveDemoWrapper />
            </Suspense>
        </DemoWrapper>
    );
}
