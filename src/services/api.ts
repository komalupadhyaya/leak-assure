const API_BASE = import.meta.env.VITE_API_URL || 'https://api.leakassure.com';

export interface SignupPayload {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    serviceAddress: string;
    plan: 'essential' | 'premium';
    smsOptIn: boolean;
    password?: string;
    latitude?: number;
    longitude?: number;
    ref?: string;
}

export interface SignupResponse {
    url: string;
}

export async function startSignup(payload: SignupPayload): Promise<SignupResponse> {
    const res = await fetch(`${API_BASE}/api/signup/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to start signup');
    }

    return res.json();
}

export interface SessionDetails {
    name: string;
    email: string;
    plan: string;
    price: number;
    serviceAddress: string;
    waitingPeriodEnd: string;
    user?: {
        id: string;
        email: string;
        fullName: string;
        role: string;
        forcePasswordChange: boolean;
    };
}

export async function getSessionDetails(sessionId: string): Promise<SessionDetails> {
    const res = await fetch(`${API_BASE}/api/stripe/session/${sessionId}`, {
        credentials: 'include',
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch session details');
    }

    return res.json();
}

// Admin & Members
export async function getDashboardStats() {
    const res = await fetch(`${API_BASE}/api/admin/ph3/dashboard`, {
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
}

export async function getMembers() {
    const res = await fetch(`${API_BASE}/api/members`, {
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch members');
    return res.json();
}

export async function adminCreateMember(data: any) {
    const res = await fetch(`${API_BASE}/api/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create member');
    }
    return res.json();
}

export async function getMemberById(id: string) {
    const res = await fetch(`${API_BASE}/api/members/${id}`, {
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch member');
    return res.json();
}

export async function updateMember(id: string, data: any) {
    const res = await fetch(`${API_BASE}/api/members/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update member');
    return res.json();
}

export async function cancelSubscription(id: string) {
    const res = await fetch(`${API_BASE}/api/members/${id}/cancel`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to cancel subscription');
    return res.json();
}

export async function addMemberNote(id: string, data: { note: string }) {
    const res = await fetch(`${API_BASE}/api/members/${id}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add member note');
    return res.json();
}

export async function syncMemberPayments(id: string) {
    const res = await fetch(`${API_BASE}/api/members/${id}/sync-payments`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to sync payments');
    }
    return res.json();
}

// Claims
export async function getClaims() {
    const res = await fetch(`${API_BASE}/api/claims`, {
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch claims');
    return res.json();
}

export async function getClaimById(id: string) {
    const res = await fetch(`${API_BASE}/api/claims/${id}`, {
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch claim');
    return res.json();
}

export async function updateClaimStatus(id: string, status: string) {
    const res = await fetch(`${API_BASE}/api/claims/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update claim status');
    return res.json();
}

export async function assignVendor(id: string, vendorId: string | null) {
    const res = await fetch(`${API_BASE}/api/claims/${id}/vendor`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ vendorId }),
    });
    if (!res.ok) throw new Error('Failed to assign vendor');
    return res.json();
}

export async function addClaimNote(id: string, note: string) {
    const res = await fetch(`${API_BASE}/api/claims/${id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ note }),
    });
    if (!res.ok) throw new Error('Failed to add note');
    return res.json();
}

// Member Portal Auth & Actions
export async function login(credentials: any) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Login failed');
    }
    return res.json();
}

export async function logout() {
    await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });
}

export async function adminLogin(credentials: any) {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Admin login failed');
    }
    return res.json();
}

export async function adminLogout() {
    await fetch(`${API_BASE}/api/admin/logout`, {
        method: 'POST',
        credentials: 'include',
    });
}

export async function adminGetMe() {
    const res = await fetch(`${API_BASE}/api/admin/me`, {
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch admin profile');
    return res.json();
}

export async function getMyProfile() {
    const res = await fetch(`${API_BASE}/api/member/me`, {
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
}

export async function fileMemberClaim(formData: FormData) {
    const res = await fetch(`${API_BASE}/api/member/claim`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to file claim');
    }
    return res.json();
}

export async function getMemberClaims() {
    const res = await fetch(`${API_BASE}/api/member/claims`, {
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch claim history');
    return res.json();
}

export async function memberCancelSelf() {
    const res = await fetch(`${API_BASE}/api/member/cancel`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to cancel subscription');
    return res.json();
}

// Vendors
export async function getVendors() {
    const res = await fetch(`${API_BASE}/api/vendors`, {
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch vendors');
    return res.json();
}

export async function getClaimsByMember(memberId: string) {
    const res = await fetch(`${API_BASE}/api/claims/member/${memberId}`, {
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch member claims');
    return res.json();
}

export async function createVendor(vendorData: any) {
    const res = await fetch(`${API_BASE}/api/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(vendorData),
    });
    if (!res.ok) throw new Error('Failed to create vendor');
    return res.json();
}

export async function updateVendor(id: string, vendorData: any) {
    const res = await fetch(`${API_BASE}/api/vendors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(vendorData),
    });
    if (!res.ok) throw new Error('Failed to update vendor');
    return res.json();
}

export async function deleteVendor(id: string) {
    const res = await fetch(`${API_BASE}/api/vendors/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to delete vendor');
    return res.json();
}

export const changePassword = async (newPassword: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/api/auth/update-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newPassword }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update password');
    }

    return response.json();
};

export async function createAdminUser(data: { fullName: string; email: string; password: string }) {
    const res = await fetch(`${API_BASE}/api/admin/ph3/admin-users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to create admin user'); }
    return res.json();
}

export async function resetMemberPassword(memberId: string, newPassword: string) {
    const res = await fetch(`${API_BASE}/api/admin/ph3/members/${memberId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newPassword }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to reset password'); }
    return res.json();
}
