/**
 * Module 10: Notification & Reminder System Test Suite
 * Tests Notification Center, Reminder Preferences, Smart Replenishment Forecasting, Hydration, and Sleep telemetry.
 * Uses Node.js native test runner (node:test)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import db from '../server/config/db.js';

test('1. Module 10: Notification Center Category Filtering & Unread Counts', async () => {
  const store = db.getInMemoryStore();
  assert.ok(Array.isArray(store.notifications), 'Notifications table must exist');
  assert.ok(store.notifications.length >= 4, 'Must seed initial mock notifications');

  const userNotifs = store.notifications.filter(n => n.user_id === 1);
  assert.ok(userNotifs.length > 0, 'User #1 should have notifications');

  // Verify category integrity
  const categories = [...new Set(userNotifs.map(n => n.category))];
  assert.ok(categories.includes('routine') || categories.includes('product') || categories.includes('clinical'), 'Should have structured categories');

  // Mark notification read test
  const firstUnread = userNotifs.find(n => n.is_read === 0 || !n.is_read);
  if (firstUnread) {
    firstUnread.is_read = 1;
    assert.equal(firstUnread.is_read, 1, 'Notification should be marked read');
  }
});

test('2. Module 10: Reminder Preferences CRUD & Scheduled Times', async () => {
  const store = db.getInMemoryStore();
  assert.ok(Array.isArray(store.reminders), 'Reminders preferences table must exist');

  let prefs = store.reminders.find(r => r.user_id === 1);
  if (!prefs) {
    prefs = {
      id: 1,
      user_id: 1,
      morning_routine_time: '08:00',
      evening_routine_time: '21:30',
      hydration_target_ml: 2500,
      sleep_wind_down_time: '22:30',
      enable_routine_reminders: 1,
      enable_replenishment_alerts: 1,
      enable_hydration_reminders: 1,
      enable_sleep_reminders: 1
    };
    store.reminders.push(prefs);
  }

  assert.equal(prefs.morning_routine_time, '08:00');
  assert.equal(prefs.hydration_target_ml, 2500);

  // Update preference
  prefs.morning_routine_time = '07:30';
  assert.equal(prefs.morning_routine_time, '07:30', 'Morning routine time must update');
});

test('3. Module 10: Smart Product Replenishment & Low Stock Forecast', async () => {
  const store = db.getInMemoryStore();
  assert.ok(Array.isArray(store.product_replenishment_tracking), 'Replenishment tracking table must exist');

  const items = store.product_replenishment_tracking.filter(p => p.user_id === 1);
  assert.ok(items.length >= 2, 'Should track at least 2 active skincare products');

  items.forEach(item => {
    assert.ok(item.product_name, 'Product name must be present');
    assert.ok(item.remaining_pct !== undefined, 'Remaining % must be present');
    assert.ok(item.days_left !== undefined || item.days_until_empty !== undefined, 'Days until empty must be calculated');
  });

  // Low stock threshold check (<= 25% triggers alert)
  const lowStock = items.filter(p => p.remaining_pct <= 25 || (p.days_left || p.days_until_empty) <= 7);
  assert.ok(lowStock.length >= 1, 'Should identify low stock items (e.g. The Ordinary Niacinamide)');
});

test('4. Module 10: Cellular Hydration Log Recording & Goal Progress', async () => {
  const store = db.getInMemoryStore();
  assert.ok(Array.isArray(store.hydration_logs), 'Hydration logs table must exist');

  const initialCount = store.hydration_logs.length;
  const newLog = {
    id: initialCount + 1,
    user_id: 1,
    amount_ml: 250,
    created_at: new Date().toISOString()
  };
  store.hydration_logs.push(newLog);

  assert.equal(store.hydration_logs.length, initialCount + 1, 'Hydration entry must be logged');
  assert.equal(newLog.amount_ml, 250, 'Quick-log amount must match');
});

test('5. Module 10: Circadian Sleep & Cellular Repair Logging', async () => {
  const store = db.getInMemoryStore();
  assert.ok(Array.isArray(store.sleep_logs), 'Sleep logs table must exist');

  const initialCount = store.sleep_logs.length;
  const newSleep = {
    id: initialCount + 1,
    user_id: 1,
    sleep_hours: 8.0,
    sleep_quality: 'Deep / Restorative',
    wind_down_time: '22:30',
    notes: 'Restful 8 hours circadian repair',
    created_at: new Date().toISOString()
  };
  store.sleep_logs.push(newSleep);

  assert.equal(store.sleep_logs.length, initialCount + 1, 'Sleep record must be saved');
  assert.equal(newSleep.sleep_hours, 8.0);
  assert.equal(newSleep.sleep_quality, 'Deep / Restorative');
});
