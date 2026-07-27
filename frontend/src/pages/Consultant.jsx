import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'

export default function Consultant() {
  const [clients, setClients] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    client.get('/clients')
      .then((res) => setClients(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load client list'))
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Client Overview</h1>
      <p className="text-gray-500 mb-6">
        {clients.length} client{clients.length === 1 ? '' : 's'} registered on the platform. Click a name for their full profile, assessment, routine, and progress history.
      </p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y">
        {clients.map((c) => (
          <Link key={c.id} to={`/clients/${c.id}`}
            className="flex items-center justify-between p-4 text-sm hover:bg-primary-50 transition-colors">
            <div>
              <p className="font-medium text-gray-800">{c.name}</p>
              <p className="text-gray-500">{c.email}</p>
            </div>
            <span className="text-primary-500">View →</span>
          </Link>
        ))}
        {clients.length === 0 && !error && (
          <p className="p-4 text-sm text-gray-500">No clients yet.</p>
        )}
      </div>
    </div>
  )
}