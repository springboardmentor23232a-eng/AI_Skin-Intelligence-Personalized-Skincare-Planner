"""
Module 11 Phase 4 - Excel Download Endpoints
Excel generation endpoints for all report types.
"""

from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
import io

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
from app.report_excel_generators import (
    generate_assessment_excel,
    generate_routine_excel,
    generate_product_excel,
    generate_progress_excel,
    generate_skin_health_excel,
)

router = APIRouter(prefix="/reports/excel", tags=["report-excel"])


def _serialize_datetime(dt) -> str:
    """Serialize datetime to string."""
    if dt is None:
        return ""
    if isinstance(dt, datetime):
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    return str(dt)


def _serialize_date(d) -> str:
    """Serialize date to string."""
    if d is None:
        return ""
    if isinstance(d, date):
        return d.strftime("%Y-%m-%d")
    return str(d)


def _validate_date_range(start_date: Optional[date], end_date: Optional[date]):
    """Validate date range parameters."""
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=400, 
            detail="start_date cannot be after end_date"
        )


@router.get("/assessment")
def download_assessment_excel(
    assessment_id: Optional[int] = Query(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download Assessment Report as Excel."""
    try:
        # Get assessment data (same logic as existing endpoint)
        if assessment_id is not None:
            assessment = db.query(models.Assessment).filter(
                models.Assessment.id == assessment_id,
                models.Assessment.user_id == current_user.id
            ).first()
            
            if assessment is None:
                raise HTTPException(status_code=404, detail="Assessment not found.")
        else:
            assessment = db.query(models.Assessment).filter(
                models.Assessment.user_id == current_user.id
            ).order_by(models.Assessment.assessment_time.desc()).first()
        
        assessment_data = None
        if assessment:
            assessment_data = {
                "assessment_time": _serialize_datetime(assessment.assessment_time),
                "predicted_skin_type": assessment.predicted_skin_type,
                "health_score": assessment.health_score,
                "overall_condition": assessment.overall_condition,
                "concerns": assessment.concerns,
                "vision_predicted_concern": assessment.vision_predicted_concern,
                "skin_properties": {
                    "sensitivity": assessment.sensitivity,
                },
                "recommendations": assessment.recommendations,
            }
        
        # Generate Excel
        excel_buffer = generate_assessment_excel(assessment_data)
        
        # Return Excel response
        return StreamingResponse(
            io.BytesIO(excel_buffer.read()),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=assessment_report.xlsx"}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Excel generation failed: {str(e)}")


@router.get("/routine")
def download_routine_excel(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download Routine Report as Excel."""
    try:
        # Get routine data (same logic as existing endpoint)
        assessment = db.query(models.Assessment).filter(
            models.Assessment.user_id == current_user.id
        ).order_by(models.Assessment.assessment_time.desc()).first()
        
        routine_data = None
        if assessment:
            saved_routine = db.query(models.Routine).filter(
                models.Routine.user_id == current_user.id,
                models.Routine.assessment_id == assessment.id
            ).first()
            
            if saved_routine:
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
                
                routine_data = {
                    "routine": saved_routine.routine_data,
                    "adherence_summary": {
                        "total_logs": len(adherence_logs),
                        "average_adherence": round(avg_adherence, 1),
                    }
                }
        
        # Generate Excel
        excel_buffer = generate_routine_excel(routine_data)
        
        # Return Excel response
        return StreamingResponse(
            io.BytesIO(excel_buffer.read()),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=routine_report.xlsx"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Excel generation failed: {str(e)}")


@router.get("/products")
def download_products_excel(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download Product Recommendation Report as Excel."""
    try:
        # Get product data (same logic as existing endpoint)
        latest_assessment = db.query(models.Assessment).filter(
            models.Assessment.user_id == current_user.id
        ).order_by(models.Assessment.assessment_time.desc()).first()
        
        user_profile = None
        if latest_assessment:
            user_profile = {
                "skin_type": latest_assessment.predicted_skin_type,
                "sensitivity": latest_assessment.sensitivity,
                "concerns": latest_assessment.concerns or [],
            }
        
        purchases = db.query(models.ProductPurchase).filter(
            models.ProductPurchase.user_id == current_user.id
        ).order_by(models.ProductPurchase.purchase_date.desc()).all()
        
        purchase_history = []
        for p in purchases:
            purchase_history.append({
                "product_name": p.product_name,
                "purchase_date": _serialize_date(p.purchase_date),
                "quantity": p.quantity,
            })
        
        product_data = {
            "user_profile": user_profile,
            "purchase_summary": {
                "total_purchases": len(purchases),
            },
            "purchase_history": purchase_history,
        }
        
        # Generate Excel
        excel_buffer = generate_product_excel(product_data)
        
        # Return Excel response
        return StreamingResponse(
            io.BytesIO(excel_buffer.read()),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=product_report.xlsx"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Excel generation failed: {str(e)}")


@router.get("/progress")
def download_progress_excel(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download Progress Report as Excel."""
    try:
        # Validate date range
        _validate_date_range(start_date, end_date)
        
        # Get progress data (same logic as existing endpoint)
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
                "health_score": a.health_score,
            })
        
        # Adherence data
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
        
        adherence_logs = adherence_query.all()
        
        if adherence_logs:
            avg_adherence = sum(
                (log.completed_count / float(log.total_count)) * 100.0
                for log in adherence_logs if log.total_count > 0
            ) / len(adherence_logs)
        else:
            avg_adherence = 0
        
        # Hydration data
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
        
        hydration_logs = hydration_query.all()
        
        if hydration_logs:
            avg_glasses = sum(h.quantity_glasses for h in hydration_logs) / len(hydration_logs)
        else:
            avg_glasses = 0
        
        # Sleep data
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
        
        sleep_logs = sleep_query.all()
        
        if sleep_logs:
            avg_sleep = sum(s.sleep_hours for s in sleep_logs) / len(sleep_logs)
        else:
            avg_sleep = 0
        
        # Calculate score change
        if assessment_trend:
            first_score = assessment_trend[0]["health_score"]
            last_score = assessment_trend[-1]["health_score"]
            score_change = last_score - first_score
        else:
            first_score = last_score = score_change = 0
        
        progress_data = {
            "assessment_summary": {
                "total_assessments": len(assessment_trend),
                "first_score": first_score,
                "latest_score": last_score,
                "score_change": score_change,
            },
            "adherence_summary": {
                "total_logs": len(adherence_logs),
                "average_adherence": round(avg_adherence, 1),
            },
            "hydration_summary": {
                "total_logs": len(hydration_logs),
                "average_glasses": round(avg_glasses, 1),
            },
            "sleep_summary": {
                "total_logs": len(sleep_logs),
                "average_hours": round(avg_sleep, 1),
            },
        }
        
        # Generate Excel
        excel_buffer = generate_progress_excel(progress_data)
        
        # Return Excel response
        return StreamingResponse(
            io.BytesIO(excel_buffer.read()),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=progress_report.xlsx"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Excel generation failed: {str(e)}")


@router.get("/skin-health")
def download_skin_health_excel(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download Skin Health Report as Excel."""
    try:
        # Get skin health data (same logic as existing endpoint)
        latest_assessment = db.query(models.Assessment).filter(
            models.Assessment.user_id == current_user.id
        ).order_by(models.Assessment.assessment_time.desc()).first()
        
        if latest_assessment is None:
            health_data = None
        else:
            # Calculate scores using existing scoring engine
            skin_condition = calculate_skin_condition_score(latest_assessment)
            lifestyle_habits = calculate_lifestyle_score(latest_assessment)
            sleep_quality = calculate_sleep_score(latest_assessment)
            routine_consistency = calculate_routine_consistency_score(db, current_user.id)
            hydration_level = calculate_hydration_score(latest_assessment)
            
            overall_score = calculate_overall_score(
                skin_condition=skin_condition,
                lifestyle_habits=lifestyle_habits,
                sleep_quality=sleep_quality,
                routine_consistency=routine_consistency,
                hydration_level=hydration_level
            )
            
            category = get_score_category(overall_score)
            
            # Get adherence data
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
            
            # Get hydration data
            hydration_logs = db.query(models.HydrationLog).filter(
                models.HydrationLog.user_id == current_user.id
            ).all()
            
            if hydration_logs:
                avg_hydration = sum(h.quantity_glasses for h in hydration_logs) / len(hydration_logs)
            else:
                avg_hydration = 0
            
            # Get sleep data
            sleep_logs = db.query(models.SleepLog).filter(
                models.SleepLog.user_id == current_user.id
            ).all()
            
            if sleep_logs:
                avg_sleep = sum(s.sleep_hours for s in sleep_logs) / len(sleep_logs)
            else:
                avg_sleep = 0
            
            health_data = {
                "overall_score": overall_score,
                "category": category["label"],
                "factor_scores": {
                    "skin_condition": skin_condition,
                    "lifestyle_habits": lifestyle_habits,
                    "sleep_quality": sleep_quality,
                    "routine_consistency": routine_consistency,
                    "hydration_level": hydration_level
                },
                "assessment_summary": {
                    "predicted_skin_type": latest_assessment.predicted_skin_type,
                    "overall_condition": latest_assessment.overall_condition,
                },
                "routine_adherence": {
                    "average_percentage": round(avg_adherence, 1),
                    "total_logs": len(adherence_logs),
                },
                "hydration": {
                    "average_glasses": round(avg_hydration, 1),
                    "total_logs": len(hydration_logs),
                },
                "sleep": {
                    "average_hours": round(avg_sleep, 1),
                    "total_logs": len(sleep_logs),
                },
                "recommendations": latest_assessment.recommendations,
            }
        
        # Generate Excel
        excel_buffer = generate_skin_health_excel(health_data)
        
        # Return Excel response
        return StreamingResponse(
            io.BytesIO(excel_buffer.read()),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=skin_health_report.xlsx"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Excel generation failed: {str(e)}")