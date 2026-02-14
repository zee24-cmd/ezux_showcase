import React, { useMemo, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { EzTable, useI18n, cn, StatusBadge, formatCurrency, Button } from 'ezux';
import { MockTableData } from '@/utils/DataGenerator';
import { Briefcase, Mail, Building, Activity, DollarSign, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dataWorkerService } from '@/services/DataWorkerService';

// Memoized avatar stack to match Basic Table


export const EzTableGroupingDemoWrapper: React.FC = () => {
    const i18nService = useI18n();
    const { data = [], isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['groupingTableData', 5000],
        queryFn: () => dataWorkerService.generateTableData(5000),
        staleTime: 5 * 60 * 1000,
    });

    const handleReload = useCallback(() => {
        refetch();
    }, [refetch]);

    const columns = useMemo<ColumnDef<MockTableData>[]>(() => [
        {
            header: 'Personnel Info',
            columns: [
                {
                    accessorKey: 'name',
                    header: () => <div className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> Full Name</div>,
                    size: 220,
                    enableGrouping: true,
                },
                {
                    accessorKey: 'role',
                    header: 'Job Title',
                    enableGrouping: true,
                    size: 180,
                },
                {
                    accessorKey: 'email',
                    header: () => <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Contact Email</div>,
                    size: 250,
                }
            ]
        },
        {
            header: 'Organization & Status',
            columns: [
                {
                    accessorKey: 'department',
                    header: () => <div className="flex items-center gap-2"><Building className="w-3.5 h-3.5" /> Department</div>,
                    enableGrouping: true,
                    size: 180,
                },
                {
                    accessorKey: 'status',
                    header: () => <div className="flex items-center gap-2"><Activity className="w-3.5 h-3.5" /> Employment Status</div>,
                    enableGrouping: true,
                    size: 160,
                    cell: ({ getValue }) => (
                        <StatusBadge status={getValue() as any} />
                    )
                },
            ]
        },
        {
            header: 'Compensation',
            columns: [
                {
                    accessorKey: 'salary',
                    header: () => <div className="flex items-center gap-2"><DollarSign className="w-3.5 h-3.5" /> Annual Salary</div>,
                    aggregationFn: 'mean',
                    size: 150,
                    meta: {
                        columnType: 'number',
                        align: 'right',
                        numberOptions: { format: 'currency', decimals: 2 }
                    },
                    cell: ({ getValue }) => (
                        <span className="font-mono">{formatCurrency(parseFloat(getValue() as string))}</span>
                    ),
                    aggregatedCell: ({ getValue }) => (
                        <span className="font-mono font-bold text-primary italic">
                            {formatCurrency(parseFloat(getValue() as string))}
                        </span>
                    )
                }
            ]
        }
    ], []);

    return (
        <div className="flex flex-col h-full gap-4">
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

            <div className="flex-1 overflow-hidden rounded-xl border border-border shadow-sm bg-card">
                <EzTable
                    data={data as any}
                    columns={columns as any}
                    pagination
                    pageSize={50}
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
                    defaultGrouping={['department', 'status']}
                    className="h-full border-none"
                    isLoading={isLoading || isRefetching}
                />
            </div>
        </div>
    );
};
