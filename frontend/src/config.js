const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5024/api";
export const BASE_URL = API_URL.replace('/api', ''); // For static files like images

export default API_URL;
