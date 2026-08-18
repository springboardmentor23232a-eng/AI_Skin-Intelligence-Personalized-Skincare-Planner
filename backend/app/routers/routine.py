from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.dependencies import get_current_user
from app.schemas import RoutineUpdate
from routine.routine_engine import generate_routine


router = APIRouter(
    prefix="/routine",
    tags=["Routine Planner"]
)


@router.get("/current")
def get_current_routine(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the user's saved personalized routine.

    If a saved routine does not exist for the latest assessment,
    generates a new routine, saves it, and returns it.
    """

    # --------------------------------------------------
    # 1. Get the latest assessment
    # --------------------------------------------------

    assessment = (
        db.query(models.Assessment)
        .filter(
            models.Assessment.user_id == current_user.id
        )
        .order_by(
            models.Assessment.assessment_time.desc()
        )
        .first()
    )

    if assessment is None:
        raise HTTPException(
            status_code=404,
            detail="No skin assessment found. Please complete an assessment first."
        )

    # --------------------------------------------------
    # 2. Check for an existing saved routine
    # --------------------------------------------------

    saved_routine = (
        db.query(models.Routine)
        .filter(
            models.Routine.user_id == current_user.id,
            models.Routine.assessment_id == assessment.id
        )
        .first()
    )

    # --------------------------------------------------
    # 3. Return saved routine if it exists
    # --------------------------------------------------

    if saved_routine is not None:
        return saved_routine.routine_data

    # --------------------------------------------------
    # 4. Generate routine if no saved routine exists
    # --------------------------------------------------

    generated_routine = generate_routine(
        assessment,
        None
    )

    # --------------------------------------------------
    # 5. Save generated routine
    # --------------------------------------------------

    new_routine = models.Routine(
        user_id=current_user.id,
        assessment_id=assessment.id,
        routine_data=generated_routine
    )

    db.add(new_routine)
    db.commit()
    db.refresh(new_routine)

    return generated_routine

@router.post("/regenerate")
def regenerate_routine(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Regenerates the personalized skincare routine
    using the user's latest assessment.
    """

    assessment = (
        db.query(models.Assessment)
        .filter(
            models.Assessment.user_id == current_user.id
        )
        .order_by(
            models.Assessment.assessment_time.desc()
        )
        .first()
    )

    if assessment is None:
        raise HTTPException(
            status_code=404,
            detail="No skin assessment found. Please complete an assessment first."
        )

    previous_assessment = (
        db.query(models.Assessment)
        .filter(
            models.Assessment.user_id == current_user.id,
            models.Assessment.id != assessment.id
        )
        .order_by(
            models.Assessment.assessment_time.desc()
        )
        .first()
    )

    return generate_routine(
        assessment,
        previous_assessment
    )
@router.put("/update")
def update_routine(
    routine_update: RoutineUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Saves the user's manually customized skincare routine.
    """

    routine_data = routine_update.routine_data

    assessment_id = routine_data.get("assessment_id")

    if not assessment_id:
        raise HTTPException(
            status_code=400,
            detail="Assessment ID is required."
        )

    # Verify that the assessment belongs to the logged-in user
    assessment = (
        db.query(models.Assessment)
        .filter(
            models.Assessment.id == assessment_id,
            models.Assessment.user_id == current_user.id
        )
        .first()
    )

    if assessment is None:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found for the current user."
        )

    # Check whether a saved routine already exists
    saved_routine = (
        db.query(models.Routine)
        .filter(
            models.Routine.user_id == current_user.id,
            models.Routine.assessment_id == assessment_id
        )
        .first()
    )

    if saved_routine:
        # Update existing routine
        saved_routine.routine_data = routine_data
    else:
        # Create a new saved routine
        saved_routine = models.Routine(
            user_id=current_user.id,
            assessment_id=assessment_id,
            routine_data=routine_data
        )

        db.add(saved_routine)

    db.commit()
    db.refresh(saved_routine)

    return {
        "message": "Routine updated successfully.",
        "routine_id": saved_routine.id,
        "routine": saved_routine.routine_data
    }