import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect user to their matching dashboard based on their role
    if (user.role === "SKINCARE_CONSULTANT") {
      return <Navigate to="/consultant" replace />;
    } else if (user.role === "ADMIN") {
      return <Navigate to="/admin" replace />;
    } else if (user.role === "DERMATOLOGIST") {
      return <Navigate to="/dermatologist" replace />;
    } else {
      return <Navigate to="/user" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
