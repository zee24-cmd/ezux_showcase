import { useRef, useState, useMemo } from 'react';
import { EzLayout, EzLayoutRef, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, EzServiceRegistry } from 'ezux';

/**
 * Demo showcasing the imperative API of EzLayout
 * This demonstrates how to programmatically control the layout using refs
 */
export function EzLayoutImperativeDemoWrapper() {
    const layoutRef = useRef<EzLayoutRef>(null);
    const [stateInfo, setStateInfo] = useState<string>('');

    // Isolate this layout instance from the global registry
    const isolatedRegistry = useMemo(() => new EzServiceRegistry(), []);

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
                <div className="max-w-7xl mx-auto border rounded-xl shadow-inner bg-background overflow-hidden h-[500px] relative">
                    <EzLayout
                        ref={layoutRef}
                        serviceRegistry={isolatedRegistry}
                        className="!h-full !static"
                        contentClassName="!p-4 overflow-auto custom-scrollbar"
                        components={{
                            sidebar: (
                                <div className="p-4">
                                    <h2 className="text-sm font-semibold mb-2">Sidebar Content</h2>
                                    <p className="text-xs text-muted-foreground">
                                        This sidebar is isolated.
                                    </p>
                                </div>
                            )
                        }}
                        onSidebarToggle={(isOpen: boolean) => {
                            console.log('Sidebar toggled:', isOpen);
                            updateStateInfo();
                        }}
                        onModeChange={(mode: 'dashboard' | 'auth' | 'minimal') => {
                            console.log('Mode changed:', mode);
                            updateStateInfo();
                        }}
                    >
                        <div className="space-y-4">
                            <Card className="border-none shadow-none bg-muted/20">
                                <CardHeader className="p-6">
                                    <CardTitle className="text-lg">Embedded Layout Instance</CardTitle>
                                    <CardDescription>
                                        This layout component is running in a fully isolated service registry.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 pt-0 space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Using the imperative API, you can control this specific instance without affecting the global application layout.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] rounded font-mono">ISOLATED_REGISTRY</span>
                                        <span className="px-2 py-1 bg-green-500/10 text-green-600 text-[10px] rounded font-mono">IMPERATIVE_API</span>
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
