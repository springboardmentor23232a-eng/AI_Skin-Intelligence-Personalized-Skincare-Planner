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
    dependencies=[
        Depends(
            require_roles(
                UserRole.consultant,
                UserRole.dermatologist,
                UserRole.admin,
            )
        )
    ],
)


class RecommendationIn(BaseModel):
    note: str


# ============================================================
# LIST ALL PATIENT CLIENTS
# ============================================================

@router.get("")
def list_clients(
    db: Session = Depends(get_db),
):
    users = (
        db.query(User)
        .filter(User.role == UserRole.user)
        .all()
    )

    return [
        {
            "id": str(user.id),
            "name": user.full_name,
            "email": user.email,
        }
        for user in users
    ]


# ============================================================
# GET SINGLE CLIENT DETAILS
# ============================================================

@router.get("/{user_id}")
def get_client_detail(
    user_id: str,
    db: Session = Depends(get_db),
):
    try:

        # ----------------------------------------------------
        # Find patient
        # ----------------------------------------------------

        user = (
            db.query(User)
            .filter(
                User.id == user_id,
                User.role == UserRole.user,
            )
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="Client not found",
            )

        # ----------------------------------------------------
        # Skin Profile
        # ----------------------------------------------------

        profile = (
            db.query(SkinProfile)
            .filter(SkinProfile.user_id == user.id)
            .first()
        )

        # ----------------------------------------------------
        # Latest AI Assessment
        # ----------------------------------------------------

        assessment = (
            db.query(SkinAssessment)
            .filter(SkinAssessment.user_id == user.id)
            .order_by(SkinAssessment.created_at.desc())
            .first()
        )

        # ----------------------------------------------------
        # Current Routine
        # ----------------------------------------------------

        routine = (
            db.query(SkincareRoutine)
            .filter(SkincareRoutine.user_id == user.id)
            .first()
        )

        # ----------------------------------------------------
        # Progress Logs
        # ----------------------------------------------------

        logs = (
            db.query(ProgressLog)
            .filter(ProgressLog.user_id == user.id)
            .order_by(ProgressLog.log_date.desc())
            .limit(30)
            .all()
        )

        # ----------------------------------------------------
        # Build Profile Response
        # ----------------------------------------------------

        profile_data = None

        if profile:
            profile_data = {
                "skin_type": getattr(profile, "skin_type", None),
                "age_group": getattr(profile, "age_group", None),
                "skin_concerns": getattr(profile, "skin_concerns", None) or [],
                "allergies": getattr(profile, "allergies", None) or [],
                "sensitivities": getattr(profile, "sensitivities", None) or [],
                "sleep_quality": getattr(profile, "sleep_quality", None),
                "sleep_hours": getattr(profile, "sleep_hours", None),
                "water_intake_liters": getattr(
                    profile,
                    "water_intake_liters",
                    None,
                ),
                "lifestyle_habits": getattr(
                    profile,
                    "lifestyle_habits",
                    None,
                ) or [],
                "environmental_exposure": getattr(
                    profile,
                    "environmental_exposure",
                    None,
                ),
            }

        # ----------------------------------------------------
        # Build Assessment Response
        # ----------------------------------------------------

        assessment_data = None

        if assessment:
            assessment_data = {
                "condition_score": getattr(
                    assessment,
                    "condition_score",
                    None,
                ),
                "identified_concerns": getattr(
                    assessment,
                    "identified_concerns",
                    None,
                ) or [],
                "concern_severity": getattr(
                    assessment,
                    "concern_severity",
                    None,
                ) or {},
                "prioritized_concerns": getattr(
                    assessment,
                    "prioritized_concerns",
                    None,
                ) or [],
                "risk_factors": getattr(
                    assessment,
                    "risk_factors",
                    None,
                ) or [],
                "created_at": getattr(
                    assessment,
                    "created_at",
                    None,
                ),
            }

        # ----------------------------------------------------
        # Build Routine Response
        # ----------------------------------------------------

        routine_data = None

        if routine:
            routine_data = {
                "morning_routine": getattr(
                    routine,
                    "morning_routine",
                    None,
                ) or [],
                "evening_routine": getattr(
                    routine,
                    "evening_routine",
                    None,
                ) or [],
                "weekly_treatments": getattr(
                    routine,
                    "weekly_treatments",
                    None,
                ) or [],
            }

        # ----------------------------------------------------
        # Build Progress Response
        # ----------------------------------------------------

        progress_data = []

        for log in logs:
            progress_data.append(
                {
                    "log_date": getattr(
                        log,
                        "log_date",
                        None,
                    ),
                    "skin_health_score": getattr(
                        log,
                        "skin_health_score",
                        None,
                    ),
                    "routine_followed_morning": getattr(
                        log,
                        "routine_followed_morning",
                        None,
                    ),
                    "routine_followed_evening": getattr(
                        log,
                        "routine_followed_evening",
                        None,
                    ),
                    "skin_condition_note": getattr(
                        log,
                        "skin_condition_note",
                        None,
                    ),
                }
            )

        # ----------------------------------------------------
        # Final Response
        # ----------------------------------------------------

        return {
            "user": {
                "id": str(user.id),
                "full_name": user.full_name,
                "email": user.email,
            },
            "profile": profile_data,
            "assessment": assessment_data,
            "routine": routine_data,
            "progress_logs": progress_data,
        }

    except HTTPException:
        raise

    except Exception as e:
        print("CLIENT DETAIL ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail=f"Failed to load client details: {str(e)}",
        )


# ============================================================
# GET CLIENT RECOMMENDATIONS
# ============================================================

@router.get("/{user_id}/recommendations")
def list_client_recommendations(
    user_id: str,
    db: Session = Depends(get_db),
):

    user = (
        db.query(User)
        .filter(
            User.id == user_id,
            User.role == UserRole.user,
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Client not found",
        )

    recs = (
        db.query(Recommendation)
        .filter(
            Recommendation.client_id == user.id
        )
        .order_by(
            Recommendation.created_at.desc()
        )
        .all()
    )

    result = []

    for recommendation in recs:

        author = (
            db.query(User)
            .filter(
                User.id == recommendation.author_id
            )
            .first()
        )

        result.append(
            {
                "id": str(recommendation.id),
                "note": recommendation.note,
                "author_name": (
                    author.full_name
                    if author
                    else "Unknown"
                ),
                "author_role": recommendation.author_role,
                "created_at": recommendation.created_at,
            }
        )

    return result


# ============================================================
# ADD CLIENT RECOMMENDATION
# ============================================================

@router.post("/{user_id}/recommendations")
def create_client_recommendation(
    user_id: str,
    payload: RecommendationIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    user = (
        db.query(User)
        .filter(
            User.id == user_id,
            User.role == UserRole.user,
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Client not found",
        )

    if not payload.note.strip():
        raise HTTPException(
            status_code=400,
            detail="Recommendation cannot be empty",
        )

    rec = Recommendation(
        client_id=user.id,
        author_id=current_user.id,
        author_role=current_user.role.value,
        note=payload.note.strip(),
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