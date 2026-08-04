from datetime import datetime
from typing import List, Optional, Union
from pydantic import BaseModel, Field, ConfigDict

# --- Input Schemas ---

class SkinAssessmentInput(BaseModel):
    skin_type: Optional[str] = Field("Normal", description="Skin Type: Normal, Dry, Oily, Combination, Sensitive")
    oiliness: Optional[str] = Field("Low", description="Oiliness: Low, Medium, High")
    dryness: Optional[str] = Field("Low", description="Dryness: Low, Medium, High")
    acne: Optional[str] = Field("None", description="Acne Level: None, Mild, Moderate, Severe")
    pigmentation: Optional[str] = Field("None", description="Pigmentation Level: None, Mild, Moderate, Severe")
    redness: Optional[str] = Field("None", description="Redness Level: None, Mild, Moderate, Severe")
    wrinkles: Optional[str] = Field("None", description="Wrinkles Level: None, Mild, Moderate, Severe")
    dark_spots: Optional[str] = Field("None", description="Dark Spots: None, Mild, Moderate, Severe")
    sun_exposure: Optional[str] = Field("Moderate", description="Sun Exposure: Low, Moderate, High")
    water_intake: Optional[float] = Field(2.0, ge=0, le=10, description="Water Intake in Liters/Day")
    sleep_hours: Optional[float] = Field(7.0, ge=0, le=24, description="Sleep Hours per Night")
    stress_level: Optional[str] = Field("Low", description="Stress Level: Low, Medium, High")
    smoking: Union[bool, str] = Field(False, description="Smoking status: True/False or 'Yes'/'No'")
    alcohol: Optional[str] = Field("None", description="Alcohol: None, Occasional, Regular")
    age: Optional[int] = Field(25, ge=1, le=120, description="User Age")
    notes: Optional[str] = Field(None, description="Optional notes, diagnosis, or recommendations")

class AssessmentCreate(SkinAssessmentInput):
    pass

class AssessmentUpdate(BaseModel):
    notes: Optional[str] = Field(None, description="Updated notes, recommendations, or prescription")
    overall_condition: Optional[str] = Field(None, description="Updated condition rating")
    skin_health_score: Optional[int] = Field(None, ge=0, le=100, description="Updated health score")

# --- Output Schemas ---

class SkinConcernSchema(BaseModel):
    id: Optional[int] = None
    concern_name: str
    severity: str  # Low, Medium, High
    priority: str  # Low, Medium, High, Critical

    model_config = ConfigDict(from_attributes=True)

class RiskFactorSchema(BaseModel):
    id: Optional[int] = None
    risk_name: str
    description: str
    risk_level: str  # Low, Medium, High, Critical

    model_config = ConfigDict(from_attributes=True)

class SkinAssessmentResponse(BaseModel):
    id: int
    user_id: int
    assessment_date: datetime
    skin_health_score: int
    overall_condition: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    concerns: List[SkinConcernSchema] = []
    risks: List[RiskFactorSchema] = []

    model_config = ConfigDict(from_attributes=True)

class HealthScoreResponse(BaseModel):
    user_id: int
    latest_score: int
    overall_condition: str
    assessment_date: Optional[datetime] = None

class RiskAnalysisResponse(BaseModel):
    user_id: int
    assessment_id: Optional[int] = None
    latest_risks: List[RiskFactorSchema] = []
    assessment_date: Optional[datetime] = None

class AssessmentStatsResponse(BaseModel):
    total_assessments: int
    average_score: float
    condition_counts: dict
