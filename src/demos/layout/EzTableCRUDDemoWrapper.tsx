import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
    EzTable,
    Button,
    useI18n,
    cn,
    StatusBadge,
    formatDate,
    Checkbox
} from 'ezux';
import { MockTableData } from '../../utils/DataGenerator';
import { RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBlocker } from '@tanstack/react-router';
import { dataWorkerService } from '../../services/DataWorkerService';

// Replicate basic-table structure with CRUD features enabled

const DATA_COUNT = 50;
const CRUD_QUERY_KEY = ['crudTableData', DATA_COUNT];

const useTableData = () => {
    return useQuery({
        queryKey: CRUD_QUERY_KEY,
        queryFn: () => dataWorkerService.generateTableData(DATA_COUNT),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const EzTableCRUDDemoWrapper: React.FC = () => {
    const i18nService = useI18n();
    const queryClient = useQueryClient();
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set()); // Stores IDs
    // Add ref to trigger table actions
    const tableRef = React.useRef<any>(null);

    const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const { data: data = [], isLoading, refetch, isRefetching } = useTableData();
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [dirtyCounts, setDirtyCounts] = useState({ added: 0, edited: 0, deleted: 0 });

    // Custom confirm dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        show: boolean;
        type?: 'default' | 'navigation';
        title?: string;
        message?: string;
        onConfirm: (() => void) | null;
        onDiscard?: (() => void) | null;
        onCancel: (() => void) | null;
    }>({
        show: false,
        type: 'default',
        onConfirm: null,
        onDiscard: null,
        onCancel: null
    });

    // Navigation Guard using TanStack Router
    const blocker = useBlocker({
        shouldBlockFn: useCallback(() => {
            return hasUnsavedChanges;
        }, [hasUnsavedChanges]),
        withResolver: true
    });

    useEffect(() => {
        // Debug logging to verify blocker state
        if (blocker?.status === 'blocked') {
            console.log('Navigation blocked!', blocker);
        }
    }, [blocker?.status]);

    // Simple mutations
    const updateMutation = useMutation({
        mutationFn: (vars: { id: number; data: Partial<MockTableData> }) =>
            dataWorkerService.updateRecord(vars.id, vars.data),
        onMutate: async ({ id, data: updates }) => {
            await queryClient.cancelQueries({ queryKey: CRUD_QUERY_KEY });
            const previousData = queryClient.getQueryData<MockTableData[]>(CRUD_QUERY_KEY);

            queryClient.setQueryData<MockTableData[]>(CRUD_QUERY_KEY, (old) => {
                if (!old) return [];
                return old.map((row) => (row.id === id ? { ...row, ...updates } : row));
            });

            return { previousData };
        },
        onError: (_err, _newTodo, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(CRUD_QUERY_KEY, context.previousData);
            }
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (ids: number[]) => dataWorkerService.deleteRecords(ids),
        onMutate: async (ids) => {
            await queryClient.cancelQueries({ queryKey: CRUD_QUERY_KEY });
            const previousData = queryClient.getQueryData<MockTableData[]>(CRUD_QUERY_KEY);

            queryClient.setQueryData<MockTableData[]>(CRUD_QUERY_KEY, (old) => {
                if (!old) return [];
                return old.filter((row) => !ids.includes(row.id));
            });

            return { previousData };
        },
        onSuccess: (_data, ids) => {
            // Update local data state to match the query cache
            queryClient.setQueryData<MockTableData[]>(CRUD_QUERY_KEY, (old) => {
                if (!old) return [];
                return old.filter((row) => !ids.includes(row.id));
            });
        },
        onError: (_err, _ids, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(CRUD_QUERY_KEY, context.previousData);
            }
        },
    });



    // Handle individual row deletion from table
    const handleDeleteRecord = useCallback((rowId: number, name: string) => {
        setConfirmDialog({
            show: true,
            type: 'default',
            title: 'Delete Record',
            message: `Are you sure you want to delete "${name}"?`,
            onConfirm: () => {
                // Use table internal delete for batch tracking
                if (tableRef.current?.deleteRecord) {
                    tableRef.current.deleteRecord(rowId);
                } else {
                    // Fallback if ref not ready (shouldn't happen)
                    deleteMutation.mutate([rowId]);
                }
            },
            onCancel: () => {
                // Do nothing, just close the dialog
            }
        });
    }, [deleteMutation]);

    const addMutation = useMutation({
        mutationFn: (newItem: Partial<MockTableData>) => dataWorkerService.addRecord(newItem),
        onMutate: async (newItem) => {
            await queryClient.cancelQueries({ queryKey: CRUD_QUERY_KEY });
            const previousData = queryClient.getQueryData<MockTableData[]>(CRUD_QUERY_KEY);

            // Calculate max ID + 1
            const currentIds = previousData?.map(d => Number(d.id || 0)) || [];
            const maxId = currentIds.length > 0 ? Math.max(...currentIds) : 0;
            const newId = maxId + 1;

            queryClient.setQueryData<MockTableData[]>(CRUD_QUERY_KEY, (old) => {
                if (!old) return [];
                return [{ ...newItem, id: newId } as MockTableData, ...old];
            });

            return { previousData, newId };
        },
        onSuccess: (savedItem) => {
            queryClient.setQueryData<MockTableData[]>(CRUD_QUERY_KEY, (old) => {
                if (!old) return [];
                return [savedItem, ...old.slice(1)];
            });
        },
        onError: (_err, _newItem, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(CRUD_QUERY_KEY, context.previousData);
            }
        },
    });

    // Reusable Save Logic
    const handleBatchSave = useCallback((changes: any) => {
        // Apply all changes
        if (changes.addedRecords.length > 0) {
            changes.addedRecords.forEach((record: any) => addMutation.mutate(record));
        }
        if (changes.changedRecords.length > 0) {
            changes.changedRecords.forEach((record: any) => updateMutation.mutate({ id: record.id, data: record }));
        }
        if (changes.deletedRecords.length > 0) {
            deleteMutation.mutate(changes.deletedRecords.map((r: any) => r.id));
        }
        setStatusMessage({
            text: `Batch saved: ${changes.addedRecords.length} added, ${changes.changedRecords.length} edited, ${changes.deletedRecords.length} deleted`,
            type: 'success'
        });
        setHasUnsavedChanges(false);
        setDirtyCounts({ added: 0, edited: 0, deleted: 0 });
        setTimeout(() => setStatusMessage(null), 4000);
    }, [addMutation, updateMutation, deleteMutation]);

    // Reusable Discard Logic
    const handleBatchDiscard = useCallback(() => {
        setStatusMessage({ text: 'All pending changes discarded', type: 'error' });
        setHasUnsavedChanges(false);
        setDirtyCounts({ added: 0, edited: 0, deleted: 0 });
        setTimeout(() => setStatusMessage(null), 3000);
    }, []);

    const handleReload = useCallback(() => {
        refetch();
        setSelectedRows(new Set());
    }, [refetch]);

    const handleBulkDelete = useCallback(() => {
        if (selectedRows.size === 0) return;

        const idsToDelete = Array.from(selectedRows);
        if (idsToDelete.length > 0) {
            deleteMutation.mutate(idsToDelete);
            setSelectedRows(new Set());
        }
    }, [selectedRows, deleteMutation]);

    const handleSelectAll = useCallback((selected: boolean) => {
        if (selected) {
            setSelectedRows(new Set(data.map(row => row.id)));
        } else {
            setSelectedRows(new Set());
        }
    }, [data]);

    const columns = useMemo<ColumnDef<MockTableData>[]>(() => [
        {
            id: 'select',
            header: ({ table }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={(value) => {
                            handleSelectAll(!!value);
                            table.toggleAllPageRowsSelected(!!value);
                        }}
                        aria-label="Select all"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={selectedRows.has(row.original.id)}
                        onCheckedChange={(value) => {
                            setSelectedRows(prev => {
                                const newSet = new Set(prev);
                                if (value) {
                                    newSet.add(row.original.id);
                                } else {
                                    newSet.delete(row.original.id);
                                }
                                return newSet;
                            });
                            row.toggleSelected(!!value);
                        }}
                        aria-label="Select row"
                    />
                </div>
            ),
            size: 50,
            enableSorting: false,
            enableEditing: false,
            meta: { align: 'center' }
        },
        {
            accessorKey: 'id',
            header: 'ID',
            size: 120,
            minSize: 100,
            enableResizing: true,
            enableSorting: true,
            enableEditing: false,
            meta: { align: 'center' },
            cell: ({ getValue }) => {
                const val = getValue() as string | number;
                if (typeof val === 'string' && val.startsWith('_temp_')) {
                    return <span className="text-muted-foreground italic text-xs">New</span>;
                }
                return <span className="font-mono">{val}</span>;
            }
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
            enableEditing: true,
            meta: { clipMode: 'ellipsis-tooltip' }
        },
        {
            accessorKey: 'email',
            header: 'Email',
            size: 280,
            enableResizing: true,
            enableSorting: true,
            enableColumnFilter: true,
            enableEditing: true,
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
            enableEditing: true,
            meta: {
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
            enableEditing: true,
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
            enableEditing: true,
            meta: {
                columnType: 'select',
                selectOptions: {
                    options: [
                        { label: 'Active', value: 'Active' },
                        { label: 'Inactive', value: 'Inactive' },
                        { label: 'Pending', value: 'Pending' },
                        { label: 'Away', value: 'Away' }
                    ]
                },
                Cell: ({ getValue }) => <StatusBadge status={getValue() as 'Active' | 'Inactive' | 'Pending'} />
            },
        },
        {
            accessorKey: 'salary',
            header: 'Salary',
            size: 160,
            minSize: 140,
            enableResizing: true,
            enableSorting: true,
            enableColumnFilter: true,
            enableEditing: true,
            meta: { align: 'right', columnType: 'number' }
        },
        {
            accessorKey: 'lastLogin',
            header: 'Last Login',
            size: 180,
            minSize: 160,
            enableResizing: true,
            enableSorting: true,
            enableColumnFilter: true,
            enableEditing: true,
            meta: { align: 'center', columnType: 'datetime' },
            cell: ({ getValue }) => (
                <span className="text-muted-foreground">{formatDate(getValue() as Date)}</span>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            size: 100,
            enableSorting: false,
            enableEditing: false,
            meta: { align: 'center' },
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            // Prevent multiple clicks while mutation is loading
                            if (deleteMutation.isPending) return;

                            handleDeleteRecord(Number(row.id), row.original.name);
                        }}
                        disabled={false}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            )
        }
    ], [handleSelectAll, deleteMutation]);

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex justify-between items-center p-2 bg-muted/20 rounded-lg border border-border/40">
                <div className="flex items-center gap-4">
                    {data.length > 50 && (dirtyCounts.added > 0 || dirtyCounts.edited > 0 || dirtyCounts.deleted > 0) && (
                        <div className="flex items-center gap-3 px-2">
                            {dirtyCounts.added > 0 && (
                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                    Added: {dirtyCounts.added}
                                </span>
                            )}
                            {dirtyCounts.edited > 0 && (
                                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                    Edited: {dirtyCounts.edited}
                                </span>
                            )}
                            {dirtyCounts.deleted > 0 && (
                                <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
                                    Deleted: {dirtyCounts.deleted}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {selectedRows.size > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs"
                            onClick={handleBulkDelete}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete {selectedRows.size}
                        </Button>
                    )}
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
            </div>

            <div className="flex-1 overflow-hidden rounded-xl border border-border shadow-sm bg-card relative">
                <EzTable
                    ref={tableRef}
                    data={data}
                    columns={columns}
                    pagination
                    pageSize={20}
                    enableColumnFiltering
                    enableRowSelection
                    enableContextMenu
                    enableStickyHeader
                    enableStickyPagination
                    enableEditing={true}
                    editSettings={{ allowAdding: true, allowEditing: true, mode: 'Normal' }}
                    enableExport
                    enableSearchHighlighting
                    enableChangeTracking
                    enableAdvancedFiltering
                    className="h-full border-none"
                    rowHeight={48}
                    isLoading={isLoading || isRefetching}
                    validateField={({ fieldName, value }) => {
                        // Skip validation for fresh new rows (undefined value) if not being saved
                        // But if we are validating for save, we need to check everything.

                        const isRequired = ['name', 'email', 'role', 'department', 'status', 'salary'].includes(fieldName);
                        if (isRequired && (value === undefined || value === null || value === '')) {
                            const label = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
                            return `${label} is required`;
                        }

                        if (fieldName === 'name' && String(value).length < 3) {
                            return 'Name is required (min 3 chars)';
                        }

                        if (fieldName === 'email') {
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            if (!emailRegex.test(String(value))) {
                                return 'Invalid email format';
                            }
                        }

                        if (fieldName === 'salary' && Number(value) < 0) {
                            return 'Salary cannot be negative';
                        }
                        return true;
                    }}
                    onBatchSave={handleBatchSave}
                    onBatchDiscard={handleBatchDiscard}
                    onDataChange={useCallback((changes: any) => {
                        if (Array.isArray(changes)) {
                            // Legacy callback (data array)
                            setHasUnsavedChanges(false);
                            return;
                        }
                        const added = changes.added || 0;
                        const edited = changes.edited || 0;
                        const deleted = changes.deleted || 0;
                        const totalChanges = added + edited + deleted;

                        setDirtyCounts(prev => {
                            if (prev.added === added && prev.edited === edited && prev.deleted === deleted) {
                                return prev;
                            }
                            return { added, edited, deleted };
                        });
                        setHasUnsavedChanges(totalChanges > 0);
                    }, [])}
                    getRowId={(row) => row.id.toString()}
                />

                {statusMessage && (
                    <div className={cn(
                        "absolute bottom-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl border backdrop-blur-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 flex items-center gap-3",
                        statusMessage.type === 'success' ? "bg-emerald-500/90 border-emerald-400 text-white" : "bg-rose-500/90 border-rose-400 text-white"
                    )}>
                        {statusMessage.type === 'success' && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                        <span className="text-sm font-bold tracking-tight">{statusMessage.text}</span>
                    </div>
                )}
            </div>

            {/* Custom Confirm Dialog - For Delete Actions */}
            {confirmDialog.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-background border border-border rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    {confirmDialog.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {confirmDialog.message}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setConfirmDialog(prev => ({ ...prev, show: false }));
                                    confirmDialog.onCancel?.();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    setConfirmDialog(prev => ({ ...prev, show: false }));
                                    confirmDialog.onConfirm?.();
                                }}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Block Dialog - Rendered Explicitly on Blocked Status */}
            {blocker.status === 'blocked' && (() => {
                console.log('Rendering Navigation Block Dialog');
                return (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
                        <div className="bg-background border border-border rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        Unsaved Changes
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        You have made changes to your data. Do you want to save before leaving?
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => blocker.reset()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-transparent dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50"
                                    onClick={() => {
                                        // Discard changes
                                        handleBatchDiscard();
                                        blocker.proceed();
                                    }}
                                >
                                    Discard Changes
                                </Button>
                                <Button
                                    onClick={() => {
                                        // Validate form before saving
                                        if (tableRef.current?.validateEditForm) {
                                            const isValid = tableRef.current.validateEditForm();
                                            if (!isValid) {
                                                console.warn('Form validation failed');
                                                return;
                                            }
                                        }

                                        // Get changes and save
                                        if (tableRef.current?.getBatchChanges) {
                                            const changes = tableRef.current.getBatchChanges();
                                            handleBatchSave(changes);
                                        }

                                        blocker.proceed();
                                    }}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};
