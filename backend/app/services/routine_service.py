"""
Personalized Routine Generator.

Builds a rule-based morning / evening / weekly-treatment plan from
the user's skin profile and identified concerns. This is the
baseline "expert system" layer described in the architecture
(Routine Planner Service); it can later be swapped for a learned
recommender using the Recommendation Models in the AI/ML layer.
"""
from datetime import datetime
from typing import List, Dict, Any, Optional


CONCERN_TREATMENT_MAP = {
    "acne": {"ingredient": "Salicylic Acid", "category": "Treatment", "time": "evening"},
    "hyperpigmentation": {"ingredient": "Vitamin C", "category": "Treatment", "time": "morning"},
    "dark_spots": {"ingredient": "Niacinamide", "category": "Treatment", "time": "evening"},
    "dry_skin": {"ingredient": "Hyaluronic Acid", "category": "Moisturizing", "time": "both"},
    "oily_skin": {"ingredient": "Niacinamide", "category": "Treatment", "time": "morning"},
    "sensitive_skin": {"ingredient": "Ceramides", "category": "Moisturizing", "time": "both"},
    "wrinkles": {"ingredient": "Retinoid", "category": "Night Care", "time": "evening"},
    "fine_lines": {"ingredient": "Peptides", "category": "Night Care", "time": "evening"},
    "redness": {"ingredient": "Ceramides", "category": "Moisturizing", "time": "both"},
    "uneven_skin_tone": {"ingredient": "AHAs/BHAs", "category": "Exfoliation", "time": "evening"},
}


def _base_step(order: int, category: str, note: str, product_hint: str = "") -> Dict[str, Any]:
    return {"step": order, "category": category, "instruction": note, "product_suggestion": product_hint}


def generate_morning_routine(concerns: List[str], skin_type: str) -> List[Dict[str, Any]]:
    steps = [
        _base_step(1, "Cleansing", "Gentle cleanse to remove overnight buildup."),
        _base_step(2, "Toner", "Balance skin pH."),
    ]
    order = 3
    for concern in concerns:
        rule = CONCERN_TREATMENT_MAP.get(concern)
        if rule and rule["time"] in ("morning", "both"):
            steps.append(_base_step(order, rule["category"], f"Target {concern.replace('_',' ')}.", rule["ingredient"]))
            order += 1
    steps.append(_base_step(order, "Moisturizing", "Lock in hydration."))
    steps.append(_base_step(order + 1, "Sun Protection", "Apply SPF 30+ broad spectrum sunscreen. Non-negotiable."))
    return steps


def generate_evening_routine(concerns: List[str], skin_type: str) -> List[Dict[str, Any]]:
    steps = [
        _base_step(1, "Cleansing", "Double cleanse to remove sunscreen/makeup/pollutants."),
    ]
    order = 2
    for concern in concerns:
        rule = CONCERN_TREATMENT_MAP.get(concern)
        if rule and rule["time"] in ("evening", "both"):
            steps.append(_base_step(order, rule["category"], f"Target {concern.replace('_',' ')}.", rule["ingredient"]))
            order += 1
    steps.append(_base_step(order, "Night Care", "Apply night moisturizer/repair cream."))
    return steps


def generate_weekly_treatments(concerns: List[str]) -> List[Dict[str, Any]]:
    treatments = []
    if "acne" in concerns or "oily_skin" in concerns:
        treatments.append({"day": "Tue/Fri", "treatment": "Clay mask", "purpose": "Oil & congestion control"})
    if "dry_skin" in concerns or "sensitive_skin" in concerns:
        treatments.append({"day": "Wed", "treatment": "Hydrating sheet mask", "purpose": "Deep hydration"})
    if "uneven_skin_tone" in concerns or "dark_spots" in concerns:
        treatments.append({"day": "Sat", "treatment": "AHA/BHA exfoliation", "purpose": "Cell turnover, brightening"})
    if not treatments:
        treatments.append({"day": "Sun", "treatment": "Gentle exfoliation", "purpose": "General maintenance"})
    return treatments


# --- Seasonal logic -------------------------------------------------------
# Northern-hemisphere month->season mapping. If you have users in the
# Southern hemisphere, flip this (or store hemisphere on the profile and
# branch on it) -- flagged here rather than silently assumed.

def determine_current_season(month: Optional[int] = None) -> str:
    m = month or datetime.utcnow().month
    if m in (12, 1, 2):
        return "winter"
    if m in (3, 4, 5):
        return "spring"
    if m in (6, 7, 8):
        return "summer"
    return "fall"


def apply_seasonal_adjustments(
    morning: List[Dict[str, Any]],
    evening: List[Dict[str, Any]],
    weekly: List[Dict[str, Any]],
    season: str,
    environmental_exposure: str,
) -> None:
    """Mutates morning/evening/weekly in place based on season + exposure."""

    if season == "winter":
        for step in morning + evening:
            if step["category"] == "Moisturizing":
                step["instruction"] += (
                    " Winter note: switch to a richer, more emollient moisturizer -- "
                    "indoor heating and cold air strip moisture faster this time of year."
                )
        for w in weekly:
            if "exfoli" in w["treatment"].lower():
                w["purpose"] += " (reduced to once weekly in winter to protect the barrier)"

    elif season == "summer":
        for step in morning:
            if step["category"] == "Sun Protection":
                step["instruction"] += " Summer note: reapply every 2 hours if outdoors; consider SPF 50+."
        weekly.append({
            "day": "As needed",
            "treatment": "Oil-blotting sheets / mattifying toner",
            "purpose": "Heat and humidity increase oil production in summer",
        })

    if environmental_exposure == "high":
        for step in morning:
            if step["category"] == "Sun Protection":
                step["instruction"] += (
                    " High environmental exposure detected: prioritize reapplication and "
                    "pair with an antioxidant serum (Vitamin C) to counter pollution damage."
                )


def generate_full_routine(
    skin_type: str,
    concerns: List[str],
    environmental_exposure: str,
    month: Optional[int] = None,
) -> dict:
    morning = generate_morning_routine(concerns, skin_type)
    evening = generate_evening_routine(concerns, skin_type)
    weekly = generate_weekly_treatments(concerns)
    season = determine_current_season(month)

    apply_seasonal_adjustments(morning, evening, weekly, season, environmental_exposure)

    return {
        "morning_routine": morning,
        "evening_routine": evening,
        "weekly_treatments": weekly,
        "season": season,
    }