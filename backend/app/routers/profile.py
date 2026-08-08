from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import UserOut, UserUpdate
from ..auth import get_current_user

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("", response_model=UserOut)
def update_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.phone is not None:
        current_user.phone = payload.phone
    if payload.occupation is not None:
        current_user.occupation = payload.occupation
    if payload.height_cm is not None:
        current_user.height_cm = payload.height_cm
    if payload.weight_kg is not None:
        current_user.weight_kg = payload.weight_kg
    db.commit()
    db.refresh(current_user)
    return current_user
