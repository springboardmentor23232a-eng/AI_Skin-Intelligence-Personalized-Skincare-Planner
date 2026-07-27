import React, { useEffect, useState } from 'react'
import client from '../api/client'

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [users, setUsers] = useState([])
  const [recommendations, setRecommendations] = useState([])

  const loadUsers = () => client.get('/admin/users').then((res) => setUsers(res.data))

  useEffect(() => {
    client.get('/dashboard/admin').then((res) => setStats(res.data))
    client.get('/admin/analytics').then((res) => setAnalytics(res.data))
    client.get('/admin/recommendations').then((res) => setRecommendations(res.data))
    loadUsers()
  }, [])

  const toggleActive = async (u) => {
    const action = u.is_active ? 'deactivate' : 'activate'
    await client.post(`/admin/users/${u.id}/${action}`)
    loadUsers()
  }

  const downloadReport = async () => {
    const res = await client.get('/admin/reports/excel', { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = 'platform_report.xlsx'
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button onClick={downloadReport} className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm">
          Download Platform Report (Excel)
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1 capitalize">{k.replace(/_/g, ' ')}</p>
              <p className="text-xl font-bold text-gray-800">{v}</p>
            </div>
          ))}
        </div>
      )}

      {analytics && (
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h2 className="font-semibold mb-3">Platform Analytics</h2>
            <p className="text-sm text-gray-600 mb-1">
              Average Skin Health Score: <b>{analytics.average_skin_health_score ?? '—'}</b>
              {' '}({analytics.users_with_progress_logs} users with logs)
            </p>
            <p className="text-sm text-gray-600 mb-2">Users by role:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(analytics.role_counts).map(([role, count]) => (
                <span key={role} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full capitalize">
                  {role}: {count}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h2 className="font-semibold mb-3">Top Skin Concerns (Platform-wide)</h2>
            <div className="space-y-1">
              {analytics.top_concerns.length === 0 && <p className="text-sm text-gray-500">No data yet.</p>}
              {analytics.top_concerns.map((c) => (
                <div key={c.concern} className="flex justify-between text-sm">
                  <span className="text-gray-700 capitalize">{c.concern.replace(/_/g, ' ')}</span>
                  <span className="text-gray-500">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="font-semibold mb-3">Users</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y">
          {users.map((u) => (
            <div key={u.id} className="flex justify-between items-center p-3 text-sm">
              <span>{u.full_name} · {u.email}</span>
              <div className="flex items-center gap-3">
                <span className="text-gray-500 capitalize">{u.role} {u.is_active ? '' : '(inactive)'}</span>
                <button
                  onClick={() => toggleActive(u)}
                  className={`text-xs px-2 py-1 rounded-md ${u.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                >
                  {u.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Recommendation Monitoring</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y">
          {recommendations.length === 0 && <p className="p-4 text-sm text-gray-500">No recommendations issued yet.</p>}
          {recommendations.map((r) => (
            <div key={r.id} className="p-3 text-sm">
              <p className="text-gray-700">{r.note}</p>
              <p className="text-gray-400 text-xs mt-1">
                To {r.client_name} — by {r.author_name} ({r.author_role}), {new Date(r.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}