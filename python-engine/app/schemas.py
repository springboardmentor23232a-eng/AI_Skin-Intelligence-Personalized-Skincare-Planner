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

# Routine Generation Schemas
class RoutineStepSchema(BaseModel):
    step_order: int
    category: str
    step_name: str
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    product_recommendations: Optional[List[str]] = None

class RoutineRequest(BaseModel):
    user_id: str
    assessment_id: Optional[str] = None
    routine_type: str  # morning, evening, weekly, seasonal
    skin_type: Optional[str] = None
    skin_concerns: Optional[List[str]] = None
    skin_health_score: Optional[int] = None
    allergies: Optional[List[str]] = None
    lifestyle_factors: Optional[dict] = None
    season: Optional[str] = None  # for seasonal routines

class RoutineResponse(BaseModel):
    id: str
    user_id: str
    assessment_id: Optional[str] = None
    routine_name: str
    routine_type: str
    routine_steps: List[RoutineStepSchema]
    personalized_factors: dict
    products: List[str]
    created_at: datetime
    updated_at: datetime

class RoutineUpdateRequest(BaseModel):
    routine_name: Optional[str] = None
    routine_steps: Optional[List[RoutineStepSchema]] = None
    personalized_factors: Optional[dict] = None
    products: Optional[List[str]] = None

class AIPersonalizationRequest(BaseModel):
    skin_type: str
    skin_concerns: List[str]
    skin_health_score: int
    allergies: List[str]
    lifestyle_factors: dict
    routine_type: str
    season: Optional[str] = None
    previous_assessment_results: Optional[dict] = None

class AIPersonalizationResponse(BaseModel):
    routine_steps: List[RoutineStepSchema]
    personalized_recommendations: str
    product_suggestions: List[str]
    lifestyle_tips: List[str]
