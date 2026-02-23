import { useState } from "react";
import { Shield, Droplets, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const plans = [
  { value: "plan_a", label: "Plan A ($29/mo)" },
  { value: "plan_b", label: "Plan B ($49/mo)" },
];

const Index = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    plan: "plan_a",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName || !form.email || !form.phone || !form.address) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("https://leak-assure.onrender.com/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      console.log("Stripe URL:", data.url);

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Connection failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Droplets className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-foreground tracking-tight">Leak Assure</span>
        </div>
        <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Admin
        </a>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Shield className="h-4 w-4" />
              Trusted Home Protection
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight mb-6">
              Interior Plumbing Protection for Leaks Others Deny.
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Most homeowner policies exclude interior plumbing damage. Leak Assure fills that gap — covering burst pipes, slab leaks, and hidden water damage so you're never left paying out of pocket.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {["24/7 Emergency Response", "No Deductibles", "Cancel Anytime"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="h-4 w-4 text-success" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Form */}
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
            <h2 className="text-2xl font-bold text-card-foreground mb-1">Get Covered Today</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Fill out the form below to start your protection plan instantly.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="fullName"
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleChange}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                name="phone"
                type="tel"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                name="address"
                placeholder="Service Address"
                value={form.address}
                onChange={handleChange}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <select
                name="plan"
                value={form.plan}
                onChange={handleChange}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {plans.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: "var(--gradient-primary)" }}
              >
                {isSubmitting ? "Processing…" : "Get Covered Now"}
              </button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-4">
              By signing up you agree to our{" "}
              <a href="#" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Terms of Service</a>
              {" "}and{" "}
              <a href="#" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
