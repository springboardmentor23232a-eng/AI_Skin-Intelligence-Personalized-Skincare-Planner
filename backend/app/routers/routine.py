from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, RoutineProfile, Routine, RoutineItem
from app.schemas import (
    RoutineProfileCreateUpdate,
    RoutineProfileResponse,
    RoutineResponse,
    RoutineManualUpdateRequest
)
from app.dependencies.auth import get_current_user
from app.services.routine_service import generate_personalized_routine_items
from app.logging_config import logger

router = APIRouter(prefix="/api/routine", tags=["Routine"])

@router.get("/profile", response_model=RoutineProfileResponse)
async def get_routine_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Gets the authenticated user's 28-question profile answers."""
    logger.info(f"Routine GET Profile: user={current_user.email}")
    profile = db.query(RoutineProfile).filter(RoutineProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Routine profile questionnaire not completed yet."
        )
    return profile


@router.post("/profile", response_model=RoutineProfileResponse)
async def save_routine_profile(
    payload: RoutineProfileCreateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Creates or updates the authenticated user's 28-question profile questionnaire."""
    logger.info(f"Routine POST Profile: user={current_user.email}")
    
    profile = db.query(RoutineProfile).filter(RoutineProfile.user_id == current_user.id).first()
    
    profile_data = payload.dict()
    if not profile_data.get("concerns"):
        profile_data["concerns"] = ["None"]
    if not profile_data.get("active_ingredients"):
        profile_data["active_ingredients"] = ["None"]

    if profile:
        # Update existing profile fields
        for key, val in profile_data.items():
            setattr(profile, key, val)
    else:
        # Create a new profile
        profile = RoutineProfile(user_id=current_user.id, **profile_data)
        db.add(profile)
        
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/generate", response_model=RoutineResponse)
async def generate_new_routine(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generates and saves a brand new routine based strictly on the current profile."""
    logger.info(f"Routine GENERATE: user={current_user.email}")
    
    profile = db.query(RoutineProfile).filter(RoutineProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot generate routine. Please fill out the skin profile questionnaire first."
        )
        
    # Execute rule engine logic
    routine_items_data = generate_personalized_routine_items(profile)
    
    # Create the parent Routine record
    db_routine = Routine(
        user_id=current_user.id,
        profile_id=profile.id,
        is_user_modified=False
    )
    db.add(db_routine)
    db.commit()
    db.refresh(db_routine)
    
    # Add child RoutineItem records
    for item in routine_items_data:
        db_item = RoutineItem(
            routine_id=db_routine.id,
            routine_type=item["routine_type"],
            category=item["category"],
            step_order=item["step_order"],
            name=item["name"],
            description=item["description"],
            frequency=item["frequency"],
            notes=item.get("notes")
        )
        db.add(db_item)
        
    db.commit()
    db.refresh(db_routine)
    return db_routine


@router.get("/current", response_model=RoutineResponse)
async def get_current_routine(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Gets the user's most recently generated active skincare routine."""
    logger.info(f"Routine GET Current: user={current_user.email}")
    
    routine = db.query(Routine).filter(Routine.user_id == current_user.id).order_by(Routine.generated_at.desc()).first()
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No generated routine found. Please complete profile and generate your routine."
        )
    return routine


@router.get("/history", response_model=List[RoutineResponse])
async def get_routine_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lists past routines in historical logs, sorted by generation date."""
    logger.info(f"Routine GET History: user={current_user.email}")
    routines = db.query(Routine).filter(Routine.user_id == current_user.id).order_by(Routine.generated_at.desc()).all()
    return routines


@router.get("/{id}", response_model=RoutineResponse)
async def get_routine_by_id(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves a specific routine by ID, ensuring user ownership verification."""
    logger.info(f"Routine GET by ID: id={id}, user={current_user.email}")
    
    routine = db.query(Routine).filter(Routine.id == id).first()
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skincare routine not found."
        )
        
    if routine.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this routine record."
        )
        
    return routine


@router.put("/{id}", response_model=RoutineResponse)
async def update_routine_manually(
    id: int,
    payload: RoutineManualUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Allows manual editing, reordering, custom additions, or enabling/disabling items."""
    logger.info(f"Routine PUT Manual Update: id={id}, user={current_user.email}")
    
    routine = db.query(Routine).filter(Routine.id == id).first()
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skincare routine not found."
        )
        
    if routine.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this routine."
        )
        
    # Clear out all current child items
    db.query(RoutineItem).filter(RoutineItem.routine_id == id).delete()
    
    # Save the new user-modified items list
    for idx, item in enumerate(payload.items):
        db_item = RoutineItem(
            routine_id=routine.id,
            routine_type=item.routine_type,
            category=item.category,
            step_order=item.step_order,
            name=item.name,
            description=item.description,
            frequency=item.frequency,
            notes=item.notes,
            is_enabled=item.is_enabled
        )
        db.add(db_item)
        
    # Flag the routine as modified by user
    routine.is_user_modified = True
    db.commit()
    db.refresh(routine)
    return routine


@router.delete("/{id}")
async def delete_routine(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a skincare routine from history logs."""
    logger.info(f"Routine DELETE: id={id}, user={current_user.email}")
    
    routine = db.query(Routine).filter(Routine.id == id).first()
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skincare routine not found."
        )
        
    if routine.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to delete this routine."
        )
        
    db.delete(routine)
    db.commit()
    return {"message": "Routine deleted successfully."}


@router.post("/{id}/regenerate", response_model=RoutineResponse)
async def regenerate_routine(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Regenerates a routine based on the latest profile, overwriting the specified card."""
    logger.info(f"Routine REGENERATE: id={id}, user={current_user.email}")
    
    routine = db.query(Routine).filter(Routine.id == id).first()
    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skincare routine not found."
        )
        
    if routine.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to regenerate this routine."
        )
        
    profile = db.query(RoutineProfile).filter(RoutineProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No profile details found. Please complete profile questionnaire."
        )
        
    # Clear out all previous items
    db.query(RoutineItem).filter(RoutineItem.routine_id == id).delete()
    
    # Generate fresh items list using the updated profile questionnaire
    new_items_data = generate_personalized_routine_items(profile)
    for item in new_items_data:
        db_item = RoutineItem(
            routine_id=routine.id,
            routine_type=item["routine_type"],
            category=item["category"],
            step_order=item["step_order"],
            name=item["name"],
            description=item["description"],
            frequency=item["frequency"],
            notes=item.get("notes")
        )
        db.add(db_item)
        
    # Reset is_user_modified flag to False since it is a fresh generation
    routine.is_user_modified = False
    routine.profile_id = profile.id
    db.commit()
    db.refresh(routine)
    return routine
