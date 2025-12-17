import API_URL from './config';

const getAuthToken = () => {
  const user = localStorage.getItem('user');
  if (!user) return null;
  try {
    const userData = JSON.parse(user);
    return userData.token;
  } catch {
    return null;
  }
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (response.ok) return response.json();
  const text = await response.text();
  throw new Error(text || `Request failed (${response.status})`);
};

export const startChat = async () => {
  const response = await fetch(`${API_URL}/chat/start`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const getConversationMessages = async (conversationId) => {
  const response = await fetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const sendConversationMessage = async (conversationId, text) => {
  const response = await fetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ text })
  });
  return handleResponse(response);
};

export const getSecretaryInbox = async (tab = 'open') => {
  const response = await fetch(`${API_URL}/chat/secretary/inbox?tab=${encodeURIComponent(tab)}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};

export const setSecretaryAvailability = async (isAvailable) => {
  const response = await fetch(`${API_URL}/chat/secretary/availability?isAvailable=${isAvailable ? 'true' : 'false'}`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return handleResponse(response);
};
