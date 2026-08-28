/* ─────────────────────────────────────────────────────────────
   Consultant Dashboard — Client Synchronization & Care Management
───────────────────────────────────────────────────────────── */

const token = localStorage.getItem('access_token');
let allClients = [];
let currentActiveClient = null;
let allReportsData = [];
let currentFilter = 'all';

// Curated library of professional skincare recommendations
const CURATED_RECOMMENDATIONS = [
  {
    title: 'Barrier Repair Ceramide Cream',
    category: 'moisturizing',
    time_of_day: 'evening',
    description: 'Intensive barrier recovery formula formulated with Ceramides NP, AP, and EOP to restore compromised lipid matrices.',
    active_ingredients: 'Ceramide Complex (1, 3, 6-II), Cholesterol, Fatty Acids, Phytosphingosine',
    frequency: 'Nightly',
    caution_notes: 'Patch test before first application.',
    tip: 'Apply liberally over damp skin to seal in hydration.',
  },
  {
    title: '2% Salicylic Acid Purifying Gel Cleanser',
    category: 'cleansing',
    time_of_day: 'morning',
    description: 'Oil-soluble BHA cleanser that unclogs sebum build-up deep within pores and reduces micro-comedones.',
    active_ingredients: 'Salicylic Acid 2%, Tea Tree Leaf Extract, Allantoin',
    frequency: 'Daily (Morning)',
    caution_notes: 'Avoid contact with eye area.',
    tip: 'Massage gently on T-zone for 60 seconds before rinsing.',
  },
  {
    title: '10% Niacinamide + 1% Zinc PCA Serum',
    category: 'treatment',
    time_of_day: 'morning',
    description: 'Multi-benefit serum regulating sebum excretion, refining pore structure, and reducing post-inflammatory erythema.',
    active_ingredients: 'Niacinamide (Vitamin B3) 10%, Zinc PCA 1%, Tamarindus Indica Seed Gum',
    frequency: 'Daily',
    caution_notes: 'Do not mix in same step with ascorbic acid (Vitamin C).',
    tip: 'Apply 3-4 drops and gently pat into face and neck.',
  },
  {
    title: '15% Vitamin C Antioxidant Complex',
    category: 'treatment',
    time_of_day: 'morning',
    description: 'Potent ethylated L-Ascorbic Acid with Ferulic Acid to neutralize environmental free radicals and brighten uneven tone.',
    active_ingredients: '3-O-Ethyl Ascorbic Acid 15%, Ferulic Acid 0.5%, Vitamin E',
    frequency: 'Daily (Morning)',
    caution_notes: 'Always follow with broad-spectrum SPF.',
    tip: 'Store in a cool, dry place away from direct sunlight.',
  },
  {
    title: 'Triple Peptide Firming & Hydrating Cream',
    category: 'moisturizing',
    time_of_day: 'evening',
    description: 'Targeted bio-peptide complex supporting collagen synthesis and dermal elasticity for aging or fatigued skin.',
    active_ingredients: 'Matrixyl 3000, Copper Tripeptide-1, Multi-molecular Hyaluronic Acid',
    frequency: 'Nightly',
    caution_notes: 'Safe for all skin types.',
    tip: 'Use gentle upward sweeping motions across jawline and neck.',
  },
  {
    title: 'Broad Spectrum SPF 50+ Mineral Fluid',
    category: 'sun_protection',
    time_of_day: 'morning',
    description: 'Non-comedogenic physical UV filter with invisible matte finish and blue-light defense.',
    active_ingredients: 'Zinc Oxide 18%, Titanium Dioxide 4%, Ectoin, Bisabolol',
    frequency: 'Daily (Morning)',
    caution_notes: 'Reapply every 2-3 hours during direct sun exposure.',
    tip: 'Apply 2 finger lengths for complete face and neck coverage.',
  },
  {
    title: 'Advanced Encapsulated Retinol 0.3% Night Elixir',
    category: 'night_care',
    time_of_day: 'evening',
    description: 'Time-release pure retinol targeting cellular turnover, fine lines, and textural irregularities with minimal irritation.',
    active_ingredients: 'Encapsulated Retinol 0.3%, Squalane, Bakuchiol 0.5%, Centella Asiatica',
    frequency: '2-3x / week (Evening only)',
    caution_notes: 'Contraindicated during pregnancy. Requires daily morning sunscreen.',
    tip: 'Start with 2 nights per week, buffering with moisturizer if sensitive.',
  },
  {
    title: 'Hyaluronic 2% + B5 Intense Hydration Gel',
    category: 'treatment',
    time_of_day: 'morning',
    description: 'Multi-depth hydration matrix providing instant plumping and soothing dehydrated epidermal layers.',
    active_ingredients: 'Sodium Hyaluronate (Low, Mid, High MW), Provitamin B5 (Panthenol)',
    frequency: 'Daily',
    caution_notes: 'Apply onto slightly damp skin for best efficacy.',
    tip: 'Layer under barrier cream or daily moisturizer.',
  },
];

// ── Toast System ─────────────────────────────────────────────
const showToast = (message, type = 'success') => {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'error' ? '⚠️' : (type === 'info' ? 'ℹ️' : '✅')}</span>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

// ── Auth Guard & Profile ─────────────────────────────────────
const fetchConsultantProfile = async (tkn, fallbackEmail) => {
  try {
    const res = await fetch('/auth/profile', {
      headers: { Authorization: `Bearer ${tkn}` },
    });
    if (res.ok) {
      const data = await res.json();
      let displayName = data.name ? data.name.trim() : '';
      if (!displayName && fallbackEmail) {
        const handle = fallbackEmail.split('@')[0];
        displayName = handle.charAt(0).toUpperCase() + handle.slice(1);
      }
      const sidebarNameEl = document.getElementById('sidebarConsultantName');
      if (sidebarNameEl) {
        sidebarNameEl.textContent = displayName || 'Consultant Specialist';
      }
    }
  } catch (err) {
    console.error('Error fetching consultant profile:', err);
  }
};

const verifySession = async () => {
  if (!token) {
    window.location.replace('../index.html');
    return;
  }

  try {
    const meResponse = await fetch('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!meResponse.ok) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_role');
      window.location.replace('../index.html');
      return;
    }

    const meData = await meResponse.json().catch(() => ({}));
    if (meData.role !== 'consultant' && meData.role !== 'admin') {
      window.location.replace('../index.html');
      return;
    }

    if (meData.role === 'consultant') {
      await checkAccountStatus(token, meData.email);
    }

    await fetchConsultantProfile(token, meData.email);
    await loadAllDashboardData();
  } catch (err) {
    console.error('Verification error:', err);
  }
};

const checkAccountStatus = async (tkn, email) => {
  const overlay = document.getElementById('statusOverlay');
  const titleEl = document.getElementById('statusTitle');
  const msgEl = document.getElementById('statusMessage');
  const iconEl = document.getElementById('statusIcon');
  const emailEl = document.getElementById('statusEmail');
  const logoutBtn = document.getElementById('statusLogout');

  try {
    const res = await fetch('/auth/status', {
      headers: { Authorization: `Bearer ${tkn}` },
    });
    const data = await res.json().catch(() => ({}));

    if (data.status === 'pending') {
      if (emailEl) emailEl.textContent = email || '';
      if (overlay) overlay.classList.remove('hidden');
    } else if (data.status === 'rejected') {
      if (titleEl) titleEl.textContent = 'Account Rejected';
      if (msgEl) msgEl.textContent = 'Your account has been rejected by the administrator. Please contact support.';
      if (iconEl) {
        iconEl.classList.remove('pending-icon');
        iconEl.classList.add('rejected-icon');
        iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>`;
      }
      if (emailEl) emailEl.textContent = email || '';
      if (overlay) overlay.classList.remove('hidden');
    }
  } catch (_) {}

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_role');
      window.location.href = '../index.html';
    });
  }
};

// ── Master Data Loader ───────────────────────────────────────
const loadAllDashboardData = async () => {
  await Promise.all([
    loadAssignedClients(),
    loadAssessmentReports(),
    loadProgressMetrics(),
  ]);
  initConsultantRecommendations();
};

// ── 1. Assigned Clients ──────────────────────────────────────
const loadAssignedClients = async () => {
  const grid = document.getElementById('assignedClientsGrid');
  const sidebarCount = document.getElementById('sidebarClientCount');
  if (!grid) return;

  try {
    const res = await fetch('/consultant/my-clients', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      grid.innerHTML = '<p class="empty-clients-msg">Failed to load assigned clients.</p>';
      return;
    }
    const data = await res.json();
    allClients = data.clients || [];

    if (sidebarCount) sidebarCount.textContent = allClients.length;

    // Populate client dropdowns in recommendations & reports
    populateClientSelects(allClients);

    applyClientFilters();
  } catch (err) {
    grid.innerHTML = '<p class="empty-clients-msg">Error connecting to server.</p>';
  }
};

const populateClientSelects = (clients) => {
  const recSelect = document.getElementById('recModalClientSelect');
  const repSelect = document.getElementById('reportClientFilter');

  if (recSelect) {
    const current = recSelect.value;
    recSelect.innerHTML = '<option value="">— Select an assigned client —</option>';
    clients.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.name || c.email} (${c.skin_type || 'Unassessed'})`;
      recSelect.appendChild(opt);
    });
    recSelect.value = current;
  }

  if (repSelect) {
    const current = repSelect.value;
    repSelect.innerHTML = '<option value="all">All Assigned Clients</option>';
    clients.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name || c.email;
      repSelect.appendChild(opt);
    });
    repSelect.value = current;
  }
};

const applyClientFilters = () => {
  const query = (document.getElementById('clientSearch')?.value || '').toLowerCase().trim();

  let filtered = allClients;

  if (query) {
    filtered = filtered.filter(c =>
      (c.name || '').toLowerCase().includes(query) ||
      (c.email || '').toLowerCase().includes(query) ||
      (c.skin_type || '').toLowerCase().includes(query) ||
      (c.skin_concerns || '').toLowerCase().includes(query)
    );
  }

  if (currentFilter === 'high-risk') {
    filtered = filtered.filter(c => c.overall_risk_level === 'High' || c.overall_risk_level === 'Critical');
  } else if (currentFilter === 'good-score') {
    filtered = filtered.filter(c => (c.skin_health_score || 0) >= 80);
  } else if (currentFilter === 'needs-assessment') {
    filtered = filtered.filter(c => !c.has_survey || !c.skin_type);
  }

  renderClients(filtered);
};

const renderClients = (clients) => {
  const grid = document.getElementById('assignedClientsGrid');
  if (!grid) return;

  if (!clients.length) {
    grid.innerHTML = `
      <div class="empty-clients-msg" style="grid-column: 1 / -1; padding: 3rem 1rem; text-align: center; background: #ffffff; border-radius: 1.25rem; border: 1px solid var(--border-color);">
        <p style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin: 0 0 0.5rem;">No clients match your filter</p>
        <p style="color: #64748b; margin: 0;">Try adjusting your search criteria or check back once the administrator assigns clients to your portal.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = '';
  clients.forEach((client) => {
    const card = document.createElement('article');
    card.className = 'client-card';
    const displayName = client.name || (client.email ? client.email.split('@')[0] : 'Client');
    const initial = (displayName || 'C').charAt(0).toUpperCase();
    const skinLabel = client.skin_type || 'Unassessed';
    const score = client.skin_health_score || 0;
    const riskLevel = client.overall_risk_level || 'Low';
    const riskClass = riskLevel.toLowerCase();
    const adherencePct = client.adherence ? client.adherence.adherence_percentage : 0;
    const routineCount = client.routine ? client.routine.total_steps : 0;

    let scoreClass = '';
    if (score >= 80) scoreClass = '';
    else if (score >= 60) scoreClass = 'fair';
    else scoreClass = 'low';

    card.innerHTML = `
      <div class="client-card-header">
        <div class="client-avatar">${initial}</div>
        <div class="client-header-meta">
          <h3 class="client-name-title" title="${escapeHtml(displayName)}">${escapeHtml(displayName)}</h3>
          <p class="client-email-sub" title="${escapeHtml(client.email)}">${escapeHtml(client.email)}</p>
        </div>
      </div>
      <div class="client-card-badges">
        <span class="client-skin-tag">🧴 ${escapeHtml(skinLabel)}</span>
        <span class="score-pill ${scoreClass}">AI Score: ${score}/100</span>
        <span class="risk-pill ${riskClass}">${escapeHtml(riskLevel)} Risk</span>
      </div>
      <div class="client-card-stats">
        <div>
          <span class="card-stat-label">Routine Plan</span>
          <span class="card-stat-val">${routineCount} Active Steps</span>
        </div>
        <div>
          <span class="card-stat-label">Adherence</span>
          <span class="card-stat-val">${adherencePct}% Tracking</span>
        </div>
      </div>
      <button class="client-btn" data-client-id="${client.id}">
        <span>🔍</span> View Full Profile & Care Plan
      </button>
    `;

    card.querySelector('.client-btn').addEventListener('click', () => {
      openClientDossier(client.id);
    });

    grid.appendChild(card);
  });
};

// ── 2. Client Dossier Modal & Tabs ───────────────────────────
const openClientDossier = async (clientId, initialTab = 'profile') => {
  const modal = document.getElementById('profileModal');
  if (!modal) return;

  try {
    const res = await fetch(`/consultant/client/${clientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      showToast('Could not load client reports', 'error');
      return;
    }
    const client = await res.json();
    currentActiveClient = client;

    // Header Details
    const displayName = client.name || (client.email ? client.email.split('@')[0] : 'Client');
    setText('modalClientName', displayName);
    setText('modalClientEmail', client.email || '');
    setText('modalClientAvatar', (displayName || 'C').charAt(0).toUpperCase());

    const scoreBadge = document.getElementById('modalClientScoreBadge');
    if (scoreBadge) {
      scoreBadge.textContent = `Score: ${client.skin_health_score || 0}/100`;
      scoreBadge.className = `score-pill ${(client.skin_health_score || 0) < 60 ? 'low' : ((client.skin_health_score || 0) < 80 ? 'fair' : '')}`;
    }

    const riskBadge = document.getElementById('modalClientRiskBadge');
    if (riskBadge) {
      riskBadge.textContent = `${client.overall_risk_level || 'Low'} Risk`;
      riskBadge.className = `risk-pill ${(client.overall_risk_level || 'low').toLowerCase()}`;
    }

    // Populate Tab 1: Profile & Lifestyle
    populateDossierProfileTab(client);

    // Populate Tab 2: AI Score & Risks
    populateDossierScoresTab(client);

    // Populate Tab 3: Skincare Routine
    populateDossierRoutineTab(client);

    // Populate Tab 4: Assessment History
    populateDossierHistoryTab(client);

    // Populate Tab 5: Adherence & Checkins
    populateDossierAdherenceTab(client);

    // Switch to initial tab
    switchDossierTab(initialTab);

    modal.classList.remove('hidden');
  } catch (err) {
    console.error('Error opening dossier:', err);
    showToast('Failed to load client details', 'error');
  }
};

const populateDossierProfileTab = (client) => {
  const p = client.profile || {};
  const gridEl = document.getElementById('modalProfileGrid');
  if (gridEl) {
    const fields = [
      { label: 'Skin Type', value: p.skin_type },
      { label: 'Age Group', value: p.age_group },
      { label: 'Skin Concerns', value: p.skin_concerns },
      { label: 'Allergies', value: p.allergies },
      { label: 'Sensitivities', value: p.sensitivities },
      { label: 'Lifestyle Habits', value: p.lifestyle_habits },
      { label: 'Sleep Quality', value: p.sleep_quality },
      { label: 'Water Intake', value: p.water_intake },
      { label: 'Environmental Exposure', value: p.environmental_exposure },
      { label: 'Profile Last Updated', value: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '—' },
    ];

    gridEl.innerHTML = fields.map(f => `
      <div class="profile-field">
        <span class="profile-field-label">${f.label}</span>
        <span class="profile-field-value">${escapeHtml(f.value) || '—'}</span>
      </div>
    `).join('');
  }

  // Photo scan
  const imgEl = document.getElementById('modalClientImage');
  const noImgText = document.getElementById('noImageText');
  if (p.image_url) {
    if (imgEl) {
      imgEl.src = p.image_url;
      imgEl.classList.remove('hidden');
    }
    if (noImgText) noImgText.classList.add('hidden');
  } else {
    if (imgEl) imgEl.classList.add('hidden');
    if (noImgText) noImgText.classList.remove('hidden');
  }

  setText('modalClientId', `#${client.id}`);
  setText('modalClientRegistered', client.created_at ? new Date(client.created_at).toLocaleDateString() : '—');
  setText('modalClientAssigned', client.assigned_at ? new Date(client.assigned_at).toLocaleDateString() : 'Active');
};

const populateDossierScoresTab = (client) => {
  setText('modalTabScoreVal', client.skin_health_score || 0);
  setText('modalTabCategoryTag', `Category: ${client.skin_health_category || 'Not Assessed'}`);

  // Risk Factors
  const risksContainer = document.getElementById('modalRisksContainer');
  if (risksContainer) {
    const risks = client.risks || [];
    if (risks.length === 0) {
      risksContainer.innerHTML = '<p class="empty-compact-msg">No elevated risk factors detected.</p>';
    } else {
      risksContainer.innerHTML = risks.map(r => `
        <div class="risk-item-card ${(r.level || 'low').toLowerCase()}">
          <div class="risk-card-header">
            <h4 class="risk-card-title">${escapeHtml(r.title || 'Risk Factor')}</h4>
            <span class="risk-pill ${(r.level || 'low').toLowerCase()}">${escapeHtml(r.level || 'Low')}</span>
          </div>
          <p class="risk-card-desc">${escapeHtml(r.description || '')}</p>
          ${r.recommendation ? `<div class="risk-card-rec">💡 <strong>Specialist Focus:</strong> ${escapeHtml(r.recommendation)}</div>` : ''}
        </div>
      `).join('');
    }
  }

  // Priority Concerns
  const prioContainer = document.getElementById('modalPrioritiesContainer');
  if (prioContainer) {
    const prios = client.priority_concerns || [];
    if (prios.length === 0) {
      prioContainer.innerHTML = '<p class="empty-compact-msg">No primary concerns specified.</p>';
    } else {
      prioContainer.innerHTML = prios.map(p => `
        <div class="priority-item-card">
          <div class="priority-rank-badge">#${p.priority || p.priority_rank || 1}</div>
          <div>
            <div style="font-size: 0.85rem; font-weight: 700; color: #0f172a;">${escapeHtml(p.concern || p.concern_name || '')}</div>
            <div style="font-size: 0.72rem; color: #64748b;">Severity: ${escapeHtml(p.severity || 'Moderate')} | Score: ${p.score || p.priority_score || 0}</div>
          </div>
        </div>
      `).join('');
    }
  }
};

const populateDossierRoutineTab = (client) => {
  const r = client.routine || {};
  setText('modalRoutineSeason', `☀️ ${r.season || 'Summer'} Routine`);
  setText('modalRoutineStepCount', `${r.total_steps || 0} Total Active Steps`);

  const banner = document.getElementById('modalRoutineSummaryBanner');
  const bannerText = document.getElementById('modalRoutineSummaryText');
  if (banner && bannerText) {
    if (r.adaptation_summary && r.adaptation_summary.trim()) {
      bannerText.textContent = r.adaptation_summary;
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }
  }

  const renderStepsList = (containerId, steps) => {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!steps || steps.length === 0) {
      el.innerHTML = '<p class="empty-compact-msg">No steps configured.</p>';
      return;
    }
    el.innerHTML = steps.map(s => `
      <div class="routine-step-mini-card" data-step-id="${s.id}">
        <div class="step-mini-header">
          <span style="font-size: 1.1rem;">${s.category_icon || '🧴'}</span>
          <h5 class="step-mini-title">${escapeHtml(s.step_title)}</h5>
          <div class="step-mini-actions">
            <button class="step-btn-icon btn-edit-client-step" data-step-id="${s.id}" title="Edit Step">✏️</button>
            <button class="step-btn-icon btn-delete-client-step" data-step-id="${s.id}" title="Delete Step">🗑️</button>
          </div>
        </div>
        ${s.description ? `<p class="step-mini-desc">${escapeHtml(s.description)}</p>` : ''}
        <div class="step-mini-meta">
          <span class="step-meta-badge">${escapeHtml(s.frequency || 'Daily')}</span>
          ${s.active_ingredients ? `<span class="step-meta-badge actives">🧪 ${escapeHtml(s.active_ingredients)}</span>` : ''}
          ${s.caution_notes ? `<span class="step-meta-badge caution">⚠️ ${escapeHtml(s.caution_notes)}</span>` : ''}
        </div>
      </div>
    `).join('');
  };

  renderStepsList('modalMorningStepsList', r.morning_steps || []);
  renderStepsList('modalEveningStepsList', r.evening_steps || []);
  renderStepsList('modalWeeklyStepsList', r.weekly_steps || []);

  // Seasonal Recommendations
  const seasonalEl = document.getElementById('modalSeasonalRecsList');
  if (seasonalEl) {
    const sRecs = r.seasonal_recommendations || [];
    if (sRecs.length === 0) {
      seasonalEl.innerHTML = '<p class="empty-compact-msg">No seasonal notes recorded.</p>';
    } else {
      seasonalEl.innerHTML = sRecs.map(rec => `
        <div class="seasonal-compact-card">
          <h4>${escapeHtml(rec.title)}</h4>
          <p>${escapeHtml(rec.description)}</p>
          ${rec.tip ? `<p style="margin-top: 0.35rem; color: #059669; font-weight: 600;">💡 ${escapeHtml(rec.tip)}</p>` : ''}
        </div>
      `).join('');
    }
  }

  // Bind edit and delete step buttons
  document.querySelectorAll('.btn-edit-client-step').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const stepId = parseInt(e.currentTarget.dataset.stepId);
      openStepModalForClient(client.id, stepId);
    });
  });

  document.querySelectorAll('.btn-delete-client-step').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const stepId = parseInt(e.currentTarget.dataset.stepId);
      if (confirm('Delete this routine step from client care plan?')) {
        await deleteClientRoutineStep(client.id, stepId);
      }
    });
  });
};

const populateDossierHistoryTab = (client) => {
  const historyList = client.assessment_history || [];
  setText('modalHistoryCountBadge', `${historyList.length} Sessions Logged`);

  const container = document.getElementById('modalAssessmentHistoryList');
  if (!container) return;

  if (historyList.length === 0) {
    container.innerHTML = '<p class="empty-compact-msg">No historical assessment sessions on record yet.</p>';
    return;
  }

  container.innerHTML = historyList.map(h => {
    const dateFormatted = h.assessment_date ? new Date(h.assessment_date).toLocaleString() : 'Recent';
    const risksSummary = h.risks && h.risks.length ? h.risks.map(r => r.risk_title).join(', ') : 'None detected';

    return `
      <div class="history-session-card" data-assessment-id="${h.assessment_id}">
        <div class="history-card-top">
          <div class="history-date-badge">
            <span>📅</span> ${dateFormatted}
            <span class="history-trigger-tag">${escapeHtml(h.trigger_source || 'Assessment')}</span>
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <span class="score-pill">Score: ${h.skin_health_score}/100</span>
            <span class="risk-pill ${(h.overall_risk_level || 'low').toLowerCase()}">${escapeHtml(h.overall_risk_level || 'Low')} Risk</span>
          </div>
        </div>
        <div style="font-size: 0.8rem; color: #475569; margin-bottom: 0.5rem;">
          <strong>Category:</strong> ${escapeHtml(h.skin_health_category || 'Fair')} | <strong>Risks Identified:</strong> ${escapeHtml(risksSummary)}
        </div>
        <div class="history-notes-box">
          <label class="history-notes-label">Specialist Consultation Feedback & Notes</label>
          <textarea class="history-notes-input" id="notesInput-${h.assessment_id}" rows="2" placeholder="Add clinical observations, lifestyle guidance, or routine modification notes...">${escapeHtml(h.notes || '')}</textarea>
          <button class="history-save-btn" data-assessment-id="${h.assessment_id}">💾 Save Notes</button>
        </div>
      </div>
    `;
  }).join('');

  // Bind note saving
  container.querySelectorAll('.history-save-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const assessmentId = parseInt(e.currentTarget.dataset.assessmentId);
      const textarea = document.getElementById(`notesInput-${assessmentId}`);
      if (!textarea) return;

      btn.disabled = true;
      btn.textContent = 'Saving...';
      try {
        const res = await fetch(`/consultant/assessment/${assessmentId}/notes`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notes: textarea.value }),
        });
        if (res.ok) {
          showToast('Consultation notes saved successfully!');
        } else {
          showToast('Could not update notes', 'error');
        }
      } catch (err) {
        showToast('Error connecting to server', 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = '💾 Save Notes';
      }
    });
  });
};

const populateDossierAdherenceTab = (client) => {
  const adh = client.adherence || {};
  setText('modalAdherencePct', `${adh.adherence_percentage || 0}%`);
  setText('modalAdherenceStreak', `${adh.streak || 0} Days`);
  setText('modalAdherenceTotalDays', adh.total_logged_days || 0);
  setText('modalAdherenceMorning', adh.morning_completed_count || 0);

  const container = document.getElementById('modalCheckinLogTable');
  if (!container) return;

  const logs = client.recent_checkins || [];
  if (logs.length === 0) {
    container.innerHTML = '<p class="empty-compact-msg">No routine check-in logs recorded by this client yet.</p>';
    return;
  }

  container.innerHTML = `
    <table class="checkin-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Morning Routine</th>
          <th>Evening Routine</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${logs.map(log => {
          const both = log.morning_completed && log.evening_completed;
          const any = log.morning_completed || log.evening_completed;
          return `
            <tr>
              <td><strong>${log.checkin_date}</strong></td>
              <td>
                <span class="checkin-status-icon ${log.morning_completed ? 'done' : 'missed'}">
                  ${log.morning_completed ? '✅ Done' : '⚪ Missed'}
                </span>
              </td>
              <td>
                <span class="checkin-status-icon ${log.evening_completed ? 'done' : 'missed'}">
                  ${log.evening_completed ? '✅ Done' : '⚪ Missed'}
                </span>
              </td>
              <td>
                <span class="trend-badge ${both ? 'positive' : (any ? 'neutral' : 'negative')}">
                  ${both ? '100% Complete' : (any ? '50% Complete' : 'Missed')}
                </span>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
};

// Switch tab in Dossier
const switchDossierTab = (tabKey) => {
  document.querySelectorAll('.dossier-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.dossierTab === tabKey);
  });
  document.querySelectorAll('.dossier-tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `dossierTab-${tabKey}`);
  });
};

document.querySelectorAll('.dossier-tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const tabKey = e.currentTarget.dataset.dossierTab;
    switchDossierTab(tabKey);
  });
});

const closeProfileModal = () => {
  const modal = document.getElementById('profileModal');
  if (modal) modal.classList.add('hidden');
  currentActiveClient = null;
};

document.getElementById('closeProfileModal')?.addEventListener('click', closeProfileModal);
document.getElementById('modalBackdrop')?.addEventListener('click', closeProfileModal);

// ── 3. Routine Step Create / Edit Modal ──────────────────────
const openStepModalForClient = (clientId, stepId = null) => {
  const modal = document.getElementById('stepModal');
  if (!modal) return;

  document.getElementById('stepModalClientId').value = clientId;
  document.getElementById('stepModalId').value = stepId || '';

  if (stepId && currentActiveClient && currentActiveClient.routine) {
    const allSteps = [
      ...(currentActiveClient.routine.morning_steps || []),
      ...(currentActiveClient.routine.evening_steps || []),
      ...(currentActiveClient.routine.weekly_steps || []),
    ];
    const step = allSteps.find(s => s.id === stepId);
    if (step) {
      document.getElementById('stepModalTitle').textContent = 'Edit Client Routine Step';
      document.getElementById('stepFormTimeOfDay').value = step.time_of_day;
      document.getElementById('stepFormCategory').value = step.category;
      document.getElementById('stepFormTitle').value = step.step_title;
      document.getElementById('stepFormDescription').value = step.description;
      document.getElementById('stepFormIngredients').value = step.active_ingredients || '';
      document.getElementById('stepFormFrequency').value = step.frequency || '';
      document.getElementById('stepFormCaution').value = step.caution_notes || '';
    }
  } else {
    document.getElementById('stepModalTitle').textContent = 'Add Custom Routine Step';
    document.getElementById('stepForm').reset();
  }

  modal.classList.remove('hidden');
};

const closeStepModal = () => {
  document.getElementById('stepModal')?.classList.add('hidden');
};

document.getElementById('btnCloseStepModal')?.addEventListener('click', closeStepModal);
document.getElementById('btnCancelStepModal')?.addEventListener('click', closeStepModal);
document.getElementById('stepModalBackdrop')?.addEventListener('click', closeStepModal);

document.getElementById('btnAddClientStep')?.addEventListener('click', () => {
  if (currentActiveClient) {
    openStepModalForClient(currentActiveClient.id, null);
  }
});

document.getElementById('stepForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const clientId = parseInt(document.getElementById('stepModalClientId').value);
  const stepId = document.getElementById('stepModalId').value;
  const saveBtn = document.getElementById('btnSaveStep');

  const payload = {
    time_of_day: document.getElementById('stepFormTimeOfDay').value,
    category: document.getElementById('stepFormCategory').value,
    step_title: document.getElementById('stepFormTitle').value,
    description: document.getElementById('stepFormDescription').value,
    active_ingredients: document.getElementById('stepFormIngredients').value,
    frequency: document.getElementById('stepFormFrequency').value,
    caution_notes: document.getElementById('stepFormCaution').value,
  };

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
  }

  try {
    let res;
    if (stepId) {
      res = await fetch(`/consultant/client/${clientId}/routine-step/${stepId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch(`/consultant/client/${clientId}/routine-step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    }

    if (res.ok) {
      showToast(stepId ? 'Routine step updated!' : 'Custom routine step added!');
      closeStepModal();
      // Refresh active client dossier & clients list
      await openClientDossier(clientId, 'routine');
      await loadAssignedClients();
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.detail || 'Could not save routine step', 'error');
    }
  } catch (err) {
    showToast('Error connecting to server', 'error');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Step';
    }
  }
});

const deleteClientRoutineStep = async (clientId, stepId) => {
  try {
    const res = await fetch(`/consultant/client/${clientId}/routine-step/${stepId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      showToast('Routine step deleted');
      await openClientDossier(clientId, 'routine');
      await loadAssignedClients();
    } else {
      showToast('Could not delete step', 'error');
    }
  } catch (err) {
    showToast('Server connection error', 'error');
  }
};

// ── 4. Assessment Reports Section ────────────────────────────
const loadAssessmentReports = async () => {
  const container = document.getElementById('reportList');
  if (!container) return;

  try {
    const res = await fetch('/consultant/reports', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      container.innerHTML = '<p class="empty-clients-msg">Failed to load reports.</p>';
      return;
    }
    const data = await res.json();
    allReportsData = data.reports || [];
    renderAssessmentReports();
  } catch (err) {
    container.innerHTML = '<p class="empty-clients-msg">Error loading reports.</p>';
  }
};

const renderAssessmentReports = () => {
  const container = document.getElementById('reportList');
  if (!container) return;

  const clientFilter = document.getElementById('reportClientFilter')?.value || 'all';
  const riskFilter = document.getElementById('reportRiskFilter')?.value || 'all';

  let filtered = allReportsData;
  if (clientFilter !== 'all') {
    filtered = filtered.filter(r => String(r.client_id) === String(clientFilter));
  }
  if (riskFilter !== 'all') {
    filtered = filtered.filter(r => (r.overall_risk_level || '').toLowerCase() === riskFilter.toLowerCase());
  }

  if (!filtered.length) {
    container.innerHTML = '<p class="empty-clients-msg">No assessment reports match your selected criteria.</p>';
    return;
  }

  container.innerHTML = '';
  filtered.forEach(rep => {
    const card = document.createElement('article');
    card.className = 'report-card';
    const dateStr = rep.assessment_date ? new Date(rep.assessment_date).toLocaleDateString() : 'Recent';
    const riskLevel = rep.overall_risk_level || 'Low';
    const risksCount = rep.risks ? rep.risks.length : 0;

    card.innerHTML = `
      <div class="report-card-details">
        <div class="report-card-top-row">
          <h3 class="report-client-name">${escapeHtml(rep.client_name)}</h3>
          <span class="client-skin-tag">📅 ${dateStr}</span>
          <span class="score-pill">Score: ${rep.skin_health_score}/100</span>
          <span class="risk-pill ${riskLevel.toLowerCase()}">${escapeHtml(riskLevel)} Risk</span>
        </div>
        <p class="report-concerns-preview">
          Trigger: <strong>${escapeHtml(rep.trigger_source || 'Survey')}</strong> | ${risksCount} Risk factor${risksCount !== 1 ? 's' : ''} detected | Category: ${escapeHtml(rep.skin_health_category || 'Fair')}
        </p>
        ${rep.notes ? `<p style="font-size: 0.8rem; color: #059669; margin: 0.25rem 0 0;">📝 Notes: ${escapeHtml(rep.notes)}</p>` : ''}
      </div>
      <button class="review-btn" data-client-id="${rep.client_id}">View Reports</button>
    `;

    card.querySelector('.review-btn').addEventListener('click', () => {
      openClientDossier(rep.client_id, 'history');
    });

    container.appendChild(card);
  });
};

document.getElementById('reportClientFilter')?.addEventListener('change', renderAssessmentReports);
document.getElementById('reportRiskFilter')?.addEventListener('change', renderAssessmentReports);

// ── 5. Progress Tracking Section ─────────────────────────────
const loadProgressMetrics = async () => {
  try {
    const res = await fetch('/consultant/progress', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;

    const data = await res.json();

    setText('kpiAvgScore', data.average_health_score || '--');
    setText('kpiAvgAdherence', `${data.average_adherence_rate || 0}%`);
    setText('kpiAssessedClients', `${data.assessed_clients_count || 0} / ${data.total_clients || 0}`);
    setText('kpiHighRisks', data.high_risk_clients_count || 0);

    renderProgressTable(data.client_progress || []);
  } catch (err) {
    console.error('Error loading progress:', err);
  }
};

const renderProgressTable = (items) => {
  const tbody = document.getElementById('progressTableBody');
  if (!tbody) return;

  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-slate-500">No assigned client records found.</td></tr>';
    return;
  }

  tbody.innerHTML = items.map(c => {
    const trendDiff = c.score_change || 0;
    let trendBadge = '<span class="trend-badge neutral">0</span>';
    if (trendDiff > 0) trendBadge = `<span class="trend-badge positive">+${trendDiff} pts</span>`;
    else if (trendDiff < 0) trendBadge = `<span class="trend-badge negative">${trendDiff} pts</span>`;

    return `
      <tr>
        <td>
          <div style="font-weight: 700; color: #0f172a;">${escapeHtml(c.client_name)}</div>
          <div style="font-size: 0.75rem; color: #64748b;">${escapeHtml(c.client_email)}</div>
        </td>
        <td><span class="client-skin-tag">${escapeHtml(c.skin_type)}</span></td>
        <td><strong>${c.initial_score || '--'}</strong></td>
        <td><strong style="color: #059669;">${c.current_score || '--'}</strong></td>
        <td>${trendBadge}</td>
        <td><strong>${c.adherence_percentage || 0}%</strong></td>
        <td>🔥 ${c.streak || 0}d</td>
        <td><span class="risk-pill ${(c.overall_risk_level || 'low').toLowerCase()}">${escapeHtml(c.overall_risk_level || 'Low')}</span></td>
        <td>
          <button class="btn-primary-small btn-progress-dossier" data-client-id="${c.client_id}">
            Reports
          </button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.btn-progress-dossier').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cid = parseInt(e.currentTarget.dataset.clientId);
      openClientDossier(cid, 'adherence');
    });
  });
};

// ── 6. Prescriptive Recommendations Section ───────────────────
let consultantProductList = [];
let consultantActiveCat = 'all';
let consultantSearchQuery = '';

const initConsultantRecommendations = () => {
  document.querySelectorAll('.cons-cat-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.cons-cat-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = '#fff';
        b.style.color = '#475569';
        b.style.borderColor = '#e2e8f0';
      });
      btn.classList.add('active');
      btn.style.background = '#0f172a';
      btn.style.color = '#fff';
      btn.style.borderColor = '#cbd5e1';

      consultantActiveCat = btn.dataset.cat || 'all';
      renderCuratedRecommendations();
    });
  });

  const searchInput = document.getElementById('consProductSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      consultantSearchQuery = e.target.value.trim().toLowerCase();
      renderCuratedRecommendations();
    });
  }

  fetchConsultantProductCatalog();
};

const fetchConsultantProductCatalog = async () => {
  try {
    const res = await fetch('/api/products/catalog');
    if (res.ok) {
      const data = await res.json();
      consultantProductList = data.products || [];
    }
  } catch (e) {
    console.error('Error fetching consultant catalog:', e);
  }
  renderCuratedRecommendations();
};

const renderCuratedRecommendations = () => {
  const grid = document.getElementById('curatedRecommendationsGrid');
  if (!grid) return;

  let items = consultantProductList.length > 0 ? consultantProductList : CURATED_RECOMMENDATIONS.map((r, i) => ({
    id: `curated-${i}`,
    name: r.title,
    brand: 'Clinical Care',
    category: r.category,
    category_name: r.category,
    description: r.description,
    key_actives: (r.active_ingredients || '').split(', '),
    time_of_day: r.time_of_day,
    frequency: r.frequency,
    price: 15.00,
    rating: 4.8
  }));

  if (consultantActiveCat !== 'all') {
    items = items.filter(p => p.category === consultantActiveCat);
  }

  if (consultantSearchQuery) {
    items = items.filter(p => {
      const s = `${p.name || ''} ${p.brand || ''} ${(p.key_actives || []).join(' ')} ${p.description || ''}`.toLowerCase();
      return s.includes(consultantSearchQuery);
    });
  }

  if (items.length === 0) {
    grid.innerHTML = '<p class="text-xs text-slate-500 py-6 text-center col-span-full">No matching products found.</p>';
    return;
  }

  const categoryIconMap = {
    face_wash: '🧼',
    moisturizer: '🧴',
    sunscreen: '☀️',
    serum: '💧',
    toner: '🌿',
    treatment_products: '🎯',
    face_masks: '✨'
  };

  grid.innerHTML = items.map((item, idx) => `
    <article class="recommendation-card" style="display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
          <span class="client-skin-tag">${categoryIconMap[item.category] || '🧴'} ${(item.category_name || item.category || 'treatment').toUpperCase()}</span>
          <span style="font-size: 0.75rem; font-weight: 600; color: #64748b;">${item.price ? '$' + item.price.toFixed(2) : '☀️ ' + (item.time_of_day || 'Daily')}</span>
        </div>
        <span style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: #94a3b8;">${escapeHtml(item.brand || 'Dermatology')}</span>
        <h3 style="margin-top: 0.15rem;">${escapeHtml(item.name || item.title)}</h3>
        <p style="font-size: 0.8rem; color: #64748b; line-height: 1.45; margin: 0.4rem 0;">${escapeHtml(item.tagline || item.description || '')}</p>
        <div class="rec-actives-tag" style="margin-top: 0.35rem;">🧪 Actives: ${escapeHtml(Array.isArray(item.key_actives) ? item.key_actives.slice(0, 3).join(', ') : item.active_ingredients || '')}</div>
      </div>
      <button class="assign-btn" data-rec-id="${item.id || idx}" style="margin-top: 0.75rem;">
        <span>👉</span> Assign to Client Routine
      </button>
    </article>
  `).join('');

  grid.querySelectorAll('.assign-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const recId = e.currentTarget.dataset.recId;
      const targetItem = items.find(i => String(i.id) === String(recId)) || items[0];
      openAssignRecommendationModal(targetItem);
    });
  });
};

const openAssignRecommendationModal = (item) => {
  const modal = document.getElementById('assignRecModal');
  if (!modal) return;

  const title = item.name || item.title;
  const actives = Array.isArray(item.key_actives) ? item.key_actives.join(', ') : (item.active_ingredients || '');
  const cat = item.category || 'treatment';
  const timeOfDay = item.time_of_day ? item.time_of_day.split(' ')[0] : 'morning';

  document.getElementById('recModalItemName').value = title;
  document.getElementById('recModalCategory').value = cat;
  document.getElementById('recModalTimeOfDay').value = timeOfDay;
  document.getElementById('recModalActives').value = actives;

  setText('recPreviewTitle', title);
  setText('recPreviewDesc', item.tagline || item.description || '');
  setText('recPreviewActives', `Actives: ${actives}`);

  document.getElementById('recModalTip').value = item.tip || (item.usage_instructions ? `Apply: ${item.usage_instructions}` : '');

  modal.classList.remove('hidden');
};


const closeAssignRecModal = () => {
  document.getElementById('assignRecModal')?.classList.add('hidden');
};

document.getElementById('btnCloseRecModal')?.addEventListener('click', closeAssignRecModal);
document.getElementById('btnCancelRecModal')?.addEventListener('click', closeAssignRecModal);
document.getElementById('recModalBackdrop')?.addEventListener('click', closeAssignRecModal);

document.getElementById('assignRecForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const clientId = document.getElementById('recModalClientSelect').value;
  if (!clientId) {
    showToast('Please select a client', 'error');
    return;
  }

  const payload = {
    title: document.getElementById('recModalItemName').value,
    category: document.getElementById('recModalCategory').value,
    time_of_day: document.getElementById('recModalTimeOfDay').value,
    active_ingredients: document.getElementById('recModalActives').value,
    description: document.getElementById('recPreviewDesc')?.textContent || '',
    tip: document.getElementById('recModalTip').value,
    frequency: 'Daily',
  };

  const btn = document.getElementById('btnConfirmAssignRec');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Assigning...';
  }

  try {
    const res = await fetch(`/consultant/client/${clientId}/recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      showToast(`Recommendation assigned to client successfully!`);
      closeAssignRecModal();
      await loadAssignedClients();
      await loadProgressMetrics();
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.detail || 'Failed to assign recommendation', 'error');
    }
  } catch (err) {
    showToast('Server connection error', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Confirm Assignment';
    }
  }
});

// ── Search & Filter Listeners ─────────────────────────────────
document.getElementById('clientSearchBtn')?.addEventListener('click', applyClientFilters);
document.getElementById('clientSearch')?.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') applyClientFilters();
});

document.querySelectorAll('.filter-pill').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    currentFilter = e.currentTarget.dataset.filter;
    applyClientFilters();
  });
});

// Refresh button
document.getElementById('btnRefreshData')?.addEventListener('click', async () => {
  showToast('Refreshing real-time client data...', 'info');
  await loadAllDashboardData();
  showToast('Client profiles and telemetry synchronized!');
});

// ── Helper ────────────────────────────────────────────────────
const setText = (id, text) => {
  const el = document.getElementById(id);
  if (el) el.textContent = text !== null && text !== undefined ? text : '';
};

// ── Section View Navigation ──────────────────────────────────
const sidebar = document.getElementById('sidebar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');

const toggleSidebar = (show) => {
  if (sidebar && sidebarBackdrop) {
    if (show) {
      sidebar.classList.add('open');
      sidebarBackdrop.classList.add('active');
    } else {
      sidebar.classList.remove('open');
      sidebarBackdrop.classList.remove('active');
    }
  }
};

if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => toggleSidebar(true));
if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', () => toggleSidebar(false));
if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', () => toggleSidebar(false));

const sections = {
  clients: { el: document.getElementById('section-clients'), nav: document.getElementById('navClients'), title: 'Client Profiles', sub: 'Complete real-time details of your assigned clients' },
  reports: { el: document.getElementById('section-reports'), nav: document.getElementById('navReports'), title: 'Skin Assessment Reports', sub: 'Recent client skin assessment and diagnostic sessions' },
  progress: { el: document.getElementById('section-progress'), nav: document.getElementById('navProgress'), title: 'Progress & Adherence', sub: 'Track client health improvements and habit compliance' },
  recommendations: { el: document.getElementById('section-recommendations'), nav: document.getElementById('navRecommendations'), title: 'Prescriptive Recommendations', sub: 'Assign targeted formulas & treatments to client routines' },
};

const showSection = (key) => {
  const targetKey = sections[key] ? key : 'clients';
  Object.entries(sections).forEach(([k, s]) => {
    const isActive = (k === targetKey);
    if (s.el) s.el.classList.toggle('active', isActive);
    if (s.nav) s.nav.classList.toggle('active', isActive);
  });

  const activeSec = sections[targetKey];
  const titleEl = document.getElementById('pageTitle');
  const subEl = document.getElementById('pageSubtitle');
  if (titleEl && activeSec) titleEl.textContent = activeSec.title;
  if (subEl && activeSec) subEl.textContent = activeSec.sub;
  window.scrollTo({ top: 0 });
};

// Bind navigation clicks
Object.entries(sections).forEach(([key, s]) => {
  if (s.nav) {
    s.nav.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(key);
      toggleSidebar(false);
      window.location.hash = key;
    });
  }
});

const initSectionFromHash = () => {
  const hash = window.location.hash.replace('#', '').trim();
  if (hash && sections[hash]) {
    showSection(hash);
  } else {
    showSection('clients');
  }
};

window.addEventListener('hashchange', initSectionFromHash);

// Logout
document.getElementById('headerLogout')?.addEventListener('click', (event) => {
  event.preventDefault();
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_role');
  window.location.href = '../index.html';
});

// ── Boot ─────────────────────────────────────────────────────
verifySession();
initSectionFromHash();
