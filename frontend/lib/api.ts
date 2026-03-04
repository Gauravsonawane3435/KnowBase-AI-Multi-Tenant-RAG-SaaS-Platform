import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    timeout: 30000, // 30 seconds — needed for Railway DB cold starts (~7s)
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log full error details to console for debugging
        if (error.response) {
            console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${error.response.status}:`, error.response.data);
        } else if (error.request) {
            console.error(`[API Error] No response received for ${error.config?.url}. Is the backend running?`, error.message);
        } else {
            console.error('[API Error]', error.message);
        }

        if (error.response && error.response.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
            }
        }
        return Promise.reject(error);
    }
);

export default api;
