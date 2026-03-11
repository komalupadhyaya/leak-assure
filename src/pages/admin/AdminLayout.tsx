import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import {
    Users,
    FileText,
    LayoutDashboard,
    CreditCard,
    UserPlus,
    Settings,
    Briefcase,
} from "lucide-react";
import { ResponsiveSidebar } from "@/components/ResponsiveSidebar";

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const location = useLocation();

    const menuItems = [
        { title: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
        { title: "Members", icon: Users, path: "/admin/members" },
        { title: "Claims", icon: FileText, path: "/admin/claims" },
        { title: "Payments", icon: CreditCard, path: "/admin/payments" },
        { title: "Vendors", icon: Briefcase, path: "/admin/vendors" },
        { title: "Affiliates", icon: UserPlus, path: "/admin/affiliates" },
        { title: "Settings", icon: Settings, path: "/admin/settings" },
    ];

    const currentTitle = menuItems.find(i => i.path === location.pathname)?.title || "Admin";

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = '/admin/login';
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <ResponsiveSidebar
                items={menuItems}
                theme="dark"
                user={{
                    name: "Admin User",
                    email: "admin@leakassure.com",
                    initials: "AD"
                }}
                onLogout={handleLogout}
            />

            {/* Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 min-h-[64px] bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        {/* Mobile Spacer for Hamburger */}
                        <div className="w-10 h-10 lg:hidden" />
                        <h1 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-[0.2em] truncate">
                            {currentTitle}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <button className="hidden sm:inline-block text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">Help</button>
                        <button
                            onClick={handleLogout}
                            className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold border border-slate-200 hover:bg-slate-200 transition-all active:scale-95"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
