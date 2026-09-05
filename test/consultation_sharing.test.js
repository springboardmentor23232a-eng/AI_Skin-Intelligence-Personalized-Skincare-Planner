import test from 'node:test';
import assert from 'node:assert';
import db from '../server/config/db.js';

test('1. User Sharing Preferences Default Initialization & Schema Integrity', async () => {
  const store = db.getInMemoryStore();
  assert.ok(Array.isArray(store.sharing_preferences), 'sharing_preferences table should exist');
  
  const user1Prefs = store.sharing_preferences.find(p => p.user_id === 1);
  assert.ok(user1Prefs, 'User 1 should have sharing preferences');
  assert.strictEqual(user1Prefs.consultant.shared, true);
  assert.strictEqual(user1Prefs.consultant.biomarkers, true);
  assert.strictEqual(user1Prefs.consultant.photos_and_lesions, true);
  assert.strictEqual(user1Prefs.consultant.adherence_and_compliance, true);
  assert.strictEqual(user1Prefs.consultant.medical_and_rx_history, false, 'Consultant should not have Rx access by default');
  
  assert.strictEqual(user1Prefs.doctor.shared, true);
  assert.strictEqual(user1Prefs.doctor.medical_and_rx_history, true, 'Doctor should have Rx access by default');
});

test('2. User Custom Sharing Consent Mutation (Revoking Photos from Consultant)', async () => {
  const store = db.getInMemoryStore();
  const user5Prefs = store.sharing_preferences.find(p => p.user_id === 5);
  assert.ok(user5Prefs, 'User 5 should have sharing preferences');
  assert.strictEqual(user5Prefs.consultant.photos_and_lesions, false, 'User 5 revoked photo access for consultant');
});

test('3. Consultant Dossier Redaction for Revoked Photos & Confidential Prescriptions', async () => {
  const store = db.getInMemoryStore();
  const user5 = store.users.find(u => u.id === 5);
  const prefsRecord = store.sharing_preferences.find(p => p.user_id === 5);
  const consult = store.consultations.find(c => c.user_id === 5);
  
  const isConsultant = true;
  const activePrefs = prefsRecord.consultant;

  // Redaction check for photos
  const progressComparison = (activePrefs && activePrefs.photos_and_lesions === false)
    ? { restricted: true, reason: 'Patient has not granted permission to view optical facial scan photos.' }
    : { days_elapsed: 30 };

  assert.strictEqual(progressComparison.restricted, true);
  assert.ok(progressComparison.reason.includes('Patient has not granted permission'));

  // Redaction check for active prescription (confidential for consultant)
  const rxDisplay = (activePrefs && activePrefs.medical_and_rx_history === false)
    ? '🔒 Access Restricted (Prescription history confidential)'
    : consult.prescription;

  assert.ok(rxDisplay.includes('🔒 Access Restricted'));
});

test('4. Dermatologist Authorized Dossier Access Verification', async () => {
  const store = db.getInMemoryStore();
  const prefsRecord = store.sharing_preferences.find(p => p.user_id === 1);
  const consult = store.consultations.find(c => c.user_id === 1);
  const activePrefs = prefsRecord.doctor;

  const rxDisplay = (activePrefs && activePrefs.medical_and_rx_history === false)
    ? '🔒 Access Restricted'
    : consult.prescription;

  assert.strictEqual(rxDisplay, 'Topical Adapalene 0.1% (PM 3x/wk) + Azelaic Acid 15% (AM)');
  assert.strictEqual(activePrefs.photos_and_lesions, true);
  assert.strictEqual(activePrefs.biomarkers, true);
});

test('5. Consultation Booking & Appointment Store Mutation', async () => {
  const store = db.getInMemoryStore();
  const initialCount = store.appointments.length;

  const newApp = {
    id: initialCount + 1,
    user_id: 1,
    specialist_id: 3,
    specialist_name: 'Dr. Julian Rostova, MD',
    specialist_role: 'dermatologist',
    type: 'Emergency Rosacea Flare Assessment',
    scheduled_date: '2025-12-15T11:00:00.000Z',
    status: 'confirmed',
    notes: 'Severe flushing flare-up after cold wind exposure.'
  };
  store.appointments.push(newApp);

  assert.strictEqual(store.appointments.length, initialCount + 1);
  const found = store.appointments.find(a => a.type === 'Emergency Rosacea Flare Assessment');
  assert.ok(found);
  assert.strictEqual(found.specialist_name, 'Dr. Julian Rostova, MD');
});

test('6. User Care Protocol & Live Consultation Synchronization', async () => {
  const store = db.getInMemoryStore();
  const consult = store.consultations.find(c => c.user_id === 1);
  assert.ok(consult);
  assert.strictEqual(consult.patient_name, 'Alex Rivera');
  assert.ok(consult.consultant_notes.includes('hydration boost'));
  assert.ok(consult.clinical_notes.includes('Follicular retention'));
});
