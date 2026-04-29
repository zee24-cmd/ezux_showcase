import { createFileRoute } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { DemoWrapper } from '@/components/DemoWrapper';
import { MetaTags } from '@/components/MetaTags';

const EzSchedulerDemoWrapper = lazy(() => import('@/demos/layout/EzSchedulerDemoWrapper').then(m => ({ default: m.EzSchedulerDemoWrapper })));

export const Route = createFileRoute('/_auth/scheduler/views')({
  component: ViewsPage,
});

function ViewsPage() {

  return (
    <>
      <MetaTags
        title="Scheduler Views"
        description="Advanced React Scheduler and Calendar component with multi-view support."
        keywords="React Scheduler, Calendar, Event Management, Drag and Drop, Day View, Week View, Month View"
      />
      <DemoWrapper
        title="Scheduler Views"
        description="Explore different calendar views including Day, Week, Work Week, Month, and Agenda."
        codeLoader={() => import('@/demos/layout/EzSchedulerDemoWrapper?raw').then(m => m.default)} componentName="EzScheduler"
      >
        <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>}>
          <EzSchedulerDemoWrapper initialScenario="views" />
        </Suspense>
      </DemoWrapper>
    </>
  );
}
