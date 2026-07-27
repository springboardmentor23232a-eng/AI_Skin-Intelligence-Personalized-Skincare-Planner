import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  const links = [
    ['/dashboard', 'Dashboard'],
    ['/profile', 'Skin Profile'],
    ['/assessment', 'Assessment'],
    ['/routine', 'Routine'],
    ['/products', 'Products'],
    ['/progress', 'Progress'],
  ]
  if (['consultant', 'dermatologist', 'admin'].includes(user.role)) links.push(['/clients', 'Clients'])
  if (user.role === 'admin') links.push(['/admin', 'Admin'])

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <span className="font-bold text-primary-600 text-lg">SkinIQ</span>
        {links.map(([to, label]) => (
          <Link key={to} to={to} className="text-sm text-gray-600 hover:text-primary-600">
            {label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{user.full_name} ({user.role})</span>
        <button onClick={handleLogout} className="text-sm text-white bg-primary-500 hover:bg-primary-600 px-3 py-1.5 rounded-md">
          Logout
        </button>
      </div>
    </nav>
  )
}
