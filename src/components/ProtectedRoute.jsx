import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardForRole, normalizeRole } from '../utils/roleUtils';
import LoadingScreen from './LoadingScreen';
import { AlertTriangle } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Loading AI Skin Planner..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  let accessDenied = false;
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = normalizeRole(user.role);
    const normalizedAllowed = allowedRoles.map(r => normalizeRole(r));
    const hasAccess = normalizedAllowed.includes(userRole) || userRole === 'ADMIN';
    if (!hasAccess) {
      accessDenied = true;
    }
  }

  if (accessDenied) {
    const targetDashboard = getDashboardForRole(user.role);
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        color: 'var(--text-primary)',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          maxWidth: '480px',
          width: '100%',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <AlertTriangle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--danger)' }}>
            403 Access Denied
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            Your account role (<strong>{user.role}</strong>) does not have permission to view this module. Redirecting to your assigned dashboard...
          </p>
          <Navigate to={targetDashboard} replace />
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
