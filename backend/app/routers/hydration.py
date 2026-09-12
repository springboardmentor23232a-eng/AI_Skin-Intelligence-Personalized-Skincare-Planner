"""
Module 10 Phase 2A — Hydration Logging Endpoints
Endpoints for daily water intake tracking.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta
from typing import Optional

from app.database import get_db
from app import models
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/hydration",
    tags=["Hydration Logging"]
)


@router.post("/logs")
def create_hydration_log(
    log_date: date,
    quantity_glasses: float,
    quantity_ml: Optional[int] = None,
    log_time: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new hydration log entry for the authenticated user.
    
    Parameters:
    - log_date: Date of the log (YYYY-MM-DD)
    - quantity_glasses: Water intake in glasses (float)
    - quantity_ml: Optional water intake in milliliters
    - log_time: Optional time of the log (HH:MM:SS)
    """
    try:
        # Validate quantity
        if quantity_glasses < 0:
            raise HTTPException(
                status_code=400,
                detail="Quantity cannot be negative"
            )
        
        if quantity_ml is not None and quantity_ml < 0:
            raise HTTPException(
                status_code=400,
                detail="Quantity (ml) cannot be negative"
            )
        
        # Parse log_time if provided
        log_time_obj = None
        if log_time:
            try:
                log_time_obj = datetime.strptime(log_time, "%H:%M:%S").time()
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid log_time format. Use HH:MM:SS"
                )
        
        # Check if log for this date already exists
        existing_log = db.query(models.HydrationLog).filter(
            models.HydrationLog.user_id == current_user.id,
            models.HydrationLog.log_date == log_date
        ).first()
        
        if existing_log:
            # Update existing log instead of creating duplicate
            existing_log.quantity_glasses += quantity_glasses
            if quantity_ml:
                existing_log.quantity_ml = (existing_log.quantity_ml or 0) + quantity_ml
            db.commit()
            db.refresh(existing_log)
            return {
                "status": "success",
                "message": "Hydration log updated",
                "log": {
                    "id": existing_log.id,
                    "log_date": existing_log.log_date.isoformat(),
                    "quantity_glasses": existing_log.quantity_glasses,
                    "quantity_ml": existing_log.quantity_ml,
                    "log_time": existing_log.log_time.isoformat() if existing_log.log_time else None,
                    "created_at": existing_log.created_at.isoformat()
                }
            }
        
        # Create new log
        hydration_log = models.HydrationLog(
            user_id=current_user.id,
            log_date=log_date,
            quantity_glasses=quantity_glasses,
            quantity_ml=quantity_ml,
            log_time=log_time_obj
        )
        db.add(hydration_log)
        db.commit()
        db.refresh(hydration_log)
        
        return {
            "status": "success",
            "message": "Hydration log created",
            "log": {
                "id": hydration_log.id,
                "log_date": hydration_log.log_date.isoformat(),
                "quantity_glasses": hydration_log.quantity_glasses,
                "quantity_ml": hydration_log.quantity_ml,
                "log_time": hydration_log.log_time.isoformat() if hydration_log.log_time else None,
                "created_at": hydration_log.created_at.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create hydration log: {str(e)}"
        )


@router.get("/logs")
def get_hydration_logs(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    limit: int = Query(30, ge=1, le=365),
    offset: int = Query(0, ge=0),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get paginated hydration logs for the authenticated user.
    
    Parameters:
    - start_date: Optional start date filter (YYYY-MM-DD)
    - end_date: Optional end date filter (YYYY-MM-DD)
    - limit: Max logs per page (1-365, default 30)
    - offset: Pagination offset
    """
    try:
        query = db.query(models.HydrationLog).filter(
            models.HydrationLog.user_id == current_user.id
        )
        
        if start_date:
            query = query.filter(models.HydrationLog.log_date >= start_date)
        if end_date:
            query = query.filter(models.HydrationLog.log_date <= end_date)
        
        total = query.count()
        logs = query.order_by(models.HydrationLog.log_date.desc()).offset(offset).limit(limit).all()
        
        return {
            "status": "success",
            "total": total,
            "limit": limit,
            "offset": offset,
            "logs": [
                {
                    "id": log.id,
                    "log_date": log.log_date.isoformat(),
                    "quantity_glasses": log.quantity_glasses,
                    "quantity_ml": log.quantity_ml,
                    "log_time": log.log_time.isoformat() if log.log_time else None,
                    "created_at": log.created_at.isoformat()
                }
                for log in logs
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve hydration logs: {str(e)}"
        )


@router.get("/logs/{log_id}")
def get_hydration_log(
    log_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a single hydration log entry (must belong to authenticated user).
    """
    try:
        log = db.query(models.HydrationLog).filter(
            models.HydrationLog.id == log_id,
            models.HydrationLog.user_id == current_user.id
        ).first()
        
        if not log:
            raise HTTPException(
                status_code=404,
                detail="Hydration log not found"
            )
        
        return {
            "status": "success",
            "log": {
                "id": log.id,
                "log_date": log.log_date.isoformat(),
                "quantity_glasses": log.quantity_glasses,
                "quantity_ml": log.quantity_ml,
                "log_time": log.log_time.isoformat() if log.log_time else None,
                "created_at": log.created_at.isoformat(),
                "updated_at": log.updated_at.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve hydration log: {str(e)}"
        )


@router.put("/logs/{log_id}")
def update_hydration_log(
    log_id: int,
    quantity_glasses: Optional[float] = None,
    quantity_ml: Optional[int] = None,
    log_time: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a hydration log entry (must belong to authenticated user).
    """
    try:
        log = db.query(models.HydrationLog).filter(
            models.HydrationLog.id == log_id,
            models.HydrationLog.user_id == current_user.id
        ).first()
        
        if not log:
            raise HTTPException(
                status_code=404,
                detail="Hydration log not found"
            )
        
        # Validate quantities
        if quantity_glasses is not None:
            if quantity_glasses < 0:
                raise HTTPException(
                    status_code=400,
                    detail="Quantity cannot be negative"
                )
            log.quantity_glasses = quantity_glasses
        
        if quantity_ml is not None:
            if quantity_ml < 0:
                raise HTTPException(
                    status_code=400,
                    detail="Quantity (ml) cannot be negative"
                )
            log.quantity_ml = quantity_ml
        
        if log_time is not None:
            try:
                log.log_time = datetime.strptime(log_time, "%H:%M:%S").time()
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid log_time format. Use HH:MM:SS"
                )
        
        db.commit()
        db.refresh(log)
        
        return {
            "status": "success",
            "message": "Hydration log updated",
            "log": {
                "id": log.id,
                "log_date": log.log_date.isoformat(),
                "quantity_glasses": log.quantity_glasses,
                "quantity_ml": log.quantity_ml,
                "log_time": log.log_time.isoformat() if log.log_time else None,
                "created_at": log.created_at.isoformat(),
                "updated_at": log.updated_at.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update hydration log: {str(e)}"
        )


@router.delete("/logs/{log_id}")
def delete_hydration_log(
    log_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a hydration log entry (must belong to authenticated user).
    """
    try:
        log = db.query(models.HydrationLog).filter(
            models.HydrationLog.id == log_id,
            models.HydrationLog.user_id == current_user.id
        ).first()
        
        if not log:
            raise HTTPException(
                status_code=404,
                detail="Hydration log not found"
            )
        
        db.delete(log)
        db.commit()
        
        return {
            "status": "success",
            "message": "Hydration log deleted"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete hydration log: {str(e)}"
        )


@router.get("/summary")
def get_hydration_summary(
    target_date: Optional[date] = Query(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get hydration summary for a specific date (default: today).
    Compares total logged intake against user's hydration goal.
    """
    try:
        # Default to today if no date provided
        if not target_date:
            target_date = date.today()
        
        # Get user's hydration goal from preferences
        prefs = db.query(models.NotificationPreference).filter(
            models.NotificationPreference.user_id == current_user.id
        ).first()
        
        goal_glasses = 8  # Default
        if prefs:
            goal_glasses = prefs.hydration_goal_glasses
        
        # Get total logged for the date
        log = db.query(models.HydrationLog).filter(
            models.HydrationLog.user_id == current_user.id,
            models.HydrationLog.log_date == target_date
        ).first()
        
        total_glasses = log.quantity_glasses if log else 0
        total_ml = log.quantity_ml if log and log.quantity_ml else 0
        
        # Calculate progress
        percentage = int((total_glasses / goal_glasses) * 100) if goal_glasses > 0 else 0
        goal_met = total_glasses >= goal_glasses
        
        return {
            "status": "success",
            "summary": {
                "date": target_date.isoformat(),
                "logged_glasses": total_glasses,
                "logged_ml": total_ml,
                "goal_glasses": goal_glasses,
                "percentage": percentage,
                "goal_met": goal_met,
                "remaining_glasses": max(0, goal_glasses - total_glasses)
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve hydration summary: {str(e)}"
        )


@router.get("/history")
def get_hydration_history(
    days: int = Query(7, ge=1, le=90),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get hydration history for the past N days (default: 7).
    Suitable for progress charts.
    """
    try:
        # Get user's hydration goal
        prefs = db.query(models.NotificationPreference).filter(
            models.NotificationPreference.user_id == current_user.id
        ).first()
        
        goal_glasses = 8  # Default
        if prefs:
            goal_glasses = prefs.hydration_goal_glasses
        
        # Calculate date range
        end_date = date.today()
        start_date = end_date - timedelta(days=days - 1)
        
        # Get logs for date range
        logs = db.query(models.HydrationLog).filter(
            models.HydrationLog.user_id == current_user.id,
            models.HydrationLog.log_date >= start_date,
            models.HydrationLog.log_date <= end_date
        ).order_by(models.HydrationLog.log_date.asc()).all()
        
        # Build history with all dates (fill missing dates with 0)
        history = []
        current = start_date
        log_dict = {log.log_date: log for log in logs}
        
        while current <= end_date:
            log = log_dict.get(current)
            history.append({
                "date": current.isoformat(),
                "quantity_glasses": log.quantity_glasses if log else 0,
                "quantity_ml": log.quantity_ml if log else 0,
                "goal_glasses": goal_glasses,
                "percentage": int((log.quantity_glasses / goal_glasses) * 100) if log and goal_glasses > 0 else 0
            })
            current += timedelta(days=1)
        
        return {
            "status": "success",
            "goal_glasses": goal_glasses,
            "period_days": days,
            "history": history
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve hydration history: {str(e)}"
        )
