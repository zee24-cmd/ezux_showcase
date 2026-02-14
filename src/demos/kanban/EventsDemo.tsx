'use client';

import { useState, useEffect, useRef } from 'react';
import { EzKanban, Button, Badge } from 'ezux';
import type { KanbanBoard, EzKanbanRef } from 'ezux';
import { dataWorkerService } from '../../services/DataWorkerService';
import { Loader2, Terminal, Trash2, Plus, Settings } from 'lucide-react';

export const EventsDemo = () => {
    const [board, setBoard] = useState<KanbanBoard | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [logs, setLogs] = useState<{ id: string, msg: string, time: string, type: 'info' | 'success' | 'warning' }[]>([]);
    const kanbanRef = useRef<EzKanbanRef>(null);

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

    const addLog = (msg: string, type: 'info' | 'success' | 'warning' = 'info') => {
        setLogs(prev => [{
            id: Math.random().toString(36).substr(2, 9),
            msg,
            type,
            time: new Date().toLocaleTimeString()
        }, ...prev].slice(0, 50));
    };

    if (isLoading || !board) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">
            {/* Kanban Board */}
            <div className="lg:col-span-3 border rounded-xl overflow-hidden shadow-sm bg-card relative">
                <EzKanban
                    ref={kanbanRef}
                    board={board}
                    onBoardChange={(newBoard) => {
                        setBoard(newBoard);
                        addLog('Board state synchronized', 'info');
                    }}
                    onCardClick={(card) => addLog(`Card Clicked: ${card.title}`, 'info')}
                    onCardUpdate={(card, type) => addLog(`Card Updated (${type}): ${card.title}`, 'success')}
                    onCardCreate={(card) => addLog(`Card Created: ${card.title}`, 'success')}
                    onCardDelete={(id) => addLog(`Card Deleted: ${id}`, 'warning')}
                    onColumnCreate={() => addLog('Column Added', 'success')}
                    onColumnDelete={(id) => addLog(`Card Deleted: ${id}`, 'warning')}
                    className="h-full"
                />
            </div>

            {/* API Controls & Console */}
            <div className="flex flex-col gap-6">
                {/* API Controls */}
                <div className="p-5 border rounded-xl bg-card shadow-sm space-y-4">
                    <h3 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Imperative API</h3>
                    <div className="grid grid-cols-1 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="justify-start gap-2"
                            onClick={() => {
                                kanbanRef.current?.addCard({ title: 'Programmatic Task', description: 'Added via ref API' });
                            }}
                        >
                            <Plus className="w-3.5 h-3.5" /> Add card via Ref
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="justify-start gap-2"
                            onClick={() => {
                                const cards = kanbanRef.current?.getCards();
                                if (cards?.length) {
                                    const first = cards[0];
                                    kanbanRef.current?.updateCard(first.id, { title: first.title + ' (Updated)' });
                                }
                            }}
                        >
                            <Settings className="w-3.5 h-3.5" /> Update 1st Card
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                                const cards = kanbanRef.current?.getCards();
                                if (cards?.length) {
                                    kanbanRef.current?.deleteCard(cards[0].id);
                                }
                            }}
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete 1st Card
                        </Button>
                    </div>
                </div>

                {/* Console Output */}
                <div className="flex-1 flex flex-col border rounded-xl bg-neutral-950 text-neutral-400 overflow-hidden shadow-sm font-mono text-[11px]">
                    <div className="flex items-center justify-between p-3 border-b border-neutral-800 bg-neutral-900">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5" />
                            <span className="font-bold text-neutral-200">Event Log</span>
                        </div>
                        <Badge variant="outline" className="h-4 px-1 text-[9px] border-neutral-700 text-neutral-500">
                            {logs.length} entries
                        </Badge>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {logs.map(log => (
                            <div key={log.id} className="flex gap-2">
                                <span className="text-neutral-600 shrink-0">[{log.time}]</span>
                                <span className={
                                    log.type === 'success' ? 'text-green-400' :
                                        log.type === 'warning' ? 'text-red-400' :
                                            'text-blue-400'
                                }>
                                    {log.msg}
                                </span>
                            </div>
                        ))}
                        {logs.length === 0 && (
                            <div className="text-neutral-700 italic">Waiting for interactions...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
