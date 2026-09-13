const pool = require('../db/pool');

const NOTIFICATION_TYPES = [
  'routine_reminder',
  'product_replenishment',
  'hydration_reminder',
  'sleep_reminder',
  'progress_alert',
  'platform_notification',
];

const DEFAULT_NOTIFICATION_PREFERENCES = {
  routine_reminder: true,
  hydration_reminder: true,
  sleep_reminder: true,
  product_replenishment: true,
  progress_alert: true,
  platform_notifications: true,
};

const REMINDER_TYPE_TO_PREFERENCE = {
  routine_reminder: 'routine_reminder',
  hydration_reminder: 'hydration_reminder',
  sleep_reminder: 'sleep_reminder',
  product_replenishment: 'product_replenishment',
  progress_alert: 'progress_alert',
  platform_notification: 'platform_notifications',
};

const REMINDER_INTERVALS = {
  routine_reminder: 24 * 60 * 60 * 1000,
  hydration_reminder: 8 * 60 * 60 * 1000,
  sleep_reminder: 36 * 60 * 60 * 1000,
  product_replenishment: 30 * 24 * 60 * 60 * 1000,
  progress_alert: 7 * 24 * 60 * 60 * 1000,
};

async function ensureNotificationTable() {
  await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('routine_reminder', 'product_replenishment', 'hydration_reminder', 'sleep_reminder', 'progress_alert', 'platform_notification')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'dismissed', 'sent')),
      scheduled_for TIMESTAMPTZ DEFAULT NOW(),
      sent_at TIMESTAMPTZ,
      read_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const columnCheck = await pool.query(
    `SELECT data_type
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'notifications'
       AND column_name = 'user_id';`
  );

  if (columnCheck.rows.length === 0 || (columnCheck.rows[0].data_type && columnCheck.rows[0].data_type !== 'uuid')) {
    await pool.query('DROP TABLE IF EXISTS notifications;');
    await pool.query(`
      CREATE TABLE notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK (type IN ('routine_reminder', 'product_replenishment', 'hydration_reminder', 'sleep_reminder', 'progress_alert', 'platform_notification')),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'dismissed', 'sent')),
        scheduled_for TIMESTAMPTZ DEFAULT NOW(),
        sent_at TIMESTAMPTZ,
        read_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_notifications_user_status_time
    ON notifications (user_id, status, created_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_notifications_type_time
    ON notifications (type, scheduled_for);
  `);

  await ensureNotificationPreferencesTable();
}

async function ensureNotificationPreferencesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notification_preferences (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      routine_reminder BOOLEAN NOT NULL DEFAULT TRUE,
      hydration_reminder BOOLEAN NOT NULL DEFAULT TRUE,
      sleep_reminder BOOLEAN NOT NULL DEFAULT TRUE,
      product_replenishment BOOLEAN NOT NULL DEFAULT TRUE,
      progress_alert BOOLEAN NOT NULL DEFAULT TRUE,
      platform_notifications BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_notification_preferences_updated
    ON notification_preferences (updated_at DESC);
  `);
}

function normalizeMetadata(metadata = {}) {
  return metadata && typeof metadata === 'object' ? metadata : {};
}

async function hasActiveNotification(userId, type, windowStart, windowEnd = null) {
  const baseQuery = `
    SELECT id
    FROM notifications
    WHERE user_id = $1
      AND type = $2
      AND created_at >= $3`;
  const params = [userId, type, windowStart];
  let query = baseQuery;

  if (windowEnd) {
    query += ' AND created_at < $4';
    params.push(windowEnd);
  }

  query += ' LIMIT 1;';
  const result = await pool.query(query, params);
  return result.rows.length > 0;
}

async function createNotification({ userId, type, title, message, metadata = {}, status = 'unread', scheduledFor = new Date() }) {
  const safeMetadata = normalizeMetadata(metadata);
  const result = await pool.query(
    `
      INSERT INTO notifications (user_id, type, title, message, metadata, status, scheduled_for, sent_at, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), NOW())
      RETURNING *;
    `,
    [userId, type, title, message, JSON.stringify(safeMetadata), status, scheduledFor]
  );
  const notification = result.rows[0];
  return notification;
}

async function createNotificationForAllUsers({ type, title, message, metadata = {} }) {
  const users = await pool.query('SELECT id FROM users WHERE is_active = true');
  const created = [];
  for (const user of users.rows) {
    const notification = await createNotification({
      userId: user.id,
      type,
      title,
      message,
      metadata,
      status: 'unread',
      scheduledFor: new Date(),
    });
    created.push(notification);
  }
  return created;
}

async function getNotificationsForUser(userId, { limit = 25, unreadOnly = false } = {}) {
  const clauses = ['user_id = $1'];
  const params = [userId];
  if (unreadOnly) {
    clauses.push('status = $2');
    params.push('unread');
  }

  const result = await pool.query(
    `
      SELECT *
      FROM notifications
      WHERE ${clauses.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1};
    `,
    [...params, limit]
  );

  return result.rows;
}

async function getUnreadCount(userId) {
  const result = await pool.query(
    'SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND status = $2',
    [userId, 'unread']
  );
  return Number(result.rows[0]?.count || 0);
}

function normalizePreferencePayload(payload = {}) {
  const preferences = { ...DEFAULT_NOTIFICATION_PREFERENCES };
  for (const [key, value] of Object.entries(payload || {})) {
    if (Object.prototype.hasOwnProperty.call(preferences, key)) {
      preferences[key] = Boolean(value);
    }
  }
  return preferences;
}

async function getUserNotificationPreferences(userId) {
  await ensureNotificationPreferencesTable();
  const result = await pool.query(
    `SELECT * FROM notification_preferences WHERE user_id = $1`,
    [userId]
  );

  if (result.rows.length > 0) {
    return normalizePreferencePayload(result.rows[0]);
  }

  const defaults = normalizePreferencePayload(DEFAULT_NOTIFICATION_PREFERENCES);
  const inserted = await pool.query(
    `INSERT INTO notification_preferences (
      user_id,
      routine_reminder,
      hydration_reminder,
      sleep_reminder,
      product_replenishment,
      progress_alert,
      platform_notifications,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
    RETURNING *;`,
    [userId, defaults.routine_reminder, defaults.hydration_reminder, defaults.sleep_reminder, defaults.product_replenishment, defaults.progress_alert, defaults.platform_notifications]
  );

  return normalizePreferencePayload(inserted.rows[0]);
}

async function updateUserNotificationPreferences(userId, payload = {}) {
  const normalized = normalizePreferencePayload(payload);
  const result = await pool.query(
    `UPDATE notification_preferences
     SET routine_reminder = $2,
         hydration_reminder = $3,
         sleep_reminder = $4,
         product_replenishment = $5,
         progress_alert = $6,
         platform_notifications = $7,
         updated_at = NOW()
     WHERE user_id = $1
     RETURNING *;`,
    [userId, normalized.routine_reminder, normalized.hydration_reminder, normalized.sleep_reminder, normalized.product_replenishment, normalized.progress_alert, normalized.platform_notifications]
  );

  if (result.rows.length === 0) {
    return getUserNotificationPreferences(userId);
  }

  return normalizePreferencePayload(result.rows[0]);
}

async function isReminderEnabled(userId, type) {
  const preference = REMINDER_TYPE_TO_PREFERENCE[type] || null;
  if (!preference) {
    return true;
  }
  const preferences = await getUserNotificationPreferences(userId);
  return Boolean(preferences[preference]);
}

async function getReminderTimerSummary(userId) {
  const preferences = await getUserNotificationPreferences(userId);
  const timers = [];
  const selectedTypes = Object.keys(REMINDER_INTERVALS);

  const latestRows = await pool.query(
    `SELECT type, MAX(created_at) AS last_triggered
     FROM notifications
     WHERE user_id = $1 AND type = ANY($2::text[])
     GROUP BY type;`,
    [userId, selectedTypes]
  );

  const recordsByType = {};
  for (const row of latestRows.rows) {
    recordsByType[row.type] = row.last_triggered;
  }

  const now = Date.now();
  for (const type of selectedTypes) {
    const enabled = Boolean(preferences[REMINDER_TYPE_TO_PREFERENCE[type]]);
    const lastTriggered = recordsByType[type] ? new Date(recordsByType[type]) : null;
    const intervalMs = REMINDER_INTERVALS[type];
    const nextDueAt = lastTriggered ? new Date(lastTriggered.getTime() + intervalMs) : new Date(now + intervalMs);
    const nextInMs = Math.max(0, nextDueAt.getTime() - now);

    timers.push({
      type,
      label: type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()),
      enabled,
      intervalMs,
      lastTriggered: lastTriggered ? lastTriggered.toISOString() : null,
      nextDueAt: nextDueAt.toISOString(),
      nextInMs,
    });
  }

  return timers;
}

async function markNotificationRead(id, userId) {
  const result = await pool.query(
    `
      UPDATE notifications
      SET status = 'read', read_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *;
    `,
    [id, userId]
  );
  return result.rows[0] || null;
}

async function markAllNotificationsRead(userId) {
  const result = await pool.query(
    `
      UPDATE notifications
      SET status = 'read', read_at = NOW(), updated_at = NOW()
      WHERE user_id = $1 AND status <> 'read'
      RETURNING *;
    `,
    [userId]
  );
  return result.rows;
}

async function generateUserNotifications(userId) {
  const created = [];
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const userQuery = await pool.query(
    `
      SELECT u.id, u.name,
             COALESCE(latest_assessment.skin_health_score, 0) AS latest_score,
             COALESCE(previous_assessment.skin_health_score, latest_assessment.skin_health_score, 0) AS previous_score,
             latest_assessment.assessment_date,
             COALESCE(p.routine_evening, '') AS routine_evening,
             (
               SELECT COUNT(*)::int
               FROM skincare_checklist
               WHERE user_id = $1 AND completed_on = CURRENT_DATE
             ) AS todays_checklist_done
      FROM users u
      LEFT JOIN LATERAL (
        SELECT skin_health_score, assessment_date
        FROM skin_assessments
        WHERE user_id = u.id
        ORDER BY assessment_date DESC
        LIMIT 1
      ) latest_assessment ON true
      LEFT JOIN LATERAL (
        SELECT skin_health_score, assessment_date
        FROM skin_assessments
        WHERE user_id = u.id AND assessment_date < COALESCE(latest_assessment.assessment_date, NOW())
        ORDER BY assessment_date DESC
        LIMIT 1
      ) previous_assessment ON true
      LEFT JOIN skin_profiles p ON p.user_id = u.id
      WHERE u.id = $1
      LIMIT 1;
    `,
    [userId]
  );

  const userData = userQuery.rows[0];
  if (!userData) {
    return created;
  }

  if (await isReminderEnabled(userId, 'routine_reminder') && Number(userData.todays_checklist_done || 0) === 0 && !await hasActiveNotification(userId, 'routine_reminder', today)) {
    created.push(await createNotification({
      userId,
      type: 'routine_reminder',
      title: 'Routine reminder',
      message: 'Your routine checklist is still open today. A quick 5-minute routine can keep your skin on track.',
      metadata: { source: 'daily_routine' },
      scheduledFor: new Date(),
    }));
  }

  const hydrationCheck = await pool.query(
    `SELECT created_at FROM user_activity_log WHERE user_id = $1 AND created_at >= $2 ORDER BY created_at DESC LIMIT 1;`,
    [userId, new Date(now.getTime() - 8 * 60 * 60 * 1000)]
  );
  if (await isReminderEnabled(userId, 'hydration_reminder') && hydrationCheck.rows.length === 0 && !await hasActiveNotification(userId, 'hydration_reminder', last24Hours)) {
    created.push(await createNotification({
      userId,
      type: 'hydration_reminder',
      title: 'Hydration reminder',
      message: 'It has been a while since your last skincare activity. A hydration check-in can support your skin barrier today.',
      metadata: { source: 'hydration_check' },
      scheduledFor: new Date(),
    }));
  }

  const sleepActivity = await pool.query(
    `SELECT created_at FROM user_activity_log WHERE user_id = $1 AND created_at >= $2 ORDER BY created_at DESC LIMIT 1;`,
    [userId, new Date(now.getTime() - 36 * 60 * 60 * 1000)]
  );
  if (await isReminderEnabled(userId, 'sleep_reminder') && (userData.routine_evening || '').trim() && sleepActivity.rows.length === 0 && !await hasActiveNotification(userId, 'sleep_reminder', last7Days)) {
    created.push(await createNotification({
      userId,
      type: 'sleep_reminder',
      title: 'Sleep reminder',
      message: 'Your evening routine is still waiting. A consistent PM routine supports better recovery and brighter skin.',
      metadata: { source: 'sleep_support' },
      scheduledFor: new Date(),
    }));
  }

  const recommendations = await pool.query(
    `SELECT id, title, created_at FROM skincare_recommendations WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 5;`,
    [userId]
  );
  for (const recommendation of recommendations.rows) {
    if (await isReminderEnabled(userId, 'product_replenishment') && new Date(recommendation.created_at) < new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) && !await hasActiveNotification(userId, 'product_replenishment', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))) {
      created.push(await createNotification({
        userId,
        type: 'product_replenishment',
        title: 'Product replenishment reminder',
        message: `Your recommended product "${recommendation.title}" may need replenishment soon. Check your routine and restock if needed.`,
        metadata: { recommendation_id: recommendation.id },
        scheduledFor: new Date(),
      }));
      break;
    }
  }

  const latestScore = Number(userData.latest_score || 0);
  const previousScore = Number(userData.previous_score || latestScore);
  if (await isReminderEnabled(userId, 'progress_alert') && latestScore > 0 && previousScore > 0 && previousScore - latestScore >= 8 && !await hasActiveNotification(userId, 'progress_alert', last7Days)) {
    created.push(await createNotification({
      userId,
      type: 'progress_alert',
      title: 'Progress alert',
      message: `Your latest skin health score dropped from ${previousScore}/100 to ${latestScore}/100. Review your routine and consider a fresh assessment.`,
      metadata: { previous_score: previousScore, latest_score: latestScore },
      scheduledFor: new Date(),
    }));
  }

  return created;
}

module.exports = {
  ensureNotificationTable,
  ensureNotificationPreferencesTable,
  getUserNotificationPreferences,
  updateUserNotificationPreferences,
  isReminderEnabled,
  getReminderTimerSummary,
  NOTIFICATION_TYPES,
  createNotification,
  createNotificationForAllUsers,
  getNotificationsForUser,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  generateUserNotifications,
  broadcastPlatformNotification: createNotificationForAllUsers,
};
