from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.models.notification import Notification

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("")
def list_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )


@router.post("/{notification_id}/read")
def mark_read(notification_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    note = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)
        .first()
    )
    if note:
        note.is_read = True
        db.commit()
    return {"ok": True}


@router.post("/seed-reminders")
def seed_default_reminders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Creates default routine/hydration/sleep reminders for the user (demo helper)."""
    defaults = [
        ("routine_reminder", "Time for your morning skincare routine!"),
        ("routine_reminder", "Don't forget your evening routine tonight."),
        ("hydration", "Remember to drink water throughout the day."),
        ("sleep", "Aim for 7-9 hours of sleep for skin repair."),
    ]
    for ntype, msg in defaults:
        db.add(Notification(user_id=current_user.id, type=ntype, message=msg))
    db.commit()
    return {"created": len(defaults)}
