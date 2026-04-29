'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { EzKanban, Button, Badge, Modal, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Checkbox } from '@/lib/ezux-compat';
import type { KanbanBoard, EzKanbanRef } from '@/lib/ezux-compat';
import { dataWorkerService } from '../../services/DataWorkerService';
import { Loader2, Terminal, Trash2, Plus, Settings, CheckSquare, Paperclip, AlignLeft, File, Trash2 as Trash2Icon } from 'lucide-react';

export const EventsDemo = () => {
    const [board, setBoard] = useState<KanbanBoard | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [logs, setLogs] = useState<{ id: string, msg: string, time: string, type: 'info' | 'success' | 'warning' }[]>([]);
    const kanbanRef = useRef<EzKanbanRef>(null);
    const [selectedColumnId, setSelectedColumnId] = useState<string>('');
    const [cardData, setCardData] = useState<any>(null);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [editedColumnId, setEditedColumnId] = useState('');

    // Reset hasOpened when modal closes
    useEffect(() => {
        // This is handled via the slot's effect
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await dataWorkerService.generateKanbanBoard(5);
                setBoard(data);
                if (data.columns.length > 0) {
                    setSelectedColumnId(data.columns[0].id);
                }
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

    const handleSave = (onSave: (card: any) => void, onClose: () => void) => {
        if (!editedTitle.trim()) return;

        onSave({
            ...cardData,
            title: editedTitle,
            description: editedDescription,
            columnId: editedColumnId
        });
        onClose();
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
                    slots={{
                        cardEditor: ({ isOpen, card, onClose, onSave, columns }) => {
                            if (!isOpen) return null;

                            // Local state for the card editor modal
                            const [localActiveTab, setLocalActiveTab] = useState<'details' | 'subtasks' | 'attachments'>('details');
                            const [editedSubtasks, setEditedSubtasks] = useState<any[]>([]);
                            const [editedAttachments, setEditedAttachments] = useState<any[]>([]);
                            const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
                            const isNew = !card?.id;

                            // Reset local state when modal opens with a new card
                            useEffect(() => {
                                if (isOpen) {
                                    setLocalActiveTab('details');
                                    setEditedSubtasks(card?.metadata?.subtasks || []);
                                    setEditedAttachments(card?.attachments || []);
                                }
                            }, [card?.id, isOpen]);

                            const handleAddSubtask = () => {
                                if (!newSubtaskTitle.trim()) return;
                                const newSubtask = {
                                    id: `subtask-${Date.now()}`,
                                    title: newSubtaskTitle.trim(),
                                    completed: false
                                };
                                setEditedSubtasks([...editedSubtasks, newSubtask]);
                                setNewSubtaskTitle('');
                            };

                            const handleToggleSubtask = (subtaskId: string) => {
                                setEditedSubtasks(editedSubtasks.map((s: any) => 
                                    s.id === subtaskId ? { ...s, completed: !s.completed } : s
                                ));
                            };

                            const handleDeleteSubtask = (subtaskId: string) => {
                                setEditedSubtasks(editedSubtasks.filter((s: any) => s.id !== subtaskId));
                            };

                            const handleAddAttachment = () => {
                                const newAttachment = {
                                    id: `attachment-${Date.now()}`,
                                    name: `document-${Math.floor(Math.random() * 1000)}.pdf`,
                                    size: Math.floor(Math.random() * 5000000),
                                    type: 'application/pdf',
                                    uploadedAt: new Date().toISOString()
                                };
                                setEditedAttachments([...editedAttachments, newAttachment]);
                            };

                            const handleDeleteAttachment = (attachmentId: string) => {
                                setEditedAttachments(editedAttachments.filter((a: any) => a.id !== attachmentId));
                            };

                            const handleSave = () => {
                                if (!editedTitle.trim()) return;
                                onSave({
                                    ...cardData,
                                    title: editedTitle,
                                    description: editedDescription,
                                    columnId: editedColumnId,
                                    metadata: {
                                        ...cardData?.metadata,
                                        subtasks: editedSubtasks
                                    },
                                    attachments: editedAttachments
                                });
                                onClose();
                            };

                            return (
                                <Modal
                                    isOpen={isOpen}
                                    onClose={onClose}
                                    title={isNew ? 'Create New Card' : 'Edit Card'}
                                    className="max-w-2xl"
                                >
                                    <div className="flex flex-col h-[70vh] max-h-[600px]">
                                        {/* Tab Navigation */}
                                        <div className="flex border-b px-4">
                                            <button
                                                onClick={() => setLocalActiveTab('details')}
                                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                                    localActiveTab === 'details'
                                                        ? 'border-primary text-primary'
                                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                                }`}
                                            >
                                                <AlignLeft className="w-4 h-4" />
                                                Details
                                            </button>
                                            <button
                                                onClick={() => setLocalActiveTab('subtasks')}
                                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                                    localActiveTab === 'subtasks'
                                                        ? 'border-primary text-primary'
                                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                                }`}
                                            >
                                                <CheckSquare className="w-4 h-4" />
                                                Subtasks
                                            </button>
                                            <button
                                                onClick={() => setLocalActiveTab('attachments')}
                                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                                    localActiveTab === 'attachments'
                                                        ? 'border-primary text-primary'
                                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                                }`}
                                            >
                                                <Paperclip className="w-4 h-4" />
                                                Attachments
                                            </button>
                                        </div>

                                        {/* Tab Content */}
                                        <div className="flex-1 overflow-y-auto p-4">
                                            {localActiveTab === 'details' && (
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-semibold">Title</label>
                                                        <Input
                                                            value={editedTitle}
                                                            onChange={(e) => setEditedTitle(e.target.value)}
                                                            placeholder="Enter card title"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-semibold">Description</label>
                                                        <Textarea
                                                            value={editedDescription}
                                                            onChange={(e) => setEditedDescription(e.target.value)}
                                                            placeholder="Enter card description"
                                                            rows={4}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-semibold">Column</label>
                                                        <Select
                                                            value={editedColumnId}
                                                            onValueChange={(v) => setEditedColumnId(v)}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select column" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {columns.map((col: any) => (
                                                                    <SelectItem key={col.id} value={col.id}>
                                                                        {col.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            )}

                                            {localActiveTab === 'subtasks' && (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-semibold">Subtasks</h4>
                                                        <Button variant="outline" size="sm" onClick={handleAddSubtask}>Add Subtask</Button>
                                                    </div>
                                                    
                                                    {/* Add new subtask input */}
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={newSubtaskTitle}
                                                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                                            placeholder="Enter subtask title"
                                                            onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                                                        />
                                                    </div>
                                                    
                                                    {/* Subtask list */}
                                                    <div className="space-y-2">
                                                        {editedSubtasks.length > 0 ? (
                                                            editedSubtasks.map((subtask: any) => (
                                                                <div key={subtask.id} className="flex items-center gap-2 p-2 border rounded-md">
                                                                    <Checkbox
                                                                        checked={subtask.completed}
                                                                        onCheckedChange={() => handleToggleSubtask(subtask.id)}
                                                                    />
                                                                    <span className={`flex-1 ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                                                                        {subtask.title}
                                                                    </span>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                        onClick={() => handleDeleteSubtask(subtask.id)}
                                                                    >
                                                                        <Trash2Icon className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-muted-foreground text-sm">
                                                                No subtasks yet
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {editedSubtasks.length > 0 && (
                                                        <div className="text-muted-foreground text-sm">
                                                            {editedSubtasks.filter((s: any) => s.completed).length}/{editedSubtasks.length} completed
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {localActiveTab === 'attachments' && (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-semibold">Attachments</h4>
                                                        <Button variant="outline" size="sm" onClick={handleAddAttachment}>Add File</Button>
                                                    </div>
                                                    
                                                    {/* Attachment list */}
                                                    <div className="space-y-2">
                                                        {editedAttachments.length > 0 ? (
                                                            editedAttachments.map((attachment: any) => (
                                                                <div key={attachment.id} className="flex items-center gap-2 p-2 border rounded-md">
                                                                    <File className="h-4 w-4" />
                                                                    <div className="flex-1">
                                                                        <div className="text-sm">{attachment.name}</div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {(attachment.size / 1024).toFixed(1)} KB
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                        onClick={() => handleDeleteAttachment(attachment.id)}
                                                                    >
                                                                        <Trash2Icon className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-muted-foreground text-sm">
                                                                No attachments yet
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {editedAttachments.length > 0 && (
                                                        <div className="text-muted-foreground text-sm">
                                                            {editedAttachments.length} file(s)
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="flex justify-end gap-2 pt-4 border-t px-4 pb-4">
                                            <Button variant="ghost" onClick={onClose}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleSave}>
                                                {isNew ? 'Create' : 'Save'}
                                            </Button>
                                        </div>
                                    </div>
                                </Modal>
                            );
                        }
                    }}
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
