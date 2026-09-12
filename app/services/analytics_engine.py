"""
Analytics Engine — Progress Tracking, Trend Analysis, Improvement Analysis & Before/After Comparisons
======================================================================================================
Provides clinical-grade computational tracking of:
1. Longitudinal Skin Health Score & Sub-factor Trends
2. Routine Check-in Adherence & Habit Compliance
3. Granular Concern Resolution & Skin Milestone Improvement Audits
4. Photo Scan Session Pairings for Visual Before/After Comparison
"""

from datetime import date, datetime, timedelta, timezone
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session

from app.models import (
    SkinProfile,
    AssessmentHistory,
    AssessmentRisk,
    AssessmentPriority,
    RoutineCheckin,
    User,
)
from ML_models.scoring_engine import (
    calculate_skin_condition_score,
    calculate_lifestyle_score,
    calculate_sleep_score,
    calculate_routine_consistency_score,
    calculate_hydration_score,
)


def get_user_trend_analytics(user_id: int, db: Session) -> Dict[str, Any]:
    """
    Computes time-series trend datasets for:
    - Historical Skin Health Score progression
    - 30-Day Routine Check-in Adherence rates
    - 5-factor score trajectory (skin condition, lifestyle, sleep, routine consistency, hydration)
    """
    # 1. Fetch chronological assessment history
    assessments = (
        db.query(AssessmentHistory)
        .filter(AssessmentHistory.user_id == user_id)
        .order_by(AssessmentHistory.assessment_date.asc())
        .all()
    )

    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user_id).first()
    current_score = profile.skin_health_score if profile and profile.skin_health_score else 0

    score_history = []
    for a in assessments:
        date_str = a.assessment_date.strftime("%Y-%m-%d") if a.assessment_date else ""
        label = a.assessment_date.strftime("%b %d") if a.assessment_date else f"#{a.assessment_id}"
        score_history.append({
            "assessment_id": a.assessment_id,
            "date": date_str,
            "label": label,
            "score": a.skin_health_score,
            "category": a.skin_health_category,
            "risk_level": a.overall_risk_level,
            "trigger_source": a.trigger_source,
            "has_image": bool(a.image_url),
        })

    # If no historical assessments yet but user has a current profile score, provide baseline point
    if not score_history and current_score > 0:
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        score_history.append({
            "assessment_id": 0,
            "date": today_str,
            "label": "Initial",
            "score": current_score,
            "category": "Current",
            "risk_level": "Low",
            "trigger_source": "profile_setup",
            "has_image": bool(profile.image_url) if profile else False,
        })

    # 2. Fetch Routine Check-in history (Last 30 days)
    today = date.today()
    start_date = today - timedelta(days=29)
    start_str = start_date.strftime("%Y-%m-%d")

    checkins = (
        db.query(RoutineCheckin)
        .filter(RoutineCheckin.user_id == user_id, RoutineCheckin.checkin_date >= start_str)
        .order_by(RoutineCheckin.checkin_date.asc())
        .all()
    )

    checkin_map = {c.checkin_date: c for c in checkins}

    adherence_timeline = []
    total_slots = 0
    completed_slots = 0

    # Build 14-day and 30-day timeline
    for i in range(30):
        d = start_date + timedelta(days=i)
        d_str = d.strftime("%Y-%m-%d")
        c = checkin_map.get(d_str)

        morning = c.morning_completed if c else False
        evening = c.evening_completed if c else False

        day_total = (1 if morning else 0) + (1 if evening else 0)
        day_rate = int(round((day_total / 2.0) * 100))

        if c or d <= today:
            total_slots += 2
            completed_slots += day_total

        adherence_timeline.append({
            "date": d_str,
            "label": d.strftime("%b %d"),
            "morning": morning,
            "evening": evening,
            "completion_rate": day_rate,
        })

    overall_adherence_pct = (
        int(round((completed_slots / total_slots) * 100)) if total_slots > 0 else 0
    )

    # 3. Weekly Aggregations (Last 4 weeks)
    weekly_adherence = []
    for w in range(4):
        w_start = today - timedelta(days=(3 - w) * 7 + 6)
        w_end = today - timedelta(days=(3 - w) * 7)
        w_checkins = [
            c for c in checkins
            if w_start.strftime("%Y-%m-%d") <= c.checkin_date <= w_end.strftime("%Y-%m-%d")
        ]
        w_completed = sum((1 if c.morning_completed else 0) + (1 if c.evening_completed else 0) for c in w_checkins)
        w_possible = 14  # 7 days * 2
        w_pct = int(round((w_completed / w_possible) * 100))
        weekly_adherence.append({
            "week_label": f"Wk {w + 1} ({w_start.strftime('%b %d')})",
            "adherence_percentage": min(100, w_pct),
        })

    # 4. Trajectory Metrics
    initial_score = score_history[0]["score"] if score_history else current_score
    peak_score = max((s["score"] for s in score_history), default=current_score)
    score_change = current_score - initial_score

    # Calculate Current Streak
    curr_date = today
    streak = 0
    all_checkin_map = {c.checkin_date: (c.morning_completed or c.evening_completed) for c in checkins}
    
    t_str = curr_date.strftime("%Y-%m-%d")
    if all_checkin_map.get(t_str, False):
        streak += 1
        curr_date -= timedelta(days=1)
    else:
        yesterday_str = (curr_date - timedelta(days=1)).strftime("%Y-%m-%d")
        if all_checkin_map.get(yesterday_str, False):
            curr_date -= timedelta(days=1)
        else:
            curr_date = None

    while curr_date:
        d_str = curr_date.strftime("%Y-%m-%d")
        if all_checkin_map.get(d_str, False):
            streak += 1
            curr_date -= timedelta(days=1)
        else:
            break

    return {
        "score_history": score_history,
        "adherence_timeline": adherence_timeline[-14:],  # Last 14 days for sharp visual chart
        "adherence_timeline_30d": adherence_timeline,
        "weekly_adherence": weekly_adherence,
        "summary": {
            "initial_score": initial_score,
            "current_score": current_score,
            "peak_score": peak_score,
            "score_change": score_change,
            "overall_adherence_pct": overall_adherence_pct,
            "current_streak": streak,
            "total_assessments_logged": len(score_history),
            "total_checkin_days": len(checkins),
        }
    }


def get_user_improvement_analysis(user_id: int, db: Session) -> Dict[str, Any]:
    """
    Computes a granular before/after improvement analysis:
    - Overall skin health score delta & velocity
    - Concern-by-concern resolution audit (Resolved, Improved, Lingering)
    - Dynamic Skin Goal Milestones (Hydration, Radiance, Barrier Resilience)
    - Correlation between routine adherence and skin improvement
    - AI-generated dermatological clinical takeaways
    """
    assessments = (
        db.query(AssessmentHistory)
        .filter(AssessmentHistory.user_id == user_id)
        .order_by(AssessmentHistory.assessment_date.asc())
        .all()
    )

    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user_id).first()
    current_score = profile.skin_health_score if profile and profile.skin_health_score else 0

    if not assessments:
        # Baseline only
        return {
            "status": "baseline_only",
            "has_comparative_data": False,
            "baseline_date": (profile.created_at.strftime("%Y-%m-%d") if profile and profile.created_at else date.today().strftime("%Y-%m-%d")),
            "latest_date": date.today().strftime("%Y-%m-%d"),
            "days_elapsed": 0,
            "score_delta": 0,
            "percent_gain": 0.0,
            "baseline_score": current_score,
            "current_score": current_score,
            "concerns_audit": [],
            "milestones": [
                {"title": "Hydration & Barrier Repair", "progress": min(95, max(40, current_score)), "status": "In Progress"},
                {"title": "Radiance & Cell Turnover", "progress": min(90, max(35, int(current_score * 0.9))), "status": "In Progress"},
                {"title": "Tone Uniformity & Clarification", "progress": min(90, max(30, int(current_score * 0.85))), "status": "In Progress"},
            ],
            "insights": [
                "Baseline skin assessment created. Log routine check-ins and follow-up scans to track skin barrier recovery."
            ],
        }

    baseline_assessment = assessments[0]
    latest_assessment = assessments[-1]

    baseline_date = baseline_assessment.assessment_date
    latest_date = latest_assessment.assessment_date
    days_elapsed = max(0, (latest_date - baseline_date).days) if (latest_date and baseline_date) else 0

    baseline_score = baseline_assessment.skin_health_score
    latest_score = latest_assessment.skin_health_score
    score_delta = latest_score - baseline_score
    percent_gain = round(((score_delta) / baseline_score * 100), 1) if baseline_score > 0 else 0.0

    # 1. Concern Resolution Audit
    baseline_priorities = (
        db.query(AssessmentPriority)
        .filter(AssessmentPriority.assessment_id == baseline_assessment.assessment_id)
        .all()
    )
    latest_priorities = (
        db.query(AssessmentPriority)
        .filter(AssessmentPriority.assessment_id == latest_assessment.assessment_id)
        .all()
    )

    baseline_concerns_map = {p.concern_name.lower(): p for p in baseline_priorities}
    latest_concerns_map = {p.concern_name.lower(): p for p in latest_priorities}

    all_concern_names = set(list(baseline_concerns_map.keys()) + list(latest_concerns_map.keys()))
    concerns_audit = []

    for c_name in sorted(all_concern_names):
        b_prio = baseline_concerns_map.get(c_name)
        l_prio = latest_concerns_map.get(c_name)

        if b_prio and not l_prio:
            status = "Resolved"
            change_label = "100% Cleared"
            status_class = "resolved"
            icon = "✅"
        elif b_prio and l_prio:
            score_diff = b_prio.priority_score - l_prio.priority_score
            if score_diff > 0:
                pct_reduction = int(round((score_diff / max(1, b_prio.priority_score)) * 100))
                status = "Improved"
                change_label = f"-{pct_reduction}% Severity"
                status_class = "improved"
                icon = "📉"
            elif score_diff < 0:
                status = "Elevated"
                change_label = f"+{abs(score_diff)} pts"
                status_class = "elevated"
                icon = "⚠️"
            else:
                status = "Stable"
                change_label = "Unchanged"
                status_class = "stable"
                icon = "➡️"
        else:
            status = "New Concern"
            change_label = "Recently Noted"
            status_class = "new"
            icon = "🔍"

        display_name = (b_prio.concern_name if b_prio else l_prio.concern_name).title()
        concerns_audit.append({
            "concern": display_name,
            "status": status,
            "status_class": status_class,
            "icon": icon,
            "change_label": change_label,
            "baseline_severity": b_prio.severity if b_prio else "None",
            "current_severity": l_prio.severity if l_prio else "Resolved",
        })

    # 2. Dynamic Milestones calculation
    resolved_count = sum(1 for c in concerns_audit if c["status"] in ["Resolved", "Improved"])
    total_concerns_count = max(1, len(concerns_audit))
    concern_resolution_rate = int(round((resolved_count / total_concerns_count) * 100))

    # Hydration progress based on latest score + resolution
    hydration_prog = min(100, max(30, int(latest_score * 0.95 + (10 if score_delta > 0 else 0))))
    radiance_prog = min(100, max(25, int(latest_score * 0.90 + concern_resolution_rate * 0.1)))
    barrier_prog = min(100, max(35, int(latest_score * 0.85 + (15 if score_delta >= 5 else 0))))

    milestones = [
        {
            "title": "Hydration & Barrier Repair",
            "progress": hydration_prog,
            "delta_label": f"{'+' if score_delta > 0 else ''}{score_delta} pts vs baseline",
            "status": "Optimal" if hydration_prog >= 80 else "Improving",
        },
        {
            "title": "Radiance & Cellular Renewal",
            "progress": radiance_prog,
            "delta_label": f"{concern_resolution_rate}% concerns softened",
            "status": "Optimal" if radiance_prog >= 80 else "In Progress",
        },
        {
            "title": "Tone Uniformity & Resilience",
            "progress": barrier_prog,
            "delta_label": f"{len(assessments)} sessions logged",
            "status": "Optimal" if barrier_prog >= 80 else "Active Recovery",
        },
    ]

    # 3. Clinical progress insights
    insights = []
    if score_delta >= 10:
        insights.append(
            f"Significant dermatological improvement (+{score_delta} points). Cellular turnover and barrier recovery are visibly advancing."
        )
    elif score_delta > 0:
        insights.append(
            f"Steady positive progress (+{score_delta} points). Consistent routine application is sustaining moisture retention."
        )
    elif score_delta == 0:
        insights.append(
            "Skin metrics have stabilized. Maintain active application and ensure proper daily UV protection."
        )
    else:
        insights.append(
            f"Skin score is slightly down ({score_delta} points). Consider checking for allergen triggers or seasonal environmental dryness."
        )

    if resolved_count > 0:
        insights.append(
            f"{resolved_count} targeted concern{'s have' if resolved_count > 1 else ' has'} shown measurable clinical improvement or full resolution."
        )

    return {
        "status": "comparative",
        "has_comparative_data": len(assessments) > 1,
        "baseline_date": baseline_date.strftime("%Y-%m-%d") if baseline_date else "",
        "latest_date": latest_date.strftime("%Y-%m-%d") if latest_date else "",
        "baseline_formatted": baseline_date.strftime("%b %d, %Y") if baseline_date else "",
        "latest_formatted": latest_date.strftime("%b %d, %Y") if latest_date else "",
        "days_elapsed": days_elapsed,
        "baseline_score": baseline_score,
        "current_score": latest_score,
        "score_delta": score_delta,
        "percent_gain": percent_gain,
        "total_assessments_logged": len(assessments),
        "concerns_audit": concerns_audit,
        "milestones": milestones,
        "insights": insights,
    }


def get_user_photo_comparisons(user_id: int, db: Session) -> Dict[str, Any]:
    """
    Retrieves all skin scan sessions that include photographic evidence.
    Pairs earliest scan with most recent scan for Before/After comparison.
    """
    assessments_with_images = (
        db.query(AssessmentHistory)
        .filter(AssessmentHistory.user_id == user_id, AssessmentHistory.image_url != "")
        .order_by(AssessmentHistory.assessment_date.asc())
        .all()
    )

    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user_id).first()

    scans = []
    seen_urls = set()

    for a in assessments_with_images:
        if a.image_url and a.image_url not in seen_urls:
            seen_urls.add(a.image_url)
            priorities = (
                db.query(AssessmentPriority)
                .filter(AssessmentPriority.assessment_id == a.assessment_id)
                .all()
            )
            top_concerns = [p.concern_name for p in priorities[:3]]

            scans.append({
                "assessment_id": a.assessment_id,
                "date": a.assessment_date.strftime("%Y-%m-%d") if a.assessment_date else "",
                "formatted_date": a.assessment_date.strftime("%b %d, %Y") if a.assessment_date else "Scan",
                "image_url": a.image_url,
                "score": a.skin_health_score,
                "category": a.skin_health_category,
                "trigger_source": a.trigger_source,
                "concerns": top_concerns,
            })

    # If user has a profile image not recorded in AssessmentHistory
    if profile and profile.image_url and profile.image_url not in seen_urls:
        scans.insert(0, {
            "assessment_id": 0,
            "date": profile.created_at.strftime("%Y-%m-%d") if profile.created_at else date.today().strftime("%Y-%m-%d"),
            "formatted_date": profile.created_at.strftime("%b %d, %Y") if profile.created_at else "Initial Scan",
            "image_url": profile.image_url,
            "score": profile.skin_health_score or 0,
            "category": "Initial",
            "trigger_source": "profile_upload",
            "concerns": (profile.skin_concerns.split(",") if profile.skin_concerns else [])[:3],
        })

    # Identify default Before and After pair
    before_scan = scans[0] if scans else None
    after_scan = scans[-1] if len(scans) > 1 else (scans[0] if scans else None)

    # Days between scans
    days_between = 0
    score_change = 0
    if before_scan and after_scan and before_scan != after_scan:
        try:
            d_before = datetime.strptime(before_scan["date"], "%Y-%m-%d")
            d_after = datetime.strptime(after_scan["date"], "%Y-%m-%d")
            days_between = max(0, (d_after - d_before).days)
        except Exception:
            days_between = 0
        score_change = after_scan["score"] - before_scan["score"]

    return {
        "has_photos": len(scans) > 0,
        "can_compare": len(scans) >= 2,
        "total_scans": len(scans),
        "scans": scans,
        "default_pair": {
            "before": before_scan,
            "after": after_scan,
            "days_between": days_between,
            "score_change": score_change,
        }
    }


def _build_session_data_dossier(
    session: Optional[AssessmentHistory],
    profile: Optional[SkinProfile],
    db: Session,
    adherence_pct: float = 0.0,
) -> Dict[str, Any]:
    """Helper to extract a complete skin data dossier for an assessment session."""
    if not session and not profile:
        return {
            "assessment_id": 0,
            "date": date.today().strftime("%Y-%m-%d"),
            "formatted_date": "No Data",
            "trigger_source": "none",
            "score": 0,
            "category": "Not Assessed",
            "overall_risk": "None",
            "skin_type": "Normal",
            "lifestyle_habits": [],
            "environmental_exposure": [],
            "sleep_quality": "Average",
            "water_intake": "Moderate",
            "concerns": [],
            "priorities": [],
            "risks": [],
            "sub_scores": {
                "skin_condition": 0,
                "lifestyle_habits": 0,
                "sleep_quality": 0,
                "routine_consistency": 0,
                "hydration_level": 0,
            }
        }

    score = session.skin_health_score if session else (profile.skin_health_score or 0)
    category = session.skin_health_category if session else "Fair"
    risk_level = session.overall_risk_level if session else "Low"
    d_date = session.assessment_date if session else (profile.created_at if profile else datetime.now(timezone.utc))
    date_str = d_date.strftime("%Y-%m-%d") if d_date else date.today().strftime("%Y-%m-%d")
    formatted_date = d_date.strftime("%b %d, %Y") if d_date else "Session"
    trigger = session.trigger_source if session else "survey_update"

    risks = []
    priorities = []
    if session:
        risks_records = db.query(AssessmentRisk).filter(AssessmentRisk.assessment_id == session.assessment_id).all()
        risks = [{"title": r.risk_title, "level": r.risk_level, "description": r.description} for r in risks_records]

        prio_records = db.query(AssessmentPriority).filter(AssessmentPriority.assessment_id == session.assessment_id).all()
        priorities = [{"concern": p.concern_name, "priority": p.priority_rank, "severity": p.severity, "score": p.priority_score} for p in prio_records]

    concerns = [p["concern"] for p in priorities]
    if not concerns and profile and profile.skin_concerns:
        concerns = [c.strip() for c in profile.skin_concerns.split(",") if c.strip()]
        priorities = [{"concern": c.title(), "priority": idx + 1, "severity": "Medium", "score": 50} for idx, c in enumerate(concerns)]

    habits = [h.strip() for h in (profile.lifestyle_habits or "").split(",") if h.strip()] if profile else []
    env = [e.strip() for e in (profile.environmental_exposure or "").split(",") if e.strip()] if profile else []
    skin_type = profile.skin_type if profile else "Normal"
    sleep_quality = profile.sleep_quality if profile else "Average"
    water_intake = profile.water_intake if profile else "Moderate"

    has_allergy = bool(profile.allergies and profile.allergies.strip().lower() not in ["", "none", "no", "n/a"]) if profile else False
    has_sens = bool(profile.sensitivities and profile.sensitivities.strip().lower() not in ["", "none", "no", "n/a"]) if profile else False

    skin_cond_score = calculate_skin_condition_score(concerns, skin_type, has_allergy, has_sens)
    lifestyle_score = calculate_lifestyle_score(habits + env)
    sleep_score = calculate_sleep_score(sleep_quality)
    routine_score = calculate_routine_consistency_score(adherence_pct)
    hydration_score = calculate_hydration_score(water_intake)

    return {
        "assessment_id": session.assessment_id if session else 0,
        "date": date_str,
        "formatted_date": formatted_date,
        "trigger_source": trigger,
        "score": score,
        "category": category,
        "overall_risk": risk_level,
        "skin_type": skin_type,
        "lifestyle_habits": habits,
        "environmental_exposure": env,
        "sleep_quality": sleep_quality,
        "water_intake": water_intake,
        "concerns": concerns,
        "priorities": priorities,
        "risks": risks,
        "image_url": (session.image_url if session else profile.image_url) or "",
        "sub_scores": {
            "skin_condition": skin_cond_score,
            "lifestyle_habits": lifestyle_score,
            "sleep_quality": sleep_score,
            "routine_consistency": routine_score,
            "hydration_level": hydration_score,
        }
    }


def get_user_skin_data_comparison(
    user_id: int,
    db: Session,
    before_id: Optional[int] = None,
    after_id: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Compares previous skin assessment data with current/follow-up skin assessment data.
    Provides side-by-side metric comparison, factor deltas, concern shifts, and clinical diff.
    """
    assessments = (
        db.query(AssessmentHistory)
        .filter(AssessmentHistory.user_id == user_id)
        .order_by(AssessmentHistory.assessment_date.asc())
        .all()
    )

    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user_id).first()

    adherence_pct = 0.0
    checkins = db.query(RoutineCheckin).filter(RoutineCheckin.user_id == user_id).all()
    if checkins:
        possible = len(checkins) * 2
        actual = sum((1 if c.morning_completed else 0) + (1 if c.evening_completed else 0) for c in checkins)
        adherence_pct = (actual / possible * 100) if possible > 0 else 0.0

    available_sessions = []
    for a in assessments:
        available_sessions.append({
            "assessment_id": a.assessment_id,
            "date": a.assessment_date.strftime("%Y-%m-%d") if a.assessment_date else "",
            "formatted_date": a.assessment_date.strftime("%b %d, %Y") if a.assessment_date else f"Session #{a.assessment_id}",
            "score": a.skin_health_score,
            "category": a.skin_health_category,
            "trigger": a.trigger_source,
            "has_image": bool(a.image_url),
        })

    if not available_sessions and profile and profile.skin_health_score:
        available_sessions.append({
            "assessment_id": 0,
            "date": profile.created_at.strftime("%Y-%m-%d") if profile.created_at else date.today().strftime("%Y-%m-%d"),
            "formatted_date": "Initial Profile Setup",
            "score": profile.skin_health_score,
            "category": "Initial",
            "trigger": "profile_setup",
            "has_image": bool(profile.image_url),
        })

    sess_map = {a.assessment_id: a for a in assessments}

    before_sess = None
    after_sess = None

    if before_id is not None and before_id in sess_map:
        before_sess = sess_map[before_id]
    elif assessments:
        before_sess = assessments[0]

    if after_id is not None and after_id in sess_map:
        after_sess = sess_map[after_id]
    elif assessments:
        after_sess = assessments[-1]

    before_data = _build_session_data_dossier(before_sess, profile, db, adherence_pct)
    after_data = _build_session_data_dossier(after_sess, profile, db, adherence_pct)

    score_diff = after_data["score"] - before_data["score"]
    pct_change = round((score_diff / before_data["score"] * 100), 1) if before_data["score"] > 0 else 0.0

    days_elapsed = 0
    try:
        d1 = datetime.strptime(before_data["date"], "%Y-%m-%d")
        d2 = datetime.strptime(after_data["date"], "%Y-%m-%d")
        days_elapsed = max(0, abs((d2 - d1).days))
    except Exception:
        days_elapsed = 0

    factor_defs = [
        ("skin_condition", "Skin Barrier & Condition", "🩺"),
        ("lifestyle_habits", "Lifestyle & Environmental Defense", "🏃"),
        ("sleep_quality", "Sleep Recovery & Regeneration", "😴"),
        ("routine_consistency", "Routine Adherence & Consistency", "📋"),
        ("hydration_level", "Cellular Moisture & Hydration", "💧"),
    ]

    factor_comparisons = []
    for key, label, icon in factor_defs:
        b_val = before_data["sub_scores"].get(key, 0)
        a_val = after_data["sub_scores"].get(key, 0)
        diff = a_val - b_val
        factor_comparisons.append({
            "key": key,
            "label": label,
            "icon": icon,
            "before_score": b_val,
            "after_score": a_val,
            "diff": diff,
            "diff_label": f"{'+' if diff > 0 else ''}{diff} pts",
            "trend": "improved" if diff > 0 else ("declined" if diff < 0 else "stable"),
        })

    b_concerns = {p["concern"].lower(): p for p in before_data["priorities"]}
    a_concerns = {p["concern"].lower(): p for p in after_data["priorities"]}

    resolved_concerns = []
    improved_concerns = []
    persisting_concerns = []
    new_concerns = []

    for name, b_prio in b_concerns.items():
        if name not in a_concerns:
            resolved_concerns.append({
                "concern": b_prio["concern"].title(),
                "previous_severity": b_prio["severity"],
                "status": "Resolved",
                "badge_class": "resolved",
                "icon": "✅",
                "note": "Fully cleared between assessments",
            })
        else:
            a_prio = a_concerns[name]
            score_diff_c = b_prio["score"] - a_prio["score"]
            if score_diff_c > 0:
                improved_concerns.append({
                    "concern": a_prio["concern"].title(),
                    "previous_severity": b_prio["severity"],
                    "current_severity": a_prio["severity"],
                    "status": "Improved",
                    "badge_class": "improved",
                    "icon": "📉",
                    "note": f"Severity softened ({b_prio['severity']} ➔ {a_prio['severity']})",
                })
            else:
                persisting_concerns.append({
                    "concern": a_prio["concern"].title(),
                    "previous_severity": b_prio["severity"],
                    "current_severity": a_prio["severity"],
                    "status": "Persisting",
                    "badge_class": "stable",
                    "icon": "➡️",
                    "note": "Severity remains steady",
                })

    for name, a_prio in a_concerns.items():
        if name not in b_concerns:
            new_concerns.append({
                "concern": a_prio["concern"].title(),
                "current_severity": a_prio["severity"],
                "status": "Newly Identified",
                "badge_class": "new",
                "icon": "🔍",
                "note": "Flagged in recent assessment",
            })

    b_risk_titles = {r["title"].lower(): r for r in before_data["risks"]}
    a_risk_titles = {r["title"].lower(): r for r in after_data["risks"]}

    cleared_risks = [r["title"] for name, r in b_risk_titles.items() if name not in a_risk_titles]
    ongoing_risks = [r["title"] for name, r in a_risk_titles.items() if name in b_risk_titles]
    new_risks = [r["title"] for name, r in a_risk_titles.items() if name not in b_risk_titles]

    clinical_verdict = []
    if score_diff > 5:
        clinical_verdict.append(
            f"Skin health demonstrated positive progression: +{score_diff} net points ({pct_change}% gain) over {days_elapsed} days."
        )
    elif score_diff < -5:
        clinical_verdict.append(
            f"Skin health score experienced a temporary decrease of {abs(score_diff)} points over {days_elapsed} days. Review active routine ingredients or environmental factors."
        )
    else:
        diff_str = f"+{score_diff}" if score_diff > 0 else f"{score_diff}"
        clinical_verdict.append(
            f"Skin health metrics remained stable ({diff_str} pts) across {days_elapsed} days."
        )

    if resolved_concerns:
        c_names = ", ".join(c["concern"] for c in resolved_concerns[:2])
        clinical_verdict.append(f"Successfully resolved concerns: {c_names}.")

    if cleared_risks:
        r_names = ", ".join(cleared_risks[:2])
        clinical_verdict.append(f"Mitigated health risks: {r_names}.")

    return {
        "can_compare": len(available_sessions) >= 2,
        "total_sessions": len(available_sessions),
        "available_sessions": available_sessions,
        "before_data": before_data,
        "after_data": after_data,
        "comparison_delta": {
            "score_diff": score_diff,
            "percent_change": pct_change,
            "days_elapsed": days_elapsed,
            "category_shift": {
                "before": before_data["category"],
                "after": after_data["category"],
                "upgraded": after_data["score"] > before_data["score"],
            },
            "risk_shift": {
                "before": before_data["overall_risk"],
                "after": after_data["overall_risk"],
                "reduced": before_data["overall_risk"] in ["High", "Critical"] and after_data["overall_risk"] in ["Low", "Medium"],
            },
            "factor_comparisons": factor_comparisons,
            "concerns_diff": {
                "resolved": resolved_concerns,
                "improved": improved_concerns,
                "persisting": persisting_concerns,
                "new": new_concerns,
                "total_resolved_count": len(resolved_concerns) + len(improved_concerns),
            },
            "risks_diff": {
                "cleared_risks": cleared_risks,
                "ongoing_risks": ongoing_risks,
                "new_risks": new_risks,
            },
            "clinical_verdict": clinical_verdict,
        }
    }

