/**
 * Product Recommendation service.
 *
 * recommendProducts() implements the workflow described in the project
 * spec: Skin Profile -> Identify Concerns -> Ingredient Intelligence ->
 * Filter Products -> Personalized Recommendations. It reuses
 * ingredientIntelligence's textConflicts() for allergy filtering, so a
 * product is excluded on exactly the same rule as a routine step would be.
 *
 * persistRecommendations() writes an audit row per recommended product to
 * product_recommendations, tied to the skincare_plans row that triggered
 * it, so Admin analytics (recommendation volume/category mix) and a
 * user's "Ingredients & Products" page both read from real historical
 * data rather than recomputing on every view.
 */

const pool = require('../config/db');
const { normalizeTerms, textConflicts } = require('./ingredientIntelligence');

const ROUTINE_CATEGORIES = ['Cleansing', 'Toner', 'Exfoliation', 'Treatment', 'Moisturizing', 'Sun Protection', 'Night Care'];

/**
 * @param {object} profile
 * @param {string} [profile.skinType]
 * @param {Array<{name:string}>} [profile.concerns]
 * @param {string[]} [profile.allergies]
 * @param {number} [profile.limitPerCategory=2]
 * @returns {Promise<Array<object>>} recommended products, each with
 *   `reason` and `routine_category` attached
 */
async function recommendProducts({ skinType, concerns = [], allergies = [], limitPerCategory = 2 } = {}) {
  const { rows: allProducts } = await pool.query('SELECT * FROM products ORDER BY name ASC');

  const allergyTerms = normalizeTerms(allergies);
  const concernNames = normalizeTerms((concerns || []).map((c) => (typeof c === 'string' ? c : c.name)));

  const scored = allProducts
    .map((p) => {
      const conflict = textConflicts([p.name, p.sensitivity_warnings, p.ingredients], allergyTerms);
      if (conflict) return null; // never recommend products that conflict with a declared allergy/sensitivity

      const skinTypeOk = !p.skin_types?.length || (skinType && p.skin_types.includes(skinType));
      const matchedConcerns = (p.skin_concerns || []).filter((c) =>
        concernNames.some((cn) => cn.includes(c) || c.includes(cn))
      );

      if (!skinTypeOk) return null;

      const score = matchedConcerns.length * 2 + (skinType && p.skin_types?.includes(skinType) ? 1 : 0);
      const reasonParts = [];
      if (skinType && p.skin_types?.includes(skinType)) reasonParts.push(`formulated for ${skinType.toLowerCase()} skin`);
      if (matchedConcerns.length) reasonParts.push(`targets ${matchedConcerns.join(', ')}`);
      if (!reasonParts.length) reasonParts.push('a safe, broadly-suitable choice for your profile');

      // ai_suitability_score reuses the exact same 0-100 scoring used by
      // the comparison endpoint (scoreProductForUser, defined below) so a
      // product's "AI Match %" reads identically whether it's shown here
      // on a recommendation card or later inside a side-by-side comparison.
      const { ai_suitability_score } = scoreProductForUser(p, { skinType, concernNames, allergyTerms });

      return {
        ...p,
        score,
        ai_suitability_score,
        reason: `Recommended because it's ${reasonParts.join(' and ')}.`,
        routine_category: p.category,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  // Cap per routine category so the list stays a curated shortlist, not
  // the entire catalog, while still covering every category with at
  // least a product where the catalog has one.
  const perCategoryCount = {};
  const capped = [];
  scored.forEach((p) => {
    const count = perCategoryCount[p.category] || 0;
    if (count >= limitPerCategory) return;
    perCategoryCount[p.category] = count + 1;
    capped.push(p);
  });

  return capped;
}

/**
 * Persists one audit row per recommended product for this plan/report.
 * Never overwrites/deletes prior recommendations — each plan generation
 * gets its own snapshot, which is what lets Admin analytics count
 * "product recommendations over time" meaningfully.
 */
async function persistRecommendations({ userId, planId, reportId, recommendations }) {
  if (!recommendations?.length) return [];
  const inserted = [];
  for (const rec of recommendations) {
    const { rows } = await pool.query(
      `INSERT INTO product_recommendations (user_id, plan_id, report_id, product_id, routine_category, reason)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [userId, planId, reportId, rec.id, rec.routine_category, rec.reason]
    );
    inserted.push(rows[0]);
  }
  return inserted;
}

/** GET-time lookup of the persisted recommendations for a given plan, joined back to their product rows. */
async function getRecommendationsForPlan(planId) {
  const { rows } = await pool.query(
    `SELECT pr.id AS recommendation_id, pr.reason, pr.routine_category, pr.created_at AS recommended_at, p.*
     FROM product_recommendations pr
     JOIN products p ON p.id = pr.product_id
     WHERE pr.plan_id = $1
     ORDER BY pr.routine_category, p.name`,
    [planId]
  );
  return rows;
}

/**
 * Product Comparison scoring (Milestone 3).
 *
 * Scores a single product against the *current authenticated user's*
 * profile for the "AI Suitability Score" shown on the comparison screen.
 * Deliberately reuses the exact same allergy-matching primitive
 * (textConflicts) as recommendProducts() above, so a product that would
 * never be recommended to this user is *never* eligible to be marked
 * "Best Match for You" here either — the two features can't disagree on
 * that boundary.
 *
 * This does not read/write the database and has no side effects, so the
 * caller (productController.compareProducts) can call it once per
 * product in the requested comparison set.
 *
 * @param {object} product a full row from the `products` table
 * @param {object} profile
 * @param {string|null} [profile.skinType]
 * @param {string[]} [profile.concernNames] already-normalized (lowercased) concern terms
 * @param {string[]} [profile.allergyTerms] already-normalized (lowercased) allergy/sensitivity terms
 * @returns {object} the product plus ai_suitability_score, best_for,
 *   key_benefit, potential_concern, allergy_conflict
 */
function scoreProductForUser(product, { skinType, concernNames = [], allergyTerms = [] } = {}) {
  const conflict = textConflicts([product.name, product.sensitivity_warnings, product.ingredients], allergyTerms);
  const skinTypeMatch = !product.skin_types?.length || (skinType && product.skin_types.includes(skinType));
  const matchedConcerns = (product.skin_concerns || []).filter((c) =>
    concernNames.some((cn) => cn.includes(c) || c.includes(cn))
  );

  // Baseline for any catalog product with no negative signal, then add
  // points for skin-type fit and each matched concern (capped), plus a
  // small bonus for fragrance-free formulas since fragrance is the most
  // common source of reactions. A declared-allergy conflict overrides
  // everything else and caps the score low — it stays visible in the
  // comparison (never hidden) but can never win "Best Match for You".
  let score = 40;
  if (skinTypeMatch) score += 25;
  score += Math.min(matchedConcerns.length, 3) * 12;
  if (product.fragrance_free) score += 3;
  if (!skinTypeMatch) score -= 15;
  if (conflict) score = Math.min(score, 15);
  score = Math.max(0, Math.min(100, Math.round(score)));

  const bestForParts = [];
  if (matchedConcerns.length) bestForParts.push(matchedConcerns.slice(0, 2).join(' + '));
  if (skinType && skinTypeMatch) bestForParts.push(`${skinType} Skin`);
  const bestFor = bestForParts.length ? bestForParts.join(' + ') : (product.category || 'General use');

  const keyBenefit = matchedConcerns.length
    ? `Targets ${matchedConcerns.join(', ')}`
    : (product.description ? product.description.split('.')[0].trim() : 'Broadly suitable, low-risk formula');

  const concernNotes = [];
  if (conflict) concernNotes.push(`Contains an ingredient that conflicts with your declared allergy/sensitivity ("${conflict}")`);
  if (!conflict && !product.fragrance_free && (product.sensitivity_warnings || []).some((w) => /fragrance|parfum/i.test(w))) {
    concernNotes.push('Contains fragrance');
  }
  if (!skinTypeMatch && skinType) concernNotes.push(`Not formulated for ${skinType.toLowerCase()} skin`);
  if (product.price != null && Number(product.price) >= 25) concernNotes.push('Higher price point');
  const potentialConcern = concernNotes[0] || 'None noted';

  return {
    ...product,
    ai_suitability_score: score,
    best_for: bestFor,
    key_benefit: keyBenefit,
    potential_concern: potentialConcern,
    allergy_conflict: !!conflict,
  };
}

module.exports = {
  ROUTINE_CATEGORIES,
  recommendProducts,
  persistRecommendations,
  getRecommendationsForPlan,
  scoreProductForUser,
};
