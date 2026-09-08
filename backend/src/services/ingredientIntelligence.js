/**
 * Ingredient Intelligence service.
 *
 * Two responsibilities:
 *  1. Catalog access — search/filter/get against the `ingredients` table
 *     (backs GET /api/ingredients and GET /api/ingredients/:id).
 *  2. Personalized evaluation — given a user's skin type/concerns/
 *     allergies, classify every catalog ingredient as suitable, use-with-
 *     caution, or to-avoid, with a plain-language reason for each
 *     (backs GET /api/ingredients/for-me).
 *
 * `normalizeTerms` / `textConflicts` are the same free-text allergy/avoid
 * matching primitives routineGenerator.js already used internally (as
 * `normalizeAllergies` / `stepConflicts`) — they're centralized here and
 * routineGenerator.js now delegates to them, so there is exactly one
 * implementation of "does this ingredient/product text conflict with a
 * declared allergy term" for the whole app. routineGenerator.js's own
 * rule-based routine-building logic (which steps go where, per-concern
 * overrides, seasonal library, etc.) is untouched.
 */

const pool = require('../config/db');

function normalizeTerms(list = []) {
  return list.map((t) => String(t || '').trim().toLowerCase()).filter(Boolean);
}

// Returns the first matching term found in the given text fragments, or
// null. `haystackParts` may contain strings, arrays of strings, or
// null/undefined — all are flattened and lowercased before matching.
function textConflicts(haystackParts, terms) {
  if (!terms || !terms.length) return null;
  const haystack = []
    .concat(...haystackParts.map((p) => (Array.isArray(p) ? p : [p])))
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return terms.find((term) => haystack.includes(term)) || null;
}

async function searchIngredients({ q, skinType, concern, category } = {}) {
  const clauses = [];
  const params = [];

  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    clauses.push(`(LOWER(name) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`);
  }
  if (category) {
    params.push(category);
    clauses.push(`category = $${params.length}`);
  }
  if (skinType) {
    params.push(JSON.stringify(skinType));
    clauses.push(`suitable_skin_types @> $${params.length}::jsonb`);
  }
  if (concern) {
    params.push(JSON.stringify(concern.toLowerCase()));
    clauses.push(`suitable_concerns @> $${params.length}::jsonb`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await pool.query(`SELECT * FROM ingredients ${where} ORDER BY name ASC`, params);
  return rows;
}

async function getIngredientById(id) {
  const { rows } = await pool.query('SELECT * FROM ingredients WHERE id = $1', [id]);
  return rows[0] || null;
}

/**
 * Classifies every ingredient in the catalog against one user's profile.
 * @param {object} profile
 * @param {string} [profile.skinType]
 * @param {Array<{name:string}>|string[]} [profile.concerns]
 * @param {string[]} [profile.allergies] — free-text ingredients/terms to avoid
 * @returns {Promise<{suitable: object[], caution: object[], avoid: object[]}>}
 */
async function getPersonalizedIngredients({ skinType, concerns = [], allergies = [] } = {}) {
  const { rows: allIngredients } = await pool.query('SELECT * FROM ingredients ORDER BY name ASC');

  const allergyTerms = normalizeTerms(allergies);
  const concernNames = normalizeTerms(
    (concerns || []).map((c) => (typeof c === 'string' ? c : c.name))
  );

  const suitable = [];
  const caution = [];
  const avoid = [];

  allIngredients.forEach((ing) => {
    const conflict = textConflicts([ing.name, ing.allergy_notes], allergyTerms);
    if (conflict) {
      avoid.push({ ...ing, reason: `Conflicts with an ingredient/term you asked to avoid: "${conflict}".` });
      return;
    }

    const matchesSkinType = skinType && (ing.suitable_skin_types || []).includes(skinType);
    const matchedConcerns = (ing.suitable_concerns || []).filter((c) =>
      concernNames.some((cn) => cn.includes(c) || c.includes(cn))
    );

    if (ing.irritation_potential === 'high' && !matchedConcerns.length) {
      caution.push({
        ...ing,
        reason: 'Higher-irritation ingredient without a clear match to your current concerns — introduce gradually if you choose to use it.',
      });
      return;
    }

    if (matchesSkinType || matchedConcerns.length) {
      const reasonParts = [];
      if (matchesSkinType) reasonParts.push(`suits ${skinType.toLowerCase()} skin`);
      if (matchedConcerns.length) reasonParts.push(`targets ${matchedConcerns.join(', ')}`);
      suitable.push({ ...ing, reason: `Good fit — ${reasonParts.join(' and ')}.` });
    } else if (ing.irritation_potential === 'high') {
      caution.push({ ...ing, reason: 'A stronger active — patch test and introduce gradually.' });
    } else {
      suitable.push({ ...ing, reason: 'Generally well tolerated and compatible with most routines.' });
    }
  });

  return { suitable, caution, avoid };
}

module.exports = {
  normalizeTerms,
  textConflicts,
  searchIngredients,
  getIngredientById,
  getPersonalizedIngredients,
};
