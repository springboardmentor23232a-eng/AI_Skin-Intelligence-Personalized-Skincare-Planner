from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.user import (
    UserOut,
    UserUpdate,
    ChangePassword,
)


router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
)


# =========================================================
# GET CURRENT USER
# =========================================================

@router.get("/me", response_model=UserOut)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user


# =========================================================
# UPDATE ACCOUNT INFORMATION
# =========================================================

@router.put("/me", response_model=UserOut)
def update_me(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # Check whether another account already uses this email
    existing_user = (
        db.query(User)
        .filter(
            User.email == payload.email,
            User.id != current_user.id,
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="This email address is already registered.",
        )

    # Update name
    current_user.full_name = payload.full_name.strip()

    # Update email
    current_user.email = payload.email

    db.commit()
    db.refresh(current_user)

    return current_user


# =========================================================
# CHANGE PASSWORD
# =========================================================

@router.put("/me/password")
def change_password(
    payload: ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    # OAuth users may not have a password
    if not current_user.hashed_password:
        raise HTTPException(
            status_code=400,
            detail="Password change is not available for this account.",
        )

    # Check current password
    if not verify_password(
        payload.current_password,
        current_user.hashed_password,
    ):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect.",
        )

    # Check new password
    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="New password must be at least 8 characters long.",
        )

    # Check confirmation
    if payload.new_password != payload.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="New passwords do not match.",
        )

    # Don't allow same password
    if verify_password(
        payload.new_password,
        current_user.hashed_password,
    ):
        raise HTTPException(
            status_code=400,
            detail="New password must be different from your current password.",
        )

    # Hash new password using the same bcrypt function
    current_user.hashed_password = hash_password(
        payload.new_password
    )

    db.commit()

    return {
        "ok": True,
        "message": "Password changed successfully.",
    }