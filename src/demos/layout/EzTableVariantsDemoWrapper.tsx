import React, { useState, useMemo, useCallback } from 'react';
import { ColumnDef, EzTable, useI18n, cn, Button } from 'ezux';
import { RefreshCw } from 'lucide-react';

// Memoized avatar stack to match Basic Table


interface VariantData {
    id: number;
    feature: string;
    enabled: boolean;
    priority: string;
    status: string;
    country: string;
}

const countries = [
    "United States", "Canada", "United Kingdom", "Germany", "France", "Japan", "India", "Australia", "Brazil", "Mexico",
    "Italy", "Spain", "Netherlands", "Sweden", "Norway", "Denmark", "Finland", "Switzerland", "Austria", "Belgium",
    "Portugal", "Greece", "Ireland", "Poland", "Czech Republic", "Hungary", "Romania", "Bulgaria", "Slovakia", "Slovenia",
    "Croatia", "Estonia", "Latvia", "Lithuania", "Luxembourg", "Malta", "Cyprus", "Iceland", "South Korea", "Singapore"
];

const initialData: VariantData[] = [
    { id: 1, feature: 'User Authentication', enabled: true, priority: 'High', status: 'Active', country: 'United States' },
    { id: 2, feature: 'Data Export', enabled: false, priority: 'Medium', status: 'Pending', country: 'Canada' },
    { id: 3, feature: 'API Access', enabled: true, priority: 'Low', status: 'Inactive', country: 'United Kingdom' },
    { id: 4, feature: 'Custom Domains', enabled: true, priority: 'High', status: 'Active', country: 'Germany' },
    { id: 5, feature: 'Team Collaboration', enabled: false, priority: 'Medium', status: 'Pending', country: 'France' },
];

export const EzTableVariantsDemoWrapper: React.FC = () => {
    const i18nService = useI18n();
    const [isEditable, setIsEditable] = useState(true);
    const [data, setData] = useState<VariantData[]>(initialData);
    const [isRefetching, setIsRefetching] = useState(false);

    const handleReload = useCallback(() => {
        setIsRefetching(true);
        setTimeout(() => {
            setData([...initialData]);
            setIsRefetching(false);
        }, 300);
    }, []);

    const columns = useMemo<ColumnDef<VariantData>[]>(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            size: 60,
            meta: { align: 'center' }
        },
        {
            accessorKey: 'feature',
            header: 'Feature Name',
            size: 200,
            meta: {
                Cell: ({ getValue }) => <span className="font-semibold text-primary">{getValue() as string}</span>,
                clipMode: 'ellipsis-tooltip'
            }
        },
        {
            accessorKey: 'enabled',
            header: 'Toggle (Switch)',
            size: 150,
            meta: {
                columnType: 'boolean',
                booleanOptions: {
                    variant: 'switch',
                    trueLabel: 'Enabled',
                    falseLabel: 'Disabled',
                    showLabel: true
                }
            },
        },
        {
            accessorKey: 'priority',
            header: 'Priority (Radio)',
            size: 180,
            meta: {
                columnType: 'select',
                selectOptions: {
                    variant: 'radio',
                    options: [
                        { value: 'High', label: 'High', color: 'danger' },
                        { value: 'Medium', label: 'Medium', color: 'warning' },
                        { value: 'Low', label: 'Low', color: 'info' },
                    ]
                }
            },
        },
        {
            id: 'custom-ioc',
            header: 'Custom Injected (IoC)',
            accessorKey: 'status',
            meta: {
                Cell: ({ getValue }) => {
                    const val = getValue() as string;
                    return (
                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold w-fit border border-primary/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            {val.toUpperCase()}
                        </div>
                    );
                },
                Editor: ({ value, onChange, onBlur }) => (
                    <div className="flex items-center gap-1 p-1">
                        <input
                            autoFocus
                            value={value as string}
                            onChange={(e) => onChange(e.target.value)}
                            onBlur={onBlur}
                            className="w-full h-8 px-2 rounded border-2 border-primary focus:outline-none bg-background text-xs"
                        />
                        <button className="text-[10px] bg-primary text-white px-2 py-1 rounded" onClick={onBlur}>Save</button>
                    </div>
                )
            }
        },
        {
            accessorKey: 'country',
            header: 'Region (Combobox)',
            size: 220,
            meta: {
                columnType: 'select',
                selectOptions: {
                    variant: 'combobox',
                    options: countries.map(c => ({ value: c, label: c }))
                }
            },
        },
        {
            accessorKey: 'status',
            header: 'Status (Dropdown)',
            size: 150,
            meta: {
                columnType: 'select',
                selectOptions: {
                    variant: 'dropdown',
                    options: [
                        { value: 'Active', label: 'Active', color: 'success' },
                        { value: 'Pending', label: 'Pending', color: 'warning' },
                        { value: 'Inactive', label: 'Inactive', color: 'secondary' },
                    ]
                }
            },
        },
    ], []);

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex justify-between items-center p-2 bg-muted/20 rounded-lg border border-border/40">
                <Button
                    variant={isEditable ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsEditable(!isEditable)}
                    className="h-8 px-4 rounded-md font-medium text-xs transition-all active:scale-95"
                >
                    {isEditable ? 'Switch to Read-only' : 'Switch to Editable'}
                </Button>

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
                    enableEditing={isEditable}
                    enableStickyHeader
                    enableSearchHighlighting
                    enableAdvancedFiltering
                    className="h-full border-none"
                    density="comfortable"
                    isLoading={isRefetching}
                />
            </div>
        </div>
    );
};
