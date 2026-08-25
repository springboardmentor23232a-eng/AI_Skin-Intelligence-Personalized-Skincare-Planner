import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Allow route when no role restriction is provided
  if (!roles || roles.length === 0) {
    return children;
  }

  // Exact role check
  if (!roles.includes(user.role)) {
    console.warn(
      "ProtectedRoute role mismatch:",
      {
        currentRole: user.role,
        allowedRoles: roles,
        path: location.pathname,
      }
    );

    // Send the user to their correct home page
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    if (
      user.role === "consultant" ||
      user.role === "dermatologist"
    ) {
      return (
        <Navigate
          to="/provider-dashboard"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}