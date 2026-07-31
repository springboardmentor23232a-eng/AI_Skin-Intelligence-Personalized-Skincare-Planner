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

  const isSelfServiceUser = user.role === 'user'
  const isProvider = ['consultant', 'dermatologist'].includes(user.role)

  const links = []
  if (isSelfServiceUser) {
    links.push(
      ['/dashboard', 'Dashboard'],
      ['/profile', 'Skin Profile'],
      ['/assessment', 'Assessment'],
      ['/routine', 'Routine'],
      ['/products', 'Products'],
      ['/progress', 'Progress'],
    )
  }
  if (isProvider) links.push(['/clients', 'Clients'])
  if (user.role === 'admin') links.push(['/admin', 'Admin'])

  const homeLink = user.role === 'admin' ? '/admin' : isProvider ? '/clients' : '/dashboard'

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <Link to={homeLink} className="font-bold text-primary-600 text-lg">SkinIQ</Link>
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