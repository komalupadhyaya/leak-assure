import { useState } from "react";
import AdminLayout from "./AdminLayout";
import { createAdminUser } from "@/services/api";
import { UserPlus, Shield, Mail, Lock, User, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createAdminUser(formData);
            toast.success("Admin user created successfully");
            setFormData({ fullName: "", email: "", password: "" });
        } catch (error: any) {
            toast.error(error.message || "Failed to create admin user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl space-y-8">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Admin Settings</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage administrative accounts and system preferences.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Create Admin Form */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <UserPlus className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm">Create New Admin</h3>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">Administrative Access</p>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-medium"
                                        placeholder="Enter full name"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-medium"
                                        placeholder="admin@leakassure.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Temporary Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        minLength={8}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-medium"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {loading ? "Creating..." : (
                                    <>
                                        Create Admin User
                                        <CheckCircle2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Roles Info */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
                            <Shield className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10" />
                            <h3 className="text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-4">Security Notice</h3>
                            <p className="text-sm text-slate-300 leading-relaxed mb-6">
                                New administrative users will have full access to the Leak Assure admin panel, including member data, claims management, and pricing settings.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Access to member private info",
                                    "Approve or deny claims",
                                    "Manage affiliate commissions",
                                    "Modify system settings"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-xs font-medium text-slate-400">
                                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                            <p className="text-amber-800 text-xs font-bold leading-relaxed">
                                IMPORTANT: Be sure to provide the email and temporary password to the new administrator after creation. They should change their password upon first login.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Settings;
