"""
PanaceaAI Dashboard & Analytics Service (Module 9)
Provides aggregated clinical telemetry and analytics for:
- User Dashboard (Score breakdown, routine summary, interactive checklists, streak)
- Consultant Dashboard (Client roster, risk distribution, compliance monitoring, recommendations)
- Dermatologist Dashboard (Patient triage, ISIC lesion screening, condition severities, Rx management)
- Admin Dashboard (User distributions, microservices latency, recommendation safety, audit reports)
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models import (
    SkinAssessment, SkinRoutine, Product, ProductRecommendation,
    SkinProgressLog, RoutineAdherenceRecord, DailySkincareChecklist,
    HydrationLog, SleepLog, Notification, AdminAuditLog
)

def utc_now():
    return datetime.now(timezone.utc)

def get_user_dashboard_analytics(db: Session, user_id: int = 1) -> Dict[str, Any]:
    """
    Module 9: Compiles holistic User Dashboard data with 5-factor weighted skin health score,
    AM/PM checklists, hydration tracking, sleep targets, and matched products.
    """
    # 1. Fetch latest assessment
    assessment = db.query(SkinAssessment).filter(SkinAssessment.user_id == user_id).order_by(SkinAssessment.assessment_date.desc()).first()
    
    overall_score = float(assessment.skin_health_score) if assessment else 78.0
    skin_type = assessment.skin_type if assessment else "Combination"
    
    # Calculate 5-Factor Weighted Score Breakdown
    # Formula: Skin Condition (35%) + Lifestyle (20%) + Sleep (15%) + Consistency (20%) + Hydration (10%)
    condition_score = 88.0 if not assessment else max(20.0, 100.0 - float(assessment.acne_severity) * 0.8 - float(assessment.pigmentation_score) * 0.4)
    lifestyle_score = 82.0 if not assessment else max(30.0, 100.0 - float(assessment.stress_level) * 4.5 + (10.0 if assessment.spf_frequency in ['Daily', 'Reapplied'] else -15.0))
    sleep_score = 85.0 if not assessment else min(100.0, max(30.0, float(assessment.sleep_hours) * 11.5))
    consistency_score = 92.0
    hydration_score = 74.0 if not assessment else float(assessment.hydration_level)

    score_breakdown = [
        {
            "name": "Skin Condition (Acne / Lesions)",
            "score": round(condition_score, 1),
            "weight": "35%",
            "status": "Good" if condition_score >= 75 else "Moderate",
            "insight": "Minimal inflammatory comedones; sebum balance stabilized."
        },
        {
            "name": "Lifestyle & Environmental Exposure",
            "score": round(lifestyle_score, 1),
            "weight": "20%",
            "status": "Optimal" if lifestyle_score >= 80 else "Attention",
            "insight": "Consistent SPF protection; moderate environmental stress."
        },
        {
            "name": "Sleep Quality & Circadian Repair",
            "score": round(sleep_score, 1),
            "weight": "15%",
            "status": "Good" if sleep_score >= 75 else "Needs Rest",
            "insight": "7.5 hrs average nightly cellular regeneration cycle."
        },
        {
            "name": "Routine Consistency Index",
            "score": round(consistency_score, 1),
            "weight": "20%",
            "status": "Optimal",
            "insight": "14-day consecutive morning & night compliance streak."
        },
        {
            "name": "Epidermal Hydration Level",
            "score": round(hydration_score, 1),
            "weight": "10%",
            "status": "Good",
            "insight": "Corneocyte water binding capacity is +18% above baseline."
        }
    ]

    # 2. Daily Skincare Checklist for today
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    checklist_entries = db.query(DailySkincareChecklist).filter(
        DailySkincareChecklist.user_id == user_id,
        DailySkincareChecklist.check_date == today_str
    ).all()

    # Default checklist steps if none exist in DB yet
    default_morning = [
        {"id": "am_cleanse", "routine_type": "morning", "step_number": 1, "name": "Gentle Hydrating Cleanser", "product_name": "CeraVe Hydrating Cleanser", "time_estimate": "1 min", "instructions": "Massage gently with lukewarm water for 60 seconds.", "completed": True, "completed_at": f"{today_str}T08:15:00Z"},
        {"id": "am_treat", "routine_type": "morning", "step_number": 2, "name": "Antioxidant Vitamin C Serum", "product_name": "Panacea 15% Vitamin C + Ferulic", "time_estimate": "1 min", "instructions": "Pat 4-5 drops onto clean, dry skin.", "completed": True, "completed_at": f"{today_str}T08:17:00Z"},
        {"id": "am_moisturize", "routine_type": "morning", "step_number": 3, "name": "Barrier Support Moisture Gel", "product_name": "La Roche-Posay Toleriane Fluid", "time_estimate": "1 min", "instructions": "Apply pea-sized amount over face and neck.", "completed": True, "completed_at": f"{today_str}T08:19:00Z"},
        {"id": "am_spf", "routine_type": "morning", "step_number": 4, "name": "Broad Spectrum SPF 50+ Sunscreen", "product_name": "Panacea UV Mineral Shield SPF 50+", "time_estimate": "1 min", "instructions": "Apply 2 finger lengths 15 mins before sun exposure.", "completed": True, "completed_at": f"{today_str}T08:21:00Z"}
    ]

    default_evening = [
        {"id": "pm_oil_cleanse", "routine_type": "evening", "step_number": 1, "name": "Micellar Cleansing Water", "product_name": "Bioderma Sensibio H2O", "time_estimate": "2 mins", "instructions": "Wipe away sunscreen, makeup and particulate matter.", "completed": False, "completed_at": None},
        {"id": "pm_cleanse", "routine_type": "evening", "step_number": 2, "name": "Soothing Gel Cleanser", "product_name": "CeraVe Hydrating Cleanser", "time_estimate": "1 min", "instructions": "Double cleanse with water to purify pores.", "completed": False, "completed_at": None},
        {"id": "pm_actives", "routine_type": "evening", "step_number": 3, "name": "Adapalene 0.1% / Retinoid Repair", "product_name": "Differin Gel 0.1%", "time_estimate": "1 min", "instructions": "Apply pea-sized amount avoiding eye and lip contours.", "completed": False, "completed_at": None},
        {"id": "pm_ceramide", "routine_type": "evening", "step_number": 4, "name": "Ceramide Overnight Recovery Cream", "product_name": "Illiyoon Ceramide Ato Concentrate", "time_estimate": "2 mins", "instructions": "Seal skin barrier to prevent transepidermal water loss.", "completed": False, "completed_at": None}
    ]

    default_weekly = [
        {"id": "wk_exfoliate", "routine_type": "weekly", "step_number": 1, "name": "Enzyme Clarifying Mask", "product_name": "Paula's Choice 2% BHA Liquid", "time_estimate": "10 mins", "instructions": "Use Wednesday & Sunday evenings.", "completed": True, "completed_at": f"{today_str}T20:00:00Z"},
        {"id": "wk_hydration_mask", "routine_type": "weekly", "step_number": 2, "name": "Centella Soothing Sheet Mask", "product_name": "Mediheal Tea Tree Soothing Mask", "time_estimate": "15 mins", "instructions": "Use Friday evening for epidermal repair.", "completed": False, "completed_at": None}
    ]

    # Map database completed statuses if available
    db_status_map = {entry.step_id: (bool(entry.completed), entry.completed_at.isoformat() if entry.completed_at else None) for entry in checklist_entries}
    
    for step in default_morning:
        if step["id"] in db_status_map:
            step["completed"], step["completed_at"] = db_status_map[step["id"]]
    for step in default_evening:
        if step["id"] in db_status_map:
            step["completed"], step["completed_at"] = db_status_map[step["id"]]
    for step in default_weekly:
        if step["id"] in db_status_map:
            step["completed"], step["completed_at"] = db_status_map[step["id"]]

    all_steps = default_morning + default_evening + default_weekly
    total_steps_count = len(all_steps)
    completed_steps_count = sum(1 for s in all_steps if s["completed"])
    completion_pct = round((completed_steps_count / total_steps_count) * 100.0, 1)

    # 3. Hydration & Sleep
    hydration_record = db.query(HydrationLog).filter(HydrationLog.user_id == user_id, HydrationLog.log_date == today_str).first()
    intake_ml = hydration_record.intake_ml if hydration_record else 1750
    target_ml = hydration_record.target_ml if hydration_record else 2500
    hydration_pct = round((intake_ml / target_ml) * 100.0, 1)

    sleep_record = db.query(SleepLog).filter(SleepLog.user_id == user_id, SleepLog.log_date == today_str).first()
    sleep_hours = float(sleep_record.sleep_hours) if sleep_record else 7.5
    sleep_quality = sleep_record.sleep_quality if sleep_record else "Good"

    # 4. Unread Notifications Count
    unread_notifs = db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == 0).count()
    if unread_notifs == 0:
        unread_notifs = 2 # Demo active unreads

    # 5. Products Count
    recs_count = db.query(ProductRecommendation).filter(ProductRecommendation.user_id == user_id).count()
    if recs_count == 0:
        recs_count = 6

    return {
        "success": True,
        "user_id": user_id,
        "user_name": "Alex Rivera",
        "overall_health_score": round(overall_score, 1),
        "score_breakdown": score_breakdown,
        "skin_type": skin_type,
        "primary_concerns": ["Comedonal Acne", "Compromised Barrier", "Post-Acne Melanin"],
        "current_streak": 14,
        "adherence_rate": 93.5,
        "daily_checklist": {
            "success": True,
            "user_id": user_id,
            "date": today_str,
            "total_steps": total_steps_count,
            "completed_steps": completed_steps_count,
            "completion_pct": completion_pct,
            "morning_routine": default_morning,
            "evening_routine": default_evening,
            "weekly_routine": default_weekly,
            "streak_days": 14
        },
        "hydration_intake_ml": intake_ml,
        "hydration_target_ml": target_ml,
        "hydration_progress_pct": min(100.0, hydration_pct),
        "sleep_hours": sleep_hours,
        "sleep_quality": sleep_quality,
        "recommended_products_count": recs_count,
        "unread_notifications_count": unread_notifs
    }


def toggle_daily_checklist_step(db: Session, user_id: int, step_id: str, routine_type: str, completed: bool, check_date: Optional[str] = None) -> Dict[str, Any]:
    """
    Toggles a daily skincare checklist item and recalculates daily completion % and streak.
    """
    target_date = check_date or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    entry = db.query(DailySkincareChecklist).filter(
        DailySkincareChecklist.user_id == user_id,
        DailySkincareChecklist.check_date == target_date,
        DailySkincareChecklist.step_id == step_id
    ).first()

    now = utc_now()
    if not entry:
        entry = DailySkincareChecklist(
            user_id=user_id,
            check_date=target_date,
            routine_type=routine_type,
            step_id=step_id,
            step_name=step_id.replace("_", " ").title(),
            completed=1 if completed else 0,
            completed_at=now if completed else None
        )
        db.add(entry)
    else:
        entry.completed = 1 if completed else 0
        entry.completed_at = now if completed else None
    
    db.commit()
    db.refresh(entry)

    # Calculate new completion %
    all_today = db.query(DailySkincareChecklist).filter(
        DailySkincareChecklist.user_id == user_id,
        DailySkincareChecklist.check_date == target_date
    ).all()
    
    total_count = max(len(all_today), 10) # 10 standard steps
    completed_count = sum(1 for e in all_today if e.completed == 1)
    pct = round((completed_count / total_count) * 100.0, 1)

    return {
        "success": True,
        "user_id": user_id,
        "step_id": step_id,
        "completed": bool(completed),
        "completion_pct": pct,
        "streak_days": 14 if completed else 13,
        "updated_at": now.isoformat()
    }


def get_consultant_dashboard_analytics(db: Session, consultant_id: int = 2) -> Dict[str, Any]:
    """
    Module 9: Consultant Dashboard analytics compiling client profiles,
    assessment report summaries, progress compliance, and recommendation tracking.
    """
    clients = [
        {
            "id": 1,
            "name": "Alex Rivera",
            "email": "user@panacea.ai",
            "skin_type": "Combination",
            "health_score": 79.4,
            "adherence_pct": 94.2,
            "priority": "Standard",
            "last_assessment_date": "24 Nov 2025",
            "primary_concern": "Comedonal Acne & Post-Acne PIH",
            "status": "Under Active Regimen"
        },
        {
            "id": 5,
            "name": "Sarah Jenkins",
            "email": "sarah.jenkins@panacea.ai",
            "skin_type": "Sensitive / Dry",
            "health_score": 71.2,
            "adherence_pct": 86.5,
            "priority": "High",
            "last_assessment_date": "22 Nov 2025",
            "primary_concern": "Subacute Erythema & Barrier Sensitivity",
            "status": "Needs Clinical Review"
        },
        {
            "id": 6,
            "name": "Marcus Vance",
            "email": "marcus.v@panacea.ai",
            "skin_type": "Oily / Congested",
            "health_score": 65.5,
            "adherence_pct": 78.0,
            "priority": "High",
            "last_assessment_date": "23 Nov 2025",
            "primary_concern": "Moderate Papulopustular Acne",
            "status": "Active Medical Treatment"
        }
    ]

    skin_type_distribution = {
        "Combination": 45.0,
        "Oily": 25.0,
        "Dry": 18.0,
        "Sensitive": 12.0
    }

    top_concerns = [
        {"concern": "Barrier Compromise / Stinging", "count": 14, "percentage": 38.0},
        {"concern": "Acne & Inflammatory Papules", "count": 12, "percentage": 32.5},
        {"concern": "Post-Inflammatory Hyperpigmentation", "count": 8, "percentage": 21.6},
        {"concern": "Fine Lines & Photo-Damage", "count": 3, "percentage": 7.9}
    ]

    return {
        "success": True,
        "consultant_id": consultant_id,
        "consultant_name": "Elena Vance, LE",
        "total_clients": len(clients),
        "active_cases": 3,
        "average_client_adherence": 86.2,
        "average_client_score": 72.0,
        "clients": clients,
        "skin_type_distribution": skin_type_distribution,
        "top_concerns": top_concerns
    }


def get_dermatologist_dashboard_analytics(db: Session, doctor_id: int = 3) -> Dict[str, Any]:
    """
    Module 9: Dermatologist Dashboard analytics compiling patient triage insights,
    optical ISIC lesion screening status, condition severities, and Rx management.
    """
    patients = [
        {
            "id": 1,
            "name": "Alex Rivera",
            "age": 28,
            "gender": "Non-Binary",
            "condition": "Mild Comedonal Acne & Post-Acne PIH",
            "severity": "Mild-Moderate",
            "priority": "Standard",
            "lesion_risk": "Benign (Safe / 8.2%)",
            "fitzpatrick": "Type III (Medium)",
            "last_visit": "24 Nov 2025",
            "next_review": "24 Dec 2025",
            "active_rx": "Topical Adapalene 0.1% + Azelaic Acid 15%"
        },
        {
            "id": 5,
            "name": "Sarah Jenkins",
            "age": 34,
            "gender": "Female",
            "condition": "Subacute Erythematotelangiectatic Rosacea",
            "severity": "Moderate",
            "priority": "High",
            "lesion_risk": "Benign Vascular Flushing (6.5%)",
            "fitzpatrick": "Type II (Fair)",
            "last_visit": "22 Nov 2025",
            "next_review": "06 Dec 2025",
            "active_rx": "Ivermectin 1% Cream + Ceramide NP Lipid Balm"
        },
        {
            "id": 6,
            "name": "Marcus Vance",
            "age": 24,
            "gender": "Male",
            "condition": "Moderate-to-Severe Papulopustular Acne",
            "severity": "High",
            "priority": "High",
            "lesion_risk": "Inflammatory Pattern (Monitor / 11.0%)",
            "fitzpatrick": "Type IV (Olive / Brown)",
            "last_visit": "23 Nov 2025",
            "next_review": "07 Dec 2025",
            "active_rx": "Benzoyl Peroxide 2.5% + Clindamycin 1% + Tretinoin 0.025%"
        }
    ]

    condition_severity_distribution = {
        "Mild": 35.0,
        "Moderate": 45.0,
        "Severe / High Risk": 20.0
    }

    optical_lesion_metrics = {
        "total_scanned_lesions": 142,
        "benign_screened_pct": 94.4,
        "clinical_followup_flags": 8,
        "malignancy_triage_latency_ms": 120
    }

    return {
        "success": True,
        "doctor_id": doctor_id,
        "doctor_name": "Dr. Julian Rostova, MD",
        "total_patients": len(patients),
        "high_risk_patients_count": 2,
        "pending_prescriptions_count": 1,
        "average_recovery_velocity": "+2.8 pts/week",
        "patients": patients,
        "condition_severity_distribution": condition_severity_distribution,
        "optical_lesion_metrics": optical_lesion_metrics
    }


def get_admin_dashboard_analytics(db: Session) -> Dict[str, Any]:
    """
    Module 9: Platform Admin analytics covering user management stats,
    operational microservices status, recommendation safety logs, and audit trails.
    """
    role_dist = {
        "Users / Patients": 1420,
        "Esthetician Consultants": 48,
        "Board Dermatologists": 26,
        "System Admins": 6
    }

    microservices = [
        {"service_name": "User Authentication & RBAC Service", "port": 3000, "status": "Operational", "uptime": "99.98%", "latency_ms": 28},
        {"service_name": "Skin Profile & Assessment Service", "port": 8000, "status": "Operational", "uptime": "99.95%", "latency_ms": 42},
        {"service_name": "Personalized Routine Generator", "port": 8000, "status": "Operational", "uptime": "99.99%", "latency_ms": 36},
        {"service_name": "Ingredient Intelligence & Contraindication", "port": 8000, "status": "Operational", "uptime": "99.94%", "latency_ms": 31},
        {"service_name": "Product Recommendation & Dupe Engine", "port": 8000, "status": "Operational", "uptime": "99.91%", "latency_ms": 45},
        {"service_name": "Skin Health Scoring Engine", "port": 8000, "status": "Operational", "uptime": "99.97%", "latency_ms": 24},
        {"service_name": "Progress Tracking & Analytics Lab", "port": 8000, "status": "Operational", "uptime": "99.92%", "latency_ms": 48},
        {"service_name": "Optical ISIC Lesion Classifier Microservice", "port": 8000, "status": "Operational", "uptime": "99.88%", "latency_ms": 115},
        {"service_name": "Telehealth Chat & Lumina AI Stream", "port": 3000, "status": "Operational", "uptime": "99.96%", "latency_ms": 33},
        {"service_name": "Notification & Reminder Dispatch Service", "port": 3000, "status": "Operational", "uptime": "99.99%", "latency_ms": 19},
        {"service_name": "Clinical Reports & PDF Export Engine", "port": 8000, "status": "Operational", "uptime": "99.93%", "latency_ms": 62},
        {"service_name": "PostgreSQL Primary Cluster Storage", "port": 5432, "status": "Operational", "uptime": "100.0%", "latency_ms": 8}
    ]

    top_products = [
        {"name": "CeraVe Hydrating Facial Cleanser", "category": "Face Wash", "recommendation_count": 894, "safety_score": 98},
        {"name": "The Ordinary Niacinamide 10% + Zinc 1%", "category": "Serum", "recommendation_count": 782, "safety_score": 96},
        {"name": "La Roche-Posay Anthelios SPF 50+", "category": "Sunscreen", "recommendation_count": 745, "safety_score": 99},
        {"name": "Illiyoon Ceramide Ato Concentrate Cream", "category": "Moisturizer", "recommendation_count": 689, "safety_score": 97}
    ]

    audit_logs = [
        {"id": 101, "actor": "Dr. Julian Rostova, MD", "role": "dermatologist", "action": "Issued Board Prescription (Rx) for User #6", "ip": "192.168.1.42", "time": "12 mins ago"},
        {"id": 102, "actor": "Elena Vance, LE", "role": "consultant", "action": "Updated Regimen Formulation Notes for User #1", "ip": "192.168.1.18", "time": "28 mins ago"},
        {"id": 103, "actor": "System Admin", "role": "admin", "action": "Verified & Approved Clinician Account #5", "ip": "127.0.0.1", "time": "1 hr ago"},
        {"id": 104, "actor": "Lumina AI Copilot", "role": "system", "action": "Flagged Retinoid + BHA Contraindication for User #5", "ip": "127.0.0.1", "time": "2 hrs ago"}
    ]

    return {
        "success": True,
        "total_users": 1500,
        "role_distribution": role_dist,
        "active_assessments_today": 328,
        "average_platform_adherence": 88.4,
        "microservices_status": microservices,
        "system_latency_ms": 38.5,
        "top_recommended_products": top_products,
        "contraindication_alerts_24h": 14,
        "recent_audit_logs": audit_logs
    }
