from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models, schemas
from app.deps import get_current_user, require_professional, require_admin
from app.ml.progress_analytics_engine import (
    monitor_skin_progress,
    track_routine_adherence,
    analyze_improvement,
    compare_before_after,
    analyze_trend,
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboards"])


def _require_linked_client(db: Session, professional_id: str, client_id: str) -> models.User:
    link = db.query(models.ClientLink).filter(
        models.ClientLink.professional_id == professional_id, models.ClientLink.client_id == client_id
    ).first()
    if not link:
        raise HTTPException(status_code=403, detail="This client/patient is not linked to your caseload.")
    client = db.query(models.User).filter(models.User.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found.")
    return client


def _client_report(db: Session, client: models.User) -> dict:
    """Skin assessment report + progress monitoring for a linked client/patient (used by both
    the consultant and dermatologist dashboards - modules 9's 'Skin assessment / condition
    reports' and 'Progress monitoring / analytics')."""
    assessments = (
        db.query(models.SkinAssessment)
        .filter(models.SkinAssessment.user_id == client.id)
        .order_by(models.SkinAssessment.assessment_date.asc())
        .all()
    )
    logs = (
        db.query(models.ProgressLog)
        .filter(models.ProgressLog.user_id == client.id)
        .order_by(models.ProgressLog.log_date.asc())
        .all()
    )
    latest = assessments[-1] if assessments else None

    report = {
        "client_id": client.id,
        "full_name": client.full_name,
        "email": client.email,
        "latest_assessment": schemas.SkinAssessmentOut.model_validate(latest).model_dump() if latest else None,
        "assessment_history": [schemas.SkinAssessmentOut.model_validate(a).model_dump() for a in assessments],
        "progress_monitoring": monitor_skin_progress(assessments) if assessments else [],
        "routine_adherence_tracking": track_routine_adherence(logs) if logs else None,
        "trend_analysis": analyze_trend(assessments) if assessments else None,
        "before_after": None,
    }
    if len(assessments) >= 2:
        report["before_after"] = compare_before_after(assessments[0], assessments[-1])
    return report


# ---------------- USER DASHBOARD ----------------
@router.get("/user")
def user_dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    latest_assessment = (
        db.query(models.SkinAssessment)
        .filter(models.SkinAssessment.user_id == current_user.id)
        .order_by(models.SkinAssessment.assessment_date.desc())
        .first()
    )
    active_routines = (
        db.query(models.Routine)
        .filter(models.Routine.user_id == current_user.id, models.Routine.is_active == True)  # noqa: E712
        .all()
    )
    recommended = (
        db.query(models.Product).limit(6).all()
    )
    unread_notifications = (
        db.query(models.Notification)
        .filter(models.Notification.user_id == current_user.id, models.Notification.is_read == False)  # noqa: E712
        .count()
    )
    return {
        "skin_health_score": latest_assessment.skin_health_score if latest_assessment else None,
        "overall_condition": latest_assessment.overall_condition if latest_assessment else None,
        "detected_skin_type": latest_assessment.detected_skin_type if latest_assessment else None,
        "improvement_score": latest_assessment.improvement_score if latest_assessment else None,
        "improvement_trend": latest_assessment.improvement_trend if latest_assessment else None,
        "active_routines": [schemas.RoutineOut.model_validate(r) for r in active_routines],
        "product_recommendations": [schemas.ProductOut.model_validate(p) for p in recommended],
        "unread_notifications": unread_notifications,
        "latest_concerns": [schemas.SkinConcernOut.model_validate(c) for c in latest_assessment.concerns] if latest_assessment else [],
    }


# ---------------- CONSULTANT DASHBOARD ----------------
@router.get("/consultant")
def consultant_dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(require_professional)):
    links = db.query(models.ClientLink).filter(models.ClientLink.professional_id == current_user.id).all()
    client_ids = [l.client_id for l in links]
    clients = db.query(models.User).filter(models.User.id.in_(client_ids)).all() if client_ids else []

    client_summaries = []
    for c in clients:
        latest = (
            db.query(models.SkinAssessment)
            .filter(models.SkinAssessment.user_id == c.id)
            .order_by(models.SkinAssessment.assessment_date.desc())
            .first()
        )
        client_summaries.append({
            "client_id": c.id,
            "full_name": c.full_name,
            "email": c.email,
            "latest_score": latest.skin_health_score if latest else None,
            "overall_condition": latest.overall_condition if latest else None,
        })

    recent_recommendations = (
        db.query(models.ProfessionalRecommendation)
        .filter(models.ProfessionalRecommendation.professional_id == current_user.id)
        .order_by(models.ProfessionalRecommendation.created_at.desc())
        .limit(10)
        .all()
    )

    return {
        "total_clients": len(clients),
        "clients": client_summaries,
        "recent_recommendations": [schemas.RecommendationOut.model_validate(r) for r in recent_recommendations],
    }


@router.get("/consultant/clients/{client_id}/report")
def consultant_client_report(client_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(require_professional)):
    """Skin assessment report + progress monitoring for one linked client (module 9)."""
    client = _require_linked_client(db, current_user.id, client_id)
    return _client_report(db, client)


# ---------------- DERMATOLOGIST DASHBOARD ----------------
@router.get("/dermatologist")
def dermatologist_dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(require_professional)):
    links = db.query(models.ClientLink).filter(models.ClientLink.professional_id == current_user.id).all()
    patient_ids = [l.client_id for l in links]
    patients = db.query(models.User).filter(models.User.id.in_(patient_ids)).all() if patient_ids else []

    high_risk_patients = []
    for p in patients:
        latest = (
            db.query(models.SkinAssessment)
            .filter(models.SkinAssessment.user_id == p.id)
            .order_by(models.SkinAssessment.assessment_date.desc())
            .first()
        )
        if latest:
            high_risks = [r for r in latest.risk_factors if r.risk_level == "high"]
            if high_risks:
                high_risk_patients.append({
                    "patient_id": p.id,
                    "full_name": p.full_name,
                    "risk_factors": [r.risk_name for r in high_risks],
                    "score": latest.skin_health_score,
                })

    return {
        "total_patients": len(patients),
        "high_risk_patients": high_risk_patients,
    }


@router.get("/dermatologist/patients/{patient_id}/report")
def dermatologist_patient_report(patient_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(require_professional)):
    """Skin condition report + progress analytics for one linked patient (module 9)."""
    patient = _require_linked_client(db, current_user.id, patient_id)
    report = _client_report(db, patient)
    latest = (
        db.query(models.SkinAssessment)
        .filter(models.SkinAssessment.user_id == patient.id)
        .order_by(models.SkinAssessment.assessment_date.desc())
        .first()
    )
    report["risk_factors"] = [schemas.RiskFactorOut.model_validate(r).model_dump() for r in latest.risk_factors] if latest else []
    return report


@router.get("/my-recommendations", response_model=list[schemas.RecommendationOut])
def my_recommendations(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return (
        db.query(models.ProfessionalRecommendation)
        .filter(models.ProfessionalRecommendation.client_id == current_user.id)
        .order_by(models.ProfessionalRecommendation.created_at.desc())
        .all()
    )


@router.post("/recommendations", response_model=schemas.RecommendationOut, status_code=201)
def create_recommendation(
    payload: schemas.RecommendationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_professional),
):
    rec = models.ProfessionalRecommendation(professional_id=current_user.id, **payload.model_dump())
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


@router.post("/clients/{client_id}/link", status_code=201)
def link_client(client_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(require_professional)):
    client = db.query(models.User).filter(models.User.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found.")
    existing = db.query(models.ClientLink).filter(
        models.ClientLink.professional_id == current_user.id, models.ClientLink.client_id == client_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Client already linked.")
    link = models.ClientLink(professional_id=current_user.id, client_id=client_id)
    db.add(link)
    db.commit()
    return {"message": "Client linked successfully."}


# ---------------- ADMIN DASHBOARD ----------------
@router.get("/admin")
def admin_dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    total_users = db.query(models.User).filter(models.User.role == "user").count()
    total_consultants = db.query(models.User).filter(models.User.role == "consultant").count()
    total_dermatologists = db.query(models.User).filter(models.User.role == "dermatologist").count()
    total_assessments = db.query(models.SkinAssessment).count()
    total_products = db.query(models.Product).count()
    avg_score = db.query(func.avg(models.SkinAssessment.skin_health_score)).scalar()

    return {
        "platform_analytics": {
            "total_users": total_users,
            "total_consultants": total_consultants,
            "total_dermatologists": total_dermatologists,
            "total_assessments": total_assessments,
            "total_products": total_products,
            "average_skin_health_score": round(avg_score, 2) if avg_score else None,
        }
    }


@router.get("/admin/recommendations")
def admin_recommendation_monitoring(db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    """Recommendation monitoring (module 9): every recommendation issued platform-wide,
    with the professional and client names resolved for readability."""
    recs = (
        db.query(models.ProfessionalRecommendation)
        .order_by(models.ProfessionalRecommendation.created_at.desc())
        .limit(200)
        .all()
    )
    user_ids = {r.professional_id for r in recs} | {r.client_id for r in recs}
    users_by_id = {u.id: u for u in db.query(models.User).filter(models.User.id.in_(user_ids)).all()} if user_ids else {}

    return [
        {
            "id": r.id,
            "professional_id": r.professional_id,
            "professional_name": users_by_id.get(r.professional_id).full_name if users_by_id.get(r.professional_id) else "Unknown",
            "client_id": r.client_id,
            "client_name": users_by_id.get(r.client_id).full_name if users_by_id.get(r.client_id) else "Unknown",
            "recommendation_text": r.recommendation_text,
            "created_at": r.created_at,
        }
        for r in recs
    ]


@router.get("/admin/reports")
def admin_system_reports(db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    """System reports (module 9): platform activity over the last 30 days, role breakdown,
    notification volume by category, and the most common skin concerns."""
    since_30d = datetime.utcnow() - timedelta(days=30)
    since_7d = datetime.utcnow() - timedelta(days=7)

    role_counts = dict(
        db.query(models.User.role, func.count(models.User.id)).group_by(models.User.role).all()
    )
    assessments_30d = db.query(models.SkinAssessment).filter(models.SkinAssessment.assessment_date >= since_30d).count()
    assessments_7d = db.query(models.SkinAssessment).filter(models.SkinAssessment.assessment_date >= since_7d).count()
    new_users_30d = db.query(models.User).filter(models.User.created_at >= since_30d).count()
    recommendations_30d = db.query(models.ProfessionalRecommendation).filter(
        models.ProfessionalRecommendation.created_at >= since_30d
    ).count()

    notifications_by_category = dict(
        db.query(models.Notification.category, func.count(models.Notification.id))
        .group_by(models.Notification.category)
        .all()
    )

    top_concerns = (
        db.query(models.SkinConcern.concern_name, func.count(models.SkinConcern.id).label("cnt"))
        .group_by(models.SkinConcern.concern_name)
        .order_by(func.count(models.SkinConcern.id).desc())
        .limit(5)
        .all()
    )

    return {
        "role_breakdown": {str(k): v for k, v in role_counts.items()},
        "activity": {
            "new_users_last_30_days": new_users_30d,
            "assessments_last_30_days": assessments_30d,
            "assessments_last_7_days": assessments_7d,
            "recommendations_last_30_days": recommendations_30d,
        },
        "notifications_by_category": {str(k): v for k, v in notifications_by_category.items()},
        "top_skin_concerns": [{"concern_name": c, "count": cnt} for c, cnt in top_concerns],
    }
