"""
Admin Dashboard Router (Module 11)

Provides platform-wide admin endpoints for:
  1. User Management (list, search, filter, view details)
  2. Platform Analytics (health metrics, trends, adherence, completion rates)
  3. Recommendation Monitoring (pending reviews, clinical notes tracking)
  4. System Reports (JSON/CSV exports)

RBAC: All endpoints require strict ADMIN role authorization.

Architecture:
  - Queries are platform-wide (NOT filtered by current_user.id)
  - All data is read-only (no edits, deletes, role reassignments)
  - Follows patterns from consultant.py and dermatologist.py
  - Uses same RBAC dependency from dependencies.py
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import csv
from io import StringIO

from app.database import get_db
from app.dependencies import require_role
from app import models

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def _get_user_by_id(user_id: int, db: Session) -> models.User:
    """Retrieve user by ID or raise 404."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found."
        )
    return user


def _latest_assessment_for_user(user_id: int, db: Session) -> Optional[models.Assessment]:
    """Get the most recent assessment for a user, or None if none exist."""
    return (
        db.query(models.Assessment)
        .filter(models.Assessment.user_id == user_id)
        .order_by(models.Assessment.assessment_time.desc())
        .first()
    )


def _build_user_response(user: models.User, db: Session) -> dict:
    """Build standard user response object."""
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "provider": user.provider,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
    }


def _get_user_assessment_summary(user: models.User, db: Session) -> dict:
    """Build user response with assessment summary."""
    latest = _latest_assessment_for_user(user.id, db)
    assessment_count = (
        db.query(models.Assessment)
        .filter(models.Assessment.user_id == user.id)
        .count()
    )

    response = _build_user_response(user, db)
    response["assessment_count"] = assessment_count
    response["latest_assessment_date"] = (
        latest.assessment_time.isoformat() if latest and latest.assessment_time else None
    )

    return response


# ============================================================================
# 1. USER MANAGEMENT ENDPOINTS
# ============================================================================

@router.get("/users")
def list_users(
    search: Optional[str] = Query(None, min_length=1, max_length=100),
    role: Optional[str] = Query(None),
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    List all users with optional search and role filtering.

    Query Parameters:
      - search: Filter by full_name or email (case-insensitive)
      - role: Filter by exact role ('user', 'consultant', 'dermatologist', 'admin')

    Returns all users with: id, full_name, email, role, provider, created_at, updated_at
    """
    query = db.query(models.User)

    # Apply role filter if provided
    if role:
        query = query.filter(models.User.role == role.lower())

    # Apply search filter if provided (search full_name or email)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.User.full_name.ilike(search_term),
                models.User.email.ilike(search_term)
            )
        )

    users = query.order_by(models.User.created_at.desc()).all()

    return {
        "status": "success",
        "total": len(users),
        "users": [_build_user_response(u, db) for u in users],
    }


@router.get("/users/{user_id}")
def get_user_details(
    user_id: int,
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Get detailed user information including assessment summary.

    Returns: id, full_name, email, role, provider, created_at, updated_at,
             assessment_count, latest_assessment_date

    Returns 404 if user not found.
    """
    user = _get_user_by_id(user_id, db)

    return {
        "status": "success",
        "user": _get_user_assessment_summary(user, db),
    }


# ============================================================================
# 2. USER STATISTICS ENDPOINTS
# ============================================================================

@router.get("/statistics/users")
def get_user_statistics(
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Get user counts grouped by role.

    Returns counts for: user, consultant, dermatologist, admin
    """
    role_counts = (
        db.query(models.User.role, func.count(models.User.id))
        .group_by(models.User.role)
        .all()
    )

    # Initialize all roles with 0
    data = {
        "user": 0,
        "consultant": 0,
        "dermatologist": 0,
        "admin": 0,
    }

    # Populate with actual counts
    for role, count in role_counts:
        role_key = (role or "user").lower()
        if role_key in data:
            data[role_key] = count

    return {
        "status": "success",
        "data": data,
    }


# ============================================================================
# 3. PLATFORM ANALYTICS ENDPOINTS
# ============================================================================

@router.get("/analytics/health-metrics")
def get_health_metrics(
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Get platform-wide health score aggregates and condition distribution.

    Returns:
      - avg_score: Average health_score across all assessments (null if none)
      - distribution: Count of assessments by overall_condition
    """
    # Calculate average health score
    avg_result = (
        db.query(func.avg(models.Assessment.health_score))
        .scalar()
    )
    avg_score = round(float(avg_result), 2) if avg_result is not None else None

    # Get distribution by overall_condition
    condition_counts = (
        db.query(
            models.Assessment.overall_condition,
            func.count(models.Assessment.id)
        )
        .filter(models.Assessment.overall_condition.isnot(None))
        .group_by(models.Assessment.overall_condition)
        .order_by(func.count(models.Assessment.id).desc())
        .all()
    )

    distribution = [
        {
            "overall_condition": condition or "Unknown",
            "count": count
        }
        for condition, count in condition_counts
    ]

    return {
        "status": "success",
        "avg_score": avg_score,
        "distribution": distribution,
    }


@router.get("/analytics/assessment-trend")
def get_assessment_trend(
    days: Optional[int] = Query(30, ge=1, le=365),
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Get daily assessment creation counts for the last N days.

    Query Parameters:
      - days: Number of days to retrieve (1-365, default 30)

    Returns array of {date, count} for each day.
    """
    # Calculate cutoff date
    cutoff_date = datetime.utcnow() - timedelta(days=days)

    # Query assessments grouped by date
    daily_counts = (
        db.query(
            func.date(models.Assessment.assessment_time).label("date"),
            func.count(models.Assessment.id).label("count")
        )
        .filter(models.Assessment.assessment_time >= cutoff_date)
        .group_by(func.date(models.Assessment.assessment_time))
        .order_by(func.date(models.Assessment.assessment_time))
        .all()
    )

    data = [
        {
            "date": date.isoformat() if date else None,
            "count": count
        }
        for date, count in daily_counts
    ]

    return {
        "status": "success",
        "days": days,
        "data": data,
    }


@router.get("/analytics/adherence")
def get_adherence_statistics(
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Get platform-wide routine adherence statistics.

    Calculates adherence as: (completed_count / total_count) * 100

    Returns:
      - avg_adherence: Average adherence percentage (null if no logs)
      - total_logs: Total routine log entries
      - distribution: Counts in adherence ranges (0-25%, 25-50%, etc.)
    """
    all_logs = db.query(models.RoutineLog).all()

    if not all_logs:
        return {
            "status": "success",
            "avg_adherence": None,
            "total_logs": 0,
            "distribution": [
                {"range": "0-25%", "count": 0},
                {"range": "25-50%", "count": 0},
                {"range": "50-75%", "count": 0},
                {"range": "75-100%", "count": 0},
            ],
        }

    # Calculate adherence for each log
    adherence_percentages = []
    for log in all_logs:
        if log.total_count > 0:
            pct = round((log.completed_count / float(log.total_count)) * 100.0, 1)
            adherence_percentages.append(pct)
        else:
            adherence_percentages.append(0.0)

    # Calculate average
    avg_adherence = round(sum(adherence_percentages) / len(adherence_percentages), 1) if adherence_percentages else None

    # Count distribution by ranges
    distribution = {
        "0-25%": sum(1 for pct in adherence_percentages if 0 <= pct < 25),
        "25-50%": sum(1 for pct in adherence_percentages if 25 <= pct < 50),
        "50-75%": sum(1 for pct in adherence_percentages if 50 <= pct < 75),
        "75-100%": sum(1 for pct in adherence_percentages if 75 <= pct <= 100),
    }

    return {
        "status": "success",
        "avg_adherence": avg_adherence,
        "total_logs": len(all_logs),
        "distribution": [
            {"range": k, "count": v}
            for k, v in distribution.items()
        ],
    }


@router.get("/analytics/skin-types")
def get_skin_type_distribution(
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Get distribution of predicted skin types from latest assessments.

    Returns array of {skin_type, count} sorted by count descending.
    """
    # Get all users
    all_user_ids = [
        row[0] for row in db.query(models.User.id).all()
    ]

    skin_type_counts: Dict[str, int] = {}

    # For each user, get latest assessment and extract skin type
    for uid in all_user_ids:
        latest = _latest_assessment_for_user(uid, db)
        if latest and latest.predicted_skin_type:
            st = latest.predicted_skin_type
            skin_type_counts[st] = skin_type_counts.get(st, 0) + 1

    # Sort by count descending
    distribution = [
        {"skin_type": k, "count": v}
        for k, v in sorted(skin_type_counts.items(), key=lambda x: -x[1])
    ]

    return {
        "status": "success",
        "data": distribution,
    }


@router.get("/analytics/completion-rate")
def get_completion_rate(
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Get assessment completion rate (% of users with at least one assessment).

    Returns:
      - total_users: Total registered users
      - users_assessed: Count of users with >=1 assessment
      - completion_percent: (users_assessed / total_users) * 100
      - by_role: Breakdown by user role
    """
    # Total users
    total_users = db.query(models.User).count()

    # Users with at least one assessment
    users_with_assessment = (
        db.query(func.count(func.distinct(models.Assessment.user_id)))
        .scalar()
    ) or 0

    completion_percent = (
        round((users_with_assessment / total_users) * 100, 2)
        if total_users > 0
        else 0.0
    )

    # Breakdown by role
    by_role = {}
    role_counts = (
        db.query(models.User.role, func.count(models.User.id))
        .group_by(models.User.role)
        .all()
    )

    for role, count in role_counts:
        role_key = (role or "user").lower()
        # Count users of this role with assessments
        users_assessed_in_role = (
            db.query(func.count(func.distinct(models.Assessment.user_id)))
            .join(models.User, models.Assessment.user_id == models.User.id)
            .filter(models.User.role == role)
            .scalar()
        ) or 0

        pct = round((users_assessed_in_role / count) * 100, 2) if count > 0 else 0.0
        by_role[role_key] = {
            "total": count,
            "assessed": users_assessed_in_role,
            "percent": pct,
        }

    return {
        "status": "success",
        "total_users": total_users,
        "users_assessed": users_with_assessment,
        "completion_percent": completion_percent,
        "by_role": by_role,
    }


# ============================================================================
# 4. RECOMMENDATION MONITORING ENDPOINTS
# ============================================================================

@router.get("/monitoring/recommendations")
def get_recommendations_stats(
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Get recommendation statistics across all assessments.

    Counts:
      - total_assessments: Total assessments in system
      - with_recommendations: Assessments where recommendations field is NOT NULL
      - with_consultant_notes: Assessments where recommendations has consultant_notes
      - with_dermatologist_notes: Assessments where recommendations has dermatologist_clinical_notes
    """
    all_assessments = db.query(models.Assessment).all()

    total_assessments = len(all_assessments)
    with_recommendations = 0
    with_consultant_notes = 0
    with_dermatologist_notes = 0

    for assessment in all_assessments:
        if assessment.recommendations is not None:
            with_recommendations += 1

            if isinstance(assessment.recommendations, dict):
                if assessment.recommendations.get("consultant_notes"):
                    with_consultant_notes += 1
                if assessment.recommendations.get("dermatologist_clinical_notes"):
                    with_dermatologist_notes += 1

    return {
        "status": "success",
        "total_assessments": total_assessments,
        "with_recommendations": with_recommendations,
        "with_consultant_notes": with_consultant_notes,
        "with_dermatologist_notes": with_dermatologist_notes,
    }


@router.get("/monitoring/pending-reviews")
def get_pending_reviews(
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Get counts of assessments pending consultant/dermatologist review.

    Pending consultant: Recommendations is NULL or consultant_notes is missing/empty
    Pending dermatologist: Recommendations exists but dermatologist_clinical_notes is missing/empty
    Complete: Both consultant_notes and dermatologist_clinical_notes present
    """
    # All assessments
    all_assessments = db.query(models.Assessment).all()

    pending_consultant = 0
    pending_dermatologist = 0
    complete_reviews = 0

    for assessment in all_assessments:
        if assessment.recommendations is None or not isinstance(assessment.recommendations, dict):
            # No recommendations at all = pending consultant
            pending_consultant += 1
        else:
            has_consultant = bool(
                assessment.recommendations.get("consultant_notes")
                and str(assessment.recommendations.get("consultant_notes")).strip()
            )
            has_dermatologist = bool(
                assessment.recommendations.get("dermatologist_clinical_notes")
                and str(assessment.recommendations.get("dermatologist_clinical_notes")).strip()
            )

            if not has_consultant:
                pending_consultant += 1
            elif not has_dermatologist:
                pending_dermatologist += 1
            else:
                complete_reviews += 1

    return {
        "status": "success",
        "pending_consultant": pending_consultant,
        "pending_dermatologist": pending_dermatologist,
        "complete_reviews": complete_reviews,
    }


@router.get("/monitoring/review-progress")
def get_review_progress(
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Get detailed breakdown of clinical review progress.

    Returns:
      - users_awaiting_consultant: Distinct users with assessments pending consultant review
      - assessments_awaiting_consultant: Count of such assessments
      - users_awaiting_dermatologist: Distinct users with assessments pending dermatologist review
      - assessments_awaiting_dermatologist: Count of such assessments
      - users_with_complete_reviews: Distinct users with fully reviewed assessments
      - assessments_complete: Count of fully reviewed assessments
    """
    all_assessments = db.query(models.Assessment).all()

    users_awaiting_consultant = set()
    users_awaiting_dermatologist = set()
    users_with_complete_reviews = set()

    assessments_awaiting_consultant = 0
    assessments_awaiting_dermatologist = 0
    assessments_complete = 0

    for assessment in all_assessments:
        if assessment.recommendations is None or not isinstance(assessment.recommendations, dict):
            # Pending consultant
            users_awaiting_consultant.add(assessment.user_id)
            assessments_awaiting_consultant += 1
        else:
            has_consultant = bool(
                assessment.recommendations.get("consultant_notes")
                and str(assessment.recommendations.get("consultant_notes")).strip()
            )
            has_dermatologist = bool(
                assessment.recommendations.get("dermatologist_clinical_notes")
                and str(assessment.recommendations.get("dermatologist_clinical_notes")).strip()
            )

            if not has_consultant:
                users_awaiting_consultant.add(assessment.user_id)
                assessments_awaiting_consultant += 1
            elif not has_dermatologist:
                users_awaiting_dermatologist.add(assessment.user_id)
                assessments_awaiting_dermatologist += 1
            else:
                users_with_complete_reviews.add(assessment.user_id)
                assessments_complete += 1

    return {
        "status": "success",
        "users_awaiting_consultant": len(users_awaiting_consultant),
        "assessments_awaiting_consultant": assessments_awaiting_consultant,
        "users_awaiting_dermatologist": len(users_awaiting_dermatologist),
        "assessments_awaiting_dermatologist": assessments_awaiting_dermatologist,
        "users_with_complete_reviews": len(users_with_complete_reviews),
        "assessments_complete": assessments_complete,
    }


# ============================================================================
# 5. SYSTEM REPORTS ENDPOINTS
# ============================================================================

@router.get("/reports/analytics")
def get_analytics_report(
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Get comprehensive platform analytics snapshot (JSON format).

    Combines data from users, assessments, routines for a quick overview.
    """
    # User statistics
    total_users = db.query(models.User).count()
    role_counts = (
        db.query(models.User.role, func.count(models.User.id))
        .group_by(models.User.role)
        .all()
    )
    users_by_role = {(role or "user").lower(): count for role, count in role_counts}

    # Assessment statistics
    total_assessments = db.query(models.Assessment).count()
    users_assessed = (
        db.query(func.count(func.distinct(models.Assessment.user_id)))
        .scalar()
    ) or 0

    # Health metrics
    avg_health_score = db.query(func.avg(models.Assessment.health_score)).scalar()
    avg_health_score = round(float(avg_health_score), 2) if avg_health_score else None

    condition_dist = (
        db.query(
            models.Assessment.overall_condition,
            func.count(models.Assessment.id)
        )
        .filter(models.Assessment.overall_condition.isnot(None))
        .group_by(models.Assessment.overall_condition)
        .all()
    )
    conditions = {condition or "Unknown": count for condition, count in condition_dist}

    # Adherence
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

    # Completion rate
    completion_pct = (
        round((users_assessed / total_users) * 100, 2) if total_users > 0 else 0.0
    )

    return {
        "status": "success",
        "timestamp": datetime.utcnow().isoformat(),
        "users": {
            "total": total_users,
            "by_role": users_by_role,
        },
        "assessments": {
            "total": total_assessments,
            "users_assessed": users_assessed,
            "completion_percent": completion_pct,
        },
        "health": {
            "avg_score": avg_health_score,
            "conditions": conditions,
        },
        "routine": {
            "avg_adherence": avg_adherence,
            "total_logs": len(all_logs),
        },
    }


@router.get("/reports/users")
def get_users_report(
    format: Optional[str] = Query("json", pattern="^(json|csv)$"),
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Export users report in JSON or CSV format.

    Includes: user_id, full_name, email, role, provider, created_at, latest_assessment_date

    Query Parameters:
      - format: 'json' or 'csv' (default: json)
    """
    users = db.query(models.User).order_by(models.User.created_at.desc()).all()

    if format == "csv":
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "user_id", "full_name", "email", "role", "provider",
            "created_at", "latest_assessment_date"
        ])

        for user in users:
            latest = _latest_assessment_for_user(user.id, db)
            latest_date = (
                latest.assessment_time.isoformat() if latest and latest.assessment_time else ""
            )
            writer.writerow([
                user.id,
                user.full_name,
                user.email,
                user.role,
                user.provider,
                user.created_at.isoformat() if user.created_at else "",
                latest_date,
            ])

        return {
            "status": "success",
            "format": "csv",
            "data": output.getvalue(),
        }
    else:
        # JSON format
        data = []
        for user in users:
            latest = _latest_assessment_for_user(user.id, db)
            data.append({
                "user_id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
                "provider": user.provider,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "latest_assessment_date": (
                    latest.assessment_time.isoformat() if latest and latest.assessment_time else None
                ),
            })

        return {
            "status": "success",
            "format": "json",
            "data": data,
        }


@router.get("/reports/assessments")
def get_assessments_report(
    format: Optional[str] = Query("json", pattern="^(json|csv)$"),
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Export assessments report in JSON or CSV format.

    Includes: user_id, user_name, assessment_date, health_score, overall_condition,
              skin_type, concerns (JSON string), risk_factors (JSON string)

    Query Parameters:
      - format: 'json' or 'csv' (default: json)
    """
    assessments = (
        db.query(models.Assessment)
        .join(models.User, models.Assessment.user_id == models.User.id)
        .order_by(models.Assessment.assessment_time.desc())
        .all()
    )

    if format == "csv":
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "user_id", "user_name", "assessment_date", "health_score",
            "overall_condition", "skin_type", "concerns", "risk_factors"
        ])

        for assessment in assessments:
            user = db.query(models.User).filter(models.User.id == assessment.user_id).first()
            writer.writerow([
                assessment.user_id,
                user.full_name if user else "Unknown",
                assessment.assessment_time.isoformat() if assessment.assessment_time else "",
                assessment.health_score,
                assessment.overall_condition,
                assessment.predicted_skin_type,
                str(assessment.concerns) if assessment.concerns else "",
                str(assessment.risk_factors) if assessment.risk_factors else "",
            ])

        return {
            "status": "success",
            "format": "csv",
            "data": output.getvalue(),
        }
    else:
        # JSON format
        data = []
        for assessment in assessments:
            user = db.query(models.User).filter(models.User.id == assessment.user_id).first()
            data.append({
                "user_id": assessment.user_id,
                "user_name": user.full_name if user else "Unknown",
                "assessment_date": (
                    assessment.assessment_time.isoformat() if assessment.assessment_time else None
                ),
                "health_score": assessment.health_score,
                "overall_condition": assessment.overall_condition,
                "skin_type": assessment.predicted_skin_type,
                "concerns": assessment.concerns,
                "risk_factors": assessment.risk_factors,
            })

        return {
            "status": "success",
            "format": "json",
            "data": data,
        }


@router.get("/reports/recommendations")
def get_recommendations_report(
    format: Optional[str] = Query("json", pattern="^(json|csv)$"),
    current_user: models.User = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db),
):
    """
    Export recommendations report in JSON or CSV format.

    Includes: user_id, user_name, assessment_date, health_score,
              has_consultant_notes (true/false), has_dermatologist_notes (true/false)

    Query Parameters:
      - format: 'json' or 'csv' (default: json)
    """
    assessments = (
        db.query(models.Assessment)
        .join(models.User, models.Assessment.user_id == models.User.id)
        .order_by(models.Assessment.assessment_time.desc())
        .all()
    )

    if format == "csv":
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "user_id", "user_name", "assessment_date", "health_score",
            "has_consultant_notes", "has_dermatologist_notes"
        ])

        for assessment in assessments:
            user = db.query(models.User).filter(models.User.id == assessment.user_id).first()

            has_consultant = False
            has_dermatologist = False

            if assessment.recommendations and isinstance(assessment.recommendations, dict):
                has_consultant = bool(
                    assessment.recommendations.get("consultant_notes")
                    and str(assessment.recommendations.get("consultant_notes")).strip()
                )
                has_dermatologist = bool(
                    assessment.recommendations.get("dermatologist_clinical_notes")
                    and str(assessment.recommendations.get("dermatologist_clinical_notes")).strip()
                )

            writer.writerow([
                assessment.user_id,
                user.full_name if user else "Unknown",
                assessment.assessment_time.isoformat() if assessment.assessment_time else "",
                assessment.health_score,
                "true" if has_consultant else "false",
                "true" if has_dermatologist else "false",
            ])

        return {
            "status": "success",
            "format": "csv",
            "data": output.getvalue(),
        }
    else:
        # JSON format
        data = []
        for assessment in assessments:
            user = db.query(models.User).filter(models.User.id == assessment.user_id).first()

            has_consultant = False
            has_dermatologist = False

            if assessment.recommendations and isinstance(assessment.recommendations, dict):
                has_consultant = bool(
                    assessment.recommendations.get("consultant_notes")
                    and str(assessment.recommendations.get("consultant_notes")).strip()
                )
                has_dermatologist = bool(
                    assessment.recommendations.get("dermatologist_clinical_notes")
                    and str(assessment.recommendations.get("dermatologist_clinical_notes")).strip()
                )

            data.append({
                "user_id": assessment.user_id,
                "user_name": user.full_name if user else "Unknown",
                "assessment_date": (
                    assessment.assessment_time.isoformat() if assessment.assessment_time else None
                ),
                "health_score": assessment.health_score,
                "has_consultant_notes": has_consultant,
                "has_dermatologist_notes": has_dermatologist,
            })

        return {
            "status": "success",
            "format": "json",
            "data": data,
        }
