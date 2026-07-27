from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.models.skin_profile import SkinProfile
from app.schemas.skin_profile import SkinProfileCreate, SkinProfileOut

router = APIRouter(prefix="/api/skin-profile", tags=["Skin Profile"])


@router.post("", response_model=SkinProfileOut)
def create_or_update_profile(
    payload: SkinProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if profile:
        for field, value in payload.dict().items():
            setattr(profile, field, value)
    else:
        profile = SkinProfile(user_id=current_user.id, **payload.dict())
        db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/me", response_model=SkinProfileOut)
def get_my_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="No skin profile yet. Create one first.")
    return profile
