import React, { createContext, useContext, useState, useEffect } from 'react';
import { USER_ROLES } from '@/lib/constants';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(() => {
    return localStorage.getItem('user_is_first_time') === 'true';
  });

  const [accessDeniedMessage, setAccessDeniedMessage] = useState(null);

  const [user, setUser] = useState(() => {
    const savedRole = localStorage.getItem('user_role') || USER_ROLES.CONSUMER;
    const savedEmail = localStorage.getItem('user_email') || 'demo.user@skintelligence.ai';
    const savedName = localStorage.getItem('user_name') || savedEmail.split('@')[0].replace('.', ' ');
    return {
      id: 'usr_101',
      name: savedName,
      email: savedEmail,
      role: savedRole,
      skinType: 'Combination',
      ageGroup: '25-34',
      concerns: ['Hyperpigmentation', 'Uneven Skin Tone'],
      allergies: ['Fragrance'],
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  // Keep user logged in across page refreshes by syncing localStorage
  useEffect(() => {
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      setToken(existingToken);
      setIsAuthenticated(true);
    }
  }, []);

  // Real FastAPI JWT login handler supporting isFirstTime flag and name
  const loginWithToken = (accessToken, email, role = USER_ROLES.CONSUMER, isFirstTime = false, name = '') => {
    const displayName = name || localStorage.getItem('user_name') || email.split('@')[0].replace('.', ' ');

    localStorage.setItem('token', accessToken);
    localStorage.setItem('user_role', role);
    localStorage.setItem('user_email', email);
    localStorage.setItem('user_name', displayName);
    localStorage.setItem('user_is_first_time', isFirstTime ? 'true' : 'false');

    setToken(accessToken);
    setIsAuthenticated(true);
    setIsFirstTimeLogin(isFirstTime);
    setAccessDeniedMessage(null);

    setUser({
      id: 'usr_' + Math.random().toString(36).substr(2, 6),
      name: displayName,
      email: email,
      role: role,
      skinType: 'Combination',
      ageGroup: '25-34',
      concerns: ['Hyperpigmentation', 'Uneven Skin Tone'],
      allergies: ['Fragrance'],
    });
  };

  // Authenticated HTTP request helper attaching JWT Bearer token
  const fetchWithAuth = async (url, options = {}) => {
  const storedToken = localStorage.getItem('token');

  const headers = {
    ...(options.headers || {}),
  };

  // Don't manually set Content-Type for FormData.
  // The browser automatically sets:
  // multipart/form-data; boundary=...
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (storedToken) {
    headers['Authorization'] = `Bearer ${storedToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const data = await response.json().catch(() => null);
    const msg = data?.detail || 'Authentication required.';
    setAccessDeniedMessage(msg);
    throw new Error(msg);
  }

  if (response.status === 403) {
    const data = await response.json().catch(() => null);
    const msg = data?.detail || 'Access Denied: HTTP 403 Forbidden';
    setAccessDeniedMessage(msg);
    throw new Error(msg);
  }

  return response;
};

  // Backwards compatible login helper
  const login = (role = USER_ROLES.CONSUMER) => {
    loginWithToken(token || 'dummy_token', user.email, role, false);
  };

  // Switch role dynamically for testing all 4 dashboards
  const switchRole = (newRole) => {
    localStorage.setItem('user_role', newRole);
    setUser((prev) => ({ ...prev, role: newRole }));
  };

  // Real Logout handler removing token from localStorage
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_is_first_time');
    setToken(null);
    setIsAuthenticated(false);
    setIsFirstTimeLogin(false);
    setAccessDeniedMessage(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isFirstTimeLogin,
        accessDeniedMessage,
        setAccessDeniedMessage,
        fetchWithAuth,
        switchRole,
        login,
        loginWithToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
