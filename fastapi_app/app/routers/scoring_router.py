from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.engine.scoring_engine import SkinHealthScoringEngine
from app.models.scoring import SkinHealthScoreRecord
from app.schemas.scoring import (
    ScoreCalculationInput, ScoreCalculationResponse
)

router = APIRouter(prefix="", tags=["Skin Health Scoring Engine"])

@router.post(
    "/score/calculate",
    response_model=ScoreCalculationResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate Weighted Skin Health Score",
    description="Evaluates 5-factor weighted scoring model (Skin Condition 35%, Lifestyle 20%, Sleep 15%, Routine Consistency 20%, Hydration 10%) and calculates score improvement delta."
)
def calculate_score(
    input_data: ScoreCalculationInput,
    db: Session = Depends(get_db)
):
    result = SkinHealthScoringEngine.calculate_weighted_score(input_data)
    
    # Optionally persist score if user_id is supplied
    if input_data.user_id is not None:
        try:
            record = SkinHealthScoreRecord(
                user_id=input_data.user_id,
                overall_score=result.overall_skin_health_score,
                skin_condition_score=result.sub_scores["skin_condition"].raw_score,
                lifestyle_score=result.sub_scores["lifestyle"].raw_score,
                sleep_score=result.sub_scores["sleep"].raw_score,
                routine_consistency_score=result.sub_scores["routine_consistency"].raw_score,
                hydration_score=result.sub_scores["hydration"].raw_score,
                score_rating=result.score_rating,
                improvement_delta=result.improvement.delta,
                improvement_pct=result.improvement.percentage_change,
                notes=result.improvement.primary_driver
            )
            db.add(record)
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"[Warning] Could not persist skin health score: {e}")

    return result


@router.get(
    "/score/breakdown",
    response_model=ScoreCalculationResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Sample Score Breakdown",
    description="Returns a sample score breakdown and clinical assessment for demonstration."
)
def get_sample_score_breakdown():
    sample_input = ScoreCalculationInput(
        acne_severity="Mild",
        pigmentation="None",
        dark_spots="Mild",
        redness_level="Low",
        wrinkles="None",
        oiliness="Medium",
        dryness="Low",
        stress_level="Low",
        sun_exposure="Moderate",
        smoking=False,
        alcohol="Occasional",
        sleep_hours=7.5,
        routine_consistency_pct=85.0,
        water_intake_liters=2.5,
        previous_score=75
    )
    return SkinHealthScoringEngine.calculate_weighted_score(sample_input)
