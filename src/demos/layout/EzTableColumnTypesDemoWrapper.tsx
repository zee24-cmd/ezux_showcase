import React, { useState, useMemo, useCallback } from 'react';
import {
    EzTable,
    ColumnDef,
    BooleanCell,
    Button,
    Label,
    Checkbox,
    useI18n,
    cn,
    StatusBadge
} from 'ezux';
import { RefreshCw } from 'lucide-react';

// Memoized avatar stack to match Basic Table


// Define a sample data type with boolean columns
interface EmployeeData {
    id: number;
    name: string;
    email: string;
    active: boolean;
    verified: boolean | null;
    hasAccess: boolean;
    remoteWorker: boolean;
    department: string;
}

// Sample data
const generateSampleData = (): EmployeeData[] => {
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
    const data: EmployeeData[] = [];

    for (let i = 1; i <= 50; i++) {
        data.push({
            id: i,
            name: `Employee ${i}`,
            email: `employee${i}@company.com`,
            active: Math.random() > 0.3, // 70% active
            verified: Math.random() > 0.2 ? (Math.random() > 0.5) : null, // 80% with value, 20% null
            hasAccess: Math.random() > 0.5,
            remoteWorker: Math.random() > 0.4,
            department: departments[Math.floor(Math.random() * departments.length)],
        });
    }

    return data;
};

export const EzTableColumnTypesDemoWrapper: React.FC = () => {
    const i18nService = useI18n();
    const [data, setData] = useState<EmployeeData[]>(generateSampleData);
    const [showIcons, setShowIcons] = useState(true);
    const [showLabels, setShowLabels] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);

    const handleReload = useCallback(() => {
        setIsRefetching(true);
        setTimeout(() => {
            setData(generateSampleData());
            setIsRefetching(false);
        }, 300);
    }, []);

    const columns = useMemo<ColumnDef<EmployeeData>[]>(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            size: 120,
            minSize: 100,
            enableSorting: true,
            enableColumnFilter: false,
            meta: { align: 'center' }
        },
        {
            accessorKey: 'name',
            header: 'Name',
            size: 200,
            minSize: 160,
            enableSorting: true,
            meta: { clipMode: 'ellipsis-tooltip' }
        },
        {
            accessorKey: 'email',
            header: 'Email',
            size: 250,
            minSize: 200,
            meta: { clipMode: 'ellipsis-tooltip' }
        },
        {
            accessorKey: 'department',
            header: 'Department',
            size: 200,
            minSize: 180,
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
            accessorKey: 'active',
            header: 'Active',
            size: 120,
            meta: {
                columnType: 'boolean',
                booleanOptions: {
                    trueLabel: 'Active',
                    falseLabel: 'Inactive',
                },
            },
            cell: ({ getValue }) => {
                const value = getValue() as boolean;
                return <StatusBadge status={value ? 'Active' : 'Inactive'} />;
            },
        },
        {
            accessorKey: 'verified',
            header: 'Verified',
            size: 120,
            meta: {
                columnType: 'boolean',
                booleanOptions: {
                    trueLabel: 'Verified',
                    falseLabel: 'Unverified',
                    nullLabel: 'Pending',
                },
            },
            cell: ({ getValue }) => {
                const value = getValue() as boolean | null;
                const status = value === true ? 'Verified' : value === false ? 'Unverified' : 'Pending';
                return <StatusBadge status={status as any} />;
            },
        },
        {
            accessorKey: 'hasAccess',
            header: 'Has Access',
            size: 130,
            meta: {
                columnType: 'boolean',
                booleanOptions: {
                    trueLabel: 'Yes',
                    falseLabel: 'No',
                },
            },
            cell: ({ getValue }) => {
                const value = getValue() as boolean;
                return (
                    <BooleanCell
                        value={value}
                        trueLabel="Yes"
                        falseLabel="No"
                        showIcon={showIcons}
                        showLabel={showLabels}
                    />
                );
            },
        },
        {
            accessorKey: 'remoteWorker',
            header: 'Remote',
            size: 120,
            meta: {
                columnType: 'boolean',
                booleanOptions: {
                    trueLabel: 'Remote',
                    falseLabel: 'On-site',
                },
            },
            cell: ({ getValue }) => {
                const value = getValue() as boolean;
                return (
                    <BooleanCell
                        value={value}
                        trueLabel="Remote"
                        falseLabel="On-site"
                        showIcon={showIcons}
                        showLabel={showLabels}
                    />
                );
            },
        },
    ], [showIcons, showLabels]);

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex justify-between items-center p-2 bg-muted/20 rounded-lg border border-border/40">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 px-2">
                            <Checkbox
                                id="show-icons"
                                checked={showIcons}
                                onCheckedChange={(checked) => setShowIcons(checked === true)}
                                className="w-4 h-4"
                            />
                            <Label htmlFor="show-icons" className="text-xs font-medium cursor-pointer text-muted-foreground">
                                Show Icons
                            </Label>
                        </div>
                        <div className="flex items-center gap-2 px-2">
                            <Checkbox
                                id="show-labels"
                                checked={showLabels}
                                onCheckedChange={(checked) => setShowLabels(checked === true)}
                                className="w-4 h-4"
                            />
                            <Label htmlFor="show-labels" className="text-xs font-medium cursor-pointer text-muted-foreground">
                                Show Labels
                            </Label>
                        </div>
                    </div>
                </div>

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
                    data={data}
                    columns={columns}
                    pagination
                    pageSize={20}
                    enableColumnFiltering
                    enableRowSelection
                    enableContextMenu
                    enableStickyHeader
                    enableStickyPagination
                    enableSearchHighlighting
                    enableChangeTracking
                    enableAdvancedFiltering
                    className="h-full border-none"
                    isLoading={isRefetching}
                />
            </div>
        </div>
    );
};
