from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, SkinHealthScoreRecord, DailyChecklistLog
from app.dependencies.auth import get_current_user
from app.schemas import (
    SkinHealthScoreResponse,
    ScoreHistoryItem,
    ChecklistLogCreate,
    ChecklistLogResponse
)
from app.services.health_score_service import (
    get_or_create_current_score,
    evaluate_overall_skin_health
)
from app.logging_config import logger

router = APIRouter(prefix="/api/score", tags=["Skin Health Scoring Engine"])


@router.get("/current", response_model=SkinHealthScoreResponse)
async def get_current_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves the user's latest calculated Overall Skin Health Score and component breakdown.
    If no score has been recorded yet, calculates and persists the initial baseline score.
    Does not create duplicate history snapshots on normal page visits.
    """
    logger.info(f"API Module 7 GET /api/score/current: user={current_user.email}")
    score_data = get_or_create_current_score(db, current_user)
    return score_data


@router.post("/calculate", response_model=SkinHealthScoreResponse)
async def recalculate_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Explicitly recalculates the user's 5-component weighted Skin Health Score
    and appends a new record snapshot into PostgreSQL score history.
    """
    logger.info(f"API Module 7 POST /api/score/calculate (Recalculation trigger): user={current_user.email}")
    score_data = evaluate_overall_skin_health(db, current_user, persist=True)
    return score_data


@router.get("/history", response_model=List[ScoreHistoryItem])
async def get_score_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns the chronological history logs of the user's skin health scores,
    enabling improvement trend visualizations and timeline tracking.
    """
    logger.info(f"API Module 7 GET /api/score/history: user={current_user.email}")
    records = db.query(SkinHealthScoreRecord)\
        .filter(SkinHealthScoreRecord.user_id == current_user.id)\
        .order_by(SkinHealthScoreRecord.calculated_at.asc())\
        .all()
    return records


@router.post("/checklist-log", response_model=ChecklistLogResponse, status_code=201)
async def log_checklist_progress(
    payload: ChecklistLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Logs actual daily routine checklist completions to calculate Routine Consistency adherence.
    """
    logger.info(f"API Module 7 POST /api/score/checklist-log: user={current_user.email}, completed={payload.completed_count}/{payload.total_count}")
    rate = payload.completed_count / payload.total_count if payload.total_count > 0 else 0.0
    rate = max(0.0, min(1.0, rate))
    
    log_entry = DailyChecklistLog(
        user_id=current_user.id,
        completed_count=payload.completed_count,
        total_count=payload.total_count,
        completion_rate=rate
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
