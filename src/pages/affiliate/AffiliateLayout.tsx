import { Link, useLocation, useNavigate } from "react-router-dom";
import { Droplets, LayoutDashboard, Users, DollarSign, Image, Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
    { to: "/affiliate/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/affiliate/referrals", label: "Referrals", icon: Users },
    { to: "/affiliate/commissions", label: "Commissions", icon: DollarSign },
    { to: "/affiliate/marketing", label: "Marketing", icon: Image },
    { to: "/affiliate/settings", label: "Settings", icon: Settings },
];

export default function AffiliateLayout({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("affiliate_token");
        localStorage.removeItem("affiliate_user");
        navigate("/affiliate/login");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
            {/* Mobile Header */}
            <header className="lg:hidden bg-slate-900 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <Droplets className="h-6 w-6 text-blue-400" />
                    <span className="text-white font-bold text-sm">Leak Assure</span>
                </div>
                {!isMenuOpen && (
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                )}
            </header>

            {/* Sidebar / Mobile Menu Overlay */}
            <aside className={`
                fixed inset-y-0 left-0 z-[60] lg:relative lg:z-0 lg:flex
                w-64 bg-slate-900 flex flex-col shrink-0
                transition-transform duration-300 ease-in-out shadow-2xl
                ${isMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}>
                <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between lg:justify-start gap-2">
                    <div className="flex items-center gap-2">
                        <Droplets className="h-6 w-6 text-blue-400" />
                        <div>
                            <p className="text-white font-bold text-sm leading-tight">Leak Assure</p>
                            <p className="text-slate-400 text-[11px]">Affiliate Portal</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <nav className="flex-1 py-4 lg:py-4 space-y-1 px-3 mt-4 lg:mt-0">
                    {navItems.map(({ to, label, icon: Icon }) => {
                        const active = location.pathname.startsWith(to);
                        return (
                            <Link
                                key={to}
                                to={to}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-lg text-sm font-medium transition-all ${active
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                    }`}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-3 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Menu Backdrop */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Main */}
            <main className="flex-1 overflow-auto">
                <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
            </main>
        </div>
    );
}
