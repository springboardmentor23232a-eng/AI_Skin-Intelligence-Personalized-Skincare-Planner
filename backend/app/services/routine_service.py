"""
Personalized Routine Generator.

Generates a skincare routine based on:
- Skin type
- Skin concerns
- Concern severity
- Skin health / condition score
- Allergies
- Sensitivities
- Lifestyle
- Environmental exposure
- Current season
- Latest assessment results

This is a transparent rule-based personalization layer.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional


# ---------------------------------------------------------------------------
# Concern -> Treatment Mapping
# ---------------------------------------------------------------------------

CONCERN_TREATMENT_MAP = {
    "acne": {
        "ingredient": "Salicylic Acid",
        "category": "Treatment",
        "time": "evening",
    },
    "hyperpigmentation": {
        "ingredient": "Vitamin C",
        "category": "Treatment",
        "time": "morning",
    },
    "dark_spots": {
        "ingredient": "Niacinamide",
        "category": "Treatment",
        "time": "evening",
    },
    "dry_skin": {
        "ingredient": "Hyaluronic Acid",
        "category": "Moisturizing",
        "time": "both",
    },
    "oily_skin": {
        "ingredient": "Niacinamide",
        "category": "Treatment",
        "time": "morning",
    },
    "sensitive_skin": {
        "ingredient": "Ceramides",
        "category": "Moisturizing",
        "time": "both",
    },
    "wrinkles": {
        "ingredient": "Retinoid",
        "category": "Night Care",
        "time": "evening",
    },
    "fine_lines": {
        "ingredient": "Peptides",
        "category": "Night Care",
        "time": "evening",
    },
    "redness": {
        "ingredient": "Ceramides",
        "category": "Moisturizing",
        "time": "both",
    },
    "uneven_skin_tone": {
        "ingredient": "AHAs/BHAs",
        "category": "Exfoliation",
        "time": "evening",
    },
}


# ---------------------------------------------------------------------------
# Safer alternatives when an ingredient is blocked
# ---------------------------------------------------------------------------

INGREDIENT_ALTERNATIVES = {
    "salicylic_acid": [
        "Azelaic Acid",
        "Niacinamide",
        "Ceramides",
    ],
    "vitamin_c": [
        "Niacinamide",
        "Peptides",
        "Ceramides",
    ],
    "niacinamide": [
        "Azelaic Acid",
        "Ceramides",
    ],
    "retinoid": [
        "Peptides",
        "Ceramides",
    ],
    "ahas/bhas": [
        "Niacinamide",
        "Ceramides",
    ],
    "hyaluronic_acid": [
        "Ceramides",
    ],
}


# ---------------------------------------------------------------------------
# Skin Type Rules
# ---------------------------------------------------------------------------

SKIN_TYPE_RULES = {
    "oily": {
        "cleanser": "Use a gentle foaming or gel cleanser.",
        "moisturizer": "Use a lightweight, non-comedogenic moisturizer.",
    },
    "dry": {
        "cleanser": "Use a gentle hydrating cleanser.",
        "moisturizer": "Use a richer barrier-supporting moisturizer.",
    },
    "combination": {
        "cleanser": "Use a gentle balanced cleanser.",
        "moisturizer": (
            "Use a lightweight moisturizer, adding extra hydration "
            "to dry areas."
        ),
    },
    "sensitive": {
        "cleanser": "Use a fragrance-free gentle cleanser.",
        "moisturizer": (
            "Use a fragrance-free barrier-supporting moisturizer."
        ),
    },
    "normal": {
        "cleanser": "Use a gentle cleanser.",
        "moisturizer": "Use a lightweight hydrating moisturizer.",
    },
}


# ---------------------------------------------------------------------------
# Severity Rules
# ---------------------------------------------------------------------------

SEVERITY_NOTES = {
    "mild": (
        "Use a simple routine and introduce active ingredients gradually."
    ),
    "moderate": (
        "Prioritize targeted treatment while maintaining skin barrier support."
    ),
    "severe": (
        "Keep the routine simple and avoid layering multiple strong active "
        "treatments."
    ),
    "very severe": (
        "Keep the routine gentle and minimal; consider professional "
        "dermatological evaluation."
    ),
}


# ---------------------------------------------------------------------------
# Helper Functions
# ---------------------------------------------------------------------------

def _base_step(
    order: int,
    category: str,
    note: str,
    product_hint: str = "",
) -> Dict[str, Any]:
    return {
        "step": order,
        "category": category,
        "instruction": note,
        "product_suggestion": product_hint,
    }


def _normalize_values(
    values: Optional[List[str]],
) -> List[str]:
    return [
        str(value).strip().lower().replace(" ", "_")
        for value in (values or [])
        if value
    ]


def _normalize_single(value: str) -> str:
    return (
        str(value)
        .strip()
        .lower()
        .replace(" ", "_")
    )


def _has_sensitive_profile(
    skin_type: str,
    concerns: List[str],
    sensitivities: List[str],
) -> bool:

    sensitive_values = {
        "sensitive",
        "sensitive_skin",
        "fragrance",
        "irritation",
        "irritation_prone",
    }

    return (
        skin_type == "sensitive"
        or "sensitive_skin" in concerns
        or bool(set(sensitivities) & sensitive_values)
    )


def _is_blocked(
    ingredient: str,
    blocked_ingredients: set,
) -> bool:

    if not ingredient:
        return False

    ingredient_key = _normalize_single(ingredient)

    for blocked in blocked_ingredients:
        blocked_key = _normalize_single(blocked)

        if (
            ingredient_key == blocked_key
            or blocked_key in ingredient_key
            or ingredient_key in blocked_key
        ):
            return True

    return False


def _safe_ingredient(
    preferred: str,
    blocked_ingredients: set,
) -> str:

    if not preferred:
        return ""

    if not _is_blocked(preferred, blocked_ingredients):
        return preferred

    preferred_key = _normalize_single(preferred)

    alternatives = INGREDIENT_ALTERNATIVES.get(
        preferred_key,
        ["Ceramides"],
    )

    for alternative in alternatives:
        if not _is_blocked(
            alternative,
            blocked_ingredients,
        ):
            return alternative

    return ""


def _severity_rank(
    concern_severity: Dict[str, str],
) -> int:

    ranks = {
        "mild": 1,
        "moderate": 2,
        "severe": 3,
        "very severe": 4,
    }

    highest = 1

    for severity in concern_severity.values():
        rank = ranks.get(
            str(severity).lower(),
            1,
        )

        highest = max(highest, rank)

    return highest


# ---------------------------------------------------------------------------
# Morning Routine
# ---------------------------------------------------------------------------

def generate_morning_routine(
    concerns: List[str],
    skin_type: str,
    sensitivities: Optional[List[str]] = None,
    environmental_exposure: str = "moderate",
    condition_score: Optional[float] = None,
    concern_severity: Optional[Dict[str, str]] = None,
    blocked_ingredients: Optional[set] = None,
) -> List[Dict[str, Any]]:

    skin_type = _normalize_single(skin_type or "normal")

    concerns = _normalize_values(concerns)
    sensitivities = _normalize_values(sensitivities)

    concern_severity = concern_severity or {}
    blocked_ingredients = blocked_ingredients or set()

    skin_rules = SKIN_TYPE_RULES.get(
        skin_type,
        SKIN_TYPE_RULES["normal"],
    )

    sensitive = _has_sensitive_profile(
        skin_type,
        concerns,
        sensitivities,
    )

    steps = []

    # -------------------------------------------------------
    # 1. Cleansing
    # -------------------------------------------------------

    steps.append(
        _base_step(
            1,
            "Cleansing",
            skin_rules["cleanser"],
        )
    )

    order = 2

    # -------------------------------------------------------
    # 2. Morning treatment
    # -------------------------------------------------------

    # Low condition score or severe concerns:
    # keep active treatments minimal.
    max_active_treatments = 1

    if condition_score is not None and condition_score < 40:
        max_active_treatments = 0

    if _severity_rank(concern_severity) >= 3:
        max_active_treatments = min(max_active_treatments, 1)

    # Sensitive skin gets a gentler routine.
    if sensitive:
        max_active_treatments = min(max_active_treatments, 1)

    active_count = 0
    used_ingredients = set()

    # Prioritize concerns according to severity.
    sorted_concerns = sorted(
        concerns,
        key=lambda c: {
            "very severe": 4,
            "severe": 3,
            "moderate": 2,
            "mild": 1,
        }.get(
            str(concern_severity.get(c, "mild")).lower(),
            1,
        ),
        reverse=True,
    )

    for concern in sorted_concerns:

        if active_count >= max_active_treatments:
            break

        rule = CONCERN_TREATMENT_MAP.get(concern)

        if not rule:
            continue

        if rule["time"] not in ("morning", "both"):
            continue

        if rule["category"] in ("Exfoliation", "Moisturizing"):
            continue

        # Avoid strong active treatment for sensitive skin
        if sensitive and rule["ingredient"] in {
            "Vitamin C",
            "AHAs/BHAs",
        }:
            continue

        ingredient = _safe_ingredient(
            rule["ingredient"],
            blocked_ingredients,
        )

        if not ingredient:
            continue

        # Do not add duplicate ingredients
        ingredient_key = _normalize_single(ingredient)

        if ingredient_key in used_ingredients:
            continue

        used_ingredients.add(ingredient_key)

        severity = str(
            concern_severity.get(concern, "mild")
        ).lower()

        instruction = (
            f"Target {concern.replace('_', ' ')}."
        )

        if severity in ("severe", "very severe"):
            instruction += (
                " Use conservatively and avoid combining "
                "multiple strong active treatments."
            )

        steps.append(
            _base_step(
                order,
                rule["category"],
                instruction,
                ingredient,
            )
        )

        order += 1
        active_count += 1

    # -------------------------------------------------------
    # 3. Moisturizing
    # -------------------------------------------------------

    moisturizer_hint = ""

    if skin_type == "dry" or "dry_skin" in concerns:
        moisturizer_hint = "Hyaluronic Acid + Ceramides"

    elif sensitive or "sensitive_skin" in concerns:
        moisturizer_hint = "Ceramides"

    elif skin_type == "oily" or "oily_skin" in concerns:
        moisturizer_hint = "Lightweight non-comedogenic moisturizer"

    steps.append(
        _base_step(
            order,
            "Moisturizing",
            skin_rules["moisturizer"],
            moisturizer_hint,
        )
    )

    order += 1

    # -------------------------------------------------------
    # 4. Sun Protection
    # -------------------------------------------------------

    if environmental_exposure == "high":
        sunscreen_note = (
            "Apply broad-spectrum SPF 50+ sunscreen and "
            "reapply regularly when outdoors because of "
            "high sun/pollution exposure."
        )
    else:
        sunscreen_note = (
            "Apply broad-spectrum SPF 30+ sunscreen."
        )

    steps.append(
        _base_step(
            order,
            "Sun Protection",
            sunscreen_note,
        )
    )

    return steps


# ---------------------------------------------------------------------------
# Evening Routine
# ---------------------------------------------------------------------------

def generate_evening_routine(
    concerns: List[str],
    skin_type: str,
    sensitivities: Optional[List[str]] = None,
    concern_severity: Optional[Dict[str, str]] = None,
    condition_score: Optional[float] = None,
    blocked_ingredients: Optional[set] = None,
) -> List[Dict[str, Any]]:

    skin_type = _normalize_single(skin_type or "normal")

    concerns = _normalize_values(concerns)
    sensitivities = _normalize_values(sensitivities)

    concern_severity = concern_severity or {}
    blocked_ingredients = blocked_ingredients or set()

    skin_rules = SKIN_TYPE_RULES.get(
        skin_type,
        SKIN_TYPE_RULES["normal"],
    )

    sensitive = _has_sensitive_profile(
        skin_type,
        concerns,
        sensitivities,
    )

    steps = []

    # -------------------------------------------------------
    # 1. Cleansing
    # -------------------------------------------------------

    steps.append(
        _base_step(
            1,
            "Cleansing",
            (
                "Gently cleanse to remove sunscreen, makeup, "
                "pollutants and daily buildup."
            ),
        )
    )

    order = 2

    # -------------------------------------------------------
    # 2. Exfoliation
    # -------------------------------------------------------

    should_exfoliate = (
        not sensitive
        and (
            "uneven_skin_tone" in concerns
            or "oily_skin" in concerns
        )
    )

    if condition_score is not None and condition_score < 40:
        should_exfoliate = False

    if _severity_rank(concern_severity) >= 3:
        should_exfoliate = False

    if should_exfoliate:

        exfoliant = _safe_ingredient(
            "AHAs/BHAs",
            blocked_ingredients,
        )

        if exfoliant:

            steps.append(
                _base_step(
                    order,
                    "Exfoliation",
                    (
                        "Use gentle exfoliation occasionally "
                        "according to skin tolerance. Avoid "
                        "over-exfoliation."
                    ),
                    exfoliant,
                )
            )

            order += 1

    # -------------------------------------------------------
    # 3. Evening treatment
    # -------------------------------------------------------

    max_active_treatments = 1

    if condition_score is not None and condition_score < 40:
        max_active_treatments = 0

    if _severity_rank(concern_severity) >= 3:
        max_active_treatments = 1

    if sensitive:
        max_active_treatments = min(
            max_active_treatments,
            1,
        )

    active_count = 0
    used_ingredients = set()

    sorted_concerns = sorted(
        concerns,
        key=lambda c: {
            "very severe": 4,
            "severe": 3,
            "moderate": 2,
            "mild": 1,
        }.get(
            str(concern_severity.get(c, "mild")).lower(),
            1,
        ),
        reverse=True,
    )

    for concern in sorted_concerns:

        if active_count >= max_active_treatments:
            break

        rule = CONCERN_TREATMENT_MAP.get(concern)

        if not rule:
            continue

        if rule["time"] not in ("evening", "both"):
            continue

        if rule["category"] in ("Exfoliation", "Moisturizing"):
            continue

        # Avoid retinoid/strong actives for sensitive profiles
        if sensitive and rule["ingredient"] in {
            "Retinoid",
            "AHAs/BHAs",
        }:
            continue

        ingredient = _safe_ingredient(
            rule["ingredient"],
            blocked_ingredients,
        )

        if not ingredient:
            continue

        ingredient_key = _normalize_single(ingredient)

        if ingredient_key in used_ingredients:
            continue

        used_ingredients.add(ingredient_key)

        severity = str(
            concern_severity.get(
                concern,
                "mild",
            )
        ).lower()

        instruction = (
            f"Target {concern.replace('_', ' ')}."
        )

        if severity in ("severe", "very severe"):
            instruction += (
                " Keep treatment frequency conservative "
                "and avoid combining multiple strong "
                "active treatments."
            )

        steps.append(
            _base_step(
                order,
                rule["category"],
                instruction,
                ingredient,
            )
        )

        order += 1
        active_count += 1

    # -------------------------------------------------------
    # 4. Moisturizing
    # -------------------------------------------------------

    moisturizer_hint = ""

    if skin_type == "dry" or "dry_skin" in concerns:
        moisturizer_hint = "Hyaluronic Acid + Ceramides"

    elif sensitive or "sensitive_skin" in concerns:
        moisturizer_hint = "Ceramides"

    elif skin_type == "oily" or "oily_skin" in concerns:
        moisturizer_hint = "Lightweight non-comedogenic moisturizer"

    steps.append(
        _base_step(
            order,
            "Moisturizing",
            skin_rules["moisturizer"],
            moisturizer_hint,
        )
    )

    order += 1

    # -------------------------------------------------------
    # 5. Night Care
    # -------------------------------------------------------

    steps.append(
        _base_step(
            order,
            "Night Care",
            (
                "Apply a suitable night moisturizer or "
                "barrier-repair cream."
            ),
        )
    )

    return steps
    

# ---------------------------------------------------------------------------
# Weekly Treatments
# ---------------------------------------------------------------------------

def generate_weekly_treatments(
    concerns: List[str],
    skin_type: str,
    sensitivities: Optional[List[str]] = None,
    concern_severity: Optional[Dict[str, str]] = None,
    condition_score: Optional[float] = None,
) -> List[Dict[str, Any]]:

    concerns = _normalize_values(concerns)
    sensitivities = _normalize_values(sensitivities)

    concern_severity = concern_severity or {}

    treatments = []

    sensitive = _has_sensitive_profile(
        skin_type,
        concerns,
        sensitivities,
    )

    # Low score -> focus on recovery instead of aggressive treatments
    if condition_score is not None and condition_score < 40:
        return [
            {
                "day": "As needed",
                "treatment": "Barrier-support / recovery care",
                "purpose": (
                    "Keep the routine simple and focus on gentle "
                    "hydration and skin barrier support."
                ),
            }
        ]

    # Acne / oily skin
    if (
    ("acne" in concerns or "oily_skin" in concerns)
    and not sensitive
):
        treatments.append(
            {
                "day": "Tue/Fri",
                "treatment": "Oil-control / clay mask",
                "purpose": (
                    "Help manage excess oil and congestion."
                ),
            }
        )

    # Dry / sensitive skin
    if "dry_skin" in concerns or "sensitive_skin" in concerns:
        treatments.append(
            {
                "day": "Wed",
                "treatment": "Hydrating treatment",
                "purpose": (
                    "Support hydration and skin barrier."
                ),
            }
        )

    # Hyperpigmentation / dark spots
    if (
        "hyperpigmentation" in concerns
        or "dark_spots" in concerns
    ):
        treatments.append(
            {
                "day": "Sat",
                "treatment": "Brightening treatment",
                "purpose": (
                    "Support more even-looking skin tone."
                ),
            }
        )

    # Uneven skin tone
    if (
        "uneven_skin_tone" in concerns
        and not sensitive
    ):
        treatments.append(
            {
                "day": "Sun",
                "treatment": "Gentle exfoliation",
                "purpose": (
                    "Support surface cell turnover."
                ),
            }
        )

    # Severe concern -> recovery day
    severe_exists = any(
        str(concern_severity.get(c, "")).lower()
        in ("severe", "very severe")
        for c in concerns
    )

    if severe_exists:
        treatments.append(
            {
                "day": "As needed",
                "treatment": "Barrier-support / recovery day",
                "purpose": (
                    "Keep the routine simple and focus on skin "
                    "barrier support."
                ),
            }
        )

    if not treatments:
        treatments.append(
            {
                "day": "Sun",
                "treatment": "Gentle maintenance",
                "purpose": (
                    "General skin maintenance and hydration."
                ),
            }
        )

    return treatments


# ---------------------------------------------------------------------------
# Seasonal Logic
# ---------------------------------------------------------------------------

def determine_current_season(
    month: Optional[int] = None,
) -> str:

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

    if season == "winter":

        for step in morning + evening:
            if step["category"] == "Moisturizing":
                step["instruction"] += (
                    " Winter recommendation: use a richer "
                    "moisturizer to support the skin barrier."
                )

        weekly.append(
            {
                "day": "As needed",
                "treatment": "Barrier hydration",
                "purpose": (
                    "Extra hydration during colder, drier weather."
                ),
            }
        )

    elif season == "spring":

        weekly.append(
            {
                "day": "As needed",
                "treatment": "Gentle skin reset",
                "purpose": (
                    "Maintain balanced cleansing and hydration."
                ),
            }
        )

    elif season == "summer":

        for step in morning:
            if step["category"] == "Sun Protection":
                step["instruction"] += (
                    " Summer recommendation: reapply sunscreen "
                    "every 2 hours when outdoors."
                )

        weekly.append(
            {
                "day": "As needed",
                "treatment": "Oil-control care",
                "purpose": (
                    "Help manage increased oil from heat and humidity."
                ),
            }
        )

    elif season == "fall":

        weekly.append(
            {
                "day": "As needed",
                "treatment": "Hydration and barrier care",
                "purpose": (
                    "Prepare skin for drier weather."
                ),
            }
        )

    if environmental_exposure == "high":

        for step in morning:
            if step["category"] == "Sun Protection":
                step["instruction"] += (
                    " High environmental exposure: prioritize "
                    "consistent sunscreen use and outdoor protection."
                )


# ---------------------------------------------------------------------------
# Lifestyle Adjustments
# ---------------------------------------------------------------------------

def lifestyle_recommendations(
    lifestyle_habits: Optional[List[str]] = None,
    sleep_quality: Optional[str] = None,
    sleep_hours: Optional[float] = None,
    water_intake_liters: Optional[float] = None,
) -> List[str]:

    habits = _normalize_values(lifestyle_habits)

    recommendations = []

    if sleep_quality:
        quality = sleep_quality.lower()

        if quality == "poor":
            recommendations.append(
                "Lifestyle note: prioritize a consistent sleep routine "
                "and adequate rest."
            )

    if sleep_hours is not None and sleep_hours < 6:
        recommendations.append(
            "Lifestyle note: maintain a more consistent sleep schedule."
        )

    if water_intake_liters is not None and water_intake_liters < 1.5:
        recommendations.append(
            "Lifestyle note: maintain regular hydration throughout "
            "the day."
        )

    if "high_stress" in habits or "stress" in habits:
        recommendations.append(
            "Lifestyle note: include stress-management and recovery "
            "habits alongside the skincare routine."
        )

    if "smoking" in habits:
        recommendations.append(
            "Lifestyle note: reducing smoking can support overall "
            "skin-health goals."
        )

    if "outdoor_exposure" in habits:
        recommendations.append(
            "Lifestyle note: use consistent sun protection during "
            "outdoor activities."
        )

    return recommendations


# ---------------------------------------------------------------------------
# Seasonal Recommendation
# ---------------------------------------------------------------------------

def seasonal_recommendation(
    season: str,
    skin_type: str,
) -> str:

    recommendations = {
        "winter": (
            "Focus on hydration and barrier support. "
            "Avoid excessive cleansing and exfoliation."
        ),
        "spring": (
            "Maintain gentle cleansing, hydration and "
            "consistent sun protection."
        ),
        "summer": (
            "Prioritize lightweight hydration, oil control "
            "and consistent sunscreen reapplication."
        ),
        "fall": (
            "Gradually increase hydration and support the "
            "skin barrier as weather becomes drier."
        ),
    }

    return recommendations.get(
        season,
        "Maintain gentle cleansing, hydration and sun protection.",
    )


# ---------------------------------------------------------------------------
# Full Routine Generator
# ---------------------------------------------------------------------------

def generate_full_routine(
    skin_type: str,
    concerns: List[str],
    environmental_exposure: str,
    allergies: Optional[List[str]] = None,
    sensitivities: Optional[List[str]] = None,
    concern_severity: Optional[Dict[str, str]] = None,
    condition_score: Optional[float] = None,
    lifestyle_habits: Optional[List[str]] = None,
    sleep_quality: Optional[str] = None,
    sleep_hours: Optional[float] = None,
    water_intake_liters: Optional[float] = None,
    month: Optional[int] = None,
) -> dict:

    concerns = _normalize_values(concerns)
    allergies = _normalize_values(allergies)
    sensitivities = _normalize_values(sensitivities)

    concern_severity = concern_severity or {}

    # Combine allergies + sensitivities into blocked ingredients
    blocked_ingredients = set(
        allergies + sensitivities
    )

    # -------------------------------------------------------
    # Generate morning
    # -------------------------------------------------------

    morning = generate_morning_routine(
        concerns=concerns,
        skin_type=skin_type,
        sensitivities=sensitivities,
        environmental_exposure=environmental_exposure,
        condition_score=condition_score,
        concern_severity=concern_severity,
        blocked_ingredients=blocked_ingredients,
    )

    # -------------------------------------------------------
    # Generate evening
    # -------------------------------------------------------

    evening = generate_evening_routine(
        concerns=concerns,
        skin_type=skin_type,
        sensitivities=sensitivities,
        concern_severity=concern_severity,
        condition_score=condition_score,
        blocked_ingredients=blocked_ingredients,
    )

    # -------------------------------------------------------
    # Generate weekly treatment
    # -------------------------------------------------------

    weekly = generate_weekly_treatments(
        concerns=concerns,
        skin_type=skin_type,
        sensitivities=sensitivities,
        concern_severity=concern_severity,
        condition_score=condition_score,
    )

    # -------------------------------------------------------
    # Season
    # -------------------------------------------------------

    season = determine_current_season(month)

    apply_seasonal_adjustments(
        morning,
        evening,
        weekly,
        season,
        environmental_exposure,
    )

    # -------------------------------------------------------
    # Health score note
    # -------------------------------------------------------

    score_note = ""

    if condition_score is not None:

        if condition_score < 40:
            score_note = (
                "Skin health score is currently low. "
                "The routine has been simplified to prioritize "
                "gentle cleansing, hydration and barrier support."
            )

        elif condition_score < 70:
            score_note = (
                "Skin health score indicates room for improvement. "
                "The routine balances targeted treatment with "
                "hydration and sun protection."
            )

        else:
            score_note = (
                "Skin health score is relatively good. "
                "The routine focuses on maintenance and consistency."
            )

    # -------------------------------------------------------
    # Severity note
    # -------------------------------------------------------

    severity_note = ""

    if concern_severity:

        highest_severity = "mild"

        severity_rank = {
            "mild": 1,
            "moderate": 2,
            "severe": 3,
            "very severe": 4,
        }

        for severity in concern_severity.values():

            severity = str(severity).lower()

            if severity_rank.get(
                severity,
                1,
            ) > severity_rank.get(
                highest_severity,
                1,
            ):
                highest_severity = severity

        severity_note = SEVERITY_NOTES.get(
            highest_severity,
            "",
        )

    # -------------------------------------------------------
    # Lifestyle note
    # -------------------------------------------------------

    lifestyle_notes = lifestyle_recommendations(
        lifestyle_habits=lifestyle_habits,
        sleep_quality=sleep_quality,
        sleep_hours=sleep_hours,
        water_intake_liters=water_intake_liters,
    )

    # -------------------------------------------------------
    # Final notes
    # -------------------------------------------------------

    notes_parts = [
        score_note,
        severity_note,
        seasonal_recommendation(
            season,
            skin_type,
        ),
        *lifestyle_notes,
    ]

    notes = " ".join(
        part
        for part in notes_parts
        if part
    )

    # -------------------------------------------------------
    # Return
    # -------------------------------------------------------

    return {
        "morning_routine": morning,
        "evening_routine": evening,
        "weekly_treatments": weekly,
        "season": season,
        "notes": notes,
    }