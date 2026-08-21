/* ==================== GLOWSENSE AI — CONSULTANT LOGIC ==================== */

import { dataAPI, authAPI } from './api.js';
import { initDashboard, showToast, showLoading, hideLoading, formatDate, formatDateTime, riskBadge, statusBadge } from './common.js';

/* ---- Consultant Dashboard ---- */
export async function initConsultantDashboard() {
  const auth = await initDashboard('consultant', 'dashboard');
  if (!auth) return;
  await loadConsultantStats();
  await loadRecentAssessments();
  await loadConsultationRequests();
}

async function loadConsultantStats() {
  try {
    const stats = await dataAPI.getStats();
    const assignedEl = document.getElementById('statAssigned');
    const pendingEl = document.getElementById('statPending');
    const completedEl = document.getElementById('statCompleted');
    const recentEl = document.getElementById('statRecent');

    const assessments = await dataAPI.getAssessments();
    const consultReqs = await dataAPI.getConsultationRequests();

    if (assignedEl) assignedEl.textContent = stats.totalUsers || 0;
    if (pendingEl) pendingEl.textContent = consultReqs.filter(r => r.status === 'pending').length;
    if (completedEl) completedEl.textContent = consultReqs.filter(r => r.status === 'completed').length;
    if (recentEl) recentEl.textContent = assessments.length;
  } catch (err) {
    showToast('Unable to load statistics.', 'error');
  }
}

async function loadRecentAssessments() {
  try {
    const assessments = await dataAPI.getAssessments();
    const profiles = await dataAPI.getAllProfiles();
    const tbody = document.getElementById('recentAssessmentsTable');
    if (!tbody) return;

    const top5 = assessments.slice(0, 5);
    if (top5.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No assessments found.</td></tr>';
      return;
    }

    tbody.innerHTML = top5.map(a => {
      const user = profiles.find(p => p.id === a.user_id);
      const userName = user ? user.name : 'Unknown';
      return `
        <tr>
          <td>${userName}</td>
          <td>${formatDate(a.assessment_date)}</td>
          <td>${a.skin_health_score != null ? a.skin_health_score + '/100' : 'N/A'}</td>
          <td>${riskBadge(a.risk_level)}</td>
          <td>${a.skin_type || 'N/A'}</td>
          <td><a href="/consultant/assessments.html?id=${a.id}" class="btn btn-sm btn-outline">View</a></td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    showToast('Unable to load recent assessments.', 'error');
  }
}

async function loadConsultationRequests() {
  try {
    const reqs = await dataAPI.getConsultationRequests();
    const profiles = await dataAPI.getAllProfiles();
    const tbody = document.getElementById('consultRequestsTable');
    if (!tbody) return;

    const pending = reqs.filter(r => r.status === 'pending' || r.status === 'accepted');
    if (pending.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="table-empty">No consultation requests.</td></tr>';
      return;
    }

    tbody.innerHTML = pending.map(r => {
      const user = profiles.find(p => p.id === r.user_id);
      const userName = user ? user.name : 'Unknown';
      return `
        <tr>
          <td>${userName}</td>
          <td>${formatDate(r.created_at)}</td>
          <td>${statusBadge(r.status)}</td>
          <td>${r.priority === 'urgent' ? '<span class="badge badge-error">Urgent</span>' : '<span class="badge badge-neutral">Normal</span>'}</td>
          <td>
            ${r.status === 'pending' ? `<button class="btn btn-sm btn-primary" onclick="window.acceptConsult('${r.id}')">Accept</button>` : ''}
            ${r.status === 'accepted' ? `<button class="btn btn-sm btn-accent" onclick="window.completeConsult('${r.id}')">Complete</button>` : ''}
          </td>
        </tr>
      `;
    }).join('');

    window.acceptConsult = async (id) => {
      try {
        await dataAPI.updateConsultationRequest(id, { status: 'accepted', handled_by: authAPI.isDemoMode() ? 'demo-consult' : null });
        showToast('Consultation accepted.', 'success');
        loadConsultationRequests();
      } catch (err) { showToast('Unable to update request.', 'error'); }
    };
    window.completeConsult = async (id) => {
      try {
        await dataAPI.updateConsultationRequest(id, { status: 'completed' });
        showToast('Consultation completed.', 'success');
        loadConsultationRequests();
      } catch (err) { showToast('Unable to update request.', 'error'); }
    };
  } catch (err) {
    showToast('Unable to load consultation requests.', 'error');
  }
}

/* ---- Consultant Users Page ---- */
export async function initConsultantUsers() {
  const auth = await initDashboard('consultant', 'users');
  if (!auth) return;
  await loadUsersList();
}

async function loadUsersList() {
  try {
    const profiles = await dataAPI.getAllProfiles();
    const assessments = await dataAPI.getAssessments();
    const users = profiles.filter(p => p.role === 'user');
    const tbody = document.getElementById('usersTable');
    if (!tbody) return;

    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No users found.</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(u => {
      const userAssessments = assessments.filter(a => a.user_id === u.id);
      const latest = userAssessments[0];
      return `
        <tr>
          <td>${u.name || 'N/A'}</td>
          <td>${u.email || 'N/A'}</td>
          <td>${latest ? (latest.skin_health_score != null ? latest.skin_health_score + '/100' : 'N/A') : 'N/A'}</td>
          <td>${latest ? riskBadge(latest.risk_level) : 'N/A'}</td>
          <td>${latest ? formatDate(latest.assessment_date) : 'Never'}</td>
          <td><a href="/consultant/assessments.html?user=${u.id}" class="btn btn-sm btn-outline">View Profile</a></td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    showToast('Unable to load users.', 'error');
  }
}

/* ---- Consultant Assessments Page ---- */
export async function initConsultantAssessments() {
  const auth = await initDashboard('consultant', 'assessments');
  if (!auth) return;
  await loadAssessmentsList();
}

async function loadAssessmentsList() {
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
          <td><a href="/consultant/assessments.html?id=${a.id}" class="btn btn-sm btn-outline">View</a></td>
        </tr>
      `;
    }).join('');

    // Check for specific assessment detail
    const params = new URLSearchParams(window.location.search);
    const assessId = params.get('id');
    if (assessId) {
      await showAssessmentDetailModal(assessId);
    }
  } catch (err) {
    showToast('Unable to load assessments.', 'error');
  }
}

async function showAssessmentDetailModal(assessmentId) {
  try {
    const assessment = await dataAPI.getAssessmentById(assessmentId);
    if (!assessment) return;
    const concerns = await dataAPI.getConcerns(assessmentId);
    const risks = await dataAPI.getRisks(assessmentId);
    const recs = await dataAPI.getRecommendations(assessmentId);
    const profiles = await dataAPI.getAllProfiles();
    const user = profiles.find(p => p.id === assessment.user_id);

    const modal = document.getElementById('detailModal');
    const body = document.getElementById('detailModalBody');
    if (!modal || !body) return;

    body.innerHTML = `
      <div style="margin-bottom:1rem;">
        <h4 style="font-size:var(--fs-lg);font-weight:600;margin-bottom:0.5rem;">User Information</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;font-size:var(--fs-sm);">
          <div><strong>Name:</strong> ${user ? user.name : 'Unknown'}</div>
          <div><strong>Email:</strong> ${user ? user.email : 'N/A'}</div>
        </div>
      </div>
      <div style="margin-bottom:1rem;">
        <h4 style="font-size:var(--fs-lg);font-weight:600;margin-bottom:0.5rem;">Assessment Information</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;font-size:var(--fs-sm);">
          <div><strong>Date:</strong> ${formatDate(assessment.assessment_date)}</div>
          <div><strong>Method:</strong> ${assessment.method === 'webcam' ? 'Webcam' : 'Form'}</div>
          <div><strong>Score:</strong> ${assessment.skin_health_score || 'N/A'}/100</div>
          <div><strong>Skin Type:</strong> ${assessment.skin_type || 'N/A'}</div>
          <div><strong>Risk Level:</strong> ${riskBadge(assessment.risk_level)}</div>
        </div>
      </div>
      <h4 style="margin-bottom:0.5rem;">Concerns</h4>
      ${concerns.length ? concerns.map(c => `<div style="padding:0.5rem;border:1px solid var(--color-border);border-radius:8px;margin-bottom:0.5rem;font-size:var(--fs-sm);"><strong>${c.concern_name}</strong> — ${c.severity}<br><span style="color:var(--color-text-secondary);">${c.explanation || ''}</span></div>`).join('') : '<p style="color:var(--color-text-tertiary);">No concerns recorded.</p>'}
      <h4 style="margin-bottom:0.5rem;margin-top:1rem;">Risk Factors</h4>
      ${risks.length ? risks.map(r => `<div style="padding:0.5rem;border:1px solid var(--color-border);border-radius:8px;margin-bottom:0.5rem;font-size:var(--fs-sm);"><strong>${r.risk_name}</strong> — ${r.severity}<br><span style="color:var(--color-text-secondary);">${r.explanation || ''}</span></div>`).join('') : '<p style="color:var(--color-text-tertiary);">No risk factors recorded.</p>'}
      <h4 style="margin-bottom:0.5rem;margin-top:1rem;">Recommendations</h4>
      ${recs.length ? recs.map(r => `<div style="padding:0.5rem;border:1px solid var(--color-border);border-radius:8px;margin-bottom:0.5rem;font-size:var(--fs-sm);"><strong>${r.category}</strong><br><span style="color:var(--color-text-secondary);">${r.recommendation_text}</span></div>`).join('') : '<p style="color:var(--color-text-tertiary);">No recommendations recorded.</p>'}
    `;
    modal.classList.add('active');
  } catch (err) {
    showToast('Unable to load assessment details.', 'error');
  }
}

/* ---- Consultant Consultations Page ---- */
export async function initConsultantConsultations() {
  const auth = await initDashboard('consultant', 'consultations');
  if (!auth) return;
  await loadConsultationsList();
}

async function loadConsultationsList() {
  try {
    const reqs = await dataAPI.getConsultationRequests();
    const profiles = await dataAPI.getAllProfiles();
    const tbody = document.getElementById('consultationsTable');
    if (!tbody) return;

    if (reqs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No consultation requests.</td></tr>';
      return;
    }

    tbody.innerHTML = reqs.map(r => {
      const user = profiles.find(p => p.id === r.user_id);
      return `
        <tr>
          <td>${user ? user.name : 'Unknown'}</td>
          <td>${formatDate(r.created_at)}</td>
          <td>${statusBadge(r.status)}</td>
          <td>${r.priority === 'urgent' ? '<span class="badge badge-error">Urgent</span>' : '<span class="badge badge-neutral">Normal</span>'}</td>
          <td>${r.message ? r.message.substring(0, 50) + (r.message.length > 50 ? '...' : '') : 'N/A'}</td>
          <td>
            <select class="filter-input" onchange="window.updateConsultStatus('${r.id}', this.value)">
              <option value="">Update...</option>
              <option value="accepted">Accept</option>
              <option value="completed">Complete</option>
              <option value="cancelled">Cancel</option>
            </select>
          </td>
        </tr>
      `;
    }).join('');

    window.updateConsultStatus = async (id, status) => {
      if (!status) return;
      try {
        await dataAPI.updateConsultationRequest(id, { status });
        showToast('Consultation status updated.', 'success');
        loadConsultationsList();
      } catch (err) { showToast('Unable to update status.', 'error'); }
    };
  } catch (err) {
    showToast('Unable to load consultations.', 'error');
  }
}

/* ---- Consultant Profile Page ---- */
export async function initConsultantProfile() {
  const auth = await initDashboard('consultant', 'profile');
  if (!auth) return;

  const nameEl = document.getElementById('profileName');
  const emailEl = document.getElementById('profileEmail');
  const roleEl = document.getElementById('profileRole');
  const joinedEl = document.getElementById('profileJoined');
  const avatarEl = document.getElementById('profileAvatar');

  if (nameEl) nameEl.textContent = auth.profile.name || 'N/A';
  if (emailEl) emailEl.textContent = auth.user.email || 'N/A';
  if (roleEl) roleEl.textContent = 'Consultant';
  if (joinedEl) joinedEl.textContent = formatDate(auth.profile.created_at);
  if (avatarEl && auth.profile.name) {
    avatarEl.textContent = auth.profile.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
