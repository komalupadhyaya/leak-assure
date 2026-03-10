import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { getClaimById, updateClaimStatus, assignVendor, addClaimNote, getVendors } from "@/services/api";
import {
    ArrowLeft,
    User,
    MapPin,
    AlertCircle,
    Clock,
    CheckCircle2,
    Truck,
    MessageSquare,
    ShieldAlert,
    Calendar
} from "lucide-react";
import { toast } from "sonner";

const ClaimDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [claim, setClaim] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [newNote, setNewNote] = useState("");
    const [vendorName, setVendorName] = useState("");
    const [vendors, setVendors] = useState<any[]>([]);

    const fetchClaim = async () => {
        try {
            if (id) {
                const data = await getClaimById(id);
                setClaim(data);
                setVendorName(data.assignedVendor || "");
            }
        } catch (error) {
            console.error("Error fetching claim:", error);
            toast.error("Failed to load claim details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaim();
        const fetchVendors = async () => {
            try {
                const data = await getVendors();
                setVendors(data);
            } catch (error) {
                console.error("Error fetching vendors:", error);
            }
        };
        fetchVendors();
    }, [id]);

    const handleStatusChange = async (newStatus: string) => {
        try {
            if (id) {
                await updateClaimStatus(id, newStatus);
                toast.success(`Status updated to ${newStatus}`);
                fetchClaim();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleAssignVendor = async () => {
        try {
            if (id) {
                await assignVendor(id, vendorName);
                toast.success("Vendor assigned");
                fetchClaim();
            }
        } catch (error) {
            toast.error("Failed to assign vendor");
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        try {
            if (id) {
                await addClaimNote(id, newNote);
                toast.success("Note added");
                setNewNote("");
                fetchClaim();
            }
        } catch (error) {
            toast.error("Failed to add note");
        }
    };

    if (loading) return <AdminLayout>Loading...</AdminLayout>;
    if (!claim) return <AdminLayout>Claim not found</AdminLayout>;

    return (
        <AdminLayout>
            <div className="max-w-5xl space-y-8 pb-20">
                <button
                    onClick={() => navigate("/admin/claims")}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Claims
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Claim Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">{claim.issueType}</h2>
                                    <p className="text-slate-500 text-sm">Claim ID: {claim._id}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2
                    ${claim.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}
                  `}>
                                        <ShieldAlert className="h-3 w-3" />
                                        {claim.priority} Priority
                                    </span>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Submitted {new Date(claim.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <User className="h-3 w-3" /> Member
                                        </p>
                                        <p className="text-slate-900 font-bold text-lg">{claim.memberName}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <MapPin className="h-3 w-3" /> Address
                                        </p>
                                        <p className="text-slate-900 font-medium">{claim.serviceAddress}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Issue Description</p>
                                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-xl border border-slate-100">
                                        {claim.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Notes Section */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                                <MessageSquare className="h-5 w-5 text-blue-600" />
                                Internal Case Notes
                            </h3>

                            <div className="space-y-4">
                                {claim.notes && claim.notes.length > 0 ? (
                                    claim.notes.map((note: string, i: number) => (
                                        <div key={i} className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 border border-slate-100">
                                            {note}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-400 text-sm italic">No notes added yet.</p>
                                )}
                            </div>

                            <div className="pt-4 space-y-3">
                                <textarea
                                    className="w-full h-24 p-4 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
                                    placeholder="Add a case note..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                />
                                <button
                                    onClick={handleAddNote}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                                >
                                    Add Note
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Management Actions</h4>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-tighter">Adjust Claim Status</label>
                                    <select
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                                        value={claim.status}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                    >
                                        {['New', 'Under Review', 'Approved', 'Denied', 'Scheduled', 'Completed', 'Closed'].map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <label className="text-xs font-medium text-slate-500 uppercase tracking-tighter">Assign Plumber / Vendor</label>
                                    <div className="flex gap-2">
                                        <select
                                            className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                                            value={vendorName}
                                            onChange={(e) => setVendorName(e.target.value)}
                                        >
                                            <option value="">Select a professional...</option>
                                            {vendors.map(v => (
                                                <option key={v._id} value={v.name}>{v.name} ({v.company})</option>
                                            ))}
                                            {!vendors.find(v => v.name === vendorName) && vendorName && (
                                                <option value={vendorName}>{vendorName}</option>
                                            )}
                                        </select>
                                        <button
                                            onClick={handleAssignVendor}
                                            className="bg-slate-900 text-white p-2.5 rounded-lg hover:bg-slate-800 transition-colors"
                                        >
                                            <Truck className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <Calendar className="h-5 w-5 text-blue-400" />
                                <h4 className="text-sm font-bold uppercase tracking-widest">Timeline</h4>
                            </div>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        <div className="w-px h-full bg-slate-800" />
                                    </div>
                                    <div className="pb-1">
                                        <p className="text-xs font-bold uppercase tracking-tighter text-blue-400">Claim Created</p>
                                        <p className="text-[10px] text-slate-500 italic mt-0.5">{new Date(claim.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="h-2 w-2 rounded-full bg-slate-700" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-tighter text-slate-500">Processing</p>
                                        <p className="text-[10px] text-slate-600 italic mt-0.5">Awaiting assignment</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ClaimDetail;
