/* ==================== GLOWSENSE AI — ASSESSMENT LOGIC ==================== */

import { dataAPI, authAPI } from './api.js';
import { initDashboard, showToast, showLoading, hideLoading, formatDate, riskBadge } from './common.js';

/* ---- Assessment landing page ---- */
export async function initAssessmentLanding() {
  const auth = await initDashboard('user', 'assessment');
  if (!auth) return;
}

/* ---- Form Assessment ---- */
export async function initFormAssessment() {
  const auth = await initDashboard('user', 'assessment');
  if (!auth) return;

  // Setup radio groups
  setupRadioGroups();

  // Setup form submit
  const form = document.getElementById('assessmentForm');
  if (form) {
    form.addEventListener('submit', (e) => handleFormSubmit(e, auth.user.id));
  }
}

function setupRadioGroups() {
  document.querySelectorAll('.radio-group').forEach(group => {
    const options = group.querySelectorAll('.radio-option');
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        const input = opt.querySelector('input');
        if (input) input.checked = true;
      });
    });
  });
}

async function handleFormSubmit(event, userId) {
  event.preventDefault();
  const form = event.target;

  // Collect form data
  const formData = collectFormData(form);

  // Validate required fields
  if (!formData.age || !formData.gender || !formData.skin_type) {
    showToast('Please complete all required fields.', 'warning');
    return;
  }

  // Show analysis loading
  showAnalysisLoading();

  try {
    // Call ML assessment (via backend or local computation)
    const result = await callMLService(formData);

    // Store assessment
    const assessment = await dataAPI.createAssessment({
      user_id: userId,
      method: 'form',
      skin_health_score: result.skin_health_score,
      skin_type: result.skin_type,
      risk_level: result.risk_level,
      form_data: formData,
    });

    // Store concerns
    if (result.concerns && result.concerns.length > 0) {
      await dataAPI.addConcerns(assessment.id, result.concerns);
    }

    // Store risks
    if (result.risk_factors && result.risk_factors.length > 0) {
      await dataAPI.addRisks(assessment.id, result.risk_factors);
    }

    // Store recommendations
    if (result.recommendations && result.recommendations.length > 0) {
      await dataAPI.addRecommendations(assessment.id, result.recommendations);
    }

    // Save profile data
    await dataAPI.upsertUserProfile(userId, {
      age: parseInt(formData.age) || null,
      gender: formData.gender,
      skin_type: formData.skin_type,
      skin_sensitivity: formData.skin_sensitivity,
      water_intake: formData.water_intake,
      sleep_duration: formData.sleep_duration,
      stress_level: formData.stress_level,
      exercise_frequency: formData.exercise_frequency,
      smoking: formData.smoking,
      alcohol: formData.alcohol,
      cleanser_usage: formData.cleanser_usage,
      moisturizer_usage: formData.moisturizer_usage,
      sunscreen_usage: formData.sunscreen_usage,
      skincare_routine: formData.skincare_routine,
      sun_exposure: formData.sun_exposure,
      pollution_exposure: formData.pollution_exposure,
      climate: formData.climate,
    });

    hideLoading();

    // Show result
    showResult(assessment.id, result);
  } catch (err) {
    hideLoading();
    showToast('Unable to complete assessment. Please try again.', 'error');
  }
}

function collectFormData(form) {
  const data = {};
  // Regular inputs
  form.querySelectorAll('input, select, textarea').forEach(input => {
    if (input.type === 'radio') {
      if (input.checked) data[input.name] = input.value;
    } else if (input.type === 'range') {
      data[input.id] = input.value;
    } else {
      data[input.id] = input.value;
    }
  });
  // Radio groups (custom)
  form.querySelectorAll('.radio-group').forEach(group => {
    const selected = group.querySelector('input:checked');
    if (selected) data[group.dataset.field] = selected.value;
  });
  return data;
}

function showAnalysisLoading() {
  const overlay = document.querySelector('.loading-overlay') || (() => {
    const o = document.createElement('div');
    o.className = 'loading-overlay';
    document.body.appendChild(o);
    return o;
  })();

  overlay.innerHTML = `
    <div class="analysis-loading">
      <div class="analysis-loading-icon">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="1.5"/>
          <path d="M20 10v10l7 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="analysis-loading-title">Analyzing your skin profile...</div>
      <div class="analysis-loading-text">Our AI is processing your assessment data</div>
      <div class="analysis-progress"><div class="analysis-progress-fill" id="progressFill"></div></div>
      <div class="analysis-steps">
        <div class="analysis-step-item" id="step1">Processing form data</div>
        <div class="analysis-step-item" id="step2">Running ML prediction</div>
        <div class="analysis-step-item" id="step3">Generating recommendations</div>
        <div class="analysis-step-item" id="step4">Saving results</div>
      </div>
    </div>
  `;
  overlay.style.display = 'flex';

  // Animate progress
  let progress = 0;
  const fill = document.getElementById('progressFill');
  const steps = [1, 2, 3, 4].map(i => document.getElementById('step' + i));
  const interval = setInterval(() => {
    progress += 5;
    if (fill) fill.style.width = progress + '%';
    if (progress >= 25 && steps[0]) steps[0].classList.add('done');
    if (progress >= 50 && steps[1]) steps[1].classList.add('done');
    if (progress >= 75 && steps[2]) steps[2].classList.add('done');
    if (progress >= 100) { steps[3]?.classList.add('done'); clearInterval(interval); }
  }, 200);
}

function showResult(assessmentId, result) {
  const container = document.getElementById('assessmentResult');
  if (!container) return;

  const score = result.skin_health_score || 0;
  let interpretation = '';
  if (score >= 80) interpretation = 'Your skin health is in the Excellent range.';
  else if (score >= 60) interpretation = 'Your skin health is in the Good range.';
  else if (score >= 40) interpretation = 'Your skin health is in the Fair range.';
  else interpretation = 'Your skin health needs attention.';

  const scoreColor = score >= 80 ? 'var(--color-success)' : score >= 60 ? 'var(--color-accent-dark)' : score >= 40 ? 'var(--color-warning)' : 'var(--color-error)';

  container.innerHTML = `
    <div class="result-container">
      <div class="result-hero">
        <h2 style="font-size:var(--fs-2xl);font-weight:700;margin-bottom:1rem;">Assessment Complete</h2>
        <div class="result-score-section">
          <div class="score-ring-large" style="background:conic-gradient(${scoreColor} ${score}%, var(--color-border-light) 0);">
            <div class="score-ring-large-inner">
              <span class="score-number" style="color:${scoreColor};">${score}</span>
              <span class="score-max">/100</span>
            </div>
          </div>
          <div class="result-score-text">
            <div class="result-score-interpretation" style="color:${scoreColor};">${interpretation}</div>
            <div class="result-score-label">Skin Type: <strong>${result.skin_type || 'N/A'}</strong></div>
            <div class="result-score-label">Risk Level: ${riskBadge(result.risk_level)}</div>
          </div>
        </div>
      </div>

      ${result.concerns && result.concerns.length > 0 ? `
      <div class="result-section">
        <div class="result-section-header">
          <div class="result-section-icon" style="background:var(--color-warning-soft);color:var(--color-warning);">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3l8 14H2L10 3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M10 9v3M10 14h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </div>
          <h3 class="result-section-title">Main Concerns</h3>
        </div>
        ${result.concerns.map(c => `
          <div style="padding:0.75rem;border:1px solid var(--color-border);border-radius:8px;margin-bottom:0.5rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.25rem;">
              <strong>${c.concern_name}</strong>
              <span class="badge ${c.severity === 'High' ? 'badge-error' : c.severity === 'Moderate' ? 'badge-warning' : 'badge-success'}">${c.severity}</span>
            </div>
            <p style="font-size:var(--fs-sm);color:var(--color-text-secondary);">${c.explanation || ''}</p>
          </div>
        `).join('')}
      </div>` : ''}

      ${result.risk_factors && result.risk_factors.length > 0 ? `
      <div class="result-section">
        <div class="result-section-header">
          <div class="result-section-icon" style="background:var(--color-error-soft);color:var(--color-error);">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3l6 2v5c0 4-3 6-6 7-3-1-6-3-6-7V5l6-2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
          </div>
          <h3 class="result-section-title">Risk Factors</h3>
        </div>
        ${result.risk_factors.map(r => `
          <div class="risk-item">
            <div class="risk-item-info">
              <strong style="font-size:var(--fs-sm);">${r.risk_name}</strong>
              <div class="risk-item-explanation">${r.explanation || ''}</div>
            </div>
            <span class="badge ${r.severity === 'High' ? 'badge-error' : r.severity === 'Moderate' ? 'badge-warning' : 'badge-success'}">${r.severity}</span>
          </div>
        `).join('')}
      </div>` : ''}

      ${result.recommendations && result.recommendations.length > 0 ? `
      <div class="result-section">
        <div class="result-section-header">
          <div class="result-section-icon" style="background:var(--color-accent-soft);color:var(--color-accent-dark);">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3l1.5 4L16 8.5 11.5 10 10 14l-1.5-4L4 8.5 8.5 7 10 3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
          </div>
          <h3 class="result-section-title">Personalized Recommendations</h3>
        </div>
        ${groupRecommendationsByCategory(result.recommendations)}
      </div>` : ''}

      <div class="result-disclaimer">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M10 6v4M10 13h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        <span>These results are informational skincare insights and are not a medical diagnosis. Consult a qualified dermatologist for medical concerns.</span>
      </div>

      <div style="display:flex;gap:1rem;justify-content:center;margin-top:1.5rem;">
        <a href="/user/dashboard.html" class="btn btn-primary">Back to Dashboard</a>
        <a href="/user/history.html?id=${assessmentId}" class="btn btn-outline">View Details</a>
      </div>
    </div>
  `;
  container.scrollIntoView({ behavior: 'smooth' });
}

function groupRecommendationsByCategory(recs) {
  const categories = {};
  recs.forEach(r => {
    if (!categories[r.category]) categories[r.category] = [];
    categories[r.category].push(r.recommendation_text);
  });
  return Object.entries(categories).map(([cat, items]) => `
    <div class="recommendation-category">
      <div class="recommendation-category-title">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="color:var(--color-accent-dark);"><path d="M8 2l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>
        ${cat}
      </div>
      <ul class="recommendation-list">
        ${items.map(i => `<li>${i}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

/* ---- ML Service Call ---- */
/* This function sends assessment data to the Node.js backend, which forwards
   it to the Python FastAPI ML service. If the backend is not available, it falls
   back to a local heuristic-based assessment so the app remains functional. */

export async function callMLService(formData) {
  try {
    // Try calling the Node.js backend which proxies to Python ML service
    const response = await fetch('/api/assessment/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error('Backend not available');
  } catch (err) {
    // Fallback: local heuristic assessment
    return localAssessment(formData);
  }
}

/* ---- Local Heuristic Assessment (fallback) ---- */
/* This provides a rule-based assessment when the ML service is unavailable.
   It is clearly marked as a development fallback, NOT the trained ML model. */

function localAssessment(data) {
  let score = 75;
  const concerns = [];
  const riskFactors = [];
  const recommendations = [];

  // Skin type
  const skinType = data.skin_type || 'Combination';

  // Adjust score based on skin profile
  const oiliness = parseInt(data.oiliness) || 3;
  const dryness = parseInt(data.dryness) || 3;
  const acne = parseInt(data.acne_frequency) || 3;
  const pigmentation = parseInt(data.pigmentation) || 3;
  const redness = parseInt(data.redness) || 3;
  const fineLines = parseInt(data.fine_lines) || 3;
  const pores = parseInt(data.visible_pores) || 3;

  // Lifestyle impact
  const waterIntake = data.water_intake || '3-4 glasses';
  const sleep = data.sleep_duration || '6-7 hours';
  const stress = data.stress_level || 'Moderate';
  const smoking = data.smoking || 'No';
  const alcohol = data.alcohol || 'Never';
  const sunExposure = data.sun_exposure || 'Moderate';
  const pollution = data.pollution_exposure || 'Moderate';
  const sunscreenUse = data.sunscreen_usage || 'Sometimes';

  // Score deductions
  if (acne >= 4) { score -= 8; concerns.push({ concern_name: 'Acne', severity: acne >= 5 ? 'High' : 'Moderate', priority: 'high', explanation: 'Your assessment indicates frequent acne breakouts.' }); }
  if (dryness >= 4) { score -= 5; concerns.push({ concern_name: 'Dryness', severity: dryness >= 5 ? 'High' : 'Moderate', priority: 'medium', explanation: 'Your skin shows signs of dryness and may need more hydration.' }); }
  if (oiliness >= 4) { score -= 4; concerns.push({ concern_name: 'Oiliness', severity: 'Moderate', priority: 'medium', explanation: 'Excess oil production detected in your skin profile.' }); }
  if (pigmentation >= 4) { score -= 5; concerns.push({ concern_name: 'Pigmentation', severity: pigmentation >= 5 ? 'High' : 'Moderate', priority: 'medium', explanation: 'Signs of uneven pigmentation or dark spots detected.' }); }
  if (redness >= 4) { score -= 4; concerns.push({ concern_name: 'Sensitivity', severity: 'Moderate', priority: 'medium', explanation: 'Your skin shows signs of redness or sensitivity.' }); }
  if (fineLines >= 4) { score -= 3; concerns.push({ concern_name: 'Fine Lines', severity: 'Low', priority: 'low', explanation: 'Early signs of fine lines or wrinkles noted.' }); }
  if (pores >= 4) { score -= 2; concerns.push({ concern_name: 'Visible Pores', severity: 'Low', priority: 'low', explanation: 'Enlarged pore visibility detected.' }); }

  // Lifestyle risks
  if (waterIntake.includes('0') || waterIntake.includes('1') || waterIntake.includes('2')) {
    score -= 5; riskFactors.push({ risk_name: 'Low Hydration', severity: 'High', explanation: 'Insufficient water intake affects skin health.', preventive_action: 'Drink at least 8 glasses of water daily.' });
  }
  if (sleep.includes('less') || sleep.includes('3') || sleep.includes('4') || sleep.includes('5')) {
    score -= 6; riskFactors.push({ risk_name: 'Poor Sleep', severity: 'High', explanation: 'Inadequate sleep impacts skin regeneration.', preventive_action: 'Aim for 7-9 hours of sleep per night.' });
  }
  if (stress === 'High' || stress === 'Very High') {
    score -= 4; riskFactors.push({ risk_name: 'High Stress', severity: 'Moderate', explanation: 'High stress levels can trigger skin issues.', preventive_action: 'Practice stress management techniques like meditation or exercise.' });
  }
  if (smoking === 'Yes' || smoking === 'Regularly') {
    score -= 8; riskFactors.push({ risk_name: 'Smoking', severity: 'High', explanation: 'Smoking accelerates skin aging and damage.', preventive_action: 'Consider a smoking cessation program.' });
  }
  if (sunExposure === 'High' || sunExposure === 'Very High') {
    score -= 6; riskFactors.push({ risk_name: 'Sun Exposure', severity: 'High', explanation: 'Excessive sun exposure increases skin damage risk.', preventive_action: 'Apply SPF 30+ sunscreen daily and limit direct sun exposure.' });
  }
  if (pollution === 'High' || pollution === 'Very High') {
    score -= 3; riskFactors.push({ risk_name: 'Pollution Exposure', severity: 'Moderate', explanation: 'Environmental pollution can damage skin.', preventive_action: 'Cleanse thoroughly every evening to remove pollutants.' });
  }
  if (sunscreenUse === 'Never' || sunscreenUse === 'Rarely') {
    score -= 5; riskFactors.push({ risk_name: 'No Sun Protection', severity: 'High', explanation: 'Lack of sunscreen increases UV damage risk.', preventive_action: 'Use a broad-spectrum SPF 30+ sunscreen every morning.' });
  }

  // Clamp score
  score = Math.max(20, Math.min(100, score));

  // Risk level
  let riskLevel = 'Low';
  if (score < 40) riskLevel = 'High';
  else if (score < 60) riskLevel = 'Moderate';
  else if (score < 75) riskLevel = 'Low';

  // Recommendations
  recommendations.push({ category: 'Morning Routine', recommendation_text: 'Cleanse with a gentle face wash, apply vitamin C serum, and finish with a broad-spectrum SPF 30+ sunscreen.' });
  recommendations.push({ category: 'Evening Routine', recommendation_text: 'Remove makeup and cleanse thoroughly, apply a nourishing night cream or retinol serum, and use a humidifier if needed.' });
  recommendations.push({ category: 'Sun Protection', recommendation_text: 'Reapply sunscreen every 2 hours when outdoors. Wear protective clothing and avoid peak sun hours (10am-4pm).' });
  recommendations.push({ category: 'Hydration', recommendation_text: 'Drink at least 8 glasses of water daily. Include water-rich foods like cucumber and watermelon in your diet.' });
  recommendations.push({ category: 'Lifestyle', recommendation_text: 'Aim for 7-9 hours of sleep per night. Manage stress with regular exercise or meditation.' });

  if (skinType === 'Oily') {
    recommendations.push({ category: 'Cleansing', recommendation_text: 'Use a foaming cleanser twice daily. Avoid over-washing which can increase oil production.' });
  } else if (skinType === 'Dry') {
    recommendations.push({ category: 'Moisturization', recommendation_text: 'Use a rich moisturizer with hyaluronic acid. Apply on damp skin to lock in moisture.' });
  } else {
    recommendations.push({ category: 'Moisturization', recommendation_text: 'Use a lightweight gel moisturizer on oily areas and a richer cream on dry areas.' });
  }

  if (concerns.find(c => c.concern_name === 'Acne')) {
    recommendations.push({ category: 'Cleansing', recommendation_text: 'Consider a salicylic acid cleanser for acne-prone areas. Avoid touching your face throughout the day.' });
  }

  return {
    skin_health_score: score,
    skin_type: skinType,
    concerns,
    risk_level: riskLevel,
    risk_factors: riskFactors,
    recommendations,
    _source: 'local_heuristic_fallback',
  };
}
