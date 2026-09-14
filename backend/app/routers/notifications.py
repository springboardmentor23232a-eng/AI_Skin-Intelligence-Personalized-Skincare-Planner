from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.deps import get_current_user, require_admin

router = APIRouter(prefix="/api/notifications", tags=["Notifications & Reminders"])


# ---------------------------------------------------------------------------
# Shared helper: used by this router as well as progress.py / assessment.py
# to raise a "progress alert" notification whenever something noteworthy
# happens to a user's skin health score or routine adherence.
# ---------------------------------------------------------------------------
def create_progress_alert(db: Session, user_id: str, title: str, message: str, commit: bool = True):
    n = models.Notification(user_id=user_id, title=title, message=message, category="progress")
    db.add(n)
    if commit:
        db.commit()
    return n


def check_score_change_alert(db: Session, user_id: str, new_score: float, previous_score: float | None, threshold: float = 5.0):
    """Raises a progress alert if the skin health score moved by >= threshold points."""
    if previous_score is None:
        return None
    delta = round(new_score - previous_score, 1)
    if abs(delta) < threshold:
        return None
    if delta > 0:
        title, message = "Skin Health Improving", f"Your skin health score rose by {delta} points since your last check-in. Keep it up!"
    else:
        title, message = "Skin Health Score Dropped", f"Your skin health score fell by {abs(delta)} points since your last check-in. Consider reviewing your routine."
    return create_progress_alert(db, user_id, title, message, commit=False)


def check_adherence_alert(db: Session, user_id: str, adherence_pct: float | None, threshold: float = 50.0):
    """Raises a progress alert if routine adherence is below the threshold."""
    if adherence_pct is None or adherence_pct >= threshold:
        return None
    return create_progress_alert(
        db, user_id, "Low Routine Adherence",
        f"Your routine adherence is at {adherence_pct}%, below your {int(threshold)}% target. A consistent routine drives better results.",
        commit=False,
    )


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


@router.post("/platform", status_code=201)
def broadcast_platform_notification(
    payload: schemas.PlatformNotificationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    """Admin-only: broadcast a platform-wide announcement/notification to every active user."""
    users = db.query(models.User).filter(models.User.is_active == True).all()  # noqa: E712
    for u in users:
        db.add(models.Notification(user_id=u.id, title=payload.title, message=payload.message, category="platform"))
    db.commit()
    return {"message": f"Notification sent to {len(users)} user(s)."}
