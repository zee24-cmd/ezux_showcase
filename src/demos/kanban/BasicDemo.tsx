import { useState, useEffect } from 'react';
import { EzKanban, globalServiceRegistry } from 'ezux';
import type { KanbanBoard } from 'ezux';
import { dataWorkerService } from '../../services/DataWorkerService';
import { Loader2 } from 'lucide-react';

export const BasicDemo = () => {
    const [board, setBoard] = useState<KanbanBoard | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Check if service has data first (simulating persistent check)
                const service = globalServiceRegistry.get<any>('KanbanService');

                // For demo simplicity, we regenerate or just use what we generate.
                // In a real app, we'd fetch from service.getBoard(id).
                const data = await dataWorkerService.generateKanbanBoard(5);

                if (service && service.initializeWithData) {
                    service.initializeWithData([data]);
                }

                setBoard(data);
            } catch (error) {
                console.error('Failed to load kanban data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    if (isLoading || !board) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <EzKanban
            board={board}
            onBoardChange={setBoard}
            className="h-full border rounded-xl overflow-hidden shadow-sm bg-card"
        />
    );
};
