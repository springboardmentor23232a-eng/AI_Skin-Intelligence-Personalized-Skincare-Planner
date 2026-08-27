"""
Ingredient Interaction Engine
-----------------------------
Analyzes combinations of skincare ingredients and identifies
potentially conflicting combinations or cautionary pairings.
"""

from ingredient.ingredient_data import INGREDIENT_DATA
from ingredient.ingredient_analyzer import normalize_ingredient


def analyze_interactions(ingredients: list) -> dict:
    """
    Analyze a list of ingredients for known interactions.

    Supports both:

    ["Retinoids", "AHAs/BHAs"]

    and:

    ["Retinoids", "AHAs/BHAs, Salicylic Acid"]

    Returns:
        {
            "ingredients": [...],
            "interactions_found": [...],
            "warnings": [...],
            "safe_combinations": [...]
        }
    """

    try:
        if not isinstance(ingredients, (list, tuple, set)):
            return {
                "error": "Ingredients must be provided as a list."
            }

        # Expand comma-separated ingredients
        expanded_ingredients = []

        for ingredient in ingredients:
            if not isinstance(ingredient, str):
                continue

            split_ingredients = ingredient.split(",")

            for item in split_ingredients:
                cleaned_item = item.strip()

                if cleaned_item:
                    expanded_ingredients.append(cleaned_item)

        normalized_ingredients = []
        display_names = []

        for ingredient in expanded_ingredients:

            normalized = normalize_ingredient(ingredient)

            if not normalized:
                continue

            if normalized not in INGREDIENT_DATA:
                continue

            if normalized not in normalized_ingredients:
                normalized_ingredients.append(normalized)

                display_names.append(
                    INGREDIENT_DATA[normalized]["category"]
                )

        interactions_found = []
        warnings = []

        # Compare every unique pair
        for i in range(len(normalized_ingredients)):

            for j in range(i + 1, len(normalized_ingredients)):

                first_key = normalized_ingredients[i]
                second_key = normalized_ingredients[j]

                first_data = INGREDIENT_DATA[first_key]
                second_data = INGREDIENT_DATA[second_key]

                first_name = first_data["category"]
                second_name = second_data["category"]

                first_avoid = {
                    normalize_ingredient(item)
                    for item in first_data.get("avoid_with", [])
                }

                second_avoid = {
                    normalize_ingredient(item)
                    for item in second_data.get("avoid_with", [])
                }

                if (
                    second_key in first_avoid
                    or first_key in second_avoid
                ):

                    interaction = {
                        "ingredients": [
                            first_name,
                            second_name,
                        ],
                        "severity": "Caution",
                        "message": (
                            f"{first_name} and {second_name} "
                            "may increase irritation when used together."
                        ),
                    }

                    interactions_found.append(interaction)

                    warnings.append(
                        f"Use caution when combining "
                        f"{first_name} and {second_name}."
                    )

        # Determine safe combinations
        if not interactions_found:

            safe_combinations = display_names

        else:

            safe_combinations = [
                name
                for name in display_names
                if not any(
                    name in interaction["ingredients"]
                    for interaction in interactions_found
                )
            ]

        return {
            "ingredients": display_names,
            "interactions_found": interactions_found,
            "warnings": warnings,
            "safe_combinations": safe_combinations,
        }

    except Exception as e:

        return {
            "error": f"Interaction analysis failed: {str(e)}"
        }


if __name__ == "__main__":
    import json

    print("=" * 60)
    print(" INGREDIENT INTERACTION ENGINE TEST")
    print("=" * 60)

    test_cases = [

        [
            "Retinoids",
            "AHAs/BHAs",
        ],

        [
            "Retinoids",
            "Salicylic Acid",
        ],

        [
            "Niacinamide",
            "Hyaluronic Acid",
            "Ceramides",
        ],

        # New test for comma-separated input
        [
            "Retinoids",
            "AHAs/BHAs, Salicylic Acid",
        ],
    ]

    for index, ingredients in enumerate(test_cases, start=1):

        result = analyze_interactions(ingredients)

        print(f"\n--- Test Case {index} ---")
        print(json.dumps(result, indent=2))

    print("\n" + "=" * 60)
    print(" INTERACTION ENGINE TEST COMPLETED")
    print("=" * 60)