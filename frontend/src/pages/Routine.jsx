import React, { useEffect, useState } from 'react'
import client from '../api/client'

export default function Routine() {
  const [routine, setRoutine] = useState(null)
  const [history, setHistory] = useState([])

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)

  const [editing, setEditing] = useState(false)
  const [editRoutine, setEditRoutine] = useState(null)

  // ---------------------------------------------------------
  // LOAD CURRENT ROUTINE
  // ---------------------------------------------------------

  const loadRoutine = async () => {
    try {
      const res = await client.get('/routine/me')
      setRoutine(res.data)
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(
          err.response?.data?.detail ||
            'Failed to load skincare routine'
        )
      }
    }
  }

  // ---------------------------------------------------------
  // LOAD ROUTINE HISTORY
  // ---------------------------------------------------------

  const loadHistory = async () => {
    try {
      const res = await client.get('/routine/history')
      setHistory(res.data || [])
    } catch (err) {
      console.error('Failed to load routine history:', err)
    }
  }

  // ---------------------------------------------------------
  // INITIAL LOAD
  // ---------------------------------------------------------

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')

      await Promise.all([
        loadRoutine(),
        loadHistory(),
      ])

      setLoading(false)
    }

    load()
  }, [])

  // ---------------------------------------------------------
  // GENERATE / REGENERATE
  // ---------------------------------------------------------

  const generate = async () => {
    setError('')
    setGenerating(true)

    try {
      const res = await client.post('/routine/generate')

      setRoutine(res.data)

      // Refresh history because regeneration creates
      // a history entry for the previous routine.
      await loadHistory()

      setEditing(false)
      setEditRoutine(null)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Failed to generate routine'
      )
    } finally {
      setGenerating(false)
    }
  }

  // ---------------------------------------------------------
  // START MANUAL EDIT
  // ---------------------------------------------------------

  const startEditing = () => {
    if (!routine) return

    // Deep copy so changes do not immediately modify
    // the displayed routine.
    const copy = JSON.parse(
      JSON.stringify({
        morning_routine: routine.morning_routine || [],
        evening_routine: routine.evening_routine || [],
        weekly_treatments: routine.weekly_treatments || [],
        season: routine.season || 'all',
        notes: routine.notes || '',
      })
    )

    setEditRoutine(copy)
    setEditing(true)
    setError('')
  }

  // ---------------------------------------------------------
  // CANCEL EDIT
  // ---------------------------------------------------------

  const cancelEditing = () => {
    setEditing(false)
    setEditRoutine(null)
    setError('')
  }

  // ---------------------------------------------------------
  // UPDATE SIMPLE FIELD
  // ---------------------------------------------------------

  const updateField = (field, value) => {
    setEditRoutine((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  // ---------------------------------------------------------
  // UPDATE ROUTINE STEP
  // ---------------------------------------------------------

  const updateStep = (
    routineType,
    index,
    field,
    value
  ) => {
    setEditRoutine((previous) => {
      const updated = [...previous[routineType]]

      updated[index] = {
        ...updated[index],
        [field]: value,
      }

      return {
        ...previous,
        [routineType]: updated,
      }
    })
  }

  // ---------------------------------------------------------
  // ADD ROUTINE STEP
  // ---------------------------------------------------------

  const addStep = (routineType) => {
    setEditRoutine((previous) => {
      const updated = [
        ...(previous[routineType] || []),
        {
          step: (previous[routineType]?.length || 0) + 1,
          category: '',
          instruction: '',
          product_suggestion: '',
        },
      ]

      return {
        ...previous,
        [routineType]: updated,
      }
    })
  }

  // ---------------------------------------------------------
  // DELETE ROUTINE STEP
  // ---------------------------------------------------------

  const deleteStep = (routineType, index) => {
    setEditRoutine((previous) => {
      const updated = previous[routineType]
        .filter((_, i) => i !== index)
        .map((step, i) => ({
          ...step,
          step: i + 1,
        }))

      return {
        ...previous,
        [routineType]: updated,
      }
    })
  }

  // ---------------------------------------------------------
  // UPDATE WEEKLY TREATMENT
  // ---------------------------------------------------------

  const updateWeeklyTreatment = (
    index,
    field,
    value
  ) => {
    setEditRoutine((previous) => {
      const updated = [
        ...previous.weekly_treatments,
      ]

      updated[index] = {
        ...updated[index],
        [field]: value,
      }

      return {
        ...previous,
        weekly_treatments: updated,
      }
    })
  }

  // ---------------------------------------------------------
  // ADD WEEKLY TREATMENT
  // ---------------------------------------------------------

  const addWeeklyTreatment = () => {
    setEditRoutine((previous) => ({
      ...previous,
      weekly_treatments: [
        ...(previous.weekly_treatments || []),
        {
          day: '',
          treatment: '',
          purpose: '',
        },
      ],
    }))
  }

  // ---------------------------------------------------------
  // DELETE WEEKLY TREATMENT
  // ---------------------------------------------------------

  const deleteWeeklyTreatment = (index) => {
    setEditRoutine((previous) => ({
      ...previous,
      weekly_treatments:
        previous.weekly_treatments.filter(
          (_, i) => i !== index
        ),
    }))
  }

  // ---------------------------------------------------------
  // SAVE MANUAL CHANGES
  // ---------------------------------------------------------

  const saveChanges = async () => {
    if (!editRoutine) return

    setSaving(true)
    setError('')

    try {
      const res = await client.put(
        '/routine/me',
        editRoutine
      )

      setRoutine(res.data)

      setEditing(false)
      setEditRoutine(null)

      // Refresh history.
      await loadHistory()
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Failed to save routine changes'
      )
    } finally {
      setSaving(false)
    }
  }

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // PAGE
  // ---------------------------------------------------------

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* -------------------------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------------------------- */}

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

        <div className="flex gap-2 flex-wrap">

          {routine && !editing && (
            <button
              onClick={startEditing}
              className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 text-sm font-medium hover:bg-gray-50"
            >
              Edit Routine
            </button>
          )}

          {!editing && (
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
          )}

        </div>

      </div>

      {/* -------------------------------------------------- */}
      {/* ERROR */}
      {/* -------------------------------------------------- */}

      {error && (
        <div className="mb-5 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* NO ROUTINE */}
      {/* -------------------------------------------------- */}

      {!routine && !error && (
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">

          <div className="text-4xl mb-3">
            🧴
          </div>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            No skincare routine yet
          </h2>

          <p className="text-sm text-gray-500 mb-5">
            Generate a personalized routine based on your
            skin profile and concerns.
          </p>

          <button
            onClick={generate}
            disabled={generating}
            className="px-5 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {generating
              ? 'Generating...'
              : 'Generate Routine'}
          </button>

        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* EDIT MODE */}
      {/* -------------------------------------------------- */}

      {routine && editing && editRoutine && (
        <EditRoutine
          data={editRoutine}
          saving={saving}
          onCancel={cancelEditing}
          onSave={saveChanges}
          onFieldChange={updateField}
          onStepChange={updateStep}
          onAddStep={addStep}
          onDeleteStep={deleteStep}
          onWeeklyChange={updateWeeklyTreatment}
          onAddWeekly={addWeeklyTreatment}
          onDeleteWeekly={deleteWeeklyTreatment}
        />
      )}

      {/* -------------------------------------------------- */}
      {/* CURRENT ROUTINE */}
      {/* -------------------------------------------------- */}

      {routine && !editing && (
        <>
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

                  {routine.weekly_treatments.map(
                    (t, i) => (
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
                    )
                  )}

                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  No weekly treatments recommended.
                </p>
              )}

            </div>

            {/* Notes */}
            {routine.notes && (
              <div className="sm:col-span-2 bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <h2 className="font-semibold text-lg text-gray-800 mb-2">
                  📝 Notes
                </h2>

                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {routine.notes}
                </p>
              </div>
            )}

          </div>

          {/* Routine History */}
          <RoutineHistory history={history} />
        </>
      )}

    </div>
  )
}


/* ==========================================================
   EDIT ROUTINE
========================================================== */

function EditRoutine({
  data,
  saving,
  onCancel,
  onSave,
  onFieldChange,
  onStepChange,
  onAddStep,
  onDeleteStep,
  onWeeklyChange,
  onAddWeekly,
  onDeleteWeekly,
}) {
  return (
    <div className="space-y-5">

      {/* Edit header */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h2 className="font-semibold text-blue-900">
          ✏️ Edit Your Routine
        </h2>

        <p className="text-sm text-blue-700 mt-1">
          You can manually change the routine without
          regenerating your personalized recommendations.
        </p>
      </div>

      {/* Morning */}
      <EditableRoutineSection
        title="☀️ Morning Routine"
        routineType="morning_routine"
        steps={data.morning_routine}
        onStepChange={onStepChange}
        onAddStep={onAddStep}
        onDeleteStep={onDeleteStep}
      />

      {/* Evening */}
      <EditableRoutineSection
        title="🌙 Evening Routine"
        routineType="evening_routine"
        steps={data.evening_routine}
        onStepChange={onStepChange}
        onAddStep={onAddStep}
        onDeleteStep={onDeleteStep}
      />

      {/* Weekly */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">

        <div className="flex items-center justify-between mb-4">

          <h2 className="font-semibold text-lg text-gray-800">
            📅 Weekly Treatments
          </h2>

          <button
            type="button"
            onClick={onAddWeekly}
            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
          >
            + Add Treatment
          </button>

        </div>

        <div className="space-y-4">

          {data.weekly_treatments?.length > 0 ? (
            data.weekly_treatments.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-gray-50 border border-gray-200"
              >

                <div className="grid sm:grid-cols-3 gap-3">

                  <Input
                    label="Day"
                    value={item.day || ''}
                    onChange={(value) =>
                      onWeeklyChange(
                        index,
                        'day',
                        value
                      )
                    }
                    placeholder="Monday"
                  />

                  <Input
                    label="Treatment"
                    value={item.treatment || ''}
                    onChange={(value) =>
                      onWeeklyChange(
                        index,
                        'treatment',
                        value
                      )
                    }
                    placeholder="Exfoliation"
                  />

                  <Input
                    label="Purpose"
                    value={item.purpose || ''}
                    onChange={(value) =>
                      onWeeklyChange(
                        index,
                        'purpose',
                        value
                      )
                    }
                    placeholder="Remove dead skin"
                  />

                </div>

                <button
                  type="button"
                  onClick={() =>
                    onDeleteWeekly(index)
                  }
                  className="mt-3 text-sm text-red-600 hover:text-red-800"
                >
                  Remove treatment
                </button>

              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              No weekly treatments.
            </p>
          )}

        </div>

      </div>

      {/* Season + Notes */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">

        <h2 className="font-semibold text-lg text-gray-800 mb-4">
          ⚙️ Routine Settings
        </h2>

        <Input
          label="Season"
          value={data.season || ''}
          onChange={(value) =>
            onFieldChange('season', value)
          }
          placeholder="all"
        />

        <div className="mt-4">

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>

          <textarea
            value={data.notes || ''}
            onChange={(e) =>
              onFieldChange(
                'notes',
                e.target.value
              )
            }
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            placeholder="Add notes about your routine..."
          />

        </div>

      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pb-4">

        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

      </div>

    </div>
  )
}


/* ==========================================================
   EDITABLE MORNING / EVENING SECTION
========================================================== */

function EditableRoutineSection({
  title,
  routineType,
  steps = [],
  onStepChange,
  onAddStep,
  onDeleteStep,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">

      <div className="flex items-center justify-between mb-4">

        <h2 className="font-semibold text-lg text-gray-800">
          {title}
        </h2>

        <button
          type="button"
          onClick={() => onAddStep(routineType)}
          className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
        >
          + Add Step
        </button>

      </div>

      <div className="space-y-4">

        {steps.length > 0 ? (
          steps.map((step, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-gray-50 border border-gray-200"
            >

              <div className="flex justify-between items-start mb-3">

                <span className="text-xs font-bold text-gray-500">
                  STEP {index + 1}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    onDeleteStep(
                      routineType,
                      index
                    )
                  }
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>

              </div>

              <div className="grid sm:grid-cols-2 gap-3">

                <Input
                  label="Category"
                  value={step.category || ''}
                  onChange={(value) =>
                    onStepChange(
                      routineType,
                      index,
                      'category',
                      value
                    )
                  }
                  placeholder="Cleansing"
                />

                <Input
                  label="Suggested Ingredient"
                  value={
                    step.product_suggestion || ''
                  }
                  onChange={(value) =>
                    onStepChange(
                      routineType,
                      index,
                      'product_suggestion',
                      value
                    )
                  }
                  placeholder="Niacinamide"
                />

              </div>

              <div className="mt-3">

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instruction
                </label>

                <textarea
                  value={step.instruction || ''}
                  onChange={(e) =>
                    onStepChange(
                      routineType,
                      index,
                      'instruction',
                      e.target.value
                    )
                  }
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                  placeholder="Describe how to perform this step..."
                />

              </div>

            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">
            No steps. Click "+ Add Step" to add one.
          </p>
        )}

      </div>

    </div>
  )
}


/* ==========================================================
   INPUT
========================================================== */

function Input({
  label,
  value,
  onChange,
  placeholder = '',
}) {
  return (
    <div>

      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
      />

    </div>
  )
}


/* ==========================================================
   ROUTINE CARD
========================================================== */

function RoutineCard({
  title,
  steps = [],
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">

      <h2 className="font-semibold text-lg text-gray-800 mb-4">
        {title}
      </h2>

      {steps.length > 0 ? (
        <div className="space-y-3">

          {steps.map((s, index) => (
            <div
              key={index}
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


/* ==========================================================
   ROUTINE HISTORY
========================================================== */

function RoutineHistory({
  history = [],
}) {
  const [expanded, setExpanded] = useState(null)

  if (!history.length) {
    return null
  }

  return (
    <div className="mt-8">

      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Routine History
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Previous personalized routines and assessment changes
        </p>
      </div>

      <div className="space-y-3">

        {history.map((item, index) => {

          const isOpen = expanded === item.id

          return (
            <div
              key={item.id || index}
              className="bg-white rounded-xl border border-gray-200 shadow-sm"
            >

              <button
                type="button"
                onClick={() =>
                  setExpanded(
                    isOpen ? null : item.id
                  )
                }
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
              >

                <div>

                  <div className="font-semibold text-gray-800">
                    Routine from{' '}
                    {new Date(
                      item.created_at
                    ).toLocaleString()}
                  </div>

                  <div className="text-sm text-gray-500 mt-1">
                    Season: {item.season || 'all'}
                    {' • '}
                    Skin health score:{' '}
                    {item.condition_score ?? 'N/A'}
                  </div>

                  {item.change_summary && (
                    <div className="text-sm text-gray-600 mt-2">
                      {item.change_summary}
                    </div>
                  )}

                </div>

                <span className="text-gray-500 text-lg">
                  {isOpen ? '▲' : '▼'}
                </span>

              </button>

              {isOpen && (
                <div className="border-t border-gray-100 p-4 space-y-4">

                  <RoutineCard
                    title="☀️ Morning"
                    steps={item.morning_routine}
                  />

                  <RoutineCard
                    title="🌙 Evening"
                    steps={item.evening_routine}
                  />

                  <div className="bg-gray-50 rounded-lg p-4">

                    <h3 className="font-semibold text-gray-800 mb-2">
                      📅 Weekly Treatments
                    </h3>

                    {item.weekly_treatments?.length > 0 ? (
                      <div className="space-y-2">

                        {item.weekly_treatments.map(
                          (t, i) => (
                            <div
                              key={i}
                              className="text-sm"
                            >
                              <strong>
                                {t.day}
                              </strong>
                              {' — '}
                              {t.treatment}

                              {t.purpose && (
                                <span className="text-gray-500">
                                  {' '}
                                  ({t.purpose})
                                </span>
                              )}
                            </div>
                          )
                        )}

                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No weekly treatments.
                      </p>
                    )}

                  </div>

                  {item.notes && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        📝 Notes
                      </h3>

                      <p className="text-sm text-gray-600 whitespace-pre-line">
                        {item.notes}
                      </p>
                    </div>
                  )}

                </div>
              )}

            </div>
          )
        })}

      </div>

    </div>
  )
}