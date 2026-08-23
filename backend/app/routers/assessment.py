import os
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.deps import get_current_user, require_professional
from app.config import settings
from app.utils.image_utils import load_image_bgr, extract_skin_features, feature_vector
from app.ml.predict import predict_skin_type
from app.ml.scoring_engine import compute_skin_health_score, identify_concerns, analyze_risk_factors

router = APIRouter(prefix="/api/assessment", tags=["Skin Assessment"])


def _save_upload(file: UploadFile) -> str:
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    path = os.path.join(settings.UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        f.write(file.file.read())
    return path


def _latest_adherence_pct(db: Session, user_id: str):
    log = (
        db.query(models.ProgressLog)
        .filter(models.ProgressLog.user_id == user_id)
        .order_by(models.ProgressLog.log_date.desc())
        .first()
    )
    return log.routine_adherence_pct if log else None


@router.post("", response_model=schemas.SkinAssessmentOut, status_code=201)
def create_assessment(
    payload: schemas.SkinAssessmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create an assessment WITHOUT an image (profile + manual concerns only)."""
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    adherence = _latest_adherence_pct(db, current_user.id)

    score_result = compute_skin_health_score(profile=profile, image_features=None, routine_adherence_pct=adherence)
    concerns = identify_concerns(image_features=None, profile=profile, manual_concerns=payload.concerns)
    risks = analyze_risk_factors(profile=profile, image_features=None)

    assessment = models.SkinAssessment(
        user_id=current_user.id,
        skin_health_score=score_result["skin_health_score"],
        overall_condition=score_result["overall_condition"],
        detected_skin_type=profile.skin_type if profile else None,
        notes=payload.notes,
    )
    db.add(assessment)
    db.flush()

    for c in concerns:
        db.add(models.SkinConcern(assessment_id=assessment.id, **c))
    for r in risks:
        db.add(models.RiskFactor(assessment_id=assessment.id, **r))

    db.commit()
    db.refresh(assessment)
    return assessment


@router.post("/analyze-image", response_model=schemas.SkinAssessmentOut, status_code=201)
def analyze_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Accepts a webcam capture or uploaded skin image, runs OpenCV feature
    extraction + the trained ML skin-type classifier, and creates a full
    assessment (score, concerns, risks) from the result.
    """
    path = _save_upload(file)
    try:
        img = load_image_bgr(path)
        features = extract_skin_features(img)
        vec = feature_vector(features)
        ml_result = predict_skin_type(vec)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not analyze image: {e}")

    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.SkinProfile(user_id=current_user.id)
        db.add(profile)
        db.flush()

    profile.skin_type = ml_result["skin_type"]

    adherence = _latest_adherence_pct(db, current_user.id)
    score_result = compute_skin_health_score(profile=profile, image_features=features, routine_adherence_pct=adherence)
    concerns = identify_concerns(image_features=features, profile=profile)
    risks = analyze_risk_factors(profile=profile, image_features=features)

    assessment = models.SkinAssessment(
        user_id=current_user.id,
        skin_health_score=score_result["skin_health_score"],
        overall_condition=score_result["overall_condition"],
        detected_skin_type=ml_result["skin_type"],
        image_path=path,
        notes=f"Auto-analyzed. ML confidence: {ml_result['probabilities']}",
    )
    db.add(assessment)
    db.flush()

    for c in concerns:
        db.add(models.SkinConcern(assessment_id=assessment.id, **c))
    for r in risks:
        db.add(models.RiskFactor(assessment_id=assessment.id, **r))

    db.commit()
    db.refresh(assessment)
    return assessment


@router.get("", response_model=list[schemas.SkinAssessmentOut])
def list_assessments(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return (
        db.query(models.SkinAssessment)
        .filter(models.SkinAssessment.user_id == current_user.id)
        .order_by(models.SkinAssessment.assessment_date.desc())
        .all()
    )


@router.get("/history", response_model=list[schemas.SkinAssessmentOut])
def assessment_history(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return (
        db.query(models.SkinAssessment)
        .filter(models.SkinAssessment.user_id == current_user.id)
        .order_by(models.SkinAssessment.assessment_date.asc())
        .all()
    )


@router.get("/score")
def latest_score(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    latest = (
        db.query(models.SkinAssessment)
        .filter(models.SkinAssessment.user_id == current_user.id)
        .order_by(models.SkinAssessment.assessment_date.desc())
        .first()
    )
    if not latest:
        raise HTTPException(status_code=404, detail="No assessments found.")
    return {"skin_health_score": latest.skin_health_score, "overall_condition": latest.overall_condition}


@router.get("/risks", response_model=list[schemas.RiskFactorOut])
def latest_risks(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    latest = (
        db.query(models.SkinAssessment)
        .filter(models.SkinAssessment.user_id == current_user.id)
        .order_by(models.SkinAssessment.assessment_date.desc())
        .first()
    )
    if not latest:
        raise HTTPException(status_code=404, detail="No assessments found.")
    return latest.risk_factors


@router.get("/{assessment_id}", response_model=schemas.SkinAssessmentOut)
def get_assessment(assessment_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    assessment = db.query(models.SkinAssessment).filter(models.SkinAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    if assessment.user_id != current_user.id and current_user.role not in ("consultant", "dermatologist", "admin"):
        raise HTTPException(status_code=403, detail="Not authorized to view this assessment.")
    return assessment


@router.put("/{assessment_id}", response_model=schemas.SkinAssessmentOut)
def update_assessment(
    assessment_id: str,
    payload: schemas.SkinAssessmentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    assessment = db.query(models.SkinAssessment).filter(models.SkinAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    if assessment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized.")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(assessment, field, value)
    db.commit()
    db.refresh(assessment)
    return assessment


@router.delete("/{assessment_id}", status_code=204)
def delete_assessment(assessment_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    assessment = db.query(models.SkinAssessment).filter(models.SkinAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    if assessment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized.")
    db.delete(assessment)
    db.commit()
    return None
