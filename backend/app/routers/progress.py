from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.deps import get_current_user

router = APIRouter(prefix="/api/progress", tags=["Progress Tracking"])


@router.post("", response_model=schemas.ProgressLogOut, status_code=201)
def log_progress(payload: schemas.ProgressLogCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    log = models.ProgressLog(user_id=current_user.id, **payload.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("", response_model=list[schemas.ProgressLogOut])
def get_progress(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return (
        db.query(models.ProgressLog)
        .filter(models.ProgressLog.user_id == current_user.id)
        .order_by(models.ProgressLog.log_date.asc())
        .all()
    )


@router.get("/trend")
def progress_trend(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    logs = (
        db.query(models.ProgressLog)
        .filter(models.ProgressLog.user_id == current_user.id)
        .order_by(models.ProgressLog.log_date.asc())
        .all()
    )
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
    assessments = (
        db.query(models.SkinAssessment)
        .filter(models.SkinAssessment.user_id == current_user.id)
        .order_by(models.SkinAssessment.assessment_date.asc())
        .all()
    )
    if len(assessments) < 2:
        raise HTTPException(status_code=404, detail="Need at least two assessments to compare.")
    first, last = assessments[0], assessments[-1]
    return {
        "before": {"date": first.assessment_date, "score": first.skin_health_score, "image": first.image_path},
        "after": {"date": last.assessment_date, "score": last.skin_health_score, "image": last.image_path},
        "improvement": round(last.skin_health_score - first.skin_health_score, 2),
    }
