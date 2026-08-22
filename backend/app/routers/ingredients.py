from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Ingredient, RoutineProfile
from app.dependencies.auth import get_current_user
from app.schemas import (
    IngredientResponse,
    IngredientSuitabilityRequest,
    IngredientSuitabilityResponse,
    IngredientInteractionRequest,
    IngredientInteractionResponse,
    ProfileContextResponse
)
from app.services.ingredient_service import evaluate_suitability
from app.services.ingredient_interactions import analyze_interactions

router = APIRouter(prefix="/api/ingredients", tags=["Ingredient Intelligence"])

@router.get("", response_model=List[IngredientResponse])
async def list_ingredients(
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Lists ingredients in the database, with optional search and category filters."""
    query = db.query(Ingredient)
    
    if category:
        query = query.filter(Ingredient.category.ilike(category))
        
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Ingredient.name.ilike(search_filter)) | 
            (Ingredient.short_description.ilike(search_filter))
        )
        
    return query.order_by(Ingredient.name.asc()).all()

@router.get("/categories", response_model=List[str])
async def list_categories(db: Session = Depends(get_db)):
    """Returns all unique category names available in the ingredient database."""
    categories = db.query(Ingredient.category).distinct().all()
    return [c[0] for c in categories if c[0]]

@router.get("/my-profile-context", response_model=ProfileContextResponse)
async def get_profile_context(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves current user's profile questionnaire status and core parameters used for intelligence matching."""
    profile = db.query(RoutineProfile).filter(RoutineProfile.user_id == current_user.id).first()
    if not profile:
        return {
            "has_profile": False,
            "skin_type": None,
            "sensitivity": None,
            "concerns": [],
            "avoid_ingredients": None,
            "skincare_goal": None,
            "has_allergies": None,
            "has_allergic_reaction": None
        }
        
    return {
        "has_profile": True,
        "skin_type": profile.skin_type,
        "sensitivity": profile.sensitivity,
        "concerns": profile.concerns or [],
        "avoid_ingredients": profile.avoid_ingredients,
        "skincare_goal": profile.skincare_goal,
        "has_allergies": profile.has_allergies,
        "has_allergic_reaction": profile.has_allergic_reaction
    }

@router.get("/{ingredient_id}", response_model=IngredientResponse)
async def get_ingredient_details(ingredient_id: int, db: Session = Depends(get_db)):
    """Fetches details for a specific ingredient by ID."""
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingredient not found."
        )
    return ingredient

@router.post("/check", response_model=IngredientSuitabilityResponse)
async def check_ingredient_suitability(
    payload: IngredientSuitabilityRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Evaluates suitability of an ingredient against the user's active Module 4 skin profile questionnaire."""
    ingredient = db.query(Ingredient).filter(Ingredient.id == payload.ingredient_id).first()
    if not ingredient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingredient not found."
        )
        
    profile = db.query(RoutineProfile).filter(RoutineProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile not found. Please complete your Skin Profile Questionnaire first."
        )
        
    result = evaluate_suitability(profile, ingredient)
    return result

@router.post("/interactions", response_model=IngredientInteractionResponse)
async def check_ingredient_interactions(
    payload: IngredientInteractionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analyzes combinations of ingredients together for compatibility warnings."""
    if not payload.ingredient_ids or len(payload.ingredient_ids) < 2:
        return {
            "compatibility": "COMPATIBLE",
            "explanation": "Select at least 2 ingredients to analyze interactions.",
            "recommended_usage": "Follow the individual usage guidelines."
        }
        
    ingredients = db.query(Ingredient).filter(Ingredient.id.in_(payload.ingredient_ids)).all()
    if len(ingredients) != len(payload.ingredient_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more selected ingredients were not found."
        )
        
    profile = db.query(RoutineProfile).filter(RoutineProfile.user_id == current_user.id).first()
    if not profile:
        # Default empty/placeholder profile to support evaluation for unprofiled users safely
        profile = RoutineProfile(
            skin_type="Normal",
            sensitivity="Resilient",
            concerns=[],
            acne_severity="Mild",
            oiliness="Normal",
            dryness="Normal",
            redness_frequency="Rarely",
            has_routine="No",
            current_products=[],
            routine_frequency="Daily",
            skincare_irritation="No",
            active_ingredients=[],
            sleep_hours="8",
            water_intake="8",
            stress_level="Low",
            exercise_frequency="Weekly",
            outdoor_hours="1",
            climate="Moderate",
            pollution_exposure="Low",
            sunlight_exposure="Low",
            has_allergies="No",
            avoid_ingredients=None,
            has_allergic_reaction="No",
            skincare_time="Quick",
            routine_preference="Simple",
            budget="Moderate",
            skincare_goal="Maintain healthy skin"
        )
        
    result = analyze_interactions(profile, ingredients)
    return result
