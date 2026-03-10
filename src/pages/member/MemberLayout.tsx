import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    FilePlus,
    Settings,
    LogOut,
    Droplets,
    ShieldCheck
} from "lucide-react";

interface MemberLayoutProps {
    children: ReactNode;
}

const MemberLayout = ({ children }: MemberLayoutProps) => {
    const location = useLocation();

    const menuItems = [
        { title: "Dashboard", icon: LayoutDashboard, path: "/member/dashboard" },
        { title: "File a Claim", icon: FilePlus, path: "/member/file-claim" },
        { title: "Settings", icon: Settings, path: "/member/settings" },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-8 flex items-center gap-2">
                    <Droplets className="h-8 w-8 text-blue-600" />
                    <span className="text-xl font-bold text-slate-900 tracking-tight">Leak Assure</span>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${location.pathname === item.path
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                                }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.title}
                        </Link>
                    ))}
                </nav>

                <div className="p-6">
                    <div className="bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden">
                        <ShieldCheck className="h-12 w-12 text-blue-500/20 absolute -right-2 -bottom-2" />
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Status</p>
                        <p className="text-sm font-bold truncate">Fully Protected</p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full mt-6 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-slate-50/50">
                <div className="max-w-5xl mx-auto p-12">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MemberLayout;
