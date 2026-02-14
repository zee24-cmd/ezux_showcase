
import React, { useState } from 'react';
import { cn, Tabs, TabsList, TabsTrigger, TabsContent, ScrollArea, globalServiceRegistry, I18nService } from 'ezux';
import { Check, Copy, Eye, CodeXml, BookOpen } from 'lucide-react';
import { DocTab } from './DocTab';
import docData from '../data/component-docs.json';

interface DemoWrapperProps {
    children: React.ReactNode;
    code?: string;
    title: string;
    description?: string;
    className?: string;
    componentName?: string;
}

export const DemoWrapper: React.FC<DemoWrapperProps> = ({ children, code, title, description, className, componentName }) => {
    const [copied, setCopied] = useState(false);
    const i18nService = globalServiceRegistry.getOrThrow<I18nService>('I18nService');
    const [_, setTick] = useState(0);

    React.useEffect(() => {
        const unsub = i18nService.subscribe(() => setTick(t => t + 1));
        return unsub;
    }, [i18nService]);

    const handleCopy = () => {
        if (!code) return;
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const hasDocs = componentName && docData[componentName as keyof typeof docData];

    return (
        <div className={cn("flex flex-col gap-6 h-full p-6", className)}>
            <div className="flex flex-col gap-2 shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                        {description && <p className="text-muted-foreground mt-1 max-w-2xl">{description}</p>}
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
                <Tabs defaultValue="preview" className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-4">
                        <TabsList className="grid w-auto inline-grid grid-cols-3">
                            <TabsTrigger value="preview" className="flex items-center gap-2">
                                <Eye className="w-4 h-4" /> {i18nService.t('tab_preview') || 'Preview'}
                            </TabsTrigger>
                            <TabsTrigger value="code" disabled={!code} className="flex items-center gap-2">
                                <CodeXml className="w-4 h-4" /> {i18nService.t('tab_code') || 'Code'}
                            </TabsTrigger>
                            <TabsTrigger value="doc" disabled={!hasDocs} className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" /> {i18nService.t('tab_docs') || 'Doc'}
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="preview" className="flex-1 min-h-0 border rounded-xl bg-card shadow-sm overflow-hidden mt-0 relative data-[state=inactive]:hidden">
                        <div className="h-full w-full overflow-hidden">
                            {children}
                        </div>
                    </TabsContent>

                    <TabsContent value="code" className="flex-1 min-h-0 border rounded-xl bg-slate-950 shadow-sm overflow-hidden mt-0 relative data-[state=inactive]:hidden">
                        <div className="absolute top-4 right-4 z-10 bg-slate-900/50 backdrop-blur-sm rounded-lg border border-white/5">
                            <button
                                onClick={handleCopy}
                                className="p-2 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                                title="Copy to clipboard"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                {copied && <span className="text-xs text-green-400 font-medium">Copied!</span>}
                            </button>
                        </div>
                        <ScrollArea className="h-full">
                            <div className="p-6">
                                <pre className="text-sm font-mono leading-relaxed tab-size-4 text-slate-50">
                                    <code>{code}</code>
                                </pre>
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="doc" className="flex-1 min-h-0 border rounded-xl bg-card shadow-sm overflow-hidden mt-0 relative data-[state=inactive]:hidden">
                        {hasDocs && (
                            <DocTab
                                componentName={componentName!}
                                docData={docData as any}
                                className="h-full"
                            />
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

