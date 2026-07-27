import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import client from '../api/client'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

export default function ClientDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [recommendations, setRecommendations] = useState([])
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const loadDetail = () => client.get(`/clients/${id}`).then((res) => setData(res.data)).catch((err) => setError(err.response?.data?.detail || 'Failed to load client'))
  const loadRecommendations = () => client.get(`/clients/${id}/recommendations`).then((res) => setRecommendations(res.data)).catch(() => {})

  useEffect(() => {
    loadDetail()
    loadRecommendations()
  }, [id])

  const submitNote = async (e) => {
    e.preventDefault()
    if (!note.trim()) return
    setSaving(true)
    try {
      await client.post(`/clients/${id}/recommendations`, { note })
      setNote('')
      loadRecommendations()
    } finally {
      setSaving(false)
    }
  }

  if (error) return <div className="max-w-3xl mx-auto p-6 text-red-500 text-sm">{error}</div>
  if (!data) return <div className="max-w-3xl mx-auto p-6 text-gray-500 text-sm">Loading...</div>

  const { user, profile, assessment, routine, progress_logs } = data
  const chronological = [...progress_logs].reverse()
  const chartData = {
    labels: chronological.map((l) => new Date(l.log_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Skin Health Score',
      data: chronological.map((l) => l.skin_health_score),
      borderColor: '#d97757',
      backgroundColor: 'rgba(217, 119, 87, 0.12)',
      fill: true,
      tension: 0.3,
      pointRadius: 3,
    }],
  }
  const chartOptions = { responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 } } }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link to="/clients" className="text-sm text-primary-600">&larr; Back to clients</Link>
      <h1 className="text-2xl font-bold mt-2 mb-1">{user.full_name}</h1>
      <p className="text-gray-500 mb-6">{user.email}</p>

      {!profile && (
        <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 text-sm text-primary-700 mb-4">
          This client hasn't created a skin profile yet.
        </div>
      )}

      {profile && (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-4">
          <h2 className="font-semibold mb-2">Skin Profile</h2>
          <p className="text-sm text-gray-600">Type: {profile.skin_type || '—'} · Age: {profile.age_group || '—'}</p>
          <p className="text-sm text-gray-600">Concerns: {(profile.skin_concerns || []).join(', ') || '—'}</p>
          <p className="text-sm text-gray-600">Allergies: {(profile.allergies || []).join(', ') || '—'}</p>
          <p className="text-sm text-gray-600">
            Sleep: {profile.sleep_quality || '—'} ({profile.sleep_hours ?? '—'}h) · Water: {profile.water_intake_liters ?? '—'}L/day
          </p>
          <p className="text-sm text-gray-600">Environmental exposure: {profile.environmental_exposure || '—'}</p>
        </div>
      )}

      {assessment && (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-4">
          <h2 className="font-semibold mb-2">Latest Assessment</h2>
          <p className="text-2xl font-bold text-primary-600 mb-1">{assessment.condition_score}/100</p>
          <p className="text-sm text-gray-600 mb-1">
            Prioritized concerns: {(assessment.prioritized_concerns || []).join(', ') || '—'}
          </p>
          {assessment.risk_factors?.length > 0 && (
            <ul className="list-disc list-inside text-sm text-gray-600">
              {assessment.risk_factors.map((r) => <li key={r}>{r}</li>)}
            </ul>
          )}
        </div>
      )}

      {routine && (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-4">
          <h2 className="font-semibold mb-2">Current Routine</h2>
          <p className="text-sm text-gray-600 mb-1">
            <b>Morning:</b> {routine.morning_routine.map((s) => s.category).join(' → ')}
          </p>
          <p className="text-sm text-gray-600">
            <b>Evening:</b> {routine.evening_routine.map((s) => s.category).join(' → ')}
          </p>
        </div>
      )}

      {chronological.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-4">
          <h2 className="font-semibold mb-3">Progress Trend</h2>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-4">
        <h2 className="font-semibold mb-2">Progress History</h2>
        {progress_logs.length === 0 && <p className="text-sm text-gray-500">No logs yet.</p>}
        <div className="space-y-2">
          {progress_logs.map((l, i) => (
            <div key={i} className="flex justify-between text-sm border-b border-gray-50 pb-1">
              <span>{new Date(l.log_date).toLocaleDateString()} — {l.skin_condition_note || '—'}</span>
              <span className="font-medium text-primary-600">
                {l.skin_health_score ? `${l.skin_health_score}/100` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h2 className="font-semibold mb-3">Treatment Recommendations</h2>

        <form onSubmit={submitNote} className="mb-4 space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a recommendation or treatment note for this client..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            rows={2}
          />
          <button type="submit" disabled={saving}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
            {saving ? 'Saving...' : 'Add Recommendation'}
          </button>
        </form>

        <div className="space-y-3">
          {recommendations.length === 0 && <p className="text-sm text-gray-500">No recommendations yet.</p>}
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
    </div>
  )
}