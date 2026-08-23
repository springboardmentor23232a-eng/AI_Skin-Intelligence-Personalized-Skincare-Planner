/**
 * Test Suite for Feature 4: Personalized Routine Generator
 * Uses Node.js native test runner (node:test)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { MOCK_USER_DATA } from '../js/mockData.js';

test('1. Routine Categories & Sequence Structure Verification', () => {
  const am = MOCK_USER_DATA.routine.morning;
  const pm = MOCK_USER_DATA.routine.evening;

  assert.ok(Array.isArray(am), 'Morning routine must be an array');
  assert.ok(Array.isArray(pm), 'Evening routine must be an array');
  assert.equal(am.length, 4, 'Morning routine must have 4 steps (Cleansing -> Treatment -> Moisturizing -> Sun Protection)');
  assert.equal(pm.length, 5, 'Evening routine must have 5 steps (Cleansing -> Exfoliation -> Treatment -> Moisturizing -> Night Care)');

  // Verify Categories
  assert.equal(am[0].step, '🧼 Cleansing');
  assert.equal(am[1].step, '💧 Treatment');
  assert.equal(am[2].step, '🧴 Moisturizing');
  assert.equal(am[3].step, '☀️ Sun Protection');

  assert.equal(pm[0].step, '🧼 Cleansing');
  assert.equal(pm[1].step, '✨ Exfoliation');
  assert.equal(pm[2].step, '💧 Treatment');
  assert.equal(pm[3].step, '🧴 Moisturizing');
  assert.equal(pm[4].step, '🌙 Night Care');
});

test('2. Weekly Treatment Plan Verification', () => {
  const weekly = MOCK_USER_DATA.routine.weeklyPlan;
  assert.ok(Array.isArray(weekly), 'Weekly plan must be an array');
  assert.ok(weekly.length >= 3, 'Weekly plan should have at least 3 scheduled treatments');

  const days = weekly.map(w => w.day);
  assert.ok(days.some(d => d.includes('Wed')), 'Weekly plan should cover Wednesday Exfoliation');
  assert.ok(days.some(d => d.includes('Friday')), 'Weekly plan should cover Friday Sheet Mask');
});

test('3. Seasonal Advice & Adaptive Notes Verification', () => {
  const seasonal = MOCK_USER_DATA.routine.seasonalTips;
  const adaptive = MOCK_USER_DATA.routine.adaptiveNotes;

  assert.ok(seasonal.season.includes('Summer'), 'Seasonal tips must default to Summer');
  assert.ok(seasonal.routine_adjustments.length > 0, 'Must have routine adjustments');
  assert.ok(seasonal.recommended_ingredients.length > 0, 'Must have recommended ingredients');

  assert.ok(adaptive.mode.includes('Mode'), 'Adaptive notes must specify a mode');
  assert.ok(adaptive.adjustments_made.length > 0, 'Must document adjustments made');
});
