"""
Ingredient Analyzer
-------------------
Provides structured analysis for supported skincare ingredients.
"""

from ingredient.ingredient_data import (
    INGREDIENT_DATA,
    INGREDIENT_ALIASES,
)


def normalize_ingredient(ingredient: str) -> str:
    """
    Normalize an ingredient name and resolve common aliases.
    """
    if not isinstance(ingredient, str):
        return ""

    cleaned = ingredient.strip().lower()

    if cleaned in INGREDIENT_DATA:
        return cleaned

    return INGREDIENT_ALIASES.get(cleaned, cleaned)


def analyze_ingredient(ingredient: str) -> dict:
    """
    Return complete information about a supported ingredient.

    Returns:
        {
            "ingredient": "...",
            "category": "...",
            "description": "...",
            "benefits": [...],
            "suitable_for": [...],
            "cautions": [...],
            "avoid_with": [...]
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

        return {
            "ingredient": ingredient.strip(),
            "category": data["category"],
            "description": data["description"],
            "benefits": data["benefits"],
            "suitable_for": data["suitable_for"],
            "cautions": data["cautions"],
            "avoid_with": data["avoid_with"],
        }

    except Exception as e:
        return {
            "error": f"Ingredient analysis failed: {str(e)}"
        }


def get_supported_ingredients() -> list:
    """
    Return all currently supported ingredient categories.
    """

    return [
        data["category"]
        for data in INGREDIENT_DATA.values()
    ]


if __name__ == "__main__":
    import json

    print("=" * 60)
    print(" INGREDIENT ANALYZER TEST")
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
        result = analyze_ingredient(ingredient)

        print(f"\n--- {ingredient} ---")
        print(json.dumps(result, indent=2))

    print("\nSupported Ingredients:")
    print(get_supported_ingredients())

    print("\n" + "=" * 60)
    print(" INGREDIENT ANALYZER TEST COMPLETED")
    print("=" * 60)