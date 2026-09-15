from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from .database import get_db
from . import models, schemas
from .auth import get_current_user


router = APIRouter(
    prefix="/assessment",
    tags=["Skin Assessment"]
)


# =========================================================
# ANALYZE SKIN IMAGE
# =========================================================

@router.post("/analyze-image/")
async def analyze_skin_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    # =====================================================
    # CHECK IMAGE TYPE
    # =====================================================

    if not file.content_type or not file.content_type.startswith("image/"):

        raise HTTPException(
            status_code=400,
            detail="Please upload a valid image file"
        )

    # =====================================================
    # READ IMAGE
    # =====================================================

    image_data = await file.read()

    # =====================================================
    # CHECK EMPTY IMAGE
    # =====================================================

    if not image_data:

        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty"
        )

    # =====================================================
    # AUTOMATIC DEMO SCORE SEQUENCE
    #
    # 82 → 91 → 87 → 94 → 89 → 82 → 91 ...
    #
    # The score changes whenever a NEW image is analyzed.
    # Refreshing Progress reads the latest saved score.
    # =====================================================

    user_id = current_user["id"]

    previous_assessment = db.query(
        models.SkinAssessment
    ).filter(
        models.SkinAssessment.user_id == user_id
    ).order_by(
        models.SkinAssessment.id.desc()
    ).first()

    if previous_assessment is None:

        skin_health_score = 82

    else:

        previous_score = previous_assessment.skin_health_score

        if previous_score == 82:
            skin_health_score = 91

        elif previous_score == 91:
            skin_health_score = 87

        elif previous_score == 87:
            skin_health_score = 94

        elif previous_score == 94:
            skin_health_score = 89

        elif previous_score == 89:
            skin_health_score = 82

        else:
            skin_health_score = 91

    # =====================================================
    # SKIN ANALYSIS DATA
    # =====================================================

    skin_type = "Combination"

    main_concern = "Mild Dark Spots"

    hydration = "Good"

    acne_level = "Mild"

    pigmentation = "Mild"

    risk_level = "Low"

    skin_condition = "Healthy Skin"

    redness = "Mild"

    texture = "Smooth"

    sensitivity = "Low"

    recommendation = (
        "Maintain your current skincare routine, "
        "use moisturizer regularly, and apply "
        "broad-spectrum sunscreen daily."
    )

    # =====================================================
    # SAVE NEW ASSESSMENT TO DATABASE
    # =====================================================

    new_assessment = models.SkinAssessment(

        user_id=user_id,

        skin_health_score=skin_health_score,

        overall_condition=skin_condition,

        notes=recommendation,

        skin_type=skin_type,

        main_concern=main_concern,

        hydration=hydration,

        acne_level=acne_level,

        pigmentation=pigmentation,

        risk_level=risk_level,

        redness=redness,

        texture=texture,

        sensitivity=sensitivity
    )

    db.add(new_assessment)

    db.commit()

    db.refresh(new_assessment)

    # =====================================================
    # RETURN ANALYSIS
    # =====================================================

    return {

        "message": "Skin image analyzed successfully",

        "filename": file.filename,

        "user_id": user_id,

        "assessment_id": new_assessment.id,

        "analysis_status": "completed",

        "analysis": {

            "skin_health_score": skin_health_score,

            "skin_type": skin_type,

            "main_concern": main_concern,

            "hydration": hydration,

            "acne_level": acne_level,

            "pigmentation": pigmentation,

            "risk_level": risk_level,

            "skin_condition": skin_condition,

            "redness": redness,

            "texture": texture,

            "sensitivity": sensitivity,

            "recommendation": recommendation
        }
    }


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

        notes=assessment.notes,

        skin_type=assessment.skin_type,

        main_concern=assessment.main_concern,

        hydration=assessment.hydration,

        acne_level=assessment.acne_level,

        pigmentation=assessment.pigmentation,

        risk_level=assessment.risk_level,

        redness=assessment.redness,

        texture=assessment.texture,

        sensitivity=assessment.sensitivity
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

    assessment = db.query(
        models.SkinAssessment
    ).filter(
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

    assessment = db.query(
        models.SkinAssessment
    ).filter(
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

    assessments = db.query(
        models.SkinAssessment
    ).filter(
        models.SkinAssessment.user_id == user_id
    ).all()

    return assessments


# =========================================================
# GET ASSESSMENT HISTORY
# =========================================================

@router.get("/history/")
def get_assessment_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    user_id = current_user["id"]

    assessments = db.query(
        models.SkinAssessment
    ).filter(
        models.SkinAssessment.user_id == user_id
    ).order_by(
        models.SkinAssessment.id.desc()
    ).all()

    return {

        "user_id": user_id,

        "total_assessments": len(assessments),

        "history": assessments
    }