import { useState } from 'react';
import api from '../api/axios';

const ACTIVITY_OPTIONS = [
  { value: 'low', label: 'Low — mostly sedentary' },
  { value: 'moderate', label: 'Moderate — a few workouts a week' },
  { value: 'high', label: 'High — daily exercise/sweat' },
];
const STRESS_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
];
const SLEEP_QUALITY_OPTIONS = [
  { value: 'poor', label: 'Poor' },
  { value: 'average', label: 'Average' },
  { value: 'good', label: 'Good' },
];
const CONCERN_OPTIONS = ['Acne', 'Dryness', 'Oiliness', 'Sensitivity', 'Pigmentation'];
const SEVERITY_OPTIONS = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
];

function toggleInList(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/**
 * Renders only the section(s) named in `missing` (a subset of
 * ['skinCondition','lifestyle','sleep','hydration'] — Routine Consistency
 * is never asked for here since it's always computed from tracked
 * checklist behavior, not a questionnaire). Submits the full
 * user_skincare_preferences payload — starting from whatever `preferences`
 * already holds, so fields this form doesn't touch (allergies, known
 * concerns unrelated to severity, environment, etc.) are carried forward
 * untouched rather than wiped by the upsert.
 */
export default function CompleteSkinHealthForm({ missing, preferences, onSaved }) {
  const p = preferences || {};

  const [waterUnit, setWaterUnit] = useState('liters');
  const [waterValue, setWaterValue] = useState(p.water_intake_liters != null ? String(p.water_intake_liters) : '');
  const [sleepHours, setSleepHours] = useState(p.sleep_hours != null ? String(p.sleep_hours) : '');
  const [sleepQuality, setSleepQuality] = useState(p.sleep_quality || '');
  const [stressLevel, setStressLevel] = useState(p.stress_level || '');
  const [activityLevel, setActivityLevel] = useState(p.activity_level || '');
  const [skinClear, setSkinClear] = useState(false);
  const [selectedConcerns, setSelectedConcerns] = useState(p.known_concerns || []);
  const [concernSeverity, setConcernSeverity] = useState(p.concern_severity || {});

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const needs = (key) => missing.includes(key);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation, mirroring the backend's own checks so the
    // person gets an immediate answer instead of a round-trip failure.
    let waterLiters = null;
    if (needs('hydration')) {
      const n = Number(waterValue);
      if (!Number.isFinite(n) || waterValue === '' || n < 0) {
        setError('Enter a valid daily water intake.');
        return;
      }
      waterLiters = waterUnit === 'glasses' ? Math.round(n * 0.25 * 10) / 10 : Math.round(n * 10) / 10;
      if (waterLiters > 15) {
        setError('That daily water intake looks too high — please double-check it.');
        return;
      }
    }

    let hoursNum = null;
    if (needs('sleep')) {
      hoursNum = Number(sleepHours);
      if (!Number.isFinite(hoursNum) || sleepHours === '' || hoursNum < 0 || hoursNum > 24) {
        setError('Enter your average sleep duration as a number of hours (0–24).');
        return;
      }
    }

    if (needs('lifestyle') && (!stressLevel || !activityLevel)) {
      setError('Select both your stress level and activity level.');
      return;
    }

    if (needs('skinCondition') && !skinClear) {
      const missingSeverity = selectedConcerns.some((c) => !concernSeverity[c]);
      if (missingSeverity) {
        setError('Choose a severity for each concern you selected, or check "My skin currently feels clear."');
        return;
      }
    }

    const payload = {
      ...p,
      known_concerns: needs('skinCondition') ? (skinClear ? [] : selectedConcerns) : (p.known_concerns || []),
      allergies: p.allergies || [],
      concern_severity: needs('skinCondition') ? (skinClear ? {} : concernSeverity) : (p.concern_severity || {}),
      manual_skin_assessed: needs('skinCondition') ? true : !!p.manual_skin_assessed,
      activity_level: needs('lifestyle') ? activityLevel : (p.activity_level || null),
      stress_level: needs('lifestyle') ? stressLevel : (p.stress_level || null),
      sleep_hours: needs('sleep') ? hoursNum : p.sleep_hours,
      sleep_quality: needs('sleep') ? (sleepQuality || p.sleep_quality || null) : (p.sleep_quality || null),
      water_intake_liters: needs('hydration') ? waterLiters : p.water_intake_liters,
    };

    setSaving(true);
    try {
      const { data } = await api.put('/preferences', payload);
      onSaved?.(data.preferences);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save your information. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card plan-section health-intake-card">
      <h4 style={{ marginTop: 0, marginBottom: 4 }}>Complete Your Skin Health Information</h4>
      <p className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>
        A few quick questions to unlock the score(s) below. This is saved to your profile, so you won't
        be asked again unless you want to update it.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {needs('hydration') && (
          <div className="field intake-section">
            <label>Hydration — how much water do you usually drink per day?</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                min="0"
                step="0.1"
                value={waterValue}
                onChange={(e) => setWaterValue(e.target.value)}
                placeholder={waterUnit === 'liters' ? 'e.g. 2.5' : 'e.g. 8'}
                style={{ flex: 1 }}
              />
              <select value={waterUnit} onChange={(e) => setWaterUnit(e.target.value)} style={{ width: 160 }}>
                <option value="liters">Liters/day</option>
                <option value="glasses">Glasses/day (~250ml)</option>
              </select>
            </div>
          </div>
        )}

        {needs('sleep') && (
          <div className="field intake-section">
            <label>Sleep — average sleep duration (hours per night)</label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              placeholder="e.g. 7"
            />
            <label style={{ marginTop: 10 }}>Sleep quality (optional)</label>
            <select value={sleepQuality} onChange={(e) => setSleepQuality(e.target.value)}>
              <option value="">Not specified</option>
              {SLEEP_QUALITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}

        {needs('lifestyle') && (
          <div className="field intake-section">
            <label>Lifestyle — stress level</label>
            <select value={stressLevel} onChange={(e) => setStressLevel(e.target.value)}>
              <option value="">Select one</option>
              {STRESS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <label style={{ marginTop: 10 }}>Physical activity level</label>
            <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}>
              <option value="">Select one</option>
              {ACTIVITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}

        {needs('skinCondition') && (
          <div className="field intake-section">
            <label>Skin Information — current concerns</label>
            <label className="checklist-item" style={{ marginBottom: 10 }}>
              <input
                type="checkbox"
                checked={skinClear}
                onChange={(e) => setSkinClear(e.target.checked)}
              />
              <span>My skin currently feels clear — no notable concerns</span>
            </label>
            {!skinClear && (
              <>
                <div className="chip-select">
                  {CONCERN_OPTIONS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      className={`chip ${selectedConcerns.includes(c) ? 'chip-active' : ''}`}
                      onClick={() => setSelectedConcerns((prev) => toggleInList(prev, c))}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                {selectedConcerns.length > 0 && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedConcerns.map((c) => (
                      <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ minWidth: 100, fontSize: 13.5 }}>{c}</span>
                        <select
                          value={concernSeverity[c] || ''}
                          onChange={(e) => setConcernSeverity((prev) => ({ ...prev, [c]: e.target.value }))}
                          style={{ flex: 1 }}
                        >
                          <option value="">Select severity</option>
                          {SEVERITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <button className="btn btn-primary" disabled={saving} style={{ marginTop: 6 }}>
          {saving ? <span className="spinner" /> : 'Save and Calculate My Skin Health Score'}
        </button>
      </form>
    </div>
  );
}
