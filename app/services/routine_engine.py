import datetime
from typing import Dict, List, Any, Optional

CATEGORY_ICONS = {
    "cleansing": "🧼",
    "exfoliation": "✨",
    "treatment": "💧",
    "moisturizing": "🧴",
    "sun_protection": "☀️",
    "night_care": "🌙",
}


def get_current_season() -> str:
    month = datetime.datetime.now().month
    if month in (12, 1, 2):
        return "Winter"
    elif month in (3, 4):
        return "Spring"
    elif month in (5, 6, 7):
        return "Summer"
    else:
        return "Autumn"


def check_allergy(ingredient: str, allergies_str: str, sensitivities_str: str) -> bool:
    """Returns True if the ingredient conflicts with user's reported allergies/sensitivities."""
    all_allergies = f"{allergies_str or ''} {sensitivities_str or ''}".lower()
    return ingredient.lower() in all_allergies


def generate_personalized_routine_data(
    profile: Any,
    latest_assessment: Optional[Any] = None,
    previous_assessment: Optional[Any] = None,
    override_season: Optional[str] = None
) -> Dict[str, Any]:
    season = override_season or get_current_season()

    skin_type = (profile.skin_type or "Normal").strip()
    concerns = (profile.skin_concerns or "").strip()
    allergies = (profile.allergies or "").strip()
    sensitivities = (profile.sensitivities or "").strip()
    lifestyle = (profile.lifestyle_habits or "").strip()
    health_score = getattr(profile, "skin_health_score", 70) or 70

    # Extract concerns as lower-case set
    concern_list = [c.strip().lower() for c in concerns.replace(",", ";").split(";") if c.strip()]
    has_acne = any("acne" in c or "breakout" in c or "pimple" in c for c in concern_list)
    has_aging = any("aging" in c or "wrinkle" in c or "fine line" in c for c in concern_list)
    has_pigmentation = any("pigment" in c or "spot" in c or "dark" in c or "dull" in c for c in concern_list)
    has_dryness = any("dry" in c or "dehydrat" in c or "flak" in c for c in concern_list)
    has_redness = any("red" in c or "rosacea" in c or "irritat" in c or "sensitive" in c for c in concern_list)
    is_sensitive = "sensitive" in skin_type.lower() or has_redness or bool(sensitivities)

    # 1. Evaluate Adaptation Trend if previous assessment exists
    adaptation_summary = ""
    acne_severity_change = None
    health_score_change = 0

    if latest_assessment and previous_assessment:
        prev_score = getattr(previous_assessment, "skin_health_score", 0) or 0
        curr_score = getattr(latest_assessment, "skin_health_score", 0) or 0
        health_score_change = curr_score - prev_score

        # Check priorities in latest vs previous
        prev_priorities = {p.concern_name.lower(): p.severity for p in getattr(previous_assessment, "priorities", [])}
        curr_priorities = {p.concern_name.lower(): p.severity for p in getattr(latest_assessment, "priorities", [])}

        changes = []
        for concern_name, curr_sev in curr_priorities.items():
            prev_sev = prev_priorities.get(concern_name)
            if prev_sev and prev_sev != curr_sev:
                changes.append(f"{concern_name.title()} severity adjusted from {prev_sev} to {curr_sev}")
                if "acne" in concern_name:
                    acne_severity_change = (prev_sev, curr_sev)

        if changes:
            adaptation_summary = "Adaptive update: " + "; ".join(changes) + "."
        elif health_score_change > 0:
            adaptation_summary = f"Skin health score improved by +{health_score_change} points! Routine optimized to maintain barrier strength."
        elif health_score_change < 0:
            adaptation_summary = f"Skin health score dropped by {health_score_change} points. Routine adjusted to emphasize soothing barrier repair."
        else:
            adaptation_summary = "Routine re-evaluated based on your latest skin assessment profile."

    elif latest_assessment:
        adaptation_summary = f"Initial personalized routine generated based on assessment score of {health_score}/100 and detected skin priorities."
    else:
        adaptation_summary = "Standard personalized baseline routine established based on your skin profile survey."

    # 2. Build Morning Steps
    morning_steps = []
    
    # Morning Step 1: Cleansing 🧼
    if "oily" in skin_type.lower():
        cleanser_title = "Salicylic Acid Gentle Gel Cleanser" if not check_allergy("salicylic acid", allergies, sensitivities) else "Foaming Amino Acid Cleanser"
        cleanser_desc = "Cleanse away overnight excess sebum while preserving natural hydration."
        cleanser_ing = "Niacinamide, Zinc PCA" if check_allergy("salicylic acid", allergies, sensitivities) else "Salicylic Acid 1%, Niacinamide"
    elif "dry" in skin_type.lower():
        cleanser_title = "Hydrating Ceramide Cream Cleanser"
        cleanser_desc = "Gently cleanse with non-foaming lipids to nourish and restore skin moisture."
        cleanser_ing = "Ceramides, Hyaluronic Acid, Glycerin"
    else:
        cleanser_title = "Balancing Gel Cleanser"
        cleanser_desc = "Remove surface impurities and restore balanced epidermal pH."
        cleanser_ing = "Green Tea Extract, Glycerin, Panthenol"

    morning_steps.append({
        "time_of_day": "morning",
        "step_order": 1,
        "category": "cleansing",
        "category_icon": "🧼",
        "step_title": cleanser_title,
        "description": cleanser_desc,
        "active_ingredients": cleanser_ing,
        "frequency": "Daily (Morning)",
        "caution_notes": "Use lukewarm water. Massage gently for 60 seconds."
    })

    # Morning Step 2: Treatment 💧
    treatment_title = "Hydrating & Brightening Antioxidant Serum"
    treatment_ing = "Vitamin C 10%, Hyaluronic Acid"
    treatment_desc = "Protect against environmental free radicals and boost daily skin radiance."

    if check_allergy("vitamin c", allergies, sensitivities):
        treatment_title = "Niacinamide 5% Barrier Serum"
        treatment_ing = "Niacinamide 5%, Centella Asiatica"
        treatment_desc = "Soothes redness and brightens skin without acidic irritation."

    if has_acne:
        if acne_severity_change and acne_severity_change[0] == "High" and acne_severity_change[1] in ("Moderate", "Low"):
            treatment_title = "Gentle Niacinamide 5% & Zinc Clarifying Serum"
            treatment_ing = "Niacinamide 5%, Zinc PCA, Allantoin"
            treatment_desc = "Auto-adjusted: Severity improved from High to Moderate. Milder daily serum to soothe inflammation."
        else:
            treatment_title = "Targeted Clarifying Niacinamide & BHA Serum"
            treatment_ing = "Niacinamide 4%, Willow Bark Extract"
            treatment_desc = "Helps decongest pores and control excess daytime shine."

    morning_steps.append({
        "time_of_day": "morning",
        "step_order": 2,
        "category": "treatment",
        "category_icon": "💧",
        "step_title": treatment_title,
        "description": treatment_desc,
        "active_ingredients": treatment_ing,
        "frequency": "Daily (Morning)",
        "caution_notes": "Apply 3-4 drops evenly onto face before moisturization."
    })

    # Morning Step 3: Moisturizing 🧴
    if "oily" in skin_type.lower():
        moisturizer_title = "Ultra-Light Oil-Free Water Gel Moisturizer"
        moisturizer_desc = "Weightless hydration that hydrates without clogging pores or leaving shine."
        moisturizer_ing = "Hyaluronic Acid, Squalane, Aloe Vera"
    elif "dry" in skin_type.lower() or season == "Winter":
        moisturizer_title = "Intense Ceramide Barrier Cream"
        moisturizer_desc = "Rich soothing formula to seal in hydration and strengthen lipids."
        moisturizer_ing = "Ceramides AP/NP, Shea Butter, Peptides"
    else:
        moisturizer_title = "Daily Hydrating Fluid Cream"
        moisturizer_desc = "Balancing hydration to maintain soft, smooth skin texture all day."
        moisturizer_ing = "Glycerin, Panthenol, Hyaluronic Acid"

    morning_steps.append({
        "time_of_day": "morning",
        "step_order": 3,
        "category": "moisturizing",
        "category_icon": "🧴",
        "step_title": moisturizer_title,
        "description": moisturizer_desc,
        "active_ingredients": moisturizer_ing,
        "frequency": "Daily (Morning)",
        "caution_notes": "Smooth gently over face and neck."
    })

    # Morning Step 4: Sun Protection ☀️
    spf_title = "Broad-Spectrum Lightweight Sunscreen SPF 50+"
    spf_desc = "Essential UV defense against UVA/UVB photo-aging and dark spot aggravation."
    spf_ing = "Zinc Oxide, Titanium Dioxide, Vitamin E"
    if "oily" in skin_type.lower():
        spf_title = "Matte Finish Mineral Sunscreen Fluid SPF 50"
        spf_desc = "Oil-absorbing broad-spectrum UV protection with an invisible matte finish."

    morning_steps.append({
        "time_of_day": "morning",
        "step_order": 4,
        "category": "sun_protection",
        "category_icon": "☀️",
        "step_title": spf_title,
        "description": spf_desc,
        "active_ingredients": spf_ing,
        "frequency": "Daily (Morning)",
        "caution_notes": "Apply liberally 15 minutes before sun exposure. Reapply every 2-3 hours if outdoors."
    })

    # 3. Build Evening Steps
    evening_steps = []

    # Evening Step 1: Cleansing 🧼
    eve_cleanser_title = "Double Cleansing Botanical Cleansing Oil & Milk"
    eve_cleanser_desc = "Melt away SPF, makeup, and daily environmental pollutants before sleep."
    eve_cleanser_ing = "Jojoba Oil, Chamomile, Squalane"

    evening_steps.append({
        "time_of_day": "evening",
        "step_order": 1,
        "category": "cleansing",
        "category_icon": "🧼",
        "step_title": eve_cleanser_title,
        "description": eve_cleanser_desc,
        "active_ingredients": eve_cleanser_ing,
        "frequency": "Daily (Night)",
        "caution_notes": "Massage oil onto dry face first, emulsify with water, then rinse."
    })

    # Evening Step 2: Exfoliation ✨ (2-3x a week or gentle)
    if not is_sensitive:
        exfol_title = "BHA 2% Liquid Exfoliant"
        exfol_ing = "Salicylic Acid 2%, Green Tea"
        exfol_freq = "2-3x per week"
        if check_allergy("salicylic acid", allergies, sensitivities):
            exfol_title = "Lactic Acid 5% Mild AHA Exfoliant"
            exfol_ing = "Lactic Acid 5%, Hyaluronic Acid"

        if acne_severity_change and acne_severity_change[0] == "High" and acne_severity_change[1] in ("Moderate", "Low"):
            exfol_title = "Adjusted BHA 1% Gentle Exfoliating Liquid"
            exfol_ing = "Salicylic Acid 1%, Allantoin"
            exfol_freq = "2x per week (Wed, Sun)"
            exfol_notes = "Auto-adjusted: Severity decreased from High to Moderate. Frequency reduced to preserve skin barrier."
        else:
            exfol_notes = "Use on clean dry skin. Do not combine with Retinol on the same night."

        evening_steps.append({
            "time_of_day": "evening",
            "step_order": 2,
            "category": "exfoliation",
            "category_icon": "✨",
            "step_title": exfol_title,
            "description": "Unclogs pores, smooths bumpy texture, and removes dead skin cells.",
            "active_ingredients": exfol_ing,
            "frequency": exfol_freq,
            "caution_notes": exfol_notes
        })

    # Evening Step 3: Treatment 💧
    if has_aging or (has_acne and not is_sensitive):
        if check_allergy("retinol", allergies, sensitivities) or check_allergy("retinoid", allergies, sensitivities):
            eve_treat_title = "Bakuchiol 1% Botanical Firming Concentrate"
            eve_treat_ing = "Bakuchiol 1%, Squalane"
            eve_treat_desc = "Plant-derived natural Retinol alternative for gentle cell turnover."
        else:
            eve_treat_title = "Retinol 0.3% Cell Renewal Serum"
            eve_treat_ing = "Encapsulated Retinol 0.3%, Peptides"
            eve_treat_desc = "Accelerates skin cell turnover, reduces fine lines, and clears stubborn pores."
    elif has_pigmentation:
        eve_treat_title = "Tranexamic Acid & Alpha Arbutin Night Serum"
        eve_treat_ing = "Tranexamic Acid 3%, Alpha Arbutin 2%"
        eve_treat_desc = "Target dark spots and hyperpigmentation overnight while skin repairs."
    else:
        eve_treat_title = "Peptide Complex Repair Elixir"
        eve_treat_ing = "Copper Tripeptide-1, Matrixyl 3000"
        eve_treat_desc = "Supports collagen synthesis and skin elasticity during sleep cycles."

    evening_steps.append({
        "time_of_day": "evening",
        "step_order": len(evening_steps) + 1,
        "category": "treatment",
        "category_icon": "💧",
        "step_title": eve_treat_title,
        "description": eve_treat_desc,
        "active_ingredients": eve_treat_ing,
        "frequency": "Nightly or Alternate Nights",
        "caution_notes": "Start 2-3 times per week to build skin tolerance."
    })

    # Evening Step 4: Moisturizing 🧴
    eve_moist_title = "Overnight Lipid Repair Cream"
    eve_moist_desc = "Deeply nourishing nighttime moisturizer to repair moisture barrier."
    eve_moist_ing = "Ceramides, Fatty Acids, Cholesterol, Panthenol"

    evening_steps.append({
        "time_of_day": "evening",
        "step_order": len(evening_steps) + 1,
        "category": "moisturizing",
        "category_icon": "🧴",
        "step_title": eve_moist_title,
        "description": eve_moist_desc,
        "active_ingredients": eve_moist_ing,
        "frequency": "Nightly",
        "caution_notes": "Apply generously over face and neck as final layer or before sleeping mask."
    })

    # Evening Step 5: Night Care 🌙
    evening_steps.append({
        "time_of_day": "evening",
        "step_order": len(evening_steps) + 1,
        "category": "night_care",
        "category_icon": "🌙",
        "step_title": "Soothing Sleep Barrier Mask / Eye Care",
        "description": "Lock in overnight hydration and diminish under-eye fatigue.",
        "active_ingredients": "Caffeine Extract, Centella Asiatica, Hyaluronic Acid",
        "frequency": "Nightly",
        "caution_notes": "Pat gently around orbital bone using ring finger."
    })

    # 4. Build Weekly Treatment Plan 🗓️
    weekly_steps = [
        {
            "time_of_day": "weekly",
            "step_order": 1,
            "category": "exfoliation",
            "category_icon": "✨",
            "step_title": "Deep Detoxifying Kaolin Clay & Enzyme Mask",
            "description": "Purify clogged pores, draw out impurities, and balance skin oil production.",
            "active_ingredients": "Kaolin Clay, Papaya Enzyme, Zinc",
            "frequency": "1x per week (e.g. Sunday evening)",
            "caution_notes": "Leave on for 10 minutes max. Do not let clay fully crack on dry skin."
        },
        {
            "time_of_day": "weekly",
            "step_order": 2,
            "category": "moisturizing",
            "category_icon": "🧴",
            "step_title": "Intense Moisture Infusion Sheet Mask",
            "description": "Replenish skin hydration reservoirs and calm stressed skin barrier.",
            "active_ingredients": "Biocellulose, Centella, Triple Hyaluronic Acid",
            "frequency": "1-2x per week (Mid-week boost)",
            "caution_notes": "Apply for 15-20 minutes. Massage remaining serum into face and neck."
        }
    ]

    # 5. Build Seasonal Recommendations 🌿
    seasonal_recs = []
    if season == "Summer":
        seasonal_recs = [
            {
                "season": "Summer",
                "title": "Lightweight Textures & SPF Vigilance",
                "description": "Switch to water-based fluid creams and gel moisturizers to prevent clogged pores during humid weather.",
                "tip": "Keep sunscreen in your daily bag and reapply every 2 hours during outdoor activities."
            },
            {
                "season": "Summer",
                "title": "Antioxidant Shielding",
                "description": "Boost morning antioxidants like Vitamin C or Niacinamide to neutralize UV-generated free radicals.",
                "tip": "Store gel masks or mist toners in the refrigerator for cooling skin relief after sun exposure."
            }
        ]
    elif season == "Winter":
        seasonal_recs = [
            {
                "season": "Winter",
                "title": "Ceramide & Barrier Lipid Reinforcement",
                "description": "Cold weather and indoor heating deplete moisture. Upgrade to rich ceramide ointments and lipid creams.",
                "tip": "Avoid washing face with hot water; use tepid water to protect natural barrier oils."
            },
            {
                "season": "Winter",
                "title": "Humidifiers & Hydration Layering",
                "description": "Layer hydrating serums under occlusion creams to trap moisture effectively.",
                "tip": "Use a room humidifier at night to prevent trans-epidermal water loss."
            }
        ]
    elif season == "Spring":
        seasonal_recs = [
            {
                "season": "Spring",
                "title": "Gentle Detox & Transition",
                "description": "Gradually transition from heavy winter creams to lighter hydrating lotions as temperatures warm up.",
                "tip": "Exfoliate 1-2x per week to clear dead winter skin build-up and prep for bright spring weather."
            }
        ]
    else:  # Autumn
        seasonal_recs = [
            {
                "season": "Autumn",
                "title": "Post-Summer UV Repair & Barrier Strengthening",
                "description": "Target summer hyperpigmentation with brightening serums while introducing richer hydrating layers.",
                "tip": "Incorporate soothing ingredients like Panthenol and Ceramides before cold winter weather sets in."
            }
        ]

    return {
        "season": season,
        "adaptation_summary": adaptation_summary,
        "morning_steps": morning_steps,
        "evening_steps": evening_steps,
        "weekly_steps": weekly_steps,
        "seasonal_recommendations": seasonal_recs
    }
