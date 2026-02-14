import React, { useState, useMemo, useCallback } from 'react';
import { ColumnDef, EzTable, Checkbox, Label, Button, useI18n, cn, StatusBadge } from 'ezux';
import { RefreshCw, ChevronDown } from 'lucide-react';

// Memoized avatar stack to match Basic Table


interface ComprehensiveData {
    id: number;
    name: string; // Text
    description: string; // Long Text
    department: string; // Select
    status: string; // Select with colors
    salary: number; // Currency
    age: number; // Integer
    performance: number; // Percentage
    rating: number; // Float
    joinDate: Date; // Date
    lastLogin: Date; // DateTime
    progress: number; // Chart: Progress
    trend: number[]; // Chart: Sparkline
    isActive: boolean; // Boolean
    isVerified: boolean | null; // Boolean (tri-state)
}

const generateComprehensiveData = (count: number = 50): ComprehensiveData[] => {
    const names = ['Alice Johnson', 'Bob Smith', 'Charlie Davis', 'Diana Prince', 'Ethan Hunt', 'Fiona Gallagher', 'George Martin', 'Hannah Abbot', 'Ian Malcolm', 'Julia Roberts'];
    const descriptions = [
        'Experienced software engineer with 5+ years in full-stack development',
        'Marketing specialist focusing on digital campaigns and social media strategy',
        'Senior project manager with expertise in agile methodologies and team leadership',
        'Data scientist specializing in machine learning and predictive analytics',
        'UX/UI designer passionate about creating intuitive and accessible user experiences',
        'Product owner with a knack for roadmap planning and stakeholder management',
        'DevOps engineer skilled in CI/CD pipelines and cloud infrastructure',
        'QA automation engineer ensuring high quality software delivery',
    ];

    return Array.from({ length: count }, (_, i) => {
        const yearsAgo = Math.floor(Math.random() * 5) + 1;
        const joinDate = new Date();
        joinDate.setFullYear(joinDate.getFullYear() - yearsAgo);
        joinDate.setMonth(Math.floor(Math.random() * 12));
        joinDate.setDate(Math.floor(Math.random() * 28) + 1);

        const daysAgo = Math.floor(Math.random() * 30);
        const lastLogin = new Date();
        lastLogin.setDate(lastLogin.getDate() - daysAgo);
        lastLogin.setHours(Math.floor(Math.random() * 24));
        lastLogin.setMinutes(Math.floor(Math.random() * 60));

        const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Legal', 'Product'];
        const statuses = ['Active', 'On Leave', 'Completed', 'In Progress', 'Pending', 'Archived'];

        return {
            id: i + 1,
            name: names[i % names.length],
            description: descriptions[i % descriptions.length],
            department: departments[Math.floor(Math.random() * departments.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            salary: 50000 + Math.random() * 100000,
            age: 22 + Math.floor(Math.random() * 40),
            performance: Math.random() * 100,
            rating: 1 + Math.random() * 4,
            joinDate,
            lastLogin,
            progress: Math.floor(Math.random() * 100),
            trend: Array.from({ length: 15 }, () => Math.floor(Math.random() * 100)),
            isActive: Math.random() > 0.3,
            isVerified: Math.random() > 0.7 ? true : Math.random() > 0.5 ? false : null,
        };
    });
};

export const EzTableComprehensiveDemoWrapper: React.FC = () => {
    const i18nService = useI18n();
    const [datasetSize, setDatasetSize] = useState<string>("50");
    const [data, setData] = useState<ComprehensiveData[]>(() => generateComprehensiveData(50));
    const [showIcons, setShowIcons] = useState(true);
    const [showLabels, setShowLabels] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);

    const handleReload = useCallback(() => {
        setIsRefetching(true);
        setTimeout(() => {
            setData(generateComprehensiveData(parseInt(datasetSize)));
            setIsRefetching(false);
        }, 300);
    }, [datasetSize]);

    const handleDatasetSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = e.target.value;
        setDatasetSize(newSize);
        setIsRefetching(true);
        // Small delay to allow UI to show loading state
        setTimeout(() => {
            setData(generateComprehensiveData(parseInt(newSize)));
            setIsRefetching(false);
        }, 100);
    };

    const columns = useMemo<ColumnDef<ComprehensiveData>[]>(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            size: 120,
            minSize: 100,
            meta: {
                columnType: 'number',
                numberOptions: { format: 'integer' },
                align: 'center'
            },
        },
        {
            accessorKey: 'name',
            header: 'Name',
            size: 150,
            meta: {
                columnType: 'text',
            },
        },
        {
            accessorKey: 'description',
            header: 'Description',
            size: 300,
            meta: {
                columnType: 'longtext',
                longTextOptions: { previewLength: 80 }
            },
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
                        { value: 'Marketing', label: 'Marketing' },
                        { value: 'Sales', label: 'Sales' },
                        { value: 'HR', label: 'HR' },
                        { value: 'Finance', label: 'Finance' },
                        { value: 'Operations', label: 'Operations' },
                        { value: 'Legal', label: 'Legal' },
                        { value: 'Product', label: 'Product' },
                    ]
                }
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            size: 150,
            minSize: 140,
            cell: ({ getValue }) => (
                <StatusBadge status={getValue() as any} />
            ),
            meta: {
                columnType: 'select',
                selectOptions: {
                    options: [
                        { value: 'Active', label: 'Active', color: 'success' },
                        { value: 'On Leave', label: 'On Leave', color: 'warning' },
                        { value: 'Completed', label: 'Completed', color: 'info' },
                        { value: 'In Progress', label: 'In Progress', color: 'primary' },
                        { value: 'Pending', label: 'Pending', color: 'secondary' },
                    ]
                }
            },
        },
        {
            accessorKey: 'salary',
            header: 'Salary',
            size: 150,
            minSize: 120,
            meta: {
                columnType: 'number',
                align: 'right',
                numberOptions: { format: 'currency', decimals: 2 }
            },
        },
        {
            accessorKey: 'age',
            header: 'Age',
            size: 80,
            meta: {
                columnType: 'number',
                align: 'center',
                numberOptions: { format: 'integer' }
            },
        },
        {
            accessorKey: 'performance',
            header: 'Perf %',
            size: 160,
            minSize: 140,
            meta: {
                columnType: 'number',
                align: 'right',
                numberOptions: { format: 'percentage', decimals: 2 }
            },
        },
        {
            accessorKey: 'rating',
            header: 'Rating',
            size: 110,
            meta: {
                columnType: 'number',
                align: 'center',
                numberOptions: { format: 'float', decimals: 2 }
            },
        },
        {
            accessorKey: 'progress',
            header: 'Progress',
            size: 180,
            minSize: 160,
            meta: {
                columnType: 'progress',
                chartOptions: {
                    showLabel: showLabels,
                    color: 'info',
                }
            },
        },
        {
            accessorKey: 'trend',
            header: 'Trend',
            size: 180,
            minSize: 160,
            meta: {
                columnType: 'sparkline',
                chartOptions: {
                    showDots: true,
                    color: 'success',
                }
            },
        },
        {
            accessorKey: 'joinDate',
            header: 'Join Date',
            size: 160,
            minSize: 140,
            meta: {
                columnType: 'date',
                dateOptions: { format: 'short' }
            },
        },
        {
            accessorKey: 'lastLogin',
            header: 'Last Login',
            size: 210,
            minSize: 180,
            meta: {
                columnType: 'datetime',
                dateTimeOptions: { format: 'relative', showIcon: showIcons }
            },
        },
        {
            accessorKey: 'isActive',
            header: 'Active',
            size: 150,
            minSize: 130,
            meta: {
                columnType: 'boolean',
                booleanOptions: {
                    trueLabel: "Active",
                    falseLabel: "Inactive",
                    showIcon: showIcons,
                    showLabel: showLabels,
                }
            },
        },
        {
            accessorKey: 'isVerified',
            header: 'Verified',
            size: 160,
            minSize: 140,
            meta: {
                columnType: 'boolean',
                booleanOptions: {
                    trueLabel: "Verified",
                    falseLabel: "Unverified",
                    nullLabel: "Pending",
                    showIcon: showIcons,
                    showLabel: showLabels,
                }
            },
        },
    ], [showIcons, showLabels]);

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex justify-between items-center p-2 bg-muted/20 rounded-lg border border-border/40">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="dataset-size" className="text-xs font-medium text-muted-foreground">
                            Rows:
                        </Label>
                        <div className="relative flex items-center group">
                            <select
                                id="dataset-size"
                                className="h-8 pl-2 pr-8 bg-background border border-border hover:border-primary/50 rounded-md text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer appearance-none text-foreground transition-all"
                                value={datasetSize}
                                onChange={handleDatasetSizeChange}
                            >
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="1000">1,000</option>
                                <option value="5000">5,000</option>
                                <option value="10000">10,000</option>
                            </select>
                            <ChevronDown className="absolute right-2 w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none" />
                        </div>
                    </div>

                    <div className="h-4 w-px bg-border/60" />

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="show-icons"
                                checked={showIcons}
                                onCheckedChange={(checked) => setShowIcons(checked === true)}
                                className="w-3.5 h-3.5"
                            />
                            <Label htmlFor="show-icons" className="text-xs font-medium cursor-pointer text-muted-foreground">
                                Icons
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="show-labels"
                                checked={showLabels}
                                onCheckedChange={(checked) => setShowLabels(checked === true)}
                                className="w-3.5 h-3.5"
                            />
                            <Label htmlFor="show-labels" className="text-xs font-medium cursor-pointer text-muted-foreground">
                                Labels
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
                    enableExport
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
