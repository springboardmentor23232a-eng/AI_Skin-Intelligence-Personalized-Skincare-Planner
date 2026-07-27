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

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><SkinProfile /></ProtectedRoute>} />
        <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
        <Route path="/routine" element={<ProtectedRoute><Routine /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute roles={['consultant', 'dermatologist', 'admin']}><Consultant /></ProtectedRoute>} />
<Route path="/clients/:id" element={<ProtectedRoute roles={['consultant', 'dermatologist', 'admin']}><ClientDetail /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}
