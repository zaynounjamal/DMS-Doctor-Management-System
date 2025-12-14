import API_URL from './config';

// Get token from localStorage
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
    };
};

// Dashboard
export const getDoctorDashboard = async () => {
    const response = await fetch(`${API_URL}/doctor/dashboard`, {
        headers: getAuthHeader()
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch dashboard: ${response.status} ${response.statusText}`);
    }
    return response.json();
};

// Statistics
export const getDoctorStatistics = async (period = 'week') => {
    const response = await fetch(`${API_URL}/doctor/statistics?period=${period}`, {
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch statistics');
    return response.json();
};

// Patients
export const getDoctorPatients = async () => {
    const response = await fetch(`${API_URL}/doctor/patients`, {
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch patients');
    return response.json();
};

export const getPatientDetails = async (patientId) => {
    const response = await fetch(`${API_URL}/doctor/patients/${patientId}`, {
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch patient details');
    return response.json();
};

// Profit Analytics
export const getProfitAnalytics = async (period = 'month') => {
    const response = await fetch(`${API_URL}/doctor/profit?period=${period}`, {
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch profit analytics');
    return response.json();
};

// Appointments (Doctor-specific)
export const getTodayAppointments = async () => {
    const response = await fetch(`${API_URL}/appointments/doctor/today`, {
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch today appointments');
    return response.json();
};

export const getTomorrowAppointments = async () => {
    const response = await fetch(`${API_URL}/appointments/doctor/tomorrow`, {
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch tomorrow appointments');
    return response.json();
};

export const getFutureAppointments = async () => {
    const response = await fetch(`${API_URL}/appointments/doctor/future`, {
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch future appointments');
    return response.json();
};

export const getPastAppointments = async () => {
    const response = await fetch(`${API_URL}/appointments/doctor/past`, {
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch past appointments');
    return response.json();
};

export const completeAppointment = async (appointmentId, finalPrice, completionNotes, paymentStatus) => {
    const response = await fetch(`${API_URL}/appointments/${appointmentId}/complete`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({ finalPrice, completionNotes, paymentStatus })
    });
    if (!response.ok) throw new Error('Failed to complete appointment');

    const text = await response.text();
    try {
        return text ? JSON.parse(text) : {};
    } catch (e) {
        console.warn("API returned non-JSON success response", text);
        return { message: "Success" };
    }
};

export const updatePaymentStatus = async (appointmentId, status) => {
    const response = await fetch(`${API_URL}/appointments/${appointmentId}/payment-status`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(status)
    });
    if (!response.ok) throw new Error('Failed to update payment status');
    return response.json();
};

// Medical Notes
export const addMedicalNote = async (appointmentId, note) => {
    const response = await fetch(`${API_URL}/medical-notes`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ appointmentId, note })
    });
    if (!response.ok) throw new Error('Failed to add medical note');

    // Safely parse JSON
    const text = await response.text();
    try {
        return text ? JSON.parse(text) : {};
    } catch (e) {
        console.warn("API returned non-JSON success response", text);
        return { message: "Success" };
    }
};

export const editMedicalNote = async (noteId, note) => {
    const response = await fetch(`${API_URL}/medical-notes/${noteId}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({ note })
    });
    if (!response.ok) throw new Error('Failed to edit medical note');

    const text = await response.text();
    try {
        return text ? JSON.parse(text) : {};
    } catch (e) {
        console.warn("API returned non-JSON success response", text);
        return { message: "Success" };
    }
};

export const getAppointmentNotes = async (appointmentId) => {
    const response = await fetch(`${API_URL}/medical-notes/appointment/${appointmentId}`, {
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch appointment notes');
    return response.json();
};

export const getPatientNotes = async (patientId) => {
    const response = await fetch(`${API_URL}/medical-notes/patient/${patientId}`, {
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch patient notes');
    return response.json();
};

// Advanced Search & Bulk Actions
export const searchAppointments = async (params) => {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.status) queryParams.append('status', params.status);

    const response = await fetch(`${API_URL}/doctor/appointments/search?${queryParams.toString()}`, {
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to search appointments');
    return response.json();
};

export const bulkCompleteAppointments = async (appointmentIds, defaultPrice) => {
    const response = await fetch(`${API_URL}/doctor/appointments/bulk-complete`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ appointmentIds, defaultPrice })
    });
    if (!response.ok) throw new Error('Failed to bulk complete appointments');
    return response.json();
};

// Notifications
export const sendReminder = async (appointmentId) => {
    const response = await fetch(`${API_URL}/notifications/send-reminder`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ appointmentId })
    });
    if (!response.ok) throw new Error('Failed to send reminder');
    return response.json();
};

// Off Days
export const getOffDays = async () => {
    const response = await fetch(`${API_URL}/doctor/offdays/list`, {
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch off days');
    return response.json();
};

export const addOffDay = async (offDate, reason) => {
    const response = await fetch(`${API_URL}/doctor/offdays/add`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ offDate, reason })
    });
    if (!response.ok) throw new Error('Failed to add off day');
    return response.json();
};

export const deleteOffDay = async (id) => {
    const response = await fetch(`${API_URL}/doctor/offdays/remove/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to delete off day');
    return response.json();
};

export const checkOffDay = async (date) => {
    const response = await fetch(`${API_URL}/doctor/offdays/check-date?date=${date}`, {
        headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to check off day');
    return response.json();
};
