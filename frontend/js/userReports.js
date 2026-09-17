/* ==================== GLOWSENSE AI — MODULE 11: USER REPORTS ==================== */
import { dataAPI } from './api.js';
import { initDashboard, showToast, formatDate } from './common.js';
import { exportToCSV, printReport, toHtmlTable, toStatBoxesHtml } from './reportExport.js';
import { computeImprovementAnalysis } from './progressAnalytics.js';

let userId = null;
let currentReport = null;

export async function initUserReports() {
  const auth = await initDashboard('user', 'reports');
  if (!auth) return;
  userId = auth.user.id;

  const typeSelect = document.getElementById('userReportTypeSelect');
  const csvBtn = document.getElementById('userReportCsvBtn');
  const printBtn = document.getElementById('userReportPrintBtn');

  typeSelect.addEventListener('change', () => loadReport(typeSelect.value));
  csvBtn.addEventListener('click', () => {
    if (!currentReport || currentReport.rows.length === 0) { showToast('No data to export for this report.', 'error'); return; }
    exportToCSV(`my-${typeSelect.value}-report`, currentReport.columns, currentReport.rows);
  });
  printBtn.addEventListener('click', () => {
    if (!currentReport) return;
    printReport(currentReport.title, toStatBoxesHtml(currentReport.stats) + toHtmlTable(currentReport.columns, currentReport.rows));
  });

  await loadReport(typeSelect.value);
}

async function loadReport(type) {
  const container = document.getElementById('userReportPreview');
  container.innerHTML = '<p style="color:var(--color-text-secondary);">Loading report...</p>';
  try {
    currentReport = await buildUserReport(type);
    container.innerHTML = `
      ${toStatBoxesHtml(currentReport.stats)}
      <div class="table-wrapper" style="margin-top:1rem;">
        <table class="data-table"><thead><tr>${currentReport.columns.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
        <tbody>${currentReport.rows.length ? currentReport.rows.map(r => `<tr>${currentReport.columns.map(c => `<td>${r[c.key] ?? ''}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${currentReport.columns.length}" class="table-empty">No data available for this report yet.</td></tr>`}</tbody></table>
      </div>`;
  } catch (err) {
    container.innerHTML = '<p style="color:var(--color-error);">Unable to generate this report right now.</p>';
  }
}

async function buildUserReport(type) {
  if (type === 'assessment') {
    const assessments = await dataAPI.getAssessments(userId);
    const rows = assessments.map(a => ({ date: formatDate(a.assessment_date), method: a.method, score: a.skin_health_score ?? 'N/A', risk: a.risk_level || 'N/A' }));
    return {
      title: 'My Skin Assessment Report',
      stats: [{ label: 'Total Assessments', value: assessments.length }],
      columns: [{ key: 'date', label: 'Date' }, { key: 'method', label: 'Method' }, { key: 'score', label: 'Score' }, { key: 'risk', label: 'Risk Level' }],
      rows,
    };
  }

  if (type === 'routine') {
    const routine = await dataAPI.getLatestRoutine(userId);
    if (!routine) return { title: 'My Routine Report', stats: [{ label: 'Routine Steps', value: 0 }], columns: [{ key: 'period', label: 'Period' }, { key: 'category', label: 'Category' }, { key: 'productType', label: 'Product Type' }, { key: 'instructions', label: 'Instructions' }], rows: [] };
    const rows = [
      ...(routine.morning_routine || []).map(s => ({ period: 'Morning', category: s.category, productType: s.product_type || '', instructions: s.instructions || '' })),
      ...(routine.evening_routine || []).map(s => ({ period: 'Evening', category: s.category, productType: s.product_type || '', instructions: s.instructions || '' })),
    ];
    return {
      title: 'My Routine Report',
      stats: [{ label: 'Generated', value: formatDate(routine.created_at) }, { label: 'Total Steps', value: rows.length }],
      columns: [{ key: 'period', label: 'Period' }, { key: 'category', label: 'Category' }, { key: 'productType', label: 'Product Type' }, { key: 'instructions', label: 'Instructions' }],
      rows,
    };
  }

  if (type === 'products') {
    const recs = await dataAPI.getProductRecommendations(userId);
    const rows = recs.map(r => ({ product: r.product_name || 'N/A', category: r.product_category || 'N/A', suitability: r.suitability_score != null ? r.suitability_score + '%' : 'N/A', date: formatDate(r.created_at) }));
    return {
      title: 'My Product Recommendation Report',
      stats: [{ label: 'Total Recommendations', value: recs.length }],
      columns: [{ key: 'product', label: 'Product' }, { key: 'category', label: 'Category' }, { key: 'suitability', label: 'Suitability' }, { key: 'date', label: 'Date' }],
      rows,
    };
  }

  if (type === 'skinhealth') {
    const scores = await dataAPI.getSkinHealthScores(userId);
    const rows = scores.map(s => ({ date: formatDate(s.score_date), overall: s.overall_score ?? 'N/A', skinCondition: s.skin_condition_score ?? 'N/A', lifestyle: s.lifestyle_score ?? 'N/A', sleep: s.sleep_score ?? 'N/A', hydration: s.hydration_score ?? 'N/A' }));
    return {
      title: 'My Skin Health Report',
      stats: [{ label: 'Score Records', value: scores.length }, { label: 'Latest Score', value: scores[0]?.overall_score ?? 'N/A' }],
      columns: [{ key: 'date', label: 'Date' }, { key: 'overall', label: 'Overall Score' }, { key: 'skinCondition', label: 'Skin Condition' }, { key: 'lifestyle', label: 'Lifestyle' }, { key: 'sleep', label: 'Sleep' }, { key: 'hydration', label: 'Hydration' }],
      rows,
    };
  }

  // 'progress'
  const assessments = await dataAPI.getAssessments(userId);
  if (assessments.length < 2) {
    return { title: 'My Progress Report', stats: [{ label: 'Status', value: 'Not enough history yet' }], columns: [{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }], rows: [] };
  }
  const latest = assessments[0], previous = assessments[1];
  const [latestConcerns, previousConcerns] = await Promise.all([dataAPI.getConcerns(latest.id), dataAPI.getConcerns(previous.id)]);
  const analysis = computeImprovementAnalysis(previous, previousConcerns, latest, latestConcerns);
  const statusLabels = { improved: 'Improved', resolved: 'Resolved', worsened: 'Needs Attention', new: 'Needs Attention', stable: 'Stable' };
  const rows = analysis.concernChanges.map(c => ({ concern: c.concern, previous: c.previousSeverity || '—', current: c.latestSeverity || '—', status: statusLabels[c.status] || c.status }));
  return {
    title: 'My Progress Report',
    stats: [
      { label: 'Previous Score', value: analysis.previousScore ?? 'N/A' },
      { label: 'Current Score', value: analysis.currentScore ?? 'N/A' },
      { label: 'Change', value: analysis.scoreChange === null ? 'N/A' : (analysis.scoreChange > 0 ? '+' + analysis.scoreChange : analysis.scoreChange) },
    ],
    columns: [{ key: 'concern', label: 'Concern' }, { key: 'previous', label: 'Previous' }, { key: 'current', label: 'Current' }, { key: 'status', label: 'Status' }],
    rows,
  };
}
