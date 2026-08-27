"""
Ingredient Intelligence Engine
------------------------------
Central integration layer for Module 5.

Combines:
1. Ingredient analysis
2. Suitability assessment
3. Interaction analysis
4. Allergy detection
5. Ingredient education
"""

from ingredient.ingredient_analyzer import analyze_ingredient
from ingredient.suitability_engine import assess_suitability
from ingredient.interaction_engine import analyze_interactions
from ingredient.allergy_detector import detect_allergy_conflicts
from ingredient.education_engine import educate_ingredient


def generate_ingredient_intelligence(
    ingredient: str,
    skin_type: str = "",
    concerns: list = None,
    sensitivity: str = "",
    allergies: list = None,
    ingredients: list = None,
) -> dict:
    """
    Generate a complete ingredient intelligence report.

    Parameters:
        ingredient:
            Main ingredient being evaluated.

        skin_type:
            User's predicted skin type.

        concerns:
            User's identified skin concerns.

        sensitivity:
            User's sensitivity level.

        allergies:
            User's recorded allergies.

        ingredients:
            Optional list of ingredients to check for interactions.

    Returns:
        Complete ingredient intelligence payload.
    """

    try:
        if concerns is None:
            concerns = []

        if allergies is None:
            allergies = []

        if ingredients is None:
            ingredients = [ingredient]

        # ---------------------------------------------------------
        # 1. Ingredient Analysis
        # ---------------------------------------------------------
        analysis = analyze_ingredient(ingredient)

        if "error" in analysis:
            return analysis

        # ---------------------------------------------------------
        # 2. Suitability Assessment
        # ---------------------------------------------------------
        suitability = assess_suitability(
            ingredient=ingredient,
            skin_type=skin_type,
            concerns=concerns,
            sensitivity=sensitivity,
        )

        # ---------------------------------------------------------
        # 3. Ingredient Interaction Analysis
        # ---------------------------------------------------------
        interaction_analysis = analyze_interactions(
            ingredients=ingredients
        )

        # ---------------------------------------------------------
        # 4. Allergy Detection
        # ---------------------------------------------------------
        allergy_analysis = detect_allergy_conflicts(
            ingredient=ingredient,
            allergies=allergies,
        )

        # ---------------------------------------------------------
        # 5. Ingredient Education
        # ---------------------------------------------------------
        education = educate_ingredient(ingredient)

        # ---------------------------------------------------------
        # 6. Final Unified Payload
        # ---------------------------------------------------------
        return {
            "ingredient": analysis,
            "suitability": suitability,
            "interactions": interaction_analysis,
            "allergy_check": allergy_analysis,
            "education": education,
        }

    except Exception as e:
        return {
            "error": f"Ingredient intelligence generation failed: {str(e)}"
        }


if __name__ == "__main__":
    import json

    print("=" * 70)
    print(" INGREDIENT INTELLIGENCE ENGINE TEST")
    print("=" * 70)

    test_data = {
        "ingredient": "Retinoids",
        "skin_type": "Oily Skin",
        "concerns": [
            "Acne Prone",
            "Wrinkles",
        ],
        "sensitivity": "High",
        "allergies": [
            "Fragrance"
        ],
        "ingredients": [
            "Retinoids",
            "AHAs/BHAs",
        ],
    }

    result = generate_ingredient_intelligence(**test_data)

    print(json.dumps(result, indent=2))

    print("\n" + "=" * 70)
    print(" INGREDIENT INTELLIGENCE ENGINE TEST COMPLETED")
    print("=" * 70)