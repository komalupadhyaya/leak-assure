import { useEffect, useState } from "react";
import AffiliateLayout from "./AffiliateLayout";
import { affiliateGetReferrals } from "@/services/affiliateApi";
import { toast } from "sonner";

export default function AffiliateReferrals() {
    const [referrals, setReferrals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        affiliateGetReferrals()
            .then(setReferrals)
            .catch(() => toast.error("Failed to load referrals"))
            .finally(() => setLoading(false));
    }, []);

    return (
        <AffiliateLayout>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-slate-900">Referrals</h1>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
                    ) : referrals.length === 0 ? (
                        <div className="text-center py-16 text-slate-400">
                            <p className="text-lg font-semibold">No referrals yet</p>
                            <p className="text-sm mt-1">Share your referral link to start earning</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        {["Date", "Referred Member", "Converted", "Status"].map(h => (
                                            <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {referrals.map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-4 text-sm text-slate-600">{new Date(r.createdAt).toLocaleDateString()}</td>
                                            <td className="px-5 py-4 text-sm font-medium text-slate-900">
                                                {r.referredEmail ? r.referredEmail.replace(/(.{2}).*(@.*)/, '$1***$2') : "Anonymous"}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600">{r.convertedAt ? new Date(r.convertedAt).toLocaleDateString() : "—"}</td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${r.convertedAt ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                                    {r.convertedAt ? "Converted" : "Pending"}
                                                </span>
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
