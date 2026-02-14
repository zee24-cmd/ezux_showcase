import type { KanbanBoard, KanbanColumn, KanbanCard, CardAssignee } from 'ezux';

/**
 * Mock data factory for EzKanban demo
 * Generates realistic Kanban boards with cards, assignees, tags, etc.
 */

const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

const taskTitles = [
    'Implement user authentication',
    'Design landing page',
    'Fix navigation bug',
    'Update documentation',
    'Optimize database queries',
    'Add dark mode support',
    'Create API endpoints',
    'Write unit tests',
    'Refactor legacy code',
    'Setup CI/CD pipeline',
    'Improve error handling',
    'Add search functionality',
    'Implement caching',
    'Update dependencies',
    'Fix responsive layout',
    'Add analytics tracking',
    'Optimize images',
    'Setup monitoring',
    'Create user dashboard',
    'Implement notifications'
];

const tags = [
    { id: 'tag-1', name: 'Frontend', color: '#3b82f6' },
    { id: 'tag-2', name: 'Backend', color: '#10b981' },
    { id: 'tag-3', name: 'Bug', color: '#ef4444' },
    { id: 'tag-4', name: 'Feature', color: '#8b5cf6' },
    { id: 'tag-5', name: 'Documentation', color: '#f59e0b' },
    { id: 'tag-6', name: 'Testing', color: '#06b6d4' },
    { id: 'tag-7', name: 'Performance', color: '#ec4899' },
    { id: 'tag-8', name: 'Security', color: '#f97316' },
];

function generateAssignee(index: number): CardAssignee {
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
    return {
        id: `user-${index}`,
        name: `${firstName} ${lastName}`,
        avatarUrl: `https://i.pravatar.cc/150?img=${index % 70}`,
        role: 'assignee'
    };
}

function generateCard(index: number, columnId: string): KanbanCard {
    const assignees = [
        generateAssignee(index % 10),
        ...(index % 3 === 0 ? [generateAssignee((index + 1) % 10)] : [])
    ];

    const cardTags = [
        tags[index % tags.length],
        ...(index % 4 === 0 ? [tags[(index + 1) % tags.length]] : [])
    ];

    const priorities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    const priority = priorities[index % 3];

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (index % 30));

    return {
        id: `card-${columnId}-${index}`,
        type: 'standard',
        title: taskTitles[index % taskTitles.length],
        description: `This is a detailed description for task: ${taskTitles[index % taskTitles.length]}. It includes important context and requirements.`,
        columnId,
        position: index * 1000,
        priority,
        assignees,
        tags: cardTags,
        dueDate: dueDate,
        metadata: {},
        createdBy: 'system',
        createdAt: new Date(Date.now() - index * 86400000),
        updatedBy: 'system',
        updatedAt: new Date(),
    };
}

export function generateKanbanBoard(cardsPerColumn: number = 5): KanbanBoard {
    const columns: KanbanColumn[] = [
        {
            id: 'col-todo',
            name: 'To Do',
            color: '#94a3b8',
            position: 0,
        },
        {
            id: 'col-in-progress',
            name: 'In Progress',
            color: '#3b82f6',
            position: 1,
        },
        {
            id: 'col-review',
            name: 'Review',
            color: '#f59e0b',
            position: 2,
        },
        {
            id: 'col-done',
            name: 'Done',
            color: '#10b981',
            position: 3,
        },
    ];

    const swimlanes = [
        { id: 'swim-frontend', name: 'Frontend Team', type: 'team' as const, position: 0 },
        { id: 'swim-backend', name: 'Backend Team', type: 'team' as const, position: 1 },
        { id: 'swim-uncategorized', name: 'Uncategorized', type: 'custom' as const, position: 2 },
    ];

    const cards: KanbanCard[] = [];
    let cardIndex = 0;

    columns.forEach((column) => {
        for (let i = 0; i < cardsPerColumn; i++) {
            const card = generateCard(cardIndex, column.id);
            // Distribute cards across swimlanes
            if (i % 3 === 0) card.swimlaneId = 'swim-frontend';
            else if (i % 3 === 1) card.swimlaneId = 'swim-backend';
            // Else undefined (uncategorized)

            cards.push(card);
            cardIndex++;
        }
    });

    return {
        id: 'board-1',
        name: 'Product Development Board',
        description: 'Track all product development tasks and features',
        columns,
        swimlanes,
        cards,
        settings: {
            allowDragAndDrop: true,
            allowMultiSelect: true,
            enableWipLimits: false,
            defaultView: 'standard'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

/**
 * Generate a large board for performance testing
 */
export function generateLargeKanbanBoard(): KanbanBoard {
    return generateKanbanBoard(25); // 100 total cards (25 per column)
}

/**
 * Generate a minimal board for quick demos
 */
export function generateMinimalKanbanBoard(): KanbanBoard {
    return generateKanbanBoard(3); // 12 total cards (3 per column)
}

