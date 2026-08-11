from typing import List
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.security import get_current_user, AuthenticatedUser
from app.service.routine_service import RoutineService
from app.schemas.routine import (
    RoutineGenerateInput,
    RoutineStepSchema,
    RoutineGroupResponse,
    RoutineUpdateRequest,
    RoutineStatsResponse
)

router = APIRouter(prefix="", tags=["Skincare Routine Generation Engine"])

# 1. POST /routine/generate - Generate AI Skincare Routine
@router.post(
    "/routine/generate",
    response_model=RoutineGroupResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate AI Skincare Routine",
    description="Generates tailored Morning Routine, Evening Routine, Weekly Treatment Plan, and Seasonal Skincare Recommendations based on user parameters."
)
@router.post(
    "/api/routine/generate",
    response_model=RoutineGroupResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False
)
def generate_routine(
    input_data: RoutineGenerateInput,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return RoutineService.generate_user_routine(db, input_data, current_user)


# 2. GET /routine/me - Get current user's skincare routine
@router.get(
    "/routine/me",
    response_model=RoutineGroupResponse,
    status_code=status.HTTP_200_OK,
    summary="Get My Skincare Routine",
    description="Retrieves active Morning, Evening, Weekly, and Seasonal routines for the currently authenticated user."
)
@router.get(
    "/api/routine/me",
    response_model=RoutineGroupResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
def get_my_routine(
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return RoutineService.get_user_routine(db, current_user.id, current_user)


# 3. GET /routine/patient/{user_id} - Get patient's skincare routine for Doctor / Consultant
@router.get(
    "/routine/patient/{user_id}",
    response_model=RoutineGroupResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Patient Routine (Doctor/Consultant)",
    description="Allows dermatologists and consultants to inspect assigned patient routines."
)
@router.get(
    "/api/routine/patient/{user_id}",
    response_model=RoutineGroupResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
def get_patient_routine(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return RoutineService.get_user_routine(db, user_id, current_user)


# 4. PUT /routine/{id} - Update Routine Step or add Clinical Doctor Notes
@router.put(
    "/routine/{id}",
    response_model=RoutineStepSchema,
    status_code=status.HTTP_200_OK,
    summary="Update Routine Step & Add Clinical Notes",
    description="Allows authorized users, consultants, or dermatologists to customize routine steps, active ingredients, or add clinical notes."
)
@router.put(
    "/api/routine/{id}",
    response_model=RoutineStepSchema,
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
def update_routine_step(
    id: int,
    update_data: RoutineUpdateRequest,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return RoutineService.update_routine_step(db, id, update_data, current_user)


# 5. GET /routine/stats - Get Routine Data Traffic & Platform Statistics (Admin)
@router.get(
    "/routine/stats",
    response_model=RoutineStatsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Routine Traffic Statistics",
    description="Returns platform-wide routine generation count, step breakdowns, active users, and traffic status."
)
@router.get(
    "/api/routine/stats",
    response_model=RoutineStatsResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
def get_routine_stats(
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return RoutineService.get_stats(db, current_user)
