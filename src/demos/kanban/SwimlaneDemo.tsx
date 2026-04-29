import { useState, useEffect } from 'react';
import { EzKanban, useEzServiceRegistry, Modal, Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Checkbox } from '@/lib/ezux-compat';
import type { KanbanBoard } from '@/lib/ezux-compat';
import { dataWorkerService } from '../../services/DataWorkerService';
import { Loader2, CheckSquare, Paperclip, AlignLeft, File, Trash2 } from 'lucide-react';

export const SwimlaneDemo = () => {
    const [board, setBoard] = useState<KanbanBoard | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedColumnId, setSelectedColumnId] = useState<string>('');
    const [cardData, setCardData] = useState<any>(null);
    const registry = useEzServiceRegistry();

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

                const service = registry.get<any>('KanbanService');
                if (service && service.initializeWithData) {
                    service.initializeWithData([boardWithSwimlanes]);
                }

                setBoard(boardWithSwimlanes);
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
            slots={{
                cardEditor: ({ isOpen, card, onClose, onSave, columns, swimlanes }) => {
                    if (!isOpen) return null;

                    // Local state for the card editor modal - using local state, not component-level
                    const [localActiveTab, setLocalActiveTab] = useState<'details' | 'subtasks' | 'attachments'>('details');
                    const [localEditedTitle, setLocalEditedTitle] = useState('');
                    const [localEditedDescription, setLocalEditedDescription] = useState('');
                    const [localEditedColumnId, setLocalEditedColumnId] = useState('');
                    const [localEditedPriority, setLocalEditedPriority] = useState('medium');
                    const [editedSubtasks, setEditedSubtasks] = useState<any[]>([]);
                    const [editedAttachments, setEditedAttachments] = useState<any[]>([]);
                    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
                    const isNew = !card?.id;

                    // Initialize form when card changes or modal opens
                    useEffect(() => {
                        if (isOpen && card) {
                            setLocalActiveTab('details');
                            setLocalEditedTitle(card.title || '');
                            setLocalEditedDescription(card.description || '');
                            setLocalEditedColumnId(card.columnId || (columns.length > 0 ? columns[0].id : ''));
                            setLocalEditedPriority(card.priority || 'medium');
                            setEditedSubtasks(card?.metadata?.subtasks || []);
                            setEditedAttachments(card?.attachments || []);
                        }
                    }, [isOpen, card?.id, columns]);

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
                        if (!localEditedTitle.trim()) return;
                        onSave({
                            ...cardData,
                            title: localEditedTitle,
                            description: localEditedDescription,
                            columnId: localEditedColumnId,
                            priority: localEditedPriority,
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
                                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${localActiveTab === 'details'
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <AlignLeft className="w-4 h-4" />
                                        Details
                                    </button>
                                    <button
                                        onClick={() => setLocalActiveTab('subtasks')}
                                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${localActiveTab === 'subtasks'
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <CheckSquare className="w-4 h-4" />
                                        Subtasks
                                    </button>
                                    <button
                                        onClick={() => setLocalActiveTab('attachments')}
                                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${localActiveTab === 'attachments'
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
                                                    value={localEditedTitle}
                                                    onChange={(e) => setLocalEditedTitle(e.target.value)}
                                                    placeholder="Enter card title"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold">Description</label>
                                                <Textarea
                                                    value={localEditedDescription}
                                                    onChange={(e) => setLocalEditedDescription(e.target.value)}
                                                    placeholder="Enter card description"
                                                    rows={4}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold">Column</label>
                                                <Select
                                                    value={localEditedColumnId}
                                                    onValueChange={(v) => setLocalEditedColumnId(v)}
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

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold">Priority</label>
                                                <Select
                                                    value={localEditedPriority}
                                                    onValueChange={(v) => setLocalEditedPriority(v)}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select priority" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="high">High Priority</SelectItem>
                                                        <SelectItem value="medium">Medium Priority</SelectItem>
                                                        <SelectItem value="low">Low Priority</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold">Tags</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {card?.tags?.map((tag: any) => (
                                                        <Badge key={tag.id} style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                                                            {tag.name}
                                                        </Badge>
                                                    )) || <span className="text-muted-foreground text-sm">No tags</span>}
                                                </div>
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
                                                                <Trash2 className="h-4 w-4" />
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
                                                                <Trash2 className="h-4 w-4" />
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
    );
};
