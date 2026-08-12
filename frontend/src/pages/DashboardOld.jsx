import React, { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [checklist, setChecklist] = useState(null)
  const [recommendations, setRecommendations] = useState([])

  const loadDashboard = () => client.get('/dashboard/user').then((res) => setData(res.data)).catch(() => {})
  const loadChecklist = () => client.get('/checklist/today').then((res) => setChecklist(res.data)).catch(() => {})
  const loadRecommendations = () => client.get('/recommendations/me').then((res) => setRecommendations(res.data)).catch(() => {})

  useEffect(() => {
    loadDashboard()
    loadChecklist()
    loadRecommendations()
  }, [])

  const toggleItem = async (step_key) => {
    await client.post('/checklist/toggle', { step_key })
    loadChecklist()
  }

  if (user && user.role === 'admin') return <Navigate to="/admin" replace />
  if (user && ['consultant', 'dermatologist'].includes(user.role)) return <Navigate to="/clients" replace />

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Hi {user?.full_name} 👋</h1>
      <p className="text-gray-500 mb-6">Here's your skin health snapshot.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card label="Skin Health Score" value={data?.skin_health_score ?? '—'} />
        <Card label="Latest Condition Score" value={data?.latest_condition_score ?? '—'} />
        <Card label="Routine Set Up" value={data?.has_routine ? 'Yes' : 'Not yet'} />
      </div>

      {data?.routine_needs_review && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 mb-4">
          Your Skin Health Score has been trending down over your recent logs.
          Consider reviewing your <Link to="/profile" className="font-semibold underline">Skin Profile</Link> for
          any new triggers, or <Link to="/routine" className="font-semibold underline">regenerating your routine</Link>.
        </div>
      )}

      {!data?.has_profile && (
        <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 text-sm text-primary-700 mb-4">
          You haven't created a skin profile yet. Head to <b>Skin Profile</b> to get started.
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-6">
          <h2 className="font-semibold mb-3">Notes From Your Care Team</h2>
          <div className="space-y-3">
            {recommendations.map((r) => (
              <div key={r.id} className="text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                <p className="text-gray-700">{r.note}</p>
                <p className="text-gray-400 text-xs mt-1">
                  — {r.author_name} ({r.author_role}), {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        {checklist?.has_routine && (
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h2 className="font-semibold mb-3">Today's Checklist</h2>
            <div className="space-y-2">
              {checklist.items.map((item) => (
                <label key={item.step_key} className="flex items-start gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleItem(item.step_key)}
                    className="mt-0.5"
                  />
                  <span className={item.completed ? 'line-through text-gray-400' : 'text-gray-700'}>
                    <b>{item.period}:</b> {item.category} — {item.instruction}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {data?.top_products?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h2 className="font-semibold mb-3">Top Product Matches</h2>
            <div className="space-y-2">
              {data.top_products.map((p) => (
                <div key={p.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                  <span className="text-gray-700">{p.name}</span>
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                    {Math.round(p.suitability_score)}% match
                  </span>
                </div>
              ))}
            </div>
            <Link to="/products" className="text-sm text-primary-600 mt-3 inline-block">See all recommendations →</Link>
          </div>
        )}
      </div>
    </div>
  )
}

function Card({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-800">{value}</p>
    </div>
  )
}