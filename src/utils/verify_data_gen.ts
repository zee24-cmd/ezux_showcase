import { DataGenerator, MockSchedulerEvent } from './DataGenerator';

const events = await DataGenerator.generateSchedulerEvents(5000);

console.log(`Total events generated: ${events.length}`);

if (events.length === 0) {
    console.error('No events generated!');
    process.exit(1);
}

// 1. Date Range Check
const minDate = new Date('2025-12-01T00:00:00');
const maxDate = new Date('2026-05-31T23:59:59');
const actualMin = events.reduce((min, e: MockSchedulerEvent) => e.start < min ? e.start : min, events[0].start);
const actualMax = events.reduce((max, e: MockSchedulerEvent) => e.end > max ? e.end : max, events[0].end);

console.log(`Date Range Expected: ${minDate.toISOString()} - ${maxDate.toISOString()}`);
console.log(`Date Range Actual:   ${actualMin.toISOString()} - ${actualMax.toISOString()}`);

if (actualMin < minDate || actualMax > maxDate) {
    console.error('FAILED: Events outside valid date range!');
} else {
    console.log('PASSED: Date range valid.');
}

// 2. Weekend Check
const weekendEvents = events.filter((e: MockSchedulerEvent) => {
    const day = e.start.getDay();
    // 0 is Sunday, 6 is Saturday
    return day === 0 || day === 6;
});

if (weekendEvents.length > 0) {
    console.error(`FAILED: Found ${weekendEvents.length} events on weekends!`);
    // Sample
    console.log('Sample weekend event:', weekendEvents[0].start.toISOString());
} else {
    console.log('PASSED: No weekend events.');
}

// 3. Time Slot Check (15 min)
const invalidSlots = events.filter((e: MockSchedulerEvent) => {
    return e.start.getMinutes() % 15 !== 0;
});

if (invalidSlots.length > 0) {
    console.error(`FAILED: Found ${invalidSlots.length} events not starting on 15m intervals!`);
} else {
    console.log('PASSED: All events start on 15m intervals.');
}

// 4. Concurrency Check (Realistic Data)
// We want to ensure that for any resource, overlaps are rare.
const resourceMap = new Map<string, MockSchedulerEvent[]>();
events.forEach((e: MockSchedulerEvent) => {
    if (!resourceMap.has(e.resourceId)) resourceMap.set(e.resourceId, []);
    resourceMap.get(e.resourceId)?.push(e);
});

let totalOverlaps = 0;
let totalChecks = 0;

resourceMap.forEach((resEvents, _resId) => {
    // Sort by start time
    resEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

    for (let i = 0; i < resEvents.length - 1; i++) {
        totalChecks++;
        const current = resEvents[i];
        const next = resEvents[i + 1];

        if (next.start < current.end) {
            totalOverlaps++;
        }
    }
});

const overlapRate = totalOverlaps / totalChecks;
console.log(`Overlap Rate: ${(overlapRate * 100).toFixed(2)}% (${totalOverlaps}/${totalChecks})`);

if (overlapRate > 0.15) { // Allow up to 15% overlap just in case, but aim for low
    console.error('FAILED: Realism check - Too many overlaps!');
} else {
    console.log('PASSED: Concurrency is low (Realistic).');
}

// 5. Blocked Event Check (Optional validation)
const blockedEvents = events.filter((e: MockSchedulerEvent) => e.type === 'holiday' || (e as any).title === 'Unavailable'); // Assuming logic
console.log(`Blocked/Unavailable events: ${blockedEvents.length}`);
