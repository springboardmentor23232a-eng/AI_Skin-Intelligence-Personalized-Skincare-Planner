from typing import List, Dict, Any, Tuple
from app.models import RoutineProfile, Ingredient

# Centralized interaction rules based on ingredient categories
# Keys are sorted tuples of categories to ensure order independence
INTERACTION_RULES: Dict[Tuple[str, str], Dict[str, str]] = {
    ("Retinoids", "Salicylic Acid"): {
        "compatibility": "AVOID_SAME_ROUTINE",
        "explanation": "Retinoids and Salicylic Acid both promote cell turnover and chemical exfoliation. Layering them together increases skin sensitivity, causing dryness, peeling, and skin barrier compromise.",
        "recommended_usage": "Do not layer in the same step. Use Salicylic Acid in the morning (always follow with SPF) and Retinoids in the evening on separate days."
    },
    ("AHAs/BHAs", "Retinoids"): {
        "compatibility": "AVOID_SAME_ROUTINE",
        "explanation": "Retinoids work best at a neutral pH, while AHAs/BHAs require an acidic pH. Layering them concurrently reduces their efficacy and significantly increases irritation potential.",
        "recommended_usage": "Do not combine. Alternate evenings, or apply AHAs/BHAs 1-2 times a week on nights when you do not apply Retinoids."
    },
    ("AHAs/BHAs", "Salicylic Acid"): {
        "compatibility": "USE_WITH_CAUTION",
        "explanation": "Both are active chemical exfoliants. BHAs clean deep inside pore linings, while AHAs dissolve surface cellular bonds. Overlapping them too frequently can cause redness and barrier peeling.",
        "recommended_usage": "Use with caution. Alternate days of use, or choose a single balanced hybrid formulation containing low concentrations of both."
    },
    ("Salicylic Acid", "Vitamin C"): {
        "compatibility": "USE_WITH_CAUTION",
        "explanation": "Combining highly acidic Vitamin C (L-Ascorbic Acid) immediately with Salicylic Acid can trigger temporary facial stinging or redness.",
        "recommended_usage": "Apply Vitamin C in the morning under sunscreen and Salicylic Acid in the evening, or alternate days."
    },
    ("AHAs/BHAs", "Vitamin C"): {
        "compatibility": "USE_WITH_CAUTION",
        "explanation": "Both are active acidic treatments. Layering them concurrently may cause skin irritation, stinging, and redness.",
        "recommended_usage": "Apply Vitamin C in the morning and AHAs/BHAs in the evening, or use on alternate nights."
    },
    ("Retinoids", "Vitamin C"): {
        "compatibility": "AVOID_SAME_ROUTINE",
        "explanation": "Retinoids work best at a neutral pH, whereas Vitamin C requires an acidic pH. Layering them together reduces efficacy and increases irritation.",
        "recommended_usage": "Apply Vitamin C in the morning and Retinoids in the evening."
    },
    ("Niacinamide", "Vitamin C"): {
        "compatibility": "COMPATIBLE",
        "explanation": "Niacinamide and Vitamin C form a powerful synergy to fade dark spots and boost radiance. In highly sensitive skin, layering pure ascorbic acid with niacinamide may cause temporary flushing.",
        "recommended_usage": "Compatible to layer. Wait 5-10 minutes between steps, or split them: Vitamin C in the morning (AM) and Niacinamide in the evening (PM)."
    }
}

def analyze_interactions(profile: RoutineProfile, ingredients: List[Ingredient]) -> Dict[str, Any]:
    """
    Analyzes pairwise combinations of a list of ingredients.
    Considers the user's skin sensitivity and irritation history to adjust warnings.
    """
    if len(ingredients) < 2:
        return {
            "compatibility": "COMPATIBLE",
            "explanation": "Single ingredients do not trigger chemical interactions.",
            "recommended_usage": "Follow the individual usage guidelines."
        }

    overall_compatibility = "COMPATIBLE"
    explanations = []
    usages = []
    
    is_sensitive = profile.sensitivity.lower() in ["very sensitive", "slightly sensitive"]
    has_irritation_history = profile.skincare_irritation.lower() == "yes" or profile.has_allergic_reaction.lower() == "yes"

    # Evaluate pairwise interactions
    for i in range(len(ingredients)):
        for j in range(i + 1, len(ingredients)):
            ing1 = ingredients[i]
            ing2 = ingredients[j]
            
            # Sort keys to match the dictionary structure
            key = tuple(sorted([ing1.category, ing2.category]))
            
            rule = INTERACTION_RULES.get(key)
            if rule:
                comp = rule["compatibility"]
                expl = rule["explanation"]
                rec = rule["recommended_usage"]
                
                # SENSITIVITY UPGRADE RULE:
                # If user has sensitive skin and a caution/interactions warning exists, escalate/add sensitivity warning
                if is_sensitive or has_irritation_history:
                    if comp == "USE_WITH_CAUTION":
                        comp = "AVOID_SAME_ROUTINE"
                        expl = f"[Sensitive Skin Warning] {expl} Because your skin is sensitive, this combination is upgraded to AVOID SAME ROUTINE."
                        rec = f"{rec} Ensure you alternate days of application."
                
                # Check priority levels
                if comp == "AVOID_SAME_ROUTINE":
                    overall_compatibility = "AVOID_SAME_ROUTINE"
                elif comp == "USE_WITH_CAUTION" and overall_compatibility != "AVOID_SAME_ROUTINE":
                    overall_compatibility = "USE_WITH_CAUTION"
                
                explanations.append(f"{ing1.name} + {ing2.name}: {expl}")
                usages.append(f"{ing1.name} + {ing2.name}: {rec}")
            else:
                # Standard compatible pairing
                # Verify that neither is on the allergy avoid list
                pass

    if not explanations:
        # All selected pairs are default compatible (e.g. Hyaluronic Acid + Ceramides + Peptides)
        return {
            "compatibility": "COMPATIBLE",
            "explanation": "All selected ingredients are highly compatible and safe to use in the same skincare routine.",
            "recommended_usage": "Safe to layer together. Apply active treatments first, then follow with hydrating humectants and barrier-repairing lipid creams."
        }

    # Format the merged string responses
    merged_explanation = " | ".join(explanations)
    merged_usage = " | ".join(list(set(usages))) # Unique recommendations

    return {
        "compatibility": overall_compatibility,
        "explanation": merged_explanation,
        "recommended_usage": merged_usage
    }
