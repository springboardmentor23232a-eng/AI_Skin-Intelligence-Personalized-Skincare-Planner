from datetime import datetime, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import (
    User, UserRole, SkinProfile, SkinAssessment, SkincareRoutine,
    ProductRecommendation, SkincareLog, SkinProgressPhoto,
    Consultation, ClinicalReview
)
from app.auth import get_current_user
from app.schemas_phase6 import (
    ConsultationCreate,
    ConsultationUpdate,
    ConsultationResponse,
    ClinicalReviewCreate,
    ClinicalReviewResponse,
    PatientSummary
)

router = APIRouter(prefix="/api/clinical", tags=["phase6"])


def require_clinical_staff(current_user: User = Depends(get_current_user)):
    allowed = ["SKINCARE_CONSULTANT", "DERMATOLOGIST", "ADMIN"]
    if current_user.role not in allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Clinical staff credentials required."
        )
    return current_user


@router.get("/stats")
def get_clinical_dashboard_stats(
    staff_user: User = Depends(require_clinical_staff),
    db: Session = Depends(get_db)
):
    total_clients = db.query(User).filter(User.role == UserRole.USER).count()
    
    # Active/High Risk Patients (overall_score < 70 or risk_level != 'Low Risk')
    high_risk_count = db.query(SkinAssessment).filter(
        SkinAssessment.risk_level.in_(["Moderate Risk", "High Priority", "Severe"])
    ).distinct(SkinAssessment.user_id).count()

    today_start = datetime.combine(date.today(), datetime.min.time())
    today_end = datetime.combine(date.today(), datetime.max.time())

    if staff_user.role == "ADMIN":
        today_consultations = db.query(Consultation).filter(
            Consultation.scheduled_at >= today_start,
            Consultation.scheduled_at <= today_end
        ).count()

        pending_consultations = db.query(Consultation).filter(
            Consultation.status == "PENDING"
        ).count()
    else:
        today_consultations = db.query(Consultation).filter(
            Consultation.consultant_id == staff_user.id,
            Consultation.scheduled_at >= today_start,
            Consultation.scheduled_at <= today_end
        ).count()

        pending_consultations = db.query(Consultation).filter(
            Consultation.consultant_id == staff_user.id,
            Consultation.status == "PENDING"
        ).count()

    ai_recommendation_requests = db.query(ProductRecommendation).count()
    total_reviews = db.query(ClinicalReview).count()

    return {
        "total_clients": total_clients,
        "high_risk_patients": high_risk_count,
        "today_consultations": today_consultations,
        "pending_reviews": max(0, ai_recommendation_requests - total_reviews),
        "ai_recommendations_count": ai_recommendation_requests,
        "completed_reviews_count": total_reviews
    }


@router.get("/patients", response_model=List[PatientSummary])
def get_patient_directory(
    search: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    staff_user: User = Depends(require_clinical_staff),
    db: Session = Depends(get_db)
):
    query = db.query(User).filter(User.role == UserRole.USER)

    if search:
        query = query.filter(
            (User.full_name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )

    users = query.offset(skip).limit(limit).all()

    patient_summaries = []
    for u in users:
        profile = db.query(SkinProfile).filter(SkinProfile.user_id == u.id).first()
        latest_assessment = db.query(SkinAssessment).filter(
            SkinAssessment.user_id == u.id
        ).order_by(SkinAssessment.created_at.desc()).first()

        assessment_count = db.query(SkinAssessment).filter(SkinAssessment.user_id == u.id).count()

        if risk_level and latest_assessment and latest_assessment.risk_level.lower() != risk_level.lower():
            continue

        patient_summaries.append(
            PatientSummary(
                id=u.id,
                full_name=u.full_name,
                email=u.email,
                age=profile.age if profile else None,
                gender=profile.gender if profile else None,
                skin_type=profile.skin_type if profile else "Unknown",
                skin_tone=profile.skin_tone if profile else "Unknown",
                concerns=profile.concerns if profile and profile.concerns else [],
                latest_overall_score=latest_assessment.overall_score if latest_assessment else None,
                latest_risk_level=latest_assessment.risk_level if latest_assessment else "Not Assessed",
                total_assessments=assessment_count,
                last_assessment_date=latest_assessment.created_at if latest_assessment else None,
                allergies=profile.allergies if profile else None
            )
        )

    return patient_summaries


@router.get("/patients/{patient_id}")
def get_patient_clinical_profile(
    patient_id: int,
    staff_user: User = Depends(require_clinical_staff),
    db: Session = Depends(get_db)
):
    patient = db.query(User).filter(User.id == patient_id, User.role == UserRole.USER).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found.")

    profile = db.query(SkinProfile).filter(SkinProfile.user_id == patient.id).first()
    assessments = db.query(SkinAssessment).filter(
        SkinAssessment.user_id == patient.id
    ).order_by(SkinAssessment.created_at.desc()).all()
    
    routines = db.query(SkincareRoutine).filter(SkincareRoutine.user_id == patient.id).all()
    recommendations = db.query(ProductRecommendation).filter(
        ProductRecommendation.user_id == patient.id
    ).order_by(ProductRecommendation.created_at.desc()).all()
    
    progress_photos = db.query(SkinProgressPhoto).filter(
        SkinProgressPhoto.user_id == patient.id
    ).order_by(SkinProgressPhoto.logged_at.desc()).all()
    
    consultations = db.query(Consultation).filter(
        Consultation.patient_id == patient.id
    ).order_by(Consultation.scheduled_at.desc()).all()

    reviews = db.query(ClinicalReview).filter(
        ClinicalReview.patient_id == patient.id
    ).order_by(ClinicalReview.created_at.desc()).all()

    formatted_consultations = []
    for c in consultations:
        consultant_user = db.query(User).filter(User.id == c.consultant_id).first()
        formatted_consultations.append({
            "id": c.id,
            "patient_id": c.patient_id,
            "patient_name": patient.full_name,
            "consultant_id": c.consultant_id,
            "consultant_name": consultant_user.full_name if consultant_user else "Staff",
            "scheduled_at": c.scheduled_at,
            "status": c.status,
            "notes": c.notes,
            "treatment_recommendations": c.treatment_recommendations,
            "created_at": c.created_at
        })

    return {
        "patient": {
            "id": patient.id,
            "full_name": patient.full_name,
            "email": patient.email,
            "created_at": patient.created_at
        },
        "profile": profile,
        "assessments": assessments,
        "routines": routines,
        "recommendations": recommendations,
        "progress_photos": progress_photos,
        "consultations": formatted_consultations,
        "clinical_reviews": reviews
    }


@router.get("/consultations", response_model=List[ConsultationResponse])
def get_consultations_list(
    status_filter: Optional[str] = Query(None),
    staff_user: User = Depends(require_clinical_staff),
    db: Session = Depends(get_db)
):
    query = db.query(Consultation)
    if staff_user.role != "ADMIN":
        query = query.filter(Consultation.consultant_id == staff_user.id)

    if status_filter:
        query = query.filter(Consultation.status == status_filter.upper())

    consultations = query.order_by(Consultation.scheduled_at.desc()).all()

    res = []
    for c in consultations:
        patient = db.query(User).filter(User.id == c.patient_id).first()
        consultant = db.query(User).filter(User.id == c.consultant_id).first()

        res.append(
            ConsultationResponse(
                id=c.id,
                patient_id=c.patient_id,
                patient_name=patient.full_name if patient else "Unknown",
                patient_email=patient.email if patient else "Unknown",
                consultant_id=c.consultant_id,
                consultant_name=consultant.full_name if consultant else "Unknown",
                scheduled_at=c.scheduled_at,
                status=c.status,
                notes=c.notes,
                treatment_recommendations=c.treatment_recommendations,
                created_at=c.created_at
            )
        )
    return res


@router.post("/consultations", response_model=ConsultationResponse, status_code=status.HTTP_201_CREATED)
def schedule_consultation(
    payload: ConsultationCreate,
    staff_user: User = Depends(require_clinical_staff),
    db: Session = Depends(get_db)
):
    patient = db.query(User).filter(User.id == payload.patient_id, User.role == UserRole.USER).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient user not found.")

    scheduled_time = payload.scheduled_at or datetime.utcnow()

    new_consultation = Consultation(
        patient_id=payload.patient_id,
        consultant_id=staff_user.id,
        scheduled_at=scheduled_time,
        status="PENDING",
        notes=payload.notes,
        treatment_recommendations=payload.treatment_recommendations
    )

    db.add(new_consultation)
    db.commit()
    db.refresh(new_consultation)

    return ConsultationResponse(
        id=new_consultation.id,
        patient_id=new_consultation.patient_id,
        patient_name=patient.full_name,
        patient_email=patient.email,
        consultant_id=staff_user.id,
        consultant_name=staff_user.full_name,
        scheduled_at=new_consultation.scheduled_at,
        status=new_consultation.status,
        notes=new_consultation.notes,
        treatment_recommendations=new_consultation.treatment_recommendations,
        created_at=new_consultation.created_at
    )


@router.put("/consultations/{consultation_id}", response_model=ConsultationResponse)
def update_consultation(
    consultation_id: int,
    payload: ConsultationUpdate,
    staff_user: User = Depends(require_clinical_staff),
    db: Session = Depends(get_db)
):
    consultation = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not consultation:
        raise HTTPException(status_code=404, detail="Consultation not found.")

    if staff_user.role != "ADMIN" and consultation.consultant_id != staff_user.id:
        raise HTTPException(status_code=403, detail="You can only update your own assigned consultations.")

    if payload.status:
        consultation.status = payload.status.upper()
    if payload.notes is not None:
        consultation.notes = payload.notes
    if payload.treatment_recommendations is not None:
        consultation.treatment_recommendations = payload.treatment_recommendations
    if payload.scheduled_at:
        consultation.scheduled_at = payload.scheduled_at

    db.commit()
    db.refresh(consultation)

    patient = db.query(User).filter(User.id == consultation.patient_id).first()
    consultant = db.query(User).filter(User.id == consultation.consultant_id).first()

    return ConsultationResponse(
        id=consultation.id,
        patient_id=consultation.patient_id,
        patient_name=patient.full_name if patient else "Unknown",
        patient_email=patient.email if patient else "Unknown",
        consultant_id=consultation.consultant_id,
        consultant_name=consultant.full_name if consultant else "Unknown",
        scheduled_at=consultation.scheduled_at,
        status=consultation.status,
        notes=consultation.notes,
        treatment_recommendations=consultation.treatment_recommendations,
        created_at=consultation.created_at
    )


@router.post("/reviews", response_model=ClinicalReviewResponse, status_code=status.HTTP_201_CREATED)
def submit_clinical_review(
    payload: ClinicalReviewCreate,
    staff_user: User = Depends(require_clinical_staff),
    db: Session = Depends(get_db)
):
    patient = db.query(User).filter(User.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient user not found.")

    review = ClinicalReview(
        patient_id=payload.patient_id,
        reviewer_id=staff_user.id,
        recommendation_id=payload.recommendation_id,
        status=payload.status.upper(),
        custom_routine=payload.custom_routine,
        recommended_products=payload.recommended_products,
        clinical_notes=payload.clinical_notes
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return ClinicalReviewResponse(
        id=review.id,
        patient_id=review.patient_id,
        reviewer_id=staff_user.id,
        reviewer_name=staff_user.full_name,
        recommendation_id=review.recommendation_id,
        status=review.status,
        custom_routine=review.custom_routine,
        recommended_products=review.recommended_products,
        clinical_notes=review.clinical_notes,
        created_at=review.created_at
    )
