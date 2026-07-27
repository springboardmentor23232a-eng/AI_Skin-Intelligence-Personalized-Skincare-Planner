import React, { useState, useEffect } from 'react'
import client from '../api/client'

export default function Routine() {
  const [routine, setRoutine] = useState(null)
  const [error, setError] = useState('')

  const load = () => client.get('/routine/me').then((res) => setRoutine(res.data)).catch(() => {})

  useEffect(() => { load() }, [])

  const generate = async () => {
    setError('')
    try {
      const res = await client.post('/routine/generate')
      setRoutine(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate routine')
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Your Skincare Routine</h1>
          {routine && (
            <span className="inline-block mt-1 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full capitalize">
              {routine.season} routine
            </span>
          )}
        </div>
        <button onClick={generate} className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm">
          {routine ? 'Regenerate' : 'Generate Routine'}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {routine && (
        <div className="grid sm:grid-cols-2 gap-4">
          <RoutineCard title="☀️ Morning" steps={routine.morning_routine} />
          <RoutineCard title="🌙 Evening" steps={routine.evening_routine} />
          <div className="sm:col-span-2 bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h2 className="font-semibold mb-3">📅 Weekly Treatments</h2>
            <ul className="space-y-2">
              {routine.weekly_treatments.map((t, i) => (
                <li key={i} className="text-sm text-gray-700">
                  <b>{t.day}:</b> {t.treatment} — <span className="text-gray-500">{t.purpose}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

function RoutineCard({ title, steps }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
      <h2 className="font-semibold mb-3">{title}</h2>
      <ol className="space-y-2">
        {steps.map((s) => (
          <li key={s.step} className="text-sm">
            <span className="font-medium text-gray-800">{s.step}. {s.category}</span>
            <p className="text-gray-500">{s.instruction}{s.product_suggestion ? ` (${s.product_suggestion})` : ''}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}