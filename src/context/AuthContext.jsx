import React, { createContext, useContext, useState, useEffect } from "react";
import { USER_ROLES } from "@/lib/constants";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    email: "",
    role: USER_ROLES.CONSUMER,
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
  setIsAuthenticated(true);

  setUser((prev) => ({
    ...prev,
  }));
}
  }, []);

  const login = async (email, password, role) => {
    try {
      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch("http://127.0.0.1:8000/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();

      localStorage.setItem("token", data.access_token);

      setIsAuthenticated(true);

      setUser({
        email,
        role,
      });

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };


  const switchRole = (newRole) => {
    setUser((prev) => ({
      ...prev,
      role: newRole,
    }));
  };
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}