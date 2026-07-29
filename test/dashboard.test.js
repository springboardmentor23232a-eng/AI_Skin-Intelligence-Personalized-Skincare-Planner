/**
 * Automated Test Suite for PanaceaAI Dashboard
 * Uses Node.js native test runner (node:test)
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { MOCK_ROLES, MOCK_USER_DATA, MOCK_ADMIN_DATA } from '../js/mockData.js';
import { auth } from '../js/auth.js';
import {
  renderLandingPage,
  renderLoginPage,
  renderUserDashboard,
  renderConsultantDashboard,
  renderDermatologistDashboard,
  renderAdminDashboard
} from '../js/dashboards.js';

test('1. MOCK_ROLES Integrity Test', () => {
  const roles = Object.keys(MOCK_ROLES);
  assert.equal(roles.length, 4, 'Should contain exactly 4 defined roles');
  assert.ok(MOCK_ROLES.USER, 'User role should exist');
  assert.ok(MOCK_ROLES.CONSULTANT, 'Consultant role should exist');
  assert.ok(MOCK_ROLES.DERMATOLOGIST, 'Dermatologist role should exist');
  assert.ok(MOCK_ROLES.ADMIN, 'Admin role should exist');
});

test('2. Weighted Skin Health Score Formula Verification', () => {
  const breakdown = MOCK_USER_DATA.skinScore.breakdown;
  
  const conditionScore = breakdown.find(b => b.name.includes('Condition')).score;
  const lifestyleScore = breakdown.find(b => b.name.includes('Lifestyle')).score;
  const sleepScore = breakdown.find(b => b.name.includes('Sleep')).score;
  const consistencyScore = breakdown.find(b => b.name.includes('Consistency')).score;
  const hydrationScore = breakdown.find(b => b.name.includes('Hydration')).score;

  const computedScore = Math.round(
    (0.35 * conditionScore) +
    (0.20 * lifestyleScore) +
    (0.15 * sleepScore) +
    (0.20 * consistencyScore) +
    (0.10 * hydrationScore)
  );

  assert.equal(computedScore, 78, 'Calculated weighted skin health score must match 78');
  assert.equal(MOCK_USER_DATA.skinScore.overall, computedScore, 'Overall score in mock data must equal weighted formula calculation');
});

test('3. Landing Page View Renderer Test', () => {
  const html = renderLandingPage();
  assert.ok(html.includes('Check Your Skin Health in Seconds'), 'Must contain editorial hero headline');
  assert.ok(html.includes('Precision Skin Intelligence Made Simple'), 'Must contain simple features section');
  assert.ok(html.includes('99.4% Scan Accuracy'), 'Must list accuracy metric');
  assert.ok(html.includes('Dr. Sarah Johnson'), 'Must render doctor specialist card');
});

test('4. User Dashboard View Renderer Test', () => {
  const html = renderUserDashboard();
  assert.ok(html.includes('Alex Rivera'), 'Must include user name');
  assert.ok(html.includes('Weighted Skin Health Score'), 'Must include skin health score widget');
  assert.ok(html.includes('Today\'s Skincare Checklist'), 'Must include AM/PM routine checklist');
  assert.ok(html.includes('AI Matched Skincare Products'), 'Must include recommended products grid');
  assert.ok(html.includes('Daily Hydration Tracker'), 'Must include hydration tracker');
});

test('5. Consultant Dashboard View Renderer Test', () => {
  const html = renderConsultantDashboard();
  assert.ok(html.includes('Consultant Workspace'), 'Must render consultant header');
  assert.ok(html.includes('Active Client Roster'), 'Must render client roster table');
  assert.ok(html.includes('Maya Lin'), 'Must include client data');
});

test('6. Dermatologist Dashboard View Renderer Test', () => {
  const html = renderDermatologistDashboard();
  assert.ok(html.includes('Clinical Skincare Portal'), 'Must render clinical header');
  assert.ok(html.includes('Patient Clinical Diagnoses'), 'Must render diagnoses & prescription table');
  assert.ok(html.includes('Topical Adapalene'), 'Must include prescription details');
});

test('7. Admin Dashboard Microservices Monitor Test', () => {
  const html = renderAdminDashboard();
  assert.ok(html.includes('Microservices Layer Monitor'), 'Must render microservices monitor');
  assert.equal(MOCK_ADMIN_DATA.microservices.length, 12, 'Must monitor all 12 microservices');
  assert.ok(html.includes('User Service'), 'User service must be listed');
  assert.ok(html.includes('Ingredient Intelligence Service'), 'Ingredient intelligence service must be listed');
  assert.ok(html.includes('Product Recommendation Service'), 'Product recommendation service must be listed');
});

test('8. Auth Controller State Transitions Test', () => {
  assert.equal(auth.getCurrentRole(), null, 'Default role should be null');
  
  auth.login('user');
  assert.equal(auth.getCurrentRole(), 'user', 'Current role should be user after user login');

  auth.switchRole('dermatologist');
  assert.equal(auth.getCurrentRole(), 'dermatologist', 'Current role should be dermatologist after role switch');

  auth.logout();
  assert.equal(auth.getCurrentRole(), null, 'Current role should be null after logout');
});

test('9. Login Page Renderer Test', () => {
  const html = renderLoginPage();
  assert.ok(html.includes('Sign In to PanaceaAI'), 'Must render login page heading');
  assert.ok(html.includes('login-demo-dropdown'), 'Must include demo account quick-fill dropdown');
  assert.ok(html.includes('page-login-username'), 'Must include username input field');
  assert.ok(html.includes('page-login-password'), 'Must include password input field');
  assert.ok(html.includes('password-toggle-btn'), 'Must include password visibility toggle');
});

test('10. Credential Login & Role Determination Test', () => {
  auth.logout();

  // Test empty validation
  const emptyRes = auth.loginWithCredentials('', '');
  assert.equal(emptyRes.success, false, 'Should fail when inputs are empty');

  // Test admin credential
  const adminRes = auth.loginWithCredentials('admin', 'admin123');
  assert.equal(adminRes.success, true, 'Admin credential should succeed');
  assert.equal(auth.getCurrentRole(), 'admin', 'Role should be admin');

  // Test doctor credential
  const docRes = auth.loginWithCredentials('doctor', 'doctor123');
  assert.equal(docRes.success, true, 'Doctor credential should succeed');
  assert.equal(auth.getCurrentRole(), 'dermatologist', 'Role should be dermatologist');

  // Test consultant credential
  const consRes = auth.loginWithCredentials('consultant', 'consultant123');
  assert.equal(consRes.success, true, 'Consultant credential should succeed');
  assert.equal(auth.getCurrentRole(), 'consultant', 'Role should be consultant');

  // Test user credential
  const userRes = auth.loginWithCredentials('user', 'user123');
  assert.equal(userRes.success, true, 'User credential should succeed');
  assert.equal(auth.getCurrentRole(), 'user', 'Role should be user');

  auth.logout();
});

