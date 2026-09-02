/* ==================== GLOWSENSE AI — MODULE 6: PRODUCT RECOMMENDATION ENGINE ==================== */
/* Full product catalog browsing with transparent suitability scoring,
   category + budget filters, alternative-product suggestions for any
   allergy/ingredient conflicts, and a multi-product comparison view.
   This is additive to the existing AI-generated recommendations already
   rendered by initUserRecommendations() in user.js — it does not replace
   or duplicate that flow. */

import { dataAPI, authAPI, productIntelligence } from './api.js';
import { showToast } from './common.js';

const CATEGORIES = ['All', 'Face Wash', 'Moisturizer', 'Sunscreen', 'Serum', 'Toner', 'Treatment', 'Face Mask'];
const BUDGET_RANGES = [
  { key: 'all', label: 'All Budgets', test: () => true },
  { key: 'under500', label: 'Under ₹500', test: (p) => p < 500 },
  { key: '500to1000', label: '₹500 – ₹1,000', test: (p) => p >= 500 && p <= 1000 },
  { key: '1000to2000', label: '₹1,000 – ₹2,000', test: (p) => p > 1000 && p <= 2000 },
  { key: 'premium', label: 'Premium (₹2,000+)', test: (p) => p > 2000 },
];
const MAX_COMPARE = 4;

let state = {
  products: [],
  context: {},
  organized: null,
  activeCategory: 'All',
  activeBudget: 'all',
  compareIds: new Set(),
};

export async function initProductCatalog() {
  const root = document.getElementById('productCatalogRoot');
  if (!root) return; // page doesn't include the catalog section

  const auth = await authAPI.getCurrentUser();
  if (!auth) return;

  try {
    const profile = await dataAPI.getUserProfile(auth.user.id);
    const assessments = await dataAPI.getAssessments(auth.user.id);
    const latest = assessments && assessments[0];
    const concerns = latest ? await dataAPI.getConcerns(latest.id) : [];
    const feedback = await dataAPI.getFeedback(auth.user.id);
    const products = await dataAPI.getProducts();

    state.products = products || [];
    state.context = productIntelligence.buildContext(profile, concerns, feedback);
    state.organized = productIntelligence.organizeCatalog(state.products, state.context);

    renderShell(root);
    renderCategoryFilters();
    renderBudgetFilters();
    renderCatalog();
    renderBudgetPicks();
    renderAlternatives();
    wireEvents(root);
  } catch (err) {
    root.innerHTML = `<p style="color:var(--color-text-secondary);font-size:var(--fs-sm);">Unable to load the product catalog right now.</p>`;
  }
}

function renderShell(root) {
  root.innerHTML = `
    <div class="pr-section">
      <h2 class="pr-section-title">Product Catalog</h2>
      <p class="pr-section-subtitle">Every product scored transparently against your skin type, concerns, and allergies.</p>
      <div id="prCategoryFilters" class="chip-row"></div>
      <div id="prCatalogGrid" class="catalog-grid"></div>
    </div>

    <div class="pr-section">
      <h2 class="pr-section-title">Budget-Friendly Picks</h2>
      <p class="pr-section-subtitle">Well-suited products filtered by your budget.</p>
      <div id="prBudgetFilters" class="chip-row"></div>
      <div id="prBudgetRow" class="scroll-row"></div>
    </div>

    <div class="pr-section" id="prAlternativesSection" style="display:none;">
      <h2 class="pr-section-title">Alternative Products for You</h2>
      <p class="pr-section-subtitle">Safer picks in place of items that conflict with your allergies or sensitivities.</p>
      <div id="prAlternativesRow" class="scroll-row"></div>
    </div>

    <div class="compare-bar" id="compareBar">
      <span id="compareCount">0 selected</span>
      <button type="button" data-compare-open>Compare</button>
      <span class="compare-clear" data-compare-clear>Clear</span>
    </div>

    <div class="modal-overlay" id="compareModalOverlay">
      <div class="modal" style="max-width:900px;">
        <div class="modal-header">
          <div class="modal-title">Product Comparison</div>
          <button class="modal-close" data-compare-close>&times;</button>
        </div>
        <div class="modal-body">
          <div class="compare-table-wrap" id="compareTableWrap"></div>
        </div>
      </div>
    </div>
  `;
}

/* ---- Filters ---- */
function renderCategoryFilters() {
  const el = document.getElementById('prCategoryFilters');
  el.innerHTML = CATEGORIES.map(cat => `
    <button type="button" class="chip ${state.activeCategory === cat ? 'active' : ''}" data-category-chip="${cat}">${cat === 'Face Mask' ? 'Face Masks' : cat === 'Treatment' ? 'Treatment Products' : cat}</button>
  `).join('');
}

function renderBudgetFilters() {
  const el = document.getElementById('prBudgetFilters');
  el.innerHTML = BUDGET_RANGES.map(b => `
    <button type="button" class="chip ${state.activeBudget === b.key ? 'active' : ''}" data-budget-chip="${b.key}">${b.label}</button>
  `).join('');
}

/* ---- Main catalog grid ---- */
function renderCatalog() {
  const grid = document.getElementById('prCatalogGrid');
  const entries = state.organized.scored.filter(e => state.activeCategory === 'All' || e.product.category === state.activeCategory);

  if (entries.length === 0) {
    grid.innerHTML = `<p style="color:var(--color-text-secondary);font-size:var(--fs-sm);grid-column:1/-1;">No products found in this category yet.</p>`;
    return;
  }

  // Non-conflicting first, sorted by score, so unsafe items don't lead.
  const sorted = [...entries].sort((a, b) => (a.result.conflict === b.result.conflict ? b.result.score - a.result.score : a.result.conflict ? 1 : -1));
  grid.innerHTML = sorted.map(e => renderProductCard(e.product, e.result)).join('');
}

/* ---- Budget-Friendly Picks ---- */
function renderBudgetPicks() {
  const row = document.getElementById('prBudgetRow');
  const range = BUDGET_RANGES.find(b => b.key === state.activeBudget) || BUDGET_RANGES[0];

  const picks = state.organized.scored
    .filter(e => typeof e.product.price_numeric === 'number' && range.test(e.product.price_numeric) && !e.result.allergyConflict)
    .sort((a, b) => b.result.score - a.result.score)
    .slice(0, 12);

  if (picks.length === 0) {
    row.innerHTML = `<p style="color:var(--color-text-secondary);font-size:var(--fs-sm);">No products found in this price range.</p>`;
    return;
  }
  row.innerHTML = picks.map(e => renderProductCard(e.product, e.result)).join('');
}

/* ---- Alternative Products for You ---- */
function renderAlternatives() {
  const section = document.getElementById('prAlternativesSection');
  const row = document.getElementById('prAlternativesRow');
  const alts = state.organized.alternatives;

  if (!alts || alts.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  row.innerHTML = alts.map(({ for: original, alternative }) => `
    <div class="pr-card" style="flex:0 0 260px;">
      <div class="pr-card-body">
        <span class="badge badge-error" style="align-self:flex-start;font-size:10px;">Not Recommended</span>
        <div class="pr-card-name" style="text-decoration:line-through;color:var(--color-text-tertiary);">${escapeHtml(original.name)}</div>
        <div class="pr-reason">${escapeHtml(alternative.result.reasons[0] || 'A conflict was detected with your profile.')}</div>
        <div style="border-top:1px dashed var(--color-border);margin:0.4rem 0;"></div>
        <span class="badge badge-success" style="align-self:flex-start;font-size:10px;">Suggested Instead</span>
        ${renderCardInner(alternative.product, alternative.result, { compact: true })}
      </div>
    </div>
  `).join('');
}

/* ---- Card rendering ---- */
function renderProductCard(product, result) {
  return `<div class="pr-card">${renderCardInner(product, result)}</div>`;
}

function renderCardInner(product, result, opts = {}) {
  const inCompare = state.compareIds.has(product.id);
  const imgSrc = product.image_url || '';
  const labelText = {
    excellent_match: 'Excellent Match',
    good_match: 'Good Match',
    use_with_caution: 'Use with Caution',
    not_recommended: 'Not Recommended',
  }[result.label] || 'Informational';

  const imgHtml = imgSrc
    ? `<img src="${imgSrc}" alt="${escapeHtml(product.name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><div style="display:none;width:100%;height:100%;align-items:center;justify-content:center;background:var(--color-surface-alt);"><svg width="28" height="28" viewBox="0 0 36 36" fill="none" style="color:var(--color-text-tertiary);"><path d="M18 6l3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></div>`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--color-surface-alt);"><svg width="28" height="28" viewBox="0 0 36 36" fill="none" style="color:var(--color-text-tertiary);"><path d="M18 6l3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></div>`;

  const ratingHtml = product.rating
    ? `<div class="pr-rating">★ ${Number(product.rating).toFixed(1)}</div>`
    : '';

  const ingredientsHtml = (product.key_ingredients || []).length
    ? `<div style="display:flex;flex-wrap:wrap;gap:0.2rem;">${(product.key_ingredients || []).slice(0, 3).map(i => `<span class="badge badge-neutral" style="font-size:10px;">${escapeHtml(i)}</span>`).join('')}</div>`
    : '';

  const amazon = product.amazon_url;
  const nykaa = product.nykaa_url;
  const fallbackSearch = `https://www.google.com/search?q=${encodeURIComponent((product.brand || '') + ' ' + product.name)}`;

  let buyButtons;
  if (amazon && nykaa) {
    buyButtons = `<a href="${amazon}" target="_blank" rel="noopener noreferrer" class="pr-btn pr-btn-primary">Amazon</a><a href="${nykaa}" target="_blank" rel="noopener noreferrer" class="pr-btn">Nykaa</a>`;
  } else if (amazon) {
    buyButtons = `<a href="${amazon}" target="_blank" rel="noopener noreferrer" class="pr-btn pr-btn-primary">Buy on Amazon</a>`;
  } else if (nykaa) {
    buyButtons = `<a href="${nykaa}" target="_blank" rel="noopener noreferrer" class="pr-btn pr-btn-primary">Buy on Nykaa</a>`;
  } else {
    buyButtons = `<a href="${fallbackSearch}" target="_blank" rel="noopener noreferrer" class="pr-btn">View Product</a>`;
  }

  const compareBtn = opts.compact ? '' : `<button type="button" class="pr-btn ${inCompare ? 'compare-active' : ''}" data-compare-btn="${product.id}">${inCompare ? '✓ Added' : 'Add to Compare'}</button>`;

  return `
    ${opts.compact ? '' : `<div class="pr-card-img">${imgHtml}${(product.tags || []).includes('bestseller') ? '<span class="badge badge-warning" style="position:absolute;top:0.375rem;right:0.375rem;font-size:10px;">Bestseller</span>' : ''}</div>`}
    <div class="pr-card-body">
      <span class="suitability-badge suitability-${result.label}">${result.score}% Suitable · ${labelText}</span>
      <div class="pr-card-name">${escapeHtml(product.name)}</div>
      <div class="pr-card-brand">${escapeHtml(product.brand || '')} · ${escapeHtml(product.category || '')}</div>
      ${ratingHtml}
      ${ingredientsHtml}
      <div class="pr-reason">${escapeHtml(result.reasons[0] || '')}</div>
      ${product.price_range ? `<div class="pr-card-price">${escapeHtml(product.price_range)}</div>` : ''}
      <div class="pr-card-actions">
        ${buyButtons}
        ${compareBtn}
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---- Events ---- */
function wireEvents(root) {
  root.addEventListener('click', (e) => {
    const catBtn = e.target.closest('[data-category-chip]');
    if (catBtn) {
      state.activeCategory = catBtn.getAttribute('data-category-chip');
      renderCategoryFilters();
      renderCatalog();
      return;
    }

    const budgetBtn = e.target.closest('[data-budget-chip]');
    if (budgetBtn) {
      state.activeBudget = budgetBtn.getAttribute('data-budget-chip');
      renderBudgetFilters();
      renderBudgetPicks();
      return;
    }

    const compareBtn = e.target.closest('[data-compare-btn]');
    if (compareBtn) {
      const id = compareBtn.getAttribute('data-compare-btn');
      toggleCompare(id);
      return;
    }

    const clearBtn = e.target.closest('[data-compare-clear]');
    if (clearBtn) {
      state.compareIds.clear();
      refreshCompareUI();
      return;
    }

    const openBtn = e.target.closest('[data-compare-open]');
    if (openBtn) {
      openCompareModal();
      return;
    }

    const closeBtn = e.target.closest('[data-compare-close]');
    if (closeBtn) {
      document.getElementById('compareModalOverlay').classList.remove('active');
      return;
    }

    if (e.target.id === 'compareModalOverlay') {
      e.target.classList.remove('active');
    }
  });
}

function toggleCompare(id) {
  if (state.compareIds.has(id)) {
    state.compareIds.delete(id);
  } else {
    if (state.compareIds.size >= MAX_COMPARE) {
      showToast(`You can compare up to ${MAX_COMPARE} products at a time.`, 'info');
      return;
    }
    state.compareIds.add(id);
  }
  refreshCompareUI();
}

function refreshCompareUI() {
  renderCatalog();
  renderBudgetPicks();
  const bar = document.getElementById('compareBar');
  const count = document.getElementById('compareCount');
  count.textContent = `${state.compareIds.size} selected`;
  bar.classList.toggle('visible', state.compareIds.size >= 2);
}

/* ---- Comparison modal ---- */
function openCompareModal() {
  const wrap = document.getElementById('compareTableWrap');
  const selected = state.organized.scored.filter(e => state.compareIds.has(e.product.id));
  if (selected.length < 2) {
    showToast('Select at least 2 products to compare.', 'info');
    return;
  }

  const bestId = selected.reduce((best, e) => (e.result.score > best.result.score ? e : best), selected[0]).product.id;

  const rows = [
    { label: 'Product', get: e => escapeHtml(e.product.name) },
    { label: 'Brand', get: e => escapeHtml(e.product.brand || '—') },
    { label: 'Category', get: e => escapeHtml(e.product.category || '—') },
    { label: 'Price', get: e => escapeHtml(e.product.price_range || '—') },
    { label: 'Suitability', get: e => `${e.result.score}% (${e.result.label.replace(/_/g, ' ')})` },
    { label: 'Key Ingredients', get: e => escapeHtml((e.product.key_ingredients || []).join(', ') || '—') },
    { label: 'Skin Types', get: e => escapeHtml((e.product.suitable_skin_types || []).join(', ') || '—') },
    { label: 'Benefits', get: e => escapeHtml((e.product.benefits || []).join(', ') || '—') },
    { label: 'Potential Concerns', get: e => escapeHtml((e.product.allergens || []).join(', ') || 'None known') },
    { label: 'Rating', get: e => e.product.rating ? `★ ${Number(e.product.rating).toFixed(1)}` : 'Not rated' },
    { label: 'Purchase', get: e => e.product.amazon_url ? `<a href="${e.product.amazon_url}" target="_blank" rel="noopener noreferrer">Amazon</a>` : (e.product.nykaa_url ? `<a href="${e.product.nykaa_url}" target="_blank" rel="noopener noreferrer">Nykaa</a>` : '—') },
  ];

  wrap.innerHTML = `
    <table class="compare-table">
      <thead>
        <tr>
          <th class="attr-col">Attribute</th>
          ${selected.map(e => `<th>${escapeHtml(e.product.name)}${e.product.id === bestId ? '<div class="best-match-tag">Best match for your profile</div>' : ''}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td class="attr-col">${r.label}</td>
            ${selected.map(e => `<td class="${e.product.id === bestId ? 'best-col' : ''}">${r.get(e)}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
    <p style="font-size:var(--fs-xs);color:var(--color-text-secondary);margin-top:0.75rem;">
      "Best match" reflects how well a product fits your recorded skin type, concerns, and allergies — it is not a claim of medical or clinical superiority.
    </p>
  `;

  document.getElementById('compareModalOverlay').classList.add('active');
}
