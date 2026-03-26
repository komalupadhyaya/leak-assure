import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { affiliateLogin } from "@/services/affiliateApi";
import { Droplets } from "lucide-react";
import { toast } from "sonner";

export default function AffiliateLogin() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await affiliateLogin(form.email, form.password);
            localStorage.setItem("affiliate_token", data.token);
            localStorage.setItem("affiliate_user", JSON.stringify(data.affiliate));
            navigate("/affiliate/dashboard");
        } catch (err: any) {
            toast.error(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                <div className="flex items-center gap-2 mb-6">
                    <Droplets className="h-7 w-7 text-blue-600" />
                    <div>
                        <p className="font-bold text-slate-900">Leak Assure</p>
                        <p className="text-sm text-slate-500">Affiliate Portal</p>
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
                <p className="text-sm text-slate-500 mb-6">Sign in to your affiliate account</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email" placeholder="Email address" required
                        value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <input
                        type="password" placeholder="Password" required
                        value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button
                        type="submit" disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all"
                    >
                        {loading ? "Signing in…" : "Sign In"}
                    </button>
                </form>
                <p className="text-center text-sm text-slate-500 mt-6">
                    Don't have an account?{" "}
                    <Link to="/affiliate/signup" className="text-blue-600 font-semibold hover:underline">Apply now</Link>
                </p>
            </div>
        </div>
    );
}
