import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';

const BasicDemo = lazy(() => import('@/demos/kanban/BasicDemo').then(m => ({ default: m.BasicDemo })));

export const Route = createFileRoute('/_auth/kanban/basic')({
    component: () => {
        const [code, setCode] = useState('');

        useEffect(() => {
            // @ts-ignore
            import('@/demos/kanban/BasicDemo?raw').then((m) => {
                setCode(m.default);
            });
        }, []);

        return (
            <DemoWrapper
                title="Standard Kanban Board"
                description="The classic Kanban experience. Vertical columns represent your workflow stages. Manage tasks with drag-and-drop, real-time filtering, and optimistic batch updates."
                code={code}
                componentName="EzKanban"
            >
                <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
                    <BasicDemo />
                </Suspense>
            </DemoWrapper>
        );
    },
});
