// --- Skin Profile Management ---
const profileForm = document.getElementById('profileForm');
const profileStatus = document.getElementById('profileStatus');
const resetProfileBtn = document.getElementById('resetProfileBtn');

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
      const greetingEl = document.getElementById('welcomeGreeting');
      if (greetingEl) {
        greetingEl.textContent = `Welcome, ${displayName || 'User'}`;
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
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_role');
      window.location.href = '../index.html';
    });
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

if (logoutButton) {
  logoutButton.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    window.location.href = '../index.html';
  });
}

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
    ...currentRoutineData.morning_steps,
    ...currentRoutineData.evening_steps,
    ...currentRoutineData.weekly_steps,
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
document.addEventListener('DOMContentLoaded', () => {
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
  if (btnRegen) btnRegen.addEventListener('click', () => regenerateRoutine());

  // Add Step Button
  const btnAddStep = document.getElementById('btnAddRoutineStep');
  if (btnAddStep) {
    btnAddStep.addEventListener('click', () => {
      document.getElementById('stepModalTitle').textContent = 'Add Custom Routine Step';
      document.getElementById('stepModalId').value = '';
      document.getElementById('stepForm').reset();
      document.getElementById('stepModal').classList.remove('hidden');
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

      const stepId = document.getElementById('stepModalId').value;
      const payload = {
        time_of_day: document.getElementById('stepFormTimeOfDay').value,
        category: document.getElementById('stepFormCategory').value,
        step_title: document.getElementById('stepFormTitle').value,
        description: document.getElementById('stepFormDescription').value,
        active_ingredients: document.getElementById('stepFormIngredients').value,
        frequency: document.getElementById('stepFormFrequency').value,
        caution_notes: document.getElementById('stepFormCaution').value,
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
  if (btnM) btnM.addEventListener('click', () => toggleCheckin('morning'));
  if (btnE) btnE.addEventListener('click', () => toggleCheckin('evening'));
});
