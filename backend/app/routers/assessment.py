from typing import List, Optional
from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, SkinAssessment, SkinConcern, RiskFactor
from app.dependencies.auth import get_current_user
from app.schemas import (
    SkinAssessmentResponse, 
    SkinAssessmentHistoryResponse, 
    AssessmentUpdateNotesRequest,
    RiskFactorResponse
)
from app.services import assessment_service
from app.logging_config import logger

router = APIRouter(prefix="/api/assessment", tags=["Skin Assessment Engine"])


@router.post("", response_model=SkinAssessmentResponse, status_code=201)
async def create_assessment(
    image: UploadFile = File(...),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Guarded endpoint accepting uploaded images to perform ML computer vision
    skin assessment. Calculates project skin health score, identifies concerns,
    triggers rule-based risk factors, and persists results.
    """
    logger.info(f"Triggering skin assessment upload for user ID: {current_user.id}")
    
    # Read uploaded file contents
    try:
        image_bytes = await image.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read upload image file: {e}"
        )
        
    # 1. Execute inference via PyTorch ML model
    severities = assessment_service.run_skin_inference(image_bytes)
    
    # 2. Derive skin metrics
    health_score = assessment_service.calculate_skin_health_score(severities)
    overall_cond = assessment_service.determine_overall_condition(health_score)
    concerns_list = assessment_service.identify_prioritized_concerns(severities)
    risks_list = assessment_service.generate_rule_based_risks(severities)
    
    # 3. Persist details in database
    db_assessment = SkinAssessment(
        user_id=current_user.id,
        skin_health_score=health_score,
        overall_condition=overall_cond,
        notes=notes.strip() if notes else None
    )
    db.add(db_assessment)
    db.commit() # commit parent first to auto-generate primary key id
    
    # Add concerns
    for concern in concerns_list:
        db_concern = SkinConcern(
            assessment_id=db_assessment.id,
            concern_name=concern["concern_name"],
            severity=concern["severity"],
            priority=concern["priority"]
        )
        db.add(db_concern)
        
    # Add risk factors
    logger.info("9. The risk factors that were actually inserted into the risk_factors table:")
    for risk in risks_list:
        db_risk = RiskFactor(
            assessment_id=db_assessment.id,
            risk_name=risk["risk_name"],
            description=risk["description"],
            risk_level=risk["risk_level"]
        )
        db.add(db_risk)
        logger.info(f"   - DB PRE-COMMIT: assessment.id={db_assessment.id}, risk_factor.id={db_risk.id}, risk_factor.assessment_id={db_risk.assessment_id}, risk_factor.risk_name='{db_risk.risk_name}', risk_factor.risk_level='{db_risk.risk_level}'")
    if not risks_list:
        logger.info("   - None")
        
    db.commit()
    
    # 12. Add temporary logging after commit
    logger.info("   - DB POST-COMMIT CONFIRMATION:")
    for risk in db_assessment.risks:
        logger.info(f"     * Committed risk: id={risk.id}, assessment_id={risk.assessment_id}, name='{risk.risk_name}', level='{risk.risk_level}'")
    if not db_assessment.risks:
        logger.info("     * No risks attached to the assessment object post-commit.")
    logger.info("============================================================")
        
    db.refresh(db_assessment)
    
    logger.info(f"Successfully saved skin assessment {db_assessment.id} for user {current_user.id}")
    return db_assessment


@router.get("", response_model=List[SkinAssessmentResponse])
async def list_assessments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves all skin assessments logged for the authenticated user."""
    assessments = db.query(SkinAssessment)\
        .filter(SkinAssessment.user_id == current_user.id)\
        .order_by(SkinAssessment.assessment_date.desc())\
        .all()
    return assessments


@router.get("/history", response_model=List[SkinAssessmentHistoryResponse])
async def get_assessment_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves a simplified overview history list of user assessments."""
    assessments = db.query(SkinAssessment)\
        .filter(SkinAssessment.user_id == current_user.id)\
        .order_by(SkinAssessment.assessment_date.desc())\
        .all()
        
    history = []
    for a in assessments:
        history.append({
            "id": a.id,
            "assessment_date": a.assessment_date,
            "skin_health_score": a.skin_health_score,
            "overall_condition": a.overall_condition,
            "concerns_count": len(a.concerns),
            "risks_count": len(a.risks)
        })
    return history


@router.get("/score")
async def get_score_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns chronological score index records monitoring weekly improvements."""
    assessments = db.query(SkinAssessment)\
        .filter(SkinAssessment.user_id == current_user.id)\
        .order_by(SkinAssessment.assessment_date.asc())\
        .all()
        
    return [{"date": a.assessment_date.isoformat(), "score": a.skin_health_score} for a in assessments]


@router.get("/risks", response_model=List[RiskFactorResponse])
async def get_aggregated_risks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Aggregates all unique identified risk factors across all user assessments."""
    assessments = db.query(SkinAssessment).filter(SkinAssessment.user_id == current_user.id).all()
    unique_risks = {}
    for a in assessments:
        for r in a.risks:
            unique_risks[r.risk_name] = r
            
    return list(unique_risks.values())


@router.get("/{id}", response_model=SkinAssessmentResponse)
async def get_assessment_details(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves the full details of a specific skin assessment card by ID."""
    assessment = db.query(SkinAssessment).filter(SkinAssessment.id == id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment record not found."
        )
        
    # Check authorization ownership
    if assessment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden to this assessment record."
        )
        
    return assessment


@router.put("/{id}", response_model=SkinAssessmentResponse)
async def update_assessment_notes(
    id: int,
    payload: AssessmentUpdateNotesRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Updates the custom notes description field of a specific assessment."""
    assessment = db.query(SkinAssessment).filter(SkinAssessment.id == id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment record not found."
        )
        
    if assessment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden to this assessment record."
        )
        
    assessment.notes = payload.notes.strip() if payload.notes else None
    db.commit()
    db.refresh(assessment)
    return assessment


@router.delete("/{id}")
async def delete_assessment(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletes a specific skin assessment and cascade purges sub-concerns/risks."""
    assessment = db.query(SkinAssessment).filter(SkinAssessment.id == id).first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment record not found."
        )
        
    if assessment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden to this assessment record."
        )
        
    db.delete(assessment)
    db.commit()
    return {"success": True, "message": "Assessment deleted successfully."}
