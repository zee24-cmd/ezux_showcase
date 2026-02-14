import { useState, useEffect } from 'react';
import { EzKanban } from 'ezux';
import type { KanbanBoard, KanbanCard } from 'ezux';
import { dataWorkerService } from '../../services/DataWorkerService';
import { Loader2 } from 'lucide-react';

export const EzKanbanDemo = () => {
    const [board, setBoard] = useState<KanbanBoard | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await dataWorkerService.generateKanbanBoard(5);
                setBoard(data);
            } catch (error) {
                console.error('Failed to load kanban data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const handleBoardChange = (updatedBoard: KanbanBoard) => {
        setBoard(updatedBoard);
        console.log('Board updated:', updatedBoard);
    };

    const handleCardClick = (card: KanbanCard) => {
        console.log('Card clicked:', card);
    };

    const handleCardDoubleClick = (card: KanbanCard) => {
        console.log('Card double-clicked:', card);
    };

    if (isLoading || !board) {
        return (
            <div className="flex items-center justify-center h-full w-full bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full bg-background">
            <div className="flex-1 overflow-hidden">
                <EzKanban
                    board={board}
                    onBoardChange={handleBoardChange}
                    onCardClick={handleCardClick}
                    onCardDoubleClick={handleCardDoubleClick}
                    className="h-full"
                />
            </div>
        </div>
    );
};
