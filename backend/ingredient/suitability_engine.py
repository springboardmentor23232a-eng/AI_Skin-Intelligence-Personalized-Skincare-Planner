"""
Ingredient Suitability Engine
-----------------------------
Evaluates whether an ingredient is suitable for a user's
skin profile and identified concerns.
"""

from ingredient.ingredient_data import INGREDIENT_DATA
from ingredient.ingredient_analyzer import normalize_ingredient


def assess_suitability(
    ingredient: str,
    skin_type: str = "",
    concerns: list = None,
    sensitivity: str = "",
) -> dict:
    """
    Assess ingredient suitability based on skin type,
    skin concerns, and sensitivity.

    Returns:
        {
            "ingredient": "...",
            "suitability": "Suitable / Use With Caution / Not Recommended",
            "matched_concerns": [...],
            "reasons": [...],
            "cautions": [...]
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

        if concerns is None:
            concerns = []

        if not isinstance(concerns, (list, tuple, set)):
            return {
                "error": "Concerns must be provided as a list."
            }

        skin_type_clean = str(skin_type).strip().lower()
        sensitivity_clean = str(sensitivity).strip().lower()

        normalized_concerns = {
            str(concern).strip().lower()
            for concern in concerns
            if str(concern).strip()
        }

        suitable_for = {
            str(item).strip().lower()
            for item in data.get("suitable_for", [])
        }

        matched_concerns = sorted(
            concern
            for concern in normalized_concerns
            if concern in suitable_for
        )

        reasons = []

        if matched_concerns:
            reasons.append(
                "The ingredient matches one or more of the user's skin concerns."
            )

        # Skin-type matching
        if skin_type_clean and skin_type_clean in suitable_for:
            reasons.append(
                "The ingredient is listed as suitable for the user's skin type."
            )

        # Sensitivity caution
        has_caution = bool(data.get("cautions"))

        if sensitivity_clean == "high" and has_caution:
            suitability = "Use With Caution"
            reasons.append(
                "The user's sensitivity is high and this ingredient has known cautions."
            )

        elif matched_concerns or (
            skin_type_clean and skin_type_clean in suitable_for
        ):
            suitability = "Suitable"

        elif has_caution and sensitivity_clean in {"medium", "high"}:
            suitability = "Use With Caution"
            reasons.append(
                "The ingredient has cautions that may be relevant to sensitive skin."
            )

        else:
            suitability = "Generally Suitable"
            reasons.append(
                "No specific concern match or major caution was identified."
            )

        return {
            "ingredient": data["category"],
            "suitability": suitability,
            "matched_concerns": matched_concerns,
            "reasons": reasons,
            "cautions": data.get("cautions", []),
        }

    except Exception as e:
        return {
            "error": f"Suitability assessment failed: {str(e)}"
        }


if __name__ == "__main__":
    import json

    print("=" * 60)
    print(" INGREDIENT SUITABILITY ENGINE TEST")
    print("=" * 60)

    test_cases = [
        {
            "ingredient": "Niacinamide",
            "skin_type": "Oily Skin",
            "concerns": ["Acne Prone", "Excess Sebum"],
            "sensitivity": "Low",
        },
        {
            "ingredient": "Retinoids",
            "skin_type": "Oily Skin",
            "concerns": ["Acne Prone", "Wrinkles"],
            "sensitivity": "High",
        },
        {
            "ingredient": "Hyaluronic Acid",
            "skin_type": "Dry Skin",
            "concerns": ["Dehydration"],
            "sensitivity": "High",
        },
    ]

    for index, test in enumerate(test_cases, start=1):
        result = assess_suitability(**test)

        print(f"\n--- Test Case {index} ---")
        print(json.dumps(result, indent=2))

    print("\n" + "=" * 60)
    print(" SUITABILITY ENGINE TEST COMPLETED")
    print("=" * 60)