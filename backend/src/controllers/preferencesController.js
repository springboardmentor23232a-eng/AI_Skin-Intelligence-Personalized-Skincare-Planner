const pool = require('../config/db');

const ALLOWED_ACTIVITY = ['low', 'moderate', 'high'];
const ALLOWED_EXPOSURE = ['low', 'moderate', 'high'];
const ALLOWED_SLEEP = ['poor', 'average', 'good'];
const ALLOWED_ENV = ['dry', 'humid', 'urban_pollution', 'coastal', 'other'];
const ALLOWED_STRESS = ['low', 'moderate', 'high'];
const ALLOWED_SEVERITY = ['mild', 'moderate', 'severe'];

function asStringArray(val) {
  if (!Array.isArray(val)) return [];
  return val
    .map((v) => String(v || '').trim())
    .filter(Boolean)
    .slice(0, 30);
}

// Sanitizes { "Acne": "mild", ... } down to only string keys with a
// recognized severity value — anything else is dropped rather than
// rejecting the whole request, since this map is derived from checkbox +
// select UI and shouldn't be able to produce a malformed shape anyway.
function sanitizeSeverityMap(val) {
  if (!val || typeof val !== 'object' || Array.isArray(val)) return {};
  const out = {};
  for (const [key, severity] of Object.entries(val)) {
    const k = String(key || '').trim();
    if (!k || !ALLOWED_SEVERITY.includes(severity)) continue;
    out[k] = severity;
  }
  return out;
}

// GET /api/preferences  (current user's own skincare preferences)
async function getMyPreferences(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM user_skincare_preferences WHERE user_id = $1',
      [req.user.id]
    );
    res.json({ preferences: rows[0] || null });
  } catch (err) {
    next(err);
  }
}

// PUT /api/preferences  (upsert current user's own skincare preferences)
async function upsertMyPreferences(req, res, next) {
  try {
    const {
      skin_type,
      known_concerns,
      allergies,
      activity_level,
      outdoor_exposure,
      sleep_quality,
      environment,
      notes,
      water_intake_liters,
      sleep_hours,
      stress_level,
      concern_severity,
      manual_skin_assessed,
    } = req.body || {};

    if (activity_level && !ALLOWED_ACTIVITY.includes(activity_level)) {
      return res.status(400).json({ message: `activity_level must be one of: ${ALLOWED_ACTIVITY.join(', ')}` });
    }
    if (outdoor_exposure && !ALLOWED_EXPOSURE.includes(outdoor_exposure)) {
      return res.status(400).json({ message: `outdoor_exposure must be one of: ${ALLOWED_EXPOSURE.join(', ')}` });
    }
    if (sleep_quality && !ALLOWED_SLEEP.includes(sleep_quality)) {
      return res.status(400).json({ message: `sleep_quality must be one of: ${ALLOWED_SLEEP.join(', ')}` });
    }
    if (environment && !ALLOWED_ENV.includes(environment)) {
      return res.status(400).json({ message: `environment must be one of: ${ALLOWED_ENV.join(', ')}` });
    }
    if (stress_level && !ALLOWED_STRESS.includes(stress_level)) {
      return res.status(400).json({ message: `stress_level must be one of: ${ALLOWED_STRESS.join(', ')}` });
    }

    let waterIntake = null;
    if (water_intake_liters !== undefined && water_intake_liters !== null && water_intake_liters !== '') {
      const n = Number(water_intake_liters);
      if (!Number.isFinite(n) || n < 0 || n > 15) {
        return res.status(400).json({ message: 'water_intake_liters must be a number between 0 and 15.' });
      }
      waterIntake = Math.round(n * 10) / 10;
    }

    let sleepHours = null;
    if (sleep_hours !== undefined && sleep_hours !== null && sleep_hours !== '') {
      const n = Number(sleep_hours);
      if (!Number.isFinite(n) || n < 0 || n > 24) {
        return res.status(400).json({ message: 'sleep_hours must be a number between 0 and 24.' });
      }
      sleepHours = Math.round(n * 10) / 10;
    }

    const { rows } = await pool.query(
      `INSERT INTO user_skincare_preferences
        (user_id, skin_type, known_concerns, allergies, activity_level, outdoor_exposure, sleep_quality, environment, notes,
         water_intake_liters, sleep_hours, stress_level, concern_severity, manual_skin_assessed, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         skin_type = EXCLUDED.skin_type,
         known_concerns = EXCLUDED.known_concerns,
         allergies = EXCLUDED.allergies,
         activity_level = EXCLUDED.activity_level,
         outdoor_exposure = EXCLUDED.outdoor_exposure,
         sleep_quality = EXCLUDED.sleep_quality,
         environment = EXCLUDED.environment,
         notes = EXCLUDED.notes,
         water_intake_liters = COALESCE(EXCLUDED.water_intake_liters, user_skincare_preferences.water_intake_liters),
         sleep_hours = COALESCE(EXCLUDED.sleep_hours, user_skincare_preferences.sleep_hours),
         stress_level = COALESCE(EXCLUDED.stress_level, user_skincare_preferences.stress_level),
         concern_severity = CASE WHEN EXCLUDED.concern_severity = '{}'::jsonb
                                  THEN user_skincare_preferences.concern_severity
                                  ELSE EXCLUDED.concern_severity END,
         manual_skin_assessed = user_skincare_preferences.manual_skin_assessed OR EXCLUDED.manual_skin_assessed,
         updated_at = NOW()
       RETURNING *`,
      [
        req.user.id,
        skin_type || null,
        JSON.stringify(asStringArray(known_concerns)),
        JSON.stringify(asStringArray(allergies)),
        activity_level || null,
        outdoor_exposure || null,
        sleep_quality || null,
        environment || null,
        notes ? String(notes).slice(0, 2000) : null,
        waterIntake,
        sleepHours,
        stress_level || null,
        JSON.stringify(sanitizeSeverityMap(concern_severity)),
        manual_skin_assessed === true,
      ]
    );

    // Keep users.skin_type in sync when the user explicitly sets it here,
    // so the rest of the app (dashboards, plan generation fallback) sees
    // the same value without a second source of truth.
    if (skin_type) {
      await pool.query('UPDATE users SET skin_type = $1, updated_at = NOW() WHERE id = $2', [skin_type, req.user.id]);
    }

    res.json({ message: 'Preferences saved.', preferences: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyPreferences, upsertMyPreferences };
