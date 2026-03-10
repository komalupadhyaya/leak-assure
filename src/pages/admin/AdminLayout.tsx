import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Users,
    FileText,
    LayoutDashboard,
    CreditCard,
    UserPlus,
    Settings,
    Droplets
} from "lucide-react";

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
        { title: "Affiliates", icon: UserPlus, path: "/admin/affiliates" },
        { title: "Settings", icon: Settings, path: "/admin/settings" },
    ];

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6 flex items-center gap-2 border-b border-slate-800">
                    <Droplets className="h-6 w-6 text-blue-400" />
                    <span className="text-xl font-bold tracking-tight">Leak Assure</span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.path
                                ? "bg-blue-600 text-white"
                                : "text-slate-400 hover:text-white hover:bg-slate-800"
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.title}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-2">
                        <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                            AD
                        </div>
                        <div className="text-sm">
                            <p className="font-medium">Admin User</p>
                            <p className="text-slate-500 text-xs">admin@leakassure.com</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
                    <h1 className="text-lg font-semibold text-slate-800 uppercase tracking-wider text-xs">
                        {menuItems.find(i => i.path === location.pathname)?.title || "Admin"}
                    </h1>
                    <div className="flex items-center gap-4">
                        <button className="text-sm text-slate-500 hover:text-slate-800">Help</button>
                        <button
                            onClick={() => {
                                localStorage.removeItem('admin_token');
                                localStorage.removeItem('admin_user');
                                window.location.href = '/admin/login';
                            }}
                            className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-xs font-medium border border-slate-200"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
