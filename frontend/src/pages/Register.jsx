import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'user' })
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Create your account</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <input name="full_name" placeholder="Full name" value={form.full_name} onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 mb-3" required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 mb-3" required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 mb-3" required />
        <select name="role" value={form.role} onChange={handleChange} className="w-full border rounded-md px-3 py-2 mb-4">
          <option value="user">User</option>
          <option value="consultant">Skincare Consultant</option>
          <option value="dermatologist">Dermatologist</option>
        </select>
        <button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-md">
          Register
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <a
          href="/api/auth/google/login"
          className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33C2.44 15.98 5.48 18 9 18z"/><path fill="#FBBC05" d="M3.97 10.72c-.18-.54-.28-1.11-.28-1.72s.1-1.18.28-1.72V4.95H.96C.35 6.17 0 7.55 0 9s.35 2.83.96 4.05l3.01-2.33z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/></svg>
          Continue with Google
        </a>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Google sign-up creates a standard User account. Consultants/Dermatologists should register with email + password to select their role.
        </p>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account? <Link to="/login" className="text-primary-600 font-medium">Log in</Link>
        </p>
      </form>
    </div>
  )
}