import React, { useEffect, useState } from 'react'
import client from '../api/client'

const CONCERNS = ["acne", "hyperpigmentation", "dark_spots", "dry_skin", "oily_skin", "sensitive_skin", "wrinkles", "fine_lines", "redness", "uneven_skin_tone"]

export default function SkinProfile() {
  const [form, setForm] = useState({
    skin_type: 'normal', age_group: '20s', skin_concerns: [], allergies: '', sensitivities: '',
    sleep_quality: 'average', sleep_hours: 7, water_intake_liters: 2, lifestyle_habits: '', environmental_exposure: 'moderate',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    client.get('/skin-profile/me').then((res) => {
      const p = res.data
      setForm({
        ...p,
        allergies: (p.allergies || []).join(', '),
        sensitivities: (p.sensitivities || []).join(', '),
        lifestyle_habits: (p.lifestyle_habits || []).join(', '),
      })
    }).catch(() => {})
  }, [])

  const toggleConcern = (c) => {
    setForm((f) => ({
      ...f,
      skin_concerns: f.skin_concerns.includes(c) ? f.skin_concerns.filter((x) => x !== c) : [...f.skin_concerns, c],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      allergies: form.allergies.split(',').map((s) => s.trim()).filter(Boolean),
      sensitivities: form.sensitivities.split(',').map((s) => s.trim()).filter(Boolean),
      lifestyle_habits: form.lifestyle_habits.split(',').map((s) => s.trim()).filter(Boolean),
      sleep_hours: Number(form.sleep_hours),
      water_intake_liters: Number(form.water_intake_liters),
    }
    await client.post('/skin-profile', payload)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Skin Profile</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Skin Type">
            <select value={form.skin_type} onChange={(e) => setForm({ ...form, skin_type: e.target.value })} className="input">
              {['oily', 'dry', 'combination', 'normal', 'sensitive'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Age Group">
            <select value={form.age_group} onChange={(e) => setForm({ ...form, age_group: e.target.value })} className="input">
              {['teen', '20s', '30s', '40s', '50+'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Skin Concerns">
          <div className="flex flex-wrap gap-2">
            {CONCERNS.map((c) => (
              <button type="button" key={c} onClick={() => toggleConcern(c)}
                className={`px-3 py-1 rounded-full text-sm border ${form.skin_concerns.includes(c) ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-300'}`}>
                {c.replace('_', ' ')}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Allergies (comma separated)">
          <input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} className="input" placeholder="e.g. Retinoid" />
        </Field>
        <Field label="Sensitivities (comma separated)">
          <input value={form.sensitivities} onChange={(e) => setForm({ ...form, sensitivities: e.target.value })} className="input" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Sleep Quality">
            <select value={form.sleep_quality} onChange={(e) => setForm({ ...form, sleep_quality: e.target.value })} className="input">
              {['poor', 'average', 'good'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </Field>
          <Field label="Sleep Hours">
            <input type="number" step="0.5" value={form.sleep_hours} onChange={(e) => setForm({ ...form, sleep_hours: e.target.value })} className="input" />
          </Field>
        </div>

        <Field label="Water Intake (liters/day)">
          <input type="number" step="0.1" value={form.water_intake_liters} onChange={(e) => setForm({ ...form, water_intake_liters: e.target.value })} className="input" />
        </Field>

        <Field label="Lifestyle Habits (comma separated)">
          <input value={form.lifestyle_habits} onChange={(e) => setForm({ ...form, lifestyle_habits: e.target.value })} className="input" placeholder="e.g. exercise, high-stress" />
        </Field>

        <Field label="Environmental Exposure">
          <select value={form.environmental_exposure} onChange={(e) => setForm({ ...form, environmental_exposure: e.target.value })} className="input">
            {['low', 'moderate', 'high'].map((v) => <option key={v}>{v}</option>)}
          </select>
        </Field>

        <button type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-md">
          Save Profile
        </button>
        {saved && <p className="text-green-600 text-sm text-center">Saved!</p>}
      </form>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-600 mb-1 block">{label}</span>
      {children}
    </label>
  )
}
