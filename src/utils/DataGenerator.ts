// Define the shape of our Table Data
export interface MockTableData {
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
}

// Define Tree View Node
export interface MockTreeNode {
    id: string;
    name: string;
    children?: MockTreeNode[];
    metadata?: any;
    isFolder?: boolean;
}

// Define Scheduler Event
export interface MockSchedulerEvent {
    id: string;
    resourceId: string;
    title: string;
    start: Date;
    end: Date;
    type: 'meeting' | 'task' | 'holiday';
    color?: string;
}

/**
 * DataGenerator - Async data generation using dynamic imports
 * 
 * Performance optimization: @faker-js/faker is 1.5MB and only needed for demos.
 * By using dynamic imports, we keep it out of the main bundle and load it only when needed.
 */
export class DataGenerator {
    private static fakerCache: typeof import('@faker-js/faker').faker | null = null;

    /**
     * Get faker instance with caching
     * First call loads the library, subsequent calls use cached instance
     */
    private static async getFaker() {
        if (!this.fakerCache) {
            const { faker } = await import('@faker-js/faker');
            this.fakerCache = faker;
        }
        return this.fakerCache;
    }

    /**
     * Generate mock table data
     * @param count Number of records to generate
     * @param onProgress Optional progress callback (0-1)
     */
    static async generateTableData(
        count: number = 10000,
        onProgress?: (progress: number) => void
    ): Promise<MockTableData[]> {
        const faker = await this.getFaker();
        const data: MockTableData[] = [];

        for (let i = 0; i < count; i++) {
            data.push({
                id: i,
                name: faker.person.fullName(),
                email: faker.internet.email(),
                role: faker.person.jobTitle(),
                status: faker.helpers.arrayElement(['Active', 'Inactive', 'Pending']),
                lastLogin: faker.date.recent(),
                department: faker.commerce.department(),
                salary: parseFloat(faker.finance.amount({ min: 30000, max: 150000, dec: 2 })),
                businessUnit: faker.helpers.arrayElement(['Engineering', 'Sales', 'Marketing', 'HR', 'Finance']),
                location: faker.location.city(),
                manager: faker.person.fullName(),
                costCenter: `CC-${faker.string.numeric(4)}`,
                tenure: faker.number.int({ min: 1, max: 20 }),
                performance: faker.helpers.arrayElement(['Exceeds', 'Meets', 'Needs Improvement']),
                skillSet: faker.helpers.arrayElement(['React', 'Node.js', 'Python', 'Java', 'Go']),
                notes: i % 5 === 0 ? faker.lorem.paragraph(2) : faker.lorem.sentence()
            });

            // Add custom fields
            for (let j = 0; j < 15; j++) {
                const type = j % 3; // 0: number, 1: date, 2: string
                if (type === 0) {
                    data[i][`customField_${j}`] = faker.number.int({ min: 1, max: 1000 });
                } else if (type === 1) {
                    data[i][`customField_${j}`] = faker.date.past();
                } else {
                    data[i][`customField_${j}`] = faker.word.sample();
                }
            }

            // Report progress every 1000 rows
            if (onProgress && i % 1000 === 0) {
                onProgress(i / count);
            }
        }

        if (onProgress) onProgress(1);
        return data;
    }

    /**
     * Generate mock tree data
     * @param depth Maximum tree depth
     * @param childrenPerNode Average children per node
     */
    static async generateTreeData(depth: number = 3, childrenPerNode: number = 5): Promise<MockTreeNode[]> {
        const faker = await this.getFaker();
        let nodeCount = 0;
        const maxNodes = 10000;

        const generateNode = (currentDepth: number): MockTreeNode => {
            nodeCount++;
            const isFolder = currentDepth < depth;
            const children: MockTreeNode[] = [];

            if (isFolder && nodeCount < maxNodes) {
                const count = Math.floor(Math.random() * childrenPerNode) + 1;
                for (let i = 0; i < count; i++) {
                    children.push(generateNode(currentDepth + 1));
                }
            }

            return {
                id: faker.string.uuid(),
                name: isFolder ? faker.commerce.department() : faker.system.fileName(),
                isFolder: isFolder,
                children: children.length > 0 ? children : undefined
            };
        };

        const rootNodes: MockTreeNode[] = [];
        while (nodeCount < maxNodes) {
            rootNodes.push(generateNode(0));
        }
        return rootNodes;
    }

    /**
     * Generate mock scheduler events
     * @param count Number of events to generate
     */
    static async generateSchedulerEvents(count: number = 5000): Promise<MockSchedulerEvent[]> {
        const faker = await this.getFaker();
        const events: MockSchedulerEvent[] = [];
        const types = ['meeting', 'task', 'holiday'] as const;
        const colors = { meeting: '#3b82f6', task: '#10b981', holiday: '#f59e0b', blocked: '#ef4444' };

        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 14); // 2 weeks back

        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 14); // 2 weeks future

        const maxEvents = Math.min(count, 5000);

        // Pre-defined resources (20)
        const resourceIds = Array.from({ length: 20 }, (_, i) => `res-${i}`);

        // Helper to add minutes
        const addMinutes = (date: Date, mins: number) => new Date(date.getTime() + mins * 60000);

        let iterDate = new Date(startDate);
        let eventsGenerated = 0;

        // Iterate through days until we hit end date OR max events
        while (iterDate <= endDate && eventsGenerated < maxEvents) {

            // Skip weekends
            const dayOfWeek = iterDate.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                iterDate.setDate(iterDate.getDate() + 1);
                continue;
            }

            // Shuffle resources so we don't always fill res-0 first
            const dailyResources = faker.helpers.shuffle([...resourceIds]);

            for (const resId of dailyResources) {
                if (eventsGenerated >= maxEvents) break;

                // Daily Schedule: 8am/9am to 5pm/6pm
                const startHour = 8 + Math.floor(Math.random() * 2); // 8 or 9
                let currentTime = new Date(iterDate);
                currentTime.setHours(startHour, 0, 0, 0);

                const endHour = 17 + Math.floor(Math.random() * 2); // 17 or 18 (5pm or 6pm)
                const endTime = new Date(iterDate);
                endTime.setHours(endHour, 0, 0, 0);

                while (currentTime < endTime && eventsGenerated < maxEvents) {
                    const roll = Math.random();

                    // 1. GAP (20% chance)
                    if (roll < 0.2) {
                        // Advance time by 15-60 mins
                        const gap = 15 + Math.floor(Math.random() * 4) * 15;
                        currentTime = addMinutes(currentTime, gap);
                        continue;
                    }

                    // 2. OVERLAP (5% chance) -> Rare
                    if (roll < 0.25) {
                        const overlapStart = addMinutes(currentTime, -15); // Start 15m ago
                        if (overlapStart >= new Date(iterDate.setHours(startHour, 0, 0, 0))) {
                            const duration = 30 + Math.floor(Math.random() * 2) * 15; // 30-45m
                            const overlapEnd = addMinutes(overlapStart, duration);

                            events.push({
                                id: faker.string.uuid(),
                                resourceId: resId,
                                title: `Sync (${faker.hacker.verb()})`,
                                start: overlapStart,
                                end: overlapEnd,
                                type: 'meeting',
                                color: colors.meeting
                            });
                            eventsGenerated++;
                        }
                    }

                    // 3. BLOCKED / UNAVAILABLE (5% chance)
                    if (roll < 0.3) {
                        const duration = 60 + Math.floor(Math.random() * 4) * 15; // 1-2 hours
                        const blockEnd = addMinutes(currentTime, duration);

                        events.push({
                            id: faker.string.uuid(),
                            resourceId: resId,
                            title: 'Unavailable',
                            start: currentTime,
                            end: blockEnd,
                            type: 'holiday',
                            color: colors.blocked
                        });
                        eventsGenerated++;
                        currentTime = blockEnd;
                        currentTime = addMinutes(currentTime, 15);
                        continue;
                    }

                    // 4. STANDARD EVENT (Remaining 70%)
                    const duration = 15 + Math.floor(Math.random() * 6) * 15; // 15m to 90m (avg)
                    const eventEnd = addMinutes(currentTime, duration);

                    if (eventEnd > endTime) break;

                    const type = faker.helpers.arrayElement(types);
                    // Don't create too many 'holidays' in standard flow if using holiday type
                    const finalType = type === 'holiday' ? 'task' : type;

                    events.push({
                        id: faker.string.uuid(),
                        resourceId: resId,
                        title: faker.company.buzzPhrase(),
                        start: currentTime,
                        end: eventEnd,
                        type: finalType,
                        color: colors[finalType]
                    });
                    eventsGenerated++;
                    currentTime = eventEnd;

                    // Small gap after event (50% chance)
                    if (Math.random() > 0.5) {
                        currentTime = addMinutes(currentTime, 15);
                    }
                }
            }

            // Next day
            iterDate.setDate(iterDate.getDate() + 1);
        }

        return events;
    }
}
