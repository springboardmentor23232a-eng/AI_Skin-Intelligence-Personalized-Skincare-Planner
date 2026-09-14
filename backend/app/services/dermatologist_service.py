from typing import Dict, Any, List, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import (
    User,
    SkinAssessment,
    SkinConcern,
    RiskFactor,
    RoutineProfile,
    Routine,
    SkinHealthScoreRecord,
    DailyChecklistLog
)
from app.logging_config import logger


def get_dermatologist_dashboard_stats(db: Session) -> Dict[str, Any]:
    """
    Computes real clinical statistics, critical cases queue, and recent patients.
    """
    total_patients = db.query(User).filter(func.upper(User.role) == "USER").count()

    # Find high-severity assessments (concern severity >= 3.0 or priority == 'HIGH' or high risk factors)
    high_priority_assessments = db.query(SkinAssessment)\
        .join(SkinConcern, SkinAssessment.id == SkinConcern.assessment_id)\
        .filter((SkinConcern.severity >= 3.0) | (SkinConcern.priority == "HIGH"))\
        .distinct()\
        .order_by(SkinAssessment.assessment_date.desc())\
        .all()

    high_risk_count = len(high_priority_assessments)
    
    # Checked / reviewed assessments (assessments with notes filled)
    reviewed_count = db.query(SkinAssessment).filter(
        SkinAssessment.notes.isnot(None),
        SkinAssessment.notes != ""
    ).count()

    # Pending review assessments
    pending_count = db.query(SkinAssessment).filter(
        (SkinAssessment.notes == None) | (SkinAssessment.notes == "")
    ).count()

    # Critical cases queue (top 6 high priority)
    critical_cases = []
    for a in high_priority_assessments[:6]:
        patient_name = a.user.name if a.user and a.user.name else (a.user.email.split("@")[0] if a.user else "Patient")
        patient_email = a.user.email if a.user else ""
        
        # Primary severe concern
        sorted_concerns = sorted(a.concerns, key=lambda c: c.severity, reverse=True)
        top_concern = sorted_concerns[0].concern_name if sorted_concerns else "Skin Barrier Concern"
        top_severity = sorted_concerns[0].severity if sorted_concerns else 3.0
        
        severity_label = "Critical" if top_severity >= 4.0 else "High Risk"

        critical_cases.append({
            "id": a.id,
            "patient_id": a.user_id,
            "patientName": patient_name,
            "patient_name": patient_name,
            "patient_email": patient_email,
            "condition": top_concern,
            "concern": top_concern,
            "severity": severity_label,
            "severity_score": round(top_severity, 1),
            "skin_health_score": a.skin_health_score,
            "overall_condition": a.overall_condition,
            "date": a.assessment_date.strftime("%b %d, %Y") if a.assessment_date else "Recent"
        })

    # Recent patients (last 5 registered users)
    recent_patient_records = db.query(User).filter(func.upper(User.role) == "USER").order_by(User.created_at.desc()).limit(5).all()
    recent_patients = []
    for p in recent_patient_records:
        latest_scan = db.query(SkinAssessment).filter(SkinAssessment.user_id == p.id).order_by(SkinAssessment.assessment_date.desc()).first()
        diagnosis_str = "Routine Consultation"
        status_str = "Active"
        if latest_scan and latest_scan.concerns:
            top_c = sorted(latest_scan.concerns, key=lambda x: x.severity, reverse=True)[0]
            diagnosis_str = top_c.concern_name
            status_str = "Critical" if top_c.severity >= 3.5 else "Active"
        elif p.routine_profile and p.routine_profile.concerns:
            diagnosis_str = p.routine_profile.concerns[0]

        recent_patients.append({
            "id": p.id,
            "name": p.name if p.name else p.email.split("@")[0],
            "diagnosis": diagnosis_str,
            "status": status_str,
            "date": p.created_at.strftime("%b %d, %Y") if p.created_at else "Recent"
        })

    stats_payload = {
        "total_patients": total_patients,
        "patients_checked": reviewed_count,
        "patients_waiting": pending_count,
        "high_risk_cases": high_risk_count,
        "active_prescriptions": 0
    }

    return {
        "stats": stats_payload,
        "total_patients": total_patients,
        "high_risk_count": high_risk_count,
        "reviewed_count": reviewed_count,
        "critical_cases": critical_cases,
        "recent_patients": recent_patients
    }


def get_patient_insights_list(db: Session, search: Optional[str] = None, status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Returns clinical overview of all registered patient accounts.
    """
    query = db.query(User).filter(User.role == "USER")
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter((User.name.ilike(search_fmt)) | (User.email.ilike(search_fmt)))
        
    patients = query.order_by(User.created_at.desc()).all()
    results = []

    for p in patients:
        profile = p.routine_profile
        latest_assessment = db.query(SkinAssessment)\
            .filter(SkinAssessment.user_id == p.id)\
            .order_by(SkinAssessment.assessment_date.desc())\
            .first()
            
        concerns = []
        top_concern = "General Consultation"
        status = "Stable"
        
        if latest_assessment:
            for c in latest_assessment.concerns:
                concerns.append(c.concern_name)
            if latest_assessment.concerns:
                sorted_c = sorted(latest_assessment.concerns, key=lambda x: x.severity, reverse=True)
                top_concern = sorted_c[0].concern_name
                if sorted_c[0].severity >= 3.5 or sorted_c[0].priority == "HIGH":
                    status = "Requires Review"
                elif sorted_c[0].severity >= 2.0:
                    status = "Under Treatment"
                else:
                    status = "Stable"
        elif profile:
            concerns = profile.concerns or []
            top_concern = concerns[0] if concerns else "Routine Optimization"
            status = "Profile Completed"
        else:
            status = "New Patient"

        if status_filter and status_filter != "All" and status.lower() != status_filter.lower():
            continue

        allergies = profile.avoid_ingredients if profile and profile.avoid_ingredients else "None registered"
        sensitivity = profile.sensitivity if profile else "Normal"
        skin_type = profile.skin_type if profile else "Undiagnosed"
        has_routine = len(p.routines) > 0

        results.append({
            "id": p.id,
            "name": p.name if p.name else p.email.split("@")[0],
            "email": p.email,
            "skin_type": skin_type,
            "sensitivity": sensitivity,
            "allergies": allergies,
            "primary_concern": top_concern,
            "all_concerns": concerns,
            "status": status,
            "latest_score": latest_assessment.skin_health_score if latest_assessment else None,
            "has_active_routine": has_routine,
            "created_at": p.created_at.strftime("%b %d, %Y") if p.created_at else "Recent"
        })

    return results


def get_condition_reports(db: Session) -> List[Dict[str, Any]]:
    """
    Aggregates diagnostic condition distributions and severities from real PostgreSQL concerns.
    """
    concerns = db.query(SkinConcern).all()
    if not concerns:
        # Default empty summary
        return []

    grouped: Dict[str, List[float]] = {}
    for c in concerns:
        c_name = c.concern_name.strip()
        if c_name not in grouped:
            grouped[c_name] = []
        grouped[c_name].append(c.severity)

    reports = []
    for c_name, severities in grouped.items():
        avg_sev = sum(severities) / len(severities) if severities else 0.0
        severity_label = "Severe" if avg_sev >= 3.5 else "Moderate" if avg_sev >= 2.0 else "Mild"
        
        # Clinical objective description
        desc = f"Identified across {len(severities)} diagnostic scan(s) with an average barrier impact rating of {avg_sev:.1f}/5.0."

        reports.append({
            "name": c_name,
            "count": len(severities),
            "severity": f"{severity_label} ({avg_sev:.1f}/5.0)",
            "average_severity": round(avg_sev, 2),
            "description": desc
        })

    # Sort by highest frequency
    reports = sorted(reports, key=lambda x: x["count"], reverse=True)
    return reports


def get_dermatologist_progress_analytics(db: Session) -> Dict[str, Any]:
    """
    Computes aggregate treatment response and condition category distribution.
    """
    # 1. Condition category distribution for chart
    concerns = db.query(SkinConcern).all()
    category_counts: Dict[str, int] = {}
    for c in concerns:
        name = c.concern_name.strip()
        category_counts[name] = category_counts.get(name, 0) + 1

    chart_data = [
        {"label": name, "value": count}
        for name, count in category_counts.items()
    ]
    if not chart_data:
        chart_data = [
            {"label": "Barrier Health", "value": 1}
        ]

    # 2. Score progression recovery calculations
    patients = db.query(User).filter(User.role == "USER").all()
    improved_count = 0
    total_with_multi_scans = 0
    healing_days_list = []

    for p in patients:
        scans = db.query(SkinAssessment)\
            .filter(SkinAssessment.user_id == p.id)\
            .order_by(SkinAssessment.assessment_date.asc())\
            .all()
            
        if len(scans) >= 2:
            total_with_multi_scans += 1
            first_score = scans[0].skin_health_score
            last_score = scans[-1].skin_health_score
            if last_score >= first_score:
                improved_count += 1
            
            days = (scans[-1].assessment_date - scans[0].assessment_date).days
            if days > 0:
                healing_days_list.append(days)

    success_rate = round((improved_count / total_with_multi_scans) * 100.0, 1) if total_with_multi_scans > 0 else 100.0
    avg_healing_days = round(sum(healing_days_list) / len(healing_days_list)) if healing_days_list else 21

    return {
        "treatment_success_rate": success_rate,
        "total_evaluated_patients": total_with_multi_scans,
        "avg_healing_period_days": avg_healing_days,
        "disease_distribution": chart_data,
        "total_diagnoses_logged": len(concerns)
    }
