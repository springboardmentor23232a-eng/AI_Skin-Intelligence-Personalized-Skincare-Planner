from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from app.database import get_db
from app.schemas import (
    NotificationListResponse,
    NotificationMarkReadResponse,
    ReminderPreferencesSchema,
    ProductReplenishmentResponse,
    HydrationLogRequest,
    HydrationLogResponse,
    SleepLogRequest,
    SleepLogResponse
)
from app.services.notification_service import (
    get_user_notifications,
    mark_notification_as_read,
    mark_all_notifications_as_read,
    get_user_reminder_preferences,
    update_user_reminder_preferences,
    get_user_product_replenishments,
    log_hydration_intake,
    log_sleep_schedule
)

router = APIRouter(tags=["Module 10: Notification & Reminder System"])

@router.get("/user/{user_id}", response_model=NotificationListResponse)
def get_notifications(user_id: int = 1, category: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Fetch all in-app notifications and alerts for a user with optional category filter.
    Categories: routine, product, hydration_sleep, clinical, system, all
    """
    return get_user_notifications(db, user_id, category)

@router.patch("/{notification_id}/read", response_model=NotificationMarkReadResponse)
def mark_read(notification_id: int, db: Session = Depends(get_db)):
    """
    Mark a single notification as read.
    """
    return mark_notification_as_read(db, notification_id)

@router.post("/user/{user_id}/mark-all-read", response_model=NotificationMarkReadResponse)
def mark_all_read(user_id: int = 1, db: Session = Depends(get_db)):
    """
    Mark all notifications for the user as read.
    """
    return mark_all_notifications_as_read(db, user_id)

@router.get("/reminders/{user_id}", response_model=ReminderPreferencesSchema)
def get_reminders(user_id: int = 1, db: Session = Depends(get_db)):
    """
    Fetch reminder preferences (AM/PM routine times, hydration target, sleep wind-down).
    """
    return get_user_reminder_preferences(db, user_id)

@router.put("/reminders/{user_id}", response_model=ReminderPreferencesSchema)
def update_reminders(user_id: int, prefs: Dict[str, Any], db: Session = Depends(get_db)):
    """
    Update reminder preferences.
    """
    return update_user_reminder_preferences(db, user_id, prefs)

@router.get("/replenishment/{user_id}", response_model=ProductReplenishmentResponse)
def get_replenishments(user_id: int = 1, db: Session = Depends(get_db)):
    """
    Fetch product replenishment status, volume tracking, and low-stock reorder warnings.
    """
    return get_user_product_replenishments(db, user_id)

@router.post("/hydration/log", response_model=HydrationLogResponse)
def log_hydration(req: HydrationLogRequest, db: Session = Depends(get_db)):
    """
    Quick-log hydration intake (+250ml, +500ml) and calculate daily progress.
    """
    return log_hydration_intake(db, req.user_id, req.amount_ml, req.log_date)

@router.post("/sleep/log", response_model=SleepLogResponse)
def log_sleep(req: SleepLogRequest, db: Session = Depends(get_db)):
    """
    Log sleep duration and quality, returning circadian epidermal regeneration status.
    """
    return log_sleep_schedule(
        db,
        user_id=req.user_id,
        sleep_hours=req.sleep_hours,
        sleep_quality=req.sleep_quality,
        wind_down_time=req.wind_down_time,
        notes=req.notes,
        log_date=req.log_date
    )
