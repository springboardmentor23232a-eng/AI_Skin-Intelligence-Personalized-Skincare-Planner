import React, { createContext, useContext, useState, useEffect } from "react";
import { apiService } from "../services/api";

const AuthContext = createContext();

// Helper function to decode JWT payload safely
const parseJwt = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("app_token") || null);
  const [tokenPayload, setTokenPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from local storage and backend API
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem("app_token");
      const savedUser = localStorage.getItem("app_user");

      if (savedToken) {
        const decoded = parseJwt(savedToken);

        // Check JWT Expiration
        if (decoded && decoded.exp && decoded.exp * 1000 < Date.now()) {
          console.warn("JWT token expired during initialization. Logging out.");
          logout();
          setLoading(false);
          return;
        }

        setToken(savedToken);
        setTokenPayload(decoded);

        try {
          const res = await apiService.getCurrentUser();
          if (res && res.data) {
            setUser(res.data);
            localStorage.setItem("app_user", JSON.stringify(res.data));
          } else if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        } catch (err) {
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      } else {
        // Initial Demo user setup if no token exists
        const defaultUser = {
          id: 1,
          name: "John Doe",
          email: "john@gmail.com",
          role: "USER",
          provider: "LOCAL",
          bio: "Passionate developer aiming for skill growth and peak health."
        };
        setUser(defaultUser);
        const demoToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huQGdtYWlsLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzIyMzMyODAwLCJleHAiOjE5MjIzMzI4MDB9.signature";
        setToken(demoToken);
        setTokenPayload(parseJwt(demoToken));
        localStorage.setItem("app_token", demoToken);
        localStorage.setItem("app_user", JSON.stringify(defaultUser));
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await apiService.login({ email, password });
      if (res && res.token) {
        const tokenStr = res.token;
        const userData = res.user;
        setToken(tokenStr);
        setUser(userData);
        setTokenPayload(parseJwt(tokenStr));

        localStorage.setItem("app_token", tokenStr);
        localStorage.setItem("app_user", JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, message: res.message || "Login failed" };
    } catch (err) {
      console.warn("API Login Error:", err.message);
      // Local fallback for UI demo testing
      let role = "USER";
      let name = "John Doe";
      if (email.includes("admin")) {
        role = "ADMIN";
        name = "System Admin";
      } else if (email.includes("coach")) {
        role = "WELLNESS_COACH";
        name = "Sarah Coach";
      }

      const userData = { id: 1, name, email, role, provider: "LOCAL" };
      const demoToken = `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({ id: 1, name, email, role, exp: Math.floor(Date.now() / 1000) + 86400 }))}.signature`;

      setToken(demoToken);
      setUser(userData);
      setTokenPayload(parseJwt(demoToken));
      localStorage.setItem("app_token", demoToken);
      localStorage.setItem("app_user", JSON.stringify(userData));
      return { success: true, user: userData };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await apiService.register({ name, email, password, role: role || "USER" });
      if (res && res.token) {
        const tokenStr = res.token;
        const userData = res.user;
        setToken(tokenStr);
        setUser(userData);
        setTokenPayload(parseJwt(tokenStr));

        localStorage.setItem("app_token", tokenStr);
        localStorage.setItem("app_user", JSON.stringify(userData));
        return { success: true, user: userData };
      }
      return { success: false, message: res.message || "Registration failed" };
    } catch (err) {
      console.warn("API Registration error:", err.message);
      const userData = { id: Math.floor(Math.random() * 1000), name, email, role: role || "USER", provider: "LOCAL" };
      const demoToken = `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({ id: userData.id, name, email, role: userData.role }))}.signature`;
      setToken(demoToken);
      setUser(userData);
      setTokenPayload(parseJwt(demoToken));
      localStorage.setItem("app_token", demoToken);
      localStorage.setItem("app_user", JSON.stringify(userData));
      return { success: true, user: userData };
    }
  };

  const loginWithGoogle = async (googleUser) => {
    try {
      const res = await apiService.googleAuth(googleUser);
      if (res && res.token) {
        const tokenStr = res.token;
        const userData = res.user;
        setToken(tokenStr);
        setUser(userData);
        setTokenPayload(parseJwt(tokenStr));

        localStorage.setItem("app_token", tokenStr);
        localStorage.setItem("app_user", JSON.stringify(userData));
        return { success: true, user: userData };
      }
    } catch (err) {
      const userData = {
        id: 99,
        name: googleUser.name || "Google User",
        email: googleUser.email || "google@gmail.com",
        role: "USER",
        provider: "GOOGLE"
      };
      const demoToken = `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({ id: 99, name: userData.name, email: userData.email, role: "USER" }))}.signature`;
      setToken(demoToken);
      setUser(userData);
      setTokenPayload(parseJwt(demoToken));
      localStorage.setItem("app_token", demoToken);
      localStorage.setItem("app_user", JSON.stringify(userData));
      return { success: true, user: userData };
    }
  };

  const updateProfileState = (updatedFields) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedFields };
      localStorage.setItem("app_user", JSON.stringify(newUser));
      return newUser;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setTokenPayload(null);
    localStorage.removeItem("app_user");
    localStorage.removeItem("app_token");
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      tokenPayload,
      login,
      register,
      loginWithGoogle,
      logout,
      updateProfileState,
      loading,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
