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
        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account? <Link to="/login" className="text-primary-600 font-medium">Log in</Link>
        </p>
      </form>
    </div>
  )
}
