import { createRootRoute, Outlet } from '@tanstack/react-router';
import { EzLayout } from 'ezux';
import { HeaderComponent, SidebarContent, FooterContent } from '../components/ShowcaseShell';

export const Route = createRootRoute({
    component: RootComponent,
});

function RootComponent() {
    return (
        <EzLayout
            sidebarResizable={true}
            slots={{
                header: HeaderComponent,
                sidebar: SidebarContent,
                footer: FooterContent
            }}
            headerClassName="!bg-transparent !shadow-none !border-none z-50 h-18"
            sidebarClassName="glass-card !border-y-0 !border-l-0 !rounded-none z-40"
            footerClassName="bg-transparent"
        >
            <Outlet />
        </EzLayout>
    );
}
