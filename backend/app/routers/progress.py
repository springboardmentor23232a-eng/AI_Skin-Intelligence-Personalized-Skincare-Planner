from typing import List
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.models.progress import ProgressLog
from app.models.skin_profile import SkinProfile
from app.models.assessment import SkinAssessment
from app.schemas.progress import ProgressLogCreate, ProgressLogOut
from app.services.scoring_service import compute_skin_health_score

router = APIRouter(prefix="/api/progress", tags=["Progress Tracking"])


@router.post("/log", response_model=ProgressLogOut)
def log_progress(
    payload: ProgressLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    latest_assessment = (
        db.query(SkinAssessment)
        .filter(SkinAssessment.user_id == current_user.id)
        .order_by(SkinAssessment.created_at.desc())
        .first()
    )

    cutoff = datetime.utcnow() - timedelta(days=14)
    recent_logs = (
        db.query(ProgressLog)
        .filter(ProgressLog.user_id == current_user.id, ProgressLog.log_date >= cutoff)
        .all()
    )
    recent_logs_dicts = [
        {"routine_followed_morning": l.routine_followed_morning, "routine_followed_evening": l.routine_followed_evening}
        for l in recent_logs
    ]

    score_result = None
    if profile:
        score_result = compute_skin_health_score(
            identified_concerns=latest_assessment.identified_concerns if latest_assessment else (profile.skin_concerns or []),
            concern_severity=latest_assessment.concern_severity if latest_assessment else {},
            lifestyle_habits=profile.lifestyle_habits or [],
            sleep_quality=profile.sleep_quality,
            sleep_hours=profile.sleep_hours or 7.0,
            logs_last_14_days=recent_logs_dicts,
            water_intake_liters=profile.water_intake_liters or 2.0,
        )

    log = ProgressLog(
        user_id=current_user.id,
        **payload.dict(),
        skin_health_score=score_result["overall_skin_health_score"] if score_result else None,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/history", response_model=List[ProgressLogOut])
def get_progress_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(ProgressLog)
        .filter(ProgressLog.user_id == current_user.id)
        .order_by(ProgressLog.log_date.desc())
        .all()
    )
