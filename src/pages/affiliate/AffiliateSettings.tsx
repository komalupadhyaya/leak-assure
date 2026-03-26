import { useEffect, useState } from "react";
import AffiliateLayout from "./AffiliateLayout";
import { affiliateGetMe, affiliateUpdateSettings } from "@/services/affiliateApi";
import { toast } from "sonner";

export default function AffiliateSettings() {
    const [form, setForm] = useState({ paypalEmail: "", zelleInfo: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        affiliateGetMe()
            .then(d => setForm({ paypalEmail: d.affiliate.paypalEmail || "", zelleInfo: d.affiliate.zelleInfo || "" }))
            .catch(() => toast.error("Failed to load settings"))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await affiliateUpdateSettings(form);
            toast.success("Settings saved!");
        } catch (err: any) {
            toast.error(err.message || "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    return (
        <AffiliateLayout>
            <div className="max-w-lg space-y-6">
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                {loading ? (
                    <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
                ) : (
                    <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Payout Information</p>
                            <p className="text-xs text-paidslate-500 mb-4">Update where you'd like to receive your commissions.</p>
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1.5">PayPal Email</label>
                            <input type="email" value={form.paypalEmail}
                                onChange={e => setForm({ ...form, paypalEmail: e.target.value })}
                                placeholder="your@paypal.com"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Zelle Email or Phone</label>
                            <input type="text" value={form.zelleInfo}
                                onChange={e => setForm({ ...form, zelleInfo: e.target.value })}
                                placeholder="Email or phone for Zelle"
                                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <button type="submit" disabled={saving}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all">
                            {saving ? "Saving…" : "Save Settings"}
                        </button>
                    </form>
                )}
            </div>
        </AffiliateLayout>
    );
}
