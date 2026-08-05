import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If authenticated but role is unauthorized, redirect to their main hub or not-found
    const roleRedirects = {
      user: '/dashboard',
      consultant: '/consultant',
      dermatologist: '/dermatologist',
      admin: '/admin'
    };
    return <Navigate to={roleRedirects[user.role] || '/'} replace />;
  }

  return children;
}
