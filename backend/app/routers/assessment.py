from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.models.skin_profile import SkinProfile
from app.models.assessment import SkinAssessment
from app.schemas.assessment import AssessmentOut

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
        risks.append("High sun/pollution exposure")
    if profile.sleep_quality == "poor" or (profile.sleep_hours or 7) < 6:
        risks.append("Poor sleep affecting skin repair")
    if profile.water_intake_liters < 1.5:
        risks.append("Low hydration")
    for habit in profile.lifestyle_habits or []:
        if habit.lower() in ("smoking", "high-stress"):
            risks.append(f"Lifestyle risk: {habit}")
    return risks


@router.post("/run", response_model=AssessmentOut)
def run_assessment(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Create a skin profile before running an assessment.")

    concerns = profile.skin_concerns or []
    severity = {c: _estimate_severity(c, concerns) for c in concerns}
    severity_rank = {"mild": 0, "moderate": 1, "severe": 2}
    prioritized = sorted(concerns, key=lambda c: severity_rank.get(severity.get(c, "mild"), 0), reverse=True)

    from app.services.scoring_service import score_skin_condition
    condition_score = score_skin_condition(concerns, severity)

    assessment = SkinAssessment(
        user_id=current_user.id,
        identified_concerns=concerns,
        concern_severity=severity,
        prioritized_concerns=prioritized,
        risk_factors=_risk_factors(profile),
        condition_score=condition_score,
    )
    db.add(assessment)
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
