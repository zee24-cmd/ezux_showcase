import { Card, CardContent, CardHeader, CardTitle } from 'ezux';
import { Users, Calendar, Clock, Activity } from 'lucide-react';
import { cn } from 'ezux';

interface StatCardProps {
    title: string;
    value: string;
    trend: {
        value: string;
        change: string;
        isPositive: boolean;
    };
    icon: React.ElementType;
    gradientClass: string;
}

const StatCard = ({ title, value, trend, icon: Icon, gradientClass }: StatCardProps) => {
    return (
        <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-800/50 hover:-translate-y-1">
            {/* Gradient background */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                gradientClass
            )} />
            
            {/* Glassmorphism effect */}
            <div className="absolute inset-0 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Icon className={cn(
                        "relative h-5 w-5 text-primary transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg",
                        "group-hover:opacity-100"
                    )} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-2">
                    {value}
                </div>
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "flex items-center text-xs font-medium px-2 py-1 rounded-full transition-all duration-300",
                        trend.isPositive 
                            ? "text-emerald-600 bg-emerald-500/10 group-hover:bg-emerald-500/20" 
                            : "text-rose-600 bg-rose-500/10 group-hover:bg-rose-500/20"
                    )}>
                        <svg className="w-3 h-3 mr-1 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={trend.isPositive 
                                ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
                                : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} 
                            />
                        </svg>
                        {trend.change}
                    </div>
                    <span className="text-xs text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                        {trend.value}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};

export const DashboardStats = () => {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
            <StatCard
                title="Total Events"
                value="124"
                trend={{
                    value: "from last month",
                    change: "+20.1%",
                    isPositive: true
                }}
                icon={Calendar}
                gradientClass="from-blue-500/10 via-transparent to-blue-500/10"
            />
            <StatCard
                title="Active Resources"
                value="12/15"
                trend={{
                    value: "resources added",
                    change: "+2 new",
                    isPositive: true
                }}
                icon={Users}
                gradientClass="from-emerald-500/10 via-transparent to-emerald-500/10"
            />
            <StatCard
                title="Avg Duration"
                value="45m"
                trend={{
                    value: "from last week",
                    change: "-5%",
                    isPositive: false
                }}
                icon={Clock}
                gradientClass="from-rose-500/10 via-transparent to-rose-500/10"
            />
            <StatCard
                title="Utilization"
                value="78%"
                trend={{
                    value: "since last hour",
                    change: "+12%",
                    isPositive: true
                }}
                icon={Activity}
                gradientClass="from-purple-500/10 via-transparent to-purple-500/10"
            />
        </div>
    );
};
