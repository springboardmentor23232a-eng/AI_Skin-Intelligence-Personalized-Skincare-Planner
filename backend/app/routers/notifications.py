"""
FastAPI Router for Module 10 Phase 1 — Notification Foundation
---------------------------------------------------------------
Endpoints for notification management and user notification preferences.
No scheduler, APScheduler, or automatic reminder generation in Phase 1.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, time

from app.database import get_db
from app import models
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# Pydantic schemas for request/response validation
class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    action_url: Optional[str] = None
    is_read: bool
    created_at: datetime
    metadata: Optional[dict] = None

    class Config:
        from_attributes = True


class NotificationPreferenceResponse(BaseModel):
    id: int
    user_id: int
    routine_reminders: bool
    routine_reminder_time: Optional[str] = None
    product_reminders: bool
    product_reminder_days_before: int
    hydration_reminders: bool
    hydration_goal_glasses: int
    hydration_reminder_interval_hours: int
    sleep_reminders: bool
    sleep_goal_hours: float
    sleep_reminder_time: Optional[str] = None
    progress_alerts: bool
    progress_alert_frequency: str
    platform_notifications: bool
    email_notifications: bool
    push_notifications: bool
    in_app_notifications: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UpdateNotificationPreferenceRequest(BaseModel):
    routine_reminders: Optional[bool] = None
    routine_reminder_time: Optional[str] = None
    product_reminders: Optional[bool] = None
    product_reminder_days_before: Optional[int] = None
    hydration_reminders: Optional[bool] = None
    hydration_goal_glasses: Optional[int] = None
    hydration_reminder_interval_hours: Optional[int] = None
    sleep_reminders: Optional[bool] = None
    sleep_goal_hours: Optional[float] = None
    sleep_reminder_time: Optional[str] = None
    progress_alerts: Optional[bool] = None
    progress_alert_frequency: Optional[str] = None
    platform_notifications: Optional[bool] = None
    in_app_notifications: Optional[bool] = None


@router.get("")
def get_notifications(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    filter: str = Query("all", regex="^(all|unread)$"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get paginated notifications for the authenticated user.
    
    Query parameters:
    - limit: Max number of notifications (1-100, default 20)
    - offset: Pagination offset (default 0)
    - filter: 'all' or 'unread' (default 'all')
    """
    try:
        query = db.query(models.Notification).filter(
            models.Notification.user_id == current_user.id,
            models.Notification.is_dismissed == False
        )
        
        if filter == "unread":
            query = query.filter(models.Notification.is_read == False)
        
        # Sort newest first
        query = query.order_by(models.Notification.created_at.desc())
        
        total = query.count()
        notifications = query.offset(offset).limit(limit).all()
        
        return {
            "status": "success",
            "total": total,
            "limit": limit,
            "offset": offset,
            "notifications": [
                {
                    "id": n.id,
                    "type": n.type,
                    "title": n.title,
                    "message": n.message,
                    "action_url": n.action_url,
                    "is_read": n.is_read,
                    "created_at": n.created_at.isoformat(),
                    "metadata": n.notification_metadata
                }
                for n in notifications
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve notifications: {str(e)}"
        )


@router.get("/{notification_id}")
def get_notification(
    notification_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a single notification by ID (must belong to authenticated user).
    """
    try:
        notification = db.query(models.Notification).filter(
            models.Notification.id == notification_id,
            models.Notification.user_id == current_user.id
        ).first()
        
        if not notification:
            raise HTTPException(
                status_code=404,
                detail="Notification not found"
            )
        
        return {
            "status": "success",
            "notification": {
                "id": notification.id,
                "type": notification.type,
                "title": notification.title,
                "message": notification.message,
                "action_url": notification.action_url,
                "is_read": notification.is_read,
                "is_dismissed": notification.is_dismissed,
                "created_at": notification.created_at.isoformat(),
                "scheduled_time": notification.scheduled_time.isoformat() if notification.scheduled_time else None,
                "delivered_at": notification.delivered_at.isoformat() if notification.delivered_at else None,
                "expires_at": notification.expires_at.isoformat() if notification.expires_at else None,
                "metadata": notification.notification_metadata
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve notification: {str(e)}"
        )


@router.put("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a single notification as read (must belong to authenticated user).
    """
    try:
        notification = db.query(models.Notification).filter(
            models.Notification.id == notification_id,
            models.Notification.user_id == current_user.id
        ).first()
        
        if not notification:
            raise HTTPException(
                status_code=404,
                detail="Notification not found"
            )
        
        notification.is_read = True
        db.commit()
        
        return {
            "status": "success",
            "message": "Notification marked as read",
            "notification_id": notification_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to mark notification as read: {str(e)}"
        )


@router.post("/read-all")
def mark_all_notifications_read(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark all unread notifications as read for the authenticated user.
    """
    try:
        db.query(models.Notification).filter(
            models.Notification.user_id == current_user.id,
            models.Notification.is_read == False,
            models.Notification.is_dismissed == False
        ).update({
            models.Notification.is_read: True
        }, synchronize_session=False)
        
        db.commit()
        
        return {
            "status": "success",
            "message": "All notifications marked as read"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to mark all notifications as read: {str(e)}"
        )


@router.delete("/{notification_id}")
def dismiss_notification(
    notification_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Dismiss/soft-delete a notification by setting is_dismissed=True
    (must belong to authenticated user).
    """
    try:
        notification = db.query(models.Notification).filter(
            models.Notification.id == notification_id,
            models.Notification.user_id == current_user.id
        ).first()
        
        if not notification:
            raise HTTPException(
                status_code=404,
                detail="Notification not found"
            )
        
        notification.is_dismissed = True
        db.commit()
        
        return {
            "status": "success",
            "message": "Notification dismissed",
            "notification_id": notification_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to dismiss notification: {str(e)}"
        )


@router.get("/preferences")
def get_preferences(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get notification preferences for the authenticated user.
    If preferences don't exist, create defaults and return them.
    """
    try:
        prefs = db.query(models.NotificationPreference).filter(
            models.NotificationPreference.user_id == current_user.id
        ).first()
        
        if not prefs:
            # Create default preferences for new user
            prefs = models.NotificationPreference(
                user_id=current_user.id,
                routine_reminders=True,
                routine_reminder_time=None,
                product_reminders=True,
                product_reminder_days_before=7,
                hydration_reminders=True,
                hydration_goal_glasses=8,
                hydration_reminder_interval_hours=2,
                sleep_reminders=True,
                sleep_goal_hours=8.0,
                sleep_reminder_time=None,
                progress_alerts=True,
                progress_alert_frequency="weekly",
                platform_notifications=True,
                email_notifications=False,
                push_notifications=False,
                in_app_notifications=True
            )
            db.add(prefs)
            db.commit()
            db.refresh(prefs)
        
        return {
            "status": "success",
            "preferences": {
                "id": prefs.id,
                "user_id": prefs.user_id,
                "routine_reminders": prefs.routine_reminders,
                "routine_reminder_time": prefs.routine_reminder_time.isoformat() if prefs.routine_reminder_time else None,
                "product_reminders": prefs.product_reminders,
                "product_reminder_days_before": prefs.product_reminder_days_before,
                "hydration_reminders": prefs.hydration_reminders,
                "hydration_goal_glasses": prefs.hydration_goal_glasses,
                "hydration_reminder_interval_hours": prefs.hydration_reminder_interval_hours,
                "sleep_reminders": prefs.sleep_reminders,
                "sleep_goal_hours": prefs.sleep_goal_hours,
                "sleep_reminder_time": prefs.sleep_reminder_time.isoformat() if prefs.sleep_reminder_time else None,
                "progress_alerts": prefs.progress_alerts,
                "progress_alert_frequency": prefs.progress_alert_frequency,
                "platform_notifications": prefs.platform_notifications,
                "email_notifications": prefs.email_notifications,
                "push_notifications": prefs.push_notifications,
                "in_app_notifications": prefs.in_app_notifications,
                "created_at": prefs.created_at.isoformat(),
                "updated_at": prefs.updated_at.isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve notification preferences: {str(e)}"
        )


@router.put("/preferences")
def update_preferences(
    request: UpdateNotificationPreferenceRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update notification preferences for the authenticated user.
    Validates all input values before updating.
    """
    try:
        prefs = db.query(models.NotificationPreference).filter(
            models.NotificationPreference.user_id == current_user.id
        ).first()
        
        if not prefs:
            # Create default preferences if they don't exist
            prefs = models.NotificationPreference(user_id=current_user.id)
            db.add(prefs)
            db.flush()
        
        # Validate and update routine reminders
        if request.routine_reminders is not None:
            prefs.routine_reminders = request.routine_reminders
        if request.routine_reminder_time is not None:
            try:
                prefs.routine_reminder_time = datetime.fromisoformat(request.routine_reminder_time).time()
            except (ValueError, TypeError):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid routine_reminder_time format. Use HH:MM:SS"
                )
        
        # Validate and update product reminders
        if request.product_reminders is not None:
            prefs.product_reminders = request.product_reminders
        if request.product_reminder_days_before is not None:
            if request.product_reminder_days_before < 1:
                raise HTTPException(
                    status_code=400,
                    detail="product_reminder_days_before must be at least 1"
                )
            prefs.product_reminder_days_before = request.product_reminder_days_before
        
        # Validate and update hydration reminders
        if request.hydration_reminders is not None:
            prefs.hydration_reminders = request.hydration_reminders
        if request.hydration_goal_glasses is not None:
            if request.hydration_goal_glasses < 1:
                raise HTTPException(
                    status_code=400,
                    detail="hydration_goal_glasses must be at least 1"
                )
            prefs.hydration_goal_glasses = request.hydration_goal_glasses
        if request.hydration_reminder_interval_hours is not None:
            if request.hydration_reminder_interval_hours < 1:
                raise HTTPException(
                    status_code=400,
                    detail="hydration_reminder_interval_hours must be at least 1"
                )
            prefs.hydration_reminder_interval_hours = request.hydration_reminder_interval_hours
        
        # Validate and update sleep reminders
        if request.sleep_reminders is not None:
            prefs.sleep_reminders = request.sleep_reminders
        if request.sleep_goal_hours is not None:
            if request.sleep_goal_hours < 1:
                raise HTTPException(
                    status_code=400,
                    detail="sleep_goal_hours must be at least 1"
                )
            prefs.sleep_goal_hours = request.sleep_goal_hours
        if request.sleep_reminder_time is not None:
            try:
                prefs.sleep_reminder_time = datetime.fromisoformat(request.sleep_reminder_time).time()
            except (ValueError, TypeError):
                raise HTTPException(
                    status_code=400,
                    detail="Invalid sleep_reminder_time format. Use HH:MM:SS"
                )
        
        # Validate and update progress alerts
        if request.progress_alerts is not None:
            prefs.progress_alerts = request.progress_alerts
        if request.progress_alert_frequency is not None:
            if request.progress_alert_frequency not in ["daily", "weekly", "monthly"]:
                raise HTTPException(
                    status_code=400,
                    detail="progress_alert_frequency must be 'daily', 'weekly', or 'monthly'"
                )
            prefs.progress_alert_frequency = request.progress_alert_frequency
        
        # Validate and update platform notifications
        if request.platform_notifications is not None:
            prefs.platform_notifications = request.platform_notifications
        
        # Update in-app notifications
        if request.in_app_notifications is not None:
            prefs.in_app_notifications = request.in_app_notifications
        
        db.commit()
        db.refresh(prefs)
        
        return {
            "status": "success",
            "message": "Notification preferences updated",
            "preferences": {
                "id": prefs.id,
                "user_id": prefs.user_id,
                "routine_reminders": prefs.routine_reminders,
                "routine_reminder_time": prefs.routine_reminder_time.isoformat() if prefs.routine_reminder_time else None,
                "product_reminders": prefs.product_reminders,
                "product_reminder_days_before": prefs.product_reminder_days_before,
                "hydration_reminders": prefs.hydration_reminders,
                "hydration_goal_glasses": prefs.hydration_goal_glasses,
                "hydration_reminder_interval_hours": prefs.hydration_reminder_interval_hours,
                "sleep_reminders": prefs.sleep_reminders,
                "sleep_goal_hours": prefs.sleep_goal_hours,
                "sleep_reminder_time": prefs.sleep_reminder_time.isoformat() if prefs.sleep_reminder_time else None,
                "progress_alerts": prefs.progress_alerts,
                "progress_alert_frequency": prefs.progress_alert_frequency,
                "platform_notifications": prefs.platform_notifications,
                "email_notifications": prefs.email_notifications,
                "push_notifications": prefs.push_notifications,
                "in_app_notifications": prefs.in_app_notifications,
                "created_at": prefs.created_at.isoformat(),
                "updated_at": prefs.updated_at.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update notification preferences: {str(e)}"
        )


@router.post("/preferences/reset")
def reset_preferences(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reset notification preferences to defaults for the authenticated user.
    """
    try:
        prefs = db.query(models.NotificationPreference).filter(
            models.NotificationPreference.user_id == current_user.id
        ).first()
        
        if not prefs:
            prefs = models.NotificationPreference(user_id=current_user.id)
            db.add(prefs)
        
        # Reset to defaults
        prefs.routine_reminders = True
        prefs.routine_reminder_time = None
        prefs.product_reminders = True
        prefs.product_reminder_days_before = 7
        prefs.hydration_reminders = True
        prefs.hydration_goal_glasses = 8
        prefs.hydration_reminder_interval_hours = 2
        prefs.sleep_reminders = True
        prefs.sleep_goal_hours = 8.0
        prefs.sleep_reminder_time = None
        prefs.progress_alerts = True
        prefs.progress_alert_frequency = "weekly"
        prefs.platform_notifications = True
        prefs.email_notifications = False
        prefs.push_notifications = False
        prefs.in_app_notifications = True
        
        db.commit()
        db.refresh(prefs)
        
        return {
            "status": "success",
            "message": "Notification preferences reset to defaults",
            "preferences": {
                "id": prefs.id,
                "user_id": prefs.user_id,
                "routine_reminders": prefs.routine_reminders,
                "routine_reminder_time": prefs.routine_reminder_time.isoformat() if prefs.routine_reminder_time else None,
                "product_reminders": prefs.product_reminders,
                "product_reminder_days_before": prefs.product_reminder_days_before,
                "hydration_reminders": prefs.hydration_reminders,
                "hydration_goal_glasses": prefs.hydration_goal_glasses,
                "hydration_reminder_interval_hours": prefs.hydration_reminder_interval_hours,
                "sleep_reminders": prefs.sleep_reminders,
                "sleep_goal_hours": prefs.sleep_goal_hours,
                "sleep_reminder_time": prefs.sleep_reminder_time.isoformat() if prefs.sleep_reminder_time else None,
                "progress_alerts": prefs.progress_alerts,
                "progress_alert_frequency": prefs.progress_alert_frequency,
                "platform_notifications": prefs.platform_notifications,
                "email_notifications": prefs.email_notifications,
                "push_notifications": prefs.push_notifications,
                "in_app_notifications": prefs.in_app_notifications,
                "created_at": prefs.created_at.isoformat(),
                "updated_at": prefs.updated_at.isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to reset notification preferences: {str(e)}"
        )
