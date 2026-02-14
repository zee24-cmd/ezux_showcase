import { useState, useEffect, useMemo } from 'react';
import { EzTable, Checkbox } from 'ezux';
import type { ColumnDef } from 'ezux';
import { Row, Table, PaginationState, SortingState, ColumnFiltersState } from '@tanstack/react-table';
import { exportToCsv } from '../../utils/exportUtils';
import { dataWorkerService } from '../../services/DataWorkerService';
import { Loader2 } from 'lucide-react';

// --- DATA TYPES ---
interface UserData {
    id: number;
    name: string;
    email: string;
    role: string;
    status: 'Active' | 'Inactive' | 'Pending';
    department: string;
    salary: number;
    lastLogin: string;
    [key: string]: any;
}

interface FileNode {
    name: string;
    size: string;
    type: 'Folder' | 'File';
    subRows?: FileNode[];
}

// --- COLUMNS ---
const columns: ColumnDef<UserData>[] = [
    {
        id: 'select',
        header: ({ table }: { table: Table<UserData> }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
            />
        ),
        cell: ({ row }: { row: Row<UserData> }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(checked) => row.toggleSelected(!!checked)}
            />
        ),
        size: 50,
        enableSorting: false,
        enableColumnFilter: false,
        meta: { align: 'center' }
    },
    { accessorKey: 'name', header: 'Name', size: 200, meta: { columnType: 'text' } },
    { accessorKey: 'email', header: 'Email', size: 250 },
    { accessorKey: 'role', header: 'Role', size: 150 },
    { accessorKey: 'department', header: 'Department', size: 150 },
    {
        accessorKey: 'salary',
        header: 'Salary',
        size: 100,
        cell: info => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(info.getValue() as number),
        meta: { align: 'right' }
    },
    {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
        cell: info => (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${info.getValue() === 'Active' ? 'bg-green-100 text-green-800' :
                info.getValue() === 'Inactive' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                }`}>
                {info.getValue() as string}
            </span>
        )
    },
];

const treeData: FileNode[] = [
    {
        name: 'Documents',
        size: '200 KB',
        type: 'Folder',
        subRows: [
            { name: 'Report 2024.docx', size: '15 KB', type: 'File' },
            { name: 'Budget.xlsx', size: '45 KB', type: 'File' },
        ]
    },
    { name: 'Images', size: '150 MB', type: 'Folder', subRows: [{ name: 'Logo.svg', size: '2 KB', type: 'File' }] },
    { name: 'Readme.md', size: '1 KB', type: 'File' }
];

const treeColumns: ColumnDef<FileNode>[] = [
    { accessorKey: 'name', header: 'Name', size: 300 },
    { accessorKey: 'size', header: 'Size', size: 100 },
    { accessorKey: 'type', header: 'Type', size: 100 },
];

export const EzTableDemo = () => {
    // --- WORKER DEMO STATE ---
    const [data, setData] = useState<UserData[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Table State
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 50,
    });

    const [isDataReady, setIsDataReady] = useState(false);

    // 1. Initialize Worker Data
    useEffect(() => {
        const initData = async () => {
            setIsLoading(true);
            try {
                // Generate 10,000 rows in worker store
                console.log('EzTableDemo: Starting data generation...');
                await dataWorkerService.generateTableData(10000, false);
                console.log('EzTableDemo: Data generation complete.');
                setTotalRows(10000);
                setIsDataReady(true);
            } catch (err) {
                console.error("Worker init failed", err);
            } finally {
                setIsLoading(false);
            }
        };
        initData();
    }, []);

    // 2. Fetch Data from Worker when state changes
    useEffect(() => {
        if (!isDataReady) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                console.log('EzTableDemo: Fetching data...');
                const result = await dataWorkerService.processTableData(
                    null as any, // Use stored data
                    sorting,
                    columnFilters,
                    globalFilter,
                    pagination
                );
                console.log('EzTableDemo: Data fetched', result.rows.length);
                setData(result.rows);
                setTotalRows(result.totalRows);
            } catch (err) {
                console.error("Worker fetch failed", err);
            } finally {
                setIsLoading(false);
            }
        };

        // Debounce slightly to prevent thrashing
        const timeoutId = setTimeout(fetchData, 50);
        return () => clearTimeout(timeoutId);

    }, [sorting, columnFilters, globalFilter, pagination, isDataReady]);

    // Page Count derived from worker total
    const pageCount = useMemo(() => Math.ceil(totalRows / pagination.pageSize), [totalRows, pagination.pageSize]);

    const handleGlobalFilterChange = (filter: any) => {
        if (typeof filter === 'string') {
            setGlobalFilter(filter);
        } else if (filter?.quickSearch) {
            setGlobalFilter(filter.quickSearch);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-background space-y-4">
            <div className="font-bold text-xl px-4 pt-4 flex items-center justify-between">
                <span>EzTable Phase 4: Performance & Worker Offloading</span>
                {isLoading && <span className="text-sm font-normal text-muted-foreground flex items-center gap-2"><Loader2 className="animate-spin w-4 h-4" /> Processing in Worker...</span>}
            </div>

            <div className="flex gap-4 p-4 h-full overflow-hidden">
                {/* Demo 1: Worker Offloading */}
                <div className="flex-[2] border rounded-xl shadow-sm flex flex-col p-4 bg-white dark:bg-zinc-950">
                    <h2 className="font-semibold mb-2 flex items-center justify-between">
                        <span>1. 10,000 Rows (Worker Sorted/Filtered)</span>
                        <span className="text-xs font-normal bg-zinc-100 px-2 py-1 rounded">Manual Mode Active</span>
                    </h2>
                    <div className="flex-1 overflow-hidden relative">
                        <EzTable<UserData>
                            data={data}
                            columns={columns}
                            estimatedRowHeight={48}

                            // Manual Control Props
                            manualPagination={true}
                            pageCount={pageCount}
                            onPaginationChange={setPagination}
                            state={{ pagination, sorting, columnFilters, globalFilter }}

                            manualSorting={true}
                            onSortingChange={setSorting}

                            manualFiltering={true}
                            onColumnFiltersChange={setColumnFilters}
                            onGlobalFilterChange={handleGlobalFilterChange}

                            // Standard Props
                            enableRowSelection={true}
                            enableEditing={true} // In-memory edit of current page
                            enableGrouping={false} // Grouping not yet implemented in worker demo
                            enableExport={true}
                            onExportCSV={() => exportToCsv(data, 'WorkerData.csv')} // Exports current page

                            // Load State
                            isLoading={isLoading}
                        />
                    </div>
                </div>

                {/* Demo 2: Tree Data (Standard) */}
                <div className="flex-1 border rounded-xl shadow-sm flex flex-col p-4 bg-white dark:bg-zinc-950">
                    <h2 className="font-semibold mb-2">2. Tree Data (Local)</h2>
                    <div className="flex-1 overflow-hidden">
                        <EzTable<FileNode>
                            data={treeData}
                            columns={treeColumns}
                            estimatedRowHeight={48}
                            enableTreeData={true}
                            getSubRows={(row: FileNode) => row.subRows}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
