from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.notification import (
    NotificationFeedResponse,
    ReminderPreferences,
    NotificationItem,
    TriggerTestInput
)
from app.engine.notification_engine import NotificationEngine, DEFAULT_PREFERENCES, INITIAL_NOTIFICATIONS

router = APIRouter(prefix="/api/notifications", tags=["Notification & Reminder System"])

# In-memory session store for demo user state
current_preferences = DEFAULT_PREFERENCES.model_copy()
user_notifications = [n.model_copy() for n in INITIAL_NOTIFICATIONS]

@router.get("", response_model=NotificationFeedResponse)
def get_user_notifications():
    """
    Retrieve active user notification feed, unread status count, product replenishment forecasts, and preferences.
    """
    active_items = [
        n for n in user_notifications
        if NotificationEngine.get_user_notifications(current_preferences)
    ]
    # Filter by enabled preferences
    filtered = []
    for n in user_notifications:
        if n.type == "ROUTINE" and not (current_preferences.am_routine_enabled or current_preferences.pm_routine_enabled):
            continue
        if n.type == "HYDRATION" and not current_preferences.hydration_enabled:
            continue
        if n.type == "SLEEP" and not current_preferences.sleep_enabled:
            continue
        if n.type == "REPLENISHMENT" and not current_preferences.replenishment_alerts_enabled:
            continue
        if n.type == "PROGRESS" and not current_preferences.progress_photo_reminders_enabled:
            continue
        filtered.append(n)

    unread_count = sum(1 for n in filtered if not n.read)
    forecasts = NotificationEngine.get_replenishment_forecast()

    return NotificationFeedResponse(
        unread_count=unread_count,
        notifications=filtered,
        replenishment_forecast=forecasts,
        preferences=current_preferences
    )

@router.get("/motivational-quote", response_model=Dict[str, str])
def get_motivational_quote():
    """
    Get a random daily skincare and self-care motivational quote.
    """
    return NotificationEngine.get_random_motivational_quote()

@router.get("/preferences", response_model=ReminderPreferences)
def get_notification_preferences():
    """
    Retrieve active user reminder schedule and toggle preferences.
    """
    return current_preferences

@router.post("/preferences", response_model=ReminderPreferences)
def update_notification_preferences(new_prefs: ReminderPreferences):
    """
    Update reminder times (AM/PM routine, sleep time) and toggle states.
    """
    global current_preferences
    current_preferences = new_prefs
    return current_preferences

@router.post("/{notification_id}/read", response_model=Dict[str, Any])
def mark_notification_as_read(notification_id: str):
    """
    Mark a specific notification item as read.
    """
    found = False
    for n in user_notifications:
        if n.id == notification_id:
            n.read = True
            found = True
            break
    if not found:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification #{notification_id} not found."
        )
    return {"status": "SUCCESS", "message": f"Notification #{notification_id} marked as read."}

@router.post("/trigger-test", response_model=NotificationItem)
def trigger_test_notification(payload: TriggerTestInput):
    """
    Simulate instant real-time notification alert across selected custom channels (In-App, Email, SMS).
    """
    target_email = payload.custom_email or current_preferences.custom_email
    target_phone = payload.custom_phone or current_preferences.custom_phone
    new_item = NotificationEngine.create_test_notification(
        notification_type=payload.notification_type,
        title=payload.title,
        message=payload.message,
        target_channel=payload.target_channel or "ALL",
        custom_email=target_email,
        custom_phone=target_phone
    )
    user_notifications.insert(0, new_item)
    return new_item

