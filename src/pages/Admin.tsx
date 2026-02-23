import { useState } from "react";
import { Droplets, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Customer {
  fullName: string;
  email: string;
  plan: string;
  date: string;
  status: string;
}

const DUMMY_CUSTOMERS: Customer[] = [
  { fullName: "John Doe", email: "john@example.com", plan: "Plan A ($29/mo)", date: "2025-01-15", status: "Active" },
  { fullName: "Jane Smith", email: "jane@example.com", plan: "Plan B ($49/mo)", date: "2025-02-01", status: "Active" },
  { fullName: "Mike Johnson", email: "mike@example.com", plan: "Plan A ($29/mo)", date: "2025-02-10", status: "Pending" },
];

const Admin = () => {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial fetch won't run until authorized to save resources/security
  const fetchCustomers = async () => {
    try {
      const res = await fetch("https://leak-assure.onrender.com/api/admin/customers");
      const data = await res.json();
      setCustomers(data);
    } catch {
      setCustomers(DUMMY_CUSTOMERS);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setAuthorized(true);
      toast.success("Welcome back, Admin!");
      fetchCustomers();
    } else {
      toast.error("Invalid password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Login Modal - Always present if not authorized */}
      <Dialog open={!authorized} onOpenChange={() => { }}>
        <DialogContent className="sm:max-w-md border-0 bg-white/90 backdrop-blur-xl shadow-2xl">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-foreground">Admin Access</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Please enter your security password to continue.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center text-lg tracking-widest"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full font-semibold"
                style={{ background: "var(--gradient-primary)" }}
              >
                Unlock Dashboard
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => window.location.href = "/"}
              >
                Return to Home
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Main Content - Only shown when authorized (or blurred/hidden behind modal, but keeping it simple/secure by valid rendering) */}
      {authorized && (
        <>
          <nav className="flex items-center justify-between px-6 py-4 border-b border-border max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <Droplets className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">Leak Assure Admin</span>
            </div>
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back to Site
            </a>
          </nav>

          <main className="max-w-7xl mx-auto px-6 py-10">
            <h1 className="text-2xl font-bold text-foreground mb-6">Customer Subscriptions</h1>

            {loading ? (
              <p className="text-muted-foreground">Loading customers…</p>
            ) : customers.length === 0 ? (
              <p className="text-muted-foreground">No customers found.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {customers.map((c, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-foreground">{c.fullName}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{c.email}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{c.plan}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{c.date ? new Date(c.date).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${c.status === "Active"
                                ? "bg-success/5 text-success border-success/20"
                                : "bg-warning/5 text-warning border-warning/20"
                              }`}
                          >
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
};

export default Admin;
