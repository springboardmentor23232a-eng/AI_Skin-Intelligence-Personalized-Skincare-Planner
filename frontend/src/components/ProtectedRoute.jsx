import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Guards a route: requires a logged-in user, and optionally restricts
 * access to a specific set of roles. Users who are authenticated but hold
 * the wrong role get bounced to their own dashboard, not to /login.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, homePathFor } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <div className="spinner" style={{ borderTopColor: '#2a8c82', borderColor: '#e2ebe9' }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }

  return children;
}
