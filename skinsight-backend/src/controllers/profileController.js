const pool = require('../config/db');

// ---------- User profile management ----------

// GET /api/profile
async function getProfile(req, res) {
  const result = await pool.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
    [req.user.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'User not found.' });
  res.json({ profile: result.rows[0] });
}

// PUT /api/profile
async function updateProfile(req, res) {
  const { name } = req.body;
  const result = await pool.query(
    'UPDATE users SET name = COALESCE($1, name) WHERE id = $2 RETURNING id, name, email, role',
    [name, req.user.id]
  );
  res.json({ profile: result.rows[0] });
}

// ---------- Skin Profile Management ----------

// GET /api/skin-profile
async function getSkinProfile(req, res) {
  const result = await pool.query('SELECT * FROM skin_profiles WHERE user_id = $1', [req.user.id]);
  res.json({ skinProfile: result.rows[0] || null });
}

// PUT /api/skin-profile  (create or update — upsert)
async function upsertSkinProfile(req, res) {
  const { skinType, ageGroup, skinConcerns, allergies, sensitivities, routine } = req.body;

  const result = await pool.query(
    `INSERT INTO skin_profiles (user_id, skin_type, age_group, skin_concerns, allergies, sensitivities, routine, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       skin_type = EXCLUDED.skin_type,
       age_group = EXCLUDED.age_group,
       skin_concerns = EXCLUDED.skin_concerns,
       allergies = EXCLUDED.allergies,
       sensitivities = EXCLUDED.sensitivities,
       routine = EXCLUDED.routine,
       updated_at = NOW()
     RETURNING *`,
    [req.user.id, skinType, ageGroup, skinConcerns || [], allergies, sensitivities, routine]
  );

  res.json({ skinProfile: result.rows[0] });
}

module.exports = { getProfile, updateProfile, getSkinProfile, upsertSkinProfile };
