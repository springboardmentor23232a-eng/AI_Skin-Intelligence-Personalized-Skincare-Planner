"""
Progress Tracking & Analytics Engine
=====================================

Section 8 of the project spec. This module is the single source of truth
for turning raw assessment/progress-log history into the five named
analytics:

    1. Skin progress monitoring   -> monitor_skin_progress()
    2. Routine adherence tracking -> track_routine_adherence()
    3. Improvement analysis       -> analyze_improvement()
    4. Before/after comparisons   -> compare_before_after()
    5. Trend analysis             -> analyze_trend()

"Improvement analysis" reuses the Skin Health Scoring Engine's
score_skin_improvement() (section 7) so the two modules never disagree
about what "improving" means.
"""
from typing import Optional, List, Dict

from app.ml.skin_health_scoring_engine import score_skin_improvement


# ---------------------------------------------------------------------------
# 1. SKIN PROGRESS MONITORING
# ---------------------------------------------------------------------------
def monitor_skin_progress(assessments: List) -> List[Dict]:
    """
    Turns a chronological list of SkinAssessment rows into a simple
    score-over-time series for charting/monitoring.
    """
    return [
        {
            "date": a.assessment_date,
            "skin_health_score": a.skin_health_score,
            "overall_condition": a.overall_condition,
            "detected_skin_type": a.detected_skin_type,
        }
        for a in assessments
    ]


# ---------------------------------------------------------------------------
# 2. ROUTINE ADHERENCE TRACKING
# ---------------------------------------------------------------------------
def track_routine_adherence(logs: List) -> Dict:
    """
    Summarizes routine adherence (%) over time from ProgressLog rows:
    latest value, running average, and whether adherence itself is
    trending up or down.
    """
    if not logs:
        return {"latest_pct": None, "average_pct": None, "trend": "no_data", "history": []}

    values = [l.routine_adherence_pct for l in logs]
    latest = values[-1]
    average = round(sum(values) / len(values), 2)

    if len(values) >= 2:
        change = values[-1] - values[0]
        trend = "improving" if change > 3 else ("declining" if change < -3 else "stable")
    else:
        trend = "baseline"

    return {
        "latest_pct": latest,
        "average_pct": average,
        "trend": trend,
        "history": [{"date": l.log_date, "adherence_pct": l.routine_adherence_pct} for l in logs],
    }


# ---------------------------------------------------------------------------
# 3. IMPROVEMENT ANALYSIS
# ---------------------------------------------------------------------------
def analyze_improvement(current_score: float, historical_scores: Optional[List[float]]) -> Dict:
    """Delegates to the Scoring Engine's skin-improvement scoring (section 7)."""
    return score_skin_improvement(current_score, historical_scores)


# ---------------------------------------------------------------------------
# 4. BEFORE/AFTER COMPARISONS
# ---------------------------------------------------------------------------
def compare_before_after(first, last) -> Dict:
    """
    Compares the user's first-ever and most recent assessment: scores,
    condition labels, detected skin type, and the two images (if any)
    for a visual before/after.
    """
    return {
        "before": {
            "date": first.assessment_date,
            "score": first.skin_health_score,
            "overall_condition": first.overall_condition,
            "detected_skin_type": first.detected_skin_type,
            "image_path": first.image_path,
        },
        "after": {
            "date": last.assessment_date,
            "score": last.skin_health_score,
            "overall_condition": last.overall_condition,
            "detected_skin_type": last.detected_skin_type,
            "image_path": last.image_path,
        },
        "score_change": round(last.skin_health_score - first.skin_health_score, 2),
    }


# ---------------------------------------------------------------------------
# 5. TREND ANALYSIS
# ---------------------------------------------------------------------------
def _linear_slope(values: List[float]) -> float:
    """Simple least-squares slope of values against their index (0, 1, 2, ...)."""
    n = len(values)
    if n < 2:
        return 0.0
    xs = list(range(n))
    x_mean = sum(xs) / n
    y_mean = sum(values) / n
    numerator = sum((xs[i] - x_mean) * (values[i] - y_mean) for i in range(n))
    denominator = sum((xs[i] - x_mean) ** 2 for i in range(n))
    return numerator / denominator if denominator else 0.0


def analyze_trend(assessments: List, window: int = 3) -> Dict:
    """
    Analyzes the direction and rate of change of skin_health_score across
    a chronological list of SkinAssessment rows: overall direction, slope
    (points per assessment), and a trailing moving average.
    """
    if not assessments:
        return {"direction": "no_data", "slope_per_assessment": 0.0, "moving_average": []}

    scores = [a.skin_health_score for a in assessments]
    slope = round(_linear_slope(scores), 2)

    if slope > 0.5:
        direction = "upward"
    elif slope < -0.5:
        direction = "downward"
    else:
        direction = "flat"

    moving_average = []
    for i in range(len(scores)):
        window_slice = scores[max(0, i - window + 1): i + 1]
        moving_average.append(round(sum(window_slice) / len(window_slice), 2))

    return {
        "direction": direction,
        "slope_per_assessment": slope,
        "moving_average": moving_average,
        "first_score": scores[0],
        "latest_score": scores[-1],
    }
