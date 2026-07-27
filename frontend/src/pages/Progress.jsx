import React, { useEffect, useState } from 'react'
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

export default function Progress() {
  const [history, setHistory] = useState([])
  const [form, setForm] = useState({ routine_followed_morning: false, routine_followed_evening: false, skin_condition_note: '' })

  const load = () => client.get('/progress/history').then((res) => setHistory(res.data))

  useEffect(() => { load() }, [])

  const chronological = [...history].reverse()
  const chartData = {
    labels: chronological.map((h) => new Date(h.log_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Skin Health Score',
        data: chronological.map((h) => h.skin_health_score),
        borderColor: '#d97757',
        backgroundColor: 'rgba(217, 119, 87, 0.12)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  }
  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { min: 0, max: 100 } },
  }

  const submit = async (e) => {
    e.preventDefault()
    await client.post('/progress/log', form)
    setForm({ routine_followed_morning: false, routine_followed_evening: false, skin_condition_note: '' })
    load()
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Progress Tracking</h1>

      <form onSubmit={submit} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-8 space-y-3">
        <h2 className="font-semibold">Log Today</h2>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.routine_followed_morning}
            onChange={(e) => setForm({ ...form, routine_followed_morning: e.target.checked })} />
          Followed morning routine
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.routine_followed_evening}
            onChange={(e) => setForm({ ...form, routine_followed_evening: e.target.checked })} />
          Followed evening routine
        </label>
        <textarea placeholder="Notes on how your skin feels today..." value={form.skin_condition_note}
          onChange={(e) => setForm({ ...form, skin_condition_note: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm" rows={2} />
        <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm">
          Save Log
        </button>
      </form>

      {chronological.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-8">
          <h2 className="font-semibold mb-3">Score Trend</h2>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      <h2 className="font-semibold mb-3">History</h2>
      <div className="space-y-2">
        {history.map((h) => (
          <div key={h.id} className="bg-white rounded-lg p-3 border border-gray-100 flex justify-between items-center text-sm">
            <div>
              <p className="text-gray-800">{new Date(h.log_date).toLocaleDateString()}</p>
              <p className="text-gray-500">{h.skin_condition_note || '—'}</p>
            </div>
            <span className="font-semibold text-primary-600">{h.skin_health_score ? `${h.skin_health_score}/100` : '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
