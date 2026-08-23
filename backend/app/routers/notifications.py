from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.deps import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications & Reminders"])


@router.get("", response_model=list[schemas.NotificationOut])
def list_notifications(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return (
        db.query(models.Notification)
        .filter(models.Notification.user_id == current_user.id)
        .order_by(models.Notification.created_at.desc())
        .all()
    )


@router.put("/{notification_id}/read", response_model=schemas.NotificationOut)
def mark_read(notification_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    n = db.query(models.Notification).filter(
        models.Notification.id == notification_id, models.Notification.user_id == current_user.id
    ).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found.")
    n.is_read = True
    db.commit()
    db.refresh(n)
    return n


@router.post("/generate-reminders")
def generate_reminders(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Rule-based reminder generation: routine, hydration, sleep, replenishment."""
    created = []
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()

    def add(title, message, category):
        n = models.Notification(user_id=current_user.id, title=title, message=message, category=category)
        db.add(n)
        created.append(title)

    add("Routine Reminder", "Don't forget your evening skincare routine tonight!", "routine")

    if profile and profile.water_intake_liters is not None and profile.water_intake_liters < 2.0:
        add("Hydration Reminder", "You're below your daily water intake goal. Drink up!", "hydration")

    if profile and profile.sleep_quality is not None and profile.sleep_quality <= 5:
        add("Sleep Reminder", "Better sleep supports skin repair — aim for 7-8 hours tonight.", "sleep")

    add("Product Replenishment", "Check your product stock — some items may be running low.", "replenishment")

    db.commit()
    return {"created": created}
