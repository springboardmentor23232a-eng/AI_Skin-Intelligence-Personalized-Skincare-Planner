import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="dashboard/user" element={<UserOverviewPage />} />
          <Route path="dashboard/user/assessment" element={<AssessmentPage />} />
          <Route path="dashboard/user/routine" element={<RoutinePlannerPage />} />
          <Route path="dashboard/user/ingredients" element={<IngredientsPage />} />
          <Route path="dashboard/user/products" element={<ProductsPage />} />
          <Route path="dashboard/user/progress" element={<ProgressTrackerPage />} />
          <Route path="dashboard/consultant" element={<ConsultantDashboardPage />} />
          <Route path="dashboard/dermatologist" element={<DermatologistDashboardPage />} />
          <Route path="dashboard/admin" element={<AdminDashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
