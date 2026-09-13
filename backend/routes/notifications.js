const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth');
const {
  ensureNotificationTable,
  getNotificationsForUser,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  generateUserNotifications,
  createNotificationForAllUsers,
  getUserNotificationPreferences,
  updateUserNotificationPreferences,
  getReminderTimerSummary,
} = require('../services/notificationService');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res, next) => {
  try {
    await ensureNotificationTable();
    const notifications = await getNotificationsForUser(req.user.id, { limit: 50 });
    return res.json({ success: true, notifications });
  } catch (error) {
    return next(error);
  }
});

router.get('/unread-count', async (req, res, next) => {
  try {
    await ensureNotificationTable();
    const count = await getUnreadCount(req.user.id);
    return res.json({ success: true, count });
  } catch (error) {
    return next(error);
  }
});

router.get('/preferences', async (req, res, next) => {
  try {
    await ensureNotificationTable();
    const preferences = await getUserNotificationPreferences(req.user.id);
    return res.json({ success: true, preferences });
  } catch (error) {
    return next(error);
  }
});

router.put('/preferences', async (req, res, next) => {
  try {
    await ensureNotificationTable();
    const preferences = await updateUserNotificationPreferences(req.user.id, req.body || {});
    return res.json({ success: true, preferences });
  } catch (error) {
    return next(error);
  }
});

router.get('/timers', async (req, res, next) => {
  try {
    await ensureNotificationTable();
    const timers = await getReminderTimerSummary(req.user.id);
    return res.json({ success: true, timers });
  } catch (error) {
    return next(error);
  }
});

router.post('/generate', async (req, res, next) => {
  try {
    await ensureNotificationTable();
    const notifications = await generateUserNotifications(req.user.id);
    return res.json({ success: true, generated: notifications.length, notifications });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    await ensureNotificationTable();
    const notification = await markNotificationRead(req.params.id, req.user.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    return res.json({ success: true, notification });
  } catch (error) {
    return next(error);
  }
});

router.patch('/mark-all-read', async (req, res, next) => {
  try {
    await ensureNotificationTable();
    const notifications = await markAllNotificationsRead(req.user.id);
    return res.json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    return next(error);
  }
});

router.post('/platform', requireRole('admin'), async (req, res, next) => {
  try {
    const { title, message, type = 'platform_notification' } = req.body || {};
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }
    await ensureNotificationTable();
    const notifications = await createNotificationForAllUsers({
      type,
      title,
      message,
      metadata: { source: 'platform_broadcast', created_by: req.user.id },
    });
    return res.json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
