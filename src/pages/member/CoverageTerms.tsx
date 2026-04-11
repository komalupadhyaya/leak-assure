import { Link } from "react-router-dom";
import { Shield, FileText, CheckCircle2, ArrowLeft, Download } from "lucide-react";

export default function CoverageTerms() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6">
            <div className="max-w-3xl mx-auto">
                <Link to="/member/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 group">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
                        <Shield className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10" />
                        <div className="relative z-10">
                            <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold mb-2 tracking-tight">Full Coverage Terms</h1>
                            <p className="text-slate-400 font-medium tracking-wide">Leak Assure Protection Plan — Service Contract Agreement</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-10 space-y-10">
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">1. Overview of Protection</h2>
                            <p className="text-slate-600 leading-relaxed">
                                This Service Contract Agreement provides coverage for sudden and accidental failure of the interior plumbing system at the designated service address. This is not an insurance policy, but a service contract for repair or remediation of specific plumbing failures.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">2. What is Covered</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    "Interior Plumbing Leak Protection",
                                    "Burst Supply Lines (Hot & Cold)",
                                    "Slab Leaks (Interior)",
                                    "Frozen Pipe Bursts",
                                    "Drain & Toilet Clog Removal",
                                    "Shutoff Valve Failures",
                                    "Water Heater Connection Leaks",
                                    "Wall/Ceiling Access & Patch Repair"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-semibold text-slate-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">3. Waiting Period</h2>
                            <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
                                <p className="text-amber-900 font-bold mb-2 uppercase text-xs tracking-widest">Important: 30-Day Enrollment Period</p>
                                <p className="text-sm text-amber-800 leading-relaxed font-medium">
                                    All new protection plans are subject to a 30-day waiting period from the date of initial payment. Any leaks, failures, or emergencies occurring within the first 30 days of enrollment are strictly ineligible for coverage or reimbursement.
                                </p>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">4. Service Fees</h2>
                            <p className="text-slate-600 leading-relaxed">
                                A service fee applies to each approved claim visit and is due at the time the specialist arrives.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 bg-white border border-slate-200 p-5 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Essential Plan</p>
                                    <p className="text-2xl font-bold text-slate-900">$150 Fee</p>
                                </div>
                                <div className="flex-1 bg-white border border-slate-200 p-5 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Premium Plan</p>
                                    <p className="text-2xl font-bold text-slate-900">$100 Fee</p>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-2">5. Major Exclusions</h2>
                            <p className="text-slate-600 leading-relaxed italic text-sm">
                                The following are not covered under any Leak Assure Protection Plan:
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Pre-existing plumbing conditions or leaks",
                                    "Gradual seepage or slow leaks (months in duration)",
                                    "Storm, flood, or external water intrusion",
                                    "Homeowner negligence or improper DIY modifications",
                                    "Main water supply line (Outside the home structure)",
                                    "Septic tanks or external sewer issues",
                                    "Foundation damage or mold remediation"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-500">
                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Footer / CTA */}
                        <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="text-sm text-slate-400 font-medium">
                                Last Updated: April 2026
                            </div>
                            <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 group">
                                <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                                Download PDF Agreement
                            </button>
                        </div>
                    </div>
                </div>
                
                <p className="mt-8 text-center text-xs text-slate-400 font-medium tracking-tight">
                    Leak Assure Home Protection &copy; 2026. This is a private service contract agreement.
                </p>
            </div>
        </div>
    );
}
