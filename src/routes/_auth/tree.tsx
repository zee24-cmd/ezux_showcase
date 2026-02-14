import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';

const EzTreeViewDemoWrapper = lazy(() => import('@/demos/layout/EzTreeViewDemoWrapper').then(m => ({ default: m.EzTreeViewDemoWrapper })));

export const Route = createFileRoute('/_auth/tree')({
    component: TreePage,
});

function TreePage() {
    const [code, setCode] = useState('');

    useEffect(() => {
        // @ts-ignore
        import('@/demos/treeview/EzTreeViewDemo?raw').then((m) => {
            setCode(m.default);
        });
    }, []);

    return (
        <DemoWrapper
            title="Tree View"
            description="A hierarchical tree component with drag-and-drop, virtualization, and search support."
            code={code}
            componentName="EzTreeView"
        >
            <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
                <EzTreeViewDemoWrapper />
            </Suspense>
        </DemoWrapper>
    );
}
