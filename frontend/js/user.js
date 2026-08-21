/* ==================== GLOWSENSE AI — USER DASHBOARD LOGIC ==================== */

import { dataAPI, authAPI, geminiAPI } from './api.js';
import { initDashboard, showToast, showLoading, hideLoading, formatDate, riskBadge, renderLineChart } from './common.js';

/* ---- Dashboard ---- */
export async function initUserDashboard() {
  const auth = await initDashboard('user', 'dashboard');
  if (!auth) return;

  await loadDashboardData(auth.user.id);
}

async function loadDashboardData(userId) {
  try {
    const assessments = await dataAPI.getAssessments(userId);
    const latest = assessments[0];

    // Stat cards
    const scoreEl = document.getElementById('statScore');
    const typeEl = document.getElementById('statType');
    const concernsEl = document.getElementById('statConcerns');
    const riskEl = document.getElementById('statRisk');

    if (latest) {
      if (scoreEl) scoreEl.textContent = latest.skin_health_score != null ? `${latest.skin_health_score}/100` : 'N/A';
      if (typeEl) typeEl.textContent = latest.skin_type || 'N/A';
      if (riskEl) riskEl.innerHTML = riskBadge(latest.risk_level);

      const concerns = await dataAPI.getConcerns(latest.id);
      if (concernsEl) concernsEl.textContent = concerns.length;

      // Latest assessment card
      const latestDate = document.getElementById('latestDate');
      const latestMethod = document.getElementById('latestMethod');
      const latestScore = document.getElementById('latestScore');
      const latestType = document.getElementById('latestType');
      const latestRisk = document.getElementById('latestRisk');
      const viewBtn = document.getElementById('viewLatestBtn');

      if (latestDate) latestDate.textContent = formatDate(latest.assessment_date);
      if (latestMethod) latestMethod.textContent = latest.method === 'webcam' ? 'Webcam/Image' : 'Form Questionnaire';
      if (latestScore) latestScore.textContent = latest.skin_health_score != null ? `${latest.skin_health_score}/100` : 'N/A';
      if (latestType) latestType.textContent = latest.skin_type || 'N/A';
      if (latestRisk) latestRisk.innerHTML = riskBadge(latest.risk_level);
      if (viewBtn) viewBtn.href = `/user/history.html?id=${latest.id}`;

      // Main concerns
      await renderMainConcerns(concerns);

      // Recommendations preview
      const recs = await dataAPI.getRecommendations(latest.id);
      renderRecsPreview(recs);

      // Trend chart
      renderTrendChart(assessments);
    } else {
      if (scoreEl) scoreEl.textContent = 'N/A';
      if (typeEl) typeEl.textContent = 'N/A';
      if (concernsEl) concernsEl.textContent = '0';
      if (riskEl) riskEl.innerHTML = riskBadge(null);

      const latestCard = document.getElementById('latestAssessmentCard');
      if (latestCard) latestCard.style.display = 'none';

      const emptyTrend = document.getElementById('emptyTrend');
      if (emptyTrend) emptyTrend.style.display = 'flex';
    }
  } catch (err) {
    showToast('Unable to load dashboard data.', 'error');
  }
}

async function renderMainConcerns(concerns) {
  const container = document.getElementById('mainConcerns');
  if (!container) return;
  if (!concerns || concerns.length === 0) {
    container.innerHTML = '<p style="color:var(--color-text-tertiary);font-size:var(--fs-sm);">No concerns detected yet.</p>';
    return;
  }
  container.innerHTML = concerns.map(c => `
    <div class="concern-card">
      <div class="concern-card-header">
        <span class="concern-card-name">${c.concern_name}</span>
        <span class="badge ${severityBadgeClass(c.severity)}">${c.severity}</span>
      </div>
      <div class="concern-card-body">${c.explanation || ''}</div>
      <div class="concern-severity-bar"><div class="concern-severity-fill ${severityFillClass(c.severity)}" style="width:${severityWidth(c.severity)}%"></div></div>
    </div>
  `).join('');
}

function severityBadgeClass(s) {
  return { 'Low': 'badge-success', 'Moderate': 'badge-warning', 'High': 'badge-error', 'Severe': 'badge-error' }[s] || 'badge-neutral';
}
function severityFillClass(s) {
  return { 'Low': 'severity-low', 'Moderate': 'severity-moderate', 'High': 'severity-high', 'Severe': 'severity-severe' }[s] || 'severity-low';
}
function severityWidth(s) {
  return { 'Low': 25, 'Moderate': 50, 'High': 75, 'Severe': 100 }[s] || 25;
}

function renderRecsPreview(recs) {
  const container = document.getElementById('recsPreview');
  if (!container) return;
  if (!recs || recs.length === 0) {
    container.innerHTML = '<p style="color:var(--color-text-tertiary);font-size:var(--fs-sm);">No recommendations available yet.</p>';
    return;
  }
  const top3 = recs.slice(0, 3);
  container.innerHTML = top3.map(r => `
    <div style="display:flex;gap:0.5rem;align-items:flex-start;padding:0.5rem 0;border-bottom:1px solid var(--color-border-light);">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style="color:var(--color-accent-dark);flex-shrink:0;margin-top:2px;"><path d="M9 2l1.5 4L15 7.5 10.5 9 9 13l-1.5-4L3 7.5 7.5 6 9 2z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>
      <div>
        <div style="font-size:var(--fs-xs);font-weight:600;color:var(--color-text-tertiary);text-transform:uppercase;">${r.category}</div>
        <div style="font-size:var(--fs-sm);color:var(--color-text-secondary);">${r.recommendation_text}</div>
      </div>
    </div>
  `).join('');
}

function renderTrendChart(assessments) {
  const container = document.getElementById('trendChart');
  if (!container) return;
  if (!assessments || assessments.length === 0) {
    const empty = document.getElementById('emptyTrend');
    if (empty) empty.style.display = 'flex';
    return;
  }
  const dataPoints = assessments.reverse().map(a => ({
    label: formatDate(a.assessment_date).split(',')[0],
    score: a.skin_health_score || 0,
  }));
  renderLineChart(container, dataPoints);
}

/* ---- Profile ---- */
export async function initUserProfile() {
  const auth = await initDashboard('user', 'profile');
  if (!auth) return;
  await loadProfile(auth.user.id, auth.profile);
}

async function loadProfile(userId, authProfile) {
  const nameEl = document.getElementById('profileName');
  const emailEl = document.getElementById('profileEmail');
  if (nameEl) nameEl.textContent = authProfile.name || 'N/A';
  if (emailEl) emailEl.textContent = authProfile.email || 'N/A';

  const avatarEl = document.getElementById('profileAvatar');
  if (avatarEl && authProfile.name) {
    avatarEl.textContent = authProfile.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  try {
    const profile = await dataAPI.getUserProfile(userId);
    if (profile) {
      setFieldValue('fieldAge', profile.age);
      setFieldValue('fieldGender', profile.gender);
      setFieldValue('fieldSkinType', profile.skin_type);
      setFieldValue('fieldSensitivity', profile.skin_sensitivity);
      setFieldValue('fieldWaterIntake', profile.water_intake);
      setFieldValue('fieldSleep', profile.sleep_duration);
      setFieldValue('fieldStress', profile.stress_level);
      setFieldValue('fieldExercise', profile.exercise_frequency);
      setFieldValue('fieldSmoking', profile.smoking);
      setFieldValue('fieldAlcohol', profile.alcohol);
      setFieldValue('fieldCleanser', profile.cleanser_usage);
      setFieldValue('fieldMoisturizer', profile.moisturizer_usage);
      setFieldValue('fieldSunscreen', profile.sunscreen_usage);
      setFieldValue('fieldRoutine', profile.skincare_routine);
      setFieldValue('fieldSunExposure', profile.sun_exposure);
      setFieldValue('fieldPollution', profile.pollution_exposure);
      setFieldValue('fieldClimate', profile.climate);
      setFieldValue('fieldAllergies', profile.allergies);
      setFieldValue('fieldGoals', profile.skincare_goals);
      setFieldValue('fieldCurrentProducts', profile.current_products);
      setFieldValue('fieldPrevIssues', profile.previous_ingredient_issues);
    }
  } catch (err) {
    showToast('Unable to load profile data.', 'error');
  }
}

function setFieldValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value || '';
}

export async function saveProfile(userId) {
  const data = {
    age: parseInt(getFieldValue('fieldAge')) || null,
    gender: getFieldValue('fieldGender'),
    skin_type: getFieldValue('fieldSkinType'),
    skin_sensitivity: getFieldValue('fieldSensitivity'),
    water_intake: getFieldValue('fieldWaterIntake'),
    sleep_duration: getFieldValue('fieldSleep'),
    stress_level: getFieldValue('fieldStress'),
    exercise_frequency: getFieldValue('fieldExercise'),
    smoking: getFieldValue('fieldSmoking'),
    alcohol: getFieldValue('fieldAlcohol'),
    cleanser_usage: getFieldValue('fieldCleanser'),
    moisturizer_usage: getFieldValue('fieldMoisturizer'),
    sunscreen_usage: getFieldValue('fieldSunscreen'),
    skincare_routine: getFieldValue('fieldRoutine'),
    sun_exposure: getFieldValue('fieldSunExposure'),
    pollution_exposure: getFieldValue('fieldPollution'),
    climate: getFieldValue('fieldClimate'),
    allergies: getFieldValue('fieldAllergies'),
    skincare_goals: getFieldValue('fieldGoals'),
    current_products: getFieldValue('fieldCurrentProducts'),
    previous_ingredient_issues: getFieldValue('fieldPrevIssues'),
  };

  showLoading('Saving profile...');
  try {
    await dataAPI.upsertUserProfile(userId, data);
    hideLoading();
    showToast('Profile saved successfully!', 'success');
  } catch (err) {
    hideLoading();
    showToast('Unable to save profile. Please try again.', 'error');
  }
}

function getFieldValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

/* ---- History ---- */
export async function initUserHistory() {
  const auth = await initDashboard('user', 'history');
  if (!auth) return;
  await loadHistory(auth.user.id);
}

async function loadHistory(userId) {
  try {
    const assessments = await dataAPI.getAssessments(userId);
    const tbody = document.getElementById('historyTableBody');
    const emptyState = document.getElementById('emptyHistory');

    if (!assessments || assessments.length === 0) {
      if (tbody) tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (tbody) {
      tbody.innerHTML = assessments.map(a => `
        <tr>
          <td>${a.id.substring(0, 8)}...</td>
          <td>${formatDate(a.assessment_date)}</td>
          <td>${a.method === 'webcam' ? 'Webcam/Image' : 'Form'}</td>
          <td>${a.skin_health_score != null ? a.skin_health_score + '/100' : 'N/A'}</td>
          <td>${a.skin_type || 'N/A'}</td>
          <td>${riskBadge(a.risk_level)}</td>
          <td><a href="/user/history.html?id=${a.id}" class="btn btn-sm btn-outline">View Details</a></td>
        </tr>
      `).join('');
    }

    // If there's a specific assessment to show
    const params = new URLSearchParams(window.location.search);
    const assessId = params.get('id');
    if (assessId) {
      await showAssessmentDetail(assessId);
    }
  } catch (err) {
    showToast('Unable to load assessment history.', 'error');
  }
}

async function showAssessmentDetail(assessmentId) {
  try {
    const assessment = await dataAPI.getAssessmentById(assessmentId);
    if (!assessment) return;

    const concerns = await dataAPI.getConcerns(assessmentId);
    const risks = await dataAPI.getRisks(assessmentId);
    const recs = await dataAPI.getRecommendations(assessmentId);

    const modal = document.getElementById('detailModal');
    const body = document.getElementById('detailModalBody');
    if (!modal || !body) return;

    body.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">
        <div><strong>Date:</strong> ${formatDate(assessment.assessment_date)}</div>
        <div><strong>Method:</strong> ${assessment.method === 'webcam' ? 'Webcam/Image' : 'Form'}</div>
        <div><strong>Score:</strong> ${assessment.skin_health_score || 'N/A'}/100</div>
        <div><strong>Skin Type:</strong> ${assessment.skin_type || 'N/A'}</div>
        <div><strong>Risk Level:</strong> ${riskBadge(assessment.risk_level)}</div>
      </div>
      <h4 style="margin-bottom:0.5rem;">Concerns</h4>
      ${concerns.length ? concerns.map(c => `<div style="padding:0.5rem;border:1px solid var(--color-border);border-radius:8px;margin-bottom:0.5rem;"><strong>${c.concern_name}</strong> — ${c.severity}<br><span style="font-size:0.875rem;color:var(--color-text-secondary);">${c.explanation || ''}</span></div>`).join('') : '<p style="color:var(--color-text-tertiary);">No concerns recorded.</p>'}
      <h4 style="margin-bottom:0.5rem;margin-top:1rem;">Risk Factors</h4>
      ${risks.length ? risks.map(r => `<div style="padding:0.5rem;border:1px solid var(--color-border);border-radius:8px;margin-bottom:0.5rem;"><strong>${r.risk_name}</strong> — ${r.severity}<br><span style="font-size:0.875rem;color:var(--color-text-secondary);">${r.explanation || ''}</span></div>`).join('') : '<p style="color:var(--color-text-tertiary);">No risk factors recorded.</p>'}
      <h4 style="margin-bottom:0.5rem;margin-top:1rem;">Recommendations</h4>
      ${recs.length ? recs.map(r => `<div style="padding:0.5rem;border:1px solid var(--color-border);border-radius:8px;margin-bottom:0.5rem;"><strong>${r.category}</strong><br><span style="font-size:0.875rem;color:var(--color-text-secondary);">${r.recommendation_text}</span></div>`).join('') : '<p style="color:var(--color-text-tertiary);">No recommendations recorded.</p>'}
    `;
    modal.classList.add('active');
  } catch (err) {
    showToast('Unable to load assessment details.', 'error');
  }
}

/* ---- Concerns Page ---- */
export async function initUserConcerns() {
  const auth = await initDashboard('user', 'concerns');
  if (!auth) return;
  await loadAllConcerns(auth.user.id);
}

async function loadAllConcerns(userId) {
  try {
    const assessments = await dataAPI.getAssessments(userId);
    const assessIds = assessments.map(a => a.id);
    const concerns = await dataAPI.getAllConcerns(assessIds);

    const container = document.getElementById('concernsGrid');
    const emptyState = document.getElementById('emptyConcerns');

    if (!concerns || concerns.length === 0) {
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (container) {
      container.innerHTML = concerns.map(c => {
        const assess = assessments.find(a => a.id === c.assessment_id);
        return `
        <div class="concern-card">
          <div class="concern-card-header">
            <span class="concern-card-name">${c.concern_name}</span>
            <span class="badge ${severityBadgeClass(c.severity)}">${c.severity}</span>
          </div>
          <div class="concern-card-body">${c.explanation || ''}</div>
          <div style="font-size:var(--fs-xs);color:var(--color-text-tertiary);margin-top:0.5rem;">Detected: ${assess ? formatDate(assess.assessment_date) : 'N/A'}</div>
          <div class="concern-severity-bar"><div class="concern-severity-fill ${severityFillClass(c.severity)}" style="width:${severityWidth(c.severity)}%"></div></div>
        </div>
      `;
      }).join('');
    }
  } catch (err) {
    showToast('Unable to load concerns.', 'error');
  }
}

/* ---- Risks Page ---- */
export async function initUserRisks() {
  const auth = await initDashboard('user', 'risks');
  if (!auth) return;
  await loadAllRisks(auth.user.id);
}

async function loadAllRisks(userId) {
  try {
    const assessments = await dataAPI.getAssessments(userId);
    const assessIds = assessments.map(a => a.id);
    const risks = await dataAPI.getAllRisks(assessIds);

    const container = document.getElementById('risksList');
    const emptyState = document.getElementById('emptyRisks');

    if (!risks || risks.length === 0) {
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (container) {
      container.innerHTML = risks.map(r => `
        <div class="card" style="margin-bottom:1rem;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;">
            <strong>${r.risk_name}</strong>
            <span class="badge ${severityBadgeClass(r.severity)}">${r.severity}</span>
          </div>
          <p style="font-size:var(--fs-sm);color:var(--color-text-secondary);margin-bottom:0.5rem;">${r.explanation || ''}</p>
          ${r.preventive_action ? `<div style="font-size:var(--fs-sm);padding:0.5rem;background:var(--color-success-soft);border-radius:8px;color:var(--color-success);"><strong>Preventive Action:</strong> ${r.preventive_action}</div>` : ''}
        </div>
      `).join('');
    }
  } catch (err) {
    showToast('Unable to load risk factors.', 'error');
  }
}

/* ---- Recommendations Page ---- */
export async function initUserRecommendations() {
  const auth = await initDashboard('user', 'recommendations');
  if (!auth) return;
  await loadAllRecommendations(auth.user.id);
  await loadProductRecommendations(auth.user.id);
}

async function loadAllRecommendations(userId) {
  try {
    const assessments = await dataAPI.getAssessments(userId);
    const container = document.getElementById('recsContainer');
    const emptyState = document.getElementById('emptyRecs');

    if (!assessments || assessments.length === 0) {
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    // Get recs from latest assessment
    const recs = await dataAPI.getRecommendations(assessments[0].id);

    if (!recs || recs.length === 0) {
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Group by category
    const categories = {};
    recs.forEach(r => {
      if (!categories[r.category]) categories[r.category] = [];
      categories[r.category].push(r.recommendation_text);
    });

    if (container) {
      container.innerHTML = Object.entries(categories).map(([cat, items]) => `
        <div class="card" style="margin-bottom:1rem;">
          <h3 style="font-size:var(--fs-lg);font-weight:600;margin-bottom:0.75rem;display:flex;align-items:center;gap:0.5rem;">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="color:var(--color-accent-dark);"><path d="M10 3l1.5 4L16 8.5 11.5 10 10 14l-1.5-4L4 8.5 8.5 7 10 3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
            ${cat}
          </h3>
          <ul class="recommendation-list">
            ${items.map(i => `<li>${i}</li>`).join('')}
          </ul>
        </div>
      `).join('');
    }
  } catch (err) {
    showToast('Unable to load recommendations.', 'error');
  }
}

async function loadProductRecommendations(userId) {
  const productsSection = document.getElementById('productsSection');
  const productsContainer = document.getElementById('productsContainer');
  const sourceBadge = document.getElementById('productsSource');
  if (!productsSection || !productsContainer) return;

  try {
    const assessments = await dataAPI.getAssessments(userId);
    if (!assessments || assessments.length === 0) return;

    const latest = assessments[0];
    const profile = await dataAPI.getUserProfile(userId);
    const concerns = await dataAPI.getConcerns(latest.id);
    const feedback = await dataAPI.getFeedback(userId);
    const routineData = await dataAPI.getLatestRoutine(userId);
    const routine = routineData?.routine || routineData || null;

    const result = await geminiAPI.generateProducts(latest, profile, concerns, feedback, routine);
    const products = result?.products || [];
    const source = result?.source || 'rule_based';

    if (products.length === 0) return;

    productsSection.style.display = 'block';

    if (sourceBadge) {
      sourceBadge.innerHTML = `<span class="badge ${source === 'gemini' ? 'badge-info' : 'badge-neutral'}">${source === 'gemini' ? 'AI-Enhanced (Gemini)' : 'Rule-Based Analysis'}</span>`;
    }

    productsContainer.innerHTML = products.map(p => renderProductCard(p)).join('');
  } catch (err) {
    showToast('Unable to load product recommendations.', 'error');
  }
}

function renderProductCard(product) {
  const categoryColors = {
    'Cleanser': 'var(--color-accent-dark)',
    'Serum': 'var(--color-success)',
    'Moisturizer': '#2563eb',
    'Sunscreen': '#ea580c',
    'Treatment': '#7c3aed',
    'Exfoliant': '#dc2626',
    'Night care': '#0d9488',
  };
  const catColor = categoryColors[product.category] || 'var(--color-text-tertiary)';
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent((product.brand || '') + ' ' + product.name)}`;

  const imgSrc = product.image_url || '';
  const imgHtml = imgSrc
    ? `<img src="${imgSrc}" alt="${product.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"/><div style="display:none;width:100%;height:100%;align-items:center;justify-content:center;background:var(--color-surface-alt);"><svg width="32" height="32" viewBox="0 0 36 36" fill="none" style="color:${catColor};"><path d="M18 6l3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></div>`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--color-surface-alt);"><svg width="32" height="32" viewBox="0 0 36 36" fill="none" style="color:${catColor};"><path d="M18 6l3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></div>`;

  return `
    <div class="card product-card" style="display:flex;flex-direction:column;overflow:hidden;padding:0;transition:all 0.2s;">
      <div style="height:100px;position:relative;overflow:hidden;background:var(--color-surface-alt);">
        ${imgHtml}
        ${product.is_popular_pick ? '<span class="badge badge-warning" style="position:absolute;top:0.375rem;right:0.375rem;font-size:10px;">Popular</span>' : ''}
      </div>
      <div style="padding:0.75rem;display:flex;flex-direction:column;flex:1;">
        <span class="badge" style="background:${catColor}22;color:${catColor};font-size:10px;margin-bottom:0.25rem;align-self:flex-start;">${product.category}</span>
        <h3 style="font-size:var(--fs-sm);font-weight:600;margin-bottom:0.125rem;line-height:1.3;">${product.name}</h3>
        <div style="font-size:var(--fs-xs);color:var(--color-text-tertiary);margin-bottom:0.5rem;">${product.brand || ''}</div>
        ${product.key_ingredients && product.key_ingredients.length > 0 ? `
          <div style="margin-bottom:0.5rem;">
            <div style="font-size:10px;font-weight:600;color:var(--color-text-tertiary);text-transform:uppercase;margin-bottom:0.125rem;">Key Ingredients</div>
            <div style="display:flex;flex-wrap:wrap;gap:0.25rem;">${product.key_ingredients.map(i => `<span class="badge badge-neutral" style="font-size:10px;">${i}</span>`).join('')}</div>
          </div>` : ''}
        ${product.why_recommended ? `
          <div style="margin-bottom:0.5rem;">
            <div style="font-size:10px;font-weight:600;color:var(--color-text-tertiary);text-transform:uppercase;margin-bottom:0.125rem;">Why Recommended</div>
            <p style="font-size:var(--fs-xs);color:var(--color-text-secondary);line-height:1.4;">${product.why_recommended}</p>
          </div>` : ''}
        ${product.suitable_skin_types && product.suitable_skin_types.length > 0 ? `
          <div style="margin-bottom:0.5rem;">
            <div style="font-size:10px;font-weight:600;color:var(--color-text-tertiary);text-transform:uppercase;margin-bottom:0.125rem;">Suitable For</div>
            <div style="display:flex;flex-wrap:wrap;gap:0.25rem;">${product.suitable_skin_types.map(t => `<span class="badge badge-info" style="font-size:10px;">${t}</span>`).join('')}</div>
          </div>` : ''}
        ${product.suitable_concerns && product.suitable_concerns.length > 0 ? `
          <div style="margin-bottom:0.5rem;">
            <div style="font-size:10px;font-weight:600;color:var(--color-text-tertiary);text-transform:uppercase;margin-bottom:0.125rem;">Targets</div>
            <div style="display:flex;flex-wrap:wrap;gap:0.25rem;">${product.suitable_concerns.map(c => `<span class="badge badge-success" style="font-size:10px;">${c}</span>`).join('')}</div>
          </div>` : ''}
        ${product.how_to_use ? `
          <div style="margin-bottom:0.5rem;">
            <div style="font-size:10px;font-weight:600;color:var(--color-text-tertiary);text-transform:uppercase;margin-bottom:0.125rem;">How to Use</div>
            <p style="font-size:var(--fs-xs);color:var(--color-text-secondary);line-height:1.4;">${product.how_to_use}</p>
          </div>` : ''}
        ${product.price_range ? `<div style="font-size:var(--fs-sm);font-weight:700;color:var(--color-accent-dark);margin-bottom:0.5rem;">${product.price_range}</div>` : ''}
        <a href="${searchUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="margin-top:auto;width:100%;text-align:center;text-decoration:none;font-size:var(--fs-xs);padding:0.5rem;">View Product</a>
      </div>
    </div>`;
}

/* ---- Settings ---- */
export async function initUserSettings() {
  const auth = await initDashboard('user', 'settings');
  if (!auth) return;
}

/* ---- Consultation Request ---- */
export async function requestConsultation(userId) {
  const roleSelect = document.getElementById('consultRole');
  const messageInput = document.getElementById('consultMessage');

  const requestedRole = roleSelect ? roleSelect.value : 'consultant';
  const message = messageInput ? messageInput.value.trim() : '';

  showLoading('Sending request...');
  try {
    await dataAPI.createConsultationRequest({
      user_id: userId,
      requested_role: requestedRole,
      message,
      priority: 'normal',
    });
    hideLoading();
    showToast('Consultation request sent successfully!', 'success');
    if (messageInput) messageInput.value = '';
  } catch (err) {
    hideLoading();
    showToast('Unable to send request. Please try again.', 'error');
  }
}
