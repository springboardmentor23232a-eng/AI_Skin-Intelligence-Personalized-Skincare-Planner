import React, { useState, useEffect } from 'react'
import client from '../api/client'

export default function Routine() {
  const [routine, setRoutine] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  // Load already generated routine
  const load = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await client.get('/routine/me')
      setRoutine(res.data)
    } catch (err) {
      // 404 simply means a routine has not been generated yet
      if (err.response?.status !== 404) {
        setError(
          err.response?.data?.detail ||
            'Failed to load skincare routine'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Generate / regenerate routine
  const generate = async () => {
    setError('')
    setGenerating(true)

    try {
      const res = await client.post('/routine/generate')
      setRoutine(res.data)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Failed to generate routine'
      )
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Your Skincare Routine
        </h1>

        <p className="text-gray-500">
          Loading your routine...
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Your Skincare Routine
          </h1>

          {routine && (
            <p className="text-sm text-gray-500 mt-1">
              Personalized {routine.season} routine
            </p>
          )}
        </div>

        <button
          onClick={generate}
          disabled={generating}
          className="px-5 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating
            ? 'Generating...'
            : routine
              ? 'Regenerate Routine'
              : 'Generate Routine'}
        </button>

      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* No routine */}
      {!routine && !error && (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
          <div className="text-4xl mb-3">
            🧴
          </div>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            No skincare routine yet
          </h2>

          <p className="text-sm text-gray-500 mb-5">
            Generate a personalized routine based on your skin profile
            and concerns.
          </p>

          <button
            onClick={generate}
            disabled={generating}
            className="px-5 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Routine'}
          </button>
        </div>
      )}

      {/* Routine */}
      {routine && (
        <div className="grid sm:grid-cols-2 gap-4">

          {/* Morning */}
          <RoutineCard
            title="☀️ Morning"
            steps={routine.morning_routine}
          />

          {/* Evening */}
          <RoutineCard
            title="🌙 Evening"
            steps={routine.evening_routine}
          />

          {/* Weekly Treatments */}
          <div className="sm:col-span-2 bg-white rounded-xl shadow-sm p-5 border border-gray-100">

            <h2 className="font-semibold text-lg text-gray-800 mb-4">
              📅 Weekly Treatments
            </h2>

            {routine.weekly_treatments?.length > 0 ? (
              <ul className="space-y-3">

                {routine.weekly_treatments.map((t, i) => (
                  <li
                    key={i}
                    className="p-3 rounded-lg bg-gray-50 text-sm text-gray-700"
                  >
                    <div>
                      <span className="font-semibold">
                        {t.day}
                      </span>
                    </div>

                    <div className="font-medium mt-1">
                      {t.treatment}
                    </div>

                    <div className="text-gray-500 mt-1">
                      {t.purpose}
                    </div>
                  </li>
                ))}

              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                No weekly treatments recommended.
              </p>
            )}

          </div>

        </div>
      )}

    </div>
  )
}


/* --------------------------------------------------
   Routine Card
-------------------------------------------------- */

function RoutineCard({ title, steps = [] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">

      <h2 className="font-semibold text-lg text-gray-800 mb-4">
        {title}
      </h2>

      {steps.length > 0 ? (
        <div className="space-y-3">

          {steps.map((s, index) => (
            <div
              key={s.step ?? index}
              className="p-3 rounded-lg bg-gray-50"
            >

              <div className="flex items-start gap-2">

                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700 shrink-0">
                  {s.step ?? index + 1}
                </div>

                <div>

                  <h3 className="font-medium text-gray-800">
                    {s.category}
                  </h3>

                  <p className="text-sm text-gray-600 mt-1">
                    {s.instruction}
                  </p>

                  {s.product_suggestion && (
                    <p className="text-xs text-gray-500 mt-2">
                      Suggested ingredient:{' '}
                      <span className="font-medium text-gray-700">
                        {s.product_suggestion}
                      </span>
                    </p>
                  )}

                </div>

              </div>

            </div>
          ))}

        </div>
      ) : (
        <p className="text-sm text-gray-500">
          No steps available.
        </p>
      )}

    </div>
  )
}