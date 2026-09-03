"""
Skin Health Scoring Engine — Weighted Scoring Model
====================================================

Computes a composite Skin Health Score (0–100) using a deterministic
weighted scoring model with five factors:

    Skin Condition Assessment  — 35%
    Lifestyle Habits           — 20%
    Sleep Quality              — 15%
    Routine Consistency        — 20%
    Hydration Level            — 10%

Each factor produces a sub-score (0–100), which is then weighted and
summed to produce the final score.
"""

from typing import Optional


# ---------------------------------------------------------------------------
# Weight constants
# ---------------------------------------------------------------------------
WEIGHT_SKIN_CONDITION = 0.35
WEIGHT_LIFESTYLE = 0.20
WEIGHT_SLEEP = 0.15
WEIGHT_ROUTINE_CONSISTENCY = 0.20
WEIGHT_HYDRATION = 0.10


# ---------------------------------------------------------------------------
# 1. Skin Condition Assessment (35%)
# ---------------------------------------------------------------------------

# Concern severity deductions (per concern present)
CONCERN_DEDUCTIONS = {
    "acne": 12,
    "aging": 8,
    "dryness": 10,
    "hyperpigmentation": 9,
    "redness": 10,
    "dark spots": 8,
    "dark_spots": 8,
    "darkspots": 8,
    "large pores": 5,
    "large_pores": 5,
    "largepores": 5,
    "pore size": 5,
    "pore_size": 5,
    "pores": 5,
    "dullness": 6,
}

SKIN_TYPE_RISK = {
    "sensitive": 8,
    "dry": 6,
    "oily": 5,
    "combination": 4,
    "normal": 0,
}


def calculate_skin_condition_score(
    skin_concerns: list[str],
    skin_type: str = "Normal",
    has_allergy: bool = False,
    has_sensitivity: bool = False,
) -> int:
    """
    Score skin condition from 0–100.
    Starts at 100, deducts for each active concern, skin type risk,
    allergies, and sensitivities.
    """
    score = 100.0

    # Deduct for each skin concern
    for concern in skin_concerns:
        key = concern.strip().lower()
        deduction = CONCERN_DEDUCTIONS.get(key, 5)  # default 5 for unknown
        score -= deduction

    # Deduct for skin type risk
    st = skin_type.strip().lower() if skin_type else "normal"
    score -= SKIN_TYPE_RISK.get(st, 0)

    # Deduct for allergies & sensitivities
    if has_allergy:
        score -= 10
    if has_sensitivity:
        score -= 7

    return int(round(max(0, min(100, score))))


# ---------------------------------------------------------------------------
# 2. Lifestyle Habits & Environmental Impact Score (20%)
# ---------------------------------------------------------------------------

# Negative habits & environmental stressors (deductions)
NEGATIVE_HABIT_DEDUCTIONS = {
    "stress": 15,
    "high stress": 15,
    "smoking": 20,
    "alcohol": 12,
    "high caffeine": 8,
    "caffeine": 8,
    "sun exposure": 8,
    "frequent sun exposure": 8,
    "high pollution": 8,
    "pollution": 8,
    "dry climate": 6,
    "climate": 6,
    "indoor ac": 5,
    "air conditioning": 5,
}

# Positive habits (bonuses, added back)
POSITIVE_HABIT_BONUSES = {
    "healthy diet": 15,
    "regular exercise": 12,
    "active exercise": 12,
    "exercise": 12,
    "active lifestyle": 10,
    "meditation": 8,
}


def calculate_lifestyle_score(lifestyle_habits: list[str]) -> int:
    """
    Score lifestyle habits from 0–100.
    Starts at 70 (neutral baseline), deducts for bad habits,
    adds bonus for good habits.
    """
    score = 70.0

    matched_negative = set()
    matched_positive = set()

    for habit in lifestyle_habits:
        key = habit.strip().lower()

        # Check negative habits
        for neg_key, deduction in NEGATIVE_HABIT_DEDUCTIONS.items():
            if neg_key in key and neg_key not in matched_negative:
                score -= deduction
                matched_negative.add(neg_key)

        # Check positive habits
        for pos_key, bonus in POSITIVE_HABIT_BONUSES.items():
            if pos_key in key and pos_key not in matched_positive:
                score += bonus
                matched_positive.add(pos_key)

    # If no habits reported at all, assume moderate baseline
    if not lifestyle_habits:
        score = 60.0

    return int(round(max(0, min(100, score))))


# ---------------------------------------------------------------------------
# 3. Sleep Quality Score (15%)
# ---------------------------------------------------------------------------

SLEEP_QUALITY_SCORES = {
    "excellent": 100,
    "good": 80,
    "average": 55,
    "poor": 25,
}


def calculate_sleep_score(sleep_quality: str) -> int:
    """
    Score sleep quality from 0–100 based on user-reported quality.
    """
    if not sleep_quality or not sleep_quality.strip():
        return 50  # neutral default

    key = sleep_quality.strip().lower()
    return SLEEP_QUALITY_SCORES.get(key, 50)


# ---------------------------------------------------------------------------
# 4. Routine Consistency Score (20%)
# ---------------------------------------------------------------------------

def calculate_routine_consistency_score(adherence_percentage: float) -> int:
    """
    Score routine consistency from 0–100 based on check-in adherence
    percentage from the last 30 days.
    
    adherence_percentage: 0–100 float from the check-in system
    """
    if adherence_percentage is None or adherence_percentage < 0:
        return 30  # low default if no data

    # Direct mapping: adherence % → consistency score
    # But apply a slight curve to reward consistency more
    if adherence_percentage >= 90:
        return 100
    elif adherence_percentage >= 75:
        return 85
    elif adherence_percentage >= 60:
        return 70
    elif adherence_percentage >= 40:
        return 55
    elif adherence_percentage >= 20:
        return 40
    elif adherence_percentage > 0:
        return 25
    else:
        return 30  # no check-in data yet — neutral


# ---------------------------------------------------------------------------
# 5. Hydration Level Score (10%)
# ---------------------------------------------------------------------------

HYDRATION_SCORES = {
    "high": 100,
    "moderate": 65,
    "low": 25,
}


def calculate_hydration_score(water_intake: str) -> int:
    """
    Score hydration level from 0–100 based on user-reported water intake.
    """
    if not water_intake or not water_intake.strip():
        return 50  # neutral default

    key = water_intake.strip().lower()
    return HYDRATION_SCORES.get(key, 50)


# ---------------------------------------------------------------------------
# 6. Skin Improvement Trend
# ---------------------------------------------------------------------------

def calculate_skin_improvement(current_score: int, previous_score: Optional[int]) -> dict:
    """
    Calculate improvement trend comparing current vs. previous assessment.
    Returns trend info dict.
    """
    if previous_score is None or previous_score == 0:
        return {
            "trend": "baseline",
            "change": 0,
            "label": "First Assessment",
            "icon": "📊",
        }

    change = current_score - previous_score
    if change > 5:
        return {
            "trend": "improving",
            "change": change,
            "label": f"Improved by {change} points",
            "icon": "📈",
        }
    elif change < -5:
        return {
            "trend": "declining",
            "change": change,
            "label": f"Declined by {abs(change)} points",
            "icon": "📉",
        }
    else:
        return {
            "trend": "stable",
            "change": change,
            "label": "Stable — no significant change",
            "icon": "➡️",
        }


# ---------------------------------------------------------------------------
# 7. Weighted Composite Score
# ---------------------------------------------------------------------------

def calculate_weighted_skin_health_score(
    skin_concerns: list[str],
    skin_type: str = "Normal",
    has_allergy: bool = False,
    has_sensitivity: bool = False,
    lifestyle_habits: list[str] = None,
    sleep_quality: str = "",
    water_intake: str = "",
    adherence_percentage: float = 0.0,
    previous_score: Optional[int] = None,
    ml_score: Optional[int] = None,
) -> dict:
    """
    Calculate the final weighted skin health score with full breakdown.

    Returns a dict containing:
      - final_score: int (0-100)
      - category: str
      - sub_scores: dict of each factor's sub-score
      - weighted_contributions: dict of each factor's weighted contribution
      - weights: dict of factor weights
      - improvement: dict of trend info
    """
    if lifestyle_habits is None:
        lifestyle_habits = []

    # Calculate all sub-scores
    skin_condition = calculate_skin_condition_score(
        skin_concerns, skin_type, has_allergy, has_sensitivity
    )
    lifestyle = calculate_lifestyle_score(lifestyle_habits)
    sleep = calculate_sleep_score(sleep_quality)
    routine_consistency = calculate_routine_consistency_score(adherence_percentage)
    hydration = calculate_hydration_score(water_intake)

    # Weighted contributions
    w_skin = skin_condition * WEIGHT_SKIN_CONDITION
    w_lifestyle = lifestyle * WEIGHT_LIFESTYLE
    w_sleep = sleep * WEIGHT_SLEEP
    w_routine = routine_consistency * WEIGHT_ROUTINE_CONSISTENCY
    w_hydration = hydration * WEIGHT_HYDRATION

    weighted_total = w_skin + w_lifestyle + w_sleep + w_routine + w_hydration

    # If ML model prediction is available, blend it (20% ML, 80% formula)
    if ml_score is not None and ml_score > 0:
        final_score = int(round(weighted_total * 0.80 + ml_score * 0.20))
    else:
        final_score = int(round(weighted_total))

    final_score = max(0, min(100, final_score))

    # Category
    if final_score >= 80:
        category = "Excellent"
    elif final_score >= 65:
        category = "Good"
    elif final_score >= 50:
        category = "Fair"
    else:
        category = "Poor"

    # Improvement trend
    improvement = calculate_skin_improvement(final_score, previous_score)

    return {
        "final_score": final_score,
        "category": category,
        "sub_scores": {
            "skin_condition": skin_condition,
            "lifestyle_habits": lifestyle,
            "sleep_quality": sleep,
            "routine_consistency": routine_consistency,
            "hydration_level": hydration,
        },
        "weighted_contributions": {
            "skin_condition": round(w_skin, 1),
            "lifestyle_habits": round(w_lifestyle, 1),
            "sleep_quality": round(w_sleep, 1),
            "routine_consistency": round(w_routine, 1),
            "hydration_level": round(w_hydration, 1),
        },
        "weights": {
            "skin_condition": int(WEIGHT_SKIN_CONDITION * 100),
            "lifestyle_habits": int(WEIGHT_LIFESTYLE * 100),
            "sleep_quality": int(WEIGHT_SLEEP * 100),
            "routine_consistency": int(WEIGHT_ROUTINE_CONSISTENCY * 100),
            "hydration_level": int(WEIGHT_HYDRATION * 100),
        },
        "improvement": improvement,
        "ml_score_used": ml_score if ml_score and ml_score > 0 else None,
    }
