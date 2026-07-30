// REST API Client Layer connecting React Frontend to Express & PostgreSQL Backend
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Inject JWT Bearer token into Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('app_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Automatically handle 401 Unauthorized / Token Expiry
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('401 Unauthorized or Token Expired. Auto logging out user.');
      localStorage.removeItem('app_token');
      localStorage.removeItem('app_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Authentication APIs
  register: async (userData) => {
    try {
      const res = await axiosInstance.post('/auth/register', userData);
      return res.data;
    } catch (err) {
      throw err.response ? err.response.data : new Error(err.message);
    }
  },
  login: async (credentials) => {
    try {
      const res = await axiosInstance.post('/auth/login', credentials);
      return res.data;
    } catch (err) {
      throw err.response ? err.response.data : new Error(err.message);
    }
  },
  googleAuth: async (googleData) => {
    try {
      const res = await axiosInstance.post('/auth/google', googleData);
      return res.data;
    } catch (err) {
      throw err.response ? err.response.data : new Error(err.message);
    }
  },
  getCurrentUser: async () => {
    try {
      const res = await axiosInstance.get('/auth/me');
      return res.data;
    } catch (err) {
      throw err.response ? err.response.data : new Error(err.message);
    }
  },

  // Profile APIs
  getProfile: async () => {
    try {
      const res = await axiosInstance.get('/profile');
      return res.data;
    } catch (err) {
      throw err.response ? err.response.data : new Error(err.message);
    }
  },
  updateProfile: async (profileData) => {
    try {
      const res = await axiosInstance.put('/profile', profileData);
      return res.data;
    } catch (err) {
      throw err.response ? err.response.data : new Error(err.message);
    }
  },

  // Role Based Dashboard APIs
  getUserDashboard: () => axiosInstance.get('/user/dashboard'),
  getCoachDashboard: () => axiosInstance.get('/coach/dashboard'),
  getAdminDashboard: () => axiosInstance.get('/admin/dashboard'),
  getAllUsers: () => axiosInstance.get('/admin/users')
};
