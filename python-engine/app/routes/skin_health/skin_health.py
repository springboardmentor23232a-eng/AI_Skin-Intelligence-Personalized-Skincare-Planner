"""
Skin Health Scoring API Routes
Handles comprehensive skin health score calculation and tracking
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
from datetime import datetime

from app.database import get_db
from app.models import SkinHealthScore, SkinAssessment, USE_SQLITE
from app.schemas import (
    SkinHealthScoreRequest, SkinHealthScoreResponse,
    ComponentScores, ImprovementMetrics, SkinHealthScoreHistoryResponse
)
from app.engine.skin_health_scoring import scoring_engine
# TEMPORARILY DISABLED FOR TESTING: from app.auth import get_current_user

router = APIRouter()

# Helper function to handle UUID conversion for SQLite
def get_uuid(uuid_str):
    return uuid_str if USE_SQLITE else uuid.UUID(uuid_str)


@router.post("/skin-health/calculate", response_model=SkinHealthScoreResponse)
def calculate_skin_health_score(
    request: SkinHealthScoreRequest, 
    db: Session = Depends(get_db)
    # TEMPORARILY DISABLED FOR TESTING: current_user: dict = Depends(get_current_user)
):
    """
    Calculate a comprehensive skin health score based on component data.
    
    This endpoint calculates a weighted skin health score using:
    - Skin Condition Assessment (35%)
    - Lifestyle Habits (20%)
    - Sleep Quality (15%)
    - Routine Consistency (20%)
    - Hydration Level (10%)
    
    NOTE: Authentication temporarily disabled for testing purposes
    """
    try:
        # TEMPORARILY DISABLED FOR TESTING: Use request user_id
        user_uuid = get_uuid(request.user_id)
        
        # TEMPORARILY DISABLED FOR TESTING: No authentication validation
        
        # Get previous score for comparison
        previous_score_record = db.query(SkinHealthScore).filter(
            SkinHealthScore.user_id == user_uuid
        ).order_by(SkinHealthScore.created_at.desc()).first()
        
        previous_score = previous_score_record.overall_score if previous_score_record else None
        
        # Prepare assessment data
        assessment_data = request.condition_data or {}
        
        # Add any additional lifestyle/sleep/hydration data if provided
        if request.lifestyle_data:
            assessment_data.update(request.lifestyle_data)
        if request.sleep_data:
            assessment_data.update(request.sleep_data)
        if request.hydration_data:
            assessment_data.update(request.hydration_data)
        
        # Prepare routine data
        routine_data = request.routine_data or {}
        
        # Calculate comprehensive score
        score_result = scoring_engine.calculate_comprehensive_score(
            user_id=request.user_id,
            assessment_data=assessment_data,
            routine_data=routine_data,
            previous_score=previous_score
        )
        
        if 'error' in score_result:
            raise HTTPException(status_code=500, detail=f"Score calculation failed: {score_result['error']}")
        
        # Create database record
        assessment_uuid = get_uuid(request.assessment_id) if request.assessment_id else None
        
        db_score = SkinHealthScore(
            user_id=user_uuid,
            assessment_id=assessment_uuid,
            condition_score=score_result['condition_score'],
            lifestyle_score=score_result['lifestyle_score'],
            sleep_score=score_result['sleep_score'],
            routine_score=score_result['routine_score'],
            hydration_score=score_result['hydration_score'],
            overall_score=score_result['overall_score'],
            category=score_result['category'],
            previous_score=previous_score,
            absolute_change=score_result['improvement']['absolute_change'],
            percentage_change=score_result['improvement']['percentage_change'],
            trend=score_result['improvement']['trend'],
            calculation_details=score_result['calculation_details'],
            is_complete=score_result.get('is_complete', False)
        )
        
        db.add(db_score)
        db.commit()
        db.refresh(db_score)
        
        # Prepare response
        return SkinHealthScoreResponse(
            id=str(db_score.id),
            user_id=str(db_score.user_id),
            assessment_id=str(db_score.assessment_id) if db_score.assessment_id else None,
            overall_score=db_score.overall_score,
            category=db_score.category,
            components=ComponentScores(
                condition=db_score.condition_score,
                lifestyle=db_score.lifestyle_score,
                sleep=db_score.sleep_score,
                routine=db_score.routine_score,
                hydration=db_score.hydration_score
            ),
            improvement=ImprovementMetrics(
                absolute_change=db_score.absolute_change,
                percentage_change=db_score.percentage_change,
                trend=db_score.trend
            ),
            calculation_details=db_score.calculation_details,
            is_complete=score_result.get('is_complete', False),
            created_at=db_score.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to calculate skin health score: {str(e)}")


@router.get("/skin-health/current", response_model=SkinHealthScoreResponse)
def get_current_skin_health_score(
    user_id: str,
    db: Session = Depends(get_db)
    # TEMPORARILY DISABLED FOR TESTING: current_user: dict = Depends(get_current_user)
):
    """
    Get the most recent skin health score for a user.
    
    NOTE: Authentication temporarily disabled for testing purposes
    """
    try:
        user_uuid = get_uuid(user_id)
        
        current_score = db.query(SkinHealthScore).filter(
            SkinHealthScore.user_id == user_uuid
        ).order_by(SkinHealthScore.created_at.desc()).first()
        
        if not current_score:
            raise HTTPException(status_code=404, detail="No skin health score found for user")
        
        return SkinHealthScoreResponse(
            id=str(current_score.id),
            user_id=str(current_score.user_id),
            assessment_id=str(current_score.assessment_id) if current_score.assessment_id else None,
            overall_score=current_score.overall_score,
            category=current_score.category,
            components=ComponentScores(
                condition=current_score.condition_score,
                lifestyle=current_score.lifestyle_score,
                sleep=current_score.sleep_score,
                routine=current_score.routine_score,
                hydration=current_score.hydration_score
            ),
            improvement=ImprovementMetrics(
                absolute_change=current_score.absolute_change,
                percentage_change=current_score.percentage_change,
                trend=current_score.trend
            ),
            calculation_details=current_score.calculation_details,
            is_complete=current_score.calculation_details.get('is_complete', False) if current_score.calculation_details else False,
            created_at=current_score.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get current skin health score: {str(e)}")


@router.get("/skin-health/history", response_model=SkinHealthScoreHistoryResponse)
def get_skin_health_score_history(
    user_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
    # TEMPORARILY DISABLED FOR TESTING: current_user: dict = Depends(get_current_user)
):
    """
    Get the skin health score history for a user.
    
    NOTE: Authentication temporarily disabled for testing purposes
    """
    try:
        user_uuid = get_uuid(user_id)
        
        scores = db.query(SkinHealthScore).filter(
            SkinHealthScore.user_id == user_uuid
        ).order_by(SkinHealthScore.created_at.desc()).offset(skip).limit(limit).all()
        
        if not scores:
            return SkinHealthScoreHistoryResponse(
                user_id=user_id,
                scores=[],
                total_count=0,
                average_score=None,
                best_score=None,
                worst_score=None
            )
        
        # Convert to response format
        score_responses = []
        total_score = 0.0
        best_score = 0.0
        worst_score = 100.0
        
        for score in scores:
            score_responses.append(SkinHealthScoreResponse(
                id=str(score.id),
                user_id=str(score.user_id),
                assessment_id=str(score.assessment_id) if score.assessment_id else None,
                overall_score=score.overall_score,
                category=score.category,
                components=ComponentScores(
                    condition=score.condition_score,
                    lifestyle=score.lifestyle_score,
                    sleep=score.sleep_score,
                    routine=score.routine_score,
                    hydration=score.hydration_score
                ),
                improvement=ImprovementMetrics(
                    absolute_change=score.absolute_change,
                    percentage_change=score.percentage_change,
                    trend=score.trend
                ),
                calculation_details=score.calculation_details,
                is_complete=score.calculation_details.get('is_complete', False) if score.calculation_details else False,
                created_at=score.created_at
            ))
            
            # Calculate statistics
            total_score += score.overall_score
            best_score = max(best_score, score.overall_score)
            worst_score = min(worst_score, score.overall_score)
        
        average_score = total_score / len(scores) if scores else None
        
        return SkinHealthScoreHistoryResponse(
            user_id=user_id,
            scores=score_responses,
            total_count=len(score_responses),
            average_score=round(average_score, 2) if average_score else None,
            best_score=best_score,
            worst_score=worst_score
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get skin health score history: {str(e)}")


@router.get("/skin-health/trend")
def get_skin_health_trend(
    user_id: str,
    db: Session = Depends(get_db)
    # TEMPORARILY DISABLED FOR TESTING: current_user: dict = Depends(get_current_user)
):
    """
    Get the trend analysis for a user's skin health scores.
    
    NOTE: Authentication temporarily disabled for testing purposes
    """
    try:
        user_uuid = get_uuid(user_id)
        
        # Get recent scores (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        recent_scores = db.query(SkinHealthScore).filter(
            SkinHealthScore.user_id == user_uuid,
            SkinHealthScore.created_at >= thirty_days_ago
        ).order_by(SkinHealthScore.created_at.asc()).all()
        
        if len(recent_scores) < 2:
            return {
                "user_id": user_id,
                "trend": "Insufficient data",
                "message": "Need at least 2 scores to determine trend",
                "recent_scores_count": len(recent_scores)
            }
        
        # Calculate trend
        first_score = recent_scores[0].overall_score
        last_score = recent_scores[-1].overall_score
        score_change = last_score - first_score
        percentage_change = (score_change / first_score) * 100.0 if first_score != 0 else 0
        
        # Determine overall trend
        if abs(percentage_change) < scoring_engine.TREND_THRESHOLD:
            overall_trend = "Stable"
        elif percentage_change > 0:
            overall_trend = "Improving"
        else:
            overall_trend = "Declining"
        
        # Calculate average trend direction
        improvements = 0
        declines = 0
        stable = 0
        
        for i in range(1, len(recent_scores)):
            change = recent_scores[i].overall_score - recent_scores[i-1].overall_score
            if abs(change) < scoring_engine.TREND_THRESHOLD:
                stable += 1
            elif change > 0:
                improvements += 1
            else:
                declines += 1
        
        return {
            "user_id": user_id,
            "overall_trend": overall_trend,
            "score_change": round(score_change, 2),
            "percentage_change": round(percentage_change, 2),
            "first_score": first_score,
            "last_score": last_score,
            "period_days": 30,
            "total_scores": len(recent_scores),
            "trend_breakdown": {
                "improvements": improvements,
                "declines": declines,
                "stable": stable
            },
            "insights": generate_trend_insights(overall_trend, improvements, declines, stable)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get skin health trend: {str(e)}")


@router.get("/skin-health/{score_id}", response_model=SkinHealthScoreResponse)
def get_skin_health_score_by_id(
    score_id: str,
    db: Session = Depends(get_db)
    # TEMPORARILY DISABLED FOR TESTING: current_user: dict = Depends(get_current_user)
):
    """
    Get a specific skin health score by ID.
    
    NOTE: Authentication temporarily disabled for testing purposes
    """
    try:
        score_uuid = get_uuid(score_id)
        
        score = db.query(SkinHealthScore).filter(
            SkinHealthScore.id == score_uuid
        ).first()
        
        if not score:
            raise HTTPException(status_code=404, detail="Skin health score not found")
        
        # TEMPORARILY DISABLED FOR TESTING: No ownership verification
        
        return SkinHealthScoreResponse(
            id=str(score.id),
            user_id=str(score.user_id),
            assessment_id=str(score.assessment_id) if score.assessment_id else None,
            overall_score=score.overall_score,
            category=score.category,
            components=ComponentScores(
                condition=score.condition_score,
                lifestyle=score.lifestyle_score,
                sleep=score.sleep_score,
                routine=score.routine_score,
                hydration=score.hydration_score
            ),
            improvement=ImprovementMetrics(
                absolute_change=score.absolute_change,
                percentage_change=score.percentage_change,
                trend=score.trend
            ),
            calculation_details=score.calculation_details,
            is_complete=score.calculation_details.get('is_complete', False) if score.calculation_details else False,
            created_at=score.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get skin health score: {str(e)}")


def generate_trend_insights(trend: str, improvements: int, declines: int, stable: int) -> List[str]:
    """
    Generate insights based on trend analysis.
    """
    insights = []
    
    if trend == "Improving":
        insights.append("Your skin health is showing positive improvement over time.")
        if improvements > declines:
            insights.append("You have more improving periods than declining ones - keep up the good work!")
    elif trend == "Declining":
        insights.append("Your skin health has been declining recently.")
        insights.append("Consider reviewing your skincare routine and lifestyle factors.")
    else:
        insights.append("Your skin health has remained stable over the past month.")
        insights.append("Consistency is key - maintain your current routine.")
    
    if improvements > declines * 2:
        insights.append("Strong positive trend detected - your current approach is working well.")
    elif declines > improvements * 2:
        insights.append("Significant decline detected - consider consulting with a skincare professional.")
    
    return insights