from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
import tempfile
import shutil
import os

from app.database import get_db
from app import models
from app.dependencies import get_current_user
from app.schemas import AssessmentUpdate

from assessment.combined_assessment_engine import combined_assessment


router = APIRouter(
    prefix="/assessment",
    tags=["Assessment"]
)


@router.post("/combined")
async def combined_assessment_api(
    age: int = Form(...),
    gender: str = Form(...),
    hydration_level: str = Form(...),
    oil_level: str = Form(...),
    sensitivity: str = Form(...),
    humidity: float = Form(...),
    temperature: float = Form(...),
    image: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Runs the combined Questionnaire + Vision AI assessment
    and stores the completed assessment in PostgreSQL
    for the authenticated user.
    """

    temp_file_path = None

    try:
        # --------------------------------------------------
        # 1. Save uploaded image temporarily
        # --------------------------------------------------

        suffix = os.path.splitext(image.filename or "")[1]

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:

            shutil.copyfileobj(image.file, temp_file)
            temp_file_path = temp_file.name

        # --------------------------------------------------
        # 2. Prepare questionnaire data
        # --------------------------------------------------

        questionnaire_data = {
            "age": age,
            "gender": gender,
            "hydration_level": hydration_level,
            "oil_level": oil_level,
            "sensitivity": sensitivity,
            "humidity": humidity,
            "temperature": temperature
        }

        # --------------------------------------------------
        # 3. Run existing AI assessment engine
        # --------------------------------------------------

        result = combined_assessment(
            questionnaire_data,
            temp_file_path
        )

        if not result or "error" in result:
            raise HTTPException(
                status_code=500,
                detail=result.get(
                    "error",
                    "Combined assessment failed."
                ) if isinstance(result, dict) else
                "Combined assessment failed."
            )

        # --------------------------------------------------
        # 4. Extract assessment results
        # --------------------------------------------------

        summary = result.get("assessment_summary", {})
        vision = result.get("vision_analysis", {})
        recommendations = result.get("recommendations", {})

        # --------------------------------------------------
        # 5. Create PostgreSQL assessment record
        # --------------------------------------------------

        assessment_record = models.Assessment(
            user_id=current_user.id,

            age=age,
            gender=gender,
            hydration_level=hydration_level,
            oil_level=oil_level,
            sensitivity=sensitivity,
            humidity=humidity,
            temperature=temperature,

            predicted_skin_type=summary.get(
                "predicted_skin_type",
                "Unknown"
            ),

            health_score=summary.get(
                "health_score",
                0
            ),

            overall_condition=summary.get(
                "overall_condition",
                "Unknown"
            ),

            vision_predicted_concern=vision.get(
                "predicted_concern"
            ),

            vision_confidence=vision.get(
                "confidence"
            ),

            concerns=result.get("concerns", []),
            priority_order=result.get("priority_order", []),
            risk_factors=result.get("risk_factors", []),
            recommendations=recommendations
        )

        # --------------------------------------------------
        # 6. Save to PostgreSQL
        # --------------------------------------------------

        db.add(assessment_record)
        db.commit()
        db.refresh(assessment_record)

        # --------------------------------------------------
        # 7. Return assessment response
        # --------------------------------------------------

        result["assessment_id"] = assessment_record.id
        result["assessment_time"] = (
            assessment_record.assessment_time
        )

        return result

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()

        print(
            f"[ERROR] Assessment API failed: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to complete and save assessment."
        )

    finally:
        # --------------------------------------------------
        # 8. Delete temporary uploaded image
        # --------------------------------------------------

        if (
            temp_file_path
            and os.path.exists(temp_file_path)
        ):
            os.remove(temp_file_path)


@router.get("/history")
def get_assessment_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns assessment history for the currently authenticated user.
    """

    assessments = (
        db.query(models.Assessment)
        .filter(models.Assessment.user_id == current_user.id)
        .order_by(models.Assessment.assessment_time.desc())
        .all()
    )

    return [
        {
            "id": assessment.id,
            "user_id": assessment.user_id,
            "age": assessment.age,
            "gender": assessment.gender,
            "hydration_level": assessment.hydration_level,
            "oil_level": assessment.oil_level,
            "sensitivity": assessment.sensitivity,
            "humidity": assessment.humidity,
            "temperature": assessment.temperature,
            "predicted_skin_type": assessment.predicted_skin_type,
            "health_score": assessment.health_score,
            "overall_condition": assessment.overall_condition,
            "vision_predicted_concern": assessment.vision_predicted_concern,
            "vision_confidence": assessment.vision_confidence,
            "concerns": assessment.concerns,
            "priority_order": assessment.priority_order,
            "risk_factors": assessment.risk_factors,
            "recommendations": assessment.recommendations,
            "assessment_time": assessment.assessment_time,
        }
        for assessment in assessments
    ]

@router.get("/score")
def get_skin_health_score(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the latest skin health score
    for the currently authenticated user.
    """

    assessment = (
        db.query(models.Assessment)
        .filter(
            models.Assessment.user_id == current_user.id
        )
        .order_by(
            models.Assessment.assessment_time.desc()
        )
        .first()
    )

    if assessment is None:
        raise HTTPException(
            status_code=404,
            detail="No assessment found for this user."
        )

    return {
        "assessment_id": assessment.id,
        "user_id": assessment.user_id,
        "health_score": assessment.health_score,
        "overall_condition": assessment.overall_condition,
        "predicted_skin_type": assessment.predicted_skin_type,
        "assessment_time": assessment.assessment_time
    }
@router.get("/risks")
def get_assessment_risks(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the latest assessment risk analysis
    for the currently authenticated user.
    """

    assessment = (
        db.query(models.Assessment)
        .filter(
            models.Assessment.user_id == current_user.id
        )
        .order_by(
            models.Assessment.assessment_time.desc()
        )
        .first()
    )

    if assessment is None:
        raise HTTPException(
            status_code=404,
            detail="No assessment found for this user."
        )

    return {
        "assessment_id": assessment.id,
        "user_id": assessment.user_id,
        "risk_factors": assessment.risk_factors,
        "concerns": assessment.concerns,
        "priority_order": assessment.priority_order,
        "predicted_skin_type": assessment.predicted_skin_type,
        "vision_predicted_concern": assessment.vision_predicted_concern,
        "vision_confidence": assessment.vision_confidence,
        "assessment_time": assessment.assessment_time
    }

@router.get("/{assessment_id}")
def get_assessment(
    assessment_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns one assessment belonging to the currently authenticated user.
    """

    assessment = (
        db.query(models.Assessment)
        .filter(
            models.Assessment.id == assessment_id,
            models.Assessment.user_id == current_user.id
        )
        .first()
    )

    if assessment is None:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found."
        )

    return {
        "id": assessment.id,
        "user_id": assessment.user_id,
        "age": assessment.age,
        "gender": assessment.gender,
        "hydration_level": assessment.hydration_level,
        "oil_level": assessment.oil_level,
        "sensitivity": assessment.sensitivity,
        "humidity": assessment.humidity,
        "temperature": assessment.temperature,
        "predicted_skin_type": assessment.predicted_skin_type,
        "health_score": assessment.health_score,
        "overall_condition": assessment.overall_condition,
        "vision_predicted_concern": assessment.vision_predicted_concern,
        "vision_confidence": assessment.vision_confidence,
        "concerns": assessment.concerns,
        "priority_order": assessment.priority_order,
        "risk_factors": assessment.risk_factors,
        "recommendations": assessment.recommendations,
        "assessment_time": assessment.assessment_time,
    }

@router.delete("/{assessment_id}")
def delete_assessment(
    assessment_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes one assessment belonging to the currently authenticated user.
    """

    assessment = (
        db.query(models.Assessment)
        .filter(
            models.Assessment.id == assessment_id,
            models.Assessment.user_id == current_user.id
        )
        .first()
    )

    if assessment is None:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found."
        )

    db.delete(assessment)
    db.commit()

    return {
        "message": "Assessment deleted successfully.",
        "assessment_id": assessment_id
    }

@router.put("/{assessment_id}")
def update_assessment(
    assessment_id: int,
    assessment_data: AssessmentUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates one assessment belonging to the currently authenticated user.
    """

    assessment = (
        db.query(models.Assessment)
        .filter(
            models.Assessment.id == assessment_id,
            models.Assessment.user_id == current_user.id
        )
        .first()
    )

    if assessment is None:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found."
        )

    update_data = assessment_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(assessment, field, value)

    db.commit()
    db.refresh(assessment)

    return {
        "message": "Assessment updated successfully.",
        "assessment": {
            "id": assessment.id,
            "user_id": assessment.user_id,
            "age": assessment.age,
            "gender": assessment.gender,
            "hydration_level": assessment.hydration_level,
            "oil_level": assessment.oil_level,
            "sensitivity": assessment.sensitivity,
            "humidity": assessment.humidity,
            "temperature": assessment.temperature,
            "predicted_skin_type": assessment.predicted_skin_type,
            "health_score": assessment.health_score,
            "overall_condition": assessment.overall_condition,
            "vision_predicted_concern": assessment.vision_predicted_concern,
            "vision_confidence": assessment.vision_confidence,
            "concerns": assessment.concerns,
            "priority_order": assessment.priority_order,
            "risk_factors": assessment.risk_factors,
            "recommendations": assessment.recommendations,
            "assessment_time": assessment.assessment_time,
        }
    }
