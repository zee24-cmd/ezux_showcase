import { useState } from 'react';
import { BasicDemo } from '../kanban/BasicDemo';
import { SwimlaneDemo } from '../kanban/SwimlaneDemo';
import { TimelineDemo } from '../kanban/TimelineDemo';
import { Tabs, TabsList, TabsTrigger, globalServiceRegistry, KanbanService } from 'ezux';

export const EzKanbanDemoWrapper = () => {
    const [activeDemo, setActiveDemo] = useState('basic');

    // Register the Kanban Service for Enterprise Data Management logic
    // We do this synchronously in render (lazy check) so it's available for children immediately
    if (!globalServiceRegistry.get('KanbanService')) {
        const service = new KanbanService();
        service.init();
        globalServiceRegistry.register('KanbanService', service);
        console.log('KanbanService Registered for Demos');
    }

    return (
        <div className="flex flex-col h-full w-full bg-background overflow-hidden p-4 space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">EzKanban Demo</h1>
                    <p className="text-muted-foreground">Modern, flexible Kanban board with advanced features.</p>
                </div>
                <Tabs value={activeDemo} onValueChange={setActiveDemo} className="w-auto">
                    <TabsList>
                        <TabsTrigger value="basic">Basic Board</TabsTrigger>
                        <TabsTrigger value="swimlanes">Swimlanes</TabsTrigger>
                        <TabsTrigger value="timeline">Timeline View</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex-1 overflow-hidden border rounded-xl bg-card shadow-sm">
                {activeDemo === 'basic' && <BasicDemo />}
                {activeDemo === 'swimlanes' && <SwimlaneDemo />}
                {activeDemo === 'timeline' && <TimelineDemo />}
            </div>
        </div>
    );
};
