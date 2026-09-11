"""
FastAPI Router — Module 10: Dermatologist Dashboard
---------------------------------------------------
All endpoints are protected with require_role(["DERMATOLOGIST", "ADMIN"]).

Patient endpoints only operate on users with role = "USER".
Dermatologists cannot retrieve data for other dermatologists, consultants,
or administrators through these endpoints.

Existing business logic is reused without modification:
  - scoring_engine.py  (health score computation)
  - Assessment model   (assessment history, recommendations)
  - Routine model      (current routine)
  - RoutineLog model   (adherence history)

This module focuses on:
  1. Patient insights
  2. Skin condition reports
  3. Treatment recommendations
  4. Progress analytics
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Any, Dict, Optional, List
from pydantic import BaseModel
from datetime import datetime, timedelta

from app.database import get_db
from app import models
from app.dependencies import require_role
from app.scoring_engine import (
    calculate_skin_condition_score,
    calculate_lifestyle_score,
    calculate_sleep_score,
    calculate_routine_consistency_score,
    calculate_hydration_score,
    calculate_overall_score,
)


router = APIRouter(
    prefix="/dermatologist",
    tags=["Dermatologist Dashboard"],
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_user_patient(patient_id: int, db: Session) -> models.User:
    """
    Retrieve a user whose role is USER by primary-key id.
    Returns HTTP 404 if not found or if the record belongs to a
    non-USER role (prevents leaking data about other roles).
    """
    patient = (
        db.query(models.User)
        .filter(
            models.User.id == patient_id,
            models.User.role == "USER",
        )
        .first()
    )
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found.",
        )
    return patient


def _latest_assessment(patient_id: int, db: Session) -> Optional[models.Assessment]:
    """Get the most recent assessment for a patient."""
    return (
        db.query(models.Assessment)
        .filter(models.Assessment.user_id == patient_id)
        .order_by(models.Assessment.assessment_time.desc())
        .first()
    )


def _build_patient_summary(user: models.User, db: Session) -> dict:
    """
    Builds a lightweight patient profile dict that includes the latest
    assessment summary (if any). Password and auth fields are never
    included.
    """
    latest = _latest_assessment(user.id, db)

    base = {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "created_at": user.created_at,
    }

    if latest:
        base["latest_assessment"] = {
            "assessment_id": latest.id,
            "health_score": latest.health_score,
            "predicted_skin_type": latest.predicted_skin_type,
            "overall_condition": latest.overall_condition,
            "vision_predicted_concern": latest.vision_predicted_concern,
            "assessment_time": latest.assessment_time,
        }
    else:
        base["latest_assessment"] = None

    return base


# ---------------------------------------------------------------------------
# 1. GET /dermatologist/patients
# ---------------------------------------------------------------------------

@router.get("/patients")
def list_patients(
    current_user: models.User = Depends(require_role(["DERMATOLOGIST", "ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Returns all users with role = 'USER', enriched with their latest
    assessment summary. Returns real database patients only.
    """
    users = (
        db.query(models.User)
        .filter(models.User.role == "USER")
        .order_by(models.User.created_at.desc())
        .all()
    )

    return {
        "status": "success",
        "total": len(users),
        "patients": [_build_patient_summary(u, db) for u in users],
    }


# ---------------------------------------------------------------------------
# 2. GET /dermatologist/patients/{patient_id}
# ---------------------------------------------------------------------------

@router.get("/patients/{patient_id}")
def get_patient(
    patient_id: int,
    current_user: models.User = Depends(require_role(["DERMATOLOGIST", "ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Return the patient's profile and latest assessment summary.
    Validates that the target user has role USER.
    """
    patient = _get_user_patient(patient_id, db)
    return {
        "status": "success",
        "patient": _build_patient_summary(patient, db),
    }


# ---------------------------------------------------------------------------
# 3. GET /dermatologist/patients/{patient_id}/assessments
# ---------------------------------------------------------------------------

@router.get("/patients/{patient_id}/assessments")
def get_patient_assessments(
    patient_id: int,
    current_user: models.User = Depends(require_role(["DERMATOLOGIST", "ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Return the patient's complete assessment history with real fields.
    Ordered newest → oldest.
    """
    _get_user_patient(patient_id, db)

    assessments = (
        db.query(models.Assessment)
        .filter(models.Assessment.user_id == patient_id)
        .order_by(models.Assessment.assessment_time.desc())
        .all()
    )

    assessment_list = [
        {
            "id": a.id,
            "assessment_time": a.assessment_time,
            "health_score": a.health_score,
            "predicted_skin_type": a.predicted_skin_type,
            "overall_condition": a.overall_condition,
            "concerns": a.concerns,
            "priority_order": a.priority_order,
            "risk_factors": a.risk_factors,
            "vision_predicted_concern": a.vision_predicted_concern,
            "vision_confidence": a.vision_confidence,
            "image_url": a.image_url,
            "recommendations": a.recommendations,
        }
        for a in assessments
    ]

    return {
        "status": "success",
        "patient_id": patient_id,
        "total": len(assessment_list),
        "assessments": assessment_list,
    }


# ---------------------------------------------------------------------------
# 4. GET /dermatologist/patients/{patient_id}/health-score
# ---------------------------------------------------------------------------

@router.get("/patients/{patient_id}/health-score")
def get_patient_health_score(
    patient_id: int,
    current_user: models.User = Depends(require_role(["DERMATOLOGIST", "ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Return current health score and scoring-factor information.
    Reuses scoring_engine.py. Returns the latest assessment's score
    and factor breakdown.
    """
    _get_user_patient(patient_id, db)

    latest = _latest_assessment(patient_id, db)
    if latest is None:
        return {
            "status": "no_assessment",
            "patient_id": patient_id,
            "overall_score": None,
            "factors": None,
            "message": "Patient has no assessment data.",
        }

    # Calculate all scoring factors using scoring_engine
    skin_condition = calculate_skin_condition_score(latest)
    lifestyle = calculate_lifestyle_score(latest)
    sleep = calculate_sleep_score(latest)
    routine = calculate_routine_consistency_score(db, patient_id)
    hydration = calculate_hydration_score(latest)
    overall = calculate_overall_score(
        skin_condition=skin_condition,
        lifestyle_habits=lifestyle,
        sleep_quality=sleep,
        routine_consistency=routine,
        hydration_level=hydration,
    )

    return {
        "status": "success",
        "patient_id": patient_id,
        "assessment_id": latest.id,
        "assessment_time": latest.assessment_time,
        "overall_score": overall,
        "factors": {
            "skin_condition": {
                "score": skin_condition,
                "weight": 0.35,
            },
            "lifestyle": {
                "score": lifestyle,
                "weight": 0.20,
            },
            "routine_consistency": {
                "score": routine,
                "weight": 0.20,
            },
            "sleep_quality": {
                "score": sleep,
                "weight": 0.15,
            },
            "hydration_level": {
                "score": hydration,
                "weight": 0.10,
            },
        },
    }


# ---------------------------------------------------------------------------
# 5. GET /dermatologist/patients/{patient_id}/risk-factors
# ---------------------------------------------------------------------------

@router.get("/patients/{patient_id}/risk-factors")
def get_patient_risk_factors(
    patient_id: int,
    current_user: models.User = Depends(require_role(["DERMATOLOGIST", "ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Return clinically useful risk information from the patient's
    assessment history. Uses real risk_factors, concerns, priority_order,
    vision_predicted_concern, and overall_condition from assessments.
    """
    _get_user_patient(patient_id, db)

    latest = _latest_assessment(patient_id, db)
    if latest is None:
        return {
            "status": "no_assessment",
            "patient_id": patient_id,
            "risk_factors": None,
            "message": "Patient has no assessment data.",
        }

    return {
        "status": "success",
        "patient_id": patient_id,
        "assessment_id": latest.id,
        "assessment_time": latest.assessment_time,
        "overall_condition": latest.overall_condition,
        "health_score": latest.health_score,
        "concerns": latest.concerns,
        "priority_order": latest.priority_order,
        "risk_factors": latest.risk_factors,
        "vision_predicted_concern": latest.vision_predicted_concern,
        "vision_confidence": latest.vision_confidence,
        "predicted_skin_type": latest.predicted_skin_type,
    }


# ---------------------------------------------------------------------------
# 6. GET /dermatologist/patients/{patient_id}/progress
# ---------------------------------------------------------------------------

@router.get("/patients/{patient_id}/progress")
def get_patient_progress(
    patient_id: int,
    current_user: models.User = Depends(require_role(["DERMATOLOGIST", "ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Provide progress analytics using real historical data.
    Returns score trend, adherence trend, baseline vs current scores,
    and percentage change using actual assessment dates.
    """
    _get_user_patient(patient_id, db)

    # Get all assessments for this patient (oldest first for trend)
    assessments = (
        db.query(models.Assessment)
        .filter(models.Assessment.user_id == patient_id)
        .order_by(models.Assessment.assessment_time.asc())
        .all()
    )

    if len(assessments) == 0:
        return {
            "status": "no_assessment",
            "patient_id": patient_id,
            "message": "Patient has no assessment data.",
        }

    # Score trend
    score_trend = [
        {
            "date": a.assessment_time.strftime("%d %b"),
            "score": a.health_score,
            "full_date": a.assessment_time,
        }
        for a in assessments
    ]

    baseline_score = assessments[0].health_score
    current_score = assessments[-1].health_score
    score_change = current_score - baseline_score
    percentage_change = (
        (score_change / baseline_score * 100) if baseline_score > 0 else 0
    )

    # Adherence trend from RoutineLog
    routine_logs = (
        db.query(models.RoutineLog)
        .filter(models.RoutineLog.user_id == patient_id)
        .order_by(models.RoutineLog.log_date.asc())
        .all()
    )

    adherence_trend = [
        {
            "date": log.log_date.strftime("%d %b"),
            "adherence_percent": (
                int(log.completed_count / log.total_count * 100)
                if log.total_count > 0
                else 0
            ),
            "full_date": log.log_date,
        }
        for log in routine_logs
    ]

    # Average adherence
    avg_adherence = (
        int(sum(log.completed_count for log in routine_logs) /
            sum(log.total_count for log in routine_logs) * 100)
        if any(log.total_count > 0 for log in routine_logs)
        else None
    )

    return {
        "status": "success",
        "patient_id": patient_id,
        "baseline_score": baseline_score,
        "current_score": current_score,
        "score_change": score_change,
        "percentage_change": round(percentage_change, 2),
        "score_trend": score_trend,
        "adherence_trend": adherence_trend,
        "average_adherence": avg_adherence,
        "total_assessments": len(assessments),
        "total_adherence_logs": len(routine_logs),
    }


# ---------------------------------------------------------------------------
# 7. GET /dermatologist/stats
# ---------------------------------------------------------------------------

@router.get("/stats")
def get_dermatologist_stats(
    current_user: models.User = Depends(require_role(["DERMATOLOGIST", "ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Provide dashboard-level clinical statistics from real database data.
    - total patients (all USER-role records)
    - patients with assessments
    - average health score (across all patients' latest assessments)
    - average adherence (from routine logs)
    - distinct skin condition types
    """
    # Total patients
    total_patients = db.query(func.count(models.User.id)).filter(
        models.User.role == "USER"
    ).scalar() or 0

    # Get all unique patients with assessments
    patients_with_assessments = (
        db.query(models.Assessment.user_id)
        .distinct()
        .count()
    )

    # Average health score (latest assessment per patient)
    latest_assessments = (
        db.query(
            models.Assessment.user_id,
            func.max(models.Assessment.assessment_time).label("max_time"),
        )
        .group_by(models.Assessment.user_id)
        .subquery()
    )

    avg_health_score = (
        db.query(func.avg(models.Assessment.health_score))
        .join(
            latest_assessments,
            (models.Assessment.user_id == latest_assessments.c.user_id)
            & (models.Assessment.assessment_time == latest_assessments.c.max_time),
        )
        .scalar()
    )

    avg_health_score = round(avg_health_score, 1) if avg_health_score else None

    # Average adherence from routine logs
    total_completed = db.query(func.sum(models.RoutineLog.completed_count)).scalar() or 0
    total_logs = db.query(func.sum(models.RoutineLog.total_count)).scalar() or 0
    avg_adherence = (
        round(total_completed / total_logs * 100, 1) if total_logs > 0 else None
    )

    # Distinct skin condition types (from latest assessments)
    distinct_conditions = (
        db.query(func.count(func.distinct(models.Assessment.overall_condition)))
        .join(
            latest_assessments,
            (models.Assessment.user_id == latest_assessments.c.user_id)
            & (models.Assessment.assessment_time == latest_assessments.c.max_time),
        )
        .scalar()
    ) or 0

    return {
        "status": "success",
        "total_patients": total_patients,
        "patients_with_assessments": patients_with_assessments,
        "average_health_score": avg_health_score,
        "average_adherence": avg_adherence,
        "distinct_skin_conditions": distinct_conditions,
    }


# ---------------------------------------------------------------------------
# 8. PATCH /dermatologist/patients/{patient_id}/treatment-notes
# ---------------------------------------------------------------------------

class DermatologistTreatmentNotesUpdate(BaseModel):
    dermatologist_clinical_notes: str


@router.patch("/patients/{patient_id}/treatment-notes")
def update_patient_treatment_notes(
    patient_id: int,
    body: DermatologistTreatmentNotesUpdate,
    current_user: models.User = Depends(require_role(["DERMATOLOGIST", "ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Allows a dermatologist to add/update clinical treatment notes on the
    patient's latest assessment recommendations.

    SAFETY RULES (enforced here):
    - Only the 'dermatologist_clinical_notes' key inside
      Assessment.recommendations is touched. All other JSONB keys are
      preserved as-is.
    - Only DERMATOLOGIST and ADMIN roles reach this endpoint.
    - The assessment must belong to the specified patient_id.
    - We do NOT modify assessment health scores, diagnosis, Vision AI output,
      or original AI recommendations.
    - Existing consultant_notes and AI recommendations are never overwritten.
    """
    _get_user_patient(patient_id, db)

    latest = _latest_assessment(patient_id, db)
    if latest is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient has no assessment data to annotate.",
        )

    # Verify the assessment belongs to this patient (defence-in-depth)
    if latest.user_id != patient_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found for this patient.",
        )

    # Preserve all existing recommendation keys; only add/update dermatologist_clinical_notes
    existing_recs: Dict[str, Any] = (
        dict(latest.recommendations)
        if isinstance(latest.recommendations, dict)
        else {}
    )
    existing_recs["dermatologist_clinical_notes"] = body.dermatologist_clinical_notes.strip()

    # Write back via direct attribute assignment
    latest.recommendations = existing_recs

    # SQLAlchemy does not auto-detect JSONB mutations via dict assignment;
    # flag the column as modified explicitly.
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(latest, "recommendations")

    db.commit()
    db.refresh(latest)

    return {
        "status": "success",
        "patient_id": patient_id,
        "assessment_id": latest.id,
        "message": "Dermatologist clinical notes updated successfully.",
        "recommendations": latest.recommendations,
    }
