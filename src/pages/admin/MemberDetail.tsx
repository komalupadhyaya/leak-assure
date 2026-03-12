import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { getMemberById, cancelSubscription, getClaimsByMember, addMemberNote } from "@/services/api";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
    CreditCard,
    Clock,
    ArrowLeft,
    AlertTriangle,
    MessageSquare,
    ExternalLink,
    CheckCircle2,
    FileText,
    History
} from "lucide-react";
import { toast } from "sonner";
import { AlertModal } from "@/components/ui/AlertModal";

const MemberDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState<any>(null);
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'claims' | 'payments' | 'notes'>('claims');
    const [newNote, setNewNote] = useState("");
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const fetchMemberData = async () => {
        try {
            if (id) {
                const [memberData, claimsData] = await Promise.all([
                    getMemberById(id),
                    getClaimsByMember(id)
                ]);
                setMember(memberData);
                setClaims(claimsData);
            }
        } catch (error) {
            console.error("Error fetching member details:", error);
            toast.error("Failed to load member details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMemberData();
    }, [id]);

    const handleCancelConfirm = async () => {
        try {
            if (id) {
                await cancelSubscription(id);
                toast.success("Subscription canceled successfully");
                fetchMemberData();
            }
        } catch (error) {
            toast.error("Failed to cancel subscription");
        } finally {
            setIsCancelModalOpen(false);
        }
    };

    const handleCancelClick = () => {
        setIsCancelModalOpen(true);
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;
        try {
            if (id) {
                await addMemberNote(id, { note: newNote });
                toast.success("Note added");
                setNewNote("");
                fetchMemberData();
            }
        } catch (error) {
            toast.error("Failed to add note");
        }
    };

    if (loading) return <AdminLayout>Loading...</AdminLayout>;
    if (!member) return <AdminLayout>Member not found</AdminLayout>;

    const isPremium = member.plan?.toLowerCase() === 'premium';
    const planPrice = member.planPrice || (isPremium ? 49 : 29);

    return (
        <AdminLayout>
            <div className="max-w-6xl space-y-8 pb-12">
                <button
                    onClick={() => navigate("/admin/members")}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Members
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile & Info Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-100 flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl font-bold text-slate-400">
                                        {member.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">{member.fullName}</h2>
                                        <p className="text-slate-500 text-sm">Joined {new Date(member.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                    ${member.subscriptionStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                `}>
                                    {member.subscriptionStatus}
                                </span>
                            </div>

                            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Mail className="h-3 w-3" /> Email Address
                                    </p>
                                    <p className="text-slate-900 font-medium">{member.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Phone className="h-3 w-3" /> Phone Number
                                    </p>
                                    <p className="text-slate-900 font-medium">{member.phone}</p>
                                </div>
                                <div className="sm:col-span-2 space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <MapPin className="h-3 w-3" /> Service Address
                                    </p>
                                    <p className="text-slate-900 font-medium">{member.serviceAddress}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <MessageSquare className="h-3 w-3" /> SMS Opt-in
                                    </p>
                                    <p className="text-slate-900 font-medium">{member.smsOptIn ? "Opted In" : "Opted Out"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="h-3 w-3" /> Signup Date
                                    </p>
                                    <p className="text-slate-900 font-medium">{new Date(member.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <CreditCard className="h-3 w-3" /> Stripe Customer ID
                                    </p>
                                    <p className="text-slate-900 font-mono text-xs">{member.stripeCustomerId || "—"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <FileText className="h-3 w-3" /> Stripe Subscription ID
                                    </p>
                                    <p className="text-slate-900 font-mono text-xs">{member.stripeSubscriptionId || "—"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabs Interface */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
                            <div className="flex border-b border-slate-100 bg-slate-50/50">
                                <button
                                    onClick={() => setActiveTab('claims')}
                                    className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all
                                        ${activeTab === 'claims' ? 'bg-white border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}
                                    `}
                                >
                                    Claims History
                                </button>
                                <button
                                    onClick={() => setActiveTab('payments')}
                                    className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all
                                        ${activeTab === 'payments' ? 'bg-white border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}
                                    `}
                                >
                                    Payment History
                                </button>
                                <button
                                    onClick={() => setActiveTab('notes')}
                                    className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all
                                        ${activeTab === 'notes' ? 'bg-white border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}
                                    `}
                                >
                                    Internal Notes
                                </button>
                            </div>

                            <div className="p-8">
                                {activeTab === 'claims' && (
                                    <div className="space-y-4">
                                        {claims.length > 0 ? (
                                            <div className="divide-y divide-slate-100">
                                                {claims.map((claim: any) => (
                                                    <div key={claim._id} className="py-4 flex items-center justify-between group">
                                                        <div className="space-y-1">
                                                            <Link to={`/admin/claims/${claim._id}`} className="font-bold text-slate-900 hover:text-blue-600 flex items-center gap-2">
                                                                #{claim.claimId || claim._id.substring(0, 8).toUpperCase()} — {claim.issueType}
                                                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </Link>
                                                            <p className="text-xs text-slate-500">Filed on {new Date(claim.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                                                            {claim.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                                <FileText className="h-10 w-10 mb-2 opacity-20" />
                                                <p className="text-sm italic">No claims filed yet.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'payments' && (
                                    <div className="space-y-4">
                                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                            <History className="h-10 w-10 mb-2 opacity-20" />
                                            <p className="text-sm italic">Payment history integrated with Stripe. Use Stripe dashboard for full ledger.</p>
                                            <p className="text-[10px] mt-2 uppercase font-bold tracking-widest">Last Payment: {member.lastPaymentDate ? new Date(member.lastPaymentDate).toLocaleDateString() : "Never"}</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'notes' && (
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            {member.notes && member.notes.length > 0 ? (
                                                member.notes.map((note: string, i: number) => (
                                                    <div key={i} className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 border border-slate-100 italic">
                                                        "{note}"
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                                    <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
                                                    <p className="text-sm italic">No internal notes added for this member.</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="pt-6 border-t border-slate-100">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Add Admin Note</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newNote}
                                                    onChange={(e) => setNewNote(e.target.value)}
                                                    placeholder="Type an internal comment..."
                                                    className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600 transition-all"
                                                />
                                                <button
                                                    onClick={handleAddNote}
                                                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Shield className="h-24 w-24" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-6">Plan Details</h3>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-2xl font-bold capitalize mb-1">{member.plan} Plan</h4>
                                    <p className="text-slate-400 text-xs">Leak Assure Full Protection</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Monthly Cost</span>
                                        <span className="font-bold text-lg">${planPrice}/mo</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-800">
                                        <span className="text-slate-500 font-medium">Status</span>
                                        <span className={`font-bold capitalize ${member.subscriptionStatus === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                                            {member.subscriptionStatus}
                                        </span>
                                    </div>
                                </div>
                                {member.subscriptionStatus === 'active' && (
                                    <button
                                        onClick={handleCancelClick}
                                        className="w-full py-3 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/40"
                                    >
                                        Cancel Subscription
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-500" /> Coverage Status
                            </p>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                                    <p className="text-xs text-blue-800 font-medium leading-relaxed">
                                        Waiting period ends on <span className="font-bold">{new Date(member.waitingPeriodEnd).toLocaleDateString()}</span>.
                                    </p>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed italic">
                                    Sudden plumbing leaks are covered after the initial 30-day enrollment period.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AlertModal
                isOpen={isCancelModalOpen}
                onOpenChange={setIsCancelModalOpen}
                title="Cancel Subscription"
                description={`Are you sure you want to cancel ${member.fullName}'s subscription? This will stop recurring billing in Stripe.`}
                confirmText="Cancel Subscription"
                cancelText="Keep Active"
                onConfirm={handleCancelConfirm}
                variant="destructive"
            />
        </AdminLayout>
    );
};

export default MemberDetail;
