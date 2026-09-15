from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import get_db
from . import models, schemas
from .auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


# ==========================
# Register User
# ==========================

@router.post("/register", response_model=schemas.UserResponse)
def register_user(
    user: schemas.UserRegister,
    db: Session = Depends(get_db)
):

    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role,
        provider="LOCAL"
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return new_user


# ==========================
# Login User
# ==========================

@router.post("/login", response_model=schemas.TokenResponse)
def login_user(
    user: schemas.UserLogin,
    db: Session = Depends(get_db)
):

    db_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if db_user is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        db_user.password
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        {
            "id": db_user.id,
            "email": db_user.email,
            "role": db_user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": db_user.role
    }


# ==========================
# GET USER PROFILE
# ==========================

@router.get("/profile")
def get_profile(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user = db.query(models.User).filter(
        models.User.id == current_user["id"]
    ).first()

    if user is None:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "provider": user.provider
    }


# ==========================
# UPDATE USER PROFILE
# ==========================

@router.put("/profile")
def update_profile(
    profile: schemas.ProfileUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user = db.query(models.User).filter(
        models.User.id == current_user["id"]
    ).first()

    if user is None:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Only update name
    # Role cannot be changed from frontend

    user.name = profile.name

    db.commit()

    db.refresh(user)

    return {
        "message": "Profile updated successfully",
        "name": user.name,
        "email": user.email,
        "role": user.role
    }


# =========================================================
# ADMIN - DELETE USER
# =========================================================

@router.delete("/admin/users/{user_id}")
def delete_user(
    user_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # -----------------------------------------
    # Check whether logged-in user is ADMIN
    # -----------------------------------------

    if current_user.get("role") != "ADMIN":

        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    # -----------------------------------------
    # Find user to delete
    # -----------------------------------------

    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if user is None:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # -----------------------------------------
    # Prevent admin from deleting themselves
    # -----------------------------------------

    if user.id == current_user.get("id"):

        raise HTTPException(
            status_code=400,
            detail="Admin cannot delete their own account"
        )

    # -----------------------------------------
    # Delete dependent records first
    # -----------------------------------------

    db.query(models.UserIngredientAllergy).filter(
        models.UserIngredientAllergy.user_id == user.id
    ).delete(
        synchronize_session=False
    )

    db.query(models.SkinAssessment).filter(
        models.SkinAssessment.user_id == user.id
    ).delete(
        synchronize_session=False
    )
    # =========================================================
# ADMIN - GET ALL USERS
# =========================================================

@router.get("/admin/users")
def get_all_users(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Only ADMIN can view users
    if current_user.get("role") != "ADMIN":

        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    users = db.query(models.User).order_by(
        models.User.id.asc()
    ).all()

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "provider": user.provider,
            "created_at": user.created_at
        }
        for user in users
    ]

    # -----------------------------------------
    # Delete user
    # -----------------------------------------

    db.delete(user)

    db.commit()

    return {
        "message": "User deleted successfully",
        "user_id": user_id
    }