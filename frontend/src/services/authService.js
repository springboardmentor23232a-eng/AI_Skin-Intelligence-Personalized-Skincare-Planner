import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/auth";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authService = {
  register: async (full_name, email, password, role = "USER") => {
    try {
      const response = await apiClient.post("/register", {
        full_name,
        email,
        password,
        role,
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.message ||
        "Registration failed. Unable to connect to server.";
      throw new Error(message, { cause: error });
    }
  },

  login: async (email, password) => {
    try {
      const response = await apiClient.post("/login", { email, password });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.message ||
        "Login failed. Please check your credentials.";
      throw new Error(message, { cause: error });
    }
  },

  googleLogin: async (credential) => {
    try {
      const response = await apiClient.post("/google", { credential });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.message ||
        "Google authentication failed.";
      throw new Error(message, { cause: error });
    }
  },

  logout: async () => {
    try {
      await apiClient.post("/logout");
    } catch (error) {
      console.warn("Logout warning:", error);
    }
  },

  getMe: async (token) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await apiClient.get("/me", { headers });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.message ||
        "Authentication verification failed.";
      throw new Error(message, { cause: error });
    }
  },
};

export default authService;
