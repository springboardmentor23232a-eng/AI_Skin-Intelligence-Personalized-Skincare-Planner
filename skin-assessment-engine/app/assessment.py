from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import get_db
from . import models, schemas
from .auth import get_current_user


router = APIRouter(
    prefix="/assessment",
    tags=["Skin Assessment"]
)


# =========================================================
# CREATE ASSESSMENT
# =========================================================

@router.post("/")
def create_assessment(
    assessment: schemas.AssessmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    user_id = current_user["id"]

    new_assessment = models.SkinAssessment(
        user_id=user_id,
        skin_health_score=assessment.skin_health_score,
        overall_condition=assessment.overall_condition,
        notes=assessment.notes
    )

    db.add(new_assessment)
    db.commit()
    db.refresh(new_assessment)

    return new_assessment


# =========================================================
# CREATE SKIN CONCERN
# =========================================================

@router.post("/concern/")
def create_skin_concern(
    concern: schemas.SkinConcernCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    user_id = current_user["id"]

    assessment = db.query(models.SkinAssessment).filter(
        models.SkinAssessment.id == concern.assessment_id,
        models.SkinAssessment.user_id == user_id
    ).first()

    if assessment is None:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found"
        )

    new_concern = models.SkinConcern(
        assessment_id=concern.assessment_id,
        concern_name=concern.concern_name,
        severity=concern.severity,
        priority=concern.priority
    )

    db.add(new_concern)
    db.commit()
    db.refresh(new_concern)

    return new_concern


# =========================================================
# CREATE RISK FACTOR
# =========================================================

@router.post("/risk/")
def create_risk_factor(
    risk: schemas.RiskFactorCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    user_id = current_user["id"]

    assessment = db.query(models.SkinAssessment).filter(
        models.SkinAssessment.id == risk.assessment_id,
        models.SkinAssessment.user_id == user_id
    ).first()

    if assessment is None:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found"
        )

    new_risk = models.RiskFactor(
        assessment_id=risk.assessment_id,
        risk_name=risk.risk_name,
        description=risk.description,
        risk_level=risk.risk_level
    )

    db.add(new_risk)
    db.commit()
    db.refresh(new_risk)

    return new_risk


# =========================================================
# GET ALL ASSESSMENTS
# =========================================================

@router.get("/")
def get_assessments(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    user_id = current_user["id"]

    assessments = db.query(models.SkinAssessment).filter(
        models.SkinAssessment.user_id == user_id
    ).all()

    return assessments


# =========================================================
# GET ASSESSMENT HISTORY
# IMPORTANT: Keep this BEFORE /{assessment_id}
# =========================================================

@router.get("/history/")
def get_assessment_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    user_id = current_user["id"]

    assessments = db.query(models.SkinAssessment).filter(
        models.SkinAssessment.user_id == user_id
    ).order_by(
        models.SkinAssessment.id.desc()
    ).all()

    return {
        "user_id": user_id,
        "total_assessments": len(assessments),
        "history": assessments
    }


# =========================================================
# GET LATEST SKIN HEALTH SCORE
# =========================================================

@router.get("/score/")
def get_skin_health_score(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    user_id = current_user["id"]

    latest = db.query(models.SkinAssessment).filter(
        models.SkinAssessment.user_id == user_id
    ).order_by(
        models.SkinAssessment.id.desc()
    ).first()

    if latest is None:
        return {
            "user_id": user_id,
            "skin_health_score": None,
            "overall_condition": None,
            "message": "No assessment found"
        }

    return {
        "user_id": user_id,
        "assessment_id": latest.id,
        "skin_health_score": latest.skin_health_score,
        "overall_condition": latest.overall_condition
    }


# =========================================================
# GET RISK FACTORS
# =========================================================

@router.get("/risks/")
def get_assessment_risks(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    user_id = current_user["id"]

    assessments = db.query(models.SkinAssessment).filter(
        models.SkinAssessment.user_id == user_id
    ).all()

    assessment_ids = [a.id for a in assessments]

    if not assessment_ids:
        return {
            "user_id": user_id,
            "total_risks": 0,
            "risks": []
        }

    risks = db.query(models.RiskFactor).filter(
        models.RiskFactor.assessment_id.in_(assessment_ids)
    ).all()

    return {
        "user_id": user_id,
        "total_risks": len(risks),
        "risks": risks
    }


# =========================================================
# GET ASSESSMENT BY ID
# =========================================================

@router.get("/{assessment_id}")
def get_assessment_by_id(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    user_id = current_user["id"]

    assessment = db.query(models.SkinAssessment).filter(
        models.SkinAssessment.id == assessment_id,
        models.SkinAssessment.user_id == user_id
    ).first()

    if assessment is None:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found"
        )

    return assessment


# =========================================================
# UPDATE ASSESSMENT
# =========================================================

@router.put("/{assessment_id}")
def update_assessment(
    assessment_id: int,
    assessment: schemas.AssessmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    user_id = current_user["id"]

    existing_assessment = db.query(models.SkinAssessment).filter(
        models.SkinAssessment.id == assessment_id,
        models.SkinAssessment.user_id == user_id
    ).first()

    if existing_assessment is None:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found"
        )

    existing_assessment.skin_health_score = assessment.skin_health_score
    existing_assessment.overall_condition = assessment.overall_condition
    existing_assessment.notes = assessment.notes

    db.commit()
    db.refresh(existing_assessment)

    return existing_assessment


# =========================================================
# DELETE ASSESSMENT
# =========================================================

@router.delete("/{assessment_id}")
def delete_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    user_id = current_user["id"]

    assessment = db.query(models.SkinAssessment).filter(
        models.SkinAssessment.id == assessment_id,
        models.SkinAssessment.user_id == user_id
    ).first()

    if assessment is None:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found"
        )

    db.delete(assessment)
    db.commit()

    return {
        "message": "Assessment deleted successfully",
        "assessment_id": assessment_id
    }