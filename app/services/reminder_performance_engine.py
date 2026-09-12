import asyncio
import logging
from datetime import date, datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import (
    User, SkinProfile, RoutineCheckin, SkincareRoutine,
    AssessmentHistory, ClinicalRecommendation, UserReminderLog
)
from app.services.notification_service import dispatch_user_reminder

logger = logging.getLogger("skincare_api")


def get_last_reminder_time(user_id: int, reminder_type: str, db: Session) -> Optional[datetime]:
    """Returns the datetime when this reminder type was last dispatched to the user."""
    log = (
        db.query(UserReminderLog)
        .filter(
            UserReminderLog.user_id == user_id,
            UserReminderLog.reminder_type == reminder_type,
            UserReminderLog.status.in_(["sent", "simulated"])
        )
        .order_by(UserReminderLog.sent_at.desc())
        .first()
    )
    return log.sent_at if log else None


def is_within_cooldown(last_sent: Optional[datetime], cooldown_hours: int) -> bool:
    """Checks if the reminder is still in cooldown to prevent repeated emails."""
    if not last_sent:
        return False
    # Ensure timezone awareness
    if last_sent.tzinfo is None:
        last_sent = last_sent.replace(tzinfo=timezone.utc)
    return (datetime.now(timezone.utc) - last_sent) < timedelta(hours=cooldown_hours)


def evaluate_user_performance_and_remind(user: User, db: Session) -> List[Dict[str, Any]]:
    """
    Evaluates an individual user's performance metrics and triggers
    appropriate automated email reminders.
    """
    results = []
    if not user.push_notifications_email:
        logger.debug("User %s has push_notifications_email disabled. Skipping.", user.email)
        return results

    now_utc = datetime.now(timezone.utc)
    today_str = date.today().isoformat()
    current_hour = datetime.now().hour  # local server hour

    profile: Optional[SkinProfile] = db.query(SkinProfile).filter(SkinProfile.user_id == user.id).first()
    routine: Optional[SkincareRoutine] = db.query(SkincareRoutine).filter(SkincareRoutine.user_id == user.id).first()

    # -----------------------------------------------------------------------
    # 1. Routine Performance Check (Morning & Evening check-ins)
    # -----------------------------------------------------------------------
    today_checkin = (
        db.query(RoutineCheckin)
        .filter(RoutineCheckin.user_id == user.id, RoutineCheckin.checkin_date == today_str)
        .first()
    )

    last_routine_reminder = get_last_reminder_time(user.id, "routine", db)

    # Morning check-in missed (evaluated between 11:00 AM and 5:00 PM)
    if current_hour >= 11 and current_hour < 17:
        if not today_checkin or not today_checkin.morning_completed:
            if not is_within_cooldown(last_routine_reminder, cooldown_hours=18):
                res = dispatch_user_reminder(
                    user=user,
                    reminder_type="routine",
                    trigger_reason="Morning skincare regimen incomplete by midday.",
                    extra_data={"time_of_day": "morning"},
                    db=db
                )
                results.append(res)

    # Evening check-in missed (evaluated between 7:00 PM and 11:59 PM)
    elif current_hour >= 19:
        if not today_checkin or not today_checkin.evening_completed:
            if not is_within_cooldown(last_routine_reminder, cooldown_hours=12):
                res = dispatch_user_reminder(
                    user=user,
                    reminder_type="routine",
                    trigger_reason="Evening skin barrier restoration routine incomplete tonight.",
                    extra_data={"time_of_day": "evening"},
                    db=db
                )
                results.append(res)

    # -----------------------------------------------------------------------
    # 2. Product Replenishment Check (30+ / 60+ days routine active)
    # -----------------------------------------------------------------------
    last_replenish_reminder = get_last_reminder_time(user.id, "replenishment", db)
    if routine and not is_within_cooldown(last_replenish_reminder, cooldown_hours=168):  # 7-day cooldown
        routine_age_days = (now_utc - (routine.created_at or now_utc)).days
        if routine_age_days >= 30:
            res = dispatch_user_reminder(
                user=user,
                reminder_type="replenishment",
                trigger_reason=f"Active routine ongoing for {routine_age_days} days. Restocking daily cleanser and SPF recommended.",
                extra_data={"product_name": "Daily Essential Cleanser & Barrier Moisturizer"},
                db=db
            )
            results.append(res)

    # -----------------------------------------------------------------------
    # 3. Hydration Performance Check (low water intake reported)
    # -----------------------------------------------------------------------
    last_hydration_reminder = get_last_reminder_time(user.id, "hydration", db)
    if profile and not is_within_cooldown(last_hydration_reminder, cooldown_hours=72):  # 3-day cooldown
        water_val = (profile.water_intake or "").lower()
        if "less" in water_val or "1l" in water_val or (profile.skin_health_score and profile.skin_health_score < 55):
            res = dispatch_user_reminder(
                user=user,
                reminder_type="hydration",
                trigger_reason="Water intake baseline is low (<1.5L/day), impacting epidermal moisture retention.",
                extra_data={"target_water": "2.5 Liters Daily"},
                db=db
            )
            results.append(res)

    # -----------------------------------------------------------------------
    # 4. Sleep Recovery Performance Check (poor sleep reported)
    # -----------------------------------------------------------------------
    last_sleep_reminder = get_last_reminder_time(user.id, "sleep", db)
    if profile and not is_within_cooldown(last_sleep_reminder, cooldown_hours=72):  # 3-day cooldown
        sleep_val = (profile.sleep_quality or "").lower()
        if "poor" in sleep_val or "fair" in sleep_val or "less" in sleep_val:
            res = dispatch_user_reminder(
                user=user,
                reminder_type="sleep",
                trigger_reason="Sleep duration logged as insufficient for optimal night-time collagen synthesis.",
                extra_data={"target_hours": "7.5 to 8 Hours"},
                db=db
            )
            results.append(res)

    # -----------------------------------------------------------------------
    # 5. Progress Alert Check (score improvements or assessment overdue)
    # -----------------------------------------------------------------------
    last_progress_reminder = get_last_reminder_time(user.id, "progress", db)
    if not is_within_cooldown(last_progress_reminder, cooldown_hours=120):  # 5-day cooldown
        assessments: List[AssessmentHistory] = (
            db.query(AssessmentHistory)
            .filter(AssessmentHistory.user_id == user.id)
            .order_by(AssessmentHistory.assessment_date.desc())
            .limit(2)
            .all()
        )
        if len(assessments) >= 2:
            latest, previous = assessments[0], assessments[1]
            diff = latest.skin_health_score - previous.skin_health_score
            if diff >= 3:
                res = dispatch_user_reminder(
                    user=user,
                    reminder_type="progress",
                    trigger_reason=f"Skin Health Score climbed by +{diff} points to {latest.skin_health_score} ({latest.skin_health_category})!",
                    extra_data={"score_delta": f"+{diff} pts"},
                    db=db
                )
                results.append(res)
        elif len(assessments) == 1:
            days_since = (now_utc - assessments[0].assessment_date).days
            if days_since >= 14:
                res = dispatch_user_reminder(
                    user=user,
                    reminder_type="progress",
                    trigger_reason=f"Last skin scan was {days_since} days ago. Time for a 14-day progress scan!",
                    extra_data={"score_delta": "Assessment Due"},
                    db=db
                )
                results.append(res)

    # -----------------------------------------------------------------------
    # 6. Platform Notifications Check (new clinical recommendations)
    # -----------------------------------------------------------------------
    last_platform_reminder = get_last_reminder_time(user.id, "platform", db)
    if not is_within_cooldown(last_platform_reminder, cooldown_hours=48):  # 2-day cooldown
        recent_recommendation = (
            db.query(ClinicalRecommendation)
            .filter(
                ClinicalRecommendation.user_id == user.id,
                ClinicalRecommendation.created_at >= now_utc - timedelta(days=2)
            )
            .order_by(ClinicalRecommendation.created_at.desc())
            .first()
        )
        if recent_recommendation:
            res = dispatch_user_reminder(
                user=user,
                reminder_type="platform",
                trigger_reason=f"New clinical guidance issued: '{recent_recommendation.diagnosis_title}'.",
                extra_data={"message": f"Your dermatologist has provided a new treatment plan: {recent_recommendation.diagnosis_title}."},
                db=db
            )
            results.append(res)

    return results


def run_automated_performance_audit_for_all_users() -> Dict[str, Any]:
    """
    Scans all approved users in PostgreSQL, evaluates their metrics,
    and dispatches performance-based email reminders.
    """
    db = SessionLocal()
    try:
        users = db.query(User).filter(User.status == "approved").all()
        total_evaluated = 0
        reminders_dispatched = 0
        details = []

        for u in users:
            if getattr(u, "push_notifications_email", True):
                total_evaluated += 1
                user_results = evaluate_user_performance_and_remind(u, db)
                if user_results:
                    reminders_dispatched += len(user_results)
                    details.append({
                        "user_id": u.id,
                        "email": u.email,
                        "reminders": user_results
                    })

        logger.info(
            "Automated performance audit complete. Evaluated: %d users, Reminders dispatched: %d",
            total_evaluated, reminders_dispatched
        )
        return {
            "success": True,
            "evaluated_users": total_evaluated,
            "reminders_dispatched": reminders_dispatched,
            "details": details
        }
    except Exception as exc:
        logger.error("Error during automated performance audit: %s", exc)
        return {"success": False, "error": str(exc)}
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Background Async Loop for Periodic Automated Reminders
# ---------------------------------------------------------------------------
async def background_reminder_worker(interval_seconds: int = 3600):
    """
    Background worker that runs periodically (e.g. every hour) to audit
    user performance and send timely email reminders.
    """
    logger.info("Background reminder worker initialized (interval: %d seconds).", interval_seconds)
    # Allow application startup to settle
    await asyncio.sleep(15)

    while True:
        try:
            logger.info("Running scheduled performance-based reminder evaluation...")
            # Run CPU/DB synchronous audit in executor to avoid blocking event loop
            loop = asyncio.get_running_loop()
            await loop.run_in_executor(None, run_automated_performance_audit_for_all_users)
        except Exception as exc:
            logger.error("Error in background reminder worker loop: %s", exc)

        await asyncio.sleep(interval_seconds)
