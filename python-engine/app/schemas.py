from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class AssessmentRequest(BaseModel):
    age: int = Field(..., ge=0, le=120, description="User's age")
    skin_type: str = Field(..., description="Skin type: oily, dry, combination, normal")
    water_intake: float = Field(..., ge=0, le=10, description="Daily water intake in liters")
    sleep_hours: float = Field(..., ge=0, le=24, description="Daily sleep hours")
    sun_exposure: str = Field(..., description="Sun exposure level: low, medium, high")
    smoking: bool = Field(..., description="Smoking status")
    stress_level: Optional[str] = Field("low", description="Stress level: low, medium, high")

class AssessmentResponse(BaseModel):
    id: str
    user_id: str
    skin_health_score: int
    overall_condition: str
    concerns: List[str]
    priority: str
    risk_factors: List[str]
    assessment_date: datetime
    created_at: datetime
    notes: Optional[str] = None

class AssessmentUpdate(BaseModel):
    age: Optional[int] = Field(None, ge=0, le=120)
    skin_type: Optional[str] = None
    water_intake: Optional[float] = Field(None, ge=0, le=10)
    sleep_hours: Optional[float] = Field(None, ge=0, le=24)
    sun_exposure: Optional[str] = None
    smoking: Optional[bool] = None
    stress_level: Optional[str] = None
    notes: Optional[str] = None

class ConcernResponse(BaseModel):
    id: str
    assessment_id: str
    concern_name: str
    severity: str
    priority: str

class RiskFactorResponse(BaseModel):
    id: str
    assessment_id: str
    risk_name: str
    description: Optional[str]
    risk_level: str

class HistoryResponse(BaseModel):
    assessments: List[AssessmentResponse]
    total_count: int

class SkinTypePredictionResponse(BaseModel):
    success: bool
    skin_type: str
    confidence: float
    message: str

class ClassifierInfoResponse(BaseModel):
    success: bool
    model_loaded: bool
    model_path: str
    supported_classes: List[str]
    input_size: List[int]
