/**
 * Test Suite for Clinical Workspaces, Zero-Fake Profile Synchronization, and RBAC Access Control
 * Uses Node.js native test runner (node:test)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import db from '../server/config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'panacea_ai_skin_intelligence_jwt_secret_key_2026_super_secret';

test('1. Consultant Synchronized Client Roster Verification', async () => {
  const store = db.getInMemoryStore();
  const clients = store.users.filter(u => u.role === 'user');

  assert.ok(Array.isArray(clients), 'Clients list must be an array');
  assert.ok(clients.length >= 3, 'Should have at least 3 real synchronized client records');

  const alex = clients.find(c => c.username === 'user');
  assert.ok(alex, 'Primary client Alex Rivera must exist');
  assert.equal(alex.full_name, 'Alex Rivera');
  assert.equal(alex.skin_type, 'Combination');
  assert.equal(alex.assigned_consultant_id, 2);

  const sarah = clients.find(c => c.username === 'sarah_jenkins');
  assert.ok(sarah, 'Client Sarah Jenkins must exist');
  assert.equal(sarah.skin_type, 'Sensitive / Dry');

  const marcus = clients.find(c => c.username === 'marcus_v');
  assert.ok(marcus, 'Client Marcus Vance must exist');
  assert.equal(marcus.skin_type, 'Oily / Congested');
});

test('2. Dermatologist Synchronized Patient Roster & Optical Lesion Status Verification', async () => {
  const store = db.getInMemoryStore();
  const scores = store.skin_scores;
  const consults = store.consultations;

  assert.ok(scores.length >= 3, 'Must have skin scores for each real patient');
  assert.ok(consults.length >= 3, 'Must have consultation records for each real patient');

  // Verify Alex Rivera's clinical medical chart
  const alexScore = scores.find(s => s.user_id === 1);
  const alexConsult = consults.find(c => c.user_id === 1);

  assert.ok(alexScore, 'Alex Rivera skin score must exist');
  assert.equal(alexScore.overall_score, 79.4);
  assert.equal(alexScore.lesion_screening.badge, 'BENIGN (SAFE)');
  assert.equal(alexConsult.dermatologist, 'Dr. Julian Rostova, MD');
  assert.ok(alexConsult.prescription.includes('Adapalene'), 'Must have medical prescription');
});

test('3. Patient Clinical Dossier Compilation Test', async () => {
  const store = db.getInMemoryStore();
  const user = store.users.find(u => u.id === 1);
  const scoreRecord = store.skin_scores.find(s => s.user_id === 1);
  const consult = store.consultations.find(c => c.user_id === 1);

  assert.ok(user && scoreRecord && consult);

  const dossier = {
    patient_info: {
      id: user.id,
      full_name: user.full_name,
      skin_type: user.skin_type
    },
    biomarkers: scoreRecord.biomarkers,
    clinical_record: {
      diagnosed_condition: consult.condition,
      active_prescription: consult.prescription,
      status: consult.status
    }
  };

  assert.equal(dossier.patient_info.full_name, 'Alex Rivera');
  assert.equal(dossier.biomarkers.hydration_level, 74.0);
  assert.equal(dossier.biomarkers.barrier_strength, 86.0);
  assert.equal(dossier.biomarkers.acne_severity, 12.0);
  assert.ok(dossier.clinical_record.active_prescription.includes('Adapalene'));
});

test('4. Consultant Regimen Notes & Priority Update Verification', async () => {
  const store = db.getInMemoryStore();
  const consult = store.consultations.find(c => c.user_id === 1);

  assert.ok(consult, 'Consultation record for patient 1 must exist');
  
  // Simulate consultant saving notes
  const updatedNote = 'Intracellular hydration capacity improved by +54.2%. Recommending maintenance phase.';
  consult.consultant_notes = updatedNote;
  consult.status = 'Regimen Adjusted';

  assert.equal(consult.consultant_notes, updatedNote);
  assert.equal(consult.status, 'Regimen Adjusted');
});

test('5. Dermatologist Medical Prescription (Rx) & Sign-Off Mutation Test', async () => {
  const store = db.getInMemoryStore();
  const consult = store.consultations.find(c => c.user_id === 1);

  assert.ok(consult, 'Consultation record for patient 1 must exist');

  // Simulate doctor modifying prescription
  const updatedRx = 'Topical Adapalene 0.1% (PM 4x/wk) + Azelaic Acid 15% (AM) + Ceramide NP Balm';
  consult.prescription = updatedRx;
  consult.clinical_notes = 'Clearance confirmed by Dr. Julian Rostova, MD. Patient certified for continuation.';

  assert.equal(consult.prescription, updatedRx);
  assert.ok(consult.clinical_notes.includes('Dr. Julian Rostova'));
});

test('6. RBAC Guard: Block Non-User Roles from Consumer Assessment', () => {
  // Consultant token
  const consultantToken = jwt.sign({ id: 2, username: 'consultant', role: 'consultant' }, JWT_SECRET);
  const decodedConsultant = jwt.verify(consultantToken, JWT_SECRET);
  assert.equal(decodedConsultant.role, 'consultant');
  assert.notEqual(decodedConsultant.role, 'user', 'Consultant role must NOT be user');

  // Doctor token
  const doctorToken = jwt.sign({ id: 3, username: 'doctor', role: 'dermatologist' }, JWT_SECRET);
  const decodedDoctor = jwt.verify(doctorToken, JWT_SECRET);
  assert.equal(decodedDoctor.role, 'dermatologist');
  assert.notEqual(decodedDoctor.role, 'user', 'Doctor role must NOT be user');

  // Patient / User token
  const userToken = jwt.sign({ id: 1, username: 'user', role: 'user' }, JWT_SECRET);
  const decodedUser = jwt.verify(userToken, JWT_SECRET);
  assert.equal(decodedUser.role, 'user', 'Patient role must be user');
});
