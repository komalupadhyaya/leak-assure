const ENV = import.meta.env.VITE_APP_ENV || 'production';
const API_URL = ENV === 'development' ? 'http://localhost:5000' : 'https://api.leakassure.com';

const credHeaders = () => ({
    'Content-Type': 'application/json',
});

// --- AUTH ---
export const affiliateSignup = async (data: {
    name: string; email: string; password: string; paypalEmail?: string; zelleInfo?: string;
}) => {
    const res = await fetch(`${API_URL}/api/affiliate/signup`, {
        method: 'POST',
        headers: credHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Signup failed');
    return json;
};

export const affiliateLogin = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/affiliate/login`, {
        method: 'POST',
        headers: credHeaders(),
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    return json;
};

let affiliateGetMePromise: Promise<any> | null = null;

export const affiliateLogout = async () => {
    affiliateGetMePromise = null;
    await fetch(`${API_URL}/api/affiliate/logout`, {
        method: 'POST',
        credentials: 'include',
    });
};

// --- PORTAL ---
export const affiliateGetMe = async () => {
    if (affiliateGetMePromise) return affiliateGetMePromise;
    affiliateGetMePromise = (async () => {
        try {
            const res = await fetch(`${API_URL}/api/affiliate/me`, { credentials: 'include' });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to load profile');
            return json;
        } catch (error) {
            affiliateGetMePromise = null;
            throw error;
        }
    })();
    return affiliateGetMePromise;
};

export const affiliateGetReferrals = async () => {
    const res = await fetch(`${API_URL}/api/affiliate/referrals`, { credentials: 'include' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to load referrals');
    return json;
};

export const affiliateGetCommissions = async () => {
    const res = await fetch(`${API_URL}/api/affiliate/commissions`, { credentials: 'include' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to load commissions');
    return json;
};

export const affiliateGetCreatives = async () => {
    const res = await fetch(`${API_URL}/api/affiliate/creatives`, { credentials: 'include' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to load creatives');
    return json;
};

export const affiliateUpdateSettings = async (data: { paypalEmail: string; zelleInfo: string }) => {
    affiliateGetMePromise = null;
    const res = await fetch(`${API_URL}/api/affiliate/settings`, {
        method: 'PATCH',
        headers: credHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update settings');
    return json;
};

// --- ADMIN ---
export const adminGetAllAffiliates = async (page = 1, status?: string) => {
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set('status', status);
    const res = await fetch(`${API_URL}/api/affiliates-admin/?${params}`, { credentials: 'include' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};

export const adminGetAffiliateDetail = async (id: string) => {
    const res = await fetch(`${API_URL}/api/affiliates-admin/${id}`, { credentials: 'include' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};

export const adminUpdateAffiliateStatus = async (id: string, status: string) => {
    const res = await fetch(`${API_URL}/api/affiliates-admin/${id}/status`, {
        method: 'PATCH',
        headers: credHeaders(),
        credentials: 'include',
        body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};

export const adminUpdateAffiliateCommission = async (id: string, data: { commissionType: string; commissionValue: number }) => {
    const res = await fetch(`${API_URL}/api/affiliates-admin/${id}/commission`, {
        method: 'PATCH',
        headers: credHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};

export const adminUpdateCommissionStatus = async (id: string, status: string) => {
    const res = await fetch(`${API_URL}/api/affiliates-admin/commissions/${id}/status`, {
        method: 'PATCH',
        headers: credHeaders(),
        credentials: 'include',
        body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};

export const adminBulkUpdateCommissions = async (affiliateId: string, data: { commissionIds: string[]; status: string; method?: string; notes?: string }) => {
    const res = await fetch(`${API_URL}/api/affiliates-admin/${affiliateId}/bulk-commissions`, {
        method: 'POST',
        headers: credHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};

export const adminCreatePayout = async (id: string, data: { amount: number; method: string; notes?: string }) => {
    const res = await fetch(`${API_URL}/api/affiliates-admin/${id}/payouts`, {
        method: 'POST',
        headers: credHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};

export const adminGetAllPayouts = async () => {
    const res = await fetch(`${API_URL}/api/affiliates-admin/payouts/all`, { credentials: 'include' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};

export const adminMarkPayoutPaid = async (id: string, method?: string) => {
    const res = await fetch(`${API_URL}/api/affiliates-admin/payouts/${id}`, {
        method: 'PATCH',
        headers: credHeaders(),
        credentials: 'include',
        body: method ? JSON.stringify({ method }) : undefined,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};

export const adminGetAllCreatives = async () => {
    const res = await fetch(`${API_URL}/api/affiliates-admin/creatives/all`, { credentials: 'include' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};

export const adminCreateCreative = async (data: { title: string; fileUrl: string; fileType: string }) => {
    const res = await fetch(`${API_URL}/api/affiliates-admin/creatives`, {
        method: 'POST',
        headers: credHeaders(),
        credentials: 'include',
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};

export const adminDeleteCreative = async (id: string) => {
    const res = await fetch(`${API_URL}/api/affiliates-admin/creatives/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    return json;
};
