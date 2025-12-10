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
  const response = await fetch(`${API_URL}/doctors`, {
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
