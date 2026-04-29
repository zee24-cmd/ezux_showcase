import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';

const EzLayoutImperativeDemoWrapper = lazy(() => import('@/demos/layout/EzLayoutImperativeDemoWrapper').then(m => ({ default: m.EzLayoutImperativeDemoWrapper })));

export const Route = createFileRoute('/_auth/layout-imperative/')({
    component: LayoutImperativePage,
});

function LayoutImperativePage() {

    return (
        <DemoWrapper
            title="EzLayout Imperative API"
            description="Programmatically control layout state (sidebar, mode, auth) using the imperative ref API."
            codeLoader={() => import('@/demos/layout/EzLayoutImperativeDemoWrapper?raw').then(m => m.default)}
            componentName="EzLayout"
        >
            <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
                <EzLayoutImperativeDemoWrapper />
            </Suspense>
        </DemoWrapper>
    );
}
