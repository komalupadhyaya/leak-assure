import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { getClaims, updateClaimStatus } from "@/services/api";
import {
    Search,
    Eye,
    Clock,
    CheckCircle2,
    AlertCircle,
    Truck,
    XCircle,
    ClipboardList,
    MoreHorizontal,
    MessageSquare,
    CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Claims = () => {
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [searchParams] = useSearchParams();
    const filterMemberId = searchParams.get('member');
    const navigate = useNavigate();

    const fetchClaims = async () => {
        try {
            const result = await getClaims();
            const data = Array.isArray(result) ? result : (result.data || []);
            setClaims(data);
        } catch (error) {
            console.error("Error fetching claims:", error);
            toast.error("Failed to load claims");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, []);

    const handleAction = async (id: string, action: string) => {
        try {
            if (action === 'Approve') await updateClaimStatus(id, 'Approved');
            if (action === 'Deny') await updateClaimStatus(id, 'Denied');
            if (action === 'Complete') await updateClaimStatus(id, 'Completed');
            toast.success(`Claim ${action}d successfully`);
            fetchClaims();
        } catch {
            toast.error(`Failed to ${action} claim`);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'New': return <AlertCircle className="h-3 w-3" />;
            case 'Under Review': return <Clock className="h-3 w-3" />;
            case 'Approved': return <CheckCircle2 className="h-3 w-3" />;
            case 'Scheduled': return <Truck className="h-3 w-3" />;
            case 'Completed': return <CheckCircle className="h-3 w-3" />;
            case 'Denied': return <XCircle className="h-3 w-3" />;
            case 'Closed': return <ClipboardList className="h-3 w-3" />;
            default: return null;
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'New': return 'bg-orange-100 text-orange-700';
            case 'Under Review': return 'bg-blue-100 text-blue-700';
            case 'Approved': return 'bg-emerald-100 text-emerald-700';
            case 'Scheduled': return 'bg-purple-100 text-purple-700';
            case 'Completed': return 'bg-slate-100 text-slate-700';
            case 'Denied': return 'bg-red-100 text-red-700';
            case 'Closed': return 'bg-gray-100 text-gray-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const statuses = ["All", "New", "Under Review", "Approved", "Denied", "Scheduled", "Completed", "Closed"];

    const filteredClaims = claims.filter(c => {
        const matchesSearch =
            c.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.claimId && c.claimId.toLowerCase().includes(searchTerm.toLowerCase())) ||
            c._id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "All" || c.status === statusFilter;
        const matchesMember = !filterMemberId || c.memberId === filterMemberId;

        return matchesSearch && matchesStatus && matchesMember;
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, claim ID..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100 rounded-lg w-fit">
                    {statuses.map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${statusFilter === status
                                ? "bg-white text-blue-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm transition-all">
                    <div className="overflow-x-visible md:overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-5 py-4 whitespace-nowrap">Claim ID</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Member Name</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Service Address</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Plan</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Date Submitted</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Issue Type</th>
                                    <th className="px-5 py-4 whitespace-nowrap text-center">Priority</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Status</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Assigned Vendor</th>
                                    <th className="px-5 py-4 whitespace-nowrap text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-12 text-center text-slate-400 font-medium">Loading claims...</td>
                                    </tr>
                                ) : filteredClaims.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-12 text-center text-slate-400 font-medium">No claims found</td>
                                    </tr>
                                ) : (
                                    filteredClaims.map((claim) => (
                                        <tr key={claim._id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-5 py-3.5">
                                                <span className="text-xs font-bold text-blue-600 font-mono">
                                                    #{claim.claimId || claim._id.substring(0, 8).toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="font-bold text-slate-900">{claim.memberName}</span>
                                            </td>
                                            <td className="px-5 py-3.5 max-w-[140px]">
                                                <p className="text-xs text-slate-600 truncate" title={claim.serviceAddress}>
                                                    {claim.serviceAddress}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="capitalize text-xs text-slate-700 font-medium">{claim.plan || "—"}</span>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap text-xs">
                                                {new Date(claim.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="text-xs text-slate-700 font-medium">{claim.issueType}</span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex justify-center">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter
                                                        ${claim.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                            claim.priority === 'Medium' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                                'bg-slate-50 text-slate-600 border border-slate-100'}
                                                    `}>
                                                        {claim.priority || "Med"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider
                                                    ${getStatusStyle(claim.status)}
                                                `}>
                                                    {getStatusIcon(claim.status)}
                                                    {claim.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-xs text-slate-600 font-medium">
                                                {claim.assignedVendor ? (
                                                    <div className="flex items-center gap-2">
                                                        <Truck className="h-3 w-3 text-slate-300" />
                                                        {claim.assignedVendor}
                                                    </div>
                                                ) : <span className="text-slate-300 italic">Unassigned</span>}
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 z-[1000]">
                                                        <DropdownMenuItem onClick={() => navigate(`/admin/claims/${claim._id}`)}>
                                                            <Eye className="h-4 w-4 text-slate-400 mr-2" /> View Claim
                                                        </DropdownMenuItem>

                                                        <div className="border-t border-slate-100 my-1" />

                                                        <DropdownMenuItem
                                                            onClick={() => handleAction(claim._id, 'Approve')}
                                                            className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            onClick={() => handleAction(claim._id, 'Deny')}
                                                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                        >
                                                            <XCircle className="h-4 w-4 mr-2" /> Deny
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem onClick={() => navigate(`/admin/claims/${claim._id}`)}>
                                                            <Truck className="h-4 w-4 text-slate-400 mr-2" /> Assign Vendor
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem onClick={() => navigate(`/admin/claims/${claim._id}`)}>
                                                            <MessageSquare className="h-4 w-4 text-slate-400 mr-2" /> Add Notes
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem onClick={() => handleAction(claim._id, 'Complete')}>
                                                            <CheckCircle className="h-4 w-4 text-slate-400 mr-2" /> Mark Complete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Claims;
