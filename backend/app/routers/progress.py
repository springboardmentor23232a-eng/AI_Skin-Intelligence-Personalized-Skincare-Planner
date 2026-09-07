from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.dependencies.auth import get_current_user
from app.schemas import (
    ProgressSummaryResponse,
    ProgressTrendsResponse,
    AdherenceAnalyticsResponse,
    SnapshotComparisonResponse,
    SnapshotItem
)
from app.services import progress_service
from app.logging_config import logger

router = APIRouter(prefix="/api/progress", tags=["Progress Tracking & Analytics"])


@router.get("/summary", response_model=ProgressSummaryResponse)
async def get_progress_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves the user's progress tracking KPI summary, recent score deltas,
    and routine compliance rates from real PostgreSQL historical records.
    """
    logger.info(f"API Module 8 GET /api/progress/summary: user={current_user.email}")
    return progress_service.get_progress_summary(db, current_user)


@router.get("/trends", response_model=ProgressTrendsResponse)
async def get_progress_trends(
    range: str = Query("30d", regex="^(7d|30d|3m|6m|all)$", description="Date range: 7d, 30d, 3m, 6m, all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves chronological trend data points for Overall Health Score,
    Skin Condition Score, Routine Adherence %, and concern severity trends.
    """
    logger.info(f"API Module 8 GET /api/progress/trends: user={current_user.email}, range={range}")
    return progress_service.get_progress_trends(db, current_user, time_range=range)


@router.get("/adherence", response_model=AdherenceAnalyticsResponse)
async def get_adherence_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns comprehensive routine consistency analytics (daily, weekly, monthly rates,
    completed vs missed steps, AM vs PM adherence).
    """
    logger.info(f"API Module 8 GET /api/progress/adherence: user={current_user.email}")
    return progress_service.get_adherence_analytics(db, current_user)


@router.get("/comparison", response_model=Optional[SnapshotComparisonResponse])
async def get_progress_comparison(
    earlier_id: Optional[int] = Query(None, description="Earlier snapshot record ID"),
    later_id: Optional[int] = Query(None, description="Later snapshot record ID"),
    type: str = Query("assessment", regex="^(assessment|health_score)$", description="Type of record to compare"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Compares two historical snapshots side-by-side, analyzing delta changes
    in diagnostic scores, skin concern severities, and risk factors.
    """
    logger.info(f"API Module 8 GET /api/progress/comparison: user={current_user.email}, earlier={earlier_id}, later={later_id}, type={type}")
    comparison = progress_service.get_comparison_data(
        db=db,
        user=current_user,
        earlier_id=earlier_id,
        later_id=later_id,
        snapshot_type=type
    )
    return comparison


@router.get("/snapshots", response_model=List[SnapshotItem])
async def get_available_snapshots(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns a list of all available historical assessment scans and health score snapshots
    for populating comparison dropdown selectors.
    """
    logger.info(f"API Module 8 GET /api/progress/snapshots: user={current_user.email}")
    return progress_service.get_available_snapshots(db, current_user)
