const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');
const SkinAnalyzer = require('../utils/skinAnalysis');

const router = express.Router();

// ─── SKIN PROFILE ROUTES ───────────────────────────────────────────────────────

// ─── GET /api/skin-profile  (get user's skin profile)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM skin_profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({ success: true, profile: null });
    }

    return res.json({ success: true, profile: result.rows[0] });
  } catch (err) {
    console.error('Get skin profile error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/skin-profile  (create skin profile)
router.post('/', [
  authMiddleware,
  body('skin_type').optional().isIn(['oily', 'dry', 'combination', 'sensitive', 'normal']),
  body('sensitivity_level').optional().isIn(['low', 'medium', 'high']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { skin_type, skin_concerns, allergies, sensitivity_level, routine_morning, routine_evening, products_used, skin_health_score, risk_factors, priority } = req.body;

    // Check if profile already exists
    const existing = await pool.query(
      'SELECT id FROM skin_profiles WHERE user_id = $1',
      [req.user.id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Profile already exists. Use PUT to update.' });
    }

    const result = await pool.query(
      `INSERT INTO skin_profiles (user_id, skin_type, skin_concerns, allergies, sensitivity_level, routine_morning, routine_evening, products_used, skin_health_score, risk_factors, priority)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [req.user.id, skin_type, skin_concerns, allergies, sensitivity_level, routine_morning, routine_evening, products_used, skin_health_score, risk_factors, priority]
    );

    return res.status(201).json({ success: true, profile: result.rows[0] });
  } catch (err) {
    console.error('Create skin profile error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/skin-profile  (update skin profile)
router.put('/', [
  authMiddleware,
  body('skin_type').optional().isIn(['oily', 'dry', 'combination', 'sensitive', 'normal']),
  body('sensitivity_level').optional().isIn(['low', 'medium', 'high']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { skin_type, skin_concerns, allergies, sensitivity_level, routine_morning, routine_evening, products_used, skin_health_score, risk_factors, priority } = req.body;

    const result = await pool.query(
      `UPDATE skin_profiles
       SET skin_type = COALESCE($2, skin_type),
           skin_concerns = COALESCE($3, skin_concerns),
           allergies = COALESCE($4, allergies),
           sensitivity_level = COALESCE($5, sensitivity_level),
           routine_morning = COALESCE($6, routine_morning),
           routine_evening = COALESCE($7, routine_evening),
           products_used = COALESCE($8, products_used),
           skin_health_score = COALESCE($9, skin_health_score),
           risk_factors = COALESCE($10, risk_factors),
           priority = COALESCE($11, priority)
       WHERE user_id = $1
       RETURNING *`,
      [req.user.id, skin_type, skin_concerns, allergies, sensitivity_level, routine_morning, routine_evening, products_used, skin_health_score, risk_factors, priority]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    return res.json({ success: true, profile: result.rows[0] });
  } catch (err) {
    console.error('Update skin profile error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── DELETE /api/skin-profile  (delete skin profile)
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM skin_profiles WHERE user_id = $1 RETURNING id',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    return res.json({ success: true, message: 'Profile deleted successfully.' });
  } catch (err) {
    console.error('Delete skin profile error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── LIFESTYLE TRACKING ROUTES ───────────────────────────────────────────────────

// ─── POST /api/lifestyle  (record lifestyle data)
router.post('/lifestyle', [
  authMiddleware,
  body('diet_type').optional().isIn(['balanced', 'vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean']),
  body('exercise_frequency').optional().isIn(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  body('stress_level').optional().isIn(['low', 'medium', 'high']),
  body('alcohol_consumption').optional().isIn(['none', 'occasional', 'regular', 'heavy']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { diet_type, water_intake_daily, exercise_frequency, stress_level, smoking_status, alcohol_consumption, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO lifestyle_tracking (user_id, diet_type, water_intake_daily, exercise_frequency, stress_level, smoking_status, alcohol_consumption, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, diet_type, water_intake_daily, exercise_frequency, stress_level, smoking_status, alcohol_consumption, notes]
    );

    return res.status(201).json({ success: true, lifestyle: result.rows[0] });
  } catch (err) {
    console.error('Create lifestyle tracking error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/lifestyle  (get lifestyle history)
router.get('/lifestyle', authMiddleware, async (req, res) => {
  try {
    const { limit = 30, offset = 0 } = req.query;
    
    const result = await pool.query(
      `SELECT * FROM lifestyle_tracking 
       WHERE user_id = $1 
       ORDER BY recorded_date DESC, created_at DESC 
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    return res.json({ success: true, lifestyle: result.rows });
  } catch (err) {
    console.error('Get lifestyle tracking error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── SLEEP TRACKING ROUTES ───────────────────────────────────────────────────────

// ─── POST /api/sleep  (record sleep data)
router.post('/sleep', [
  authMiddleware,
  body('sleep_quality').optional().isIn(['poor', 'fair', 'good', 'excellent']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { sleep_date, bedtime, wake_time, sleep_duration, sleep_quality, disturbances, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO sleep_tracking (user_id, sleep_date, bedtime, wake_time, sleep_duration, sleep_quality, disturbances, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, sleep_date, bedtime, wake_time, sleep_duration, sleep_quality, disturbances, notes]
    );

    return res.status(201).json({ success: true, sleep: result.rows[0] });
  } catch (err) {
    console.error('Create sleep tracking error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/sleep  (get sleep history)
router.get('/sleep', authMiddleware, async (req, res) => {
  try {
    const { limit = 30, offset = 0 } = req.query;
    
    const result = await pool.query(
      `SELECT * FROM sleep_tracking 
       WHERE user_id = $1 
       ORDER BY sleep_date DESC, created_at DESC 
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    return res.json({ success: true, sleep: result.rows });
  } catch (err) {
    console.error('Get sleep tracking error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── HYDRATION TRACKING ROUTES ───────────────────────────────────────────────────

// ─── POST /api/hydration  (record hydration data)
router.post('/hydration', authMiddleware, async (req, res) => {
  try {
    const { tracking_date, target_intake, current_intake, intake_logs, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO hydration_tracking (user_id, tracking_date, target_intake, current_intake, intake_logs, goal_achieved, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, tracking_date, target_intake, current_intake, intake_logs, current_intake >= target_intake, notes]
    );

    return res.status(201).json({ success: true, hydration: result.rows[0] });
  } catch (err) {
    console.error('Create hydration tracking error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── PUT /api/hydration  (update hydration data)
router.put('/hydration', authMiddleware, async (req, res) => {
  try {
    const { tracking_date, target_intake, current_intake, intake_logs, notes } = req.body;

    const result = await pool.query(
      `UPDATE hydration_tracking 
       SET target_intake = COALESCE($3, target_intake),
           current_intake = COALESCE($4, current_intake),
           intake_logs = COALESCE($5, intake_logs),
           goal_achieved = COALESCE($4, current_intake) >= COALESCE($3, target_intake),
           notes = COALESCE($6, notes)
       WHERE user_id = $1 AND tracking_date = $2
       RETURNING *`,
      [req.user.id, tracking_date, target_intake, current_intake, intake_logs, notes]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Hydration record not found.' });
    }

    return res.json({ success: true, hydration: result.rows[0] });
  } catch (err) {
    console.error('Update hydration tracking error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/hydration  (get hydration history)
router.get('/hydration', authMiddleware, async (req, res) => {
  try {
    const { limit = 30, offset = 0 } = req.query;
    
    const result = await pool.query(
      `SELECT * FROM hydration_tracking 
       WHERE user_id = $1 
       ORDER BY tracking_date DESC, created_at DESC 
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    return res.json({ success: true, hydration: result.rows });
  } catch (err) {
    console.error('Get hydration tracking error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── SKIN ANALYSIS ROUTES ───────────────────────────────────────────────────────────

// ─── POST /api/skin-profile/analyze  (analyze skin type from assessment)
router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const assessment = req.body;
    
    // Analyze skin type
    const analysis = SkinAnalyzer.analyzeSkinType(assessment);
    
    // Standardize concerns if provided
    if (assessment.concerns) {
      analysis.standardizedConcerns = SkinAnalyzer.standardizeConcerns(assessment.concerns);
    }
    
    return res.json({ success: true, analysis });
  } catch (err) {
    console.error('Skin analysis error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/skin-profile/routine  (generate personalized routine)
router.post('/routine', authMiddleware, async (req, res) => {
  try {
    const { skinType, concerns } = req.body;
    
    if (!skinType) {
      return res.status(400).json({ success: false, message: 'Skin type is required.' });
    }
    
    const routine = SkinAnalyzer.generateRoutine(skinType, concerns || []);
    
    return res.json({ success: true, routine });
  } catch (err) {
    console.error('Routine generation error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/skin-profile/health-score  (calculate comprehensive health score)
router.get('/health-score', authMiddleware, async (req, res) => {
  try {
    // Get user's complete profile data
    const [skinProfile, lifestyle, sleep, hydration, environmental] = await Promise.all([
      pool.query('SELECT * FROM skin_profiles WHERE user_id = $1', [req.user.id]),
      pool.query('SELECT * FROM lifestyle_tracking WHERE user_id = $1 ORDER BY recorded_date DESC LIMIT 30', [req.user.id]),
      pool.query('SELECT * FROM sleep_tracking WHERE user_id = $1 ORDER BY sleep_date DESC LIMIT 30', [req.user.id]),
      pool.query('SELECT * FROM hydration_tracking WHERE user_id = $1 ORDER BY tracking_date DESC LIMIT 30', [req.user.id]),
      pool.query('SELECT * FROM environmental_exposure WHERE user_id = $1 ORDER BY exposure_date DESC LIMIT 30', [req.user.id])
    ]);

    const profileData = {
      skinProfile: skinProfile.rows[0] || null,
      lifestyle: lifestyle.rows,
      sleep: sleep.rows,
      hydration: hydration.rows,
      environmental: environmental.rows
    };

    const healthScore = SkinAnalyzer.calculateHealthScore(profileData);
    
    return res.json({ success: true, healthScore });
  } catch (err) {
    console.error('Health score calculation error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── ENVIRONMENTAL EXPOSURE ROUTES ───────────────────────────────────────────────

// ─── POST /api/skin-profile/environmental  (record environmental data)
router.post('/environmental', [
  authMiddleware,
  body('pollution_level').optional().isIn(['low', 'moderate', 'high']),
  body('humidity_level').optional().isIn(['low', 'moderate', 'high']),
  body('indoor_air_quality').optional().isIn(['good', 'moderate', 'poor']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { exposure_date, uv_index, sun_exposure_hours, pollution_level, humidity_level, temperature_avg, indoor_air_quality, sunscreen_applied, sunscreen_spf, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO environmental_exposure (user_id, exposure_date, uv_index, sun_exposure_hours, pollution_level, humidity_level, temperature_avg, indoor_air_quality, sunscreen_applied, sunscreen_spf, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [req.user.id, exposure_date, uv_index, sun_exposure_hours, pollution_level, humidity_level, temperature_avg, indoor_air_quality, sunscreen_applied, sunscreen_spf, notes]
    );

    return res.status(201).json({ success: true, environmental: result.rows[0] });
  } catch (err) {
    console.error('Create environmental tracking error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── GET /api/environmental  (get environmental history)
router.get('/environmental', authMiddleware, async (req, res) => {
  try {
    const { limit = 30, offset = 0 } = req.query;
    
    const result = await pool.query(
      `SELECT * FROM environmental_exposure 
       WHERE user_id = $1 
       ORDER BY exposure_date DESC, created_at DESC 
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    return res.json({ success: true, environmental: result.rows });
  } catch (err) {
    console.error('Get environmental tracking error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;