from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.deps import get_current_user
from app.ml.progress_analytics_engine import (
    monitor_skin_progress,
    track_routine_adherence,
    analyze_improvement,
    compare_before_after,
    analyze_trend,
)
from app.routers.notifications import check_score_change_alert, check_adherence_alert

router = APIRouter(prefix="/api/progress", tags=["Progress Tracking"])


def _logs(db: Session, user_id: str):
    return (
        db.query(models.ProgressLog)
        .filter(models.ProgressLog.user_id == user_id)
        .order_by(models.ProgressLog.log_date.asc())
        .all()
    )


def _assessments(db: Session, user_id: str):
    return (
        db.query(models.SkinAssessment)
        .filter(models.SkinAssessment.user_id == user_id)
        .order_by(models.SkinAssessment.assessment_date.asc())
        .all()
    )


@router.post("", response_model=schemas.ProgressLogOut, status_code=201)
def log_progress(payload: schemas.ProgressLogCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    previous_logs = _logs(db, current_user.id)
    previous_score = previous_logs[-1].skin_health_score if previous_logs else None

    log = models.ProgressLog(user_id=current_user.id, **payload.model_dump())
    db.add(log)

    # Progress alerts (section 10): notify on a meaningful score swing or low adherence.
    check_score_change_alert(db, current_user.id, payload.skin_health_score, previous_score)
    check_adherence_alert(db, current_user.id, payload.routine_adherence_pct)

    db.commit()
    db.refresh(log)
    return log


@router.get("", response_model=list[schemas.ProgressLogOut])
def get_progress(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return _logs(db, current_user.id)


@router.get("/trend")
def progress_trend(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Kept for backward compatibility with the existing frontend Progress tab."""
    logs = _logs(db, current_user.id)
    if not logs:
        return {"trend": "no_data", "logs": []}
    scores = [l.skin_health_score for l in logs]
    trend = "improving" if scores[-1] > scores[0] else ("declining" if scores[-1] < scores[0] else "stable")
    return {
        "trend": trend,
        "first_score": scores[0],
        "latest_score": scores[-1],
        "logs": [{"date": l.log_date, "score": l.skin_health_score, "adherence": l.routine_adherence_pct} for l in logs],
    }


@router.get("/before-after")
def before_after(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    assessments = _assessments(db, current_user.id)
    if len(assessments) < 2:
        raise HTTPException(status_code=404, detail="Need at least two assessments to compare.")
    return compare_before_after(assessments[0], assessments[-1])


@router.get("/analytics")
def progress_analytics(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Full Progress Tracking & Analytics summary (section 8):
    skin progress monitoring, routine adherence tracking, improvement
    analysis, before/after comparison, and trend analysis - all in one call.
    """
    assessments = _assessments(db, current_user.id)
    logs = _logs(db, current_user.id)

    if not assessments:
        raise HTTPException(status_code=404, detail="No assessments found. Run a skin scan first.")

    scores = [a.skin_health_score for a in assessments]
    improvement = analyze_improvement(scores[-1], scores[:-1])

    result = {
        "skin_progress_monitoring": monitor_skin_progress(assessments),
        "routine_adherence_tracking": track_routine_adherence(logs),
        "improvement_analysis": improvement,
        "trend_analysis": analyze_trend(assessments),
        "before_after": None,
    }
    if len(assessments) >= 2:
        result["before_after"] = compare_before_after(assessments[0], assessments[-1])
    return result
