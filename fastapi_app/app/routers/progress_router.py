from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.security import get_current_user, AuthenticatedUser
from app.engine.progress_engine import ProgressEngine
from app.schemas.progress import (
    SkinProgressLogCreate, SkinProgressLogResponse, ProgressStatsResponse
)

router = APIRouter(prefix="", tags=["Progress Tracking System"])

# 1. POST /progress/log - Create or update daily progress log
@router.post(
    "/progress/log",
    response_model=SkinProgressLogResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Log Daily Skin Progress",
    description="Records daily skin health score, moisture %, acne/redness levels, routine completion, notes, and photo."
)
def create_progress_log(
    input_data: SkinProgressLogCreate,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return ProgressEngine.create_log(db, current_user.id, input_data)

# 2. GET /progress/history - Get chronological progress logs for logged-in user
@router.get(
    "/progress/history",
    response_model=List[SkinProgressLogResponse],
    status_code=status.HTTP_200_OK,
    summary="Get User Progress Logs History",
    description="Retrieves recent skin progress entries for the logged-in user."
)
def get_progress_history(
    limit: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return ProgressEngine.get_user_logs(db, current_user.id, limit)

# 3. GET /progress/stats - Get streak, averages, compliance rate
@router.get(
    "/progress/stats",
    response_model=ProgressStatsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get User Progress Statistics & Streaks",
    description="Returns completion streak, average score, moisture level, compliance rate, and recent logs."
)
def get_progress_stats(
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return ProgressEngine.get_user_progress_stats(db, current_user.id)
