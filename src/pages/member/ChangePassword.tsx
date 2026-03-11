import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "@/services/api";
import { Shield, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const ChangePassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("The passwords you entered do not match.");
            return;
        }

        setLoading(true);
        try {
            await changePassword(password);

            // Update stored user if exists
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                user.forcePasswordChange = false;
                localStorage.setItem('user', JSON.stringify(user));
            }

            toast.success("Your password has been updated. Welcome to Leak Assure!");

            navigate("/member/dashboard");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-10 pb-20 px-6 items-center justify-center">
            <nav className="max-w-xl mx-auto w-full mb-10 flex items-center justify-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-bold text-gray-900 tracking-tight">Leak Assure</span>
            </nav>

            <main className="max-w-[440px] mx-auto w-full">
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 border border-slate-100">
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="h-12 w-12 sm:h-16 sm:w-16 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <Lock className="h-6 w-6 sm:h-8 sm:h-8 text-blue-600" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Secure Your Account</h1>
                        <p className="text-slate-500 text-xs sm:text-sm">
                            Please set a permanent password to continue to your dashboard.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                placeholder="Min 8 characters"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                placeholder="Repeat your new password"
                                required
                            />
                        </div>

                        <ul className="space-y-2 py-2">
                            <li className="flex items-center gap-2 text-xs text-slate-500">
                                <CheckCircle2 className={`h-4 w-4 ${password.length >= 8 ? 'text-green-500' : 'text-slate-300'}`} />
                                At least 8 characters
                            </li>
                            <li className="flex items-center gap-2 text-xs text-slate-500">
                                <CheckCircle2 className={`h-4 w-4 ${password === confirmPassword && password !== "" ? 'text-green-500' : 'text-slate-300'}`} />
                                Passwords match
                            </li>
                        </ul>

                        <button
                            type="submit"
                            disabled={loading || !password || password !== confirmPassword}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                        >
                            {loading ? "Updating..." : "Set Password & Continue"}
                            {!loading && <ArrowRight className="h-5 w-5" />}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default ChangePassword;
