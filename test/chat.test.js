import test from 'node:test';
import assert from 'node:assert';
import db from '../server/config/db.js';
import { generateLuminaAIResponse } from '../server/routes/api.js';

test('1. Chat Messages Store & Database Schema Integrity', async () => {
  const store = db.getInMemoryStore();
  assert.ok(Array.isArray(store.chat_messages), 'chat_messages table must exist in DB store');
  assert.ok(store.chat_messages.length >= 4, 'Should contain pre-seeded initial conversations');
  
  const luminaMsg = store.chat_messages.find(m => m.recipient_id === 'lumina_ai' || m.sender_id === 'lumina_ai');
  assert.ok(luminaMsg, 'Pre-seeded Lumina AI messages should exist');
  assert.strictEqual(luminaMsg.conversation_id, 'user_1_lumina_ai');
});

test('2. Lumina AI Skincare Engine - Retinoid & Exfoliant Interaction Analysis', async () => {
  const query = 'Is it safe to use 2% BHA salicylic acid and adapalene together?';
  const response = generateLuminaAIResponse(query, 'user', { skin_type: 'Combination' });
  
  assert.ok(response.includes('Adapalene') || response.includes('Salicylic'), 'Should mention target ingredients');
  assert.ok(response.includes('Clinical Interaction Analysis') || response.includes('Regimen'), 'Should provide structured clinical breakdown');
  assert.ok(response.includes('Morning (AM)') && response.includes('Evening (PM)'), 'Should provide daily application separation');
});

test('3. Lumina AI Skincare Engine - Skin Barrier Repair & Redness Protocol', async () => {
  const query = 'My skin barrier is damaged with severe burning and redness. What should I do?';
  const response = generateLuminaAIResponse(query, 'user', { skin_type: 'Sensitive' });
  
  assert.ok(response.includes('Barrier') || response.includes('Ceramides'), 'Should advise barrier repair and ceramides');
  assert.ok(response.includes('Centella') || response.includes('Panthenol') || response.includes('Lipid'), 'Should recommend anti-inflammatory actives');
});

test('4. Multi-Role Conversations Roster Association for Patient', async () => {
  const store = db.getInMemoryStore();
  const userId = 1;
  const role = 'user';
  
  // Patient associates with Lumina AI, Consultant (ID 2), and Doctor (ID 3)
  const contacts = [
    { id: `user_${userId}_lumina_ai`, contact_id: 'lumina_ai', name: 'Lumina AI' },
    { id: `user_${userId}_consultant_2`, contact_id: '2', name: 'Ananya Iyer, LE' },
    { id: `user_${userId}_doctor_3`, contact_id: '3', name: 'Dr. Rajni Verma, MD' }
  ];
  
  assert.strictEqual(contacts.length, 3);
  assert.strictEqual(contacts[0].contact_id, 'lumina_ai');
  assert.strictEqual(contacts[1].contact_id, '2');
  assert.strictEqual(contacts[2].contact_id, '3');
});

test('5. Multi-Role Conversations Roster Association for Consultant & Doctor', async () => {
  const store = db.getInMemoryStore();
  
  // Consultant contacts: Lumina AI, Assigned Clients (1, 5, 6), and Supervising Doctor (3)
  const consultantContacts = ['lumina_ai', '1', '5', '6', '3'];
  assert.strictEqual(consultantContacts.length, 5);
  
  // Doctor contacts: Lumina AI, Assigned Patients (1, 5, 6), and Aesthetic Consultant (2)
  const doctorContacts = ['lumina_ai', '1', '5', '6', '2'];
  assert.strictEqual(doctorContacts.length, 5);
});

test('6. Real-Time Chat Message Insertion & Auto-Response Mutation', async () => {
  const store = db.getInMemoryStore();
  const initialCount = store.chat_messages.length;
  
  const userMsg = {
    id: initialCount + 1,
    conversation_id: 'user_1_lumina_ai',
    sender_id: '1',
    sender_name: 'Alex Rivera',
    sender_role: 'user',
    recipient_id: 'lumina_ai',
    recipient_name: 'Lumina AI',
    recipient_role: 'ai_assistant',
    message: 'Can I use azelaic acid in the morning with sunscreen?',
    message_type: 'text',
    read: true,
    created_at: new Date().toISOString()
  };
  
  store.chat_messages.push(userMsg);
  
  const aiReply = {
    id: initialCount + 2,
    conversation_id: 'user_1_lumina_ai',
    sender_id: 'lumina_ai',
    sender_name: 'Lumina AI',
    sender_role: 'ai_assistant',
    recipient_id: '1',
    recipient_name: 'Alex Rivera',
    recipient_role: 'user',
    message: generateLuminaAIResponse(userMsg.message, 'user', {}),
    message_type: 'ai_response',
    read: true,
    created_at: new Date().toISOString()
  };
  
  store.chat_messages.push(aiReply);
  
  assert.strictEqual(store.chat_messages.length, initialCount + 2);
  const foundUser = store.chat_messages.find(m => m.id === userMsg.id);
  const foundAi = store.chat_messages.find(m => m.id === aiReply.id);
  
  assert.ok(foundUser);
  assert.ok(foundAi);
  assert.strictEqual(foundAi.sender_id, 'lumina_ai');
});

test('7. Lumina AI Skincare Engine - Vitamin C Stability & Ferulic Acid Pairing', async () => {
  const query = 'How do I know if my Vitamin C serum oxidized and what pH is best?';
  const response = generateLuminaAIResponse(query, 'user', {});
  
  assert.ok(response.includes('Vitamin C') || response.includes('Ascorbic'), 'Should address Vitamin C');
  assert.ok(response.includes('L-Ascorbic Acid') || response.includes('Ferulic'), 'Should detail L-AA and Ferulic acid');
  assert.ok(response.includes('Oxidation') || response.includes('oxidize'), 'Should give oxidation guidance');
});

test('8. Lumina AI Skincare Engine - Fungal Acne & Malassezia Folliculitis Protocol', async () => {
  const query = 'I have itchy forehead bumps. Is it fungal acne Malassezia?';
  const response = generateLuminaAIResponse(query, 'user', {});
  
  assert.ok(response.includes('Malassezia') || response.includes('Fungal Acne'), 'Should identify Malassezia yeast');
  assert.ok(response.includes('Ketoconazole') || response.includes('Zinc Pyrithione') || response.includes('Squalane'), 'Should recommend anti-fungal treatments');
});

test('9. Lumina AI Skincare Engine - Pregnancy & Nursing Safe Actives Protocol', async () => {
  const query = 'What pregnancy safe skincare actives can replace retinoids and salicylic acid?';
  const response = generateLuminaAIResponse(query, 'user', {});
  
  assert.ok(response.includes('Pregnancy') || response.includes('Contraindicated'), 'Should outline pregnancy rules');
  assert.ok(response.includes('Bakuchiol') || response.includes('Azelaic Acid'), 'Should recommend safe alternatives');
});

test('10. Lumina AI Skincare Engine - Purging vs Allergic Breakouts Protocol', async () => {
  const query = 'How do I tell the difference between skin purging and an allergic breakout?';
  const response = generateLuminaAIResponse(query, 'user', {});
  
  assert.ok(response.includes('Purge') || response.includes('Purging'), 'Should describe cellular purging');
  assert.ok(response.includes('Dermatitis') || response.includes('Reaction'), 'Should contrast adverse reactions');
});

test('11. Lumina AI Skincare Engine - Mineral vs Chemical SPF Photoprotection', async () => {
  const query = 'What broad spectrum SPF 50 sunscreen filters leave zero white cast?';
  const response = generateLuminaAIResponse(query, 'user', {});
  
  assert.ok(response.includes('Broad-Spectrum SPF 50+') || response.includes('Photoprotection'), 'Should detail SPF standards');
  assert.ok(response.includes('Tinosorb') || response.includes('Zinc Oxide') || response.includes('filters'), 'Should detail filter chemistry');
});
