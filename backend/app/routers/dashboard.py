from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app import models, schemas
from app.deps import get_current_user, require_professional, require_admin

router = APIRouter(prefix="/api/dashboard", tags=["Dashboards"])


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
        "active_routines": [schemas.RoutineOut.model_validate(r) for r in active_routines],
        "product_recommendations": [schemas.ProductOut.model_validate(p) for p in recommended],
        "unread_notifications": unread_notifications,
        "latest_concerns": [schemas.SkinConcernOut.model_validate(c) for c in latest_assessment.concerns] if latest_assessment else [],
    }


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
