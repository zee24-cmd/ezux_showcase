import { useState, useEffect, Suspense, lazy } from 'react';
import {
    EzLayout,
    globalServiceRegistry,
    LayoutService,
    I18nService,
    cn,
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
    Button,
    Card, CardContent, CardHeader, CardTitle,
    Input,
    Skeleton,
    EzThemeSwitcher,
    EzThemeColorChanger,
    EzLanguageSwitcher,
    EzUserProfile,
    SignInForm,
    SignUpForm
} from 'ezux';
import {
    Menu,
    Home,
    Settings,
    Users,
    BarChart3,
    Bell,
    Search,
    CreditCard,
    Power,
    Table,
    Calendar,
    FolderTree,
    Trello
} from 'lucide-react';

// Lazy load demo components (siblings now)
const EzTableDemoWrapper = lazy(() => import('./EzTableDemoWrapper').then(m => ({ default: m.EzTableDemoWrapper })));
const EzSchedulerDemoWrapper = lazy(() => import('./EzSchedulerDemoWrapper').then(m => ({ default: m.EzSchedulerDemoWrapper })));
const EzTreeViewDemoWrapper = lazy(() => import('./EzTreeViewDemoWrapper').then(m => ({ default: m.EzTreeViewDemoWrapper })));
const EzTableCRUDDemoWrapper = lazy(() => import('./EzTableCRUDDemoWrapper').then(m => ({ default: m.EzTableCRUDDemoWrapper })));
const EzTableGroupingDemoWrapper = lazy(() => import('./EzTableGroupingDemoWrapper').then(m => ({ default: m.EzTableGroupingDemoWrapper })));
const EzTablePivotDemoWrapper = lazy(() => import('./EzTablePivotDemoWrapper').then(m => ({ default: m.EzTablePivotDemoWrapper })));
const EzTableComprehensiveDemoWrapper = lazy(() => import('./EzTableComprehensiveDemoWrapper').then(m => ({ default: m.EzTableComprehensiveDemoWrapper })));
const EzKanbanDemoWrapper = lazy(() => import('./EzKanbanDemoWrapper').then(m => ({ default: m.EzKanbanDemoWrapper })));

// Loading skeleton for demos
const DemoSkeleton = () => (
    <div className="flex flex-col h-full bg-background p-6 space-y-4 animate-pulse">
        <Skeleton className="h-12 w-full" />
        <div className="flex-1 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    </div>
);

type ViewMode = 'auth' | 'dashboard' | 'table' | 'table_all_types' | 'table_crud' | 'table_grouping' | 'table_pivot' | 'scheduler' | 'tree' | 'kanban';

export const EzAuthDemo = () => {
    const layoutService = globalServiceRegistry.getOrThrow<LayoutService>('LayoutService');
    const i18nService = globalServiceRegistry.getOrThrow<I18nService>('I18nService');

    // Local state for view switching, sync with layout service for auth mode
    const [view, setView] = useState<ViewMode>('dashboard');
    const [expandedSection, setExpandedSection] = useState<string | null>(null);
    const [, setLocaleTrigger] = useState(i18nService.locale);
    const [layoutMode, setLayoutMode] = useState(layoutService.getState().mode);

    // Sync expanded section with view
    useEffect(() => {
        if (view.startsWith('table')) {
            setExpandedSection('table');
        } else if (view === 'scheduler') {
            setExpandedSection('scheduler');
        } else if (view === 'kanban') {
            setExpandedSection('kanban');
        } else if (view === 'tree') {
            setExpandedSection('tree');
        }
    }, [view]);

    useEffect(() => {
        const unsubI18n = i18nService.subscribe((state) => setLocaleTrigger(state.locale));
        const unsubLayout = layoutService.subscribe((state) => {
            setLayoutMode(state.mode);
            // Reset view to dashboard if entering app mode from auth, or enforce auth view if in auth mode
            if (state.mode === 'dashboard' && view === 'auth') {
                setView('dashboard');
            } else if (state.mode === 'auth') {
                setView('auth');
            }
        });
        return () => { unsubI18n(); unsubLayout(); };
    }, [i18nService, layoutService, view]);

    const handleLogout = () => {
        layoutService.setMode('auth');
        setView('auth');
    };

    const DemoBreadcrumb = (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="#" className="flex items-center gap-1 text-foreground/70 hover:text-foreground">
                        <Home className="w-3 h-3" /> {i18nService.t('nav_home')}
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-foreground/30" />
                <BreadcrumbItem>
                    <BreadcrumbPage className="capitalize font-bold text-foreground">
                        {i18nService.t(view === 'auth' ? 'sign_in' : view === 'dashboard' ? 'dashboard_view' : `${view}_view`) || view}
                    </BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );

    const SidebarContent = (
        <div className="flex flex-col h-full bg-gradient-to-b from-muted/30 to-background">
            <div className="p-6 md:hidden">
                <div className="flex items-center gap-2 font-bold text-xl text-primary">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">E</div>
                </div>
            </div>

            <div className="flex-1 flex flex-col whitespace-normal px-3 space-y-1 mt-4 md:mt-2 overflow-y-auto custom-scrollbar">
                <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">{i18nService.t('nav_main_navigation')}</p>
                <Button
                    variant="ghost"
                    onClick={() => setView('dashboard')}
                    className={cn(
                        "w-full justify-start gap-3 h-10 px-3 font-medium text-left relative overflow-hidden group transition-all duration-200",
                        "hover:bg-accent/50 hover:text-accent-foreground",
                        view === 'dashboard'
                            ? "bg-primary/10 text-primary hover:bg-primary/15 shadow-sm"
                            : "text-foreground/80 hover:text-foreground"
                    )}
                >
                    {view === 'dashboard' && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                    )}
                    <BarChart3 className={cn(
                        "w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                        view === 'dashboard' ? "text-primary" : "text-foreground/80"
                    )} />
                    <span className="truncate">{i18nService.t('nav_dashboard')}</span>
                </Button>

                <Button
                    variant="ghost"
                    onClick={() => {
                        setView('table');
                        setExpandedSection(expandedSection === 'table' ? null : 'table');
                    }}
                    className={cn(
                        "w-full justify-start gap-3 h-10 px-3 font-medium text-left relative overflow-hidden group transition-all duration-200",
                        "hover:bg-accent/50 hover:text-accent-foreground",
                        view.startsWith('table')
                            ? "bg-primary/10 text-primary hover:bg-primary/15 shadow-sm"
                            : "text-foreground/80 hover:text-foreground"
                    )}
                >
                    {view.startsWith('table') && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                    )}
                    <Table className={cn(
                        "w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                        view.startsWith('table') ? "text-primary" : "text-foreground/80"
                    )} />
                    <span className="truncate">{i18nService.t('nav_data_tables')}</span>
                </Button>

                {expandedSection === 'table' && (
                    <div className="pl-4 space-y-1 border-l-2 border-border/50 ml-5 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                        <Button
                            variant="ghost"
                            onClick={() => setView('table_all_types')}
                            className={cn(
                                "w-full justify-start gap-2 h-8 px-3 font-medium text-left text-sm relative overflow-hidden transition-all duration-200",
                                "hover:bg-accent/50 hover:text-accent-foreground",
                                view === 'table_all_types'
                                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                                    : "text-foreground/80 hover:text-foreground"
                            )}
                        >
                            <span className="truncate">{i18nService.t('nav_all_types')}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setView('table_crud')}
                            className={cn(
                                "w-full justify-start gap-2 h-8 px-3 font-medium text-left text-sm relative overflow-hidden transition-all duration-200",
                                "hover:bg-accent/50 hover:text-accent-foreground",
                                view === 'table_crud'
                                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                                    : "text-foreground/80 hover:text-foreground"
                            )}
                        >
                            <span className="truncate">{i18nService.t('nav_crud_features')}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setView('table_grouping')}
                            className={cn(
                                "w-full justify-start gap-2 h-8 px-3 font-medium text-left text-sm relative overflow-hidden transition-all duration-200",
                                "hover:bg-accent/50 hover:text-accent-foreground",
                                view === 'table_grouping'
                                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                                    : "text-foreground/80 hover:text-foreground"
                            )}
                        >
                            <span className="truncate">{i18nService.t('nav_grouping_hierarchy')}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setView('table_pivot')}
                            className={cn(
                                "w-full justify-start gap-2 h-8 px-3 font-medium text-left text-sm relative overflow-hidden transition-all duration-200",
                                "hover:bg-accent/50 hover:text-accent-foreground",
                                view === 'table_pivot'
                                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                                    : "text-foreground/80 hover:text-foreground"
                            )}
                        >
                            <span className="truncate">{i18nService.t('nav_pivot_table')}</span>
                        </Button>
                    </div>
                )}

                <Button
                    variant="ghost"
                    onClick={() => {
                        setView('scheduler');
                        setExpandedSection(expandedSection === 'scheduler' ? null : 'scheduler');
                    }}
                    className={cn(
                        "w-full justify-start gap-3 h-10 px-3 font-medium text-left relative overflow-hidden group transition-all duration-200",
                        "hover:bg-accent/50 hover:text-accent-foreground",
                        view === 'scheduler'
                            ? "bg-primary/10 text-primary hover:bg-primary/15 shadow-sm"
                            : "text-foreground/80 hover:text-foreground"
                    )}
                >
                    {view === 'scheduler' && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                    )}
                    <Calendar className={cn(
                        "w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                        view === 'scheduler' ? "text-primary" : "text-foreground/80"
                    )} />
                    <span className="truncate">{i18nService.t('nav_scheduler') || 'Scheduler'}</span>
                </Button>

                <Button
                    variant="ghost"
                    onClick={() => {
                        setView('kanban');
                        setExpandedSection(expandedSection === 'kanban' ? null : 'kanban');
                    }}
                    className={cn(
                        "w-full justify-start gap-3 h-10 px-3 font-medium text-left relative overflow-hidden group transition-all duration-200",
                        "hover:bg-accent/50 hover:text-accent-foreground",
                        view === 'kanban'
                            ? "bg-primary/10 text-primary hover:bg-primary/15 shadow-sm"
                            : "text-foreground/80 hover:text-foreground"
                    )}
                >
                    {view === 'kanban' && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                    )}
                    <Trello className={cn(
                        "w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                        view === 'kanban' ? "text-primary" : "text-foreground/80"
                    )} />
                    <span className="truncate">{i18nService.t('nav_kanban')}</span>
                </Button>

                <Button
                    variant="ghost"
                    onClick={() => setView('tree')}
                    className={cn(
                        "w-full justify-start gap-3 h-10 px-3 font-medium text-left relative overflow-hidden group transition-all duration-200",
                        "hover:bg-accent/50 hover:text-accent-foreground",
                        view === 'tree'
                            ? "bg-primary/10 text-primary hover:bg-primary/15 shadow-sm"
                            : "text-foreground/80 hover:text-foreground"
                    )}
                >
                    {view === 'tree' && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                    )}
                    <FolderTree className={cn(
                        "w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                        view === 'tree' ? "text-primary" : "text-foreground/80"
                    )} />
                    <span className="truncate">{i18nService.t('nav_tree')}</span>
                </Button>



                <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-6 mb-3">{i18nService.t('nav_system_settings')}</p>
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3 h-10 px-3 text-left transition-all duration-200",
                        "hover:bg-accent/50 hover:text-accent-foreground text-foreground/80 hover:text-foreground"
                    )}
                >
                    <Settings className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{i18nService.t('nav_settings')}</span>
                </Button>
            </div>

            <div className="p-4 border-t border-border/50">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-xl border border-primary/20 backdrop-blur-sm">
                    <h4 className="font-semibold text-sm text-foreground mb-1">{i18nService.t('pro_plan')}</h4>
                    <p className="text-xs text-muted-foreground mb-3">{i18nService.t('trial_days_remaining')}</p>
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm border-none">
                        {i18nService.t('upgrade_now')}
                    </Button>
                </div>
            </div>
        </div>
    );

    const FooterContent = (
        <div className="h-14 border-t border-border flex items-center justify-between px-6 text-xs text-muted-foreground bg-background">
            <span>© 2024 {i18nService.t('ezlayout_system')}. {i18nService.t('nav_copyright')}</span>
            <div className="flex gap-4">
                <a href="#" className="hover:text-foreground">{i18nService.t('nav_privacy_policy')}</a>
                <a href="#" className="hover:text-foreground">{i18nService.t('nav_terms_of_service')}</a>
            </div>
        </div>
    );

    const CustomHeader = (
        <div className="w-full h-full flex items-center justify-between bg-transparent">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => layoutService.toggleSidebar()} className="md:hidden rounded-xl hover:bg-primary/5 transition-colors">
                    <Menu className="w-5 h-5" />
                </Button>
                <div className="hidden md:block">
                    <Button variant="ghost" size="icon" onClick={() => layoutService.toggleSidebar()} className="rounded-xl hover:bg-primary/5 transition-colors">
                        <Menu className="w-5 h-5 transition-transform group-hover:scale-110" />
                    </Button>
                </div>
                <div className="flex items-center gap-2.5 group cursor-pointer">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center text-white font-black transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">E</div>
                    <span className="font-black text-xl text-foreground tracking-tighter hidden sm:inline-block">
                        ezUX
                    </span>
                </div>
                <div className="hidden lg:flex items-center pl-6 border-l border-border/50 ml-2 h-6">
                    {DemoBreadcrumb}
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
                <div className="relative hidden md:flex items-center w-full max-w-xs transition-all duration-500 focus-within:max-w-md group">
                    <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                    <Input
                        type="search"
                        placeholder={i18nService.t('nav_search_placeholder')}
                        className="pl-10 h-10 bg-muted/30 border-transparent focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/20 w-48 focus-within:w-72 transition-all duration-500 rounded-2xl placeholder:font-medium"
                    />
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl relative text-muted-foreground hover:text-primary hover:bg-background transition-all duration-300">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse" />
                </Button>
                <EzThemeColorChanger />
                <EzThemeSwitcher />
                <EzLanguageSwitcher />
                <EzUserProfile
                    user={{
                        name: 'Zed User',
                        initials: 'ZU',
                        avatarUrl: 'https://github.com/shadcn.png',
                        email: 'zed@ezux.example'
                    }}
                    onLogout={handleLogout}
                />
                <div className="border-l border-border pl-2 ml-1">
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400" title={i18nService.t('sign_out')}>
                        <Power className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <EzLayout
            serviceRegistry={globalServiceRegistry}
            slots={{
                header: () => CustomHeader,
                sidebar: () => SidebarContent,
                footer: () => FooterContent
            }}
            className="mesh-bg"
            headerClassName="!bg-transparent !shadow-none !border-none z-50 h-18 p-1 px-4"
            sidebarClassName="glass-card !border-y-0 !border-l-0 !rounded-none z-40"
            contentClassName={view !== 'dashboard' && view !== 'auth' ? 'p-0 overflow-hidden' : ''}
            authConfig={{
                signInSlot: (<SignInForm onSubmit={async () => { layoutService.setMode('dashboard'); setView('dashboard'); }} />),
                signUpSlot: (<SignUpForm onSubmit={async () => { layoutService.setMode('dashboard'); setView('dashboard'); }} />)
            }}
        >
            {layoutMode === 'dashboard' && (
                <div className="flex-1 w-full bg-background h-full flex flex-col overflow-hidden relative">
                    {view === 'dashboard' && (
                        <div className="overflow-auto space-y-8 p-4 md:p-8 h-full">
                            <div className="flex items-center justify-between">
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">{i18nService.t('dashboard_view')}</h1>
                                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                    + {i18nService.t('new_project')}
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{i18nService.t('total_revenue')}</CardTitle>
                                        <div className="text-primary bg-primary/10 p-2 rounded-full"><span className="text-xs font-bold">$</span></div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">$45,231.89</div>
                                        <p className="text-xs text-muted-foreground">+20.1% {i18nService.t('from_last_month')}</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{i18nService.t('active_subs')}</CardTitle>
                                        <div className="text-primary bg-primary/10 p-2 rounded-full"><Users className="w-4 h-4" /></div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">+2350</div>
                                        <p className="text-xs text-muted-foreground">+180.1% {i18nService.t('from_last_month')}</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{i18nService.t('sales')}</CardTitle>
                                        <div className="text-primary bg-primary/10 p-2 rounded-full"><CreditCard className="w-4 h-4" /></div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">+12,234</div>
                                        <p className="text-xs text-muted-foreground">+19% {i18nService.t('from_last_month')}</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{i18nService.t('total_events')}</CardTitle>
                                        <div className="text-primary bg-primary/10 p-2 rounded-full"><Calendar className="w-4 h-4" /></div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">124</div>
                                        <p className="text-xs text-muted-foreground">+5 {i18nService.t('today_stat')}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                    <Suspense fallback={<DemoSkeleton />}>
                        {view === 'table' && <EzTableDemoWrapper />}
                        {view === 'table_all_types' && <EzTableComprehensiveDemoWrapper />}
                        {view === 'table_crud' && <EzTableCRUDDemoWrapper />}
                        {view === 'table_grouping' && <EzTableGroupingDemoWrapper />}
                        {view === 'table_pivot' && <EzTablePivotDemoWrapper />}
                        {view === 'scheduler' && <EzSchedulerDemoWrapper />}
                        {view === 'tree' && <EzTreeViewDemoWrapper />}
                        {view === 'kanban' && <EzKanbanDemoWrapper />}

                    </Suspense>
                </div>
            )}
        </EzLayout>
    );
};
