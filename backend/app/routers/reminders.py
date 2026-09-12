"""
Module 10 Phase 2A/3 — Reminder Schedule Configuration + Check Endpoints
Phase 2A: schedule CRUD and test notification.
Phase 3: POST /reminders/check triggers the reminder engine for the
         authenticated user (regular users) or all users (admin).
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from app.database import get_db
from app import models
from app.dependencies import get_current_user
from app.reminder_scheduler import check_reminders_for_user, check_and_generate_reminders

router = APIRouter(
    prefix="/reminders",
    tags=["Reminder Schedules"]
)

VALID_NOTIFICATION_TYPES = [
    "routine_reminder",
    "product_replenishment",
    "hydration",
    "sleep",
    "progress_alert"
]

VALID_FREQUENCIES = ["daily", "weekly", "monthly"]


@router.get("/schedule")
def get_reminder_schedules(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all reminder schedules for the authenticated user.
    """
    try:
        schedules = db.query(models.ReminderSchedule).filter(
            models.ReminderSchedule.user_id == current_user.id
        ).order_by(models.ReminderSchedule.created_at.asc()).all()
        
        return {
            "status": "success",
            "count": len(schedules),
            "schedules": [
                {
                    "id": s.id,
                    "notification_type": s.notification_type,
                    "scheduled_time": s.scheduled_time.isoformat(),
                    "frequency": s.frequency,
                    "is_active": s.is_active,
                    "last_sent_at": s.last_sent_at.isoformat() if s.last_sent_at else None,
                    "created_at": s.created_at.isoformat(),
                    "updated_at": s.updated_at.isoformat()
                }
                for s in schedules
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve reminder schedules: {str(e)}"
        )


@router.put("/schedule")
def update_reminder_schedules(
    schedules_data: List[dict],
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create or update reminder schedules for the authenticated user.
    
    Parameters:
    - schedules_data: List of schedule objects with:
      - notification_type (required)
      - scheduled_time (required, ISO datetime)
      - frequency (optional, default "daily")
      - is_active (optional, default True)
    
    Note: This is foundational for Phase 2A. The actual reminder engine will be in Phase 3.
    """
    try:
        created_schedules = []
        
        for schedule_data in schedules_data:
            # Validate required fields
            if "notification_type" not in schedule_data:
                raise HTTPException(
                    status_code=400,
                    detail="notification_type is required"
                )
            
            if "scheduled_time" not in schedule_data:
                raise HTTPException(
                    status_code=400,
                    detail="scheduled_time is required"
                )
            
            notification_type = schedule_data.get("notification_type")
            if notification_type not in VALID_NOTIFICATION_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail=f"notification_type must be one of: {', '.join(VALID_NOTIFICATION_TYPES)}"
                )
            
            # Parse scheduled_time
            try:
                scheduled_time = datetime.fromisoformat(schedule_data.get("scheduled_time"))
            except (ValueError, TypeError):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid scheduled_time format. Use ISO datetime format"
                )
            
            frequency = schedule_data.get("frequency", "daily")
            if frequency not in VALID_FREQUENCIES:
                raise HTTPException(
                    status_code=400,
                    detail=f"frequency must be one of: {', '.join(VALID_FREQUENCIES)}"
                )
            
            is_active = schedule_data.get("is_active", True)
            
            # Check if schedule already exists for this type
            existing_schedule = db.query(models.ReminderSchedule).filter(
                models.ReminderSchedule.user_id == current_user.id,
                models.ReminderSchedule.notification_type == notification_type
            ).first()
            
            if existing_schedule:
                # Update existing schedule
                existing_schedule.scheduled_time = scheduled_time
                existing_schedule.frequency = frequency
                existing_schedule.is_active = is_active
                db.commit()
                db.refresh(existing_schedule)
                schedule_obj = existing_schedule
            else:
                # Create new schedule
                schedule_obj = models.ReminderSchedule(
                    user_id=current_user.id,
                    notification_type=notification_type,
                    scheduled_time=scheduled_time,
                    frequency=frequency,
                    is_active=is_active
                )
                db.add(schedule_obj)
                db.commit()
                db.refresh(schedule_obj)
            
            created_schedules.append({
                "id": schedule_obj.id,
                "notification_type": schedule_obj.notification_type,
                "scheduled_time": schedule_obj.scheduled_time.isoformat(),
                "frequency": schedule_obj.frequency,
                "is_active": schedule_obj.is_active,
                "created_at": schedule_obj.created_at.isoformat()
            })
        
        return {
            "status": "success",
            "message": f"Updated {len(created_schedules)} reminder schedule(s)",
            "schedules": created_schedules
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update reminder schedules: {str(e)}"
        )


@router.post("/test")
def send_test_notification(
    notification_type: str = "platform",
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a test notification to the authenticated user.
    Creates a Notification record to verify the notification system is working.
    
    Parameters:
    - notification_type: Type of notification to test (default: "platform")
    
    Note: This is for testing Phase 2A data layer integration.
    The actual scheduled reminder engine is Phase 3.
    """
    try:
        # Create a test notification record
        test_notification = models.Notification(
            user_id=current_user.id,
            type=notification_type,
            title="Test Notification",
            message="This is a test notification from the reminder system.",
            action_url=None,
            is_read=False,
            is_dismissed=False
        )
        db.add(test_notification)
        db.commit()
        db.refresh(test_notification)
        
        return {
            "status": "success",
            "message": "Test notification created",
            "notification": {
                "id": test_notification.id,
                "type": test_notification.type,
                "title": test_notification.title,
                "message": test_notification.message,
                "created_at": test_notification.created_at.isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send test notification: {str(e)}"
        )


@router.post("/check")
def run_reminder_check(
    scope: str = "self",
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Manually trigger the reminder checker.

    - scope="self"  (default): run only for the authenticated user.
    - scope="all":  run for ALL users — requires role=ADMIN.

    Returns a summary of notifications created/skipped.
    """
    try:
        if scope == "all":
            if current_user.role not in ("ADMIN", "admin"):
                raise HTTPException(
                    status_code=403,
                    detail="scope=all is restricted to ADMIN users."
                )
            result = check_and_generate_reminders(db)
        else:
            result = check_reminders_for_user(db, current_user.id)

        return {
            "status": "success",
            "scope": scope,
            "created": result["created"],
            "skipped": result["skipped"],
            "errors": result.get("errors", 0),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Reminder check failed: {str(e)}"
        )
