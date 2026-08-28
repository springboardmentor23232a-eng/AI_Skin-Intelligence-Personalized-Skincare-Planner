// --- Skin Profile Management ---
const profileForm = document.getElementById('profileForm');
const profileStatus = document.getElementById('profileStatus');
const resetProfileBtn = document.getElementById('resetProfileBtn');

const PRESET_FORMULAS = {
  brightening: "Water/Aqua/Eau, Niacinamide 5%, 3-O-Ethyl Ascorbic Acid, Sodium Hyaluronate, Glycerin, Ferulic Acid, Tocopherol, Panthenol, Phenoxyethanol",
  antiaging: "Aqua, Microencapsulated Retinol 0.5%, Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine, Palmitoyl Tripeptide-1, Palmitoyl Tetrapeptide-7, Hyaluronic Acid, Squalane, Cholesterol",
  acne: "Water, Salicylic Acid 2%, Salix Alba (Willow) Bark Extract, Niacinamide, Zinc PCA, Centella Asiatica Extract, Sodium Hyaluronate, Allantoin",
  barrier: "Aqua, Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine, Cholesterol, Squalane, Panthenol, Glycerin, Sodium Hyaluronate, Madecassoside",
  clash: "Aqua, Retinol 1%, Glycolic Acid 10%, Salicylic Acid 2%, L-Ascorbic Acid 15%, Alcohol Denat, Fragrance/Parfum, Linalool, Limonene, Sodium Lauryl Sulfate"
};

let cachedIngredientCategories = [];
let isIngredientModuleInitialized = false;

let productCatalog = [];
let activeProductCategory = 'all';
let activeProductBudget = 'all';
let activeProductConcern = 'all';
let isAllergySafeOnly = false;
let productSearchTerm = '';
let productSortBy = 'suitability_desc';
let compareSelectedProducts = [];
let currentDetailProdObj = null;
let currentBudgetRoutineData = null;
let isRecEngineInitialized = false;

const fetchSkinProfile = async (token) => {
  try {
    const response = await fetch('/user/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const data = await response.json();

      // Populate select/input fields
      if (document.getElementById('skinType')) document.getElementById('skinType').value = data.skin_type || '';
      if (document.getElementById('ageGroup')) document.getElementById('ageGroup').value = data.age_group || '';
      if (document.getElementById('sleepQuality')) document.getElementById('sleepQuality').value = data.sleep_quality || '';
      if (document.getElementById('waterIntake')) document.getElementById('waterIntake').value = data.water_intake || '';
      if (document.getElementById('allergies')) document.getElementById('allergies').value = data.allergies || '';
      if (document.getElementById('sensitivities')) document.getElementById('sensitivities').value = data.sensitivities || '';

      // Checkboxes
      const setCheckboxes = (name, valuesStr) => {
        const values = valuesStr ? valuesStr.split(',').map(v => v.trim()) : [];
        if (profileForm) {
          const checkboxes = profileForm.querySelectorAll(`input[name="${name}"]`);
          checkboxes.forEach(cb => {
            cb.checked = values.includes(cb.value);
          });
        }
      };

      setCheckboxes('skinConcerns', data.skin_concerns);
      setCheckboxes('lifestyleHabits', data.lifestyle_habits);
      setCheckboxes('environmentalExposure', data.environmental_exposure);

      // Display image preview if available
      if (data.image_url) {
        const previewImg = document.getElementById('skinImagePreview');
        const noPreviewText = document.getElementById('noPreviewText');
        if (previewImg && noPreviewText) {
          previewImg.src = data.image_url;
          previewImg.classList.remove('hidden');
          noPreviewText.classList.add('hidden');
        }
      }

      // Update AI Skin Health Score and Risk Messages
      if (data.skin_health_score !== undefined) {
        updateScoreUI(data.skin_health_score);
      }
      if (data.risks !== undefined) {
        renderRiskMessages(data.risks);
      }
      if (data.priority_concerns !== undefined) {
        renderPriorityConcerns(data.priority_concerns);
      }
    }
  } catch (error) {
    console.error('Error fetching skin profile:', error);
  }
};

const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

const renderRiskMessages = (risks) => {
  const container = document.getElementById('riskMessagesContainer');
  const countBadge = document.getElementById('riskBadgeCount');
  if (!container) return;

  if (!risks || !Array.isArray(risks) || risks.length === 0) {
    if (countBadge) {
      countBadge.textContent = '0 Risks Detected';
      countBadge.className = 'risk-count-badge bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300';
    }
    container.innerHTML = `
      <div class="risk-empty-card flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 col-span-full">
        <svg class="w-6 h-6 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <h4 class="font-semibold text-emerald-900 dark:text-emerald-200 text-sm">Great Skin Health Profile!</h4>
          <p class="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">No critical health or environmental risk factors detected in your routine. Keep maintaining your healthy habits!</p>
        </div>
      </div>
    `;
    return;
  }

  if (countBadge) {
    countBadge.textContent = `${risks.length} Risk${risks.length > 1 ? 's' : ''} Identified`;
    countBadge.className = 'risk-count-badge bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300';
  }

  container.innerHTML = risks.map(risk => {
    let levelClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    let cardBorder = 'border-slate-200 dark:border-slate-800';
    let iconColor = 'text-blue-500';

    if (risk.level === 'High') {
      levelClass = 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      cardBorder = 'border-rose-200/80 dark:border-rose-900/40';
      iconColor = 'text-rose-500';
    } else if (risk.level === 'Medium') {
      levelClass = 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      cardBorder = 'border-amber-200/80 dark:border-amber-900/40';
      iconColor = 'text-amber-500';
    }

    return `
      <div class="risk-card p-4 rounded-xl bg-white dark:bg-slate-900 border ${cardBorder} shadow-sm transition-all hover:shadow-md">
        <div class="flex items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full ${risk.level === 'High' ? 'bg-rose-500' : (risk.level === 'Medium' ? 'bg-amber-500' : 'bg-blue-500')}"></span>
            <h4 class="font-bold text-slate-900 dark:text-white text-sm">${escapeHtml(risk.title)}</h4>
          </div>
          <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold border ${levelClass}">${risk.level} Risk</span>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-300 mb-2.5 leading-relaxed">${escapeHtml(risk.description)}</p>
        ${risk.recommendation ? `
          <div class="risk-recommendation flex items-start gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200">
            <svg class="w-4 h-4 ${iconColor} shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <span class="font-semibold text-slate-900 dark:text-white">Recommendation: </span>
              <span>${escapeHtml(risk.recommendation)}</span>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
};

const renderPriorityConcerns = (concerns) => {
  const container = document.getElementById('priorityConcernsContainer');
  const countBadge = document.getElementById('priorityCountBadge');
  if (!container) return;

  if (!concerns || !Array.isArray(concerns) || concerns.length === 0) {
    if (countBadge) {
      countBadge.textContent = '0 Concerns Ranked';
      countBadge.className = 'bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-xl text-sm border border-slate-200 shrink-0 self-start md:self-auto';
    }
    container.innerHTML = `
      <div class="col-span-full p-6 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <p class="text-sm text-slate-500 dark:text-slate-400">Complete your skin profile assessment survey to calculate and prioritize your skin concerns.</p>
      </div>
    `;
    return;
  }

  if (countBadge) {
    countBadge.textContent = `${concerns.length} Concern${concerns.length > 1 ? 's' : ''} Ranked`;
    countBadge.className = 'bg-slate-900 text-white font-semibold px-4 py-2 rounded-xl text-sm shrink-0 self-start md:self-auto';
  }

  container.innerHTML = concerns.map((item) => {
    let sevBadge = 'bg-slate-100 text-slate-700 border-slate-300';
    let rankBadge = 'bg-slate-800 text-white';

    if (item.severity === 'High') {
      sevBadge = 'bg-rose-100 text-rose-800 border-rose-200';
      rankBadge = 'bg-rose-600 text-white';
    } else if (item.severity === 'Medium') {
      sevBadge = 'bg-amber-100 text-amber-800 border-amber-200';
      rankBadge = 'bg-amber-600 text-white';
    } else if (item.severity === 'Low') {
      sevBadge = 'bg-emerald-100 text-emerald-800 border-emerald-200';
      rankBadge = 'bg-emerald-600 text-white';
    }

    return `
      <div class="priority-card p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="px-2.5 py-1 text-xs font-bold rounded-lg ${rankBadge}">Priority #${item.priority}</span>
            <span class="text-xs px-3 py-1 rounded-full font-semibold border ${sevBadge}">${escapeHtml(item.severity)} Severity</span>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">${escapeHtml(item.concern)}</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Calculated Impact Score: <span class="font-bold text-slate-800 dark:text-slate-200">${item.score} points</span></p>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <span>Target focus area</span>
          <span class="font-semibold text-slate-800 dark:text-slate-200">Active Monitoring</span>
        </div>
      </div>
    `;
  }).join('');
};

const fetchAssessmentHistory = async () => {
  const token = localStorage.getItem('access_token');
  if (!token) return;

  try {
    const response = await fetch('/user/assessment-history', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const data = await response.json();
      renderAssessmentHistory(data.history || []);
    }
  } catch (error) {
    console.error('Error fetching assessment history:', error);
  }
};

const renderAssessmentHistory = (history) => {
  const container = document.getElementById('historyTimelineContainer');
  const countBadge = document.getElementById('historyCountBadge');
  if (!container) return;

  if (!history || !Array.isArray(history) || history.length === 0) {
    if (countBadge) countBadge.textContent = '0 Sessions Recorded';
    container.innerHTML = `
      <div class="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
        <p class="text-sm text-slate-500">No assessment history recorded yet. Complete your skin profile survey or upload a photo scan to log your first session.</p>
      </div>
    `;
    return;
  }

  if (countBadge) {
    countBadge.textContent = `${history.length} Session${history.length > 1 ? 's' : ''} Recorded`;
  }

  container.innerHTML = history.map((item, idx) => {
    const dateStr = item.assessment_date
      ? new Date(item.assessment_date).toLocaleString(undefined, {
          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })
      : 'Unknown Date';

    let categoryClass = 'bg-blue-100 text-blue-800 border-blue-200';
    if (item.skin_health_category === 'Excellent') categoryClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
    else if (item.skin_health_category === 'Good') categoryClass = 'bg-teal-100 text-teal-800 border-teal-200';
    else if (item.skin_health_category === 'Fair') categoryClass = 'bg-amber-100 text-amber-800 border-amber-200';
    else if (item.skin_health_category === 'Poor') categoryClass = 'bg-rose-100 text-rose-800 border-rose-200';

    let riskClass = 'bg-slate-100 text-slate-700 border-slate-200';
    if (item.overall_risk_level === 'High' || item.overall_risk_level === 'Critical') riskClass = 'bg-rose-100 text-rose-800 border-rose-200';
    else if (item.overall_risk_level === 'Medium') riskClass = 'bg-amber-100 text-amber-800 border-amber-200';
    else riskClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';

    const triggerLabel = item.trigger_source === 'photo_scan' ? 'AI Photo Scan' : (item.trigger_source === 'survey_update' ? 'Assessment Survey' : 'Routine Check-in');

    const risksList = (item.risks || []).map(r => `
      <li class="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <div class="flex items-center justify-between font-semibold mb-1">
          <span>${escapeHtml(r.risk_title)}</span>
          <span class="text-[10px] px-2 py-0.5 rounded ${r.risk_level === 'High' ? 'bg-rose-100 text-rose-700' : (r.risk_level === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700')}">${escapeHtml(r.risk_level)}</span>
        </div>
        <p class="text-slate-600 mb-1">${escapeHtml(r.description)}</p>
        ${r.recommendation ? `<p class="text-emerald-700 font-medium">Rec: ${escapeHtml(r.recommendation)}</p>` : ''}
      </li>
    `).join('');

    const prioritiesList = (item.priorities || []).map(p => `
      <div class="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-200">
        <span class="font-bold text-slate-800">#${p.priority_rank} ${escapeHtml(p.concern_name)}</span>
        <span class="text-slate-500 font-semibold">${p.priority_score} pts (${escapeHtml(p.severity)})</span>
      </div>
    `).join('');

    return `
      <div class="history-card bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4 transition-all hover:shadow-md">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">#${history.length - idx}</span>
            <div>
              <h4 class="font-bold text-slate-900 text-base">${dateStr}</h4>
              <span class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Trigger: ${triggerLabel} • Model: ${escapeHtml(item.model_version)}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 text-xs font-bold rounded-full border ${categoryClass}">${item.skin_health_category} (${item.skin_health_score}/100)</span>
            <span class="px-3 py-1 text-xs font-semibold rounded-full border ${riskClass}">${item.overall_risk_level} Risk</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Identified Risk Audit (${item.risks ? item.risks.length : 0})</h5>
            ${risksList ? `<ul class="flex flex-col gap-2">${risksList}</ul>` : '<p class="text-xs text-slate-400 italic">No health risks flagged in this session.</p>'}
          </div>
          <div>
            <h5 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Prioritized Concern Focus (${item.priorities ? item.priorities.length : 0})</h5>
            ${prioritiesList ? `<div class="flex flex-col gap-2">${prioritiesList}</div>` : '<p class="text-xs text-slate-400 italic">No priority concerns flagged in this session.</p>'}
          </div>
        </div>

        ${item.image_url ? `
          <div class="pt-2 border-t border-slate-100 flex items-center gap-3">
            <span class="text-xs font-semibold text-slate-500">Session Photo Scan:</span>
            <img src="${escapeHtml(item.image_url)}" alt="Session Photo" class="w-12 h-12 object-cover rounded-lg border border-slate-200" />
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
};



const updateScoreUI = (score) => {
  if (score === undefined || score === null) return;
  const scoreTitle = document.getElementById('scoreValueTitle');
  const scoreRing = document.getElementById('scoreRingText');
  const scoreDesc = document.getElementById('scoreDescriptionText');

  if (scoreTitle) scoreTitle.textContent = `${score} / 100`;
  if (scoreRing) scoreRing.textContent = `${score}%`;
  if (scoreDesc) {
    if (score >= 80) {
      scoreDesc.textContent = "Your skin health score is Excellent! Your current routine and healthy lifestyle habits support optimal skin hydration and barrier resilience.";
    } else if (score >= 65) {
      scoreDesc.textContent = "Your skin health score is Good. Targeted skincare steps, consistent hydration, and lifestyle adjustments can help elevate your skin health.";
    } else if (score >= 50) {
      scoreDesc.textContent = "Your skin health score is Fair. Focus on consistent hydration, gentle cleansing, and addressing skin barrier sensitivities.";
    } else {
      scoreDesc.textContent = "Your skin health score indicates attention needed. Focus on barrier restoration, daily sun protection, and consulting a specialist.";
    }
  }

  // Profile Section Badge Updates
  const badgeText = document.getElementById('profileScoreBadgeText');
  const badgeRing = document.getElementById('profileScoreBadgeRing');
  if (badgeText) badgeText.textContent = `${score} / 100`;
  if (badgeRing) {
    badgeRing.textContent = `${score}%`;
    if (score >= 80) {
      badgeRing.className = "w-10 h-10 rounded-full border-2 border-emerald-400 flex items-center justify-center text-xs font-bold text-emerald-400";
    } else if (score >= 65) {
      badgeRing.className = "w-10 h-10 rounded-full border-2 border-teal-400 flex items-center justify-center text-xs font-bold text-teal-400";
    } else if (score >= 50) {
      badgeRing.className = "w-10 h-10 rounded-full border-2 border-amber-400 flex items-center justify-center text-xs font-bold text-amber-400";
    } else {
      badgeRing.className = "w-10 h-10 rounded-full border-2 border-rose-400 flex items-center justify-center text-xs font-bold text-rose-400";
    }
  }
};

const saveSkinProfile = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('access_token');
  if (!token) return;

  const getCheckboxValues = (name) => {
    const checkboxes = profileForm.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value).join(',');
  };

  const payload = {
    skin_type: document.getElementById('skinType').value,
    age_group: document.getElementById('ageGroup').value,
    sleep_quality: document.getElementById('sleepQuality').value,
    water_intake: document.getElementById('waterIntake').value,
    allergies: document.getElementById('allergies').value,
    sensitivities: document.getElementById('sensitivities').value,
    skin_concerns: getCheckboxValues('skinConcerns'),
    lifestyle_habits: getCheckboxValues('lifestyleHabits'),
    environmental_exposure: getCheckboxValues('environmentalExposure'),
  };

  try {
    profileStatus.textContent = 'Evaluating ML model & saving skin profile...';
    profileStatus.classList.remove('hidden', 'text-red-600', 'text-green-600');
    profileStatus.classList.add('text-gray-600');

    const res = await fetch('/user/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const resData = await res.json().catch(() => ({}));
      if (resData.skin_health_score !== undefined && resData.skin_health_score !== null) {
        updateScoreUI(resData.skin_health_score);
        profileStatus.textContent = `Skin Profile saved! ML-Calculated AI Health Score: ${resData.skin_health_score} / 100`;
      } else {
        profileStatus.textContent = 'Skin Profile updated successfully!';
      }

      if (resData.risks !== undefined) {
        renderRiskMessages(resData.risks);
      }
      if (resData.priority_concerns !== undefined) {
        renderPriorityConcerns(resData.priority_concerns);
      }

      fetchAssessmentHistory();
      fetchUserRoutine();

      profileStatus.classList.remove('text-gray-600');
      profileStatus.classList.add('text-green-600');
      setTimeout(() => profileStatus.classList.add('hidden'), 5000);
    } else {
      const errData = await res.json().catch(() => ({}));
      profileStatus.textContent = errData.detail || 'Failed to save skin profile.';
      profileStatus.classList.remove('text-gray-600');
      profileStatus.classList.add('text-red-600');
    }
  } catch (error) {
    console.error('Error saving skin profile:', error);
    profileStatus.textContent = 'An error occurred while saving.';
    profileStatus.classList.remove('text-gray-600');
    profileStatus.classList.add('text-red-600');
  }
};

if (profileForm) {
  profileForm.addEventListener('submit', saveSkinProfile);
}

if (resetProfileBtn) {
  resetProfileBtn.addEventListener('click', () => {
    profileForm.reset();
  });
}

// --- Checklist Management ---
const checklistForm = document.getElementById('checklistForm');
const checklistStatus = document.getElementById('checklistStatus');
const clearChecklist = document.getElementById('clearChecklist');
const logoutButton = document.querySelector('.logout-btn');

const updateChecklistStatus = () => {
  if (!checklistForm || !checklistStatus) return;
  const checkboxes = checklistForm.querySelectorAll('input[type="checkbox"]');
  const completed = Array.from(checkboxes).filter((checkbox) => checkbox.checked).length;
  checklistStatus.textContent = `${completed} of ${checkboxes.length} tasks complete`;
};

// --- Session & Auth ---
const fetchUserProfile = async (token, fallbackEmail) => {
  try {
    const res = await fetch('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      let displayName = data.name ? data.name.trim() : '';
      if (!displayName && fallbackEmail) {
        const handle = fallbackEmail.split('@')[0];
        displayName = handle.charAt(0).toUpperCase() + handle.slice(1);
      }
      const initial = (displayName || fallbackEmail || 'U').charAt(0).toUpperCase();
      const avatarEl = document.getElementById('userAvatarInitial');
      if (avatarEl) {
        avatarEl.textContent = initial;
      }
      const sidebarNameEl = document.getElementById('sidebarUserName');
      if (sidebarNameEl) {
        sidebarNameEl.textContent = displayName || 'User';
      }
    }
  } catch (err) {
    console.error('Error fetching profile:', err);
  }
};

const verifySession = async () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    window.location.replace('../index.html');
    return;
  }

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
  if (meData.role !== 'user') {
    window.location.replace('../index.html');
    return;
  }

  // Check approval status
  await checkAccountStatus(token, meData.email);
  // Fetch user name and set greeting
  await fetchUserProfile(token, meData.email);
  // Load skin profile after approval check
  await fetchSkinProfile(token);
};

const clearUserSession = (e) => {
  if (e) e.preventDefault();
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_role');
  window.location.href = '../index.html';
};

const checkAccountStatus = async (token, email) => {
  const overlay = document.getElementById('statusOverlay');
  const titleEl = document.getElementById('statusTitle');
  const msgEl = document.getElementById('statusMessage');
  const iconEl = document.getElementById('statusIcon');
  const emailEl = document.getElementById('statusEmail');
  const logoutBtn = document.getElementById('statusLogout');

  try {
    const res = await fetch('/auth/status', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));

    if (data.status === 'pending') {
      if (emailEl) emailEl.textContent = email || '';
      if (overlay) overlay.classList.remove('hidden');
    } else if (data.status === 'rejected') {
      if (titleEl) titleEl.textContent = 'Account Rejected';
      if (msgEl) msgEl.textContent = 'Your account has been rejected by the administrator. Please contact support for assistance.';
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
    // If approved, overlay stays hidden — normal dashboard is visible
  } catch (_) {
    // On error, allow dashboard to load normally
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', clearUserSession);
  }
};

// --- Event listeners ---
if (checklistForm) {
  checklistForm.addEventListener('change', updateChecklistStatus);
  checklistForm.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Daily progress saved successfully.');
    updateChecklistStatus();
  });
}

if (clearChecklist) {
  clearChecklist.addEventListener('click', () => {
    const checkboxes = checklistForm.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
    updateChecklistStatus();
  });
}

// Bind all sidebar and header logout buttons
document.getElementById('logoutBtn')?.addEventListener('click', clearUserSession);
document.querySelectorAll('.sidebar-logout-btn, .logout-btn').forEach(btn => {
  btn.addEventListener('click', clearUserSession);
});

// --- Skin Image Upload Management ---
let selectedFile = null;

const handleFileSelection = (file) => {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file (PNG, JPG, WEBP).');
    return;
  }

  selectedFile = file;

  const selectedFileName = document.getElementById('selectedFileName');
  const uploadPlaceholder = document.getElementById('uploadPlaceholder');
  const fileSelectedInfo = document.getElementById('fileSelectedInfo');
  const uploadImageBtn = document.getElementById('uploadImageBtn');
  const previewImg = document.getElementById('skinImagePreview');
  const noPreview = document.getElementById('noPreviewText');
  const uploadStatusMsg = document.getElementById('uploadStatusMsg');

  if (selectedFileName) selectedFileName.textContent = file.name;
  if (uploadPlaceholder) uploadPlaceholder.classList.add('hidden');
  if (fileSelectedInfo) fileSelectedInfo.classList.remove('hidden');
  if (uploadStatusMsg) {
    uploadStatusMsg.textContent = '';
    uploadStatusMsg.classList.add('hidden');
  }

  // Preview local image immediately
  const reader = new FileReader();
  reader.onload = (e) => {
    if (previewImg) {
      previewImg.src = e.target.result;
      previewImg.classList.remove('hidden');
    }
    if (noPreview) {
      noPreview.classList.add('hidden');
    }
  };
  reader.readAsDataURL(file);

  // Enable upload button
  if (uploadImageBtn) {
    uploadImageBtn.disabled = false;
    uploadImageBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }
};

const resetFileSelection = () => {
  selectedFile = null;
  const skinFileInput = document.getElementById('skinFileInput');
  const uploadPlaceholder = document.getElementById('uploadPlaceholder');
  const fileSelectedInfo = document.getElementById('fileSelectedInfo');
  const uploadImageBtn = document.getElementById('uploadImageBtn');

  if (skinFileInput) skinFileInput.value = '';
  if (uploadPlaceholder) uploadPlaceholder.classList.remove('hidden');
  if (fileSelectedInfo) fileSelectedInfo.classList.add('hidden');
  if (uploadImageBtn) {
    uploadImageBtn.disabled = true;
    uploadImageBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
};

const skinFileInput = document.getElementById('skinFileInput');
const dropzone = document.getElementById('dropzone');
const changeFileBtn = document.getElementById('changeFileBtn');
const uploadImageBtn = document.getElementById('uploadImageBtn');

if (skinFileInput) {
  skinFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  });
}

if (dropzone) {
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('border-slate-800', 'bg-slate-100');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('border-slate-800', 'bg-slate-100');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-slate-800', 'bg-slate-100');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  });
}

if (changeFileBtn) {
  changeFileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    resetFileSelection();
    if (skinFileInput) skinFileInput.click();
  });
}

if (uploadImageBtn) {
  uploadImageBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    const uploadStatusMsg = document.getElementById('uploadStatusMsg');
    const previewImg = document.getElementById('skinImagePreview');
    const noPreview = document.getElementById('noPreviewText');

    try {
      if (uploadStatusMsg) {
        uploadStatusMsg.textContent = 'Uploading & saving photo...';
        uploadStatusMsg.className = 'text-xs font-semibold mt-2 text-slate-600 block';
      }
      uploadImageBtn.disabled = true;
      uploadImageBtn.classList.add('opacity-50', 'cursor-not-allowed');

      const response = await fetch('/user/upload-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (uploadStatusMsg) {
          uploadStatusMsg.textContent = 'Skin photo uploaded & saved successfully!';
          uploadStatusMsg.className = 'text-xs font-semibold mt-2 text-green-600 block';
        }
        if (previewImg) {
          previewImg.src = data.image_url;
          previewImg.classList.remove('hidden');
        }
        if (noPreview) {
          noPreview.classList.add('hidden');
        }
        resetFileSelection();
      } else {
        const err = await response.json().catch(() => ({}));
        if (uploadStatusMsg) {
          uploadStatusMsg.textContent = err.detail || 'Failed to upload image.';
          uploadStatusMsg.className = 'text-xs font-semibold mt-2 text-red-600 block';
        }
        uploadImageBtn.disabled = false;
        uploadImageBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    } catch (error) {
      console.error('Error uploading skin image:', error);
      if (uploadStatusMsg) {
        uploadStatusMsg.textContent = 'An error occurred during upload.';
        uploadStatusMsg.className = 'text-xs font-semibold mt-2 text-red-600 block';
      }
      uploadImageBtn.disabled = false;
      uploadImageBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  });
}

// --- Section View Navigation (Admin Dashboard Style) ---
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
  profile: { el: document.getElementById('section-profile'), nav: document.getElementById('navProfile'), title: 'Skin Profile & Scan', sub: 'Upload a skin photo for AI scan analysis, fill out your assessment survey, or both' },
  upload: { el: document.getElementById('section-profile'), nav: document.getElementById('navProfile'), title: 'Skin Profile & Scan', sub: 'Upload a skin photo for AI scan analysis, fill out your assessment survey, or both' },
  score: { el: document.getElementById('section-score'), nav: document.getElementById('navScore'), title: 'AI Skin Health Score', sub: 'ML-predicted skin health score and analysis' },
  routine: { el: document.getElementById('section-routine'), nav: document.getElementById('navRoutine'), title: 'Personalized Routine', sub: 'Today’s suggested skincare steps' },
  ingredients: { el: document.getElementById('section-ingredients'), nav: document.getElementById('navIngredients'), title: 'Ingredient Intelligence Module', sub: 'Deep INCI formula analysis, skin suitability assessment, biochemical conflict detection & active education' },
  recommendations: { el: document.getElementById('section-recommendations'), nav: document.getElementById('navRecommendations'), title: 'Recommended Products', sub: 'Targeted products for your skin condition' },
  progress: { el: document.getElementById('section-progress'), nav: document.getElementById('navProgress'), title: 'Progress Tracking', sub: 'Skin goals you’re working toward' },
  history: { el: document.getElementById('section-history'), nav: document.getElementById('navHistory'), title: 'Assessment History', sub: 'Complete historical log of AI skin health evaluations, risks, and prioritized concerns' },
  checklist: { el: document.getElementById('section-checklist'), nav: document.getElementById('navChecklist'), title: 'Daily Skincare Checklist', sub: 'Complete your daily care habits' },
};

const showSection = (key) => {
  const targetKey = sections[key] ? key : 'profile';
  Object.entries(sections).forEach(([k, s]) => {
    const isActive = (k === targetKey || (targetKey === 'upload' && k === 'profile'));
    if (s.el) s.el.classList.toggle('active', isActive);
    if (s.nav) s.nav.classList.toggle('active', isActive);
  });

  const activeSec = sections[targetKey];
  const titleEl = document.getElementById('pageTitle');
  const subEl = document.getElementById('pageSubtitle');
  if (titleEl && activeSec) titleEl.textContent = activeSec.title;
  if (subEl && activeSec) subEl.textContent = activeSec.sub;
  window.scrollTo({ top: 0 });

  if (targetKey === 'progress' || targetKey === 'score') {
    const token = localStorage.getItem('access_token');
    if (token) fetchSkinProfile(token);
  }
  if (targetKey === 'history') {
    fetchAssessmentHistory();
  }
  if (targetKey === 'routine') {
    fetchUserRoutine();
    fetchRoutineCheckin();
  }
  if (targetKey === 'ingredients') {
    initIngredientIntelligence();
  }
  if (targetKey === 'recommendations') {
    initProductRecommendationEngine();
  }
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

// Restore section view from URL hash on load or hashchange
const initSectionFromHash = () => {
  const hash = window.location.hash.replace('#', '').trim();
  if (hash && sections[hash]) {
    showSection(hash);
  } else {
    showSection('profile');
  }
};

window.addEventListener('hashchange', initSectionFromHash);

// --- Boot ---
bindRoutineEvents();
initIngredientIntelligence();
initProductRecommendationEngine();
updateChecklistStatus();
verifySession();
initSectionFromHash();
fetchUserRoutine();
fetchRoutineCheckin();


// ── ROUTINE MANAGEMENT JS ──
let currentRoutineData = null;

async function fetchUserRoutine() {
  const token = localStorage.getItem('access_token');
  if (!token) return;

  try {
    const res = await fetch('/user/routine', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      currentRoutineData = data;
      renderRoutineUI(data);
    }
  } catch (err) {
    console.error('Error fetching skincare routine:', err);
  }
}

function renderRoutineUI(routine) {
  if (!routine) return;

  // Season badge
  const seasonBadge = document.getElementById('routineSeasonBadge');
  if (seasonBadge) {
    const seasonIcons = { Summer: '☀️', Winter: '❄️', Spring: '🌸', Autumn: '🍂' };
    seasonBadge.textContent = `${seasonIcons[routine.season] || '🌿'} ${routine.season}`;
  }

  // Adaptation Banner
  const banner = document.getElementById('routineAdaptationBanner');
  const bannerText = document.getElementById('adaptationBannerText');
  if (banner && bannerText) {
    if (routine.adaptation_summary && routine.adaptation_summary.trim()) {
      bannerText.textContent = routine.adaptation_summary;
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }
  }

  // Render Morning steps
  const morningContainer = document.getElementById('morningStepsContainer');
  if (morningContainer) {
    if (routine.morning_steps && routine.morning_steps.length > 0) {
      morningContainer.innerHTML = routine.morning_steps.map(step => renderRoutineStepCard(step)).join('');
    } else {
      morningContainer.innerHTML = '<p class="text-sm text-slate-500 py-4 text-center">No morning steps generated yet. Click "Regenerate Routine" above.</p>';
    }
  }

  // Render Evening steps
  const eveningContainer = document.getElementById('eveningStepsContainer');
  if (eveningContainer) {
    if (routine.evening_steps && routine.evening_steps.length > 0) {
      eveningContainer.innerHTML = routine.evening_steps.map(step => renderRoutineStepCard(step)).join('');
    } else {
      eveningContainer.innerHTML = '<p class="text-sm text-slate-500 py-4 text-center">No evening steps generated yet. Click "Regenerate Routine" above.</p>';
    }
  }

  // Render Weekly steps
  const weeklyContainer = document.getElementById('weeklyStepsContainer');
  if (weeklyContainer) {
    if (routine.weekly_steps && routine.weekly_steps.length > 0) {
      weeklyContainer.innerHTML = routine.weekly_steps.map(step => renderRoutineStepCard(step)).join('');
    } else {
      weeklyContainer.innerHTML = '<p class="text-sm text-slate-500 py-4 text-center">No weekly treatment steps recorded.</p>';
    }
  }

  // Render Seasonal Recommendations
  const seasonalContainer = document.getElementById('seasonalRecsContainer');
  if (seasonalContainer) {
    if (routine.seasonal_recommendations && routine.seasonal_recommendations.length > 0) {
      seasonalContainer.innerHTML = routine.seasonal_recommendations.map(rec => `
        <div class="seasonal-card">
          <h3>${escapeHtml(rec.title)}</h3>
          <p>${escapeHtml(rec.description)}</p>
          ${rec.tip ? `<div class="seasonal-tip">💡 Tip: ${escapeHtml(rec.tip)}</div>` : ''}
        </div>
      `).join('');
    } else {
      seasonalContainer.innerHTML = '<p class="text-sm text-slate-500 py-4 text-center">No seasonal recommendations available.</p>';
    }
  }

  bindStepCardEvents();
}

function renderRoutineStepCard(step) {
  const catClass = `cat-${step.category.toLowerCase()}`;
  const catLabel = step.category.replace('_', ' ').toUpperCase();

  return `
    <div class="routine-card" data-step-id="${step.id}">
      <div class="step-cat-icon">${step.category_icon || '🧴'}</div>
      <div class="step-details">
        <div class="step-meta">
          <span class="step-category-badge ${catClass}">${escapeHtml(catLabel)}</span>
          <span class="step-freq-tag">⏱️ ${escapeHtml(step.frequency || 'Daily')}</span>
          ${step.is_customized ? '<span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">Customized</span>' : ''}
        </div>
        <h3 class="step-title-text">${escapeHtml(step.step_title)}</h3>
        <p class="step-desc-text">${escapeHtml(step.description)}</p>
        ${step.active_ingredients ? `<div class="step-ingredients-row">🧪 Actives: ${escapeHtml(step.active_ingredients)}</div>` : ''}
        ${step.caution_notes ? `<div class="step-caution-tag">⚠️ Caution: ${escapeHtml(step.caution_notes)}</div>` : ''}
      </div>
      <div class="step-card-actions">
        <button class="btn-icon-step btn-edit-step" data-step-id="${step.id}" title="Edit Step">✏️</button>
        <button class="btn-icon-step delete btn-delete-step" data-step-id="${step.id}" title="Delete Step">🗑️</button>
      </div>
    </div>
  `;
}

function bindStepCardEvents() {
  document.querySelectorAll('.btn-edit-step').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const stepId = parseInt(e.currentTarget.dataset.stepId);
      openEditStepModal(stepId);
    });
  });

  document.querySelectorAll('.btn-delete-step').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const stepId = parseInt(e.currentTarget.dataset.stepId);
      if (confirm('Are you sure you want to delete this routine step?')) {
        await deleteRoutineStep(stepId);
      }
    });
  });
}

function openEditStepModal(stepId) {
  if (!currentRoutineData) return;
  const allSteps = [
    ...(currentRoutineData.morning_steps || []),
    ...(currentRoutineData.evening_steps || []),
    ...(currentRoutineData.weekly_steps || []),
  ];
  const step = allSteps.find(s => s.id === stepId);
  if (!step) return;

  document.getElementById('stepModalTitle').textContent = 'Edit Routine Step';
  document.getElementById('stepModalId').value = step.id;
  document.getElementById('stepFormTimeOfDay').value = step.time_of_day;
  document.getElementById('stepFormCategory').value = step.category;
  document.getElementById('stepFormTitle').value = step.step_title;
  document.getElementById('stepFormDescription').value = step.description;
  document.getElementById('stepFormIngredients').value = step.active_ingredients || '';
  document.getElementById('stepFormFrequency').value = step.frequency || '';
  document.getElementById('stepFormCaution').value = step.caution_notes || '';

  document.getElementById('stepModal').classList.remove('hidden');
}

async function deleteRoutineStep(stepId) {
  const token = localStorage.getItem('access_token');
  if (!token) return;
  try {
    const res = await fetch(`/user/routine/step/${stepId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      await fetchUserRoutine();
    }
  } catch (err) {
    console.error('Error deleting step:', err);
  }
}

async function regenerateRoutine() {
  const token = localStorage.getItem('access_token');
  if (!token) return;
  const btn = document.getElementById('btnRegenerateRoutine');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Regenerating...';
  }
  try {
    const res = await fetch('/user/routine/regenerate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      currentRoutineData = data;
      renderRoutineUI(data);
    }
  } catch (err) {
    console.error('Error regenerating routine:', err);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>✨</span> Regenerate Routine';
    }
  }
}

async function fetchRoutineCheckin() {
  const token = localStorage.getItem('access_token');
  if (!token) return;

  try {
    const res = await fetch('/user/routine/checkin', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      updateCheckinUI(data);
    }
  } catch (err) {
    console.error('Error fetching routine checkin:', err);
  }
}

function updateCheckinUI(data) {
  const statusTag = document.getElementById('checkinStatusText');
  const btnMorning = document.getElementById('btnCheckinMorning');
  const btnEvening = document.getElementById('btnCheckinEvening');

  if (btnMorning) {
    if (data.morning_completed) {
      btnMorning.classList.add('done');
      btnMorning.textContent = '✓ Morning Completed';
    } else {
      btnMorning.classList.remove('done');
      btnMorning.textContent = '☀️ Morning Complete';
    }
  }

  if (btnEvening) {
    if (data.evening_completed) {
      btnEvening.classList.add('done');
      btnEvening.textContent = '✓ Evening Completed';
    } else {
      btnEvening.classList.remove('done');
      btnEvening.textContent = '🌙 Evening Complete';
    }
  }

  if (statusTag) {
    if (data.morning_completed && data.evening_completed) {
      statusTag.textContent = 'All Completed! 🎉';
      statusTag.className = 'checkin-status-tag complete';
    } else if (data.morning_completed) {
      statusTag.textContent = 'Morning Done (1/2)';
      statusTag.className = 'checkin-status-tag complete';
    } else if (data.evening_completed) {
      statusTag.textContent = 'Evening Done (1/2)';
      statusTag.className = 'checkin-status-tag complete';
    } else {
      statusTag.textContent = 'Pending (0/2)';
      statusTag.className = 'checkin-status-tag';
    }
  }
}

async function toggleCheckin(timeOfDay) {
  const token = localStorage.getItem('access_token');
  if (!token) return;

  const btnMorning = document.getElementById('btnCheckinMorning');
  const btnEvening = document.getElementById('btnCheckinEvening');
  const isMorning = timeOfDay === 'morning';
  const currentlyDone = isMorning ? btnMorning.classList.contains('done') : btnEvening.classList.contains('done');

  try {
    const res = await fetch('/user/routine/checkin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        time_of_day: timeOfDay,
        completed: !currentlyDone
      })
    });
    if (res.ok) {
      const data = await res.json();
      updateCheckinUI(data);
    }
  } catch (err) {
    console.error('Error logging checkin:', err);
  }
}

// Bind Routine UI Event Listeners
function bindRoutineEvents() {
  // Tabs
  document.querySelectorAll('.routine-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.routine-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.routine-tab-content').forEach(c => c.classList.remove('active'));
      
      const targetTab = e.currentTarget.dataset.tab;
      e.currentTarget.classList.add('active');

      if (targetTab === 'morning') document.getElementById('tabContentMorning')?.classList.add('active');
      if (targetTab === 'evening') document.getElementById('tabContentEvening')?.classList.add('active');
      if (targetTab === 'weekly') document.getElementById('tabContentWeekly')?.classList.add('active');
      if (targetTab === 'seasonal') document.getElementById('tabContentSeasonal')?.classList.add('active');
    });
  });

  // Regenerate Button
  const btnRegen = document.getElementById('btnRegenerateRoutine');
  if (btnRegen) {
    btnRegen.replaceWith(btnRegen.cloneNode(true));
    document.getElementById('btnRegenerateRoutine')?.addEventListener('click', () => regenerateRoutine());
  }

  // Add Step Button
  const btnAddStep = document.getElementById('btnAddRoutineStep');
  if (btnAddStep) {
    btnAddStep.replaceWith(btnAddStep.cloneNode(true));
    document.getElementById('btnAddRoutineStep')?.addEventListener('click', () => {
      const titleEl = document.getElementById('stepModalTitle');
      const idEl = document.getElementById('stepModalId');
      const formEl = document.getElementById('stepForm');
      const modalEl = document.getElementById('stepModal');
      if (titleEl) titleEl.textContent = 'Add Custom Routine Step';
      if (idEl) idEl.value = '';
      if (formEl) formEl.reset();
      if (modalEl) modalEl.classList.remove('hidden');
    });
  }

  // Modal Controls
  const btnCloseModal = document.getElementById('btnCloseStepModal');
  const btnCancelModal = document.getElementById('btnCancelStepModal');
  const backdropModal = document.getElementById('stepModalBackdrop');
  const hideModal = () => document.getElementById('stepModal')?.classList.add('hidden');

  if (btnCloseModal) btnCloseModal.addEventListener('click', hideModal);
  if (btnCancelModal) btnCancelModal.addEventListener('click', hideModal);
  if (backdropModal) backdropModal.addEventListener('click', hideModal);

  // Modal Form Submit
  const stepForm = document.getElementById('stepForm');
  if (stepForm) {
    stepForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const stepId = document.getElementById('stepModalId')?.value;
      const payload = {
        time_of_day: document.getElementById('stepFormTimeOfDay')?.value || 'morning',
        category: document.getElementById('stepFormCategory')?.value || 'cleansing',
        step_title: document.getElementById('stepFormTitle')?.value || '',
        description: document.getElementById('stepFormDescription')?.value || '',
        active_ingredients: document.getElementById('stepFormIngredients')?.value || '',
        frequency: document.getElementById('stepFormFrequency')?.value || 'Daily',
        caution_notes: document.getElementById('stepFormCaution')?.value || '',
      };

      try {
        let res;
        if (stepId) {
          res = await fetch(`/user/routine/step/${stepId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
        } else {
          res = await fetch('/user/routine/step', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
        }

        if (res.ok) {
          hideModal();
          await fetchUserRoutine();
        }
      } catch (err) {
        console.error('Error saving step:', err);
      }
    });
  }

  // Checkin Buttons
  const btnM = document.getElementById('btnCheckinMorning');
  const btnE = document.getElementById('btnCheckinEvening');
  if (btnM) {
    btnM.replaceWith(btnM.cloneNode(true));
    document.getElementById('btnCheckinMorning')?.addEventListener('click', () => toggleCheckin('morning'));
  }
  if (btnE) {
    btnE.replaceWith(btnE.cloneNode(true));
    document.getElementById('btnCheckinEvening')?.addEventListener('click', () => toggleCheckin('evening'));
  }
}


// ============================================================================
// FEATURE 5: INGREDIENT INTELLIGENCE MODULE CONTROLLER
// ============================================================================

function initIngredientIntelligence() {
  if (isIngredientModuleInitialized) return;
  isIngredientModuleInitialized = true;

  bindIngredientSubTabs();
  bindFormulaAnalyzerEvents();
  bindMatrixEvents();
  bindEducationHubEvents();

  // Pre-load default formula if empty
  const inputEl = document.getElementById('ingredientInputText');
  if (inputEl && !inputEl.value.trim()) {
    inputEl.value = PRESET_FORMULAS.brightening;
    updateIngredientDraftTokenCount();
  }

  // Load 8 Core Pillars
  loadIngredientCategoriesCatalog();
}

// ── SUB-TAB NAVIGATION ──
function bindIngredientSubTabs() {
  const tabBtns = document.querySelectorAll('.ingredient-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTab = btn.dataset.tab;
      document.getElementById('tabContentFormula')?.classList.toggle('active', targetTab === 'formula');
      document.getElementById('tabContentMatrix')?.classList.toggle('active', targetTab === 'matrix');
      document.getElementById('tabContentEducation')?.classList.toggle('active', targetTab === 'education');
    });
  });
}

// ── DRAFT TOKEN COUNTER ──
function updateIngredientDraftTokenCount() {
  const inputEl = document.getElementById('ingredientInputText');
  const countBadge = document.getElementById('ingredientTokenCountBadge');
  if (!inputEl || !countBadge) return;

  const raw = inputEl.value.trim();
  if (!raw) {
    countBadge.textContent = '0 ingredients recognized in draft';
    return;
  }

  const tokens = raw.split(/[,;|\n]/).map(t => t.trim()).filter(t => t.length >= 2);
  countBadge.textContent = `${tokens.length} ingredient token${tokens.length === 1 ? '' : 's'} recognized in draft`;
}

// ── FORMULA ANALYZER EVENTS ──
function bindFormulaAnalyzerEvents() {
  const inputEl = document.getElementById('ingredientInputText');
  const btnAnalyze = document.getElementById('btnAnalyzeIngredients');
  const btnClear = document.getElementById('btnClearIngredients');

  if (inputEl) {
    inputEl.addEventListener('input', updateIngredientDraftTokenCount);
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (inputEl) inputEl.value = '';
      updateIngredientDraftTokenCount();
      document.getElementById('ingredientResultsContainer')?.classList.add('hidden');
      document.getElementById('ingredientErrorState')?.classList.add('hidden');
    });
  }

  if (btnAnalyze) {
    btnAnalyze.addEventListener('click', () => runFormulaAnalysis());
  }

  // Preset Buttons
  document.querySelectorAll('.preset-formula-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const presetKey = e.currentTarget.dataset.preset;
      if (PRESET_FORMULAS[presetKey] && inputEl) {
        inputEl.value = PRESET_FORMULAS[presetKey];
        updateIngredientDraftTokenCount();
        runFormulaAnalysis();
      }
    });
  });
}

// ── RUN FORMULA ANALYSIS (API CALL) ──
async function runFormulaAnalysis() {
  const inputEl = document.getElementById('ingredientInputText');
  const loadingEl = document.getElementById('ingredientLoadingState');
  const errorEl = document.getElementById('ingredientErrorState');
  const errorMsg = document.getElementById('ingredientErrorMsg');
  const resultsContainer = document.getElementById('ingredientResultsContainer');

  const text = inputEl ? inputEl.value.trim() : '';
  if (!text) {
    if (errorEl && errorMsg) {
      errorMsg.textContent = 'Please enter or paste an ingredient list to analyze.';
      errorEl.classList.remove('hidden');
    }
    return;
  }

  if (errorEl) errorEl.classList.add('hidden');
  if (resultsContainer) resultsContainer.classList.add('hidden');
  if (loadingEl) loadingEl.classList.remove('hidden');

  const token = localStorage.getItem('access_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch('/api/ingredients/analyze', {
      method: 'POST',
      headers,
      body: JSON.stringify({ ingredients_text: text })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to analyze formulation.');
    }

    const data = await res.json();
    renderFormulaAnalysisResults(data);

    if (loadingEl) loadingEl.classList.add('hidden');
    if (resultsContainer) resultsContainer.classList.remove('hidden');
  } catch (err) {
    if (loadingEl) loadingEl.classList.add('hidden');
    if (errorEl && errorMsg) {
      errorMsg.textContent = err.message || 'An unexpected error occurred during ingredient analysis.';
      errorEl.classList.remove('hidden');
    }
    console.error('Ingredient analysis error:', err);
  }
}

// ── RENDER FORMULA RESULTS ──
function renderFormulaAnalysisResults(data) {
  const suitability = data.suitability_assessment || {};
  const allergy = data.allergy_assessment || {};
  const interactions = data.interaction_assessment || {};
  const analysis = data.analysis || {};

  // 1. Suitability Match Score & Rating
  const scoreNum = suitability.suitability_score || 0;
  const ratingText = suitability.rating || 'Evaluated';
  const badgeEl = document.getElementById('suitabilityRatingBadge');
  const scoreEl = document.getElementById('suitabilityScoreNum');
  const gaugeEl = document.getElementById('suitabilityGaugeRing');

  if (scoreEl) scoreEl.textContent = `${scoreNum}%`;
  if (badgeEl) {
    badgeEl.textContent = ratingText;
    if (scoreNum >= 85) {
      badgeEl.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
      if (gaugeEl) gaugeEl.className = 'w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center';
    } else if (scoreNum >= 70) {
      badgeEl.className = 'px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300';
      if (gaugeEl) gaugeEl.className = 'w-20 h-20 rounded-full border-4 border-indigo-500 flex items-center justify-center';
    } else if (scoreNum >= 50) {
      badgeEl.className = 'px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
      if (gaugeEl) gaugeEl.className = 'w-20 h-20 rounded-full border-4 border-amber-500 flex items-center justify-center';
    } else {
      badgeEl.className = 'px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
      if (gaugeEl) gaugeEl.className = 'w-20 h-20 rounded-full border-4 border-rose-500 flex items-center justify-center';
    }
  }

  // 2. Allergy & Irritation Card
  const allergyIconBox = document.getElementById('allergyStatusIconBox');
  const allergyDesc = document.getElementById('allergyStatusDesc');
  const allergyAlertBadge = document.getElementById('allergyAlertCountBadge');

  if (allergy.has_critical_allergy) {
    if (allergyIconBox) {
      allergyIconBox.innerHTML = `<span class="text-2xl">🚨</span><span class="font-bold text-sm text-rose-600 dark:text-rose-400">Critical Allergen Conflict</span>`;
    }
    if (allergyDesc) allergyDesc.textContent = allergy.safety_summary || 'Formula conflicts with your medical allergy profile.';
    if (allergyAlertBadge) {
      allergyAlertBadge.textContent = `${allergy.total_alerts_count} Critical Conflict(s)`;
      allergyAlertBadge.className = 'self-start text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
    }
  } else if (allergy.total_alerts_count > 0) {
    if (allergyIconBox) {
      allergyIconBox.innerHTML = `<span class="text-2xl">⚠️</span><span class="font-bold text-sm text-amber-600 dark:text-amber-400">Irritants / Scent Flagged</span>`;
    }
    if (allergyDesc) allergyDesc.textContent = allergy.safety_summary || 'Contains potential skin sensitizers.';
    if (allergyAlertBadge) {
      allergyAlertBadge.textContent = `${allergy.total_alerts_count} Flagged Item(s)`;
      allergyAlertBadge.className = 'self-start text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
    }
  } else {
    if (allergyIconBox) {
      allergyIconBox.innerHTML = `<span class="text-2xl">🛡️</span><span class="font-bold text-sm text-emerald-600 dark:text-emerald-400">Allergy Safe</span>`;
    }
    if (allergyDesc) allergyDesc.textContent = 'No known allergens, sensitizing fragrances, or harsh drying alcohols detected.';
    if (allergyAlertBadge) {
      allergyAlertBadge.textContent = '0 Allergens Flagged';
      allergyAlertBadge.className = 'self-start text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
    }
  }

  // 3. Comedogenic Rating
  const comedoNum = document.getElementById('comedogenicScoreNum');
  const comedoLabel = document.getElementById('comedogenicRiskLabel');
  if (comedoNum) comedoNum.textContent = analysis.max_comedogenic_rating || 0;
  if (comedoLabel) comedoLabel.textContent = analysis.comedogenic_risk || 'Non-Comedogenic';

  // 4. Identified Actives & Irritation
  const activesNum = document.getElementById('identifiedActivesNum');
  const totalNum = document.getElementById('totalIngredientsNum');
  const catDetectedCount = document.getElementById('activeCategoriesDetectedCount');
  const irritationBadge = document.getElementById('formulaIrritationBadge');

  if (activesNum) activesNum.textContent = analysis.identified_actives_count || 0;
  if (totalNum) totalNum.textContent = `of ${analysis.total_ingredients_count || 0} items`;
  if (catDetectedCount) catDetectedCount.textContent = `${(analysis.detected_categories || []).length} Core Pillars Detected`;
  if (irritationBadge) irritationBadge.textContent = analysis.irritation_risk || 'Low / Gentle';

  // 5. Suitability Summary, Pros & Cautions
  const sumSentence = document.getElementById('suitabilitySummarySentence');
  if (sumSentence) sumSentence.textContent = suitability.summary || 'Personalized analysis computed based on your active skin profile.';

  const prosList = document.getElementById('suitabilityProsList');
  if (prosList) {
    if (suitability.pros && suitability.pros.length > 0) {
      prosList.innerHTML = suitability.pros.map(p => `
        <li class="flex items-start gap-2">
          <span class="text-emerald-500 font-bold">✓</span>
          <span>${escapeHtml(p)}</span>
        </li>
      `).join('');
    } else {
      prosList.innerHTML = `<li class="text-slate-400 italic">No specific active synergies highlighted for your selected concerns.</li>`;
    }
  }

  const cautionsList = document.getElementById('suitabilityCautionsList');
  if (cautionsList) {
    if (suitability.cautions && suitability.cautions.length > 0) {
      cautionsList.innerHTML = suitability.cautions.map(c => `
        <li class="flex items-start gap-2 text-amber-700 dark:text-amber-400">
          <span class="font-bold">!</span>
          <span>${escapeHtml(c)}</span>
        </li>
      `).join('');
    } else {
      cautionsList.innerHTML = `<li class="text-emerald-600 dark:text-emerald-400">No active formulation contraindications noted.</li>`;
    }
  }

  // Allergy Alerts List
  const allergyAlertsContainer = document.getElementById('allergyAlertsContainer');
  if (allergyAlertsContainer) {
    if (allergy.alerts && allergy.alerts.length > 0) {
      allergyAlertsContainer.innerHTML = allergy.alerts.map(a => `
        <div class="p-3 rounded-xl ${a.severity === 'Critical' ? 'bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800/80 dark:text-rose-200' : 'bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800/80 dark:text-amber-200'} text-xs">
          <div class="flex items-center justify-between font-bold">
            <span>${escapeHtml(a.ingredient)}</span>
            <span class="px-2 py-0.5 rounded text-[10px] uppercase font-black ${a.severity === 'Critical' ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'}">${escapeHtml(a.type)}</span>
          </div>
          <p class="mt-1 opacity-90">${escapeHtml(a.message)}</p>
        </div>
      `).join('');
    } else {
      allergyAlertsContainer.innerHTML = `
        <div class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <span>🛡️</span>
          <span>Zero medical allergen conflicts detected in this product formula.</span>
        </div>
      `;
    }
  }

  // 6. Biochemical Interactions Box (Conflicts & Synergies)
  const conflictsBox = document.getElementById('formulaConflictsBox');
  const synergiesBox = document.getElementById('formulaSynergiesBox');
  const routineAdviceEl = document.getElementById('formulaRoutineAdviceText');
  const statusBadge = document.getElementById('interactionBadgeStatus');

  if (interactions.has_conflicts) {
    if (statusBadge) {
      statusBadge.textContent = `⚠️ ${interactions.conflict_count} Conflict(s) Detected`;
      statusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
    }
    if (conflictsBox) {
      conflictsBox.innerHTML = `
        <div class="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Chemical Conflicts / Routine Separation Required</div>
        ${interactions.conflicts.map(c => `
          <div class="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 flex flex-col gap-1 text-xs">
            <div class="flex items-center justify-between">
              <span class="font-bold text-rose-900 dark:text-rose-200">${escapeHtml(c.title)}</span>
              <span class="px-2 py-0.5 rounded bg-rose-200 text-rose-900 font-bold text-[10px] uppercase">${escapeHtml(c.severity)} Severity</span>
            </div>
            <p class="text-rose-800 dark:text-rose-300">${escapeHtml(c.explanation)}</p>
            <div class="mt-1 pt-1.5 border-t border-rose-200/60 dark:border-rose-800/40 text-rose-900 dark:text-rose-100 font-semibold flex items-center gap-1.5">
              <span>💡 Action:</span>
              <span>${escapeHtml(c.recommendation)}</span>
            </div>
          </div>
        `).join('')}
      `;
    }
  } else {
    if (conflictsBox) conflictsBox.innerHTML = '';
  }

  if (interactions.has_synergies) {
    if (!interactions.has_conflicts && statusBadge) {
      statusBadge.textContent = `✨ ${interactions.synergy_count} Synergy Boost(s)`;
      statusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
    }
    if (synergiesBox) {
      synergiesBox.innerHTML = `
        <div class="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Clinically Synergistic Power Combos</div>
        ${interactions.synergies.map(s => `
          <div class="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col gap-1 text-xs">
            <div class="flex items-center justify-between">
              <span class="font-bold text-emerald-900 dark:text-emerald-200">${escapeHtml(s.title)}</span>
              <span class="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold text-[10px] uppercase">Synergy Boost</span>
            </div>
            <p class="text-emerald-800 dark:text-emerald-300">${escapeHtml(s.explanation)}</p>
            <div class="mt-1 pt-1.5 border-t border-emerald-200/60 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-100 font-semibold flex items-center gap-1.5">
              <span>🌟 Recommended Usage:</span>
              <span>${escapeHtml(s.recommendation)}</span>
            </div>
          </div>
        `).join('')}
      `;
    }
  } else {
    if (synergiesBox) synergiesBox.innerHTML = '';
  }

  if (!interactions.has_conflicts && !interactions.has_synergies) {
    if (statusBadge) {
      statusBadge.textContent = 'Formula Stable & Compatible';
      statusBadge.className = 'px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800';
    }
  }

  if (routineAdviceEl) {
    if (interactions.routine_advice && interactions.routine_advice.length > 0) {
      routineAdviceEl.textContent = interactions.routine_advice.join(' ');
    } else {
      routineAdviceEl.textContent = 'Apply consistently according to product type. Maintain regular sunscreen protection.';
    }
  }

  // 7. Detected Core Categories Grid
  const categoriesGrid = document.getElementById('detectedCategoriesGrid');
  if (categoriesGrid) {
    const details = analysis.detected_category_details || [];
    if (details.length > 0) {
      categoriesGrid.innerHTML = details.map(cat => `
        <div class="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 cursor-pointer transition flex flex-col justify-between shadow-xs" onclick="openIngredientEducationModal('${cat.id}')">
          <div class="flex items-center gap-2">
            <span class="text-xl">${cat.icon || '✨'}</span>
            <span class="font-bold text-xs text-slate-800 dark:text-slate-100">${escapeHtml(cat.name)}</span>
          </div>
          <p class="text-[11px] text-slate-500 mt-2 line-clamp-2">${escapeHtml(cat.tagline)}</p>
          <span class="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mt-2 flex items-center gap-1">
            View Science Dossier →
          </span>
        </div>
      `).join('');
    } else {
      categoriesGrid.innerHTML = `
        <div class="col-span-full p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
          No core active pillars detected (carrier formula, humectants or soothing base).
        </div>
      `;
    }
  }

  // 8. Full INCI Table
  const tableBody = document.getElementById('inciTableBody');
  const tableBadge = document.getElementById('inciTableCountBadge');
  if (tableBadge) tableBadge.textContent = `${analysis.matched_ingredients?.length || 0} ingredients`;

  if (tableBody && analysis.matched_ingredients) {
    tableBody.innerHTML = analysis.matched_ingredients.map(item => `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
        <td class="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
          ${escapeHtml(item.canonical_name)}
          ${item.raw_token && item.raw_token.toLowerCase() !== item.canonical_name.toLowerCase() ? `<span class="block text-[10px] text-slate-400 font-normal">INCI: ${escapeHtml(item.raw_token)}</span>` : ''}
        </td>
        <td class="py-2.5 px-3">
          ${item.category && item.category !== 'other' ? `
            <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              ${escapeHtml(item.category.replace('_', ' ').toUpperCase())}
            </span>
          ` : '<span class="text-slate-400 text-xs">Formulation Base</span>'}
        </td>
        <td class="py-2.5 px-3 text-slate-600 dark:text-slate-300 text-xs">
          ${(item.functions || []).slice(0, 2).map(f => escapeHtml(f)).join(', ') || 'Formulation agent'}
        </td>
        <td class="py-2.5 px-3">
          <span class="font-bold ${item.comedogenic_rating >= 3 ? 'text-rose-600' : item.comedogenic_rating >= 1 ? 'text-amber-600' : 'text-emerald-600'}">
            ${item.comedogenic_rating}/5
          </span>
        </td>
        <td class="py-2.5 px-3">
          <span class="text-xs ${item.irritation_potential?.includes('High') ? 'text-rose-600 font-bold' : item.irritation_potential?.includes('Medium') ? 'text-amber-600' : 'text-slate-500'}">
            ${escapeHtml(item.irritation_potential || 'Low')}
          </span>
        </td>
      </tr>
    `).join('');
  }
}


// ── TAB 2: ACTIVE INTERACTION & CONFLICT MATRIX LOGIC ──
function bindMatrixEvents() {
  const chipsContainer = document.getElementById('matrixActiveChipsContainer');
  const btnReset = document.getElementById('btnResetMatrixSelection');

  if (chipsContainer) {
    chipsContainer.addEventListener('change', () => runMatrixEvaluation());
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      document.querySelectorAll('.matrix-checkbox').forEach(cb => {
        cb.checked = false;
        const chip = cb.closest('.matrix-chip');
        chip?.classList.remove('border-indigo-600', 'bg-indigo-50', 'text-indigo-700', 'dark:bg-indigo-950/40', 'dark:border-indigo-500');
      });
      updateMatrixSelectedCount();
      renderMatrixEmptyState();
    });
  }
}

function updateMatrixSelectedCount() {
  const checkboxes = document.querySelectorAll('.matrix-checkbox:checked');
  const countText = document.getElementById('matrixSelectedCountText');
  if (countText) {
    countText.textContent = `${checkboxes.length} active${checkboxes.length === 1 ? '' : 's'} selected ${checkboxes.length < 2 ? '(select at least 2)' : ''}`;
  }
}

async function runMatrixEvaluation() {
  const checkboxes = document.querySelectorAll('.matrix-checkbox:checked');
  updateMatrixSelectedCount();

  // Update chip styles
  document.querySelectorAll('.matrix-checkbox').forEach(cb => {
    const chip = cb.closest('.matrix-chip');
    if (cb.checked) {
      chip?.classList.add('border-indigo-600', 'bg-indigo-50', 'text-indigo-700', 'dark:bg-indigo-950/40', 'dark:border-indigo-500');
    } else {
      chip?.classList.remove('border-indigo-600', 'bg-indigo-50', 'text-indigo-700', 'dark:bg-indigo-950/40', 'dark:border-indigo-500');
    }
  });

  const selectedActives = Array.from(checkboxes).map(cb => cb.value);
  const reportBox = document.getElementById('matrixReportBox');

  if (selectedActives.length < 2) {
    renderMatrixEmptyState();
    return;
  }

  if (reportBox) {
    reportBox.innerHTML = `
      <div class="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div class="inline-block animate-spin w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full mb-2"></div>
        <p class="text-xs text-slate-500">Evaluating biochemical pairwise compatibility...</p>
      </div>
    `;
  }

  try {
    const res = await fetch('/api/ingredients/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients: selectedActives })
    });

    if (!res.ok) throw new Error('Failed to evaluate active interactions.');

    const data = await res.json();
    renderMatrixResults(data, selectedActives);
  } catch (err) {
    if (reportBox) {
      reportBox.innerHTML = `
        <div class="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-sm">
          ${escapeHtml(err.message || 'Error checking active interaction compatibility.')}
        </div>
      `;
    }
  }
}

function renderMatrixEmptyState() {
  const reportBox = document.getElementById('matrixReportBox');
  if (reportBox) {
    reportBox.innerHTML = `
      <div class="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
        <span class="text-3xl">🧪</span>
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-2">Select 2 or more ingredients above to calculate biochemical compatibility.</p>
        <p class="text-xs text-slate-400 mt-1">Try testing Retinoids + Glycolic Acid or Vitamin C + Ferulic Acid.</p>
      </div>
    `;
  }
}

function renderMatrixResults(data, selectedActives) {
  const reportBox = document.getElementById('matrixReportBox');
  if (!reportBox) return;

  const conflicts = data.conflicts || [];
  const synergies = data.synergies || [];
  const routineAdvice = data.routine_advice || [];

  let statusHeader = '';
  if (conflicts.length > 0) {
    statusHeader = `
      <div class="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">⚠️</span>
          <div>
            <h4 class="font-bold text-sm text-rose-900 dark:text-rose-200">Active Conflict Warning</h4>
            <p class="text-xs text-rose-700 dark:text-rose-300">Chemical collision or over-exfoliation hazard detected between selected actives.</p>
          </div>
        </div>
        <span class="px-2.5 py-1 rounded-full text-xs font-black bg-rose-200 text-rose-900">${conflicts.length} Conflict(s)</span>
      </div>
    `;
  } else if (synergies.length > 0) {
    statusHeader = `
      <div class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">✨</span>
          <div>
            <h4 class="font-bold text-sm text-emerald-900 dark:text-emerald-200">Synergistic Power Combination</h4>
            <p class="text-xs text-emerald-700 dark:text-emerald-300">Selected actives amplify efficacy, stability, or barrier protection together.</p>
          </div>
        </div>
        <span class="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-200 text-emerald-900">${synergies.length} Synergy Boost(s)</span>
      </div>
    `;
  } else {
    statusHeader = `
      <div class="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xl">✅</span>
          <div>
            <h4 class="font-bold text-sm text-indigo-900 dark:text-indigo-200">Compatible & Safe Combination</h4>
            <p class="text-xs text-indigo-700 dark:text-indigo-300">No known biochemical conflicts or degradation risks between selected actives.</p>
          </div>
        </div>
        <span class="px-2.5 py-1 rounded-full text-xs font-black bg-indigo-200 text-indigo-900">Safe to Pair</span>
      </div>
    `;
  }

  const conflictsHtml = conflicts.length > 0 ? `
    <div class="flex flex-col gap-3">
      <span class="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Detailed Chemical Conflict Breakdown</span>
      ${conflicts.map(c => `
        <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 shadow-sm flex flex-col gap-1.5 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-bold text-sm text-rose-900 dark:text-rose-200">${escapeHtml(c.title)}</span>
            <span class="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px] uppercase">${escapeHtml(c.severity)} Severity</span>
          </div>
          <p class="text-slate-600 dark:text-slate-300 text-xs">${escapeHtml(c.explanation)}</p>
          <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-rose-800 dark:text-rose-300 font-semibold flex items-center gap-2">
            <span>🛡️ Clinical Separation Guidance:</span>
            <span>${escapeHtml(c.recommendation)}</span>
          </div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const synergiesHtml = synergies.length > 0 ? `
    <div class="flex flex-col gap-3">
      <span class="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Synergistic Pairings</span>
      ${synergies.map(s => `
        <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-sm flex flex-col gap-1.5 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-bold text-sm text-emerald-900 dark:text-emerald-200">${escapeHtml(s.title)}</span>
            <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">Synergy</span>
          </div>
          <p class="text-slate-600 dark:text-slate-300 text-xs">${escapeHtml(s.explanation)}</p>
          <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
            <span>🌟 How to Pair:</span>
            <span>${escapeHtml(s.recommendation)}</span>
          </div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const adviceHtml = routineAdvice.length > 0 ? `
    <div class="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-xs md:text-sm text-indigo-900 dark:text-indigo-200 flex items-center gap-2.5">
      <span class="text-xl">💡</span>
      <span>${escapeHtml(routineAdvice.join(' '))}</span>
    </div>
  ` : '';

  reportBox.innerHTML = `
    ${statusHeader}
    ${conflictsHtml}
    ${synergiesHtml}
    ${adviceHtml}
  `;
}


// ── TAB 3: 8 CORE PILLARS & EDUCATION HUB ──
async function loadIngredientCategoriesCatalog() {
  const container = document.getElementById('educationCategoriesGrid');
  if (!container) return;

  try {
    const res = await fetch('/api/ingredients/categories');
    if (!res.ok) throw new Error('Failed to load ingredient categories.');

    const data = await res.json();
    cachedIngredientCategories = data;
    renderEducationCategories(data);
  } catch (err) {
    container.innerHTML = `
      <div class="col-span-full p-8 text-center text-xs text-rose-500 bg-rose-50 rounded-xl">
        Error loading ingredient catalog.
      </div>
    `;
    console.error('Error loading ingredient categories:', err);
  }
}

function renderEducationCategories(categories) {
  const container = document.getElementById('educationCategoriesGrid');
  if (!container) return;

  if (!categories || categories.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-10 px-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
        <span class="text-3xl">🔍</span>
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-2">No matching ingredient pillars found.</p>
        <p class="text-xs text-slate-400 mt-1">Try searching Retinoids, Vitamin C, Salicylic Acid, Hyaluronic Acid, or Ceramides.</p>
        <button type="button" class="mt-3 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition" onclick="document.getElementById('eduSearchInput').value=''; renderEducationCategories(cachedIngredientCategories);">
          Clear Search Filter
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = categories.map(cat => `
    <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-400 transition flex flex-col justify-between group">
      <div>
        <div class="flex items-center justify-between">
          <span class="text-3xl p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl">${cat.icon || '🧬'}</span>
          <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            ${escapeHtml(cat.best_time || 'AM & PM')}
          </span>
        </div>
        
        <h4 class="font-bold text-base text-slate-800 dark:text-slate-100 mt-3 group-hover:text-indigo-600 transition">
          ${escapeHtml(cat.name)}
        </h4>
        <p class="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5 line-clamp-1">
          ${escapeHtml(cat.tagline)}
        </p>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
          ${escapeHtml(cat.summary)}
        </p>

        <!-- Benefits Chips -->
        <div class="flex flex-wrap gap-1 mt-3">
          ${(cat.primary_benefits || []).slice(0, 2).map(b => `
            <span class="px-2 py-0.5 rounded text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
              ${escapeHtml(b)}
            </span>
          `).join('')}
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span class="text-[11px] text-slate-400 font-mono">pH ${escapeHtml(cat.optimal_ph || '5.5')}</span>
        <button type="button" class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition flex items-center gap-1" onclick="openIngredientEducationModal('${cat.id}')">
          <span>Science Dossier</span>
          <span>→</span>
        </button>
      </div>
    </div>
  `).join('');
}

function bindEducationHubEvents() {
  const searchInput = document.getElementById('eduSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        renderEducationCategories(cachedIngredientCategories);
        return;
      }
      const filtered = cachedIngredientCategories.filter(cat => {
        return (
          cat.name.toLowerCase().includes(q) ||
          cat.tagline.toLowerCase().includes(q) ||
          cat.summary.toLowerCase().includes(q) ||
          (cat.key_ingredients || []).some(k => k.toLowerCase().includes(q)) ||
          (cat.primary_benefits || []).some(b => b.toLowerCase().includes(q))
        );
      });
      renderEducationCategories(filtered);
    });
  }

  // Modal close handlers
  const modal = document.getElementById('ingredientDetailModal');
  const backdrop = document.getElementById('ingredientModalBackdrop');
  const btnClose = document.getElementById('btnCloseIngredientModal');
  const hideModal = () => modal?.classList.add('hidden');

  if (backdrop) backdrop.addEventListener('click', hideModal);
  if (btnClose) btnClose.addEventListener('click', hideModal);
}

// ── OPEN INGREDIENT EDUCATION MODAL ──
async function openIngredientEducationModal(identifier) {
  const modal = document.getElementById('ingredientDetailModal');
  const iconEl = document.getElementById('eduModalIcon');
  const titleEl = document.getElementById('eduModalTitle');
  const taglineEl = document.getElementById('eduModalTagline');
  const bodyEl = document.getElementById('eduModalBody');

  if (!modal || !bodyEl) return;

  modal.classList.remove('hidden');
  bodyEl.innerHTML = `
    <div class="py-12 text-center">
      <div class="inline-block animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-2"></div>
      <p class="text-xs text-slate-500">Loading dermatological science dossier...</p>
    </div>
  `;

  try {
    const res = await fetch(`/api/ingredients/education/${encodeURIComponent(identifier)}`);
    if (!res.ok) throw new Error('Educational dossier not found.');

    const data = await res.json();
    const isCategory = data.type === 'category';
    const d = data.details || {};
    const catInfo = data.category_info || {};

    if (iconEl) iconEl.textContent = d.icon || catInfo.icon || '🧬';
    if (titleEl) titleEl.textContent = d.name || d.canonical_name || identifier;
    if (taglineEl) taglineEl.textContent = d.tagline || catInfo.tagline || (d.functions ? d.functions.join(' • ') : 'Active Skincare Profile');

    let membersHtml = '';
    if (isCategory && d.key_ingredients) {
      membersHtml = `
        <div class="flex flex-col gap-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Recognized Active Ingredients & Forms</span>
          <div class="flex flex-wrap gap-2">
            ${d.key_ingredients.map(k => `
              <span class="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                ${escapeHtml(k)}
              </span>
            `).join('')}
          </div>
        </div>
      `;
    }

    let benefitsHtml = '';
    const benefitsList = d.primary_benefits || d.functions || catInfo.primary_benefits;
    if (benefitsList && benefitsList.length > 0) {
      benefitsHtml = `
        <div class="flex flex-col gap-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Primary Dermatological Benefits</span>
          <ul class="flex flex-col gap-1.5 text-xs md:text-sm text-slate-700 dark:text-slate-300">
            ${benefitsList.map(b => `
              <li class="flex items-start gap-2">
                <span class="text-indigo-500 font-bold">✓</span>
                <span>${escapeHtml(b)}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    let safetyGridHtml = `
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col">
          <span class="text-[10px] text-slate-400 font-bold uppercase">Best Time</span>
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5">${escapeHtml(d.best_time || d.time_of_day || catInfo.best_time || 'AM & PM')}</span>
        </div>
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col">
          <span class="text-[10px] text-slate-400 font-bold uppercase">Optimal pH</span>
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5">${escapeHtml(d.optimal_ph || d.ph_range || catInfo.optimal_ph || '5.5 - 6.5')}</span>
        </div>
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col">
          <span class="text-[10px] text-slate-400 font-bold uppercase">Skin Types</span>
          <span class="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5">${escapeHtml((d.skin_types || d.suitable_types || catInfo.skin_types || []).slice(0, 2).join(', ') || 'All Types')}</span>
        </div>
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col">
          <span class="text-[10px] text-slate-400 font-bold uppercase">Comedogenicity</span>
          <span class="text-xs font-bold text-emerald-600 mt-0.5">${d.comedogenic_rating !== undefined ? d.comedogenic_rating + '/5' : '0/5 (Safe)'}</span>
        </div>
      </div>
    `;

    let tipsHtml = '';
    const tipsContent = d.usage_tips || catInfo.usage_tips;
    if (tipsContent) {
      tipsHtml = `
        <div class="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 flex flex-col gap-1 text-xs">
          <span class="font-bold text-indigo-900 dark:text-indigo-200">💡 Dermatologist Application Tip</span>
          <p class="text-indigo-800 dark:text-indigo-300 leading-relaxed">${escapeHtml(tipsContent)}</p>
        </div>
      `;
    }

    let contraindicationsHtml = '';
    const doNotMix = d.do_not_mix_with || catInfo.do_not_mix_with;
    if (doNotMix && doNotMix.length > 0) {
      contraindicationsHtml = `
        <div class="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex flex-col gap-1 text-xs">
          <span class="font-bold text-rose-900 dark:text-rose-200">⚠️ Direct Contraindications & Conflicts</span>
          <p class="text-rose-800 dark:text-rose-300">Do NOT directly combine in the same routine step with: <strong>${escapeHtml(doNotMix.join(', '))}</strong>.</p>
        </div>
      `;
    }

    let synergiesHtml = '';
    const synergiesList = d.synergies || catInfo.synergies;
    if (synergiesList && synergiesList.length > 0) {
      synergiesHtml = `
        <div class="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 flex flex-col gap-1 text-xs">
          <span class="font-bold text-emerald-900 dark:text-emerald-200">✨ Synergistic Power Pairings</span>
          <p class="text-emerald-800 dark:text-emerald-300">Pairs exceptionally well with: <strong>${escapeHtml(synergiesList.join(', '))}</strong>.</p>
        </div>
      `;
    }

    bodyEl.innerHTML = `
      <p class="text-slate-600 dark:text-slate-300 leading-relaxed text-xs md:text-sm">
        ${escapeHtml(d.summary || catInfo.summary || (d.functions ? d.functions.join(', ') : ''))}
      </p>
      ${safetyGridHtml}
      ${membersHtml}
      ${benefitsHtml}
      ${tipsHtml}
      ${contraindicationsHtml}
      ${synergiesHtml}
    `;
  } catch (err) {
    bodyEl.innerHTML = `
      <div class="p-4 rounded-xl bg-rose-50 text-rose-700 text-xs">
        Failed to load ingredient dossier: ${escapeHtml(err.message)}
      </div>
    `;
  }
}

// Attach global functions to window
window.openIngredientEducationModal = openIngredientEducationModal;
window.runFormulaAnalysis = runFormulaAnalysis;
window.renderEducationCategories = renderEducationCategories;


// ─────────────────────────────────────────────────────────────
// Feature 6: Product Recommendation Engine JS Logic
// ─────────────────────────────────────────────────────────────

function initProductRecommendationEngine() {
  if (isRecEngineInitialized) {
    fetchProductCatalog();
    return;
  }
  isRecEngineInitialized = true;

  // 1. Category Tabs
  document.querySelectorAll('.prod-cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.prod-cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeProductCategory = tab.dataset.category || 'all';
      renderProductGrid();
    });
  });

  // 2. Budget Tier Buttons
  document.querySelectorAll('.budget-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.budget-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeProductBudget = btn.dataset.budget || 'all';
      renderProductGrid();
    });
  });

  // 3. Search Input
  const searchInput = document.getElementById('productSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      productSearchTerm = e.target.value.trim().toLowerCase();
      renderProductGrid();
    });
  }

  // 4. Concern Dropdown
  const concernSelect = document.getElementById('filterConcernSelect');
  if (concernSelect) {
    concernSelect.addEventListener('change', (e) => {
      activeProductConcern = e.target.value;
      renderProductGrid();
    });
  }

  // 5. Allergy Safe Checkbox
  const chkAllergy = document.getElementById('chkAllergySafeOnly');
  if (chkAllergy) {
    chkAllergy.addEventListener('change', (e) => {
      isAllergySafeOnly = e.target.checked;
      renderProductGrid();
    });
  }

  // 6. Sort By Dropdown
  const sortSelect = document.getElementById('sortProductsSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      productSortBy = e.target.value;
      renderProductGrid();
    });
  }

  // 7. Modals: Detail Modal Closures
  const btnCloseDetail = document.getElementById('btnCloseProductDetailModal');
  const detailBackdrop = document.getElementById('productDetailModalBackdrop');
  if (btnCloseDetail) btnCloseDetail.addEventListener('click', () => toggleProductDetailModal(false));
  if (detailBackdrop) detailBackdrop.addEventListener('click', () => toggleProductDetailModal(false));

  const btnAnalyzeINCI = document.getElementById('btnAnalyzeProductInINCI');
  if (btnAnalyzeINCI) {
    btnAnalyzeINCI.addEventListener('click', () => {
      if (currentDetailProdObj && currentDetailProdObj.full_inci) {
        toggleProductDetailModal(false);
        analyzeProductInINCIEngine(currentDetailProdObj.full_inci);
      }
    });
  }

  const btnAddDetailToRoutine = document.getElementById('btnAddDetailProductToRoutine');
  if (btnAddDetailToRoutine) {
    btnAddDetailToRoutine.addEventListener('click', () => {
      if (currentDetailProdObj) {
        addProductToRoutineDirect(currentDetailProdObj.id, currentDetailProdObj.time_of_day ? currentDetailProdObj.time_of_day.split(' ')[0] : 'morning');
        toggleProductDetailModal(false);
      }
    });
  }

  const btnToggleCompareDetail = document.getElementById('btnToggleCompareDetail');
  if (btnToggleCompareDetail) {
    btnToggleCompareDetail.addEventListener('click', () => {
      if (currentDetailProdObj) {
        toggleCompareItem(currentDetailProdObj);
        updateDetailCompareButtonText();
      }
    });
  }

  // 8. Modals: Comparison Modal
  const btnOpenCompare = document.getElementById('btnOpenCompareModal');
  const btnLaunchCompare = document.getElementById('btnLaunchCompareModal');
  const btnCloseCompare = document.getElementById('btnCloseCompareModal');
  const btnCloseCompareBtn = document.getElementById('btnCloseCompareModalBtn');
  const compareBackdrop = document.getElementById('productCompareModalBackdrop');
  const btnClearCompare = document.getElementById('btnClearCompareTray');
  const btnClearCompareModal = document.getElementById('btnClearCompareFromModal');

  if (btnOpenCompare) btnOpenCompare.addEventListener('click', () => openCompareModal());
  if (btnLaunchCompare) btnLaunchCompare.addEventListener('click', () => openCompareModal());
  if (btnCloseCompare) btnCloseCompare.addEventListener('click', () => toggleCompareModal(false));
  if (btnCloseCompareBtn) btnCloseCompareBtn.addEventListener('click', () => toggleCompareModal(false));
  if (compareBackdrop) compareBackdrop.addEventListener('click', () => toggleCompareModal(false));
  if (btnClearCompare) btnClearCompare.addEventListener('click', () => clearCompareTray());
  if (btnClearCompareModal) {
    btnClearCompareModal.addEventListener('click', () => {
      clearCompareTray();
      toggleCompareModal(false);
    });
  }

  // 9. Modals: Budget Routine Optimizer Modal
  const btnOpenBudget = document.getElementById('btnOpenBudgetRoutineModal');
  const btnCloseBudget = document.getElementById('btnCloseBudgetRoutineModal');
  const btnCancelBudget = document.getElementById('btnCancelBudgetRoutine');
  const budgetBackdrop = document.getElementById('budgetRoutineModalBackdrop');
  const budgetSlider = document.getElementById('budgetRangeSlider');
  const btnApplyBudget = document.getElementById('btnApplyBudgetRoutine');

  if (btnOpenBudget) btnOpenBudget.addEventListener('click', () => openBudgetRoutineModal());
  if (btnCloseBudget) btnCloseBudget.addEventListener('click', () => toggleBudgetRoutineModal(false));
  if (btnCancelBudget) btnCancelBudget.addEventListener('click', () => toggleBudgetRoutineModal(false));
  if (budgetBackdrop) budgetBackdrop.addEventListener('click', () => toggleBudgetRoutineModal(false));

  if (budgetSlider) {
    budgetSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      const displayEl = document.getElementById('budgetSliderDisplay');
      if (displayEl) displayEl.textContent = `₹${val.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      recalculateBudgetRoutine();
    });
  }

  document.querySelectorAll('input[name="budgetScope"]').forEach(radio => {
    radio.addEventListener('change', () => recalculateBudgetRoutine());
  });

  document.querySelectorAll('.budget-preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const presetVal = parseFloat(chip.dataset.preset || '5000');
      if (budgetSlider) {
        budgetSlider.value = presetVal;
        const displayEl = document.getElementById('budgetSliderDisplay');
        if (displayEl) displayEl.textContent = `₹${presetVal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        recalculateBudgetRoutine();
      }
    });
  });

  if (btnApplyBudget) {
    btnApplyBudget.addEventListener('click', () => applyBudgetRoutineSteps());
  }

  fetchProductCatalog();
}

async function fetchProductCatalog() {
  const token = localStorage.getItem('access_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const res = await fetch('/api/products/catalog', { headers });
    if (!res.ok) throw new Error('Failed to fetch product catalog');
    const data = await res.json();
    productCatalog = data.products || [];

    // Update profile summary chips in banner
    if (data.user_context) {
      const u = data.user_context;
      const elType = document.getElementById('recProfileSkinType');
      const elConcerns = document.getElementById('recProfileConcerns');
      const elScore = document.getElementById('recProfileHealthScore');
      const elSeason = document.getElementById('recProfileSeason');

      if (elType) elType.textContent = `${u.skin_type || 'Normal'} Skin`;
      if (elConcerns) elConcerns.textContent = u.concerns && u.concerns.length > 0 ? u.concerns.slice(0, 2).map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(' • ') : 'Balanced Care';
      if (elScore) elScore.textContent = `Score: ${u.health_score || 70}/100`;
      if (elSeason) elSeason.textContent = `${u.season === 'Summer' ? '☀️' : u.season === 'Winter' ? '❄️' : '🌿'} ${u.season || 'Summer'}`;
    }

    updateCategoryCounts();
    renderProductGrid();
  } catch (err) {
    console.error('Error fetching product catalog:', err);
    const grid = document.getElementById('productsGrid');
    if (grid) {
      grid.innerHTML = `
        <div class="col-span-full p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
          Failed to load product recommendations: ${escapeHtml(err.message)}
        </div>
      `;
    }
  }
}

function updateCategoryCounts() {
  const counts = {
    all: productCatalog.length,
    face_wash: 0,
    moisturizer: 0,
    sunscreen: 0,
    serum: 0,
    toner: 0,
    treatment_products: 0,
    face_masks: 0
  };

  productCatalog.forEach(p => {
    if (counts[p.category] !== undefined) counts[p.category]++;
  });

  const catMap = {
    all: 'catCountAll',
    face_wash: 'catCountFaceWash',
    moisturizer: 'catCountMoisturizer',
    sunscreen: 'catCountSunscreen',
    serum: 'catCountSerum',
    toner: 'catCountToner',
    treatment_products: 'catCountTreatment',
    face_masks: 'catCountMasks'
  };

  Object.entries(catMap).forEach(([k, id]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = counts[k] || 0;
  });
}

function renderProductGrid() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  let filtered = [...productCatalog];

  // 1. Category filter
  if (activeProductCategory !== 'all') {
    filtered = filtered.filter(p => p.category === activeProductCategory);
  }

  // 2. Budget tier filter
  if (activeProductBudget !== 'all') {
    filtered = filtered.filter(p => p.budget_tier === activeProductBudget);
  }

  // 3. Concern filter
  if (activeProductConcern !== 'all') {
    filtered = filtered.filter(p => {
      const concerns = (p.target_concerns || []).map(c => c.toLowerCase());
      return concerns.some(c => c.includes(activeProductConcern.toLowerCase()));
    });
  }

  // 4. Allergy-Safe filter
  if (isAllergySafeOnly) {
    filtered = filtered.filter(p => !p.has_allergy_clash);
  }

  // 5. Search query
  if (productSearchTerm) {
    filtered = filtered.filter(p => {
      const str = `${p.name} ${p.brand} ${(p.key_actives || []).join(' ')} ${(p.target_concerns || []).join(' ')} ${p.description || ''}`.toLowerCase();
      return str.includes(productSearchTerm);
    });
  }

  // 6. Sort
  if (productSortBy === 'suitability_desc') {
    filtered.sort((a, b) => b.suitability_score - a.suitability_score || b.rating - a.rating);
  } else if (productSortBy === 'price_asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (productSortBy === 'price_desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (productSortBy === 'rating_desc') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full p-12 text-center bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-2xl">
        <span class="text-3xl">🔍</span>
        <h4 class="font-bold text-slate-700 dark:text-slate-200 mt-2">No matching products found</h4>
        <p class="text-xs text-slate-500 mt-1">Try resetting your filters or search terms.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const isComparing = compareSelectedProducts.some(c => c.id === p.id);
    const badgeClass = `badge-${p.badge_color || 'indigo'}`;
    const categoryIconMap = {
      face_wash: '🧼',
      moisturizer: '🧴',
      sunscreen: '☀️',
      serum: '💧',
      toner: '🌿',
      treatment_products: '🎯',
      face_masks: '✨'
    };
    const catIcon = categoryIconMap[p.category] || '🧴';

    const activesHtml = (p.key_actives || []).slice(0, 3).map(act => `
      <span class="active-ing-chip">${escapeHtml(act)}</span>
    `).join('');

    return `
      <article class="product-card-rich" data-id="${p.id}">
        <div>
          <!-- Header Banner -->
          <div class="product-card-header" style="background: ${p.gradient_bg || 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)'};">
            <span class="product-cat-tag">
              <span>${catIcon}</span>
              <span>${escapeHtml(p.category_name || 'Skincare')}</span>
            </span>
            <span class="product-suitability-badge ${badgeClass}">
              <span>${p.has_allergy_clash ? '⚠️' : '🎯'}</span>
              <span>${p.suitability_score}% Match</span>
            </span>
          </div>

          <!-- Body -->
          <div class="product-card-body">
            <div>
              <span class="product-brand-line">${escapeHtml(p.brand)}</span>
              <h3 class="product-title-rich mt-0.5">${escapeHtml(p.name)}</h3>
            </div>
            
            <p class="product-tagline-text line-clamp-2">${escapeHtml(p.tagline || p.description)}</p>

            <!-- Key Actives -->
            <div class="product-active-tags">
              ${activesHtml}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="product-card-footer">
          <div class="product-price-block">
            <span class="product-price-num">${p.price.toFixed(2)}</span>
            <span class="product-volume-text">${escapeHtml(p.volume || '')} • ⭐ ${p.rating}</span>
          </div>
          
          <div class="product-actions-group">
            <button type="button" class="btn-card-action compare ${isComparing ? 'selected' : ''}" onclick="event.stopPropagation(); window.toggleCompareProduct('${p.id}')" title="Compare side-by-side">
              <span>${isComparing ? '✓ Comparing' : '⚖️ Compare'}</span>
            </button>
            <button type="button" class="btn-card-action view" onclick="window.openProductDetailModal('${p.id}')" title="View details & alternatives">
              <span>Details</span>
            </button>
            <button type="button" class="btn-card-action add-routine" onclick="event.stopPropagation(); window.quickAddProductToRoutine('${p.id}')" title="Add to routine">
              <span>➕</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// ── Detail Modal Handler ──
function toggleProductDetailModal(show) {
  const modal = document.getElementById('productDetailModal');
  if (modal) modal.classList.toggle('hidden', !show);
}

async function openProductDetailModal(productId) {
  const token = localStorage.getItem('access_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const [resProd, resAlts] = await Promise.all([
      fetch(`/api/products/${productId}`, { headers }),
      fetch(`/api/products/${productId}/alternatives`, { headers })
    ]);

    if (!resProd.ok) throw new Error('Product not found');
    const p = await resProd.json();
    const altsData = resAlts.ok ? await resAlts.json() : {};

    currentDetailProdObj = p;

    // Header updates
    const categoryIconMap = { face_wash: '🧼', moisturizer: '🧴', sunscreen: '☀️', serum: '💧', toner: '🌿', treatment_products: '🎯', face_masks: '✨' };
    const catIconEl = document.getElementById('pDetailCategoryIcon');
    const catNameEl = document.getElementById('pDetailCategoryName');
    const nameEl = document.getElementById('pDetailName');
    const brandEl = document.getElementById('pDetailBrand');

    if (catIconEl) catIconEl.textContent = categoryIconMap[p.category] || '🧴';
    if (catNameEl) catNameEl.textContent = p.category_name || 'Skincare';
    if (nameEl) nameEl.textContent = p.name;
    if (brandEl) brandEl.textContent = `${p.brand} • ${p.price.toFixed(2)} (${p.volume || ''}) • ⭐ ${p.rating} (${(p.review_count || 0).toLocaleString()} reviews)`;

    updateDetailCompareButtonText();

    // Body content
    const bodyEl = document.getElementById('pDetailModalBody');
    if (bodyEl) {
      const badgeClass = `badge-${p.badge_color || 'indigo'}`;
      
      // Match reasons list
      const reasonsHtml = (p.match_reasons || []).map(r => `
        <li class="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
          <span class="text-emerald-500 font-bold">✓</span>
          <span>${escapeHtml(r)}</span>
        </li>
      `).join('');

      // Caution alerts
      let cautionHtml = '';
      if (p.caution_alerts && p.caution_alerts.length > 0) {
        cautionHtml = `
          <div class="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex flex-col gap-1 text-xs">
            <span class="font-bold text-amber-900 dark:text-amber-200">⚠️ Dermatological Caution Alerts:</span>
            ${p.caution_alerts.map(c => `<p class="text-amber-800 dark:text-amber-300">• ${escapeHtml(c)}</p>`).join('')}
          </div>
        `;
      }

      // Benefits list
      const benefitsHtml = (p.benefits || []).map(b => `
        <li class="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
          <span class="text-indigo-500">✦</span>
          <span>${escapeHtml(b)}</span>
        </li>
      `).join('');

      // Smart Alternatives Section
      let altsHtml = '';
      const dupes = altsData.budget_dupes || [];
      const sens = altsData.sensitive_alternatives || [];
      const upg = altsData.premium_upgrades || [];

      if (dupes.length > 0 || sens.length > 0 || upg.length > 0) {
        altsHtml = `
          <div class="border-t border-slate-200 dark:border-slate-800 pt-5 flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm">💡 Smart Alternative Suggestions</h4>
              <span class="text-[11px] text-slate-400">Click any card to inspect or swap</span>
            </div>
            
            <div class="alternatives-grid">
              ${dupes.slice(0, 1).map(d => `
                <div class="alt-card cursor-pointer" onclick="window.openProductDetailModal('${d.id}')">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">💰 Budget Dupe</span>
                    <span class="text-xs font-bold text-emerald-600">${d.price.toFixed(2)}</span>
                  </div>
                  <div>
                    <h5 class="font-bold text-xs text-slate-800 dark:text-slate-100">${escapeHtml(d.name)}</h5>
                    <span class="text-[11px] text-slate-500">${escapeHtml(d.brand)} • ${d.suitability_score}% Match</span>
                  </div>
                </div>
              `).join('')}

              ${sens.slice(0, 1).map(s => `
                <div class="alt-card cursor-pointer" onclick="window.openProductDetailModal('${s.id}')">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">🛡️ Milder / Sensitive</span>
                    <span class="text-xs font-bold text-slate-700 dark:text-slate-200">${s.price.toFixed(2)}</span>
                  </div>
                  <div>
                    <h5 class="font-bold text-xs text-slate-800 dark:text-slate-100">${escapeHtml(s.name)}</h5>
                    <span class="text-[11px] text-slate-500">${escapeHtml(s.brand)} • ${s.suitability_score}% Match</span>
                  </div>
                </div>
              `).join('')}

              ${upg.slice(0, 1).map(u => `
                <div class="alt-card cursor-pointer" onclick="window.openProductDetailModal('${u.id}')">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">⚡ Clinical Upgrade</span>
                    <span class="text-xs font-bold text-indigo-600">${u.price.toFixed(2)}</span>
                  </div>
                  <div>
                    <h5 class="font-bold text-xs text-slate-800 dark:text-slate-100">${escapeHtml(u.name)}</h5>
                    <span class="text-[11px] text-slate-500">${escapeHtml(u.brand)} • ${u.suitability_score}% Match</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      bodyEl.innerHTML = `
        <!-- Suitability Score Card -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="product-suitability-badge ${badgeClass} text-sm py-1 px-3">
                ${p.has_allergy_clash ? '⚠️ Allergen Alert' : `🌟 ${p.suitability_score}% ${p.rating_tier || 'Match'}`}
              </span>
              <span class="text-xs text-slate-500 font-medium">${p.texture || ''} • ${p.finish || ''}</span>
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-300 mt-2">${escapeHtml(p.tagline || p.description)}</p>
          </div>
          <div class="text-right shrink-0">
            <span class="text-xs text-slate-400 font-semibold uppercase">Ideal Timing</span>
            <p class="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">☀️ ${escapeHtml(p.time_of_day || 'Anytime')}</p>
          </div>
        </div>

        ${cautionHtml}

        <!-- Why It Works For Your Skin -->
        <div class="flex flex-col gap-2">
          <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm">🎯 Why It Matches Your Skin Profile</h4>
          <ul class="flex flex-col gap-1.5 p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
            ${reasonsHtml || '<li class="text-xs text-slate-500">Universal compatibility.</li>'}
          </ul>
        </div>

        <!-- Clinical Benefits -->
        <div class="flex flex-col gap-2">
          <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm">✨ Key Dermatological Benefits</h4>
          <ul class="flex flex-col gap-1.5">
            ${benefitsHtml}
          </ul>
        </div>

        <!-- How to Use -->
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col gap-1 text-xs">
          <span class="font-bold text-slate-700 dark:text-slate-200">📖 Usage Instructions:</span>
          <p class="text-slate-600 dark:text-slate-300 leading-relaxed">${escapeHtml(p.usage_instructions || 'Apply as directed in routine.')}</p>
        </div>

        <!-- Full INCI Formula -->
        <div class="flex flex-col gap-1.5">
          <span class="font-bold text-slate-700 dark:text-slate-200 text-xs">🧪 Full INCI Ingredient Formulation:</span>
          <div class="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 font-mono leading-relaxed max-h-24 overflow-y-auto">
            ${escapeHtml(p.full_inci || 'INCI list not available.')}
          </div>
        </div>

        ${altsHtml}
      `;
    }

    toggleProductDetailModal(true);
  } catch (err) {
    alert(`Could not load product details: ${err.message}`);
  }
}

function updateDetailCompareButtonText() {
  const btn = document.getElementById('btnToggleCompareDetail');
  if (!btn || !currentDetailProdObj) return;
  const isComparing = compareSelectedProducts.some(c => c.id === currentDetailProdObj.id);
  btn.innerHTML = `<span>⚖️</span> ${isComparing ? 'Remove from Compare' : 'Compare'}`;
}

// ── Compare Tray & Actions ──
function toggleCompareProduct(productId) {
  const prod = productCatalog.find(p => p.id === productId);
  if (!prod) return;
  toggleCompareItem(prod);
}

function toggleCompareItem(prod) {
  const idx = compareSelectedProducts.findIndex(p => p.id === prod.id);
  if (idx >= 0) {
    compareSelectedProducts.splice(idx, 1);
  } else {
    if (compareSelectedProducts.length >= 3) {
      alert('You can compare a maximum of 3 products at a time. Please remove one first.');
      return;
    }
    compareSelectedProducts.push(prod);
  }

  updateCompareTrayUI();
  renderProductGrid();
}

function updateCompareTrayUI() {
  const count = compareSelectedProducts.length;
  const trayCount = document.getElementById('compareTrayCount');
  const traySelectedCount = document.getElementById('traySelectedCount');
  const floatingTray = document.getElementById('floatingCompareTray');
  const thumbsContainer = document.getElementById('trayProductThumbnails');

  if (trayCount) trayCount.textContent = count;
  if (traySelectedCount) traySelectedCount.textContent = count;

  if (floatingTray) {
    floatingTray.classList.toggle('hidden', count === 0);
  }

  if (thumbsContainer) {
    thumbsContainer.innerHTML = compareSelectedProducts.map(p => `
      <span class="tray-thumb">
        <span>${escapeHtml(p.name.length > 18 ? p.name.substring(0, 16) + '...' : p.name)}</span>
        <span class="tray-thumb-remove" onclick="window.toggleCompareProduct('${p.id}')">&times;</span>
      </span>
    `).join('');
  }
}

function clearCompareTray() {
  compareSelectedProducts = [];
  updateCompareTrayUI();
  renderProductGrid();
}

function toggleCompareModal(show) {
  const modal = document.getElementById('productCompareModal');
  if (modal) modal.classList.toggle('hidden', !show);
}

async function openCompareModal() {
  if (compareSelectedProducts.length < 2) {
    alert('Please select at least 2 products to compare side-by-side (click "⚖️ Compare" on product cards).');
    return;
  }

  const token = localStorage.getItem('access_token');
  const headers = token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };

  try {
    const bodyEl = document.getElementById('compareModalBody');
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div class="p-12 text-center">
          <div class="inline-block animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-3"></div>
          <p class="text-sm font-semibold text-slate-600">Running comparative formulation analysis & generating AI verdict...</p>
        </div>
      `;
    }

    toggleCompareModal(true);

    const res = await fetch('/api/products/compare', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        product_ids: compareSelectedProducts.map(p => p.id)
      })
    });

    if (!res.ok) throw new Error('Failed to run comparison');
    const compData = await res.json();

    if (bodyEl) {
      const items = compData.products || [];
      const winner = compData.winner || items[0];
      const verdict = compData.ai_verdict || {};

      // AI Verdict Banner
      const verdictHtml = `
        <div class="ai-verdict-card">
          <div class="flex items-center gap-2">
            <span class="text-xl">🏆</span>
            <h4 class="font-bold text-emerald-950 dark:text-emerald-100 text-sm md:text-base">${escapeHtml(verdict.title || 'AI Dermatological Verdict')}</h4>
          </div>
          <div class="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed flex flex-col gap-1 mt-1">
            ${(verdict.paragraphs || [verdict.summary || '']).map(p => `<p>${p}</p>`).join('')}
          </div>
        </div>
      `;

      // Build Comparison Table HTML
      const tableHeaders = items.map(p => `
        <th class="${p.id === winner.id ? 'bg-indigo-50/80 dark:bg-indigo-950/40 font-black' : ''}">
          <div class="flex flex-col gap-1">
            ${p.id === winner.id ? '<span class="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">👑 Best Match</span>' : ''}
            <span class="text-xs font-bold text-slate-800 dark:text-slate-100">${escapeHtml(p.name)}</span>
            <span class="text-[11px] text-slate-500 font-normal">${escapeHtml(p.brand)}</span>
          </div>
        </th>
      `).join('');

      const suitRows = items.map(p => `
        <td class="${p.id === winner.id ? 'bg-indigo-50/40 dark:bg-indigo-950/20 font-bold' : ''}">
          <span class="product-suitability-badge badge-${p.badge_color || 'indigo'} text-xs">
            ${p.suitability_score}% Match
          </span>
        </td>
      `).join('');

      const priceRows = items.map(p => `
        <td class="${p.id === winner.id ? 'bg-indigo-50/40 dark:bg-indigo-950/20 font-bold' : ''}">
          <span class="text-sm font-bold text-slate-900 dark:text-slate-100">${p.price.toFixed(2)}</span>
          <span class="text-[11px] text-slate-400 block">${escapeHtml(p.volume || '')}</span>
        </td>
      `).join('');

      const catRows = items.map(p => `
        <td class="${p.id === winner.id ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''}">
          ${escapeHtml(p.category_name || '')}
        </td>
      `).join('');

      const activesRows = items.map(p => `
        <td class="${p.id === winner.id ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''}">
          <div class="flex flex-wrap gap-1">
            ${(p.key_actives || []).map(a => `<span class="active-ing-chip">${escapeHtml(a)}</span>`).join('')}
          </div>
        </td>
      `).join('');

      const concernsRows = items.map(p => `
        <td class="${p.id === winner.id ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''}">
          <div class="flex flex-wrap gap-1">
            ${(p.target_concerns || []).map(c => `<span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">${escapeHtml(c)}</span>`).join('')}
          </div>
        </td>
      `).join('');

      const textureRows = items.map(p => `
        <td class="${p.id === winner.id ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''}">
          <span class="text-xs text-slate-700 dark:text-slate-300">${escapeHtml(p.texture || 'Standard')} (${escapeHtml(p.finish || '')})</span>
        </td>
      `).join('');

      const actionsRows = items.map(p => `
        <td class="${p.id === winner.id ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''}">
          <button type="button" class="btn-routine-action primary text-xs py-1.5 px-3 w-full justify-center" onclick="window.quickAddProductToRoutine('${p.id}')">
            <span>➕ Add to Routine</span>
          </button>
        </td>
      `).join('');

      bodyEl.innerHTML = `
        ${verdictHtml}

        <div class="comparison-table-wrapper">
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Product Formula</th>
                ${tableHeaders}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Suitability Score</th>
                ${suitRows}
              </tr>
              <tr>
                <th>Price & Volume</th>
                ${priceRows}
              </tr>
              <tr>
                <th>Category</th>
                ${catRows}
              </tr>
              <tr>
                <th>Core Active Ingredients</th>
                ${activesRows}
              </tr>
              <tr>
                <th>Target Skin Concerns</th>
                ${concernsRows}
              </tr>
              <tr>
                <th>Texture & Finish</th>
                ${textureRows}
              </tr>
              <tr>
                <th>Action</th>
                ${actionsRows}
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }
  } catch (err) {
    const bodyEl = document.getElementById('compareModalBody');
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div class="p-8 rounded-xl bg-rose-50 text-rose-700 text-sm">
          Comparison error: ${escapeHtml(err.message)}
        </div>
      `;
    }
  }
}

// ── Budget Routine Optimizer ──
function toggleBudgetRoutineModal(show) {
  const modal = document.getElementById('budgetRoutineModal');
  if (modal) modal.classList.toggle('hidden', !show);
}

function openBudgetRoutineModal() {
  toggleBudgetRoutineModal(true);
  recalculateBudgetRoutine();
}

async function recalculateBudgetRoutine() {
  const slider = document.getElementById('budgetRangeSlider');
  const scopeRadio = document.querySelector('input[name="budgetScope"]:checked');
  const maxBudget = slider ? parseFloat(slider.value) : 5000.0;
  const scope = scopeRadio ? scopeRadio.value : 'essential';

  const token = localStorage.getItem('access_token');
  const headers = token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };

  try {
    const res = await fetch('/api/products/budget-routine', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        max_budget: maxBudget,
        routine_scope: scope
      })
    });

    if (!res.ok) throw new Error('Budget optimization failed');
    const data = await res.json();
    currentBudgetRoutineData = data;

    // Update KPI Displays
    const totalCostEl = document.getElementById('bTotalCostDisplay');
    const savingsEl = document.getElementById('bSavingsDisplay');
    const avgScoreEl = document.getElementById('bAvgScoreDisplay');
    const stepsCountEl = document.getElementById('bStepsCountDisplay');

    if (totalCostEl) totalCostEl.textContent = `₹${data.total_cost.toFixed(2)}`;
    if (savingsEl) savingsEl.textContent = `₹${data.savings.toFixed(2)}`;
    if (avgScoreEl) avgScoreEl.textContent = `${data.average_suitability}%`;
    if (stepsCountEl) stepsCountEl.textContent = `${data.steps_count} Steps`;

    // Render items
    const itemsContainer = document.getElementById('budgetRoutineItemsContainer');
    if (itemsContainer) {
      const categoryIconMap = { face_wash: '🧼', moisturizer: '🧴', sunscreen: '☀️', serum: '💧', toner: '🌿', treatment_products: '🎯', face_masks: '✨' };

      itemsContainer.innerHTML = (data.routine_products || []).map((p, idx) => `
        <div class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-xs">
          <div class="flex items-center gap-2.5">
            <span class="text-lg p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">${categoryIconMap[p.category] || '🧴'}</span>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Step ${idx + 1} • ${escapeHtml(p.category_name)}</span>
                <span class="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">${p.suitability_score}% Match</span>
              </div>
              <h5 class="text-xs font-bold text-slate-800 dark:text-slate-100">${escapeHtml(p.name)}</h5>
              <span class="text-[11px] text-slate-400">${escapeHtml(p.brand)}</span>
            </div>
          </div>
          <div class="text-right shrink-0">
            <span class="text-xs font-bold text-slate-900 dark:text-slate-100">${p.price.toFixed(2)}</span>
            <span class="text-[10px] text-slate-400 block">${escapeHtml(p.volume || '')}</span>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Error calculating budget routine:', err);
  }
}

async function applyBudgetRoutineSteps() {
  if (!currentBudgetRoutineData || !currentBudgetRoutineData.routine_products) return;
  const token = localStorage.getItem('access_token');
  if (!token) {
    alert('Please log in to apply this routine.');
    return;
  }

  const products = currentBudgetRoutineData.routine_products;
  let successCount = 0;

  for (const p of products) {
    try {
      const timeOfDay = (p.category === 'sunscreen' || p.category === 'face_wash') ? 'morning' : (p.category === 'face_masks' ? 'weekly' : 'morning');
      const res = await fetch('/api/products/add-to-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: p.id, time_of_day: timeOfDay })
      });
      if (res.ok) successCount++;
    } catch (e) {
      console.error(e);
    }
  }

  toggleBudgetRoutineModal(false);
  alert(`✨ Success! All ${successCount} products from your optimized budget routine have been added to your care plan.`);
  fetchUserRoutine();
}

async function quickAddProductToRoutine(productId) {
  const token = localStorage.getItem('access_token');
  if (!token) {
    alert('Please log in to add products to your routine.');
    return;
  }

  const prod = productCatalog.find(p => p.id === productId);
  if (!prod) return;

  const timeOfDay = prod.category === 'sunscreen' ? 'morning' : (prod.category === 'face_masks' ? 'weekly' : 'morning');

  try {
    const res = await fetch('/api/products/add-to-routine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ product_id: productId, time_of_day: timeOfDay })
    });
    if (!res.ok) throw new Error('Could not add to routine');
    const data = await res.json();
    alert(`🎉 ${data.message}`);
    fetchUserRoutine();
  } catch (err) {
    alert(`Failed to add product to routine: ${err.message}`);
  }
}

function addProductToRoutineDirect(productId, timeOfDay) {
  quickAddProductToRoutine(productId);
}

function analyzeProductInINCIEngine(inciText) {
  showSection('ingredients');
  const textarea = document.getElementById('ingredientInputText');
  if (textarea) {
    textarea.value = inciText;
  }
  // Switch to formula tab
  const formulaTabBtn = document.querySelector('.ingredient-tab-btn[data-tab="formula"]');
  if (formulaTabBtn) formulaTabBtn.click();
  runFormulaAnalysis();
}

// Global window helpers for inline onclick and cross-component triggers
window.openProductDetailModal = openProductDetailModal;
window.toggleCompareProduct = toggleCompareProduct;
window.quickAddProductToRoutine = quickAddProductToRoutine;
window.addProductToRoutineDirect = addProductToRoutineDirect;
window.analyzeProductInINCIEngine = analyzeProductInINCIEngine;
window.openIngredientEducationModal = openIngredientEducationModal;
window.renderEducationCategories = renderEducationCategories;
window.openEditStepModal = openEditStepModal;
window.deleteRoutineStep = deleteRoutineStep;
window.regenerateRoutine = regenerateRoutine;
window.toggleCheckin = toggleCheckin;
window.toggleProductDetailModal = toggleProductDetailModal;
window.toggleCompareModal = toggleCompareModal;
window.toggleBudgetRoutineModal = toggleBudgetRoutineModal;
window.openCompareModal = openCompareModal;
window.openBudgetRoutineModal = openBudgetRoutineModal;
window.clearCompareTray = clearCompareTray;
window.recalculateBudgetRoutine = recalculateBudgetRoutine;
window.applyBudgetRoutineSteps = applyBudgetRoutineSteps;
window.runFormulaAnalysis = runFormulaAnalysis;
window.runMatrixEvaluation = runMatrixEvaluation;
window.showSection = showSection;
window.saveSkinProfile = saveSkinProfile;




