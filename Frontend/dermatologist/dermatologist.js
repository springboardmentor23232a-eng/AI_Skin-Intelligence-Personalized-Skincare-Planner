/* ─────────────────────────────────────────────────────────────
   Dermatologist Dashboard — Clinical Logic & Patient Insights
───────────────────────────────────────────────────────────── */

const token = localStorage.getItem('access_token');
let currentDerm = null;
let allPatients = [];
let allReports = [];
let allTreatments = [];
let activePatientId = null;
let dermTrendChart = null;

// ── HTML Sanitization Utility (XSS protection) ──────────────────
const escapeHtml = (str) => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// ── Toast Utility ────────────────────────────────────────────────
let toastTimer = null;
const showToast = (msg, type = 'success') => {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

// ── Auth Guard & Verification ────────────────────────────────────
const verifyDermatologist = async () => {
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
    if (data.role !== 'dermatologist' && data.role !== 'admin') {
      clearSession();
      return;
    }

    currentDerm = data;
    const nameEl = document.getElementById('sidebarDermName');
    if (nameEl) nameEl.textContent = `Dr. ${data.email.split('@')[0]}`;

    // Verify approval status
    const statusRes = await fetch('/auth/status', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const statusData = await statusRes.json().catch(() => ({}));
    if (statusData.status === 'pending' || statusData.status === 'rejected') {
      showStatusOverlay(statusData.status, data.email);
      return;
    }

    // Load main dashboard data
    await refreshAllData();
  } catch (err) {
    console.error('Auth check error:', err);
    clearSession();
  }
};

const clearSession = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_role');
  window.location.replace('../index.html');
};

const showStatusOverlay = (status, email) => {
  const overlay = document.getElementById('statusOverlay');
  const title = document.getElementById('statusTitle');
  const msg = document.getElementById('statusMessage');
  const emailEl = document.getElementById('statusEmail');
  if (!overlay) return;

  overlay.classList.remove('hidden');
  if (emailEl) emailEl.textContent = email;

  if (status === 'rejected') {
    if (title) title.textContent = 'Account Registration Declined';
    if (msg) msg.textContent = 'Your dermatologist account application has not been approved by the platform medical administration.';
    const icon = document.getElementById('statusIcon');
    if (icon) icon.className = 'status-icon rejected-icon';
  }
};

document.getElementById('statusLogout')?.addEventListener('click', clearSession);
document.getElementById('headerLogout')?.addEventListener('click', (e) => {
  e.preventDefault();
  clearSession();
});

// ── Navigation ───────────────────────────────────────────────────
const sections = {
  patients: {
    el: document.getElementById('section-patients'),
    nav: document.getElementById('navPatients'),
    title: 'Patient Insights',
    subtitle: 'Clinical profiles, medical diagnostics & triage management',
  },
  'condition-reports': {
    el: document.getElementById('section-condition-reports'),
    nav: document.getElementById('navConditionReports'),
    title: 'Skin Condition Reports',
    subtitle: 'Timeline of patient dermatological assessments and severity triage',
  },
  treatments: {
    el: document.getElementById('section-treatments'),
    nav: document.getElementById('navTreatments'),
    title: 'Treatment Recommendations',
    subtitle: 'Prescribe clinical actives, medical treatments & coordinate daily routines',
  },
  analytics: {
    el: document.getElementById('section-analytics'),
    nav: document.getElementById('navAnalytics'),
    title: 'Progress Analytics',
    subtitle: 'Longitudinal recovery trajectories, adherence consistency & clinical audits',
  },
  'export-reports': {
    el: document.getElementById('section-export-reports'),
    nav: document.getElementById('navExportReports'),
    title: 'Clinical Reports & Export Center',
    subtitle: 'Generate and download comprehensive patient PDF and Excel reports',
  },
};

const showSection = (key) => {
  Object.entries(sections).forEach(([k, s]) => {
    if (s.el) s.el.classList.toggle('active', k === key);
    if (s.nav) s.nav.classList.toggle('active', k === key);
  });
  const sec = sections[key];
  if (sec) {
    const titleEl = document.getElementById('pageTitle');
    const subEl = document.getElementById('pageSubtitle');
    if (titleEl) titleEl.textContent = sec.title;
    if (subEl) subEl.textContent = sec.subtitle;
  }
};

document.querySelectorAll('.sidebar-nav .nav-item').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const secKey = link.getAttribute('data-section');
    showSection(secKey);
    closeSidebar();
  });
});

// ── Mobile Sidebar Controls ──────────────────────────────────────
const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
const openSidebar = () => {
  sidebar?.classList.add('open');
  sidebarBackdrop?.classList.add('open');
};
const closeSidebar = () => {
  sidebar?.classList.remove('open');
  sidebarBackdrop?.classList.remove('open');
};
document.getElementById('mobileMenuBtn')?.addEventListener('click', openSidebar);
document.getElementById('closeSidebarBtn')?.addEventListener('click', closeSidebar);
sidebarBackdrop?.addEventListener('click', closeSidebar);

// ── API Fetch Helper ─────────────────────────────────────────────
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
    throw new Error(err.detail || 'Clinical API request failed');
  }
  return res.json();
};

// ── Data Refresh & Orchestration ─────────────────────────────────
const refreshAllData = async () => {
  const refreshBtn = document.getElementById('btnRefreshData');
  if (refreshBtn) refreshBtn.classList.add('spinning');
  try {
    await Promise.all([
      loadPatients(),
      loadReports(),
      loadTreatments(),
      loadFormulasCatalog(),
    ]);
  } catch (err) {
    showToast(`Data load notice: ${err.message}`, 'error');
  } finally {
    if (refreshBtn) refreshBtn.classList.remove('spinning');
  }
};

document.getElementById('btnRefreshData')?.addEventListener('click', refreshAllData);

// ── 1. Patient Insights Logic ────────────────────────────────────
let currentFilter = 'all';

const loadPatients = async () => {
  const grid = document.getElementById('assignedPatientsGrid');
  try {
    const data = await apiFetch('/dermatologist/my-patients');
    allPatients = data.patients || [];

    const badge = document.getElementById('sidebarPatientCount');
    if (badge) badge.textContent = allPatients.length;

    // Populate patient dropdowns
    populatePatientSelects();

    // Render patient roster grid & progress matrix
    renderPatientsGrid();
    renderProgressMatrix();
  } catch (err) {
    if (grid) grid.innerHTML = `<p class="empty-clients-msg text-red-500">Failed to load patient roster: ${escapeHtml(err.message)}</p>`;
  }
};

const populatePatientSelects = () => {
  const repSelect = document.getElementById('reportPatientFilter');
  const rxSelect = document.getElementById('prescribePatientSelect');

  if (repSelect) {
    const prev = repSelect.value;
    repSelect.innerHTML = '<option value="all">All Assigned Patients</option>';
    allPatients.forEach((p) => {
      repSelect.innerHTML += `<option value="${p.id}">${escapeHtml(p.name)} (${escapeHtml(p.email)})</option>`;
    });
    repSelect.value = prev || 'all';
  }

  if (rxSelect) {
    rxSelect.innerHTML = '<option value="">— Choose an assigned patient —</option>';
    allPatients.forEach((p) => {
      rxSelect.innerHTML += `<option value="${p.id}">${escapeHtml(p.name)} (${escapeHtml(p.email)})</option>`;
    });
  }

  const exportSelect = document.getElementById('reportPatientSelector');
  if (exportSelect) {
    const prev = exportSelect.value;
    exportSelect.innerHTML = '<option value="">-- Choose a patient --</option>';
    allPatients.forEach((p) => {
      exportSelect.innerHTML += `<option value="${p.id}">${escapeHtml(p.name)} (${escapeHtml(p.email)})</option>`;
    });
    if (prev) exportSelect.value = prev;
  }
};

const renderPatientsGrid = () => {
  const grid = document.getElementById('assignedPatientsGrid');
  if (!grid) return;

  const searchVal = document.getElementById('patientSearch')?.value.toLowerCase().trim() || '';

  const filtered = allPatients.filter((p) => {
    // Text search
    const matchesSearch =
      !searchVal ||
      p.name.toLowerCase().includes(searchVal) ||
      p.email.toLowerCase().includes(searchVal) ||
      (p.skin_type && p.skin_type.toLowerCase().includes(searchVal)) ||
      (p.skin_concerns && p.skin_concerns.toLowerCase().includes(searchVal)) ||
      (p.allergies && p.allergies.toLowerCase().includes(searchVal));

    if (!matchesSearch) return false;

    // Pill filter
    const score = p.skin_health_score || 0;
    const risk = (p.latest_assessment?.risk_level || 'Low').toLowerCase();
    if (currentFilter === 'critical-risk') return risk === 'critical' || risk === 'high';
    if (currentFilter === 'score-low') return score > 0 && score < 60;
    if (currentFilter === 'active-treatment') return (p.active_treatments_count || 0) > 0;
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="empty-clients-msg">No patients matching current clinical filter.</p>';
    return;
  }

  grid.innerHTML = filtered
    .map((p) => {
      const initials = p.name.charAt(0).toUpperCase() || 'P';
      const score = p.skin_health_score ? `${p.skin_health_score}/100` : 'Unrated';
      const risk = p.latest_assessment?.risk_level || 'Low';
      const riskClass = risk.toLowerCase();
      const concernsList = (p.skin_concerns || '')
        .split(/[,;]/)
        .map((c) => c.trim())
        .filter(Boolean)
        .slice(0, 3);

      return `
      <div class="client-card" onclick="openPatientReport(${p.id})">
        <div class="client-card-header">
          <div class="client-card-info">
            <div class="client-avatar-badge">${escapeHtml(initials)}</div>
            <div>
              <h3 class="client-name-title">${escapeHtml(p.name)}</h3>
              <p class="client-email-sub">${escapeHtml(p.email)}</p>
            </div>
          </div>
          <span class="score-pill">Score: ${score}</span>
        </div>

        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="risk-pill ${escapeHtml(riskClass)}">${escapeHtml(risk)} Risk</span>
            <span class="client-tag font-semibold">Type: ${escapeHtml(p.skin_type)}</span>
          </div>
          <div class="client-tags-row">
            ${concernsList.map((c) => `<span class="client-tag">${escapeHtml(c)}</span>`).join('')}
            ${p.allergies ? `<span class="client-tag" style="background:#fee2e2;color:#b91c1c;">⚠️ ${escapeHtml(p.allergies)}</span>` : ''}
          </div>
        </div>

        <div class="client-card-footer">
          <span class="text-xs text-slate-500 font-medium">Rx Treatments: <strong>${p.active_treatments_count || 0}</strong></span>
          <button type="button" class="card-action-btn" onclick="event.stopPropagation(); openPatientReport(${p.id});">
            View Medical Report →
          </button>
        </div>
      </div>
    `;
    })
    .join('');
};

document.getElementById('patientSearch')?.addEventListener('input', renderPatientsGrid);
document.getElementById('patientSearchBtn')?.addEventListener('click', renderPatientsGrid);

document.querySelectorAll('.filter-pills-row .filter-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.filter-pills-row .filter-pill').forEach((b) => b.classList.remove('active'));
    pill.classList.add('active');
    currentFilter = pill.getAttribute('data-filter') || 'all';
    renderPatientsGrid();
  });
});

// ── 2. Skin Condition Reports Logic ──────────────────────────────
const loadReports = async () => {
  const container = document.getElementById('conditionReportList');
  try {
    const data = await apiFetch('/dermatologist/reports');
    allReports = data.reports || [];
    renderReportsList();
  } catch (err) {
    if (container) container.innerHTML = `<p class="empty-clients-msg text-red-500">Failed to load reports: ${escapeHtml(err.message)}</p>`;
  }
};

const renderReportsList = () => {
  const container = document.getElementById('conditionReportList');
  if (!container) return;

  const patientFilter = document.getElementById('reportPatientFilter')?.value || 'all';
  const riskFilter = document.getElementById('reportRiskFilter')?.value || 'all';

  const filtered = allReports.filter((r) => {
    if (patientFilter !== 'all' && String(r.patient_id) !== patientFilter) return false;
    if (riskFilter !== 'all' && r.overall_risk_level.toLowerCase() !== riskFilter.toLowerCase()) return false;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<p class="empty-clients-msg">No clinical condition reports matching filters.</p>';
    return;
  }

  container.innerHTML = filtered
    .map((r) => {
      const riskClass = (r.overall_risk_level || 'Low').toLowerCase();
      const dateStr = r.assessment_date ? new Date(r.assessment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
      return `
      <div class="report-item">
        <div class="report-header-row">
          <div>
            <h4 class="report-title">${escapeHtml(r.patient_name)}</h4>
            <span class="report-meta">Assessment Session • ${dateStr} • Trigger: ${escapeHtml(r.trigger_source)}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="score-pill">Score: ${r.skin_health_score}/100</span>
            <span class="risk-pill ${escapeHtml(riskClass)}">${escapeHtml(r.overall_risk_level)} Risk</span>
            <button type="button" class="btn-primary-small" onclick="openPatientReport(${r.patient_id})">
              Inspect Patient Report
            </button>
          </div>
        </div>
        ${
          r.priorities && r.priorities.length > 0
            ? `
          <div class="report-priorities-grid">
            ${r.priorities
              .map(
                (p) => `
              <span class="client-tag" style="background:#f1f5f9;font-weight:600;">
                #${p.priority_rank} ${escapeHtml(p.concern_name)} (${escapeHtml(p.severity)})
              </span>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }
        ${r.notes ? `<p class="text-xs text-slate-600 mt-1 italic">Specialist Notes: "${escapeHtml(r.notes)}"</p>` : ''}
      </div>
    `;
    })
    .join('');
};

document.getElementById('reportPatientFilter')?.addEventListener('change', renderReportsList);
document.getElementById('reportRiskFilter')?.addEventListener('change', renderReportsList);

// ── 3. Treatment Recommendations Logic ───────────────────────────
const loadTreatments = async () => {
  const tbody = document.getElementById('treatmentsTableBody');
  try {
    const data = await apiFetch('/dermatologist/treatments');
    allTreatments = data.treatments || [];
    renderTreatmentsTable();
  } catch (err) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-red-500">Failed to load treatments: ${escapeHtml(err.message)}</td></tr>`;
  }
};

const renderTreatmentsTable = () => {
  const tbody = document.getElementById('treatmentsTableBody');
  if (!tbody) return;

  if (allTreatments.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-slate-500">No clinical treatments prescribed yet.</td></tr>';
    return;
  }

  tbody.innerHTML = allTreatments
    .map((t) => {
      const dateStr = t.created_at ? new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
      const urgencyClass = t.urgency_level === 'Urgent' ? 'critical' : t.urgency_level === 'Priority' ? 'high' : 'low';
      return `
      <tr>
        <td class="font-semibold text-slate-800">${escapeHtml(t.patient_name)}</td>
        <td class="font-bold text-sky-700">${escapeHtml(t.diagnosis_title)}</td>
        <td class="text-xs text-slate-600 max-w-xs truncate">${escapeHtml(t.treatment_plan)}</td>
        <td class="text-xs font-semibold text-slate-700">${escapeHtml(t.medications_or_actives || 'None')}</td>
        <td><span class="risk-pill ${escapeHtml(urgencyClass)}">${escapeHtml(t.urgency_level)}</span></td>
        <td class="text-xs text-slate-500">${dateStr}</td>
      </tr>
    `;
    })
    .join('');
};

const loadFormulasCatalog = async () => {
  const grid = document.getElementById('clinicalFormulasGrid');
  try {
    const data = await apiFetch('/api/products/catalog');
    const catalog = data.products || data || [];
    renderFormulasCatalog(catalog);
  } catch (err) {
    if (grid) grid.innerHTML = `<p class="empty-clients-msg text-slate-500">Standard clinical formula index active.</p>`;
  }
};

let activeFormulaCategory = 'all';

const renderFormulasCatalog = (catalog) => {
  const grid = document.getElementById('clinicalFormulasGrid');
  if (!grid) return;

  const searchVal = document.getElementById('dermProductSearchInput')?.value.toLowerCase().trim() || '';

  const filtered = (catalog || []).filter((p) => {
    const matchesCat = activeFormulaCategory === 'all' || p.category === activeFormulaCategory;
    const matchesSearch =
      !searchVal ||
      (p.name && p.name.toLowerCase().includes(searchVal)) ||
      (p.actives && p.actives.toLowerCase().includes(searchVal)) ||
      (p.brand && p.brand.toLowerCase().includes(searchVal));
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="empty-clients-msg">No formulations matching criteria.</p>';
    return;
  }

  grid.innerHTML = filtered
    .slice(0, 24)
    .map((p) => {
      return `
      <div class="rec-product-card">
        <div>
          <div class="rec-product-header">
            <h4 class="rec-prod-name">${escapeHtml(p.name)}</h4>
            <span class="client-tag">${escapeHtml(p.category || 'Treatment')}</span>
          </div>
          <p class="rec-prod-desc mt-2">${escapeHtml(p.description || p.tagline || '')}</p>
          <div class="mt-2 text-xs font-semibold text-sky-800">
            Active Actives: ${escapeHtml(p.actives || 'Dermatological formula')}
          </div>
        </div>
        <button type="button" class="btn-primary-small mt-3 w-full justify-center" onclick="openGlobalPrescribeWithFormula('${escapeHtml(p.name)}', '${escapeHtml(p.actives || '')}')">
          <span>🩺</span> Prescribe this Formula
        </button>
      </div>
    `;
    })
    .join('');
};

document.querySelectorAll('#dermCatTabs .cons-cat-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#dermCatTabs .cons-cat-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    activeFormulaCategory = btn.getAttribute('data-cat') || 'all';
    loadFormulasCatalog();
  });
});

document.getElementById('dermProductSearchInput')?.addEventListener('input', () => loadFormulasCatalog());

// ── 4. Progress Analytics Logic ──────────────────────────────────
const renderProgressMatrix = () => {
  const tbody = document.getElementById('dermProgressTableBody');
  if (!tbody) return;

  if (allPatients.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-slate-500">No patient progress records to display.</td></tr>';
    return;
  }

  // Calculate KPIs
  const scores = allPatients.map((p) => p.skin_health_score).filter((s) => s > 0);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : '--';
  const adherences = allPatients.map((p) => p.adherence?.adherence_percentage || 0);
  const avgAdherence = adherences.length ? Math.round(adherences.reduce((a, b) => a + b, 0) / adherences.length) : '--';
  const criticalCount = allPatients.filter((p) => {
    const r = (p.latest_assessment?.risk_level || '').toLowerCase();
    return r === 'critical' || r === 'high';
  }).length;

  const elAvgScore = document.getElementById('kpiAvgScore');
  const elAvgComp = document.getElementById('kpiAvgCompliance');
  const elTotal = document.getElementById('kpiTotalPatients');
  const elCrit = document.getElementById('kpiCriticalAlerts');

  if (elAvgScore) elAvgScore.textContent = `${avgScore}/100`;
  if (elAvgComp) elAvgComp.textContent = `${avgAdherence}%`;
  if (elTotal) elTotal.textContent = allPatients.length;
  if (elCrit) elCrit.textContent = criticalCount;

  tbody.innerHTML = allPatients
    .map((p) => {
      const risk = p.latest_assessment?.risk_level || 'Low';
      const riskClass = risk.toLowerCase();
      const currentScore = p.skin_health_score || 0;
      const adhPct = p.adherence?.adherence_percentage || 0;
      const streak = p.adherence?.streak || 0;
      return `
      <tr>
        <td class="font-semibold text-slate-800">${escapeHtml(p.name)}</td>
        <td class="text-xs text-slate-600">${escapeHtml(p.skin_type || 'Normal')}</td>
        <td class="text-xs font-semibold">65</td>
        <td class="font-bold text-sky-700">${currentScore}/100</td>
        <td><span class="score-pill" style="background:#dcfce7;color:#15803d;">+${Math.max(0, currentScore - 65)} pts</span></td>
        <td class="font-semibold text-slate-700">${adhPct}%</td>
        <td class="text-xs font-semibold text-indigo-700">${streak}d streak</td>
        <td><span class="risk-pill ${escapeHtml(riskClass)}">${escapeHtml(risk)}</span></td>
        <td>
          <button type="button" class="btn-primary-small" onclick="openPatientReport(${p.id})">
            Inspect →
          </button>
        </td>
      </tr>
    `;
    })
    .join('');
};

// ── 5. Patient Medical Report Modal Implementation ──────────────
const openPatientReport = async (patientId) => {
  activePatientId = patientId;
  const modal = document.getElementById('patientModal');
  if (!modal) return;
  modal.classList.remove('hidden');

  // Reset tabs
  document.querySelectorAll('.report-nav-tabs .report-tab-btn, .dossier-nav-tabs .dossier-tab-btn').forEach((b) => b.classList.remove('active'));
  document.querySelector('[data-report-tab="profile"], [data-dossier-tab="profile"]')?.classList.add('active');
  document.querySelectorAll('.report-tab-pane, .dossier-tab-pane').forEach((p) => p.classList.remove('active'));
  (document.getElementById('reportTab-profile') || document.getElementById('dossierTab-profile'))?.classList.add('active');

  try {
    const data = await apiFetch(`/dermatologist/patient/${patientId}`);
    renderPatientReport(data);
    loadPatientAnalytics(patientId);
  } catch (err) {
    showToast(`Error fetching patient report: ${err.message}`, 'error');
  }
};

const renderPatientReport = (data) => {
  const p = data.patient || {};
  const prof = data.profile || {};
  const latest = data.latest_assessment || {};

  // Header
  const nameEl = document.getElementById('modalPatientName');
  const emailEl = document.getElementById('modalPatientEmail');
  const avatarEl = document.getElementById('modalPatientAvatar');
  const scoreBadge = document.getElementById('modalPatientScoreBadge');
  const riskBadge = document.getElementById('modalPatientRiskBadge');

  if (nameEl) nameEl.textContent = p.name || 'Patient';
  if (emailEl) emailEl.textContent = p.email || '';
  if (avatarEl) avatarEl.textContent = (p.name || 'P').charAt(0).toUpperCase();

  const scoreVal = prof.skin_health_score || latest.skin_health_score || 0;
  if (scoreBadge) scoreBadge.textContent = `Score: ${scoreVal}/100`;

  const risk = latest.overall_risk_level || 'Low';
  if (riskBadge) {
    riskBadge.textContent = `${risk} Risk`;
    riskBadge.className = `risk-pill ${risk.toLowerCase()}`;
  }

  // TAB 1: Profile & Allergies
  const grid = document.getElementById('modalPatientProfileGrid');
  if (grid) {
    grid.innerHTML = `
      <div class="modal-grid-item"><span class="item-label">Skin Type</span><span class="item-val">${escapeHtml(prof.skin_type || 'Unspecified')}</span></div>
      <div class="modal-grid-item"><span class="item-label">Age Group</span><span class="item-val">${escapeHtml(prof.age_group || 'Unspecified')}</span></div>
      <div class="modal-grid-item"><span class="item-label">Primary Concerns</span><span class="item-val">${escapeHtml(prof.skin_concerns || 'None reported')}</span></div>
      <div class="modal-grid-item"><span class="item-label">Documented Allergies</span><span class="item-val text-red-600 font-bold">${escapeHtml(prof.allergies || 'None declared')}</span></div>
      <div class="modal-grid-item"><span class="item-label">Sensitivities</span><span class="item-val">${escapeHtml(prof.sensitivities || 'None')}</span></div>
      <div class="modal-grid-item"><span class="item-label">Lifestyle / Stress</span><span class="item-val">${escapeHtml(prof.lifestyle_habits || 'Normal')}</span></div>
      <div class="modal-grid-item"><span class="item-label">Water Intake</span><span class="item-val">${escapeHtml(prof.water_intake || 'Adequate')}</span></div>
      <div class="modal-grid-item"><span class="item-label">Sleep Quality</span><span class="item-val">${escapeHtml(prof.sleep_quality || 'Normal')}</span></div>
    `;
  }

  const imgEl = document.getElementById('modalPatientImage');
  const noImg = document.getElementById('noPatientImageText');
  if (prof.image_url) {
    if (imgEl) {
      imgEl.src = prof.image_url;
      imgEl.classList.remove('hidden');
    }
    if (noImg) noImg.classList.add('hidden');
  } else {
    if (imgEl) imgEl.classList.add('hidden');
    if (noImg) noImg.classList.remove('hidden');
  }

  const idEl = document.getElementById('modalPatientId');
  const regEl = document.getElementById('modalPatientRegistered');
  if (idEl) idEl.textContent = `#${p.id}`;
  if (regEl) regEl.textContent = p.created_at ? new Date(p.created_at).toLocaleDateString() : '—';

  // TAB 2: AI Diagnostics & Risks
  const scoreNumber = document.getElementById('modalTabScoreVal');
  const catTag = document.getElementById('modalTabCategoryTag');
  if (scoreNumber) scoreNumber.textContent = scoreVal;
  if (catTag) catTag.textContent = `Category: ${latest.skin_health_category || 'Evaluated'}`;

  const risksContainer = document.getElementById('modalRisksContainer');
  if (risksContainer) {
    if (latest.risks && latest.risks.length) {
      risksContainer.innerHTML = latest.risks
        .map(
          (r) => `
        <div class="report-item mb-2">
          <div class="flex items-center justify-between">
            <strong class="text-sm font-bold text-slate-800">${escapeHtml(r.risk_title)}</strong>
            <span class="risk-pill ${escapeHtml((r.risk_level || 'Low').toLowerCase())}">${escapeHtml(r.risk_level)}</span>
          </div>
          <p class="text-xs text-slate-600 mt-1">${escapeHtml(r.description)}</p>
          <p class="text-xs font-semibold text-emerald-700 mt-1">Clinical Rec: ${escapeHtml(r.recommendation)}</p>
        </div>
      `
        )
        .join('');
    } else {
      risksContainer.innerHTML = '<p class="empty-compact-msg">No critical dermatological risk factors flagged.</p>';
    }
  }

  const prioritiesContainer = document.getElementById('modalPrioritiesContainer');
  if (prioritiesContainer) {
    if (latest.priorities && latest.priorities.length) {
      prioritiesContainer.innerHTML = latest.priorities
        .map(
          (pr) => `
        <div class="modal-grid-item mb-1 flex items-center justify-between">
          <span class="font-bold text-xs text-slate-800">#${pr.priority_rank} ${escapeHtml(pr.concern_name)}</span>
          <span class="risk-pill ${escapeHtml((pr.severity || 'Low').toLowerCase())}">Severity: ${escapeHtml(pr.severity)}</span>
        </div>
      `
        )
        .join('');
    } else {
      prioritiesContainer.innerHTML = '<p class="empty-compact-msg">No active prioritized concerns.</p>';
    }
  }

  // TAB 3: Treatments & Live Routine
  const treatmentsList = document.getElementById('modalPatientTreatmentsList');
  if (treatmentsList) {
    if (data.treatments && data.treatments.length) {
      treatmentsList.innerHTML = data.treatments
        .map(
          (t) => `
        <div class="report-item mb-2" style="border-left: 4px solid #0284c7;">
          <div class="flex items-center justify-between">
            <strong class="text-sm font-bold text-sky-800">Rx: ${escapeHtml(t.diagnosis_title)}</strong>
            <span class="risk-pill ${t.urgency_level === 'Urgent' ? 'critical' : t.urgency_level === 'Priority' ? 'high' : 'low'}">${escapeHtml(t.urgency_level)}</span>
          </div>
          <p class="text-xs text-slate-700 mt-1 font-medium">${escapeHtml(t.treatment_plan)}</p>
          <p class="text-xs text-slate-500 mt-1">Actives: <strong>${escapeHtml(t.medications_or_actives || 'None')}</strong> • Prescribed by: ${escapeHtml(t.dermatologist_name)}</p>
        </div>
      `
        )
        .join('');
    } else {
      treatmentsList.innerHTML = '<p class="empty-compact-msg">No clinical treatments prescribed for this patient yet.</p>';
    }
  }

  const mList = document.getElementById('modalMorningStepsList');
  const eList = document.getElementById('modalEveningStepsList');
  const wList = document.getElementById('modalWeeklyStepsList');

  if (mList) mList.innerHTML = '';
  if (eList) eList.innerHTML = '';
  if (wList) wList.innerHTML = '';

  (data.routine_steps || []).forEach((step) => {
    const item = `
      <div class="compact-step-item">
        <strong class="text-slate-800">${escapeHtml(step.step_title)}</strong>
        <p class="text-slate-500 text-xs mt-0.5">${escapeHtml(step.description || '')}</p>
        ${step.active_ingredients ? `<span class="text-sky-700 text-xs font-semibold">Actives: ${escapeHtml(step.active_ingredients)}</span>` : ''}
      </div>
    `;
    if (step.time_of_day === 'morning' && mList) mList.innerHTML += item;
    else if (step.time_of_day === 'evening' && eList) eList.innerHTML += item;
    else if (wList) wList.innerHTML += item;
  });

  if (mList && !mList.innerHTML) mList.innerHTML = '<p class="empty-compact-msg">No morning steps recorded.</p>';
  if (eList && !eList.innerHTML) eList.innerHTML = '<p class="empty-compact-msg">No evening steps recorded.</p>';
  if (wList && !wList.innerHTML) wList.innerHTML = '<p class="empty-compact-msg">No weekly treatments recorded.</p>';

  // TAB 4: Assessment History
  const historyList = document.getElementById('modalAssessmentHistoryList');
  const historyBadge = document.getElementById('modalHistoryCountBadge');
  if (historyBadge) historyBadge.textContent = `${(data.assessment_history || []).length} Sessions Logged`;
  if (historyList) {
    if (data.assessment_history && data.assessment_history.length) {
      historyList.innerHTML = data.assessment_history
        .map(
          (h) => `
        <div class="report-item mb-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-800">${h.assessment_date ? new Date(h.assessment_date).toLocaleDateString() : '—'} • Trigger: ${escapeHtml(h.trigger_source)}</span>
            <div class="flex items-center gap-2">
              <span class="score-pill">Score: ${h.skin_health_score}/100</span>
              <span class="risk-pill ${escapeHtml((h.overall_risk_level || 'Low').toLowerCase())}">${escapeHtml(h.overall_risk_level)}</span>
            </div>
          </div>
          ${h.notes ? `<p class="text-xs text-slate-600 mt-1">"${escapeHtml(h.notes)}"</p>` : ''}
        </div>
      `
        )
        .join('');
    } else {
      historyList.innerHTML = '<p class="empty-compact-msg">No past assessment sessions recorded.</p>';
    }
  }

  // TAB 5: Compliance
  const adh = data.adherence || {};
  const adhPct = document.getElementById('modalAdherencePct');
  const streakEl = document.getElementById('modalAdherenceStreak');
  const totalDays = document.getElementById('modalAdherenceTotalDays');
  const morningCnt = document.getElementById('modalAdherenceMorning');

  if (adhPct) adhPct.textContent = `${adh.adherence_percentage || 0}%`;
  if (streakEl) streakEl.textContent = `${adh.streak || 0} Days`;
  if (totalDays) totalDays.textContent = adh.total_logged_days || 0;
  if (morningCnt) morningCnt.textContent = adh.morning_completed_count || 0;

  // TAB 6: Analytics & Chart
  initDermTrendChart(data.assessment_history || []);
};

// ── Longitudinal Analytics & Clinical Audit Logic ────────────────
const loadPatientAnalytics = async (patientId) => {
  const scoreChangeEl = document.getElementById('reportAnalyticsScoreChange') || document.getElementById('dossierAnalyticsScoreChange');
  const daysBadge = document.getElementById('reportDataDaysBadge') || document.getElementById('dossierDataDaysBadge');
  const dataContainer = document.getElementById('reportSkinDataComparisonContainer') || document.getElementById('dossierSkinDataComparisonContainer');
  const resolutionCountBadge = document.getElementById('reportResolutionCountBadge') || document.getElementById('dossierResolutionCountBadge');
  const concernTableBody = document.getElementById('reportConcernAuditBody') || document.getElementById('dossierConcernAuditBody');

  try {
    const analytics = await apiFetch(`/dermatologist/patient/${patientId}/analytics`);
    const improvement = analytics.improvement || {};
    const dataComp = analytics.data_comparison || {};

    // 1. Score delta
    if (scoreChangeEl) {
      const delta = improvement.overall_score_change || 0;
      scoreChangeEl.textContent = `${delta >= 0 ? '+' : ''}${delta} pts`;
      scoreChangeEl.style.background = delta >= 0 ? '#dcfce7' : '#fee2e2';
      scoreChangeEl.style.color = delta >= 0 ? '#15803d' : '#b91c1c';
    }

    // 2. Data Comparison
    if (dataContainer) {
      if (!dataComp || !dataComp.can_compare) {
        dataContainer.innerHTML = `
          <div class="p-6 text-center text-xs text-slate-500">
            Patient has only one baseline assessment recorded. At least 2 evaluations are required to compute clinical shifts.
          </div>
        `;
        if (daysBadge) daysBadge.textContent = 'Baseline Established';
      } else {
        const before = dataComp.before_data || {};
        const after = dataComp.after_data || {};
        const deltaComp = dataComp.comparison_delta || {};

        if (daysBadge) {
          daysBadge.textContent = `${deltaComp.days_elapsed || 0} Days Between Assessments`;
        }

        const scoreDiff = deltaComp.score_diff || 0;
        const factors = deltaComp.factor_comparisons || [];
        const verdicts = deltaComp.clinical_verdict || [];

        dataContainer.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem;">
            <div class="modal-grid-item">
              <span class="item-label">Baseline Assessment</span>
              <p class="text-xs font-semibold text-slate-700 mt-1">${escapeHtml(before.formatted_date || 'Baseline')}</p>
              <div class="mt-2 text-2xl font-black text-slate-800">${before.score || 0} <span class="text-xs font-normal text-slate-400">/ 100</span></div>
              <div class="text-xs text-slate-500 mt-1 font-semibold">${escapeHtml(before.category || 'Evaluated')}</div>
            </div>

            <div class="modal-grid-item" style="background:#f0f9ff; border-color:#bae6fd; text-align:center;">
              <span class="item-label" style="color:#0284c7;">Diagnostic Shift</span>
              <div class="mt-2 text-2xl font-black ${scoreDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}">
                ${scoreDiff >= 0 ? '+' : ''}${scoreDiff} pts
              </div>
              <span class="text-xs font-bold text-sky-800">
                ${deltaComp.percent_change >= 0 ? '+' : ''}${deltaComp.percent_change || 0}% Change
              </span>
            </div>

            <div class="modal-grid-item">
              <span class="item-label">Current Assessment</span>
              <p class="text-xs font-semibold text-slate-700 mt-1">${escapeHtml(after.formatted_date || 'Recent')}</p>
              <div class="mt-2 text-2xl font-black text-sky-700">${after.score || 0} <span class="text-xs font-normal text-slate-400">/ 100</span></div>
              <div class="text-xs text-slate-500 mt-1 font-semibold">${escapeHtml(after.category || 'Evaluated')}</div>
            </div>
          </div>

          ${factors.length > 0 ? `
            <div class="modal-grid-item mt-2">
              <h4 class="text-xs font-bold text-slate-800 mb-2">5-Factor Sub-Scores Comparison</h4>
              <div class="flex flex-col gap-2">
                ${factors.map(f => `
                  <div class="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-b-0">
                    <span class="font-medium text-slate-700">${f.icon || '•'} ${escapeHtml(f.label)}</span>
                    <div class="flex items-center gap-2">
                      <span class="text-slate-400">${f.before_score} ➔ <strong class="text-slate-800">${f.after_score}</strong></span>
                      <span class="risk-pill ${f.diff > 0 ? 'low' : (f.diff < 0 ? 'critical' : 'medium')}">
                        ${escapeHtml(f.diff_label)}
                      </span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${verdicts.length > 0 ? `
            <div class="modal-grid-item mt-2" style="background:#f0fdf4; border-color:#bbf7d0;">
              <span class="item-label" style="color:#15803d;">Clinical Diagnosis Verdict</span>
              <div class="text-xs text-emerald-900 mt-1 flex flex-col gap-1">
                ${verdicts.map(v => `<p>• ${escapeHtml(v)}</p>`).join('')}
              </div>
            </div>
          ` : ''}
        `;
      }
    }

    // 3. Concern Resolution Table
    if (concernTableBody) {
      const audits = improvement.concerns_audit || [];
      if (audits.length === 0) {
        concernTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-xs text-slate-500">No active concern resolution logs.</td></tr>';
        if (resolutionCountBadge) resolutionCountBadge.textContent = '0 Audited';
      } else {
        const resolvedCount = audits.filter(a => a.status === 'Resolved' || a.status === 'Improved').length;
        if (resolutionCountBadge) resolutionCountBadge.textContent = `${resolvedCount} of ${audits.length} Resolved / Improved`;

        concernTableBody.innerHTML = audits.map(a => `
          <tr>
            <td class="font-semibold text-slate-800">${escapeHtml(a.concern)}</td>
            <td>${escapeHtml(a.baseline_severity)}</td>
            <td class="font-medium ${a.current_severity === 'Resolved' ? 'text-emerald-600 font-bold' : ''}">${escapeHtml(a.current_severity)}</td>
            <td>
              <span class="risk-pill ${a.status === 'Resolved' ? 'low' : (a.status === 'Improved' ? 'medium' : 'high')}">
                ${a.icon || ''} ${escapeHtml(a.status)}
              </span>
            </td>
            <td class="font-semibold text-xs ${a.status === 'Resolved' ? 'text-emerald-600' : 'text-slate-600'}">
              ${escapeHtml(a.change_label)}
            </td>
          </tr>
        `).join('');
      }
    }

  } catch (err) {
    console.warn('Analytics loading notice:', err);
  }
};

// Report Tabs Navigation
document.querySelectorAll('.report-nav-tabs .report-tab-btn, .dossier-nav-tabs .dossier-tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.report-nav-tabs .report-tab-btn, .dossier-nav-tabs .dossier-tab-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const tabName = btn.getAttribute('data-report-tab') || btn.getAttribute('data-dossier-tab');
    document.querySelectorAll('.report-tab-pane, .dossier-tab-pane').forEach((p) => p.classList.remove('active'));
    const targetPane = document.getElementById(`reportTab-${tabName}`) || document.getElementById(`dossierTab-${tabName}`);
    if (targetPane) targetPane.classList.add('active');
  });
});

const closePatientModal = () => {
  document.getElementById('patientModal')?.classList.add('hidden');
};
document.getElementById('closePatientModal')?.addEventListener('click', closePatientModal);
document.getElementById('modalBackdrop')?.addEventListener('click', closePatientModal);

// ── 6. Prescribe Treatment Modal Logic ───────────────────────────
const openPrescribeModal = (patientId = null, prefillDiagnosis = '', prefillActives = '') => {
  const modal = document.getElementById('prescribeModal');
  if (!modal) return;
  modal.classList.remove('hidden');

  const idInput = document.getElementById('prescribePatientId');
  const selectGroup = document.getElementById('patientSelectGroup');
  const selectEl = document.getElementById('prescribePatientSelect');

  if (idInput) idInput.value = patientId || '';

  if (patientId) {
    if (selectGroup) selectGroup.classList.add('hidden');
    if (selectEl) selectEl.value = patientId;
  } else {
    if (selectGroup) selectGroup.classList.remove('hidden');
  }

  const diagInput = document.getElementById('prescribeDiagnosis');
  const actInput = document.getElementById('prescribeActives');
  if (diagInput && prefillDiagnosis) diagInput.value = prefillDiagnosis;
  if (actInput && prefillActives) actInput.value = prefillActives;
};

const closePrescribeModal = () => {
  document.getElementById('prescribeModal')?.classList.add('hidden');
  document.getElementById('prescribeForm')?.reset();
};

document.getElementById('btnClosePrescribeModal')?.addEventListener('click', closePrescribeModal);
document.getElementById('btnCancelPrescribeModal')?.addEventListener('click', closePrescribeModal);
document.getElementById('prescribeModalBackdrop')?.addEventListener('click', closePrescribeModal);

document.getElementById('btnOpenGlobalPrescribe')?.addEventListener('click', () => openPrescribeModal());
document.getElementById('btnOpenPrescribeSection')?.addEventListener('click', () => openPrescribeModal());
document.getElementById('btnQuickPrescribeModal')?.addEventListener('click', () => {
  if (activePatientId) openPrescribeModal(activePatientId);
});

window.openGlobalPrescribeWithFormula = (formulaName, actives) => {
  openPrescribeModal(activePatientId, `Rx Protocol: ${formulaName}`, actives);
};

document.getElementById('prescribeForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const patientId = document.getElementById('prescribePatientId')?.value || document.getElementById('prescribePatientSelect')?.value;

  if (!patientId) {
    showToast('Please select a patient for this prescription', 'error');
    return;
  }

  const payload = {
    diagnosis_title: document.getElementById('prescribeDiagnosis')?.value.trim(),
    urgency_level: document.getElementById('prescribeUrgency')?.value,
    treatment_plan: document.getElementById('prescribePlan')?.value.trim(),
    medications_or_actives: document.getElementById('prescribeActives')?.value.trim(),
    time_of_day: document.getElementById('prescribeTimeOfDay')?.value || 'evening',
    clinical_notes: document.getElementById('prescribeNotes')?.value.trim(),
    inject_to_routine: document.getElementById('prescribeInjectRoutine')?.checked ?? true,
    category: 'treatment',
  };

  const submitBtn = document.getElementById('btnSavePrescription');
  if (submitBtn) submitBtn.disabled = true;

  try {
    const res = await apiFetch(`/dermatologist/patient/${patientId}/treatment`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    showToast(res.message || 'Treatment prescribed successfully!', 'success');
    closePrescribeModal();

    // Refresh treatments and current report if open
    await loadTreatments();
    if (activePatientId && String(activePatientId) === String(patientId)) {
      await openPatientReport(activePatientId);
    }
  } catch (err) {
    showToast(`Prescription error: ${err.message}`, 'error');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});

// ── 7. Routine Step Modal Logic ──────────────────────────────────
const openRoutineStepModal = (patientId) => {
  const modal = document.getElementById('routineStepModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  const idInput = document.getElementById('stepPatientId');
  if (idInput) idInput.value = patientId;
};

const closeRoutineStepModal = () => {
  document.getElementById('routineStepModal')?.classList.add('hidden');
  document.getElementById('routineStepForm')?.reset();
};

document.getElementById('btnCloseRoutineStepModal')?.addEventListener('click', closeRoutineStepModal);
document.getElementById('btnCancelRoutineStepModal')?.addEventListener('click', closeRoutineStepModal);
document.getElementById('routineStepModalBackdrop')?.addEventListener('click', closeRoutineStepModal);

document.getElementById('btnAddPatientRoutineStep')?.addEventListener('click', () => {
  if (activePatientId) openRoutineStepModal(activePatientId);
});

document.getElementById('routineStepForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const patientId = document.getElementById('stepPatientId')?.value || activePatientId;
  if (!patientId) return;

  const payload = {
    time_of_day: document.getElementById('stepTimeOfDay')?.value || 'morning',
    category: document.getElementById('stepCategory')?.value || 'treatment',
    step_title: document.getElementById('stepTitle')?.value.trim(),
    description: document.getElementById('stepDescription')?.value.trim(),
    active_ingredients: document.getElementById('stepActives')?.value.trim(),
    frequency: document.getElementById('stepFrequency')?.value.trim() || 'Daily',
    caution_notes: document.getElementById('stepCaution')?.value.trim(),
  };

  const submitBtn = document.getElementById('btnSaveRoutineStep');
  if (submitBtn) submitBtn.disabled = true;

  try {
    await apiFetch(`/dermatologist/patient/${patientId}/routine-step`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    showToast('Clinical step added to patient regimen', 'success');
    closeRoutineStepModal();
    if (activePatientId) openPatientReport(activePatientId);
  } catch (err) {
    showToast(`Error adding routine step: ${err.message}`, 'error');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
});

// Make openPatientReport and openPatientDossier globally accessible for onclick handlers
window.openPatientReport = openPatientReport;
window.openPatientDossier = openPatientReport;

// ── Reports & Export Center Logic ──
const repPatientSelect = document.getElementById('reportPatientSelector');
if (repPatientSelect) {
  repPatientSelect.addEventListener('change', (e) => {
    const cards = document.getElementById('dermReportCards');
    if (cards) {
      cards.style.display = e.target.value ? 'grid' : 'none';
    }
  });
}

async function downloadDermReport(reportType, format) {
  const select = document.getElementById('reportPatientSelector');
  const patientId = select ? select.value : '';
  if (!patientId) {
    showToast('Please select a patient first.', 'error');
    return;
  }

  const btn = event?.currentTarget;
  const originalText = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '⏳ Generating...';
  }

  try {
    const endpoint = `/dermatologist/reports/patient/${patientId}/${reportType}?format=${format}`;
    const token = localStorage.getItem('access_token');
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Download failed' }));
      throw new Error(err.detail || `Server returned ${res.status}`);
    }

    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition');
    let filename = `patient_${patientId}_${reportType}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    showToast('Report downloaded successfully!', 'success');
  } catch (err) {
    console.error('Download error:', err);
    showToast(`Failed to download report: ${err.message}`, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }
}
window.downloadDermReport = downloadDermReport;

// ── Startup ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  verifyDermatologist();
});
