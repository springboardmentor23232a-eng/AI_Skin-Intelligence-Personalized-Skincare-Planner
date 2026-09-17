/* ==================== GLOWSENSE AI — MODULE 10: NOTIFICATION & REMINDER SYSTEM ==================== */
/* Honest implementation note: this project has no deployable background
   job / cron / push-notification infrastructure available in this
   environment. Reminders here are real, persisted, and evaluated against
   real data — but they are generated when the user opens the app (on
   dashboard load), not pushed at a scheduled wall-clock time. Each
   generator checks a real condition (actual routine/checklist/assessment/
   recommendation data) and de-duplicates against notifications already
   created today/for this trigger, so re-opening the app repeatedly does
   not spam duplicate notifications. Nothing here is a static/fake message
   — every notification is only created when its underlying condition is
   actually true for that user right now. */

import { dataAPI } from './api.js';
import { computeImprovementAnalysis, toDateOnly } from './progressAnalytics.js';

const REPLENISHMENT_REVIEW_DAYS = 30; // proxy for "time to review your product recommendations again" — the schema has no per-product usage/purchase-date tracking to base a truer estimate on.

function alreadyNotifiedToday(existing, type, dedupeKey) {
  const today = toDateOnly(new Date());
  return existing.some(n => n.type === type && n.metadata && n.metadata.dedupeKey === dedupeKey && toDateOnly(n.created_at) === today);
}

/**
 * Evaluates real conditions for this user and creates any notifications
 * that are due and haven't already been created today. Safe to call on
 * every dashboard load — it's a no-op for anything already notified.
 */
export async function generateSessionNotifications(userId) {
  const existing = await dataAPI.getNotifications(userId, 50).catch(() => []);
  const today = toDateOnly(new Date());
  const now = new Date();

  const prefs = await dataAPI.getNotificationPreferences(userId).catch(() => null);
  const routineReminderEnabled = prefs ? prefs.routine_reminder_enabled : true; // default on, matches table default
  const hydrationEnabled = prefs?.hydration_reminder_enabled;
  const sleepEnabled = prefs?.sleep_reminder_enabled;

  await Promise.allSettled([
    routineReminderEnabled ? checkRoutineReminder(userId, existing, today) : Promise.resolve(),
    checkReplenishmentReminder(userId, existing, today),
    hydrationEnabled ? checkTimeBasedReminder(userId, existing, today, now, 'hydration', prefs.hydration_reminder_time, 'Stay Hydrated', 'A reminder to drink water — hydration supports the skin barrier your routine is working on.') : Promise.resolve(),
    sleepEnabled ? checkTimeBasedReminder(userId, existing, today, now, 'sleep', prefs.sleep_reminder_time, 'Wind Down for Sleep', 'It\'s close to your set bedtime — good sleep is one of the lifestyle factors behind your Skin Health Score.') : Promise.resolve(),
    checkProgressAlert(userId, existing),
  ]);
}

async function checkRoutineReminder(userId, existing, today) {
  const dedupeKey = `routine-${today}`;
  if (alreadyNotifiedToday(existing, 'routine_reminder', dedupeKey)) return;

  const routine = await dataAPI.getLatestRoutine(userId).catch(() => null);
  if (!routine) return;
  const totalSteps = (routine.morning_routine || []).length + (routine.evening_routine || []).length;
  if (totalSteps === 0) return;

  const todaysCompletions = await dataAPI.getRoutineCompletions(userId, routine.id, today).catch(() => []);
  const completedCount = todaysCompletions.filter(c => c.completed).length;
  if (completedCount >= totalSteps) return; // already fully done today, nothing to remind about

  // Only remind in the evening if some steps are still outstanding, to avoid nagging first thing in the morning before the day's routine window has even passed.
  const hour = new Date().getHours();
  if (hour < 18) return;

  await dataAPI.createNotification({
    user_id: userId,
    type: 'routine_reminder',
    title: 'Finish Today\'s Skincare Routine',
    message: `You've completed ${completedCount} of ${totalSteps} routine steps today. Don't forget the rest before bed.`,
    metadata: { dedupeKey },
  }).catch(() => {});
}

async function checkReplenishmentReminder(userId, existing, today) {
  const dedupeKey = `replenishment-${today}`;
  if (alreadyNotifiedToday(existing, 'replenishment', dedupeKey)) return;

  const recs = await dataAPI.getProductRecommendations(userId).catch(() => []);
  if (!recs || recs.length === 0) return;

  const mostRecent = recs.reduce((latest, r) => (!latest || new Date(r.created_at) > new Date(latest.created_at)) ? r : latest, null);
  if (!mostRecent) return;

  const ageDays = (Date.now() - new Date(mostRecent.created_at).getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays < REPLENISHMENT_REVIEW_DAYS) return;

  await dataAPI.createNotification({
    user_id: userId,
    type: 'replenishment',
    title: 'Time to Review Your Products',
    message: `It's been over ${REPLENISHMENT_REVIEW_DAYS} days since your last product recommendations — worth checking if it's time to restock or re-run your assessment.`,
    metadata: { dedupeKey },
  }).catch(() => {});
}

async function checkTimeBasedReminder(userId, existing, today, now, type, timeStr, title, message) {
  if (!timeStr) return;
  const dedupeKey = `${type}-${today}`;
  if (alreadyNotifiedToday(existing, type, dedupeKey)) return;

  const [h, m] = timeStr.split(':').map(Number);
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  if (now < target) return; // not time yet today

  await dataAPI.createNotification({ user_id: userId, type, title, message, metadata: { dedupeKey } }).catch(() => {});
}

async function checkProgressAlert(userId, existing) {
  const assessments = await dataAPI.getAssessments(userId).catch(() => []);
  if (!assessments || assessments.length < 2) return;

  const latest = assessments[0];
  const previous = assessments[1];
  const dedupeKey = `progress-${previous.id}-${latest.id}`;
  if (existing.some(n => n.type === 'progress_alert' && n.metadata && n.metadata.dedupeKey === dedupeKey)) return;

  const [latestConcerns, previousConcerns] = await Promise.all([
    dataAPI.getConcerns(latest.id).catch(() => []),
    dataAPI.getConcerns(previous.id).catch(() => []),
  ]);
  const analysis = computeImprovementAnalysis(previous, previousConcerns, latest, latestConcerns);
  if (!analysis || analysis.overallStatus !== 'improved') return; // only alert on genuine improvement milestones, not every assessment

  const changeText = analysis.scoreChange > 0 ? `+${analysis.scoreChange}` : `${analysis.scoreChange}`;
  await dataAPI.createNotification({
    user_id: userId,
    type: 'progress_alert',
    title: 'Your Skin Health Score Improved',
    message: `Your Skin Health Score changed by ${changeText} since your last assessment. Keep it up!`,
    metadata: { dedupeKey },
  }).catch(() => {});
}
