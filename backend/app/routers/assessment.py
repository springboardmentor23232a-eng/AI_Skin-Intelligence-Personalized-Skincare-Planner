from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.models.skin_profile import SkinProfile
from app.models.assessment import SkinAssessment
from app.models.skin_concern import SkinConcern
from app.models.risk_factor import RiskFactor
from app.schemas.assessment import (
    AssessmentOut,
    AssessmentUpdate,
    AssessmentScoreOut,
    AssessmentRisksOut,
)

router = APIRouter(prefix="/api/assessment", tags=["Skin Assessment"])

# Simple severity heuristic: more concerns co-occurring with each other -> more severe
SEVERITY_BOOSTERS = {
    "acne": ["oily_skin"],
    "wrinkles": ["fine_lines"],
    "dark_spots": ["hyperpigmentation", "uneven_skin_tone"],
}


def _estimate_severity(concern: str, all_concerns: list) -> str:
    boosters = SEVERITY_BOOSTERS.get(concern, [])
    overlap = len(set(boosters) & set(all_concerns))
    if overlap >= 1:
        return "severe" if overlap > 1 else "moderate"
    return "mild"


def _risk_factors(profile: SkinProfile) -> list:
    risks = []

    if profile.environmental_exposure == "high":
        risks.append({
            "risk_name": "High sun/pollution exposure",
            "description": "High environmental exposure may negatively affect skin health.",
            "risk_level": "high",
        })

    if profile.sleep_quality == "poor" or (profile.sleep_hours or 7) < 6:
        risks.append({
            "risk_name": "Poor sleep",
            "description": "Insufficient or poor-quality sleep may affect skin repair.",
            "risk_level": "moderate",
        })

    if profile.water_intake_liters < 1.5:
        risks.append({
            "risk_name": "Low hydration",
            "description": "Low water intake may contribute to dry or unhealthy skin.",
            "risk_level": "moderate",
        })

    for habit in profile.lifestyle_habits or []:
        if habit.lower() in ("smoking", "high-stress"):
            risks.append({
                "risk_name": f"Lifestyle risk: {habit}",
                "description": f"The lifestyle habit '{habit}' may negatively affect skin health.",
                "risk_level": "high",
            })

    return risks



@router.post("/run", response_model=AssessmentOut)
def run_assessment(
    age: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Get user's skin profile
    profile = (
        db.query(SkinProfile)
        .filter(SkinProfile.user_id == current_user.id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=400,
            detail="Create a skin profile before running an assessment.",
        )

    # Get concerns from skin profile
    concerns = profile.skin_concerns or []

    # Calculate severity for each concern
    severity = {
        concern: _estimate_severity(concern, concerns)
        for concern in concerns
    }

    # Severity ranking
    severity_rank = {
        "mild": 0,
        "moderate": 1,
        "severe": 2,
    }

    # Prioritize concerns
    prioritized = sorted(
        concerns,
        key=lambda concern: severity_rank.get(
            severity.get(concern, "mild"),
            0,
        ),
        reverse=True,
    )

    # Calculate overall condition score
    from app.services.scoring_service import score_skin_condition

    condition_score = score_skin_condition(
        concerns,
        severity,
    )

    # ---------------------------------------------------------
    # CREATE MAIN ASSESSMENT
    # ---------------------------------------------------------

    assessment = SkinAssessment(
        user_id=current_user.id,
        condition_score=condition_score,
        age=age,
    )

    # IMPORTANT:
    # Add assessment to session and flush it so that
    # assessment.id is generated before creating child records.
    db.add(assessment)
    db.flush()

    # ---------------------------------------------------------
    # CREATE CONCERN RECORDS
    # ---------------------------------------------------------

    for index, concern in enumerate(prioritized, start=1):
        db.add(
            SkinConcern(
                assessment_id=assessment.id,
                concern_name=concern,
                severity=severity.get(concern, "mild"),
                priority=index,
            )
        )

    # ---------------------------------------------------------
    # CREATE RISK FACTOR RECORDS
    # ---------------------------------------------------------

    risks = _risk_factors(profile)

    for risk in risks:
        db.add(
            RiskFactor(
                assessment_id=assessment.id,
                risk_name=risk["risk_name"],
                description=risk["description"],
                risk_level=risk["risk_level"],
            )
        )

    # ---------------------------------------------------------
    # SAVE EVERYTHING
    # ---------------------------------------------------------

    db.commit()
    db.refresh(assessment)

    return assessment


@router.get("/latest", response_model=AssessmentOut)
def get_latest_assessment(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    assessment = (
        db.query(SkinAssessment)
        .filter(SkinAssessment.user_id == current_user.id)
        .order_by(SkinAssessment.created_at.desc())
        .first()
    )
    if not assessment:
        raise HTTPException(status_code=404, detail="No assessment found. Run one first.")
    return assessment
@router.get("/score", response_model=AssessmentScoreOut)
def get_assessment_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assessment = (
        db.query(SkinAssessment)
        .filter(SkinAssessment.user_id == current_user.id)
        .order_by(SkinAssessment.created_at.desc())
        .first()
    )

    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="No assessment found."
        )

    return {
        "score": assessment.condition_score
    }
@router.get("/risks", response_model=AssessmentRisksOut)
def get_assessment_risks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assessment = (
        db.query(SkinAssessment)
        .filter(SkinAssessment.user_id == current_user.id)
        .order_by(SkinAssessment.created_at.desc())
        .first()
    )

    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="No assessment found.",
        )

    return {
        "risk_factors": assessment.risk_factors
    }
@router.get("/history", response_model=list[AssessmentOut])
def get_assessment_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assessments = (
        db.query(SkinAssessment)
        .filter(SkinAssessment.user_id == current_user.id)
        .order_by(SkinAssessment.created_at.desc())
        .all()
    )

    if not assessments:
        raise HTTPException(
            status_code=404,
            detail="No assessment history found."
        )

    return assessments
@router.get(
    "",
    response_model=list[AssessmentOut],
)
def list_assessments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assessments = (
        db.query(SkinAssessment)
        .filter(SkinAssessment.user_id == current_user.id)
        .order_by(SkinAssessment.created_at.desc())
        .all()
    )

    return assessments
@router.get(
    "/{assessment_id}",
    response_model=AssessmentOut,
)
def get_assessment(
    assessment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assessment = (
        db.query(SkinAssessment)
        .filter(
            SkinAssessment.id == assessment_id,
            SkinAssessment.user_id == current_user.id,
        )
        .first()
    )

    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found.",
        )

    return assessment
@router.put("/{assessment_id}", response_model=AssessmentOut)
def update_assessment(
    assessment_id: UUID,
    payload: AssessmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assessment = (
        db.query(SkinAssessment)
        .filter(
            SkinAssessment.id == assessment_id,
            SkinAssessment.user_id == current_user.id,
        )
        .first()
    )

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    update_data = payload.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(assessment, key, value)

    db.commit()
    db.refresh(assessment)

    return assessment
@router.delete(
    "/{assessment_id}",
)
def delete_assessment(
    assessment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assessment = (
        db.query(SkinAssessment)
        .filter(
            SkinAssessment.id == assessment_id,
            SkinAssessment.user_id == current_user.id,
        )
        .first()
    )

    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found.",
        )

    db.delete(assessment)
    db.commit()

    return {
        "message": "Assessment deleted successfully."
    }
