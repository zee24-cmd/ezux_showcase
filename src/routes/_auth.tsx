import React from 'react';
import { createFileRoute, Outlet, redirect, Link, useNavigate } from '@tanstack/react-router';
import {
    EzLayout,
    globalServiceRegistry,
    LayoutService,
    I18nService,
    Button,
    Input,
    Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
    EzThemeSwitcher,
    EzThemeColorChanger,
    EzLanguageSwitcher,
    EzUserProfile,
    cn,
    NotificationService,
    EzNotificationDropdown
} from 'ezux';
import { MetaTags } from '@/components/MetaTags';
import {
    Calendar,
    FolderTree,
    Trello,
    LayoutDashboard,
    TableProperties,
    FileSpreadsheet,
    Layers,
    Table2,
    Home,
    Settings,
    Menu,
    Search,
    Power,
    MousePointer2,
    ChevronRight,
    Github
} from 'lucide-react';

export const Route = createFileRoute('/_auth')({
    beforeLoad: () => {
        const layoutService = globalServiceRegistry.getOrThrow<LayoutService>('LayoutService');
        const state = layoutService.getState();

        // If in auth mode, redirect to auth/signin
        if (state.mode === 'auth') {
            throw redirect({
                to: '/auth/signin',
            });
        }
    },
    component: AuthenticatedLayout,
});

const NotificationBell = () => {
    return <EzNotificationDropdown />;
};

const NavLinkGroup = ({
    icon: Icon,
    label,
    children,
    isExpanded,
    onToggle,
}: {
    icon: any,
    label: string,
    children: React.ReactNode,
    isExpanded: boolean,
    onToggle: () => void,
}) => {
    return (
        <div className="pt-1 pb-1">
            <button
                onClick={onToggle}
                className={cn(
                    "inline-flex items-center justify-between w-full h-12 px-4 font-bold text-left relative overflow-hidden group transition-all duration-500 rounded-2xl",
                    "hover:bg-primary/[0.06] hover:text-primary hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)]",
                    "text-foreground/80 border border-transparent hover:border-primary/10",
                    isExpanded && "bg-primary/5 text-primary border-primary/10 shadow-sm"
                )}
            >
                <div className="flex items-center gap-3.5">
                    <Icon className="w-4.5 h-4.5 flex-shrink-0 transition-transform duration-700 group-hover:scale-110" />
                    <span className="truncate tracking-tight">{label}</span>
                </div>
                <ChevronRight className={cn("w-3.5 h-3.5 transition-transform duration-300", isExpanded && "rotate-90")} />
            </button>

            {isExpanded && (
                <div className="pl-5 space-y-1 mt-2 mb-2 relative animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent" />
                    {children}
                </div>
            )}
        </div>
    );
};

function AuthenticatedLayout() {
    const navigate = useNavigate();
    const { pathname } = window.location;
    const layoutService = globalServiceRegistry.getOrThrow<LayoutService>('LayoutService');
    const i18nService = globalServiceRegistry.getOrThrow<I18nService>('I18nService');
    const [_, setTick] = React.useState(0);

    // Accordion state
    const [expandedSection, setExpandedSection] = React.useState<string | null>(null);

    // Initialize expanded section based on current path
    React.useEffect(() => {
        if (pathname.startsWith('/table')) setExpandedSection('table');
        else if (pathname.startsWith('/scheduler')) setExpandedSection('scheduler');
        else if (pathname.startsWith('/kanban')) setExpandedSection('kanban');

        // Auto-close sidebar on mobile when navigating
        const state = layoutService.getState();
        if (state.isMobile && state.sidebarOpen) {
            layoutService.toggleSidebar(false);
        }
    }, [pathname]); // Added pathname as dependency

    const notifiedRef = React.useRef(false);
    React.useEffect(() => {
        const unsub = i18nService.subscribe(() => setTick(t => t + 1));

        // Add welcome notification
        const notificationService = globalServiceRegistry.get<NotificationService>('NotificationService');
        if (notificationService && !notifiedRef.current) {
            notificationService.add({
                type: 'info',
                message: i18nService.t('welcome_to_ezux') || 'Welcome to ezUX!',
                duration: 5000
            });
            notifiedRef.current = true;
        }

        return () => { unsub(); };
    }, [i18nService]);

    const handleLogout = () => {
        layoutService.setMode('auth');
        navigate({ to: '/auth/signin' });
    };

    const DemoBreadcrumb = (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <Link to="/" className="flex items-center gap-1 hover:underline">
                        <Home className="w-3 h-3" /> {i18nService.t('nav_home')}
                    </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage className="capitalize">
                        {i18nService.t('nav_home')}
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );

    const SidebarContent = (
        <div className="flex flex-col h-full bg-transparent">
            {/* Sidebar Logo for Mobile */}
            <div className="p-8 md:hidden">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">E</div>
                    <span className="font-black text-xl tracking-tighter">ezUX</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col whitespace-normal px-4 space-y-1.5 mt-6 md:mt-4 overflow-y-auto custom-scrollbar">
                <p className="px-4 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-4">{i18nService.t('nav_main_navigation')}</p>

                <Link
                    to="/"
                    className={cn(
                        "inline-flex items-center justify-start w-full gap-3.5 h-12 px-4 font-bold text-left relative overflow-hidden group transition-all duration-500 rounded-2xl",
                        "hover:bg-primary/[0.06] hover:text-primary hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)]",
                        "text-foreground/80 border border-transparent hover:border-primary/10"
                    )}
                    activeProps={{ className: "bg-primary/10 text-primary shadow-sm border-primary/20" }}
                >
                    <Home className="w-4.5 h-4.5 flex-shrink-0 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110" />
                    <span className="truncate tracking-tight">{i18nService.t('nav_home')}</span>
                    <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                </Link>

                <NavLinkGroup
                    icon={TableProperties}
                    label={i18nService.t('nav_data_tables')}
                    isExpanded={expandedSection === 'table'}
                    onToggle={() => setExpandedSection(expandedSection === 'table' ? null : 'table')}
                >
                    {[
                        { to: "/table/basic-table", label: i18nService.t('nav_basic_table'), icon: TableProperties },
                        { to: "/table/all-types", label: i18nService.t('nav_all_types'), icon: Table2 },
                        { to: "/table/crud", label: i18nService.t('nav_crud_features'), icon: FileSpreadsheet },
                        { to: "/table/grouping", label: i18nService.t('nav_grouping_hierarchy'), icon: Layers },
                        { to: "/table/pivot", label: i18nService.t('nav_pivot_table'), icon: LayoutDashboard },
                    ].map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={cn(
                                "inline-flex items-center justify-start w-full gap-3 h-9 px-4 font-semibold text-left text-xs relative overflow-hidden transition-all duration-300 rounded-xl group",
                                "hover:bg-primary/[0.04] hover:text-primary text-foreground/70"
                            )}
                            activeProps={{ className: "text-primary font-black bg-primary/[0.08] !text-primary" }}
                        >
                            <link.icon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                            <span className="truncate">{link.label}</span>
                        </Link>
                    ))}
                </NavLinkGroup>

                <NavLinkGroup
                    icon={Calendar}
                    label={i18nService.t('nav_scheduler')}
                    isExpanded={expandedSection === 'scheduler'}
                    onToggle={() => setExpandedSection(expandedSection === 'scheduler' ? null : 'scheduler')}
                >
                    {[
                        { to: "/scheduler/views", label: i18nService.t('nav_basic_views'), icon: Layers },
                        { to: "/scheduler/timeline", label: i18nService.t('nav_timeline_resources'), icon: LayoutDashboard },
                        { to: "/scheduler/resource", label: i18nService.t('nav_resource'), icon: Calendar },
                        { to: "/scheduler/grouping", label: i18nService.t('nav_resource_grouping'), icon: Layers },
                        { to: "/scheduler/workdays", label: i18nService.t('nav_work_days'), icon: Calendar },
                    ].map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={cn(
                                "inline-flex items-center justify-start w-full gap-3 h-9 px-4 font-semibold text-left text-xs relative overflow-hidden transition-all duration-300 rounded-xl group",
                                "hover:bg-primary/[0.04] hover:text-primary text-foreground/70"
                            )}
                            activeProps={{ className: "text-primary font-black bg-primary/[0.08] !text-primary" }}
                        >
                            <link.icon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                            <span className="truncate">{link.label}</span>
                        </Link>
                    ))}
                </NavLinkGroup>

                <NavLinkGroup
                    icon={Trello}
                    label={i18nService.t('nav_kanban')}
                    isExpanded={expandedSection === 'kanban'}
                    onToggle={() => setExpandedSection(expandedSection === 'kanban' ? null : 'kanban')}
                >
                    {[
                        { to: "/kanban/basic", label: i18nService.t('nav_basic_kanban'), icon: Layers },
                        { to: "/kanban/swimlanes", label: i18nService.t('nav_swimlanes'), icon: LayoutDashboard },
                        { to: "/kanban/timeline", label: i18nService.t('nav_timeline_view'), icon: Calendar },
                        { to: "/kanban/customization", label: i18nService.t('nav_custom_renderers'), icon: Settings },
                        { to: "/kanban/events", label: i18nService.t('nav_events_api'), icon: MousePointer2 },
                    ].map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={cn(
                                "inline-flex items-center justify-start w-full gap-3 h-9 px-4 font-semibold text-left text-xs relative overflow-hidden transition-all duration-300 rounded-xl group",
                                "hover:bg-primary/[0.04] hover:text-primary text-foreground/70"
                            )}
                            activeProps={{ className: "text-primary font-black bg-primary/[0.08] !text-primary" }}
                        >
                            <link.icon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                            <span className="truncate">{link.label}</span>
                        </Link>
                    ))}
                </NavLinkGroup>

                <Link
                    to="/tree"
                    className={cn(
                        "inline-flex items-center justify-start w-full gap-3.5 h-12 px-4 font-bold text-left relative overflow-hidden group transition-all duration-500 rounded-2xl",
                        "hover:bg-primary/[0.06] hover:text-primary",
                        "text-foreground/80 border border-transparent hover:border-primary/10"
                    )}
                    activeProps={{ className: "bg-primary/10 text-primary shadow-sm border-primary/20" }}
                >
                    <FolderTree className="w-4.5 h-4.5 flex-shrink-0 transition-transform duration-700 group-hover:scale-110" />
                    <span className="truncate tracking-tight">{i18nService.t('nav_tree')}</span>
                </Link>

                <Link
                    to="/signature"
                    className={cn(
                        "inline-flex items-center justify-start w-full gap-3.5 h-12 px-4 font-bold text-left relative overflow-hidden group transition-all duration-500 rounded-2xl",
                        "hover:bg-primary/[0.06] hover:text-primary",
                        "text-foreground/80 border border-transparent hover:border-primary/10"
                    )}
                    activeProps={{ className: "bg-primary/10 text-primary shadow-sm border-primary/20" }}
                >
                    <MousePointer2 className="w-4.5 h-4.5 flex-shrink-0 transition-transform duration-700 group-hover:scale-110" />
                    <span className="truncate tracking-tight">{i18nService.t('nav_signature')}</span>
                </Link>

                <p className="px-4 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mt-8 mb-4">{i18nService.t('nav_system_settings')}</p>
                <Link
                    to="/docs/ez-layout"
                    className={cn(
                        "inline-flex items-center justify-start w-full gap-3.5 h-12 px-4 font-bold text-left relative overflow-hidden group transition-all duration-500 rounded-2xl",
                        "hover:bg-primary/[0.06] hover:text-primary",
                        "text-foreground/80 border border-transparent hover:border-primary/10"
                    )}
                    activeProps={{ className: "bg-primary/10 text-primary shadow-sm border-primary/20" }}
                >
                    <FolderTree className="w-4.5 h-4.5 flex-shrink-0 transition-transform duration-700 group-hover:scale-110" />
                    <span className="truncate tracking-tight">{i18nService.t('nav_documentation')}</span>
                </Link>
            </div>
        </div>
    );

    const FooterContent = (
        <div className="h-14 flex items-center justify-between px-8 text-xs font-medium text-muted-foreground/60 bg-transparent backdrop-blur-md border-t border-border/40">
            <span>© 2024 <span className="text-primary/70 font-bold tracking-tight">ezUX</span>. {i18nService.t('nav_copyright')}</span>
            <div className="flex gap-6 items-center">
                <a href="https://github.com/zee24-cmd/ezux" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5" />
                    Library
                </a>
                <a href="https://github.com/zee24-cmd/ezux_showcase" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1.5">
                    <Github className="w-3.5 h-3.5" />
                    Showcase
                </a>
                <span className="w-[1px] h-3 bg-border/40" />
                <a href="#" className="hover:text-primary transition-colors">{i18nService.t('nav_privacy_policy')}</a>
                <a href="#" className="hover:text-primary transition-colors">{i18nService.t('nav_terms_of_service')}</a>
            </div>
        </div>
    );

    const HeaderComponent: React.FC<any> = ({ toggleSidebar, sidebarOpen }) => (
        <div className="w-full h-full flex items-center justify-between px-2 bg-transparent">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="rounded-xl hover:bg-primary/5 text-muted-foreground transition-all duration-300">
                    <Menu className={cn("w-5 h-5 transition-transform duration-500", !sidebarOpen && "rotate-180")} />
                </Button>

                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center text-white font-black transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">E</div>
                    <span className="font-black text-xl text-foreground tracking-tighter hidden sm:inline-block">
                        ezUX
                    </span>
                </div>

                <div className="hidden lg:flex items-center pl-6 border-l border-border/40 ml-2 h-6">
                    {DemoBreadcrumb}
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <div className="relative hidden md:flex items-center w-full max-w-xs transition-all duration-500 focus-within:max-w-md group">
                    <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                    <Input
                        id="sidebar-search"
                        name="sidebar-search"
                        type="search"
                        placeholder={i18nService.t('nav_search_placeholder')}
                        className="pl-10 h-10 bg-muted/30 border-transparent focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/20 w-48 focus-within:w-72 transition-all duration-500 rounded-2xl placeholder:font-medium"
                    />
                </div>

                <div className="flex items-center gap-1 md:gap-1.5 p-1 rounded-2xl bg-muted/30">
                    <NotificationBell />
                    <EzThemeColorChanger />
                    <EzThemeSwitcher />
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300"
                    >
                        <a href="https://github.com/zee24-cmd/ezux" target="_blank" rel="noopener noreferrer" title="View on GitHub">
                            <Github className="w-5 h-5" />
                        </a>
                    </Button>
                    <EzLanguageSwitcher />
                </div>

                <div className="flex items-center gap-2 pl-2 border-l border-border/40">
                    <EzUserProfile
                        user={{
                            name: 'Zed User',
                            initials: 'ZU',
                            avatarUrl: 'https://github.com/shadcn.png',
                            email: 'zed@ezux.example'
                        }}
                        onLogout={handleLogout}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="h-10 w-10 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-300"
                        title={i18nService.t('sign_out')}
                    >
                        <Power className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <EzLayout
            serviceRegistry={globalServiceRegistry}
            components={{
                header: HeaderComponent,
                sidebar: SidebarContent,
                footer: FooterContent
            }}
            className="mesh-bg min-h-screen"
            headerClassName="!bg-transparent !shadow-none !border-none z-50 h-18"
            sidebarClassName="glass-card !border-y-0 !border-l-0 !rounded-none z-40"
            footerClassName="bg-transparent"
            contentClassName="overflow-y-auto"
        >
            <div>
                <MetaTags
                    description="Professional React UI components for enterprise applications. High-performance grids, schedulers, boards and more."
                    keywords="React, UI Suite, Enterprise, Grid, Table, Scheduler, Kanban, Treeview, Signature, TanStack"
                />
                <div className="relative min-h-full">
                    <React.Suspense fallback={
                        <div className="h-full w-full flex items-center justify-center p-12">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    }>
                        <Outlet />
                    </React.Suspense>
                </div>
            </div>
        </EzLayout>
    );
}
