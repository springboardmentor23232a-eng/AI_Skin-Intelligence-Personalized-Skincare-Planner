from typing import Dict, Any, List, Optional
from app.models import RoutineProfile, Ingredient

def is_allergen_conflict(user_avoid: Optional[str], has_allergies: Optional[str], reaction_history: Optional[str], ingredient_name: str, ingredient_category: str) -> bool:
    ingredients_to_check = [ingredient_name.lower(), ingredient_category.lower()]
    
    # Standard synonyms and variations
    synonyms = {
        "vit c": "vitamin c",
        "l-ascorbic acid": "vitamin c",
        "ascorbic acid": "vitamin c",
        "retinol": "retinoids",
        "retin-a": "retinoids",
        "tretinoin": "retinoids",
        "salicylic": "salicylic acid",
        "bha": "salicylic acid",
        "aha": "ahas/bhas",
        "glycolic acid": "ahas/bhas",
        "lactic acid": "ahas/bhas",
        "hyaluronic": "hyaluronic acid",
        "ha": "hyaluronic acid"
    }

    def normalize(s: str) -> str:
        if not s:
            return ""
        # Remove hyphens and spaces, lowercase
        return "".join(s.lower().split()).replace("-", "").replace("/", "")

    # Check across user profile fields
    for text in [user_avoid, has_allergies, reaction_history]:
        if not text:
            continue
        # Split by comma or semicolon
        items = [i.strip().lower() for i in text.replace(";", ",").split(",")]
        for item in items:
            if not item or item in ["no", "yes", "none", "n/a"]:
                continue
            norm_item = normalize(item)
            for term in ingredients_to_check:
                norm_term = normalize(term)
                # Substring matching (e.g. user entered "salicylic", checks "Salicylic Acid")
                if norm_item in norm_term or norm_term in norm_item:
                    return True
                # Check synonym mappings
                if item in synonyms and synonyms[item] == term:
                    return True
                if term in synonyms and synonyms[term] == item:
                    return True
    return False

def evaluate_suitability(profile: RoutineProfile, ingredient: Ingredient) -> Dict[str, Any]:
    """
    Evaluates whether an ingredient is suitable for a user based on their RoutineProfile.
    Returns suitability: SUITABLE, USE_WITH_CAUTION, NOT_RECOMMENDED, AVOID
    along with warning comments and usage advice.
    """
    warnings = []
    
    # RULE 1 — ALLERGY / AVOIDANCE (Highest priority)
    allergy_trigger = is_allergen_conflict(
        profile.avoid_ingredients,
        profile.has_allergies,
        profile.has_allergic_reaction,
        ingredient.name,
        ingredient.category
    )
    if allergy_trigger:
        return {
            "ingredient": ingredient.name,
            "suitability": "AVOID",
            "reason": f"Potential conflict detected based on your profile. You have explicitly reported an allergy or designated '{ingredient.name}' to avoid.",
            "warnings": ["Known allergy/avoidance flag detected. Avoid using this ingredient and consult a qualified professional if needed."],
            "usage_guidance": "Do not include this ingredient in your routine."
        }

    # RULE 2 — HIGH SENSITIVITY / IRRITATION
    is_very_sensitive = profile.sensitivity.lower() == "very sensitive"
    has_severe_irritation = profile.skincare_irritation.lower() == "yes" or profile.has_allergic_reaction.lower() == "yes"

    if is_very_sensitive or has_severe_irritation:
        if ingredient.irritation_level.lower() == "high":
            return {
                "ingredient": ingredient.name,
                "suitability": "NOT_RECOMMENDED",
                "reason": "Your profile indicates very sensitive skin or frequent skincare irritation, and Retinoids carry a high irritation potential.",
                "warnings": [
                    "Retinoids can cause significant dryness, flakiness, or peeling on sensitive skin.",
                    "Consult a dermatologist/qualified healthcare professional for customized medical prescriptions for concerns like severe acne."
                ],
                "usage_guidance": "We recommend avoiding strong retinoids. Opt for gentle alternatives like peptides or low-strength barrier serums."
            }
        elif ingredient.irritation_level.lower() == "medium":
            warnings.append("Your skin is sensitive; acids or active Vitamin C may cause temporary stinging or redness.")
            return {
                "ingredient": ingredient.name,
                "suitability": "USE_WITH_CAUTION",
                "reason": "Your sensitive skin profile indicates a susceptibility to irritation, and this active acid/compound carries moderate irritation potential.",
                "warnings": warnings,
                "usage_guidance": f"Introduce slowly (once or twice a week in the evening) and patch test before full application. Avoid layering with other strong actives."
            }

    # RULE 3 — SKIN TYPE
    # Suitable skin types is stored as a list in database JSON
    suitable_types = [t.lower() for t in (ingredient.suitable_skin_types or [])]
    user_type = profile.skin_type.lower()
    
    skin_type_compatible = user_type in suitable_types
    if not skin_type_compatible:
        if ingredient.irritation_level.lower() in ["high", "medium"]:
            return {
                "ingredient": ingredient.name,
                "suitability": "NOT_RECOMMENDED",
                "reason": f"Not recommended. This active is formulated for {', '.join(ingredient.suitable_skin_types)} skin types, and may not align well with your dry/sensitive {profile.skin_type} skin.",
                "warnings": [f"This active might disrupt or dry out your {profile.skin_type} skin barrier."],
                "usage_guidance": "Consider swapping for milder barrier repair agents like Ceramides or hydrating factors like Hyaluronic Acid."
            }

    # RULE 6 — CURRENT ACTIVE INGREDIENTS OVERLAP
    # Check if the user is already using this active ingredient category
    current_actives = [a.lower() for a in (profile.active_ingredients or [])]
    for act in current_actives:
        if ingredient.name.lower() in act or act in ingredient.name.lower() or ingredient.category.lower() in act:
            return {
                "ingredient": ingredient.name,
                "suitability": "USE_WITH_CAUTION",
                "reason": f"You reported that you are already using '{ingredient.name}' or related actives in your profile. Layering multiple products with duplicate actives increases irritation risks.",
                "warnings": ["Potential active ingredient overlap detected. Avoid using multiple products containing duplicate active forms."],
                "usage_guidance": "Ensure you are not duplicating steps. Utilize only one active formulation in the same routine step."
            }

    # RULE 5 — PRIMARY GOAL ALIGNMENT (Highest positive score)
    goal = profile.skincare_goal.lower()
    goal_aligned = False
    
    # Map common goals to ingredients
    goal_mapping = {
        "acne": ["salicylic acid", "retinoids", "niacinamide", "ahas/bhas"],
        "hydrate": ["hyaluronic acid", "ceramides"],
        "spot": ["vitamin c", "niacinamide", "ahas/bhas"],
        "aging": ["retinoids", "peptides"],
        "redness": ["ceramides", "niacinamide", "hyaluronic acid"],
        "barrier": ["ceramides", "hyaluronic acid", "peptides"],
    }
    
    for key, ingredients_list in goal_mapping.items():
        if key in goal:
            if ingredient.name.lower() in ingredients_list or ingredient.category.lower() in ingredients_list:
                goal_aligned = True
                break

    if goal_aligned:
        return {
            "ingredient": ingredient.name,
            "suitability": "SUITABLE",
            "reason": f"Highly suitable. This active directly aligns with your primary skincare goal of '{profile.skincare_goal}' and matches your {profile.skin_type} skin type.",
            "warnings": [],
            "usage_guidance": ingredient.usage_guidance
        }

    # RULE 4 — SKIN CONCERNS MATCHING
    user_concerns = [c.lower() for c in (profile.concerns or [])]
    concern_match = False
    for concern in user_concerns:
        for common_c in [cc.lower() for cc in (ingredient.common_concerns or [])]:
            if common_c in concern or concern in common_c:
                concern_match = True
                break
        if concern_match:
            break

    if concern_match:
        return {
            "ingredient": ingredient.name,
            "suitability": "SUITABLE",
            "reason": f"Suitable. Mapped to address concerns such as {', '.join(ingredient.common_concerns)} for {profile.skin_type} skin type.",
            "warnings": [],
            "usage_guidance": ingredient.usage_guidance
        }

    # Default Case
    return {
        "ingredient": ingredient.name,
        "suitability": "SUITABLE",
        "reason": "Suitable. Compatible with your skin type and no allergen or sensitivity conflicts were detected.",
        "warnings": [],
        "usage_guidance": ingredient.usage_guidance
    }
