const API_URL = "http://localhost:5024/api";

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.token;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

// Helper function to create headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const login = async (username, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || "Login failed");
  }

  return response.json();
};

export const signup = async (userData) => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || "Signup failed");
  }

  return response.json();
};

export const checkUsernameAvailability = async (username, signal) => {
  const response = await fetch(`${API_URL}/auth/check-username?username=${username}`, { signal });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to check username availability: ${response.status} ${errorText}`);
  }
  return response.json();
};

export const getDoctors = async () => {
  const response = await fetch(`${API_URL}/appointments/doctors`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch doctors');
  }
  return response.json();
};

export const getAppointments = async () => {
  const response = await fetch(`${API_URL}/appointments`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch appointments');
  }
  return response.json();
};

export const getAvailableDates = async (doctorId) => {
  const response = await fetch(`${API_URL}/appointments/available-dates?doctorId=${doctorId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch available dates');
  }
  return response.json();
};

export const getTimeSlots = async (doctorId, date) => {
  const response = await fetch(`${API_URL}/appointments/time-slots?doctorId=${doctorId}&dateStr=${date}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch time slots');
  }
  return response.json();
};

export const bookAppointment = async (appointmentData) => {
  const response = await fetch(`${API_URL}/appointments/book`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(appointmentData),
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || 'Failed to book appointment');
  }
  return response.json();
};

export const getMyAppointments = async () => {
  const response = await fetch(`${API_URL}/appointments/my-appointments`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch your appointments');
  }
  return response.json();
};

export const cancelAppointment = async (appointmentId) => {
  const response = await fetch(`${API_URL}/appointments/cancel/${appointmentId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || 'Failed to cancel appointment');
  }
  return response.json();
};

export const getProfile = async () => {
  const response = await fetch(`${API_URL}/profile/me`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  return response.json();
};

export const updateProfile = async (profileData) => {
  const response = await fetch(`${API_URL}/profile/patient`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || 'Failed to update profile');
  }
  return response.json();
};

export const uploadProfilePhoto = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const token = getAuthToken();
  const response = await fetch(`${API_URL}/upload/profile-photo`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || 'Failed to upload photo');
  }
  return response.json();
};

export const changePassword = async (passwordData) => {
  const response = await fetch(`${API_URL}/profile/change-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(passwordData),
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || 'Failed to change password');
  }
  return response.json();
};

export const getFinancialSummary = async () => {
  const response = await fetch(`${API_URL}/financial/summary`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch financial summary');
  }
  return response.json();
};

export const getPublicStats = async () => {
  const response = await fetch(`${API_URL}/stats/public`);
  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }
  return response.json();
};

export const getTreatments = async () => {
  const response = await fetch(`${API_URL}/treatment`);
  if (!response.ok) {
    throw new Error('Failed to fetch treatments');
  }
  return response.json();
};

