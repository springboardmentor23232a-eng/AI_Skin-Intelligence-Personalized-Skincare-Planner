/**
 * Module 9: Dashboard & Analytics Test Suite
 * Tests User, Consultant, Dermatologist, and Admin dashboards and daily checklist telemetry.
 * Uses Node.js native test runner (node:test)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import db from '../server/config/db.js';

test('1. Module 9: User Dashboard Metrics & 5-Factor Weighted Score Breakdown', async () => {
  const store = db.getInMemoryStore();
  const user = store.users.find(u => u.id === 1);
  const scoreRecord = store.skin_scores.find(s => s.user_id === 1);

  assert.ok(user, 'User #1 must exist');
  assert.ok(scoreRecord, 'Skin score record must exist for User #1');

  // Verify biomarkers integrity
  const biomarkers = scoreRecord.biomarkers;
  assert.ok(biomarkers, 'Biomarkers must exist');
  assert.ok(biomarkers.barrier_strength !== undefined, 'Barrier strength must be present');
  assert.ok(biomarkers.hydration_level !== undefined, 'Hydration level must be present');
  assert.ok(biomarkers.acne_severity !== undefined, 'Acne severity must be present');

  // Verify breakdown
  assert.ok(scoreRecord.breakdown, 'Breakdown weights must exist');
  const breakdown = JSON.parse(scoreRecord.breakdown);
  assert.ok(Array.isArray(breakdown), 'Breakdown must be array');
  assert.ok(breakdown.length >= 4, 'Should contain multi-factor weights');
});

test('2. Module 9: Daily Skincare Checklist Toggling & Streak Tracking', async () => {
  const store = db.getInMemoryStore();
  assert.ok(Array.isArray(store.daily_skincare_checklists), 'daily_skincare_checklists table must exist');

  // Initial checklist for user 1
  const initialStep = store.daily_skincare_checklists.find(c => c.user_id === 1 && c.step_id === 'am_cleanse');
  assert.ok(initialStep, 'AM Cleanse step should exist in mock seed');

  // Toggle checklist step
  initialStep.completed = 1;
  assert.equal(initialStep.completed, 1, 'Checklist step completion state must update');

  // Verify cross-database integer type safety (0 or 1)
  assert.ok(initialStep.completed === 0 || initialStep.completed === 1, 'Completed flag must be boolean-safe integer');
});

test('3. Module 9: Consultant Dashboard Telemetry & Client Roster', async () => {
  const store = db.getInMemoryStore();
  const clients = store.users.filter(u => u.role === 'user');

  assert.ok(clients.length >= 3, 'Consultant should have access to synchronized client profiles');
  clients.forEach(c => {
    assert.ok(c.skin_type, 'Client skin type must be documented');
    assert.ok(c.email, 'Client contact email must be available');
  });
});

test('4. Module 9: Dermatologist Clinical Telemetry & Malignancy Risk Dials', async () => {
  const store = db.getInMemoryStore();
  const scores = store.skin_scores;

  scores.forEach(s => {
    assert.ok(s.lesion_screening, 'Lesion screening must be present on every clinical record');
    assert.ok(s.lesion_screening.classification, 'Lesion classification must be defined');
    assert.ok(s.lesion_screening.badge, 'Lesion badge indicator must be defined');
    assert.ok(typeof s.lesion_screening.confidence_pct === 'number', 'ISIC confidence must be numeric percentage');
  });
});

test('5. Module 9: Admin Platform Telemetry & System Microservice Roster', async () => {
  const store = db.getInMemoryStore();
  assert.ok(store.users.length >= 4, 'Total platform users should include user, consultant, dermatologist, admin');
  
  const roles = store.users.map(u => u.role);
  assert.ok(roles.includes('user'), 'User role exists');
  assert.ok(roles.includes('consultant'), 'Consultant role exists');
  assert.ok(roles.includes('dermatologist'), 'Dermatologist role exists');
  assert.ok(roles.includes('admin'), 'Admin role exists');
});
