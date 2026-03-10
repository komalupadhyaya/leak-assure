import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MemberLayout from "./MemberLayout";
import { fileMemberClaim } from "@/services/api";
import {
    PlusCircle,
    AlertTriangle,
    ChevronRight,
    ShieldCheck,
    ClipboardList
} from "lucide-react";
import { toast } from "sonner";

const FileClaim = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        issueType: "",
        description: "",
        priority: "Medium"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.issueType || !formData.description) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            await fileMemberClaim(formData);
            toast.success("Claim submitted successfully! A leak specialist will be in touch shortly.");
            navigate("/member/dashboard");
        } catch (error) {
            toast.error("Failed to submit claim. Please try again or call our hotline.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MemberLayout>
            <div className="max-w-2xl mx-auto space-y-10">
                <header className="text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-3xl mb-4">
                        <ClipboardList className="h-8 w-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Submit a New Claim</h1>
                    <p className="text-slate-500 mt-2">Describe the issue and our team will coordinate a repair.</p>
                </header>

                <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Type of Issue</label>
                            <select
                                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                value={formData.issueType}
                                onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                                required
                            >
                                <option value="">Select an issue type...</option>
                                <option value="Burst Pipe">Burst Pipe</option>
                                <option value="Severe Leak">Severe Leak</option>
                                <option value="Clogged Drain">Clogged Drain / Sewer Backup</option>
                                <option value="Water Heater Issue">Water Heater Issue</option>
                                <option value="Other">Other Emergency</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Issue Description</label>
                            <textarea
                                className="w-full min-h-[160px] bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                                placeholder="Please describe the leak or plumbing emergency in detail..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Priority Level</label>
                            <div className="grid grid-cols-3 gap-4">
                                {['Low', 'Medium', 'High'].map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, priority: p })}
                                        className={`h-12 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border
                      ${formData.priority === p
                                                ? (p === 'High' ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-200' :
                                                    p === 'Medium' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' :
                                                        'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200')
                                                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}
                    `}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-xl shadow-blue-500/10"
                    >
                        {loading ? "Submitting..." : (
                            <>
                                Register Claim
                                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100 flex items-start gap-4">
                    <div className="p-2 bg-blue-600 rounded-lg shrink-0">
                        <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900">Life Safety Warning</h3>
                        <p className="text-sm text-blue-800 leading-relaxed mt-1">
                            If you are in immediate danger or experiencing extensive flooding, please shut off your main water valve immediately after submitting this claim.
                        </p>
                    </div>
                </div>
            </div>
        </MemberLayout>
    );
};

export default FileClaim;
