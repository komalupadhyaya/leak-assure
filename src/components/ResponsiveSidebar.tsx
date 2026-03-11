import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    LogOut,
    Droplets
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface MenuItem {
    title: string;
    icon: React.ElementType;
    path: string;
}

interface SidebarProps {
    items: MenuItem[];
    theme?: 'dark' | 'light';
    logo?: React.ReactNode;
    user?: {
        name: string;
        email: string;
        initials: string;
    };
    onLogout?: () => void;
    extraFooter?: React.ReactNode;
}

export const ResponsiveSidebar = ({
    items,
    theme = 'dark',
    logo,
    user,
    onLogout,
    extraFooter
}: SidebarProps) => {
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar_collapsed');
        return saved ? JSON.parse(saved) : false;
    });
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);
    const toggleMobileOpen = () => setIsMobileOpen(!isMobileOpen);

    const isDark = theme === 'dark';

    const sidebarClasses = cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out",
        isDark ? "bg-slate-900 text-white" : "bg-white border-r border-slate-200 text-slate-900",
        isCollapsed ? "w-20" : "w-64",
        "lg:static lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
    );

    const NavItem = ({ item }: { item: MenuItem }) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        const content = (
            <Link
                to={item.path}
                className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                    isActive
                        ? (isDark ? "bg-blue-600 text-white" : "bg-blue-600 text-white shadow-lg shadow-blue-200")
                        : (isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-blue-600 hover:bg-blue-50")
                )}
            >
                <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-white" : (isDark ? "text-slate-400 group-hover:text-white" : "text-slate-500 group-hover:text-blue-600"))} />
                {!isCollapsed && <span className="truncate">{item.title}</span>}
            </Link>
        );

        if (isCollapsed) {
            return (
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {content}
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            {item.title}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        return content;
    };

    return (
        <>
            {/* Mobile Mobile Hamburger Button */}
            <div className="lg:hidden fixed top-4 left-4 z-[60]">
                <button
                    onClick={toggleMobileOpen}
                    className={cn(
                        "p-2 rounded-lg shadow-lg border outline-none transition-all",
                        isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"
                    )}
                >
                    {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Backdrop for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside className={sidebarClasses}>
                {/* Logo Section */}
                <div className={cn(
                    "p-6 flex items-center justify-between",
                    isDark ? "border-b border-slate-800" : "border-b border-slate-100"
                )}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        {logo || (
                            <>
                                <Droplets className="h-8 w-8 text-blue-500 flex-shrink-0" />
                                {!isCollapsed && <span className="text-xl font-bold tracking-tight truncate">Leak Assure</span>}
                            </>
                        )}
                    </div>
                    {/* Collapse Toggle - Desktop only */}
                    <button
                        onClick={toggleCollapse}
                        className={cn(
                            "hidden lg:flex p-1.5 rounded-lg border transition-all hover:scale-110",
                            isDark ? "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400" : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500"
                        )}
                    >
                        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
                    {items.map((item) => (
                        <NavItem key={item.path} item={item} />
                    ))}
                </nav>

                {/* Footer Section */}
                <div className={cn(
                    "p-4 mt-auto",
                    isDark ? "border-t border-slate-800" : "border-t border-slate-100"
                )}>
                    {extraFooter && !isCollapsed && <div className="mb-4">{extraFooter}</div>}

                    {user && (
                        <div className={cn(
                            "flex items-center gap-3 px-2 py-2 rounded-xl border transition-all",
                            isDark ? "border-slate-800 bg-slate-800/50" : "border-slate-100 bg-slate-50"
                        )}>
                            <div className={cn(
                                "h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold",
                                isDark ? "bg-slate-700 text-white" : "bg-blue-100 text-blue-700"
                            )}>
                                {user.initials}
                            </div>
                            {!isCollapsed && (
                                <div className="text-sm min-w-0">
                                    <p className="font-bold truncate">{user.name}</p>
                                    <p className={isDark ? "text-slate-500 text-xs truncate" : "text-slate-400 text-xs truncate"}>
                                        {user.email}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {onLogout && (
                        <button
                            onClick={onLogout}
                            className={cn(
                                "w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all transition-all",
                                "text-red-500 hover:bg-red-50"
                            )}
                        >
                            <LogOut className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && <span>Logout</span>}
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
};
