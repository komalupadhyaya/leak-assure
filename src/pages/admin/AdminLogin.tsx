import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "@/services/api";
import { Shield, Mail, Lock, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const AdminLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await adminLogin(formData);
            localStorage.setItem('admin_token', data.token);
            localStorage.setItem('admin_user', JSON.stringify(data.user));

            toast.success("Welcome, Administrator");
            navigate("/admin/dashboard");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Invalid admin credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full">
                <div className="text-center mb-10 text-white">
                    <div className="inline-flex items-center justify-center p-4 bg-slate-800 rounded-3xl shadow-2xl shadow-blue-500/10 mb-6 border border-slate-700">
                        <Shield className="h-10 w-10 text-blue-400" />
                    </div>
                    <h1 className="text-3xl font-bold">Admin Registry</h1>
                    <p className="text-slate-400 mt-2 italic text-sm">Leak Assure Control Panel</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-800 rounded-3xl border border-slate-700 p-10 shadow-2xl shadow-black/50 space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Staff ID / Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="email"
                                    className="w-full h-14 bg-slate-900 border border-slate-700 rounded-2xl pl-12 pr-4 text-white font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                    placeholder="admin@leakassure.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Access Key</label>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="password"
                                    className="w-full h-14 bg-slate-900 border border-slate-700 rounded-2xl pl-12 pr-4 text-white font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
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
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 group"
                    >
                        {loading ? "Verifying Credentials..." : (
                            <>
                                Authenticate
                                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                            Restricted Access — Authorized Personnel Only
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
