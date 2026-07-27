from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.models.skin_profile import SkinProfile
from app.models.routine import SkincareRoutine
from app.schemas.routine import RoutineOut
from app.services.routine_service import generate_full_routine

router = APIRouter(prefix="/api/routine", tags=["Routine"])


@router.post("/generate", response_model=RoutineOut)
def generate_routine(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Create a skin profile before generating a routine.")

    generated = generate_full_routine(
        skin_type=profile.skin_type or "normal",
        concerns=profile.skin_concerns or [],
        environmental_exposure=profile.environmental_exposure or "moderate",
    )

    routine = db.query(SkincareRoutine).filter(SkincareRoutine.user_id == current_user.id).first()
    if routine:
        routine.morning_routine = generated["morning_routine"]
        routine.evening_routine = generated["evening_routine"]
        routine.weekly_treatments = generated["weekly_treatments"]
        routine.season = generated["season"]
    else:
        routine = SkincareRoutine(user_id=current_user.id, **generated)
        db.add(routine)

    db.commit()
    db.refresh(routine)
    return routine


@router.get("/me", response_model=RoutineOut)
def get_my_routine(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    routine = db.query(SkincareRoutine).filter(SkincareRoutine.user_id == current_user.id).first()
    if not routine:
        raise HTTPException(status_code=404, detail="No routine yet. Generate one first.")
    return routine
