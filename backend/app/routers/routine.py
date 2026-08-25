from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user

from app.models.user import User
from app.models.skin_profile import SkinProfile
from app.models.routine import SkincareRoutine
from app.models.routine_history import RoutineHistory
from app.models.assessment import SkinAssessment

from app.schemas.routine import (
    RoutineOut,
    RoutineHistoryOut,
    RoutineUpdate,
)
from app.services.routine_service import generate_full_routine


router = APIRouter(
    prefix="/api/routine",
    tags=["Routine"],
)


# ---------------------------------------------------------------------------
# ADAPTIVE ASSESSMENT COMPARISON
# ---------------------------------------------------------------------------

def compare_assessments(
    previous: SkinAssessment | None,
    latest: SkinAssessment | None,
) -> str:

    if not latest:
        return "Routine generated without a skin assessment."

    if not previous:
        return "Initial personalized routine generated from the latest assessment."

    changes = []

    # -----------------------------------------------------------------------
    # Compare condition score
    # -----------------------------------------------------------------------

    old_score = previous.condition_score
    new_score = latest.condition_score

    if old_score is not None and new_score is not None:

        difference = round(
            new_score - old_score,
            2,
        )

        if difference > 0:
            changes.append(
                f"Skin health score improved from "
                f"{old_score} to {new_score}."
            )

        elif difference < 0:
            changes.append(
                f"Skin health score changed from "
                f"{old_score} to {new_score}."
            )

        else:
            changes.append(
                "Skin health score remained unchanged."
            )

    # -----------------------------------------------------------------------
    # Build previous concern -> severity mapping
    # -----------------------------------------------------------------------

    previous_concerns = {
        concern.concern_name.lower(): concern.severity.lower()
        for concern in previous.concerns
    }

    # -----------------------------------------------------------------------
    # Build latest concern -> severity mapping
    # -----------------------------------------------------------------------

    latest_concerns = {
        concern.concern_name.lower(): concern.severity.lower()
        for concern in latest.concerns
    }

    # -----------------------------------------------------------------------
    # Compare concerns
    # -----------------------------------------------------------------------

    all_concerns = set(
        previous_concerns.keys()
    ) | set(
        latest_concerns.keys()
    )

    for concern in sorted(all_concerns):

        old_severity = previous_concerns.get(concern)
        new_severity = latest_concerns.get(concern)

        # New concern
        if old_severity is None and new_severity is not None:

            changes.append(
                f"New concern detected: "
                f"{concern} ({new_severity})."
            )

        # Concern disappeared
        elif old_severity is not None and new_severity is None:

            changes.append(
                f"{concern} is no longer present."
            )

        # Severity changed
        elif (
            old_severity is not None
            and new_severity is not None
            and old_severity != new_severity
        ):

            severity_order = {
                "mild": 1,
                "moderate": 2,
                "severe": 3,
                "high": 3,
                "low": 1,
            }

            old_level = severity_order.get(
                old_severity,
                0,
            )

            new_level = severity_order.get(
                new_severity,
                0,
            )

            if new_level < old_level:

                changes.append(
                    f"{concern} severity improved "
                    f"from {old_severity} to {new_severity}."
                )

            elif new_level > old_level:

                changes.append(
                    f"{concern} severity increased "
                    f"from {old_severity} to {new_severity}."
                )

            else:

                changes.append(
                    f"{concern} severity changed "
                    f"from {old_severity} to {new_severity}."
                )

    # -----------------------------------------------------------------------
    # Nothing changed
    # -----------------------------------------------------------------------

    if not changes:
        return (
            "No significant changes were detected between "
            "the previous and latest assessments."
        )

    return " ".join(changes)


# ---------------------------------------------------------------------------
# GENERATE / REGENERATE PERSONALIZED ROUTINE
# ---------------------------------------------------------------------------

@router.post(
    "/generate",
    response_model=RoutineOut,
)
def generate_routine(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # -----------------------------------------------------------------------
    # Get skin profile
    # -----------------------------------------------------------------------

    profile = (
        db.query(SkinProfile)
        .filter(
            SkinProfile.user_id == current_user.id
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=400,
            detail=(
                "Create a skin profile before "
                "generating a routine."
            ),
        )

    # -----------------------------------------------------------------------
    # Get assessments - newest first
    # -----------------------------------------------------------------------

    assessments = (
        db.query(SkinAssessment)
        .filter(
            SkinAssessment.user_id == current_user.id
        )
        .order_by(
            SkinAssessment.created_at.desc()
        )
        .limit(2)
        .all()
    )

    latest_assessment = (
        assessments[0]
        if len(assessments) >= 1
        else None
    )

    previous_assessment = (
        assessments[1]
        if len(assessments) >= 2
        else None
    )

    # -----------------------------------------------------------------------
    # Build concern severity mapping
    # -----------------------------------------------------------------------

    concern_severity = {}

    if latest_assessment:

        concern_severity = {
            concern.concern_name.lower(): concern.severity
            for concern in latest_assessment.concerns
        }

    # -----------------------------------------------------------------------
    # Generate new personalized routine
    # -----------------------------------------------------------------------

    generated = generate_full_routine(

        skin_type=(
            profile.skin_type
            or "normal"
        ),

        age_group=profile.age_group,

        concerns=(
            profile.skin_concerns
            or []
        ),

        environmental_exposure=(
            profile.environmental_exposure
            or "moderate"
        ),

        allergies=(
            profile.allergies
            or []
        ),

        sensitivities=(
            profile.sensitivities
            or []
        ),

        concern_severity=concern_severity,

        condition_score=(
            latest_assessment.condition_score
            if latest_assessment
            else None
        ),

        lifestyle_habits=(
            profile.lifestyle_habits
            or []
        ),

        sleep_quality=profile.sleep_quality,

        sleep_hours=profile.sleep_hours,

        water_intake_liters=(
            profile.water_intake_liters
        ),
    )

    # -----------------------------------------------------------------------
    # Find current routine
    # -----------------------------------------------------------------------

    routine = (
        db.query(SkincareRoutine)
        .filter(
            SkincareRoutine.user_id == current_user.id
        )
        .first()
    )

    # -----------------------------------------------------------------------
    # Compare assessments
    # -----------------------------------------------------------------------

    change_summary = compare_assessments(
        previous_assessment,
        latest_assessment,
    )

    # -----------------------------------------------------------------------
    # Save CURRENT routine to history BEFORE replacing it
    # -----------------------------------------------------------------------

    if routine:

        history = RoutineHistory(

            user_id=current_user.id,

            assessment_id=(
                previous_assessment.id
                if previous_assessment
                else None
            ),

            morning_routine=(
                routine.morning_routine
                or []
            ),

            evening_routine=(
                routine.evening_routine
                or []
            ),

            weekly_treatments=(
                routine.weekly_treatments
                or []
            ),

            season=(
                routine.season
                or "all"
            ),

            notes=(
                routine.notes
                or ""
            ),

            condition_score=(
                previous_assessment.condition_score
                if previous_assessment
                else None
            ),

            change_summary=change_summary,
        )

        db.add(history)

        # ---------------------------------------------------------------
        # Update current routine
        # ---------------------------------------------------------------

        routine.morning_routine = (
            generated["morning_routine"]
        )

        routine.evening_routine = (
            generated["evening_routine"]
        )

        routine.weekly_treatments = (
            generated["weekly_treatments"]
        )

        routine.season = (
            generated["season"]
        )

        routine.notes = (
            generated["notes"]
        )

    # -----------------------------------------------------------------------
    # Create first routine
    # -----------------------------------------------------------------------

    else:

        routine = SkincareRoutine(

            user_id=current_user.id,

            morning_routine=(
                generated["morning_routine"]
            ),

            evening_routine=(
                generated["evening_routine"]
            ),

            weekly_treatments=(
                generated["weekly_treatments"]
            ),

            season=(
                generated["season"]
            ),

            notes=(
                generated["notes"]
            ),
        )

        db.add(routine)

    # -----------------------------------------------------------------------
    # Commit
    # -----------------------------------------------------------------------

    db.commit()

    db.refresh(routine)

    return routine


# ---------------------------------------------------------------------------
# GET CURRENT USER ROUTINE
# ---------------------------------------------------------------------------

@router.get(
    "/me",
    response_model=RoutineOut,
)
def get_my_routine(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    routine = (
        db.query(SkincareRoutine)
        .filter(
            SkincareRoutine.user_id == current_user.id
        )
        .first()
    )

    if not routine:

        raise HTTPException(
            status_code=404,
            detail=(
                "No routine yet. "
                "Generate one first."
            ),
        )

    return routine
# ---------------------------------------------------------------------------
# GET ROUTINE HISTORY
# ---------------------------------------------------------------------------

@router.get(
    "/history",
    response_model=list[RoutineHistoryOut],
)
def get_routine_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    history = (
        db.query(RoutineHistory)
        .filter(
            RoutineHistory.user_id == current_user.id
        )
        .order_by(
            RoutineHistory.created_at.desc()
        )
        .all()
    )

    return history
# ---------------------------------------------------------------------------
# MANUALLY UPDATE CURRENT ROUTINE
# ---------------------------------------------------------------------------

@router.put(
    "/me",
    response_model=RoutineOut,
)
def update_my_routine(
    data: RoutineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    routine = (
        db.query(SkincareRoutine)
        .filter(
            SkincareRoutine.user_id == current_user.id
        )
        .first()
    )

    if not routine:
        raise HTTPException(
            status_code=404,
            detail="No routine found. Generate a routine first.",
        )

    # Update routine with manually edited values
    routine.morning_routine = data.morning_routine
    routine.evening_routine = data.evening_routine
    routine.weekly_treatments = data.weekly_treatments
    routine.season = data.season
    routine.notes = data.notes

    db.commit()
    db.refresh(routine)

    return routine