from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import (
    ProgressCheckpointCreateRequest,
    ProgressHistoryResponse,
    DailyAdherenceCheckInRequest,
    RoutineAdherenceAnalyticsResponse,
    BeforeAfterCompareRequest,
    BeforeAfterCompareResponse,
    TrendAnalysisResponse,
    ImprovementAnalysisResponse,
    ProgressSummaryAnalyticsResponse
)
from app.services.progress_analytics_engine import (
    get_user_progress_history,
    create_progress_checkpoint,
    get_routine_adherence_analytics,
    record_daily_adherence_checkin,
    calculate_before_after_comparison,
    compute_trend_analysis,
    generate_improvement_analysis,
    get_progress_summary_dashboard
)

router = APIRouter(
    tags=["Module 8: Progress Tracking & Analytics"]
)


@router.get("/history/{user_id}", response_model=ProgressHistoryResponse)
def get_progress_history(user_id: int, db: Session = Depends(get_db)):
    """
    Module 8: Retrieve chronological progress timeline of skin scan checkpoints.
    """
    res = get_user_progress_history(user_id=user_id, db=db)
    return res


@router.post("/log", status_code=status.HTTP_201_CREATED)
def record_progress_checkpoint(payload: ProgressCheckpointCreateRequest, db: Session = Depends(get_db)):
    """
    Module 8: Record a new skin progress evaluation checkpoint.
    """
    res = create_progress_checkpoint(payload.model_dump(), db=db)
    return res


@router.get("/adherence/{user_id}", response_model=RoutineAdherenceAnalyticsResponse)
def get_routine_adherence(user_id: int, db: Session = Depends(get_db)):
    """
    Module 8: Retrieve 30-day compliance calendar, active streaks, and adherence-to-score correlation.
    """
    res = get_routine_adherence_analytics(user_id=user_id, db=db)
    return res


@router.post("/adherence/checkin", status_code=status.HTTP_200_OK)
def log_daily_routine_checkin(payload: DailyAdherenceCheckInRequest, db: Session = Depends(get_db)):
    """
    Module 8: Log daily AM/PM checklist completion and update active streak.
    """
    res = record_daily_adherence_checkin(payload.model_dump(), db=db)
    return res


@router.post("/compare", response_model=BeforeAfterCompareResponse)
def compare_before_after(payload: BeforeAfterCompareRequest, db: Session = Depends(get_db)):
    """
    Module 8: Compare two progress scan milestones with optical biomarker differences & clinical verdict.
    """
    res = calculate_before_after_comparison(
        user_id=payload.user_id or 1,
        baseline_id=payload.baseline_checkpoint_id,
        current_id=payload.current_checkpoint_id,
        db=db
    )
    return res


@router.get("/trends/{user_id}", response_model=TrendAnalysisResponse)
def get_skin_trends(
    user_id: int,
    timeframe: str = Query("30d", enum=["7d", "30d", "90d", "all"]),
    db: Session = Depends(get_db)
):
    """
    Module 8: Retrieve 60-day historical health curves with 30-day predictive AI forecast line.
    """
    res = compute_trend_analysis(user_id=user_id, timeframe=timeframe, db=db)
    return res


@router.get("/improvement-analysis/{user_id}", response_model=ImprovementAnalysisResponse)
def get_improvement_analysis(user_id: int, db: Session = Depends(get_db)):
    """
    Module 8: Generate clinical improvement analysis, positive drivers vs risk factors, and next-phase prescription.
    """
    res = generate_improvement_analysis(user_id=user_id, db=db)
    return res


@router.get("/summary/{user_id}", response_model=ProgressSummaryAnalyticsResponse)
def get_progress_summary(user_id: int, db: Session = Depends(get_db)):
    """
    Module 8: Executive summary progress dashboard payload.
    """
    res = get_progress_summary_dashboard(user_id=user_id, db=db)
    return res
