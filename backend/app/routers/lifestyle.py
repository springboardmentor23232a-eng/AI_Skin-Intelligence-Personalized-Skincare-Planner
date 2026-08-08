from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Notification, SkinProfile
from ..auth import get_current_user

router = APIRouter(prefix="/api", tags=["notifications-lifestyle"])


@router.get("/notifications")
def list_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notes = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {"id": n.id, "message": n.message, "is_read": n.is_read, "created_at": n.created_at}
        for n in notes
    ]


@router.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    note = db.query(Notification).filter(
        Notification.id == notification_id, Notification.user_id == current_user.id
    ).first()
    if note:
        note.is_read = True
        db.commit()
    return {"message": "ok"}


class LifestyleUpdate(BaseModel):
    sleep_hours_avg: float | None = None
    water_intake_l_avg: float | None = None


@router.put("/lifestyle")
def update_lifestyle(
    payload: LifestyleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Quick-update endpoint backing the Sleep Tracker / Water Intake widgets."""
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if not profile:
        profile = SkinProfile(user_id=current_user.id)
        db.add(profile)

    if payload.sleep_hours_avg is not None:
        profile.sleep_hours_avg = payload.sleep_hours_avg
    if payload.water_intake_l_avg is not None:
        profile.water_intake_l_avg = payload.water_intake_l_avg
    profile.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(profile)
    return {
        "sleep_hours_avg": profile.sleep_hours_avg,
        "water_intake_l_avg": profile.water_intake_l_avg,
    }
