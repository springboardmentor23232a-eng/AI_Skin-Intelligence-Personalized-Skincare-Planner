import React, { useState } from 'react'
import client from '../api/client'

export default function Assessment() {
  const [assessment, setAssessment] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const runAssessment = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await client.post('/assessment/run')
      setAssessment(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to run assessment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Skin Assessment</h1>
      <p className="text-gray-500 mb-6">Analyze your skin profile to identify and prioritize concerns.</p>

      <button onClick={runAssessment} disabled={loading}
        className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md mb-6">
        {loading ? 'Analyzing...' : 'Run Assessment'}
      </button>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {assessment && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-4">
          <div>
            <p className="text-sm text-gray-500">Condition Score</p>
            <p className="text-3xl font-bold text-primary-600">{assessment.condition_score}/100</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Prioritized Concerns</p>
            <ol className="list-decimal list-inside text-gray-700">
              {assessment.prioritized_concerns.map((c) => (
                <li key={c}>{c.replace('_', ' ')} — <span className="text-gray-500">{assessment.concern_severity[c]}</span></li>
              ))}
            </ol>
          </div>
          {assessment.risk_factors.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Risk Factors</p>
              <ul className="list-disc list-inside text-gray-700">
                {assessment.risk_factors.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
