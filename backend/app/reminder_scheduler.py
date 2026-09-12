"""
Module 10 Phase 3 — Automatic In-App Notification Scheduler
-------------------------------------------------------------
Uses APScheduler BackgroundScheduler (sync) to periodically evaluate
reminder conditions and create Notification records for eligible users.

Scheduler runs every 5 minutes. The scheduler starts with the FastAPI app
and shuts down cleanly on application exit.

Reminder types implemented:
  - routine_reminder       (routine not completed, reminder time reached)
  - hydration              (below daily goal, interval elapsed)
  - sleep                  (no sleep logged, reminder time reached)
  - product_replenishment  (product due/overdue for replenishment)
  - progress_alert         (score changed meaningfully since last alert)

Duplicate prevention strategy:
  - Each generated Notification stores a deduplication key in notification_metadata
    under the key "dedup_key".
  - Before inserting, has_recent_notification() queries for an existing undismissed
    notification with the same dedup_key within the relevant window (same day or
    same week depending on type). No duplicate is inserted if one already exists.
  - ReminderSchedule.last_sent_at is updated after each delivery to support
    interval-based reminders (hydration).
"""

import logging
from datetime import date, datetime, timedelta
from typing import Optional

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app import models

logger = logging.getLogger(__name__)

# ------------------------------------------------------------------ #
#  Scheduler singleton — created once in main.py                      #
# ------------------------------------------------------------------ #
_scheduler: Optional[BackgroundScheduler] = None


def get_scheduler() -> BackgroundScheduler:
    """Return the module-level scheduler instance (or create one)."""
    global _scheduler
    if _scheduler is None:
        _scheduler = BackgroundScheduler(
            job_defaults={"coalesce": True, "max_instances": 1},
            timezone="UTC",
        )
    return _scheduler


def start_scheduler() -> None:
    """Start the scheduler and register the 5-minute reminder job."""
    scheduler = get_scheduler()
    if scheduler.running:
        logger.warning("Scheduler already running — not starting again.")
        return

    scheduler.add_job(
        func=_run_reminder_check,
        trigger=IntervalTrigger(minutes=5),
        id="check_reminders",
        name="Check and generate in-app reminders",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Reminder scheduler started (interval: 5 minutes).")


def stop_scheduler() -> None:
    """Shut down the scheduler cleanly."""
    scheduler = get_scheduler()
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Reminder scheduler stopped.")


# ------------------------------------------------------------------ #
#  Top-level check — called by scheduler AND by POST /reminders/check  #
# ------------------------------------------------------------------ #

def check_and_generate_reminders(db: Session) -> dict:
    """
    Evaluate reminder conditions for ALL active users and insert
    Notification records where needed.

    Returns a summary dict: {"created": int, "skipped": int, "errors": int}.
    """
    created = 0
    skipped = 0
    errors = 0

    try:
        users = db.query(models.User).all()
    except Exception as exc:
        logger.error("Failed to query users for reminder check: %s", exc)
        return {"created": 0, "skipped": 0, "errors": 1}

    for user in users:
        try:
            prefs = _get_or_create_prefs(db, user.id)

            c, s = _check_routine_reminder(db, user, prefs)
            created += c; skipped += s

            c, s = _check_hydration_reminder(db, user, prefs)
            created += c; skipped += s

            c, s = _check_sleep_reminder(db, user, prefs)
            created += c; skipped += s

            c, s = _check_product_replenishment(db, user, prefs)
            created += c; skipped += s

            c, s = _check_progress_alert(db, user, prefs)
            created += c; skipped += s

        except Exception as exc:
            logger.error("Error processing reminders for user %s: %s", user.id, exc)
            errors += 1

    logger.info(
        "Reminder check complete — created: %d, skipped: %d, errors: %d",
        created, skipped, errors,
    )
    return {"created": created, "skipped": skipped, "errors": errors}


def check_reminders_for_user(db: Session, user_id: int) -> dict:
    """
    Run reminder check for a SINGLE user (used by the API endpoint for
    self-service or admin-triggered checks).
    """
    created = 0
    skipped = 0
    errors = 0

    try:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            return {"created": 0, "skipped": 0, "errors": 1}

        prefs = _get_or_create_prefs(db, user.id)

        for fn in (
            _check_routine_reminder,
            _check_hydration_reminder,
            _check_sleep_reminder,
            _check_product_replenishment,
            _check_progress_alert,
        ):
            try:
                c, s = fn(db, user, prefs)
                created += c
                skipped += s
            except Exception as exc:
                logger.error("Error in %s for user %s: %s", fn.__name__, user_id, exc)
                errors += 1

    except Exception as exc:
        logger.error("check_reminders_for_user failed for user %s: %s", user_id, exc)
        errors += 1

    return {"created": created, "skipped": skipped, "errors": errors}


# ------------------------------------------------------------------ #
#  APScheduler job — wraps check_and_generate_reminders with its own  #
#  DB session so it runs independently from request sessions.          #
# ------------------------------------------------------------------ #

def _run_reminder_check() -> None:
    db: Session = SessionLocal()
    try:
        result = check_and_generate_reminders(db)
        logger.debug("Scheduled reminder check result: %s", result)
    except Exception as exc:
        logger.error("Unhandled error in scheduled reminder check: %s", exc)
    finally:
        db.close()


# ------------------------------------------------------------------ #
#  Duplicate-prevention helper                                         #
# ------------------------------------------------------------------ #

def has_recent_notification(
    db: Session,
    user_id: int,
    dedup_key: str,
    window_hours: int = 20,
) -> bool:
    """
    Return True if an undismissed notification with this dedup_key was
    already created within the last `window_hours` hours for this user.

    dedup_key is stored in notification_metadata->>'dedup_key'.
    Using a 20-hour window for daily reminders prevents re-triggering
    within the same day even if the scheduler fires multiple times.
    """
    since = datetime.utcnow() - timedelta(hours=window_hours)
    existing = (
        db.query(models.Notification)
        .filter(
            models.Notification.user_id == user_id,
            models.Notification.is_dismissed == False,
            models.Notification.created_at >= since,
            models.Notification.notification_metadata["dedup_key"].as_string() == dedup_key,
        )
        .first()
    )
    return existing is not None


def _create_notification(
    db: Session,
    user_id: int,
    ntype: str,
    title: str,
    message: str,
    dedup_key: str,
    action_url: Optional[str] = None,
    extra_metadata: Optional[dict] = None,
    window_hours: int = 20,
) -> bool:
    """
    Insert a Notification if no duplicate exists within window_hours.
    Returns True if created, False if skipped.
    """
    if has_recent_notification(db, user_id, dedup_key, window_hours):
        return False

    metadata = {"dedup_key": dedup_key}
    if extra_metadata:
        metadata.update(extra_metadata)

    notification = models.Notification(
        user_id=user_id,
        type=ntype,
        title=title,
        message=message,
        action_url=action_url,
        is_read=False,
        is_dismissed=False,
        notification_metadata=metadata,
    )
    db.add(notification)
    db.commit()
    return True


# ------------------------------------------------------------------ #
#  Preference helper                                                   #
# ------------------------------------------------------------------ #

def _get_or_create_prefs(db: Session, user_id: int) -> models.NotificationPreference:
    prefs = (
        db.query(models.NotificationPreference)
        .filter(models.NotificationPreference.user_id == user_id)
        .first()
    )
    if not prefs:
        prefs = models.NotificationPreference(user_id=user_id)
        db.add(prefs)
        db.commit()
        db.refresh(prefs)
    return prefs


# ------------------------------------------------------------------ #
#  REMINDER: Routine                                                   #
# ------------------------------------------------------------------ #

def _check_routine_reminder(
    db: Session, user: models.User, prefs: models.NotificationPreference
) -> tuple[int, int]:
    """
    Generate a routine reminder if:
      - routine_reminders is enabled
      - a reminder time is configured and the current UTC hour matches it
      - today's RoutineLog either doesn't exist or shows incomplete completion
    """
    if not prefs.routine_reminders:
        return 0, 1  # preference disabled — skip

    # Only fire if a time is configured and we're at/past that hour (UTC)
    if prefs.routine_reminder_time is not None:
        now_hour = datetime.utcnow().hour
        if now_hour != prefs.routine_reminder_time.hour:
            return 0, 1

    today = date.today()
    log = (
        db.query(models.RoutineLog)
        .filter(
            models.RoutineLog.user_id == user.id,
            models.RoutineLog.log_date == today,
        )
        .first()
    )

    # If log exists and every step is done, skip
    if log and log.total_count > 0 and log.completed_count >= log.total_count:
        return 0, 1

    dedup_key = f"routine_reminder:{user.id}:{today.isoformat()}"
    created = _create_notification(
        db=db,
        user_id=user.id,
        ntype="routine_reminder",
        title="Routine Reminder",
        message="Your skincare routine is waiting. Complete today's routine to stay consistent.",
        dedup_key=dedup_key,
        action_url="/dashboard/user/routine",
    )
    return (1, 0) if created else (0, 1)


# ------------------------------------------------------------------ #
#  REMINDER: Hydration                                                 #
# ------------------------------------------------------------------ #

def _check_hydration_reminder(
    db: Session, user: models.User, prefs: models.NotificationPreference
) -> tuple[int, int]:
    """
    Generate a hydration reminder if:
      - hydration_reminders is enabled
      - the configured interval has elapsed since last hydration reminder
      - today's logged glasses < daily goal
    """
    if not prefs.hydration_reminders:
        return 0, 1

    goal = prefs.hydration_goal_glasses or 8
    interval_hours = prefs.hydration_reminder_interval_hours or 2

    # Check today's hydration log
    today = date.today()
    log = (
        db.query(models.HydrationLog)
        .filter(
            models.HydrationLog.user_id == user.id,
            models.HydrationLog.log_date == today,
        )
        .first()
    )
    logged_glasses = log.quantity_glasses if log else 0.0
    if logged_glasses >= goal:
        return 0, 1  # Goal already met

    # Use interval_hours window for dedup key (keyed to current interval slot)
    now = datetime.utcnow()
    # Slot: floor current hour to nearest interval boundary
    slot = (now.hour // interval_hours) * interval_hours
    dedup_key = f"hydration:{user.id}:{today.isoformat()}:slot{slot}"

    created = _create_notification(
        db=db,
        user_id=user.id,
        ntype="hydration",
        title="Hydration Reminder",
        message=(
            f"Time to drink some water! You have logged {logged_glasses:.1f} of "
            f"{goal} glasses today. Keep your hydration on track."
        ),
        dedup_key=dedup_key,
        action_url="/dashboard/user",
        window_hours=interval_hours,
    )
    return (1, 0) if created else (0, 1)


# ------------------------------------------------------------------ #
#  REMINDER: Sleep                                                     #
# ------------------------------------------------------------------ #

def _check_sleep_reminder(
    db: Session, user: models.User, prefs: models.NotificationPreference
) -> tuple[int, int]:
    """
    Generate a sleep reminder if:
      - sleep_reminders is enabled
      - a reminder time is configured and the current UTC hour matches it
      - no sleep log exists for today
    """
    if not prefs.sleep_reminders:
        return 0, 1

    if prefs.sleep_reminder_time is not None:
        now_hour = datetime.utcnow().hour
        if now_hour != prefs.sleep_reminder_time.hour:
            return 0, 1

    today = date.today()
    log = (
        db.query(models.SleepLog)
        .filter(
            models.SleepLog.user_id == user.id,
            models.SleepLog.log_date == today,
        )
        .first()
    )
    if log:
        return 0, 1  # Already logged today's sleep

    dedup_key = f"sleep:{user.id}:{today.isoformat()}"
    created = _create_notification(
        db=db,
        user_id=user.id,
        ntype="sleep",
        title="Sleep Reminder",
        message=(
            f"Wind down for the night and aim for your "
            f"{prefs.sleep_goal_hours:.0f}-hour sleep goal. "
            "Good sleep supports healthy skin."
        ),
        dedup_key=dedup_key,
        action_url="/dashboard/user",
    )
    return (1, 0) if created else (0, 1)


# ------------------------------------------------------------------ #
#  REMINDER: Product Replenishment                                     #
# ------------------------------------------------------------------ #

def _check_product_replenishment(
    db: Session, user: models.User, prefs: models.NotificationPreference
) -> tuple[int, int]:
    """
    Generate product replenishment notifications for purchases whose
    estimated_replenishment_date is within the reminder window or overdue.
    One notification per product per day (dedup_key includes the date).
    """
    if not prefs.product_reminders:
        return 0, 1

    today = date.today()
    reminder_window = today + timedelta(days=prefs.product_reminder_days_before or 7)

    purchases = (
        db.query(models.ProductPurchase)
        .filter(
            models.ProductPurchase.user_id == user.id,
            models.ProductPurchase.estimated_replenishment_date.isnot(None),
            models.ProductPurchase.actual_replenishment_date.is_(None),
            models.ProductPurchase.estimated_replenishment_date <= reminder_window,
        )
        .all()
    )

    created_total = 0
    skipped_total = 0

    for purchase in purchases:
        rep_date = purchase.estimated_replenishment_date
        is_overdue = rep_date < today
        days_diff = (today - rep_date).days if is_overdue else (rep_date - today).days

        if is_overdue:
            msg = (
                f"Your {purchase.product_name} was due for replenishment "
                f"{days_diff} day{'s' if days_diff != 1 else ''} ago. "
                "Consider restocking soon."
            )
            title = "Product Overdue"
        else:
            msg = (
                f"Your {purchase.product_name} may need replenishment in "
                f"{days_diff} day{'s' if days_diff != 1 else ''}."
            )
            title = "Product Replenishment"

        # Daily dedup key per product purchase
        dedup_key = f"product_replenishment:{user.id}:{purchase.id}:{today.isoformat()}"

        created = _create_notification(
            db=db,
            user_id=user.id,
            ntype="product_replenishment",
            title=title,
            message=msg,
            dedup_key=dedup_key,
            action_url="/dashboard/user/products",
            extra_metadata={
                "purchase_id": purchase.id,
                "product_name": purchase.product_name,
                "estimated_replenishment_date": rep_date.isoformat(),
            },
        )
        if created:
            created_total += 1
        else:
            skipped_total += 1

    return created_total, skipped_total


# ------------------------------------------------------------------ #
#  REMINDER: Progress Alert                                            #
# ------------------------------------------------------------------ #

def _check_progress_alert(
    db: Session, user: models.User, prefs: models.NotificationPreference
) -> tuple[int, int]:
    """
    Generate a progress alert based on the user's assessment history:
      - Improved: latest score is >5 pts higher than the second-latest
      - Needs attention: latest score is <60 or dropped >5 pts
    Frequency is governed by progress_alert_frequency preference:
      daily=24h, weekly=168h, monthly=720h dedup window.
    """
    if not prefs.progress_alerts:
        return 0, 1

    # Map frequency to dedup window in hours
    freq_map = {"daily": 24, "weekly": 168, "monthly": 720}
    window_hours = freq_map.get(prefs.progress_alert_frequency, 168)

    assessments = (
        db.query(models.Assessment)
        .filter(models.Assessment.user_id == user.id)
        .order_by(models.Assessment.assessment_time.desc())
        .limit(2)
        .all()
    )

    if not assessments:
        return 0, 1  # No assessments yet

    latest_score = assessments[0].health_score
    today_str = date.today().isoformat()

    if len(assessments) >= 2:
        previous_score = assessments[1].health_score
        diff = latest_score - previous_score

        if diff > 5:
            title = "Progress Update 🎉"
            message = (
                f"Your skin-health score improved by {diff} points to {latest_score}/100. "
                "Keep following your routine — it's working!"
            )
            alert_variant = "improved"
        elif diff < -5 or latest_score < 60:
            title = "Progress Alert"
            message = (
                f"Your skin-health score is {latest_score}/100. "
                "Review your routine and recommendations to get back on track."
            )
            alert_variant = "needs_attention"
        else:
            return 0, 1  # Stable — no alert needed
    else:
        # Only one assessment — send a baseline notification once
        title = "Baseline Score Recorded"
        message = (
            f"Your initial skin-health score is {latest_score}/100. "
            "Complete your routine daily to track your progress."
        )
        alert_variant = "baseline"

    dedup_key = f"progress_alert:{user.id}:{alert_variant}:{today_str}"
    created = _create_notification(
        db=db,
        user_id=user.id,
        ntype="progress_alert",
        title=title,
        message=message,
        dedup_key=dedup_key,
        action_url="/dashboard/user/progress",
        extra_metadata={"latest_score": latest_score, "variant": alert_variant},
        window_hours=window_hours,
    )
    return (1, 0) if created else (0, 1)
