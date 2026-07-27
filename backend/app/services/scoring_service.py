"""
Skin Health Scoring Engine.

Implements the weighted scoring model from the project spec:
  Skin Condition Assessment  35%
  Lifestyle Habits           20%
  Sleep Quality              15%
  Routine Consistency        20%
  Hydration Level            10%

Each component is normalized to a 0-100 scale before weighting.
This is a transparent, rule-based baseline -- swap in a trained
model (see AI & ML section of the architecture) once you have
labeled outcome data to train on.
"""
from typing import List, Optional

CONCERN_SEVERITY_PENALTY = {"mild": 5, "moderate": 12, "severe": 22}

NEGATIVE_LIFESTYLE_HABITS = {"smoking", "high-stress", "poor-diet", "high-sun-exposure", "pollution-exposure"}
POSITIVE_LIFESTYLE_HABITS = {"exercise", "balanced-diet", "low-stress", "sun-protection"}


def score_skin_condition(identified_concerns: List[str], concern_severity: dict) -> float:
    score = 100.0
    for concern in identified_concerns:
        severity = concern_severity.get(concern, "moderate")
        score -= CONCERN_SEVERITY_PENALTY.get(severity, 10)
    return max(0.0, min(100.0, score))


def score_lifestyle(lifestyle_habits: List[str]) -> float:
    score = 70.0
    for habit in lifestyle_habits:
        h = habit.lower()
        if h in NEGATIVE_LIFESTYLE_HABITS:
            score -= 10
        elif h in POSITIVE_LIFESTYLE_HABITS:
            score += 10
    return max(0.0, min(100.0, score))


def score_sleep(sleep_quality: Optional[str], sleep_hours: float) -> float:
    quality_map = {"poor": 30, "average": 65, "good": 95}
    base = quality_map.get((sleep_quality or "average").lower(), 60)
    if sleep_hours < 5:
        base -= 15
    elif sleep_hours > 9:
        base -= 5
    return max(0.0, min(100.0, base))


def score_routine_consistency(logs_last_14_days: List[dict]) -> float:
    """logs_last_14_days: list of {routine_followed_morning, routine_followed_evening}"""
    if not logs_last_14_days:
        return 50.0  # neutral default, no data yet
    total_slots = len(logs_last_14_days) * 2
    followed = sum(
        int(bool(log.get("routine_followed_morning"))) + int(bool(log.get("routine_followed_evening")))
        for log in logs_last_14_days
    )
    return round((followed / total_slots) * 100, 2) if total_slots else 50.0


def score_hydration(water_intake_liters: float) -> float:
    target = 2.5
    ratio = min(water_intake_liters / target, 1.2)
    return round(min(100.0, ratio * 100), 2)


def compute_skin_health_score(
    identified_concerns: List[str],
    concern_severity: dict,
    lifestyle_habits: List[str],
    sleep_quality: Optional[str],
    sleep_hours: float,
    logs_last_14_days: List[dict],
    water_intake_liters: float,
) -> dict:
    condition = score_skin_condition(identified_concerns, concern_severity)
    lifestyle = score_lifestyle(lifestyle_habits)
    sleep = score_sleep(sleep_quality, sleep_hours)
    routine = score_routine_consistency(logs_last_14_days)
    hydration = score_hydration(water_intake_liters)

    overall = round(
        condition * 0.35 + lifestyle * 0.20 + sleep * 0.15 + routine * 0.20 + hydration * 0.10, 2
    )

    return {
        "condition_score": condition,
        "lifestyle_score": lifestyle,
        "sleep_score": sleep,
        "routine_consistency_score": routine,
        "hydration_score": hydration,
        "overall_skin_health_score": overall,
    }
def detect_declining_trend(scores_chronological, window: int = 6, drop_threshold: float = 4.0) -> bool:
    """
    Adaptive-routine trigger: looks at the most recent `window` skin health
    scores (oldest -> newest) and flags a decline if the second half of that
    window averages more than `drop_threshold` points below the first half.

    Needs at least 4 usable data points to avoid false positives on noisy,
    small samples.
    """
    usable = [s for s in scores_chronological[-window:] if s is not None]
    if len(usable) < 4:
        return False

    mid = len(usable) // 2
    first_half_avg = sum(usable[:mid]) / mid
    second_half_avg = sum(usable[mid:]) / (len(usable) - mid)

    return (first_half_avg - second_half_avg) > drop_threshold
