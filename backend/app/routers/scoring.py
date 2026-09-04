from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.dependencies import get_current_user
from app.scoring_engine import (
    calculate_skin_condition_score,
    calculate_lifestyle_score,
    calculate_sleep_score,
    calculate_routine_consistency_score,
    calculate_hydration_score,
    calculate_overall_score,
    get_score_category,
)


router = APIRouter(
    prefix="/scoring",
    tags=["Skin Health Scoring"]
)


class RoutineLogCreate(BaseModel):
    log_date: date
    completed_count: int = Field(..., description="Number of completed routine steps")
    total_count: int = Field(..., description="Total number of planned routine steps")


@router.get("/summary")
def get_scoring_summary(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the user's Skin Health Score summary, factor breakdowns,
    weighted overall score, threshold category, and assessment score history trend.
    """

    # 1. Fetch latest skin assessment for authenticated user
    latest_assessment = (
        db.query(models.Assessment)
        .filter(models.Assessment.user_id == current_user.id)
        .order_by(models.Assessment.assessment_time.desc())
        .first()
    )

    if latest_assessment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No skin assessment found. Please complete an assessment first."
        )

    # 2. Calculate five component factor scores (0-100)
    skin_condition = calculate_skin_condition_score(latest_assessment)
    lifestyle_habits = calculate_lifestyle_score(latest_assessment)
    sleep_quality = calculate_sleep_score(latest_assessment)
    routine_consistency = calculate_routine_consistency_score(db, current_user.id)
    hydration_level = calculate_hydration_score(latest_assessment)

    # 3. Calculate weighted overall health score (0-100)
    overall_score = calculate_overall_score(
        skin_condition=skin_condition,
        lifestyle_habits=lifestyle_habits,
        sleep_quality=sleep_quality,
        routine_consistency=routine_consistency,
        hydration_level=hydration_level
    )

    # 4. Determine score category and UI badge styling
    category = get_score_category(overall_score)

    # 5. Fetch assessment score trend history
    history = (
        db.query(models.Assessment)
        .filter(models.Assessment.user_id == current_user.id)
        .order_by(models.Assessment.assessment_time.asc())
        .all()
    )

    assessment_trend = [
        {
            "assessment_id": a.id,
            "assessment_time": a.assessment_time.isoformat() if a.assessment_time else None,
            "health_score": a.health_score
        }
        for a in history
    ]

    return {
        "status": "success",
        "overall_score": overall_score,
        "category": {
            "label": category["label"],
            "color": category["color"],
            "badge_class": category["badge_class"]
        },
        "breakdown": {
            "skin_condition": skin_condition,
            "lifestyle_habits": lifestyle_habits,
            "sleep_quality": sleep_quality,
            "routine_consistency": routine_consistency,
            "hydration_level": hydration_level
        },
        "weights": {
            "skin_condition": 0.35,
            "lifestyle_habits": 0.20,
            "sleep_quality": 0.15,
            "routine_consistency": 0.20,
            "hydration_level": 0.10
        },
        "assessment_trend": assessment_trend
    }


@router.post("/adherence/log")
def log_routine_adherence(
    log_data: RoutineLogCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Logs or updates routine step completion for a specific date for the authenticated user.
    Enforces validation on counts and prevents duplicates.
    """

    if log_data.log_date > date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Log date cannot be in the future."
        )

    if log_data.completed_count < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completed count cannot be negative."
        )

    if log_data.total_count < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Total count cannot be negative."
        )

    if log_data.completed_count > log_data.total_count:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completed count cannot exceed total count."
        )

    # Check for existing log on the same date for the current user
    existing_log = (
        db.query(models.RoutineLog)
        .filter(
            models.RoutineLog.user_id == current_user.id,
            models.RoutineLog.log_date == log_data.log_date
        )
        .first()
    )

    if existing_log:
        existing_log.completed_count = log_data.completed_count
        existing_log.total_count = log_data.total_count
        log_record = existing_log
    else:
        log_record = models.RoutineLog(
            user_id=current_user.id,
            log_date=log_data.log_date,
            completed_count=log_data.completed_count,
            total_count=log_data.total_count
        )
        db.add(log_record)

    db.commit()
    db.refresh(log_record)

    adherence_pct = (
        round((log_record.completed_count / float(log_record.total_count)) * 100.0, 1)
        if log_record.total_count > 0 else 0.0
    )

    return {
        "status": "success",
        "message": "Routine adherence logged successfully.",
        "log": {
            "id": log_record.id,
            "user_id": log_record.user_id,
            "log_date": str(log_record.log_date),
            "completed_count": log_record.completed_count,
            "total_count": log_record.total_count,
            "adherence_percentage": adherence_pct
        }
    }
