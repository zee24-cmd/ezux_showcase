import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';

const EventsDemo = lazy(() => import('@/demos/kanban/EventsDemo').then(m => ({ default: m.EventsDemo })));

export const Route = createFileRoute('/_auth/kanban/events')({
    component: () => {
        const [code, setCode] = useState('');

        useEffect(() => {
            // @ts-ignore
            import('@/demos/kanban/EventsDemo?raw').then((m) => {
                setCode(m.default);
            });
        }, []);

        return (
            <DemoWrapper
                title="Events & Imperative API"
                description="Interact with the board programmatically using the ref API and listen to all board activities via event callbacks."
                code={code} componentName="EzKanban"
            >
                <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
                    <EventsDemo />
                </Suspense>
            </DemoWrapper>
        );
    },
});
