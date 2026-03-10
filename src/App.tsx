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
import { Affiliates, Settings as AdminSettings } from "./pages/admin/Placeholders";
import Login from "./pages/auth/Login";
import MemberDashboard from "./pages/member/Dashboard";
import FileClaim from "./pages/member/FileClaim";
import MemberSettings from "./pages/member/Settings";
import ChangePassword from "./pages/member/ChangePassword";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Index />} />
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
          <Route path="/admin/affiliates" element={<ProtectedRoute requiredRole="admin"><Affiliates /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />

          {/* Phase 4 Member Routes (Protected) */}
          <Route path="/member/dashboard" element={<ProtectedRoute requiredRole="member"><MemberDashboard /></ProtectedRoute>} />
          <Route path="/member/file-claim" element={<ProtectedRoute requiredRole="member"><FileClaim /></ProtectedRoute>} />
          <Route path="/member/settings" element={<ProtectedRoute requiredRole="member"><MemberSettings /></ProtectedRoute>} />
          <Route path="/member/change-password" element={<ProtectedRoute requiredRole="member"><ChangePassword /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);


export default App;
