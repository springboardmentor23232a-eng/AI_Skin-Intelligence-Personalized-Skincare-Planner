from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from app.schemas import (
    IngredientAnalysisRequest,
    IngredientAnalysisResponse,
    IngredientEducationResponse,
    IngredientInteractionItem
)
from app.services.ingredient_engine import ingredient_engine

router = APIRouter(tags=["Module 5: Ingredient Intelligence"])


@router.post("/analyze", response_model=IngredientAnalysisResponse)
def analyze_ingredients(payload: IngredientAnalysisRequest):
    """
    Module 5: Analyzes ingredient list against skin profile, checks clashes/conflicts,
    beneficial synergies, and flags user allergens.
    """
    if not payload.ingredient_names:
        raise HTTPException(status_code=400, detail="Ingredient list cannot be empty.")

    res = ingredient_engine.analyze_ingredients(
        ingredient_names=payload.ingredient_names,
        skin_type=payload.skin_type or "Combination",
        sensitivities=payload.sensitivities,
        allergies=payload.allergies,
        active_concerns=payload.active_concerns
    )
    return res


@router.get("/categories", response_model=IngredientEducationResponse)
def get_ingredient_categories():
    """
    Module 5: Retrieves educational dictionary for 8 ingredient categories:
    Retinoids, Niacinamide, Vitamin C, Hyaluronic Acid, Salicylic Acid, Ceramides, Peptides, AHAs/BHAs.
    """
    cats = ingredient_engine.get_category_dictionary()
    return {
        "success": True,
        "total_categories": len(cats),
        "categories": cats
    }


@router.get("/{name_or_id}")
def get_ingredient_details(name_or_id: str):
    """
    Module 5: Looks up detailed ingredient specifications and usage guidelines by name or ID.
    """
    analysis = ingredient_engine.analyze_ingredients(ingredient_names=[name_or_id])
    if not analysis["suitability_breakdown"]:
        raise HTTPException(status_code=440, detail=f"Ingredient '{name_or_id}' not found.")
    return {
        "success": True,
        "ingredient": analysis["suitability_breakdown"][0],
        "recommendations": analysis["recommendations"]
    }
