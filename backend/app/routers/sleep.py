"""
Module 10 Phase 2A — Sleep Logging Endpoints
Endpoints for daily sleep tracking.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta
from typing import Optional

from app.database import get_db
from app import models
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/sleep",
    tags=["Sleep Logging"]
)

VALID_SLEEP_QUALITIES = ["Good", "Medium", "Poor"]


@router.post("/logs")
def create_sleep_log(
    log_date: date,
    sleep_hours: float,
    sleep_quality: Optional[str] = None,
    bedtime: Optional[str] = None,
    wake_time: Optional[str] = None,
    notes: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new sleep log entry for the authenticated user.
    
    Parameters:
    - log_date: Date of the sleep (YYYY-MM-DD)
    - sleep_hours: Sleep duration in hours (float)
    - sleep_quality: Optional sleep quality (Good, Medium, Poor)
    - bedtime: Optional bedtime (HH:MM:SS)
    - wake_time: Optional wake time (HH:MM:SS)
    - notes: Optional notes about the sleep
    """
    try:
        # Validate sleep_hours
        if sleep_hours < 0:
            raise HTTPException(
                status_code=400,
                detail="Sleep hours cannot be negative"
            )
        if sleep_hours > 24:
            raise HTTPException(
                status_code=400,
                detail="Sleep hours cannot exceed 24"
            )
        
        # Validate sleep_quality
        if sleep_quality and sleep_quality not in VALID_SLEEP_QUALITIES:
            raise HTTPException(
                status_code=400,
                detail=f"Sleep quality must be one of: {', '.join(VALID_SLEEP_QUALITIES)}"
            )
        
        # Parse times
        bedtime_obj = None
        wake_time_obj = None
        
        if bedtime:
            try:
                bedtime_obj = datetime.strptime(bedtime, "%H:%M:%S").time()
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid bedtime format. Use HH:MM:SS"
                )
        
        if wake_time:
            try:
                wake_time_obj = datetime.strptime(wake_time, "%H:%M:%S").time()
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid wake_time format. Use HH:MM:SS"
                )
        
        # Check if log for this date already exists
        existing_log = db.query(models.SleepLog).filter(
            models.SleepLog.user_id == current_user.id,
            models.SleepLog.log_date == log_date
        ).first()
        
        if existing_log:
            # Update existing log
            existing_log.sleep_hours = sleep_hours
            if sleep_quality:
                existing_log.sleep_quality = sleep_quality
            if bedtime:
                existing_log.bedtime = bedtime_obj
            if wake_time:
                existing_log.wake_time = wake_time_obj
            if notes:
                existing_log.notes = notes
            db.commit()
            db.refresh(existing_log)
            return {
                "status": "success",
                "message": "Sleep log updated",
                "log": {
                    "id": existing_log.id,
                    "log_date": existing_log.log_date.isoformat(),
                    "sleep_hours": existing_log.sleep_hours,
                    "sleep_quality": existing_log.sleep_quality,
                    "bedtime": existing_log.bedtime.isoformat() if existing_log.bedtime else None,
                    "wake_time": existing_log.wake_time.isoformat() if existing_log.wake_time else None,
                    "notes": existing_log.notes,
                    "created_at": existing_log.created_at.isoformat()
                }
            }
        
        # Create new log
        sleep_log = models.SleepLog(
            user_id=current_user.id,
            log_date=log_date,
            sleep_hours=sleep_hours,
            sleep_quality=sleep_quality,
            bedtime=bedtime_obj,
            wake_time=wake_time_obj,
            notes=notes
        )
        db.add(sleep_log)
        db.commit()
        db.refresh(sleep_log)
        
        return {
            "status": "success",
            "message": "Sleep log created",
            "log": {
                "id": sleep_log.id,
                "log_date": sleep_log.log_date.isoformat(),
                "sleep_hours": sleep_log.sleep_hours,
                "sleep_quality": sleep_log.sleep_quality,
                "bedtime": sleep_log.bedtime.isoformat() if sleep_log.bedtime else None,
                "wake_time": sleep_log.wake_time.isoformat() if sleep_log.wake_time else None,
                "notes": sleep_log.notes,
                "created_at": sleep_log.created_at.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create sleep log: {str(e)}"
        )


@router.get("/logs")
def get_sleep_logs(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    limit: int = Query(30, ge=1, le=365),
    offset: int = Query(0, ge=0),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get paginated sleep logs for the authenticated user.
    
    Parameters:
    - start_date: Optional start date filter (YYYY-MM-DD)
    - end_date: Optional end date filter (YYYY-MM-DD)
    - limit: Max logs per page (1-365, default 30)
    - offset: Pagination offset
    """
    try:
        query = db.query(models.SleepLog).filter(
            models.SleepLog.user_id == current_user.id
        )
        
        if start_date:
            query = query.filter(models.SleepLog.log_date >= start_date)
        if end_date:
            query = query.filter(models.SleepLog.log_date <= end_date)
        
        total = query.count()
        logs = query.order_by(models.SleepLog.log_date.desc()).offset(offset).limit(limit).all()
        
        return {
            "status": "success",
            "total": total,
            "limit": limit,
            "offset": offset,
            "logs": [
                {
                    "id": log.id,
                    "log_date": log.log_date.isoformat(),
                    "sleep_hours": log.sleep_hours,
                    "sleep_quality": log.sleep_quality,
                    "bedtime": log.bedtime.isoformat() if log.bedtime else None,
                    "wake_time": log.wake_time.isoformat() if log.wake_time else None,
                    "notes": log.notes,
                    "created_at": log.created_at.isoformat()
                }
                for log in logs
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve sleep logs: {str(e)}"
        )


@router.get("/logs/{log_id}")
def get_sleep_log(
    log_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a single sleep log entry (must belong to authenticated user).
    """
    try:
        log = db.query(models.SleepLog).filter(
            models.SleepLog.id == log_id,
            models.SleepLog.user_id == current_user.id
        ).first()
        
        if not log:
            raise HTTPException(
                status_code=404,
                detail="Sleep log not found"
            )
        
        return {
            "status": "success",
            "log": {
                "id": log.id,
                "log_date": log.log_date.isoformat(),
                "sleep_hours": log.sleep_hours,
                "sleep_quality": log.sleep_quality,
                "bedtime": log.bedtime.isoformat() if log.bedtime else None,
                "wake_time": log.wake_time.isoformat() if log.wake_time else None,
                "notes": log.notes,
                "created_at": log.created_at.isoformat(),
                "updated_at": log.updated_at.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve sleep log: {str(e)}"
        )


@router.put("/logs/{log_id}")
def update_sleep_log(
    log_id: int,
    sleep_hours: Optional[float] = None,
    sleep_quality: Optional[str] = None,
    bedtime: Optional[str] = None,
    wake_time: Optional[str] = None,
    notes: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a sleep log entry (must belong to authenticated user).
    """
    try:
        log = db.query(models.SleepLog).filter(
            models.SleepLog.id == log_id,
            models.SleepLog.user_id == current_user.id
        ).first()
        
        if not log:
            raise HTTPException(
                status_code=404,
                detail="Sleep log not found"
            )
        
        # Validate sleep_hours
        if sleep_hours is not None:
            if sleep_hours < 0:
                raise HTTPException(
                    status_code=400,
                    detail="Sleep hours cannot be negative"
                )
            if sleep_hours > 24:
                raise HTTPException(
                    status_code=400,
                    detail="Sleep hours cannot exceed 24"
                )
            log.sleep_hours = sleep_hours
        
        # Validate sleep_quality
        if sleep_quality is not None:
            if sleep_quality not in VALID_SLEEP_QUALITIES:
                raise HTTPException(
                    status_code=400,
                    detail=f"Sleep quality must be one of: {', '.join(VALID_SLEEP_QUALITIES)}"
                )
            log.sleep_quality = sleep_quality
        
        if bedtime is not None:
            try:
                log.bedtime = datetime.strptime(bedtime, "%H:%M:%S").time()
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid bedtime format. Use HH:MM:SS"
                )
        
        if wake_time is not None:
            try:
                log.wake_time = datetime.strptime(wake_time, "%H:%M:%S").time()
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid wake_time format. Use HH:MM:SS"
                )
        
        if notes is not None:
            log.notes = notes
        
        db.commit()
        db.refresh(log)
        
        return {
            "status": "success",
            "message": "Sleep log updated",
            "log": {
                "id": log.id,
                "log_date": log.log_date.isoformat(),
                "sleep_hours": log.sleep_hours,
                "sleep_quality": log.sleep_quality,
                "bedtime": log.bedtime.isoformat() if log.bedtime else None,
                "wake_time": log.wake_time.isoformat() if log.wake_time else None,
                "notes": log.notes,
                "created_at": log.created_at.isoformat(),
                "updated_at": log.updated_at.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update sleep log: {str(e)}"
        )


@router.delete("/logs/{log_id}")
def delete_sleep_log(
    log_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a sleep log entry (must belong to authenticated user).
    """
    try:
        log = db.query(models.SleepLog).filter(
            models.SleepLog.id == log_id,
            models.SleepLog.user_id == current_user.id
        ).first()
        
        if not log:
            raise HTTPException(
                status_code=404,
                detail="Sleep log not found"
            )
        
        db.delete(log)
        db.commit()
        
        return {
            "status": "success",
            "message": "Sleep log deleted"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete sleep log: {str(e)}"
        )


@router.get("/summary")
def get_sleep_summary(
    target_date: Optional[date] = Query(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get sleep summary for a specific date (default: yesterday).
    Compares logged sleep against user's sleep goal.
    """
    try:
        # Default to yesterday if no date provided (since sleep is logged for previous night)
        if not target_date:
            target_date = date.today() - timedelta(days=1)
        
        # Get user's sleep goal from preferences
        prefs = db.query(models.NotificationPreference).filter(
            models.NotificationPreference.user_id == current_user.id
        ).first()
        
        goal_hours = 8.0  # Default
        if prefs:
            goal_hours = prefs.sleep_goal_hours
        
        # Get log for the date
        log = db.query(models.SleepLog).filter(
            models.SleepLog.user_id == current_user.id,
            models.SleepLog.log_date == target_date
        ).first()
        
        sleep_hours = log.sleep_hours if log else 0
        sleep_quality = log.sleep_quality if log else None
        
        # Calculate progress
        percentage = int((sleep_hours / goal_hours) * 100) if goal_hours > 0 else 0
        goal_met = sleep_hours >= goal_hours
        
        return {
            "status": "success",
            "summary": {
                "date": target_date.isoformat(),
                "logged_hours": sleep_hours,
                "sleep_quality": sleep_quality,
                "goal_hours": goal_hours,
                "percentage": percentage,
                "goal_met": goal_met,
                "deficit_hours": max(0, goal_hours - sleep_hours)
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve sleep summary: {str(e)}"
        )


@router.get("/history")
def get_sleep_history(
    days: int = Query(7, ge=1, le=90),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get sleep history for the past N days (default: 7).
    Suitable for progress charts.
    """
    try:
        # Get user's sleep goal
        prefs = db.query(models.NotificationPreference).filter(
            models.NotificationPreference.user_id == current_user.id
        ).first()
        
        goal_hours = 8.0  # Default
        if prefs:
            goal_hours = prefs.sleep_goal_hours
        
        # Calculate date range
        end_date = date.today()
        start_date = end_date - timedelta(days=days - 1)
        
        # Get logs for date range
        logs = db.query(models.SleepLog).filter(
            models.SleepLog.user_id == current_user.id,
            models.SleepLog.log_date >= start_date,
            models.SleepLog.log_date <= end_date
        ).order_by(models.SleepLog.log_date.asc()).all()
        
        # Build history with all dates (fill missing dates with 0)
        history = []
        current = start_date
        log_dict = {log.log_date: log for log in logs}
        
        while current <= end_date:
            log = log_dict.get(current)
            history.append({
                "date": current.isoformat(),
                "sleep_hours": log.sleep_hours if log else 0,
                "sleep_quality": log.sleep_quality if log else None,
                "goal_hours": goal_hours,
                "percentage": int((log.sleep_hours / goal_hours) * 100) if log and goal_hours > 0 else 0
            })
            current += timedelta(days=1)
        
        return {
            "status": "success",
            "goal_hours": goal_hours,
            "period_days": days,
            "history": history
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve sleep history: {str(e)}"
        )
