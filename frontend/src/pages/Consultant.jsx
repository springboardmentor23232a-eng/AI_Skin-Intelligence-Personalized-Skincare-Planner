import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'

export default function Consultant() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    client.get('/dashboard/consultant')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load client list'))
  }, [])

  if (error) return <div className="max-w-4xl mx-auto p-6 text-red-500 text-sm">{error}</div>
  if (!data) return <div className="max-w-4xl mx-auto p-6 text-gray-500 text-sm">Loading...</div>

  const filtered = data.clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Client Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Clients" value={data.client_count} />
        <StatCard label="Average Skin Health Score" value={data.average_score ?? '—'} />
        <StatCard
          label="Needs Attention"
          value={data.needs_attention_count}
          highlight={data.needs_attention_count > 0}
        />
      </div>

      <input
        type="text"
        placeholder="Search clients by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-4"
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y">
        {filtered.map((c) => (
          <Link key={c.id} to={`/clients/${c.id}`}
            className="flex items-center justify-between p-4 text-sm hover:bg-primary-50 transition-colors">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-800">{c.name}</p>
                {c.needs_attention && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    Needs attention
                  </span>
                )}
              </div>
              <p className="text-gray-500">{c.email}</p>
              <p className="text-gray-400 text-xs mt-1">
                {c.last_active ? `Last active: ${new Date(c.last_active).toLocaleDateString()}` : 'No activity logged yet'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {c.latest_score !== null && (
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                  {c.latest_score}/100
                </span>
              )}
              <span className="text-primary-500">View →</span>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="p-4 text-sm text-gray-500">No clients match your search.</p>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, highlight }) {
  return (
    <div className={`rounded-xl shadow-sm p-4 border ${highlight ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${highlight ? 'text-amber-700' : 'text-gray-800'}`}>{value}</p>
    </div>
  )
}