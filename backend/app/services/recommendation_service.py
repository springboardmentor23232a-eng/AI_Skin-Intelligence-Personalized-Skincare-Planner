"""
Ingredient Intelligence + Product Recommendation Engine.

Rule-based suitability scoring baseline (0-100). This mirrors the
Ingredient Suitability Model / Product Recommendation Model boxes
in the architecture diagram -- swap in XGBoost/LightGBM ranking
models once you have user feedback / conversion data to train on.
"""
from typing import List


def score_product_suitability(
    product_targets: List[str],
    product_skin_types: List[str],
    product_ingredients: List[str],
    user_concerns: List[str],
    user_skin_type: str,
    user_allergies: List[str],
) -> float:
    score = 50.0

    # Reward concern overlap
    overlap = set(product_targets) & set(user_concerns)
    score += len(overlap) * 15

    # Reward skin type match
    if user_skin_type in product_skin_types or "all" in product_skin_types:
        score += 15

    # Penalize allergy conflicts heavily
    for ingredient in product_ingredients:
        if ingredient.lower() in [a.lower() for a in user_allergies]:
            score -= 60

    return max(0.0, min(100.0, round(score, 2)))


def check_ingredient_interactions(selected_ingredients: List[str], ingredient_lookup: dict) -> List[str]:
    """ingredient_lookup: {name: {"interacts_badly_with": [...]}}"""
    warnings = []
    for name in selected_ingredients:
        info = ingredient_lookup.get(name)
        if not info:
            continue
        for other in info.get("interacts_badly_with", []):
            if other in selected_ingredients:
                warnings.append(f"{name} may reduce effectiveness or irritate skin when combined with {other}.")
    return warnings


def detect_allergy_conflicts(product_ingredients: List[str], user_allergies: List[str]) -> List[str]:
    allergies_lower = {a.lower() for a in user_allergies}
    return [i for i in product_ingredients if i.lower() in allergies_lower]
