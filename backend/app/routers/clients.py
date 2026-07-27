from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_roles, get_current_user
from app.models.user import User, UserRole
from app.models.skin_profile import SkinProfile
from app.models.assessment import SkinAssessment
from app.models.routine import SkincareRoutine
from app.models.progress import ProgressLog
from app.models.recommendation import Recommendation

router = APIRouter(
    prefix="/api/clients",
    tags=["Clients"],
    dependencies=[Depends(require_roles(UserRole.consultant, UserRole.dermatologist, UserRole.admin))],
)


class RecommendationIn(BaseModel):
    note: str


@router.get("")
def list_clients(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.role == UserRole.user).all()
    return [{"id": str(u.id), "name": u.full_name, "email": u.email} for u in users]


@router.get("/{user_id}")
def get_client_detail(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id, User.role == UserRole.user).first()
    if not user:
        raise HTTPException(status_code=404, detail="Client not found")

    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user.id).first()
    assessment = (
        db.query(SkinAssessment)
        .filter(SkinAssessment.user_id == user.id)
        .order_by(SkinAssessment.created_at.desc())
        .first()
    )
    routine = db.query(SkincareRoutine).filter(SkincareRoutine.user_id == user.id).first()
    logs = (
        db.query(ProgressLog)
        .filter(ProgressLog.user_id == user.id)
        .order_by(ProgressLog.log_date.desc())
        .limit(30)
        .all()
    )

    return {
        "user": {"id": str(user.id), "full_name": user.full_name, "email": user.email},
        "profile": {
            "skin_type": profile.skin_type,
            "age_group": profile.age_group,
            "skin_concerns": profile.skin_concerns,
            "allergies": profile.allergies,
            "sensitivities": profile.sensitivities,
            "sleep_quality": profile.sleep_quality,
            "sleep_hours": profile.sleep_hours,
            "water_intake_liters": profile.water_intake_liters,
            "lifestyle_habits": profile.lifestyle_habits,
            "environmental_exposure": profile.environmental_exposure,
        } if profile else None,
        "assessment": {
            "condition_score": assessment.condition_score,
            "identified_concerns": assessment.identified_concerns,
            "concern_severity": assessment.concern_severity,
            "prioritized_concerns": assessment.prioritized_concerns,
            "risk_factors": assessment.risk_factors,
            "created_at": assessment.created_at,
        } if assessment else None,
        "routine": {
            "morning_routine": routine.morning_routine,
            "evening_routine": routine.evening_routine,
            "weekly_treatments": routine.weekly_treatments,
        } if routine else None,
        "progress_logs": [
            {
                "log_date": l.log_date,
                "skin_health_score": l.skin_health_score,
                "routine_followed_morning": l.routine_followed_morning,
                "routine_followed_evening": l.routine_followed_evening,
                "skin_condition_note": l.skin_condition_note,
            }
            for l in logs
        ],
    }


@router.get("/{user_id}/recommendations")
def list_client_recommendations(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id, User.role == UserRole.user).first()
    if not user:
        raise HTTPException(status_code=404, detail="Client not found")

    recs = (
        db.query(Recommendation)
        .filter(Recommendation.client_id == user.id)
        .order_by(Recommendation.created_at.desc())
        .all()
    )
    result = []
    for r in recs:
        author = db.query(User).filter(User.id == r.author_id).first()
        result.append({
            "id": str(r.id),
            "note": r.note,
            "author_name": author.full_name if author else "Unknown",
            "author_role": r.author_role,
            "created_at": r.created_at,
        })
    return result


@router.post("/{user_id}/recommendations")
def create_client_recommendation(
    user_id: str,
    payload: RecommendationIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == user_id, User.role == UserRole.user).first()
    if not user:
        raise HTTPException(status_code=404, detail="Client not found")

    rec = Recommendation(
        client_id=user.id,
        author_id=current_user.id,
        author_role=current_user.role.value,
        note=payload.note,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)

    return {
        "id": str(rec.id),
        "note": rec.note,
        "author_name": current_user.full_name,
        "author_role": rec.author_role,
        "created_at": rec.created_at,
    }