from typing import Optional, List, Dict
from pydantic import BaseModel, Field

class ScoreCalculationInput(BaseModel):
    user_id: Optional[int] = Field(None, description="User ID for persisting history")
    
    # 1. Skin Condition Assessment Inputs (35%)
    acne_severity: Optional[str] = Field("None", description="None, Mild, Moderate, Severe")
    pigmentation: Optional[str] = Field("None", description="None, Mild, Moderate, Severe")
    dark_spots: Optional[str] = Field("None", description="None, Mild, Moderate, Severe")
    redness_level: Optional[str] = Field("None", description="None, Mild, Moderate, Severe")
    wrinkles: Optional[str] = Field("None", description="None, Mild, Moderate, Severe")
    oiliness: Optional[str] = Field("Low", description="Low, Medium, High")
    dryness: Optional[str] = Field("Low", description="Low, Medium, High")

    # 2. Lifestyle Habits Inputs (20%)
    stress_level: Optional[str] = Field("Low", description="Low, Medium, High")
    sun_exposure: Optional[str] = Field("Moderate", description="Low, Moderate, High")
    smoking: Optional[bool] = Field(False, description="True if smoker")
    alcohol: Optional[str] = Field("None", description="None, Occasional, Regular")

    # 3. Sleep Quality Inputs (15%)
    sleep_hours: Optional[float] = Field(7.5, description="Sleep duration in hours per night")

    # 4. Routine Consistency Inputs (20%)
    routine_consistency_pct: Optional[float] = Field(85.0, description="Routine adherence percentage 0 - 100%")

    # 5. Hydration Level Inputs (10%)
    water_intake_liters: Optional[float] = Field(2.5, description="Daily water intake in Liters")

    # Previous baseline score for calculating improvement delta
    previous_score: Optional[int] = Field(None, description="Previous overall score for delta calculation")


class SubScoreBreakdown(BaseModel):
    name: str
    weight_pct: float
    raw_score: int
    weighted_contribution: float
    status: str
    feedback: str


class SkinImprovementScore(BaseModel):
    previous_score: Optional[int]
    current_score: int
    delta: int
    percentage_change: float
    improvement_status: str
    primary_driver: str


class ScoreCalculationResponse(BaseModel):
    overall_skin_health_score: int
    score_rating: str
    sub_scores: Dict[str, SubScoreBreakdown]
    improvement: SkinImprovementScore
    recommendations: List[str]
