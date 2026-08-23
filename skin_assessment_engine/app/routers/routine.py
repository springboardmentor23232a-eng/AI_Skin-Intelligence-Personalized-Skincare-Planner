from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db, engine, Base
import app.models
from app.models import SkinRoutine, SkinAssessment
from app.schemas import (
    RoutineGenerateRequest,
    RoutineResponse,
    SeasonEnum
)
from app.services.routine_engine import generate_personalized_routine_data

# Ensure tables are created
Base.metadata.create_all(bind=engine)

router = APIRouter(
    prefix="",
    tags=["Personalized Routine Generator (Module 4)"]
)


def utc_now():
    return datetime.now(timezone.utc)

@router.post("/generate", response_model=RoutineResponse, status_code=status.HTTP_201_CREATED)
def generate_routine(payload: RoutineGenerateRequest, db: Session = Depends(get_db)):
    """
    Generate personalized morning, evening, weekly, and seasonal skincare routine.
    Considers skin type, concerns, health score, allergies/sensitivities, and lifestyle.
    """
    user_id = payload.user_id or 1
    assessment = None

    if payload.assessment_id:
        assessment = db.query(SkinAssessment).filter(SkinAssessment.id == payload.assessment_id).first()
        if not assessment:
            raise HTTPException(status_code=404, detail=f"Skin assessment #{payload.assessment_id} not found.")

    if not assessment:
        assessment = db.query(SkinAssessment).filter(SkinAssessment.user_id == user_id).order_by(SkinAssessment.assessment_date.desc()).first()

    # Extract skin profile parameters
    skin_type = assessment.skin_type if assessment else "Combination"
    health_score = assessment.skin_health_score if assessment else 75.0
    concerns = [c.concern_name for c in assessment.concerns] if assessment and assessment.concerns else ["Acne & Breakouts"]
    
    lifestyle = {
        "sun_exposure_hours": assessment.sun_exposure_hours if assessment else 2.0,
        "makeup_usage": assessment.makeup_usage if assessment else "Light Minimal Makeup",
        "sensitivity_level": assessment.sensitivity_level if assessment else 20.0
    }

    # Retrieve previous assessment to calculate score delta for adaptive mode
    prev_assessment = None
    if assessment:
        prev_assessment = db.query(SkinAssessment).filter(
            SkinAssessment.user_id == user_id,
            SkinAssessment.id != assessment.id
        ).order_by(SkinAssessment.assessment_date.desc()).first()

    prev_score = prev_assessment.skin_health_score if prev_assessment else None

    # Generate full routine payload using routine_engine
    routine_dict = generate_personalized_routine_data(
        skin_type=skin_type,
        concerns=concerns,
        health_score=health_score,
        allergies=payload.allergies or [],
        sensitivities=payload.sensitivities or [],
        lifestyle=lifestyle,
        season=payload.season or SeasonEnum.SUMMER,
        previous_health_score=prev_score
    )

    # Save routine record into DB
    routine_orm = SkinRoutine(
        user_id=user_id,
        assessment_id=assessment.id if assessment else None,
        season=routine_dict["season"],
        morning_routine=routine_dict["morning_routine"],
        evening_routine=routine_dict["evening_routine"],
        weekly_plan=routine_dict["weekly_plan"],
        seasonal_tips=routine_dict["seasonal_tips"],
        adaptive_notes=routine_dict["adaptive_notes"],
        created_at=utc_now(),
        updated_at=utc_now()
    )

    db.add(routine_orm)
    db.commit()
    db.refresh(routine_orm)

    return RoutineResponse(
        success=True,
        id=routine_orm.id,
        user_id=routine_orm.user_id,
        assessment_id=routine_orm.assessment_id,
        season=routine_orm.season,
        morning_routine=routine_orm.morning_routine,
        evening_routine=routine_orm.evening_routine,
        weekly_plan=routine_orm.weekly_plan,
        seasonal_tips=routine_orm.seasonal_tips,
        adaptive_notes=routine_orm.adaptive_notes,
        created_at=routine_orm.created_at,
        updated_at=routine_orm.updated_at
    )


@router.get("/user/{user_id}", response_model=RoutineResponse)
def get_user_latest_routine(user_id: int, season: Optional[SeasonEnum] = SeasonEnum.SUMMER, db: Session = Depends(get_db)):
    """Fetch the latest active personalized routine for a given user."""
    routine = db.query(SkinRoutine).filter(SkinRoutine.user_id == user_id).order_by(SkinRoutine.created_at.desc()).first()

    if not routine:
        # Automatically generate routine on the fly if none stored yet
        payload = RoutineGenerateRequest(user_id=user_id, season=season)
        return generate_routine(payload, db)

    return RoutineResponse(
        success=True,
        id=routine.id,
        user_id=routine.user_id,
        assessment_id=routine.assessment_id,
        season=routine.season,
        morning_routine=routine.morning_routine,
        evening_routine=routine.evening_routine,
        weekly_plan=routine.weekly_plan,
        seasonal_tips=routine.seasonal_tips,
        adaptive_notes=routine.adaptive_notes,
        created_at=routine.created_at,
        updated_at=routine.updated_at
    )


@router.get("/{routine_id}", response_model=RoutineResponse)
def get_routine_by_id(routine_id: int, db: Session = Depends(get_db)):
    """Retrieve routine record by ID."""
    routine = db.query(SkinRoutine).filter(SkinRoutine.id == routine_id).first()
    if not routine:
        raise HTTPException(status_code=404, detail=f"Routine #{routine_id} not found.")

    return RoutineResponse(
        success=True,
        id=routine.id,
        user_id=routine.user_id,
        assessment_id=routine.assessment_id,
        season=routine.season,
        morning_routine=routine.morning_routine,
        evening_routine=routine.evening_routine,
        weekly_plan=routine.weekly_plan,
        seasonal_tips=routine.seasonal_tips,
        adaptive_notes=routine.adaptive_notes,
        created_at=routine.created_at,
        updated_at=routine.updated_at
    )


@router.post("/adapt", response_model=RoutineResponse)
def trigger_adaptive_routine_update(payload: RoutineGenerateRequest, db: Session = Depends(get_db)):
    """
    Triggers an adaptive routine update based on new skin score, sensitivity changes, or seasonal shifts.
    """
    return generate_routine(payload, db)
