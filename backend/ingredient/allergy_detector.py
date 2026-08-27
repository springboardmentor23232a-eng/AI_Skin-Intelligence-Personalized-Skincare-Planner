"""
Ingredient Allergy Detection
----------------------------
Checks whether an ingredient or its known category is potentially
in conflict with the user's recorded allergies.
"""

from ingredient.ingredient_data import INGREDIENT_DATA
from ingredient.ingredient_analyzer import normalize_ingredient


def detect_allergy_conflicts(
    ingredient: str,
    allergies: list = None,
) -> dict:
    """
    Check an ingredient against a user's recorded allergies.

    Returns:
        {
            "ingredient": "...",
            "allergies_checked": [...],
            "allergy_conflict": True/False,
            "matched_allergies": [...],
            "message": "..."
        }
    """

    try:
        if allergies is None:
            allergies = []

        if not isinstance(allergies, (list, tuple, set)):
            return {
                "error": "Allergies must be provided as a list."
            }

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

        ingredient_name = data["category"]

        cleaned_allergies = []

        for allergy in allergies:
            if not isinstance(allergy, str):
                continue

            allergy_clean = allergy.strip().lower()

            if not allergy_clean:
                continue

            if allergy_clean in {"none", "no known allergies", "no allergies"}:
                continue

            cleaned_allergies.append(allergy_clean)

        matched_allergies = []

        ingredient_terms = {
            normalized.lower(),
            ingredient_name.lower(),
        }

        for allergy in cleaned_allergies:

            # Direct ingredient/category match
            if allergy in ingredient_terms:
                matched_allergies.append(allergy)
                continue

            # Partial matching
            if (
                allergy in normalized.lower()
                or normalized.lower() in allergy
                or allergy in ingredient_name.lower()
                or ingredient_name.lower() in allergy
            ):
                matched_allergies.append(allergy)

        matched_allergies = list(dict.fromkeys(matched_allergies))

        conflict = len(matched_allergies) > 0

        if conflict:
            message = (
                "Potential allergy conflict detected. "
                "Avoid using this ingredient until the allergy is reviewed "
                "by a qualified healthcare professional."
            )
        else:
            message = (
                "No direct allergy conflict was identified from the "
                "allergies provided."
            )

        return {
            "ingredient": ingredient_name,
            "allergies_checked": allergies,
            "allergy_conflict": conflict,
            "matched_allergies": matched_allergies,
            "message": message,
        }

    except Exception as e:
        return {
            "error": f"Allergy detection failed: {str(e)}"
        }


if __name__ == "__main__":
    import json

    print("=" * 60)
    print(" INGREDIENT ALLERGY DETECTION TEST")
    print("=" * 60)

    test_cases = [
        {
            "ingredient": "Niacinamide",
            "allergies": ["Niacinamide"],
        },
        {
            "ingredient": "Vitamin C",
            "allergies": ["Fragrance", "Niacinamide"],
        },
        {
            "ingredient": "Hyaluronic Acid",
            "allergies": ["None"],
        },
    ]

    for index, test in enumerate(test_cases, start=1):

        result = detect_allergy_conflicts(**test)

        print(f"\n--- Test Case {index} ---")
        print(json.dumps(result, indent=2))

    print("\n" + "=" * 60)
    print(" ALLERGY DETECTION TEST COMPLETED")
    print("=" * 60)