from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from app.models import (
    User,
    SkinAssessment,
    RoutineProfile,
    SkinHealthScoreRecord,
    DailyChecklistLog
)
from app.logging_config import logger


def compute_skin_condition_score(db: Session, user: User, profile: Optional[RoutineProfile]) -> Tuple[float, bool, Optional[int]]:
    """
    Computes Skin Condition Assessment score (35% weight).
    Uses the latest Module 3 SkinAssessment result if available.
    Falls back gracefully to profile-derived baseline if no scan exists yet.
    """
    latest_assessment = db.query(SkinAssessment)\
        .filter(SkinAssessment.user_id == user.id)\
        .order_by(SkinAssessment.assessment_date.desc())\
        .first()
        
    if latest_assessment:
        score = float(max(0, min(100, latest_assessment.skin_health_score)))
        return score, True, latest_assessment.id
        
    # Baseline condition score calculation from 28-question profile if no photo scan yet
    if profile:
        base_score = 90.0
        # Deduct points for active concerns
        concerns_count = len(profile.concerns or [])
        base_score -= min(concerns_count * 4.0, 20.0)
        
        # Deduct for acne severity
        acne = (profile.acne_severity or "").lower()
        if "very severe" in acne or "severe" in acne:
            base_score -= 20.0
        elif "moderate" in acne:
            base_score -= 12.0
        elif "mild" in acne:
            base_score -= 5.0
            
        # Deduct for redness/sensitivity
        redness = (profile.redness_frequency or "").lower()
        if "frequently" in redness:
            base_score -= 15.0
        elif "sometimes" in redness:
            base_score -= 8.0
            
        sens = (profile.sensitivity or "").lower()
        if "very sensitive" in sens:
            base_score -= 10.0
        elif "moderately sensitive" in sens:
            base_score -= 5.0
            
        score = float(max(20.0, min(100.0, base_score)))
        return score, False, None
        
    return 70.0, False, None


def compute_lifestyle_score(profile: Optional[RoutineProfile]) -> Tuple[float, List[str]]:
    """
    Computes Lifestyle Habits score (20% weight) normalized from 28-question answers:
    - Exercise (Q17)
    - Stress (Q16)
    - Pollution exposure (Q20)
    - Sunlight & Outdoor exposure (Q18 & Q21)
    - Climate (Q19)
    """
    if not profile:
        return 70.0, ["Complete your skin profile to refine lifestyle score."]
        
    insights = []
    
    # 1. Exercise (Q17)
    ex_str = profile.exercise_frequency or ""
    if "5+" in ex_str:
        ex_val = 100.0
    elif "3–4" in ex_str or "3-4" in ex_str:
        ex_val = 85.0
    elif "1–2" in ex_str or "1-2" in ex_str:
        ex_val = 65.0
    elif "never" in ex_str.lower():
        ex_val = 40.0
        insights.append("Regular physical activity promotes facial circulation and toxin clearance.")
    else:
        ex_val = 70.0

    # 2. Stress (Q16)
    st_str = (profile.stress_level or "").lower()
    if "low" in st_str:
        st_val = 100.0
    elif "moderate" in st_str:
        st_val = 75.0
    elif "very high" in st_str:
        st_val = 30.0
        insights.append("High stress triggers cortisol spikes, accelerating sebum production and breakouts.")
    elif "high" in st_str:
        st_val = 50.0
        insights.append("Managing daily stress helps reduce skin barrier flare-ups.")
    else:
        st_val = 70.0

    # 3. Pollution (Q20)
    pol_str = (profile.pollution_exposure or "").lower()
    if "low" in pol_str:
        pol_val = 100.0
    elif "moderate" in pol_str:
        pol_val = 70.0
    elif "high" in pol_str:
        pol_val = 40.0
        insights.append("High pollution exposure increases free-radical oxidative stress; consider antioxidant serums.")
    else:
        pol_val = 70.0

    # 4. Sun & Outdoor Exposure (Q18 & Q21)
    out_str = profile.outdoor_hours or ""
    sun_str = (profile.sunlight_exposure or "").lower()
    
    if "<1" in out_str:
        out_val = 90.0
    elif "1–2" in out_str or "1-2" in out_str:
        out_val = 95.0
    elif "2–4" in out_str or "2-4" in out_str:
        out_val = 80.0
    else: # >4 hours
        out_val = 65.0
        
    if "very little" in sun_str or "low" in sun_str:
        sun_val = 90.0
    elif "moderate" in sun_str:
        sun_val = 95.0
    else: # high
        sun_val = 60.0
        insights.append("High UV exposure accelerates photoaging. Apply broad-spectrum SPF 30+ daily.")
        
    sun_outdoor_val = (out_val + sun_val) / 2.0

    # 5. Climate (Q19)
    clim_str = (profile.climate or "").lower()
    if "moderate" in clim_str:
        clim_val = 95.0
    elif "humid" in clim_str:
        clim_val = 75.0
    elif "cold" in clim_str:
        clim_val = 70.0
    elif "dry" in clim_str:
        clim_val = 65.0
    else:
        clim_val = 80.0

    lifestyle_score = round((ex_val + st_val + pol_val + sun_outdoor_val + clim_val) / 5.0, 1)
    return max(0.0, min(100.0, lifestyle_score)), insights


def compute_sleep_score(profile: Optional[RoutineProfile]) -> Tuple[float, List[str]]:
    """
    Computes Sleep Quality score (15% weight) using non-overlapping ranges:
    - <5 hours -> 35
    - 5 to <6 hours (5–6) -> 60
    - 6 to <7 hours (6–7) -> 85
    - 7 to 8 hours (7–8) -> 100
    - >8 hours -> 80
    """
    if not profile:
        return 75.0, ["Complete skin profile to evaluate sleep score."]
        
    s_str = profile.sleep_hours or ""
    insights = []
    
    if "<5" in s_str:
        score = 35.0
        insights.append("Under 5 hours of sleep impairs nocturnal skin cellular repair and increases puffiness.")
    elif "5–6" in s_str or "5-6" in s_str:
        score = 60.0
        insights.append("Aim for 7–8 hours of restful sleep to optimize skin barrier regeneration.")
    elif "6–7" in s_str or "6-7" in s_str:
        score = 85.0
    elif "7–8" in s_str or "7-8" in s_str:
        score = 100.0
    elif ">8" in s_str:
        score = 80.0
    else:
        score = 75.0
        
    return score, insights


def compute_routine_consistency_score(db: Session, user: User, profile: Optional[RoutineProfile]) -> Tuple[float, List[str]]:
    """
    Computes Routine Consistency score (20% weight):
    - Uses actual checklist adherence data from daily_checklist_logs if available.
    - Falls back to 28-question profile baseline (Q9 & Q11) if no checklist logs yet.
    """
    insights = []
    
    # Check for actual database checklist adherence logs
    logs = db.query(DailyChecklistLog)\
        .filter(DailyChecklistLog.user_id == user.id)\
        .order_by(DailyChecklistLog.logged_at.desc())\
        .limit(30)\
        .all()
        
    if logs and len(logs) > 0:
        total_completed = sum(l.completed_count for l in logs)
        total_items = sum(l.total_count for l in logs)
        if total_items > 0:
            rate = (total_completed / total_items) * 100.0
            score = round(max(0.0, min(100.0, rate)), 1)
            if score < 70:
                insights.append("Consistent daily routine compliance is essential for long-term skin improvements.")
            return score, insights

    # Baseline from 28-question questionnaire
    if profile:
        has_routine = (profile.has_routine or "").lower() == "yes"
        if not has_routine:
            return 30.0, ["Starting and sticking to a consistent AM/PM routine improves results drastically."]
            
        freq = profile.routine_frequency or ""
        if "every day" in freq.lower():
            score = 95.0
        elif "4–6" in freq or "4-6" in freq:
            score = 80.0
        elif "2–3" in freq or "2-3" in freq:
            score = 60.0
            insights.append("Try adhering to your routine at least 5 days a week for best efficacy.")
        else: # Rarely
            score = 40.0
            insights.append("Inconsistent skincare application limits the efficacy of active ingredients.")
        return score, insights
        
    return 70.0, ["Log daily skincare checklist steps to track routine consistency."]


def compute_hydration_score(profile: Optional[RoutineProfile]) -> Tuple[float, List[str]]:
    """
    Computes Hydration Level score (10% weight) from 28-question water intake (Q15):
    - 2–3 L -> 100 (Optimal)
    - >3 L -> 95
    - 1–2 L -> 75
    - <1 L -> 40
    """
    if not profile:
        return 70.0, ["Complete skin profile to evaluate hydration score."]
        
    w_str = profile.water_intake or ""
    insights = []
    
    if "2–3" in w_str or "2-3" in w_str:
        score = 100.0
    elif ">3" in w_str:
        score = 95.0
    elif "1–2" in w_str or "1-2" in w_str:
        score = 75.0
        insights.append("Increasing daily water intake to 2–3 L boosts skin elasticity and cell turgor.")
    elif "<1" in w_str:
        score = 40.0
        insights.append("Low water intake causes epidermal dehydration, exaggerating fine lines and dullness.")
    else:
        score = 70.0
        
    return score, insights


def evaluate_overall_skin_health(
    db: Session, 
    user: User, 
    persist: bool = False
) -> Dict[str, Any]:
    """
    Calculates the overall weighted skin health score:
    - Skin Condition: 35%
    - Lifestyle Habits: 20%
    - Sleep Quality: 15%
    - Routine Consistency: 20%
    - Hydration Level: 10%
    
    If persist=True, saves a new snapshot record to skin_health_scores in PostgreSQL.
    """
    profile = db.query(RoutineProfile).filter(RoutineProfile.user_id == user.id).first()
    has_profile = profile is not None
    
    # 1. Condition (35%)
    cond_score, has_scan, assessment_id = compute_skin_condition_score(db, user, profile)
    
    # 2. Lifestyle (20%)
    life_score, life_insights = compute_lifestyle_score(profile)
    
    # 3. Sleep (15%)
    sleep_score, sleep_insights = compute_sleep_score(profile)
    
    # 4. Consistency (20%)
    rout_score, rout_insights = compute_routine_consistency_score(db, user, profile)
    
    # 5. Hydration (10%)
    hydr_score, hydr_insights = compute_hydration_score(profile)
    
    # Weighted arithmetic: 0.35 + 0.20 + 0.15 + 0.20 + 0.10 = 1.00
    weighted_total = (
        0.35 * cond_score +
        0.20 * life_score +
        0.15 * sleep_score +
        0.20 * rout_score +
        0.10 * hydr_score
    )
    overall_score = max(0, min(100, int(round(weighted_total))))
    
    # Determine Status and UI badge color
    if overall_score >= 85:
        status_label = "Excellent"
        status_color = "#10b981" # Green
    elif overall_score >= 70:
        status_label = "Good"
        status_color = "#3b82f6" # Brand Blue
    elif overall_score >= 50:
        status_label = "Fair"
        status_color = "#f59e0b" # Amber
    else:
        status_label = "Needs Attention"
        status_color = "#ef4444" # Red
        
    def get_comp_status(val: float) -> str:
        if val >= 85: return "Excellent"
        if val >= 70: return "Good"
        if val >= 50: return "Fair"
        return "Needs Attention"
        
    components = [
        {
            "name": "Skin Condition Assessment",
            "key": "condition",
            "score": cond_score,
            "weight": 0.35,
            "weighted_score": round(cond_score * 0.35, 1),
            "status": get_comp_status(cond_score),
            "description": "Derived from AI computer vision face scans & diagnostic condition checks.",
            "insights": ["Based on active computer vision skin scan metrics."] if has_scan else ["Estimate from profile questionnaire. Upload a face scan for clinical precision."]
        },
        {
            "name": "Lifestyle Habits",
            "key": "lifestyle",
            "score": life_score,
            "weight": 0.20,
            "weighted_score": round(life_score * 0.20, 1),
            "status": get_comp_status(life_score),
            "description": "Evaluation of exercise frequency, stress management, sun & pollution defenses.",
            "insights": life_insights
        },
        {
            "name": "Sleep Quality",
            "key": "sleep",
            "score": sleep_score,
            "weight": 0.15,
            "weighted_score": round(sleep_score * 0.15, 1),
            "status": get_comp_status(sleep_score),
            "description": "Assessment of cellular repair duration and nocturnal rest patterns.",
            "insights": sleep_insights
        },
        {
            "name": "Routine Consistency",
            "key": "routine",
            "score": rout_score,
            "weight": 0.20,
            "weighted_score": round(rout_score * 0.20, 1),
            "status": get_comp_status(rout_score),
            "description": "Tracked adherence rate to daily personalized AM/PM skincare steps.",
            "insights": rout_insights
        },
        {
            "name": "Hydration Level",
            "key": "hydration",
            "score": hydr_score,
            "weight": 0.10,
            "weighted_score": round(hydr_score * 0.10, 1),
            "status": get_comp_status(hydr_score),
            "description": "Evaluation of daily water intake volume supporting skin barrier turgor.",
            "insights": hydr_insights
        }
    ]
    
    # Combined actionable insights list
    all_insights = []
    for c in components:
        all_insights.extend(c["insights"])
    if not all_insights:
        all_insights = ["Your skin wellness indices are well balanced. Maintain your daily skincare regimen!"]

    # Calculate delta change against previous recorded history
    last_record = db.query(SkinHealthScoreRecord)\
        .filter(SkinHealthScoreRecord.user_id == user.id)\
        .order_by(SkinHealthScoreRecord.calculated_at.desc())\
        .first()
        
    delta_change = 0
    delta_direction = "initial"
    if last_record:
        delta_change = overall_score - last_record.overall_score
        if delta_change > 0:
            delta_direction = "improved"
        elif delta_change < 0:
            delta_direction = "declined"
        else:
            delta_direction = "maintained"
            
    record_id = None
    calculated_at = datetime.utcnow()
    
    if persist:
        db_record = SkinHealthScoreRecord(
            user_id=user.id,
            overall_score=overall_score,
            condition_score=cond_score,
            lifestyle_score=life_score,
            sleep_score=sleep_score,
            routine_score=rout_score,
            hydration_score=hydr_score,
            assessment_id=assessment_id,
            routine_profile_id=profile.id if profile else None,
            breakdown={"components": components, "insights": all_insights}
        )
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
        record_id = db_record.id
        calculated_at = db_record.calculated_at
        logger.info(f"Module 7: Persisted new Skin Health Score record #{record_id} for user {user.email} (Score: {overall_score})")
    elif last_record:
        record_id = last_record.id
        calculated_at = last_record.calculated_at

    return {
        "id": record_id,
        "user_id": user.id,
        "overall_score": overall_score,
        "condition_score": cond_score,
        "lifestyle_score": life_score,
        "sleep_score": sleep_score,
        "routine_score": rout_score,
        "hydration_score": hydr_score,
        "status": status_label,
        "status_color": status_color,
        "delta_change": delta_change,
        "delta_direction": delta_direction,
        "components": components,
        "insights": all_insights,
        "calculated_at": calculated_at,
        "has_profile": has_profile,
        "has_assessment_scan": has_scan
    }


def get_or_create_current_score(db: Session, user: User) -> Dict[str, Any]:
    """
    Fetches latest calculated score from database.
    If no score has been calculated yet for the user, calculates and stores the initial record.
    Avoids creating redundant duplicates on ordinary page refreshes.
    """
    last_record = db.query(SkinHealthScoreRecord)\
        .filter(SkinHealthScoreRecord.user_id == user.id)\
        .order_by(SkinHealthScoreRecord.calculated_at.desc())\
        .first()
        
    if last_record:
        # Check previous record to compute delta
        prev_record = db.query(SkinHealthScoreRecord)\
            .filter(SkinHealthScoreRecord.user_id == user.id, SkinHealthScoreRecord.id != last_record.id)\
            .order_by(SkinHealthScoreRecord.calculated_at.desc())\
            .first()
            
        delta_change = 0
        delta_direction = "initial"
        if prev_record:
            delta_change = last_record.overall_score - prev_record.overall_score
            if delta_change > 0:
                delta_direction = "improved"
            elif delta_change < 0:
                delta_direction = "declined"
            else:
                delta_direction = "maintained"
                
        # Format components and breakdown from saved record or re-synthesize
        breakdown_data = last_record.breakdown or {}
        components = breakdown_data.get("components", [])
        insights = breakdown_data.get("insights", [])
        
        # If components not cached in breakdown JSON, build them
        if not components:
            score_data = evaluate_overall_skin_health(db, user, persist=False)
            components = score_data["components"]
            insights = score_data["insights"]

        status_label = "Good"
        status_color = "#3b82f6"
        if last_record.overall_score >= 85:
            status_label = "Excellent"
            status_color = "#10b981"
        elif last_record.overall_score >= 70:
            status_label = "Good"
            status_color = "#3b82f6"
        elif last_record.overall_score >= 50:
            status_label = "Fair"
            status_color = "#f59e0b"
        else:
            status_label = "Needs Attention"
            status_color = "#ef4444"

        profile = db.query(RoutineProfile).filter(RoutineProfile.user_id == user.id).first()
        has_scan = last_record.assessment_id is not None
        
        return {
            "id": last_record.id,
            "user_id": user.id,
            "overall_score": last_record.overall_score,
            "condition_score": last_record.condition_score,
            "lifestyle_score": last_record.lifestyle_score,
            "sleep_score": last_record.sleep_score,
            "routine_score": last_record.routine_score,
            "hydration_score": last_record.hydration_score,
            "status": status_label,
            "status_color": status_color,
            "delta_change": delta_change,
            "delta_direction": delta_direction,
            "components": components,
            "insights": insights,
            "calculated_at": last_record.calculated_at,
            "has_profile": profile is not None,
            "has_assessment_scan": has_scan
        }
    else:
        # First time calculation: calculate and persist initial score
        return evaluate_overall_skin_health(db, user, persist=True)
