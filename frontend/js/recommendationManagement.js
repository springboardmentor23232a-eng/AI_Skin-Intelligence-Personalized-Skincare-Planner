/* ==================== GLOWSENSE AI — RECOMMENDATION MANAGEMENT ==================== */
/* Shared implementation behind:
   - Consultant "Recommendation Management"
   - Dermatologist "Treatment Recommendation"
   Both are staff CRUD over the same real `recommendations` table (see
   migration 20260909090000), distinguished by the `source` column so a
   dermatologist's treatment entries and a consultant's general
   recommendations don't get confused, while both remain visible to the
   user (and to each other, and to admin) via the existing staff-read RLS. */

import { dataAPI } from './api.js';
import { initDashboard, showToast, formatDate } from './common.js';

const ROLE_CONFIG = {
  consultant: {
    pageKey: 'recommendations',
    heading: 'Recommendation Management',
    itemLabel: 'Recommendation',
    categorySuggestions: ['Skincare', 'Lifestyle', 'Diet & Nutrition', 'Sun Protection', 'Product Usage', 'General'],
  },
  dermatologist: {
    pageKey: 'treatment-recommendations',
    heading: 'Treatment Recommendations',
    itemLabel: 'Treatment Recommendation',
    categorySuggestions: ['Treatment Plan', 'Medication', 'Procedure Referral', 'Follow-up', 'Lifestyle Adjustment'],
  },
};

let state = { role: null, userId: null, users: [], assessments: [], recommendations: [], statusFilter: 'all' };

export async function initRecommendationManagementPage(role) {
  const config = ROLE_CONFIG[role];
  const auth = await initDashboard(role, config.pageKey);
  if (!auth) return;
  state.role = role;
  state.userId = auth.user.id;

  document.getElementById('pageHeading').textContent = config.heading;
  document.getElementById('addBtn').textContent = `+ Add ${config.itemLabel}`;
  document.getElementById('addBtn').addEventListener('click', () => openFormModal(config));
  document.getElementById('statusFilterSelect').addEventListener('change', (e) => {
    state.statusFilter = e.target.value;
    renderTable(config);
  });

  await loadAll(config);
}

async function loadAll(config) {
  const tbody = document.getElementById('recTableBody');
  tbody.innerHTML = `<tr><td colspan="6" class="table-empty">Loading...</td></tr>`;
  try {
    const [profiles, assessments, recommendations] = await Promise.all([
      dataAPI.getAllProfiles(),
      dataAPI.getAssessments(),
      dataAPI.getAllRecommendations(),
    ]);
    state.users = profiles.filter(p => p.role === 'user');
    state.assessments = assessments;
    state.recommendations = recommendations;
    populateUserSelect();
    renderTable(config);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="table-empty">Unable to load recommendations right now.</td></tr>`;
  }
}

function userNameFor(userId) {
  const u = state.users.find(u => u.id === userId);
  return u ? u.name : 'Unknown User';
}

function assessmentUserId(assessmentId) {
  const a = state.assessments.find(a => a.id === assessmentId);
  return a ? a.user_id : null;
}

function renderTable(config) {
  const tbody = document.getElementById('recTableBody');
  const rows = state.recommendations.filter(r => state.statusFilter === 'all' || r.status === state.statusFilter);

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="table-empty">No ${config.itemLabel.toLowerCase()}s yet. Use "Add ${config.itemLabel}" to create one.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(r => {
    const userId = assessmentUserId(r.assessment_id);
    const statusColors = { active: 'badge-success', reviewed: 'badge-info', archived: 'badge-neutral' };
    const sourceLabels = { system: 'AI-Generated', consultant: 'Consultant', dermatologist: 'Dermatologist' };
    return `
      <tr>
        <td>${userId ? userNameFor(userId) : 'Unknown'}</td>
        <td>${r.category}</td>
        <td style="max-width:280px;">${r.recommendation_text}</td>
        <td><span class="badge badge-neutral">${sourceLabels[r.source] || r.source}</span></td>
        <td><span class="badge ${statusColors[r.status] || 'badge-neutral'}">${r.status}</span></td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="window.editRecommendation('${r.id}')">Edit</button>
          <button class="btn btn-sm btn-outline" onclick="window.deleteRecommendationRow('${r.id}')">Delete</button>
        </td>
      </tr>`;
  }).join('');

  window.editRecommendation = (id) => openFormModal(config, state.recommendations.find(r => r.id === id));
  window.deleteRecommendationRow = (id) => handleDelete(id, config);
}

function populateUserSelect() {
  const select = document.getElementById('recUserSelect');
  if (!select) return;
  select.innerHTML = '<option value="">Select a user...</option>' + state.users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
}

function openFormModal(config, existing) {
  const modal = document.getElementById('recFormModal');
  const title = document.getElementById('recFormTitle');
  const userSelect = document.getElementById('recUserSelect');
  const assessmentSelect = document.getElementById('recAssessmentSelect');
  const categoryInput = document.getElementById('recCategoryInput');
  const categoryList = document.getElementById('recCategorySuggestions');
  const textInput = document.getElementById('recTextInput');
  const statusSelect = document.getElementById('recStatusSelect');
  const saveBtn = document.getElementById('recSaveBtn');

  categoryList.innerHTML = config.categorySuggestions.map(c => `<option value="${c}"></option>`).join('');
  title.textContent = existing ? `Edit ${config.itemLabel}` : `Add ${config.itemLabel}`;
  userSelect.disabled = !!existing;
  assessmentSelect.innerHTML = '<option value="">Select user first...</option>';
  assessmentSelect.disabled = true;

  function populateAssessmentsFor(userId) {
    const userAssessments = state.assessments.filter(a => a.user_id === userId);
    if (userAssessments.length === 0) {
      assessmentSelect.innerHTML = '<option value="">No assessments for this user</option>';
      assessmentSelect.disabled = true;
      return;
    }
    assessmentSelect.innerHTML = userAssessments.map(a => `<option value="${a.id}">${formatDate(a.assessment_date)} (Score: ${a.skin_health_score ?? 'N/A'})</option>`).join('');
    assessmentSelect.disabled = false;
  }

  if (existing) {
    const uid = assessmentUserId(existing.assessment_id);
    if (uid) { userSelect.value = uid; populateAssessmentsFor(uid); assessmentSelect.value = existing.assessment_id; }
    categoryInput.value = existing.category;
    textInput.value = existing.recommendation_text;
    statusSelect.value = existing.status || 'active';
  } else {
    userSelect.value = '';
    categoryInput.value = '';
    textInput.value = '';
    statusSelect.value = 'active';
  }

  userSelect.onchange = () => populateAssessmentsFor(userSelect.value);

  saveBtn.onclick = async () => {
    const assessmentId = existing ? existing.assessment_id : assessmentSelect.value;
    const category = categoryInput.value.trim();
    const text = textInput.value.trim();
    const status = statusSelect.value;

    if (!assessmentId || !category || !text) {
      showToast('Please select a user/assessment and fill in category and details.', 'error');
      return;
    }

    saveBtn.disabled = true;
    try {
      if (existing) {
        await dataAPI.updateRecommendation(existing.id, { category, recommendation_text: text, status });
        showToast(`${config.itemLabel} updated.`, 'success');
      } else {
        await dataAPI.createRecommendationEntry({
          assessment_id: assessmentId,
          category,
          recommendation_text: text,
          source: state.role,
          created_by: state.userId,
        });
        showToast(`${config.itemLabel} added.`, 'success');
      }
      closeFormModal();
      await loadAll(config);
    } catch (err) {
      showToast(`Unable to save ${config.itemLabel.toLowerCase()}. Please try again.`, 'error');
    } finally {
      saveBtn.disabled = false;
    }
  };

  modal.classList.add('active');
}

function closeFormModal() {
  document.getElementById('recFormModal').classList.remove('active');
}
window.closeRecFormModal = closeFormModal;

async function handleDelete(id, config) {
  if (!confirm(`Delete this ${config.itemLabel.toLowerCase()}? This cannot be undone.`)) return;
  try {
    await dataAPI.deleteRecommendation(id);
    showToast(`${config.itemLabel} deleted.`, 'success');
    await loadAll(config);
  } catch (err) {
    showToast(`Unable to delete ${config.itemLabel.toLowerCase()}.`, 'error');
  }
}
