import { useEffect, useState } from "react";
import AffiliateLayout from "./AffiliateLayout";
import { affiliateGetCommissions } from "@/services/affiliateApi";
import { toast } from "sonner";

const statusBadge = (s: string) =>
    s === "paid" ? "bg-green-100 text-green-700" :
    s === "approved" ? "bg-blue-100 text-blue-700" :
    "bg-amber-100 text-amber-700";

export default function AffiliateCommissions() {
    const [commissions, setCommissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        affiliateGetCommissions()
            .then(setCommissions)
            .catch(() => toast.error("Failed to load commissions"))
            .finally(() => setLoading(false));
    }, []);

    const total = commissions.reduce((s, c) => s + c.amount, 0);
    const paid = commissions.filter(c => c.status === "paid").reduce((s, c) => s + c.amount, 0);

    return (
        <AffiliateLayout>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-slate-900">Commissions</h1>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: "Total", value: `$${total}` },
                        { label: "Approved", value: `$${commissions.filter(c => c.status === "approved").reduce((s, c) => s + c.amount, 0)}` },
                        { label: "Paid Out", value: `$${paid}` },
                    ].map(({ label, value }) => (
                        <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                            <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
                    ) : commissions.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <p className="text-lg font-semibold">No commissions yet</p>
                            <p className="text-sm mt-1">Commissions appear after your referrals sign up</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        {["Date", "Amount", "Status"].map(h => (
                                            <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {commissions.map((c, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-4 text-sm text-slate-600">{new Date(c.createdAt).toLocaleDateString()}</td>
                                            <td className="px-5 py-4 text-sm font-bold text-slate-900">${c.amount}</td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${statusBadge(c.status)}`}>{c.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AffiliateLayout>
    );
}
