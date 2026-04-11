import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Droplets, ArrowRight } from "lucide-react";
import { getSessionDetails, SessionDetails } from "@/services/api";

const Success = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();

  const [details, setDetails] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!sessionId) {
      navigate("/");
      return;
    }

    const fetchDetails = async () => {
      try {
        console.log("Fetching session details for auto-login...");
        const data = await getSessionDetails(sessionId);
        setDetails(data);
        
        if (data.token && data.user) {
          console.log("Session verified, storing credentials...");
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Set cookie for cross-subdomain support (if not on localhost)
          if (!window.location.hostname.includes('localhost')) {
              const domain = window.location.hostname.split('.').slice(-2).join('.');
              document.cookie = `token=${data.token}; path=/; domain=.${domain}; max-age=${7 * 24 * 60 * 60}; SameSite=Lax; Secure`;
          }
          
          // Force a small delay to ensure localStorage/cookies are committed before we start countdown
          timerRef.current = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                if (timerRef.current) clearInterval(timerRef.current);
                console.log("Auto-redirecting...");
                if (data.user?.forcePasswordChange) {
                    navigate("/member/change-password");
                } else {
                    navigate("/member/dashboard");
                }
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          console.warn("No token or user data returned for session.");
        }
      } catch (err) {
        console.error("Error fetching session details:", err);
        setError("Failed to load activation details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Droplets className="h-10 w-10 text-blue-600 animate-bounce mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Activating your protection...</p>
        </div>
      </div>
    );
  }

  const planRules = {
    essential: {
      claims: "2 claims per year",
      fee: "$150 per claim"
    },
    premium: {
      claims: "2 claims per year",
      fee: "$100 per claim"
    }
  };

  const currentPlan = details?.plan?.toLowerCase() === 'premium' ? planRules.premium : planRules.essential;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <main className="max-w-[520px] w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {error ? (
          <div className="p-10 text-center">
            <div className="h-14 w-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-red-600 text-2xl font-bold">!</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Activation Error</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-gray-900 text-white font-semibold rounded-md py-3 text-sm"
            >
              Back to Home
            </button>
          </div>
        ) : details && (
          <>
            {/* Top Message */}
            <div className="bg-green-50 p-8 text-center border-b border-green-100">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">You're Covered</h1>
              <p className="text-sm text-green-800 font-medium">
                Your Leak Assure protection plan has been successfully activated.
              </p>
            </div>

            {/* Details Section */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-y-5 gap-x-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Member Name</p>
                  <p className="text-gray-900 font-semibold">{details.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Service Address</p>
                  <p className="text-gray-900 font-semibold leading-tight">{details.serviceAddress}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Selected Plan</p>
                  <p className="text-gray-900 font-semibold capitalize">{details.plan} Protection</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Monthly Price</p>
                  <p className="text-gray-900 font-semibold">${details.price}/month</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Effective Date</p>
                  <p className="text-gray-900 font-semibold">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Claims Per Year</p>
                  <p className="text-gray-900 font-semibold">{currentPlan.claims}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Service Fee</p>
                  <p className="text-gray-900 font-semibold">{currentPlan.fee}</p>
                </div>
              </div>

              {/* Waiting Period Notice */}
              <div className="bg-slate-50 border border-gray-200 rounded-lg p-5">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Waiting Period Notice</h3>
                <p className="text-sm text-gray-600">
                  Coverage begins after the 30-day waiting period.
                </p>
                <p className="text-sm text-gray-900 font-bold mt-1">
                  Coverage begins on: {new Date(details.waitingPeriodEnd).toLocaleDateString()}
                </p>
              </div>

              {/* What Happens Next */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">WHAT HAPPENS NEXT</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Check your email for confirmation</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Save your coverage details for your records</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Use the Member Portal to file a claim when coverage begins</span>
                  </li>
                </ul>
              </div>

              {/* Countdown for auto-redirect */}
              {details?.token && (
                <div className="text-center py-2">
                  <p className="text-xs text-slate-400 font-medium animate-pulse">
                    Auto-redirecting to Member Portal in {countdown}s...
                  </p>
                </div>
              )}

              {/* CTA Button */}
              <button
                onClick={() => {
                  if (details?.user?.forcePasswordChange) {
                    navigate("/member/change-password");
                  } else {
                    navigate("/member/dashboard");
                  }
                }}
                className="w-full mt-2 bg-gray-900 text-white font-bold rounded-md py-3.5 text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
              >
                Go to Member Portal
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Success;
