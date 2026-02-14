import { useState, useEffect } from 'react';
import { EzKanban, globalServiceRegistry } from 'ezux';
import type { KanbanBoard } from 'ezux';
import { dataWorkerService } from '../../services/DataWorkerService';
import { Loader2 } from 'lucide-react';

export const TimelineDemo = () => {
    const [board, setBoard] = useState<KanbanBoard | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [groupBy, setGroupBy] = useState<'swimlane' | 'column'>('swimlane');

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await dataWorkerService.generateKanbanBoard(8);
                // Map cards to swimlanes based on priority (similar to SwimlaneDemo)
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
                        enableSwimlanes: true,
                        defaultView: 'timeline'
                    } as any // Cast to any to allow extra properties or fix type mismatch
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
        <div className="flex flex-col h-full overflow-hidden bg-card rounded-xl border shadow-sm">
            <div className="flex items-center gap-4 bg-muted/30 p-2 border-b">
                <span className="text-sm font-medium text-muted-foreground px-2">Group By:</span>
                <button
                    onClick={() => setGroupBy('swimlane')}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${groupBy === 'swimlane' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}
                >
                    Priority
                </button>
                <button
                    onClick={() => setGroupBy('column')}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${groupBy === 'column' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-muted-foreground'}`}
                >
                    Status
                </button>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden relative">
                <EzKanban
                    board={{
                        ...board,
                        // If we group by column, we remove swimlanes so the view falls back to columns
                        swimlanes: groupBy === 'swimlane' ? board.swimlanes : undefined,
                        settings: {
                            ...board.settings,
                            enableSwimlanes: groupBy === 'swimlane'
                        } as any
                    }}
                    onBoardChange={(newBoard) => {
                        setBoard(prev => {
                            if (!prev) return newBoard;

                            // If we're coming from column view (where we hid swimlanes), 
                            // we need to ensure new cards get a swimlane assignment based on priority
                            // to match our demo's logic.
                            const swimlanes = newBoard.swimlanes || prev.swimlanes;

                            const updatedCards = newBoard.cards.map(card => {
                                if (!card.swimlaneId && swimlanes) {
                                    const priority = card.priority || 'medium';
                                    const swimlane = swimlanes.find(s => s.id === `swim-${priority}`);
                                    return {
                                        ...card,
                                        swimlaneId: swimlane?.id || swimlanes[0]?.id // Fallback to first swimlane
                                    };
                                }
                                return card;
                            });

                            return {
                                ...newBoard,
                                cards: updatedCards,
                                // Restore swimlanes if they were hidden in the current view
                                swimlanes: swimlanes,
                                // Persist original settings if needed
                                settings: {
                                    ...newBoard.settings,
                                    enableSwimlanes: true // Always keep true in state
                                } as any
                            };
                        });
                    }}
                    view="timeline"
                    className="h-full"
                />
            </div>
        </div>
    );
};
