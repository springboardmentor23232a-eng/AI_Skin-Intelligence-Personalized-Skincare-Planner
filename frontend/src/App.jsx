import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OAuthCallback from './pages/OAuthCallback';
import UserDashboard from './pages/user/UserDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ConsultantDashboard from './pages/consultant/ConsultantDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

function RootRedirect() {
  const { user, loading, homePathFor } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={homePathFor(user.role)} replace />;
  return <Home />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />

          <Route
            path="/user/*"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/*"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultant/*"
            element={
              <ProtectedRoute allowedRoles={['CONSULTANT']}>
                <ConsultantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
