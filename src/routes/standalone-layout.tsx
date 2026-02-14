import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';

const EzLayoutImperativeDemoWrapper = lazy(() => import('@/demos/layout/EzLayoutImperativeDemoWrapper').then(m => ({ default: m.EzLayoutImperativeDemoWrapper })));

export const Route = createFileRoute('/standalone-layout')({
    component: StandaloneLayoutPage,
});

function StandaloneLayoutPage() {
    return (
        <div className="flex-1 w-full bg-background h-screen flex flex-col overflow-hidden relative">
            <Suspense fallback={
                <div className="h-full w-full flex items-center justify-center p-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            }>
                <EzLayoutImperativeDemoWrapper />
            </Suspense>
        </div>
    );
}
