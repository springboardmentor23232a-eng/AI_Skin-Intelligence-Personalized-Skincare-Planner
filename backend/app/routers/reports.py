"""
Module 11 Phase 1 — Report Data Foundation
Endpoints for generating report data for skin assessment, routine,
products, progress, and skin health reports.
"""

from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app import models
from app.dependencies import get_current_user
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
    prefix="/reports",
    tags=["Reports"]
)


def _serialize_datetime(dt):
    """Serialize datetime to ISO format string."""
    if dt is None:
        return None
    if isinstance(dt, str):
        return dt
    return dt.isoformat()


def _serialize_date(d):
    """Serialize date to ISO format string."""
    if d is None:
        return None
    if isinstance(d, str):
        return d
    return d.isoformat()


def _validate_date_range(start_date: Optional[date], end_date: Optional[date]):
    """Validate that start_date <= end_date if both provided."""
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date must be less than or equal to end_date"
        )


@router.get("/assessment")
def get_assessment_report(
    assessment_id: Optional[int] = Query(
        None,
        description="Specific assessment ID to retrieve. Returns most recent if not provided."
    ),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns skin assessment report data for the authenticated user.
    If assessment_id is provided, verifies ownership before returning.
    """
    try:
        if assessment_id is not None:
            # Fetch specific assessment with ownership check
            assessment = db.query(models.Assessment).filter(
                models.Assessment.id == assessment_id,
                models.Assessment.user_id == current_user.id
            ).first()
            
            if assessment is None:
                raise HTTPException(
                    status_code=404,
                    detail="Assessment not found."
                )
        else:
            # Fetch most recent assessment
            assessment = db.query(models.Assessment).filter(
                models.Assessment.user_id == current_user.id
            ).order_by(models.Assessment.assessment_time.desc()).first()
            
            if assessment is None:
                return {
                    "report_type": "skin_assessment",
                    "generated_at": datetime.utcnow().isoformat(),
                    "data": None,
                    "message": "No assessments found for this user."
                }
        
        return {
            "report_type": "skin_assessment",
            "generated_at": datetime.utcnow().isoformat(),
            "data": {
                "id": assessment.id,
                "assessment_time": _serialize_datetime(assessment.assessment_time),
                "predicted_skin_type": assessment.predicted_skin_type,
                "health_score": assessment.health_score,
                "overall_condition": assessment.overall_condition,
                "concerns": assessment.concerns,
                "vision_predicted_concern": assessment.vision_predicted_concern,
                "vision_confidence": assessment.vision_confidence,
                "recommendations": assessment.recommendations,
                "image_url": assessment.image_url,
                "lifestyle": {
                    "sleep_hours": assessment.sleep_hours,
                    "sleep_quality": assessment.sleep_quality,
                    "water_glasses": assessment.water_glasses,
                    "lifestyle_habits": assessment.lifestyle_habits,
                    "allergies": assessment.allergies
                },
                "environment": {
                    "humidity": assessment.humidity,
                    "temperature": assessment.temperature
                },
                "skin_properties": {
                    "age": assessment.age,
                    "gender": assessment.gender,
                    "hydration_level": assessment.hydration_level,
                    "oil_level": assessment.oil_level,
                    "sensitivity": assessment.sensitivity
                },
                "risk_factors": assessment.risk_factors,
                "priority_order": assessment.priority_order
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate assessment report: {str(e)}"
        )


@router.get("/routine")
def get_routine_report(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns routine report data including current routine and adherence history.
    """
    try:
        # Get the latest assessment for routine generation context
        assessment = db.query(models.Assessment).filter(
            models.Assessment.user_id == current_user.id
        ).order_by(models.Assessment.assessment_time.desc()).first()
        
        if assessment is None:
            return {
                "report_type": "routine",
                "generated_at": datetime.utcnow().isoformat(),
                "data": None,
                "message": "No assessment found. Complete an assessment to generate routine."
            }
        
        # Get current routine
        saved_routine = db.query(models.Routine).filter(
            models.Routine.user_id == current_user.id,
            models.Routine.assessment_id == assessment.id
        ).first()
        
        routine_data = saved_routine.routine_data if saved_routine else None
        
        # Get adherence history
        adherence_logs = db.query(models.RoutineLog).filter(
            models.RoutineLog.user_id == current_user.id
        ).order_by(models.RoutineLog.log_date.asc()).all()
        
        adherence_history = []
        for log in adherence_logs:
            adherence_pct = (
                round((log.completed_count / float(log.total_count)) * 100.0, 1)
                if log.total_count > 0 else 0.0
            )
            adherence_history.append({
                "id": log.id,
                "log_date": _serialize_date(log.log_date),
                "completed_count": log.completed_count,
                "total_count": log.total_count,
                "adherence_percentage": adherence_pct
            })
        
        # Calculate adherence summary
        if adherence_history:
            avg_adherence = sum(h["adherence_percentage"] for h in adherence_history) / len(adherence_history)
            max_adherence = max(h["adherence_percentage"] for h in adherence_history)
            latest_adherence = adherence_history[-1]["adherence_percentage"]
        else:
            avg_adherence = 0
            max_adherence = 0
            latest_adherence = 0
        
        return {
            "report_type": "routine",
            "generated_at": datetime.utcnow().isoformat(),
            "data": {
                "routine": routine_data,
                "adherence_summary": {
                    "total_logs": len(adherence_history),
                    "average_adherence": round(avg_adherence, 1),
                    "best_adherence": max_adherence,
                    "latest_adherence": latest_adherence
                },
                "adherence_history": adherence_history,
                "assessment_id": assessment.id
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate routine report: {str(e)}"
        )


@router.get("/products")
def get_product_report(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns product recommendation report including purchases and replenishment info.
    """
    try:
        # Get user profile from latest assessment
        latest_assessment = db.query(models.Assessment).filter(
            models.Assessment.user_id == current_user.id
        ).order_by(models.Assessment.assessment_time.desc()).first()
        
        if latest_assessment:
            user_profile = {
                "skin_type": latest_assessment.predicted_skin_type,
                "sensitivity": latest_assessment.sensitivity,
                "concerns": latest_assessment.concerns or [],
                "allergies": latest_assessment.allergies or []
            }
        else:
            user_profile = {
                "skin_type": "Unknown",
                "sensitivity": "Unknown",
                "concerns": [],
                "allergies": []
            }
        
        # Get product purchases
        purchases = db.query(models.ProductPurchase).filter(
            models.ProductPurchase.user_id == current_user.id
        ).order_by(models.ProductPurchase.purchase_date.desc()).all()
        
        purchase_history = []
        for p in purchases:
            purchase_history.append({
                "id": p.id,
                "product_id": p.product_id,
                "product_name": p.product_name,
                "purchase_date": _serialize_date(p.purchase_date),
                "quantity": p.quantity,
                "estimated_replenishment_date": _serialize_date(p.estimated_replenishment_date),
                "actual_replenishment_date": _serialize_date(p.actual_replenishment_date)
            })
        
        # Get replenishment info
        prefs = db.query(models.NotificationPreference).filter(
            models.NotificationPreference.user_id == current_user.id
        ).first()
        
        reminder_days = 7
        if prefs:
            reminder_days = prefs.product_reminder_days_before
        
        today = date.today()
        overdue = []
        due_soon = []
        
        for p in purchases:
            if p.estimated_replenishment_date and not p.actual_replenishment_date:
                if p.estimated_replenishment_date <= today:
                    overdue.append({
                        "id": p.id,
                        "product_name": p.product_name,
                        "estimated_replenishment_date": _serialize_date(p.estimated_replenishment_date),
                        "days_overdue": (today - p.estimated_replenishment_date).days
                    })
                elif (p.estimated_replenishment_date - today).days <= reminder_days:
                    due_soon.append({
                        "id": p.id,
                        "product_name": p.product_name,
                        "estimated_replenishment_date": _serialize_date(p.estimated_replenishment_date),
                        "days_until_due": (p.estimated_replenishment_date - today).days
                    })
        
        return {
            "report_type": "products",
            "generated_at": datetime.utcnow().isoformat(),
            "data": {
                "user_profile": user_profile,
                "purchase_summary": {
                    "total_purchases": len(purchases),
                    "overdue_count": len(overdue),
                    "due_soon_count": len(due_soon)
                },
                "overdue_products": overdue,
                "due_soon_products": due_soon,
                "purchase_history": purchase_history
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate product report: {str(e)}"
        )


@router.get("/progress")
def get_progress_report(
    start_date: Optional[date] = Query(None, description="Filter start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Filter end date (YYYY-MM-DD)"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns progress report including assessment trends, adherence, hydration, and sleep history.
    """
    try:
        _validate_date_range(start_date, end_date)
        
        # Get assessment history
        assessment_query = db.query(models.Assessment).filter(
            models.Assessment.user_id == current_user.id
        )
        
        if start_date:
            assessment_query = assessment_query.filter(
                models.Assessment.assessment_time >= start_date
            )
        if end_date:
            assessment_query = assessment_query.filter(
                models.Assessment.assessment_time <= end_date
            )
        
        assessments = assessment_query.order_by(
            models.Assessment.assessment_time.asc()
        ).all()
        
        assessment_trend = []
        for a in assessments:
            assessment_trend.append({
                "id": a.id,
                "assessment_time": _serialize_datetime(a.assessment_time),
                "health_score": a.health_score,
                "predicted_skin_type": a.predicted_skin_type,
                "overall_condition": a.overall_condition
            })
        
        # Get adherence history
        adherence_query = db.query(models.RoutineLog).filter(
            models.RoutineLog.user_id == current_user.id
        )
        
        if start_date:
            adherence_query = adherence_query.filter(
                models.RoutineLog.log_date >= start_date
            )
        if end_date:
            adherence_query = adherence_query.filter(
                models.RoutineLog.log_date <= end_date
            )
        
        adherence_logs = adherence_query.order_by(
            models.RoutineLog.log_date.asc()
        ).all()
        
        adherence_history = []
        for log in adherence_logs:
            adherence_pct = (
                round((log.completed_count / float(log.total_count)) * 100.0, 1)
                if log.total_count > 0 else 0.0
            )
            adherence_history.append({
                "id": log.id,
                "log_date": _serialize_date(log.log_date),
                "adherence_percentage": adherence_pct
            })
        
        # Get hydration history
        hydration_query = db.query(models.HydrationLog).filter(
            models.HydrationLog.user_id == current_user.id
        )
        
        if start_date:
            hydration_query = hydration_query.filter(
                models.HydrationLog.log_date >= start_date
            )
        if end_date:
            hydration_query = hydration_query.filter(
                models.HydrationLog.log_date <= end_date
            )
        
        hydration_logs = hydration_query.order_by(
            models.HydrationLog.log_date.asc()
        ).all()
        
        hydration_history = []
        for h in hydration_logs:
            hydration_history.append({
                "id": h.id,
                "date": _serialize_date(h.log_date),
                "glasses": h.quantity_glasses,
                "ml": h.quantity_ml
            })
        
        # Get sleep history
        sleep_query = db.query(models.SleepLog).filter(
            models.SleepLog.user_id == current_user.id
        )
        
        if start_date:
            sleep_query = sleep_query.filter(
                models.SleepLog.log_date >= start_date
            )
        if end_date:
            sleep_query = sleep_query.filter(
                models.SleepLog.log_date <= end_date
            )
        
        sleep_logs = sleep_query.order_by(
            models.SleepLog.log_date.asc()
        ).all()
        
        sleep_history = []
        for s in sleep_logs:
            sleep_history.append({
                "id": s.id,
                "date": _serialize_date(s.log_date),
                "hours": s.sleep_hours,
                "quality": s.sleep_quality
            })
        
        # Calculate summary statistics
        if assessment_trend:
            first_score = assessment_trend[0]["health_score"]
            last_score = assessment_trend[-1]["health_score"]
            score_change = last_score - first_score
        else:
            first_score = last_score = score_change = 0
        
        if adherence_history:
            avg_adherence = sum(h["adherence_percentage"] for h in adherence_history) / len(adherence_history)
        else:
            avg_adherence = 0
        
        if hydration_history:
            avg_glasses = sum(h["glasses"] for h in hydration_history) / len(hydration_history)
        else:
            avg_glasses = 0
        
        if sleep_history:
            avg_sleep = sum(h["hours"] for h in sleep_history) / len(sleep_history)
        else:
            avg_sleep = 0
        
        return {
            "report_type": "progress",
            "generated_at": datetime.utcnow().isoformat(),
            "data": {
                "date_range": {
                    "start_date": _serialize_date(start_date),
                    "end_date": _serialize_date(end_date)
                },
                "assessment_summary": {
                    "total_assessments": len(assessment_trend),
                    "first_score": first_score,
                    "latest_score": last_score,
                    "score_change": score_change
                },
                "assessment_trend": assessment_trend,
                "adherence_summary": {
                    "total_logs": len(adherence_history),
                    "average_adherence": round(avg_adherence, 1)
                },
                "adherence_history": adherence_history,
                "hydration_summary": {
                    "total_logs": len(hydration_history),
                    "average_glasses": round(avg_glasses, 1)
                },
                "hydration_history": hydration_history,
                "sleep_summary": {
                    "total_logs": len(sleep_history),
                    "average_hours": round(avg_sleep, 1)
                },
                "sleep_history": sleep_history
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate progress report: {str(e)}"
        )


@router.get("/skin-health")
def get_skin_health_report(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns skin health report with current scores, breakdown, and recommendations.
    Reuses existing scoring engine calculations.
    """
    try:
        # Get latest assessment
        latest_assessment = db.query(models.Assessment).filter(
            models.Assessment.user_id == current_user.id
        ).order_by(models.Assessment.assessment_time.desc()).first()
        
        if latest_assessment is None:
            return {
                "report_type": "skin_health",
                "generated_at": datetime.utcnow().isoformat(),
                "data": None,
                "message": "No assessment found. Complete an assessment first."
            }
        
        # Calculate factor scores using existing scoring engine functions
        skin_condition = calculate_skin_condition_score(latest_assessment)
        lifestyle_habits = calculate_lifestyle_score(latest_assessment)
        sleep_quality = calculate_sleep_score(latest_assessment)
        routine_consistency = calculate_routine_consistency_score(db, current_user.id)
        hydration_level = calculate_hydration_score(latest_assessment)
        
        # Calculate overall score
        overall_score = calculate_overall_score(
            skin_condition=skin_condition,
            lifestyle_habits=lifestyle_habits,
            sleep_quality=sleep_quality,
            routine_consistency=routine_consistency,
            hydration_level=hydration_level
        )
        
        # Get score category
        category = get_score_category(overall_score)
        
        # Get assessment history for trend
        history = db.query(models.Assessment).filter(
            models.Assessment.user_id == current_user.id
        ).order_by(models.Assessment.assessment_time.asc()).all()
        
        assessment_trend = [
            {
                "id": a.id,
                "assessment_time": _serialize_datetime(a.assessment_time),
                "health_score": a.health_score
            }
            for a in history
        ]
        
        # Get adherence summary
        adherence_logs = db.query(models.RoutineLog).filter(
            models.RoutineLog.user_id == current_user.id
        ).all()
        
        if adherence_logs:
            avg_adherence = sum(
                (log.completed_count / float(log.total_count)) * 100.0
                for log in adherence_logs if log.total_count > 0
            ) / len(adherence_logs)
        else:
            avg_adherence = 0
        
        # Get hydration summary
        hydration_logs = db.query(models.HydrationLog).filter(
            models.HydrationLog.user_id == current_user.id
        ).all()
        
        if hydration_logs:
            avg_hydration = sum(h.quantity_glasses for h in hydration_logs) / len(hydration_logs)
            latest_hydration = hydration_logs[-1].quantity_glasses if hydration_logs else 0
        else:
            avg_hydration = latest_hydration = 0
        
        # Get sleep summary
        sleep_logs = db.query(models.SleepLog).filter(
            models.SleepLog.user_id == current_user.id
        ).all()
        
        if sleep_logs:
            avg_sleep = sum(s.sleep_hours for s in sleep_logs) / len(sleep_logs)
            latest_sleep = sleep_logs[-1].sleep_hours if sleep_logs else 0
        else:
            avg_sleep = latest_sleep = 0
        
        return {
            "report_type": "skin_health",
            "generated_at": datetime.utcnow().isoformat(),
            "data": {
                "overall_score": overall_score,
                "category": category["label"],
                "factor_scores": {
                    "skin_condition": skin_condition,
                    "lifestyle_habits": lifestyle_habits,
                    "sleep_quality": sleep_quality,
                    "routine_consistency": routine_consistency,
                    "hydration_level": hydration_level
                },
                "weights": {
                    "skin_condition": 0.35,
                    "lifestyle_habits": 0.20,
                    "sleep_quality": 0.15,
                    "routine_consistency": 0.20,
                    "hydration_level": 0.10
                },
                "assessment_summary": {
                    "latest_assessment_id": latest_assessment.id,
                    "assessment_time": _serialize_datetime(latest_assessment.assessment_time),
                    "predicted_skin_type": latest_assessment.predicted_skin_type,
                    "overall_condition": latest_assessment.overall_condition,
                    "vision_concern": latest_assessment.vision_predicted_concern
                },
                "routine_adherence": {
                    "average_percentage": round(avg_adherence, 1),
                    "total_logs": len(adherence_logs)
                },
                "hydration": {
                    "average_glasses": round(avg_hydration, 1),
                    "latest_glasses": latest_hydration,
                    "total_logs": len(hydration_logs)
                },
                "sleep": {
                    "average_hours": round(avg_sleep, 1),
                    "latest_hours": latest_sleep,
                    "total_logs": len(sleep_logs)
                },
                "trend": assessment_trend,
                "recommendations": latest_assessment.recommendations
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate skin health report: {str(e)}"
        )
