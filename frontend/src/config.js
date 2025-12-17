const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5024/api";
export const BASE_URL = API_URL.replace('/api', ''); // For static files like images

export const AI_URL = import.meta.env.VITE_AI_URL || "http://localhost:8001";

export default API_URL;
