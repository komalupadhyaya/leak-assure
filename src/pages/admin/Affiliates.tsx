import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { adminGetAllAffiliates, adminUpdateAffiliateStatus, adminGetAllPayouts, adminMarkPayoutPaid, adminGetAllCreatives, adminCreateCreative, adminDeleteCreative, adminGetAffiliateDetail, adminCreatePayout, adminUpdateCommissionStatus, adminBulkUpdateCommissions } from "@/services/affiliateApi";
import { CheckCircle, XCircle, Eye, DollarSign, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

const statusBadge = (s: string) =>
    s === "approved" ? "bg-green-100 text-green-700" :
        s === "rejected" ? "bg-red-100 text-red-700" :
            "bg-amber-100 text-amber-700";

const payoutBadge = (s: string) =>
    s === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700";

type Tab = "affiliates" | "payouts" | "creatives";

export default function AdminAffiliates() {
    const [tab, setTab] = useState<Tab>("affiliates");
    const [affiliates, setAffiliates] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [creatives, setCreatives] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [detail, setDetail] = useState<any>(null);
    const [showPayoutForm, setShowPayoutForm] = useState(false);
    const [payoutForm, setPayoutForm] = useState({ amount: "", method: "paypal", notes: "" });
    const [newCreative, setNewCreative] = useState({ title: "", fileUrl: "", fileType: "banner" });
    const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [showMethodModal, setShowMethodModal] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<"paypal" | "zelle" | "">("");
    const [singleCommissionId, setSingleCommissionId] = useState<string | null>(null);
    const [payoutToMark, setPayoutToMark] = useState<any>(null);

    const load = async () => {
        setLoading(true);
        try {
            const [a, p, c] = await Promise.all([adminGetAllAffiliates(), adminGetAllPayouts(), adminGetAllCreatives()]);
            setAffiliates(a.data || []);
            setPayouts(Array.isArray(p) ? p : []);
            setCreatives(Array.isArray(c) ? c : []);
        } catch { toast.error("Failed to load data"); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            await adminUpdateAffiliateStatus(id, status);
            toast.success(`Affiliate ${status}`);
            setAffiliates(prev => prev.map(a => a._id === id ? { ...a, status } : a));
            if (detail?.affiliate?._id === id) setDetail((d: any) => ({ ...d, affiliate: { ...d.affiliate, status } }));
        } catch (e: any) { toast.error(e.message); }
    };

    const updateCommission = async (id: string, status: string) => {
        setSubmitting(true);
        try {
            await adminUpdateCommissionStatus(id, status);
            toast.success(`Commission ${status}`);
            if (detail) {
                const updatedCommissions = detail.commissions.map((c: any) => c._id === id ? { ...c, status } : c);
                setDetail({ ...detail, commissions: updatedCommissions });
            }
        } catch (e: any) { toast.error(e.message); }
        finally { setSubmitting(false); }
    };

    const openBulkPayModal = (singleId?: string | React.MouseEvent) => {
        setPayoutToMark(null);
        const id = typeof singleId === 'string' ? singleId : null;
        if (!detail || (id === null && selectedCommissions.length === 0)) return;

        if (id) {
            setSingleCommissionId(id);
        } else {
            setSingleCommissionId(null);
        }

        // Pre-select method based on user preferences
        let initialMethod = "";
        if (detail.affiliate.paypalEmail && !detail.affiliate.zelleInfo) initialMethod = "paypal";
        else if (!detail.affiliate.paypalEmail && detail.affiliate.zelleInfo) initialMethod = "zelle";
        else if (detail.affiliate.paypalEmail) initialMethod = "paypal";

        setSelectedMethod(initialMethod as "paypal" | "zelle" | "");
        setShowMethodModal(true);
    };

    const openPayoutModal = (payout: any) => {
        setPayoutToMark(payout);
        setSelectedMethod((payout.method as any) || "paypal");
        setSingleCommissionId(null);
        setSelectedCommissions([]);
        setShowMethodModal(true);
    };

    const handleMethodConfirm = async () => {
        if (!selectedMethod) return;
        setSubmitting(true);
        try {
            if (payoutToMark) {
                await adminMarkPayoutPaid(payoutToMark._id, selectedMethod);
                toast.success("Payout marked as paid");
                setPayouts(prev => prev.map(p => p._id === payoutToMark._id ? { ...p, status: "paid", paidAt: new Date(), method: selectedMethod } : p));
                setShowMethodModal(false);
                setPayoutToMark(null);
            } else {
                const ids = singleCommissionId ? [singleCommissionId] : selectedCommissions;
                if (!detail || ids.length === 0) {
                    setSubmitting(false);
                    return;
                }
                await adminBulkUpdateCommissions(detail.affiliate._id, {
                    commissionIds: ids,
                    status: "paid",
                    method: selectedMethod
                });
                toast.success(`Recorded payout for ${ids.length} commissions`);
                const updatedCommissions = detail.commissions.map((c: any) =>
                    ids.includes(c._id) ? { ...c, status: "paid" } : c
                );
                setDetail({ ...detail, commissions: updatedCommissions });
                if (!singleCommissionId) setSelectedCommissions([]);
                setShowMethodModal(false);
                setSingleCommissionId(null);
                load();
            }
        } catch (e: any) { toast.error(e.message); }
        finally { setSubmitting(false); }
    };

    const deleteCreative = async (id: string) => {
        try {
            await adminDeleteCreative(id);
            toast.success("Deleted");
            setCreatives(prev => prev.filter(c => c._id !== id));
        } catch (e: any) { toast.error(e.message); }
    };

    const addCreative = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const c = await adminCreateCreative(newCreative);
            setCreatives(prev => [c, ...prev]);
            setNewCreative({ title: "", fileUrl: "", fileType: "banner" });
            toast.success("Creative added");
        } catch (e: any) { toast.error(e.message); }
    };

    const openDetail = async (id: string) => {
        try {
            const d = await adminGetAffiliateDetail(id);
            setDetail(d);
        } catch (e: any) { toast.error(e.message); }
    };

    const submitPayout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!detail) return;
        try {
            await adminCreatePayout(detail.affiliate._id, { amount: Number(payoutForm.amount), method: payoutForm.method, notes: payoutForm.notes });
            toast.success("Payout created");
            setShowPayoutForm(false);
            setPayoutForm({ amount: "", method: "paypal", notes: "" });
            load();
        } catch (e: any) { toast.error(e.message); }
    };

    const tabs: { key: Tab; label: string }[] = [
        { key: "affiliates", label: "All Affiliates" },
        { key: "payouts", label: "Payouts" },
        { key: "creatives", label: "Creatives" },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Detail Modal */}
                {detail && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h2 className="font-bold text-slate-900 text-lg">{detail.affiliate.name}</h2>
                                    <p className="text-sm text-slate-500">{detail.affiliate.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {detail.affiliate.status !== "approved" && (
                                        <button onClick={() => updateStatus(detail.affiliate._id, "approved")}
                                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700">Approve</button>
                                    )}
                                    {detail.affiliate.status !== "rejected" && (
                                        <button onClick={() => updateStatus(detail.affiliate._id, "rejected")}
                                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700">Reject</button>
                                    )}
                                    <button onClick={() => { setDetail(null); setShowPayoutForm(false); setSelectedCommissions([]); }}
                                        className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200">Close</button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Payout info */}
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center">
                                        <DollarSign className="h-3.5 w-3.5 mr-1" /> Payout Method
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PayPal Email</p>
                                            <p className="text-sm font-semibold text-slate-900">{detail.affiliate.paypalEmail || "Not provided"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Zelle Info</p>
                                            <p className="text-sm font-semibold text-slate-900">{detail.affiliate.zelleInfo || "Not provided"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Commissions */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Commissions ({detail.commissions?.length ?? 0})</p>
                                        {selectedCommissions.length > 0 && (
                                            <button onClick={() => openBulkPayModal()} disabled={submitting}
                                                className="px-3 py-1 bg-green-600 text-white text-[10px] font-bold rounded hover:bg-green-700 disabled:opacity-50">
                                                Mark {selectedCommissions.length} Selected as Paid
                                            </button>
                                        )}
                                    </div>
                                    {detail.commissions?.length === 0 ? <p className="text-sm text-slate-400">No commissions yet</p> : (
                                        <div className="space-y-2 border border-slate-100 rounded-xl overflow-hidden">
                                            {detail.commissions?.map((c: any) => (
                                                <div key={c._id} className="flex items-center gap-3 text-sm bg-white px-3 py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                                    {c.status === "approved" && (
                                                        <input type="checkbox" checked={selectedCommissions.includes(c._id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedCommissions([...selectedCommissions, c._id]);
                                                                else setSelectedCommissions(selectedCommissions.filter(id => id !== c._id));
                                                            }}
                                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                                    )}
                                                    <span className="font-bold text-slate-900 w-16">${c.amount}</span>
                                                    <span className="flex-1 text-slate-500 text-xs truncate">Referral: {c.referralId?._id?.slice(-6) || "N/A"}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${statusBadge(c.status)}`}>{c.status}</span>
                                                    {c.status === "pending" && (
                                                        <button onClick={() => updateCommission(c._id, "approved")}
                                                            className="text-[10px] font-bold text-blue-600 hover:scale-105 ml-auto">Approve</button>
                                                    )}
                                                    {c.status === "approved" && (
                                                        <button onClick={() => openBulkPayModal(c._id)}
                                                            className="text-[10px] font-bold text-green-600 hover:scale-105 ml-auto">Mark Paid</button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Referrals */}
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Referrals ({detail.referrals?.length ?? 0})</p>
                                    {detail.referrals?.length === 0 ? <p className="text-sm text-slate-400">No referrals yet</p> : (
                                        <div className="space-y-2">
                                            {detail.referrals?.slice(0, 5).map((r: any) => (
                                                <div key={r._id} className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-2">
                                                    <span className="text-slate-600">{r.referredUserId?.email || "User registered"}</span>
                                                    <span className="text-slate-400 text-[10px]">{new Date(r.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900">Affiliates</h1>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
                ) : tab === "affiliates" ? (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        {affiliates.length === 0 ? (
                            <div className="text-center py-16 text-slate-400"><p className="font-semibold">No affiliates yet</p></div>
                        ) : (
                            <table className="min-w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        {["Name", "Email", "Referrals", "Earnings", "Status", "Actions"].map(h => (
                                            <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {affiliates.map(a => (
                                        <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-4 text-sm font-semibold text-slate-900">{a.name}</td>
                                            <td className="px-5 py-4 text-sm text-slate-500">{a.email}</td>
                                            <td className="px-5 py-4 text-sm text-slate-700">{a.referralCount ?? 0}</td>
                                            <td className="px-5 py-4 text-sm font-bold text-slate-900">${a.totalEarnings ?? 0}</td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${statusBadge(a.status)}`}>{a.status}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => openDetail(a._id)} title="View" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"><Eye className="h-4 w-4" /></button>
                                                    {a.status !== "approved" && <button onClick={() => updateStatus(a._id, "approved")} title="Approve" className="p-1.5 rounded-lg hover:bg-green-50 text-slate-400 hover:text-green-600 transition-colors"><CheckCircle className="h-4 w-4" /></button>}
                                                    {a.status !== "rejected" && <button onClick={() => updateStatus(a._id, "rejected")} title="Reject" className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"><XCircle className="h-4 w-4" /></button>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ) : tab === "payouts" ? (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        {payouts.length === 0 ? (
                            <div className="text-center py-16 text-slate-400"><p className="font-semibold">No payouts yet</p></div>
                        ) : (
                            <table className="min-w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        {["Affiliate", "Amount", "Method", "Date", "Status", "Action"].map(h => (
                                            <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {payouts.map(p => (
                                        <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-4 text-sm font-semibold text-slate-900">{p.affiliateId?.name}</td>
                                            <td className="px-5 py-4 text-sm font-bold text-slate-900">${p.amount}</td>
                                            <td className="px-5 py-4 text-sm capitalize text-slate-600">{p.method}</td>
                                            <td className="px-5 py-4 text-sm text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${payoutBadge(p.status)}`}>{p.status}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                {p.status !== "paid" ? (
                                                    <button onClick={() => openPayoutModal(p)} className="text-xs font-bold text-green-600 hover:text-green-800 transition-colors">Mark Paid</button>
                                                ) : (
                                                    <button disabled className="text-xs font-bold text-slate-400 cursor-not-allowed">Paid</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Add Creative */}
                        <form onSubmit={addCreative} className="bg-white rounded-xl border border-slate-200 p-5">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Add New Creative</p>
                            <div className="flex gap-3 flex-wrap">
                                <input type="text" placeholder="Title" required value={newCreative.title}
                                    onChange={e => setNewCreative({ ...newCreative, title: e.target.value })}
                                    className="flex-1 min-w-[160px] rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                <input type="url" placeholder="File/Image URL" required value={newCreative.fileUrl}
                                    onChange={e => setNewCreative({ ...newCreative, fileUrl: e.target.value })}
                                    className="flex-1 min-w-[200px] rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                                <select value={newCreative.fileType} onChange={e => setNewCreative({ ...newCreative, fileType: e.target.value })}
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none">
                                    <option value="banner">Banner</option>
                                    <option value="link">Link</option>
                                    <option value="other">Other</option>
                                </select>
                                <button type="submit" className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all">
                                    <Plus className="h-4 w-4" />Add
                                </button>
                            </div>
                        </form>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {creatives.map(c => (
                                <div key={c._id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-slate-900 truncate">{c.title}</p>
                                        <p className="text-xs text-slate-400 capitalize mt-0.5">{c.fileType}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <a href={c.fileUrl} target="_blank" rel="noopener noreferrer"
                                            className="text-xs font-semibold text-blue-600 hover:underline">View</a>
                                        <button onClick={() => deleteCreative(c._id)}
                                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Method Selection Modal (Global) */}
                {showMethodModal && (
                    <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center mt-[0px] p-4">
                        <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                            <div className="p-5 border-b border-slate-100">
                                <h3 className="font-bold text-slate-900">Select Payout Method</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                <p className="text-sm text-slate-500">
                                    {payoutToMark ? (
                                        `Confirm the payment method for Payout #${payoutToMark._id.slice(-6)}`
                                    ) : (
                                        `Choose the method you used to pay the affiliate. This will be recorded for ${singleCommissionId ? 1 : selectedCommissions.length} commission(s).`
                                    )}
                                </p>
                                <div className="space-y-2">
                                    <label className="flex items-center p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                                        <input type="radio" name="method" value="paypal"
                                            checked={selectedMethod === "paypal"}
                                            onChange={() => setSelectedMethod("paypal")}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300" />
                                        <div className="ml-3">
                                            <span className="block text-sm font-semibold text-slate-900">PayPal</span>
                                            <span className="block text-xs text-slate-500">
                                                {payoutToMark ? (
                                                    payoutToMark.affiliateId?.paypalEmail ? `Configured: ${payoutToMark.affiliateId.paypalEmail}` : "Not configured by affiliate"
                                                ) : (
                                                    detail?.affiliate?.paypalEmail ? `Configured: ${detail.affiliate.paypalEmail}` : "Not configured by affiliate"
                                                )}
                                            </span>
                                        </div>
                                    </label>
                                    <label className="flex items-center p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                                        <input type="radio" name="method" value="zelle"
                                            checked={selectedMethod === "zelle"}
                                            onChange={() => setSelectedMethod("zelle")}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300" />
                                        <div className="ml-3">
                                            <span className="block text-sm font-semibold text-slate-900">Zelle</span>
                                            <span className="block text-xs text-slate-500">
                                                {payoutToMark ? (
                                                    payoutToMark.affiliateId?.zelleInfo ? `Configured: ${payoutToMark.affiliateId.zelleInfo}` : "Not configured by affiliate"
                                                ) : (
                                                    detail?.affiliate?.zelleInfo ? `Configured: ${detail.affiliate.zelleInfo}` : "Not configured by affiliate"
                                                )}
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
                                <button onClick={() => setShowMethodModal(false)}
                                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleMethodConfirm}
                                    disabled={submitting || !selectedMethod}
                                    className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors">
                                    Confirm & Mark Paid
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
