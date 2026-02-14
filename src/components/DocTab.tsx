import React, { useState, useMemo } from 'react';
import { cn, ScrollArea } from 'ezux';
import { ChevronRight, Component, Search } from 'lucide-react';
import { Input } from 'ezux';

interface MethodDoc {
    name: string;
    type: string;
    description: string;
    parameters?: Array<{
        name: string;
        type: string;
        description: string;
        isOptional: boolean;
    }>;
    returnType?: string;
}

interface ComponentDoc {
    name: string;
    description: string;
    properties: Array<{
        name: string;
        type: string;
        defaultValue?: string;
        description: string;
    }>;
    events: Array<{
        name: string;
        type: string;
        description: string;
    }>;
    methods: MethodDoc[];
    subcomponents: Array<{
        name: string;
        description: string;
    }>;
}

interface DocTabProps {
    componentName: string;
    docData: Record<string, ComponentDoc>;
    className?: string;
}

// Helper for inline styles (bold, code)
const processInline = (text: string, highlightText: string = ''): React.ReactNode => { // Return ReactNode array
    if (!text) return null;

    // First, split by bold and code markers
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

    return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            const content = part.substring(2, part.length - 2);
            return <strong key={idx} className="font-semibold text-foreground"><Highlight text={content} query={highlightText} /></strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            const content = part.substring(1, part.length - 1);
            return <code key={idx} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground"><Highlight text={content} query={highlightText} /></code>;
        }
        return <Highlight key={idx} text={part} query={highlightText} />;
    });
};

// Highlight Component
const Highlight = ({ text, query }: { text: string; query: string }) => {
    if (!query || !text) return <>{text}</>;

    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <span key={i} className="bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-100 rounded-[2px] px-0.5 font-medium">{part}</span>
                ) : (
                    part
                )
            )}
        </>
    );
};

// Simple Markdown Renderer (Modified to support highlight)
const SimpleMarkdown = ({ content, query = '' }: { content: string; query?: string }) => {
    if (!content) return null;

    // Split by newlines to handle blocks
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentKey = 0;

    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    // let language = ''; // Unused for now

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Code Blocks
        if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
                // End of block
                elements.push(
                    <div key={currentKey++} className="my-4 overflow-hidden rounded-md bg-muted p-4 font-mono text-sm">
                        <pre className="overflow-x-auto">
                            <code>{codeBlockContent.join('\n')}</code>
                        </pre>
                    </div>
                );
                inCodeBlock = false;
                codeBlockContent = [];
            } else {
                // Start of block
                inCodeBlock = true;
                // language = line.trim().substring(3);
            }
            continue;
        }

        if (inCodeBlock) {
            codeBlockContent.push(line);
            continue;
        }

        // Headings
        if (line.startsWith('# ')) {
            elements.push(<h1 key={currentKey++} className="mt-8 mb-4 text-3xl font-bold tracking-tight">{processInline(line.substring(2), query)}</h1>);
        } else if (line.startsWith('## ')) {
            elements.push(<h2 key={currentKey++} className="mt-6 mb-3 text-2xl font-semibold tracking-tight">{processInline(line.substring(3), query)}</h2>);
        } else if (line.startsWith('### ')) {
            elements.push(<h3 key={currentKey++} className="mt-4 mb-2 text-xl font-semibold tracking-tight">{processInline(line.substring(4), query)}</h3>);
        }
        // Lists
        else if (line.trim().startsWith('- ')) {
            const listItems = [line];
            // Look ahead for more list items
            while (i + 1 < lines.length && lines[i + 1].trim().startsWith('- ')) {
                listItems.push(lines[++i]);
            }
            elements.push(
                <ul key={currentKey++} className="my-3 list-disc pl-6 space-y-1">
                    {listItems.map((item, idx) => (
                        <li key={idx} className="text-muted-foreground">{processInline(item.trim().substring(2), query)}</li>
                    ))}
                </ul>
            );
        }
        // Images (Assuming removed, but keeping logic just in case or for future)
        // Regex for ![alt](src)
        else if (line.match(/!\[(.*?)\]\((.*?)\)/)) {
            // Skip rendering images as requested by user previously to remove "Visual Preview"
            // Or render them if they are not the Visual Preview one.
            // For now, simple markdown renderer is mostly used for descriptions which are text.
        }
        // Paragraphs
        else if (line.trim().length > 0) {
            elements.push(<p key={currentKey++} className="mb-3 text-muted-foreground leading-relaxed">{processInline(line, query)}</p>);
        }
    }

    return <div>{elements}</div>;
};

export const DocTab: React.FC<DocTabProps> = ({ componentName, docData, className }) => {
    // If we have subcomponents, we want a sidebar to switch between them.
    // The main component is always the first item.

    const mainDoc = docData[componentName];

    if (!mainDoc) {
        return <div className="p-6 text-muted-foreground">Documentation not found for {componentName}</div>;
    }

    const [selectedItemName, setSelectedItemName] = useState<string>(mainDoc.name);
    const [searchQuery, setSearchQuery] = useState('');

    const sidebarItems = [
        { name: mainDoc.name, label: mainDoc.name, type: 'main' },
    ];

    const showSidebar = sidebarItems.length > 1;

    const currentItem = sidebarItems.find(item => item.name === selectedItemName) || sidebarItems[0];

    // --- Filtering Logic ---
    const filterList = <T extends { name: string; description: string; type?: string; }>(list: T[]) => {
        if (!searchQuery) return list;
        const q = searchQuery.toLowerCase();
        return list.filter(item =>
            item.name.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q) ||
            item.type?.toLowerCase().includes(q)
        );
    };

    const filteredProperties = useMemo(() => filterList(mainDoc.properties), [mainDoc.properties, searchQuery]);
    const filteredEvents = useMemo(() => filterList(mainDoc.events), [mainDoc.events, searchQuery]);
    const filteredMethods = useMemo(() => {
        if (!searchQuery) return mainDoc.methods;
        const q = searchQuery.toLowerCase();
        return mainDoc.methods.filter(m =>
            m.name.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q) ||
            m.returnType?.toLowerCase().includes(q) ||
            m.parameters?.some(p => p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q))
        );
    }, [mainDoc.methods, searchQuery]);

    const renderProperties = (props: typeof mainDoc.properties) => {
        if (!props || props.length === 0) {
            if (searchQuery) return <div className="text-muted-foreground italic text-sm">No properties match "{searchQuery}".</div>;
            return <div className="text-muted-foreground italic text-sm">No properties documented.</div>;
        }
        return (
            <div className="overflow-hidden rounded-md border">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Default</th>
                            <th className="p-3 w-1/2">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {props.map(prop => (
                            <tr key={prop.name} className="hover:bg-muted/5">
                                <td className="p-3 font-mono text-primary"><Highlight text={prop.name} query={searchQuery} /></td>
                                <td className="p-3 font-mono text-xs text-blue-500"><Highlight text={prop.type} query={searchQuery} /></td>
                                <td className="p-3 font-mono text-xs text-muted-foreground">{prop.defaultValue || '-'}</td>
                                <td className="p-3 text-muted-foreground"><Highlight text={prop.description} query={searchQuery} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderMethods = (methods: MethodDoc[]) => {
        if (!methods || methods.length === 0) {
            if (searchQuery) return <div className="text-muted-foreground italic text-sm">No methods match "{searchQuery}".</div>;
            return <div className="text-muted-foreground italic text-sm">No methods documented.</div>;
        }
        return (
            <div className="overflow-hidden rounded-md border">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                        <tr>
                            <th className="p-3 w-1/4">Name / Return</th>
                            <th className="p-3 w-1/3">Parameters</th>
                            <th className="p-3">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {methods.map(method => (
                            <tr key={method.name} className="hover:bg-muted/5">
                                <td className="p-3 align-top">
                                    <div className="font-mono text-primary font-semibold"><Highlight text={method.name} query={searchQuery} /></div>
                                    <div className="text-xs text-muted-foreground mt-1 font-mono">
                                        <span className="text-blue-500">→ <Highlight text={method.returnType || 'void'} query={searchQuery} /></span>
                                    </div>
                                </td>
                                <td className="p-3 align-top font-mono text-xs">
                                    {method.parameters && method.parameters.length > 0 ? (
                                        <div className="space-y-1">
                                            {method.parameters.map((param: any) => (
                                                <div key={param.name} className="flex flex-col gap-0.5">
                                                    <div>
                                                        <span className="text-foreground"><Highlight text={param.name} query={searchQuery} /></span>
                                                        {param.isOptional && <span className="text-muted-foreground opacity-70">?</span>}
                                                        <span className="text-muted-foreground">: </span>
                                                        <span className="text-blue-500"><Highlight text={param.type} query={searchQuery} /></span>
                                                    </div>
                                                    {param.description && <span className="text-muted-foreground text-[10px] italic"><Highlight text={param.description} query={searchQuery} /></span>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground opacity-50">()</span>
                                    )}
                                </td>
                                <td className="p-3 align-top text-muted-foreground">
                                    <Highlight text={method.description} query={searchQuery} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderEvents = (events: typeof mainDoc.events) => {
        if (!events || events.length === 0) {
            if (searchQuery) return <div className="text-muted-foreground italic text-sm">No events match "{searchQuery}".</div>;
            return <div className="text-muted-foreground italic text-sm">No events documented.</div>;
        }
        return (
            <div className="overflow-hidden rounded-md border">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Signature</th>
                            <th className="p-3 w-1/2">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {events.map(evt => (
                            <tr key={evt.name} className="hover:bg-muted/5">
                                <td className="p-3 font-mono text-primary"><Highlight text={evt.name} query={searchQuery} /></td>
                                <td className="p-3 font-mono text-xs text-blue-500"><Highlight text={evt.type} query={searchQuery} /></td>
                                <td className="p-3 text-muted-foreground"><Highlight text={evt.description} query={searchQuery} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // Determine what to show based on selection
    let content;
    if (currentItem.type === 'main') {
        const hasSearchResults =
            filteredProperties.length > 0 ||
            filteredEvents.length > 0 ||
            filteredMethods.length > 0 ||
            mainDoc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mainDoc.description.toLowerCase().includes(searchQuery.toLowerCase());

        content = (
            <div className="flex flex-col gap-8 pb-10">
                {/* Search Header */}
                <div className="sticky top-0 z-20 bg-background/95 backdrop-blur pb-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="doc-filter"
                            name="doc-filter"
                            placeholder="Filter properties, methods, and events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-muted/30"
                        />
                    </div>
                </div>

                {!hasSearchResults && searchQuery ? (
                    <div className="text-center py-10 text-muted-foreground">
                        No results found for "<span className="font-medium text-foreground">{searchQuery}</span>"
                    </div>
                ) : (
                    <>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight mb-4 flex items-center gap-2">
                                <Highlight text={mainDoc.name} query={searchQuery} />
                            </h2>
                            <SimpleMarkdown content={mainDoc.description} query={searchQuery} />
                        </div>

                        {/* Properties */}
                        {(filteredProperties.length > 0 || !searchQuery) && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">Properties</h3>
                                {renderProperties(filteredProperties)}
                            </div>
                        )}

                        {/* Events */}
                        {(filteredEvents.length > 0 || !searchQuery) && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">Events</h3>
                                {renderEvents(filteredEvents)}
                            </div>
                        )}

                        {/* Methods */}
                        {(filteredMethods.length > 0 || !searchQuery) && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">Methods</h3>
                                {renderMethods(filteredMethods)}
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    } else {
        // Subcomponent
        const subInfo = mainDoc.subcomponents.find(s => s.name === currentItem.name);
        content = (
            <div className="flex flex-col gap-8 pb-10">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2">{mainDoc.name}.{subInfo?.name}</h2>
                    <p className="text-muted-foreground leading-relaxed">{subInfo?.description || 'No description available.'}</p>
                </div>

                <div className="p-4 border rounded-lg bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                    Detailed detailed properties for subcomponents are not yet extracted by the documentation generator.
                </div>
            </div>
        );
    }

    return (
        <div className={cn("flex h-full", className)}>
            {/* Sidebar */}
            {showSidebar && (
                <div className="w-64 border-r bg-muted/10 flex flex-col shrink-0">
                    <div className="p-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                        Components
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="flex flex-col p-2 gap-1">
                            {sidebarItems.map(item => (
                                <button
                                    key={item.name}
                                    onClick={() => setSelectedItemName(item.name)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors",
                                        selectedItemName === item.name
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Component className="w-4 h-4 opacity-70" />
                                    <span className="truncate">{item.label}</span>
                                    {selectedItemName === item.name && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 h-full overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="p-8 max-w-5xl mx-auto">
                        {content}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};
