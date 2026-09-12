"""
Skin Health Scoring Engine
==========================
Personalized, deterministic 5-factor wellness scoring model tailored to individual
skin types, primary concerns, lifestyle habits, rest quality, and routine adherence:

1. Skin Condition Assessment  -> 35% (0.35)
2. Lifestyle Habits          -> 20% (0.20)
3. Sleep Quality             -> 15% (0.15)
4. Routine Consistency        -> 20% (0.20)
5. Hydration Level            -> 10% (0.10)
Total Weight = 1.00 (100%)

Wellness Safety Notice:
This evaluation offers personalized wellness insights for lifestyle, hydration,
and routine optimization. It does not constitute a clinical dermatological diagnosis.
"""

from datetime import datetime, UTC
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.models import User, SkinProfile, SkinAssessment, SkincareLog

# Constant Factor Weights (Total = 1.00 / 100%)
WEIGHT_SKIN_CONDITION = 0.35
WEIGHT_LIFESTYLE = 0.20
WEIGHT_SLEEP = 0.15
WEIGHT_ROUTINE = 0.20
WEIGHT_HYDRATION = 0.10
TOTAL_WEIGHT = round(
    WEIGHT_SKIN_CONDITION + WEIGHT_LIFESTYLE + WEIGHT_SLEEP + WEIGHT_ROUTINE + WEIGHT_HYDRATION,
    2
)
CALCULATION_VERSION = "personalized-v2"
WELLNESS_DISCLAIMER = (
    "Personalized skincare wellness guidance designed to support your daily barrier health. "
    "Not a clinical diagnosis. Consult a certified dermatologist for persistent medical conditions."
)


def calculate_skin_condition_score(
    assessment: Optional[Any],
    profile: Optional[SkinProfile] = None
) -> float:
    """
    Factor 1: Skin Condition Assessment (35% weight).
    Personalized to the user's specific skin type and active skin concerns.
    100.0 = optimal barrier harmony, 0.0 = high acute severity.
    """
    if not assessment:
        # Realistic initial baseline when no assessment has been conducted yet
        return 60.0

    def get_val(key: str, default: int = 0) -> float:
        if isinstance(assessment, dict):
            return float(assessment.get(key, default) or 0)
        return float(getattr(assessment, key, default) or 0)

    acne = get_val("acne", 20)
    hyperpigmentation = get_val("hyperpigmentation", 15)
    dryness = get_val("dryness", 30)
    oiliness = get_val("oiliness", 25)
    redness = get_val("redness", 10)
    sensitivity = get_val("sensitivity", 15)
    wrinkles = get_val("wrinkles", 10)
    fine_lines = get_val("fine_lines", 15)
    dark_spots = get_val("dark_spots", 20)
    uneven_tone = get_val("uneven_tone", 20)

    # Base parameter weights
    w_acne = 1.5
    w_pigment = 1.2
    w_dryness = 1.0
    w_oiliness = 1.0
    w_redness = 1.1
    w_sensitivity = 1.3
    w_wrinkles = 0.9
    w_lines = 0.8
    w_spots = 1.1
    w_tone = 1.0

    # 1. Skin Type Personalization
    skin_type = (profile.skin_type if profile and profile.skin_type else "Normal").strip().capitalize()
    effective_oiliness = oiliness

    if skin_type == "Dry":
        # Dry skin: dryness and moisture-barrier dehydration are critical indicators
        w_dryness = 1.5
        w_lines = 1.1
    elif skin_type == "Oily":
        # Oily skin: moderate sebum is natural. Excessive oiliness (>40) + acne is prioritized
        w_acne = 1.7
        w_oiliness = 1.1
        if oiliness <= 35:
            effective_oiliness = max(0.0, oiliness * 0.7)
    elif skin_type == "Sensitive":
        # Sensitive skin: reactivity and erythema are prioritized barrier stress signals
        w_sensitivity = 1.7
        w_redness = 1.5
    elif skin_type == "Combination":
        # Combination: both T-zone sebum and U-zone dryness carry equal attention
        w_oiliness = 1.15
        w_dryness = 1.15

    # 2. User Concerns Personalization
    concerns = [str(c).lower() for c in (profile.concerns or [])] if profile else []
    if any("acne" in c or "breakout" in c or "blemish" in c for c in concerns):
        w_acne *= 1.2
    if any("pigment" in c or "dark spot" in c for c in concerns):
        w_pigment *= 1.2
        w_spots *= 1.2
    if any("dry" in c or "dehydrat" in c for c in concerns):
        w_dryness *= 1.2
    if any("red" in c or "sensitiv" in c or "irritat" in c for c in concerns):
        w_redness *= 1.2
        w_sensitivity *= 1.2
    if any("wrinkle" in c or "line" in c or "aging" in c for c in concerns):
        w_wrinkles *= 1.2
        w_lines *= 1.2

    total_weight = (
        w_acne + w_pigment + w_dryness + w_oiliness + w_redness +
        w_sensitivity + w_wrinkles + w_lines + w_spots + w_tone
    )

    weighted_severity = (
        (acne * w_acne) +
        (hyperpigmentation * w_pigment) +
        (dryness * w_dryness) +
        (effective_oiliness * w_oiliness) +
        (redness * w_redness) +
        (sensitivity * w_sensitivity) +
        (wrinkles * w_wrinkles) +
        (fine_lines * w_lines) +
        (dark_spots * w_spots) +
        (uneven_tone * w_tone)
    ) / max(1.0, total_weight)

    raw_score = 100.0 - weighted_severity
    return round(max(0.0, min(100.0, raw_score)), 1)


def calculate_lifestyle_score(profile: Optional[SkinProfile]) -> float:
    """
    Factor 2: Lifestyle Habits (20% weight).
    Evaluates reported stress level and daily physical activity rhythm.
    """
    if not profile:
        return 55.0  # Honest neutral baseline when profile is incomplete

    base = 85.0

    # Stress level impact
    stress = (profile.stress_level or "").strip().lower()
    if "high" in stress:
        base -= 15.0  # 70.0
    elif "low" in stress:
        base = min(95.0, base + 5.0)  # 90.0
    elif "moderate" in stress:
        base = 85.0

    # Activity level impact
    lifestyle = (profile.lifestyle or "").strip().lower()
    if "active" in lifestyle or "athletic" in lifestyle:
        base = min(95.0, base + 5.0)
    elif "sedentary" in lifestyle:
        base = max(55.0, base - 10.0)

    return round(max(0.0, min(100.0, base)), 1)


def calculate_sleep_score(profile: Optional[SkinProfile]) -> float:
    """
    Factor 3: Sleep Quality (15% weight).
    Evaluates nightly cellular repair duration and restfulness.
    """
    if not profile or not profile.sleep_quality:
        return 55.0  # Neutral baseline when sleep duration is not recorded

    sq = str(profile.sleep_quality).strip().lower()
    if "8+" in sq or "optimal" in sq:
        return 95.0
    elif "7-8" in sq:
        return 85.0
    elif "6-7" in sq:
        return 75.0
    elif "<6" in sq or "poor" in sq or "under 6" in sq:
        return 60.0

    return 75.0


def calculate_routine_consistency_score(db: Session, user_id: int) -> float:
    """
    Factor 4: Routine Consistency (20% weight).
    Computes completed daily skincare routine steps vs total scheduled steps.
    """
    total_logs = db.query(SkincareLog).filter(SkincareLog.user_id == user_id).count()
    if total_logs == 0:
        return 50.0  # Neutral baseline when user has not begun logging routines yet

    completed_logs = db.query(SkincareLog).filter(
        SkincareLog.user_id == user_id,
        SkincareLog.completed == 1
    ).count()

    adherence = (completed_logs / max(1, total_logs)) * 100.0
    return round(max(0.0, min(100.0, adherence)), 1)


def calculate_hydration_score(profile: Optional[SkinProfile]) -> float:
    """
    Factor 5: Hydration Level (10% weight).
    Evaluates daily water intake in liters against hydration targets.
    """
    if not profile or profile.water_intake is None:
        return 55.0  # Neutral baseline when water intake is not recorded

    try:
        liters = float(profile.water_intake)
    except (ValueError, TypeError):
        return 55.0

    if liters >= 3.0:
        return 95.0
    elif liters >= 2.0:
        return 85.0
    elif liters >= 1.0:
        return 65.0
    else:
        return 50.0


def interpret_score(score: float) -> Dict[str, str]:
    """Provides natural, empathetic skincare interpretations."""
    if score >= 80.0:
        return {
            "risk_level": "Low Risk",
            "status_label": "Thriving Barrier & Balanced Skin",
            "interpretation": "Your skin barrier is thriving with well-aligned daily care habits, hydration, and consistent routines."
        }
    elif score >= 65.0:
        return {
            "risk_level": "Moderate Risk",
            "status_label": "Balanced Skin with Focus Areas",
            "interpretation": "Your skin is doing well, with a few targeted areas for gentle improvement."
        }
    else:
        return {
            "risk_level": "High Priority Alert",
            "status_label": "Nourishing Care Needed",
            "interpretation": "Your skin barrier is calling for extra nourishing care, restorative sleep, and gentle hydration support."
        }


def compute_profile_completeness(
    profile: Optional[SkinProfile],
    has_assessment: bool,
    has_routines: bool
) -> Dict[str, Any]:
    """Calculates data completeness to show users how personalized their score is."""
    completed = 0
    total = 7
    missing = []

    if profile:
        if profile.skin_type:
            completed += 1
        else:
            missing.append("Skin type")

        if profile.concerns and len(profile.concerns) > 0:
            completed += 1
        else:
            missing.append("Primary concerns")

        if profile.lifestyle:
            completed += 1
        else:
            missing.append("Lifestyle habits")

        if profile.sleep_quality:
            completed += 1
        else:
            missing.append("Nightly sleep hours")

        if profile.water_intake is not None:
            completed += 1
        else:
            missing.append("Daily hydration goal")
    else:
        missing.extend(["Skin type", "Primary concerns", "Lifestyle habits", "Sleep hours", "Hydration goal"])

    if has_assessment:
        completed += 1
    else:
        missing.append("Skin condition assessment")

    if has_routines:
        completed += 1
    else:
        missing.append("Daily routine logs")

    pct = round((completed / total) * 100.0)
    if pct >= 80:
        confidence = "Full Personalization"
    elif pct >= 50:
        confidence = "Moderate Personalization"
    else:
        confidence = "Initial Baseline"

    return {
        "percentage": float(pct),
        "confidence_level": confidence,
        "missing_items": missing
    }


def compute_skin_health_breakdown(
    db: Session,
    user: User,
    assessment: Optional[Any] = None,
    profile: Optional[SkinProfile] = None
) -> Dict[str, Any]:
    """
    Master computation function that calculates the personalized 5-factor breakdown,
    incorporating skin type, active concerns, lifestyle, rest, and routine adherence.
    """
    if profile is None:
        profile = db.query(SkinProfile).filter(SkinProfile.user_id == user.id).first()

    has_saved_assessment = False
    if assessment is None:
        assessment = db.query(SkinAssessment).filter(
            SkinAssessment.user_id == user.id
        ).order_by(SkinAssessment.created_at.desc()).first()
        if assessment is not None:
            has_saved_assessment = True
    else:
        has_saved_assessment = True

    total_logs = db.query(SkincareLog).filter(SkincareLog.user_id == user.id).count()
    has_routines = total_logs > 0

    # Calculate 5 factor scores (0 - 100)
    cond_score = calculate_skin_condition_score(assessment, profile=profile)
    life_score = calculate_lifestyle_score(profile)
    sleep_score = calculate_sleep_score(profile)
    routine_score = calculate_routine_consistency_score(db, user.id)
    hydra_score = calculate_hydration_score(profile)

    # Compute weighted contributions
    cond_contrib = round(cond_score * WEIGHT_SKIN_CONDITION, 1)
    life_contrib = round(life_score * WEIGHT_LIFESTYLE, 1)
    sleep_contrib = round(sleep_score * WEIGHT_SLEEP, 1)
    routine_contrib = round(routine_score * WEIGHT_ROUTINE, 1)
    hydra_contrib = round(hydra_score * WEIGHT_HYDRATION, 1)

    # Composite overall score
    raw_overall = cond_contrib + life_contrib + sleep_contrib + routine_contrib + hydra_contrib
    overall_score = round(max(0.0, min(100.0, raw_overall)), 1)

    # Interpretation
    interp = interpret_score(overall_score)

    def get_factor_status(score: float) -> str:
        if score >= 85.0:
            return "Optimal"
        elif score >= 70.0:
            return "Healthy"
        elif score >= 55.0:
            return "Balanced"
        return "Needs Care"

    skin_type_label = (profile.skin_type if profile and profile.skin_type else "Normal").capitalize()

    factors = {
        "skin_condition": {
            "name": "Skin Barrier & Condition",
            "score": cond_score,
            "weight": WEIGHT_SKIN_CONDITION,
            "weighted_contribution": cond_contrib,
            "status": get_factor_status(cond_score),
            "description": f"Personalized assessment evaluated against {skin_type_label} skin characteristics and your selected concerns."
        },
        "lifestyle": {
            "name": "Lifestyle & Daily Rhythm",
            "score": life_score,
            "weight": WEIGHT_LIFESTYLE,
            "weighted_contribution": life_contrib,
            "status": get_factor_status(life_score),
            "description": "Daily activity rhythm, environmental balance, and stress management."
        },
        "sleep_quality": {
            "name": "Rest & Nighttime Recovery",
            "score": sleep_score,
            "weight": WEIGHT_SLEEP,
            "weighted_contribution": sleep_contrib,
            "status": get_factor_status(sleep_score),
            "description": "Nightly rest duration supporting cellular skin barrier repair."
        },
        "routine_consistency": {
            "name": "Daily Routine Consistency",
            "score": routine_score,
            "weight": WEIGHT_ROUTINE,
            "weighted_contribution": routine_contrib,
            "status": get_factor_status(routine_score),
            "description": "Consistency in completing your morning and evening skincare steps."
        },
        "hydration": {
            "name": "Daily Hydration Balance",
            "score": hydra_score,
            "weight": WEIGHT_HYDRATION,
            "weighted_contribution": hydra_contrib,
            "status": get_factor_status(hydra_score),
            "description": "Daily fluid intake preserving optimal epidermal moisture levels."
        }
    }

    # Summary explanation
    weakest_key = min(factors, key=lambda k: factors[k]["score"])
    strongest_key = max(factors, key=lambda k: factors[k]["score"])
    weakest_factor = factors[weakest_key]
    strongest_factor = factors[strongest_key]

    summary_text = (
        f"Overall skin health is {round(overall_score)}/100. "
        f"Your strongest daily pillar is {strongest_factor['name']}. "
        f"Focus on {weakest_factor['name']} to nurture your moisture barrier."
    )

    completeness = compute_profile_completeness(profile, has_saved_assessment, has_routines)

    return {
        "overall_score": overall_score,
        "risk_level": interp["risk_level"],
        "status_label": interp["status_label"],
        "interpretation": interp["interpretation"],
        "summary": summary_text,
        "factors": factors,
        "weights_total": TOTAL_WEIGHT,
        "calculation_version": CALCULATION_VERSION,
        "evaluated_at": datetime.now(UTC).isoformat(),
        "disclaimer": WELLNESS_DISCLAIMER,
        "profile_completeness": completeness["percentage"],
        "confidence_level": completeness["confidence_level"],
        "missing_items": completeness["missing_items"],
        "skin_type_context": skin_type_label
    }
