from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from app.dependencies import get_current_user
from app import models

from ingredient.ingredient_engine import generate_ingredient_intelligence


router = APIRouter(
    prefix="/ingredient",
    tags=["Ingredient Intelligence"]
)


class IngredientIntelligenceRequest(BaseModel):
    ingredient: str
    skin_type: Optional[str] = ""
    concerns: Optional[List[str]] = []
    sensitivity: Optional[str] = ""
    allergies: Optional[List[str]] = []
    ingredients: Optional[List[str]] = None


@router.post("/intelligence")
def get_ingredient_intelligence(
    request: IngredientIntelligenceRequest,
    current_user: models.User = Depends(get_current_user)
):
    """
    Generates a complete Ingredient Intelligence report
    for the authenticated user.
    """

    try:
        ingredients_to_check = request.ingredients

        if not ingredients_to_check:
            ingredients_to_check = [request.ingredient]

        result = generate_ingredient_intelligence(
            ingredient=request.ingredient,
            skin_type=request.skin_type,
            concerns=request.concerns or [],
            sensitivity=request.sensitivity,
            allergies=request.allergies or [],
            ingredients=ingredients_to_check,
        )

        if not result or "error" in result:
            raise HTTPException(
                status_code=500,
                detail=result.get(
                    "error",
                    "Unable to generate ingredient intelligence."
                )
            )

        return {
            "user_id": current_user.id,
            "ingredient_intelligence": result
        }

    except HTTPException:
        raise

    except Exception as e:
        print(f"[ERROR] Ingredient Intelligence API failed: {e}")

        raise HTTPException(
            status_code=500,
            detail="Unable to process ingredient intelligence."
        )