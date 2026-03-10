import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { getMembers, cancelSubscription } from "@/services/api";
import {
    Search,
    Download,
    MoreHorizontal,
    Eye,
    FileText,
    Edit,
    XCircle,
    UserX,
    MessageSquare,
    CheckCircle2,
    AlertCircle,
    Clock
} from "lucide-react";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Members = () => {
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
            console.error("Error fetching members:", error);
            toast.error("Failed to load members");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleCancel = async (id: string, name: string) => {
        if (confirm(`Cancel ${name}'s subscription? This will stop their billing.`)) {
            try {
                await cancelSubscription(id);
                toast.success("Subscription canceled successfully");
                fetchMembers();
            } catch {
                toast.error("Failed to cancel subscription");
            }
        }
    };

    const handleMarkInactive = async (id: string) => {
        toast.info("Mark Inactive — coming soon");
    };

    const handleAddNote = async (id: string) => {
        navigate(`/admin/members/${id}`);
    };

    const getWaitingPeriodStatus = (member: any) => {
        if (!member.waitingPeriodEnd) return { label: "N/A", style: "bg-slate-100 text-slate-500" };
        const now = new Date();
        const end = new Date(member.waitingPeriodEnd);
        if (now >= end) return { label: "Active", style: "bg-emerald-100 text-emerald-700" };
        return { label: "Waiting", style: "bg-amber-100 text-amber-700" };
    };

    const filteredMembers = members.filter(m =>
        m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phone?.includes(searchTerm)
    );

    const exportToCSV = () => {
        const headers = ["Full Name", "Email", "Phone", "Service Address", "Plan", "Signup Date", "Status", "Waiting Period", "Last Payment Date"];
        const rows = filteredMembers.map(m => [
            m.fullName,
            m.email,
            m.phone,
            `"${m.serviceAddress}"`,
            m.plan,
            new Date(m.createdAt).toLocaleDateString(),
            m.subscriptionStatus === 'active' ? 'Active' : 'Canceled',
            getWaitingPeriodStatus(m).label,
            m.lastPaymentDate ? new Date(m.lastPaymentDate).toLocaleDateString() : "—"
        ]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", `members_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
        toast.success("Members exported to CSV");
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors border border-slate-200"
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm transition-all">
                    <div className="overflow-x-visible md:overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-5 py-4 whitespace-nowrap">Member Name</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Email</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Phone</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Service Address</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Plan</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Signup Date</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Status</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Waiting Period</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Last Payment</th>
                                    <th className="px-5 py-4 whitespace-nowrap text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-12 text-center text-slate-400 font-medium">
                                            Loading members...
                                        </td>
                                    </tr>
                                ) : filteredMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-12 text-center text-slate-400 font-medium">
                                            No members found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMembers.map((member) => {
                                        const wpStatus = getWaitingPeriodStatus(member);
                                        return (
                                            <tr key={member._id} className="hover:bg-slate-50 transition-colors">
                                                {/* Member Name */}
                                                <td className="px-5 py-3.5">
                                                    <span className="font-semibold text-slate-900">{member.fullName}</span>
                                                </td>
                                                {/* Email */}
                                                <td className="px-5 py-3.5 text-slate-600 max-w-[160px]">
                                                    <span className="truncate block" title={member.email}>{member.email}</span>
                                                </td>
                                                {/* Phone */}
                                                <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                                                    {member.phone || "—"}
                                                </td>
                                                {/* Service Address */}
                                                <td className="px-5 py-3.5 max-w-[200px]">
                                                    <span className="text-slate-600 truncate block" title={member.serviceAddress}>
                                                        {member.serviceAddress}
                                                    </span>
                                                </td>
                                                {/* Plan */}
                                                <td className="px-5 py-3.5">
                                                    <span className="capitalize font-medium text-slate-700">{member.plan}</span>
                                                </td>
                                                {/* Signup Date */}
                                                <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                                                    {new Date(member.createdAt).toLocaleDateString()}
                                                </td>
                                                {/* Subscription Status */}
                                                <td className="px-5 py-3.5">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                        ${member.subscriptionStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {member.subscriptionStatus === 'active'
                                                            ? <><CheckCircle2 className="h-3 w-3" /> Active</>
                                                            : <><AlertCircle className="h-3 w-3" /> Canceled</>
                                                        }
                                                    </span>
                                                </td>
                                                {/* Waiting Period */}
                                                <td className="px-5 py-3.5">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${wpStatus.style}`}>
                                                        {wpStatus.label === "Waiting" && <Clock className="h-3 w-3" />}
                                                        {wpStatus.label}
                                                    </span>
                                                </td>
                                                {/* Last Payment Date */}
                                                <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                                                    {member.lastPaymentDate ? new Date(member.lastPaymentDate).toLocaleDateString() : "—"}
                                                </td>
                                                {/* Actions dropdown */}
                                                <td className="px-5 py-3.5 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 z-[1000]">
                                                            <DropdownMenuItem onClick={() => navigate(`/admin/members/${member._id}`)}>
                                                                <Eye className="h-4 w-4 text-slate-400 mr-2" /> View Member
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => navigate(`/admin/claims?member=${member._id}`)}>
                                                                <FileText className="h-4 w-4 text-slate-400 mr-2" /> View Claims
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => navigate(`/admin/members/${member._id}`)}>
                                                                <Edit className="h-4 w-4 text-slate-400 mr-2" /> Edit Member
                                                            </DropdownMenuItem>
                                                            <div className="border-t border-slate-100 my-1" />
                                                            <DropdownMenuItem
                                                                onClick={() => handleCancel(member._id, member.fullName)}
                                                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                            >
                                                                <XCircle className="h-4 w-4 mr-2" /> Cancel Subscription
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleMarkInactive(member._id)}>
                                                                <UserX className="h-4 w-4 text-slate-400 mr-2" /> Mark Inactive
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleAddNote(member._id)}>
                                                                <MessageSquare className="h-4 w-4 text-slate-400 mr-2" /> Add Note
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
        </AdminLayout>
    );
};

export default Members;
