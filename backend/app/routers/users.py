from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.deps import get_current_user, require_admin

router = APIRouter(prefix="/api/users", tags=["User Profile"])


@router.get("/profile", response_model=schemas.SkinProfileOut)
def get_profile(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.SkinProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.put("/profile", response_model=schemas.SkinProfileOut)
def update_profile(
    payload: schemas.SkinProfileIn,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.SkinProfile(user_id=current_user.id)
        db.add(profile)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile


@router.get("", response_model=list[schemas.UserOut])
def list_all_users(db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    return db.query(models.User).all()


@router.put("/{user_id}/deactivate", response_model=schemas.UserOut)
def deactivate_user(user_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


@router.put("/{user_id}/activate", response_model=schemas.UserOut)
def activate_user(user_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user
