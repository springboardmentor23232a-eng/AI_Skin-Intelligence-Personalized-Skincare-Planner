from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.security import get_current_user, get_optional_current_user, AuthenticatedUser
from app.engine.ingredient_engine import IngredientEngine
from app.schemas.ingredient import (
    IngredientResponse, IngredientConflictResponse, CompatibilityCheckInput, CompatibilityCheckResponse
)

router = APIRouter(prefix="", tags=["Ingredient Intelligence Engine"])

# 1. GET /ingredient - List or search ingredients
@router.get(
    "/ingredient",
    response_model=List[IngredientResponse],
    status_code=status.HTTP_200_OK,
    summary="Search & List Ingredients",
    description="Lists all ingredients or filters by search query."
)
def get_ingredients(
    q: Optional[str] = Query(None, description="Search term for ingredient name, category, or concern"),
    db: Session = Depends(get_db)
):
    if q:
        return IngredientEngine.search_ingredients(db, q)
    return IngredientEngine.get_all_ingredients(db)

# 2. GET /ingredient/conflicts - List all known ingredient conflict rules
@router.get(
    "/ingredient/conflicts",
    response_model=List[IngredientConflictResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Ingredient Conflict Matrix",
    description="Returns all active pairwise ingredient conflict rules and warnings."
)
def get_conflicts(db: Session = Depends(get_db)):
    return IngredientEngine.get_all_conflicts(db)

# 3. POST /ingredient/analyze - Multi-ingredient safety & interaction analysis
@router.post(
    "/ingredient/analyze",
    response_model=CompatibilityCheckResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Multi-Ingredient Compatibility",
    description="Audits a list of ingredients for conflict severity, comedogenic risks, and overall routine safety."
)
def analyze_ingredients(
    input_data: CompatibilityCheckInput,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_optional_current_user)
):
    return IngredientEngine.analyze_compatibility(
        db=db,
        ingredients_list=input_data.ingredients,
        skin_type=input_data.skin_type,
        skin_concerns=input_data.skin_concerns
    )
