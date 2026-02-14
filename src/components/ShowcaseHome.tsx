import { useNavigate, Link } from '@tanstack/react-router';
import {
    Layout,
    Table,
    Calendar,
    GitBranch,
    PenTool,
    ArrowRight,
    Sparkles,
    Zap,
    Box,
    Palette,
    CheckCircle2,
    Clock,
    Filter,
    Download,
    Maximize2,
    List,
    CalendarDays,
    Users,
    FolderTree,
    FileSignature,
    Layers2,
    Languages,
    Trello,
} from 'lucide-react';
import { AnimatedText, globalServiceRegistry, I18nService, cn } from 'ezux';
import React, { useState, useEffect } from 'react';

// CSS Animations
export const AnimationStyles = () => (
    <style>{`
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(10px, -15px) rotate(2deg); }
            66% { transform: translate(-10px, 10px) rotate(-2deg); }
        }
        @keyframes blob-bounce {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes pulse-glow {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fadeIn 1s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-blob { animation: blob-bounce 25s infinite alternate ease-in-out; }
        
        .strength-card { 
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            overflow: hidden;
            opacity: 0;
        }
        .strength-card::after {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 50% 50%, oklch(var(--primary) / 0.1), transparent 80%);
            opacity: 0;
            transition: opacity 0.3s;
        }
        .strength-card:hover { 
            transform: translateY(-8px) scale(1.02); 
            box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.1);
            border-color: oklch(var(--primary) / 0.3);
        }
        .strength-card:hover::after { opacity: 1; }
        
        .icon-container { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .strength-card:hover .icon-container { transform: scale(1.1) rotate(10deg); }
        
        .btn-primary { 
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); 
            position: relative;
            overflow: hidden;
        }
        .btn-primary:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 12px 24px -10px oklch(var(--primary) / 0.5); 
            filter: brightness(1.1);
        }
        .btn-primary:active { transform: translateY(0); }
        
        .btn-secondary { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        .btn-secondary:hover { background-color: oklch(var(--muted)); transform: translateY(-1px); }
        
        .glass-panel {
            background: oklch(var(--background) / 0.7);
            backdrop-filter: blur(20px);
            border: 1px solid oklch(var(--border) / 0.5);
        }

        .bg-grid-pattern { 
            background-image: linear-gradient(to right, oklch(var(--border) / 0.3) 1px, transparent 1px), linear-gradient(to bottom, oklch(var(--border) / 0.3) 1px, transparent 1px); 
            background-size: 40px 40px; 
        }
        .dark .bg-grid-pattern { 
            background-image: linear-gradient(to right, oklch(var(--border) / 0.15) 1px, transparent 1px), linear-gradient(to bottom, oklch(var(--border) / 0.15) 1px, transparent 1px); 
        }
    `}</style>
);

// Component Strength Card
interface StrengthCardProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    iconColor: string;
    delay?: string;
}

const StrengthCard: React.FC<StrengthCardProps> = ({ icon: Icon, title, description, delay = '0s', iconColor }) => (
    <div
        className="strength-card bg-card rounded-xl p-5 border border-border/60"
        style={{ animation: `fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards` }}
    >
        <div className={`icon-container w-10 h-10 rounded-lg ${iconColor} flex items-center justify-center mb-3`}>
            <Icon className="w-5 h-5 text-white" />
        </div>
        <h4 className="font-semibold text-foreground mb-1.5 text-sm">{title}</h4>
        <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
    </div>
);

// Component Section
interface ComponentSectionProps {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    strengths: StrengthCardProps[];
    colorScheme: string;
    delay: number;
    to?: string;
}

const ComponentSection: React.FC<ComponentSectionProps> = ({ icon: Icon, title, description, strengths, colorScheme, delay, to }) => {
    const i18nService = globalServiceRegistry.getOrThrow<I18nService>('I18nService');
    return (
        <section id={title.toLowerCase().replace('ez', '')} className="py-12 border-b border-border/50 last:border-none">
            <div className="flex flex-col lg:flex-row gap-8 animate-fade-in-up" style={{ animationDelay: `${delay * 0.1}s` }}>
                <div className="lg:w-72 shrink-0">
                    <div className="sticky top-8">
                        <div className={`w-14 h-14 rounded-2xl ${colorScheme} flex items-center justify-center mb-4 icon-container shadow-lg`}>
                            <Icon className="w-7 h-7 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
                        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                        {to && (
                            <Link
                                to={to}
                                className="inline-flex btn-primary mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium items-center gap-2"
                            >
                                {i18nService.t('view_demo')}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {strengths.map((strength: StrengthCardProps, index: number) => (
                        <StrengthCard
                            key={`${strength.title}-${index}`}
                            {...strength}
                            delay={(delay * 0.2 + index * 0.1).toString()}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

// Hero Section
interface HeroSectionProps {
    onExploreClick?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick }) => {
    const navigate = useNavigate();
    const i18nService = globalServiceRegistry.getOrThrow<I18nService>('I18nService');
    const [_, setTick] = useState(0);

    useEffect(() => {
        const unsub = i18nService.subscribe(() => setTick(t => t + 1));
        return () => { unsub(); };
    }, [i18nService]);

    return (
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-grid-pattern">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20 pointer-events-none" />

            {/* Dynamic Background Blobs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-blob" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-blob" style={{ animationDelay: '-5s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
                    <Sparkles className="w-4 h-4" />
                    <span>{i18nService.t('hero_badge')}</span>
                </div>

                <AnimatedText
                    text={i18nService.t('hero_title')}
                    highlight="ezUX"
                    delay="0.1s"
                    className="mb-6"
                    textSize={['fr', 'ar'].includes(i18nService.locale) ? "text-3xl md:text-4xl lg:text-5xl" : undefined}
                    highlightDir={i18nService.locale === 'ar' ? 'ltr' : undefined}
                />

                <p className="animate-fade-in-up text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10" style={{ animationDelay: '0.2s' }}>
                    {i18nService.t('hero_subtitle')}
                </p>

                <div className="animate-fade-in-up flex flex-col sm:flex-row items-center justify-center gap-4 mb-16" style={{ animationDelay: '0.3s' }}>
                    <button
                        onClick={() => navigate({ to: '/docs/ez-layout' })}
                        className="btn-primary px-8 py-4 bg-primary text-primary-foreground rounded-xl text-lg font-semibold flex items-center gap-2 shadow-lg shadow-primary/25"
                    >
                        {i18nService.t('get_started')}
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </button>
                    <button
                        onClick={onExploreClick}
                        className="btn-secondary px-8 py-4 bg-card text-foreground rounded-xl text-lg font-semibold border border-border flex items-center gap-2"
                    >
                        <Layers2 className="w-5 h-5" />
                        {i18nService.t('explore_components')}
                    </button>
                </div>

                <div className="animate-fade-in-up grid grid-cols-3 gap-8 max-w-2xl mx-auto" style={{ animationDelay: '0.4s' }}>
                    <div className="text-center">
                        <div className="text-4xl font-black text-foreground mb-1">5+</div>
                        <div className="text-sm text-muted-foreground">{i18nService.t('components_stat')}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-black text-foreground mb-1">100%</div>
                        <div className="text-sm text-muted-foreground">{i18nService.t('type_safe_stat')}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-black text-foreground mb-1">A11y</div>
                        <div className="text-sm text-muted-foreground">{i18nService.t('a11y_stat')}</div>
                    </div>
                </div>

                <div className="mt-20 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <div className="inline-block p-[2px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-rose-500 shadow-2xl shadow-primary/20 animate-pulse-glow">
                        <div className="bg-card rounded-[14px] px-10 py-5 flex items-center gap-5 border border-white/10">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shrink-0">
                                <Zap className="w-6 h-6 text-white animate-bounce-subtle" />
                            </div>
                            <div className="text-left leading-tight">
                                <p className="text-foreground/90 font-medium text-lg tracking-tight inline">
                                    {i18nService.t('built_with_prefix')}
                                </p>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600 dark:from-blue-400 dark:via-purple-400 dark:to-rose-400 font-black text-xl tracking-tight inline-block mx-1">
                                    {i18nService.t('built_with_ezlayout_name')}
                                </span>
                                <p className="text-foreground/90 font-medium text-lg tracking-tight inline">
                                    {i18nService.t('built_with_suffix')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Main Home Page Component
export const ShowcaseHome = ({ showOnlyContent = false }: { showOnlyContent?: boolean }) => {
    const navigate = useNavigate();
    const i18nService = globalServiceRegistry.getOrThrow<I18nService>('I18nService');
    const [_, setTick] = useState(0);

    useEffect(() => {
        const unsub = i18nService.subscribe(() => setTick(t => t + 1));
        return () => { unsub(); };
    }, [i18nService]);

    const scrollToComponents = () => {
        const element = document.getElementById('explore-components-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const components = [
        {
            id: 'layout',
            icon: Layout,
            title: i18nService.t('layout_title'),
            description: i18nService.t('layout_desc'),
            colorScheme: 'bg-gradient-to-br from-blue-500 to-blue-600',
            strengths: [
                { icon: Maximize2, title: i18nService.t('strength_responsive_title'), description: i18nService.t('strength_responsive_desc'), iconColor: 'bg-blue-500' },
                { icon: Languages, title: i18nService.t('strength_dnd_title'), description: i18nService.t('strength_dnd_desc'), iconColor: 'bg-blue-600' },
                { icon: Palette, title: i18nService.t('strength_theming_title'), description: i18nService.t('strength_theming_desc'), iconColor: 'bg-blue-400' }
            ]
        },
        {
            id: 'table',
            icon: Table,
            title: i18nService.t('table_title'),
            description: i18nService.t('table_desc'),
            to: '/table/basic-table',
            colorScheme: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
            strengths: [
                { icon: Clock, title: i18nService.t('strength_virtual_title'), description: i18nService.t('strength_virtual_desc'), iconColor: 'bg-emerald-500' },
                { icon: Filter, title: i18nService.t('strength_filtering_title'), description: i18nService.t('strength_filtering_desc'), iconColor: 'bg-emerald-600' },
                { icon: Download, title: i18nService.t('strength_export_title'), description: i18nService.t('strength_export_desc'), iconColor: 'bg-emerald-400' }
            ]
        },
        {
            id: 'scheduler',
            icon: Calendar,
            title: i18nService.t('scheduler_title'),
            description: i18nService.t('scheduler_desc'),
            to: '/scheduler/views',
            colorScheme: 'bg-gradient-to-br from-violet-500 to-violet-600',
            strengths: [
                { icon: CalendarDays, title: i18nService.t('strength_views_title'), description: i18nService.t('strength_views_desc'), iconColor: 'bg-violet-500' },
                { icon: Users, title: i18nService.t('strength_resource_title'), description: i18nService.t('strength_resource_desc'), iconColor: 'bg-violet-600' },
                { icon: Clock, title: i18nService.t('strength_dnd_title'), description: i18nService.t('strength_dnd_desc'), iconColor: 'bg-violet-400' }
            ]
        },
        {
            id: 'kanban',
            icon: Trello,
            title: i18nService.t('kanban_title'),
            description: i18nService.t('kanban_desc'),
            to: '/kanban/basic',
            colorScheme: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
            strengths: [
                { icon: Layers2, title: i18nService.t('nav_swimlanes'), description: i18nService.t('strength_kanban_swimlanes_desc'), iconColor: 'bg-cyan-500' },
                { icon: Calendar, title: i18nService.t('nav_timeline_view'), description: i18nService.t('strength_kanban_timeline_desc'), iconColor: 'bg-cyan-600' },
                { icon: Palette, title: i18nService.t('nav_custom_renderers'), description: i18nService.t('strength_kanban_custom_desc'), iconColor: 'bg-cyan-400' }
            ]
        },
        {
            id: 'treeview',
            icon: GitBranch,
            title: i18nService.t('tree_title'),
            description: i18nService.t('tree_desc'),
            to: '/tree',
            colorScheme: 'bg-gradient-to-br from-amber-500 to-amber-600',
            strengths: [
                { icon: FolderTree, title: i18nService.t('strength_hierarchy_title'), description: i18nService.t('strength_hierarchy_desc'), iconColor: 'bg-amber-500' },
                { icon: CheckCircle2, title: i18nService.t('strength_checkbox_title'), description: i18nService.t('strength_checkbox_desc'), iconColor: 'bg-amber-600' },
                { icon: List, title: i18nService.t('strength_templates_title'), description: i18nService.t('strength_templates_desc'), iconColor: 'bg-amber-400' }
            ]
        },
        {
            id: 'signature',
            icon: PenTool,
            title: i18nService.t('signature_title'),
            description: i18nService.t('signature_desc'),
            to: '/signature',
            colorScheme: 'bg-gradient-to-br from-rose-500 to-rose-600',
            strengths: [
                { icon: FileSignature, title: i18nService.t('strength_writing_title'), description: i18nService.t('strength_writing_desc'), iconColor: 'bg-rose-500' },
                { icon: Download, title: i18nService.t('strength_formats_title'), description: i18nService.t('strength_formats_desc'), iconColor: 'bg-rose-600' },
                { icon: Clock, title: i18nService.t('strength_history_title'), description: i18nService.t('strength_history_desc'), iconColor: 'bg-rose-400' }
            ]
        }
    ];

    return (
        <div className="min-h-full bg-background overflow-x-hidden">
            <AnimationStyles />

            {!showOnlyContent && <HeroSection onExploreClick={scrollToComponents} />}

            <div id="explore-components-section" className={cn("max-w-7xl mx-auto px-6", showOnlyContent ? "py-10" : "py-24")}>
                <div className="text-center mb-20 animate-fade-in">
                    <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6">
                        {i18nService.t('powerful_components')}
                    </h2>
                    <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
                        {i18nService.t('powerful_subtitle')}
                    </p>
                </div>

                <div className="space-y-12">
                    {components.map((component, index) => (
                        <ComponentSection key={component.id} {...component} delay={index} />
                    ))}
                </div>
            </div>

            {!showOnlyContent && (
                <>
                    <section className="py-32 bg-muted/30 border-t border-border relative overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                        <div className="max-w-4xl mx-auto px-6 text-center">
                            <div className="animate-fade-in-up">
                                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-float">
                                    <Zap className="w-10 h-10 text-primary" />
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black text-foreground mb-8 tracking-tight">
                                    {i18nService.t('cta_title')}
                                </h2>
                                <p className="text-muted-foreground text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                                    {i18nService.t('cta_subtitle')}
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                    <button
                                        onClick={() => navigate({ to: '/docs/ez-layout' })}
                                        className="btn-primary px-10 py-5 bg-primary text-primary-foreground rounded-2xl text-xl font-bold shadow-xl shadow-primary/20 flex items-center gap-3"
                                    >
                                        {i18nService.t('get_started_now')}
                                        <ArrowRight className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => navigate({ to: '/docs/ez-layout' })}
                                        className="btn-secondary px-10 py-5 bg-card text-foreground rounded-2xl text-xl font-bold border border-border flex items-center gap-3"
                                    >
                                        <Box className="w-6 h-6" />
                                        {i18nService.t('documentation')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <footer className="border-t border-border py-16 bg-background">
                        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center text-white font-black">E</div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-foreground leading-tight">ezUX</span>
                                    <span className="text-xs text-muted-foreground">{i18nService.t('premium_suite')}</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-medium text-muted-foreground">
                                <Link to="/docs/ez-layout" className="hover:text-primary transition-colors">{i18nService.t('documentation')}</Link>
                                <a href="#" className="hover:text-primary transition-colors">{i18nService.t('github')}</a>
                                <a href="#" className="hover:text-primary transition-colors">{i18nService.t('support')}</a>
                                <a href="#" className="hover:text-primary transition-colors">{i18nService.t('privacy')}</a>
                            </div>
                            <div className="text-sm text-muted-foreground/60">
                                © 2024 Zeeshan Sayed. {i18nService.t('nav_copyright')}
                            </div>
                        </div>
                    </footer>
                </>
            )}
        </div>
    );
};
