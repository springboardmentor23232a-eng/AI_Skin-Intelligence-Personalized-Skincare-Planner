from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class SkinConcernOut(BaseModel):
    id: UUID
    assessment_id: UUID
    concern_name: str
    severity: str
    priority: int

    model_config = ConfigDict(from_attributes=True)


class RiskFactorOut(BaseModel):
    id: UUID
    assessment_id: UUID
    risk_name: str
    description: str | None = None
    risk_level: str | None = None

    model_config = ConfigDict(from_attributes=True)


class AssessmentOut(BaseModel):
    id: UUID
    user_id: UUID
    condition_score: float | None = None
    created_at: datetime

    concerns: list[SkinConcernOut] = []
    risk_factors: list[RiskFactorOut] = []

    model_config = ConfigDict(from_attributes=True)


class AssessmentUpdate(BaseModel):
    condition_score: float | None = None


class AssessmentScoreOut(BaseModel):
    score: float | None = None


class AssessmentRisksOut(BaseModel):
    risk_factors: list[RiskFactorOut] = []