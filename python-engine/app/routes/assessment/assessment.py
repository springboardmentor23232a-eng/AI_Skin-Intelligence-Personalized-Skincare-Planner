from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json
import uuid
import os

from app.database import get_db
from app.models import SkinAssessment, SkinConcern, RiskFactor, USE_SQLITE
from app.schemas import (
    AssessmentRequest, AssessmentResponse, AssessmentUpdate,
    ConcernResponse, RiskFactorResponse, HistoryResponse
)
from app.engine import (
    calculate_skin_health_score, get_overall_condition,
    identify_concerns, determine_severity,
    analyze_risk_factors, get_risk_factor_names,
    prioritize_concerns, get_concern_priority
)

router = APIRouter()

# Helper function to handle UUID conversion for SQLite
def get_uuid(uuid_str):
    return uuid_str if USE_SQLITE else uuid.UUID(uuid_str)

@router.post("/assessment", response_model=AssessmentResponse)
def create_assessment(assessment: AssessmentRequest, db: Session = Depends(get_db)):
    """
    Create a new skin assessment with automatic scoring and analysis.
    """
    # Convert assessment to dict for engine processing
    assessment_data = assessment.dict()

    # Run the skin assessment engine
    score = calculate_skin_health_score(assessment_data)
    overall_condition = get_overall_condition(score)
    concerns = identify_concerns(assessment_data)
    risk_factors_data = analyze_risk_factors(assessment_data)
    risk_factor_names = get_risk_factor_names(risk_factors_data)
    priority = prioritize_concerns(concerns)

    # Create the assessment record
    db_assessment = SkinAssessment(
        user_id=get_uuid('00000000-0000-0000-0000-000000000001'),  # TODO: Get from JWT token after auth implementation
        skin_health_score=score,
        overall_condition=overall_condition,
        concerns=concerns,  # Store as JSON directly
        risk_factors=risk_factor_names,  # Store as JSON directly
        notes=assessment_data.get('notes')
    )

    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)

    # Create concern records
    for concern in concerns:
        db_concern = SkinConcern(
            assessment_id=db_assessment.id,
            concern_name=concern,
            severity=determine_severity(concern, assessment_data),
            priority=get_concern_priority(concern)
        )
        db.add(db_concern)

    # Create risk factor records
    for rf in risk_factors_data:
        db_risk = RiskFactor(
            assessment_id=db_assessment.id,
            risk_name=rf['name'],
            description=rf['description'],
            risk_level=rf['level']
        )
        db.add(db_risk)

    db.commit()
    db.refresh(db_assessment)

    return AssessmentResponse(
        id=str(db_assessment.id),
        user_id=str(db_assessment.user_id),
        skin_health_score=db_assessment.skin_health_score,
        overall_condition=db_assessment.overall_condition,
        concerns=concerns,
        priority=priority,
        risk_factors=risk_factor_names,
        assessment_date=db_assessment.assessment_date,
        created_at=db_assessment.created_at,
        notes=db_assessment.notes
    )

@router.get("/assessment", response_model=List[AssessmentResponse])
def get_all_assessments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Get all skin assessments (admin view).
    """
    assessments = db.query(SkinAssessment).offset(skip).limit(limit).all()

    response = []
    for assessment in assessments:
        concerns = assessment.concerns if assessment.concerns else []
        risk_factors = assessment.risk_factors if assessment.risk_factors else []

        response.append(AssessmentResponse(
            id=str(assessment.id),
            user_id=str(assessment.user_id),
            skin_health_score=assessment.skin_health_score,
            overall_condition=assessment.overall_condition,
            concerns=concerns,
            priority=prioritize_concerns(concerns),
            risk_factors=risk_factors,
            assessment_date=assessment.assessment_date,
            created_at=assessment.created_at,
            notes=assessment.notes
        ))

    return response

@router.get("/assessment/history", response_model=HistoryResponse)
def get_assessment_history(user_id: int = 1, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Get assessment history for a specific user.
    """
    # TODO: Get user_id from JWT token after auth implementation
    user_uuid = get_uuid('00000000-0000-0000-0000-000000000001') if isinstance(user_id, int) else get_uuid(user_id)
    assessments = db.query(SkinAssessment).filter(
        SkinAssessment.user_id == user_uuid
    ).order_by(SkinAssessment.assessment_date.desc()).offset(skip).limit(limit).all()

    response = []
    for assessment in assessments:
        concerns = assessment.concerns if assessment.concerns else []
        risk_factors = assessment.risk_factors if assessment.risk_factors else []

        response.append(AssessmentResponse(
            id=str(assessment.id),
            user_id=str(assessment.user_id),
            skin_health_score=assessment.skin_health_score,
            overall_condition=assessment.overall_condition,
            concerns=concerns,
            priority=prioritize_concerns(concerns),
            risk_factors=risk_factors,
            assessment_date=assessment.assessment_date,
            created_at=assessment.created_at,
            notes=assessment.notes
        ))

    return HistoryResponse(
        assessments=response,
        total_count=len(response)
    )

@router.get("/assessment/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(assessment_id: str, db: Session = Depends(get_db)):
    """
    Get a specific assessment by ID.
    """
    try:
        assessment_uuid = get_uuid(assessment_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid assessment ID format")
    
    assessment = db.query(SkinAssessment).filter(SkinAssessment.id == assessment_uuid).first()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    concerns = assessment.concerns if assessment.concerns else []
    risk_factors = assessment.risk_factors if assessment.risk_factors else []

    return AssessmentResponse(
        id=str(assessment.id),
        user_id=str(assessment.user_id),
        skin_health_score=assessment.skin_health_score,
        overall_condition=assessment.overall_condition,
        concerns=concerns,
        priority=prioritize_concerns(concerns),
        risk_factors=risk_factors,
        assessment_date=assessment.assessment_date,
        created_at=assessment.created_at,
        notes=assessment.notes
    )

@router.put("/assessment/{assessment_id}", response_model=AssessmentResponse)
def update_assessment(assessment_id: str, assessment_update: AssessmentUpdate, db: Session = Depends(get_db)):
    """
    Update an existing assessment.
    """
    try:
        assessment_uuid = get_uuid(assessment_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid assessment ID format")
    
    assessment = db.query(SkinAssessment).filter(SkinAssessment.id == assessment_uuid).first()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Get existing data
    existing_data = {
        'age': 25,  # Default values - in real app, store these in DB
        'skin_type': 'normal',
        'water_intake': 2,
        'sleep_hours': 8,
        'sun_exposure': 'low',
        'smoking': False,
        'stress_level': 'low'
    }

    # Update with new values
    update_data = assessment_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        if key != 'notes':
            existing_data[key] = value

    # Re-run the engine with updated data
    score = calculate_skin_health_score(existing_data)
    overall_condition = get_overall_condition(score)
    concerns = identify_concerns(existing_data)
    risk_factors_data = analyze_risk_factors(existing_data)
    risk_factor_names = get_risk_factor_names(risk_factors_data)
    priority = prioritize_concerns(concerns)

    # Update assessment
    assessment.skin_health_score = score
    assessment.overall_condition = overall_condition
    assessment.concerns = concerns  # Store as JSON directly
    assessment.risk_factors = risk_factor_names  # Store as JSON directly
    if 'notes' in update_data:
        assessment.notes = update_data['notes']

    db.commit()
    db.refresh(assessment)

    return AssessmentResponse(
        id=str(assessment.id),
        user_id=str(assessment.user_id),
        skin_health_score=assessment.skin_health_score,
        overall_condition=assessment.overall_condition,
        concerns=concerns,
        priority=priority,
        risk_factors=risk_factor_names,
        assessment_date=assessment.assessment_date,
        created_at=assessment.created_at,
        notes=assessment.notes
    )

@router.delete("/assessment/{assessment_id}")
def delete_assessment(assessment_id: str, db: Session = Depends(get_db)):
    """
    Delete an assessment.
    """
    try:
        assessment_uuid = uuid.UUID(assessment_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid assessment ID format")
    
    assessment = db.query(SkinAssessment).filter(SkinAssessment.id == assessment_uuid).first()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Delete related concerns and risk factors
    db.query(SkinConcern).filter(SkinConcern.assessment_id == assessment_id).delete()
    db.query(RiskFactor).filter(RiskFactor.assessment_id == assessment_id).delete()

    # Delete assessment
    db.delete(assessment)
    db.commit()

    return {"message": "Assessment deleted successfully"}

@router.get("/assessment/risks/{assessment_id}")
def get_assessment_risks(assessment_id: str, db: Session = Depends(get_db)):
    """
    Get risk factors for a specific assessment.
    """
    try:
        assessment_uuid = uuid.UUID(assessment_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid assessment ID format")
    
    assessment = db.query(SkinAssessment).filter(SkinAssessment.id == assessment_uuid).first()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    risk_factors = db.query(RiskFactor).filter(RiskFactor.assessment_id == assessment_id).all()

    return [
        RiskFactorResponse(
            id=str(rf.id),
            assessment_id=str(rf.assessment_id),
            risk_name=rf.risk_name,
            description=rf.description,
            risk_level=rf.risk_level
        )
        for rf in risk_factors
    ]

@router.get("/assessment/score/{assessment_id}")
def get_assessment_score(assessment_id: str, db: Session = Depends(get_db)):
    """
    Get the skin health score for a specific assessment.
    """
    try:
        assessment_uuid = uuid.UUID(assessment_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid assessment ID format")
    
    assessment = db.query(SkinAssessment).filter(SkinAssessment.id == assessment_uuid).first()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    return {
        "assessment_id": str(assessment.id),
        "user_id": str(assessment.user_id),
        "skin_health_score": assessment.skin_health_score,
        "overall_condition": assessment.overall_condition,
        "assessment_date": assessment.assessment_date
    }
