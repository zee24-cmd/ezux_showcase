import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';

const CustomizationDemo = lazy(() => import('@/demos/kanban/CustomizationDemo').then(m => ({ default: m.CustomizationDemo })));

export const Route = createFileRoute('/_auth/kanban/customization')({
    component: () => {

        return (
            <DemoWrapper
                title="Custom Renderers & Editors"
                description="Demonstrating the hybrid approach: customize card content with progress bars and badges, or completely replace the editor with a custom side-panel or modal."
                codeLoader={() => import('@/demos/kanban/CustomizationDemo?raw').then(m => m.default)} componentName="EzKanban"
            >
                <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
                    <CustomizationDemo />
                </Suspense>
            </DemoWrapper>
        );
    },
});
