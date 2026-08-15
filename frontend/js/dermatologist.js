/* ==================== GLOWSENSE AI — DERMATOLOGIST LOGIC ==================== */

import { dataAPI, authAPI } from './api.js';
import { initDashboard, showToast, formatDate, riskBadge, statusBadge } from './common.js';

/* ---- Dermatologist Dashboard ---- */
export async function initDermatologistDashboard() {
  const auth = await initDashboard('dermatologist', 'dashboard');
  if (!auth) return;
  await loadDermStats();
  await loadHighRiskCases();
  await loadDermRecentAssessments();
  await loadDermConsultRequests();
}

async function loadDermStats() {
  try {
    const stats = await dataAPI.getStats();
    const assessments = await dataAPI.getAssessments();
    const consultReqs = await dataAPI.getConsultationRequests();

    document.getElementById('statPatients').textContent = stats.totalUsers || 0;
    document.getElementById('statRecent').textContent = assessments.length;
    document.getElementById('statHighRisk').textContent = assessments.filter(a => a.risk_level === 'High' || a.risk_level === 'Very High').length;
    document.getElementById('statPending').textContent = consultReqs.filter(r => r.status === 'pending').length;
  } catch (err) {
    showToast('Unable to load statistics.', 'error');
  }
}

async function loadHighRiskCases() {
  try {
    const assessments = await dataAPI.getAssessments();
    const profiles = await dataAPI.getAllProfiles();
    const tbody = document.getElementById('highRiskTable');
    if (!tbody) return;

    const highRisk = assessments.filter(a => a.risk_level === 'High' || a.risk_level === 'Very High');
    if (highRisk.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No high-risk cases.</td></tr>';
      return;
    }

    tbody.innerHTML = highRisk.map(a => {
      const user = profiles.find(p => p.id === a.user_id);
      return `
        <tr style="background:var(--color-error-soft);">
          <td>${user ? user.name : 'Unknown'}</td>
          <td>${formatDate(a.assessment_date)}</td>
          <td>${a.skin_health_score != null ? a.skin_health_score + '/100' : 'N/A'}</td>
          <td>${riskBadge(a.risk_level)}</td>
          <td>${a.skin_type || 'N/A'}</td>
          <td><a href="/dermatologist/assessments.html?id=${a.id}" class="btn btn-sm btn-outline">Review</a></td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    showToast('Unable to load high-risk cases.', 'error');
  }
}

async function loadDermRecentAssessments() {
  try {
    const assessments = await dataAPI.getAssessments();
    const profiles = await dataAPI.getAllProfiles();
    const tbody = document.getElementById('dermRecentTable');
    if (!tbody) return;

    const top5 = assessments.slice(0, 5);
    if (top5.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No assessments found.</td></tr>';
      return;
    }

    tbody.innerHTML = top5.map(a => {
      const user = profiles.find(p => p.id === a.user_id);
      return `
        <tr>
          <td>${user ? user.name : 'Unknown'}</td>
          <td>${formatDate(a.assessment_date)}</td>
          <td>${a.skin_health_score != null ? a.skin_health_score + '/100' : 'N/A'}</td>
          <td>${riskBadge(a.risk_level)}</td>
          <td>${a.skin_type || 'N/A'}</td>
          <td><a href="/dermatologist/assessments.html?id=${a.id}" class="btn btn-sm btn-outline">View</a></td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    showToast('Unable to load recent assessments.', 'error');
  }
}

async function loadDermConsultRequests() {
  try {
    const reqs = await dataAPI.getConsultationRequests();
    const profiles = await dataAPI.getAllProfiles();
    const tbody = document.getElementById('dermConsultTable');
    if (!tbody) return;

    const pending = reqs.filter(r => r.status === 'pending');
    if (pending.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="table-empty">No pending consultation requests.</td></tr>';
      return;
    }

    tbody.innerHTML = pending.map(r => {
      const user = profiles.find(p => p.id === r.user_id);
      return `
        <tr>
          <td>${user ? user.name : 'Unknown'}</td>
          <td>${formatDate(r.created_at)}</td>
          <td>${statusBadge(r.status)}</td>
          <td><a href="/dermatologist/consultations.html" class="btn btn-sm btn-outline">Review</a></td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    showToast('Unable to load consultation requests.', 'error');
  }
}

/* ---- Patients Page ---- */
export async function initDermPatients() {
  const auth = await initDashboard('dermatologist', 'patients');
  if (!auth) return;
  await loadPatientsList();
}

async function loadPatientsList() {
  try {
    const profiles = await dataAPI.getAllProfiles();
    const assessments = await dataAPI.getAssessments();
    const users = profiles.filter(p => p.role === 'user');
    const tbody = document.getElementById('patientsTable');
    if (!tbody) return;

    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No patients found.</td></tr>';
      return;
    }

    tbody.innerHTML = users.map(u => {
      const userAssessments = assessments.filter(a => a.user_id === u.id);
      const latest = userAssessments[0];
      const profile = dataAPI.getUserProfile(u.id);
      return `
        <tr>
          <td>${u.name || 'N/A'}</td>
          <td>N/A</td>
          <td>${latest ? formatDate(latest.assessment_date) : 'Never'}</td>
          <td>${latest ? (latest.skin_health_score != null ? latest.skin_health_score + '/100' : 'N/A') : 'N/A'}</td>
          <td>${latest ? riskBadge(latest.risk_level) : 'N/A'}</td>
          <td><a href="/dermatologist/assessments.html?user=${u.id}" class="btn btn-sm btn-outline">View</a></td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    showToast('Unable to load patients.', 'error');
  }
}

/* ---- Assessments Page ---- */
export async function initDermAssessments() {
  const auth = await initDashboard('dermatologist', 'assessments');
  if (!auth) return;
  await loadDermAssessmentsList();
}

async function loadDermAssessmentsList() {
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
          <td><a href="/dermatologist/assessments.html?id=${a.id}" class="btn btn-sm btn-outline">Review</a></td>
        </tr>
      `;
    }).join('');

    const params = new URLSearchParams(window.location.search);
    const assessId = params.get('id');
    if (assessId) await showDermAssessmentDetail(assessId);
  } catch (err) {
    showToast('Unable to load assessments.', 'error');
  }
}

async function showDermAssessmentDetail(assessmentId) {
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
        <h4 style="font-size:var(--fs-lg);font-weight:600;margin-bottom:0.5rem;">Patient Information</h4>
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
      <div class="alert alert-info" style="margin-top:1rem;">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M10 9v4M10 7h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        <span>AI-generated skincare insight. Professional review recommended. This is not a medical diagnosis.</span>
      </div>
    `;
    modal.classList.add('active');
  } catch (err) {
    showToast('Unable to load assessment details.', 'error');
  }
}

/* ---- High-Risk Page ---- */
export async function initDermHighRisk() {
  const auth = await initDashboard('dermatologist', 'high-risk');
  if (!auth) return;
  await loadHighRiskPage();
}

async function loadHighRiskPage() {
  try {
    const assessments = await dataAPI.getAssessments();
    const profiles = await dataAPI.getAllProfiles();
    const tbody = document.getElementById('highRiskTable');
    if (!tbody) return;

    const highRisk = assessments.filter(a => a.risk_level === 'High' || a.risk_level === 'Very High');
    if (highRisk.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="table-empty">No high-risk cases found.</td></tr>';
      return;
    }

    tbody.innerHTML = highRisk.map(a => {
      const user = profiles.find(p => p.id === a.user_id);
      return `
        <tr style="background:var(--color-error-soft);">
          <td>${user ? user.name : 'Unknown'}</td>
          <td>${formatDate(a.assessment_date)}</td>
          <td>${riskBadge(a.risk_level)}</td>
          <td>${a.skin_type || 'N/A'}</td>
          <td>${a.skin_health_score != null ? a.skin_health_score + '/100' : 'N/A'}</td>
          <td><a href="/dermatologist/assessments.html?id=${a.id}" class="btn btn-sm btn-primary">Review</a></td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    showToast('Unable to load high-risk cases.', 'error');
  }
}

/* ---- Consultations Page ---- */
export async function initDermConsultations() {
  const auth = await initDashboard('dermatologist', 'consultations');
  if (!auth) return;
  await loadDermConsultationsList();
}

async function loadDermConsultationsList() {
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
            <select class="filter-input" onchange="window.updateDermConsultStatus('${r.id}', this.value)">
              <option value="">Update...</option>
              <option value="accepted">Accept</option>
              <option value="completed">Complete</option>
              <option value="cancelled">Cancel</option>
            </select>
          </td>
        </tr>
      `;
    }).join('');

    window.updateDermConsultStatus = async (id, status) => {
      if (!status) return;
      try {
        await dataAPI.updateConsultationRequest(id, { status });
        showToast('Consultation status updated.', 'success');
        loadDermConsultationsList();
      } catch (err) { showToast('Unable to update status.', 'error'); }
    };
  } catch (err) {
    showToast('Unable to load consultations.', 'error');
  }
}

/* ---- Profile Page ---- */
export async function initDermProfile() {
  const auth = await initDashboard('dermatologist', 'profile');
  if (!auth) return;

  document.getElementById('profileName').textContent = auth.profile.name || 'N/A';
  document.getElementById('profileEmail').textContent = auth.user.email || 'N/A';
  document.getElementById('profileRole').textContent = 'Dermatologist';
  document.getElementById('profileJoined').textContent = formatDate(auth.profile.created_at);
  const avatarEl = document.getElementById('profileAvatar');
  if (avatarEl && auth.profile.name) {
    avatarEl.textContent = auth.profile.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
