from typing import List
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.security import get_current_user, AuthenticatedUser
from app.service.assessment_service import AssessmentService
from app.schemas.assessment import (
    SkinAssessmentInput,
    AssessmentUpdate,
    SkinAssessmentResponse,
    HealthScoreResponse,
    RiskAnalysisResponse,
    AssessmentStatsResponse
)

router = APIRouter(prefix="", tags=["Skin Assessment Engine"])

# 1. POST /assessment - Create new skin assessment
@router.post(
    "/assessment",
    response_model=SkinAssessmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Skin Assessment",
    description="Analyzes user skin parameters via rule-based AI engine, generates score (0-100), overall condition, concerns, priorities, and risk factors, and persists to database."
)
@router.post(
    "/api/assessment",
    response_model=SkinAssessmentResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False
)
def create_assessment(
    input_data: SkinAssessmentInput,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return AssessmentService.create_assessment(db, input_data, current_user)


# 2. GET /assessment/history - Return assessment history of logged-in user
@router.get(
    "/assessment/history",
    response_model=List[SkinAssessmentResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Assessment History",
    description="Retrieves chronological assessment history for the currently authenticated user."
)
@router.get(
    "/api/assessment/history",
    response_model=List[SkinAssessmentResponse],
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
def get_assessment_history(
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return AssessmentService.get_user_history(db, current_user)


# 3. GET /assessment/score - Return latest skin health score
@router.get(
    "/assessment/score",
    response_model=HealthScoreResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Latest Skin Health Score",
    description="Returns the latest skin health score (0-100) and overall condition rating for the logged-in user."
)
@router.get(
    "/api/assessment/score",
    response_model=HealthScoreResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
def get_latest_score(
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return AssessmentService.get_latest_score(db, current_user)


# 4. GET /assessment/risks - Return latest risk analysis
@router.get(
    "/assessment/risks",
    response_model=RiskAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Latest Risk Analysis",
    description="Returns the latest risk factor analysis breakdown for the logged-in user."
)
@router.get(
    "/api/assessment/risks",
    response_model=RiskAnalysisResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
def get_latest_risks(
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return AssessmentService.get_latest_risks(db, current_user)


# 5. GET /assessment/stats - Return global assessment statistics
@router.get(
    "/assessment/stats",
    response_model=AssessmentStatsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Global Assessment Statistics",
    description="Returns system-wide assessment count, average score, and condition distributions (Admin/Consultant/Doctor)."
)
@router.get(
    "/api/assessment/stats",
    response_model=AssessmentStatsResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
def get_assessment_stats(
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return AssessmentService.get_stats(db, current_user)


# 6. GET /assessment - Get all assessments (Admins/Consultants/Doctors view all/assigned, Users view own)
@router.get(
    "/assessment",
    response_model=List[SkinAssessmentResponse],
    status_code=status.HTTP_200_OK,
    summary="Get All Assessments",
    description="Lists assessments based on user role permissions."
)
@router.get(
    "/api/assessment",
    response_model=List[SkinAssessmentResponse],
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
def get_all_assessments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return AssessmentService.get_all_assessments(db, current_user, skip=skip, limit=limit)


# 7. GET /assessment/{id} - Get assessment by ID
@router.get(
    "/assessment/{id}",
    response_model=SkinAssessmentResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Assessment by ID",
    description="Retrieves detailed assessment report including concerns and risk factors by ID."
)
@router.get(
    "/api/assessment/{id}",
    response_model=SkinAssessmentResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
def get_assessment_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return AssessmentService.get_assessment_by_id(db, id, current_user)


# 8. PUT /assessment/{id} - Update assessment (notes, prescription, condition, score)
@router.put(
    "/assessment/{id}",
    response_model=SkinAssessmentResponse,
    status_code=status.HTTP_200_OK,
    summary="Update Assessment",
    description="Allows authorized users, consultants, or dermatologists to update assessment notes, clinical diagnoses, or recommendations."
)
@router.put(
    "/api/assessment/{id}",
    response_model=SkinAssessmentResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
def update_assessment(
    id: int,
    update_data: AssessmentUpdate,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return AssessmentService.update_assessment(db, id, update_data, current_user)


# 9. DELETE /assessment/{id} - Delete assessment
@router.delete(
    "/assessment/{id}",
    status_code=status.HTTP_200_OK,
    summary="Delete Assessment",
    description="Deletes assessment by ID. Restricted to system administrators or assessment owners."
)
@router.delete(
    "/api/assessment/{id}",
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
def delete_assessment(
    id: int,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return AssessmentService.delete_assessment(db, id, current_user)
