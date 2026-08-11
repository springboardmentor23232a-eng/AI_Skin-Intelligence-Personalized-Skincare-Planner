from datetime import datetime, date
from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import User, SkinAssessment, SkincareLog, SkinProgressPhoto
from app.auth import get_current_user
from app.schemas_phase5 import (
    SkincareLogCreate,
    SkincareLogResponse,
    SkinProgressPhotoCreate,
    SkinProgressPhotoResponse,
    SkinHealthTrendPoint,
    SkinHealthTrendsResponse
)

router = APIRouter(prefix="/api/analytics", tags=["phase5"])


@router.get("/history", response_model=SkinHealthTrendsResponse)
def get_skin_health_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assessments = db.query(SkinAssessment).filter(
        SkinAssessment.user_id == current_user.id
    ).order_by(SkinAssessment.created_at.asc()).all()

    trends = []
    for a in assessments:
        trends.append(
            SkinHealthTrendPoint(
                logged_at=a.created_at,
                overall_score=a.overall_score,
                acne=a.acne,
                hyperpigmentation=a.hyperpigmentation,
                dryness=a.dryness,
                oiliness=a.oiliness,
                redness=a.redness,
                sensitivity=a.sensitivity
            )
        )
    return SkinHealthTrendsResponse(trends=trends)


@router.get("/routines/logs", response_model=List[SkincareLogResponse])
def get_routine_logs(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(SkincareLog).filter(SkincareLog.user_id == current_user.id)
    if start_date:
        query = query.filter(SkincareLog.logged_date >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        query = query.filter(SkincareLog.logged_date <= datetime.combine(end_date, datetime.max.time()))

    logs = query.order_by(SkincareLog.logged_date.desc()).all()

    response_logs = []
    for log in logs:
        # Convert date safely
        l_date = log.logged_date.date() if isinstance(log.logged_date, datetime) else log.logged_date
        response_logs.append(
            SkincareLogResponse(
                id=log.id,
                user_id=log.user_id,
                routine_type=log.routine_type,
                logged_date=l_date,
                completed=bool(log.completed),
                notes=log.notes
            )
        )
    return response_logs


@router.post("/routines/logs", response_model=SkincareLogResponse, status_code=status.HTTP_201_CREATED)
def log_routine(
    payload: SkincareLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log_date = payload.logged_date or date.today()
    log_datetime = datetime.combine(log_date, datetime.min.time())

    # Check if a log already exists for this date and routine type
    existing = db.query(SkincareLog).filter(
        SkincareLog.user_id == current_user.id,
        SkincareLog.routine_type == payload.routine_type,
        SkincareLog.logged_date == log_datetime
    ).first()

    if existing:
        existing.completed = 1 if payload.completed else 0
        existing.notes = payload.notes
        db.commit()
        db.refresh(existing)
        log_to_return = existing
    else:
        new_log = SkincareLog(
            user_id=current_user.id,
            routine_type=payload.routine_type,
            logged_date=log_datetime,
            completed=1 if payload.completed else 0,
            notes=payload.notes
        )
        db.add(new_log)
        db.commit()
        db.refresh(new_log)
        log_to_return = new_log

    l_date = log_to_return.logged_date.date() if isinstance(log_to_return.logged_date, datetime) else log_to_return.logged_date
    return SkincareLogResponse(
        id=log_to_return.id,
        user_id=log_to_return.user_id,
        routine_type=log_to_return.routine_type,
        logged_date=l_date,
        completed=bool(log_to_return.completed),
        notes=log_to_return.notes
    )


@router.get("/progress", response_model=List[SkinProgressPhotoResponse])
def get_progress_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entries = db.query(SkinProgressPhoto).filter(
        SkinProgressPhoto.user_id == current_user.id
    ).order_by(SkinProgressPhoto.logged_at.desc()).all()
    return entries


@router.post("/progress", response_model=SkinProgressPhotoResponse, status_code=status.HTTP_201_CREATED)
def create_progress_entry(
    payload: SkinProgressPhotoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_entry = SkinProgressPhoto(
        user_id=current_user.id,
        photo_url=payload.photo_url,
        notes=payload.notes,
        associated_assessment_id=payload.associated_assessment_id,
        logged_at=datetime.utcnow()
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry
