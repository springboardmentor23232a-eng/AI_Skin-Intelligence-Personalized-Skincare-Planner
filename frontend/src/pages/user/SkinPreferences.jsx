import { useState, useEffect } from 'react';
import api from '../../api/axios';

const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'];

const CONCERN_OPTIONS = [
  'Acne', 'Dryness', 'Oiliness', 'Redness', 'Irritation',
  'Pigmentation', 'Uneven Skin Tone', 'Enlarged Pores', 'Fine Lines',
];

const ACTIVITY_OPTIONS = [
  { value: 'low', label: 'Low — mostly sedentary' },
  { value: 'moderate', label: 'Moderate — a few workouts a week' },
  { value: 'high', label: 'High — daily exercise/sweat' },
];

const EXPOSURE_OPTIONS = [
  { value: 'low', label: 'Low — mostly indoors' },
  { value: 'moderate', label: 'Moderate — some time outdoors' },
  { value: 'high', label: 'High — outdoors most of the day' },
];

const SLEEP_OPTIONS = [
  { value: 'poor', label: 'Poor' },
  { value: 'average', label: 'Average' },
  { value: 'good', label: 'Good' },
];

const STRESS_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
];

const ENV_OPTIONS = [
  { value: 'dry', label: 'Dry climate' },
  { value: 'humid', label: 'Humid climate' },
  { value: 'urban_pollution', label: 'Urban / high pollution' },
  { value: 'coastal', label: 'Coastal' },
  { value: 'other', label: 'Other' },
];

function toggleInList(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function SkinPreferences({ onSaved }) {
  const [form, setForm] = useState({
    skin_type: '',
    known_concerns: [],
    allergies: [],
    activity_level: '',
    outdoor_exposure: '',
    sleep_quality: '',
    environment: '',
    notes: '',
    water_intake_liters: '',
    sleep_hours: '',
    stress_level: '',
  });
  const [allergyInput, setAllergyInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/preferences');
        if (cancelled) return;
        if (data.preferences) {
          setForm({
            skin_type: data.preferences.skin_type || '',
            known_concerns: data.preferences.known_concerns || [],
            allergies: data.preferences.allergies || [],
            activity_level: data.preferences.activity_level || '',
            outdoor_exposure: data.preferences.outdoor_exposure || '',
            sleep_quality: data.preferences.sleep_quality || '',
            environment: data.preferences.environment || '',
            notes: data.preferences.notes || '',
            water_intake_liters: data.preferences.water_intake_liters != null ? String(data.preferences.water_intake_liters) : '',
            sleep_hours: data.preferences.sleep_hours != null ? String(data.preferences.sleep_hours) : '',
            stress_level: data.preferences.stress_level || '',
          });
        }
      } catch {
        // No saved preferences yet — that's fine, the form just stays blank.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const addAllergy = () => {
    const val = allergyInput.trim();
    if (!val) return;
    if (!form.allergies.some((a) => a.toLowerCase() === val.toLowerCase())) {
      setForm({ ...form, allergies: [...form.allergies, val] });
    }
    setAllergyInput('');
  };

  const removeAllergy = (val) => {
    setForm({ ...form, allergies: form.allergies.filter((a) => a !== val) });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      // water_intake_liters/sleep_hours/stress_level use COALESCE server-side
      // (see preferencesController.js), so leaving one blank here preserves
      // whatever value is already saved instead of wiping it — only send a
      // key when the person actually entered/changed it.
      const payload = { ...form };
      if (payload.water_intake_liters === '') delete payload.water_intake_liters;
      else payload.water_intake_liters = Number(payload.water_intake_liters);
      if (payload.sleep_hours === '') delete payload.sleep_hours;
      else payload.sleep_hours = Number(payload.sleep_hours);
      if (payload.stress_level === '') delete payload.stress_level;

      await api.put('/preferences', payload);
      setMsg('Preferences saved.');
      onSaved?.();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Could not save preferences.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 40 }}>
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr', maxWidth: 720 }}>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>My Skin Preferences</h3>
        <p className="text-muted" style={{ fontSize: 14 }}>
          This information — plus your latest AI skin assessment — is used to build your personalized
          routine. Set it once here and you won't need to re-enter it each time.
        </p>

        {msg && <div className={`alert ${msg.includes('saved') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

        <form onSubmit={handleSave}>
          <div className="field">
            <label>Skin type</label>
            <select value={form.skin_type} onChange={(e) => setForm({ ...form, skin_type: e.target.value })}>
              <option value="">Use my latest assessment</option>
              {SKIN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Known concerns</label>
            <div className="chip-select">
              {CONCERN_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c}
                  className={`chip ${form.known_concerns.includes(c) ? 'chip-active' : ''}`}
                  onClick={() => setForm({ ...form, known_concerns: toggleInList(form.known_concerns, c) })}
                >
                  {c}
                </button>
              ))}
            </div>
            <p className="text-soft" style={{ fontSize: 12.5, marginTop: 6 }}>
              These add to whatever your AI assessment detects — no need to repeat what it already found.
            </p>
          </div>

          <div className="field">
            <label>Allergies / ingredient sensitivities</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAllergy(); } }}
                placeholder="e.g. fragrance, retinol, benzoyl peroxide"
              />
              <button type="button" className="btn btn-outline" onClick={addAllergy}>Add</button>
            </div>
            {form.allergies.length > 0 && (
              <div className="chip-select" style={{ marginTop: 10 }}>
                {form.allergies.map((a) => (
                  <span key={a} className="chip chip-active">
                    {a}
                    <button
                      type="button"
                      aria-label={`Remove ${a}`}
                      className="chip-remove"
                      onClick={() => removeAllergy(a)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-soft" style={{ fontSize: 12.5, marginTop: 6 }}>
              Your routine will never recommend a product/category that conflicts with something listed here.
            </p>
          </div>

          <hr className="divider" />
          <h4 style={{ marginBottom: 10 }}>Lifestyle</h4>

          <div className="field">
            <label>Activity / exercise level</label>
            <select value={form.activity_level} onChange={(e) => setForm({ ...form, activity_level: e.target.value })}>
              <option value="">Not specified</option>
              {ACTIVITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Stress level</label>
            <select value={form.stress_level} onChange={(e) => setForm({ ...form, stress_level: e.target.value })}>
              <option value="">Not specified</option>
              {STRESS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Outdoor exposure</label>
            <select value={form.outdoor_exposure} onChange={(e) => setForm({ ...form, outdoor_exposure: e.target.value })}>
              <option value="">Not specified</option>
              {EXPOSURE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Average sleep duration (hours/night)</label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={form.sleep_hours}
              onChange={(e) => setForm({ ...form, sleep_hours: e.target.value })}
              placeholder="e.g. 7"
            />
          </div>

          <div className="field">
            <label>Sleep quality</label>
            <select value={form.sleep_quality} onChange={(e) => setForm({ ...form, sleep_quality: e.target.value })}>
              <option value="">Not specified</option>
              {SLEEP_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Daily water intake (liters/day)</label>
            <input
              type="number"
              min="0"
              max="15"
              step="0.1"
              value={form.water_intake_liters}
              onChange={(e) => setForm({ ...form, water_intake_liters: e.target.value })}
              placeholder="e.g. 2.5"
            />
          </div>

          <div className="field">
            <label>Environment</label>
            <select value={form.environment} onChange={(e) => setForm({ ...form, environment: e.target.value })}>
              <option value="">Not specified</option>
              {ENV_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Anything else about your daily routine?</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional — e.g. swims regularly, works night shifts, wears heavy makeup daily"
            />
          </div>

          <button className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner" /> : 'Save Preferences'}
          </button>
        </form>
      </div>
    </div>
  );
}
