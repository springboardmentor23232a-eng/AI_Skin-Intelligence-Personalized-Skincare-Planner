"""
PanaceaAI Routine Generation Engine (Module 4)
Clinical rule-based routine builder taking into account:
- Skin Type (Dry, Oily, Combination, Normal, Sensitive)
- Identified Skin Concerns (Acne, Hyperpigmentation, Wrinkles, Redness, etc.)
- Skin Health Score & Barrier Condition
- Allergies & Sensitivities
- Lifestyle (Sun exposure, Sleep, Stress, Water intake, Climate)
- Season (Spring, Summer, Autumn, Winter)
- Adaptive updates based on historical score trends
"""

from typing import Dict, List, Any, Optional
from app.schemas import (
    RoutineCategoryEnum,
    SeasonEnum,
    RoutineStepSchema,
    WeeklyTreatmentItemSchema,
    SeasonalRecommendationSchema,
    AdaptiveUpdateSchema
)

def is_allergy_conflict(ingredient: str, allergies: List[str], sensitivities: List[str]) -> bool:
    """Checks if an active ingredient conflicts with user allergies or sensitivities."""
    combined = [a.strip().lower() for a in (allergies + sensitivities) if a]
    ing_lower = ingredient.lower()
    for allergen in combined:
        if allergen in ing_lower or ing_lower in allergen:
            return True
    return False

def filter_safe_ingredients(candidates: List[str], allergies: List[str], sensitivities: List[str]) -> List[str]:
    """Filters candidate ingredients against user allergy/sensitivity list."""
    safe = []
    for ing in candidates:
        if not is_allergy_conflict(ing, allergies, sensitivities):
            safe.append(ing)
    return safe if safe else ["Ceramides", "Hyaluronic Acid", "Centella Asiatica"]

def generate_morning_routine(
    skin_type: str,
    concerns: List[str],
    health_score: float,
    allergies: List[str],
    sensitivities: List[str],
    lifestyle: Dict[str, Any]
) -> List[RoutineStepSchema]:
    """
    Generates Morning Sequence:
    🧼 Cleansing -> 💧 Treatment -> 🧴 Moisturizing -> ☀️ Sun Protection
    """
    steps = []

    # 1. 🧼 Cleansing (AM)
    if skin_type in ["Oily", "Combination"]:
        cleanser_title = "Gentle Purifying Gel Cleanser"
        cleanser_prod = "Clarify Gel Wash with 0.5% Salicylic Acid & Zinc"
        cleanser_ing = ["Salicylic Acid", "Zinc PCA", "Green Tea Extract"]
        cleanser_inst = "Massage onto damp face for 30-45 seconds. Rinse with lukewarm water to remove overnight sebum."
    elif skin_type == "Dry":
        cleanser_title = "Hydrating Cream-to-Foam Cleanser"
        cleanser_prod = "DermaMoist Hydrating Cleanser"
        cleanser_ing = ["Ceramides NP", "Glycerin", "Hyaluronic Acid"]
        cleanser_inst = "Gently cleanse with lukewarm water. Pat dry, leaving skin slightly damp."
    elif skin_type == "Sensitive":
        cleanser_title = "Soothing pH-Balanced Micellar Cleanser"
        cleanser_prod = "CalmCare Ultra-Gentle Cleansing Milk"
        cleanser_ing = ["Centella Asiatica", "Colloidal Oat", "Panthenol"]
        cleanser_inst = "Apply gently without friction. Rinse soft with tepid water."
    else:
        cleanser_title = "Daily Refreshing Hydrating Wash"
        cleanser_prod = "Balance Daily Gel Wash"
        cleanser_ing = ["Hyaluronic Acid", "Aloe Vera", "Niacinamide"]
        cleanser_inst = "Wash face gently in morning routine to start fresh."

    safe_cleanser_ing = filter_safe_ingredients(cleanser_ing, allergies, sensitivities)

    steps.append(RoutineStepSchema(
        id="am_step_1",
        step_number=1,
        category=RoutineCategoryEnum.CLEANSING,
        title=cleanser_title,
        product_recommendation=cleanser_prod,
        key_ingredients=safe_cleanser_ing,
        instructions=cleanser_inst,
        time="8:00 AM",
        completed=False,
        icon="🧼"
    ))

    # 2. 💧 Treatment (AM)
    if "Acne" in str(concerns) or "Active Acne" in str(concerns):
        treat_title = "Blemish Control & Sebum Niacinamide Serum"
        treat_prod = "10% Niacinamide + 1% Zinc PCA Serum"
        treat_ing = ["Niacinamide 10%", "Zinc PCA 1%", "Allantoin"]
        treat_inst = "Apply 3-4 drops evenly to face. Calms redness and regulates morning oil production."
    elif "Hyperpigmentation" in str(concerns) or "Dark Spots" in str(concerns):
        treat_title = "Antioxidant Brightening Vitamin C Serum"
        treat_prod = "15% Vitamin C (THD Ascorbate) + Ferulic Acid"
        treat_ing = ["Vitamin C", "Ferulic Acid", "Alpha Arbutin"]
        treat_inst = "Press gently into skin before sunscreen. Protects skin against free radical photo-damage."
    elif "Aging" in str(concerns) or "Wrinkles" in str(concerns):
        treat_title = "Peptide Firming & Hydration Complex"
        treat_prod = "Multi-Peptide + Copper Tripeptide Serum"
        treat_ing = ["Copper Peptides", "Matrixyl 3000", "Hyaluronic Acid"]
        treat_inst = "Apply 4 drops to clean skin. Enhances elasticity and morning skin plumpness."
    elif "Redness" in str(concerns) or "Rosacea" in str(concerns) or skin_type == "Sensitive":
        treat_title = "Barrier Repairing Cica Soothing Serum"
        treat_prod = "Centella & Panthenol Redness Relief Concentrate"
        treat_ing = ["Centella Asiatica", "Panthenol (B5)", "Madecassoside"]
        treat_inst = "Apply gently over sensitive regions to strengthen moisture barrier."
    else:
        treat_title = "Hydration Boost Hyaluronic Serum"
        treat_prod = "Multi-Molecular Hyaluronic Acid Serum"
        treat_ing = ["Hyaluronic Acid", "Polyglutamic Acid", "B5"]
        treat_inst = "Apply to damp skin for maximum hydration locking."

    safe_treat_ing = filter_safe_ingredients(treat_ing, allergies, sensitivities)

    steps.append(RoutineStepSchema(
        id="am_step_2",
        step_number=2,
        category=RoutineCategoryEnum.TREATMENT,
        title=treat_title,
        product_recommendation=treat_prod,
        key_ingredients=safe_treat_ing,
        instructions=treat_inst,
        time="8:05 AM",
        completed=False,
        icon="💧"
    ))

    # 3. 🧴 Moisturizing (AM)
    if skin_type in ["Oily", "Combination"]:
        moist_title = "Lightweight Oil-Free Gel Moisturizer"
        moist_prod = "HydraBalance Water Gel Cream"
        moist_ing = ["Squalane", "Hyaluronic Acid", "Green Tea"]
        moist_inst = "Smooth lightweight gel layer over face and neck without clogging pores."
    elif skin_type == "Dry":
        moist_title = "Rich Lipid Ceramide Barrier Cream"
        moist_prod = "Ceramide Barrier Intensive Cream"
        moist_ing = ["Ceramides AP/EOP/NP", "Sheabutter", "Cholesterol"]
        moist_inst = "Apply generous layer to restore moisture lipid balance."
    else:
        moist_title = "Daily Nourishing Barrier Emulsion"
        moist_prod = "Daily Barrier Lotion"
        moist_ing = ["Ceramides", "Squalane", "Niacinamide 2%"]
        moist_inst = "Massage evenly until completely absorbed."

    safe_moist_ing = filter_safe_ingredients(moist_ing, allergies, sensitivities)

    steps.append(RoutineStepSchema(
        id="am_step_3",
        step_number=3,
        category=RoutineCategoryEnum.MOISTURIZING,
        title=moist_title,
        product_recommendation=moist_prod,
        key_ingredients=safe_moist_ing,
        instructions=moist_inst,
        time="8:10 AM",
        completed=False,
        icon="🧴"
    ))

    # 4. ☀️ Sun Protection (AM - Mandatory)
    spf_val = "SPF 50+" if lifestyle.get("sun_exposure_hours", 2.0) > 2.0 else "SPF 30+"
    if skin_type == "Sensitive" or "Redness" in str(concerns):
        sun_title = f"100% Mineral Broad-Spectrum {spf_val} Sunscreen"
        sun_prod = f"Sheer Zinc Mineral Shield {spf_val}"
        sun_ing = ["Zinc Oxide 12%", "Titanium Dioxide", "Bisabolol"]
        sun_inst = "Apply 2 finger-lengths generously as the final morning step 15 min before sun exposure."
    elif skin_type in ["Oily", "Combination"]:
        sun_title = f"Ultra-Light Weightless Fluid {spf_val}"
        sun_prod = f"Matte Finish UV Defender {spf_val}"
        sun_ing = ["Niacinamide 2%", "Silica", "UV Filters"]
        sun_inst = "Apply 2 finger lengths evenly. Quick absorbing with non-greasy matte finish."
    else:
        sun_title = f"Broad Spectrum Hydrating UV Shield {spf_val}"
        sun_prod = f"HydraShield UV Cream {spf_val}"
        sun_ing = ["Hyaluronic Acid", "Vitamin E", "Broad Spectrum UV Filters"]
        sun_inst = "Apply generously over face, neck, and ears."

    safe_sun_ing = filter_safe_ingredients(sun_ing, allergies, sensitivities)

    steps.append(RoutineStepSchema(
        id="am_step_4",
        step_number=4,
        category=RoutineCategoryEnum.SUN_PROTECTION,
        title=sun_title,
        product_recommendation=sun_prod,
        key_ingredients=safe_sun_ing,
        instructions=sun_inst,
        time="8:15 AM",
        completed=False,
        icon="☀️"
    ))

    return steps


def generate_evening_routine(
    skin_type: str,
    concerns: List[str],
    health_score: float,
    allergies: List[str],
    sensitivities: List[str],
    lifestyle: Dict[str, Any]
) -> List[RoutineStepSchema]:
    """
    Generates Evening Sequence:
    🧼 Cleansing -> ✨ Exfoliation (scheduled) -> 💧 Treatment -> 🧴 Moisturizing -> 🌙 Night Care
    """
    steps = []

    # 1. 🧼 Cleansing (PM Double Cleanse)
    makeup = lifestyle.get("makeup_usage", "Light")
    if makeup in ["Full Coverage / Daily Heavy", "Light Minimal Makeup"] or skin_type in ["Oily", "Combination"]:
        cleanser_title = "PM Double Cleanse (Balm/Oil + Gentle Cleanser)"
        cleanser_prod = "Melting Cleansing Balm + Gentle Foaming Wash"
        cleanser_ing = ["Jojoba Oil", "Sunflower Seed Oil", "Amino Acids"]
        cleanser_inst = "Massage balm on dry face to dissolve sunscreen/makeup, then follow with water-based cleanser."
    else:
        cleanser_title = "Deep Hydrating Evening Cleanser"
        cleanser_prod = "Gentle Amino Acid Wash"
        cleanser_ing = ["Glycerin", "Ceramides", "Chamomile"]
        cleanser_inst = "Wash face thoroughly with lukewarm water to cleanse accumulated daily impurities."

    safe_cleanser_ing = filter_safe_ingredients(cleanser_ing, allergies, sensitivities)

    steps.append(RoutineStepSchema(
        id="pm_step_1",
        step_number=1,
        category=RoutineCategoryEnum.CLEANSING,
        title=cleanser_title,
        product_recommendation=cleanser_prod,
        key_ingredients=safe_cleanser_ing,
        instructions=cleanser_inst,
        time="9:00 PM",
        completed=False,
        icon="🧼"
    ))

    # 2. ✨ Exfoliation (PM - Conditional / Scheduled)
    # If skin health score is low (< 50) or sensitivity is high, skip exfoliation step or suggest mild PHA
    if health_score < 50.0 or skin_type == "Sensitive" or "Redness" in str(concerns):
        exf_title = "Soothing Micro-Exfoliating PHA Toner (1-2x/Week)"
        exf_prod = "Gluconolactone 3% PHA Gentle Liquid"
        exf_ing = ["Gluconolactone (PHA)", "Centella", "Allantoin"]
        exf_inst = "Use gently 1 evening per week only. Ultra-mild exfoliation safe for sensitive barriers."
    elif "Acne" in str(concerns) or skin_type in ["Oily", "Combination"]:
        exf_title = "Pore-Clearing 2% Salicylic Acid Exfoliant"
        exf_prod = "2% BHA Liquid Exfoliant"
        exf_ing = ["Salicylic Acid 2%", "Green Tea", "Methylpropanediol"]
        exf_inst = "Apply with cotton pad 2-3 evenings a week. Penetrates pores to dissolve blackheads & blemishes."
    else:
        exf_title = "Smoothing 5% Lactic Acid + HA Exfoliant"
        exf_prod = "5% Lactic Acid AHA Serum"
        exf_ing = ["Lactic Acid 5%", "Hyaluronic Acid", "Tasmanian Pepperberry"]
        exf_inst = "Use 2 evenings per week after cleansing. Gently resurfaces texture for radiant glow."

    safe_exf_ing = filter_safe_ingredients(exf_ing, allergies, sensitivities)

    steps.append(RoutineStepSchema(
        id="pm_step_2",
        step_number=2,
        category=RoutineCategoryEnum.EXFOLIATION,
        title=exf_title,
        product_recommendation=exf_prod,
        key_ingredients=safe_exf_ing,
        instructions=exf_inst,
        time="9:05 PM",
        completed=False,
        icon="✨"
    ))

    # 3. 💧 Treatment (PM)
    if "Aging" in str(concerns) or "Wrinkles" in str(concerns):
        treat_title = "Youth Renewing Retinol Complex"
        treat_prod = "0.3% Encapsulated Retinol + Bakuchiol Night Serum"
        treat_ing = ["Encapsulated Retinol", "Bakuchiol", "Squalane"]
        treat_inst = "Apply pea-sized amount to dry skin. Stimulates nocturnal cell turnover and collagen production."
    elif "Hyperpigmentation" in str(concerns) or "Dark Spots" in str(concerns):
        treat_title = "Night Pigment Corrector Concentrate"
        treat_prod = "Tranexamic Acid 3% + Azelaic Acid 10% Complex"
        treat_ing = ["Tranexamic Acid", "Azelaic Acid 10%", "Kojic Acid"]
        treat_inst = "Target hyperpigmentation patches at night for even skin tone restoration."
    elif "Acne" in str(concerns):
        treat_title = "Blemish Clarifying Treatment Gel"
        treat_prod = "15% Azelaic Acid Suspension"
        treat_ing = ["Azelaic Acid 15%", "Licorice Root Extract", "Tea Tree Extract"]
        treat_inst = "Apply to acne-prone zones to reduce inflammatory spots overnight."
    else:
        treat_title = "Night Barrier Repair & Hydration Elixir"
        treat_prod = "B5 Moisture Concentrate"
        treat_ing = ["Panthenol 5%", "Hyaluronic Acid", "Beta-Glucan"]
        treat_inst = "Smooth over face and neck to boost moisture absorption."

    safe_treat_ing = filter_safe_ingredients(treat_ing, allergies, sensitivities)

    steps.append(RoutineStepSchema(
        id="pm_step_3",
        step_number=3,
        category=RoutineCategoryEnum.TREATMENT,
        title=treat_title,
        product_recommendation=treat_prod,
        key_ingredients=safe_treat_ing,
        instructions=treat_inst,
        time="9:10 PM",
        completed=False,
        icon="💧"
    ))

    # 4. 🧴 Moisturizing (PM)
    if skin_type in ["Oily", "Combination"]:
        moist_title = "Overnight Balance Hydrating Emulsion"
        moist_prod = "Night Recovery Water Lotion"
        moist_ing = ["Niacinamide", "Hyaluronic Acid", "Squalane"]
        moist_inst = "Smooth lightweight layer to maintain optimal hydration without congestion."
    else:
        moist_title = "Intense Barrier Lipid Repair Cream"
        moist_prod = "Overnight Ceramide Moisture Seal"
        moist_ing = ["Ceramide 1, 3, 6-II", "Fatty Acids", "Cholesterol"]
        moist_inst = "Apply rich cream layer to seal active ingredients into skin."

    safe_moist_ing = filter_safe_ingredients(moist_ing, allergies, sensitivities)

    steps.append(RoutineStepSchema(
        id="pm_step_4",
        step_number=4,
        category=RoutineCategoryEnum.MOISTURIZING,
        title=moist_title,
        product_recommendation=moist_prod,
        key_ingredients=safe_moist_ing,
        instructions=moist_inst,
        time="9:15 PM",
        completed=False,
        icon="🧴"
    ))

    # 5. 🌙 Night Care (PM - Final Step)
    if skin_type == "Dry" or health_score < 60.0:
        night_title = "Overnight Recovery Barrier Seal Mask"
        night_prod = "Sleeping Mask with Squalane & Cica"
        night_ing = ["Plant Squalane", "Centella", "Madecassoside"]
        night_inst = "Apply thin sleeping mask overlay as final PM care. Locks in hydration for 8-hour sleep recovery."
    elif "Acne" in str(concerns):
        night_title = "Overnight Blemish Hydrocolloid / Spot Shield"
        night_prod = "Hydrocolloid Spot Patch / Calamine Balm"
        night_ing = ["Hydrocolloid", "Zinc Oxide", "Salicylic Acid"]
        night_inst = "Apply targeted spot patches on active whiteheads before sleep."
    else:
        night_title = "Overnight Moisture Seal & Lip Treatment"
        night_prod = "Nourishing Night Lip Mask & Facial Balm"
        night_ing = ["Ceramides", "Peptides", "Shea Butter"]
        night_inst = "Final night care step. Apply lip butter and lightly press facial balm onto high points."

    safe_night_ing = filter_safe_ingredients(night_ing, allergies, sensitivities)

    steps.append(RoutineStepSchema(
        id="pm_step_5",
        step_number=5,
        category=RoutineCategoryEnum.NIGHT_CARE,
        title=night_title,
        product_recommendation=night_prod,
        key_ingredients=safe_night_ing,
        instructions=night_inst,
        time="9:20 PM",
        completed=False,
        icon="🌙"
    ))

    return steps


def generate_weekly_treatment_plan(
    skin_type: str,
    concerns: List[str],
    health_score: float
) -> List[WeeklyTreatmentItemSchema]:
    """Generates weekly treatment schedule for periodic intensive care."""
    plan = []

    # Exfoliation days
    if health_score >= 50.0 and skin_type != "Sensitive":
        plan.append(WeeklyTreatmentItemSchema(
            day="Wednesday & Sunday",
            focus="Chemical Exfoliation (BHA / AHA)",
            category=RoutineCategoryEnum.EXFOLIATION.value,
            treatment_name="2% Salicylic Acid or 5% Lactic Acid Exfoliant",
            instructions="Apply in PM after cleansing. Leave on for deep pore clearing & smooth texture renewal.",
            icon="✨"
        ))
    else:
        plan.append(WeeklyTreatmentItemSchema(
            day="Wednesday",
            focus="Ultra-Gentle PHA Barrier Polish",
            category=RoutineCategoryEnum.EXFOLIATION.value,
            treatment_name="3% PHA Soothing Toner",
            instructions="Use once weekly in PM to gently clear dull cells without disturbing skin barrier.",
            icon="✨"
        ))

    # Deep Hydration Mask
    plan.append(WeeklyTreatmentItemSchema(
        day="Friday Evening",
        focus="Deep Moisture & Barrier Recovery Mask",
        category=RoutineCategoryEnum.TREATMENT.value,
        treatment_name="Ceramide & Hyaluronic Bio-Cellulose Sheet Mask",
        instructions="Apply sheet mask for 15-20 minutes after cleansing. Gently pat excess serum into skin.",
        icon="💧"
    ))

    # Weekend Detox / Scalp & Lip Care
    plan.append(WeeklyTreatmentItemSchema(
        day="Saturday Morning",
        focus="Weekend Detox & Lip / Eye Care Ritual",
        category=RoutineCategoryEnum.NIGHT_CARE.value,
        treatment_name="Nourishing Eye Serum & Hydrating Lip Mask",
        instructions="Massage eye serum with cooling roller tool and apply peptide lip treatment for weekend recovery.",
        icon="🌙"
    ))

    return plan


def generate_seasonal_recommendations(
    season: SeasonEnum,
    skin_type: str
) -> SeasonalRecommendationSchema:
    """Generates seasonal skincare adaptations and ingredient suggestions."""
    if season == SeasonEnum.SUMMER:
        return SeasonalRecommendationSchema(
            season="Summer ☀️",
            climate_impact="High UV index, elevated humidity, increased sebum & sweat production.",
            key_focus="Lightweight Hydration, Sebum Control & SPF 50+ Sun Defense",
            routine_adjustments=[
                "Switch heavy creams to lightweight oil-free gel moisturizers.",
                "Ensure daily SPF is 50+ and water/sweat resistant.",
                "Incorporate Niacinamide to manage oiliness and prevent summer clogged pores.",
                "Reapply sunscreen every 2 hours during outdoor exposure."
            ],
            recommended_ingredients=["Niacinamide", "Zinc Oxide", "Green Tea Extract", "Hyaluronic Acid"],
            avoid_ingredients=["Heavy Occlusive Mineral Oils", "High-Concentration Photosensitizing Acids in Daytime"]
        )
    elif season == SeasonEnum.WINTER:
        return SeasonalRecommendationSchema(
            season="Winter ❄️",
            climate_impact="Low outdoor temperatures, harsh cold winds, dry indoor heating environments.",
            key_focus="Lipid Barrier Repair, Rich Occlusives & Transepidermal Water Loss (TEWL) Protection",
            routine_adjustments=[
                "Switch to a rich lipid cream loaded with Ceramides, Squalane, and Fatty Acids.",
                "Reduce chemical exfoliation frequency to avoid winter barrier irritation.",
                "Use an indoor humidifier to maintain 40-50% relative humidity.",
                "Layer a hydrating mist or serum under moisturizer."
            ],
            recommended_ingredients=["Ceramides NP/AP", "Plant Squalane", "Shea Butter", "Colloidal Oatmeal"],
            avoid_ingredients=["Harsh Sulfate Cleansers", "High Concentration Alcohol Denat Toners"]
        )
    elif season == SeasonEnum.SPRING:
        return SeasonalRecommendationSchema(
            season="Spring 🌸",
            climate_impact="Fluctuating temperatures, rising pollen allergens, increasing solar UV intensity.",
            key_focus="Gentle Resurfacing, Antioxidant Defense & Barrier Adaptation",
            routine_adjustments=[
                "Transition from rich winter creams to mid-weight hydration lotions.",
                "Incorporate Vitamin C & E antioxidants to combat seasonal environmental free radicals.",
                "Gradually increase exfoliation rate to clear winter dullness."
            ],
            recommended_ingredients=["Vitamin C (Ascorbic Acid / THD)", "Ferulic Acid", "Resveratrol", "Panthenol"],
            avoid_ingredients=["Over-exfoliating physical scrubs"]
        )
    else: # Autumn
        return SeasonalRecommendationSchema(
            season="Autumn 🍂",
            climate_impact="Dropping humidity levels, cooler air, post-summer sun damage & hyperpigmentation.",
            key_focus="Post-Summer Repair, Pigmentation Correction & Hydration Prep",
            routine_adjustments=[
                "Focus on fading summer dark spots with Vitamin C, Alpha Arbutin, or Tranexamic Acid.",
                "Begin introducing richer moisturizing creams before winter cold strikes.",
                "Maintain consistent sunscreen application despite cooler weather."
            ],
            recommended_ingredients=["Alpha Arbutin", "Tranexamic Acid", "Azelaic Acid", "Hyaluronic Acid"],
            avoid_ingredients=["Stripping foaming cleansers"]
        )


def evaluate_adaptive_updates(
    current_health_score: float,
    previous_health_score: Optional[float],
    sensitivity_level: float
) -> AdaptiveUpdateSchema:
    """Evaluates score changes & sensitivity levels to produce adaptive routine updates."""
    if sensitivity_level >= 70.0 or current_health_score < 45.0:
        return AdaptiveUpdateSchema(
            mode="🚨 Barrier Repair Safeguard Mode",
            health_score_delta=(current_health_score - (previous_health_score or current_health_score)),
            message="High sensitivity or low barrier health score detected! Active exfoliants & strong retinoids have been automatically paused to prioritize barrier restoration.",
            adjustments_made=[
                "Exfoliation step set to ultra-mild 1x/week PHA toner.",
                "Retinoids replaced with soothing Centella & Panthenol recovery serum.",
                "Added Ceramide & Lipid Rich Barrier Cream."
            ]
        )
    elif previous_health_score is not None and (current_health_score - previous_health_score) >= 5.0:
        return AdaptiveUpdateSchema(
            mode="🌟 Optimal Progress & Maintenance Mode",
            health_score_delta=(current_health_score - previous_health_score),
            message=f"Skin health score improved by +{round(current_health_score - previous_health_score, 1)} pts! Routine optimized for sustained radiance.",
            adjustments_made=[
                "Maintained optimal treatment active concentration.",
                "Weekly treatment plan active with 2x/week exfoliation."
            ]
        )
    else:
        return AdaptiveUpdateSchema(
            mode="✅ Balanced Routine Mode",
            health_score_delta=0.0,
            message="Your personalized routine is tuned to maintain skin barrier equilibrium.",
            adjustments_made=["Routine aligned with latest clinical skin profile."]
        )


def generate_personalized_routine_data(
    skin_type: str = "Combination",
    concerns: List[str] = None,
    health_score: float = 75.0,
    allergies: List[str] = None,
    sensitivities: List[str] = None,
    lifestyle: Dict[str, Any] = None,
    season: SeasonEnum = SeasonEnum.SUMMER,
    previous_health_score: Optional[float] = None
) -> Dict[str, Any]:
    """Master generator function creating complete personalized routine payload."""
    concerns = concerns or ["Acne & Breakouts"]
    allergies = allergies or []
    sensitivities = sensitivities or []
    lifestyle = lifestyle or {"sun_exposure_hours": 2.0, "makeup_usage": "Light"}

    # Morning sequence
    am_steps = generate_morning_routine(
        skin_type, concerns, health_score, allergies, sensitivities, lifestyle
    )

    # Evening sequence
    pm_steps = generate_evening_routine(
        skin_type, concerns, health_score, allergies, sensitivities, lifestyle
    )

    # Weekly treatment plan
    weekly_plan = generate_weekly_treatment_plan(
        skin_type, concerns, health_score
    )

    # Seasonal recommendations
    seasonal_tips = generate_seasonal_recommendations(
        season, skin_type
    )

    # Adaptive updates
    adaptive_notes = evaluate_adaptive_updates(
        health_score, previous_health_score, lifestyle.get("sensitivity_level", 20.0)
    )

    return {
        "season": season.value if hasattr(season, "value") else str(season),
        "morning_routine": [step.model_dump() for step in am_steps],
        "evening_routine": [step.model_dump() for step in pm_steps],
        "weekly_plan": [item.model_dump() for item in weekly_plan],
        "seasonal_tips": seasonal_tips.model_dump(),
        "adaptive_notes": adaptive_notes.model_dump()
    }
