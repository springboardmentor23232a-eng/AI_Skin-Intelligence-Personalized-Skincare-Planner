import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import SkillAssessment from "./pages/SkillAssessment";
import WellnessDashboard from "./pages/WellnessDashboard";
import UserProfile from "./pages/UserProfile";
import ConsultantDashboard from "./pages/ConsultantDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />

        {/* Role-Based Protected Dashboard Routes */}
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={['USER', 'SKINCARE_CONSULTANT', 'CONSULTANT', 'DERMATOLOGIST', 'WELLNESS_COACH', 'ADMIN']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment"
          element={
            <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
              <SkillAssessment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consultant"
          element={
            <ProtectedRoute allowedRoles={['SKINCARE_CONSULTANT', 'CONSULTANT', 'ADMIN']}>
              <ConsultantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={['DERMATOLOGIST', 'ADMIN']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wellness"
          element={
            <ProtectedRoute allowedRoles={['WELLNESS_COACH', 'ADMIN']}>
              <WellnessDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['USER', 'SKINCARE_CONSULTANT', 'CONSULTANT', 'DERMATOLOGIST', 'WELLNESS_COACH', 'ADMIN']}>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch All */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;