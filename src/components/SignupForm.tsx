import { useState, useEffect } from "react";
import { startSignup } from "@/services/api";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { X } from "lucide-react";

// ──────────────────────────────────────────────
// Coverage Terms Modal
// ──────────────────────────────────────────────
function CoverageTermsModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] sm:max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 font-sans">Policy Coverage Terms</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto px-5 sm:px-6 py-5 text-sm text-slate-600 space-y-4">
                    <p className="font-semibold text-gray-900 underline">Leak Assure — Service Contract Terms</p>

                    <p>
                        <strong>1. Coverage Scope.</strong> Leak Assure provides coverage for sudden and accidental
                        interior plumbing failures, including burst pipes, slab leaks, and concealed water damage
                        that occurs within the insured property's plumbing system.
                    </p>
                    <p>
                        <strong>2. Waiting Period.</strong> A 30-day waiting period applies from the date of
                        enrollment. Claims submitted for incidents occurring during this period will not be
                        eligible for coverage.
                    </p>
                    <p>
                        <strong>3. Coverage Limits.</strong> Total coverage is subject to the limits specified in
                        your selected plan. Essential Protection covers up to $1,000 per incident; Premium
                        Protection covers up to $2,000 per incident.
                    </p>
                    <p>
                        <strong>4. Exclusions.</strong> Coverage does not apply to pre-existing conditions, gradual
                        leaks, storm damage, negligence, or damage caused by the homeowner's modifications to the
                        plumbing system.
                    </p>
                    <p>
                        <strong>5. Claims Process.</strong> To file a claim, contact Leak Assure support within
                        48 hours of discovering damage. A licensed plumber approved by Leak Assure must assess
                        the damage before repairs begin.
                    </p>
                    <p>
                        <strong>6. Service Fees.</strong> A service fee applies to each claim visit: $99 for Essential
                        Protection and $49 for Premium Protection.
                    </p>
                    <p>
                        <strong>7. Cancellation.</strong> You may cancel your subscription at any time. Coverage
                        remains active through the end of the current billing period.
                    </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-md bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────────
// Field-level error message
// ──────────────────────────────────────────────
function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1 text-xs text-red-500">{message}</p>;
}

// ──────────────────────────────────────────────
// SignupForm
// ──────────────────────────────────────────────
interface FormValues {
    fullName: string;
    email: string;
    phone: string;
    serviceAddress: string;
    plan: "essential" | "premium" | "";
    smsOptIn: boolean;
    coverageAgreed: boolean;
    password: string;
    confirmPassword: string;
    latitude?: number;
    longitude?: number;
}

interface FormErrors {
    fullName?: string;
    email?: string;
    phone?: string;
    serviceAddress?: string;
    plan?: string;
    coverageAgreed?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
}

const PLANS = [
    {
        value: "essential",
        label: "Essential Protection",
        price: 29,
        limit: "$1,000",
        claims: "2 claims/year",
        fee: "$99 fee"
    },
    {
        value: "premium",
        label: "Premium Protection",
        price: 49,
        limit: "$2,000",
        claims: "3 claims/year",
        fee: "$49 fee"
    },
] as const;

export function SignupForm() {
    const [form, setForm] = useState<FormValues>({
        fullName: "",
        email: "",
        phone: "",
        serviceAddress: "",
        plan: "",
        smsOptIn: false,
        coverageAgreed: false,
        password: "",
        confirmPassword: "",
        latitude: undefined,
        longitude: undefined,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);


    // ── handlers ──
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        // Clear the error for this field on change
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    // ── validation ──
    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!form.fullName.trim()) newErrors.fullName = "Full name is required.";
        if (!form.email.trim()) {
            newErrors.email = "Email address is required.";
        } else if (!emailRegex.test(form.email)) {
            newErrors.email = "Please enter a valid email address.";
        }
        if (!form.phone.trim()) newErrors.phone = "Phone number is required.";
        if (!form.serviceAddress.trim())
            newErrors.serviceAddress = "Service address is required.";
        if (!form.plan) newErrors.plan = "Please select a plan.";
        if (!form.coverageAgreed)
            newErrors.coverageAgreed =
                "You must agree to the Coverage Terms to continue.";

        if (!form.password) {
            newErrors.password = "Password is required.";
        } else if (form.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters.";
        }

        if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ── submit ──
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            const { url } = await startSignup({
                fullName: form.fullName,
                email: form.email,
                phone: form.phone,
                serviceAddress: form.serviceAddress,
                plan: form.plan as "essential" | "premium",
                smsOptIn: form.smsOptIn,
                password: form.password,
                latitude: form.latitude,
                longitude: form.longitude,
            });
            window.location.href = url;
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Something went wrong. Please try again.";
            setErrors({ general: message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = (field: keyof FormErrors) =>
        `w-full rounded-xl border px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 shadow-sm ${errors[field]
            ? "border-red-400 focus:ring-red-500/10"
            : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
        }`;

    return (
        <>
            {showTermsModal && (
                <CoverageTermsModal onClose={() => setShowTermsModal(false)} />
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* 1. Full Name */}
                <div>
                    <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Full Name"
                        value={form.fullName}
                        onChange={handleChange}
                        className={inputClass("fullName")}
                        autoComplete="name"
                    />
                    <FieldError message={errors.fullName} />
                </div>

                {/* 2. Email Address */}
                <div>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        value={form.email}
                        onChange={handleChange}
                        className={inputClass("email")}
                        autoComplete="email"
                    />
                    <FieldError message={errors.email} />
                </div>

                {/* 3. Phone Number */}
                <div>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Phone Number"
                        value={form.phone}
                        onChange={handleChange}
                        className={inputClass("phone")}
                        autoComplete="tel"
                    />
                    <FieldError message={errors.phone} />
                </div>

                {/* 4. Service Address */}
                <div>
                    <AddressAutocomplete
                        value={form.serviceAddress}
                        onSelect={(address, lat, lon) => {
                            setForm(prev => ({
                                ...prev,
                                serviceAddress: address,
                                latitude: lat,
                                longitude: lon
                            }));
                            setErrors(prev => ({ ...prev, serviceAddress: undefined }));
                        }}
                        error={!!errors.serviceAddress}
                        className={inputClass("serviceAddress")}
                    />
                    <FieldError message={errors.serviceAddress} />
                </div>

                {/* 5. Select Protection Plan (Hidden select, used for accessibility/form) */}
                <div className="space-y-4">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] block ml-1">
                        Select Your Protection Plan
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {PLANS.map((p) => {
                            const isSelected = form.plan === p.value;
                            return (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => {
                                        setForm(prev => ({ ...prev, plan: p.value }));
                                        setErrors(prev => ({ ...prev, plan: undefined }));
                                    }}
                                    className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 group hover:shadow-md ${isSelected
                                        ? "border-blue-600 bg-blue-50/50 ring-4 ring-blue-500/5 shadow-blue-100/20"
                                        : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
                                        }`}
                                >
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                                            <div className="h-2 w-2 bg-white rounded-full"></div>
                                        </div>
                                    )}
                                    <h4 className={`font-bold text-sm mb-1 ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
                                        {p.label}
                                    </h4>
                                    <p className="text-xl font-black text-slate-900 mb-3 tracking-tight">${p.price}<span className="text-xs font-medium text-slate-400 tracking-normal ml-0.5">/mo</span></p>
                                    <ul className="space-y-2">
                                        <li className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                                            <div className={`h-1 w-1 rounded-full ${isSelected ? 'bg-blue-400' : 'bg-slate-300'}`} />
                                            {p.limit} limit per incident
                                        </li>
                                        <li className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                                            <div className={`h-1 w-1 rounded-full ${isSelected ? 'bg-blue-400' : 'bg-slate-300'}`} />
                                            {p.claims}
                                        </li>
                                        <li className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                                            <div className={`h-1 w-1 rounded-full ${isSelected ? 'bg-blue-400' : 'bg-slate-300'}`} />
                                            {p.fee} service visit fee
                                        </li>
                                    </ul>
                                </button>
                            );
                        })}
                    </div>
                    {errors.plan && <FieldError message={errors.plan} />}
                </div>

                {/* 6. Password */}
                <div>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className={inputClass("password")}
                    />
                    <FieldError message={errors.password} />
                </div>

                {/* 7. Confirm Password */}
                <div>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm Password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className={inputClass("confirmPassword")}
                    />
                    <FieldError message={errors.confirmPassword} />
                </div>

                {/* SMS opt-in */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-slate-100/50">
                    <label className="flex items-start gap-4 cursor-pointer select-none">
                        <input
                            id="smsOptIn"
                            name="smsOptIn"
                            type="checkbox"
                            checked={form.smsOptIn}
                            onChange={handleChange}
                            className="mt-1 h-5 w-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer flex-shrink-0 transition-all"
                        />
                        <span className="text-[13px] text-slate-600 leading-relaxed font-medium">
                            I agree to receive SMS notifications regarding my Leak Assure
                            coverage and service updates.
                        </span>
                    </label>
                </div>

                {/* Coverage Terms */}
                <div
                    className={`rounded-2xl border p-4 transition-all ${errors.coverageAgreed
                        ? "border-red-200 bg-red-50/50"
                        : "border-slate-100 bg-slate-50/50 hover:bg-slate-100/50"
                        }`}
                >
                    <label className="flex items-start gap-4 cursor-pointer select-none">
                        <input
                            id="coverageAgreed"
                            name="coverageAgreed"
                            type="checkbox"
                            checked={form.coverageAgreed}
                            onChange={handleChange}
                            className={`mt-1 h-5 w-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer flex-shrink-0 transition-all ${errors.coverageAgreed ? 'border-red-400' : ''}`}
                        />
                        <span className="text-[13px] text-slate-600 leading-relaxed font-medium">
                            I understand coverage applies to sudden plumbing leaks and is
                            subject to coverage limits. I agree to the <button
                                type="button"
                                onClick={() => setShowTermsModal(true)}
                                className="text-blue-600 font-bold hover:underline underline-offset-4 decoration-2"
                            >
                                Coverage Terms
                            </button>.
                        </span>
                    </label>
                    <FieldError message={errors.coverageAgreed} />
                </div>

                {/* General error */}
                {errors.general && (
                    <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errors.general}
                    </div>
                )}

                {/* Submit */}
                <div className="pt-4">
                    <button
                        id="submitSignup"
                        type="submit"
                        disabled={isSubmitting}
                        className="group relative w-full bg-slate-900 text-white font-bold rounded-xl py-4 text-[13px] uppercase tracking-[0.1em] hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-[0.98] shadow-xl shadow-slate-200 overflow-hidden"
                    >
                        <span className="relative z-10">{isSubmitting ? "Processing Transaction…" : "Continue to Secure Payment"}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                    </button>

                    {/* Stripe badge */}
                    <p className="text-center text-[11px] text-slate-400 mt-6 flex items-center justify-center gap-2 font-medium">
                        🛡️ 256-bit encrypted checkout via <span className="font-bold text-slate-900 border-b border-slate-200">Stripe</span>
                    </p>
                </div>
            </form>
        </>
    );
}

export default SignupForm;
