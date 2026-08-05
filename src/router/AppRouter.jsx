import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLES } from '@/lib/constants';
import { RootLayout } from '@/components/layout/RootLayout';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import UserOverviewPage from '@/pages/user/UserOverviewPage';
import AssessmentPage from '@/pages/user/AssessmentPage';
import RoutinePlannerPage from '@/pages/user/RoutinePlannerPage';
import IngredientsPage from '@/pages/user/IngredientsPage';
import ProductsPage from '@/pages/user/ProductsPage';
import ProgressTrackerPage from '@/pages/user/ProgressTrackerPage';
import ConsultantDashboardPage from '@/pages/consultant/ConsultantDashboardPage';
import DermatologistDashboardPage from '@/pages/dermatologist/DermatologistDashboardPage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';

// Protected Route Guard with RBAC Enforcement
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, setAccessDeniedMessage } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const currentRole = (user?.role || USER_ROLES.CONSUMER).toLowerCase().replace('wellness_coach', 'consultant');

  // Administrator has universal access to all dashboards
  if (currentRole === 'admin') {
    return children;
  }

  if (allowedRoles && !allowedRoles.map(r => r.toLowerCase()).includes(currentRole)) {
    const deniedRoleName = user?.role || 'Your role';
    setAccessDeniedMessage(`Access Denied: ${deniedRoleName} does not have authorization to access this area.`);

    // Redirect user to their permitted role dashboard
    switch (currentRole) {
      case 'consultant':
        return <Navigate to="/dashboard/consultant" replace />;
      case 'dermatologist':
        return <Navigate to="/dashboard/dermatologist" replace />;
      default:
        return <Navigate to="/dashboard/user" replace />;
    }
  }

  return children;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="login" element={<LoginPage />} />

          {/* User / Consumer Protected Routes */}
          <Route
            path="dashboard/user"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.CONSUMER, USER_ROLES.ADMIN]}>
                <UserOverviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/user/assessment"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.CONSUMER, USER_ROLES.ADMIN]}>
                <AssessmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/user/routine"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.CONSUMER, USER_ROLES.ADMIN]}>
                <RoutinePlannerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/user/ingredients"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.CONSUMER, USER_ROLES.ADMIN]}>
                <IngredientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/user/products"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.CONSUMER, USER_ROLES.ADMIN]}>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard/user/progress"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.CONSUMER, USER_ROLES.ADMIN]}>
                <ProgressTrackerPage />
              </ProtectedRoute>
            }
          />

          {/* Consultant Protected Routes */}
          <Route
            path="dashboard/consultant"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.CONSULTANT, USER_ROLES.ADMIN]}>
                <ConsultantDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Dermatologist Protected Routes */}
          <Route
            path="dashboard/dermatologist"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.DERMATOLOGIST, USER_ROLES.ADMIN]}>
                <DermatologistDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Administrator Protected Routes (Strictly ADMIN) */}
          <Route
            path="dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
