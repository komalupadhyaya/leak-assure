import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { affiliateSignup } from "@/services/affiliateApi";
import { Droplets, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function AffiliateSignup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", paypalEmail: "", zelleInfo: "" });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await affiliateSignup(form);
            setSuccess(true);
        } catch (err: any) {
            toast.error(err.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    if (success) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted</h2>
                <p className="text-slate-500 text-sm mb-6">Your affiliate account is pending admin approval. We'll notify you once it's reviewed.</p>
                <Link to="/affiliate/login" className="text-blue-600 font-semibold hover:underline text-sm">Back to Login</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                <div className="flex items-center gap-2 mb-6">
                    <Droplets className="h-7 w-7 text-blue-600" />
                    <div>
                        <p className="font-bold text-slate-900">Leak Assure</p>
                        <p className="text-sm text-slate-500">Affiliate Program</p>
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Apply as Affiliate</h1>
                <p className="text-sm text-slate-500 mb-6">Earn $5 per referral that converts to a paid plan.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Full Name" required value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    <input type="email" placeholder="Email Address" required value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    <input type="password" placeholder="Password (min 8 chars)" required value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    <div className="border-t border-slate-100 pt-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Payout Info</p>
                        <input type="email" placeholder="PayPal Email" required value={form.paypalEmail}
                            onChange={e => setForm({ ...form, paypalEmail: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mb-3" />
                        <input type="text" placeholder="Zelle Email or Phone (optional)" value={form.zelleInfo}
                            onChange={e => setForm({ ...form, zelleInfo: e.target.value })}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all">
                        {loading ? "Submitting…" : "Submit Application"}
                    </button>
                </form>
                <p className="text-center text-sm text-slate-500 mt-6">
                    Already have an account?{" "}
                    <Link to="/affiliate/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
