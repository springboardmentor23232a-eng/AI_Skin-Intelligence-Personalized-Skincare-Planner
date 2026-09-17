/* ==================== GLOWSENSE AI — MODULE 8: PROGRESS TRACKING & ANALYTICS ==================== */
/* User-facing Progress page: skin progress monitoring, routine adherence,
   improvement analysis, assessment-based before/after comparison, and
   trend charts with date-range filters. Every number here is computed from
   real Supabase data already used elsewhere in the app (skin_assessments,
   assessment_concerns, skin_health_scores, routine_completions) — nothing
   is fabricated, and every section has its own empty state when there
   isn't enough history yet. */

import { dataAPI, authAPI } from './api.js';
import { initDashboard, showToast, formatDate, renderLineChart } from './common.js';
import {
  DATE_RANGES, filterByRange, toDateOnly, daysAgo,
  computeConcernChanges, computeImprovementAnalysis, computeAdherence,
  buildScoreTrend, buildConcernTrend,
} from './progressAnalytics.js';

let state = {
  userId: null,
  assessments: [],          // newest first, each augmented with .concerns
  skinHealthScores: [],
  routine: null,
  completions: [],          // all-time routine_completions for this user
  activeRange: '30d',
};

export async function initUserProgress() {
  const auth = await initDashboard('user', 'progress');
  if (!auth) return;
  state.userId = auth.user.id;
  await loadAll();
}

async function loadAll() {
  const root = document.getElementById('progressRoot');
  if (!root) return;

  try {
    const assessments = await dataAPI.getAssessments(state.userId);

    if (!assessments || assessments.length === 0) {
      renderNoAssessmentsState(root);
      return;
    }

    // Attach concerns to each assessment so trend/monitoring sections can
    // read severity history without refetching per section.
    state.assessments = await Promise.all(assessments.map(async a => ({
      ...a,
      concerns: await dataAPI.getConcerns(a.id).catch(() => []),
    })));

    state.skinHealthScores = await dataAPI.getSkinHealthScores(state.userId).catch(() => []);
    state.routine = await dataAPI.getLatestRoutine(state.userId).catch(() => null);

    const today = toDateOnly(new Date());
    const farPast = '2000-01-01';
    state.completions = state.routine
      ? await dataAPI.getRoutineCompletionsRange(state.userId, farPast, today).catch(() => [])
      : [];

    renderShell(root);
    renderRangeSelector();
    renderSkinProgressMonitoring();
    renderImprovementAnalysis();
    renderBeforeAfter();
    renderAdherenceSummary();
    renderTrendCharts();
  } catch (err) {
    root.innerHTML = `<div class="alert alert-error">Unable to load progress data right now. Please try again later.</div>`;
  }
}

function renderNoAssessmentsState(root) {
  root.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M4 20l5-5 4 4 8-8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 11h6v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="empty-state-title">No progress data available yet</div>
      <div class="empty-state-text">Complete another assessment to start tracking your progress.</div>
      <a href="/user/assessment.html" class="btn btn-primary">Start Assessment</a>
    </div>`;
}

function renderShell(root) {
  root.innerHTML = `
    <div class="card" style="margin-bottom:1rem;">
      <div class="card-header">
        <h3 class="card-title">Skin Progress Monitoring</h3>
      </div>
      <div id="progressMonitoring"></div>
    </div>

    <div class="card" style="margin-bottom:1rem;">
      <div class="card-header">
        <h3 class="card-title">Improvement Analysis</h3>
      </div>
      <div id="improvementAnalysis"></div>
    </div>

    <div class="card" style="margin-bottom:1rem;">
      <div class="card-header">
        <h3 class="card-title">Before / After Comparison</h3>
      </div>
      <div id="beforeAfter"></div>
    </div>

    <div class="card" style="margin-bottom:1rem;">
      <div class="card-header">
        <h3 class="card-title">Routine Adherence</h3>
      </div>
      <div id="adherenceSummary"></div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Trends</h3>
        <div id="rangeSelector" class="chip-row"></div>
      </div>
      <div id="trendCharts"></div>
    </div>
  `;
}

function renderRangeSelector() {
  const el = document.getElementById('rangeSelector');
  if (!el) return;
  el.innerHTML = DATE_RANGES.map(r => `
    <button type="button" class="chip ${state.activeRange === r.key ? 'active' : ''}" data-range="${r.key}">${r.label}</button>
  `).join('');
  el.querySelectorAll('[data-range]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeRange = btn.dataset.range;
      renderRangeSelector();
      renderTrendCharts();
    });
  });
}

/* ---- 1. Skin Progress Monitoring ---- */
function renderSkinProgressMonitoring() {
  const el = document.getElementById('progressMonitoring');
  if (!el) return;

  const latest = state.assessments[0];
  const previous = state.assessments[1];

  if (!previous) {
    el.innerHTML = `
      <p style="color:var(--color-text-secondary);font-size:var(--fs-sm);margin-bottom:0.75rem;">
        This is your first assessment on record (${formatDate(latest.assessment_date)}). Complete another assessment to start comparing progress over time.
      </p>
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
        ${(latest.concerns || []).map(c => `<span class="badge ${severityBadgeClass(c.severity)}">${c.concern_name}: ${c.severity}</span>`).join('') || '<span style="color:var(--color-text-tertiary);font-size:var(--fs-sm);">No concerns recorded.</span>'}
      </div>`;
    return;
  }

  const changes = computeConcernChanges(previous.concerns, latest.concerns);

  el.innerHTML = `
    <div style="display:flex;gap:2rem;margin-bottom:1rem;flex-wrap:wrap;">
      <div><div style="font-size:var(--fs-xs);color:var(--color-text-tertiary);">Previous Assessment</div><div style="font-weight:600;">${formatDate(previous.assessment_date)}</div></div>
      <div><div style="font-size:var(--fs-xs);color:var(--color-text-tertiary);">Current Assessment</div><div style="font-weight:600;">${formatDate(latest.assessment_date)}</div></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:0.5rem;">
      ${changes.map(c => `
        <div style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0.75rem;border:1px solid var(--color-border);border-radius:8px;">
          <span style="font-weight:600;font-size:var(--fs-sm);flex:1;">${c.concern}</span>
          <span style="font-size:var(--fs-xs);color:var(--color-text-tertiary);">${c.previousSeverity || '—'} &rarr; ${c.latestSeverity || '—'}</span>
          <span class="badge ${concernStatusBadge(c.status)}">${concernStatusLabel(c.status)}</span>
        </div>`).join('')}
    </div>`;
}

/* ---- 3. Improvement Analysis ---- */
function renderImprovementAnalysis() {
  const el = document.getElementById('improvementAnalysis');
  if (!el) return;

  const latest = state.assessments[0];
  const previous = state.assessments[1];
  const analysis = computeImprovementAnalysis(previous, previous?.concerns, latest, latest?.concerns);

  if (!analysis) {
    el.innerHTML = `<p style="color:var(--color-text-tertiary);font-size:var(--fs-sm);">No progress data available yet. Complete another assessment to start tracking your progress.</p>`;
    return;
  }

  const overallLabels = { improved: 'Improved', needs_attention: 'Needs Attention', stable: 'Stable' };
  const overallColors = { improved: 'badge-success', needs_attention: 'badge-error', stable: 'badge-neutral' };
  const changeText = analysis.scoreChange === null ? 'N/A' : (analysis.scoreChange > 0 ? `+${analysis.scoreChange}` : `${analysis.scoreChange}`);

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:1.5rem;margin-bottom:1rem;flex-wrap:wrap;">
      <div><div style="font-size:var(--fs-xs);color:var(--color-text-tertiary);">Previous Score</div><div style="font-size:var(--fs-2xl);font-weight:700;">${analysis.previousScore ?? 'N/A'}</div></div>
      <div style="font-size:var(--fs-xl);color:var(--color-text-tertiary);">&rarr;</div>
      <div><div style="font-size:var(--fs-xs);color:var(--color-text-tertiary);">Current Score</div><div style="font-size:var(--fs-2xl);font-weight:700;">${analysis.currentScore ?? 'N/A'}</div></div>
      <div><div style="font-size:var(--fs-xs);color:var(--color-text-tertiary);">Change</div><div style="font-size:var(--fs-xl);font-weight:700;">${changeText}</div></div>
      <span class="badge ${overallColors[analysis.overallStatus] || 'badge-neutral'}" style="margin-left:auto;">${overallLabels[analysis.overallStatus] || analysis.overallStatus}</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:0.5rem;">
      ${analysis.concernChanges.map(c => `
        <div style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0.75rem;border:1px solid var(--color-border);border-radius:8px;">
          <span style="font-weight:600;font-size:var(--fs-sm);flex:1;">${c.concern}</span>
          <span class="badge ${concernStatusBadge(c.status)}">${concernStatusLabel(c.status)}</span>
        </div>`).join('') || '<p style="color:var(--color-text-tertiary);font-size:var(--fs-sm);">No concerns recorded in either assessment.</p>'}
    </div>`;
}

/* ---- 4. Before / After Comparison ---- */
function renderBeforeAfter() {
  const el = document.getElementById('beforeAfter');
  if (!el) return;

  const latest = state.assessments[0];
  const previous = state.assessments[1];

  if (!previous) {
    el.innerHTML = `<p style="color:var(--color-text-tertiary);font-size:var(--fs-sm);">No progress data available yet. Complete another assessment to start tracking your progress.</p>`;
    return;
  }

  // GlowSenseAI does not persist skin photos anywhere in the current
  // schema/storage (webcam captures are analyzed in-session only), so this
  // is an assessment/score-based comparison rather than a photo comparison
  // — per Module 8 requirements, no photo is fabricated.
  const analysis = computeImprovementAnalysis(previous, previous.concerns, latest, latest.concerns);
  const changeText = analysis.scoreChange === null ? 'N/A' : (analysis.scoreChange > 0 ? `+${analysis.scoreChange}` : `${analysis.scoreChange}`);
  const notableChanges = analysis.concernChanges.filter(c => c.status !== 'stable');

  el.innerHTML = `
    <p style="font-size:var(--fs-xs);color:var(--color-text-tertiary);margin-bottom:1rem;">No skin photos are stored for this account, so this comparison is based on your assessment scores and concerns.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
      <div style="padding:1rem;border:1px solid var(--color-border);border-radius:8px;">
        <div style="font-size:var(--fs-xs);color:var(--color-text-tertiary);text-transform:uppercase;font-weight:600;margin-bottom:0.5rem;">Before &middot; ${formatDate(previous.assessment_date)}</div>
        <div style="font-size:var(--fs-2xl);font-weight:700;">${previous.skin_health_score ?? 'N/A'}</div>
        <div style="font-size:var(--fs-xs);color:var(--color-text-tertiary);">Skin Health Score</div>
      </div>
      <div style="padding:1rem;border:1px solid var(--color-border);border-radius:8px;">
        <div style="font-size:var(--fs-xs);color:var(--color-text-tertiary);text-transform:uppercase;font-weight:600;margin-bottom:0.5rem;">Current &middot; ${formatDate(latest.assessment_date)}</div>
        <div style="font-size:var(--fs-2xl);font-weight:700;">${latest.skin_health_score ?? 'N/A'}</div>
        <div style="font-size:var(--fs-xs);color:var(--color-text-tertiary);">Skin Health Score (${changeText})</div>
      </div>
    </div>
    ${notableChanges.length > 0 ? `
      <div style="margin-top:1rem;">
        <div style="font-size:var(--fs-xs);font-weight:600;color:var(--color-text-tertiary);text-transform:uppercase;margin-bottom:0.5rem;">Concern Changes</div>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem;">
          ${notableChanges.map(c => `<span class="badge ${concernStatusBadge(c.status)}">${c.concern}: ${concernStatusLabel(c.status)}</span>`).join('')}
        </div>
      </div>` : ''}
  `;
}

/* ---- 2. Routine Adherence (daily/weekly/monthly) ---- */
function renderAdherenceSummary() {
  const el = document.getElementById('adherenceSummary');
  if (!el) return;

  if (!state.routine) {
    el.innerHTML = `<p style="color:var(--color-text-tertiary);font-size:var(--fs-sm);">No routine generated yet. Visit the Routine page to generate one and start tracking adherence.</p>`;
    return;
  }

  const totalSteps = (state.routine.morning_routine || []).length + (state.routine.evening_routine || []).length;
  if (totalSteps === 0) {
    el.innerHTML = `<p style="color:var(--color-text-tertiary);font-size:var(--fs-sm);">Your current routine has no tracked steps.</p>`;
    return;
  }

  if (state.completions.length === 0) {
    el.innerHTML = `<p style="color:var(--color-text-tertiary);font-size:var(--fs-sm);">No checklist activity recorded yet. Mark off routine steps on the Routine page to build your adherence history.</p>`;
    return;
  }

  const today = toDateOnly(new Date());
  const todaysCompletions = state.completions.filter(c => c.completion_date === today && c.completed);
  const dailyPercent = Math.min(100, Math.round((todaysCompletions.length / totalSteps) * 100));

  const last7 = state.completions.filter(c => new Date(c.completion_date) >= daysAgo(7));
  const weekly = computeAdherence(last7, totalSteps);

  const last30 = state.completions.filter(c => new Date(c.completion_date) >= daysAgo(30));
  const monthly = computeAdherence(last30, totalSteps);

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:1rem;">
      <div style="padding:1rem;border:1px solid var(--color-border);border-radius:8px;text-align:center;">
        <div style="font-size:var(--fs-2xl);font-weight:700;color:var(--color-accent-dark);">${dailyPercent}%</div>
        <div style="font-size:var(--fs-xs);color:var(--color-text-tertiary);">Today</div>
      </div>
      <div style="padding:1rem;border:1px solid var(--color-border);border-radius:8px;text-align:center;">
        <div style="font-size:var(--fs-2xl);font-weight:700;color:var(--color-accent-dark);">${weekly?.averagePercent ?? 0}%</div>
        <div style="font-size:var(--fs-xs);color:var(--color-text-tertiary);">Last 7 Days</div>
      </div>
      <div style="padding:1rem;border:1px solid var(--color-border);border-radius:8px;text-align:center;">
        <div style="font-size:var(--fs-2xl);font-weight:700;color:var(--color-accent-dark);">${monthly?.averagePercent ?? 0}%</div>
        <div style="font-size:var(--fs-xs);color:var(--color-text-tertiary);">Last 30 Days</div>
      </div>
    </div>`;
}

/* ---- 5. Trend Analysis ---- */
function renderTrendCharts() {
  const el = document.getElementById('trendCharts');
  if (!el) return;

  const sections = [];

  // Skin Health Score over time
  const scoreTrend = buildScoreTrend(state.skinHealthScores, 'overall_score', state.activeRange);
  sections.push(chartSection('scoreChart', 'Skin Health Score', scoreTrend, { min: 0, max: 100, unit: '' }));

  // Routine adherence over time
  if (state.routine) {
    const totalSteps = (state.routine.morning_routine || []).length + (state.routine.evening_routine || []).length;
    const rangeCompletions = filterByRange(state.completions, 'completion_date', state.activeRange);
    const adherence = totalSteps > 0 ? computeAdherence(rangeCompletions, totalSteps) : null;
    const series = (adherence?.dailySeries || []).map(d => ({ date: d.date, value: d.percent }));
    sections.push(chartSection('adherenceChart', 'Routine Adherence', series, { min: 0, max: 100, unit: '%' }));
  }

  // Major skin concern severity over time (top recorded concern by frequency)
  const concernName = mostFrequentConcern(state.assessments);
  if (concernName) {
    const concernTrend = buildConcernTrend(state.assessments, concernName, state.activeRange);
    sections.push(chartSection('concernChart', `${concernName} Severity (1=Low, 4=Severe)`, concernTrend, { min: 1, max: 4, unit: '' }));
  }

  // Lifestyle / sleep / hydration trends, where that data exists
  ['lifestyle_score', 'sleep_score', 'hydration_score'].forEach(field => {
    const trend = buildScoreTrend(state.skinHealthScores, field, state.activeRange);
    if (trend.length > 0) {
      sections.push(chartSection(`${field}Chart`, fieldLabel(field), trend, { min: 0, max: 100, unit: '' }));
    }
  });

  el.innerHTML = sections.map(s => s.html).join('');
  sections.forEach(s => s.render());
}

function chartSection(id, title, series, chartOptions) {
  const hasData = series && series.length > 0;
  const html = `
    <div style="margin-bottom:1.5rem;">
      <h4 style="font-size:var(--fs-sm);font-weight:600;margin-bottom:0.5rem;">${title}</h4>
      ${hasData
        ? `<div class="chart-container" id="${id}"></div>`
        : `<p style="color:var(--color-text-tertiary);font-size:var(--fs-sm);">Not enough data yet for this chart.</p>`}
    </div>`;
  const render = () => {
    if (!hasData) return;
    const container = document.getElementById(id);
    const dataPoints = series.map(s => ({ label: formatDate(s.date).split(',')[0], score: s.value }));
    renderLineChart(container, dataPoints, chartOptions);
  };
  return { html, render };
}

function mostFrequentConcern(assessments) {
  const counts = {};
  (assessments || []).forEach(a => (a.concerns || []).forEach(c => {
    counts[c.concern_name] = (counts[c.concern_name] || 0) + 1;
  }));
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : null;
}

function fieldLabel(field) {
  return { lifestyle_score: 'Lifestyle Score', sleep_score: 'Sleep Score', hydration_score: 'Hydration Score' }[field] || field;
}

function severityBadgeClass(s) {
  return { Low: 'badge-success', Moderate: 'badge-warning', High: 'badge-error', Severe: 'badge-error' }[s] || 'badge-neutral';
}

function concernStatusBadge(status) {
  return { improved: 'badge-success', resolved: 'badge-success', worsened: 'badge-error', new: 'badge-warning', stable: 'badge-neutral' }[status] || 'badge-neutral';
}

function concernStatusLabel(status) {
  return { improved: 'Improved', resolved: 'Resolved', worsened: 'Needs Attention', new: 'Needs Attention', stable: 'Stable' }[status] || status;
}
