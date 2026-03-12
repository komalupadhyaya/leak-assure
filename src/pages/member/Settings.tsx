import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MemberLayout from "./MemberLayout";
import { getMyProfile, memberCancelSelf } from "@/services/api";
import {
    User,
    ShieldOff,
    CreditCard,
    Mail,
    Smartphone,
    MapPin,
    Lock,
    ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { AlertModal } from "@/components/ui/AlertModal";

const Settings = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const fetchProfile = async () => {
        try {
            const data = await getMyProfile();
            setProfile(data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleCancelConfirm = async () => {
        try {
            await memberCancelSelf();
            toast.success("Subscription has been canceled.");
            fetchProfile();
        } catch (error) {
            toast.error("Failed to cancel subscription. Please contact support.");
        } finally {
            setIsCancelModalOpen(false);
        }
    };

    const handleCancelClick = () => {
        setIsCancelModalOpen(true);
    };

    if (loading) return <MemberLayout>Loading...</MemberLayout>;
    if (!profile) return <MemberLayout>Not found</MemberLayout>;

    return (
        <MemberLayout>
            <div className="max-w-4xl mx-auto space-y-8 lg:space-y-12 pb-20">
                <header>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Account Settings</h1>
                    <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">Manage your personal information and subscription preferrences.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Primary Settings */}
                    <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                        <section className="bg-white rounded-2xl lg:rounded-3xl border border-slate-200 overflow-hidden">
                            <div className="p-6 lg:p-8 border-b border-slate-100">
                                <h3 className="font-bold text-lg">Personal Details</h3>
                            </div>
                            <div className="p-6 lg:p-8 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                                        <User className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</p>
                                        <p className="text-md font-semibold text-slate-800">{profile.fullName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                                        <p className="text-md font-semibold text-slate-800">{profile.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                                        <Smartphone className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                                        <p className="text-md font-semibold text-slate-800">{profile.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                                        <MapPin className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Service Address</p>
                                        <p className="text-md font-semibold text-slate-800">{profile.serviceAddress}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-lg">Security</h3>
                            </div>
                            <div className="p-8">
                                <button
                                    onClick={() => navigate('/member/change-password')}
                                    className="flex items-center justify-between w-full group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center">
                                            <Lock className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-slate-800">Change Password</p>
                                            <p className="text-xs text-slate-500">Update your account login credentials</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Subscription Tab */}
                    <div className="space-y-8">
                        <div className="bg-slate-900 rounded-3xl p-8 text-white">
                            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest mb-4">
                                <CreditCard className="h-4 w-4" />
                                Plan Details
                            </div>
                            <h3 className="text-2xl font-bold mb-1 capitalize">{profile.plan}</h3>
                            <p className="text-slate-400 text-sm mb-8">${profile.planPrice || (profile.plan === 'premium' ? 49 : 29)} / month</p>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm py-3 border-t border-slate-800">
                                    <span className="text-slate-500">Status</span>
                                    <span className="font-bold flex items-center gap-2">
                                        <div className={`h-1.5 w-1.5 rounded-full ${profile.subscriptionStatus === 'active' ? 'bg-green-400' : 'bg-red-400'}`} />
                                        {profile.subscriptionStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {profile.subscriptionStatus !== 'canceled' && (
                            <button
                                onClick={handleCancelClick}
                                className="w-full flex items-center justify-center gap-2 p-4 text-red-500 font-bold text-sm bg-red-50 hover:bg-red-100 rounded-2xl transition-all border border-red-100"
                            >
                                <ShieldOff className="h-5 w-5" />
                                Cancel My Coverage
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <AlertModal
                isOpen={isCancelModalOpen}
                onOpenChange={setIsCancelModalOpen}
                title="Confirm Cancellation"
                description="Are you sure you want to cancel your coverage? Your home will no longer be protected starting the next billing cycle."
                confirmText="Cancel Coverage"
                cancelText="Keep My Protection"
                onConfirm={handleCancelConfirm}
                variant="destructive"
            />
        </MemberLayout>
    );
};

export default Settings;
