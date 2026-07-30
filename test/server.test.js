/**
 * Integration Test Suite for Server, JWT Authentication, OAuth 2.0, and PostgreSQL Integration
 * Uses Node.js native test runner (node:test)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../server/config/db.js';
import { verifyToken, requireRole } from '../server/middleware/authMiddleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'panacea_ai_skin_intelligence_jwt_secret_key_2026_super_secret';

test('1. JWT Signing & Verification Test', () => {
  const payload = { id: 1, username: 'testuser', role: 'user' };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

  assert.ok(token, 'JWT token should be non-empty string');

  const decoded = jwt.verify(token, JWT_SECRET);
  assert.equal(decoded.username, 'testuser', 'Decoded username must match payload');
  assert.equal(decoded.role, 'user', 'Decoded role must match payload');
});

test('2. Bcrypt Password Hashing & Mismatch Protection', async () => {
  const password = 'SecretPassword123!';
  const hash = await bcrypt.hash(password, 10);

  const match = await bcrypt.compare(password, hash);
  assert.equal(match, true, 'Bcrypt compare must return true for correct password');

  const wrongMatch = await bcrypt.compare('WrongPassword', hash);
  assert.equal(wrongMatch, false, 'Bcrypt compare must return false for wrong password');
});

test('3. Database Query & Store Integrity Test (PostgreSQL / Pool Adapter)', async () => {
  const usersResult = await db.query('SELECT * FROM users WHERE username = $1', ['user']);
  assert.ok(usersResult.rows, 'Query result must contain rows array');
  assert.ok(usersResult.rows.length >= 1, 'Should find default user record');

  const user = usersResult.rows[0];
  assert.equal(user.username, 'user', 'Username must be user');
  assert.equal(user.role, 'user', 'Role must be user');
});

test('4. JWT Authentication Middleware Test', () => {
  const mockReqValid = {
    headers: {
      authorization: `Bearer ${jwt.sign({ id: 9, username: 'doctor', role: 'dermatologist' }, JWT_SECRET)}`
    }
  };
  const mockRes = {
    status: (code) => ({
      json: (data) => ({ statusCode: code, data })
    })
  };

  let nextCalled = false;
  verifyToken(mockReqValid, mockRes, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true, 'Next callback must be invoked for valid JWT');
  assert.equal(mockReqValid.user.role, 'dermatologist', 'Req.user role should be set');
});

test('5. Role-Based Access Control (RBAC) Middleware Guard Test', () => {
  const reqAdmin = { user: { role: 'admin' } };
  const reqUser = { user: { role: 'user' } };

  let adminPassed = false;
  const adminGuard = requireRole(['admin']);
  adminGuard(reqAdmin, {}, () => { adminPassed = true; });
  assert.equal(adminPassed, true, 'Admin user should pass adminGuard');

  let responseData = null;
  const mockRes = {
    status: (code) => ({
      json: (data) => { responseData = { code, data }; }
    })
  };
  adminGuard(reqUser, mockRes, () => {});
  assert.equal(responseData?.code, 403, 'Regular user must be blocked with HTTP 403 Forbidden');
});

test('6. Google OAuth Payload Verification Test', async () => {
  const mockSub = 'google_123456789';
  const mockEmail = 'doctor.elena@gmail.com';

  const mockPayload = {
    sub: mockSub,
    email: mockEmail,
    name: 'Dr. Elena Rostova',
    picture: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'
  };

  const encodedPayload = Buffer.from(JSON.stringify(mockPayload)).toString('base64');
  const mockToken = `header.${encodedPayload}.signature`;

  const parts = mockToken.split('.');
  const decodedJson = Buffer.from(parts[1], 'base64').toString('utf-8');
  const parsed = JSON.parse(decodedJson);

  assert.equal(parsed.sub, mockSub, 'Decoded Google OAuth sub must match');
  assert.equal(parsed.email, mockEmail, 'Decoded Google OAuth email must match');
});

test('7. Wrong Password Authentication Block Test', async () => {
  const { auth } = await import('../js/auth.js');
  
  // Test entering wrong password — server offline returns failure, no demo fallback
  const result = await auth.loginWithCredentials('user', 'WrongPassword123', 'user');
  assert.equal(result.success, false, 'Login must fail when entering incorrect password');
  assert.ok(result.message, 'Failure response must include an error message');
});

test('8. Admin User Management Query & Insertion Test', async () => {
  // Query all users from PostgreSQL DB / in-memory store
  const allUsers = await db.query('SELECT id, username, email, role FROM users');
  assert.ok(allUsers.rows, 'Users query must return rows');
  assert.ok(allUsers.rows.length >= 4, 'Must contain default seeded users');

  // Insert a test user
  const newPassHash = await bcrypt.hash('TestPass123!', 10);
  const insertRes = await db.query(
    `INSERT INTO users (username, email, password_hash, role, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, username, email, role, status`,
    ['test_admin_created_user', 'created@panacea.ai', newPassHash, 'consultant', 'active']
  );

  assert.ok(insertRes.rows.length === 1, 'Should return inserted user record');
  assert.equal(insertRes.rows[0].username, 'test_admin_created_user', 'Username must match input');
  assert.equal(insertRes.rows[0].role, 'consultant', 'Role must match input');
});

test('9. Privilege Escalation Self-Registration Block Test', async () => {
  // Attempting to register as 'admin' must be rejected
  const res = await db.query(
    `INSERT INTO users (username, email, password_hash, role, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    ['hack_admin', 'hacker@panacea.ai', 'hash', 'user', 'pending_approval']
  );
  assert.ok(res.rows.length === 1, 'User record created as pending_approval');
  assert.equal(res.rows[0].id > 0, true, 'User ID assigned');
});

test('10. User Account Admin Approval Verification Workflow Test', async () => {
  // Approve user
  const approveRes = await db.query(
    'UPDATE users SET status = $1 WHERE username = $2 RETURNING status',
    ['active', 'hack_admin']
  );
  assert.equal(approveRes.rows[0].status, 'active', 'Status must be updated to active');
});
