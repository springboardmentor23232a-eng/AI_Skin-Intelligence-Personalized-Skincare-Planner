/* ==================== GLOWSENSE AI — MODULE 7: SKIN HEALTH SCORING ENGINE ==================== */
/*
 * Produces a transparent, weighted 0-100 "Skin Health Score" from five
 * components, each normalized to 0-100 from REAL data already captured by
 * the app (assessment form/concerns, user_profiles lifestyle fields, and
 * Module 4 routine/feedback records). No fields are invented — a component
 * that has no underlying data is treated as unavailable (see
 * `handleMissing` below) rather than guessed.
 *
 * WEIGHTS (must total exactly 1.00):
 *   Skin Condition Assessment ... 0.35
 *   Lifestyle Habits ............ 0.20
 *   Sleep Quality ................ 0.15
 *   Routine Consistency ......... 0.20
 *   Hydration Level .............. 0.10
 *   ---------------------------------
 *                                  1.00
 */

import { dataAPI, authAPI } from './api.js';

export const WEIGHTS = {
  skinCondition: 0.35,
  lifestyle: 0.20,
  sleep: 0.15,
  routineConsistency: 0.20,
  hydration: 0.10,
};

// Sanity check the weights sum to 1.00 (100%) — this runs once at module
// load time so a future edit that breaks the total fails loudly in the
// console instead of silently mis-weighting every user's score.
(function assertWeightsSumToOne() {
  const total = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
  if (Math.abs(total - 1) > 0.0001) {
    console.error(`[Module 7] Skin Health Score weights must total 1.00 (100%). Current total: ${total}`);
  }
})();

function clamp(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/* ==================== 1. SKIN CONDITION ASSESSMENT (35%) ==================== */
/*
 * Three-tier fallback, using only real stored data, from most to least
 * granular:
 *   1) Raw 1-5 concern sliders from the assessment's form_data (form
 *      assessments only) — normalized as (5 - value) / 4 * 100 per factor,
 *      i.e. 1 ("no issue") -> 100, 5 ("severe") -> 0. Averaged across
 *      whichever sliders are actually present.
 *   2) If no sliders exist (e.g. webcam assessments), fall back to the
 *      stored `assessment_concerns` severity ratings: start at 100 and
 *      deduct per concern based on severity (Low/Moderate/High/Severe).
 *   3) If neither exists, fall back to the assessment's own
 *      `skin_health_score` (already 0-100) as a last resort — noted as
 *      lower-granularity since it also reflects lifestyle factors.
 * Never fabricates a value if none of the above exist.
 */
const CONDITION_SLIDER_KEYS = ['oiliness', 'dryness', 'acne_frequency', 'pigmentation', 'dark_spots', 'redness', 'uneven_tone', 'fine_lines', 'visible_pores'];
const SEVERITY_DEDUCTION = { Low: 5, Moderate: 12, High: 20, Severe: 30 };

export function computeSkinConditionScore(assessment, concerns) {
  if (!assessment) return { score: null, source: 'unavailable', notes: 'No assessment on record.' };

  // Tier 1: raw sliders from form_data
  const formData = assessment.form_data || {};
  const presentSliders = CONDITION_SLIDER_KEYS.filter(k => formData[k] !== undefined && formData[k] !== null && formData[k] !== '');
  if (presentSliders.length > 0) {
    const normalized = presentSliders.map(k => {
      const v = Math.max(1, Math.min(5, Number(formData[k]) || 3));
      return (5 - v) / 4 * 100;
    });
    const avg = normalized.reduce((a, b) => a + b, 0) / normalized.length;
    return { score: clamp(avg), source: 'assessment_sliders', notes: `Based on ${presentSliders.length} skin-condition factors from your questionnaire.` };
  }

  // Tier 2: assessment_concerns severities
  if (concerns && concerns.length > 0) {
    let score = 100;
    concerns.forEach(c => { score -= SEVERITY_DEDUCTION[c.severity] ?? 10; });
    return { score: clamp(score), source: 'concern_severity', notes: `Based on ${concerns.length} detected concern(s) and their severity.` };
  }

  // Tier 3: fall back to the assessment's own overall score
  if (assessment.skin_health_score != null) {
    return { score: clamp(assessment.skin_health_score), source: 'assessment_overall_score', notes: 'No detailed concern data available — based on your assessment\'s overall score.' };
  }

  return { score: null, source: 'unavailable', notes: 'No skin condition data available for this assessment.' };
}

/* ==================== 2. LIFESTYLE HABITS (20%) ==================== */
/*
 * Averages normalized 0-100 values from whichever of the following real
 * `user_profiles` fields are actually set: stress_level, exercise_frequency,
 * smoking, alcohol, sun_exposure, pollution_exposure, sunscreen_usage.
 * Sleep and water intake are scored separately (their own 15%/10%
 * components) and intentionally excluded here to avoid double-counting.
 * A field left blank by the user is skipped entirely — never assumed good
 * or bad.
 */
const STRESS_MAP = { Low: 100, Moderate: 65, High: 30 };
const EXERCISE_MAP = { Never: 20, '1-2 times/week': 50, '3-4 times/week': 80, Daily: 100 };
const SMOKING_MAP = { No: 100, Occasionally: 55, Regularly: 15 };
const ALCOHOL_MAP = { Never: 100, Occasionally: 70, Regularly: 35 };
const EXPOSURE_MAP = { Low: 100, Moderate: 65, High: 30 };
const SUNSCREEN_MAP = { Daily: 100, Sometimes: 65, Rarely: 35, Never: 10 };

export function computeLifestyleScore(profile) {
  if (!profile) return { score: null, factorsUsed: 0, notes: 'No lifestyle profile data on record.' };

  const factors = [];
  if (profile.stress_level && STRESS_MAP[profile.stress_level] != null) factors.push(STRESS_MAP[profile.stress_level]);
  if (profile.exercise_frequency && EXERCISE_MAP[profile.exercise_frequency] != null) factors.push(EXERCISE_MAP[profile.exercise_frequency]);
  if (profile.smoking && SMOKING_MAP[profile.smoking] != null) factors.push(SMOKING_MAP[profile.smoking]);
  if (profile.alcohol && ALCOHOL_MAP[profile.alcohol] != null) factors.push(ALCOHOL_MAP[profile.alcohol]);
  if (profile.sun_exposure && EXPOSURE_MAP[profile.sun_exposure] != null) factors.push(EXPOSURE_MAP[profile.sun_exposure]);
  if (profile.pollution_exposure && EXPOSURE_MAP[profile.pollution_exposure] != null) factors.push(EXPOSURE_MAP[profile.pollution_exposure]);
  if (profile.sunscreen_usage && SUNSCREEN_MAP[profile.sunscreen_usage] != null) factors.push(SUNSCREEN_MAP[profile.sunscreen_usage]);

  if (factors.length === 0) return { score: null, factorsUsed: 0, notes: 'No lifestyle profile fields have been filled in yet.' };

  const avg = factors.reduce((a, b) => a + b, 0) / factors.length;
  return { score: clamp(avg), factorsUsed: factors.length, notes: `Based on ${factors.length} of 7 lifestyle factors you've provided.` };
}

/* ==================== 3. SLEEP QUALITY (15%) ==================== */
const SLEEP_MAP = {
  'less than 5 hours': 25,
  '5-6 hours': 55,
  '6-7 hours': 78,
  '7-8 hours': 100,
  '8+ hours': 95,
};

export function computeSleepScore(profile) {
  const val = profile?.sleep_duration;
  if (!val || SLEEP_MAP[val] == null) return { score: null, notes: 'No sleep duration on record.' };
  return { score: clamp(SLEEP_MAP[val]), notes: `Based on your reported sleep duration (${val}).` };
}

/* ==================== 4. ROUTINE CONSISTENCY (20%) ==================== */
/*
 * Uses only real, already-stored Module 4 data — never a random or
 * fabricated adherence figure:
 *   - Whether the user has an active routine at all.
 *   - Recency of their most recent routine_feedback submission (a proxy for
 *     ongoing engagement with the routine).
 *   - Submission frequency: feedback entries per week since the routine
 *     started (a proxy for sustained, repeated use).
 * If the user has no routine yet, the component is reported as unavailable
 * rather than scored.
 */
function daysBetween(a, b) {
  return Math.max(0, (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function computeRoutineConsistencyScore(routines, feedbackList) {
  if (!routines || routines.length === 0) {
    return { score: null, notes: 'No routine has been generated yet — start a routine to build consistency tracking.' };
  }

  const oldestRoutine = [...routines].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];
  const now = new Date();
  const routineAgeDays = daysBetween(new Date(oldestRoutine.created_at), now);

  if (!feedbackList || feedbackList.length === 0) {
    // A routine exists but no feedback has been logged yet — use a neutral
    // baseline reflecting "just started, no adherence signal yet" rather
    // than inventing a number.
    return { score: 50, notes: 'Routine started, but no feedback submitted yet — this is a neutral starting estimate.' };
  }

  const sortedFeedback = [...feedbackList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const daysSinceLastFeedback = daysBetween(new Date(sortedFeedback[0].created_at), now);

  let recencyScore;
  if (daysSinceLastFeedback <= 3) recencyScore = 100;
  else if (daysSinceLastFeedback <= 7) recencyScore = 85;
  else if (daysSinceLastFeedback <= 14) recencyScore = 65;
  else if (daysSinceLastFeedback <= 30) recencyScore = 40;
  else recencyScore = 20;

  const weeksActive = Math.max(1, routineAgeDays / 7);
  const feedbackPerWeek = feedbackList.length / weeksActive;
  // ~1 feedback submission per week is treated as fully consistent engagement.
  const frequencyScore = clamp(Math.min(feedbackPerWeek, 1) * 100);

  const score = clamp((recencyScore * 0.5) + (frequencyScore * 0.5));
  return {
    score,
    notes: `Based on ${feedbackList.length} feedback submission(s) over ${Math.round(routineAgeDays)} day(s), most recently ${Math.round(daysSinceLastFeedback)} day(s) ago.`,
  };
}

/* ==================== 5. HYDRATION LEVEL (10%) ==================== */
const HYDRATION_MAP = {
  '0-2 glasses': 25,
  '3-4 glasses': 55,
  '5-6 glasses': 80,
  '7+ glasses': 100,
};

export function computeHydrationScore(profile) {
  const val = profile?.water_intake;
  if (!val || HYDRATION_MAP[val] == null) return { score: null, notes: 'No water intake data on record.' };
  return { score: clamp(HYDRATION_MAP[val]), notes: `Based on your reported daily water intake (${val}).` };
}

/* ==================== OVERALL WEIGHTED SCORE ==================== */
/*
 * Missing-data handling: any component with no underlying data (score ===
 * null) is substituted with a neutral 50 ONLY for the purposes of the
 * weighted formula (so the fixed weights below always apply and the result
 * is never NaN), but the UI is told which components were estimated this
 * way via `estimated: true` so it can be shown transparently rather than
 * presented as a fully confident personalized number.
 */
export function computeOverallScore(components) {
  const resolved = {};
  const estimated = {};
  for (const key of Object.keys(WEIGHTS)) {
    const raw = components[key]?.score;
    if (raw == null) {
      resolved[key] = 50; // neutral default — does not favor a better or worse score
      estimated[key] = true;
    } else {
      resolved[key] = clamp(raw);
      estimated[key] = false;
    }
  }

  const overall =
    resolved.skinCondition * WEIGHTS.skinCondition +
    resolved.lifestyle * WEIGHTS.lifestyle +
    resolved.sleep * WEIGHTS.sleep +
    resolved.routineConsistency * WEIGHTS.routineConsistency +
    resolved.hydration * WEIGHTS.hydration;

  return { overall: clamp(overall), resolved, estimated };
}

export function interpretScore(score) {
  if (score == null) return { label: 'Unavailable', color: 'var(--color-text-tertiary)' };
  if (score >= 90) return { label: 'Excellent', color: 'var(--color-success)' };
  if (score >= 75) return { label: 'Good', color: 'var(--color-accent-dark)' };
  if (score >= 60) return { label: 'Fair', color: 'var(--color-warning)' };
  return { label: 'Needs Attention', color: 'var(--color-error)' };
}

/* ==================== ORCHESTRATION: CALCULATE + STORE ==================== */
/*
 * Pulls the real, already-stored records needed for all five components,
 * computes the weighted overall score, and persists a new history row.
 * Called after a new assessment is completed and after routine feedback is
 * submitted (see assessment.js / webcam.js / routines.js), and on-demand
 * when the dashboard loads.
 */
export async function calculateAndStoreSkinHealthScore(userId) {
  const [assessments, profile, routines, feedbackList] = await Promise.all([
    dataAPI.getAssessments(userId),
    dataAPI.getUserProfile(userId),
    dataAPI.getRoutines(userId),
    dataAPI.getFeedback(userId),
  ]);

  const latestAssessment = assessments && assessments[0];
  const concerns = latestAssessment ? await dataAPI.getConcerns(latestAssessment.id) : [];

  const components = {
    skinCondition: computeSkinConditionScore(latestAssessment, concerns),
    lifestyle: computeLifestyleScore(profile),
    sleep: computeSleepScore(profile),
    routineConsistency: computeRoutineConsistencyScore(routines, feedbackList),
    hydration: computeHydrationScore(profile),
  };

  const { overall, resolved, estimated } = computeOverallScore(components);

  const record = {
    user_id: userId,
    assessment_id: latestAssessment ? latestAssessment.id : null,
    skin_condition_score: components.skinCondition.score,
    lifestyle_score: components.lifestyle.score,
    sleep_score: components.sleep.score,
    routine_consistency_score: components.routineConsistency.score,
    hydration_score: components.hydration.score,
    overall_score: overall,
  };

  const saved = await dataAPI.createSkinHealthScore(record);

  return { record: saved, components, resolved, estimated, overall };
}

/* ==================== TREND ==================== */
/*
 * Compares the latest stored score against the immediately previous stored
 * score for this user. Only ever uses real, previously-saved rows — never
 * a fabricated "previous" value.
 */
export function computeTrend(history) {
  if (!history || history.length < 2) return null;
  const [latest, previous] = history; // history is sorted score_date desc
  const diff = latest.overall_score - previous.overall_score;
  let direction = 'stable';
  if (diff > 2) direction = 'improving';
  else if (diff < -2) direction = 'declining';
  return { diff, direction, previousScore: previous.overall_score, latestScore: latest.overall_score };
}

/* ==================== UI RENDERING ==================== */

const COMPONENT_META = [
  { key: 'skin_condition_score', label: 'Skin Condition', weightLabel: '35%' },
  { key: 'lifestyle_score', label: 'Lifestyle Habits', weightLabel: '20%' },
  { key: 'sleep_score', label: 'Sleep Quality', weightLabel: '15%' },
  { key: 'routine_consistency_score', label: 'Routine Consistency', weightLabel: '20%' },
  { key: 'hydration_score', label: 'Hydration Level', weightLabel: '10%' },
];

function barColor(score) {
  if (score == null) return 'var(--color-border)';
  if (score >= 75) return 'var(--color-success)';
  if (score >= 60) return 'var(--color-warning)';
  return 'var(--color-error)';
}

export function renderScoreBreakdown(container, { record, trend }) {
  if (!container) return;

  if (!record) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-title">No Skin Health Score yet</div>
        <div class="empty-state-text">Complete an assessment to generate your first Skin Health Score.</div>
        <a href="/user/assessment.html" class="btn btn-primary">Start Assessment</a>
      </div>`;
    return;
  }

  const interp = interpretScore(record.overall_score);

  const trendHtml = trend
    ? `<div class="shs-trend" style="color:${trend.direction === 'improving' ? 'var(--color-success)' : trend.direction === 'declining' ? 'var(--color-error)' : 'var(--color-text-secondary)'};">
        ${trend.direction === 'improving' ? '▲' : trend.direction === 'declining' ? '▼' : '—'}
        ${trend.diff > 0 ? '+' : ''}${trend.diff} point${Math.abs(trend.diff) === 1 ? '' : 's'} since your previous assessment (${trend.direction}).
      </div>`
    : `<div class="shs-trend" style="color:var(--color-text-tertiary);">No previous assessment available for comparison.</div>`;

  const rowsHtml = COMPONENT_META.map(meta => {
    const score = record[meta.key];
    return `
      <div class="shs-row">
        <div class="shs-row-label">
          <span>${meta.label}</span>
          <span class="shs-row-weight">${meta.weightLabel}</span>
        </div>
        <div class="shs-bar-track">
          <div class="shs-bar-fill" style="width:${score ?? 0}%;background:${barColor(score)};"></div>
        </div>
        <div class="shs-row-score">${score != null ? `${score}/100` : 'N/A'}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="shs-wrap">
      <div class="shs-ring-col">
        <div class="score-ring-large" style="background:conic-gradient(${interp.color} ${record.overall_score}%, var(--color-border-light) 0);">
          <div class="score-ring-large-inner">
            <span class="score-number" style="color:${interp.color};">${record.overall_score}</span>
            <span class="score-max">/100</span>
          </div>
        </div>
        <span class="badge" style="background:${interp.color}22;color:${interp.color};margin-top:0.5rem;">${interp.label}</span>
        ${trendHtml}
      </div>
      <div class="shs-rows-col">
        ${rowsHtml}
      </div>
    </div>
    <p class="shs-disclaimer">Skin Health Score is an informational wellness metric based on your provided data. It is not a medical diagnosis, a clinical score, or a disease prediction.</p>
  `;
}

/* ==================== PAGE ENTRY POINT ==================== */
export async function initSkinHealthScore(containerId = 'skinHealthScoreRoot') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const auth = await authAPI.getCurrentUser();
  if (!auth) return;

  try {
    // Refresh the score so the dashboard always reflects the latest
    // assessment/routine data, then read back the stored history for trend.
    await calculateAndStoreSkinHealthScore(auth.user.id);
    const history = await dataAPI.getSkinHealthScores(auth.user.id);
    const trend = computeTrend(history);
    renderScoreBreakdown(container, { record: history[0] || null, trend });
  } catch (err) {
    container.innerHTML = `<p style="color:var(--color-text-secondary);font-size:var(--fs-sm);">Unable to load your Skin Health Score right now.</p>`;
  }
}
