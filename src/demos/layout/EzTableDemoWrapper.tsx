import React, { useMemo, useCallback, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
    EzTable,
    Button,
    useI18n,
    cn,
    StatusBadge,
    Label,
    convertToCSV
} from 'ezux';
import { MockTableData } from '../../utils/DataGenerator';
import { RefreshCw, ChevronDown } from 'lucide-react';

// Memoized avatar stack to prevent re-creation on every render


import { useQuery } from '@tanstack/react-query';
import { dataWorkerService } from '../../services/DataWorkerService';

// Optimized Worker Hook - Uses persistent worker service
const useTableData = (count: number, forceRefresh: boolean = false) => {
    return useQuery({
        queryKey: ['tableData', count, forceRefresh],
        queryFn: () => dataWorkerService.generateTableData(count, forceRefresh),
        staleTime: 30 * 1000, // Reduced to 30 seconds for better responsiveness in demo
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const EzTableDemoWrapper: React.FC = () => {
    const i18nService = useI18n();
    const [datasetSize, setDatasetSize] = useState<string>("50");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { data: data = [], isLoading, refetch, isRefetching } = useTableData(parseInt(datasetSize), isRefreshing);

    const handleDatasetSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setDatasetSize(e.target.value);
    };

    const handleReload = useCallback(async () => {
        setIsRefreshing(true);
        // Small delay to ensure the query key change is registered and worker is triggered with forceRefresh
        setTimeout(async () => {
            await refetch();
            setIsRefreshing(false);
        }, 10);
    }, [refetch]);

    const handleLoadMore = useCallback(() => {
        if (!isRefetching && !isLoading) {
            setDatasetSize(prev => (parseInt(prev) + 20).toString());
        }
    }, [isRefetching, isLoading]);

    const handleExportCSV = useCallback(async (table: any) => {
        try {
            const visibleColumns = table.getVisibleLeafColumns()
                .filter((c: any) => c.id !== 'select' && c.id !== 'actions')
                .map((c: any) => ({
                    id: c.id,
                    header: typeof c.columnDef.header === 'string' ? c.columnDef.header : c.id
                }));

            const csvContent = convertToCSV(data, visibleColumns);
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const filename = `Export_${new Date().toISOString().slice(0, 10)}.csv`;

            if ('showSaveFilePicker' in window) {
                try {
                    const handle = await (window as any).showSaveFilePicker({
                        suggestedName: filename,
                        types: [{
                            description: 'CSV File',
                            accept: { 'text/csv': ['.csv'] }
                        }]
                    });
                    const writable = await handle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                } catch (err: any) {
                    if (err.name !== 'AbortError') console.error('Save failed:', err);
                }
            } else {
                // Fallback
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                link.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Export failed:', error);
        }
    }, [data]);

    const columns = useMemo<ColumnDef<MockTableData>[]>(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            size: 120,
            minSize: 100,
            enableResizing: true,
            enableSorting: true,
            meta: { align: 'center' }
        },
        {
            accessorKey: 'name',
            header: 'Name',
            size: 200,
            minSize: 160,
            enableResizing: true,
            enableSorting: true,
            enableGrouping: true,
            enableColumnFilter: true,
            meta: { clipMode: 'ellipsis-tooltip' }
        },
        {
            accessorKey: 'email',
            header: 'Email',
            size: 280,
            enableResizing: true,
            enableSorting: true,
            enableColumnFilter: true,
            meta: { clipMode: 'ellipsis-tooltip' }
        },
        {
            accessorKey: 'role',
            header: 'Role',
            size: 200,
            minSize: 160,
            enableResizing: true,
            enableSorting: true,
            enableGrouping: true,
            enableColumnFilter: true,
            meta: {
                filterVariant: 'select',
                selectOptions: {
                    options: [
                        { value: 'Manager', label: 'Manager' },
                        { value: 'Developer', label: 'Developer' },
                        { value: 'Designer', label: 'Designer' },
                        { value: 'QA', label: 'QA' },
                    ]
                }
            }
        },
        {
            accessorKey: 'department',
            header: 'Department',
            size: 200,
            minSize: 180,
            enableResizing: true,
            enableSorting: true,
            enableGrouping: true,
            enableColumnFilter: true,
            meta: {
                selectOptions: {
                    options: [
                        { value: 'Engineering', label: 'Engineering' },
                        { value: 'Sales', label: 'Sales' },
                        { value: 'Marketing', label: 'Marketing' },
                        { value: 'HR', label: 'HR' },
                        { value: 'Finance', label: 'Finance' },
                    ]
                }
            }
        },
        {
            accessorKey: 'status',
            header: 'Status',
            size: 150,
            minSize: 140,
            enableResizing: true,
            enableSorting: true,
            enableColumnFilter: true,
            cell: ({ getValue }) => <StatusBadge status={getValue() as any} />
        },
        {
            accessorKey: 'salary',
            header: 'Salary',
            size: 160,
            minSize: 140,
            enableResizing: true,
            enableSorting: true,
            enableColumnFilter: true,
            meta: { align: 'right', columnType: 'number' },
            cell: ({ getValue }) => (
                <span className="font-mono">{i18nService.formatCurrency(parseFloat(getValue() as string))}</span>
            ),
        },
        {
            accessorKey: 'lastLogin',
            header: 'Last Login',
            size: 180,
            minSize: 160,
            enableResizing: true,
            enableSorting: true,
            enableColumnFilter: true,
            meta: { align: 'center', columnType: 'datetime' },
            cell: ({ getValue }) => (
                <span className="font-mono text-muted-foreground">{i18nService.formatDate(getValue() as Date)}</span>
            ),
        }
    ], []); // Remove data dependency if not needed, but data is used in handleExportCSV which is outside useMemo


    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex justify-between items-center p-2 bg-muted/20 rounded-lg border border-border/40">
                <div className="flex items-center gap-2">
                    <Label htmlFor="dataset-size" className="text-xs font-medium text-muted-foreground whitespace-nowrap px-2">
                        Generate Rows:
                    </Label>
                    <div className="relative flex items-center">
                        <select
                            id="dataset-size"
                            className="h-8 pl-3 pr-8 bg-background border border-border hover:border-primary/50 rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer appearance-none transition-all"
                            value={datasetSize}
                            onChange={handleDatasetSizeChange}
                        >
                            <option value="50">50 Rows</option>
                            <option value="100">100 Rows</option>
                            <option value="1000">1,000 Rows</option>
                            <option value="5000">5,000 Rows</option>
                            <option value="10000">10,000 Rows</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2 bg-background border-border hover:border-primary transition-all active:scale-95 text-xs"
                    onClick={handleReload}
                    disabled={isRefetching || isRefreshing}
                >
                    <RefreshCw className={cn("w-3.5 h-3.5", (isRefetching || isRefreshing) && "animate-spin")} />
                    {i18nService.t('reload_dataset')}
                </Button>
            </div>

            <div className="flex-1 overflow-hidden rounded-xl border border-border shadow-sm bg-card">
                <EzTable
                    data={data}
                    columns={columns}
                    // pagination - Disabled for true infinite scroll (append mode)
                    // pageSize={20}
                    enableInfiniteScroll
                    onEndReached={handleLoadMore}
                    enableColumnFiltering
                    enableRowSelection
                    enableContextMenu
                    enableStickyHeader
                    enableStickyPagination
                    enableSearchHighlighting
                    enableChangeTracking
                    enableAdvancedFiltering
                    onExportCSV={handleExportCSV}
                    className="h-full border-none"
                    isLoading={isLoading || isRefetching}
                />
            </div>
        </div>
    );
};
