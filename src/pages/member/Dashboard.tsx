import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MemberLayout from "./MemberLayout";
import { getMyProfile, getMemberClaims } from "@/services/api";
import {
    Shield,
    MapPin,
    PlusCircle,
    CheckCircle2,
    Clock,
    ArrowRight,
    DollarSign,
    FileText,
    History
} from "lucide-react";

const Dashboard = () => {
    const [profile, setProfile] = useState<any>(null);
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileData, claimsData] = await Promise.all([
                    getMyProfile(),
                    getMemberClaims()
                ]);
                setProfile(profileData);
                setClaims(claimsData.slice(0, 3)); // Show top 3 recent
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                if (error instanceof Error && error.message.includes('401')) {
                    window.location.href = '/login';
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <MemberLayout>
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        </MemberLayout>
    );

    if (!profile) return <MemberLayout><p className="text-center text-slate-500 py-20">User profile not found.</p></MemberLayout>;

    const isPremium = profile.plan?.toLowerCase() === 'premium';
    const isActive = profile.subscriptionStatus === 'active';

    const planDetails = isPremium
        ? { incidentLimit: "$2,000", claimsPerYear: "3 claims/year", serviceFee: "$49 per visit" }
        : { incidentLimit: "$1,000", claimsPerYear: "2 claims/year", serviceFee: "$99 per visit" };

    const coverageStarted = profile.waitingPeriodEnd && new Date(profile.waitingPeriodEnd) < new Date();

    const formatStatus = (status: string) => {
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'under_review': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'approved': return 'bg-green-50 text-green-700 border-green-100';
            case 'denied': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    return (
        <MemberLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <header>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome back, {profile.fullName.split(' ')[0]}</h1>
                    <p className="text-slate-500 mt-1 text-sm">Here's your protection overview.</p>
                </header>

                {/* Main Status Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Shield className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 capitalize">{profile.plan} Protection Plan</h2>
                                <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                                    <MapPin className="h-3 w-3" /> {profile.serviceAddress}
                                </p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {profile.subscriptionStatus}
                        </span>
                    </div>

                    {/* Plan Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 border-t md:border-t-0 border-slate-100">
                        <div className="p-5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Cost</p>
                            <p className="text-xl font-bold text-slate-900">${profile.planPrice || (isPremium ? 49 : 29)}</p>
                        </div>
                        <div className="p-5 sm:border-l sm:border-slate-100 md:border-l-0">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Incident Limit</p>
                            <p className="text-xl font-bold text-slate-900">{planDetails.incidentLimit}</p>
                        </div>
                        <div className="p-5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Claims Per Year</p>
                            <p className="text-xl font-bold text-slate-900">{planDetails.claimsPerYear}</p>
                        </div>
                        <div className="p-5 sm:border-l sm:border-slate-100 md:border-l-0">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Service Fee</p>
                            <p className="text-xl font-bold text-slate-900">{planDetails.serviceFee}</p>
                        </div>
                    </div>
                </div>

                {/* Coverage Status / Waiting Period Notice */}
                {!coverageStarted && profile.waitingPeriodEnd && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
                        <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="font-bold text-amber-900 text-sm">Waiting Period Active</p>
                            <p className="text-xs text-amber-700 leading-relaxed mt-1">
                                Your protection plan is active, but your coverage begins after the 30-day waiting period.
                                Coverage will start on <span className="font-bold">{new Date(profile.waitingPeriodEnd).toLocaleDateString()}</span>.
                            </p>
                        </div>
                    </div>
                )}

                {/* Recent Claims Section */}
                {claims.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History className="h-5 w-5 text-slate-400" />
                                <h3 className="font-bold text-slate-900">Recent Claims</h3>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                            {claims.map((claim) => (
                                <div key={claim.claimId} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{claim.issueType}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">Submitted on {new Date(claim.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(claim.status)}`}>
                                        {formatStatus(claim.status)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Action Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* File a Claim */}
                    <div className="bg-slate-900 rounded-xl p-6 text-white">
                        <div className="flex items-center gap-3 mb-3">
                            <PlusCircle className="h-5 w-5 text-blue-400" />
                            <h3 className="font-bold">File a Claim</h3>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed mb-5">Experiencing a leak or plumbing emergency? Submit a claim and our specialist will respond promptly.</p>
                        <Link
                            to="/member/file-claim"
                            className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-bold transition-all ${coverageStarted
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "bg-slate-700 text-slate-500 cursor-not-allowed pointer-events-none"
                                }`}
                        >
                            {coverageStarted ? (
                                <><PlusCircle className="h-4 w-4" /> Submit a Claim</>
                            ) : (
                                <><Clock className="h-4 w-4" /> Coverage Pending</>
                            )}
                        </Link>
                    </div>

                    {/* Policy Coverage */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="h-5 w-5 text-slate-400" />
                            <h3 className="font-bold text-slate-900">Coverage Includes</h3>
                        </div>
                        <ul className="space-y-2.5">
                            {[
                                "Internal Plumbing Protection",
                                "Sewer & Drainage Line Coverage",
                                "Emergency Response (2-4 hours)",
                                isPremium ? "Annual Maintenance Inspection" : "Priority Scheduling"
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                                    <div className="h-5 w-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </MemberLayout>
    );
};

export default Dashboard;
