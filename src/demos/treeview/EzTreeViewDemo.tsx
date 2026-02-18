import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { EzTreeView, TreeNode, EzTreeViewApi, cn } from 'ezux';
import { Search, Maximize2, Minimize2, CheckSquare, Edit3, RefreshCw, Settings2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dataWorkerService } from '@/services/DataWorkerService';

// Data generator
// Local data generation is now handled by DataWorkerService via Web Worker

export const EzTreeViewDemo = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showCheckboxes, setShowCheckboxes] = useState(true);
    const [allowEditing, setAllowEditing] = useState(true);
    const treeApiRef = useRef<EzTreeViewApi>(null);
    const [, forceUpdate] = useState({});

    useEffect(() => {
        // Force re-render after mount to read the ref for debug display
        const timer = setTimeout(() => forceUpdate({}), 100);
        return () => clearTimeout(timer);
    }, []);

    // Generate data inside component to ensure freshness during HMR/Updates
    const { data: fillerData = [], isLoading: isLoadingFiller, refetch: refetchFiller } = useQuery({
        queryKey: ['treeFillerData'],
        queryFn: () => dataWorkerService.generateTreeData(2, 4),
        staleTime: 5 * 60 * 1000,
    });

    const rootNodes = useMemo<TreeNode[]>(() => [
        {
            id: '1',
            label: 'Project Root',
            icon: '📂',
            isExpanded: true,
            isLoaded: true,
            children: [
                {
                    id: '1-1',
                    label: 'src',
                    icon: '📂',
                    isLoaded: true,
                    children: [
                        {
                            id: '1-1-1',
                            label: 'components',
                            icon: '📂',
                            isLoaded: true,
                            children: [
                                {
                                    id: '1-1-1-1',
                                    label: 'EzTreeView.tsx',
                                    icon: '⚛️'
                                },
                            ]
                        },
                        {
                            id: '1-1-2',
                            label: 'utils.ts',
                            icon: '🛠️'
                        }
                    ]
                },
                {
                    id: '1-2',
                    label: 'public',
                    icon: '📂',
                    isLoaded: true,
                    children: [
                        { id: '1-2-1', label: 'index.html', icon: '🌐' }
                    ]
                }
            ]
        },
        {
            id: 'lazy-root',
            label: 'Remote Records (Lazy)',
            icon: '☁️',
            isLeaf: false,
        },
        {
            id: 'scroll-demo',
            label: 'Scroll Test (Worker Generated)',
            icon: '📚',
            children: fillerData.slice(0, 10)
        },
        ...fillerData.slice(10)
    ], [fillerData]);

    const handleLoadChildren = async (nodeId: string): Promise<TreeNode[]> => {
        // Reduced API delay for better UX
        await new Promise(resolve => setTimeout(resolve, 300));

        if (nodeId === 'lazy-root') {
            return [
                { id: `record-1`, label: 'Remote Record A', icon: '📄' },
                { id: `record-2`, label: 'Remote Record B', icon: '📄', isLeaf: false }
            ];
        }

        return [
            { id: `${nodeId}-child-1`, label: `Nested Detail ${nodeId}`, icon: '📝' }
        ];
    };

    const handleNodeDrop = useCallback((_dragged: TreeNode, _target: TreeNode, _pos: 'inside' | 'before' | 'after') => {
        // Drop handled
    }, []);

    const handleReload = () => {
        refetchFiller();
    };

    return (
        <div className="flex flex-col h-full w-full bg-background">
            <div className="border-b border-border flex-shrink-0 px-4 h-16 flex items-center bg-card/50">
                <div className="flex items-center justify-between w-full">
                    <div className="font-bold text-xl">EzTreeView Enterprise</div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search nodes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-1.5 text-sm bg-muted/50 border border-border rounded-lg outline-none focus:ring-1 focus:ring-primary/30 w-64"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden p-4">
                <div className="flex flex-col lg:flex-row items-stretch gap-6 h-full w-full max-w-7xl mx-auto">
                    {/* Left Panel: Controls */}
                    <div className="w-full lg:w-72 flex flex-col gap-4">
                        <div className="p-4 bg-card border border-border rounded-xl shadow-sm space-y-4">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Capabilities</h3>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <CheckSquare className="w-4 h-4" /> Checkboxes
                                    </label>
                                    <input
                                        type="checkbox"
                                        checked={showCheckboxes}
                                        onChange={(e) => setShowCheckboxes(e.target.checked)}
                                        className="h-4 w-4 rounded border-border"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={handleReload}
                                        className="p-1 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                                    >
                                        <RefreshCw className={cn("w-3 h-3", isLoadingFiller && "animate-spin")} />
                                        Reload Data
                                    </button>
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Edit3 className="w-4 h-4" /> Inline Edit
                                    </label>
                                    <input
                                        type="checkbox"
                                        checked={allowEditing}
                                        onChange={(e) => setAllowEditing(e.target.checked)}
                                        className="h-4 w-4 rounded border-border"
                                    />
                                </div>
                            </div>

                            <hr className="border-border" />

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => treeApiRef.current?.expandAll()}
                                    className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                                >
                                    <Maximize2 className="w-3 h-3" /> Expand All
                                </button>
                                <button
                                    onClick={() => treeApiRef.current?.collapseAll()}
                                    className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                                >
                                    <Minimize2 className="w-3 h-3" /> Collapse All
                                </button>
                                <button
                                    onClick={() => treeApiRef.current?.checkAll()}
                                    className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                                >
                                    <CheckSquare className="w-3 h-3" /> Check All
                                </button>
                                <button
                                    onClick={() => treeApiRef.current?.uncheckAll()}
                                    className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                                >
                                    <RefreshCw className="w-3 h-3" /> Reset Checks
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-xs space-y-2">
                            <p className="font-bold text-primary flex items-center gap-2">
                                <RefreshCw className="w-3 h-3" /> PRO TIPS
                            </p>
                            <ul className="space-y-1 text-muted-foreground list-disc pl-4">
                                <li>Double-click to rename nodes</li>
                                <li>Try searching for "root" or "utils"</li>
                                <li>Expand "Remote Records" for lazy loading</li>
                            </ul>
                        </div>
                    </div>

                    {/* Main Tree Panel */}
                    <div className="flex-1 flex flex-col gap-2 min-w-0 min-h-[400px] h-full">
                        <div className="border border-border rounded-xl shadow-lg bg-card flex-1 flex flex-col overflow-hidden relative h-full">
                            <EzTreeView
                                apiRef={treeApiRef}
                                data={rootNodes}
                                searchTerm={searchTerm}
                                showCheckboxes={showCheckboxes}
                                allowEditing={allowEditing}
                                onLoadChildren={handleLoadChildren}
                                onNodeDrop={handleNodeDrop}
                                className="h-full"
                                slots={{
                                    node: ({ node, style, onToggle, onClick }) => (
                                        <div
                                            className={cn(
                                                "flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors select-none",
                                                "hover:bg-muted/50",
                                                node.isSelected ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                                            )}
                                            style={style}
                                            onClick={(e) => onClick(e)}
                                        >
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggle();
                                                }}
                                                className={cn(
                                                    "p-0.5 rounded-md hover:bg-muted/80 transition-colors",
                                                    node.isLeaf ? "opacity-0 pointer-events-none" : "opacity-100"
                                                )}
                                            >
                                                {node.isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                                            </div>

                                            <span className="text-lg leading-none">{node.icon}</span>

                                            <span className="flex-1 truncate text-sm">
                                                {node.label}
                                                {node.children && <span className="ml-2 text-xs text-muted-foreground">({node.children.length})</span>}
                                            </span>

                                            {node.isLoaded && !node.isLeaf && (
                                                <span className="w-2 h-2 rounded-full bg-green-500/50" />
                                            )}
                                        </div>
                                    )
                                }}
                            />
                        </div>
                    </div>

                    {/* Activity Feed (Right Panel) */}
                    <div className="w-full lg:w-64 flex flex-col gap-2">
                        <div className="font-medium text-muted-foreground text-sm px-1 flex items-center justify-between">
                            <span>Properties</span>
                            <Settings2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 border border-border rounded-xl bg-card/50 p-4 overflow-y-auto">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Selection Type</label>
                                    <p className="text-sm font-medium">Tri-state Cascading</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Virtualization</label>
                                    <p className="text-sm font-medium text-green-600 font-mono">ENABLED</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Render Strategy</label>
                                    <p className="text-sm font-medium">Component Injection (IoC)</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Dataset Size (Root)</label>
                                    <p className="text-sm font-medium">
                                        {isLoadingFiller ? 'Loading...' : `${rootNodes.length} Root`} <span className="text-muted-foreground">({treeApiRef.current?.getFlattenedNodes().length || 0} visible)</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
