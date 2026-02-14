import { Skeleton } from 'ezux';

export const TableLoadingSkeleton = () => (
    <div className="flex flex-col h-full bg-background p-6 animate-pulse">
        {/* Toolbar Placeholder */}
        <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-9 w-48 rounded-md" />
            <div className="flex gap-2">
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="h-9 w-24 rounded-md" />
            </div>
        </div>

        {/* Table Structure */}
        <div className="border border-border rounded-md overflow-hidden flex flex-col flex-1 blur-[1px] opacity-70">
            {/* Header */}
            <div className="h-10 border-b border-border bg-muted/40 flex items-center px-4 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1 opacity-50" />
                ))}
            </div>

            {/* Rows */}
            <div className="flex-1 p-0">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-12 border-b border-border/40 flex items-center px-4 gap-4">
                        {Array.from({ length: 5 }).map((_, j) => (
                            <Skeleton key={j} className="h-3 flex-1 opacity-30" />
                        ))}
                    </div>
                ))}
            </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4">
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-8 w-64 rounded-md" />
        </div>
    </div>
);
