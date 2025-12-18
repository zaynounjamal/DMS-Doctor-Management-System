import API_URL from './config';

const getAuthHeaders = () => {
    const user = localStorage.getItem('user');
    let token = null;
    if (user) {
        try {
            const userData = JSON.parse(user);
            token = userData.token;
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getAdminDashboardStats = async () => {
    const response = await fetch(`${API_URL}/admin/dashboard`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
};

// --- TREATMENTS ---
export const getTreatments = async () => {
    const response = await fetch(`${API_URL}/admin/treatments`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch treatments');
    return response.json();
};

export const createTreatment = async (data) => {
    const response = await fetch(`${API_URL}/admin/treatments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create treatment');
    return response.json();
};

export const updateTreatment = async (id, data) => {
    const response = await fetch(`${API_URL}/admin/treatments/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update treatment');
    return response.json();
};

export const deleteTreatment = async (id) => {
    const response = await fetch(`${API_URL}/admin/treatments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete treatment');
    return response.json();
};

// --- SETTINGS ---
export const getSystemSettings = async () => {
    const response = await fetch(`${API_URL}/admin/settings`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
};

export const updateSystemSettings = async (settings) => {
    const response = await fetch(`${API_URL}/admin/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return response.json();
};

// --- PUBLIC SETTINGS (For Footer/Layout) ---
// --- PUBLIC SETTINGS (For Footer/Layout) ---
export const getPublicSettings = async () => {
    const response = await fetch(`${API_URL}/public/settings`);
    if (!response.ok) throw new Error('Failed to fetch public settings');
    return response.json();
};

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthHeaders()['Authorization'].split(' ')[1]; // Extract token
    // Note: getAuthHeaders returns object, need just the token string for manual header or just usage.
    // Fetch takes headers object.

    const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to upload file');
    }
    return response.json();
};

// --- USER MANAGEMENT ---
export const getUsers = async () => {
    const response = await fetch(`${API_URL}/admin/users`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
};

export const createUser = async (data) => {
    const response = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    // Check if 400 for validation errors
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create user');
    }
    return response.json();
};

export const toggleUserStatus = async (id) => {
    const response = await fetch(`${API_URL}/admin/users/${id}/toggle-status`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to toggle user status');
    return response.json();
};

// --- AUDIT LOGS ---
// --- AUDIT LOGS ---
export const getAuditLogs = async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.role && params.role !== 'all') query.append('role', params.role);
    if (params.dateFrom) query.append('dateFrom', params.dateFrom);
    if (params.dateTo) query.append('dateTo', params.dateTo);

    const response = await fetch(`${API_URL}/admin/audit-logs?${query.toString()}`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return response.json();
};

// --- REPORTS ---
export const getReports = async () => {
    const response = await fetch(`${API_URL}/admin/reports`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch reports');
    return response.json();
};

export const resetPassword = async (id, newPassword) => {
    const response = await fetch(`${API_URL}/admin/users/${id}/reset-password`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
    });
    if (!response.ok) throw new Error('Failed to reset password');
    return response.json();
};

export const blockUser = async (id, { blockLogin = true, blockBooking = true, reason = '' } = {}) => {
    const response = await fetch(`${API_URL}/admin/users/${id}/block`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ blockLogin, blockBooking, reason })
    });
    if (!response.ok) throw new Error('Failed to block user');
    return response.json();
};

export const unblockUser = async (id) => {
    const response = await fetch(`${API_URL}/admin/users/${id}/unblock`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to unblock user');
    return response.json();
};

export const getBlockedPhones = async () => {
    const response = await fetch(`${API_URL}/admin/blocked-phones`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch blocked phones');
    return response.json();
};

export const addBlockedPhone = async ({ phone, reason = '' }) => {
    const response = await fetch(`${API_URL}/admin/blocked-phones`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ phone, reason })
    });
    if (!response.ok) throw new Error('Failed to block phone');
    return response.json();
};

export const removeBlockedPhone = async (id) => {
    const response = await fetch(`${API_URL}/admin/blocked-phones/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to unblock phone');
    return response.json();
};

// --- HOLIDAYS ---
export const getHolidays = async () => {
    const response = await fetch(`${API_URL}/admin/holidays`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch holidays');
    return response.json();
};

export const createHoliday = async (data) => {
    const response = await fetch(`${API_URL}/admin/holidays`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create holiday');
    return response.json();
};

export const deleteHoliday = async (id) => {
    const response = await fetch(`${API_URL}/admin/holidays/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete holiday');
    return response.json();
};

// --- PATIENTS ---
export const getPatientsAdmin = async () => {
    const response = await fetch(`${API_URL}/admin/patients`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch patients');
    return response.json();
};
