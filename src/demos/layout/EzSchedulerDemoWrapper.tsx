import React, { useMemo, useState, useTransition, useCallback } from 'react';
import {
    EzScheduler,
    Button,
    cn,
    SchedulerEvent,
    Resource,
    useI18n,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    EzSchedulerRef,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Calendar,
    Switch,
    Label
} from 'ezux';
import {
    Clock,
    Sparkles,
    RefreshCw,
    Calendar as CalendarIcon,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Check,
    Search,
    Menu
} from 'lucide-react';
import { format, startOfDay, addDays } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { dataWorkerService } from '@/services/DataWorkerService';

export type SchedulerScenario = 'standard' | 'views' | 'timeline' | 'grouping' | 'workdays' | 'test-enhancements' | 'resource';

interface EzSchedulerDemoWrapperProps {
    initialScenario?: SchedulerScenario;
}

export const EzSchedulerDemoWrapper: React.FC<EzSchedulerDemoWrapperProps> = ({ initialScenario = 'standard' }) => {
    const [scenario, setScenario] = useState<SchedulerScenario>(initialScenario);
    const [isPending, startTransition] = useTransition();
    const i18nService = useI18n();
    const schedulerRef = React.useRef<EzSchedulerRef>(null);

    // Update scenario when prop changes (for deep linking)
    React.useEffect(() => {
        setScenario(initialScenario);
    }, [initialScenario]);

    const [currentView, setCurrentView] = useState<any>(() => {
        if (initialScenario === 'views') return 'Day';
        if (initialScenario === 'timeline' || initialScenario === 'grouping') return 'TimelineWeek';
        if (initialScenario === 'resource') return 'WorkWeek';
        return 'Week';
    });
    const [slotDuration, setSlotDuration] = useState(30);
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth > 1024 : true);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());

    // Dynamic Resources based on Scenario
    const resources: Resource[] = useMemo(() => {
        if (scenario === 'views' || scenario === 'test-enhancements') {
            return [
                { id: 'user-1', name: 'James Wilson', color: '#10b981', type: 'User' }
            ];
        }
        if (scenario === 'timeline') {
            return [
                { id: 'user-logged-in', name: 'Me (Logged In)', color: '#3b82f6', type: 'User' }
            ];
        }
        if (scenario === 'grouping') {
            return [
                { id: 'room-a', name: 'Meeting Room A', color: '#3b82f6', type: 'Room', capacity: 10, floor: 'Floor 1' },
                { id: 'room-b', name: 'Meeting Room B', color: '#10b981', type: 'Room', capacity: 20, floor: 'Floor 1' },
                { id: 'room-c', name: 'Conference Hall', color: '#8b5cf6', type: 'Hall', capacity: 50, floor: 'Floor 2' },
                { id: 'room-d', name: 'Training Room', color: '#f59e0b', type: 'Room', capacity: 15, floor: 'Floor 2' },
            ];
        }
        if (scenario === 'resource') {
            return [
                { id: 'doc-1', name: 'Will Smith', color: '#3b82f6', type: 'Cardiologist', avatar: 'https://ui-avatars.com/api/?name=Will+Smith&background=random' },
                { id: 'doc-2', name: 'Alice', color: '#10b981', type: 'Neurologist', avatar: 'https://ui-avatars.com/api/?name=Alice&background=random' },
                { id: 'doc-3', name: 'Robson', color: '#8b5cf6', type: 'Orthopedic Surgeon', avatar: 'https://ui-avatars.com/api/?name=Robson&background=random' }
            ];
        }
        const standardResources = [
            {
                id: 'res-1',
                name: 'Conference Room A',
                color: '#3b82f6',
                type: 'Room',
                workingHours: {
                    start: 9,
                    end: 22,
                    days: [1, 2, 3, 4, 5]
                }
            },
            {
                id: 'res-2',
                name: 'Conference Room B',
                color: '#10b981',
                type: 'Room',
                workingHours: {
                    start: 8,
                    end: 22,
                    days: [1, 2, 3, 4, 5]
                }
            },
            { id: 'res-3', name: 'John Doe', color: '#8b5cf6', type: 'User' },
            ...Array.from({ length: 17 }, (_, i) => ({
                id: `res-${i + 4}`,
                name: `Executive ${i + 1}`,
                color: ['#10b981', '#3b82f6', '#8b5cf6', '#f43f5e', '#f59e0b', '#06b6d4', '#84cc16', '#d946ef', '#ef4444', '#f97316'][i % 10],
                workingHours: {
                    start: 8,
                    end: 22,
                    days: [1, 2, 3, 4, 5]
                }
            }))
        ];
        return standardResources;
    }, [scenario]);

    const [resourceSearchQuery, setResourceSearchQuery] = useState('');
    const [activeResourceIds, setActiveResourceIds] = useState<string[]>([]);

    const { data: dataEvents = [], isLoading: isLoadingData, refetch: refetchEvents } = useQuery({
        queryKey: ['schedulerEvents', scenario, resources.length],
        queryFn: () => dataWorkerService.generateSchedulerEvents(
            scenario === 'standard' ? 1000 : 100,
            resources.map(r => r.id)
        ),
        staleTime: 5 * 60 * 1000,
    });

    const filteredResources = useMemo(() => {
        if (!resourceSearchQuery) return resources;
        return resources.filter(r =>
            r.name.toLowerCase().includes(resourceSearchQuery.toLowerCase()) ||
            (r.type && r.type.toLowerCase().includes(resourceSearchQuery.toLowerCase()))
        );
    }, [resources, resourceSearchQuery]);

    // Reset resources and view when scenario changes
    React.useEffect(() => {
        setActiveResourceIds(resources.map(r => r.id));
        setResourceSearchQuery('');
        if (scenario === 'views' || scenario === 'test-enhancements') {
            setCurrentView('Day');
        } else if (scenario === 'timeline' || scenario === 'grouping') {
            setCurrentView('TimelineWeek');
        } else if (scenario === 'resource') {
            setCurrentView('WorkWeek');
        } else {
            setCurrentView('Week');
        }
    }, [resources, scenario]);

    // Data loading is now handled by useQuery
    const handleReload = useCallback(() => {
        startTransition(() => {
            refetchEvents();
        });
    }, [refetchEvents]);

    const displayedResources = useMemo(() => {
        return filteredResources.filter(r => activeResourceIds.includes(r.id));
    }, [filteredResources, activeResourceIds]);

    const handleResourceChange = useCallback((ids: string[]) => {
        startTransition(() => {
            setActiveResourceIds(ids);
        });
    }, []);



    const finalEvents = useMemo(() => {
        const filtered = dataEvents.filter(e => !e.resourceId || activeResourceIds.includes(e.resourceId));

        if (scenario === 'views' || scenario === 'resource' || scenario === 'grouping') {
            const result = [...filtered];

            // For 'views' scenario, add mock holidays and fully booked dates as requested
            if (scenario === 'views') {
                const today = startOfDay(new Date());

                // Add a Public Holiday (Today + 1)
                const holidayDate = addDays(today, 1);
                result.push({
                    id: 'mock-holiday',
                    title: 'Public Holiday',
                    start: holidayDate,
                    end: holidayDate,
                    isHoliday: true,
                    isAllDay: true,
                    color: 'hsl(var(--destructive))'
                });

                // Add a Fully Booked day (Today + 3)
                const fullyBookedDate = addDays(today, 3);
                result.push({
                    id: 'mock-fully-booked',
                    title: 'Fully Booked',
                    start: fullyBookedDate,
                    end: fullyBookedDate,
                    isFullyBooked: true,
                    isAllDay: true,
                    color: 'hsl(var(--warning))'
                });
            }

            return result;
        }

        // Add one test unassigned event for other scenarios
        const unassignedEvent: SchedulerEvent = {
            id: 'test-unassigned',
            title: 'Global Inbox Item',
            start: new Date(new Date().setHours(10, 0, 0, 0)),
            end: new Date(new Date().setHours(11, 30, 0, 0)),
            resourceId: undefined,
            color: '#ff4444'
        };

        return [unassignedEvent, ...filtered];
    }, [dataEvents, activeResourceIds, scenario]);

    const slots = useMemo(() => {
        const CustomEventRenderer: React.FC<{ event: SchedulerEvent }> = ({ event }) => {
            const resource = resources.find(r => r.id === event.resourceId);
            return (
                <div className="flex flex-col h-full w-full justify-between p-1.5 overflow-hidden">
                    <div className="flex items-start justify-between gap-1">
                        <span className="font-black text-[13px] truncate leading-tight flex-1">{event.title}</span>
                        <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: resource?.color || 'currentColor' }} />
                    </div>
                    <div className="flex items-center gap-1 opacity-60">
                        <Sparkles className="h-2 w-2" />
                        <span className="text-[8px] font-medium leading-none">
                            {new Date(event.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </span>
                    </div>
                </div>
            );
        };
        const CustomResourceHeader: React.FC<{ resource: Resource }> = ({ resource }) => {
            const isSelected = activeResourceIds.includes(resource.id);

            return (
                <div className="flex items-center gap-3 w-full group/header px-2 py-1 h-full">
                    {/* Checkbox for resource selection (only for grouping scenario if needed, or if we want interactivity) */}
                    {scenario === 'grouping' && (
                        <div
                            className="flex items-center justify-center w-5 h-5 rounded hover:bg-muted transition-colors cursor-pointer"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const newIds = isSelected
                                    ? activeResourceIds.filter(id => id !== resource.id)
                                    : [...activeResourceIds, resource.id];
                                handleResourceChange(newIds);
                            }}
                        >
                            <div className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center shadow-sm transition-all duration-200",
                                isSelected
                                    ? "border-primary bg-transparent text-primary"
                                    : "border-muted-foreground/30 bg-transparent group-hover/header:border-muted-foreground/50 text-transparent"
                            )}>
                                <Check className={cn(
                                    "w-3 h-3 transition-transform duration-200",
                                    isSelected ? "scale-100" : "scale-0"
                                )} />
                            </div>
                        </div>
                    )}

                    {/* Resource Avatar/Icon */}
                    {resource.avatar ? (
                        <img
                            src={resource.avatar}
                            alt={resource.name}
                            className="w-8 h-8 rounded-full object-cover border border-border shadow-sm shrink-0"
                        />
                    ) : (
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-sm border border-white/20 shrink-0"
                            style={{ backgroundColor: resource.color }}
                        >
                            {resource.name.charAt(0)}
                        </div>
                    )}

                    {/* Resource Details */}
                    <div className="flex flex-col min-w-0 justify-center">
                        <span className="text-sm font-bold truncate leading-tight text-foreground/90">{resource.name}</span>
                        <span className="text-[9px] text-muted-foreground font-bold leading-tight px-1.5 py-0.5 rounded bg-muted w-fit mt-1">
                            {resource.type || 'Professional'}
                        </span>
                    </div>
                </div>
            );
        };

        return {
            event: CustomEventRenderer,
            resourceHeader: CustomResourceHeader
        };
    }, [resources, activeResourceIds, handleResourceChange, scenario]);

    const calendarModifiers = useMemo(() => {
        const modifiers: Record<string, { className?: string; tooltip?: string; disabled?: boolean }> = {};

        finalEvents.forEach(event => {
            if (event.isHoliday) {
                const dateKey = new Date(event.start).toISOString().split('T')[0];
                modifiers[dateKey] = {
                    className: "bg-destructive text-destructive-foreground font-bold hover:bg-destructive hover:text-destructive-foreground opacity-100",
                    tooltip: event.title || "Public Holiday",
                    disabled: true
                };
            } else if (event.isFullyBooked) {
                const dateKey = new Date(event.start).toISOString().split('T')[0];
                modifiers[dateKey] = {
                    className: "bg-amber-500 text-white font-bold hover:bg-amber-600 hover:text-white opacity-100",
                    tooltip: event.title || "Fully Booked",
                    disabled: true
                };
            }
        });

        return modifiers;
    }, [finalEvents]);

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden relative">
            <header className="px-6 py-4 border-b border-border bg-background flex items-center justify-between shrink-0 z-20 text-foreground">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:bg-muted"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        <Menu className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
                            <CalendarIcon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-xl font-black text-foreground tracking-tighter leading-none mb-1">
                                {scenario === 'views' ? 'Basic Scheduler View' :
                                    scenario === 'timeline' ? 'Timeline Resources' :
                                        scenario === 'resource' ? 'Resource View' :
                                            (scenario.charAt(0).toUpperCase() + scenario.slice(1) + ' View')}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Scheduler v2.0</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center bg-background rounded-2xl p-1.5 border border-border shadow-sm mx-4">
                        <Select
                            value={slotDuration.toString()}
                            onValueChange={(val) => setSlotDuration(parseInt(val, 10))}
                        >
                            <SelectTrigger className="h-10 px-5 text-sm font-bold uppercase tracking-wider text-foreground bg-transparent border-none shadow-none focus:ring-0 hover:bg-background rounded-xl transition-all gap-3">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary" />
                                    <span>{slotDuration === 60 ? '1 Hour' : `${slotDuration} Mins`}</span>
                                </div>
                                <ChevronDown className="w-5 h-5 text-muted-foreground/50" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5 Minutes</SelectItem>
                                <SelectItem value="10">10 Minutes</SelectItem>
                                <SelectItem value="15">15 Minutes</SelectItem>
                                <SelectItem value="30">30 Minutes</SelectItem>
                                <SelectItem value="45">45 Minutes</SelectItem>
                                <SelectItem value="60">1 Hour</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="h-12 w-[1px] bg-border/50 mx-2 hidden md:block" />

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => schedulerRef.current?.prev()}>
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <Button variant="outline" className="h-10 px-6 text-sm font-bold" onClick={() => schedulerRef.current?.today()}>
                            Today
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => schedulerRef.current?.next()}>
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground">
                                    <CalendarIcon className="w-5 h-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-2xl overflow-hidden" align="start">
                                <Calendar
                                    selected={currentDate}
                                    onSelect={(date) => date && setCurrentDate(date)}
                                    modifiers={calendarModifiers}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="text-sm font-bold text-foreground ml-4 hidden lg:block min-w-[200px]">
                        {format(currentDate, 'EEEE, MMM d yyyy')}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-background rounded-2xl p-1 border border-border shadow-sm">
                        {['Day', 'Week', 'Month', 'Timeline'].map((v) => (
                            <Button
                                key={v}
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentView(v === 'Timeline' ? 'TimelineWeek' : (v as any))}
                                className={cn(
                                    "h-9 px-5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-300",
                                    (currentView === v || (v === 'Timeline' && currentView === 'TimelineWeek'))
                                        ? "bg-background text-primary shadow-xl shadow-black/5 scale-[1.02]"
                                        : "text-muted-foreground/70 hover:text-foreground"
                                )}
                            >
                                {v === 'Timeline' ? 'Timeline View' : v}
                            </Button>
                        ))}
                    </div>
                    <div className="h-8 w-[1px] bg-border/50" />
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-3 gap-2 bg-background border-border hover:border-primary transition-all active:scale-95 text-foreground"
                            onClick={handleReload}
                            disabled={isLoadingData || isPending}
                        >
                            <RefreshCw className={cn("w-4 h-4", (isLoadingData || isPending) && "animate-spin")} />
                            {i18nService.t('reload_dataset')}
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <aside className={cn(
                    "border-r border-border bg-background transition-all duration-300 ease-in-out overflow-hidden shrink-0 flex flex-col group/sidebar",
                    isSidebarOpen ? "w-[280px]" : "w-0"
                )}>
                    <div className="w-[280px] flex flex-col h-full bg-background font-sans">
                        {/* 1. Mini Calendar Section (Primary Navigation) */}
                        <div className="p-2 border-b border-border/40">
                            <Calendar
                                selected={currentDate}
                                onSelect={(date) => date && setCurrentDate(date)}
                                className="w-full pointer-events-auto border-none shadow-none p-2"
                                modifiers={calendarModifiers}
                            />
                        </div>

                        {/* 2. Resource Filters (Search & Toggle Selection) */}
                        {scenario !== 'resource' && (
                            <div className="px-4 py-2 border-b border-border/40 flex flex-col gap-3 bg-muted/5">
                                <div className="relative w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/70 pointer-events-none" />
                                    <input
                                        id="resource-search"
                                        name="resource-search"
                                        type="text"
                                        placeholder="Search resources..."
                                        value={resourceSearchQuery}
                                        onChange={(e) => setResourceSearchQuery(e.target.value)}
                                        className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 pl-9 text-xs text-foreground shadow-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                                    />
                                </div>

                                <div className="flex items-center justify-between px-1">
                                    <Label htmlFor="select-all-toggle" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider cursor-pointer">
                                        Display All
                                    </Label>
                                    <Switch
                                        id="select-all-toggle"
                                        checked={filteredResources.length > 0 && filteredResources.every(id => activeResourceIds.includes(id.id))}
                                        onCheckedChange={(checked) => {
                                            const visibleIds = filteredResources.map(r => r.id);
                                            startTransition(() => {
                                                if (!checked) {
                                                    // Deselect all visible
                                                    setActiveResourceIds(prev => prev.filter(id => !visibleIds.includes(id)));
                                                } else {
                                                    // Select all visible
                                                    setActiveResourceIds(prev => Array.from(new Set([...prev, ...visibleIds])));
                                                }
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* 3. Resources List (Master Registry) */}
                        <div className="flex-1 overflow-y-auto flex flex-col">
                            {scenario !== 'resource' && (
                                <div className="px-5 py-3 flex items-center justify-between border-b border-border/20 bg-muted/2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 leading-none">Registration</span>
                                </div>
                            )}

                            <div className="p-2 flex flex-col gap-0.5">
                                {resources.map(resource => {
                                    const isSelected = activeResourceIds.includes(resource.id);
                                    return (
                                        <div
                                            key={resource.id}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/40 cursor-pointer transition-all active:scale-[0.98] group/item"
                                            onClick={() => handleResourceChange(
                                                isSelected
                                                    ? activeResourceIds.filter(id => id !== resource.id)
                                                    : [...activeResourceIds, resource.id]
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300",
                                                    isSelected
                                                        ? "border-transparent text-white scale-110 shadow-sm"
                                                        : "border-muted-foreground/30 bg-transparent group-hover/item:border-muted-foreground/50"
                                                )}
                                                style={{
                                                    backgroundColor: isSelected ? resource.color : 'transparent'
                                                }}
                                            >
                                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                            </div>
                                            <span className={cn(
                                                "text-sm font-semibold truncate flex-1 tracking-tight",
                                                isSelected ? "text-foreground" : "text-muted-foreground/70 group-hover/item:text-foreground"
                                            )}>
                                                {resource.name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </aside>

                <main id="scheduler-main-container" className="flex-1 p-4 md:p-6 relative flex flex-col min-h-0 overflow-hidden">
                    <div className={cn(
                        "flex-1 bg-background rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-border flex flex-col transition-opacity duration-300 min-h-0 overflow-hidden",
                        (isPending || isLoadingData) && "opacity-60"
                    )}>
                        <EzScheduler
                            ref={schedulerRef}
                            events={finalEvents}
                            resources={displayedResources}
                            selectedDate={currentDate}
                            onDateChange={(date) => setCurrentDate(date)}
                            className="flex-1 w-full border-none min-h-0"
                            view={currentView}
                            slotDuration={slotDuration}
                            views={['Day', 'Week', 'WorkWeek', 'Month', 'Agenda']}
                            workDays={[1, 2, 3, 4, 5]}
                            startHour="08:00"
                            endHour="23:00"
                            group={scenario === 'grouping' ? { resources: ['floor'], byDate: false } : undefined}
                            showResourcesInDayView={scenario !== 'timeline' && scenario !== 'grouping' && (scenario as string) !== 'views'}
                            showHeaderBar={false}
                            slots={slots}
                            showResourceHeaders={true}
                            showWeekNumber={scenario === 'test-enhancements'}
                            showUnassignedLane={scenario !== 'resource' && scenario !== 'grouping' && (scenario as string) !== 'views'} // Hide unassigned lane for resource/grouping/views
                            weekRule="FirstFourDayWeek"
                            monthsCount={scenario === 'test-enhancements' ? 2 : 1}
                            enableHtmlSanitizer={true}
                            cell={scenario === 'test-enhancements' ? (data) => (
                                <div data-testid="custom-cell-template" className="w-full h-full p-0.5 opacity-50">
                                    <span className="text-[8px]">{data.date.getDate()}</span>
                                </div>
                            ) : undefined}
                            eventDragArea={scenario === 'test-enhancements' ? "#scheduler-main-container" : undefined}
                            onEventChange={(event) => {
                                console.log("Event changed:", event);
                            }}
                            onEventCreate={(event) => {
                                console.log("Event created:", event);
                            }}
                            onEventDelete={(id) => {
                                console.log("Event deleted successfully:", id);
                            }}
                            isLoading={isLoadingData || isPending}
                        />
                    </div>

                    {(isPending || isLoadingData) && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
