from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import User, SkinProfile, SkinAssessment
from app.auth import get_current_user
from app.schemas_extended import (
    SkinProfileCreate,
    SkinProfileUpdate,
    SkinProfileResponse,
    SkinAssessmentCreate,
    SkinAssessmentResponse
)

router = APIRouter(prefix="/api", tags=["modules"])

# =========================================================
# MODULE 2: SKIN PROFILE MANAGEMENT ENDPOINTS
# =========================================================

@router.post("/profile", response_model=SkinProfileResponse, status_code=status.HTTP_201_CREATED)
def create_profile(
    profile_in: SkinProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Skin profile already exists. Use PUT /api/profile to update."
        )

    profile = SkinProfile(
        user_id=current_user.id,
        full_name=profile_in.full_name,
        age=profile_in.age,
        gender=profile_in.gender,
        skin_type=profile_in.skin_type,
        skin_tone=profile_in.skin_tone,
        concerns=profile_in.concerns,
        allergies=profile_in.allergies,
        sensitivities=profile_in.sensitivities,
        lifestyle=profile_in.lifestyle,
        sleep_quality=profile_in.sleep_quality,
        water_intake=profile_in.water_intake,
        stress_level=profile_in.stress_level,
        environmental_exposure=profile_in.environmental_exposure,
        climate=profile_in.climate,
        uv_exposure=profile_in.uv_exposure
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/profile", response_model=SkinProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skin profile not found. Please complete the profile wizard."
        )
    return profile

@router.put("/profile", response_model=SkinProfileResponse)
def update_profile(
    profile_in: SkinProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skin profile not found"
        )

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile

@router.delete("/profile", status_code=status.HTTP_200_OK)
def delete_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skin profile not found"
        )

    db.delete(profile)
    db.commit()
    return {"message": "Skin profile deleted successfully"}

# =========================================================
# MODULE 3: SKIN ASSESSMENT ENGINE ENDPOINTS
# =========================================================

@router.post("/assessment", response_model=SkinAssessmentResponse, status_code=status.HTTP_201_CREATED)
def create_assessment(
    assessment_in: SkinAssessmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Weighted Health Calculation Algorithm
    # Higher concern values reduce score
    avg_severity = (
        assessment_in.acne * 1.5 +
        assessment_in.hyperpigmentation * 1.2 +
        assessment_in.dryness * 1.0 +
        assessment_in.oiliness * 1.0 +
        assessment_in.redness * 1.1 +
        assessment_in.sensitivity * 1.3 +
        assessment_in.wrinkles * 0.9 +
        assessment_in.fine_lines * 0.8 +
        assessment_in.dark_spots * 1.1 +
        assessment_in.uneven_tone * 1.0
    ) / 11.0

    overall_score = max(35, min(99, int(100 - avg_severity)))

    if overall_score >= 80:
        risk_level = "Low Risk"
    elif overall_score >= 65:
        risk_level = "Moderate Risk"
    else:
        risk_level = "High Priority Alert"

    # Identify top concern
    concern_dict = {
        "Acne": assessment_in.acne,
        "Hyperpigmentation": assessment_in.hyperpigmentation,
        "Dryness": assessment_in.dryness,
        "Oiliness": assessment_in.oiliness,
        "Redness & Inflammation": assessment_in.redness,
        "Sensitivity": assessment_in.sensitivity,
        "Fine Lines & Wrinkles": max(assessment_in.wrinkles, assessment_in.fine_lines)
    }
    top_concern = max(concern_dict, key=concern_dict.get)

    summary = (
        f"Skin Health Score is {overall_score}% ({risk_level}). "
        f"Primary concern identified is {top_concern}. "
        f"Adaptive routine recommended focusing on barrier repair and hydration balance."
    )

    assessment = SkinAssessment(
        user_id=current_user.id,
        acne=assessment_in.acne,
        hyperpigmentation=assessment_in.hyperpigmentation,
        dryness=assessment_in.dryness,
        oiliness=assessment_in.oiliness,
        redness=assessment_in.redness,
        sensitivity=assessment_in.sensitivity,
        wrinkles=assessment_in.wrinkles,
        fine_lines=assessment_in.fine_lines,
        dark_spots=assessment_in.dark_spots,
        uneven_tone=assessment_in.uneven_tone,
        overall_score=overall_score,
        risk_level=risk_level,
        concern_priority=top_concern,
        summary=summary
    )

    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment

@router.get("/assessment/history", response_model=List[SkinAssessmentResponse])
def get_assessment_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assessments = db.query(SkinAssessment)\
        .filter(SkinAssessment.user_id == current_user.id)\
        .order_by(SkinAssessment.created_at.desc())\
        .all()
    return assessments

@router.get("/assessment/{assessment_id}", response_model=SkinAssessmentResponse)
def get_assessment_detail(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assessment = db.query(SkinAssessment)\
        .filter(SkinAssessment.id == assessment_id, SkinAssessment.user_id == current_user.id)\
        .first()
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment record not found"
        )
    return assessment
