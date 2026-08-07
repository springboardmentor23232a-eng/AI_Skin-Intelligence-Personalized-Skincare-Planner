/**
 * Simulated AI Skin Analysis Engine.
 *
 * A real implementation would run a CV/ML model on the uploaded image.
 * Per the project brief, this is simulated with deterministic-but-varied
 * sample output shaped the way Module 3's Skin Assessment Engine expects:
 * a health score, prioritized concerns, risk factors, and recommendations.
 */

const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'];

const CONCERN_POOL = [
  { name: 'Acne', severity: 'Moderate', priority: 1 },
  { name: 'Dark Spots / Pigmentation', severity: 'Mild', priority: 2 },
  { name: 'Dryness / Flaking', severity: 'Mild', priority: 3 },
  { name: 'Fine Lines', severity: 'Low', priority: 4 },
  { name: 'Enlarged Pores', severity: 'Moderate', priority: 2 },
  { name: 'Redness / Irritation', severity: 'Mild', priority: 3 },
  { name: 'Uneven Skin Tone', severity: 'Low', priority: 4 },
  { name: 'Oiliness / Excess Sebum', severity: 'Moderate', priority: 2 },
];

const RISK_POOL = [
  { name: 'Sun Exposure', description: 'Signs consistent with UV-related damage over time.', risk_level: 'Medium' },
  { name: 'Dehydration', description: 'Skin barrier appears to need more hydration support.', risk_level: 'Low' },
  { name: 'Barrier Stress', description: 'Mild signs of a compromised skin barrier.', risk_level: 'Medium' },
  { name: 'Comedogenic Buildup', description: 'Pore congestion that could progress if untreated.', risk_level: 'Low' },
];

const RECOMMENDATION_LIBRARY = {
  Acne: [
    { title: 'Salicylic Acid Cleanser', description: 'Use a 2% BHA cleanser twice daily to reduce breakouts.', category: 'Cleanser' },
    { title: 'Non-comedogenic Moisturizer', description: 'Keep skin hydrated without clogging pores.', category: 'Moisturizer' },
  ],
  'Dark Spots / Pigmentation': [
    { title: 'Vitamin C Serum', description: 'Apply each morning to brighten and even skin tone.', category: 'Serum' },
    { title: 'Broad-Spectrum SPF 50', description: 'Daily sunscreen prevents further pigmentation.', category: 'Sunscreen' },
  ],
  'Dryness / Flaking': [
    { title: 'Hyaluronic Acid Serum', description: 'Layer under moisturizer for deep hydration.', category: 'Serum' },
    { title: 'Ceramide Moisturizer', description: 'Rebuilds the skin barrier and locks in moisture.', category: 'Moisturizer' },
  ],
  'Fine Lines': [
    { title: 'Retinol (Night)', description: 'Start 2-3x per week to support collagen renewal.', category: 'Treatment' },
  ],
  'Enlarged Pores': [
    { title: 'Niacinamide Serum', description: 'Regulates oil production and visibly refines pores.', category: 'Serum' },
  ],
  'Redness / Irritation': [
    { title: 'Centella Asiatica Cream', description: 'Soothes and calms sensitive, irritated skin.', category: 'Treatment' },
  ],
  'Uneven Skin Tone': [
    { title: 'Gentle Exfoliation (AHA)', description: 'Use 1-2x per week to promote even texture.', category: 'Exfoliant' },
  ],
  'Oiliness / Excess Sebum': [
    { title: 'Oil-Free Gel Moisturizer', description: 'Lightweight hydration that won\u2019t add excess shine.', category: 'Moisturizer' },
  ],
};

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function computeHealthScore(concerns, riskFactors) {
  let score = 100;
  concerns.forEach((c) => {
    score -= c.severity === 'Moderate' ? 8 : c.severity === 'Low' ? 3 : 5;
  });
  riskFactors.forEach((r) => {
    score -= r.risk_level === 'Medium' ? 4 : 2;
  });
  return Math.max(35, Math.min(98, Math.round(score)));
}

function overallCondition(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Fair';
  return 'Needs Attention';
}

/**
 * Runs the simulated analysis for a freshly uploaded image.
 * @returns {object} structured analysis result ready to persist.
 */
function analyzeSkin() {
  const skinType = SKIN_TYPES[Math.floor(Math.random() * SKIN_TYPES.length)];
  const concerns = pickRandom(CONCERN_POOL, 2 + Math.floor(Math.random() * 2)) // 2-3 concerns
    .sort((a, b) => a.priority - b.priority);
  const riskFactors = pickRandom(RISK_POOL, 1 + Math.floor(Math.random() * 2)); // 1-2 risks

  const recommendations = concerns
    .flatMap((c) => RECOMMENDATION_LIBRARY[c.name] || [])
    .slice(0, 5);

  const skin_health_score = computeHealthScore(concerns, riskFactors);

  return {
    skin_type: skinType,
    skin_health_score,
    overall_condition: overallCondition(skin_health_score),
    concerns,
    risk_factors: riskFactors,
    recommendations,
  };
}

module.exports = { analyzeSkin };
