import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/kanban')({
    component: KanbanLayout,
    head: () => ({
        meta: [
            {
                title: 'EzKanban | Advanced React Kanban Board',
            },
            {
                name: 'description',
                content: 'Fully customizable, high-performance Kanban board with swimlanes and timeline views for complex workflows.',
            },
        ],
    }),
});

function KanbanLayout() {
    return (
        <div className="flex-1 w-full bg-background h-full flex flex-col overflow-hidden relative">
            <Outlet />
        </div>
    );
}
