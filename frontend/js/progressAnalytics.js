/* ==================== GLOWSENSE AI — MODULE 8 PROGRESS ANALYTICS ==================== */
/* Pure computation helpers shared by the user Progress page and the
   Consultant/Dermatologist/Admin dashboards. Every function here operates
   only on data already fetched from Supabase (skin_assessments,
   assessment_concerns, skin_health_scores, routine_completions) — nothing
   in this file invents or estimates a value. When there isn't enough real
   data to compute something, functions return null/empty so the caller can
   render the required empty state instead of a fabricated chart. */

export const DATE_RANGES = [
  { key: '7d', label: '7 Days', days: 7 },
  { key: '30d', label: '30 Days', days: 30 },
  { key: '3m', label: '3 Months', days: 90 },
  { key: '6m', label: '6 Months', days: 180 },
  { key: 'all', label: 'All Time', days: null },
];

const SEVERITY_RANK = { Low: 1, Moderate: 2, High: 3, Severe: 4 };

export function toDateOnly(d) {
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().slice(0, 10);
}

export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

/** Filters a list of records (sorted or not) to a date range key from DATE_RANGES. */
export function filterByRange(items, dateField, rangeKey) {
  const range = DATE_RANGES.find(r => r.key === rangeKey) || DATE_RANGES[DATE_RANGES.length - 1];
  if (!range.days) return [...(items || [])];
  const cutoff = daysAgo(range.days);
  return (items || []).filter(item => new Date(item[dateField]) >= cutoff);
}

/**
 * Compares concern severity between the previous and latest assessment.
 * Returns one row per concern name seen in either assessment.
 * status: 'improved' | 'worsened' | 'stable' | 'resolved' | 'new'
 */
export function computeConcernChanges(previousConcerns, latestConcerns) {
  const prevMap = new Map((previousConcerns || []).map(c => [c.concern_name, c.severity]));
  const latestMap = new Map((latestConcerns || []).map(c => [c.concern_name, c.severity]));
  const allNames = new Set([...prevMap.keys(), ...latestMap.keys()]);

  const rows = [];
  allNames.forEach(name => {
    const prevSeverity = prevMap.get(name) || null;
    const latestSeverity = latestMap.get(name) || null;
    let status;
    if (prevSeverity && !latestSeverity) status = 'resolved';
    else if (!prevSeverity && latestSeverity) status = 'new';
    else {
      const prevRank = SEVERITY_RANK[prevSeverity] || 0;
      const latestRank = SEVERITY_RANK[latestSeverity] || 0;
      if (latestRank < prevRank) status = 'improved';
      else if (latestRank > prevRank) status = 'worsened';
      else status = 'stable';
    }
    rows.push({ concern: name, previousSeverity: prevSeverity, latestSeverity, status });
  });

  // Most actionable first: worsened/new, then stable, then improved/resolved.
  const order = { worsened: 0, new: 1, stable: 2, improved: 3, resolved: 4 };
  return rows.sort((a, b) => (order[a.status] ?? 5) - (order[b.status] ?? 5));
}

/**
 * Compares the two most recent real assessments. Returns null if there
 * isn't yet a previous assessment to compare against (caller should show
 * the "complete another assessment" empty state in that case).
 */
export function computeImprovementAnalysis(previous, previousConcerns, latest, latestConcerns) {
  if (!previous || !latest) return null;

  const previousScore = typeof previous.skin_health_score === 'number' ? previous.skin_health_score : null;
  const latestScore = typeof latest.skin_health_score === 'number' ? latest.skin_health_score : null;
  const scoreChange = (previousScore !== null && latestScore !== null) ? latestScore - previousScore : null;

  const concernChanges = computeConcernChanges(previousConcerns, latestConcerns);
  const worsenedOrNew = concernChanges.filter(c => c.status === 'worsened' || c.status === 'new').length;
  const improvedOrResolved = concernChanges.filter(c => c.status === 'improved' || c.status === 'resolved').length;

  let overallStatus;
  if (scoreChange !== null && scoreChange > 2) overallStatus = 'improved';
  else if (scoreChange !== null && scoreChange < -2) overallStatus = 'needs_attention';
  else if (scoreChange === null) {
    // No score on one side — fall back to concern-count comparison.
    if (improvedOrResolved > worsenedOrNew) overallStatus = 'improved';
    else if (worsenedOrNew > improvedOrResolved) overallStatus = 'needs_attention';
    else overallStatus = 'stable';
  } else {
    overallStatus = 'stable';
  }

  return {
    previousDate: previous.assessment_date || previous.created_at,
    currentDate: latest.assessment_date || latest.created_at,
    previousScore,
    currentScore: latestScore,
    scoreChange,
    overallStatus,
    concernChanges,
  };
}

/**
 * Adherence % for a set of routine_completions against the total number of
 * checklist steps in the current routine (morning + evening step counts).
 * Assumption (documented): the current routine's step count is used as the
 * denominator for every day in range, since individual historical routine
 * versions per day aren't tracked. If totalSteps is 0, returns null.
 */
export function computeAdherence(completions, totalSteps) {
  if (!totalSteps) return null;
  const byDate = new Map();
  (completions || []).forEach(c => {
    if (!c.completed) return;
    const key = c.completion_date;
    byDate.set(key, (byDate.get(key) || 0) + 1);
  });

  const dailySeries = [...byDate.entries()]
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([date, count]) => ({ date, percent: Math.min(100, Math.round((count / totalSteps) * 100)) }));

  if (dailySeries.length === 0) return { dailySeries: [], averagePercent: 0, daysTracked: 0 };

  const averagePercent = Math.round(
    dailySeries.reduce((sum, d) => sum + d.percent, 0) / dailySeries.length
  );

  return { dailySeries, averagePercent, daysTracked: dailySeries.length };
}

/** Builds a { date, value } series from skin_health_scores rows for a given numeric field. */
export function buildScoreTrend(scores, field, rangeKey) {
  const filtered = filterByRange(scores, 'score_date', rangeKey)
    .filter(s => typeof s[field] === 'number')
    .sort((a, b) => new Date(a.score_date) - new Date(b.score_date));
  return filtered.map(s => ({ date: s.score_date, value: s[field] }));
}

/** Builds a { date, value } series tracking one named concern's severity (as a 1-4 rank) across assessments. */
export function buildConcernTrend(assessmentsWithConcerns, concernName, rangeKey) {
  const filtered = filterByRange(assessmentsWithConcerns, 'assessment_date', rangeKey)
    .sort((a, b) => new Date(a.assessment_date) - new Date(b.assessment_date));
  return filtered
    .map(a => {
      const match = (a.concerns || []).find(c => c.concern_name === concernName);
      return match ? { date: a.assessment_date, value: SEVERITY_RANK[match.severity] || null } : null;
    })
    .filter(Boolean);
}
