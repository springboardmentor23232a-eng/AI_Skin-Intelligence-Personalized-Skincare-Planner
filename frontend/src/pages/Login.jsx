import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Welcome back</h1>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <input
          type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-3" required
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-4" required
        />
        <button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-md">
          Log in
        </button>
        <p className="text-sm text-gray-500 mt-4 text-center">
          No account? <Link to="/register" className="text-primary-600 font-medium">Register</Link>
        </p>
      </form>
    </div>
  )
}
