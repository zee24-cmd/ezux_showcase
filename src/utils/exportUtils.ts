
import { saveAs } from 'file-saver';
import { Table } from '@tanstack/react-table';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { format } from 'date-fns';

// --- Excel Export (Removed due to security vulnerabilities) ---
// Excel export has been disabled. Use CSV export instead.

// --- CSV Export (Manual - No Dependencies) ---
export const exportToCsv = <T extends Record<string, any>>(data: T[], fileName: string = 'export.csv') => {
    if (!data || data.length === 0) return;

    // Get headers from the first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvRows: string[] = [];

    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header];
            const escaped = ('' + (val ?? '')).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const dataBlob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
    saveAs(dataBlob, fileName);
};

// --- Table PDF Export (Simple) ---
export const exportTableToPdf = async <TData>(table: Table<TData>, fileName: string = 'table-export.pdf') => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const rows = table.getRowModel().rows.map(row => row.original);
    // Rough rendering for demo purposes
    page.drawText('Table Export', { x: 50, y: height - 50, size: 20, font });

    let y = height - 80;
    rows.forEach((row: any) => {
        if (y < 50) return; // Basic pagination skip for demo
        const text = JSON.stringify(row); // Very basic
        page.drawText(text.substring(0, 80) + '...', { x: 50, y, size: 10, font });
        y -= 20;
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    saveAs(blob, fileName);
};

// --- ICS Export (Scheduler) ---
export const exportToIcs = (events: any[], fileName: string = 'calendar.ics') => {
    if (!events || events.length === 0) return;

    let icsContent =
        `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EzScheduler//NONSGML v1.0//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

    events.forEach(event => {
        const start = format(new Date(event.start), "yyyyMMdd'T'HHmmss");
        const end = format(new Date(event.end), "yyyyMMdd'T'HHmmss");

        icsContent += `BEGIN:VEVENT
UID:${event.id}
DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss")}
DTSTART:${start}
DTEND:${end}
SUMMARY:${event.title || 'No Title'}
DESCRIPTION:${event.description || ''}
END:VEVENT
`;
    });

    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    saveAs(blob, fileName);
};
