"""
Ingredient Intelligence + Product Recommendation Engine.

Rule-based suitability scoring baseline (0-100).
"""

from typing import List


def score_product_suitability(
    product_targets: List[str],
    product_skin_types: List[str],
    product_ingredients: List[str],
    user_concerns: List[str],
    user_skin_type: str,
    user_allergies: List[str],
    concern_severity: dict | None = None,
    user_sensitivities: List[str] | None = None,
    product_age_groups: List[str] | None = None,
    user_age_group: str | None = None,
) -> float:
    score = 40.0

    concern_severity = concern_severity or {}
    user_sensitivities = user_sensitivities or []
    product_age_groups = product_age_groups or []

    product_targets_lower = {
        str(x).strip().lower()
        for x in product_targets
    }

    user_concerns_lower = {
        str(x).strip().lower()
        for x in user_concerns
    }

    product_skin_types_lower = {
        str(x).strip().lower()
        for x in product_skin_types
    }

    product_ingredients_lower = {
        str(x).strip().lower()
        for x in product_ingredients
    }

    user_allergies_lower = {
        str(x).strip().lower()
        for x in user_allergies
    }

    user_sensitivities_lower = {
        str(x).strip().lower()
        for x in user_sensitivities
    }
    user_age_group_lower = (
        str(user_age_group).strip().lower()
        if user_age_group
        else ""
)

    product_age_groups_lower = {
        str(x).strip().lower()
        for x in product_age_groups
}

    # 1. Concern matching + severity
    matched_concerns = (
        product_targets_lower & user_concerns_lower
    )

    for concern in matched_concerns:
        severity = concern_severity.get(concern, "mild")

        if severity == "severe":
            score += 25
        elif severity == "moderate":
            score += 18
        else:
            score += 10

    # 2. Skin type matching
        if user_skin_type.lower() in product_skin_types_lower:
           score += 15
        elif "all" in product_skin_types_lower:
           score += 10

    # 3. Age-group matching
        if user_age_group:
          user_age_group_lower = user_age_group.strip().lower()

        product_age_groups_lower = {
        str(x).strip().lower()
        for x in product_age_groups
    }

    if user_age_group_lower in product_age_groups_lower:
        score += 10

    # 4. Sensitivity penalty
    sensitivity_conflicts = (
        product_ingredients_lower
        & user_sensitivities_lower
    )

    if sensitivity_conflicts:
        score -= 25

    # 5. Allergy protection
    allergy_conflicts = (
        product_ingredients_lower
        & user_allergies_lower
    )

    if allergy_conflicts:
        score -= 60

    return max(
        0.0,
        min(100.0, round(score, 2))
    )


def check_ingredient_interactions(
    selected_ingredients: List[str],
    ingredient_lookup: dict,
) -> List[str]:
    """
    Check whether selected ingredients have known interactions.

    Matching is case-insensitive so:
    Niacinamide
    niacinamide
    NIACINAMIDE

    are treated as the same ingredient.
    """

    warnings = []

    # Normalize selected ingredients
    selected_normalized = {
        str(name).strip().lower()
        for name in selected_ingredients
        if name
    }

    # Create normalized lookup
    normalized_lookup = {
        str(name).strip().lower(): info
        for name, info in ingredient_lookup.items()
    }

    for name in selected_ingredients:

        normalized_name = str(name).strip().lower()

        info = normalized_lookup.get(normalized_name)

        if not info:
            continue

        interactions = info.get(
            "interacts_badly_with",
            []
        ) or []

        for other in interactions:

            other_normalized = (
                str(other).strip().lower()
            )

            if other_normalized in selected_normalized:

                warning = (
                    f"{name} may reduce effectiveness "
                    f"or increase irritation when combined "
                    f"with {other}."
                )

                if warning not in warnings:
                    warnings.append(warning)

    return warnings


def detect_allergy_conflicts(
    product_ingredients: List[str],
    user_allergies: List[str],
) -> List[str]:
    """
    Detect product ingredients that match
    the patient's recorded allergies.

    Matching is case-insensitive.
    """

    allergies_lower = {
        str(allergy).strip().lower()
        for allergy in user_allergies
        if allergy
    }

    conflicts = []

    for ingredient in product_ingredients:

        ingredient_name = str(
            ingredient
        ).strip()

        if not ingredient_name:
            continue

        if ingredient_name.lower() in allergies_lower:
            conflicts.append(ingredient_name)

    return conflicts