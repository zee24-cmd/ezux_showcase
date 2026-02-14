import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/kanban/')({
    beforeLoad: () => {
        throw redirect({ to: '/kanban/basic' });
    }
});
