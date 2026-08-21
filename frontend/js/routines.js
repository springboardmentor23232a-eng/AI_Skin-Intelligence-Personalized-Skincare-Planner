/* ==================== GLOWSENSE AI — MODULE 4 & 5 FRONTEND LOGIC ==================== */

import { dataAPI, geminiAPI, authAPI } from './api.js';
import { initDashboard, showToast, showLoading, hideLoading, formatDate } from './common.js';

/* ---- Routine Page ---- */
export async function initUserRoutine() {
  const auth = await initDashboard('user', 'routine');
  if (!auth) return;
  await loadRoutine(auth.user.id);
}

async function loadRoutine(userId) {
  const container = document.getElementById('routineContainer');
  const emptyState = document.getElementById('emptyRoutine');
  const adaptiveSection = document.getElementById('adaptiveSection');

  try {
    const assessments = await dataAPI.getAssessments(userId);
    if (!assessments || assessments.length === 0) {
      if (container) container.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    const latest = assessments[0];
    const profile = await dataAPI.getUserProfile(userId);
    const concerns = await dataAPI.getConcerns(latest.id);
    const feedback = await dataAPI.getFeedback(userId);
    const previousAssessments = assessments.slice(1);

    if (container) container.innerHTML = '<div class="card" style="text-align:center;padding:2rem;"><div class="spinner" style="margin:0 auto 1rem;"></div><p style="color:var(--color-text-secondary);">Generating your personalized routine...</p></div>';

    const result = await geminiAPI.generateRoutine(latest, profile, concerns, feedback, previousAssessments);
    const routine = result.routine;
    const source = result.source;

    // Save routine to database
    try {
      await dataAPI.createRoutine({
        user_id: userId,
        assessment_id: latest.id,
        morning_routine: routine.morning_routine,
        evening_routine: routine.evening_routine,
        weekly_plan: routine.weekly_plan,
        seasonal_recommendations: routine.seasonal_recommendations,
        source: source,
      });
    } catch (e) { /* save failure is non-fatal */ }

    renderRoutine(container, routine, source);

    // Adaptive updates
    if (previousAssessments.length > 0) {
      const previous = previousAssessments[0];
      const prevConcerns = await dataAPI.getConcerns(previous.id);
      const adaptiveResult = await geminiAPI.generateAdaptiveUpdates(
        previous, latest, profile, prevConcerns, concerns, feedback
      );

      try {
        await dataAPI.createAdaptiveUpdate({
          user_id: userId,
          previous_assessment_id: previous.id,
          latest_assessment_id: latest.id,
          previous_score: previous.skin_health_score,
          latest_score: latest.skin_health_score,
          score_trend: adaptiveResult.score_trend,
          concern_changes: adaptiveResult.concern_changes,
          routine_adjustments: adaptiveResult.routine_adjustments,
          overall_progress: adaptiveResult.overall_progress,
          source: adaptiveResult.source || 'rule_based',
        });
      } catch (e) { /* save failure is non-fatal */ }

      if (adaptiveSection) {
        adaptiveSection.style.display = 'block';
        renderAdaptiveUpdates(document.getElementById('adaptiveContent'), adaptiveResult, previous, latest);
      }
    }
  } catch (err) {
    if (container) container.innerHTML = `<div class="alert alert-error">Unable to load routine. ${err.message || ''}</div>`;
  }
}

function renderRoutine(container, routine, source) {
  if (!container) return;

  const sourceBadge = source === 'gemini'
    ? '<span class="badge badge-info" style="margin-left:0.5rem;">AI-Enhanced (Gemini)</span>'
    : '<span class="badge badge-neutral" style="margin-left:0.5rem;">Rule-Based Fallback</span>';

  let html = '';

  if (routine.summary) {
    html += `<div class="card" style="margin-bottom:1rem;"><p style="font-size:var(--fs-base);color:var(--color-text-secondary);">${routine.summary}</p><div style="margin-top:0.5rem;">${sourceBadge}</div></div>`;
  }

  // Morning Routine
  html += '<div class="card" style="margin-bottom:1rem;">';
  html += '<div class="card-header"><h3 class="card-title">Morning Routine</h3></div>';
  html += '<div style="display:flex;flex-direction:column;gap:0.75rem;">';
  (routine.morning_routine || []).forEach(step => {
    html += `
      <div style="display:flex;gap:0.75rem;align-items:flex-start;padding:0.75rem;border:1px solid var(--color-border);border-radius:8px;">
        <div style="width:32px;height:32px;border-radius:50%;background:var(--color-accent-soft);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:var(--fs-sm);color:var(--color-accent-dark);flex-shrink:0;">${step.step || ''}</div>
        <div style="flex:1;">
          <div style="font-weight:600;font-size:var(--fs-sm);color:var(--color-text);">${step.category}</div>
          <div style="font-size:var(--fs-xs);color:var(--color-text-tertiary);margin-bottom:0.25rem;">${step.product_type || ''}${step.ingredient ? ' &middot; ' + step.ingredient : ''}</div>
          <div style="font-size:var(--fs-sm);color:var(--color-text-secondary);">${step.instructions || ''}</div>
        </div>
      </div>`;
  });
  html += '</div></div>';

  // Evening Routine
  html += '<div class="card" style="margin-bottom:1rem;">';
  html += '<div class="card-header"><h3 class="card-title">Evening Routine</h3></div>';
  html += '<div style="display:flex;flex-direction:column;gap:0.75rem;">';
  (routine.evening_routine || []).forEach(step => {
    html += `
      <div style="display:flex;gap:0.75rem;align-items:flex-start;padding:0.75rem;border:1px solid var(--color-border);border-radius:8px;">
        <div style="width:32px;height:32px;border-radius:50%;background:var(--color-primary-soft);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:var(--fs-sm);color:var(--color-primary);flex-shrink:0;">${step.step || ''}</div>
        <div style="flex:1;">
          <div style="font-weight:600;font-size:var(--fs-sm);color:var(--color-text);">${step.category}</div>
          <div style="font-size:var(--fs-xs);color:var(--color-text-tertiary);margin-bottom:0.25rem;">${step.product_type || ''}${step.ingredient ? ' &middot; ' + step.ingredient : ''}</div>
          <div style="font-size:var(--fs-sm);color:var(--color-text-secondary);">${step.instructions || ''}</div>
        </div>
      </div>`;
  });
  html += '</div></div>';

  // Weekly Plan
  if (routine.weekly_plan && routine.weekly_plan.length > 0) {
    html += '<div class="card" style="margin-bottom:1rem;">';
    html += '<div class="card-header"><h3 class="card-title">Weekly Treatment Plan</h3></div>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:0.75rem;">';
    routine.weekly_plan.forEach(item => {
      html += `
        <div style="padding:0.75rem;border:1px solid var(--color-border);border-radius:8px;">
          <div style="font-weight:600;font-size:var(--fs-sm);color:var(--color-accent-dark);margin-bottom:0.25rem;">${item.day}</div>
          <div style="font-size:var(--fs-sm);font-weight:600;color:var(--color-text);margin-bottom:0.25rem;">${item.activity}</div>
          ${item.ingredient ? `<div style="font-size:var(--fs-xs);color:var(--color-text-tertiary);margin-bottom:0.25rem;">${item.ingredient}</div>` : ''}
          <div style="font-size:var(--fs-xs);color:var(--color-text-secondary);">${item.reason || ''}</div>
        </div>`;
    });
    html += '</div></div>';
  }

  // Seasonal Recommendations
  if (routine.seasonal_recommendations && routine.seasonal_recommendations.length > 0) {
    html += '<div class="card" style="margin-bottom:1rem;">';
    html += '<div class="card-header"><h3 class="card-title">Seasonal Recommendations</h3></div>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:0.75rem;">';
    routine.seasonal_recommendations.forEach(item => {
      html += `
        <div style="padding:0.75rem;border:1px solid var(--color-border);border-radius:8px;background:var(--color-surface-alt);">
          <div style="font-weight:600;font-size:var(--fs-sm);color:var(--color-text);margin-bottom:0.25rem;">${item.season}</div>
          <div style="font-size:var(--fs-xs);color:var(--color-text-secondary);">${item.adjustments}</div>
        </div>`;
    });
    html += '</div></div>';
  }

  // Key Ingredients
  if (routine.key_ingredients && routine.key_ingredients.length > 0) {
    html += '<div class="card" style="margin-bottom:1rem;">';
    html += '<div class="card-header"><h3 class="card-title">Key Ingredients in This Routine</h3></div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:0.5rem;">';
    routine.key_ingredients.forEach(ing => {
      html += `<a href="/user/ingredients.html?ingredient=${encodeURIComponent(ing)}" style="display:inline-flex;align-items:center;padding:0.375rem 0.875rem;background:var(--color-accent-soft);border-radius:var(--radius-full);font-size:var(--fs-sm);font-weight:600;color:var(--color-accent-dark);text-decoration:none;transition:all 0.2s;">${ing}</a>`;
    });
    html += '</div></div>';
  }

  container.innerHTML = html;
}

function renderAdaptiveUpdates(container, result, previous, latest) {
  if (!container) return;

  const trendColors = { improved: 'badge-success', declined: 'badge-error', stable: 'badge-neutral' };
  const trendLabels = { improved: 'Improved', declined: 'Declined', stable: 'Stable' };

  let html = `<div class="card" style="margin-bottom:1rem;">`;
  html += `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">`;
  html += `<div><span style="font-size:var(--fs-xs);color:var(--color-text-tertiary);">Previous Score</span><div style="font-size:var(--fs-2xl);font-weight:700;">${previous.skin_health_score || 'N/A'}</div></div>`;
  html += `<div style="font-size:var(--fs-xl);color:var(--color-text-tertiary);">&rarr;</div>`;
  html += `<div><span style="font-size:var(--fs-xs);color:var(--color-text-tertiary);">Latest Score</span><div style="font-size:var(--fs-2xl);font-weight:700;">${latest.skin_health_score || 'N/A'}</div></div>`;
  html += `<div><span style="font-size:var(--fs-xs);color:var(--color-text-tertiary);">Trend</span><div><span class="badge ${trendColors[result.score_trend] || 'badge-neutral'}">${trendLabels[result.score_trend] || 'N/A'}</span></div></div>`;
  html += `</div>`;

  if (result.overall_progress) {
    html += `<p style="font-size:var(--fs-sm);color:var(--color-text-secondary);margin-bottom:1rem;">${result.overall_progress}</p>`;
  }

  // Concern Changes
  if (result.concern_changes && result.concern_changes.length > 0) {
    html += '<h4 style="font-size:var(--fs-base);font-weight:600;margin-bottom:0.5rem;">Concern Changes</h4>';
    html += '<div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1rem;">';
    result.concern_changes.forEach(cc => {
      const changeColors = { improved: 'badge-success', worsened: 'badge-error', stable: 'badge-neutral', resolved: 'badge-success', new: 'badge-warning' };
      html += `
        <div style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem;border:1px solid var(--color-border);border-radius:8px;">
          <span style="font-weight:600;font-size:var(--fs-sm);">${cc.concern}</span>
          <span class="badge ${changeColors[cc.change] || 'badge-neutral'}">${cc.change}</span>
          <span style="font-size:var(--fs-xs);color:var(--color-text-secondary);margin-left:auto;">${cc.detail || ''}</span>
        </div>`;
    });
    html += '</div>';
  }

  // Routine Adjustments
  if (result.routine_adjustments && result.routine_adjustments.length > 0) {
    html += '<h4 style="font-size:var(--fs-base);font-weight:600;margin-bottom:0.5rem;">Routine Adjustments</h4>';
    html += '<div style="display:flex;flex-direction:column;gap:0.5rem;">';
    result.routine_adjustments.forEach(adj => {
      const priorityColors = { high: 'badge-error', medium: 'badge-warning', low: 'badge-neutral' };
      html += `
        <div style="padding:0.75rem;border:1px solid var(--color-border);border-radius:8px;">
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem;">
            <span style="font-weight:600;font-size:var(--fs-sm);">${adj.category}</span>
            <span class="badge ${priorityColors[adj.priority] || 'badge-neutral'}" style="margin-left:auto;">${adj.priority}</span>
          </div>
          <div style="font-size:var(--fs-sm);color:var(--color-text);margin-bottom:0.25rem;">${adj.change}</div>
          <div style="font-size:var(--fs-xs);color:var(--color-text-secondary);">${adj.reason}</div>
        </div>`;
    });
    html += '</div>';
  }

  html += `</div>`;
  container.innerHTML = html;
}

/* ---- Feedback Page ---- */
export async function initUserFeedback() {
  const auth = await initDashboard('user', 'feedback');
  if (!auth) return;

  const form = document.getElementById('feedbackForm');
  if (form) {
    form.addEventListener('submit', (e) => handleFeedbackSubmit(e, auth.user.id));
  }

  await loadFeedbackHistory(auth.user.id);
}

async function handleFeedbackSubmit(event, userId) {
  event.preventDefault();
  const submitBtn = document.getElementById('submitFeedbackBtn');

  const improvementStatus = document.querySelector('input[name="improvement_status"]:checked');
  const ingredient = document.getElementById('fb_ingredient')?.value.trim() || '';
  const notes = document.getElementById('fb_notes')?.value.trim() || '';

  const feedback = {
    user_id: userId,
    improvement_status: improvementStatus ? improvementStatus.value : null,
    experienced_irritation: document.getElementById('fb_irritation')?.checked || false,
    experienced_redness: document.getElementById('fb_redness')?.checked || false,
    experienced_dryness: document.getElementById('fb_dryness')?.checked || false,
    experienced_burning: document.getElementById('fb_burning')?.checked || false,
    experienced_breakouts: document.getElementById('fb_breakouts')?.checked || false,
    ingredient_feedback: ingredient,
    notes: notes,
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting & updating routine...';

  try {
    const savedFeedback = await dataAPI.createFeedback(feedback);

    // Generate an updated routine version based on the new feedback
    try {
      const assessments = await dataAPI.getAssessments(userId);
      const latest = assessments[0];
      if (latest) {
        const profile = await dataAPI.getUserProfile(userId);
        const concerns = await dataAPI.getConcerns(latest.id);
        const allFeedback = await dataAPI.getFeedback(userId);
        const previousAssessments = assessments.slice(1);

        const result = await geminiAPI.generateRoutine(latest, profile, concerns, allFeedback, previousAssessments);

        // Save as a NEW routine version (insert, not update)
        await dataAPI.createRoutine({
          user_id: userId,
          assessment_id: latest.id,
          morning_routine: result.routine.morning_routine,
          evening_routine: result.routine.evening_routine,
          weekly_plan: result.routine.weekly_plan,
          seasonal_recommendations: result.routine.seasonal_recommendations,
          source: result.source,
          feedback_id: savedFeedback?.id || null,
        });
      }
    } catch (e) {
      // Routine update failure is non-fatal — feedback was still saved
    }

    showToast('Feedback submitted! Your routine has been updated and sent for dermatologist review.', 'success');
    event.target.reset();
    await loadFeedbackHistory(userId);
  } catch (err) {
    showToast('Unable to submit feedback. Please try again.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Feedback';
  }
}

async function loadFeedbackHistory(userId) {
  const container = document.getElementById('feedbackHistory');
  if (!container) return;

  try {
    const feedback = await dataAPI.getFeedback(userId);
    if (!feedback || feedback.length === 0) {
      container.innerHTML = '<p style="color:var(--color-text-tertiary);font-size:var(--fs-sm);">No feedback submitted yet.</p>';
      return;
    }

    container.innerHTML = '<h2 style="font-size:var(--fs-xl);font-weight:700;margin-bottom:1rem;">Previous Feedback</h2>';
    container.innerHTML += feedback.map(f => {
      const effects = [];
      if (f.experienced_irritation) effects.push('Irritation');
      if (f.experienced_redness) effects.push('Redness');
      if (f.experienced_dryness) effects.push('Dryness');
      if (f.experienced_burning) effects.push('Burning');
      if (f.experienced_breakouts) effects.push('Breakouts');

      const statusLabels = { improved: 'Skin Improved', no_change: 'No Change', worsened: 'Skin Worsened' };
      const statusColors = { improved: 'badge-success', no_change: 'badge-neutral', worsened: 'badge-error' };

      return `
        <div class="card" style="margin-bottom:0.75rem;">
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
            <span style="font-size:var(--fs-xs);color:var(--color-text-tertiary);">${formatDate(f.created_at)}</span>
            ${f.improvement_status ? `<span class="badge ${statusColors[f.improvement_status] || 'badge-neutral'}">${statusLabels[f.improvement_status] || f.improvement_status}</span>` : ''}
          </div>
          ${effects.length > 0 ? `<div style="font-size:var(--fs-sm);margin-bottom:0.25rem;"><strong>Effects:</strong> ${effects.join(', ')}</div>` : ''}
          ${f.ingredient_feedback ? `<div style="font-size:var(--fs-sm);margin-bottom:0.25rem;"><strong>Ingredient:</strong> ${f.ingredient_feedback}</div>` : ''}
          ${f.notes ? `<div style="font-size:var(--fs-sm);color:var(--color-text-secondary);">${f.notes}</div>` : ''}
        </div>`;
    }).join('');
  } catch (err) {
    container.innerHTML = '<p style="color:var(--color-text-tertiary);font-size:var(--fs-sm);">Unable to load feedback history.</p>';
  }
}

/* ---- Ingredient Intelligence Page ---- */
export async function initIngredientIntelligence() {
  const auth = await initDashboard('user', 'ingredients');
  if (!auth) return;

  const ingredients = await dataAPI.getIngredients();
  window.__currentUserId = auth.user.id;
  renderIngredientGrid(ingredients);

  // Search
  const searchInput = document.getElementById('ingredientSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      const filtered = ingredients.filter(i =>
        i.name.toLowerCase().includes(query) || i.category.toLowerCase().includes(query)
      );
      renderIngredientGrid(filtered);
    });
  }

  // Check URL for pre-selected ingredient
  const params = new URLSearchParams(window.location.search);
  const preselected = params.get('ingredient');
  if (preselected) {
    await showIngredientDetail(preselected, auth.user.id, ingredients);
  }

  // Interaction checker
  renderInteractionSelector(ingredients);

  const checkBtn = document.getElementById('checkInteractionsBtn');
  if (checkBtn) {
    checkBtn.addEventListener('click', () => handleInteractionCheck(auth.user.id));
  }
}

function renderIngredientGrid(ingredients) {
  const grid = document.getElementById('ingredientGrid');
  if (!grid) return;

  if (!ingredients || ingredients.length === 0) {
    grid.innerHTML = '<p style="color:var(--color-text-tertiary);font-size:var(--fs-sm);grid-column:1/-1;">No ingredients found.</p>';
    return;
  }

  grid.innerHTML = ingredients.map(ing => `
    <div class="card ingredient-card" data-name="${ing.name}" style="cursor:pointer;transition:all 0.2s;">
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
        <div style="width:36px;height:36px;border-radius:8px;background:var(--color-accent-soft);display:flex;align-items:center;justify-content:center;">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style="color:var(--color-accent-dark);"><path d="M8 3v5L4 16a1 1 0 001 1h10a1 1 0 001-1l-4-8V3M6 3h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div>
          <div style="font-weight:600;font-size:var(--fs-sm);">${ing.name}</div>
          <div style="font-size:var(--fs-xs);color:var(--color-text-tertiary);">${ing.category}</div>
        </div>
      </div>
      <p style="font-size:var(--fs-xs);color:var(--color-text-secondary);line-height:1.5;">${(ing.description || '').substring(0, 100)}${ing.description && ing.description.length > 100 ? '...' : ''}</p>
    </div>
  `).join('');

  grid.querySelectorAll('.ingredient-card').forEach(card => {
    card.addEventListener('click', () => {
      const name = card.dataset.name;
      const userId = window.__currentUserId;
      showIngredientDetail(name, userId, ingredients);
    });
  });
}

async function showIngredientDetail(name, userId, allIngredients) {
  const detailContainer = document.getElementById('ingredientDetail');
  if (!detailContainer) return;

  detailContainer.style.display = 'block';
  detailContainer.innerHTML = '<div class="card" style="text-align:center;padding:2rem;"><div class="spinner" style="margin:0 auto 1rem;"></div><p style="color:var(--color-text-secondary);">Analyzing ' + name + '...</p></div>';
  detailContainer.scrollIntoView({ behavior: 'smooth' });

  try {
    const ingredient = allIngredients.find(i => i.name === name) || await dataAPI.getIngredientByName(name);
    const profile = await dataAPI.getUserProfile(userId);
    const assessments = await dataAPI.getAssessments(userId);
    const latest = assessments[0] || null;
    const concerns = latest ? await dataAPI.getConcerns(latest.id) : [];
    const feedback = await dataAPI.getFeedback(userId);

    // Get routine ingredients from latest routine
    const latestRoutine = await dataAPI.getLatestRoutine(userId);
    const routineIngredients = extractRoutineIngredients(latestRoutine);

    const analysis = await geminiAPI.analyzeIngredient(name, profile, latest, concerns, feedback, routineIngredients);

    // Save analysis
    try {
      await dataAPI.createIngredientAnalysis({
        user_id: userId,
        ingredient_name: name,
        suitability: analysis.suitability,
        score: analysis.score,
        reason: analysis.reason,
        benefits_for_user: analysis.benefits_for_user,
        cautions_for_user: analysis.cautions_for_user,
        recommended_usage: analysis.recommended_usage,
        alternative_ingredients: analysis.alternative_ingredients,
        allergy_conflict: analysis.allergy_conflict || false,
        allergy_conflict_details: analysis.allergy_conflict_details || '',
        source: analysis.source || 'rule_based',
      });
    } catch (e) { /* save failure is non-fatal */ }

    renderIngredientDetail(detailContainer, ingredient, analysis);
  } catch (err) {
    detailContainer.innerHTML = `<div class="alert alert-error">Unable to analyze ${name}. ${err.message || ''}</div>`;
  }
}

function extractRoutineIngredients(routine) {
  if (!routine) return [];
  const ingredients = new Set();
  const allSteps = [
    ...(routine.morning_routine || []),
    ...(routine.evening_routine || []),
  ];
  allSteps.forEach(step => {
    if (step.ingredient) ingredients.add(step.ingredient);
  });
  return Array.from(ingredients);
}

function renderIngredientDetail(container, ingredient, analysis) {
  if (!container) return;

  const suitabilityLabels = {
    excellent_match: 'Excellent Match',
    good_match: 'Good Match',
    use_with_caution: 'Use with Caution',
    not_recommended: 'Not Recommended',
  };
  const suitabilityColors = {
    excellent_match: 'badge-success',
    good_match: 'badge-success',
    use_with_caution: 'badge-warning',
    not_recommended: 'badge-error',
  };
  const scoreColors = (score) => {
    if (score >= 80) return 'var(--color-success)';
    if (score >= 60) return 'var(--color-accent-dark)';
    if (score >= 40) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  let html = '<div class="card" style="margin-bottom:1rem;">';

  // Header
  html += `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">`;
  html += `<div><h2 style="font-size:var(--fs-2xl);font-weight:700;">${ingredient?.name || analysis.ingredient}</h2><div style="font-size:var(--fs-sm);color:var(--color-text-tertiary);">${ingredient?.category || ''}</div></div>`;
  html += `<div style="text-align:right;">`;
  html += `<div style="font-size:var(--fs-3xl);font-weight:800;color:${scoreColors(analysis.score)};">${analysis.score}</div>`;
  html += `<span class="badge ${suitabilityColors[analysis.suitability] || 'badge-neutral'}">${suitabilityLabels[analysis.suitability] || analysis.suitability}</span>`;
  html += `</div></div>`;

  // Allergy warning
  if (analysis.allergy_conflict) {
    html += `<div class="alert alert-error" style="margin-bottom:1rem;"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3l8 14H2L10 3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M10 9v3M10 14h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><span><strong>Allergy Conflict:</strong> ${analysis.allergy_conflict_details}</span></div>`;
  }

  // What it is
  if (ingredient?.description) {
    html += `<h4 style="font-size:var(--fs-base);font-weight:600;margin-bottom:0.5rem;">What is it?</h4><p style="font-size:var(--fs-sm);color:var(--color-text-secondary);margin-bottom:1rem;">${ingredient.description}</p>`;
  }

  // Benefits
  if (ingredient?.benefits && ingredient.benefits.length > 0) {
    html += '<h4 style="font-size:var(--fs-base);font-weight:600;margin-bottom:0.5rem;">Potential Benefits</h4><ul style="margin-bottom:1rem;padding-left:1.25rem;">';
    ingredient.benefits.forEach(b => { html += `<li style="font-size:var(--fs-sm);color:var(--color-text-secondary);margin-bottom:0.25rem;">${b}</li>`; });
    html += '</ul>';
  }

  // Suitable for
  if (ingredient?.suitable_skin_types && ingredient.suitable_skin_types.length > 0) {
    html += '<h4 style="font-size:var(--fs-base);font-weight:600;margin-bottom:0.5rem;">Suitable For</h4><div style="display:flex;flex-wrap:wrap;gap:0.375rem;margin-bottom:1rem;">';
    ingredient.suitable_skin_types.forEach(t => { html += `<span class="badge badge-neutral">${t}</span>`; });
    html += '</div>';
  }

  // Cautions
  if (ingredient?.cautions && ingredient.cautions.length > 0) {
    html += '<h4 style="font-size:var(--fs-base);font-weight:600;margin-bottom:0.5rem;">General Cautions</h4><ul style="margin-bottom:1rem;padding-left:1.25rem;">';
    ingredient.cautions.forEach(c => { html += `<li style="font-size:var(--fs-sm);color:var(--color-text-secondary);margin-bottom:0.25rem;">${c}</li>`; });
    html += '</ul>';
  }

  // Personalized section
  html += '<div style="border-top:1px solid var(--color-border);padding-top:1rem;margin-top:1rem;">';
  html += '<h4 style="font-size:var(--fs-lg);font-weight:700;margin-bottom:0.75rem;">Your Personalized Analysis</h4>';

  // Source badge
  html += `<div style="margin-bottom:0.75rem;"><span class="badge ${analysis.source === 'gemini' ? 'badge-info' : 'badge-neutral'}">${analysis.source === 'gemini' ? 'AI-Enhanced (Gemini)' : 'Rule-Based Analysis'}</span></div>`;

  // Reason
  html += `<p style="font-size:var(--fs-sm);color:var(--color-text);margin-bottom:1rem;">${analysis.reason}</p>`;

  // Benefits for user
  if (analysis.benefits_for_user && analysis.benefits_for_user.length > 0) {
    html += '<div style="font-weight:600;font-size:var(--fs-sm);margin-bottom:0.375rem;color:var(--color-success);">Benefits for You</div><ul style="margin-bottom:1rem;padding-left:1.25rem;">';
    analysis.benefits_for_user.forEach(b => { html += `<li style="font-size:var(--fs-sm);color:var(--color-text-secondary);margin-bottom:0.25rem;">${b}</li>`; });
    html += '</ul>';
  }

  // Cautions for user
  if (analysis.cautions_for_user && analysis.cautions_for_user.length > 0) {
    html += '<div style="font-weight:600;font-size:var(--fs-sm);margin-bottom:0.375rem;color:var(--color-warning);">Cautions for You</div><ul style="margin-bottom:1rem;padding-left:1.25rem;">';
    analysis.cautions_for_user.forEach(c => { html += `<li style="font-size:var(--fs-sm);color:var(--color-text-secondary);margin-bottom:0.25rem;">${c}</li>`; });
    html += '</ul>';
  }

  // Recommended usage
  if (analysis.recommended_usage) {
    html += `<div style="font-weight:600;font-size:var(--fs-sm);margin-bottom:0.375rem;">Recommended Usage</div><p style="font-size:var(--fs-sm);color:var(--color-text-secondary);margin-bottom:1rem;padding:0.5rem;background:var(--color-surface-alt);border-radius:8px;">${analysis.recommended_usage}</p>`;
  }

  // Alternatives
  if (analysis.alternative_ingredients && analysis.alternative_ingredients.length > 0) {
    html += '<div style="font-weight:600;font-size:var(--fs-sm);margin-bottom:0.375rem;">Alternative Ingredients</div><div style="display:flex;flex-wrap:wrap;gap:0.375rem;margin-bottom:1rem;">';
    analysis.alternative_ingredients.forEach(a => { html += `<span class="badge badge-info">${a}</span>`; });
    html += '</div>';
  }

  // Allergy status
  html += `<div style="padding:0.5rem;border-radius:8px;background:${analysis.allergy_conflict ? 'var(--color-error-soft)' : 'var(--color-success-soft)'};font-size:var(--fs-sm);color:${analysis.allergy_conflict ? 'var(--color-error)' : 'var(--color-success)'};font-weight:600;">`;
  html += analysis.allergy_conflict ? 'Allergy Conflict Detected' : 'No Recorded Allergy Conflict';
  html += '</div>';

  html += '</div>';

  // Education
  if (ingredient?.education) {
    html += `<div style="border-top:1px solid var(--color-border);padding-top:1rem;margin-top:1rem;"><h4 style="font-size:var(--fs-base);font-weight:600;margin-bottom:0.5rem;">Education</h4><p style="font-size:var(--fs-sm);color:var(--color-text-secondary);">${ingredient.education}</p></div>`;
  }

  html += '</div>';
  container.innerHTML = html;
}

/* ---- Interaction Checker ---- */
let selectedInteractionIngredients = [];

function renderInteractionSelector(ingredients) {
  const container = document.getElementById('interactionSelector');
  if (!container) return;

  container.innerHTML = '<div style="display:flex;flex-wrap:wrap;gap:0.375rem;">' +
    ingredients.map(ing => `
      <label style="display:inline-flex;align-items:center;gap:0.375rem;padding:0.375rem 0.75rem;border:1px solid var(--color-border);border-radius:var(--radius-full);font-size:var(--fs-sm);cursor:pointer;transition:all 0.2s;" class="interaction-option">
        <input type="checkbox" value="${ing.name}" style="display:none;" />
        <span>${ing.name}</span>
      </label>
    `).join('') + '</div>';

  container.querySelectorAll('.interaction-option').forEach(label => {
    const checkbox = label.querySelector('input');
    label.addEventListener('click', (e) => {
      e.preventDefault();
      checkbox.checked = !checkbox.checked;
      if (checkbox.checked) {
        label.style.background = 'var(--color-accent-soft)';
        label.style.borderColor = 'var(--color-accent)';
        label.style.color = 'var(--color-accent-dark)';
        selectedInteractionIngredients.push(checkbox.value);
      } else {
        label.style.background = '';
        label.style.borderColor = '';
        label.style.color = '';
        selectedInteractionIngredients = selectedInteractionIngredients.filter(i => i !== checkbox.value);
      }
    });
  });
}

async function handleInteractionCheck(userId) {
  const resultsContainer = document.getElementById('interactionResults');
  const checkBtn = document.getElementById('checkInteractionsBtn');
  if (!resultsContainer) return;

  if (selectedInteractionIngredients.length < 2) {
    showToast('Select at least 2 ingredients to check interactions.', 'warning');
    return;
  }

  checkBtn.disabled = true;
  checkBtn.textContent = 'Checking...';
  resultsContainer.innerHTML = '<div class="spinner" style="margin:0 auto 1rem;"></div><p style="color:var(--color-text-secondary);text-align:center;">Analyzing interactions...</p>';

  try {
    const profile = await dataAPI.getUserProfile(userId);
    const feedback = await dataAPI.getFeedback(userId);
    const result = await geminiAPI.analyzeInteractions(selectedInteractionIngredients, profile, feedback);

    renderInteractionResults(resultsContainer, result);
  } catch (err) {
    resultsContainer.innerHTML = '<div class="alert alert-error">Unable to check interactions. Please try again.</div>';
  } finally {
    checkBtn.disabled = false;
    checkBtn.textContent = 'Check Interactions';
  }
}

function renderInteractionResults(container, result) {
  const riskColors = { low: 'badge-success', moderate: 'badge-warning', high: 'badge-error' };
  const riskLabels = { low: 'Low Risk', moderate: 'Moderate Risk', high: 'High Risk' };

  let html = `<div class="card">`;
  html += `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">`;
  html += `<h4 style="font-size:var(--fs-lg);font-weight:700;">Interaction Analysis</h4>`;
  html += `<span class="badge ${riskColors[result.overall_risk] || 'badge-neutral'}" style="font-size:var(--fs-sm);">${riskLabels[result.overall_risk] || result.overall_risk}</span>`;
  html += `</div>`;

  // Ingredients
  html += '<div style="display:flex;flex-wrap:wrap;gap:0.375rem;margin-bottom:1rem;">';
  (result.ingredients || []).forEach(ing => {
    html += `<span class="badge badge-info">${ing}</span>`;
  });
  html += '</div>';

  // Interactions
  if (result.interactions && result.interactions.length > 0) {
    html += '<div style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:1rem;">';
    result.interactions.forEach(i => {
      html += `
        <div style="padding:0.75rem;border:1px solid var(--color-border);border-radius:8px;">
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem;">
            <span style="font-weight:600;font-size:var(--fs-sm);">${i.ingredient_a} + ${i.ingredient_b}</span>
            <span class="badge ${riskColors[i.risk_level] || 'badge-neutral'}" style="margin-left:auto;">${i.risk_level}</span>
          </div>
          <p style="font-size:var(--fs-sm);color:var(--color-text-secondary);margin-bottom:0.375rem;">${i.description}</p>
          ${i.recommended_schedule ? `<div style="font-size:var(--fs-xs);padding:0.375rem 0.5rem;background:var(--color-surface-alt);border-radius:6px;color:var(--color-text-secondary);"><strong>Schedule:</strong> ${i.recommended_schedule}</div>` : ''}
        </div>`;
    });
    html += '</div>';
  } else {
    html += '<p style="font-size:var(--fs-sm);color:var(--color-text-secondary);margin-bottom:1rem;">No known interactions between these ingredients.</p>';
  }

  // Recommended schedule
  if (result.recommended_schedule) {
    html += `<div style="padding:0.75rem;background:var(--color-surface-alt);border-radius:8px;margin-bottom:0.75rem;"><div style="font-weight:600;font-size:var(--fs-sm);margin-bottom:0.25rem;">Recommended Schedule</div><p style="font-size:var(--fs-sm);color:var(--color-text-secondary);">${result.recommended_schedule}</p></div>`;
  }

  // User-specific warning
  if (result.user_specific_warning) {
    html += `<div class="alert alert-warning" style="margin-bottom:0.5rem;"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3l8 14H2L10 3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M10 9v3M10 14h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><span>${result.user_specific_warning}</span></div>`;
  }

  html += '</div>';
  container.innerHTML = html;
}
