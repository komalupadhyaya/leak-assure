const API_BASE = import.meta.env.VITE_API_URL;

export interface SignupPayload {
    fullName: string;
    email: string;
    phone: string;
    serviceAddress: string;
    plan: 'essential' | 'premium';
    smsOptIn: boolean;
    password?: string;
    latitude?: number;
    longitude?: number;
}

export interface SignupResponse {
    url: string;
}

export async function startSignup(payload: SignupPayload): Promise<SignupResponse> {
    const res = await fetch(`${API_BASE}/api/signup/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
}

export async function getSessionDetails(sessionId: string): Promise<SessionDetails> {
    const res = await fetch(`${API_BASE}/api/stripe/session/${sessionId}`);

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch session details');
    }

    return res.json();
}

// Admin & Members
export async function getDashboardStats() {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/api/admin/ph3/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
}

export async function getMembers() {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/api/members`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch members');
    return res.json();
}

export async function getMemberById(id: string) {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/api/members/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch member');
    return res.json();
}

export async function updateMember(id: string, data: any) {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/api/members/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update member');
    return res.json();
}

export async function cancelSubscription(id: string) {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/api/members/${id}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to cancel subscription');
    return res.json();
}

export async function addMemberNote(id: string, data: { note: string }) {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/api/members/${id}/note`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add member note');
    return res.json();
}


// Claims
export async function getClaims() {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/api/claims`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch claims');
    return res.json();
}

export async function getClaimById(id: string) {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/api/claims/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch claim');
    return res.json();
}

export async function updateClaimStatus(id: string, status: string) {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/api/claims/${id}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update claim status');
    return res.json();
}

export async function assignVendor(id: string, vendorId: string | null) {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/api/claims/${id}/vendor`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ vendorId }),
    });
    if (!res.ok) throw new Error('Failed to assign vendor');
    return res.json();
}

export async function addClaimNote(id: string, note: string) {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/api/claims/${id}/notes`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
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
        body: JSON.stringify(credentials),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Login failed');
    }
    return res.json();
}

export async function adminLogin(credentials: any) {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Admin login failed');
    }
    return res.json();
}

export async function getMyProfile() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/member/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
}

export async function fileMemberClaim(claimData: any) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/member/claim`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(claimData),
    });
    if (!res.ok) throw new Error('Failed to file claim');
    return res.json();
}

export async function memberCancelSelf() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/member/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to cancel subscription');
    return res.json();
}

// Vendors
export async function getVendors() {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/api/vendors`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch vendors');
    return res.json();
}

export async function getClaimsByMember(memberId: string) {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/api/claims/member/${memberId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch member claims');
    return res.json();
}


export async function createVendor(vendorData: any) {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/api/vendors`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(vendorData),
    });
    if (!res.ok) throw new Error('Failed to create vendor');
    return res.json();
}

export async function updateVendor(id: string, vendorData: any) {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/api/vendors/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(vendorData),
    });
    if (!res.ok) throw new Error('Failed to update vendor');
    return res.json();
}

export async function deleteVendor(id: string) {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE}/api/vendors/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete vendor');
    return res.json();
}

export const changePassword = async (newPassword: string): Promise<{ message: string }> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/auth/update-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update password');
    }

    return response.json();
};
