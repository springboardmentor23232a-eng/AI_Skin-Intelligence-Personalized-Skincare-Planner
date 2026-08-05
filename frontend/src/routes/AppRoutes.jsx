import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout wrappers
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Protection Middleware
import ProtectedRoute from './ProtectedRoute';

// Core Dashboard Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import UserDashboard from '../pages/UserDashboard';
import ConsultantDashboard from '../pages/ConsultantDashboard';
import DermatologistDashboard from '../pages/DermatologistDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';

// User Sidebar Sub-Pages
import SkinHealthScore from '../pages/SkinHealthScore';
import PersonalizedRoutine from '../pages/PersonalizedRoutine';
import ProductRecommendations from '../pages/ProductRecommendations';
import ProgressTracking from '../pages/ProgressTracking';
import DailySkincareChecklist from '../pages/DailySkincareChecklist';

// Consultant Sidebar Sub-Pages
import ClientProfiles from '../pages/ClientProfiles';
import SkinAssessmentReports from '../pages/SkinAssessmentReports';
import RecommendationManagement from '../pages/RecommendationManagement';
import ProgressMonitoring from '../pages/ProgressMonitoring';

// Dermatologist Sidebar Sub-Pages
import PatientInsights from '../pages/PatientInsights';
import SkinConditionReports from '../pages/SkinConditionReports';
import TreatmentRecommendations from '../pages/TreatmentRecommendations';
import ProgressAnalytics from '../pages/ProgressAnalytics';

// Admin Sidebar Sub-Pages
import UserManagementPage from '../pages/UserManagementPage';
import PlatformAnalytics from '../pages/PlatformAnalytics';
import RecommendationMonitoring from '../pages/RecommendationMonitoring';
import SystemReports from '../pages/SystemReports';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
      </Route>

      {/* Authentication Pages */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Guarded Dashboard Pages */}
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        {/* User Module Mappings */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/score" element={
          <ProtectedRoute allowedRoles={['user']}>
            <SkinHealthScore />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/routine" element={
          <ProtectedRoute allowedRoles={['user']}>
            <PersonalizedRoutine />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/recommendations" element={
          <ProtectedRoute allowedRoles={['user']}>
            <ProductRecommendations />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/progress" element={
          <ProtectedRoute allowedRoles={['user']}>
            <ProgressTracking />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/checklist" element={
          <ProtectedRoute allowedRoles={['user']}>
            <DailySkincareChecklist />
          </ProtectedRoute>
        } />

        {/* Skincare Consultant Module Mappings */}
        <Route path="/consultant" element={
          <ProtectedRoute allowedRoles={['consultant']}>
            <ConsultantDashboard />
          </ProtectedRoute>
        } />
        <Route path="/consultant/profiles" element={
          <ProtectedRoute allowedRoles={['consultant']}>
            <ClientProfiles />
          </ProtectedRoute>
        } />
        <Route path="/consultant/reports" element={
          <ProtectedRoute allowedRoles={['consultant']}>
            <SkinAssessmentReports />
          </ProtectedRoute>
        } />
        <Route path="/consultant/recommendations" element={
          <ProtectedRoute allowedRoles={['consultant']}>
            <RecommendationManagement />
          </ProtectedRoute>
        } />
        <Route path="/consultant/progress" element={
          <ProtectedRoute allowedRoles={['consultant']}>
            <ProgressMonitoring />
          </ProtectedRoute>
        } />

        {/* Clinical Dermatologist Module Mappings */}
        <Route path="/dermatologist" element={
          <ProtectedRoute allowedRoles={['dermatologist']}>
            <DermatologistDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dermatologist/insights" element={
          <ProtectedRoute allowedRoles={['dermatologist']}>
            <PatientInsights />
          </ProtectedRoute>
        } />
        <Route path="/dermatologist/reports" element={
          <ProtectedRoute allowedRoles={['dermatologist']}>
            <SkinConditionReports />
          </ProtectedRoute>
        } />
        <Route path="/dermatologist/recommendations" element={
          <ProtectedRoute allowedRoles={['dermatologist']}>
            <TreatmentRecommendations />
          </ProtectedRoute>
        } />
        <Route path="/dermatologist/analytics" element={
          <ProtectedRoute allowedRoles={['dermatologist']}>
            <ProgressAnalytics />
          </ProtectedRoute>
        } />

        {/* Platform Admin Module Mappings */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagementPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PlatformAnalytics />
          </ProtectedRoute>
        } />
        <Route path="/admin/monitoring" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <RecommendationMonitoring />
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SystemReports />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['user', 'consultant', 'dermatologist', 'admin']}>
            <Profile />
          </ProtectedRoute>
        } />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
