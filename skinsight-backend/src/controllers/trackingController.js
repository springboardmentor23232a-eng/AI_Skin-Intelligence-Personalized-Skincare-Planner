const pool = require('../config/db');

// ---------- Lifestyle Tracking ----------
async function addLifestyle(req, res) {
  const { dietQuality, stressLevel, activityMinutes, substanceUse } = req.body;
  const result = await pool.query(
    `INSERT INTO lifestyle_logs (user_id, diet_quality, stress_level, activity_minutes, substance_use)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [req.user.id, dietQuality, stressLevel, activityMinutes, substanceUse]
  );
  res.status(201).json({ entry: result.rows[0] });
}
async function listLifestyle(req, res) {
  const result = await pool.query(
    'SELECT * FROM lifestyle_logs WHERE user_id = $1 ORDER BY logged_at DESC LIMIT 30',
    [req.user.id]
  );
  res.json({ entries: result.rows });
}

// ---------- Sleep Pattern Tracking ----------
async function addSleep(req, res) {
  const { bedtime, wakeTime, durationHours, quality } = req.body;
  const result = await pool.query(
    `INSERT INTO sleep_logs (user_id, bedtime, wake_time, duration_hours, quality)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [req.user.id, bedtime, wakeTime, durationHours, quality]
  );
  res.status(201).json({ entry: result.rows[0] });
}
async function listSleep(req, res) {
  const result = await pool.query(
    'SELECT * FROM sleep_logs WHERE user_id = $1 ORDER BY logged_at DESC LIMIT 30',
    [req.user.id]
  );
  res.json({ entries: result.rows });
}

// ---------- Hydration Tracking ----------
async function addHydration(req, res) {
  const { amountMl, source } = req.body;
  if (!amountMl) return res.status(400).json({ error: 'amountMl is required.' });
  const result = await pool.query(
    `INSERT INTO hydration_logs (user_id, amount_ml, source) VALUES ($1, $2, $3) RETURNING *`,
    [req.user.id, amountMl, source]
  );
  res.status(201).json({ entry: result.rows[0] });
}
async function listHydration(req, res) {
  const result = await pool.query(
    'SELECT * FROM hydration_logs WHERE user_id = $1 ORDER BY logged_at DESC LIMIT 30',
    [req.user.id]
  );
  res.json({ entries: result.rows });
}

// ---------- Environmental Exposure Tracking ----------
async function addEnvironment(req, res) {
  const { location, durationMinutes, spfApplied, timeOfDay, uvIndex, aqi, humidity } = req.body;
  const result = await pool.query(
    `INSERT INTO environment_logs (user_id, location, duration_minutes, spf_applied, time_of_day, uv_index, aqi, humidity)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [req.user.id, location, durationMinutes, spfApplied, timeOfDay, uvIndex, aqi, humidity]
  );
  res.status(201).json({ entry: result.rows[0] });
}
async function listEnvironment(req, res) {
  const result = await pool.query(
    'SELECT * FROM environment_logs WHERE user_id = $1 ORDER BY logged_at DESC LIMIT 30',
    [req.user.id]
  );
  res.json({ entries: result.rows });
}

module.exports = {
  addLifestyle, listLifestyle,
  addSleep, listSleep,
  addHydration, listHydration,
  addEnvironment, listEnvironment,
};
