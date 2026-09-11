"""
FastAPI Router — Module 9: Consultant Dashboard
-----------------------------------------------
All endpoints are protected with require_role(["CONSULTANT", "ADMIN"]).

Client endpoints only operate on users with role = "USER".
Consultants cannot retrieve data for other consultants, dermatologists,
or administrators through these endpoints.

Existing business logic is reused without modification:
  - scoring_engine.py  (health score computation)
  - Assessment model   (assessment history, recommendations)
  - Routine model      (current routine)
  - RoutineLog model   (adherence history)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, Dict, Optional
from pydantic import BaseModel

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
    get_score_category,
)


router = APIRouter(
    prefix="/consultant",
    tags=["Consultant Dashboard"],
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_user_client(client_id: int, db: Session) -> models.User:
    """
    Retrieve a user whose role is USER by primary-key id.
    Returns HTTP 404 if not found or if the record belongs to a
    non-USER role (prevents leaking data about other roles).
    """
    client = (
        db.query(models.User)
        .filter(
            models.User.id == client_id,
            models.User.role == "USER",
        )
        .first()
    )
    if client is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client not found.",
        )
    return client


def _latest_assessment(client_id: int, db: Session) -> Optional[models.Assessment]:
    return (
        db.query(models.Assessment)
        .filter(models.Assessment.user_id == client_id)
        .order_by(models.Assessment.assessment_time.desc())
        .first()
    )


def _build_client_summary(user: models.User, db: Session) -> dict:
    """
    Builds a lightweight client profile dict that includes the latest
    assessment summary (if any).  Password and auth fields are never
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
# 1. GET /consultant/clients
# ---------------------------------------------------------------------------

@router.get("/clients")
def list_clients(
    current_user: models.User = Depends(require_role(["CONSULTANT", "ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Returns all users with role = 'USER', enriched with their latest
    assessment summary.  Passwords and authentication fields are never
    returned.
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
        "clients": [_build_client_summary(u, db) for u in users],
    }


# ---------------------------------------------------------------------------
# 2. GET /consultant/clients/{client_id}
# ---------------------------------------------------------------------------

@router.get("/clients/{client_id}")
def get_client(
    client_id: int,
    current_user: models.User = Depends(require_role(["CONSULTANT", "ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Returns a single client's full profile and latest assessment summary.
    Only accessible for users with role = 'USER'.
    """
    client = _get_user_client(client_id, db)
    return {
        "status": "success",
        "client": _build_client_summary(client, db),
    }


# ---------------------------------------------------------------------------
# 3. GET /consultant/clients/{client_id}/assessments
# ---------------------------------------------------------------------------

@router.get("/clients/{client_id}/assessments")
def get_client_assessments(
    client_id: int,
    current_user: models.User = Depends(require_role(["CONSULTANT", "ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Returns the full assessment history for a given client (USER role only).
    Reuses the existing Assessment model — no new logic.
    """
    _get_user_client(client_id, db)  # validate client exists and is USER role

    assessments = (
        db.query(models.Assessment)
        .filter(models.Assessment.user_id == client_id)
        .order_by(models.Assessment.assessment_time.desc())
        .all()
    )

    return {
        "status": "success",
        "client_id": client_id,
        "total": len(assessments),
        "assessments": [
            {
                "id": a.id,
                "user_id": a.user_id,
                "assessment_time": a.assessment_time,
                "age": a.age,
                "gender": a.gender,
                "hydration_level": a.hydration_level,
                "oil_level": a.oil_level,
                "sensitivity": a.sensitivity,
                "humidity": a.humidity,
                "temperature": a.temperature,
                "sleep_hours": a.sleep_hours,
                "sleep_quality": a.sleep_quality,
                "water_glasses": a.water_glasses,
                "lifestyle_habits": a.lifestyle_habits,
                "allergies": a.allergies,
                "predicted_skin_type": a.predicted_skin_type,
                "health_score": a.health_score,
                "overall_condition": a.overall_condition,
                "vision_predicted_concern": a.vision_predicted_concern,
                "vision_confidence": a.vision_confidence,
                "concerns": a.concerns,
                "priority_order": a.priority_order,
                "risk_factors": a.risk_factors,
                "recommendations": a.recommendations,
                "image_url": a.image_url,
            }
            for a in assessments
        ],
    }


# ---------------------------------------------------------------------------
# 4. GET /consultant/clients/{client_id}/scoring
# ---------------------------------------------------------------------------

@router.get("/clients/{client_id}/scoring")
def get_client_scoring(
    client_id: int,
    current_user: models.User = Depends(require_role(["CONSULTANT", "ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Returns the health score summary for a given client.
    Calls the existing scoring_engine.py functions — no duplication.
    """
    _get_user_client(client_id, db)

    latest = _latest_assessment(client_id, db)
    if latest is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No skin assessment found for this client.",
        )

    # Reuse all five scoring functions from the existing scoring engine
    skin_condition     = calculate_skin_condition_score(latest)
    lifestyle_habits   = calculate_lifestyle_score(latest)
    sleep_quality      = calculate_sleep_score(latest)
    routine_consistency = calculate_routine_consistency_score(db, client_id)
    hydration_level    = calculate_hydration_score(latest)

    overall_score = calculate_overall_score(
        skin_condition=skin_condition,
        lifestyle_habits=lifestyle_habits,
        sleep_quality=sleep_quality,
        routine_consistency=routine_consistency,
        hydration_level=hydration_level,
    )

    category = get_score_category(overall_score)

    # Assessment trend history (same shape as user /scoring/summary)
    history = (
        db.query(models.Assessment)
        .filter(models.Assessment.user_id == client_id)
        .order_by(models.Assessment.assessment_time.asc())
        .all()
    )

    assessment_trend = [
        {
            "assessment_id": a.id,
            "assessment_time": a.assessment_time.isoformat() if a.assessment_time else None,
            "health_score": a.health_score,
        }
        for a in history
    ]

    return {
        "status": "success",
        "client_id": client_id,
        "overall_score": overall_score,
        "category": {
            "label": category["label"],
            "color": category["color"],
            "badge_class": category["badge_class"],
        },
        "breakdown": {
            "skin_condition": skin_condition,
            "lifestyle_habits": lifestyle_habits,
            "sleep_quality": sleep_quality,
            "routine_consistency": routine_consistency,
            "hydration_level": hydration_level,
        },
        "weights": {
            "skin_condition": 0.35,
            "lifestyle_habits": 0.20,
            "sleep_quality": 0.15,
            "routine_consistency": 0.20,
            "hydration_level": 0.10,
        },
        "assessment_trend": assessment_trend,
    }


# ---------------------------------------------------------------------------
# 5. GET /consultant/clients/{client_id}/adherence
# ---------------------------------------------------------------------------

@router.get("/clients/{client_id}/adherence")
def get_client_adherence(
    client_id: int,
    current_user: models.User = Depends(require_role(["CONSULTANT", "ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Returns routine adherence history for a given client.
    Reuses the existing RoutineLog model — no duplication.
    """
    _get_user_client(client_id, db)

    logs = (
        db.query(models.RoutineLog)
        .filter(models.RoutineLog.user_id == client_id)
        .order_by(models.RoutineLog.log_date.asc())
        .all()
    )

    history = []
    for log in logs:
        pct = (
            round((log.completed_count / float(log.total_count)) * 100.0, 1)
            if log.total_count > 0
            else 0.0
        )
        history.append({
            "id": log.id,
            "log_date": str(log.log_date),
            "completed_count": log.completed_count,
            "total_count": log.total_count,
            "adherence_percentage": pct,
        })

    return {
        "status": "success",
        "client_id": client_id,
        "total_logs": len(history),
        "history": history,
    }


# ---------------------------------------------------------------------------
# 6. GET /consultant/clients/{client_id}/routine
# ---------------------------------------------------------------------------

@router.get("/clients/{client_id}/routine")
def get_client_routine(
    client_id: int,
    current_user: models.User = Depends(require_role(["CONSULTANT", "ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Returns the client's existing saved routine where available.
    Reads directly from the Routine model — no routine regeneration.
    """
    _get_user_client(client_id, db)

    # Find latest assessment for this client
    latest_assessment = _latest_assessment(client_id, db)
    if latest_assessment is None:
        return {
            "status": "no_assessment",
            "client_id": client_id,
            "routine": None,
            "message": "Client has no skin assessment yet.",
        }

    # Look for a saved routine for latest assessment
    saved_routine = (
        db.query(models.Routine)
        .filter(
            models.Routine.user_id == client_id,
            models.Routine.assessment_id == latest_assessment.id,
        )
        .first()
    )

    if saved_routine is None:
        return {
            "status": "no_routine",
            "client_id": client_id,
            "routine": None,
            "message": "Client has not yet generated a routine.",
        }

    return {
        "status": "success",
        "client_id": client_id,
        "routine_id": saved_routine.id,
        "assessment_id": latest_assessment.id,
        "created_at": saved_routine.created_at,
        "updated_at": saved_routine.updated_at,
        "routine": saved_routine.routine_data,
    }


# ---------------------------------------------------------------------------
# 7. GET /consultant/clients/{client_id}/recommendations
# ---------------------------------------------------------------------------

@router.get("/clients/{client_id}/recommendations")
def get_client_recommendations(
    client_id: int,
    current_user: models.User = Depends(require_role(["CONSULTANT", "ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Returns the recommendations stored on the client's latest assessment.
    Recommendations are stored as a JSONB column on the Assessment model —
    no separate table exists or is created.
    """
    _get_user_client(client_id, db)

    latest = _latest_assessment(client_id, db)
    if latest is None:
        return {
            "status": "no_assessment",
            "client_id": client_id,
            "assessment_id": None,
            "recommendations": None,
            "consultant_notes": None,
            "message": "Client has no assessment data.",
        }

    recs = latest.recommendations or {}

    return {
        "status": "success",
        "client_id": client_id,
        "assessment_id": latest.id,
        "assessment_time": latest.assessment_time,
        "recommendations": recs,
        # consultant_notes lives inside recs["consultant_notes"] if set
        "consultant_notes": recs.get("consultant_notes") if isinstance(recs, dict) else None,
    }


# ---------------------------------------------------------------------------
# 8. PATCH /consultant/clients/{client_id}/recommendations
# ---------------------------------------------------------------------------

class ConsultantNotesUpdate(BaseModel):
    consultant_notes: str


@router.patch("/clients/{client_id}/recommendations")
def update_client_recommendations(
    client_id: int,
    body: ConsultantNotesUpdate,
    current_user: models.User = Depends(require_role(["CONSULTANT", "ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Allows a consultant to write/update notes on the client's latest
    assessment recommendations.

    SAFETY RULES (enforced here):
    - Only the 'consultant_notes' key inside Assessment.recommendations
      is touched.  All other JSONB keys are preserved as-is.
    - Only CONSULTANT and ADMIN roles reach this endpoint (via require_role).
    - The assessment must belong to the specified client_id.
    - We do NOT use a generic assessment update path — this endpoint is
      dedicated and narrowly scoped.
    """
    _get_user_client(client_id, db)

    latest = _latest_assessment(client_id, db)
    if latest is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client has no assessment data to annotate.",
        )

    # Verify the assessment belongs to this client (defence-in-depth)
    if latest.user_id != client_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found for this client.",
        )

    # Preserve all existing recommendation keys; only add/update consultant_notes
    existing_recs: Dict[str, Any] = dict(latest.recommendations) if isinstance(latest.recommendations, dict) else {}
    existing_recs["consultant_notes"] = body.consultant_notes.strip()

    # Write back via direct attribute assignment (triggers JSONB update)
    latest.recommendations = existing_recs

    # SQLAlchemy does not auto-detect JSONB mutations via dict assignment;
    # flag the column as modified explicitly.
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(latest, "recommendations")

    db.commit()
    db.refresh(latest)

    return {
        "status": "success",
        "message": "Consultant notes saved successfully.",
        "client_id": client_id,
        "assessment_id": latest.id,
        "consultant_notes": latest.recommendations.get("consultant_notes"),
    }


# ---------------------------------------------------------------------------
# 9. GET /consultant/stats
# ---------------------------------------------------------------------------

@router.get("/stats")
def get_consultant_stats(
    current_user: models.User = Depends(require_role(["CONSULTANT", "ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Returns real aggregate statistics for the Consultant Dashboard KPI tiles.

    - total_clients:        count of users with role = 'USER'
    - avg_adherence:        mean adherence % across all RoutineLog records
                            (None if no logs exist)
    - skin_type_distribution: count of each predicted_skin_type from latest
                              assessment per client
    - pending_reviews:      deliberately omitted — no defensible definition
                            exists in the current schema; returned as null.
    """
    # --- Total clients ---
    total_clients = (
        db.query(models.User)
        .filter(models.User.role == "USER")
        .count()
    )

    # --- Average adherence (all RoutineLog records, all users) ---
    all_logs = db.query(models.RoutineLog).all()
    if all_logs:
        percentages = [
            round((log.completed_count / float(log.total_count)) * 100.0, 1)
            if log.total_count > 0 else 0.0
            for log in all_logs
        ]
        avg_adherence = round(sum(percentages) / len(percentages), 1)
    else:
        avg_adherence = None

    # --- Skin type distribution (latest assessment per USER) ---
    all_user_ids = [
        row[0]
        for row in db.query(models.User.id).filter(models.User.role == "USER").all()
    ]

    skin_type_counts: Dict[str, int] = {}
    for uid in all_user_ids:
        latest = _latest_assessment(uid, db)
        if latest and latest.predicted_skin_type:
            st = latest.predicted_skin_type
            skin_type_counts[st] = skin_type_counts.get(st, 0) + 1

    skin_type_distribution = [
        {"label": k, "value": v}
        for k, v in sorted(skin_type_counts.items(), key=lambda x: -x[1])
    ]

    return {
        "status": "success",
        "total_clients": total_clients,
        "avg_adherence": avg_adherence,
        "pending_reviews": None,   # no schema-backed definition; not fabricated
        "skin_type_distribution": skin_type_distribution,
    }
