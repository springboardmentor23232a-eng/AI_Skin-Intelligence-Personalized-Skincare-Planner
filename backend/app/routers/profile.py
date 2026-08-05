from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import UserResponse, ProfileUpdate
from app.models import User
from app.dependencies.auth import get_current_user
from app.services import user_service
from app.logging_config import logger

router = APIRouter(prefix="/api/profile", tags=["Profile"])

@router.get("", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Retrieves the profile details of the current authenticated user."""
    logger.info(f"API Profile GET: {current_user.email}")
    return current_user

@router.put("", response_model=UserResponse)
async def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates the user profile's name field. Other properties are protected from changes."""
    logger.info(f"API Profile PUT update: {current_user.email} to name '{payload.name}'")
    updated_user = user_service.update_user_profile_name(db, current_user.id, payload.name)
    return updated_user
