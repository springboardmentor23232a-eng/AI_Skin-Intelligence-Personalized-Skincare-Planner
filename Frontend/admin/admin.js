/* ─────────────────────────────────────────────────────────────
   Admin Dashboard — Logic, Analytics, Monitoring & Reporting
───────────────────────────────────────────────────────────── */

const token = localStorage.getItem('access_token');

// Chart instances
let chartUserGrowth = null;
let chartAssessmentVolume = null;
let chartScoreDistribution = null;
let chartTopConcerns = null;
let allRecommendationsFeed = [];

// ── Auth guard ─────────────────────────────────────────────────

const verifyAdmin = async () => {
  if (!token) {
    window.location.replace('../index.html');
    return;
  }

  try {
    const res = await fetch('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      clearSession();
      return;
    }

    const data = await res.json().catch(() => ({}));
    if (data.role !== 'admin') {
      clearSession();
      return;
    }

    const emailEl = document.getElementById('adminEmail');
    if (emailEl) emailEl.textContent = data.email || 'Administrator';

    // Load all initial data
    await loadAll();
    await loadPlatformAnalytics();
    await loadRecommendationMonitoring();
    await loadSystemReports();
  } catch (err) {
    clearSession();
  }
};

const clearSession = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_role');
  window.location.replace('../index.html');
};

// ── Navigation ─────────────────────────────────────────────────

const sections = {
  overview: { el: document.getElementById('section-overview'), nav: document.getElementById('navOverview'), title: 'Overview', sub: 'Welcome back, Administrator' },
  approvals: { el: document.getElementById('section-approvals'), nav: document.getElementById('navApprovals'), title: 'Approvals', sub: 'Manage pending account requests' },
  accounts: { el: document.getElementById('section-accounts'), nav: document.getElementById('navAccounts'), title: 'All Accounts', sub: 'View all users, consultants and dermatologists' },
  allocations: { el: document.getElementById('section-allocations'), nav: document.getElementById('navAllocations'), title: 'Allocations', sub: 'Assign patients to specialists' },
  'platform-analytics': { el: document.getElementById('section-platform-analytics'), nav: document.getElementById('navPlatformAnalytics'), title: 'Platform Analytics', sub: 'Aggregated clinical performance & user trends' },
  'rec-monitoring': { el: document.getElementById('section-rec-monitoring'), nav: document.getElementById('navRecMonitoring'), title: 'Recommendation Monitoring', sub: 'Audit clinical prescriptions and routine steps' },
  'system-reports': { el: document.getElementById('section-system-reports'), nav: document.getElementById('navSystemReports'), title: 'System Reports & Diagnostics', sub: 'Operational health telemetry and data export' },
};

const showSection = (key) => {
  Object.entries(sections).forEach(([k, s]) => {
    s.el?.classList.toggle('active', k === key);
    s.nav?.classList.toggle('active', k === key);
  });
  const s = sections[key];
  const titleEl = document.getElementById('pageTitle');
  const subEl = document.getElementById('pageSubtitle');
  if (titleEl && s) titleEl.textContent = s.title;
  if (subEl && s) subEl.textContent = s.sub;

  // Trigger chart re-render if analytics shown
  if (key === 'platform-analytics') {
    loadPlatformAnalytics();
  }
};

document.querySelectorAll('.nav-item').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(link.dataset.section);
  });
});

// ── Tab switching ──────────────────────────────────────────────

const setupTabs = (tabBar, panelPrefix) => {
  tabBar.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBar.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll(`[id^="${panelPrefix}"]`).forEach((p) => p.classList.remove('active'));
      const target = document.getElementById(`${panelPrefix}${capitalize(btn.dataset.tab)}`);
      if (target) target.classList.add('active');
    });
  });
};

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

// Approvals tabs
const approvalTabBar = document.querySelector('#section-approvals .tab-bar');
if (approvalTabBar) setupTabs(approvalTabBar, 'tabPanel');

// Accounts tabs
const accountsTabBar = document.querySelector('#section-accounts .tab-bar');
if (accountsTabBar) setupTabs(accountsTabBar, 'tabPanelAll');

const parseErrorMessage = (detail, fallback = 'Request failed') => {
  if (!detail) return fallback;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((err) => ((err && err.msg) ? err.msg : JSON.stringify(err))).join(', ');
  }
  if (typeof detail === 'object') {
    return detail.msg || JSON.stringify(detail);
  }
  return String(detail);
};

const apiFetch = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(parseErrorMessage(err.detail));
  }
  return res.json();
};

// ── Toast ──────────────────────────────────────────────────────

let toastTimer = null;

const showToast = (msg, type = 'success') => {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = 'toast hidden'; }, 3500);
};

// ── HTML Sanitization Utility (XSS protection) ──

const escapeHtml = (str) => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// ── Formatters ─────────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const statusBadge = (s) =>
  `<span class="badge badge-${escapeHtml(s)}">${escapeHtml(s)}</span>`;

const getName = (item) => {
  if (item && item.name && item.name.trim()) {
    return item.name.trim();
  }
  if (item && item.email) {
    const handle = item.email.split('@')[0];
    return handle
      .replace(/[._-]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((w) => capitalize(w))
      .join(' ');
  }
  return '—';
};

// ── Approval actions ───────────────────────────────────────────

const approveAccount = async (role, id, btn) => {
  btn.disabled = true;
  try {
    await apiFetch(`/admin/approve/${role}/${id}`, { method: 'POST' });
    showToast(`${capitalize(role)} approved successfully!`, 'success');
    await loadAll();
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false;
  }
};

const rejectAccount = async (role, id, btn) => {
  btn.disabled = true;
  try {
    await apiFetch(`/admin/reject/${role}/${id}`, { method: 'POST' });
    showToast(`${capitalize(role)} rejected.`, 'error');
    await loadAll();
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false;
  }
};

// ── Build approval item ─────────────────────────────────────────

const buildApprovalItem = (item, role) => {
  const div = document.createElement('div');
  div.className = 'approval-item';
  div.innerHTML = `
    <div class="approval-info">
      <p class="approval-name">${escapeHtml(getName(item))}</p>
      <p class="approval-email">${escapeHtml(item.email)}</p>
      <p class="approval-date">Registered: ${escapeHtml(formatDate(item.created_at))}${item.specialization ? ` • ${escapeHtml(item.specialization)}` : ''}</p>
    </div>
    <div class="approval-actions">
      <button class="approve-btn" id="approve-${escapeHtml(role)}-${item.id}">✓ Approve</button>
      <button class="reject-btn"  id="reject-${escapeHtml(role)}-${item.id}">✕ Reject</button>
    </div>
  `;
  div.querySelector('.approve-btn').addEventListener('click', (e) => approveAccount(role, item.id, e.currentTarget));
  div.querySelector('.reject-btn').addEventListener('click', (e) => rejectAccount(role, item.id, e.currentTarget));
  return div;
};

// ── Build all-accounts table ────────────────────────────────────

const buildAccountsTable = (items) => {
  if (!items.length) return '<p class="empty-msg">No accounts found.</p>';
  const rows = items.map((u) => `
    <tr>
      <td>${escapeHtml(getName(u))}</td>
      <td>${escapeHtml(u.email)}</td>
      <td>${escapeHtml(formatDate(u.created_at))}</td>
      <td>${statusBadge(u.status)}</td>
    </tr>
  `).join('');
  return `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Registered</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
};

// ── Overview pending preview ────────────────────────────────────

const buildOverviewPending = (users, consultants, dermatologists) => {
  const all = [
    ...users.map((u) => ({ ...u, role: 'user' })),
    ...consultants.map((c) => ({ ...c, role: 'consultant' })),
    ...dermatologists.map((d) => ({ ...d, role: 'dermatologist' })),
  ].slice(0, 5);

  if (!all.length) return '<p class="empty-msg">No pending accounts. All caught up!</p>';

  const rows = all.map((a) => `
    <tr>
      <td>${escapeHtml(getName(a))}</td>
      <td>${escapeHtml(a.email)}</td>
      <td><span class="badge" style="background:rgba(99,102,241,0.15);color:#818cf8">${escapeHtml(capitalize(a.role))}</span></td>
      <td>${escapeHtml(formatDate(a.created_at))}</td>
      <td>${statusBadge('pending')}</td>
    </tr>
  `).join('');

  return `
    <table>
      <thead>
        <tr><th>Name</th><th>Email</th><th>Role</th><th>Registered</th><th>Status</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
};

// ── Load all data ───────────────────────────────────────────────

const loadAll = async () => {
  try {
    const [pendingData, allData] = await Promise.all([
      apiFetch('/admin/pending'),
      apiFetch('/admin/all'),
    ]);

    const pendingUsers = pendingData.users || [];
    const pendingConsultants = pendingData.consultants || [];
    const pendingDermatologists = pendingData.dermatologists || [];

    const allUsers = allData.users || [];
    const allConsultants = allData.consultants || [];
    const allDermatologists = allData.dermatologists || [];

    const totalPending = pendingUsers.length + pendingConsultants.length + pendingDermatologists.length;

    // Stats
    setText('statTotalUsers', allUsers.length);
    setText('statTotalConsultants', allConsultants.length);
    setText('statTotalDermatologists', allDermatologists.length);
    setText('statPending', totalPending);

    // Badge
    const badge = document.getElementById('pendingBadge');
    if (badge) {
      badge.textContent = totalPending;
      badge.classList.toggle('hidden', totalPending === 0);
    }

    // Tab counts
    setText('tabUserCount', pendingUsers.length);
    setText('tabConsultantCount', pendingConsultants.length);
    setText('tabDermatologistCount', pendingDermatologists.length);

    // Overview pending preview
    setHtml('overviewPendingList', buildOverviewPending(pendingUsers, pendingConsultants, pendingDermatologists));

    // Pending approval lists
    renderApprovalList('pendingUsersList', pendingUsers, 'user');
    renderApprovalList('pendingConsultantsList', pendingConsultants, 'consultant');
    renderApprovalList('pendingDermatologistsList', pendingDermatologists, 'dermatologist');

    // All accounts tables
    setHtml('allUsersList', buildAccountsTable(allUsers));
    setHtml('allConsultantsList', buildAccountsTable(allConsultants));
    setHtml('allDermatologistsList', buildAccountsTable(allDermatologists));

  } catch (err) {
    showToast('Failed to load accounts: ' + err.message, 'error');
  }

  // Load allocations data
  try {
    await loadAllocations();
  } catch (err) {
    console.error('Allocations load error:', err);
  }
};

const renderApprovalList = (elementId, items, role) => {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.innerHTML = '';
  if (items.length === 0) {
    el.innerHTML = `<p class="empty-msg">No pending ${role} requests.</p>`;
  } else {
    items.forEach((item) => el.appendChild(buildApprovalItem(item, role)));
  }
};

const setText = (id, val) => {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
};

const setHtml = (id, html) => {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
};

// ── Refresh & Actions ───────────────────────────────────────────

document.getElementById('logoutBtn')?.addEventListener('click', clearSession);

document.getElementById('refreshBtn')?.addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  btn.classList.add('spinning');
  await Promise.all([
    loadAll(),
    loadPlatformAnalytics(),
    loadRecommendationMonitoring(),
    loadSystemReports(),
  ]);
  setTimeout(() => btn.classList.remove('spinning'), 600);
});

document.getElementById('goToApprovals')?.addEventListener('click', () => {
  showSection('approvals');
});

// ── Allocation Helpers (Consultants & Dermatologists) ────────────

const loadAllocations = async () => {
  const [allData, assignData] = await Promise.all([
    apiFetch('/admin/all'),
    apiFetch('/admin/assignments'),
  ]);

  const allUsers = allData.users || [];
  const allConsultants = allData.consultants || [];
  const allDermatologists = allData.dermatologists || [];

  const assignments = assignData.assignments || [];
  const dermAssignments = assignData.dermatologist_assignments || [];

  // Populate Consultant Allocation Selects
  populateDropdown('allocateUser', allUsers, 'user');
  populateDropdown('allocateConsultant', allConsultants, 'consultant');

  // Populate Dermatologist Allocation Selects
  populateDropdown('allocateDermUser', allUsers, 'user');
  populateDropdown('allocateDermatologist', allDermatologists, 'dermatologist');

  // Build assignments tables
  setHtml('assignmentsList', buildAssignmentsTable(assignments, 'consultant'));
  setHtml('dermAssignmentsList', buildAssignmentsTable(dermAssignments, 'dermatologist'));

  // Bind unassign buttons
  document.querySelectorAll('.unassign-cons-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const uid = e.currentTarget.dataset.userId;
      const cid = e.currentTarget.dataset.specialistId;
      await unassignSpecialist(uid, cid, 'consultant', e.currentTarget);
    });
  });

  document.querySelectorAll('.unassign-derm-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const uid = e.currentTarget.dataset.userId;
      const did = e.currentTarget.dataset.specialistId;
      await unassignSpecialist(uid, did, 'dermatologist', e.currentTarget);
    });
  });
};

const populateDropdown = (elementId, items, roleLabel) => {
  const select = document.getElementById(elementId);
  if (!select) return;
  const current = select.value;
  select.innerHTML = `<option value="">— Choose a ${roleLabel} —</option>`;
  if (items.length === 0) {
    const opt = document.createElement('option');
    opt.disabled = true;
    opt.textContent = `No ${roleLabel}s available`;
    select.appendChild(opt);
  } else {
    items.forEach((item) => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = `${getName(item)} (${item.email})${item.status === 'pending' ? ' - [Pending]' : ''}`;
      select.appendChild(opt);
    });
  }
  select.value = current;
};

const buildAssignmentsTable = (assignments, type) => {
  if (!assignments.length) {
    return `<p class="empty-msg">No ${type} assignments currently active.</p>`;
  }

  const rows = assignments.map((a) => {
    const specName = type === 'consultant' ? a.consultant_name : a.dermatologist_name;
    const specEmail = type === 'consultant' ? a.consultant_email : a.dermatologist_email;
    const specId = type === 'consultant' ? a.consultant_id : a.dermatologist_id;
    const btnClass = type === 'consultant' ? 'unassign-cons-btn' : 'unassign-derm-btn';

    return `
      <tr>
        <td>${escapeHtml(a.user_name)}</td>
        <td>${escapeHtml(a.user_email)}</td>
        <td>${escapeHtml(specName)}</td>
        <td>${escapeHtml(specEmail)}</td>
        <td>${escapeHtml(formatDate(a.assigned_at))}</td>
        <td>
          <button class="${btnClass} reject-btn unassign-btn" data-user-id="${a.user_id}" data-specialist-id="${specId}">✕ Unassign</button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <table>
      <thead>
        <tr>
          <th>User</th>
          <th>User Email</th>
          <th>Specialist</th>
          <th>Specialist Email</th>
          <th>Assigned</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
};

const assignUser = async () => {
  const userId = document.getElementById('allocateUser')?.value;
  const consultantId = document.getElementById('allocateConsultant')?.value;
  if (!userId || !consultantId) {
    showToast('Please select both a user and a consultant.', 'error');
    return;
  }
  try {
    await apiFetch('/admin/assign', {
      method: 'POST',
      body: JSON.stringify({ user_id: parseInt(userId), consultant_id: parseInt(consultantId) }),
    });
    showToast('User assigned to consultant successfully!', 'success');
    await loadAllocations();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

const assignDermatologist = async () => {
  const userId = document.getElementById('allocateDermUser')?.value;
  const dermId = document.getElementById('allocateDermatologist')?.value;
  if (!userId || !dermId) {
    showToast('Please select both a patient and a dermatologist.', 'error');
    return;
  }
  try {
    await apiFetch('/admin/assign-dermatologist', {
      method: 'POST',
      body: JSON.stringify({ user_id: parseInt(userId), dermatologist_id: parseInt(dermId) }),
    });
    showToast('Patient assigned to dermatologist successfully!', 'success');
    await loadAllocations();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

const unassignSpecialist = async (userId, specialistId, type, btn) => {
  if (btn) btn.disabled = true;
  const url = type === 'consultant' ? `/admin/unassign/${userId}/${specialistId}` : `/admin/unassign-dermatologist/${userId}/${specialistId}`;
  try {
    await apiFetch(url, { method: 'DELETE' });
    showToast(`${capitalize(type)} assignment removed.`, 'success');
    await loadAllocations();
  } catch (err) {
    showToast(err.message, 'error');
    if (btn) btn.disabled = false;
  }
};

document.getElementById('assignBtn')?.addEventListener('click', assignUser);
document.getElementById('assignDermBtn')?.addEventListener('click', assignDermatologist);

// ── 5. Platform Analytics Implementation ─────────────────────────

const loadPlatformAnalytics = async () => {
  try {
    const data = await apiFetch('/admin/analytics/platform');
    const kpis = data.kpis || {};

    setText('kpiActiveUsers', kpis.active_users_30d ?? '0');
    setText('kpiTotalAssessments', kpis.total_assessments ?? '0');
    setText('kpiAvgScore', `${kpis.avg_skin_health_score ?? 0}/100`);
    setText('kpiAvgAdherence', `${kpis.avg_adherence_pct ?? 0}%`);

    renderPlatformCharts(data);
  } catch (err) {
    console.error('Analytics load error:', err);
  }
};

const renderPlatformCharts = (data) => {
  const timeline = data.timeline || { labels: [], registrations: [], assessments: [] };
  const scoreDist = data.score_distribution || {};
  const topConcerns = data.top_concerns || [];

  // 1. User Growth Chart
  const ctxGrowth = document.getElementById('chartUserGrowth')?.getContext('2d');
  if (ctxGrowth) {
    if (chartUserGrowth) chartUserGrowth.destroy();
    chartUserGrowth = new Chart(ctxGrowth, {
      type: 'line',
      data: {
        labels: timeline.labels,
        datasets: [{
          label: 'New Registrations',
          data: timeline.registrations,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    });
  }

  // 2. Assessment Volume Chart
  const ctxAssess = document.getElementById('chartAssessmentVolume')?.getContext('2d');
  if (ctxAssess) {
    if (chartAssessmentVolume) chartAssessmentVolume.destroy();
    chartAssessmentVolume = new Chart(ctxAssess, {
      type: 'bar',
      data: {
        labels: timeline.labels,
        datasets: [{
          label: 'Assessments',
          data: timeline.assessments,
          backgroundColor: '#9333ea',
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    });
  }

  // 3. Health Score Distribution (Doughnut)
  const ctxScore = document.getElementById('chartScoreDistribution')?.getContext('2d');
  if (ctxScore) {
    if (chartScoreDistribution) chartScoreDistribution.destroy();
    chartScoreDistribution = new Chart(ctxScore, {
      type: 'doughnut',
      data: {
        labels: Object.keys(scoreDist),
        datasets: [{
          data: Object.values(scoreDist),
          backgroundColor: ['#10b981', '#06b6d4', '#f59e0b', '#ef4444'],
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
      },
    });
  }

  // 4. Top Reported Concerns Chart
  const ctxConcerns = document.getElementById('chartTopConcerns')?.getContext('2d');
  if (ctxConcerns) {
    if (chartTopConcerns) chartTopConcerns.destroy();
    chartTopConcerns = new Chart(ctxConcerns, {
      type: 'bar',
      data: {
        labels: topConcerns.map((c) => c.name),
        datasets: [{
          label: 'Occurrences',
          data: topConcerns.map((c) => c.count),
          backgroundColor: '#0d9488',
          borderRadius: 4,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    });
  }
};

// ── 6. Recommendation Monitoring Implementation ─────────────────

const loadRecommendationMonitoring = async () => {
  try {
    const data = await apiFetch('/admin/recommendations/monitoring');
    const summary = data.catalog_summary || {};
    const stats = data.stats || {};

    setText('monCatalogCount', summary.total_products || '—');
    setText('monClinicalCount', stats.total_clinical_prescriptions || '0');
    setText('monStepsCount', stats.total_routine_steps_logged || '0');

    allRecommendationsFeed = data.recent_recommendations || [];
    renderRecommendationStream();
  } catch (err) {
    console.error('Monitoring load error:', err);
  }
};

const renderRecommendationStream = () => {
  const tbody = document.getElementById('recMonitoringTableBody');
  if (!tbody) return;

  const searchVal = document.getElementById('recSearchInput')?.value.toLowerCase().trim() || '';

  const filtered = allRecommendationsFeed.filter((r) => {
    if (!searchVal) return true;
    return (
      r.title.toLowerCase().includes(searchVal) ||
      r.actives.toLowerCase().includes(searchVal) ||
      r.target_user.toLowerCase().includes(searchVal) ||
      r.source.toLowerCase().includes(searchVal)
    );
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-slate-500">No recommendations matching search.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered
    .map((r) => {
      const isClin = r.type.includes('Clinical');
      return `
      <tr>
        <td><span class="badge" style="background:${isClin ? '#e0f2fe;color:#0369a1' : '#f1f5f9;color:#475569'}">${escapeHtml(r.type)}</span></td>
        <td class="font-bold text-slate-800">${escapeHtml(r.title)}</td>
        <td class="text-xs font-semibold text-sky-800">${escapeHtml(r.actives)}</td>
        <td>${escapeHtml(r.target_user)}</td>
        <td class="text-xs text-slate-600">${escapeHtml(r.source)}</td>
        <td><span class="badge badge-approved">${escapeHtml(r.urgency)}</span></td>
        <td class="text-xs text-slate-500">${escapeHtml(r.date)}</td>
      </tr>
    `;
    })
    .join('');
};

document.getElementById('recSearchInput')?.addEventListener('input', renderRecommendationStream);

// ── 7. System Reports & Operational Telemetry ────────────────────

const loadSystemReports = async () => {
  const container = document.getElementById('sysHealthContainer');
  if (!container) return;

  try {
    const data = await apiFetch('/admin/reports/system-health');
    const db = data.database || {};
    const ml = data.ml_engines || {};
    const st = data.storage || {};
    const sec = data.security || {};

    container.innerHTML = `
      <div class="sys-health-card">
        <h4>🗄️ Database Telemetry</h4>
        <p>Type: <strong>${escapeHtml(db.type)}</strong></p>
        <p>Status: <strong class="text-emerald-600">${escapeHtml(db.status)}</strong></p>
        <p>Database File: <strong>${db.size_mb} MB</strong></p>
        <p>Total Profiles: <strong>${db.record_counts?.skin_profiles || 0}</strong></p>
      </div>

      <div class="sys-health-card">
        <h4>🧠 AI &amp; ML Engines</h4>
        <p>Skin Health Model: <strong>${escapeHtml(ml.skin_health_scoring)}</strong></p>
        <p>Risk Engine: <strong>${escapeHtml(ml.risk_assessment_engine)}</strong></p>
        <p>Priority Engine: <strong>${escapeHtml(ml.priority_concern_model)}</strong></p>
        <p>Intelligence: <strong>${escapeHtml(ml.ingredient_intelligence)}</strong></p>
      </div>

      <div class="sys-health-card">
        <h4>📁 Storage &amp; Static Assets</h4>
        <p>Upload Directory: <strong>/${escapeHtml(st.uploads_directory)}</strong></p>
        <p>Stored Photo Files: <strong>${st.file_count} files</strong></p>
        <p>Total Storage: <strong>${st.total_size_mb} MB</strong></p>
      </div>

      <div class="sys-health-card">
        <h4>🛡️ Security Configuration</h4>
        <p>Algorithm: <strong>${escapeHtml(sec.jwt_algorithm)}</strong></p>
        <p>JWT Expiration: <strong>${sec.token_validity_hours} hours</strong></p>
        <p>CORS Origin Check: <strong>${escapeHtml(sec.cors_protection)}</strong></p>
        <p>Security Headers: <strong>Active</strong></p>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<p class="empty-msg text-red-500">Failed to load system diagnostics: ${escapeHtml(err.message)}</p>`;
  }
};

// Global Report Downloader (PDF, Excel, CSV, JSON)
window.downloadReport = async (reportType, format = 'pdf') => {
  const btn = window.event?.currentTarget;
  const originalText = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ Generating...';
  }

  try {
    const res = await fetch(`/admin/reports/export/${reportType}?format=${format}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Export download failed' }));
      throw new Error(err.detail || `Server returned ${res.status}`);
    }

    const blob = await res.blob();
    const ext = format === 'excel' ? 'xlsx' : format;
    let filename = `${reportType}_report.${ext}`;
    const disposition = res.headers.get('Content-Disposition');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    showToast(`Report downloaded successfully (${filename})`, 'success');
  } catch (err) {
    showToast(`Download error: ${err.message}`, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }
};

// ── Boot ─────────────────────────────────────────────────────────

verifyAdmin();
