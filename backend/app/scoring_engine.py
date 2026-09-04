"""
GlowMix Skin Health Scoring Engine (Module 7)
---------------------------------------------
Implements deterministic pure functions to calculate individual factor scores (0-100)
and the weighted Overall Skin Health Score (0-100) based on Document Section 7 weights:

Weights:
  1. Skin Condition Assessment : 35% (0.35)
  2. Lifestyle Habits          : 20% (0.20)
  3. Sleep Quality             : 15% (0.15)
  4. Routine Consistency       : 20% (0.20)
  5. Hydration Level           : 10% (0.10)

Score Threshold Categories:
  - 85 - 100 : Optimal Skin Barrier
  - 70 - 84  : Moderate Skin Health
  - 55 - 69  : Needs Targeted Care
  - Below 55 : High Skin Sensitivity
"""

from datetime import date, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app import models


def calculate_skin_condition_score(assessment: Any) -> int:
    """
    Calculates Skin Condition Assessment factor score (35% weight).
    Reuses assessment.health_score (0-100).
    Defaults safely to 0 if missing and clamps result between 0 and 100.
    """
    if assessment is None:
        return 0

    try:
        health_score = getattr(assessment, "health_score", 0)
        if health_score is None:
            return 0
        score_val = float(health_score)
        return int(round(max(0.0, min(100.0, score_val))))
    except (ValueError, TypeError, AttributeError):
        return 0


def calculate_lifestyle_score(assessment: Any) -> int:
    """
    Calculates Lifestyle Habits factor score (20% weight).
    Reads assessment.lifestyle_habits (JSON array/list, dict, or string).

    - If list/array: evaluates positive vs negative lifestyle habits.
    - If dict: calculates percentage of completed/positive habits.
    - If missing or unparseable: returns neutral documented fallback score of 75.
    Never throws an exception.
    """
    NEUTRAL_FALLBACK_SCORE = 75

    if assessment is None:
        return NEUTRAL_FALLBACK_SCORE

    try:
        habits = getattr(assessment, "lifestyle_habits", None)
        if habits is None:
            return NEUTRAL_FALLBACK_SCORE

        # Handle dictionary habit format (e.g. {"balanced_diet": True, "exercise": True, "smoking": False})
        if isinstance(habits, dict):
            if not habits:
                return NEUTRAL_FALLBACK_SCORE
            
            score_points = 0.0
            total_items = len(habits)
            
            positive_keys = {"balanced_diet", "exercise", "regular_exercise", "stress_management", "sun_protection", "hydration", "adequate_sleep"}
            negative_keys = {"smoking", "high_stress", "alcohol", "late_nights", "poor_diet"}

            for key, val in habits.items():
                k_lower = str(key).lower()
                is_true = bool(val)

                if k_lower in positive_keys:
                    if is_true:
                        score_points += 1.0
                elif k_lower in negative_keys:
                    if not is_true:
                        score_points += 1.0
                else:
                    if is_true:
                        score_points += 1.0

            calculated = (score_points / total_items) * 100.0
            return int(round(max(0.0, min(100.0, calculated))))

        # Handle list/array habit format (e.g. ["Balanced Diet", "Regular Exercise", "Sun Protection"])
        if isinstance(habits, (list, tuple)):
            if not habits:
                return NEUTRAL_FALLBACK_SCORE

            positive_keywords = {"balanced", "diet", "exercise", "workout", "water", "sleep", "sun", "protection", "meditation", "healthy"}
            negative_keywords = {"smoking", "smoke", "alcohol", "stress", "junk", "late", "sugar"}

            base_score = 70.0
            for item in habits:
                item_str = str(item).lower()
                if any(pos in item_str for pos in positive_keywords):
                    base_score += 10.0
                if any(neg in item_str for neg in negative_keywords):
                    base_score -= 10.0

            return int(round(max(0.0, min(100.0, base_score))))

        # Handle string representation
        if isinstance(habits, str):
            if not habits.strip():
                return NEUTRAL_FALLBACK_SCORE
            return 80 if "healthy" in habits.lower() else 70

        return NEUTRAL_FALLBACK_SCORE
    except Exception:
        # Documented fallback if any unexpected error occurs
        return NEUTRAL_FALLBACK_SCORE


def calculate_sleep_score(assessment: Any) -> int:
    """
    Calculates Sleep Quality factor score (15% weight).
    Evaluates assessment.sleep_hours (target: 7-9 hrs) and assessment.sleep_quality.

    Duration Scoring:
      - 7.0 to 9.0 hours  : 100%
      - 6.0 to 6.9 hours  : 80%
      - 5.0 to 5.9 hours  : 60%
      - < 5.0 or > 10 hrs : 40%

    Quality Scoring:
      - Excellent         : 100
      - Good              : 85
      - Average / Fair    : 70
      - Poor              : 50

    Returns score from 0 to 100. Fallback is 70 if no data exists.
    """
    NEUTRAL_FALLBACK_SCORE = 70

    if assessment is None:
        return NEUTRAL_FALLBACK_SCORE

    try:
        sleep_hours = getattr(assessment, "sleep_hours", None)
        sleep_quality = getattr(assessment, "sleep_quality", None)

        duration_score = None
        if sleep_hours is not None:
            try:
                hrs = float(sleep_hours)
                if 7.0 <= hrs <= 9.0:
                    duration_score = 100.0
                elif 6.0 <= hrs < 7.0 or 9.0 < hrs <= 10.0:
                    duration_score = 80.0
                elif 5.0 <= hrs < 6.0:
                    duration_score = 60.0
                else:
                    duration_score = 40.0
            except (ValueError, TypeError):
                duration_score = None

        quality_score = None
        if sleep_quality is not None:
            q_str = str(sleep_quality).strip().lower()
            if "excellent" in q_str:
                quality_score = 100.0
            elif "good" in q_str:
                quality_score = 85.0
            elif "average" in q_str or "fair" in q_str:
                quality_score = 70.0
            elif "poor" in q_str:
                quality_score = 50.0

        if duration_score is not None and quality_score is not None:
            final_val = (duration_score * 0.5) + (quality_score * 0.5)
        elif duration_score is not None:
            final_val = duration_score
        elif quality_score is not None:
            final_val = quality_score
        else:
            final_val = float(NEUTRAL_FALLBACK_SCORE)

        return int(round(max(0.0, min(100.0, final_val))))
    except Exception:
        return NEUTRAL_FALLBACK_SCORE


def calculate_routine_consistency_score(db: Session, user_id: int) -> int:
    """
    Calculates Routine Consistency / Adherence factor score (20% weight).
    Reads RoutineLog records for the user over the trailing 14 days.

    Formula:
      Routine Consistency Score = (total completed steps / total routine steps) * 100

    Avoids division by zero.
    Fallback: Returns safe baseline score of 80 if no logs exist.
    Clamps result strictly between 0 and 100.
    """
    BASELINE_FALLBACK_SCORE = 80

    if db is None or not user_id:
        return BASELINE_FALLBACK_SCORE

    try:
        fourteen_days_ago = date.today() - timedelta(days=14)

        logs = (
            db.query(models.RoutineLog)
            .filter(
                models.RoutineLog.user_id == user_id,
                models.RoutineLog.log_date >= fourteen_days_ago
            )
            .all()
        )

        if not logs:
            return BASELINE_FALLBACK_SCORE

        total_completed = sum(log.completed_count for log in logs if log.completed_count is not None)
        total_routine = sum(log.total_count for log in logs if log.total_count is not None)

        if total_routine <= 0:
            return BASELINE_FALLBACK_SCORE

        adherence_percentage = (total_completed / float(total_routine)) * 100.0
        return int(round(max(0.0, min(100.0, adherence_percentage))))
    except Exception:
        return BASELINE_FALLBACK_SCORE


def calculate_hydration_score(assessment: Any) -> int:
    """
    Calculates Hydration Level factor score (10% weight).
    Evaluates assessment.water_glasses (target: at least 8 glasses) and assessment.hydration_level.

    Glasses Scoring:
      - 8+ glasses : 100%
      - Scale: (glasses / 8) * 100

    Hydration Level Scoring:
      - High   : 100
      - Medium : 75
      - Low    : 50

    Returns score from 0 to 100. Fallback is 70 if no data exists.
    """
    NEUTRAL_FALLBACK_SCORE = 70

    if assessment is None:
        return NEUTRAL_FALLBACK_SCORE

    try:
        water_glasses = getattr(assessment, "water_glasses", None)
        hydration_level = getattr(assessment, "hydration_level", None)

        glasses_score = None
        if water_glasses is not None:
            try:
                g = float(water_glasses)
                glasses_score = min(100.0, (g / 8.0) * 100.0)
            except (ValueError, TypeError):
                glasses_score = None

        level_score = None
        if hydration_level is not None:
            h_str = str(hydration_level).strip().lower()
            if "high" in h_str:
                level_score = 100.0
            elif "medium" in h_str:
                level_score = 75.0
            elif "low" in h_str:
                level_score = 50.0

        if glasses_score is not None and level_score is not None:
            final_val = (glasses_score * 0.6) + (level_score * 0.4)
        elif glasses_score is not None:
            final_val = glasses_score
        elif level_score is not None:
            final_val = level_score
        else:
            final_val = float(NEUTRAL_FALLBACK_SCORE)

        return int(round(max(0.0, min(100.0, final_val))))
    except Exception:
        return NEUTRAL_FALLBACK_SCORE


def calculate_overall_score(
    skin_condition: int,
    lifestyle_habits: int,
    sleep_quality: int,
    routine_consistency: int,
    hydration_level: int
) -> int:
    """
    Calculates Overall Skin Health Score using exact Document Section 7 weights:
      - Skin Condition Assessment : 35%
      - Lifestyle Habits          : 20%
      - Sleep Quality             : 15%
      - Routine Consistency       : 20%
      - Hydration Level           : 10%

    Clamps result between 0 and 100 and rounds to nearest integer.
    """
    raw_score = (
        (skin_condition * 0.35) +
        (lifestyle_habits * 0.20) +
        (sleep_quality * 0.15) +
        (routine_consistency * 0.20) +
        (hydration_level * 0.10)
    )

    return int(round(max(0.0, min(100.0, raw_score))))


def get_score_category(score: int) -> Dict[str, str]:
    """
    Maps score (0-100) to threshold category label and UI styling.

    Ranges:
      - 85 - 100 : Optimal Skin Barrier
      - 70 - 84  : Moderate Skin Health
      - 55 - 69  : Needs Targeted Care
      - Below 55 : High Skin Sensitivity
    """
    clamped_score = max(0, min(100, int(score)))

    if clamped_score >= 85:
        return {
            "label": "Optimal Skin Barrier",
            "color": "text-emerald-400",
            "badge_class": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
        }
    if clamped_score >= 70:
        return {
            "label": "Moderate Skin Health",
            "color": "text-cyan-400",
            "badge_class": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
        }
    if clamped_score >= 55:
        return {
            "label": "Needs Targeted Care",
            "color": "text-amber-400",
            "badge_class": "bg-amber-500/20 text-amber-300 border-amber-500/30"
        }
    return {
        "label": "High Skin Sensitivity",
        "color": "text-rose-400",
        "badge_class": "bg-rose-500/20 text-rose-300 border-rose-500/30"
    }
