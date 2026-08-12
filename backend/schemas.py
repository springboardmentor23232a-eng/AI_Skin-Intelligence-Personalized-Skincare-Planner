from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SkinConcernBase(BaseModel):
    concern_name: str
    severity: Optional[str] = None
    priority: int

class SkinConcernResponse(SkinConcernBase):
    id: int
    assessment_id: int

    class Config:
        from_attributes = True

class RiskFactorBase(BaseModel):
    risk_name: str
    description: Optional[str] = None
    risk_level: Optional[str] = None

class RiskFactorResponse(RiskFactorBase):
    id: int
    assessment_id: int

    class Config:
        from_attributes = True

class SkinAssessmentResponse(BaseModel):
    id: int
    user_id: int
    assessment_date: datetime
    skin_health_score: float
    image_url: Optional[str] = None
    overall_condition: Optional[str] = None
    notes: Optional[str] = None
    concerns: List[SkinConcernResponse] = []
    risk_factors: List[RiskFactorResponse] = []

    class Config:
        from_attributes = True

class AssessmentSummary(BaseModel):
    id: int
    assessment_date: datetime
    skin_health_score: float
    image_url: Optional[str] = None
    overall_condition: Optional[str] = None

    class Config:
        from_attributes = True
