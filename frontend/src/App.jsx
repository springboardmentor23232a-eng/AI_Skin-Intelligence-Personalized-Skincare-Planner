import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import SkinProfile from './pages/SkinProfile'
import Assessment from './pages/Assessment'
import Routine from './pages/Routine'
import Products from './pages/Products'
import Progress from './pages/Progress'
import Admin from './pages/Admin'
import Consultant from './pages/Consultant'
import ClientDetail from './pages/ClientDetail'
import OAuthCallback from './pages/OAuthCallback'
import MainLayout from "./layouts/MainLayout";

export default function App() {
  return (
    <>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route
  path="/dashboard"
  element={
    <ProtectedRoute roles={["user"]}>
      <MainLayout>
        <Dashboard />
      </MainLayout>
    </ProtectedRoute>
  }
/>
        <Route
  path="/profile"
  element={
    <ProtectedRoute roles={["user"]}>
      <MainLayout>
        <SkinProfile />
      </MainLayout>
    </ProtectedRoute>
  }
/>
        <Route
  path="/assessment"
  element={
    <ProtectedRoute roles={["user"]}>
      <MainLayout>
        <Assessment />
      </MainLayout>
    </ProtectedRoute>
  }
/>
        <Route
  path="/routine"
  element={
    <ProtectedRoute roles={["user"]}>
      <MainLayout>
        <Routine />
      </MainLayout>
    </ProtectedRoute>
  }
/>
        <Route
  path="/products"
  element={
    <ProtectedRoute roles={["user"]}>
      <MainLayout>
        <Products />
      </MainLayout>
    </ProtectedRoute>
  }
/>
        <Route
  path="/progress"
  element={
    <ProtectedRoute roles={["user"]}>
      <MainLayout>
        <Progress />
      </MainLayout>
    </ProtectedRoute>
  }
/>
        <Route
  path="/admin"
  element={
    <ProtectedRoute roles={["admin"]}>
      <MainLayout>
        <Admin />
      </MainLayout>
    </ProtectedRoute>
  }
/>
        <Route
  path="/clients"
  element={
    <ProtectedRoute roles={["consultant", "dermatologist", "admin"]}>
      <MainLayout>
        <Consultant />
      </MainLayout>
    </ProtectedRoute>
  }
/>
<Route
  path="/clients/:id"
  element={
    <ProtectedRoute roles={["consultant", "dermatologist", "admin"]}>
      <MainLayout>
        <ClientDetail />
      </MainLayout>
    </ProtectedRoute>
  }
/>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}
