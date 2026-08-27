"""
Ingredient Education Engine
---------------------------
Provides educational information about supported skincare ingredients.
"""

from ingredient.ingredient_data import INGREDIENT_DATA
from ingredient.ingredient_analyzer import normalize_ingredient


def educate_ingredient(ingredient: str) -> dict:
    """
    Provide educational information about a skincare ingredient.

    Returns:
        {
            "ingredient": "...",
            "what_it_is": "...",
            "benefits": [...],
            "who_may_benefit": [...],
            "cautions": [...],
            "how_to_use": "..."
        }
    """

    try:
        normalized = normalize_ingredient(ingredient)

        if not normalized:
            return {
                "error": "Ingredient name is required."
            }

        data = INGREDIENT_DATA.get(normalized)

        if not data:
            return {
                "error": f"Ingredient '{ingredient}' is not currently supported."
            }

        category = data["category"]

        usage_guidance = {
            "Retinoids": (
                "Introduce gradually into a routine and follow with "
                "appropriate moisturizer and daytime sun protection."
            ),
            "Niacinamide": (
                "Can generally be incorporated into a regular skincare "
                "routine according to the product formulation."
            ),
            "Vitamin C": (
                "Commonly used in daytime routines and should be paired "
                "with appropriate sun protection."
            ),
            "Hyaluronic Acid": (
                "Can be incorporated into hydrating routines, especially "
                "when the skin feels dry or dehydrated."
            ),
            "Salicylic Acid": (
                "Introduce according to product directions and avoid "
                "excessive use if dryness or irritation occurs."
            ),
            "Ceramides": (
                "Can be used regularly to support the skin barrier and "
                "reduce moisture loss."
            ),
            "Peptides": (
                "Can be incorporated into routines focused on skin "
                "conditioning and the appearance of firmness."
            ),
            "AHAs/BHAs": (
                "Use carefully as exfoliating ingredients and avoid "
                "excessive exfoliation."
            ),
        }

        return {
            "ingredient": category,
            "what_it_is": data["description"],
            "benefits": data["benefits"],
            "who_may_benefit": data["suitable_for"],
            "cautions": data["cautions"],
            "how_to_use": usage_guidance.get(
                category,
                "Follow the instructions provided with the product."
            ),
        }

    except Exception as e:
        return {
            "error": f"Ingredient education failed: {str(e)}"
        }


if __name__ == "__main__":
    import json

    print("=" * 60)
    print(" INGREDIENT EDUCATION ENGINE TEST")
    print("=" * 60)

    test_ingredients = [
        "Retinoids",
        "Niacinamide",
        "Vitamin C",
        "Hyaluronic Acid",
        "Salicylic Acid",
        "Ceramides",
        "Peptides",
        "AHAs/BHAs",
    ]

    for ingredient in test_ingredients:

        result = educate_ingredient(ingredient)

        print(f"\n--- {ingredient} ---")
        print(json.dumps(result, indent=2))

    print("\n" + "=" * 60)
    print(" INGREDIENT EDUCATION TEST COMPLETED")
    print("=" * 60)