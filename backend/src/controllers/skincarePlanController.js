const pool = require('../config/db');
const { generatePlan, computeChanges } = require('../utils/routineGenerator');
const { recommendProducts, persistRecommendations, getRecommendationsForPlan } = require('../services/productRecommendation');

// Looks across a user's past reports (excluding the current one) for
// concerns that show up more than once, so the generator/explanation can
// call out recurring issues instead of only reacting to the latest report.
function findRecurringConcerns(currentConcerns, pastReports) {
  const currentNames = new Set((currentConcerns || []).map((c) => (c.name || '').toLowerCase()));
  const counts = {};
  pastReports.forEach((r) => {
    (r.concerns || []).forEach((c) => {
      const key = (c.name || '').toLowerCase();
      if (!key) return;
      counts[key] = (counts[key] || 0) + 1;
    });
  });
  return Object.keys(counts)
    .filter((key) => counts[key] >= 2 && currentNames.has(key))
    .map((key) => ({ name: key }));
}

// POST /api/skincare-plan/generate
// Generates a fresh plan from the user's latest skin report (or a specific
// report_id if provided), combined with their saved preferences
// (allergies/lifestyle/known concerns) and assessment history, and
// persists it. Also computes what changed vs. the previous assessment so
// the routine can be shown as adaptive rather than static.
async function generateSkincarePlan(req, res, next) {
  try {
    const { report_id } = req.body || {};

    let report;
    if (report_id) {
      const { rows } = await pool.query(
        'SELECT * FROM skin_reports WHERE id = $1 AND user_id = $2',
        [report_id, req.user.id]
      );
      report = rows[0];
      if (!report) {
        return res.status(404).json({ message: 'Report not found.' });
      }
    } else {
      const { rows } = await pool.query(
        'SELECT * FROM skin_reports WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [req.user.id]
      );
      report = rows[0];
      if (!report) {
        return res.status(400).json({
          message: 'Upload a skin analysis first — your plan is built from your latest report.',
        });
      }
    }

    // Pull saved preferences (allergies/lifestyle/known concerns) — optional,
    // the generator works fine with none of this set.
    const prefsResult = await pool.query(
      'SELECT * FROM user_skincare_preferences WHERE user_id = $1',
      [req.user.id]
    );
    const prefs = prefsResult.rows[0] || null;

    // Pull assessment history (all reports except the one this plan is
    // based on, most recent first) to detect recurring concerns and to
    // compare against the immediately-previous assessment.
    const historyResult = await pool.query(
      'SELECT * FROM skin_reports WHERE user_id = $1 AND id != $2 ORDER BY created_at DESC LIMIT 10',
      [req.user.id, report.id]
    );
    const previousReport = historyResult.rows[0] || null;
    const recurringConcerns = findRecurringConcerns(report.concerns || [], historyResult.rows);
    const changes_from_previous = computeChanges(previousReport, report);

    // Merge AI-detected concerns from the report with any additional
    // concerns the user has declared themselves, de-duped by name.
    const declaredConcerns = (prefs?.known_concerns || []).map((name) => ({ name, priority: 50 }));
    const allConcerns = [...(report.concerns || [])];
    declaredConcerns.forEach((dc) => {
      if (!allConcerns.some((c) => (c.name || '').toLowerCase() === dc.name.toLowerCase())) {
        allConcerns.push(dc);
      }
    });

    const lifestyle = prefs
      ? {
          activity_level: prefs.activity_level,
          outdoor_exposure: prefs.outdoor_exposure,
          sleep_quality: prefs.sleep_quality,
          environment: prefs.environment,
        }
      : null;

    const plan = generatePlan({
      skinType: prefs?.skin_type || report.skin_type,
      concerns: allConcerns,
      healthScore: report.skin_health_score,
      allergies: prefs?.allergies || [],
      lifestyle,
      recurringConcerns,
    });

    const { rows } = await pool.query(
      `INSERT INTO skincare_plans
        (user_id, report_id, skin_type, season, morning_routine, evening_routine, weekly_treatments, seasonal_recommendations, preferences_snapshot, excluded_ingredients, explanation, changes_from_previous)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        req.user.id,
        report.id,
        plan.skin_type,
        plan.season,
        JSON.stringify(plan.morning_routine),
        JSON.stringify(plan.evening_routine),
        JSON.stringify(plan.weekly_treatments),
        JSON.stringify(plan.seasonal_recommendations),
        prefs ? JSON.stringify(prefs) : null,
        JSON.stringify(plan.excluded_ingredients),
        JSON.stringify(plan.explanation),
        JSON.stringify(changes_from_previous),
      ]
    );

    // Product Recommendation Engine: Skin Profile -> Concerns -> Ingredient
    // Intelligence (allergy filtering) -> Filter Products -> Personalized
    // Recommendations, using the exact same profile just used to build the
    // routine, so the two stay consistent with each other.
    const recommendedProducts = await recommendProducts({
      skinType: plan.skin_type,
      concerns: allConcerns,
      allergies: prefs?.allergies || [],
    });
    const savedRecommendations = await persistRecommendations({
      userId: req.user.id,
      planId: rows[0].id,
      reportId: report.id,
      recommendations: recommendedProducts,
    });
    // Merge the persisted recommendation_id back onto the rich product
    // objects so the response has both full product detail and an id to
    // reference, without a second round-trip query.
    const productRecommendationsForResponse = recommendedProducts.map((p, i) => ({
      ...p,
      recommendation_id: savedRecommendations[i]?.id,
    }));

    res.status(201).json({
      message: 'Skincare plan generated.',
      plan: { ...rows[0], product_recommendations: productRecommendationsForResponse },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/skincare-plan  (latest plan for the current user)
async function getMyLatestPlan(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM skincare_plans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );
    if (!rows[0]) return res.json({ plan: null });

    const product_recommendations = await getRecommendationsForPlan(rows[0].id);
    res.json({ plan: { ...rows[0], product_recommendations } });
  } catch (err) {
    next(err);
  }
}

// GET /api/skincare-plan/history
async function getMyPlanHistory(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM skincare_plans WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ plans: rows });
  } catch (err) {
    next(err);
  }
}

// PUT /api/skincare-plan/:id  (manual edit — user adjusts steps themselves)
// Only morning_routine, evening_routine, and weekly_treatments are
// user-editable; everything else (season, explanation, etc.) stays as the
// generator produced it, since it describes *why* the plan looked the way
// it did at generation time.
async function updateSkincarePlan(req, res, next) {
  try {
    const { morning_routine, evening_routine, weekly_treatments } = req.body || {};

    const { rows: existingRows } = await pool.query(
      'SELECT * FROM skincare_plans WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!existingRows[0]) return res.status(404).json({ message: 'Plan not found.' });

    const { rows } = await pool.query(
      `UPDATE skincare_plans SET
         morning_routine = COALESCE($1, morning_routine),
         evening_routine = COALESCE($2, evening_routine),
         weekly_treatments = COALESCE($3, weekly_treatments),
         edited_by_user = TRUE
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [
        morning_routine ? JSON.stringify(morning_routine) : null,
        evening_routine ? JSON.stringify(evening_routine) : null,
        weekly_treatments ? JSON.stringify(weekly_treatments) : null,
        req.params.id,
        req.user.id,
      ]
    );

    res.json({ message: 'Routine updated.', plan: rows[0] });
  } catch (err) {
    next(err);
  }
}

// PUT /api/skincare-plan/:id/checklist
// Body: { date: 'YYYY-MM-DD', item_key: 'morning-1', done: true }
// Stores completion per calendar day so the checklist naturally resets
// each day without deleting history for previous days.
async function updateChecklist(req, res, next) {
  try {
    const { date, item_key, done } = req.body || {};
    if (!date || !item_key || typeof done !== 'boolean') {
      return res.status(400).json({ message: 'date, item_key, and done (boolean) are required.' });
    }

    const { rows: existingRows } = await pool.query(
      'SELECT checklist FROM skincare_plans WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!existingRows[0]) return res.status(404).json({ message: 'Plan not found.' });

    const checklist = existingRows[0].checklist || {};
    const dayEntry = { ...(checklist[date] || {}) };
    if (done) {
      dayEntry[item_key] = true;
    } else {
      delete dayEntry[item_key];
    }
    const updatedChecklist = { ...checklist, [date]: dayEntry };

    const { rows } = await pool.query(
      'UPDATE skincare_plans SET checklist = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [JSON.stringify(updatedChecklist), req.params.id, req.user.id]
    );

    res.json({ message: 'Checklist updated.', plan: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  generateSkincarePlan,
  getMyLatestPlan,
  getMyPlanHistory,
  updateSkincarePlan,
  updateChecklist,
};
