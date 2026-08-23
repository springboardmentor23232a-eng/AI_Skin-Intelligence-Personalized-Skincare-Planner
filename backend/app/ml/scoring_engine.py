"""
Rule-based skin health scoring, concern identification, risk analysis,
and routine generation. Combines the ML skin-type prediction (when an
image is supplied) with the user's SkinProfile lifestyle data to produce
an explainable weighted score, as specified in the project brief:

Skin Health Score =
    Skin Condition Assessment (35%) +
    Lifestyle Habits          (20%) +
    Sleep Quality             (15%) +
    Routine Consistency       (20%) +
    Hydration Level           (10%)
"""
from typing import Optional


def _condition_score_from_image_features(features: Optional[dict]) -> float:
    """0-100 score derived from image features; higher = healthier skin."""
    if not features:
        return 65.0  # neutral default when no image supplied
    score = 100.0
    # High redness -> irritation
    if features["redness"] > 0.40:
        score -= 20
    elif features["redness"] > 0.36:
        score -= 10
    # Excess oil sheen -> imbalance
    if features["oil_sheen_ratio"] > 0.15:
        score -= 10
    # High texture variance -> roughness/dryness/uneven texture
    if features["texture_variance"] > 150:
        score -= 15
    elif features["texture_variance"] > 110:
        score -= 7
    # Low brightness -> dullness
    if features["brightness"] < 130:
        score -= 10
    # High edge density -> visible pores/fine lines/texture
    if features["edge_density"] > 0.10:
        score -= 8
    return max(0.0, min(100.0, score))


def _lifestyle_score(profile) -> float:
    if not profile or not profile.lifestyle_habits:
        return 60.0
    habits = [h.strip().lower() for h in profile.lifestyle_habits.split(",") if h.strip()]
    score = 80.0
    negative = {"smoking", "alcohol", "high stress", "junk food", "no exercise", "poor diet"}
    positive = {"exercise", "balanced diet", "no smoking", "low stress", "healthy diet"}
    for h in habits:
        if h in negative:
            score -= 12
        elif h in positive:
            score += 6
    return max(0.0, min(100.0, score))


def _sleep_score(profile) -> float:
    if not profile or profile.sleep_quality is None:
        return 60.0
    return max(0.0, min(100.0, profile.sleep_quality * 10))


def _routine_consistency_score(adherence_pct: Optional[float]) -> float:
    if adherence_pct is None:
        return 60.0  # neutral default for a brand-new user
    return max(0.0, min(100.0, adherence_pct))


def _hydration_score(profile) -> float:
    if not profile:
        return 60.0
    if profile.hydration_level is not None:
        return max(0.0, min(100.0, profile.hydration_level * 10))
    if profile.water_intake_liters is not None:
        # 2.5L/day considered ideal baseline
        return max(0.0, min(100.0, (profile.water_intake_liters / 2.5) * 100))
    return 60.0


def compute_skin_health_score(
    profile=None,
    image_features: Optional[dict] = None,
    routine_adherence_pct: Optional[float] = None,
) -> dict:
    condition = _condition_score_from_image_features(image_features)
    lifestyle = _lifestyle_score(profile)
    sleep = _sleep_score(profile)
    routine = _routine_consistency_score(routine_adherence_pct)
    hydration = _hydration_score(profile)

    total = (
        condition * 0.35
        + lifestyle * 0.20
        + sleep * 0.15
        + routine * 0.20
        + hydration * 0.10
    )
    total = round(total, 2)

    if total >= 80:
        overall = "Excellent"
    elif total >= 65:
        overall = "Good"
    elif total >= 45:
        overall = "Fair"
    else:
        overall = "Needs Attention"

    return {
        "skin_health_score": total,
        "overall_condition": overall,
        "breakdown": {
            "skin_condition_assessment": round(condition, 2),
            "lifestyle_habits": round(lifestyle, 2),
            "sleep_quality": round(sleep, 2),
            "routine_consistency": round(routine, 2),
            "hydration_level": round(hydration, 2),
        },
    }


def identify_concerns(image_features: Optional[dict], profile=None, manual_concerns=None) -> list:
    """Returns list of dicts: {concern_name, severity, priority}"""
    concerns = []

    if image_features:
        if image_features["redness"] > 0.40:
            concerns.append({"concern_name": "Redness", "severity": "high"})
        elif image_features["redness"] > 0.36:
            concerns.append({"concern_name": "Redness", "severity": "moderate"})

        if image_features["oil_sheen_ratio"] > 0.15:
            concerns.append({"concern_name": "Oily Skin", "severity": "high"})
        elif image_features["oil_sheen_ratio"] > 0.10:
            concerns.append({"concern_name": "Oily Skin", "severity": "moderate"})

        if image_features["texture_variance"] > 150:
            concerns.append({"concern_name": "Dry Skin / Rough Texture", "severity": "high"})
        elif image_features["texture_variance"] > 110:
            concerns.append({"concern_name": "Dry Skin / Rough Texture", "severity": "moderate"})

        if image_features["brightness"] < 130:
            concerns.append({"concern_name": "Dullness / Uneven Skin Tone", "severity": "moderate"})

        if image_features["edge_density"] > 0.10:
            concerns.append({"concern_name": "Fine Lines / Visible Pores", "severity": "moderate"})

        if image_features["saturation"] > 115:
            concerns.append({"concern_name": "Hyperpigmentation / Dark Spots", "severity": "moderate"})

    if profile and profile.skin_type == "sensitive":
        concerns.append({"concern_name": "Sensitive Skin", "severity": "moderate"})

    if manual_concerns:
        for c in manual_concerns:
            concerns.append({"concern_name": c, "severity": "moderate"})

    # De-duplicate by concern_name, keep highest severity
    severity_rank = {"low": 1, "moderate": 2, "high": 3}
    dedup = {}
    for c in concerns:
        name = c["concern_name"]
        if name not in dedup or severity_rank[c["severity"]] > severity_rank[dedup[name]["severity"]]:
            dedup[name] = c

    # Assign priority (1 = highest) sorted by severity desc
    sorted_concerns = sorted(dedup.values(), key=lambda x: -severity_rank[x["severity"]])
    for i, c in enumerate(sorted_concerns, start=1):
        c["priority"] = i

    return sorted_concerns


def analyze_risk_factors(profile=None, image_features: Optional[dict] = None) -> list:
    risks = []
    if profile:
        if profile.sleep_quality is not None and profile.sleep_quality <= 4:
            risks.append({
                "risk_name": "Poor Sleep",
                "description": "Low sleep quality can accelerate skin aging and impair barrier repair.",
                "risk_level": "high",
            })
        if profile.water_intake_liters is not None and profile.water_intake_liters < 1.5:
            risks.append({
                "risk_name": "Dehydration",
                "description": "Low water intake can lead to dry, dull skin.",
                "risk_level": "medium",
            })
        if profile.environmental_exposure and "high uv" in profile.environmental_exposure.lower():
            risks.append({
                "risk_name": "UV Exposure",
                "description": "High UV exposure increases risk of pigmentation and premature aging.",
                "risk_level": "high",
            })
        if profile.environmental_exposure and "pollution" in profile.environmental_exposure.lower():
            risks.append({
                "risk_name": "Pollution Exposure",
                "description": "High pollution exposure can contribute to oxidative stress and dullness.",
                "risk_level": "medium",
            })
        if profile.lifestyle_habits and "smoking" in profile.lifestyle_habits.lower():
            risks.append({
                "risk_name": "Smoking",
                "description": "Smoking reduces skin elasticity and accelerates aging.",
                "risk_level": "high",
            })
    if image_features and image_features["redness"] > 0.42:
        risks.append({
            "risk_name": "Skin Barrier Irritation",
            "description": "Elevated redness detected; consider gentle, fragrance-free products.",
            "risk_level": "high",
        })
    return risks


# ---------------------------------------------------------------------------
# ROUTINE GENERATION
# ---------------------------------------------------------------------------
BASE_MORNING_STEPS = [
    ("cleansing", "Cleanse with a gentle, pH-balanced face wash."),
    ("treatment", "Apply a targeted serum for your primary concern."),
    ("moisturizing", "Apply a lightweight, skin-type-appropriate moisturizer."),
    ("sun_protection", "Apply broad-spectrum SPF 30+ sunscreen."),
]

BASE_EVENING_STEPS = [
    ("cleansing", "Double cleanse to remove sunscreen/makeup and impurities."),
    ("exfoliation", "Exfoliate 2-3x/week with a gentle AHA/BHA (skip if irritated)."),
    ("treatment", "Apply night treatment serum (e.g. retinoid or niacinamide)."),
    ("night_care", "Apply a nourishing night cream or facial oil."),
]


def generate_routine_steps(routine_type: str, skin_type: Optional[str], concerns: list) -> list:
    """Returns ordered list of {category, instruction} adapted to skin type & concerns."""
    concern_names = {c["concern_name"].lower() for c in concerns}
    steps = list(BASE_MORNING_STEPS if routine_type == "morning" else BASE_EVENING_STEPS)

    adapted = []
    for category, instruction in steps:
        text = instruction
        if skin_type == "oily" and category == "moisturizing":
            text = "Apply an oil-free, gel-based moisturizer to control shine."
        elif skin_type == "dry" and category == "moisturizing":
            text = "Apply a rich, ceramide-based moisturizer to restore the skin barrier."
        elif skin_type == "sensitive" and category == "cleansing":
            text = "Cleanse with a fragrance-free, sulfate-free gentle cleanser."

        if "oily skin" in concern_names and category == "treatment":
            text += " Consider a niacinamide or salicylic acid serum to control oil."
        if "redness" in concern_names and category == "treatment":
            text += " Look for centella asiatica or azelaic acid to calm redness."
        if "hyperpigmentation" in " ".join(concern_names) and category == "treatment":
            text += " Vitamin C or alpha arbutin can help even skin tone."
        if "dry skin" in " ".join(concern_names) and category == "treatment":
            text += " Hyaluronic acid can boost hydration."

        adapted.append({"category": category, "instruction": text})

    return adapted
