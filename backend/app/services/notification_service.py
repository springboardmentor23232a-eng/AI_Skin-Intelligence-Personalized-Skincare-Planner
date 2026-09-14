from datetime import datetime, date, timedelta, time
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, and_
import uuid

from app.models import (
    User, 
    Notification, 
    NotificationPreference, 
    UserProductTracker,
    Routine, 
    RoutineItem, 
    RoutineProfile, 
    DailyChecklistLog, 
    SkinHealthScoreRecord,
    SkinAssessment,
    SkinConcern,
    RiskFactor
)
from app.schemas import (
    NotificationPreferenceUpdate, 
    ProductTrackerCreate
)
from app.services import email_service
from app.logging_config import logger


# --- Preferences Management ---

def get_or_create_preferences(user_id: int, db: Session) -> NotificationPreference:
    """Retrieves user notification preferences or initializes defaults."""
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == user_id).first()
    user = db.query(User).filter(User.id == user_id).first()
    user_role = (user.role or "USER").upper() if user else "USER"
    if not pref:
        pref = NotificationPreference(
            user_id=user_id,
            routine_reminders_enabled=True,
            morning_reminder_time="08:00",
            evening_reminder_time="20:00",
            replenishment_reminders_enabled=True,
            hydration_reminders_enabled=True,
            hydration_interval_hours=4,
            sleep_reminders_enabled=True,
            sleep_reminder_time="22:00",
            progress_alerts_enabled=True,
            platform_announcements_enabled=True,
            # Role-specific In-App preferences
            consultant_client_updates_enabled=True,
            consultant_progress_enabled=True,
            consultant_assessment_enabled=True,
            consultant_routine_enabled=True,
            doctor_patient_alerts_enabled=True,
            doctor_assessment_enabled=True,
            doctor_progress_enabled=True,
            doctor_treatment_enabled=True,
            admin_system_alerts_enabled=True,
            admin_user_alerts_enabled=True,
            admin_analytics_alerts_enabled=True,
            admin_recommendation_alerts_enabled=True,
            admin_reports_alerts_enabled=True,
            # Email preferences (Default False / Opt-in for privacy)
            email_notifications_enabled=False,
            email_routine_enabled=True,
            email_replenishment_enabled=True,
            email_hydration_enabled=True,
            email_sleep_enabled=True,
            email_progress_enabled=True,
            email_platform_enabled=True,
            email_consultant_enabled=True,
            email_doctor_enabled=True,
            email_admin_enabled=True,
            quiet_hours_enabled=False,
            quiet_hours_start="22:30",
            quiet_hours_end="07:00"
        )
        db.add(pref)
        db.commit()
        db.refresh(pref)
    
    # Attach registered email and user role for API response
    setattr(pref, "registered_email", user.email if user else "")
    setattr(pref, "user_role", user_role)
    return pref


def update_preferences(user_id: int, updates: NotificationPreferenceUpdate, db: Session) -> NotificationPreference:
    """
    Updates user notification preferences strictly respecting the authenticated user's role.
    Rejects attempts to submit another role's preference categories with HTTP 400.
    """
    from fastapi import HTTPException, status
    pref = get_or_create_preferences(user_id, db)
    user = db.query(User).filter(User.id == user_id).first()
    user_role = (user.role or "USER").upper() if user else "USER"
    
    # Define permitted fields per role
    user_allowed = {
        "routine_reminders_enabled", "morning_reminder_time", "evening_reminder_time",
        "replenishment_reminders_enabled", "hydration_reminders_enabled", "hydration_interval_hours",
        "sleep_reminders_enabled", "sleep_reminder_time", "progress_alerts_enabled",
        "platform_announcements_enabled", "email_notifications_enabled", "email_routine_enabled",
        "email_replenishment_enabled", "email_hydration_enabled", "email_sleep_enabled",
        "email_progress_enabled", "email_platform_enabled", "quiet_hours_enabled",
        "quiet_hours_start", "quiet_hours_end"
    }
    consultant_allowed = {
        "consultant_client_updates_enabled", "consultant_progress_enabled",
        "consultant_assessment_enabled", "consultant_routine_enabled",
        "platform_announcements_enabled", "email_notifications_enabled",
        "email_consultant_enabled", "email_platform_enabled",
        "quiet_hours_enabled", "quiet_hours_start", "quiet_hours_end"
    }
    doctor_allowed = {
        "doctor_patient_alerts_enabled", "doctor_assessment_enabled",
        "doctor_progress_enabled", "doctor_treatment_enabled",
        "platform_announcements_enabled", "email_notifications_enabled",
        "email_doctor_enabled", "email_platform_enabled",
        "quiet_hours_enabled", "quiet_hours_start", "quiet_hours_end"
    }
    admin_allowed = {
        "admin_system_alerts_enabled", "admin_user_alerts_enabled",
        "admin_analytics_alerts_enabled", "admin_recommendation_alerts_enabled",
        "admin_reports_alerts_enabled", "platform_announcements_enabled",
        "email_notifications_enabled", "email_admin_enabled", "email_platform_enabled",
        "quiet_hours_enabled", "quiet_hours_start", "quiet_hours_end"
    }

    if user_role == "USER":
        allowed_keys = user_allowed
    elif user_role == "CONSULTANT":
        allowed_keys = consultant_allowed
    elif user_role in ("DOCTOR", "DERMATOLOGIST"):
        allowed_keys = doctor_allowed
    elif user_role == "ADMIN":
        allowed_keys = admin_allowed
    else:
        allowed_keys = user_allowed

    update_data = updates.dict(exclude_unset=True)
    
    # Validate against forbidden categories for this role
    for key, value in update_data.items():
        if value is not None and key not in allowed_keys:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Preference category '{key}' is not permitted for role '{user_role}'."
            )

    for key, value in update_data.items():
        if key in allowed_keys and value is not None:
            setattr(pref, key, value)
            
    pref.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(pref)
    
    setattr(pref, "registered_email", user.email if user else "")
    setattr(pref, "user_role", user_role)
    return pref


# --- Notification Core Operations & Strict Role Validation ---

def create_notification(
    user_id: int,
    type: str,
    title: str,
    message: str,
    priority: str = "NORMAL",
    target_role: Optional[str] = None,
    action_url: Optional[str] = None,
    related_entity_type: Optional[str] = None,
    related_entity_id: Optional[int] = None,
    dedup_key: Optional[str] = None,
    expires_at: Optional[datetime] = None,
    db: Session = None
) -> Optional[Notification]:
    """
    Creates a persistent notification with role-based eligibility validation,
    deterministic deduplication, and user preference checks.
    """
    if not db:
        return None

    # Verify recipient user and clearance role
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logger.warning(f"Module 10: Failed to create notification - User #{user_id} not found.")
        return None

    user_role = (user.role or "USER").upper()

    # --- Strict Backend Role Targeting Enforcement ---
    # 1. Personal skincare reminders: ONLY eligible for 'USER' accounts
    PERSONAL_SKINCARE_TYPES = {"ROUTINE", "REPLENISHMENT", "HYDRATION", "SLEEP", "PROGRESS"}
    if type.upper() in PERSONAL_SKINCARE_TYPES and user_role != "USER":
        logger.warning(
            f"Module 10: Blocked personal notification [{type}] for non-USER account #{user_id} (Role: {user_role})."
        )
        return None

    # 2. Consultant queue notifications: ONLY eligible for 'CONSULTANT' accounts
    if type.upper() == "CONSULTANT" and user_role != "CONSULTANT":
        logger.warning(
            f"Module 10: Blocked CONSULTANT notification for user #{user_id} with role '{user_role}'."
        )
        return None

    # 3. Doctor/Dermatologist clinical notifications: ONLY eligible for 'DOCTOR' or 'DERMATOLOGIST'
    if type.upper() == "DOCTOR" and user_role not in ("DOCTOR", "DERMATOLOGIST"):
        logger.warning(
            f"Module 10: Blocked DOCTOR notification for user #{user_id} with role '{user_role}'."
        )
        return None

    # 4. Admin telemetry notifications: ONLY eligible for 'ADMIN'
    if type.upper() == "ADMIN" and user_role != "ADMIN":
        logger.warning(
            f"Module 10: Blocked ADMIN notification for user #{user_id} with role '{user_role}'."
        )
        return None

    # Set target role to user's role if not explicitly provided
    resolved_target_role = target_role.upper() if target_role else user_role

    # Check preference opt-ins
    pref = get_or_create_preferences(user_id, db)
    type_upper = type.upper()
    if type_upper == "ROUTINE" and not pref.routine_reminders_enabled:
        return None
    if type_upper == "REPLENISHMENT" and not pref.replenishment_reminders_enabled:
        return None
    if type_upper == "HYDRATION" and not pref.hydration_reminders_enabled:
        return None
    if type_upper == "SLEEP" and not pref.sleep_reminders_enabled:
        return None
    if type_upper == "PROGRESS" and not pref.progress_alerts_enabled:
        return None
    if type_upper in ("PLATFORM", "CONSULTANT", "DOCTOR", "ADMIN") and not pref.platform_announcements_enabled:
        return None

    # Deterministic Deduplication check
    if dedup_key:
        existing = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.dedup_key == dedup_key
        ).first()
        if existing:
            return existing

    notification = Notification(
        user_id=user_id,
        type=type_upper,
        target_role=resolved_target_role,
        title=title,
        message=message,
        priority=priority,
        action_url=action_url,
        related_entity_type=related_entity_type,
        related_entity_id=related_entity_id,
        dedup_key=dedup_key,
        expires_at=expires_at,
        is_read=False,
        email_delivery_status="NOT_REQUESTED"
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    logger.info(f"Module 10: Created notification #{notification.id} [{type_upper}] for user #{user_id} ({user_role}): {title}")

    # --- Optional Email Delivery Channel Dispatch ---
    # Email is an additional delivery channel, NOT a replacement for in-app notifications.
    if pref.email_notifications_enabled and user.email:
        # Check category-level email permission
        should_send_email = False
        if type_upper == "ROUTINE" and pref.email_routine_enabled:
            should_send_email = True
        elif type_upper == "REPLENISHMENT" and pref.email_replenishment_enabled:
            should_send_email = True
        elif type_upper == "HYDRATION" and pref.email_hydration_enabled:
            should_send_email = True
        elif type_upper == "SLEEP" and pref.email_sleep_enabled:
            should_send_email = True
        elif type_upper == "PROGRESS" and pref.email_progress_enabled:
            should_send_email = True
        elif type_upper == "PLATFORM" and pref.email_platform_enabled:
            should_send_email = True
        elif type_upper == "CONSULTANT" and pref.email_consultant_enabled:
            should_send_email = True
        elif type_upper == "DOCTOR" and pref.email_doctor_enabled:
            should_send_email = True
        elif type_upper == "ADMIN" and pref.email_admin_enabled:
            should_send_email = True

        if should_send_email:
            try:
                recipient_display = user.name if user.name else user.email.split("@")[0]
                email_subject = f"AI Skin Intelligence – {title}"
                sent_ok = email_service.send_notification_email(
                    to_email=user.email,
                    recipient_name=recipient_display,
                    subject=email_subject,
                    title=title,
                    message=message,
                    notification_type=type_upper,
                    action_url=action_url
                )
                if sent_ok:
                    notification.email_delivery_status = "SENT"
                    notification.email_sent_at = datetime.utcnow()
                else:
                    notification.email_delivery_status = "FAILED"
                db.commit()
                db.refresh(notification)
            except Exception as email_err:
                logger.error(f"Email delivery exception for user #{user_id}: {str(email_err)}")
                notification.email_delivery_status = "FAILED"
                db.commit()
                db.refresh(notification)

    return notification


def get_user_notifications(
    user_id: int,
    page: int = 1,
    limit: int = 20,
    type_filter: Optional[str] = None,
    unread_only: bool = False,
    db: Session = None
) -> Dict[str, Any]:
    """Retrieves paginated notifications strictly belonging to the authenticated user."""
    # Synchronize scheduled reminders for user's specific role before querying
    sync_user_reminders(user_id, db)

    query = db.query(Notification).filter(Notification.user_id == user_id)
    
    if type_filter and type_filter.upper() != "ALL":
        query = query.filter(Notification.type == type_filter.upper())
    
    if unread_only:
        query = query.filter(Notification.is_read == False)

    total = query.count()
    unread_count = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()

    notifications = query.order_by(desc(Notification.created_at))\
                         .offset((page - 1) * limit)\
                         .limit(limit)\
                         .all()

    pages = max(1, (total + limit - 1) // limit)

    return {
        "notifications": notifications,
        "total": total,
        "unread_count": unread_count,
        "page": page,
        "pages": pages
    }


def get_unread_count(user_id: int, db: Session) -> int:
    """Lightweight indexed unread count query for header notification bell."""
    return db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()


def mark_as_read(notification_id: int, user_id: int, db: Session) -> bool:
    """Marks a single notification as read (with user isolation check)."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    if not notification:
        return False
    if not notification.is_read:
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        db.commit()
    return True


def mark_all_as_read(user_id: int, db: Session) -> int:
    """Marks all unread notifications for a user as read."""
    unread = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).all()
    now = datetime.utcnow()
    count = len(unread)
    for n in unread:
        n.is_read = True
        n.read_at = now
    db.commit()
    return count


def delete_notification(notification_id: int, user_id: int, db: Session) -> bool:
    """Deletes a notification from user's inbox (with user isolation check)."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    if not notification:
        return False
    db.delete(notification)
    db.commit()
    return True


# --- 1. USER Skincare Evaluators (USER Role Only) ---

def evaluate_routine_reminders(user_id: int, db: Session):
    """Evaluates morning and evening routine completion reminders for USER accounts."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user or (user.role or "USER").upper() != "USER":
        return

    pref = get_or_create_preferences(user_id, db)
    if not pref.routine_reminders_enabled:
        return

    routine = db.query(Routine).filter(Routine.user_id == user_id).order_by(desc(Routine.generated_at)).first()
    if not routine:
        return

    has_am = any(i.routine_type == "MORNING" and i.is_enabled for i in routine.items) if routine.items else False
    has_pm = any(i.routine_type == "EVENING" and i.is_enabled for i in routine.items) if routine.items else False

    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    current_time_str = now.strftime("%H:%M")

    # Check if checklist logged today
    today_start = datetime.combine(now.date(), time.min)
    checklist_today = db.query(DailyChecklistLog).filter(
        DailyChecklistLog.user_id == user_id,
        DailyChecklistLog.logged_at >= today_start
    ).first()

    # Morning reminder
    if has_am and current_time_str >= pref.morning_reminder_time:
        if not checklist_today or checklist_today.completed_count == 0:
            create_notification(
                user_id=user_id,
                type="ROUTINE",
                title="Morning Routine Due",
                message="Time for your morning skincare routine: Complete your cleansing, moisturizer, and broad-spectrum SPF steps.",
                priority="NORMAL",
                target_role="USER",
                action_url="/dashboard/checklist",
                related_entity_type="routine",
                related_entity_id=routine.id,
                dedup_key=f"ROUTINE_AM_{user_id}_{today_str}",
                db=db
            )

    # Evening reminder
    if has_pm and current_time_str >= pref.evening_reminder_time:
        if not checklist_today or checklist_today.completed_count < (checklist_today.total_count or 1):
            create_notification(
                user_id=user_id,
                type="ROUTINE",
                title="Evening Routine Due",
                message="Complete your PM skincare routine before bedtime for nocturnal barrier recovery and skin nourishment.",
                priority="NORMAL",
                target_role="USER",
                action_url="/dashboard/checklist",
                related_entity_type="routine",
                related_entity_id=routine.id,
                dedup_key=f"ROUTINE_PM_{user_id}_{today_str}",
                db=db
            )


def evaluate_replenishment_reminders(user_id: int, db: Session):
    """Evaluates user-configured product replenishment trackers with [ESTIMATED] label for USER accounts."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user or (user.role or "USER").upper() != "USER":
        return

    pref = get_or_create_preferences(user_id, db)
    if not pref.replenishment_reminders_enabled:
        return

    trackers = db.query(UserProductTracker).filter(
        UserProductTracker.user_id == user_id,
        UserProductTracker.is_active == True
    ).all()

    today = date.today()
    for tracker in trackers:
        days_elapsed = (today - tracker.opened_on).days
        cycle = max(1, tracker.cycle_days)
        
        # Trigger when at or above 85% of estimated cycle duration
        if days_elapsed >= int(cycle * 0.85):
            days_left = max(0, cycle - days_elapsed)
            opened_str = tracker.opened_on.strftime("%b %d, %Y")
            
            create_notification(
                user_id=user_id,
                type="REPLENISHMENT",
                title=f"[ESTIMATED] Product Running Low: {tracker.product_name}",
                message=f"[ESTIMATED] Your '{tracker.product_name}' was opened on {opened_str} and has reached {days_elapsed}/{cycle} days of usage (~{days_left} days remaining). Review product recommendations to replenish in advance.",
                priority="NORMAL",
                target_role="USER",
                action_url="/dashboard/recommendations",
                related_entity_type="product_tracker",
                related_entity_id=tracker.id,
                dedup_key=f"REPLENISH_{user_id}_{tracker.id}_{tracker.opened_on}",
                db=db
            )


def evaluate_hydration_reminders(user_id: int, db: Session):
    """Generates daily hydration check-ins for USER accounts based on user's selected interval and profile goal."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user or (user.role or "USER").upper() != "USER":
        return

    pref = get_or_create_preferences(user_id, db)
    if not pref.hydration_reminders_enabled:
        return

    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    current_hour = now.hour

    # Hydration reminders operate during daytime window (09:00 - 20:00)
    if 9 <= current_hour <= 20:
        interval = max(2, min(8, pref.hydration_interval_hours))
        slot_index = (current_hour - 9) // interval
        slot_key = f"slot_{slot_index}"

        profile = db.query(RoutineProfile).filter(RoutineProfile.user_id == user_id).first()
        target_intake = profile.water_intake if profile else "2-3 liters"

        create_notification(
            user_id=user_id,
            type="HYDRATION",
            title="Daily Hydration Check-in",
            message=f"Remember to stay hydrated throughout the day to support skin elasticity and barrier turgor (Your profile target: {target_intake}).",
            priority="LOW",
            target_role="USER",
            action_url="/dashboard/score",
            related_entity_type="hydration",
            dedup_key=f"HYDRATION_{user_id}_{today_str}_{slot_key}",
            db=db
        )


def evaluate_sleep_reminders(user_id: int, db: Session):
    """Generates nocturnal rest & PM routine wind-down reminders for USER accounts."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user or (user.role or "USER").upper() != "USER":
        return

    pref = get_or_create_preferences(user_id, db)
    if not pref.sleep_reminders_enabled:
        return

    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    current_time_str = now.strftime("%H:%M")

    if current_time_str >= pref.sleep_reminder_time:
        create_notification(
            user_id=user_id,
            type="SLEEP",
            title="Night Wind-Down & PM Skincare",
            message="Time to wind down for quality nocturnal rest. Ensure your PM skincare sequence is complete to support cellular repair.",
            priority="LOW",
            target_role="USER",
            action_url="/dashboard/routine",
            related_entity_type="sleep",
            dedup_key=f"SLEEP_{user_id}_{today_str}",
            db=db
        )


def evaluate_progress_alerts(user_id: int, db: Session):
    """Evaluates score improvements and routine milestones for USER accounts."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user or (user.role or "USER").upper() != "USER":
        return

    pref = get_or_create_preferences(user_id, db)
    if not pref.progress_alerts_enabled:
        return

    latest_score = db.query(SkinHealthScoreRecord).filter(
        SkinHealthScoreRecord.user_id == user_id
    ).order_by(desc(SkinHealthScoreRecord.calculated_at)).first()

    if latest_score:
        prev_score = db.query(SkinHealthScoreRecord).filter(
            SkinHealthScoreRecord.user_id == user_id,
            SkinHealthScoreRecord.id < latest_score.id
        ).order_by(desc(SkinHealthScoreRecord.calculated_at)).first()

        if prev_score:
            delta = latest_score.overall_score - prev_score.overall_score
            if delta >= 3:
                create_notification(
                    user_id=user_id,
                    type="PROGRESS",
                    title="Skin Health Score Improved! 🎉",
                    message=f"Great job! Your Skin Health Score increased from {prev_score.overall_score} to {latest_score.overall_score} (+{delta} points).",
                    priority="HIGH",
                    target_role="USER",
                    action_url="/dashboard/progress",
                    related_entity_type="score",
                    related_entity_id=latest_score.id,
                    dedup_key=f"PROGRESS_SCORE_UP_{latest_score.id}",
                    db=db
                )
            elif delta <= -5:
                create_notification(
                    user_id=user_id,
                    type="PROGRESS",
                    title="Skin Health Score Alert",
                    message=f"Your Skin Health Score dropped from {prev_score.overall_score} to {latest_score.overall_score} ({delta} points). Review routine consistency and hydration.",
                    priority="NORMAL",
                    target_role="USER",
                    action_url="/dashboard/progress",
                    related_entity_type="score",
                    related_entity_id=latest_score.id,
                    dedup_key=f"PROGRESS_SCORE_DOWN_{latest_score.id}",
                    db=db
                )


# --- 2. CONSULTANT Role Evaluator ---

def evaluate_consultant_notifications(user_id: int, db: Session):
    """
    Evaluates real client consultation events for CONSULTANT accounts.
    Triggers when real client assessments in the database require review.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user or (user.role or "").upper() != "CONSULTANT":
        return

    pref = get_or_create_preferences(user_id, db)
    if not pref.consultant_client_updates_enabled:
        return

    # Check for real unreviewed client skin assessments in the system
    pending_assessments = db.query(SkinAssessment).filter(
        (SkinAssessment.notes == None) | (SkinAssessment.notes == "")
    ).order_by(desc(SkinAssessment.assessment_date)).limit(5).all()

    for assessment in pending_assessments:
        client_name = assessment.user.name if assessment.user and assessment.user.name else (
            assessment.user.email.split("@")[0] if assessment.user else "Client"
        )
        sorted_concerns = sorted(assessment.concerns, key=lambda c: c.priority) if assessment.concerns else []
        top_concern = sorted_concerns[0].concern_name if sorted_concerns else "Skin Consultation"

        create_notification(
            user_id=user_id,
            type="CONSULTANT",
            title="Client Assessment Pending Review",
            message=f"Client '{client_name}' submitted a diagnostic skin assessment ({top_concern}). Review is pending in your consultant portal.",
            priority="NORMAL",
            target_role="CONSULTANT",
            action_url="/dashboard/consultant",
            related_entity_type="assessment",
            related_entity_id=assessment.id,
            dedup_key=f"CONSULTANT_PENDING_{user_id}_{assessment.id}",
            db=db
        )


# --- 3. DOCTOR / DERMATOLOGIST Role Evaluator ---

def evaluate_doctor_notifications(user_id: int, db: Session):
    """
    Evaluates clinical high-risk events for DOCTOR / DERMATOLOGIST accounts.
    Triggers when real severe skin assessment scans or high-severity concerns are present in the database.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user or (user.role or "").upper() not in ("DOCTOR", "DERMATOLOGIST"):
        return

    pref = get_or_create_preferences(user_id, db)
    if not pref.doctor_patient_alerts_enabled:
        return

    # Find real high-severity assessment records (concern severity >= 3.0 or priority == 'HIGH')
    high_priority_assessments = db.query(SkinAssessment)\
        .join(SkinConcern, SkinAssessment.id == SkinConcern.assessment_id)\
        .filter((SkinConcern.severity >= 3.0) | (SkinConcern.priority == "HIGH"))\
        .distinct()\
        .order_by(desc(SkinAssessment.assessment_date))\
        .limit(5)\
        .all()

    for assessment in high_priority_assessments:
        patient_name = assessment.user.name if assessment.user and assessment.user.name else (
            assessment.user.email.split("@")[0] if assessment.user else "Patient"
        )
        sorted_concerns = sorted(assessment.concerns, key=lambda c: c.severity, reverse=True) if assessment.concerns else []
        top_concern = sorted_concerns[0].concern_name if sorted_concerns else "Skin Barrier Concern"
        top_severity = sorted_concerns[0].severity if sorted_concerns else 3.0

        create_notification(
            user_id=user_id,
            type="DOCTOR",
            title="High-Risk Patient Assessment Alert",
            message=f"Clinical alert: Patient '{patient_name}' recorded high-severity concern ({top_concern}, severity {round(top_severity, 1)}/5.0). Clinical review recommended.",
            priority="HIGH",
            target_role="DOCTOR",
            action_url="/dashboard/dermatologist",
            related_entity_type="assessment",
            related_entity_id=assessment.id,
            dedup_key=f"DOCTOR_HIGHRISK_{user_id}_{assessment.id}",
            db=db
        )


# --- 4. ADMIN Role Evaluator ---

def evaluate_admin_notifications(user_id: int, db: Session):
    """
    Evaluates administrative platform telemetry for ADMIN accounts.
    Generates operational digests based on real database records.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user or (user.role or "").upper() != "ADMIN":
        return

    pref = get_or_create_preferences(user_id, db)
    if not pref.admin_system_alerts_enabled:
        return

    today_str = date.today().strftime("%Y-%m-%d")
    total_users = db.query(User).count()
    total_clients = db.query(User).filter(User.role == "USER").count()
    total_scans = db.query(SkinAssessment).count()
    total_routines = db.query(Routine).count()

    create_notification(
        user_id=user_id,
        type="ADMIN",
        title="Platform Daily Telemetry Digest",
        message=f"Platform status: {total_users} registered users ({total_clients} clients), {total_scans} diagnostic assessments, and {total_routines} active routines recorded. System operational.",
        priority="LOW",
        target_role="ADMIN",
        action_url="/dashboard/admin",
        related_entity_type="system",
        dedup_key=f"ADMIN_DIGEST_{user_id}_{today_str}",
        db=db
    )


# --- Synchronizer & Dispatcher ---

def sync_user_reminders(user_id: int, db: Session):
    """
    Runs on-demand evaluation of scheduled reminders strictly based on the user's authenticated role.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return

    try:
        user_role = (user.role or "USER").upper()

        if user_role == "USER":
            evaluate_routine_reminders(user_id, db)
            evaluate_replenishment_reminders(user_id, db)
            evaluate_hydration_reminders(user_id, db)
            evaluate_sleep_reminders(user_id, db)
            evaluate_progress_alerts(user_id, db)
        elif user_role == "CONSULTANT":
            evaluate_consultant_notifications(user_id, db)
        elif user_role in ("DOCTOR", "DERMATOLOGIST"):
            evaluate_doctor_notifications(user_id, db)
        elif user_role == "ADMIN":
            evaluate_admin_notifications(user_id, db)
    except Exception as e:
        logger.error(f"Error evaluating user #{user_id} ({user.role}) reminders: {str(e)}")


def evaluate_all_active_users(db: Session):
    """Background worker tick evaluating reminders for all registered users according to their respective roles."""
    try:
        users = db.query(User).all()
        for u in users:
            sync_user_reminders(u.id, db)
    except Exception as e:
        logger.error(f"Error in background reminder evaluation tick: {str(e)}")


# --- Admin Broadcast Operations ---

def broadcast_platform_notification(
    admin_user_id: int,
    title: str,
    message: str,
    priority: str = "NORMAL",
    target_role: str = "ALL",
    target_user_id: Optional[int] = None,
    action_url: Optional[str] = None,
    db: Session = None
) -> int:
    """
    Delivers an administrative announcement strictly targeted to selected role(s) or user.
    """
    broadcast_uuid = uuid.uuid4().hex[:8]
    role_clean = (target_role or "ALL").upper().strip()

    if target_user_id:
        target_users = db.query(User).filter(User.id == target_user_id).all()
    elif role_clean == "ALL":
        target_users = db.query(User).all()
    elif role_clean in ("DOCTOR", "DERMATOLOGIST"):
        target_users = db.query(User).filter(User.role.in_(["DOCTOR", "DERMATOLOGIST"])).all()
    else:
        target_users = db.query(User).filter(User.role == role_clean).all()

    count = 0
    for u in target_users:
        n = create_notification(
            user_id=u.id,
            type="PLATFORM",
            title=title,
            message=message,
            priority=priority,
            target_role=role_clean if role_clean != "ALL" else u.role,
            action_url=action_url or "/dashboard",
            related_entity_type="system",
            related_entity_id=admin_user_id,
            dedup_key=f"ADMIN_BROADCAST_{broadcast_uuid}_{u.id}",
            db=db
        )
        if n:
            count += 1

    logger.info(f"Module 10: Admin #{admin_user_id} broadcast '{title}' (target_role={role_clean}) delivered to {count} users.")
    return count


# --- Product Tracker Management ---

def get_user_trackers(user_id: int, db: Session) -> List[Dict[str, Any]]:
    """Retrieves active product replenishment trackers with days elapsed/remaining."""
    trackers = db.query(UserProductTracker).filter(
        UserProductTracker.user_id == user_id,
        UserProductTracker.is_active == True
    ).order_by(desc(UserProductTracker.created_at)).all()

    today = date.today()
    results = []
    for t in trackers:
        days_elapsed = (today - t.opened_on).days
        cycle = max(1, t.cycle_days)
        days_remaining = max(0, cycle - days_elapsed)
        is_imminent = days_elapsed >= int(cycle * 0.85)

        results.append({
            "id": t.id,
            "user_id": t.user_id,
            "routine_item_id": t.routine_item_id,
            "product_name": t.product_name,
            "opened_on": t.opened_on,
            "cycle_days": t.cycle_days,
            "is_active": t.is_active,
            "days_elapsed": days_elapsed,
            "days_remaining": days_remaining,
            "is_depletion_imminent": is_imminent,
            "created_at": t.created_at
        })
    return results


def create_user_tracker(user_id: int, data: ProductTrackerCreate, db: Session) -> UserProductTracker:
    """Creates a new product replenishment tracking entry."""
    tracker = UserProductTracker(
        user_id=user_id,
        product_name=data.product_name,
        opened_on=data.opened_on or date.today(),
        cycle_days=data.cycle_days or 45,
        routine_item_id=data.routine_item_id,
        is_active=True
    )
    db.add(tracker)
    db.commit()
    db.refresh(tracker)
    return tracker


def delete_user_tracker(tracker_id: int, user_id: int, db: Session) -> bool:
    """Removes a product replenishment tracking entry."""
    tracker = db.query(UserProductTracker).filter(
        UserProductTracker.id == tracker_id,
        UserProductTracker.user_id == user_id
    ).first()
    if not tracker:
        return False
    db.delete(tracker)
    db.commit()
    return True
