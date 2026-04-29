import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
    useI18nService,
    LayoutService,
    Button,
    Input,
    Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
    EzThemeSwitcher,
    EzThemeColorChanger,
    EzLanguageSwitcher,
    EzUserProfile,
    cn,
    EzNotificationDropdown,
    EzSidebarNav,
    EzSidebarNavItem,
    EzSidebarFooter,
    EzOrganizationSwitcher,
    useEzServiceRegistry
} from '@/lib/ezux-compat';
import {
    Calendar,
    FolderTree,
    Kanban,
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
    GitPullRequest
} from 'lucide-react';

export const HeaderComponent: React.FC<any> = ({ toggleSidebar, sidebarOpen }) => {
    const i18nService = useI18nService();
    const navigate = useNavigate();
    const registry = useEzServiceRegistry();
    const layoutService = registry.getOrThrow<LayoutService>('LayoutService');

    const handleLogout = () => {
        layoutService.setMode('auth');
        navigate({ to: '/auth/signin' });
    };

    return (
        <div className="w-full h-full flex items-center justify-between px-2 bg-transparent">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={toggleSidebar} className="rounded-xl hover:bg-primary/5 text-muted-foreground transition-all duration-300">
                    <Menu className={cn("w-5 h-5 transition-transform duration-500", !sidebarOpen && "rotate-180")} />
                </Button>

                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate({ to: '/' })}>
                    <div className="w-9 h-9 bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center text-white font-black transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">E</div>
                    <span className="font-black text-xl text-foreground tracking-tighter hidden sm:inline-block">
                        ezUX
                    </span>
                </div>

                <div className="hidden lg:flex items-center pl-6 border-l border-border/40 ml-2 h-6">
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
                    <EzNotificationDropdown />
                    <EzThemeColorChanger />
                    <EzThemeSwitcher />
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300"
                    >
                        <a href="https://github.com/zee24-cmd/ezux" target="_blank" rel="noopener noreferrer" title="View on GitHub">
                            <GitPullRequest className="w-5 h-5" />
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
};

export const SidebarContent = ({ open }: { open: boolean, onClose: () => void }) => {
    const i18nService = useI18nService();
    const navigate = useNavigate();
    const registry = useEzServiceRegistry();
    const layoutService = registry.getOrThrow<LayoutService>('LayoutService');
    const { pathname } = window.location;

    const handleLogout = () => {
        layoutService.setMode('auth');
        navigate({ to: '/auth/signin' });
    };

    const organizations = [
        { id: '1', name: 'AppShell', logo: 'E' },
        { id: '2', name: 'EzUX Dev', logo: 'D' },
    ];
    const currentOrg = organizations[1];

    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden">
            <div className="p-4">
                <EzOrganizationSwitcher
                    organizations={organizations}
                    currentOrg={currentOrg}
                    onSelect={() => { }}
                    collapsed={!open}
                />
            </div>

            <EzSidebarNav className="flex-1 overflow-y-auto custom-scrollbar">
                <EzSidebarNavItem
                    icon={Home}
                    label={i18nService.t('nav_home')}
                    active={pathname === '/'}
                    collapsed={!open}
                    onClick={() => navigate({ to: '/' })}
                />

                <EzSidebarNavItem
                    icon={TableProperties}
                    label={i18nService.t('nav_data_tables')}
                    active={pathname.startsWith('/table')}
                    collapsed={!open}
                >
                    <EzSidebarNavItem
                        icon={TableProperties}
                        label={i18nService.t('nav_basic_table')}
                        active={pathname === '/table/basic-table'}
                        onClick={() => navigate({ to: '/table/basic-table' })}
                    />
                    <EzSidebarNavItem
                        icon={Table2}
                        label={i18nService.t('nav_all_types')}
                        active={pathname === '/table/all-types'}
                        onClick={() => navigate({ to: '/table/all-types' })}
                    />
                    <EzSidebarNavItem
                        icon={FileSpreadsheet}
                        label={i18nService.t('nav_crud_features')}
                        active={pathname === '/table/crud'}
                        onClick={() => navigate({ to: '/table/crud' })}
                    />
                    <EzSidebarNavItem
                        icon={Layers}
                        label={i18nService.t('nav_grouping_hierarchy')}
                        active={pathname === '/table/grouping'}
                        onClick={() => navigate({ to: '/table/grouping' })}
                    />
                    <EzSidebarNavItem
                        icon={LayoutDashboard}
                        label={i18nService.t('nav_pivot_table')}
                        active={pathname === '/table/pivot'}
                        onClick={() => navigate({ to: '/table/pivot' })}
                    />
                </EzSidebarNavItem>

                <EzSidebarNavItem
                    icon={Calendar}
                    label={i18nService.t('nav_scheduler')}
                    active={pathname.startsWith('/scheduler')}
                    collapsed={!open}
                >
                    <EzSidebarNavItem
                        icon={Layers}
                        label={i18nService.t('nav_basic_views')}
                        active={pathname === '/scheduler/views'}
                        onClick={() => navigate({ to: '/scheduler/views' })}
                    />
                    <EzSidebarNavItem
                        icon={LayoutDashboard}
                        label={i18nService.t('nav_timeline_resources')}
                        active={pathname === '/scheduler/timeline'}
                        onClick={() => navigate({ to: '/scheduler/timeline' })}
                    />
                    <EzSidebarNavItem
                        icon={Calendar}
                        label={i18nService.t('nav_resource')}
                        active={pathname === '/scheduler/resource'}
                        onClick={() => navigate({ to: '/scheduler/resource' })}
                    />
                    <EzSidebarNavItem
                        icon={Layers}
                        label={i18nService.t('nav_resource_grouping')}
                        active={pathname === '/scheduler/grouping'}
                        onClick={() => navigate({ to: '/scheduler/grouping' })}
                    />
                    <EzSidebarNavItem
                        icon={Calendar}
                        label={i18nService.t('nav_work_days')}
                        active={pathname === '/scheduler/workdays'}
                        onClick={() => navigate({ to: '/scheduler/workdays' })}
                    />
                </EzSidebarNavItem>

                <EzSidebarNavItem
                    icon={Kanban}
                    label={i18nService.t('nav_kanban')}
                    active={pathname.startsWith('/kanban')}
                    collapsed={!open}
                >
                    <EzSidebarNavItem
                        icon={Layers}
                        label={i18nService.t('nav_basic_kanban')}
                        active={pathname === '/kanban/basic'}
                        onClick={() => navigate({ to: '/kanban/basic' })}
                    />
                    <EzSidebarNavItem
                        icon={LayoutDashboard}
                        label={i18nService.t('nav_swimlanes')}
                        active={pathname === '/kanban/swimlanes'}
                        onClick={() => navigate({ to: '/kanban/swimlanes' })}
                    />
                    <EzSidebarNavItem
                        icon={Calendar}
                        label={i18nService.t('nav_timeline_view')}
                        active={pathname === '/kanban/timeline'}
                        onClick={() => navigate({ to: '/kanban/timeline' })}
                    />
                    <EzSidebarNavItem
                        icon={Settings}
                        label={i18nService.t('nav_custom_renderers')}
                        active={pathname === '/kanban/customization'}
                        onClick={() => navigate({ to: '/kanban/customization' })}
                    />
                    <EzSidebarNavItem
                        icon={MousePointer2}
                        label={i18nService.t('nav_events_api')}
                        active={pathname === '/kanban/events'}
                        onClick={() => navigate({ to: '/kanban/events' })}
                    />
                </EzSidebarNavItem>

                <EzSidebarNavItem
                    icon={FolderTree}
                    label={i18nService.t('nav_tree')}
                    active={pathname === '/tree'}
                    collapsed={!open}
                    onClick={() => navigate({ to: '/tree' })}
                />

                <EzSidebarNavItem
                    icon={GitPullRequest}
                    label="EzFlow"
                    active={pathname.startsWith('/flow')}
                    collapsed={!open}
                    onClick={() => navigate({ to: '/flow' })}
                />

                <EzSidebarNavItem
                    icon={MousePointer2}
                    label={i18nService.t('nav_signature')}
                    active={pathname === '/signature'}
                    collapsed={!open}
                    onClick={() => navigate({ to: '/signature' })}
                />

                <div className="mt-8 mb-2 border-t border-border/40 mx-2 pt-4 px-2">
                    {!open ? (
                        <div className="h-[1px] bg-border/40 w-full" />
                    ) : (
                        <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">{i18nService.t('nav_system_settings')}</p>
                    )}
                </div>

                <EzSidebarNavItem
                    icon={FolderTree}
                    label={i18nService.t('nav_documentation')}
                    active={pathname.startsWith('/docs')}
                    collapsed={!open}
                    onClick={() => navigate({ to: '/docs/ez-layout' })}
                />
            </EzSidebarNav>

            <EzSidebarFooter
                collapsed={!open}
                onLogout={handleLogout}
                onToggle={() => layoutService.toggleSidebar()}
            />
        </div>
    );
};

export const FooterContent = () => {
    const i18nService = useI18nService();
    return (
        <div className="h-14 flex items-center justify-between px-8 text-xs font-medium text-muted-foreground/60 bg-transparent backdrop-blur-md border-t border-border/40">
            <div className="flex items-center gap-4">
                <span>© 2024 <span className="text-primary/70 font-bold tracking-tight">ezUX</span>. {i18nService.t('nav_copyright')}</span>
                <span className="w-[1px] h-3 bg-border/40" />
                <span className="text-[10px] opacity-70">Developer: <span className="text-primary/80 font-semibold italic">Zeeshan Sayed</span></span>
            </div>
            <div className="flex gap-6 items-center">
                <a href="https://github.com/zee24-cmd/ezux" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1.5">
                    <GitPullRequest className="w-3.5 h-3.5" />
                    Library
                </a>
                <a href="https://github.com/zee24-cmd/ezux_showcase" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1.5">
                    <GitPullRequest className="w-3.5 h-3.5" />
                    Showcase
                </a>
                <span className="w-[1px] h-3 bg-border/40" />
                <a href="#" className="hover:text-primary transition-colors">{i18nService.t('nav_privacy_policy')}</a>
                <a href="#" className="hover:text-primary transition-colors">{i18nService.t('nav_terms_of_service')}</a>
            </div>
        </div>
    );
}
