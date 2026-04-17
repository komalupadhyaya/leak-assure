import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MemberLayout from "./MemberLayout";
import { fileMemberClaim, getMyProfile } from "@/services/api";
import {
    AlertTriangle,
    ChevronRight,
    ClipboardList,
    Camera,
    CheckCircle2,
    Calendar,
    Clock,
    MapPin,
    Droplets
} from "lucide-react";
import { toast } from "sonner";

const FileClaim = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [claimId, setClaimId] = useState("");
    const [profile, setProfile] = useState<any>(null);
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        leakType: "",
        room: "",
        floorLevel: "",
        specificLocation: "",
        isActiveLeak: "Unsure",
        dateFirstNoticed: "",
        leakDuration: "",
        description: "",
        attemptedRepairs: "No",
        repairDetails: "",
        callbackPhone: "",
        bestTimeToReach: [] as string[]
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getMyProfile();
                setProfile(data);
                setFormData(prev => ({
                    ...prev,
                    callbackPhone: data.phone || ""
                }));
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            }
        };
        fetchProfile();
    }, []);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setPhotos(prev => [...prev, ...filesArray].slice(0, 5));

            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setPhotoPreviews(prev => [...prev, ...newPreviews].slice(0, 5));
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
        setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const toggleReachTime = (time: string) => {
        setFormData(prev => ({
            ...prev,
            bestTimeToReach: prev.bestTimeToReach.includes(time)
                ? prev.bestTimeToReach.filter(t => t !== time)
                : [...prev.bestTimeToReach, time]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.leakType || !formData.room || !formData.floorLevel || !formData.description) {
            toast.error("Please fill in all required fields (marked with *)");
            return;
        }

        if (photos.length === 0) {
            toast.error("Please upload at least one photo of the leak");
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach(v => data.append(key, v));
                } else {
                    data.append(key, value);
                }
            });

            photos.forEach(photo => {
                data.append('photos', photo);
            });

            const result = await fileMemberClaim(data);
            setClaimId(result.claim._id);
            setIsSubmitted(true);
            toast.success("Claim submitted successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to submit claim. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <MemberLayout>
                <div className="max-w-2xl mx-auto py-12 px-4 transition-all animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="bg-white rounded-[2.5rem] p-10 sm:p-16 border border-slate-100 shadow-2xl shadow-blue-500/5 text-center space-y-8">
                        <div className="mx-auto w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-3xl font-extrabold text-slate-900">Claim Registered</h1>
                            <p className="text-slate-500 text-lg">Your claim has been submitted successfully.</p>
                        </div>

                        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Registration ID</p>
                            <p className="text-2xl font-mono font-bold text-blue-600 tracking-wider">#{claimId.slice(-8).toUpperCase()}</p>
                        </div>



                        <button
                            onClick={() => navigate("/member/dashboard")}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-slate-200"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </MemberLayout>
        );
    }

    return (
        <MemberLayout>
            <div className="max-w-3xl mx-auto space-y-6 sm:space-y-10 pb-20 px-4">
                <header className="text-center pt-4">
                    <div className="inline-flex items-center justify-center p-4 bg-blue-100 rounded-3xl mb-4">
                        <ClipboardList className="h-8 w-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">File a Claim</h1>
                    <p className="text-lg text-slate-500 mt-3 max-w-lg mx-auto">Complete the form below to register your leak. Most claims take under 5 minutes.</p>
                </header>

                <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border border-slate-200 p-6 sm:p-12 shadow-2xl shadow-slate-200/50 space-y-10">

                    {/* Section: Member Info (Pre-filled) */}
                    <div className="space-y-6 pb-6 border-b border-slate-100">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Member Name</label>
                                <p className="font-semibold text-slate-700">{profile?.fullName || "Loading..."}</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                                <p className="font-semibold text-slate-700">{profile?.email || "Loading..."}</p>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Address</label>
                            <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                {profile?.serviceAddress || "Loading..."}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Question 1: Leak Type */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</div>
                                What type of leak are you experiencing? *
                            </label>
                            <select
                                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all appearance-none cursor-pointer"
                                value={formData.leakType}
                                onChange={(e) => setFormData({ ...formData, leakType: e.target.value })}
                                required
                            >
                                <option value="">Select an issue type...</option>
                                <option value="Interior Plumbing Leak Protection">Interior Plumbing Leak Protection</option>
                                <option value="Drain & Toilet Clog Removal">Drain & Toilet Clog Removal</option>
                                <option value="Appliance Water Line Leaks">Appliance Water Line Leaks</option>
                                <option value="Water Heater Connection Leaks">Water Heater Connection Leaks</option>
                                <option value="Plumbing Leaks Behind Walls">Plumbing Leaks Behind Walls</option>
                                <option value="Ceiling Leak Sources (Plumbing Only)">Ceiling Leak Sources (Plumbing Only)</option>
                                <option value="Shutoff Valve Failures">Shutoff Valve Failures</option>
                                <option value="Limited Drywall Access & Other">Limited Drywall Access & Other</option>
                            </select>
                        </div>

                        {/* Question 2: Room */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</div>
                                Which room is affected? *
                            </label>
                            <select
                                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all appearance-none cursor-pointer"
                                value={formData.room}
                                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                required
                            >
                                <option value="">Select a room...</option>
                                <option value="Kitchen">Kitchen</option>
                                <option value="Primary Bathroom">Primary Bathroom</option>
                                <option value="Guest Bathroom">Guest Bathroom</option>
                                <option value="Laundry Room">Laundry Room</option>
                                <option value="Basement">Basement</option>
                                <option value="Utility Room">Utility Room</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Question 3: Floor Level */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</div>
                                What floor/level? *
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                {["Basement", "Crawl Space", "1st Floor", "2nd Floor", "3rd Floor"].map((floor) => (
                                    <button
                                        key={floor}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, floorLevel: floor })}
                                        className={`h-12 rounded-xl border text-xs font-bold transition-all ${formData.floorLevel === floor
                                            ? "bg-slate-900 text-white border-slate-900 shadow-md"
                                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                            }`}
                                    >
                                        {floor}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Question 4: Specific Detail */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">4</div>
                                Specific location detail (Optional)
                            </label>
                            <input
                                type="text"
                                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                                placeholder='e.g. "under the kitchen sink, left supply line"'
                                value={formData.specificLocation}
                                onChange={(e) => setFormData({ ...formData, specificLocation: e.target.value })}
                            />
                        </div>

                        {/* Question 5: Is active */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">5</div>
                                Is the leak currently active? *
                            </label>
                            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                                {["Yes", "No", "Unsure"].map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, isActiveLeak: opt })}
                                        className={`flex-1 h-11 rounded-xl text-sm font-bold transition-all ${formData.isActiveLeak === opt
                                            ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                                            : "text-slate-500 hover:text-slate-700"
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Question 6: Date First Noticed */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">6</div>
                                    Date first noticed? *
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                    <input
                                        type="date"
                                        className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-5 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                                        value={formData.dateFirstNoticed}
                                        onChange={(e) => setFormData({ ...formData, dateFirstNoticed: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Question 7: How long leaking */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">7</div>
                                    How long has it been leaking? *
                                </label>
                                <select
                                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all appearance-none cursor-pointer"
                                    value={formData.leakDuration}
                                    onChange={(e) => setFormData({ ...formData, leakDuration: e.target.value })}
                                    required
                                >
                                    <option value="">Select duration...</option>
                                    <option value="Just noticed">Just noticed</option>
                                    <option value="Less than 24 hours">Less than 24 hours</option>
                                    <option value="1–3 days">1–3 days</option>
                                    <option value="4–7 days">4–7 days</option>
                                    <option value="Over a week">Over a week</option>
                                </select>
                            </div>
                        </div>

                        {/* Question 8: Description */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">8</div>
                                Brief description *
                            </label>
                            <textarea
                                className="w-full min-h-[120px] bg-slate-50 border border-slate-200 rounded-[1.5rem] p-5 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all resize-none"
                                placeholder="Tell us what's happening (2-3 sentences)..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        {/* Question 9: Attempted repairs */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">9</div>
                                Have you attempted any repairs? *
                            </label>
                            <div className="flex gap-4">
                                {["Yes", "No"].map((v) => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, attemptedRepairs: v })}
                                        className={`flex-1 h-12 rounded-xl border text-sm font-bold transition-all ${formData.attemptedRepairs === v
                                            ? "bg-slate-900 text-white border-slate-900"
                                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                            }`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>

                            {formData.attemptedRepairs === "Yes" && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 mt-4">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Please describe what was done</label>
                                    <textarea
                                        className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all resize-none shadow-sm"
                                        placeholder="Explain your repair attempt..."
                                        value={formData.repairDetails}
                                        onChange={(e) => setFormData({ ...formData, repairDetails: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Photo Upload */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">10</div>
                                Upload leak photos * (At least 1 required)
                            </label>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {photoPreviews.map((preview, i) => (
                                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group">
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(i)}
                                            className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}

                                {photos.length < 5 && (
                                    <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group">
                                        <Camera className="h-6 w-6 text-slate-400 group-hover:text-blue-500" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase group-hover:text-blue-500">Add Photo</span>
                                        <input type="file" multiple accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                    </label>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-400">Standard JPG or PNG. Maximum 5 photos.</p>
                        </div>

                        {/* Callback & Time */}
                        <div className="space-y-8 pt-6 border-t border-slate-100">
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700">Best callback number *</label>
                                <input
                                    type="tel"
                                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                                    value={formData.callbackPhone}
                                    onChange={(e) => setFormData({ ...formData, callbackPhone: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-slate-400" />
                                    Best time to reach you
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {["Morning", "Afternoon", "Evening"].map((time) => (
                                        <button
                                            key={time}
                                            type="button"
                                            onClick={() => toggleReachTime(time)}
                                            className={`px-6 h-12 rounded-xl border text-sm font-bold transition-all ${formData.bestTimeToReach.includes(time)
                                                ? "bg-blue-50 text-blue-600 border-blue-600 shadow-sm"
                                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                                }`}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-extrabold py-6 rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-xl shadow-blue-500/20 "
                    >
                        {loading ? "Registering Claim..." : (
                            <>
                                Register Claim
                                <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-slate-400 font-medium">
                        By submitting, you agree to have a technician contact you regarding this leak.
                    </p>
                </form>

                <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100 flex items-start gap-5 shadow-sm shadow-blue-500/5">
                    <div className="p-3 bg-blue-600 rounded-2xl shrink-0 shadow-lg shadow-blue-500/30">
                        <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900 text-lg">Immediate Life Safety</h3>
                        <p className="text-sm text-blue-800 leading-relaxed mt-1 font-medium opacity-80">
                            Failure to act in a major flooding event could cause electrical hazards. If you are in immediate danger or experiencing extensive flooding, please shut off your main water valve immediately.
                        </p>
                    </div>
                </div>
            </div>
        </MemberLayout>
    );
};

export default FileClaim;
