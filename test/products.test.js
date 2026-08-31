/**
 * Automated Test Suite for PanaceaAI Product Recommendations & Explorer
 * Uses Node.js native test runner (node:test)
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MASTER_PRODUCT_CATALOG,
  MOCK_USER_DATA,
  calculateProductSuitability,
  filterProductCatalog,
  generateProductComparison,
  getAlternativeProductsFor
} from '../js/mockData.js';

import {
  renderProductsExplorerPage,
  renderComparisonMatrix,
  renderAlternativesContent,
  renderSuitabilityBreakdown,
  renderUserDashboard
} from '../js/dashboards.js';

test('1. Master Product Catalog Integrity Test', () => {
  assert.ok(MASTER_PRODUCT_CATALOG.length >= 15, 'Master catalog should have extensive products loaded');
  
  for (const prod of MASTER_PRODUCT_CATALOG) {
    assert.ok(prod.id, `Product ${prod.name} must have an ID`);
    assert.ok(prod.name, 'Product must have a name');
    assert.ok(prod.brand, 'Product must have a brand');
    assert.ok(prod.category, 'Product must have a category');
    assert.ok(prod.price > 0, `Product ${prod.name} must have a positive price`);
    assert.ok(prod.mrp >= prod.price, `Product ${prod.name} MRP must be >= selling price`);
    assert.ok(prod.budget_tier, 'Product must have a budget tier');
    assert.ok(prod.rating >= 4.0 && prod.rating <= 5.0, 'Rating must be between 4.0 and 5.0');
    assert.ok(prod.key_active_ingredients.length > 0, 'Must have active ingredients');
    assert.ok(prod.e_commerce_links, 'Must have e-commerce links');
    assert.ok(prod.e_commerce_links.amazon, 'Must have Amazon buy link');
    assert.ok(prod.e_commerce_links.nykaa, 'Must have Nykaa buy link');
    assert.ok(prod.e_commerce_links.flipkart, 'Must have Flipkart buy link');
  }
});

test('2. Product Suitability Scoring Algorithm Test', () => {
  const profile = {
    skinType: 'Combination',
    primaryConcerns: ['Acne & Breakouts', 'Post-Inflammatory Hyperpigmentation'],
    allergies: ['Fragrance (Parfum)'],
    sensitivities: ['Alcohol Denat']
  };

  // Minimalist Niacinamide: Combination match + Acne concern match + Non-comedogenic + No Fragrance -> High Score (>=90%)
  const niacinamide = MASTER_PRODUCT_CATALOG.find(p => p.id === 101);
  const nScore = calculateProductSuitability(niacinamide, profile);
  assert.ok(nScore.score >= 90, `Niacinamide suitability score should be >= 90% (got ${nScore.score})`);
  assert.equal(nScore.badge, 'Top Match 🌟');
  assert.equal(nScore.flaggedAllergens.length, 0, 'No allergens should be flagged');

  // Test Allergen Detection Penalty
  const allergenProduct = {
    name: 'Allergen Test Cream',
    category: 'Moisturizer',
    suitable_skin_types: ['Combination'],
    target_concerns: ['Acne & Breakouts'],
    comedogenic_level: 0,
    full_ingredient_list: ['Water', 'Glycerin', 'Fragrance (Parfum)', 'Ceramides']
  };
  const algScore = calculateProductSuitability(allergenProduct, profile);
  assert.ok(algScore.score <= 50, `Allergen product must receive heavy penalty (got ${algScore.score})`);
  assert.equal(algScore.badge, '⚠️ Allergen Warning');
  assert.ok(algScore.flaggedAllergens.length > 0, 'Fragrance must be flagged');
});

test('3. Side-by-Side Product Comparison Engine Test', () => {
  const productIds = [101, 102, 103];
  const comparison = generateProductComparison(productIds, MOCK_USER_DATA.profile);

  assert.equal(comparison.success, true, 'Comparison must succeed');
  assert.equal(comparison.count, 3, 'Must compare 3 products');
  assert.ok(comparison.winner, 'Must recommend an AI Winner');
  assert.ok(comparison.winner.name, 'Winner must have a name');
  assert.ok(comparison.winner.score >= 90, 'Winner score must be high');
  assert.equal(comparison.matrix.length, 3, 'Matrix must have 3 products');
  assert.ok(comparison.matrix[0].keyActives, 'Matrix must contain key actives');
});

test('4. Budget Dupes & Alternative Product Suggestions Test', () => {
  // Find alternatives for Paula's Choice 2% BHA (id: 502, Price: ₹1200)
  const altRes = getAlternativeProductsFor(502, MOCK_USER_DATA.profile);
  assert.equal(altRes.success, true, 'Must find alternatives');
  assert.ok(altRes.budgetDupes.length > 0, 'Must provide budget dupes');
  
  // All budget dupes must have a lower price than original
  for (const dupe of altRes.budgetDupes) {
    assert.ok(dupe.price < 1200, `Budget dupe ${dupe.name} (₹${dupe.price}) must be cheaper than ₹1200`);
  }

  // Safer fragrance-free picks
  for (const pick of altRes.saferPicks) {
    assert.equal(pick.fragrance_free, true, 'Safer pick must be fragrance-free');
  }
});

test('5. Multi-Criteria Search, Filter & Sort Test', () => {
  // Test Search by Ingredient
  const searchNiacinamide = filterProductCatalog({ query: 'Niacinamide' }, MOCK_USER_DATA.profile);
  assert.ok(searchNiacinamide.length > 0, 'Search by active ingredient must return products');
  assert.ok(searchNiacinamide.some(p => p.name.includes('Niacinamide')), 'Result must include Niacinamide product');

  // Test Category Filter
  const sunscreens = filterProductCatalog({ category: 'Sunscreen' }, MOCK_USER_DATA.profile);
  assert.ok(sunscreens.length > 0, 'Must filter sunscreens');
  for (const s of sunscreens) {
    assert.equal(s.category, 'Sunscreen', 'All results must be sunscreens');
  }

  // Test Budget Filter (Under ₹600)
  const budgetTier = filterProductCatalog({ budget_tier: 'Budget' }, MOCK_USER_DATA.profile);
  assert.ok(budgetTier.length > 0, 'Must find budget products');
  for (const b of budgetTier) {
    assert.equal(b.budget_tier, 'Budget', 'All results must be budget tier');
    assert.ok(b.price <= 600, 'Price must be <= ₹600');
  }

  // Test Price Range Filter (min ₹400, max ₹800)
  const priceRange = filterProductCatalog({ min_price: 400, max_price: 800 }, MOCK_USER_DATA.profile);
  for (const pr of priceRange) {
    assert.ok(pr.price >= 400 && pr.price <= 800, `Price ₹${pr.price} must be within ₹400-₹800`);
  }

  // Test Price Sorting: Low to High
  const sortedAsc = filterProductCatalog({ sort_by: 'price_asc' }, MOCK_USER_DATA.profile);
  for (let i = 0; i < sortedAsc.length - 1; i++) {
    assert.ok(sortedAsc[i].price <= sortedAsc[i + 1].price, 'Price must be ascending');
  }

  // Test Price Sorting: High to Low
  const sortedDesc = filterProductCatalog({ sort_by: 'price_desc' }, MOCK_USER_DATA.profile);
  for (let i = 0; i < sortedDesc.length - 1; i++) {
    assert.ok(sortedDesc[i].price >= sortedDesc[i + 1].price, 'Price must be descending');
  }
});

test('6. Products Explorer Page HTML Renderer Test', () => {
  const html = renderProductsExplorerPage({}, MOCK_USER_DATA.profile);
  assert.ok(html.includes('Personalized Product Recommendations'), 'Must include hero title');
  assert.ok(html.includes('Active Skin Profile'), 'Must display active skin profile');
  assert.ok(html.includes('Budget Range'), 'Must include budget filter');
  assert.ok(html.includes('Amazon ↗'), 'Must render Amazon buy button');
  assert.ok(html.includes('Nykaa ↗'), 'Must render Nykaa buy button');
  assert.ok(html.includes('Flipkart ↗'), 'Must render Flipkart buy button');
  assert.ok(html.includes('Compare'), 'Must render compare action');
  assert.ok(html.includes('Dupes'), 'Must render dupes action');
});

test('7. Side-by-Side Comparison Matrix Modal HTML Renderer Test', () => {
  const comparison = generateProductComparison([101, 102], MOCK_USER_DATA.profile);
  const html = renderComparisonMatrix(comparison);
  assert.ok(html.includes('AI Recommendation Winner'), 'Must render winner banner');
  assert.ok(html.includes('AI Match Compatibility'), 'Must compare suitability');
  assert.ok(html.includes('Key Active Ingredients'), 'Must compare active ingredients');
  assert.ok(html.includes('Buy on Amazon ↗'), 'Must include direct purchase links');
});

test('8. Alternative Dupes Modal HTML Renderer Test', () => {
  const alts = getAlternativeProductsFor(102, MOCK_USER_DATA.profile);
  const html = renderAlternativesContent(alts);
  assert.ok(html.includes('Original Target Product'), 'Must display original product header');
  assert.ok(html.includes('Affordable Budget Dupes'), 'Must include budget dupes section');
  assert.ok(html.includes('Sensitive & Fragrance-Free Safer Picks'), 'Must include safer picks section');
});

test('9. Score Breakdown Modal HTML Renderer Test', () => {
  const prod = MASTER_PRODUCT_CATALOG[0];
  const suitability = calculateProductSuitability(prod, MOCK_USER_DATA.profile);
  const html = renderSuitabilityBreakdown({ product: prod, suitability });
  assert.ok(html.includes('Score Calculation Factors'), 'Must render score breakdown factors');
  assert.ok(html.includes('AI Verdict'), 'Must render AI verdict');
});

test('10. User Dashboard Explore Products CTA Button Test', () => {
  const html = renderUserDashboard(MOCK_USER_DATA);
  assert.ok(html.includes('Explore All Products'), 'Dashboard must contain Explore All Products CTA');
  assert.ok(html.includes('AI Matched Skincare Products'), 'Dashboard must contain AI matched products');
  assert.ok(html.includes('Amazon ↗'), 'Dashboard cards must include direct store links');
});
