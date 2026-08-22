import re
from typing import List, Dict, Any
from app.models import RoutineProfile

def generate_personalized_routine_items(profile: RoutineProfile) -> List[Dict[str, Any]]:
    """
    Core rule-based engine mapping a user's 28-question profile to AM, PM,
    Weekly, and Seasonal skincare routine steps. Handles safety exclusions,
    sensitivity overrides, skin type basics, and time/complexity preferences.
    """
    
    # 1. Parse safety exclusions & allergens (Q22 & Q23)
    avoid_set = set()
    if profile.has_allergies == "Yes" and profile.avoid_ingredients:
        # Split by comma, semicolon, or slash and normalize to lowercase
        ingredients = re.split(r'[,;/]+', profile.avoid_ingredients)
        avoid_set = {ing.strip().lower() for ing in ingredients if ing.strip()}
        
    def is_excluded(ingredient_name: str) -> bool:
        """Helper checking if ingredient_name matches any term in the avoid set."""
        name_lower = ingredient_name.lower()
        for avoid in avoid_set:
            if avoid in name_lower:
                return True
        return False

    # Track if user has severe warnings
    has_severe_warning = (
        profile.acne_severity in ["Severe", "Very severe"] or 
        profile.has_allergic_reaction == "Yes" or
        profile.sensitivity == "Very sensitive"
    )

    # 2. Sensitivity mapping
    is_sensitive = profile.sensitivity in ["Moderately sensitive", "Very sensitive"]
    is_very_sensitive = profile.sensitivity == "Very sensitive"

    # Define potential active treatments with safety fallbacks
    # Form: (Ingredient Name, Description, Frequency, Key Terms for Avoid Check)
    
    # Acne Treatment Active selection
    acne_active = ("Salicylic Acid 2% Acne Gel", "Targets clogged pores, dissolves excess sebum, and reduces active breakouts.", "Daily in PM", "salicylic")
    if is_sensitive:
        acne_active = ("Niacinamide 10% + Zinc 1% Serum", "Soothing anti-inflammatory active that balances sebum and calms skin.", "Daily in PM", "niacinamide")
    if is_excluded(acne_active[0]):
        acne_active = ("Centella Asiatica (Cica) Cream", "Deeply soothing plant extract to calm inflammation and support repair.", "Daily in PM", "centella")

    # Anti-aging Active selection
    aging_active = ("Retinol 0.2% Night Serum", "Stimulates cell turnover and collagen production to reduce fine lines.", "Alternate nights in PM", "retinol")
    if is_sensitive:
        aging_active = ("Bakuchiol 1% Soothing Oil", "Plant-based gentle retinol alternative that improves lines without irritation.", "Daily in PM", "bakuchiol")
    if is_excluded(aging_active[0]):
        aging_active = ("Peptide Smoothing Serum", "A peptide complex that supports firmness and hydration without redness.", "Daily in PM", "peptide")

    # Dark spots / Brightening active selection
    brightening_active = ("Vitamin C 10% Serum", "Potent antioxidant that brightens dark spots and blocks daily environmental damage.", "Daily in AM", "vitamin c")
    if is_sensitive:
        brightening_active = ("Niacinamide 5% Gentle Serum", "Calms redness and steadily fades post-inflammatory hyperpigmentation.", "Daily in AM", "niacinamide")
    if is_excluded(brightening_active[0]):
        brightening_active = ("Alpha Arbutin 2% Serum", "Safe skin-brightening extract that reduces dark spots and evens skin tone.", "Daily in AM", "arbutin")

    # Dehydration active selection
    hydration_active = ("Hyaluronic Acid 2% Hydrator", "Attracts water molecules into the skin layers to plump and prevent tightness.", "Daily in AM/PM", "hyaluronic")
    if is_excluded(hydration_active[0]):
        hydration_active = ("Glycerin & Panthenol Hydrating Essence", "Gentle humectant mix that replenishes surface moisture and softens skin.", "Daily in AM/PM", "glycerin")

    # 3. Base Skin Type Cleansers & Moisturizers
    # Cleanser
    cleanser = "Gentle Hydrating Milk Cleanser"
    cleanser_desc = "Mild soap-free cleanser that removes debris while protecting the skin's lipid barrier."
    if profile.skin_type == "Oily":
        cleanser = "Salicylic Acid Cleansing Gel" if not is_excluded("salicylic") else "Foaming Amino Acid Cleanser"
        cleanser_desc = "Purifying wash that breaks down sebum buildup and clears pore-clogging debris."
    elif profile.skin_type == "Combination":
        cleanser = "Gentle Foaming Cleanser"
        cleanser_desc = "Balanced wash that cleanses the oily T-zone without over-drying the dry cheeks."
    
    if is_very_sensitive:
        cleanser = "Ultra-Gentle Soothing Cleanser"
        cleanser_desc = "Fragrance-free, hypoallergenic lotion cleanser designed for compromised skin barrier support."
    
    if is_excluded(cleanser):
        cleanser = "Basic Soap-Free Facial Wash"

    # Moisturizer
    moisturizer = "Daily Hydrating Lotion"
    moisturizer_desc = "Lightweight humectant-rich moisturizer that absorbs quickly without feeling greasy."
    if profile.skin_type == "Dry":
        moisturizer = "Ceramide Peptide Rich Barrier Cream" if not is_excluded("ceramide") else "Intensive Hydration Cream"
        moisturizer_desc = "Rich emollient cream that seals in moisture and repairs dry flakiness."
    elif profile.skin_type == "Oily":
        moisturizer = "Oil-Free Hyaluronic Acid Gel-Cream"
        moisturizer_desc = "Fast-absorbing, non-comedogenic gel that hydrates without adding shine or weight."
    
    if is_very_sensitive:
        moisturizer = "Cica & Panthenol Calming Cream"
        moisturizer_desc = "Soothes visible redness, provides a moisture cushion, and locks out irritation."
        
    if is_excluded(moisturizer):
        moisturizer = "Basic Soothing Skin Emulsion"

    # Sunscreen (AM)
    sunscreen = "Broad-Spectrum SPF 50+ Sunscreen"
    sunscreen_desc = "Protects against UVA & UVB rays. Apply generously as the last step in the morning."
    if profile.skin_type == "Oily":
        sunscreen = "Matte Finish Oil-Control SPF 50"
        sunscreen_desc = "Protects against UV rays while absorbing shine with a lightweight powdery finish."
    elif is_sensitive:
        sunscreen = "Mineral Zinc Oxide SPF 50" if not is_excluded("zinc") else "Hypoallergenic Calming SPF 50"
        sunscreen_desc = "Physical sunscreen with zinc oxide that provides gentle sun block without stinging."
        
    if is_excluded(sunscreen):
        sunscreen = "Standard Fluid Sunscreen SPF 50"

    # Night Care (PM)
    night_cream = "Barrier-Repair Sleeping Mask"
    night_cream_desc = "Locks in overnight moisture and active ingredients to promote healthy skin recovery."
    if profile.skin_type == "Oily":
        night_cream = "Lightweight Night Recovery Fluid"
        night_cream_desc = "Nourishes the skin overnight without clogging pores or triggering breakouts."
    elif profile.skin_type == "Dry":
        night_cream = "Squalane Nourishing Facial Oil" if not is_excluded("squalane") else "Rich Overnight Recovery Balm"
        night_cream_desc = "Adds an extra lipid lock to prevent moisture loss from dry indoor heating."
        
    if is_excluded(night_cream):
        night_cream = "Basic Night Hydration Lotion"

    # 4. Filter Actives based on Skincare Goal & Concerns
    actives_to_add = []
    
    # Priority based on Skincare Goal
    goal = profile.skincare_goal
    if goal == "Clear acne":
        actives_to_add.append(acne_active)
    elif goal == "Reduce oiliness":
        if not is_sensitive and not is_excluded("salicylic"):
            actives_to_add.append(("Salicylic Acid 1.5% Pore Treatment", "Cleans pores and dissolves excessive oils.", "Daily in PM", "salicylic"))
        else:
            actives_to_add.append(("Niacinamide 10% Sebum Control Serum", "Regulates sebum production and refines skin appearance.", "Daily in AM/PM", "niacinamide"))
    elif goal == "Improve hydration":
        actives_to_add.append(hydration_active)
    elif goal == "Reduce dark spots":
        actives_to_add.append(brightening_active)
    elif goal == "Reduce signs of aging":
        actives_to_add.append(aging_active)
    elif goal == "Reduce redness/sensitivity":
        actives_to_add.append(("Centella Asiatica (Cica) Soothing Gel", "Soothes redness, repairs skin barrier, and dampens irritation.", "Daily in PM", "centella"))

    # Also add other concerns (from Q4 multi-select list) if not already added
    for concern in profile.concerns:
        if len(actives_to_add) >= 3: 
            break # Cap active treatments to avoid overloading skin
            
        if concern == "Acne" and acne_active not in actives_to_add:
            actives_to_add.append(acne_active)
        elif concern in ["Dark spots", "Post-acne marks", "Uneven skin tone"] and brightening_active not in actives_to_add:
            actives_to_add.append(brightening_active)
        elif concern == "Dehydration" and hydration_active not in actives_to_add:
            actives_to_add.append(hydration_active)
        elif concern in ["Fine lines/wrinkles"] and aging_active not in actives_to_add:
            actives_to_add.append(aging_active)
        elif concern in ["Excess oil", "Blackheads", "Whiteheads", "Open pores"] and not is_sensitive:
            pore_treatment = ("Salicylic Acid (BHA) 2% Pore Gel", "Targeted oil-soluble acid that sweeps away blackheads and shrinks open pores.", "PM alternate nights", "salicylic")
            if not is_excluded(pore_treatment[0]) and pore_treatment not in actives_to_add:
                actives_to_add.append(pore_treatment)
        elif concern == "Redness" and not is_excluded("cica"):
            cica_treatment = ("Centella Asiatica (Cica) 10% Extract", "Calming botanical serum designed to reduce visible redness and skin tightness.", "Daily in AM/PM", "centella")
            if cica_treatment not in actives_to_add:
                actives_to_add.append(cica_treatment)

    # 5. Filter out excluded ingredients (Safety Exclusions check)
    sanitized_actives = []
    for active in actives_to_add:
        if not is_excluded(active[0]) and not is_excluded(active[3]):
            sanitized_actives.append(active)

    # 6. Apply Time & Routine Preference complexity limits
    # Minimal: 3 steps max. Moderate: 4 steps. Detailed: 5+ steps.
    max_steps_am = 4
    max_steps_pm = 4
    pref = profile.routine_preference
    time_limit = profile.skincare_time
    
    if pref == "Minimal" or time_limit == "<5 minutes":
        max_steps_am = 3
        max_steps_pm = 3
    elif pref == "Detailed" or time_limit == "20+ minutes":
        max_steps_am = 5
        max_steps_pm = 5

    # 7. Construct AM Routine
    am_items = []
    # Step 1: Cleansing
    am_items.append({
        "category": "CLEANSING",
        "name": cleanser,
        "description": cleanser_desc,
        "frequency": "Every morning",
        "notes": "Wash with lukewarm water and pat dry with a clean towel."
    })
    
    # Step 2: Treatment (add AM actives)
    am_actives = [a for a in sanitized_actives if "am" in a[2].lower() or "am/pm" in a[2].lower()]
    for active in am_actives:
        if len(am_items) < max_steps_am - 2: # Keep room for moisturizer and sunscreen
            am_items.append({
                "category": "TREATMENT",
                "name": active[0],
                "description": active[1],
                "frequency": active[2],
                "notes": "Apply to clean skin and let it absorb for 1 minute."
            })
            
    # Add hydration fallback if dry and room remains
    if profile.dryness in ["Moderately dry", "Very dry"] and len(am_items) < max_steps_am - 2:
        if not is_excluded("hyaluronic"):
            am_items.append({
                "category": "TREATMENT",
                "name": "Hyaluronic Acid Hydrating Serum",
                "description": "Replenishes skin surface water molecules to plump and relieve dryness.",
                "frequency": "Daily in AM/PM",
                "notes": "Apply onto slightly damp skin for best results."
            })

    # Step 3: Moisturizing
    am_items.append({
        "category": "MOISTURIZING",
        "name": moisturizer,
        "description": moisturizer_desc,
        "frequency": "Every morning",
        "notes": "Provides lightweight hydration to maintain skin barrier health throughout the day."
    })

    # Step 4: Sun Protection
    am_items.append({
        "category": "SUN_PROTECTION",
        "name": sunscreen,
        "description": sunscreen_desc,
        "frequency": "Every morning",
        "notes": "Reapply every 2 hours if outdoors. Crucial for anti-aging and fading spots."
    })

    # 8. Construct PM Routine
    pm_items = []
    # Step 1: Cleansing
    pm_items.append({
        "category": "CLEANSING",
        "name": cleanser,
        "description": cleanser_desc,
        "frequency": "Every evening",
        "notes": "Thoroughly removes sunscreen, sweat, and impurities built up during the day."
    })
    
    # Step 2: Treatment (add PM actives)
    pm_actives = [a for a in sanitized_actives if "pm" in a[2].lower() or "am/pm" in a[2].lower()]
    for active in pm_actives:
        if len(pm_items) < max_steps_pm - 2: # Keep room for moisturizer and night cream
            pm_items.append({
                "category": "TREATMENT",
                "name": active[0],
                "description": active[1],
                "frequency": active[2],
                "notes": "Apply after cleansing. If using retinol, introduce slowly (2-3x/week)."
            })
            
    # Step 3: Moisturizing
    pm_items.append({
        "category": "MOISTURIZING",
        "name": moisturizer,
        "description": moisturizer_desc,
        "frequency": "Every evening",
        "notes": "Locks in hydration and repairs the skin barrier while you sleep."
    })

    # Step 4: Night Care (if room exists and preferred)
    if max_steps_pm >= 4:
        pm_items.append({
            "category": "NIGHT_CARE",
            "name": night_cream,
            "description": night_cream_desc,
            "frequency": "Every evening",
            "notes": "Apply as the final step of your PM routine to seal in hydration."
        })

    # Set step order for AM and PM
    for idx, item in enumerate(am_items):
        item["routine_type"] = "MORNING"
        item["step_order"] = idx + 1
        
    for idx, item in enumerate(pm_items):
        item["routine_type"] = "EVENING"
        item["step_order"] = idx + 1

    # 9. Create Weekly Plan
    weekly_items = []
    
    # Exfoliation scheduling logic
    exfoliator_name = "Salicylic Acid (BHA) 2% Pore Gel"
    exfoliator_desc = "Deeply cleanses pores, eliminates blackheads, and removes dead skin cells."
    if is_sensitive:
        exfoliator_name = "PHA 3% Soothing Exfoliant"
        exfoliator_desc = "Mild polyhydroxy acid that gently lifts surface cells without irritating the skin."
    
    has_exfoliation = not is_very_sensitive and not is_excluded(exfoliator_name)
    
    # Weekly steps mapping
    days_mapping = {
        "Monday": "Active Renewal: Apply your PM active serum after cleansing.",
        "Tuesday": "Barrier Nourishment: Focus on basic cleansing and hydrating moisturizer.",
        "Wednesday": f"Deep Exfoliation: Use {exfoliator_name} to clear pores." if has_exfoliation else "Calming Routine: Apply Centella Asiatica serum for recovery.",
        "Thursday": "Active Renewal: Apply your PM active serum after cleansing.",
        "Friday": "Barrier Nourishment: Focus on basic cleansing and hydrating moisturizer.",
        "Saturday": f"Gentle Exfoliation: Use {exfoliator_name}." if has_exfoliation and not is_sensitive else "Calming Routine: Soothe skin with a barrier-repair balm.",
        "Sunday": "Deep Hydration: Use a hydrating sheet mask or rich squalane oil for moisture lock." if not is_excluded("mask") else "Rest Day: Apply simple barrier hydration."
    }

    for order_idx, (day, desc) in enumerate(days_mapping.items()):
        weekly_items.append({
            "routine_type": "WEEKLY",
            "category": "TREATMENT",
            "step_order": order_idx + 1,
            "name": day,
            "description": desc,
            "frequency": "Weekly on " + day,
            "notes": "Ensure you do not stack multiple high-strength peeling agents on the same day."
        })

    # 10. Seasonal Skincare Recommendations
    seasonal_items = []
    
    # Summer/Humid shift
    summer_name = "Summer Skincare Shift"
    summer_desc = "Use lightweight gel-moisturizers and fluid sunscreens to prevent sweat-induced clogging."
    if profile.climate == "Hot & dry":
        summer_desc = "Add a hydrating mist and fluid sunscreens to replenish moisture evaporating from heat."
    
    # Winter/Dry shift
    winter_name = "Winter Skincare Shift"
    winter_desc = "Switch to rich ceramide creams and add facial oils (like squalane) to block dry indoor heating."
    if profile.climate == "Hot & humid":
        winter_desc = "Switch to lightweight emulsions. Winter dryness is mild; maintain sunscreen protection."

    seasonal_items.append({
        "routine_type": "SEASONAL",
        "category": "MOISTURIZING",
        "step_order": 1,
        "name": summer_name,
        "description": summer_desc,
        "frequency": "During Summer / Hot weather",
        "notes": "Always prioritize sunblock reapplication when outdoor indexes are high."
    })
    
    seasonal_items.append({
        "routine_type": "SEASONAL",
        "category": "MOISTURIZING",
        "step_order": 2,
        "name": winter_name,
        "description": winter_desc,
        "frequency": "During Winter / Cold weather",
        "notes": "Avoid long hot-water showers as they strip natural lipids from facial skin."
    })

    # 11. Lifestyle & Safety Custom Notes injection
    # Add clinical caution warning notes for severe issues
    severe_notes = ""
    if has_severe_warning:
        severe_notes += "Safety Notice: You reported severe breakouts or previous reactions. "
        severe_notes += "We strongly advise consulting a dermatologist for prescription-grade therapy. "
        
    for item in am_items + pm_items:
        # Inject custom notes based on lifestyle answers
        custom_notes = []
        if profile.water_intake == "<1 L":
            custom_notes.append("Increase daily water intake (aim for 2L+).")
        if profile.sleep_hours in ["<5", "5–6"]:
            custom_notes.append("Compensate low sleep with rich barrier hydration.")
        if profile.stress_level in ["High", "Very high"]:
            custom_notes.append("High stress triggers cortisol; keep skincare gentle.")
        if profile.outdoor_hours in ["2–4 hours", ">4 hours"] and item["category"] == "SUN_PROTECTION":
            custom_notes.append("Reapply sunscreen every 2 hours while outdoors.")
            
        if severe_notes:
            item["notes"] = severe_notes + (item["notes"] or "")
        elif custom_notes:
            item["notes"] = ", ".join(custom_notes) + ". " + (item["notes"] or "")

    return am_items + pm_items + weekly_items + seasonal_items
