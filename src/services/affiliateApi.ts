const API_URL = import.meta.env.VITE_API_URL || 'https://api.leakassure.com';

const getAffiliateToken = () => localStorage.getItem('affiliate_token');

const affiliateHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAffiliateToken()}`,
});

// --- AUTH ---
export const affiliateSignup = async (data: {
    name: string; email: string; password: string; paypalEmail?: string; zelleInfo?: string;
}) => {
    const res = await fetch(`${API_URL}/api/affiliate/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Signup failed');
    return json;
};

export const affiliateLogin = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/affiliate/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    return json;
};

// --- PORTAL ---
export const affiliateGetMe = async () => {
    const res = await fetch(`${API_URL}/api/affiliate/me`, { headers: affiliateHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to load profile');
    return json;
};

export const affiliateGetReferrals = async () => {
    const res = await fetch(`${API_URL}/api/affiliate/referrals`, { headers: affiliateHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to load referrals');
    return json;
};

export const affiliateGetCommissions = async () => {
    const res = await fetch(`${API_URL}/api/affiliate/commissions`, { headers: affiliateHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to load commissions');
    return json;
};

export const affiliateGetCreatives = async () => {
    const res = await fetch(`${API_URL}/api/affiliate/creatives`, { headers: affiliateHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to load creatives');
    return json;
};

export const affiliateUpdateSettings = async (data: { paypalEmail: string; zelleInfo: string }) => {
    const res = await fetch(`${API_URL}/api/affiliate/settings`, {
        method: 'PATCH',
        headers: affiliateHeaders(),
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update settings');
    return json;
};

// --- ADMIN ---
const getAdminToken = () => localStorage.getItem('admin_token');
const adminHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAdminToken()}`,
});

export const adminGetAllAffiliates = async (page = 1, status?: string) => {
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set('status', status);
    const res = await fetch(`${API_URL}/api/affiliates-admin/?${params}`, { headers: adminHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};

export const adminGetAffiliateDetail = async (id: string) => {
    const res = await fetch(`${API_URL}/api/affiliates-admin/${id}`, { headers: adminHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};

export const adminUpdateAffiliateStatus = async (id: string, status: string) => {
    const res = await fetch(`${API_URL}/api/affiliates-admin/${id}/status`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};

export const adminUpdateCommissionStatus = async (id: string, status: string) => {
    const res = await fetch(`${API_URL}/api/affiliates-admin/commissions/${id}/status`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};

export const adminBulkUpdateCommissions = async (affiliateId: string, data: { commissionIds: string[]; status: string; method?: string; notes?: string }) => {
    const res = await fetch(`${API_URL}/api/affiliates-admin/${affiliateId}/bulk-commissions`, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};

export const adminCreatePayout = async (id: string, data: { amount: number; method: string; notes?: string }) => {
    const res = await fetch(`${API_URL}/api/affiliates-admin/${id}/payouts`, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};

export const adminGetAllPayouts = async () => {
    const res = await fetch(`${API_URL}/api/affiliates-admin/payouts/all`, { headers: adminHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};

export const adminMarkPayoutPaid = async (id: string, method?: string) => {
    const res = await fetch(`${API_URL}/api/affiliates-admin/payouts/${id}`, {
        method: 'PATCH',
        headers: adminHeaders(),
        body: method ? JSON.stringify({ method }) : undefined,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};

export const adminGetAllCreatives = async () => {
    const res = await fetch(`${API_URL}/api/affiliates-admin/creatives/all`, { headers: adminHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};

export const adminCreateCreative = async (data: { title: string; fileUrl: string; fileType: string }) => {
    const res = await fetch(`${API_URL}/api/affiliates-admin/creatives`, {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};

export const adminDeleteCreative = async (id: string) => {
    const res = await fetch(`${API_URL}/api/affiliates-admin/creatives/${id}`, {
        method: 'DELETE',
        headers: adminHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};
