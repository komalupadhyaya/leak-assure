import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

import Dashboard from "./pages/admin/Dashboard";
import Members from "./pages/admin/Members";
import MemberDetail from "./pages/admin/MemberDetail";
import Claims from "./pages/admin/Claims";
import ClaimDetail from "./pages/admin/ClaimDetail";
import Payments from "./pages/admin/Payments";
import Vendors from "./pages/admin/Vendors";
import { Affiliates, Settings as AdminSettings } from "./pages/admin/Placeholders";
import Login from "./pages/auth/Login";
import MemberDashboard from "./pages/member/Dashboard";
import FileClaim from "./pages/member/FileClaim";
import MemberSettings from "./pages/member/Settings";
import ChangePassword from "./pages/member/ChangePassword";
import AdminAffiliates from "./pages/admin/Affiliates";

// Affiliate Portal
import AffiliateLogin from "./pages/affiliate/AffiliateLogin";
import AffiliateSignup from "./pages/affiliate/AffiliateSignup";
import AffiliateDashboard from "./pages/affiliate/AffiliateDashboard";
import AffiliateReferrals from "./pages/affiliate/AffiliateReferrals";
import AffiliateCommissions from "./pages/affiliate/AffiliateCommissions";
import AffiliateCreatives from "./pages/affiliate/AffiliateCreatives";
import AffiliateSettings from "./pages/affiliate/AffiliateSettings";

import { Navigate } from "react-router-dom";
import AdminLogin from "./pages/admin/AdminLogin";

// Auth Guard Component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'admin' | 'member' }) => {
  const adminToken = localStorage.getItem('admin_token');
  const memberToken = localStorage.getItem('token');
  const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
  const memberUser = JSON.parse(localStorage.getItem('user') || '{}');

  if (requiredRole === 'admin') {
    if (!adminToken) return <Navigate to="/admin/login" replace />;
    if (adminUser.role !== 'admin') return <Navigate to="/login" replace />;
    return <>{children}</>;
  }

  if (requiredRole === 'member') {
    // Admins are allowed to view member routes as well (Improvement 1)
    if (!memberToken && !adminToken) return <Navigate to="/login" replace />;

    const currentUser = adminToken ? adminUser : memberUser;
    // Basic check to ensure at least one valid session is active
    if (!currentUser.role) return <Navigate to="/login" replace />;

    return <>{children}</>;
  }

  return <>{children}</>;
};

// Affiliate Auth Guard
const AffiliateProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('affiliate_token');
  if (!token) return <Navigate to="/affiliate/login" replace />;
  return <>{children}</>;
};

const queryClient = new QueryClient();

const DomainRouter = () => {
  const hostname = window.location.hostname;

  // Only redirect if we are at the root path
  if (window.location.pathname !== '/') {
    return <Index />;
  }

  if (hostname.startsWith('affiliates.')) {
    return <Navigate to="/affiliate/login" replace />;
  }
  if (hostname.startsWith('member.')) {
    return <Navigate to="/login" replace />;
  }
  if (hostname.startsWith('admin.')) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Index />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<DomainRouter />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/success" element={<Success />} />
          <Route path="/welcome" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />

          {/* Phase 3 Admin Routes (Protected) */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/members" element={<ProtectedRoute requiredRole="admin"><Members /></ProtectedRoute>} />
          <Route path="/admin/members/:id" element={<ProtectedRoute requiredRole="admin"><MemberDetail /></ProtectedRoute>} />
          <Route path="/admin/claims" element={<ProtectedRoute requiredRole="admin"><Claims /></ProtectedRoute>} />
          <Route path="/admin/claims/:id" element={<ProtectedRoute requiredRole="admin"><ClaimDetail /></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute requiredRole="admin"><Payments /></ProtectedRoute>} />
          <Route path="/admin/vendors" element={<ProtectedRoute requiredRole="admin"><Vendors /></ProtectedRoute>} />
          <Route path="/admin/affiliates" element={<ProtectedRoute requiredRole="admin"><AdminAffiliates /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />

          {/* Phase 4 Member Routes (Protected) */}
          <Route path="/member/dashboard" element={<ProtectedRoute requiredRole="member"><MemberDashboard /></ProtectedRoute>} />
          <Route path="/member/file-claim" element={<ProtectedRoute requiredRole="member"><FileClaim /></ProtectedRoute>} />
          <Route path="/member/settings" element={<ProtectedRoute requiredRole="member"><MemberSettings /></ProtectedRoute>} />
          <Route path="/member/change-password" element={<ProtectedRoute requiredRole="member"><ChangePassword /></ProtectedRoute>} />

          {/* Affiliate Portal Routes */}
          <Route path="/affiliate" element={<Navigate to="/affiliate/login" replace />} />
          <Route path="/affiliate/login" element={<AffiliateLogin />} />
          <Route path="/affiliate/signup" element={<AffiliateSignup />} />
          <Route path="/affiliate/dashboard" element={<AffiliateProtectedRoute><AffiliateDashboard /></AffiliateProtectedRoute>} />
          <Route path="/affiliate/referrals" element={<AffiliateProtectedRoute><AffiliateReferrals /></AffiliateProtectedRoute>} />
          <Route path="/affiliate/commissions" element={<AffiliateProtectedRoute><AffiliateCommissions /></AffiliateProtectedRoute>} />
          <Route path="/affiliate/marketing" element={<AffiliateProtectedRoute><AffiliateCreatives /></AffiliateProtectedRoute>} />
          <Route path="/affiliate/settings" element={<AffiliateProtectedRoute><AffiliateSettings /></AffiliateProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);


export default App;
