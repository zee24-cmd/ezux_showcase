import { useRef, useState, useMemo } from 'react';
import {
    EzLayout,
    EzLayoutRef,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    EzServiceRegistry,
    EzSidebarNav,
    EzSidebarNavItem,
    EzSidebarFooter
} from '@/lib/ezux-compat';
import {
    LayoutDashboard,
    Briefcase,
    CheckSquare,
    BarChart3,
    Settings,
    Projector,
    FileText
} from 'lucide-react';

/**
 * Demo showcasing the improved EzLayout with nested navigation and organization switcher
 */
export function EzLayoutImperativeDemoWrapper() {
    const layoutRef = useRef<EzLayoutRef>(null);
    const [stateInfo, setStateInfo] = useState<string>('');
    const [currentOrg, setCurrentOrg] = useState({ id: '1', name: 'AppShell' });
    const [sidebarResizable, setSidebarResizable] = useState(true);
    const [sidebarWidth, setSidebarWidth] = useState(256);

    // Isolate this layout instance from the global registry
    const isolatedRegistry = useMemo(() => new EzServiceRegistry(), []);

    const organizations = [
        { id: '1', name: 'AppShell' },
        { id: '2', name: 'MyCompany' },
        { id: '3', name: 'GlobalCorp' },
    ];

    // Update state info display
    const updateStateInfo = () => {
        const state = layoutRef.current?.getState();
        if (state) {
            setStateInfo(JSON.stringify(state, null, 2));
        }
    };

    return (
        <div className="h-full flex flex-col overflow-auto custom-scrollbar">
            {/* Control Panel */}
            <div className="bg-muted/30 border-b p-4 shrink-0">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Sidebar Controls */}
                        <Card>
                            <CardHeader className="p-4">
                                <CardTitle className="text-sm">Sidebar Control</CardTitle>
                                <CardDescription className="text-xs">Toggle sidebar programmatically</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-2">
                                <Button
                                    onClick={() => layoutRef.current?.toggleSidebar()}
                                    className="w-full h-8 text-xs"
                                    variant="outline"
                                >
                                    Toggle Sidebar
                                </Button>
                                <Button
                                    onClick={() => layoutRef.current?.openSidebar()}
                                    className="w-full h-8 text-xs"
                                    variant="outline"
                                >
                                    Open Sidebar
                                </Button>
                                <Button
                                    onClick={() => layoutRef.current?.closeSidebar()}
                                    className="w-full h-8 text-xs"
                                    variant="outline"
                                >
                                    Close Sidebar
                                </Button>
                                <div className="flex items-center justify-between pt-2 border-t">
                                    <span className="text-xs font-medium">Resizable Sidebar</span>
                                    <input
                                        type="checkbox"
                                        checked={sidebarResizable}
                                        onChange={(e) => setSidebarResizable(e.target.checked)}
                                        className="h-4 w-4 rounded border-border"
                                    />
                                </div>
                                {sidebarResizable && (
                                    <div className="text-[10px] text-muted-foreground pt-1">
                                        Current Width: {sidebarWidth}px
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Mode Controls */}
                        <Card>
                            <CardHeader className="p-4">
                                <CardTitle className="text-sm">Mode Management</CardTitle>
                                <CardDescription className="text-xs">Switch between layout modes</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-2">
                                <Button
                                    onClick={() => layoutRef.current?.showDashboard()}
                                    className="w-full h-8 text-xs"
                                    variant="outline"
                                >
                                    Dashboard Mode
                                </Button>
                                <Button
                                    onClick={() => layoutRef.current?.showAuth()}
                                    className="w-full h-8 text-xs"
                                    variant="outline"
                                >
                                    Auth Mode
                                </Button>
                                <Button
                                    onClick={() => layoutRef.current?.showMinimal()}
                                    className="w-full h-8 text-xs"
                                    variant="outline"
                                >
                                    Minimal Mode
                                </Button>
                            </CardContent>
                        </Card>

                        {/* State Access */}
                        <Card>
                            <CardHeader className="p-4">
                                <CardTitle className="text-sm">State Access</CardTitle>
                                <CardDescription className="text-xs">Read layout state</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-2">
                                <Button
                                    onClick={updateStateInfo}
                                    className="w-full h-8 text-xs"
                                    variant="outline"
                                >
                                    Get State
                                </Button>
                                <Button
                                    onClick={() => {
                                        const viewport = layoutRef.current?.getViewport();
                                        alert(`Viewport: ${JSON.stringify(viewport, null, 2)}`);
                                    }}
                                    className="w-full h-8 text-xs"
                                    variant="outline"
                                >
                                    Get Viewport
                                </Button>
                                <Button
                                    onClick={() => layoutRef.current?.refresh()}
                                    className="w-full h-8 text-xs"
                                    variant="outline"
                                >
                                    Refresh Layout
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* State Display */}
                    {stateInfo && (
                        <Card className="mt-4">
                            <CardHeader className="p-4">
                                <CardTitle className="text-sm">Current State</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <pre className="text-[10px] bg-muted p-3 rounded-md overflow-auto max-h-32">
                                    {stateInfo}
                                </pre>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Main Layout Container */}
            <div className="flex-1 p-4 bg-muted/10">
                <div className="max-w-7xl mx-auto border rounded-xl shadow-2xl bg-background overflow-hidden h-[600px] relative">
                    <EzLayout
                        ref={layoutRef}
                        serviceRegistry={isolatedRegistry}
                        sidebarResizable={sidebarResizable}
                        sidebarMinWidth={200}
                        sidebarMaxWidth={480}
                        onSidebarResize={(w) => setSidebarWidth(w)}
                        className="!h-full !static"
                        contentClassName="!p-4 overflow-auto custom-scrollbar"
                        headerConfig={{
                            orgConfig: {
                                currentOrg,
                                organizations,
                                onSelect: setCurrentOrg
                            },
                            user: {
                                name: 'John Doe',
                                avatarUrl: 'https://github.com/shadcn.png',
                                initials: 'JD'
                            }
                        }}
                        slots={{
                            sidebar: (props: any) => (
                                <div className="flex flex-col h-full bg-card/20 backdrop-blur-sm">
                                    <EzSidebarNav>
                                        <EzSidebarNavItem
                                            icon={LayoutDashboard}
                                            label="Dashboard"
                                            active
                                            collapsed={!props.open}
                                        />
                                        <EzSidebarNavItem
                                            icon={Briefcase}
                                            label="Projects"
                                            collapsed={!props.open}
                                        >
                                            <EzSidebarNavItem icon={Projector} label="Project A" />
                                            <EzSidebarNavItem icon={Projector} label="Project B" />
                                        </EzSidebarNavItem>
                                        <EzSidebarNavItem
                                            icon={CheckSquare}
                                            label="Tasks"
                                            collapsed={!props.open}
                                        />
                                        <EzSidebarNavItem
                                            icon={BarChart3}
                                            label="Reports"
                                            collapsed={!props.open}
                                        />
                                        <EzSidebarNavItem
                                            icon={Settings}
                                            label="Settings"
                                            collapsed={!props.open}
                                        />
                                    </EzSidebarNav>

                                    <EzSidebarFooter
                                        collapsed={!props.open}
                                        onToggle={() => layoutRef.current?.toggleSidebar()}
                                        onLogout={() => console.log('Logout')}
                                    />
                                </div>
                            )
                        }}
                        onSidebarToggle={() => updateStateInfo()}
                        onModeChange={() => updateStateInfo()}
                    >
                        <div className="space-y-4">
                            <Card className="border-none shadow-none bg-muted/20">
                                <CardHeader className="p-6">
                                    <CardTitle className="text-xl">Premium Layout Preview</CardTitle>
                                    <CardDescription>
                                        Testing the new EzSidebar components with nested items and collapsed popovers.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 pt-0 space-y-4 text-sm">
                                    <p className="leading-relaxed">
                                        The new layout system provides a highly responsive and customisable shell.
                                        Try collapsing the sidebar to see the popover navigation in action.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] rounded font-mono uppercase font-bold">Nested_Nav</span>
                                        <span className="px-2 py-1 bg-blue-500/10 text-blue-600 text-[10px] rounded font-mono uppercase font-bold">Org_Switcher</span>
                                        <span className="px-2 py-1 bg-green-500/10 text-green-600 text-[10px] rounded font-mono uppercase font-bold">Premium_Aesthetics</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                        <Card className="bg-background/50 border-dashed">
                                            <CardHeader className="p-4 pb-2">
                                                <CardTitle className="text-xs text-muted-foreground uppercase">Stats Overview</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                <div className="text-2xl font-bold">128</div>
                                                <p className="text-[10px] text-muted-foreground">+12% from last month</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-background/50 border-dashed">
                                            <CardHeader className="p-4 pb-2">
                                                <CardTitle className="text-xs text-muted-foreground uppercase">Revenue</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                <div className="text-2xl font-bold">$12,450</div>
                                                <p className="text-[10px] text-muted-foreground">+5.4% from last week</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </EzLayout>
                </div>
            </div>
        </div>
    );
}
