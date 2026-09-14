from datetime import datetime, date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import User, SkinAssessment, SkincareLog, SkinProgressPhoto, SkincareRoutine, SkinProfile
from app.auth import get_current_user
from app.schemas_phase5 import (
    SkincareLogCreate,
    SkincareLogResponse,
    SkinProgressPhotoCreate,
    SkinProgressPhotoResponse,
    SkinHealthTrendPoint,
    SkinHealthTrendsResponse
)

router = APIRouter(prefix="/api/analytics", tags=["phase5"])


@router.get("/history", response_model=SkinHealthTrendsResponse)
def get_skin_health_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assessments = db.query(SkinAssessment).filter(
        SkinAssessment.user_id == current_user.id
    ).order_by(SkinAssessment.created_at.asc()).all()

    trends = []
    prev_score = None
    for a in assessments:
        delta = (a.overall_score - prev_score) if prev_score is not None else 0
        prev_score = a.overall_score
        trends.append(
            SkinHealthTrendPoint(
                logged_at=a.created_at,
                overall_score=a.overall_score,
                improvement_delta=delta,
                acne=a.acne,
                hyperpigmentation=a.hyperpigmentation,
                dryness=a.dryness,
                oiliness=a.oiliness,
                redness=a.redness,
                sensitivity=a.sensitivity
            )
        )
    return SkinHealthTrendsResponse(trends=trends)


@router.get("/routines/logs", response_model=List[SkincareLogResponse])
def get_routine_logs(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(SkincareLog).filter(SkincareLog.user_id == current_user.id)
    if start_date:
        query = query.filter(SkincareLog.logged_date >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        query = query.filter(SkincareLog.logged_date <= datetime.combine(end_date, datetime.max.time()))

    logs = query.order_by(SkincareLog.logged_date.desc()).all()

    response_logs = []
    for log in logs:
        # Convert date safely
        l_date = log.logged_date.date() if isinstance(log.logged_date, datetime) else log.logged_date
        response_logs.append(
            SkincareLogResponse(
                id=log.id,
                user_id=log.user_id,
                routine_type=log.routine_type,
                logged_date=l_date,
                completed=bool(log.completed),
                notes=log.notes
            )
        )
    return response_logs


@router.post("/routines/logs", response_model=SkincareLogResponse, status_code=status.HTTP_201_CREATED)
def log_routine(
    payload: SkincareLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log_date = payload.logged_date or date.today()
    log_datetime = datetime.combine(log_date, datetime.min.time())

    # Check if a log already exists for this date and routine type
    existing = db.query(SkincareLog).filter(
        SkincareLog.user_id == current_user.id,
        SkincareLog.routine_type == payload.routine_type,
        SkincareLog.logged_date == log_datetime
    ).first()

    if existing:
        existing.completed = 1 if payload.completed else 0
        existing.notes = payload.notes
        db.commit()
        db.refresh(existing)
        log_to_return = existing
    else:
        new_log = SkincareLog(
            user_id=current_user.id,
            routine_type=payload.routine_type,
            logged_date=log_datetime,
            completed=1 if payload.completed else 0,
            notes=payload.notes
        )
        db.add(new_log)
        db.commit()
        db.refresh(new_log)
        log_to_return = new_log

    l_date = log_to_return.logged_date.date() if isinstance(log_to_return.logged_date, datetime) else log_to_return.logged_date
    return SkincareLogResponse(
        id=log_to_return.id,
        user_id=log_to_return.user_id,
        routine_type=log_to_return.routine_type,
        logged_date=l_date,
        completed=bool(log_to_return.completed),
        notes=log_to_return.notes
    )


@router.get("/progress", response_model=List[SkinProgressPhotoResponse])
def get_progress_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entries = db.query(SkinProgressPhoto).filter(
        SkinProgressPhoto.user_id == current_user.id
    ).order_by(SkinProgressPhoto.logged_at.desc()).all()
    return entries


@router.post("/progress", response_model=SkinProgressPhotoResponse, status_code=status.HTTP_201_CREATED)
def create_progress_entry(
    payload: SkinProgressPhotoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_entry = SkinProgressPhoto(
        user_id=current_user.id,
        photo_url=payload.photo_url,
        notes=payload.notes,
        associated_assessment_id=payload.associated_assessment_id,
        logged_at=datetime.utcnow()
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry


import os
import uuid
from io import BytesIO
from fastapi import UploadFile, File, Form, HTTPException
from PIL import Image, ImageOps

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

def validate_and_save_progress_photo(file: UploadFile) -> str:
    # Read bytes
    file_bytes = file.file.read()
    size = len(file_bytes)
    if size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds maximum 10MB limit.")
    
    ext = os.path.splitext(file.filename.lower())[1]
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload JPG, JPEG, PNG or WEBP.")
    
    try:
        img = Image.open(BytesIO(file_bytes))
        # verify image integrity
        img.verify()
        
        # Re-open for resizing & saving
        img = Image.open(BytesIO(file_bytes))
        img = ImageOps.exif_transpose(img)
        if img.mode != "RGB":
            img = img.convert("RGB")
        img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
        
        stored_name = f"{uuid.uuid4()}.jpg"
        try:
            os.makedirs(UPLOAD_DIR, exist_ok=True)
            dest_path = os.path.join(UPLOAD_DIR, stored_name)
        except OSError:
            import tempfile
            UPLOAD_DIR_TEMP = os.path.join(tempfile.gettempdir(), "uploads")
            os.makedirs(UPLOAD_DIR_TEMP, exist_ok=True)
            dest_path = os.path.join(UPLOAD_DIR_TEMP, stored_name)
        img.save(dest_path, "JPEG", quality=85)
        return f"/uploads/{stored_name}"
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid or corrupted image file: {str(e)}")

@router.post("/progress/upload", response_model=SkinProgressPhotoResponse, status_code=status.HTTP_201_CREATED)
def upload_progress_entry(
    file: UploadFile = File(...),
    notes: Optional[str] = Form(None),
    associated_assessment_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    photo_url = validate_and_save_progress_photo(file)
    new_entry = SkinProgressPhoto(
        user_id=current_user.id,
        photo_url=photo_url,
        notes=notes,
        associated_assessment_id=associated_assessment_id,
        logged_at=datetime.utcnow()
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry


@router.delete("/progress/{photo_id}")
def delete_progress_entry(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = db.query(SkinProgressPhoto).filter(SkinProgressPhoto.id == photo_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Progress entry not found.")

    if entry.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own progress photos.")

    # Remove file from disk if local upload
    if entry.photo_url and entry.photo_url.startswith("/uploads/"):
        filename = os.path.basename(entry.photo_url)
        disk_path = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(disk_path):
            try:
                os.remove(disk_path)
            except Exception:
                pass

    db.delete(entry)
    db.commit()
    return {"message": "Progress photo deleted successfully", "id": photo_id}


@router.get("/adherence")
def get_routine_adherence_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch active routines and all routine logs
    user_routines = db.query(SkincareRoutine).filter(SkincareRoutine.user_id == current_user.id).all()
    all_logs = db.query(SkincareLog).filter(
        SkincareLog.user_id == current_user.id
    ).order_by(SkincareLog.logged_date.desc()).all()

    has_data = bool(all_logs) or bool(user_routines)
    if not has_data:
        return {
            "has_data": False,
            "message": "No routine logs recorded yet. Start logging routines to track adherence.",
            "daily": {"completed_steps": 0, "scheduled_steps": 0, "rate": 0.0, "missed_steps": 0},
            "weekly": {"completed_steps": 0, "scheduled_steps": 0, "rate": 0.0, "missed_steps": 0},
            "monthly": {"completed_steps": 0, "scheduled_steps": 0, "rate": 0.0, "missed_steps": 0},
            "morning_rate": 0.0,
            "evening_rate": 0.0,
            "current_streak": 0,
            "longest_streak": 0
        }

    # Daily scheduled steps (e.g. morning + evening routine steps)
    morning_routine = next((r for r in user_routines if r.routine_type == "MORNING"), None)
    evening_routine = next((r for r in user_routines if r.routine_type == "EVENING"), None)

    morning_steps_count = len(morning_routine.steps) if (morning_routine and isinstance(morning_routine.steps, list)) else 3
    evening_steps_count = len(evening_routine.steps) if (evening_routine and isinstance(evening_routine.steps, list)) else 3
    daily_scheduled_steps = max(2, morning_steps_count + evening_steps_count)

    now = datetime.utcnow()
    today_date = now.date()
    today_min = datetime.combine(today_date, datetime.min.time())

    # Today's logs
    today_logs = [l for l in all_logs if (l.logged_date.date() if isinstance(l.logged_date, datetime) else l.logged_date) == today_date]
    today_completed = sum(1 for l in today_logs if l.completed)
    today_scheduled = 2 if not user_routines else len([r for r in user_routines if r.routine_type in ["MORNING", "EVENING"]])
    today_scheduled = max(1, today_scheduled)
    today_rate = round(min(100.0, (today_completed / today_scheduled) * 100), 1)

    # Past 7 days (Weekly)
    seven_days_ago = today_date - timedelta(days=7)
    week_logs = [l for l in all_logs if (l.logged_date.date() if isinstance(l.logged_date, datetime) else l.logged_date) >= seven_days_ago]
    week_completed = sum(1 for l in week_logs if l.completed)
    week_scheduled = today_scheduled * 7
    week_rate = round(min(100.0, (week_completed / max(1, week_scheduled)) * 100), 1)
    week_missed = max(0, week_scheduled - week_completed)

    # Past 30 days (Monthly)
    thirty_days_ago = today_date - timedelta(days=30)
    month_logs = [l for l in all_logs if (l.logged_date.date() if isinstance(l.logged_date, datetime) else l.logged_date) >= thirty_days_ago]
    month_completed = sum(1 for l in month_logs if l.completed)
    month_scheduled = today_scheduled * 30
    month_rate = round(min(100.0, (month_completed / max(1, month_scheduled)) * 100), 1)
    month_missed = max(0, month_scheduled - month_completed)

    # Morning vs Evening adherence
    morning_logs = [l for l in month_logs if l.routine_type == "MORNING"]
    morning_completed = sum(1 for l in morning_logs if l.completed)
    morning_rate = round((morning_completed / max(1, len(morning_logs))) * 100, 1) if morning_logs else 0.0

    evening_logs = [l for l in month_logs if l.routine_type == "EVENING"]
    evening_completed = sum(1 for l in evening_logs if l.completed)
    evening_rate = round((evening_completed / max(1, len(evening_logs))) * 100, 1) if evening_logs else 0.0

    # Calculate streaks
    sorted_logs = sorted(all_logs, key=lambda l: l.logged_date, reverse=True)
    current_streak = 0
    longest_streak = 0
    temp_streak = 0

    check_date = today_date
    while True:
        day_logs = [l for l in sorted_logs if (l.logged_date.date() if isinstance(l.logged_date, datetime) else l.logged_date) == check_date and l.completed]
        if day_logs:
            current_streak += 1
            check_date -= timedelta(days=1)
        else:
            if check_date == today_date:
                # User hasn't completed today yet, check yesterday
                check_date -= timedelta(days=1)
                continue
            break

    # Longest streak
    unique_completed_dates = sorted(list(set(
        (l.logged_date.date() if isinstance(l.logged_date, datetime) else l.logged_date)
        for l in all_logs if l.completed
    )))

    if unique_completed_dates:
        curr_run = 1
        max_run = 1
        for i in range(1, len(unique_completed_dates)):
            if (unique_completed_dates[i] - unique_completed_dates[i-1]).days == 1:
                curr_run += 1
                if curr_run > max_run:
                    max_run = curr_run
            else:
                curr_run = 1
        longest_streak = max(max_run, current_streak)

    return {
        "has_data": True,
        "message": "Routine adherence calculated from verified activity logs.",
        "daily": {
            "completed_steps": today_completed,
            "scheduled_steps": today_scheduled,
            "rate": today_rate,
            "missed_steps": max(0, today_scheduled - today_completed)
        },
        "weekly": {
            "completed_steps": week_completed,
            "scheduled_steps": week_scheduled,
            "rate": week_rate,
            "missed_steps": week_missed
        },
        "monthly": {
            "completed_steps": month_completed,
            "scheduled_steps": month_scheduled,
            "rate": month_rate,
            "missed_steps": month_missed
        },
        "morning_rate": morning_rate,
        "evening_rate": evening_rate,
        "current_streak": current_streak,
        "longest_streak": longest_streak
    }


@router.get("/improvements")
def get_skin_improvement_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assessments = db.query(SkinAssessment).filter(
        SkinAssessment.user_id == current_user.id
    ).order_by(SkinAssessment.created_at.desc()).all()

    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()

    disclaimer = "This improvement analysis is for informational wellness tracking and personalized routine adaptation. It does not constitute medical diagnosis or clinical prognosis."

    if len(assessments) < 2:
        latest = assessments[0] if assessments else None
        return {
            "has_sufficient_history": False,
            "message": "Complete another assessment to view improvement trends.",
            "total_assessments": len(assessments),
            "latest_score": latest.overall_score if latest else None,
            "latest_risk": latest.risk_level if latest else None,
            "latest_concern": latest.concern_priority if latest else None,
            "disclaimer": disclaimer
        }

    curr = assessments[0]
    prev = assessments[1]

    score_delta = curr.overall_score - prev.overall_score
    acne_delta = curr.acne - prev.acne
    dryness_delta = curr.dryness - prev.dryness
    oiliness_delta = curr.oiliness - prev.oiliness
    redness_delta = curr.redness - prev.redness
    hyperpigmentation_delta = curr.hyperpigmentation - prev.hyperpigmentation
    sensitivity_delta = curr.sensitivity - prev.sensitivity
    wrinkles_delta = curr.wrinkles - prev.wrinkles

    if score_delta > 0:
        interpretation = f"Skin health score improved by +{score_delta}% points compared to your previous assessment."
    elif score_delta < 0:
        interpretation = f"Skin health score shifted by {score_delta}% points compared to your previous assessment."
    else:
        interpretation = "Skin health score is stable across assessments."

    # Top improvements and areas needing care
    parameters = [
        {"name": "Acne Severity", "delta": -acne_delta, "current": curr.acne, "previous": prev.acne},
        {"name": "Dryness Level", "delta": -dryness_delta, "current": curr.dryness, "previous": prev.dryness},
        {"name": "Oiliness Balance", "delta": -oiliness_delta, "current": curr.oiliness, "previous": prev.oiliness},
        {"name": "Redness & Calming", "delta": -redness_delta, "current": curr.redness, "previous": prev.redness},
        {"name": "Hyperpigmentation", "delta": -hyperpigmentation_delta, "current": curr.hyperpigmentation, "previous": prev.hyperpigmentation},
        {"name": "Skin Sensitivity", "delta": -sensitivity_delta, "current": curr.sensitivity, "previous": prev.sensitivity},
        {"name": "Fine Lines & Wrinkles", "delta": -wrinkles_delta, "current": curr.wrinkles, "previous": prev.wrinkles},
    ]

    return {
        "has_sufficient_history": True,
        "message": "Comparative skin wellness analysis generated successfully.",
        "overall_score": {
            "current": curr.overall_score,
            "previous": prev.overall_score,
            "delta": score_delta
        },
        "risk_level": {
            "current": curr.risk_level,
            "previous": prev.risk_level
        },
        "concern_priority": {
            "current": curr.concern_priority,
            "previous": prev.concern_priority
        },
        "interpretation": interpretation,
        "parameter_comparison": parameters,
        "lifestyle_context": {
            "water_intake_target": profile.water_intake if profile else 2.0,
            "sleep_quality": profile.sleep_quality if profile else "Not logged",
            "stress_level": profile.stress_level if profile else "Not logged",
            "climate": profile.climate if profile else "Temperate"
        },
        "previous_assessment_date": prev.created_at.isoformat(),
        "current_assessment_date": curr.created_at.isoformat(),
        "disclaimer": disclaimer
    }
