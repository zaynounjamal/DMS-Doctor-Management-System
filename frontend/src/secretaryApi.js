
const API_URL = 'http://localhost:5024/api';

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

export const getSecretaryDashboard = async (doctorId = null) => {
    const url = doctorId
        ? `${API_URL}/secretary/dashboard?doctorId=${doctorId}`
        : `${API_URL}/secretary/dashboard`;
    const response = await fetch(url, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch dashboard');
    return response.json();
};

export const getSecretaryAppointments = async (tab, status, doctorId = null) => {
    const params = new URLSearchParams();
    if (tab) params.append('tab', tab);
    if (status) params.append('status', status);
    if (doctorId) params.append('doctorId', doctorId);

    const response = await fetch(`${API_URL}/secretary/appointments?${params}`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch appointments');
    return response.json();
};

export const updateAppointmentStatus = async (id, status, reason) => {
    const response = await fetch(`${API_URL}/secretary/appointments/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, reason })
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
};

export const markAsPaid = async (id) => {
    const response = await fetch(`${API_URL}/secretary/appointments/${id}/pay`, {
        method: 'PUT',
        headers: getAuthHeaders()
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to mark as paid');
    }
    return response.json();
};

export const rescheduleAppointment = async (id, newDate, newTime) => {
    const response = await fetch(`${API_URL}/secretary/appointments/${id}/reschedule`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ newDate, newTime })
    });
    if (!response.ok) throw new Error('Failed to reschedule');
    return response.json();
};

export const createAppointment = async (doctorId, patientId, date, time, price) => {
    const response = await fetch(`${API_URL}/secretary/appointments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ doctorId, patientId, date, time, price })
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create appointment');
    }
    return response.json();
};

export const searchPatients = async (query) => {
    const response = await fetch(`${API_URL}/secretary/patients?query=${query}`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to search patients');
    return response.json();
};

export const createPatient = async (patientData) => {
    const response = await fetch(`${API_URL}/secretary/patients`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(patientData)
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create patient');
    }
    return response.json();
};

export const editPatient = async (id, patientData) => {
    const response = await fetch(`${API_URL}/secretary/patients/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(patientData)
    });
    if (!response.ok) throw new Error('Failed to update patient');
    return response.json();
};

export const deletePatient = async (id) => {
    const response = await fetch(`${API_URL}/secretary/patients/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete patient');
    return response.json();
};

export const getDoctors = async () => {
    const response = await fetch(`${API_URL}/secretary/doctors`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch doctors');
    return response.json();
};

export const getDoctorAvailability = async (doctorId = null) => {
    const url = doctorId
        ? `${API_URL}/secretary/doctor-availability?doctorId=${doctorId}`
        : `${API_URL}/secretary/doctor-availability`;
    const response = await fetch(url, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch availability');
    return response.json();
};

export const getSecretaryProfile = async () => {
    const response = await fetch(`${API_URL}/secretary/profile`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
};

export const updateSecretaryProfile = async (profileData) => {
    const response = await fetch(`${API_URL}/secretary/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update profile');
    }
    return response.json();
};

export const getPaymentHistory = async (startDate = null, endDate = null, doctorId = null) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (doctorId) params.append('doctorId', doctorId);

    const response = await fetch(`${API_URL}/secretary/payments?${params}`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch payment history');
    return response.json();
};

