from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, SkinProfile
from ..schemas import SkinProfileIn, SkinProfileOut
from ..auth import get_current_user

router = APIRouter(prefix="/api/skin-profile", tags=["skin-profile"])


@router.post("", response_model=SkinProfileOut, status_code=201)
def create_skin_profile(
    payload: SkinProfileIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Skin profile already exists, use PUT to update")

    profile = SkinProfile(user_id=current_user.id, **payload.dict())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("", response_model=SkinProfileOut)
def get_skin_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Skin profile not found")
    return profile


@router.put("", response_model=SkinProfileOut)
def update_skin_profile(
    payload: SkinProfileIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if not profile:
        profile = SkinProfile(user_id=current_user.id)
        db.add(profile)

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile


@router.delete("", status_code=204)
def delete_skin_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if profile:
        db.delete(profile)
        db.commit()
    return None
