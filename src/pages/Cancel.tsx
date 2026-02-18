import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const Cancel = () => (
  <div className="min-h-screen flex items-center justify-center bg-background px-6">
    <div className="text-center max-w-md">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-warning/10">
        <AlertTriangle className="h-10 w-10 text-warning" />
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-3">Payment Incomplete</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Your payment was not completed. No charges were made. You can try again whenever you're ready.
      </p>
      <Link
        to="/"
        className="inline-flex rounded-lg px-8 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
        style={{ background: "var(--gradient-primary)" }}
      >
        Try Again
      </Link>
    </div>
  </div>
);

export default Cancel;
