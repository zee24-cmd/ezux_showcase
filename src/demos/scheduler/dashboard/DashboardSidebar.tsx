import { cn, Button } from 'ezux';
import { LayoutDashboard, Calendar, Users, Settings, Bell, HelpCircle } from 'lucide-react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export const DashboardSidebar = ({ className }: SidebarProps) => {
    return (
        <div className={cn("pb-12 h-full bg-white dark:bg-zinc-950", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        ezUX
                    </h2>
                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                        </Button>
                        <Button variant="secondary" className="w-full justify-start">
                            <Calendar className="mr-2 h-4 w-4" />
                            Scheduler
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                            <Users className="mr-2 h-4 w-4" />
                            Resources
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                            <Bell className="mr-2 h-4 w-4" />
                            Notifications
                        </Button>
                    </div>
                </div>
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Settings
                    </h2>
                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start">
                            <Settings className="mr-2 h-4 w-4" />
                            General
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                            <HelpCircle className="mr-2 h-4 w-4" />
                            Support
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
