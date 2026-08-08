import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Image, SkinAssessment, AIResult, Recommendation, ActivityLog, SkinProfile
from ..schemas import AssessmentOut
from ..auth import get_current_user
from ..ai.skin_analysis import analyze_face_image, generate_recommendations, annotate_detected_regions

router = APIRouter(prefix="/api", tags=["assessment"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

_CONCERN_FIELDS = [
    ("acne", "acne_score"), ("pigmentation", "pigmentation_score"), ("wrinkles", "wrinkle_score"),
    ("dryness", "dryness_score"), ("oiliness", "oiliness_score"), ("redness", "redness_score"),
    ("pores", "pores_score"),
]


def _run_assessment(user: User, image_bytes: bytes, image_id: str, db: Session) -> SkinAssessment:
    scores = analyze_face_image(image_bytes)

    # Highlight detected regions on a processed copy and store it (Webcam Skin Scanning Module).
    processed_image_id = None
    try:
        annotated_bytes = annotate_detected_regions(image_bytes, scores)
        processed_filename = f"{uuid.uuid4()}_processed.jpg"
        processed_path = os.path.join(UPLOAD_DIR, processed_filename)
        with open(processed_path, "wb") as f:
            f.write(annotated_bytes)
        processed_image = Image(user_id=user.id, file_path=processed_path, purpose="processed_scan")
        db.add(processed_image)
        db.commit()
        db.refresh(processed_image)
        processed_image_id = processed_image.id
    except Exception:
        pass

    concern_priority = max(_CONCERN_FIELDS, key=lambda pair: getattr(scores, pair[1]))[0]

    assessment = SkinAssessment(
        user_id=user.id,
        image_id=image_id,
        processed_image_id=processed_image_id,
        confidence_score=scores.confidence_score,
        concern_priority=concern_priority,
        acne_score=scores.acne_score,
        pigmentation_score=scores.pigmentation_score,
        wrinkle_score=scores.wrinkle_score,
        dryness_score=scores.dryness_score,
        oiliness_score=scores.oiliness_score,
        redness_score=scores.redness_score,
        pores_score=scores.pores_score,
        skin_health_score=scores.skin_health_score,
        risk_score=scores.risk_score,
        status="pending_review",
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    db.add(AIResult(
        assessment_id=assessment.id,
        model_version=scores.model_version,
        raw_output=scores.to_json(),
    ))

    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user.id).first()
    skin_type = profile.skin_type if profile else None
    for category, text in generate_recommendations(scores, skin_type):
        db.add(Recommendation(
            user_id=user.id,
            assessment_id=assessment.id,
            category=category,
            text=text,
            created_by_role="system",
        ))

    db.add(ActivityLog(user_id=user.id, action="assessment_created", details=assessment.id))
    db.commit()
    db.refresh(assessment)
    return assessment


@router.post("/scan", response_model=AssessmentOut, status_code=201)
async def webcam_scan(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a webcam-captured frame; runs AI skin analysis and stores the assessment."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()

    filename = f"{uuid.uuid4()}_{file.filename}"
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        f.write(contents)

    image = Image(user_id=current_user.id, file_path=path, purpose="scan")
    db.add(image)
    db.commit()
    db.refresh(image)

    try:
        return _run_assessment(current_user, contents, image.id, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/assessment", response_model=AssessmentOut, status_code=201)
async def create_assessment(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Alias of /scan — accepts an uploaded image and runs the same AI pipeline."""
    return await webcam_scan(file=file, current_user=current_user, db=db)


@router.get("/assessment", response_model=list[AssessmentOut])
def list_assessments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns the current user's assessment history, most recent first."""
    return (
        db.query(SkinAssessment)
        .filter(SkinAssessment.user_id == current_user.id)
        .order_by(SkinAssessment.created_at.desc())
        .all()
    )


@router.get("/assessment/{assessment_id}", response_model=AssessmentOut)
def get_assessment(
    assessment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assessment = db.query(SkinAssessment).filter(SkinAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    if assessment.user_id != current_user.id and current_user.role.value == "user":
        raise HTTPException(status_code=403, detail="Not authorized to view this assessment")
    return assessment
