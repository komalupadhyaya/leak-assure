import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "@/services/api";
import { Droplets, Mail, Lock, ChevronRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await login(formData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            toast.success("Welcome back!");

            if (data.user.forcePasswordChange) {
                navigate("/member/change-password");
            } else {
                navigate("/member/dashboard");
            }
        } catch (error) {

            toast.error(error instanceof Error ? error.message : "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-4 bg-white rounded-3xl shadow-xl shadow-blue-500/5 mb-6">
                        <Droplets className="h-10 w-10 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Member Portal</h1>
                    <p className="text-slate-500 mt-2">Manage your Leak Assure protection.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-10 shadow-xl shadow-slate-200/50 space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    type="email"
                                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-slate-900 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                    placeholder="name@company.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                                <button type="button" className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700">Forgot?</button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    type="password"
                                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 text-slate-900 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 group"
                    >
                        {loading ? "Authenticating..." : (
                            <>
                                Sign In
                                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
                        <p className="text-[11px] text-blue-800 leading-tight">
                            Don't have an account? Your login is created as part of the <Link to="/" className="font-bold underline">home protection signup</Link>.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
