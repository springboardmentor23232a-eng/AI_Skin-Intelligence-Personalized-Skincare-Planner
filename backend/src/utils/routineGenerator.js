/**
 * Generates a personalized skincare plan — morning routine, evening
 * routine, weekly treatment plan, and seasonal recommendations — from a
 * user's skin type, concerns, health score, declared allergies/sensitivities,
 * lifestyle inputs, and (optionally) their assessment history.
 *
 * This is a deterministic, rule-based generator (not a second ML model):
 * given the same inputs, it always returns the same plan, which keeps it
 * transparent and explainable to the user — each step says *why* it's
 * included, and the top-level `explanation` array says why the routine as a
 * whole looks the way it does.
 *
 * This is informational, AI-assisted skincare guidance — not a medical
 * diagnosis or a guaranteed treatment outcome. Callers (controllers/UI)
 * should keep that disclaimer visible; this module never asserts otherwise.
 */

// Each step carries an `ingredients` tag list used purely for allergy
// filtering (see filterForAllergies below) — it is not shown to the user.
const BASE_MORNING = [
  { step: 1, category: 'Cleanser', product: 'Gentle Foaming Cleanser', reason: 'Removes overnight oil buildup and preps skin for the rest of the routine.', ingredients: ['sulfate'] },
  { step: 2, category: 'Treatment', product: 'Antioxidant Serum (Vitamin C)', reason: 'Protects against environmental damage and brightens skin tone through the day.', ingredients: ['vitamin c', 'ascorbic acid'] },
  { step: 3, category: 'Moisturizer', product: 'Lightweight Moisturizer', reason: 'Locks in hydration without feeling heavy under makeup or sunscreen.', ingredients: [] },
  { step: 4, category: 'Sunscreen', product: 'Broad-Spectrum SPF 50', reason: 'Daily sun protection is the single most important step to prevent further damage.', ingredients: ['chemical sunscreen', 'oxybenzone'] },
];

const BASE_EVENING = [
  { step: 1, category: 'Cleanser', product: 'Double Cleanse (Oil + Foam)', reason: 'Fully removes sunscreen, makeup, and the day\u2019s pollution buildup.', ingredients: ['sulfate'] },
  { step: 2, category: 'Treatment', product: 'Targeted Treatment Serum', reason: 'Nighttime is when active ingredients work best, undisturbed by sun exposure.', ingredients: [] },
  { step: 3, category: 'Moisturizer', product: 'Nourishing Moisturizer', reason: 'Supports the skin barrier\u2019s natural overnight repair process.', ingredients: [] },
  { step: 4, category: 'Night Care', product: 'Occlusive Night Cream / Sleeping Mask', reason: 'Seals in hydration and active ingredients while you sleep.', ingredients: ['fragrance'] },
];

// Safe, low-actives fallback used whenever a candidate product for a
// category would conflict with a declared allergy/sensitivity. Kept
// deliberately minimal so it's very unlikely to itself trigger a listed
// allergy.
const SAFE_FALLBACKS = {
  Cleanser: { product: 'Fragrance-Free Gentle Cleanser', ingredients: [] },
  Treatment: { product: 'Fragrance-Free Soothing Serum', ingredients: [] },
  Moisturizer: { product: 'Fragrance-Free Barrier Moisturizer', ingredients: [] },
  Sunscreen: { product: 'Mineral Sunscreen SPF 50 (Zinc Oxide)', ingredients: ['mineral sunscreen', 'zinc oxide'] },
  'Night Care': { product: 'Fragrance-Free Repair Balm', ingredients: [] },
};

// Per-concern overrides/additions, keyed by lowercase substring match
// against a concern's `name` field (matches both the ML pipeline's and
// the simulated engine's concern naming).
const CONCERN_ADJUSTMENTS = {
  acne: {
    morning: { step: 2, category: 'Treatment', product: 'Salicylic Acid (BHA) Serum', reason: 'Helps clear pores and reduce active breakouts.', ingredients: ['salicylic acid', 'bha'] },
    evening: { step: 2, category: 'Treatment', product: 'Benzoyl Peroxide Spot Treatment', reason: 'Targets acne-causing bacteria overnight.', ingredients: ['benzoyl peroxide'] },
    weekly: { name: 'Clay Mask', category: 'Treatment', frequency: '1x / week', description: 'Draws out excess oil and impurities from congested pores.', ingredients: ['clay'] },
  },
  dryness: {
    morning: { step: 3, category: 'Moisturizer', product: 'Ceramide-Rich Cream', reason: 'Rebuilds the skin barrier to reduce flaking and tightness.', ingredients: ['ceramide'] },
    evening: { step: 4, category: 'Night Care', product: 'Occlusive Balm', reason: 'Locks in moisture overnight for a compromised barrier.', ingredients: [] },
    weekly: { name: 'Hydrating Sheet Mask', category: 'Moisturizing', frequency: '2x / week', description: 'Delivers an intensive moisture boost between daily routine steps.', ingredients: ['hyaluronic acid'] },
  },
  oiliness: {
    morning: { step: 3, category: 'Moisturizer', product: 'Oil-Free Gel Moisturizer', reason: 'Hydrates without adding excess shine or clogging pores.', ingredients: [] },
    evening: { step: 2, category: 'Treatment', product: 'Niacinamide Serum', reason: 'Regulates sebum production overnight.', ingredients: ['niacinamide'] },
    weekly: { name: 'Oil-Absorbing Clay Mask', category: 'Treatment', frequency: '1-2x / week', description: 'Controls excess sebum and minimizes shine.', ingredients: ['clay'] },
  },
  redness: {
    morning: { step: 2, category: 'Treatment', product: 'Centella Asiatica Serum', reason: 'Calms and soothes reactive, easily irritated skin.', ingredients: ['centella asiatica'] },
    evening: { step: 2, category: 'Treatment', product: 'Ceramide + Cica Repair Serum', reason: 'Supports barrier repair to reduce ongoing sensitivity.', ingredients: ['ceramide', 'centella asiatica'] },
    weekly: { name: 'Soothing Gel Mask', category: 'Treatment', frequency: '1x / week', description: 'Cools and calms visible redness and irritation.', ingredients: [] },
  },
  irritation: {
    morning: { step: 2, category: 'Treatment', product: 'Centella Asiatica Serum', reason: 'Calms and soothes reactive, easily irritated skin.', ingredients: ['centella asiatica'] },
    evening: { step: 2, category: 'Treatment', product: 'Ceramide + Cica Repair Serum', reason: 'Supports barrier repair to reduce ongoing sensitivity.', ingredients: ['ceramide', 'centella asiatica'] },
    weekly: { name: 'Soothing Gel Mask', category: 'Treatment', frequency: '1x / week', description: 'Cools and calms visible redness and irritation.', ingredients: [] },
  },
  pigmentation: {
    morning: { step: 2, category: 'Treatment', product: 'Vitamin C + Niacinamide Serum', reason: 'Brightens and helps fade uneven pigmentation over time.', ingredients: ['vitamin c', 'niacinamide'] },
    evening: { step: 2, category: 'Treatment', product: 'Tranexamic Acid Serum', reason: 'Targets dark spots and pigmentation overnight.', ingredients: ['tranexamic acid'] },
    weekly: { name: 'Brightening Exfoliation (AHA)', category: 'Exfoliation', frequency: '1x / week', description: 'Encourages cell turnover to fade pigmentation faster.', ingredients: ['aha', 'glycolic acid'] },
  },
  'uneven skin tone': {
    weekly: { name: 'Gentle AHA Exfoliation', category: 'Exfoliation', frequency: '1x / week', description: 'Promotes even texture and tone over time.', ingredients: ['aha', 'glycolic acid'] },
  },
  'enlarged pores': {
    evening: { step: 2, category: 'Treatment', product: 'Niacinamide Serum', reason: 'Visibly refines the look of enlarged pores over time.', ingredients: ['niacinamide'] },
    weekly: { name: 'Pore-Clarifying Clay Mask', category: 'Treatment', frequency: '1x / week', description: 'Deep-cleans pores to reduce their visible size.', ingredients: ['clay'] },
  },
  'fine lines': {
    evening: { step: 2, category: 'Treatment', product: 'Retinol (2-3x/week, alternate nights)', reason: 'Supports collagen renewal to soften fine lines over time.', ingredients: ['retinol'] },
    weekly: { name: 'Peptide Recovery Mask', category: 'Treatment', frequency: '1x / week', description: 'Supports skin firmness and elasticity.', ingredients: ['peptide'] },
  },
};

const SEASONAL_LIBRARY = {
  Spring: [
    { title: 'Lighten Your Moisturizer', description: 'As humidity rises, switch to a lighter gel-cream to avoid feeling heavy.' },
    { title: 'Refresh Your SPF', description: 'Check your sunscreen\u2019s expiry — spring sun exposure increases quickly.' },
    { title: 'Gentle Exfoliation Restart', description: 'Slough off winter dryness with a mild exfoliant, 1x/week to start.' },
  ],
  Summer: [
    { title: 'Upgrade to SPF 50+', description: 'Reapply every 2 hours during direct sun exposure.' },
    { title: 'Switch to Oil-Free Formulas', description: 'Heat and humidity increase oil production — lighten up your routine.' },
    { title: 'Add an Antioxidant Mist', description: 'A vitamin C or green tea mist can refresh skin and add extra UV protection midday.' },
  ],
  Autumn: [
    { title: 'Reintroduce Richer Hydration', description: 'As humidity drops, layer in a heavier moisturizer or facial oil.' },
    { title: 'Repair Summer Sun Damage', description: 'This is a good season to start a vitamin C or gentle retinol routine.' },
    { title: 'Watch for Barrier Stress', description: 'Temperature swings can trigger sensitivity — simplify your routine if needed.' },
  ],
  Winter: [
    { title: 'Switch to a Cream Cleanser', description: 'Avoid foaming cleansers that can strip already-dry winter skin.' },
    { title: 'Layer a Facial Oil', description: 'Seal in moisture on top of your regular moisturizer in dry, heated indoor air.' },
    { title: 'Don\u2019t Skip SPF', description: 'UV exposure (and snow glare) continues year-round, even in cold weather.' },
  ],
};

function getSeason(date = new Date()) {
  const month = date.getMonth(); // 0-11
  if ([2, 3, 4].includes(month)) return 'Spring';
  if ([5, 6, 7].includes(month)) return 'Summer';
  if ([8, 9, 10].includes(month)) return 'Autumn';
  return 'Winter';
}

function matchConcernKey(concernName) {
  const lower = (concernName || '').toLowerCase();
  return Object.keys(CONCERN_ADJUSTMENTS).find((key) => lower.includes(key));
}

function applyAdjustments(baseRoutine, adjustments, field) {
  const routine = baseRoutine.map((s) => ({ ...s }));
  adjustments.forEach((adj) => {
    const override = adj[field];
    if (!override) return;
    const idx = routine.findIndex((s) => s.step === override.step);
    if (idx >= 0) {
      routine[idx] = { ...routine[idx], ...override };
    }
  });
  return routine;
}

const { normalizeTerms, textConflicts } = require('../services/ingredientIntelligence');

// Normalizes user-declared allergies/sensitivities (free text) into
// lowercase substrings for matching against step `ingredients` tags and
// product names. Thin wrapper over ingredientIntelligence.normalizeTerms
// so there's exactly one implementation of this matching rule app-wide.
function normalizeAllergies(allergies = []) {
  return normalizeTerms(allergies);
}

function stepConflicts(step, allergyTerms) {
  return textConflicts([step.product, step.ingredients], allergyTerms);
}

// Replaces any step whose product/ingredients conflict with a declared
// allergy with a safe, low-actives fallback for that category. Returns the
// filtered routine plus a list of {category, original, matched_allergy}
// substitutions so the caller can be transparent about what changed and why.
function filterForAllergies(routineSteps, allergyTerms) {
  if (!allergyTerms.length) return { routine: routineSteps, excluded: [] };

  const excluded = [];
  const routine = routineSteps.map((step) => {
    const conflict = stepConflicts(step, allergyTerms);
    if (!conflict) return step;

    excluded.push({ category: step.category, original_product: step.product, matched_allergy: conflict });
    const fallback = SAFE_FALLBACKS[step.category];
    if (!fallback) return step; // no known safe fallback for this category — leave as-is rather than guess

    return {
      ...step,
      product: fallback.product,
      ingredients: fallback.ingredients,
      reason: `${step.reason} (Substituted for a fragrance-free/low-actives alternative because it conflicts with an ingredient you asked to avoid.)`,
    };
  });

  return { routine, excluded };
}

function filterWeeklyForAllergies(weeklyTreatments, allergyTerms) {
  if (!allergyTerms.length) return { treatments: weeklyTreatments, excluded: [] };

  const excluded = [];
  const treatments = weeklyTreatments.filter((t) => {
    const conflict = textConflicts([t.name, t.ingredients], allergyTerms);
    if (conflict) {
      excluded.push({ category: 'Weekly Treatment', original_product: t.name, matched_allergy: conflict });
      return false;
    }
    return true;
  });

  return { treatments, excluded };
}

// Builds the human-readable "Why this routine?" explanation lines shown on
// the dashboard, from the same inputs used to generate the routine.
function buildExplanation({ skinType, sortedConcerns, healthScore, allergyTerms, lifestyle, excludedCount }) {
  const lines = [];

  if (skinType) {
    lines.push(`Your routine is built around ${skinType.toLowerCase()} skin — product types and textures are chosen to suit that skin type.`);
  }

  if (sortedConcerns.length) {
    const top = sortedConcerns.slice(0, 3).map((c) => c.name).join(', ');
    lines.push(`Your latest assessment flagged ${top} as a priority, so targeted treatment steps address that first.`);
  }

  if (typeof healthScore === 'number') {
    if (healthScore < 40) {
      lines.push(`Your skin health score (${healthScore}/100) suggests your barrier could use extra support, so the routine leans toward gentler, repair-focused steps. This score is informational, not a medical diagnosis.`);
    } else if (healthScore < 70) {
      lines.push(`Your skin health score (${healthScore}/100) is a moderate baseline — the routine balances active treatment with hydration and barrier support. This score is informational, not a medical diagnosis.`);
    } else {
      lines.push(`Your skin health score (${healthScore}/100) is a strong baseline, so the routine focuses on maintenance and prevention. This score is informational, not a medical diagnosis.`);
    }
  }

  if (lifestyle) {
    if (lifestyle.outdoor_exposure === 'high') {
      lines.push('Because you spend a lot of time outdoors, sun protection and reapplication are emphasized.');
    }
    if (lifestyle.activity_level === 'high') {
      lines.push('With a high activity level, lightweight, non-clogging formulas are prioritized so the routine holds up through sweat.');
    }
    if (lifestyle.environment === 'dry') {
      lines.push('Your dry environment means richer hydration and barrier-support steps are included.');
    }
    if (lifestyle.environment === 'humid') {
      lines.push('In a humid environment, lighter, oil-free textures are prioritized to avoid feeling heavy or causing congestion.');
    }
    if (lifestyle.environment === 'urban_pollution') {
      lines.push('Given daily pollution exposure, antioxidant protection and thorough evening cleansing are emphasized.');
    }
  }

  if (allergyTerms.length) {
    lines.push(
      excludedCount > 0
        ? `${excludedCount} product${excludedCount === 1 ? '' : 's'} were swapped for fragrance-free/low-actives alternatives to respect the ingredients you asked to avoid (${allergyTerms.join(', ')}).`
        : `No routine steps conflicted with the ingredients you asked to avoid (${allergyTerms.join(', ')}).`
    );
  }

  lines.push('This routine is AI-assisted informational guidance, not a medical diagnosis or a guaranteed treatment outcome.');

  return lines;
}

/**
 * @param {object} params
 * @param {string} params.skinType
 * @param {Array<{name: string, priority?: number}>} params.concerns  — from the latest skin_reports row
 * @param {Date} [params.date]
 * @param {number} [params.healthScore] — 0-100 skin_health_score from the latest report
 * @param {string[]} [params.allergies] — free-text ingredients/products the user wants avoided
 * @param {object} [params.lifestyle] — { activity_level, outdoor_exposure, sleep_quality, environment }
 * @param {Array<{name:string}>} [params.recurringConcerns] — concerns seen across previous assessments, for context only
 * @returns {object} full plan including morning/evening/weekly/seasonal + excluded_ingredients + explanation
 */
function generatePlan({ skinType, concerns = [], date, healthScore, allergies = [], lifestyle = null, recurringConcerns = [] }) {
  // Apply highest-priority concern's adjustments last, so it wins any
  // step conflict (lower `priority` number = more important, matching
  // the convention used by aiAnalysis.js / the ML pipeline).
  const sortedConcerns = [...concerns].sort((a, b) => (b.priority || 99) - (a.priority || 99));

  const matchedAdjustments = sortedConcerns
    .map((c) => CONCERN_ADJUSTMENTS[matchConcernKey(c.name)])
    .filter(Boolean);

  let morning_routine = applyAdjustments(BASE_MORNING, matchedAdjustments, 'morning');
  let evening_routine = applyAdjustments(BASE_EVENING, matchedAdjustments, 'evening');

  let weekly_treatments = matchedAdjustments
    .map((a) => a.weekly)
    .filter(Boolean)
    // de-dupe by name
    .filter((w, i, arr) => arr.findIndex((x) => x.name === w.name) === i)
    .slice(0, 4);

  // Determine whether exfoliation belongs in the weekly plan, and at what
  // frequency — sensitive/reactive skin gets a gentler, less frequent
  // default rather than exfoliating on a fixed schedule regardless of
  // skin condition.
  const hasSensitivity = sortedConcerns.some((c) => /redness|irritation|sensit/i.test(c.name || '')) || skinType === 'Sensitive';
  const hasExfoliationAlready = weekly_treatments.some((w) => /exfoliat|aha|bha|peel/i.test(w.name));
  if (!hasExfoliationAlready) {
    if (hasSensitivity) {
      weekly_treatments.push({
        name: 'Gentle Enzyme Exfoliation',
        category: 'Exfoliation',
        frequency: 'Every 10-14 days',
        description: 'A mild, low-frequency option that supports cell turnover without over-stressing reactive skin.',
        ingredients: ['enzyme'],
      });
    } else {
      weekly_treatments.push({
        name: 'Gentle Weekly Exfoliation',
        category: 'Exfoliation',
        frequency: '1x / week',
        description: 'Maintains healthy cell turnover as part of a balanced maintenance routine.',
        ingredients: ['aha'],
      });
    }
  }

  // ---- Allergy / ingredient-avoidance filtering ----
  const allergyTerms = normalizeAllergies(allergies);
  const morningFiltered = filterForAllergies(morning_routine, allergyTerms);
  const eveningFiltered = filterForAllergies(evening_routine, allergyTerms);
  const weeklyFiltered = filterWeeklyForAllergies(weekly_treatments, allergyTerms);

  morning_routine = morningFiltered.routine;
  evening_routine = eveningFiltered.routine;
  weekly_treatments = weeklyFiltered.treatments;

  const excluded_ingredients = [...morningFiltered.excluded, ...eveningFiltered.excluded, ...weeklyFiltered.excluded];

  const season = getSeason(date);
  const seasonal_recommendations = SEASONAL_LIBRARY[season];

  const explanation = buildExplanation({
    skinType,
    sortedConcerns,
    healthScore,
    allergyTerms,
    lifestyle,
    excludedCount: excluded_ingredients.length,
  });

  if (recurringConcerns.length) {
    explanation.push(
      `${recurringConcerns.map((c) => c.name).join(', ')} showed up across more than one of your past assessments, so the routine keeps addressing it consistently rather than treating it as a one-off.`
    );
  }

  return {
    skin_type: skinType || null,
    season,
    morning_routine,
    evening_routine,
    weekly_treatments,
    seasonal_recommendations,
    excluded_ingredients,
    explanation,
  };
}

// Compares the concerns/score of the report a plan is newly based on against
// the previous report, so the UI can show "what changed" between
// assessments (e.g. "Acne severity: High -> Moderate"). Returns an array of
// short, human-readable change strings; empty if there's no previous report
// or nothing meaningfully changed.
function computeChanges(previousReport, currentReport) {
  if (!previousReport || !currentReport) return [];

  const changes = [];

  if (typeof previousReport.skin_health_score === 'number' && typeof currentReport.skin_health_score === 'number') {
    const diff = currentReport.skin_health_score - previousReport.skin_health_score;
    if (diff !== 0) {
      changes.push(
        `Skin health score ${diff > 0 ? 'improved' : 'decreased'} from ${previousReport.skin_health_score} to ${currentReport.skin_health_score} (${diff > 0 ? '+' : ''}${diff}).`
      );
    }
  }

  const prevByName = {};
  (previousReport.concerns || []).forEach((c) => { prevByName[(c.name || '').toLowerCase()] = c; });
  const currByName = {};
  (currentReport.concerns || []).forEach((c) => { currByName[(c.name || '').toLowerCase()] = c; });

  Object.keys(currByName).forEach((name) => {
    const prev = prevByName[name];
    const curr = currByName[name];
    if (!prev) {
      changes.push(`${curr.name} is a new concern in your latest assessment.`);
    } else if (prev.severity && curr.severity && prev.severity !== curr.severity) {
      changes.push(`${curr.name} severity: ${prev.severity} → ${curr.severity}.`);
    }
  });

  Object.keys(prevByName).forEach((name) => {
    if (!currByName[name]) {
      changes.push(`${prevByName[name].name} is no longer flagged as a concern — great progress.`);
    }
  });

  return changes;
}

module.exports = { generatePlan, getSeason, computeChanges };
