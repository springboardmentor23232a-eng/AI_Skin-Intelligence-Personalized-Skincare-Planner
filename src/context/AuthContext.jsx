import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Simple function to create a basic dummy JWT token string for demonstration
const generateDummyToken = (userData) => {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    id: userData.id,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    iat: Math.floor(Date.now() / 1000)
  };

  const encode = (obj) => btoa(JSON.stringify(obj)).replace(/=/g, "");
  
  const tokenString = `${encode(header)}.${encode(payload)}.dummy_signature_hash`;
  
  return {
    rawToken: tokenString,
    header,
    payload,
    signature: "dummy_signature_hash"
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokenData, setTokenData] = useState(null);

  // Load saved login state on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem("app_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setTokenData(generateDummyToken(parsed));
    } else {
      // Default initial dummy user
      const defaultUser = {
        id: "usr_1",
        name: "Akash Prajapati",
        email: "akash@example.com",
        role: "user"
      };
      setUser(defaultUser);
      setTokenData(generateDummyToken(defaultUser));
    }
  }, []);

  const login = (role = "user", email = "user@example.com", name = "Akash Prajapati") => {
    const userData = {
      id: "usr_" + Math.floor(Math.random() * 1000),
      name: name || "Akash Prajapati",
      email: email || "akash@example.com",
      role: role
    };

    const tokenInfo = generateDummyToken(userData);
    setUser(userData);
    setTokenData(tokenInfo);

    localStorage.setItem("app_user", JSON.stringify(userData));
    localStorage.setItem("app_token", tokenInfo.rawToken);
  };

  const logout = () => {
    setUser(null);
    setTokenData(null);
    localStorage.removeItem("app_user");
    localStorage.removeItem("app_token");
  };

  return (
    <AuthContext.Provider value={{ user, tokenData, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
