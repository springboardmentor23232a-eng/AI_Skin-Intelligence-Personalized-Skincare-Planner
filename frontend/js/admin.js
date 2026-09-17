/* ==================== GLOWSENSE AI — ADMIN LOGIC ==================== */

import { dataAPI, authAPI } from './api.js';
import { initDashboard, showToast, formatDate, riskBadge, statusBadge, renderLineChart } from './common.js';
import { exportToCSV, printReport, toHtmlTable, toStatBoxesHtml } from './reportExport.js';

/* ---- Admin Dashboard ---- */
export async function initAdminDashboard() {
  const auth = await initDashboard('admin', 'dashboard');
  if (!auth) return;
  await loadAdminStats();
  await loadRecentActivity();
}

async function loadAdminStats() {
  try {
    const stats = await dataAPI.getStats();
    document.getElementById('statTotalUsers').textContent = stats.totalUsers || 0;
    document.getElementById('statConsultants').textContent = stats.totalConsultants || 0;
    document.getElementById('statDermatologists').textContent = stats.totalDermatologists || 0;
    document.getElementById('statAssessments').textContent = stats.totalAssessments || 0;
    document.getElementById('statActiveUsers').textContent = stats.activeUsers || 0;
    document.getElementById('statPendingConsults').textContent = stats.pendingConsultations || 0;
    document.getElementById('statHighRisk').textContent = stats.highRiskAssessments || 0;
    // Module 8 / Section 9-D: real platform metrics, not fabricated.
    const routinesEl = document.getElementById('statRoutinesGenerated');
    const productRecsEl = document.getElementById('statProductRecs');
    const feedbackEl = document.getElementById('statFeedbackSubmissions');
    if (routinesEl) routinesEl.textContent = stats.totalRoutinesGenerated ?? 0;
    if (productRecsEl) productRecsEl.textContent = stats.totalProductRecommendations ?? 0;
    if (feedbackEl) feedbackEl.textContent = stats.totalFeedbackSubmissions ?? 0;
  } catch (err) {
    showToast('Unable to load statistics.', 'error');
  }
}

async function loadRecentActivity() {
  try {
    const profiles = await dataAPI.getAllProfiles();
    const assessments = await dataAPI.getAssessments();
    const consultReqs = await dataAPI.getConsultationRequests();
    const tbody = document.getElementById('recentActivityTable');
    if (!tbody) return;

    const activities = [];
    profiles.slice(0, 3).forEach(p => activities.push({ type: 'New Registration', detail: p.name, date: p.created_at }));
    assessments.slice(0, 3).forEach(a => {
      const user = profiles.find(p => p.id === a.user_id);
      activities.push({ type: 'New Assessment', detail: user ? user.name : 'Unknown', date: a.assessment_date });
    });
    consultReqs.slice(0, 3).forEach(r => {
      const user = profiles.find(p => p.id === r.user_id);
      activities.push({ type: 'Consultation Request', detail: user ? user.name : 'Unknown', date: r.created_at });
    });

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (activities.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="table-empty">No recent activity.</td></tr>';
      return;
    }

    tbody.innerHTML = activities.slice(0, 8).map(a => `
      <tr>
        <td><span class="badge badge-info">${a.type}</span></td>
        <td>${a.detail}</td>
        <td>${formatDate(a.date)}</td>
      </tr>
    `).join('');
  } catch (err) {
    showToast('Unable to load recent activity.', 'error');
  }
}

/* ---- Admin Users Page ---- */
export async function initAdminUsers() {
  const auth = await initDashboard('admin', 'users');
  if (!auth) return;
  await loadAdminUsersList();
}

async function loadAdminUsersList() {
  try {
    const profiles = await dataAPI.getAllProfiles();
    const tbody = document.getElementById('usersTable');
    if (!tbody) return;

    if (profiles.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="table-empty">No users found.</td></tr>';
      return;
    }

    tbody.innerHTML = profiles.map(p => `
      <tr>
        <td>${p.id.substring(0, 8)}...</td>
        <td>${p.name || 'N/A'}</td>
        <td>${p.email || 'N/A'}</td>
        <td><span class="badge badge-info">${p.role}</span></td>
        <td>${p.provider || 'email'}</td>
        <td>${formatDate(p.created_at)}</td>
        <td>${statusBadge(p.status || 'active')}</td>
        <td>
          <button class="btn btn-sm ${p.status === 'active' ? 'btn-danger' : 'btn-primary'}" onclick="window.toggleUserStatus('${p.id}', '${p.status || 'active'}')">
            ${p.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </td>
      </tr>
    `).join('');

    window.toggleUserStatus = async (id, currentStatus) => {
      try {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        await dataAPI.updateProfile(id, { status: newStatus });
        showToast(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}.`, 'success');
        loadAdminUsersList();
      } catch (err) { showToast('Unable to update user status.', 'error'); }
    };
  } catch (err) {
    showToast('Unable to load users.', 'error');
  }
}

/* ---- Admin Consultants Page ---- */
export async function initAdminConsultants() {
  const auth = await initDashboard('admin', 'consultants');
  if (!auth) return;
  await loadAdminStaffList('consultant', 'consultantsTable');
}

/* ---- Admin Dermatologists Page ---- */
export async function initAdminDermatologists() {
  const auth = await initDashboard('admin', 'dermatologists');
  if (!auth) return;
  await loadAdminStaffList('dermatologist', 'dermatologistsTable');
}

async function loadAdminStaffList(role, tableId) {
  try {
    const profiles = await dataAPI.getAllProfiles();
    const staff = profiles.filter(p => p.role === role);
    const tbody = document.getElementById(tableId);
    if (!tbody) return;

    if (staff.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No ' + role + 's found.</td></tr>';
      return;
    }

    tbody.innerHTML = staff.map(p => `
      <tr>
        <td>${p.name || 'N/A'}</td>
        <td>${p.email || 'N/A'}</td>
        <td>${statusBadge(p.status || 'active')}</td>
        <td>0</td>
        <td>${formatDate(p.created_at)}</td>
        <td>
          <button class="btn btn-sm ${p.status === 'active' ? 'btn-danger' : 'btn-primary'}" onclick="window.toggleStaffStatus('${p.id}', '${p.status || 'active'}')">
            ${p.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </td>
      </tr>
    `).join('');

    window.toggleStaffStatus = async (id, currentStatus) => {
      try {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        await dataAPI.updateProfile(id, { status: newStatus });
        showToast(`${role.charAt(0).toUpperCase() + role.slice(1)} ${newStatus === 'active' ? 'activated' : 'deactivated'}.`, 'success');
        loadAdminStaffList(role, tableId);
      } catch (err) { showToast('Unable to update status.', 'error'); }
    };
  } catch (err) {
    showToast('Unable to load ' + role + 's.', 'error');
  }
}

/* ---- Admin Assessments Page ---- */
export async function initAdminAssessments() {
  const auth = await initDashboard('admin', 'assessments');
  if (!auth) return;
  await loadAdminAssessmentsList();
}

async function loadAdminAssessmentsList() {
  try {
    const assessments = await dataAPI.getAssessments();
    const profiles = await dataAPI.getAllProfiles();
    const tbody = document.getElementById('assessmentsTable');
    if (!tbody) return;

    if (assessments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="table-empty">No assessments found.</td></tr>';
      return;
    }

    tbody.innerHTML = assessments.map(a => {
      const user = profiles.find(p => p.id === a.user_id);
      return `
        <tr>
          <td>${a.id.substring(0, 8)}...</td>
          <td>${user ? user.name : 'Unknown'}</td>
          <td>${formatDate(a.assessment_date)}</td>
          <td>${a.method === 'webcam' ? 'Webcam' : 'Form'}</td>
          <td>${a.skin_health_score != null ? a.skin_health_score + '/100' : 'N/A'}</td>
          <td>${riskBadge(a.risk_level)}</td>
          <td>${statusBadge(a.status || 'completed')}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    showToast('Unable to load assessments.', 'error');
  }
}

/* ---- Admin Statistics Page ---- */
export async function initAdminStatistics() {
  const auth = await initDashboard('admin', 'statistics');
  if (!auth) return;
  await loadAdminStatisticsData();
}

async function loadAdminStatisticsData() {
  try {
    const stats = await dataAPI.getStats();
    const assessments = await dataAPI.getAssessments();
    const profiles = await dataAPI.getAllProfiles();

    document.getElementById('statTotalUsers2').textContent = stats.totalUsers || 0;
    document.getElementById('statTotalAssessments').textContent = stats.totalAssessments || 0;
    document.getElementById('statAvgScore').textContent = stats.averageScore || 0;
    document.getElementById('statHighRisk2').textContent = stats.highRiskAssessments || 0;
    const routinesEl2 = document.getElementById('statRoutinesGenerated2');
    const productRecsEl2 = document.getElementById('statProductRecs2');
    const feedbackEl2 = document.getElementById('statFeedbackSubmissions2');
    if (routinesEl2) routinesEl2.textContent = stats.totalRoutinesGenerated ?? 0;
    if (productRecsEl2) productRecsEl2.textContent = stats.totalProductRecommendations ?? 0;
    if (feedbackEl2) feedbackEl2.textContent = stats.totalFeedbackSubmissions ?? 0;

    // Risk distribution
    const riskDist = { Low: 0, Moderate: 0, High: 0 };
    assessments.forEach(a => { if (a.risk_level && riskDist[a.risk_level] !== undefined) riskDist[a.risk_level]++; });
    const riskContainer = document.getElementById('riskDistribution');
    if (riskContainer) {
      const total = assessments.length || 1;
      riskContainer.innerHTML = Object.entries(riskDist).map(([level, count]) => `
        <div style="margin-bottom:0.75rem;">
          <div style="display:flex;justify-content:space-between;font-size:var(--fs-sm);margin-bottom:0.25rem;">
            <span>${level}</span><span>${count} (${Math.round(count/total*100)}%)</span>
          </div>
          <div style="height:8px;background:var(--color-border-light);border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:${count/total*100}%;background:${level==='Low'?'var(--color-success)':level==='Moderate'?'var(--color-warning)':'var(--color-error)'};"></div>
          </div>
        </div>
      `).join('');
    }

    // Method distribution
    const methodDist = { form: 0, webcam: 0 };
    assessments.forEach(a => { if (a.method && methodDist[a.method] !== undefined) methodDist[a.method]++; });
    const methodContainer = document.getElementById('methodDistribution');
    if (methodContainer) {
      const total = assessments.length || 1;
      methodContainer.innerHTML = Object.entries(methodDist).map(([method, count]) => `
        <div style="margin-bottom:0.75rem;">
          <div style="display:flex;justify-content:space-between;font-size:var(--fs-sm);margin-bottom:0.25rem;">
            <span style="text-transform:capitalize;">${method}</span><span>${count} (${Math.round(count/total*100)}%)</span>
          </div>
          <div style="height:8px;background:var(--color-border-light);border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:${count/total*100}%;background:var(--color-accent);"></div>
          </div>
        </div>
      `).join('');
    }

    // User registration trend
    const trendContainer = document.getElementById('registrationTrend');
    if (trendContainer) {
      const userProfiles = profiles.filter(p => p.role === 'user');
      const dataPoints = userProfiles.map(p => ({
        label: formatDate(p.created_at).split(',')[0],
        score: 1,
      }));
      if (dataPoints.length > 0) {
        renderLineChart(trendContainer, dataPoints);
      } else {
        trendContainer.innerHTML = '<p style="color:var(--color-text-tertiary);font-size:var(--fs-sm);">No registration data yet.</p>';
      }
    }
  } catch (err) {
    showToast('Unable to load statistics.', 'error');
  }
}

/* ---- Admin Settings Page ---- */
export async function initAdminSettings() {
  const auth = await initDashboard('admin', 'settings');
  if (!auth) return;
}

/* ---- Module 10: Platform Notifications (admin broadcast) ---- */
export async function sendPlatformNotification(title, message) {
  if (!title || !message) {
    showToast('Please enter both a title and a message.', 'error');
    return;
  }
  try {
    const profiles = await dataAPI.getAllProfiles();
    const targets = profiles.filter(p => p.role === 'user');
    if (targets.length === 0) {
      showToast('No users to notify yet.', 'error');
      return;
    }
    await Promise.all(targets.map(u => dataAPI.createNotification({
      user_id: u.id, type: 'platform', title, message, metadata: { broadcast: true },
    }).catch(() => {})));
    showToast(`Notification sent to ${targets.length} user(s).`, 'success');
    document.getElementById('platformNotifTitle').value = '';
    document.getElementById('platformNotifMessage').value = '';
  } catch (err) {
    showToast('Unable to send platform notification.', 'error');
  }
}

/* ---- Module 9: Recommendation Monitoring (real platform-wide data) ---- */
let monitorState = { recs: [], users: [], assessments: [], statusFilter: 'all', sourceFilter: 'all' };

export async function initAdminRecommendationMonitoring() {
  const auth = await initDashboard('admin', 'recommendations');
  if (!auth) return;

  document.getElementById('monitorStatusFilter').addEventListener('change', (e) => {
    monitorState.statusFilter = e.target.value;
    renderMonitorTable();
  });
  document.getElementById('monitorSourceFilter').addEventListener('change', (e) => {
    monitorState.sourceFilter = e.target.value;
    renderMonitorTable();
  });

  try {
    const [profiles, assessments, recs, productRecs] = await Promise.all([
      dataAPI.getAllProfiles(),
      dataAPI.getAssessments(),
      dataAPI.getAllRecommendations(),
      dataAPI.getProductRecommendations(),
    ]);
    monitorState.users = profiles.filter(p => p.role === 'user');
    monitorState.assessments = assessments;
    monitorState.recs = recs;

    renderMonitorStats(recs, productRecs);
    renderMonitorTable();
    renderProductMonitorTable(productRecs);
  } catch (err) {
    showToast('Unable to load recommendation monitoring data.', 'error');
  }
}

function renderMonitorStats(recs, productRecs) {
  const el = document.getElementById('recMonitorStats');
  if (!el) return;
  const bySource = { system: 0, consultant: 0, dermatologist: 0 };
  const byStatus = { active: 0, reviewed: 0, archived: 0 };
  recs.forEach(r => { bySource[r.source] = (bySource[r.source] || 0) + 1; byStatus[r.status] = (byStatus[r.status] || 0) + 1; });

  const cards = [
    { label: 'Total Recommendations', value: recs.length },
    { label: 'AI-Generated', value: bySource.system || 0 },
    { label: 'Consultant-Authored', value: bySource.consultant || 0 },
    { label: 'Dermatologist-Authored', value: bySource.dermatologist || 0 },
    { label: 'Active', value: byStatus.active || 0 },
    { label: 'Reviewed', value: byStatus.reviewed || 0 },
    { label: 'Product Recommendations', value: productRecs.length },
  ];
  el.innerHTML = cards.map(c => `<div class="stat-card"><div class="stat-card-value">${c.value}</div><div class="stat-card-label">${c.label}</div></div>`).join('');
}

function monitorUserName(assessmentId) {
  const a = monitorState.assessments.find(a => a.id === assessmentId);
  if (!a) return 'Unknown';
  const u = monitorState.users.find(u => u.id === a.user_id);
  return u ? u.name : 'Unknown';
}

function renderMonitorTable() {
  const tbody = document.getElementById('monitorTableBody');
  if (!tbody) return;
  const rows = monitorState.recs.filter(r =>
    (monitorState.statusFilter === 'all' || r.status === monitorState.statusFilter) &&
    (monitorState.sourceFilter === 'all' || r.source === monitorState.sourceFilter)
  );

  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No recommendations match this filter.</td></tr>';
    return;
  }

  const sourceLabels = { system: 'AI-Generated', consultant: 'Consultant', dermatologist: 'Dermatologist' };
  const statusColors = { active: 'badge-success', reviewed: 'badge-info', archived: 'badge-neutral' };

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${monitorUserName(r.assessment_id)}</td>
      <td>${r.category}</td>
      <td><span class="badge badge-neutral">${sourceLabels[r.source] || r.source}</span></td>
      <td><span class="badge ${statusColors[r.status] || 'badge-neutral'}">${r.status}</span></td>
      <td>${formatDate(r.created_at)}</td>
      <td>
        ${r.status !== 'reviewed' ? `<button class="btn btn-sm btn-outline" onclick="window.markRecStatus('${r.id}','reviewed')">Mark Reviewed</button>` : ''}
        ${r.status !== 'archived' ? `<button class="btn btn-sm btn-outline" onclick="window.markRecStatus('${r.id}','archived')">Archive</button>` : ''}
      </td>
    </tr>`).join('');

  window.markRecStatus = async (id, status) => {
    try {
      await dataAPI.updateRecommendation(id, { status });
      const row = monitorState.recs.find(r => r.id === id);
      if (row) row.status = status;
      renderMonitorTable();
      showToast('Recommendation status updated.', 'success');
    } catch (err) {
      showToast('Unable to update status.', 'error');
    }
  };
}

function renderProductMonitorTable(productRecs) {
  const tbody = document.getElementById('productMonitorTableBody');
  if (!tbody) return;
  if (!productRecs || productRecs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="table-empty">No product recommendations recorded yet.</td></tr>';
    return;
  }
  tbody.innerHTML = productRecs.slice(0, 100).map(r => {
    const u = monitorState.users.find(u => u.id === r.user_id);
    return `
      <tr>
        <td>${u ? u.name : 'Unknown'}</td>
        <td>${r.product_name || 'N/A'}</td>
        <td>${r.product_category || 'N/A'}</td>
        <td>${r.suitability_score != null ? r.suitability_score + '%' : 'N/A'}</td>
        <td>${formatDate(r.created_at)}</td>
      </tr>`;
  }).join('');
}

/* ---- Module 11: Admin System Reports (real data, CSV + print/PDF export) ---- */
export async function initAdminReports() {
  const auth = await initDashboard('admin', 'reports');
  if (!auth) return;

  const typeSelect = document.getElementById('reportTypeSelect');
  const csvBtn = document.getElementById('reportCsvBtn');
  const printBtn = document.getElementById('reportPrintBtn');
  const container = document.getElementById('reportPreview');
  let currentReport = null;

  async function loadReport(type) {
    container.innerHTML = '<p style="color:var(--color-text-secondary);">Loading report...</p>';
    try {
      currentReport = await buildReport(type);
      container.innerHTML = `
        ${toStatBoxesHtml(currentReport.stats)}
        <div class="table-wrapper" style="margin-top:1rem;">
          <table class="data-table"><thead><tr>${currentReport.columns.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
          <tbody>${currentReport.rows.length ? currentReport.rows.map(r => `<tr>${currentReport.columns.map(c => `<td>${r[c.key] ?? ''}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${currentReport.columns.length}" class="table-empty">No data available for this report.</td></tr>`}</tbody></table>
        </div>`;
    } catch (err) {
      container.innerHTML = '<p style="color:var(--color-error);">Unable to generate this report right now.</p>';
    }
  }

  typeSelect.addEventListener('change', () => loadReport(typeSelect.value));
  csvBtn.addEventListener('click', () => {
    if (!currentReport || currentReport.rows.length === 0) { showToast('No data to export for this report.', 'error'); return; }
    exportToCSV(`glowsense-${typeSelect.value}-report`, currentReport.columns, currentReport.rows);
  });
  printBtn.addEventListener('click', () => {
    if (!currentReport) return;
    const body = toStatBoxesHtml(currentReport.stats) + toHtmlTable(currentReport.columns, currentReport.rows);
    printReport(currentReport.title, body);
  });

  await loadReport(typeSelect.value);
}

async function buildReport(type) {
  if (type === 'platform') {
    const stats = await dataAPI.getStats();
    return {
      title: 'Platform Summary Report',
      stats: [
        { label: 'Total Users', value: stats.totalUsers },
        { label: 'Active Users', value: stats.activeUsers },
        { label: 'Total Assessments', value: stats.totalAssessments },
        { label: 'Routines Generated', value: stats.totalRoutinesGenerated },
        { label: 'Product Recommendations', value: stats.totalProductRecommendations },
        { label: 'Feedback Submissions', value: stats.totalFeedbackSubmissions },
        { label: 'High-Risk Assessments', value: stats.highRiskAssessments },
        { label: 'Average Skin Health Score', value: stats.averageScore },
      ],
      columns: [{ key: 'label', label: 'Metric' }, { key: 'value', label: 'Value' }],
      rows: [
        { label: 'Total Users', value: stats.totalUsers },
        { label: 'Total Consultants', value: stats.totalConsultants },
        { label: 'Total Dermatologists', value: stats.totalDermatologists },
        { label: 'Active Users', value: stats.activeUsers },
        { label: 'Total Assessments', value: stats.totalAssessments },
        { label: 'Pending Consultations', value: stats.pendingConsultations },
        { label: 'High-Risk Assessments', value: stats.highRiskAssessments },
        { label: 'Average Skin Health Score', value: stats.averageScore },
        { label: 'Routines Generated', value: stats.totalRoutinesGenerated },
        { label: 'Product Recommendations', value: stats.totalProductRecommendations },
        { label: 'Feedback Submissions', value: stats.totalFeedbackSubmissions },
      ],
    };
  }

  if (type === 'assessments') {
    const [profiles, assessments] = await Promise.all([dataAPI.getAllProfiles(), dataAPI.getAssessments()]);
    const rows = assessments.map(a => {
      const u = profiles.find(p => p.id === a.user_id);
      return { user: u ? u.name : 'Unknown', date: formatDate(a.assessment_date), method: a.method, score: a.skin_health_score ?? 'N/A', risk: a.risk_level || 'N/A' };
    });
    return {
      title: 'Skin Assessment Report',
      stats: [
        { label: 'Total Assessments', value: assessments.length },
        { label: 'High-Risk', value: assessments.filter(a => a.risk_level === 'High' || a.risk_level === 'Very High').length },
      ],
      columns: [{ key: 'user', label: 'User' }, { key: 'date', label: 'Date' }, { key: 'method', label: 'Method' }, { key: 'score', label: 'Score' }, { key: 'risk', label: 'Risk Level' }],
      rows,
    };
  }

  if (type === 'routines') {
    const [profiles, routines] = await Promise.all([dataAPI.getAllProfiles(), dataAPI.getRoutines()]);
    const rows = routines.map(r => {
      const u = profiles.find(p => p.id === r.user_id);
      return { user: u ? u.name : 'Unknown', date: formatDate(r.created_at), source: r.source || 'N/A', morningSteps: (r.morning_routine || []).length, eveningSteps: (r.evening_routine || []).length };
    });
    return {
      title: 'Routine Report',
      stats: [{ label: 'Total Routines Generated', value: routines.length }],
      columns: [{ key: 'user', label: 'User' }, { key: 'date', label: 'Generated' }, { key: 'source', label: 'Source' }, { key: 'morningSteps', label: 'Morning Steps' }, { key: 'eveningSteps', label: 'Evening Steps' }],
      rows,
    };
  }

  if (type === 'products') {
    const [profiles, productRecs] = await Promise.all([dataAPI.getAllProfiles(), dataAPI.getProductRecommendations()]);
    const rows = productRecs.map(r => {
      const u = profiles.find(p => p.id === r.user_id);
      return { user: u ? u.name : 'Unknown', product: r.product_name || 'N/A', category: r.product_category || 'N/A', suitability: r.suitability_score != null ? r.suitability_score + '%' : 'N/A', date: formatDate(r.created_at) };
    });
    return {
      title: 'Product Recommendation Report',
      stats: [{ label: 'Total Product Recommendations', value: productRecs.length }],
      columns: [{ key: 'user', label: 'User' }, { key: 'product', label: 'Product' }, { key: 'category', label: 'Category' }, { key: 'suitability', label: 'Suitability' }, { key: 'date', label: 'Date' }],
      rows,
    };
  }

  if (type === 'skinhealth') {
    const [profiles, scores] = await Promise.all([dataAPI.getAllProfiles(), dataAPI.getSkinHealthScores()]);
    const rows = scores.map(s => {
      const u = profiles.find(p => p.id === s.user_id);
      return { user: u ? u.name : 'Unknown', date: formatDate(s.score_date), overall: s.overall_score ?? 'N/A', skinCondition: s.skin_condition_score ?? 'N/A', lifestyle: s.lifestyle_score ?? 'N/A', sleep: s.sleep_score ?? 'N/A', hydration: s.hydration_score ?? 'N/A' };
    });
    const avg = scores.length ? Math.round(scores.reduce((s, v) => s + (v.overall_score || 0), 0) / scores.length) : 0;
    return {
      title: 'Skin Health Report',
      stats: [{ label: 'Total Score Records', value: scores.length }, { label: 'Platform Average Score', value: avg }],
      columns: [{ key: 'user', label: 'User' }, { key: 'date', label: 'Date' }, { key: 'overall', label: 'Overall Score' }, { key: 'skinCondition', label: 'Skin Condition' }, { key: 'lifestyle', label: 'Lifestyle' }, { key: 'sleep', label: 'Sleep' }, { key: 'hydration', label: 'Hydration' }],
      rows,
    };
  }

  // 'progress'
  const [profiles, assessments] = await Promise.all([dataAPI.getAllProfiles(), dataAPI.getAssessments()]);
  const byUser = {};
  assessments.forEach(a => { (byUser[a.user_id] = byUser[a.user_id] || []).push(a); });
  const rows = Object.entries(byUser)
    .filter(([, list]) => list.length >= 2)
    .map(([userId, list]) => {
      const u = profiles.find(p => p.id === userId);
      const sorted = list.sort((a, b) => new Date(b.assessment_date) - new Date(a.assessment_date));
      const latest = sorted[0], previous = sorted[1];
      const change = (typeof latest.skin_health_score === 'number' && typeof previous.skin_health_score === 'number') ? latest.skin_health_score - previous.skin_health_score : 'N/A';
      return { user: u ? u.name : 'Unknown', previousScore: previous.skin_health_score ?? 'N/A', currentScore: latest.skin_health_score ?? 'N/A', change, assessmentCount: list.length };
    });
  return {
    title: 'Progress Report',
    stats: [{ label: 'Users With Trackable Progress', value: rows.length }],
    columns: [{ key: 'user', label: 'User' }, { key: 'previousScore', label: 'Previous Score' }, { key: 'currentScore', label: 'Current Score' }, { key: 'change', label: 'Change' }, { key: 'assessmentCount', label: 'Total Assessments' }],
    rows,
  };
}
