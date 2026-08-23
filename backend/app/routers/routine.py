from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.deps import get_current_user
from app.ml.scoring_engine import generate_routine_steps

router = APIRouter(prefix="/api/routine", tags=["Routine Generator"])


def _concerns_for_latest_assessment(db: Session, user_id: str):
    latest = (
        db.query(models.SkinAssessment)
        .filter(models.SkinAssessment.user_id == user_id)
        .order_by(models.SkinAssessment.assessment_date.desc())
        .first()
    )
    if not latest:
        return None, []
    return latest, [{"concern_name": c.concern_name, "severity": c.severity} for c in latest.concerns]


@router.post("/generate", response_model=list[schemas.RoutineOut])
def generate_routine(
    routine_type: str = "morning",
    season: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if routine_type not in ("morning", "evening", "weekly", "seasonal"):
        raise HTTPException(status_code=400, detail="Invalid routine_type.")

    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    skin_type = profile.skin_type if profile else None
    latest_assessment, concerns = _concerns_for_latest_assessment(db, current_user.id)

    # deactivate old routines of same type
    db.query(models.Routine).filter(
        models.Routine.user_id == current_user.id,
        models.Routine.routine_type == routine_type,
        models.Routine.is_active == True,  # noqa: E712
    ).update({"is_active": False})

    steps_data = generate_routine_steps(routine_type, skin_type, concerns)
    routine = models.Routine(
        user_id=current_user.id,
        assessment_id=latest_assessment.id if latest_assessment else None,
        routine_type=routine_type,
        season=season,
    )
    db.add(routine)
    db.flush()

    for i, step in enumerate(steps_data, start=1):
        db.add(models.RoutineStep(
            routine_id=routine.id, step_order=i,
            category=step["category"], instruction=step["instruction"],
        ))

    db.commit()
    db.refresh(routine)
    return [routine]


@router.get("", response_model=list[schemas.RoutineOut])
def list_routines(active_only: bool = True, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    q = db.query(models.Routine).filter(models.Routine.user_id == current_user.id)
    if active_only:
        q = q.filter(models.Routine.is_active == True)  # noqa: E712
    return q.order_by(models.Routine.generated_at.desc()).all()


@router.get("/{routine_id}", response_model=schemas.RoutineOut)
def get_routine(routine_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    routine = db.query(models.Routine).filter(models.Routine.id == routine_id, models.Routine.user_id == current_user.id).first()
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found.")
    return routine


@router.delete("/{routine_id}", status_code=204)
def delete_routine(routine_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    routine = db.query(models.Routine).filter(models.Routine.id == routine_id, models.Routine.user_id == current_user.id).first()
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found.")
    db.delete(routine)
    db.commit()
    return None
