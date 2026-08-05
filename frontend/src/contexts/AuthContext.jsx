import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Maps backend capitalized roles to the exact lowercase values used by the frontend router/sidebars
const normalizeRole = (role) => {
  if (!role) return 'user';
  const r = role.toUpperCase().trim();
  if (r === 'DOCTOR') return 'dermatologist';
  return r.toLowerCase();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync session on boot
  useEffect(() => {
    const savedUser = localStorage.getItem('ai_skincare_session');
    const token = localStorage.getItem('ai_skincare_token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('ai_skincare_session');
        localStorage.removeItem('ai_skincare_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // API request to login credentials
      const data = await authService.login(email, password);
      
      // Store signed JWT
      localStorage.setItem('ai_skincare_token', data.access_token);
      
      // Load current authenticated user profile attributes
      const profile = await authService.getProfile();
      
      const sessionUser = {
        id: profile.id,
        email: profile.email,
        role: normalizeRole(profile.role),
        name: profile.name,
        provider: profile.provider,
        avatar: profile.provider === 'GOOGLE' 
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' 
          : ''
      };
      
      setUser(sessionUser);
      localStorage.setItem('ai_skincare_session', JSON.stringify(sessionUser));
      return { success: true, role: sessionUser.role };
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      return { success: false, message: msg };
    }
  };

  const handleGoogleLogin = async (googleCredentialToken) => {
    try {
      // Validate token with backend
      const data = await authService.googleLogin(googleCredentialToken);
      
      // Store JWT token
      localStorage.setItem('ai_skincare_token', data.access_token);
      
      // Fetch full details
      const profile = await authService.getProfile();
      
      const sessionUser = {
        id: profile.id,
        email: profile.email,
        role: normalizeRole(profile.role),
        name: profile.name,
        provider: profile.provider,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      };
      
      setUser(sessionUser);
      localStorage.setItem('ai_skincare_session', JSON.stringify(sessionUser));
      return { success: true, role: sessionUser.role };
    } catch (err) {
      const msg = err.response?.data?.message || 'Google Sign-In failed';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ai_skincare_session');
    localStorage.removeItem('ai_skincare_token');
  };

  const updateSessionName = (newName) => {
    if (user) {
      const updatedUser = { ...user, name: newName };
      setUser(updatedUser);
      localStorage.setItem('ai_skincare_session', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      googleLogin: handleGoogleLogin, 
      logout, 
      setUser, 
      updateSessionName 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
