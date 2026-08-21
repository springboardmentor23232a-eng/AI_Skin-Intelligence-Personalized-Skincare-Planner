/* ==================== GLOWSENSE AI — ADMIN LOGIC ==================== */

import { dataAPI, authAPI } from './api.js';
import { initDashboard, showToast, formatDate, riskBadge, statusBadge, renderLineChart } from './common.js';

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
