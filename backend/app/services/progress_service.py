from typing import Dict, Any, List, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import (
    User,
    SkinAssessment,
    SkinConcern,
    RiskFactor,
    SkinHealthScoreRecord,
    DailyChecklistLog,
    Routine,
    RoutineProfile
)
from app.logging_config import logger


def make_aware(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def is_after_cutoff(dt: Optional[datetime], cutoff: Optional[datetime]) -> bool:
    if not dt or not cutoff:
        return True
    return make_aware(dt) >= make_aware(cutoff)


def parse_date_cutoff(time_range: str) -> Optional[datetime]:
    """Resolves standard time-range query string to a cutoff timestamp."""
    now = datetime.now(timezone.utc)
    tr = (time_range or "").lower().strip()
    if tr == "7d":
        return now - timedelta(days=7)
    elif tr == "30d":
        return now - timedelta(days=30)
    elif tr == "3m":
        return now - timedelta(days=90)
    elif tr == "6m":
        return now - timedelta(days=180)
    elif tr == "all":
        return None
    return now - timedelta(days=30) # Default to 30 days


def get_progress_summary(db: Session, user: User) -> Dict[str, Any]:
    """
    Computes overall summary KPIs, recent deltas, and progress status.
    """
    # 1. Module 7 Health Scores
    health_scores = db.query(SkinHealthScoreRecord)\
        .filter(SkinHealthScoreRecord.user_id == user.id)\
        .order_by(SkinHealthScoreRecord.calculated_at.desc())\
        .limit(2)\
        .all()
        
    current_overall = health_scores[0].overall_score if len(health_scores) > 0 else None
    previous_overall = health_scores[1].overall_score if len(health_scores) > 1 else None
    
    overall_delta = 0
    overall_status = "No records yet"
    if current_overall is not None:
        if previous_overall is not None:
            overall_delta = current_overall - previous_overall
            if overall_delta > 0:
                overall_status = f"Score improved by +{overall_delta} pts"
            elif overall_delta < 0:
                overall_status = f"Score decreased by {overall_delta} pts"
            else:
                overall_status = "Score stable (no change)"
        else:
            overall_status = "Initial baseline established"

    # 2. Module 3 Skin Assessments
    assessments = db.query(SkinAssessment)\
        .filter(SkinAssessment.user_id == user.id)\
        .order_by(SkinAssessment.assessment_date.desc())\
        .limit(2)\
        .all()
        
    current_condition = assessments[0].skin_health_score if len(assessments) > 0 else None
    previous_condition = assessments[1].skin_health_score if len(assessments) > 1 else None
    condition_delta = 0
    if current_condition is not None and previous_condition is not None:
        condition_delta = current_condition - previous_condition

    # 3. Adherence rates from daily checklist logs
    now = datetime.now(timezone.utc)
    logs_all = db.query(DailyChecklistLog)\
        .filter(DailyChecklistLog.user_id == user.id)\
        .all()
        
    def calc_adherence(log_list: List[DailyChecklistLog]) -> float:
        if not log_list:
            return 0.0
        tot_comp = sum(l.completed_count for l in log_list)
        tot_items = sum(l.total_count for l in log_list)
        if tot_items == 0:
            return 0.0
        return round((tot_comp / tot_items) * 100.0, 1)

    cutoff_7d = now - timedelta(days=7)
    cutoff_30d = now - timedelta(days=30)
    
    logs_7d = [l for l in logs_all if is_after_cutoff(l.logged_at, cutoff_7d)]
    logs_30d = [l for l in logs_all if is_after_cutoff(l.logged_at, cutoff_30d)]
    
    adherence_7d = calc_adherence(logs_7d)
    adherence_30d = calc_adherence(logs_30d)
    adherence_all = calc_adherence(logs_all)

    # 4. Total counts
    total_scans = db.query(SkinAssessment).filter(SkinAssessment.user_id == user.id).count()
    total_routines = db.query(Routine).filter(Routine.user_id == user.id).count()
    total_checklist_logs = len(logs_all)

    # 5. Overview cards array
    overview_metrics = [
        {
            "title": "Overall Skin Health",
            "key": "overall_score",
            "value": current_overall if current_overall is not None else "--",
            "previous_value": previous_overall,
            "delta": f"+{overall_delta}" if overall_delta > 0 else f"{overall_delta}" if overall_delta < 0 else "0",
            "unit": "/100",
            "status": "improved" if overall_delta > 0 else "declined" if overall_delta < 0 else "stable",
            "description": overall_status
        },
        {
            "title": "Skin Condition Index",
            "key": "condition_score",
            "value": current_condition if current_condition is not None else "--",
            "previous_value": previous_condition,
            "delta": f"+{condition_delta}" if condition_delta > 0 else f"{condition_delta}" if condition_delta < 0 else "0",
            "unit": "/100",
            "status": "improved" if condition_delta > 0 else "declined" if condition_delta < 0 else "stable",
            "description": f"{total_scans} diagnostic face scans logged" if total_scans > 0 else "No face scans recorded yet"
        },
        {
            "title": "30-Day Routine Adherence",
            "key": "adherence",
            "value": adherence_30d if len(logs_30d) > 0 else adherence_all if len(logs_all) > 0 else "--",
            "previous_value": None,
            "delta": None,
            "unit": "%",
            "status": "improved" if adherence_30d >= 75 else "stable" if adherence_30d >= 50 else "declined",
            "description": f"Based on {len(logs_30d)} logged daily checklist entries" if len(logs_30d) > 0 else "Log daily checklist to track adherence"
        }
    ]

    return {
        "current_overall_score": current_overall,
        "previous_overall_score": previous_overall,
        "overall_delta": overall_delta,
        "overall_status": overall_status,
        "current_condition_score": current_condition,
        "previous_condition_score": previous_condition,
        "condition_delta": condition_delta,
        "adherence_7d": adherence_7d,
        "adherence_30d": adherence_30d,
        "adherence_all": adherence_all,
        "total_scans_count": total_scans,
        "total_routines_count": total_routines,
        "total_checklist_logs_count": total_checklist_logs,
        "overview_metrics": overview_metrics
    }


def get_progress_trends(db: Session, user: User, time_range: str = "30d") -> Dict[str, Any]:
    """
    Builds chronological multi-metric trend series filtered by date range.
    """
    cutoff = parse_date_cutoff(time_range)
    
    # 1. Fetch Health Scores in range
    score_q = db.query(SkinHealthScoreRecord).filter(SkinHealthScoreRecord.user_id == user.id)
    if cutoff:
        score_q = score_q.filter(SkinHealthScoreRecord.calculated_at >= cutoff)
    health_scores = score_q.order_by(SkinHealthScoreRecord.calculated_at.asc()).all()

    # 2. Fetch Assessments in range
    assess_q = db.query(SkinAssessment).filter(SkinAssessment.user_id == user.id)
    if cutoff:
        assess_q = assess_q.filter(SkinAssessment.assessment_date >= cutoff)
    assessments = assess_q.order_by(SkinAssessment.assessment_date.asc()).all()

    # 3. Fetch Checklist Logs in range
    log_q = db.query(DailyChecklistLog).filter(DailyChecklistLog.user_id == user.id)
    if cutoff:
        log_q = log_q.filter(DailyChecklistLog.logged_at >= cutoff)
    checklist_logs = log_q.order_by(DailyChecklistLog.logged_at.asc()).all()

    # Build Unified Trend Data Points
    # Collect all unique timestamps sorted chronologically
    points_dict = {}
    
    for hs in health_scores:
        d_key = hs.calculated_at.strftime("%Y-%m-%d %H:%M")
        date_label = hs.calculated_at.strftime("%b %d")
        if d_key not in points_dict:
            points_dict[d_key] = {
                "date_label": date_label,
                "timestamp": hs.calculated_at,
                "overall_score": hs.overall_score,
                "condition_score": hs.condition_score,
                "adherence_rate": None,
                "lifestyle_score": hs.lifestyle_score,
                "sleep_score": hs.sleep_score,
                "routine_score": hs.routine_score,
                "hydration_score": hs.hydration_score,
            }
        else:
            points_dict[d_key]["overall_score"] = hs.overall_score
            points_dict[d_key]["condition_score"] = hs.condition_score
            points_dict[d_key]["lifestyle_score"] = hs.lifestyle_score
            points_dict[d_key]["sleep_score"] = hs.sleep_score
            points_dict[d_key]["routine_score"] = hs.routine_score
            points_dict[d_key]["hydration_score"] = hs.hydration_score

    for a in assessments:
        d_key = a.assessment_date.strftime("%Y-%m-%d %H:%M")
        date_label = a.assessment_date.strftime("%b %d")
        if d_key not in points_dict:
            points_dict[d_key] = {
                "date_label": date_label,
                "timestamp": a.assessment_date,
                "overall_score": None,
                "condition_score": float(a.skin_health_score),
                "adherence_rate": None,
                "lifestyle_score": None,
                "sleep_score": None,
                "routine_score": None,
                "hydration_score": None,
            }
        else:
            points_dict[d_key]["condition_score"] = float(a.skin_health_score)

    for l in checklist_logs:
        d_key = l.logged_at.strftime("%Y-%m-%d %H:%M")
        date_label = l.logged_at.strftime("%b %d")
        rate = round(l.completion_rate * 100.0, 1)
        if d_key not in points_dict:
            points_dict[d_key] = {
                "date_label": date_label,
                "timestamp": l.logged_at,
                "overall_score": None,
                "condition_score": None,
                "adherence_rate": rate,
                "lifestyle_score": None,
                "sleep_score": None,
                "routine_score": None,
                "hydration_score": None,
            }
        else:
            points_dict[d_key]["adherence_rate"] = rate

    trend_points = sorted(points_dict.values(), key=lambda x: x["timestamp"])

    # 4. Concern severity trend over historical Module 3 scans
    concern_dict: Dict[str, List[Dict[str, Any]]] = {}
    for a in assessments:
        scan_date = a.assessment_date.strftime("%b %d")
        for c in a.concerns:
            c_name = c.concern_name
            if c_name not in concern_dict:
                concern_dict[c_name] = []
            concern_dict[c_name].append({
                "date": scan_date,
                "severity": round(c.severity, 2),
                "priority": c.priority
            })

    concern_trends = [
        {"concern_name": name, "data": points}
        for name, points in concern_dict.items()
    ]

    has_data = len(trend_points) > 0 or len(concern_trends) > 0

    return {
        "time_range": time_range,
        "total_data_points": len(trend_points),
        "has_data": has_data,
        "trend_points": trend_points,
        "concern_trends": concern_trends
    }


def get_adherence_analytics(db: Session, user: User) -> Dict[str, Any]:
    """
    Aggregates comprehensive routine compliance metrics from PostgreSQL checklist logs.
    """
    now = datetime.now(timezone.utc)
    logs_all = db.query(DailyChecklistLog)\
        .filter(DailyChecklistLog.user_id == user.id)\
        .order_by(DailyChecklistLog.logged_at.desc())\
        .all()
        
    cutoff_7d = now - timedelta(days=7)
    cutoff_30d = now - timedelta(days=30)
    
    logs_7d = [l for l in logs_all if is_after_cutoff(l.logged_at, cutoff_7d)]
    logs_30d = [l for l in logs_all if is_after_cutoff(l.logged_at, cutoff_30d)]
    
    def calc_rate(log_list: List[DailyChecklistLog]) -> float:
        if not log_list:
            return 0.0
        tot_c = sum(l.completed_count for l in log_list)
        tot_t = sum(l.total_count for l in log_list)
        return round((tot_c / tot_t) * 100.0, 1) if tot_t > 0 else 0.0

    completed_steps = sum(l.completed_count for l in logs_all)
    total_steps = sum(l.total_count for l in logs_all)
    missed_steps = max(0, total_steps - completed_steps)

    # AM vs PM adherence estimated from daily step distribution
    half_total = total_steps // 2
    half_comp = completed_steps // 2
    am_t, pm_t = half_total, total_steps - half_total
    am_c, pm_c = half_comp, completed_steps - half_comp

    am_rate = round((am_c / am_t) * 100.0, 1) if am_t > 0 else 0.0
    pm_rate = round((pm_c / pm_t) * 100.0, 1) if pm_t > 0 else 0.0

    # Recent 14 daily logs
    daily_history = [
        {
            "id": l.id,
            "date": l.logged_at.strftime("%b %d, %Y"),
            "completed": l.completed_count,
            "total": l.total_count,
            "rate": round(l.completion_rate * 100.0, 1)
        }
        for l in logs_all[:14]
    ]

    return {
        "adherence_rate_30d": calc_rate(logs_30d),
        "adherence_rate_7d": calc_rate(logs_7d),
        "adherence_rate_all": calc_rate(logs_all),
        "completed_steps": completed_steps,
        "total_steps": total_steps,
        "missed_steps": missed_steps,
        "am_adherence_rate": am_rate,
        "pm_adherence_rate": pm_rate,
        "am_completed": am_c,
        "am_total": am_t,
        "pm_completed": pm_c,
        "pm_total": pm_t,
        "daily_history": daily_history
    }


def get_comparison_data(
    db: Session,
    user: User,
    earlier_id: Optional[int] = None,
    later_id: Optional[int] = None,
    snapshot_type: str = "assessment"
) -> Optional[Dict[str, Any]]:
    """
    Compares two historical snapshots side-by-side.
    snapshot_type can be 'assessment' (Module 3 scans) or 'health_score' (Module 7 records).
    """
    if snapshot_type == "assessment":
        assessments_q = db.query(SkinAssessment)\
            .filter(SkinAssessment.user_id == user.id)\
            .order_by(SkinAssessment.assessment_date.asc())
            
        assessments = assessments_q.all()
        if len(assessments) < 2 and (not earlier_id or not later_id):
            return None
            
        rec_earlier = None
        rec_later = None
        
        if earlier_id and later_id:
            rec_earlier = db.query(SkinAssessment).filter(SkinAssessment.id == earlier_id, SkinAssessment.user_id == user.id).first()
            rec_later = db.query(SkinAssessment).filter(SkinAssessment.id == later_id, SkinAssessment.user_id == user.id).first()
        
        if not rec_earlier or not rec_later:
            if len(assessments) >= 2:
                rec_earlier = assessments[0] # Baseline
                rec_later = assessments[-1] # Most recent
            else:
                return None

        # Build concern severity mapping
        earlier_concerns = {c.concern_name: c.severity for c in rec_earlier.concerns}
        later_concerns = {c.concern_name: c.severity for c in rec_later.concerns}
        all_concern_names = sorted(set(list(earlier_concerns.keys()) + list(later_concerns.keys())))
        
        concerns_comparison = []
        for name in all_concern_names:
            e_sev = earlier_concerns.get(name)
            l_sev = later_concerns.get(name)
            
            if e_sev is not None and l_sev is not None:
                delta = round(l_sev - e_sev, 2)
                if delta < -0.2:
                    status = "Improved" # Severity decreased
                elif delta > 0.2:
                    status = "Increased"
                else:
                    status = "Unchanged"
            elif e_sev is not None and l_sev is None:
                delta = round(-e_sev, 2)
                status = "Resolved"
            else:
                delta = round(l_sev, 2) if l_sev else 0.0
                status = "New"
                
            concerns_comparison.append({
                "concern_name": name,
                "earlier_severity": round(e_sev, 2) if e_sev is not None else None,
                "later_severity": round(l_sev, 2) if l_sev is not None else None,
                "delta": delta,
                "status": status
            })

        earlier_risks = [r.risk_name for r in rec_earlier.risks]
        later_risks = [r.risk_name for r in rec_later.risks]
        
        days_between = max(0, (make_aware(rec_later.assessment_date) - make_aware(rec_earlier.assessment_date)).days)
        cond_delta = rec_later.skin_health_score - rec_earlier.skin_health_score
        
        verdict = f"Diagnostic Skin Condition Score changed by {cond_delta:+d} points over {days_between} days."
        if cond_delta > 0:
            verdict += " Observed improvement in overall barrier condition."
        elif cond_delta < 0:
            verdict += " Mild decline detected; review active routine steps."
        else:
            verdict += " Metrics have remained consistent."

        return {
            "earlier_date": rec_earlier.assessment_date,
            "later_date": rec_later.assessment_date,
            "days_between": days_between,
            "earlier_overall_score": None,
            "later_overall_score": None,
            "overall_delta": None,
            "earlier_condition_score": float(rec_earlier.skin_health_score),
            "later_condition_score": float(rec_later.skin_health_score),
            "condition_delta": float(cond_delta),
            "earlier_components": None,
            "later_components": None,
            "concerns_comparison": concerns_comparison,
            "earlier_risks": earlier_risks,
            "later_risks": later_risks,
            "summary_verdict": verdict
        }

    else: # Module 7 Health Scores Comparison
        scores_q = db.query(SkinHealthScoreRecord)\
            .filter(SkinHealthScoreRecord.user_id == user.id)\
            .order_by(SkinHealthScoreRecord.calculated_at.asc())
            
        scores = scores_q.all()
        if len(scores) < 2 and (not earlier_id or not later_id):
            return None
            
        rec_earlier = None
        rec_later = None
        if earlier_id and later_id:
            rec_earlier = db.query(SkinHealthScoreRecord).filter(SkinHealthScoreRecord.id == earlier_id, SkinHealthScoreRecord.user_id == user.id).first()
            rec_later = db.query(SkinHealthScoreRecord).filter(SkinHealthScoreRecord.id == later_id, SkinHealthScoreRecord.user_id == user.id).first()
            
        if not rec_earlier or not rec_later:
            if len(scores) >= 2:
                rec_earlier = scores[0]
                rec_later = scores[-1]
            else:
                return None

        days_between = max(0, (make_aware(rec_later.calculated_at) - make_aware(rec_earlier.calculated_at)).days)
        overall_delta = rec_later.overall_score - rec_earlier.overall_score
        
        earlier_comps = {
            "Condition (35%)": rec_earlier.condition_score,
            "Lifestyle (20%)": rec_earlier.lifestyle_score,
            "Sleep (15%)": rec_earlier.sleep_score,
            "Routine (20%)": rec_earlier.routine_score,
            "Hydration (10%)": rec_earlier.hydration_score,
        }
        later_comps = {
            "Condition (35%)": rec_later.condition_score,
            "Lifestyle (20%)": rec_later.lifestyle_score,
            "Sleep (15%)": rec_later.sleep_score,
            "Routine (20%)": rec_later.routine_score,
            "Hydration (10%)": rec_later.hydration_score,
        }

        verdict = f"Overall Skin Health Score changed by {overall_delta:+d} points over {days_between} days."

        return {
            "earlier_date": rec_earlier.calculated_at,
            "later_date": rec_later.calculated_at,
            "days_between": days_between,
            "earlier_overall_score": rec_earlier.overall_score,
            "later_overall_score": rec_later.overall_score,
            "overall_delta": overall_delta,
            "earlier_condition_score": rec_earlier.condition_score,
            "later_condition_score": rec_later.condition_score,
            "condition_delta": round(rec_later.condition_score - rec_earlier.condition_score, 1),
            "earlier_components": earlier_comps,
            "later_components": later_comps,
            "concerns_comparison": [],
            "earlier_risks": [],
            "later_risks": [],
            "summary_verdict": verdict
        }


def get_available_snapshots(db: Session, user: User) -> List[Dict[str, Any]]:
    """
    Returns available historical snapshots list for comparison dropdown selectors.
    """
    snapshots = []
    
    # 1. Assessments
    assessments = db.query(SkinAssessment)\
        .filter(SkinAssessment.user_id == user.id)\
        .order_by(SkinAssessment.assessment_date.desc())\
        .all()
        
    for idx, a in enumerate(assessments):
        d_str = a.assessment_date.strftime("%b %d, %Y")
        snapshots.append({
            "id": a.id,
            "type": "assessment",
            "date": a.assessment_date,
            "label": f"Scan on {d_str} (Score: {a.skin_health_score}/100)",
            "score": a.skin_health_score
        })

    # 2. Health Scores
    scores = db.query(SkinHealthScoreRecord)\
        .filter(SkinHealthScoreRecord.user_id == user.id)\
        .order_by(SkinHealthScoreRecord.calculated_at.desc())\
        .all()
        
    for s in scores:
        d_str = s.calculated_at.strftime("%b %d, %Y")
        snapshots.append({
            "id": s.id,
            "type": "health_score",
            "date": s.calculated_at,
            "label": f"Health Score Log ({d_str} — {s.overall_score}/100)",
            "score": s.overall_score
        })

    return snapshots
