import { useState, useEffect } from 'react';
import { EzKanban, globalServiceRegistry } from 'ezux';
import type { KanbanBoard } from 'ezux';
import { dataWorkerService } from '../../services/DataWorkerService';
import { Loader2 } from 'lucide-react';

export const SwimlaneDemo = () => {
    const [board, setBoard] = useState<KanbanBoard | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await dataWorkerService.generateKanbanBoard(8);
                // Map cards to swimlanes based on priority
                const cardsWithSwimlanes = data.cards.map((card: any) => {
                    const priority = card.priority || 'medium';
                    const swimlane = data.swimlanes.find((s: any) => s.id === `swim-${priority}`);
                    return {
                        ...card,
                        swimlaneId: swimlane?.id || 'swim-medium'
                    };
                });

                const boardWithSwimlanes = {
                    ...data,
                    cards: cardsWithSwimlanes,
                    settings: {
                        ...data.settings,
                        enableSwimlanes: true
                    }
                };

                const service = globalServiceRegistry.get<any>('KanbanService');
                if (service && service.initializeWithData) {
                    service.initializeWithData([boardWithSwimlanes]);
                }

                setBoard(boardWithSwimlanes);
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
            view="swimlane"
            className="h-full border rounded-xl overflow-hidden shadow-sm bg-card"
        />
    );
};
