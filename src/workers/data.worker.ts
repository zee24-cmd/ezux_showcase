// Data Worker
// This worker generates data off the main thread to prevent UI freezing

import { faker } from '@faker-js/faker';

// Define types locally since we can't easily import from TS files in worker (without complex setup)
interface MockTableData {
    id: number;
    name: string;
    email: string;
    role: string;
    status: 'Active' | 'Inactive' | 'Pending';
    lastLogin: Date;
    department: string;
    salary: number;
    businessUnit: string;
    location: string;
    manager: string;
    costCenter: string;
    tenure: number;
    performance: string;
    skillSet: string;
    [key: string]: any; // Allow custom fields
    notes?: string;
    startDate?: Date;
    dueDate?: Date;
}

// Persistent Store
let tableStore: MockTableData[] | null = null; // In-memory "Database"
let schedulerStore: Map<string, any[]> = new Map(); // Cache for scheduler events by key

self.onmessage = (e: MessageEvent) => {
    const { type, count, requestId } = e.data;

    try {
        if (type === 'generateTableData') {
            const { forceRefresh } = e.data;

            if (!tableStore || tableStore.length !== count || forceRefresh) {
                if (forceRefresh) faker.seed(Date.now());
                else faker.seed(123); // Deterministic default

                tableStore = [];
                const roles = ['Developer', 'Designer', 'Manager', 'QA', 'Product Owner', 'DevOps'];
                const departments = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'HR'];
                const statuses: ('Active' | 'Inactive' | 'Pending')[] = ['Active', 'Inactive', 'Pending'];

                for (let i = 0; i < count; i++) {
                    tableStore.push({
                        id: i + 1,
                        name: faker.person.fullName(),
                        email: faker.internet.email(),
                        role: faker.helpers.arrayElement(roles),
                        status: faker.helpers.arrayElement(statuses),
                        lastLogin: faker.date.recent(),
                        department: faker.helpers.arrayElement(departments),
                        salary: faker.number.int({ min: 50000, max: 150000 }),
                        businessUnit: faker.commerce.department(),
                        location: faker.location.city(),
                        manager: faker.person.fullName(),
                        costCenter: faker.finance.accountNumber(),
                        tenure: faker.number.int({ min: 1, max: 10 }),
                        performance: faker.helpers.arrayElement(['Exceeds', 'Meets', 'Needs Improvement']),
                        skillSet: faker.helpers.arrayElement(['React', 'Node', 'Python', 'Go', 'Rust']),
                        notes: faker.lorem.sentence()
                    });
                }
            }

            self.postMessage({
                type: 'complete',
                data: tableStore,
                requestId
            });
            // ...
        } else if (type === 'generateSchedulerEvents') {
            const { count: _count = 1000, resourceIds: providedResourceIds, forceRefresh } = e.data;
            const resourceIds = providedResourceIds || Array.from({ length: 10 }, (_, i) => `resource-${i}`);

            // Create a cache key based on resources
            const cacheKey = resourceIds.sort().join(',');

            if (!forceRefresh && schedulerStore.has(cacheKey)) {
                self.postMessage({
                    type: 'complete',
                    data: schedulerStore.get(cacheKey),
                    requestId
                });
                return;
            }

            // Deterministic seed unless forced refresh
            if (forceRefresh) faker.seed(Date.now());
            else faker.seed(456);

            const events: any[] = [];
            const colors = ['#3f83f8', '#0e9f6e', '#faca15', '#7e3af2', '#f05252', '#0694a2', '#84cc16', '#d946ef', '#ef4444', '#f97316'];

            const LUNCH_START_MINS = 12 * 60; // 12:00 PM
            const LUNCH_END_MINS = 12 * 60 + 30; // 12:30 PM

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Generate events for each resource separately to ensure no overlap
            resourceIds.forEach((resId: string) => {
                let currentDay = new Date(today.getTime());
                currentDay.setDate(today.getDate() - 15); // Start 15 days ago

                for (let dayOffset = 0; dayOffset <= 30; dayOffset++) {
                    const date = new Date(currentDay.getTime());
                    date.setDate(currentDay.getDate() + dayOffset);

                    // Only Mon-Fri (1-5)
                    const dayOfWeek = date.getDay();
                    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

                    // Add Lunch Break Block (12:00 - 12:30) for every resource on every day
                    const lunchStart = new Date(date.getTime());
                    lunchStart.setHours(12, 0, 0, 0);
                    const lunchEnd = new Date(date.getTime());
                    lunchEnd.setHours(12, 30, 0, 0);

                    events.push({
                        id: `block-lunch-${resId}-${dayOffset}`,
                        title: 'Lunch Break',
                        start: lunchStart,
                        end: lunchEnd,
                        resourceId: resId,
                        isBlock: true,
                        color: '#f8fafc' // Subtle color
                    });

                    // 1-3 events per day for this resource
                    const dailyCount = 1 + Math.floor(faker.number.float() * 3);
                    let lastEndTime = 8 * 60; // 8:00 AM in minutes

                    for (let j = 0; j < dailyCount; j++) {
                        // Random start after last end, but before 9 PM
                        const earliestStart = lastEndTime + 15; // 15 min gap
                        if (earliestStart > 21 * 60) break; // Too late

                        let startMinutes = earliestStart + Math.floor(faker.number.float() * 60);
                        if (startMinutes > 21 * 60) break;

                        let duration = 30 + Math.floor(faker.number.float() * 6) * 15; // 30-105 mins
                        let endMinutes = startMinutes + duration;

                        // Check for Lunch Overlap and adjust
                        if (startMinutes < LUNCH_END_MINS && endMinutes > LUNCH_START_MINS) {
                            startMinutes = LUNCH_END_MINS + 15; // Start 15 mins after lunch
                            endMinutes = startMinutes + duration;
                        }

                        if (endMinutes > 22 * 60) endMinutes = 22 * 60; // Hard cap 10 PM
                        if (startMinutes >= endMinutes) continue;

                        const start = new Date(date.getTime());
                        start.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);

                        const end = new Date(date.getTime());
                        end.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);

                        events.push({
                            id: `event-${resId}-${dayOffset}-${j}-${faker.string.alphanumeric(5)}`,
                            title: faker.company.buzzPhrase(),
                            start,
                            end,
                            resourceId: resId,
                            resourceIds: [resId],
                            color: faker.helpers.arrayElement(colors)
                        });

                        lastEndTime = endMinutes;
                    }
                }
            });

            // Update cache
            schedulerStore.set(cacheKey, events);

            self.postMessage({
                type: 'complete',
                data: events,
                requestId
            });
        } else if (type === 'generateTreeData') {
            const { depth = 3, childrenPerNode = 5 } = e.data;
            let nodeCount = 0;
            const maxNodes = 5000;

            const generateNode = (currentDepth: number): any => {
                nodeCount++;
                const isFolder = currentDepth < depth;
                const children: any[] = [];

                if (isFolder && nodeCount < maxNodes) {
                    const count = Math.floor(Math.random() * childrenPerNode) + 1;
                    for (let i = 0; i < count; i++) {
                        children.push(generateNode(currentDepth + 1));
                    }
                }

                return {
                    id: faker.string.uuid(),
                    label: isFolder ? faker.commerce.department() : faker.system.fileName(),
                    icon: isFolder ? '📁' : '📄',
                    isLoaded: true,
                    children: children.length > 0 ? children : undefined
                };
            };

            const rootNodes: any[] = [];
            while (nodeCount < maxNodes) {
                rootNodes.push(generateNode(0));
            }

            self.postMessage({
                type: 'complete',
                data: rootNodes,
                requestId
            });
        } else if (type === 'generateKanbanBoard') {
            const { cardsPerColumn = 5 } = e.data;
            const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'];
            const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
            const taskTitles = [
                'Implement user authentication', 'Design landing page', 'Fix navigation bug', 'Update documentation',
                'Optimize database queries', 'Add dark mode support', 'Create API endpoints', 'Write unit tests',
                'Refactor legacy code', 'Setup CI/CD pipeline', 'Improve error handling', 'Add search functionality',
                'Implement caching', 'Update dependencies', 'Fix responsive layout', 'Add analytics tracking',
                'Optimize images', 'Setup monitoring', 'Create user dashboard', 'Implement notifications'
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

            const generateAssignee = (index: number) => ({
                id: `user-${index}`,
                name: `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / firstNames.length) % lastNames.length]}`,
                avatarUrl: `https://i.pravatar.cc/150?img=${index % 70}`,
                role: 'assignee'
            });

            const generateCard = (index: number, columnId: string) => {
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + (index % 30));

                return {
                    id: `card-${columnId}-${index}`,
                    type: 'standard',
                    title: taskTitles[index % taskTitles.length],
                    description: `detailed description for task: ${taskTitles[index % taskTitles.length]}`,
                    columnId,
                    position: index * 1000,
                    priority: ['low', 'medium', 'high'][index % 3],
                    assignees: [generateAssignee(index % 10), ...(index % 3 === 0 ? [generateAssignee((index + 1) % 10)] : [])],
                    tags: [tags[index % tags.length], ...(index % 4 === 0 ? [tags[(index + 1) % tags.length]] : [])],
                    dueDate,
                    metadata: {},
                    createdBy: 'system',
                    createdAt: new Date(Date.now() - index * 86400000),
                    updatedBy: 'system',
                    updatedAt: new Date(),
                };
            };

            const columns = [
                { id: 'col-todo', name: 'To Do', color: '#94a3b8', position: 0 },
                { id: 'col-in-progress', name: 'In Progress', color: '#3b82f6', position: 1 },
                { id: 'col-review', name: 'Review', color: '#f59e0b', position: 2 },
                { id: 'col-done', name: 'Done', color: '#10b981', position: 3 },
            ];

            let cardIndex = 0;
            const cards: any[] = [];
            columns.forEach(col => {
                for (let i = 0; i < cardsPerColumn; i++) {
                    const card: any = generateCard(cardIndex++, col.id);
                    // Ensure dates are relatively recent/upcoming for timeline demo
                    const date = new Date();
                    date.setHours(9, 0, 0, 0);
                    date.setDate(date.getDate() + (cardIndex % 14) - 7); // +/- 7 days

                    const dueDate = new Date(date);
                    dueDate.setHours(17, 0, 0, 0);

                    card.startDate = date;
                    card.dueDate = dueDate;

                    cards.push(card);
                }
            });

            const swimlanes = [
                { id: 'swim-high', name: 'High Priority', field: 'priority', value: 'high' },
                { id: 'swim-medium', name: 'Medium Priority', field: 'priority', value: 'medium' },
                { id: 'swim-low', name: 'Low Priority', field: 'priority', value: 'low' },
            ];

            self.postMessage({
                type: 'complete',
                data: {
                    id: 'board-1',
                    name: 'Product Development Board',
                    description: 'Track all product development tasks and features',
                    columns,
                    cards,
                    swimlanes,
                    settings: { allowDragAndDrop: true, allowMultiSelect: true, enableWipLimits: false, defaultView: 'standard' },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                requestId
            });

        } else if (type === 'processTableData') {
            const { data, sorting, columnFilters, globalFilter, pagination, requestId } = e.data;

            let processedData = data ? [...data] : (tableStore ? [...tableStore] : []);

            // 1. Global Filter
            if (globalFilter) {
                const lowerFilter = String(globalFilter).toLowerCase();
                processedData = processedData.filter(row =>
                    Object.values(row).some(val =>
                        String(val).toLowerCase().includes(lowerFilter)
                    )
                );
            }

            // 2. Column Filters
            if (columnFilters && columnFilters.length > 0) {
                processedData = processedData.filter(row => {
                    return columnFilters.every((filter: any) => {
                        const cellValue = row[filter.id];
                        // Simple includes check for string, exact for others
                        return String(cellValue).toLowerCase().includes(String(filter.value).toLowerCase());
                    });
                });
            }

            // 3. Sorting
            if (sorting && sorting.length > 0) {
                const { id, desc } = sorting[0];
                processedData.sort((a, b) => {
                    const aVal = a[id];
                    const bVal = b[id];

                    if (aVal < bVal) return desc ? 1 : -1;
                    if (aVal > bVal) return desc ? -1 : 1;
                    return 0;
                });
            }

            // 4. Pagination
            const totalRows = processedData.length;
            if (pagination) {
                const { pageIndex, pageSize } = pagination;
                const start = pageIndex * pageSize;
                const end = start + pageSize;
                processedData = processedData.slice(start, end);
            }

            self.postMessage({
                type: 'complete',
                data: {
                    rows: processedData,
                    totalRows
                },
                requestId
            });

        } else if (type === 'addTableRecord') {
            const { payload, requestId } = e.data;

            // Generate new ID
            const maxId = tableStore && tableStore.length > 0
                ? Math.max(...tableStore.map(r => r.id))
                : 0;
            const newRecord = { ...payload, id: maxId + 1 };

            if (tableStore) {
                tableStore.unshift(newRecord); // Add to beginning
            } else {
                tableStore = [newRecord];
            }

            self.postMessage({
                type: 'complete',
                data: newRecord,
                requestId
            });

        } else if (type === 'updateTableRecord') {
            const { payload, requestId } = e.data;
            const { id, updates } = payload;

            let updatedRecord: MockTableData | null = null;
            if (tableStore) {
                const index = tableStore.findIndex(r => r.id === id);
                if (index !== -1) {
                    tableStore[index] = { ...tableStore[index], ...updates };
                    updatedRecord = tableStore[index];
                }
            }

            if (updatedRecord) {
                self.postMessage({
                    type: 'complete',
                    data: updatedRecord,
                    requestId
                });
            } else {
                self.postMessage({
                    type: 'error',
                    error: `Record with ID ${id} not found`,
                    requestId
                });
            }

        } else if (type === 'deleteTableRecords') {
            const { payload, requestId } = e.data;
            const { ids } = payload;

            if (tableStore) {
                tableStore = tableStore.filter(r => !ids.includes(r.id));
            }

            self.postMessage({
                type: 'complete',
                data: { success: true, count: ids.length },
                requestId
            });

        } else {
            throw new Error(`Unknown worker message type: ${type}`);
        }
    } catch (error) {
        self.postMessage({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            requestId
        });
    }
};
