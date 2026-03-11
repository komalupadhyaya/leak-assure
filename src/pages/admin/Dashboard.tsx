import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { getDashboardStats } from "@/services/api";
import {
    Users,
    FileText,
    DollarSign,
    UserPlus,
    AlertCircle,
    TrendingUp,
    ShieldCheck,
    ShieldX,
    ClipboardList,
    CalendarDays,
    XCircle
} from "lucide-react";

interface Stats {
    totalActiveMembers: number;
    newSignupsThisMonth: number;
    activeEssentialPlans: number;
    activePremiumPlans: number;
    openClaims: number;
    claimsSubmittedThisMonth: number;
    failedCancelledSubscriptions: number;
    monthlyRecurringRevenue: number;
}

const Dashboard = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const cards = [
        {
            title: "Total Active Members",
            value: stats?.totalActiveMembers ?? 0,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-100"
        },
        {
            title: "New Signups This Month",
            value: stats?.newSignupsThisMonth ?? 0,
            icon: UserPlus,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            border: "border-indigo-100"
        },
        {
            title: "Active Essential Plans",
            value: stats?.activeEssentialPlans ?? 0,
            icon: ShieldCheck,
            color: "text-teal-600",
            bg: "bg-teal-50",
            border: "border-teal-100"
        },
        {
            title: "Active Premium Plans",
            value: stats?.activePremiumPlans ?? 0,
            icon: ShieldX,
            color: "text-purple-600",
            bg: "bg-purple-50",
            border: "border-purple-100"
        },
        {
            title: "Open Claims",
            value: stats?.openClaims ?? 0,
            icon: AlertCircle,
            color: "text-orange-600",
            bg: "bg-orange-50",
            border: "border-orange-100"
        },
        {
            title: "Claims Submitted This Month",
            value: stats?.claimsSubmittedThisMonth ?? 0,
            icon: ClipboardList,
            color: "text-sky-600",
            bg: "bg-sky-50",
            border: "border-sky-100"
        },
        {
            title: "Failed / Cancelled Subscriptions",
            value: stats?.failedCancelledSubscriptions ?? 0,
            icon: XCircle,
            color: "text-red-600",
            bg: "bg-red-50",
            border: "border-red-100"
        },
        {
            title: "Monthly Recurring Revenue",
            value: `$${(stats?.monthlyRecurringRevenue ?? 0).toLocaleString()}`,
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-50",
            border: "border-green-100"
        },
    ];

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">Dashboard</h2>
                    <p className="text-sm text-slate-500">Real-time overview of your Leak Assure platform.</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 animate-pulse h-28" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {cards.map((card, i) => (
                            <div
                                key={i}
                                className={`bg-white p-5 sm:p-6 rounded-xl border shadow-sm flex flex-col gap-4 ${card.border}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className={`p-2.5 rounded-lg ${card.bg}`}>
                                        <card.icon className={`h-5 w-5 ${card.color}`} />
                                    </div>
                                    <TrendingUp className="h-4 w-4 text-slate-200" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{card.title}</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Subscription Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">Subscription Breakdown</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-slate-600">Essential Protection</span>
                                    <span className="text-sm font-bold">{stats?.activeEssentialPlans ?? 0}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div
                                        className="bg-teal-500 h-2 rounded-full transition-all duration-700"
                                        style={{ width: `${((stats?.activeEssentialPlans ?? 0) / Math.max(stats?.totalActiveMembers ?? 1, 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-slate-600">Premium Protection</span>
                                    <span className="text-sm font-bold">{stats?.activePremiumPlans ?? 0}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div
                                        className="bg-purple-500 h-2 rounded-full transition-all duration-700"
                                        style={{ width: `${((stats?.activePremiumPlans ?? 0) / Math.max(stats?.totalActiveMembers ?? 1, 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6">Claims Activity</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                <span className="text-sm text-slate-600">Open / Active Claims</span>
                                <span className="text-sm font-bold text-orange-600">{stats?.openClaims ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                <span className="text-sm text-slate-600">Submitted This Month</span>
                                <span className="text-sm font-bold text-sky-600">{stats?.claimsSubmittedThisMonth ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <span className="text-sm text-slate-600">Failed / Cancelled Subs</span>
                                <span className="text-sm font-bold text-red-600">{stats?.failedCancelledSubscriptions ?? 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
