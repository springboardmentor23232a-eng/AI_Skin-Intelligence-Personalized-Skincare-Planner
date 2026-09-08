const pool = require('../config/db');
const { recommendProducts, getRecommendationsForPlan, scoreProductForUser } = require('../services/productRecommendation');
const { normalizeTerms } = require('../services/ingredientIntelligence');

// GET /api/products?q=&skinType=&concern=&category=
async function listProducts(req, res, next) {
  try {
    const { q, skinType, concern, category } = req.query;
    const clauses = [];
    const params = [];

    if (q) {
      params.push(`%${q.toLowerCase()}%`);
      clauses.push(`(LOWER(name) LIKE $${params.length} OR LOWER(brand) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`);
    }
    if (category) {
      params.push(category);
      clauses.push(`category = $${params.length}`);
    }
    if (skinType) {
      params.push(JSON.stringify(skinType));
      clauses.push(`(skin_types = '[]'::jsonb OR skin_types @> $${params.length}::jsonb)`);
    }
    if (concern) {
      params.push(JSON.stringify(concern.toLowerCase()));
      clauses.push(`skin_concerns @> $${params.length}::jsonb`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const { rows } = await pool.query(`SELECT * FROM products ${where} ORDER BY category, name`, params);
    res.json({ products: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:id
async function getProduct(req, res, next) {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Product not found.' });
    res.json({ product: rows[0] });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/recommendations
// If the user has a persisted skincare plan, returns the exact
// recommendations saved when that plan was generated (see
// skincarePlanController.generateSkincarePlan). Otherwise computes a
// fresh, unpersisted set from their latest report/preferences so the
// page still works before a plan has ever been generated.
async function getMyRecommendations(req, res, next) {
  try {
    const planResult = await pool.query(
      'SELECT * FROM skincare_plans WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.user.id]
    );
    const plan = planResult.rows[0];

    const [reportResult, prefsResult] = await Promise.all([
      pool.query('SELECT * FROM skin_reports WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [req.user.id]),
      pool.query('SELECT * FROM user_skincare_preferences WHERE user_id = $1', [req.user.id]),
    ]);
    const report = reportResult.rows[0] || null;
    const prefs = prefsResult.rows[0] || null;
    const skinType = prefs?.skin_type || report?.skin_type || null;
    const declaredConcerns = (prefs?.known_concerns || []).map((c) => (typeof c === 'string' ? c : c?.name)).filter(Boolean);
    const reportConcerns = (report?.concerns || []).map((c) => (typeof c === 'string' ? c : c?.name)).filter(Boolean);
    const concernNames = normalizeTerms([...declaredConcerns, ...reportConcerns]);
    const allergyTerms = normalizeTerms(prefs?.allergies || []);

    if (plan) {
      const persisted = await getRecommendationsForPlan(plan.id);
      if (persisted.length) {
        // Attach ai_suitability_score against the user's *current* profile
        // (which may have changed since the plan was generated) so the
        // card's "AI Match %" and a later Compare are always consistent.
        const recommendations = persisted.map((p) => scoreProductForUser(p, { skinType, concernNames, allergyTerms }));
        return res.json({ recommendations, source: 'plan', plan_id: plan.id });
      }
    }

    if (!report) {
      return res.json({ recommendations: [], source: 'none', message: 'Complete a skin assessment first to see personalized product recommendations.' });
    }

    const recommendations = await recommendProducts({
      skinType,
      concerns: [...(report.concerns || []), ...declaredConcerns.map((name) => ({ name }))],
      allergies: prefs?.allergies || [],
    });

    res.json({ recommendations, source: 'computed' });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/compare?ids=1,2,3  (2-4 ids)
// Returns each requested product scored against the authenticated user's
// current skin profile (skin type, concerns, declared allergies), plus
// which one — if any — is flagged as the "Best Match for You". A product
// that conflicts with a declared allergy is always included (so the user
// can still see why it's a poor fit) but is never eligible to be the
// best match, mirroring the same rule getMyRecommendations/recommendProducts
// already enforces.
async function compareProducts(req, res, next) {
  try {
    const idsParam = req.query.ids;
    if (!idsParam || !String(idsParam).trim()) {
      return res.status(400).json({ message: 'Select at least 2 products to compare.' });
    }

    // Validate every id before it ever reaches a query — non-numeric or
    // non-positive values are dropped rather than passed through.
    const ids = String(idsParam)
      .split(',')
      .map((s) => Number.parseInt(s.trim(), 10))
      .filter((n) => Number.isInteger(n) && n > 0);
    const uniqueIds = [...new Set(ids)];

    if (uniqueIds.length < 2) {
      return res.status(400).json({ message: 'Select at least 2 products to compare.' });
    }
    if (uniqueIds.length > 4) {
      return res.status(400).json({ message: 'You can compare up to 4 products at a time.' });
    }

    const { rows: products } = await pool.query(
      'SELECT * FROM products WHERE id = ANY($1::int[])',
      [uniqueIds]
    );
    if (!products.length) {
      return res.status(404).json({ message: 'None of the selected products could be found.' });
    }

    const [reportResult, prefsResult] = await Promise.all([
      pool.query('SELECT * FROM skin_reports WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [req.user.id]),
      pool.query('SELECT * FROM user_skincare_preferences WHERE user_id = $1', [req.user.id]),
    ]);
    const report = reportResult.rows[0] || null;
    const prefs = prefsResult.rows[0] || null;

    const skinType = prefs?.skin_type || report?.skin_type || null;
    const declaredConcerns = (prefs?.known_concerns || []).map((c) => (typeof c === 'string' ? c : c?.name)).filter(Boolean);
    const reportConcerns = (report?.concerns || []).map((c) => (typeof c === 'string' ? c : c?.name)).filter(Boolean);
    const concernNames = normalizeTerms([...declaredConcerns, ...reportConcerns]);
    const allergyTerms = normalizeTerms(prefs?.allergies || []);

    const scored = products.map((p) => scoreProductForUser(p, { skinType, concernNames, allergyTerms }));

    // Preserve the order the ids were requested in, so the frontend's
    // side-by-side columns match the order the user selected them.
    const byId = new Map(scored.map((p) => [p.id, p]));
    const ordered = uniqueIds.map((id) => byId.get(id)).filter(Boolean);

    const eligible = ordered.filter((p) => !p.allergy_conflict);
    const best = eligible.length
      ? eligible.reduce((a, b) => (b.ai_suitability_score > a.ai_suitability_score ? b : a))
      : null;

    const comparison = ordered.map((p) => ({ ...p, best_match: !!best && p.id === best.id }));

    res.json({
      comparison,
      profile: { skin_type: skinType, concerns: concernNames, allergies: allergyTerms },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listProducts, getProduct, getMyRecommendations, compareProducts };
