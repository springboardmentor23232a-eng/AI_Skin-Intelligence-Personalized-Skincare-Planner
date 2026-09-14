"""
Skin Health Scoring Engine
==========================

Section 7 of the project spec. This module is the single source of truth
for how a user's Skin Health Score is produced, and exposes each named
sub-score as its own function so it can be called, tested, or displayed
independently:

    1. Skin condition scoring     -> score_skin_condition()
    2. Lifestyle impact scoring   -> score_lifestyle_impact()
    3. Routine adherence scoring  -> score_routine_adherence()
    4. Skin improvement scoring   -> score_skin_improvement()
    5. Overall skin health score  -> compute_overall_skin_health_score()

Two supporting components (sleep quality, hydration level) feed into the
overall weighted score alongside the three above, per the Weighted Scoring
Model below.

Weighted Scoring Model
-----------------------
    Skin Health Score =
        Skin Condition Assessment (35%)
        + Lifestyle Habits        (20%)
        + Sleep Quality           (15%)
        + Routine Consistency     (20%)
        + Hydration Level         (10%)

"Skin improvement scoring" is reported alongside the overall score as a
trend indicator (it compares the current score to the user's own
historical baseline) rather than as a weighted input — a brand-new user
has no history to improve against, so it can't be part of day-one score.
"""
from typing import Optional, List, Dict

# ---------------------------------------------------------------------------
# Weights for the Weighted Scoring Model (must sum to 1.0)
# ---------------------------------------------------------------------------
WEIGHT_SKIN_CONDITION = 0.35
WEIGHT_LIFESTYLE_HABITS = 0.20
WEIGHT_SLEEP_QUALITY = 0.15
WEIGHT_ROUTINE_CONSISTENCY = 0.20
WEIGHT_HYDRATION_LEVEL = 0.10

NEUTRAL_DEFAULT = 60.0  # used whenever a component has no data yet


# ---------------------------------------------------------------------------
# 1. SKIN CONDITION SCORING
# ---------------------------------------------------------------------------
def score_skin_condition(image_features: Optional[dict]) -> float:
    """
    0-100 score derived from OpenCV-extracted image features
    (redness, oil_sheen_ratio, texture_variance, brightness, edge_density).
    Higher = healthier-looking skin. Falls back to a neutral default when
    no image has been analyzed yet.
    """
    if not image_features:
        return 65.0

    score = 100.0
    if image_features["redness"] > 0.40:
        score -= 20
    elif image_features["redness"] > 0.36:
        score -= 10

    if image_features["oil_sheen_ratio"] > 0.15:
        score -= 10

    if image_features["texture_variance"] > 150:
        score -= 15
    elif image_features["texture_variance"] > 110:
        score -= 7

    if image_features["brightness"] < 130:
        score -= 10

    if image_features["edge_density"] > 0.10:
        score -= 8

    return max(0.0, min(100.0, score))


# ---------------------------------------------------------------------------
# 2. LIFESTYLE IMPACT SCORING
# ---------------------------------------------------------------------------
NEGATIVE_HABITS = {"smoking", "alcohol", "high stress", "junk food", "no exercise", "poor diet"}
POSITIVE_HABITS = {"exercise", "balanced diet", "no smoking", "low stress", "healthy diet"}


def score_lifestyle_impact(profile) -> float:
    """0-100 score reflecting how the user's day-to-day habits affect skin health."""
    if not profile or not profile.lifestyle_habits:
        return NEUTRAL_DEFAULT

    habits = [h.strip().lower() for h in profile.lifestyle_habits.split(",") if h.strip()]
    score = 80.0
    for h in habits:
        if h in NEGATIVE_HABITS:
            score -= 12
        elif h in POSITIVE_HABITS:
            score += 6

    return max(0.0, min(100.0, score))


def score_sleep_quality(profile) -> float:
    """0-100 score from the user's self-reported sleep quality (0-10 scale)."""
    if not profile or profile.sleep_quality is None:
        return NEUTRAL_DEFAULT
    return max(0.0, min(100.0, profile.sleep_quality * 10))


def score_hydration_level(profile) -> float:
    """0-100 score from a direct 0-10 hydration rating, or daily water intake in litres."""
    if not profile:
        return NEUTRAL_DEFAULT
    if profile.hydration_level is not None:
        return max(0.0, min(100.0, profile.hydration_level * 10))
    if profile.water_intake_liters is not None:
        return max(0.0, min(100.0, (profile.water_intake_liters / 2.5) * 100))  # 2.5L/day = ideal baseline
    return NEUTRAL_DEFAULT


# ---------------------------------------------------------------------------
# 3. ROUTINE ADHERENCE SCORING
# ---------------------------------------------------------------------------
def score_routine_adherence(adherence_pct: Optional[float]) -> float:
    """0-100 score of how consistently the user has followed their generated routine."""
    if adherence_pct is None:
        return NEUTRAL_DEFAULT  # neutral default for a brand-new user with no logs yet
    return max(0.0, min(100.0, adherence_pct))


# ---------------------------------------------------------------------------
# 4. SKIN IMPROVEMENT SCORING
# ---------------------------------------------------------------------------
def score_skin_improvement(current_score: float, historical_scores: Optional[List[float]]) -> Dict:
    """
    Compares the current Skin Health Score against the user's own historical
    baseline (their first-ever recorded score) to quantify improvement over
    time.

    Returns a dict:
        improvement_score : 0-100, where 50 = no change, 100 = strongest
                             improvement observed, 0 = strongest decline.
        trend             : "improving" | "declining" | "stable" | "baseline"
        change_points      : raw point change vs. baseline (can be negative)
        baseline_score     : the score being compared against (None if this
                              is the user's first assessment)
    """
    if not historical_scores:
        return {
            "improvement_score": 50.0,
            "trend": "baseline",
            "change_points": 0.0,
            "baseline_score": None,
        }

    baseline = historical_scores[0]
    change = current_score - baseline

    # A +/-30 point swing in skin_health_score maps to the full 0-100 range.
    improvement_score = max(0.0, min(100.0, 50 + (change / 30.0) * 50))

    if change > 3:
        trend = "improving"
    elif change < -3:
        trend = "declining"
    else:
        trend = "stable"

    return {
        "improvement_score": round(improvement_score, 2),
        "trend": trend,
        "change_points": round(change, 2),
        "baseline_score": round(baseline, 2),
    }


# ---------------------------------------------------------------------------
# 5. OVERALL SKIN HEALTH SCORE (Weighted Scoring Model)
# ---------------------------------------------------------------------------
def _condition_label(total: float) -> str:
    if total >= 80:
        return "Excellent"
    if total >= 65:
        return "Good"
    if total >= 45:
        return "Fair"
    return "Needs Attention"


def compute_overall_skin_health_score(
    profile=None,
    image_features: Optional[dict] = None,
    routine_adherence_pct: Optional[float] = None,
    historical_scores: Optional[List[float]] = None,
) -> Dict:
    """
    Runs all five scoring components and combines them per the Weighted
    Scoring Model into a single Skin Health Score out of 100.

    `historical_scores` (previous skin_health_score values, oldest first) is
    optional — pass it in to also get a "skin_improvement" breakdown in the
    result. It never affects the weighted total itself.
    """
    condition = score_skin_condition(image_features)
    lifestyle = score_lifestyle_impact(profile)
    sleep = score_sleep_quality(profile)
    routine = score_routine_adherence(routine_adherence_pct)
    hydration = score_hydration_level(profile)

    total = round(
        condition * WEIGHT_SKIN_CONDITION
        + lifestyle * WEIGHT_LIFESTYLE_HABITS
        + sleep * WEIGHT_SLEEP_QUALITY
        + routine * WEIGHT_ROUTINE_CONSISTENCY
        + hydration * WEIGHT_HYDRATION_LEVEL,
        2,
    )

    result = {
        "skin_health_score": total,
        "overall_condition": _condition_label(total),
        "breakdown": {
            "skin_condition_assessment": round(condition, 2),
            "lifestyle_habits": round(lifestyle, 2),
            "sleep_quality": round(sleep, 2),
            "routine_consistency": round(routine, 2),
            "hydration_level": round(hydration, 2),
        },
    }

    if historical_scores is not None:
        result["skin_improvement"] = score_skin_improvement(total, historical_scores)

    return result
