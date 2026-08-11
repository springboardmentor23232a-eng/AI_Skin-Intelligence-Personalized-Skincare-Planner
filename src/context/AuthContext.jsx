import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("skin_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("skin_token") || null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore network errors on logout
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("skin_token");
    localStorage.removeItem("skin_refresh_token");
    localStorage.removeItem("skin_user");
  };

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("skin_token");
      if (storedToken) {
        try {
          const userData = await authService.getMe(storedToken);
          setUser(userData);
          localStorage.setItem("skin_user", JSON.stringify(userData));
        } catch (error) {
          console.error("Auth verification failed:", error);
          await logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem("skin_token", data.access_token);
    localStorage.setItem("skin_refresh_token", data.refresh_token);
    localStorage.setItem("skin_user", JSON.stringify(data.user));
    return data.user;
  };

  const register = async (full_name, email, password, role) => {
    const data = await authService.register(full_name, email, password, role);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem("skin_token", data.access_token);
    localStorage.setItem("skin_refresh_token", data.refresh_token);
    localStorage.setItem("skin_user", JSON.stringify(data.user));
    return data.user;
  };

  const googleLogin = async (credential) => {
    const data = await authService.googleLogin(credential);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem("skin_token", data.access_token);
    localStorage.setItem("skin_refresh_token", data.refresh_token);
    localStorage.setItem("skin_user", JSON.stringify(data.user));
    return data.user;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
