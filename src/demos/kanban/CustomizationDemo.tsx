'use client';

import { useState, useEffect } from 'react';
import { EzKanban, Badge, Button, Progress, Modal } from 'ezux';
import type { KanbanBoard } from 'ezux';
import { dataWorkerService } from '../../services/DataWorkerService';
import { Loader2, User, Clock, AlertCircle } from 'lucide-react';

export const CustomizationDemo = () => {
    const [board, setBoard] = useState<KanbanBoard | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await dataWorkerService.generateKanbanBoard(6);
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
        <div className="h-full border rounded-xl overflow-hidden shadow-sm bg-card">
            <EzKanban
                board={board}
                onBoardChange={setBoard}
                className="h-full"
                customRenderers={{
                    // 1. Custom Card Content (Adding progress and status indicators)
                    cardContent: (card) => {
                        const progress = (card.metadata?.progress as number) || 0;
                        const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

                        return (
                            <div className="space-y-3 p-1">
                                <div className="flex justify-between items-start gap-2">
                                    <h4 className="font-bold text-sm leading-tight text-foreground line-clamp-2">
                                        {card.title}
                                    </h4>
                                    {card.priority === 'critical' && (
                                        <Badge variant="destructive" className="h-4 px-1 text-[10px] animate-pulse">
                                            CRITICAL
                                        </Badge>
                                    )}
                                </div>

                                {card.description && (
                                    <p className="text-[11px] text-muted-foreground line-clamp-2 italic">
                                        {card.description}
                                    </p>
                                )}

                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                                        <span>Progress</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-1" />
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex -space-x-1.5">
                                        {card.assignees?.map((a) => (
                                            <div
                                                key={a.id}
                                                className="w-5 h-5 rounded-full border border-background bg-primary/10 flex items-center justify-center overflow-hidden"
                                                title={a.name}
                                            >
                                                <User className="w-3 h-3 text-primary" />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {isOverdue && (
                                            <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                                        )}
                                        {card.dueDate && (
                                            <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                {new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    },

                    // 2. Custom Card Editor (Simple Modal Override)
                    cardEditor: ({ isOpen, card, onClose, onSave, columns }) => {
                        if (!isOpen) return null;

                        return (
                            <Modal
                                isOpen={isOpen}
                                onClose={onClose}
                                title={card?.id ? 'Edit Enterprise Task' : 'New Strategic Initiative'}
                                className="max-w-md"
                            >
                                <div className="space-y-4 p-4">
                                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg">
                                        <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                            <strong>Note:</strong> This is a custom editor implementation. You can
                                            add any fields, validation, or complex UI components here.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-muted-foreground">Title</label>
                                        <input
                                            className="w-full h-10 px-3 rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none"
                                            defaultValue={card?.title}
                                            id="custom-title-input"
                                            name="custom-title-input"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Status</label>
                                            <select
                                                className="w-full h-10 px-2 rounded-lg border bg-background"
                                                defaultValue={card?.columnId}
                                                id="custom-column-select"
                                                name="custom-column-select"
                                            >
                                                {columns.map(col => (
                                                    <option key={col.id} value={col.id}>{col.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Progress (%)</label>
                                            <input
                                                type="number"
                                                className="w-full h-10 px-3 rounded-lg border bg-background"
                                                defaultValue={(card?.metadata?.progress as number) || 0}
                                                id="custom-progress-input"
                                                name="custom-progress-input"
                                                min="0"
                                                max="100"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                                        <Button onClick={() => {
                                            const title = (document.getElementById('custom-title-input') as HTMLInputElement).value;
                                            const columnId = (document.getElementById('custom-column-select') as HTMLSelectElement).value;
                                            const progress = parseInt((document.getElementById('custom-progress-input') as HTMLInputElement).value);

                                            onSave({
                                                ...card,
                                                title,
                                                columnId,
                                                metadata: { ...card?.metadata, progress }
                                            });
                                            onClose();
                                        }}>
                                            Save Changes
                                        </Button>
                                    </div>
                                </div>
                            </Modal>
                        );
                    }
                }}
            />
        </div>
    );
};
