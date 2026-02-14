import React, { useMemo, useState, useTransition, useCallback } from 'react';
import { ColumnDef, GroupingState } from '@tanstack/react-table';
import {
    EzTable,
    Button,
    Checkbox,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    Input,
    cn,
    useI18n,
    StatusBadge,
    formatCurrency
} from 'ezux';
import { MockTableData } from '@/utils/DataGenerator';
import {
    Calculator,
    ChevronRight,
    X,
    Search as SearchIcon,
    Plus,
    LayoutPanelLeft,
    RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { dataWorkerService } from '@/services/DataWorkerService';

// Memoized avatar stack to match Basic Table


export const EzTablePivotDemoWrapper: React.FC = () => {
    const i18nService = useI18n();
    const [isPending, startTransition] = useTransition();
    const { data: data = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['pivotTableData', 50],
        queryFn: () => dataWorkerService.generateTableData(50),
        staleTime: 5 * 60 * 1000,
    });

    // Pivot Configuration State
    const [grouping, setGrouping] = useState<GroupingState>(['department']);
    const [granularities, setGranularities] = useState<Record<string, string[]>>({
        lastLogin: ['year']
    });
    const [aggregations, setAggregations] = useState<Record<string, string>>({
        salary: 'sum',
        name: 'count'
    });
    const [rowSearch, setRowSearch] = useState('');
    const [openPicker, setOpenPicker] = useState(false);

    // Mock 40+ columns
    const allFields = useMemo(() => [
        { id: 'department', label: 'Department', type: 'string', meta: { align: 'left' } },
        { id: 'status', label: 'Status', type: 'string', meta: { align: 'center' } },
        { id: 'role', label: 'Role', type: 'string' },
        { id: 'lastLogin', label: 'Last Login', type: 'date', meta: { align: 'center' } },
        { id: 'salary', label: 'Salary', type: 'number', meta: { align: 'right' } },
        { id: 'name', label: 'Employee Name', type: 'string' },
        { id: 'location', label: 'Office Location', type: 'string' },
        { id: 'manager', label: 'Reporting Manager', type: 'string' },
        { id: 'businessUnit', label: 'Business Unit', type: 'string' },
        { id: 'costCenter', label: 'Cost Center', type: 'string' },
        { id: 'tenure', label: 'Tenure (Years)', type: 'number', meta: { align: 'right' } },
        { id: 'performance', label: 'Performance Rating', type: 'string', meta: { align: 'center' } },
        { id: 'skillSet', label: 'Skill Set', type: 'string' },
        ...Array.from({ length: 15 }).map((_, i) => ({
            id: `customField_${i}`,
            label: `Metric ${i + 1}`,
            type: (i % 3 === 0 ? 'number' : i % 3 === 1 ? 'date' : 'string') as 'number' | 'date' | 'string',
            meta: { align: (i % 3 === 0 ? 'right' : i % 3 === 1 ? 'center' : 'left') as any }
        }))
    ], []);

    const aggregationOptions = {
        number: [{ id: 'sum', label: 'Sum' }, { id: 'mean', label: 'Avg' }, { id: 'min', label: 'Min' }, { id: 'max', label: 'Max' }, { id: 'count', label: 'Count' }],
        string: [{ id: 'count', label: 'Count' }, { id: 'uniqueCount', label: 'Distinct' }],
        date: [{ id: 'min', label: 'Oldest' }, { id: 'max', label: 'Newest' }, { id: 'count', label: 'Count' }, { id: 'uniqueCount', label: 'Distinct' }]
    };

    const dateGranularities = [
        { id: 'year', label: 'By Year' }, { id: 'month', label: 'By Month' }, { id: 'day', label: 'By Day' }, { id: 'weekday', label: 'By Weekday' }, { id: 'hour', label: 'By Hour' }
    ];

    // Helper to check if a "Master" field is effectively checked (any of its granularities are ON)
    const isFieldChecked = (fieldId: string) => {
        if (fieldId === 'lastLogin' || granularities[fieldId]) {
            const currentGrans = granularities[fieldId] || [];
            if (currentGrans.length === 0) return false;
            // If ANY of its virtual columns are in grouping, it's "Checked"
            return currentGrans.some(g => grouping.includes(`${fieldId}_${g}`));
        }
        return grouping.includes(fieldId);
    };

    const toggleField = useCallback((fieldId: string) => {
        startTransition(() => {
            setGrouping(prev => {
                // If it's a date field, we need to handle "virtual" columns
                if (fieldId === 'lastLogin' || granularities[fieldId]) {
                    // Check if ANY granularity of this field is currently grouped
                    const currentGrans = granularities[fieldId] || ['year'];
                    const virtualIds = currentGrans.map(g => `${fieldId}_${g}`);
                    const isAnyGrouped = prev.some(id => virtualIds.includes(id));

                    if (isAnyGrouped) {
                        // Remove ALL
                        return prev.filter(id => !virtualIds.includes(id));
                    } else {
                        // Add ALL active granularities
                        // Ensure we respect the user's active granularities or default to year
                        if (!granularities[fieldId] || granularities[fieldId].length === 0) {
                            setGranularities(g => ({ ...g, [fieldId]: ['year'] }));
                            return [...prev, `${fieldId}_year`];
                        }
                        const idsToAdd = granularities[fieldId].map(g => `${fieldId}_${g}`);
                        return [...prev, ...idsToAdd];
                    }
                }

                // Standard fields
                return prev.includes(fieldId) ? prev.filter(f => f !== fieldId) : [...prev, fieldId];
            });
        });
    }, [granularities]);

    const columns = useMemo<ColumnDef<MockTableData, any>[]>(() => {
        // Use flatMap to allow 1 field definition to produce multiple columns (granularities)
        return allFields.flatMap(field => {
            const isGroupable = field.id !== 'salary';
            const baseCol: any = {
                id: field.id,
                accessorKey: field.id,
                header: field.label,
                enableGrouping: isGroupable,
                meta: (field as any).meta,
                size: 150
            };

            // Status Custom Cell
            if (field.id === 'status') {
                baseCol.cell = ({ getValue }: any) => <StatusBadge status={getValue() as any} />;
                return [baseCol];
            }

            // Date Fields with Multiple Granularities
            if (field.type === 'date') {
                const currentGrans = granularities[field.id];
                if (currentGrans && currentGrans.length > 0) {
                    return currentGrans.map(gran => {
                        const granLabel = dateGranularities.find(g => g.id === gran)?.label || gran;
                        return {
                            ...baseCol,
                            id: `${field.id}_${gran}`, // Virtual ID
                            header: `${field.label} (${granLabel})`,
                            accessorFn: (row: MockTableData) => {
                                const val = (row as any)[field.id];
                                if (!val) return null;
                                const d = new Date(val);
                                if (gran === 'year') return d.getFullYear();
                                if (gran === 'month') return format(d, 'MMMM yyyy');
                                if (gran === 'day') return format(d, 'yyyy-MM-dd');
                                if (gran === 'weekday') return format(d, 'EEEE');
                                if (gran === 'hour') return format(d, 'HH:00');
                                return d.getFullYear();
                            }
                        };
                    });
                }
                return [baseCol];
            }

            if (aggregations[field.id]) {
                baseCol.aggregationFn = aggregations[field.id] as any;

                // Force numeric formatting if it's a number field OR if we are counting
                const isNumeric = field.id === 'salary' || field.type === 'number' || aggregations[field.id] === 'count' || aggregations[field.id] === 'uniqueCount';

                if (isNumeric) {
                    baseCol.meta = {
                        ...baseCol.meta,
                        columnType: 'number',
                        align: 'right', // Force right alignment for metrics
                        numberOptions: {
                            format: field.id === 'salary' ? 'currency' : 'float',
                            decimals: aggregations[field.id].includes('count') ? 0 : 2
                        }
                    };

                    baseCol.cell = ({ getValue }: any) => {
                        const val = getValue();
                        return typeof val === 'number' ? (field.id === 'salary' ? formatCurrency(val) : val.toLocaleString()) : val;
                    };

                    baseCol.aggregatedCell = ({ getValue }: any) => {
                        const val = getValue();
                        return typeof val === 'number' ? (field.id === 'salary' ? formatCurrency(val) : val.toLocaleString()) : val;
                    };
                }
            }
            return [baseCol];
        });
    }, [granularities, aggregations, allFields]);

    const handleReload = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleReset = useCallback(() => {
        setGrouping([]);
        setAggregations({});
        setGranularities({ lastLogin: ['year'] });
    }, []);

    const columnVisibility = useMemo(() => {
        const visibility: Record<string, boolean> = {};
        allFields.forEach(field => {
            // For date fields, we check the VIRTUAL IDs
            if (field.type === 'date') {
                const currentGrans = granularities[field.id];
                if (currentGrans && currentGrans.length > 0) {
                    currentGrans.forEach(gran => {
                        const colId = `${field.id}_${gran}`;
                        visibility[colId] = grouping.includes(colId);
                    });
                    // Disable base column if we are using granular versions
                    visibility[field.id] = false;
                    return;
                }
            }

            const isGrouped = grouping.includes(field.id);
            const isAggregated = !!aggregations[field.id];
            visibility[field.id] = isGrouped || isAggregated;
        });
        return visibility;
    }, [allFields, grouping, aggregations, granularities]);

    return (
        <div className="flex h-full overflow-hidden bg-background relative gap-4">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden relative gap-4">
                <div className="flex justify-end items-center p-2 bg-muted/20 rounded-lg border border-border/40">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 bg-background border-border hover:border-primary transition-all active:scale-95 text-xs"
                        onClick={handleReload}
                        disabled={isRefetching}
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", isRefetching && "animate-spin")} />
                        {i18nService.t('reload_dataset')}
                    </Button>
                </div>

                <div className="flex-1 overflow-hidden rounded-xl border border-border shadow-sm bg-card relative">
                    <EzTable
                        data={data as any}
                        columns={columns as any}
                        pagination
                        pageSize={100}
                        enableColumnFiltering
                        enableGrouping
                        enableRowSelection
                        enableContextMenu
                        enableStickyHeader
                        enableStickyPagination
                        enableExport
                        enableSearchHighlighting
                        enableChangeTracking
                        enableAdvancedFiltering
                        state={{ grouping, columnVisibility }}
                        onGroupingChange={setGrouping as any}
                        enablePivoting
                        enablePersistence
                        persistenceKey="pivot-demo"
                        className="h-full border-none"
                        isLoading={isLoading || isRefetching}
                    />
                    {isPending && (
                        <div className="absolute inset-0 z-50 bg-background/40 backdrop-blur-[1px] transition-all flex items-center justify-center">
                            <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                        </div>
                    )}
                </div>
            </div>

            {/* Pivot Configuration Panel */}
            <aside className="w-72 border border-border rounded-xl bg-card flex flex-col shrink-0 overflow-hidden shadow-sm">
                <header className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-2">
                        <LayoutPanelLeft className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pivot Controls</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:bg-muted" onClick={handleReset}>
                        <RefreshCw className="w-3 h-3" />
                    </Button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-hide">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                            <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> Dimensions</span>
                            <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded leading-none">{grouping.length} Items</span>
                        </Label>

                        <div className="relative">
                            <SearchIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                id="dimension-filter"
                                name="dimension-filter"
                                placeholder="Filter dimensions..."
                                className="h-8 pl-8 text-xs bg-muted/50 border-border rounded-lg focus:ring-primary/20"
                                value={rowSearch}
                                onChange={(e) => setRowSearch(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                            {allFields.filter(f => f.id !== 'salary' && f.label.toLowerCase().includes(rowSearch.toLowerCase())).map(field => (
                                <div key={field.id} className={cn(
                                    "p-1.5 rounded-lg border transition-all duration-200 group mb-1",
                                    isFieldChecked(field.id) ? "bg-primary/5 border-primary/20" : "bg-transparent border-transparent hover:bg-muted/50"
                                )}>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id={`row-${field.id}`} checked={isFieldChecked(field.id)} onCheckedChange={() => toggleField(field.id)} className="rounded-[3px] w-3.5 h-3.5 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                                        <Label htmlFor={`row-${field.id}`} className="text-xs font-medium cursor-pointer truncate flex-1 text-foreground">{field.label}</Label>
                                    </div>
                                    {field.type === 'date' && isFieldChecked(field.id) && (
                                        <div className="mt-1.5 ml-6 pl-2 border-l-2 border-primary animate-in slide-in-from-left-2 duration-200">
                                            {/* Refactored to Multi-Select Popover for Granularities */}
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="h-6 w-full justify-between text-[10px] bg-background px-2">
                                                        {granularities[field.id]?.length > 0
                                                            ? `${granularities[field.id].length} selected`
                                                            : "Select granularity"}
                                                        <ChevronRight className="w-2.5 h-2.5 rotate-90 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[160px] p-0" align="start">
                                                    <Command>
                                                        <CommandList>
                                                            <CommandGroup>
                                                                {dateGranularities.map(gran => (
                                                                    <CommandItem
                                                                        key={gran.id}
                                                                        value={gran.label}
                                                                        onSelect={() => {
                                                                            const activeGrans = granularities[field.id] || [];
                                                                            const isActive = activeGrans.includes(gran.id);
                                                                            let newGrans;

                                                                            if (isActive) {
                                                                                newGrans = activeGrans.filter(g => g !== gran.id);
                                                                            } else {
                                                                                newGrans = [...activeGrans, gran.id];
                                                                            }

                                                                            // Update state
                                                                            setGranularities(prev => ({ ...prev, [field.id]: newGrans }));

                                                                            // Also sync grouping immediately
                                                                            const fieldColId = `${field.id}_${gran.id}`;
                                                                            setGrouping(prevGrp => {
                                                                                if (isActive) {
                                                                                    // Assuming we remove it
                                                                                    return prevGrp.filter(id => id !== fieldColId);
                                                                                } else {
                                                                                    // Add it, preserve order usually but appending is fine
                                                                                    return [...prevGrp, fieldColId];
                                                                                }
                                                                            });
                                                                        }}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <Checkbox
                                                                                checked={(granularities[field.id] || []).includes(gran.id)}
                                                                                className="pointer-events-none w-3 h-3"
                                                                            />
                                                                            <span className="text-xs">{gran.label}</span>
                                                                        </div>
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-border">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                            <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> Aggregates</span>
                        </Label>

                        <Popover open={openPicker} onOpenChange={setOpenPicker}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-between h-8 text-[10px] bg-background border-dashed border-primary/30 text-foreground/80 hover:bg-primary/5 hover:border-primary/50 transition-all group rounded-lg">
                                    <span className="flex items-center gap-2 text-muted-foreground group-hover:text-primary"><Plus className="w-3 h-3" /> Add Metric Field</span>
                                    <SearchIcon className="h-2.5 w-2.5 opacity-30" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-60 p-0 shadow-xl rounded-xl border border-border bg-popover text-popover-foreground" align="end">
                                <Command>
                                    <CommandInput placeholder="Search fields..." className="h-8 text-xs" />
                                    <CommandList>
                                        <CommandEmpty className="text-[10px] py-4 text-muted-foreground uppercase font-black">No matching fields</CommandEmpty>
                                        <CommandGroup>
                                            {allFields.map((field) => (
                                                <CommandItem
                                                    key={field.id}
                                                    value={field.label}
                                                    onSelect={() => {
                                                        const isSelected = !!aggregations[field.id];
                                                        if (isSelected) {
                                                            const newAggs = { ...aggregations };
                                                            delete newAggs[field.id];
                                                            setAggregations(newAggs);
                                                        } else {
                                                            setAggregations(prev => ({
                                                                ...prev,
                                                                [field.id]: (aggregationOptions as any)[field.type]?.[0]?.id || 'count'
                                                            }));
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2 w-full px-1">
                                                        <Checkbox
                                                            checked={!!aggregations[field.id]}
                                                            className="w-3.5 h-3.5 border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
                                                        />
                                                        <span className="flex-1 text-xs">{field.label}</span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        <div className="space-y-2">
                            {Object.entries(aggregations).map(([fieldId, currentFormula]) => {
                                const field = allFields.find(f => f.id === fieldId);
                                if (!field) return null;
                                return (
                                    <div key={fieldId} className="p-2 rounded-lg bg-muted/30 border border-border group animate-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-1.5 truncate">
                                                <Calculator className="w-3 h-3 text-primary flex-shrink-0" />
                                                <span className="text-[11px] font-bold text-foreground truncate">{field.label}</span>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
                                                const newAggs = { ...aggregations }; delete newAggs[fieldId]; setAggregations(newAggs);
                                            }}>
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <Select value={currentFormula} onValueChange={(v) => startTransition(() => setAggregations(prev => ({ ...prev, [fieldId]: v })))}>
                                            <SelectTrigger className="h-6 text-[10px] w-full bg-background rounded-md shadow-sm font-medium">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {((aggregationOptions as any)[field.type] || aggregationOptions.string).map((opt: any) => (
                                                    <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-3 border-t border-border bg-muted/30">
                    <div className="p-3 rounded-xl bg-primary shadow-md shadow-primary/20 text-center space-y-1">
                        <p className="text-[9px] text-primary-foreground/70 font-bold uppercase tracking-widest">Dashboard Sync</p>
                        <p className="text-[10px] text-primary-foreground font-medium">Persistent Grid States Enabled</p>
                    </div>
                </div>
            </aside>
        </div>
    );
};
