from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.ingredient import Ingredient, IngredientConflict
from app.schemas.ingredient import (
    IngredientResponse, IngredientConflictResponse, CompatibilityCheckResponse
)

class IngredientEngine:
    """
    Module 5: Rule-Based Ingredient Intelligence Engine
    Analyzes ingredient interactions, conflict severity, comedogenic safety ratings,
    and suitability for skin types and concerns.
    """

    @staticmethod
    def get_all_ingredients(db: Session) -> List[Ingredient]:
        return db.query(Ingredient).order_by(Ingredient.name.asc()).all()

    @staticmethod
    def search_ingredients(db: Session, query: str) -> List[Ingredient]:
        search_term = f"%{query}%"
        return db.query(Ingredient).filter(
            (Ingredient.name.ilike(search_term)) |
            (Ingredient.category.ilike(search_term)) |
            (Ingredient.target_concerns.ilike(search_term))
        ).all()

    @staticmethod
    def get_all_conflicts(db: Session) -> List[IngredientConflict]:
        return db.query(IngredientConflict).all()

    @staticmethod
    def analyze_compatibility(
        db: Session,
        ingredients_list: List[str],
        skin_type: Optional[str] = "Combination",
        skin_concerns: Optional[List[str]] = None
    ) -> CompatibilityCheckResponse:
        skin_concerns = skin_concerns or []
        normalized_inputs = [ing.strip().lower() for ing in ingredients_list if ing.strip()]

        # Fetch matching ingredient records
        all_ing_db = db.query(Ingredient).all()
        matched_ing_map = {}
        for ing in all_ing_db:
            for item in normalized_inputs:
                if item in ing.name.lower() or ing.name.lower() in item:
                    matched_ing_map[ing.name.lower()] = ing

        # Check conflicts
        conflicts_db = db.query(IngredientConflict).all()
        conflicts_found: List[IngredientConflictResponse] = []

        for conf in conflicts_db:
            a_lower = conf.ingredient_a.lower()
            b_lower = conf.ingredient_b.lower()

            # Check if both ingredients exist in user list
            has_a = any(a_lower in item or item in a_lower for item in normalized_inputs)
            has_b = any(b_lower in item or item in b_lower for item in normalized_inputs)

            if has_a and has_b:
                conflicts_found.append(
                    IngredientConflictResponse(
                        id=conf.id,
                        ingredient_a=conf.ingredient_a,
                        ingredient_b=conf.ingredient_b,
                        severity=conf.severity.upper(),
                        warning_message=conf.warning_message,
                        recommendation=conf.recommendation
                    )
                )

        # Calculate max comedogenic rating & high-risk items
        max_comedogenic = 0
        high_risk_ingredients = []
        for ing_name, ing_obj in matched_ing_map.items():
            if ing_obj.comedogenic_rating > max_comedogenic:
                max_comedogenic = ing_obj.comedogenic_rating
            if ing_obj.comedogenic_rating >= 4:
                high_risk_ingredients.append(f"{ing_obj.name} (Comedogenic Rating: {ing_obj.comedogenic_rating})")

        # Determine overall safety rating
        has_high_severity = any(c.severity == "HIGH" for c in conflicts_found)
        has_med_severity = any(c.severity == "MEDIUM" for c in conflicts_found)

        if has_high_severity or max_comedogenic >= 4:
            overall_safety = "HIGH_RISK"
            suitable_for_skin = False
            summary = "High-risk conflict or pore-clogging ingredient detected! Avoid using these active ingredients simultaneously."
        elif has_med_severity or max_comedogenic == 3:
            overall_safety = "CAUTION"
            suitable_for_skin = True
            summary = "Moderate interaction detected. Separate routine applications (e.g. use one in morning, one in evening)."
        else:
            overall_safety = "SAFE"
            suitable_for_skin = True
            summary = "All ingredients are safe, complementary, and compatible with your routine!"

        return CompatibilityCheckResponse(
            overall_safety_rating=overall_safety,
            max_comedogenic_rating=max_comedogenic,
            conflicts_found=conflicts_found,
            high_risk_ingredients=high_risk_ingredients,
            suitable_for_skin=suitable_for_skin,
            summary=summary
        )
