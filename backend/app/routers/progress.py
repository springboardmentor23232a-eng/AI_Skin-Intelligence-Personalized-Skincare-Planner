from typing import List
from datetime import datetime, timedelta
import os
import uuid

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user

from app.models.user import User
from app.models.progress import ProgressLog
from app.models.skin_profile import SkinProfile
from app.models.assessment import SkinAssessment
from app.models.progress_photo import ProgressPhoto

from app.schemas.progress import (
    ProgressLogCreate,
    ProgressLogOut,
    ProgressPhotoOut,
)

from app.services.scoring_service import compute_skin_health_score
from app.services.ml_service import predict_skin_severity


router = APIRouter(
    prefix="/api/progress",
    tags=["Progress Tracking"],
)


# =========================================================
# DAILY PROGRESS LOG
# =========================================================

@router.post("/log", response_model=ProgressLogOut)
def log_progress(
    payload: ProgressLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = (
        db.query(SkinProfile)
        .filter(SkinProfile.user_id == current_user.id)
        .first()
    )

    latest_assessment = (
        db.query(SkinAssessment)
        .filter(SkinAssessment.user_id == current_user.id)
        .order_by(SkinAssessment.created_at.desc())
        .first()
    )

    cutoff = datetime.utcnow() - timedelta(days=14)

    recent_logs = (
        db.query(ProgressLog)
        .filter(
            ProgressLog.user_id == current_user.id,
            ProgressLog.log_date >= cutoff,
        )
        .all()
    )

    recent_logs_dicts = [
        {
            "routine_followed_morning": log.routine_followed_morning,
            "routine_followed_evening": log.routine_followed_evening,
        }
        for log in recent_logs
    ]

    score_result = None

    if profile:
        score_result = compute_skin_health_score(
            identified_concerns=(
                latest_assessment.identified_concerns
                if latest_assessment
                else (profile.skin_concerns or [])
            ),
            concern_severity=(
                latest_assessment.concern_severity
                if latest_assessment
                else {}
            ),
            lifestyle_habits=profile.lifestyle_habits or [],
            sleep_quality=profile.sleep_quality,
            sleep_hours=profile.sleep_hours or 7.0,
            logs_last_14_days=recent_logs_dicts,
            water_intake_liters=profile.water_intake_liters or 2.0,
        )

    log = ProgressLog(
        user_id=current_user.id,
        **payload.dict(),
        skin_health_score=(
            score_result["overall_skin_health_score"]
            if score_result
            else None
        ),
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return log


# =========================================================
# DAILY PROGRESS HISTORY
# =========================================================

@router.get(
    "/history",
    response_model=List[ProgressLogOut],
)
def get_progress_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(ProgressLog)
        .filter(
            ProgressLog.user_id == current_user.id
        )
        .order_by(
            ProgressLog.log_date.desc()
        )
        .all()
    )


# =========================================================
# AI IMAGE SCORE
# =========================================================

def calculate_image_skin_score(ml_result: dict) -> float:
    """
    Convert AI acne severity probabilities into a
    continuous skin-health score from 0-100.

    Lower acne severity = higher skin-health score.

    Severity weights:
        Mild        = 15
        Moderate    = 30
        Severe      = 50
        Very Severe = 70
    """

    probabilities = ml_result.get("probabilities", {})

    severity_weights = {
        "Mild": 15,
        "Moderate": 30,
        "Severe": 50,
        "Very Severe": 70,
    }

    weighted_severity = 0.0

    for severity, probability in probabilities.items():
        weight = severity_weights.get(severity, 30)

        weighted_severity += (
            float(probability) / 100.0
        ) * weight

    score = 100.0 - weighted_severity

    # Keep score inside 0-100
    score = max(0.0, min(100.0, score))

    return round(score, 2)


# =========================================================
# UPLOAD / REPLACE PROGRESS PHOTO
# =========================================================

@router.post(
    "/photos",
    response_model=ProgressPhotoOut,
)
def upload_progress_photo(
    photo_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # -----------------------------------------------------
    # Validate photo type
    # -----------------------------------------------------

    if photo_type not in ["before", "current"]:
        raise HTTPException(
            status_code=400,
            detail="photo_type must be 'before' or 'current'.",
        )

    # -----------------------------------------------------
    # Validate image type
    # -----------------------------------------------------

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are allowed.",
        )

    # -----------------------------------------------------
    # Read uploaded image
    #
    # IMPORTANT:
    # This endpoint is synchronous, so use file.file.read()
    # and NOT await file.read()
    # -----------------------------------------------------

    contents = file.file.read()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty.",
        )

    # -----------------------------------------------------
    # Maximum size = 5 MB
    # -----------------------------------------------------

    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image size must be less than 5 MB.",
        )

    # -----------------------------------------------------
    # AI ANALYSIS
    # -----------------------------------------------------

    try:
        ml_result = predict_skin_severity(contents)

        ai_prediction = ml_result.get(
            "prediction",
            "Unknown",
        )

        ai_confidence = float(
            ml_result.get(
                "confidence",
                0,
            )
        )

        ai_score = calculate_image_skin_score(
            ml_result
        )

    except Exception as exc:
        print(
            f"AI progress image analysis failed: {exc}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to analyze the uploaded skin image. "
                "Please try another clear image."
            ),
        )

    # -----------------------------------------------------
    # Upload directory
    # -----------------------------------------------------

    upload_dir = "/app/uploads/progress"

    os.makedirs(
        upload_dir,
        exist_ok=True,
    )

    # -----------------------------------------------------
    # File extension
    # -----------------------------------------------------

    extension = os.path.splitext(
        file.filename or ""
    )[1].lower()

    if extension not in [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
    ]:
        extension = ".jpg"

    # -----------------------------------------------------
    # Generate unique filename
    # -----------------------------------------------------

    filename = (
        f"{current_user.id}_"
        f"{uuid.uuid4()}"
        f"{extension}"
    )

    filepath = os.path.join(
        upload_dir,
        filename,
    )

    # -----------------------------------------------------
    # Save image
    # -----------------------------------------------------

    try:
        with open(filepath, "wb") as buffer:
            buffer.write(contents)

    except Exception as exc:
        print(
            f"Image save failed: {exc}"
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to save uploaded image.",
        )

    # -----------------------------------------------------
    # Remove previous photo of same type
    #
    # This means:
    #
    # Before  -> only latest Before
    # Current -> only latest Current
    #
    # -----------------------------------------------------

    old_photo = (
        db.query(ProgressPhoto)
        .filter(
            ProgressPhoto.user_id == current_user.id,
            ProgressPhoto.photo_type == photo_type,
        )
        .order_by(
            ProgressPhoto.created_at.desc()
        )
        .first()
    )

    if old_photo:
        old_file_path = old_photo.photo_url

        if old_file_path.startswith(
            "/uploads/"
        ):
            old_filename = old_file_path.replace(
                "/uploads/",
                "",
                1,
            )

            old_full_path = os.path.join(
                "/app/uploads",
                old_filename,
            )

            try:
                if os.path.exists(old_full_path):
                    os.remove(old_full_path)
            except Exception as exc:
                print(
                    f"Could not remove old image: {exc}"
                )

        db.delete(old_photo)
        db.commit()

    # -----------------------------------------------------
    # Get latest assessment
    #
    # Used only for linking the progress photo.
    # The SCORE now comes from the uploaded image AI.
    # -----------------------------------------------------

    latest_assessment = (
        db.query(SkinAssessment)
        .filter(
            SkinAssessment.user_id == current_user.id
        )
        .order_by(
            SkinAssessment.created_at.desc()
        )
        .first()
    )

    # -----------------------------------------------------
    # Create progress photo record
    # -----------------------------------------------------

    photo = ProgressPhoto(
        user_id=current_user.id,

        assessment_id=(
            latest_assessment.id
            if latest_assessment
            else None
        ),

        photo_url=(
            f"/uploads/progress/{filename}"
        ),

        photo_type=photo_type,

        skin_health_score=ai_score,
    )

    db.add(photo)
    db.commit()
    db.refresh(photo)

    # -----------------------------------------------------
    # Helpful server log
    # -----------------------------------------------------

    print(
        "\n"
        "========================================\n"
        "AI PROGRESS PHOTO ANALYSIS\n"
        f"Photo Type : {photo_type}\n"
        f"Prediction : {ai_prediction}\n"
        f"Confidence : {ai_confidence:.2f}%\n"
        f"Health Score: {ai_score:.2f}/100\n"
        f"Image      : {filename}\n"
        "========================================\n"
    )

    return photo


# =========================================================
# GET PROGRESS PHOTOS
# =========================================================

@router.get(
    "/photos",
    response_model=List[ProgressPhotoOut],
)
def get_progress_photos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(ProgressPhoto)
        .filter(
            ProgressPhoto.user_id == current_user.id
        )
        .order_by(
            ProgressPhoto.created_at.desc()
        )
        .all()
    )