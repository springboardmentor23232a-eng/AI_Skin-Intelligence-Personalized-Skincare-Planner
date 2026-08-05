import axios from 'axios';

// Resolve backend url from Vite environment variables, fallback to local default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Outgoing request interceptor injection
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ai_skincare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle session expiry or unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired session details
      localStorage.removeItem('ai_skincare_token');
      localStorage.removeItem('ai_skincare_session');
    }
    return Promise.reject(error);
  }
);

export default api;
