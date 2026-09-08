const pool = require('../config/db');
const { searchIngredients, getIngredientById, getPersonalizedIngredients } = require('../services/ingredientIntelligence');

// GET /api/ingredients?q=&skinType=&concern=&category=
async function listIngredients(req, res, next) {
  try {
    const { q, skinType, concern, category } = req.query;
    const ingredients = await searchIngredients({ q, skinType, concern, category });
    res.json({ ingredients });
  } catch (err) {
    next(err);
  }
}

// GET /api/ingredients/:id
async function getIngredient(req, res, next) {
  try {
    const ingredient = await getIngredientById(req.params.id);
    if (!ingredient) return res.status(404).json({ message: 'Ingredient not found.' });
    res.json({ ingredient });
  } catch (err) {
    next(err);
  }
}

// GET /api/ingredients/for-me
// Personalized suitable/caution/avoid breakdown built from the current
// user's latest skin report + saved preferences (allergies/known concerns)
// — the same inputs routineGenerator.js uses, so this page and the
// generated routine are always describing the same profile.
async function getMyIngredientInsights(req, res, next) {
  try {
    const [reportResult, prefsResult] = await Promise.all([
      pool.query('SELECT * FROM skin_reports WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [req.user.id]),
      pool.query('SELECT * FROM user_skincare_preferences WHERE user_id = $1', [req.user.id]),
    ]);
    const report = reportResult.rows[0] || null;
    const prefs = prefsResult.rows[0] || null;

    const declaredConcerns = (prefs?.known_concerns || []).map((name) => ({ name }));
    const concerns = [...(report?.concerns || []), ...declaredConcerns];

    const insights = await getPersonalizedIngredients({
      skinType: prefs?.skin_type || report?.skin_type || null,
      concerns,
      allergies: prefs?.allergies || [],
    });

    res.json({
      profile: {
        skin_type: prefs?.skin_type || report?.skin_type || null,
        concerns: concerns.map((c) => c.name),
        allergies: prefs?.allergies || [],
      },
      ...insights,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listIngredients, getIngredient, getMyIngredientInsights };
