import React, { createContext, useContext, useState } from 'react';
import { USER_ROLES } from '@/lib/constants';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    id: 'usr_101',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@skintelligence.ai',
    role: USER_ROLES.CONSUMER, // Default role
    skinType: 'Combination',
    ageGroup: '25-34',
    concerns: ['Hyperpigmentation', 'Uneven Skin Tone', 'Fine Lines'],
    allergies: ['Fragrance', 'Parabens'],
  });

  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Switch role dynamically for testing all 4 dashboards in document
  const switchRole = (newRole) => {
    setUser((prev) => ({ ...prev, role: newRole }));
  };

  const login = (role = USER_ROLES.CONSUMER) => {
    setIsAuthenticated(true);
    setUser((prev) => ({ ...prev, role }));
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        switchRole,
        login,
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
