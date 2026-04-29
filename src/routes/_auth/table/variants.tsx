import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';

const EzTableVariantsDemoWrapper = lazy(() => import('@/demos/layout/EzTableVariantsDemoWrapper').then(m => ({ default: m.EzTableVariantsDemoWrapper })));

export const Route = createFileRoute('/_auth/table/variants')({
    component: VariantsPage,
});

function VariantsPage() {

    return (
        <DemoWrapper
            title="Variants & Controls"
            description="Showcases various cell edit variants including Switch, Radio, Combobox, and Dropdown inputs."
            codeLoader={() => import('@/demos/layout/EzTableVariantsDemoWrapper?raw').then(m => m.default)} componentName="EzTable"
        >
            <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
                <EzTableVariantsDemoWrapper />
            </Suspense>
        </DemoWrapper>
    );
}
