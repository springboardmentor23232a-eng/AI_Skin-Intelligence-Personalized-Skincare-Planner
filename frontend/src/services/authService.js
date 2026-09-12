import axios from "axios";

const getBaseAuthUrl = () => {
  if (import.meta.env.PROD) {
    const custom = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
    if (custom && !custom.includes("localhost") && !custom.includes("127.0.0.1")) {
      return custom.endsWith("/auth") ? custom : `${custom.replace(/\/+$/, "")}/auth`;
    }
    return "/api/auth";
  }
  const devUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "/api";
  return devUrl.endsWith("/auth") ? devUrl : `${devUrl.replace(/\/+$/, "")}/auth`;
};
const API_BASE_URL = getBaseAuthUrl();

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
      let message = error.response?.data?.detail;
      if (!message) {
        if (!error.response && (error.message === "Network Error" || error.code === "ERR_NETWORK")) {
          message = "Unable to connect to the server. Please try again.";
        } else {
          message = error.message || "Registration failed. Unable to connect to server.";
        }
      }
      throw new Error(message, { cause: error });
    }
  },

  login: async (email, password) => {
    try {
      const response = await apiClient.post("/login", { email, password });
      return response.data;
    } catch (error) {
      let message = error.response?.data?.detail;
      if (!message) {
        if (!error.response && (error.message === "Network Error" || error.code === "ERR_NETWORK")) {
          message = "Unable to connect to the server. Please try again.";
        } else {
          message = error.message || "Login failed. Please check your credentials.";
        }
      }
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

  verifyEmail: async (token) => {
    try {
      const response = await apiClient.post("/verify-email", { token });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.message ||
        "Email verification failed.";
      throw new Error(message, { cause: error });
    }
  },

  resendVerification: async (email) => {
    try {
      const response = await apiClient.post("/resend-verification", { email });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.message ||
        "Failed to resend verification email.";
      throw new Error(message, { cause: error });
    }
  },

  sendPhoneOtp: async (phoneNumber, token) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await apiClient.post(
        "/phone/send-otp",
        { phone_number: phoneNumber },
        { headers }
      );
      return response.data;
    } catch (error) {
      let message = error.response?.data?.detail;
      if (!message) {
        if (error.response?.status === 503) {
          message = "SMS verification is not configured in this environment.";
        } else if (error.response?.status === 502) {
          message = "Unable to send verification code. Please try again later.";
        } else if (error.response?.status === 429) {
          message = "Too many verification requests. Please wait before requesting another code.";
        } else {
          message = error.message || "Failed to send phone verification OTP.";
        }
      }
      throw new Error(message, { cause: error });
    }
  },

  verifyPhoneOtp: async (phoneNumber, otp, token) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await apiClient.post(
        "/phone/verify-otp",
        { phone_number: phoneNumber, otp },
        { headers }
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.message ||
        "Phone verification failed.";
      throw new Error(message, { cause: error });
    }
  },

  getVerificationStatus: async (token) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await apiClient.get("/verification-status", { headers });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.message ||
        "Failed to fetch verification status.";
      throw new Error(message, { cause: error });
    }
  },
};

export default authService;
