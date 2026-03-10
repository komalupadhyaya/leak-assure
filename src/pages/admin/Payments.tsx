import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { getMembers } from "@/services/api";
import {
    Search,
    CreditCard,
    ShieldX,
    AlertCircle,
    CheckCircle2,
    CalendarClock,
    DollarSign,
    MoreHorizontal,
    Eye,
    History
} from "lucide-react";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Payments = () => {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const fetchMembers = async () => {
        try {
            const result = await getMembers();
            const data = Array.isArray(result) ? result : (result.data || []);
            setMembers(data);
        } catch (error) {
            console.error("Error fetching members for payments:", error);
            toast.error("Failed to load payment data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const filteredMembers = members.filter(m =>
        m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeMembers = members.filter(m => m.subscriptionStatus === 'active');
    const canceledMembers = members.filter(m => m.subscriptionStatus !== 'active');
    const estimatedMRR = activeMembers.reduce((sum, m) => sum + (m.planPrice || (m.plan === 'premium' ? 49 : 29)), 0);

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5">
                        <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                            <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Active Subscriptions</p>
                            <h3 className="text-2xl font-bold text-slate-900">{activeMembers.length}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5">
                        <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                            <ShieldX className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Expired / Canceled</p>
                            <h3 className="text-2xl font-bold text-slate-900">{canceledMembers.length}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-5">
                        <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Estimated MRR</p>
                            <h3 className="text-2xl font-bold text-slate-900">${estimatedMRR.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-lg font-bold text-slate-900">Subscription Ledger</h2>
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by member name/email..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible">
                        <div className="overflow-x-visible md:overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="px-6 py-4 whitespace-nowrap">Member Name</th>
                                        <th className="px-6 py-4 whitespace-nowrap">Plan</th>
                                        <th className="px-6 py-4 whitespace-nowrap">Monthly Amount</th>
                                        <th className="px-6 py-4 whitespace-nowrap">Subscription Status</th>
                                        <th className="px-6 py-4 whitespace-nowrap">Last Payment Date</th>
                                        <th className="px-6 py-4 whitespace-nowrap">Next Billing Date</th>
                                        <th className="px-6 py-4 whitespace-nowrap text-center">Failed Payment</th>
                                        <th className="px-6 py-4 whitespace-nowrap text-right">Stripe Status</th>
                                        <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-medium">Loading subscription data...</td>
                                        </tr>
                                    ) : filteredMembers.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-medium">No records found</td>
                                        </tr>
                                    ) : (
                                        filteredMembers.map((member) => {
                                            const amount = member.planPrice || (member.plan === 'premium' ? 49 : 29);
                                            // Mocking next billing as 30 days after last payment or signup
                                            const nextBillingDate = member.lastPaymentDate || member.createdAt;
                                            const nextDate = new Date(nextBillingDate);
                                            nextDate.setMonth(nextDate.getMonth() + 1);

                                            return (
                                                <tr key={member._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-900">{member.fullName}</span>
                                                            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-tighter truncate max-w-[120px]">{member.stripeSubscriptionId || "No ID"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="capitalize font-medium text-slate-700">{member.plan}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-bold text-slate-900">${amount}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                            ${member.subscriptionStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                                        `}>
                                                            {member.subscriptionStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                                        {member.lastPaymentDate ? new Date(member.lastPaymentDate).toLocaleDateString() : "Pending First"}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                                        {member.subscriptionStatus === 'active' ? (
                                                            <div className="flex items-center gap-2">
                                                                <CalendarClock className="h-3 w-3 text-slate-300" />
                                                                {nextDate.toLocaleDateString()}
                                                            </div>
                                                        ) : "—"}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {member.subscriptionStatus === 'canceled' ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-tighter border border-red-100">
                                                                <AlertCircle className="h-2.5 w-2.5" /> FAILED
                                                            </span>
                                                        ) : (
                                                            <span className="text-emerald-500">
                                                                <CheckCircle2 className="h-4 w-4 mx-auto" />
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                                            {member.subscriptionStatus === 'active' ? 'succeeded' : 'canceled'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48 z-[1000]">
                                                                <DropdownMenuItem onClick={() => navigate(`/admin/members/${member._id}`)}>
                                                                    <Eye className="h-4 w-4 text-slate-400 mr-2" /> View Profile
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => navigate(`/admin/members/${member._id}`)}>
                                                                    <History className="h-4 w-4 text-slate-400 mr-2" /> Payment History
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Payments;
