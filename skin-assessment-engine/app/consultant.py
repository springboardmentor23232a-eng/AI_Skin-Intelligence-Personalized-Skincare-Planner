from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import get_db
from . import models
from .auth import get_current_user


router = APIRouter(
    prefix="/api/consultant",
    tags=["Consultant"]
)


# =========================================================
# GET CONSULTANT CLIENTS
# =========================================================

@router.get("/clients")
def get_consultant_clients(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    # -----------------------------------------------------
    # Check logged-in user
    # -----------------------------------------------------

    if current_user.get("role", "").upper() != "CONSULTANT":
        raise HTTPException(
            status_code=403,
            detail="Only consultants can access client information."
        )

    # -----------------------------------------------------
    # Get all client users
    # -----------------------------------------------------

    clients = (
        db.query(models.User)
        .filter(
            models.User.role == "USER"
        )
        .order_by(
            models.User.name.asc()
        )
        .all()
    )

    result = []

    # -----------------------------------------------------
    # Get latest assessment for every client
    # -----------------------------------------------------

    for client in clients:

        latest_assessment = (
            db.query(models.SkinAssessment)
            .filter(
                models.SkinAssessment.user_id == client.id
            )
            .order_by(
                models.SkinAssessment.assessment_date.desc()
            )
            .first()
        )

        # -------------------------------------------------
        # Allergy information
        # -------------------------------------------------

        allergy_count = (
            db.query(models.UserIngredientAllergy)
            .filter(
                models.UserIngredientAllergy.user_id == client.id
            )
            .count()
        )

        if allergy_count > 0:
            allergy_status = "Known allergy/sensitivity"
        else:
            allergy_status = "No known allergy"

        # -------------------------------------------------
        # Build client profile
        # -------------------------------------------------

        result.append({
            "id": client.id,
            "name": client.name,
            "email": client.email,

            "skin_type": (
                latest_assessment.skin_type
                if latest_assessment
                else None
            ),

            "main_concern": (
                latest_assessment.main_concern
                if latest_assessment
                else None
            ),

            "sensitivity": (
                latest_assessment.sensitivity
                if latest_assessment
                else None
            ),

            "skin_health_score": (
                latest_assessment.skin_health_score
                if latest_assessment
                else None
            ),

            "allergy_status": allergy_status,

            "allergy_count": allergy_count,

            "assessment_id": (
                latest_assessment.id
                if latest_assessment
                else None
            ),

            "assessment_date": (
                latest_assessment.assessment_date
                if latest_assessment
                else None
            )
        })

    return {
        "total_clients": len(result),
        "clients": result
    }