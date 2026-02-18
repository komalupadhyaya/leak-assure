import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const Success = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!sessionId) {
      console.log("No session ID found in URL");
      setStatus("error");
      return;
    }

    const verifySession = async () => {
      try {
        console.log("Verifying session ID:", sessionId);
        const res = await fetch(`http://localhost:5000/api/checkout/verify-session?session_id=${sessionId}`);
        const data = await res.json();

        if (data.success) {
          setStatus("success");
          toast.success("Payment verified successfully!");
        } else {
          console.error("Verification failed:", data.message);
          setStatus("error");
          toast.error(data.message || "Payment verification failed");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        toast.error("Failed to verify payment");
      }
    };

    verifySession();
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Verifying Payment...</h1>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Verification Failed</h1>
          <p className="text-lg text-muted-foreground mb-8">
            We couldn't verify your payment. Please contact support or try again.
          </p>
          <Link
            to="/"
            className="inline-flex rounded-lg px-8 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
            style={{ background: "var(--gradient-primary)" }}
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">Coverage Active</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Welcome to Leak Assure! Your plumbing protection plan is now active. We'll send a confirmation to your email shortly.
        </p>
        <Link
          to="/"
          className="inline-flex rounded-lg px-8 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
          style={{ background: "var(--gradient-primary)" }}
        >
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default Success;
