import { useEffect, useState } from "react";
import AffiliateLayout from "./AffiliateLayout";
import { affiliateGetMe } from "@/services/affiliateApi";
import { Copy, CheckCircle, DollarSign, Users, TrendingUp, Clock } from "lucide-react";
import { toast } from "sonner";

export default function AffiliateDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        affiliateGetMe()
            .then(setData)
            .catch(() => toast.error("Failed to load dashboard"))
            .finally(() => setLoading(false));
    }, []);

    const copyLink = () => {
        if (!data?.referralLink) return;
        navigator.clipboard.writeText(data.referralLink);
        setCopied(true);
        toast.success("Referral link copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const statusColor = (s: string) =>
        s === "approved" ? "bg-green-100 text-green-700" :
        s === "rejected" ? "bg-red-100 text-red-700" :
        "bg-amber-100 text-amber-700";

    if (loading) return <AffiliateLayout><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div></AffiliateLayout>;

    return (
        <AffiliateLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Welcome, {data?.affiliate?.name?.split(" ")[0]}</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Here's your affiliate overview</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor(data?.affiliate?.status)}`}>
                        {data?.affiliate?.status}
                    </span>
                </div>

                {/* Referral Link */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Referral Link</p>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <code className="flex-1 bg-slate-50 px-4 py-2.5 rounded-lg text-sm text-blue-700 font-mono border border-slate-100 truncate">
                            {data?.referralLink}
                        </code>
                        <button onClick={copyLink} className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all">
                            {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Total Earnings", value: `$${data?.earnings?.totalEarnings ?? 0}`, icon: DollarSign, color: "text-blue-600 bg-blue-50" },
                        { label: "Available Balance", value: `$${data?.earnings?.availableBalance ?? 0}`, icon: TrendingUp, color: "text-green-600 bg-green-50" },
                        { label: "Paid Out", value: `$${data?.earnings?.paidEarnings ?? 0}`, icon: CheckCircle, color: "text-purple-600 bg-purple-50" },
                        { label: "Total Referrals", value: data?.earnings?.totalReferrals ?? 0, icon: Users, color: "text-amber-600 bg-amber-50" },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                            <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
                        </div>
                    ))}
                </div>

                {/* How it works */}
                <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
                    <p className="text-sm font-bold text-blue-900 mb-2">How It Works</p>
                    <ul className="text-sm text-blue-800 space-y-1.5">
                        <li>① Share your referral link with potential customers</li>
                        <li>② When they sign up and pay, you earn a commission</li>
                        <li>③ Commissions are reviewed and approved by our team</li>
                        <li>④ Request payouts via PayPal or Zelle through your Settings</li>
                    </ul>
                </div>
            </div>
        </AffiliateLayout>
    );
}
