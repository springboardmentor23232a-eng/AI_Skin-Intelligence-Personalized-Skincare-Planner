from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models import User
from app.schemas import (
    NotificationResponse,
    NotificationListResponse,
    UnreadCountResponse,
    NotificationPreferenceResponse,
    NotificationPreferenceUpdate,
    ProductTrackerCreate,
    ProductTrackerResponse
)
from app.services import notification_service
from app.logging_config import logger

router = APIRouter(
    prefix="/api/notifications",
    tags=["Module 10: Notification & Reminder System"]
)


@router.get("", response_model=NotificationListResponse)
def get_notifications(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    type: Optional[str] = Query(None, description="Filter by type (ROUTINE, REPLENISHMENT, HYDRATION, SLEEP, PROGRESS, PLATFORM)"),
    unread_only: bool = Query(False, description="Filter only unread alerts"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves paginated notifications for the authenticated user."""
    logger.info(f"API Notifications GET /api/notifications: user={current_user.email}, page={page}, type={type}")
    return notification_service.get_user_notifications(
        user_id=current_user.id,
        page=page,
        limit=limit,
        type_filter=type,
        unread_only=unread_only,
        db=db
    )


@router.get("/unread-count", response_model=UnreadCountResponse)
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lightweight endpoint for live header bell badge count."""
    count = notification_service.get_unread_count(user_id=current_user.id, db=db)
    return {"unread_count": count}


@router.put("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marks a single notification as read."""
    success = notification_service.mark_as_read(notification_id=notification_id, user_id=current_user.id, db=db)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    return {"success": True, "id": notification_id, "is_read": True}


@router.put("/read-all")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marks all unread notifications for the user as read."""
    count = notification_service.mark_all_as_read(user_id=current_user.id, db=db)
    return {"success": True, "marked_count": count}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a notification from user's inbox."""
    success = notification_service.delete_notification(notification_id=notification_id, user_id=current_user.id, db=db)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    return {"success": True, "message": "Notification deleted successfully."}


# --- Preferences Endpoints ---

@router.get("/preferences", response_model=NotificationPreferenceResponse)
def get_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves the user's notification preferences."""
    return notification_service.get_or_create_preferences(user_id=current_user.id, db=db)


@router.put("/preferences", response_model=NotificationPreferenceResponse)
def update_preferences(
    updates: NotificationPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates the user's notification preferences."""
    return notification_service.update_preferences(user_id=current_user.id, updates=updates, db=db)


# --- Product Tracker Endpoints (USER Role Only) ---

@router.get("/trackers", response_model=List[ProductTrackerResponse])
def get_trackers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves active product replenishment trackers for the authenticated user."""
    if (current_user.role or "").upper() != "USER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Product Tracker is exclusively available for User accounts."
        )
    return notification_service.get_user_trackers(user_id=current_user.id, db=db)


@router.post("/trackers", response_model=ProductTrackerResponse, status_code=status.HTTP_201_CREATED)
def create_tracker(
    data: ProductTrackerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Creates a new product replenishment tracker entry."""
    if (current_user.role or "").upper() != "USER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Product Tracker is exclusively available for User accounts."
        )
    from datetime import date
    tracker = notification_service.create_user_tracker(user_id=current_user.id, data=data, db=db)
    # Trigger an immediate evaluation
    notification_service.evaluate_replenishment_reminders(user_id=current_user.id, db=db)
    
    today = date.today()
    days_elapsed = (today - tracker.opened_on).days
    cycle = max(1, tracker.cycle_days)
    days_remaining = max(0, cycle - days_elapsed)
    is_imminent = days_elapsed >= int(cycle * 0.85)
    
    return {
        "id": tracker.id,
        "user_id": tracker.user_id,
        "routine_item_id": tracker.routine_item_id,
        "product_name": tracker.product_name,
        "opened_on": tracker.opened_on,
        "cycle_days": tracker.cycle_days,
        "is_active": tracker.is_active,
        "days_elapsed": days_elapsed,
        "days_remaining": days_remaining,
        "is_depletion_imminent": is_imminent,
        "created_at": tracker.created_at
    }


@router.delete("/trackers/{tracker_id}")
def delete_tracker(
    tracker_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Removes a product replenishment tracker entry."""
    if (current_user.role or "").upper() != "USER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Product Tracker is exclusively available for User accounts."
        )
    success = notification_service.delete_user_tracker(tracker_id=tracker_id, user_id=current_user.id, db=db)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tracker not found.")
    return {"success": True, "message": "Product tracker removed successfully."}
