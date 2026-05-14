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
import ReferralRedirect from "./components/ReferralRedirect";

import Dashboard from "./pages/admin/Dashboard";
import Members from "./pages/admin/Members";
import MemberDetail from "./pages/admin/MemberDetail";
import Claims from "./pages/admin/Claims";
import ClaimDetail from "./pages/admin/ClaimDetail";
import Payments from "./pages/admin/Payments";
import Vendors from "./pages/admin/Vendors";
import AdminAffiliates from "./pages/admin/Affiliates";
import AdminSettings from "./pages/admin/Settings";

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
import Login from "./pages/auth/Login";
import MemberDashboard from "./pages/member/Dashboard";
import CoverageTerms from "./pages/member/CoverageTerms";
import FileClaim from "./pages/member/FileClaim";
import MemberSettings from "./pages/member/Settings";
import ChangePassword from "./pages/member/ChangePassword";


import { useState, useEffect } from "react";
import { adminGetMe, getMyProfile } from "./services/api";
import { affiliateGetMe } from "./services/affiliateApi";

// Auth Guard Component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'admin' | 'member' }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = window.location.pathname;

  useEffect(() => {
    const verifySession = async () => {
      try {
        if (requiredRole === 'admin') {
          await adminGetMe();
        } else {
          await getMyProfile();
        }
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsVerifying(false);
      }
    };
    verifySession();
  }, [requiredRole, pathname]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requiredRole === 'admin') {
    if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Affiliate Auth Guard
const AffiliateProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = window.location.pathname;

  useEffect(() => {
    const verifySession = async () => {
      try {
        await affiliateGetMe();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsVerifying(false);
      }
    };
    verifySession();
  }, [pathname]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/affiliate/login" replace />;
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
          <Route path="/coverage-terms" element={<ProtectedRoute requiredRole="member"><CoverageTerms /></ProtectedRoute>} />
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
          
          {/* Custom Referral Slug Route (Catch-all for short links) */}
          <Route path="/:slug" element={<ReferralRedirect />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);


export default App;
