from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user, UserContext
from app.schemas import (
    AssessmentCreate,
    AssessmentUpdate,
    AssessmentResponse,
    AssessmentHistoryResponse,
    ScoreSummaryResponse,
    RiskSummaryResponse
)
from app.services import assessment_service

router = APIRouter(prefix="", tags=["Skin Assessment Engine"])


@router.post("", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
def create_assessment(
    payload: AssessmentCreate,
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    **POST /assessment**:
    Analyzes user skin profile inputs, executes scoring, concern identification, and risk analysis engines,
    and creates a new Skin Assessment record in PostgreSQL.
    """
    return assessment_service.create_skin_assessment(db=db, user_id=current_user.id, payload=payload)



@router.post("/scan-image", status_code=status.HTTP_201_CREATED)
def scan_skin_image(
    payload: Optional[dict] = None,
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    **POST /assessment/scan-image**:
    Runs Computer Vision & ML Image Classifier model on uploaded photo or webcam capture.
    Detects Skin Type, Disease/Lesion Risks (ISIC Benign vs Malignant risk screening, Acne, Rosacea, Hyperpigmentation),
    creates a SkinAssessment, and auto-generates updated Personalized Routine.
    """
    from app.services.image_analysis_engine import analyze_skin_image
    from app.services.routine_engine import generate_personalized_routine_data
    from app.schemas import AssessmentCreate, SkinTypeEnum

    image_input = None
    if payload and "image_data" in payload:
        image_input = payload["image_data"]
    elif payload and "image" in payload:
        image_input = payload["image"]

    if not image_input:
        # Default sample image bytes for fallback testing
        image_input = b"PanaceaAI_Sample_Skin_Image_Data_Bytes_12345"

    # 1. Run ML Image Analysis Pipeline
    analysis = analyze_skin_image(image_input)

    skin_type_str = analysis["detected_skin_type"]
    biomarkers = analysis["biomarkers"]

    try:
        skin_type_enum = SkinTypeEnum(skin_type_str)
    except Exception:
        skin_type_enum = SkinTypeEnum.COMBINATION

    # 2. Build AssessmentCreate payload with ML biomarkers
    create_payload = AssessmentCreate(
        skin_type=skin_type_enum,
        hydration_level=biomarkers["hydration_level"],
        oiliness_level=biomarkers["oiliness_level"],
        sensitivity_level=biomarkers["sensitivity_level"],
        acne_severity=biomarkers["acne_severity"],
        pigmentation_score=biomarkers["pigmentation_score"],
        wrinkles_score=biomarkers["wrinkles_score"],
        notes=f"ML Photo Scan: Detected {skin_type_str} skin type ({analysis['type_confidence']}% confidence). {analysis['lesion_screening']['classification']}"
    )

    # 3. Save assessment and run rule engines
    assessment = assessment_service.create_skin_assessment(db=db, user_id=current_user.id, payload=create_payload)

    # 4. Auto-generate personalized routine based on scan
    concerns = [c.concern_name for c in assessment.concerns] if assessment.concerns else ["Acne & Breakouts"]
    routine_data = generate_personalized_routine_data(
        skin_type=skin_type_str,
        concerns=concerns,
        health_score=analysis["skin_health_score"],
        lifestyle={"sun_exposure_hours": 2.0, "sensitivity_level": biomarkers["sensitivity_level"]}
    )

    return {
        "success": True,
        "assessment_id": assessment.id,
        "user_id": current_user.id,
        "detected_skin_type": skin_type_str,
        "type_confidence": analysis["type_confidence"],
        "skin_health_score": analysis["skin_health_score"],
        "biomarkers": biomarkers,
        "lesion_screening": analysis["lesion_screening"],
        "conditions_detected": analysis["conditions_detected"],
        "assessment": assessment,
        "generated_routine": routine_data
    }



@router.get("", response_model=List[AssessmentResponse])
@router.get("/", response_model=List[AssessmentResponse])
def get_assessments(
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Pagination limit"),
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    **GET /assessment**:
    Retrieves all skin assessments for the authenticated user (or all users if admin).
    """
    return assessment_service.list_user_assessments(db=db, user_id=current_user.id, skip=skip, limit=limit, role=current_user.role)


@router.get("/history", response_model=AssessmentHistoryResponse)
def get_assessment_history(
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    **GET /assessment/history**:
    Retrieves chronological assessment history, score trends (Improving, Stable, Declining), and historical scan details.
    """
    return assessment_service.get_assessment_history_summary(db=db, user_id=current_user.id)


@router.get("/score", response_model=ScoreSummaryResponse)
def get_skin_score(
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    **GET /assessment/score**:
    Retrieves the overall Skin Health Score (0-100), weighted parameter breakdown, and clinical insights.
    """
    return assessment_service.get_skin_score_summary(db=db, user_id=current_user.id)


@router.get("/risks", response_model=RiskSummaryResponse)
def get_skin_risks(
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    **GET /assessment/risks**:
    Retrieves rule-based risk factor analysis categorized by severity levels (CRITICAL, HIGH, MEDIUM, LOW) and mitigation advice.
    """
    return assessment_service.get_risks_summary(db=db, user_id=current_user.id)


@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_assessment_detail(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    **GET /assessment/{id}**:
    Retrieves detailed assessment report by ID, including identified concerns and risk factors.
    """
    assessment = assessment_service.get_assessment_by_id(db=db, user_id=current_user.id, assessment_id=assessment_id, role=current_user.role)
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skin assessment with ID {assessment_id} not found."
        )
    return assessment


@router.put("/{assessment_id}", response_model=AssessmentResponse)
def update_assessment(
    assessment_id: int,
    payload: AssessmentUpdate,
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    **PUT /assessment/{id}**:
    Updates skin assessment inputs or notes and re-calculates score, concerns, and risks.
    """
    updated = assessment_service.update_skin_assessment(db=db, user_id=current_user.id, assessment_id=assessment_id, payload=payload, role=current_user.role)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skin assessment with ID {assessment_id} not found or permission denied."
        )
    return updated


@router.delete("/{assessment_id}", status_code=status.HTTP_200_OK)
def delete_assessment(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    **DELETE /assessment/{id}**:
    Deletes a skin assessment record along with associated concerns and risk factors.
    """
    deleted = assessment_service.delete_skin_assessment(db=db, user_id=current_user.id, assessment_id=assessment_id, role=current_user.role)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skin assessment with ID {assessment_id} not found or permission denied."
        )
    return {
        "success": True,
        "message": f"Skin assessment #{assessment_id} successfully deleted."
    }
