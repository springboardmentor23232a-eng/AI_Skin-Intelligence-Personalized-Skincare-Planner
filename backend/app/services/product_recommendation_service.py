from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models import RoutineProfile, Product, Ingredient
from app.services.ingredient_service import is_allergen_conflict, evaluate_suitability

def evaluate_product_suitability(db: Session, profile: RoutineProfile, product: Product) -> Dict[str, Any]:
    """
    Evaluates product suitability for a user.
    Calculates suitability score (0-100), checks allergy exclusions, and maps Q27 budget.
    Reuses Module 5 services (is_allergen_conflict, evaluate_suitability) for active safety compliance.
    """
    warnings = []
    reasons = []
    is_allergy_excluded = False

    # 1. SAFETY PRIORITY — Check all ingredients for Q22/Q23 allergy or avoidance triggers
    for ing in (product.ingredients or []):
        if is_allergen_conflict(
            profile.avoid_ingredients,
            profile.has_allergies,
            profile.has_allergic_reaction,
            ing,
            ing
        ):
            is_allergy_excluded = True
            break

    if is_allergy_excluded:
        return {
            "product_id": product.id,
            "product_name": product.name,
            "suitability_score": 0,
            "match_reason": f"EXCLUDED: Product contains '{ing}' which conflicts with your reported allergy or avoided ingredients list.",
            "is_allergy_excluded": True,
            "warnings": [f"Contains allergen or avoided ingredient: {ing}."],
            "usage_guidance": "Do not purchase or apply this product."
        }

    # 2. Key active ingredient evaluation using Module 5's evaluate_suitability
    # Retrieve all database seeded ingredients to cross-reference
    db_ingredients = db.query(Ingredient).all()
    active_penalties = 0
    active_warnings = []
    
    for ing_name in (product.ingredients or []):
        for db_ing in db_ingredients:
            # Check if product ingredient contains or matches db ingredient name/category
            if db_ing.name.lower() in ing_name.lower() or ing_name.lower() in db_ing.name.lower():
                suitability_res = evaluate_suitability(profile, db_ing)
                if suitability_res["suitability"] == "AVOID":
                    is_allergy_excluded = True
                    return {
                        "product_id": product.id,
                        "product_name": product.name,
                        "suitability_score": 0,
                        "match_reason": f"EXCLUDED: Contains active '{db_ing.name}' which is flagged as AVOID in your profile.",
                        "is_allergy_excluded": True,
                        "warnings": [f"Allergy conflict with active: {db_ing.name}."],
                        "usage_guidance": "Do not use."
                    }
                elif suitability_res["suitability"] == "NOT_RECOMMENDED":
                    active_penalties += 30
                    active_warnings.append(f"Contains {db_ing.name} which is not recommended for your skin profile. Reason: {suitability_res['reason']}")
                elif suitability_res["suitability"] == "USE_WITH_CAUTION":
                    active_penalties += 15
                    active_warnings.append(f"Use {db_ing.name} with caution. Reason: {suitability_res['reason']}")

    # 3. Base Score Calculation
    score = 50

    # Skin Type Matching (Q2)
    suitable_types = [t.lower() for t in (product.suitable_skin_types or [])]
    user_skin_type = profile.skin_type.lower()
    
    if user_skin_type in suitable_types:
        score += 20
        reasons.append(f"Highly compatible with your {profile.skin_type} skin.")
    else:
        # Penalize incompatible base categories
        if product.category in ["Face Wash", "Moisturizer"]:
            score -= 15
            reasons.append(f"Formulated primarily for {', '.join(product.suitable_skin_types)} skin, rather than your {profile.skin_type} skin.")

    # Skin Concerns Matching (Q4-Q8)
    user_concerns = [c.lower() for c in (profile.concerns or [])]
    concern_matches = 0
    matched_concern_names = []
    
    for concern in user_concerns:
        for p_concern in (product.suitable_concerns or []):
            if p_concern.lower() in concern or concern in p_concern.lower():
                concern_matches += 1
                matched_concern_names.append(p_concern)
                break
                
    if concern_matches > 0:
        match_points = min(concern_matches * 5, 15)
        score += match_points
        reasons.append(f"Targets concerns: {', '.join(matched_concern_names[:3])}.")

    # Primary Goal Matching (Q28)
    user_goal = profile.skincare_goal.lower()
    goal_aligned = False
    for p_concern in (product.suitable_concerns or []):
        if p_concern.lower() in user_goal or user_goal in p_concern.lower():
            goal_aligned = True
            break
            
    if goal_aligned:
        score += 10
        reasons.append(f"Directly supports your goal to '{profile.skincare_goal}'.")

    # Budget Matching (Q27)
    # Map 'Budget', 'Moderate', 'Premium' to INR tiers
    user_budget = profile.budget.lower()
    price = product.price
    
    price_tier = "budget"
    if price >= 1000:
        price_tier = "premium"
    elif price >= 500:
        price_tier = "moderate"
        
    if user_budget == price_tier:
        score += 15
        reasons.append(f"Matches your specified {profile.budget} budget tier (₹{price}).")
    else:
        score -= 10
        reasons.append(f"Priced at ₹{price}, which is outside your default {profile.budget} budget preference.")

    # Irritation / Sensitivity adjustments (Q3)
    if profile.sensitivity.lower() == "very sensitive" and product.irritation_level.lower() == "high":
        score -= 30
        reasons.append("Irritating active ingredients are not recommended for very sensitive skin.")
    elif profile.sensitivity.lower() == "very sensitive" and product.irritation_level.lower() == "medium":
        score -= 15
        reasons.append("Use with caution due to moderate irritation potential on sensitive skin.")

    # Current actives overlap (Q10/Q13)
    current_actives = [a.lower() for a in (profile.active_ingredients or [])]
    overlap_detected = False
    for ing in (product.ingredients or []):
        for act in current_actives:
            if act in ing.lower() or ing.lower() in act:
                overlap_detected = True
                break
        if overlap_detected:
            break
            
    if overlap_detected:
        score -= 10
        reasons.append(f"Warning: Contains ingredients overlapping with your current actives to avoid duplication.")

    # Apply penalties from Module 5 active checks
    score -= active_penalties
    warnings.extend(active_warnings)

    # Ensure score is bounded between 0 and 100
    score = max(0, min(score, 100))

    # Construct overall rationale explanation
    if not reasons:
        reasons.append("General skin compatibility.")
    
    match_reason = " | ".join(reasons)
    
    return {
        "product_id": product.id,
        "product_name": product.name,
        "suitability_score": score,
        "match_reason": match_reason,
        "is_allergy_excluded": False,
        "warnings": warnings,
        "usage_guidance": product.usage_guidance
    }
