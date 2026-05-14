import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ReferralRedirect() {
    const { slug } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const checkReferral = async () => {
            if (!slug) {
                navigate("/", { replace: true });
                return;
            }

            // List of reserved routes that should not be treated as referral slugs
            const reserved = ["login", "admin", "affiliate", "member", "success", "welcome", "cancel", "coverage-terms"];
            if (reserved.includes(slug.toLowerCase())) {
                // If it's a reserved path, let the normal routing handle it (this component shouldn't have been hit but as a safety)
                return;
            }

            try {
                const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
                const res = await fetch(`${API_URL}/api/affiliate/slug/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.referralCode) {
                        // Set the cookie on the root domain so it works across subdomains (admin, signup, member, etc.)
                        const domain = window.location.hostname.includes("leakassure.com") ? "; domain=.leakassure.com" : "";
                        document.cookie = `la_ref=${data.referralCode}; path=/; max-age=${60 * 60 * 24 * 1}; SameSite=Lax${domain}`;
                        console.log(`[Referral] Applied slug: ${slug}, code: ${data.referralCode}${domain}`);
                    }
                }
            } catch (err) {
                console.error("[Referral] Error checking slug:", err);
            } finally {
                // Always redirect to the main signup page
                navigate("/", { replace: true });
            }
        };

        checkReferral();
    }, [slug, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100" />
                <p className="text-slate-400 font-medium">Redirecting...</p>
            </div>
        </div>
    );
}
