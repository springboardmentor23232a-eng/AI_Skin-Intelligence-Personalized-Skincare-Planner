from datetime import datetime, date
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class SkincareLogCreate(BaseModel):
    routine_type: str
    logged_date: Optional[date] = None
    completed: bool = True
    notes: Optional[str] = None


class SkincareLogResponse(BaseModel):
    id: int
    user_id: int
    routine_type: str
    logged_date: date
    completed: bool
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SkinProgressPhotoCreate(BaseModel):
    photo_url: Optional[str] = None
    notes: Optional[str] = None
    associated_assessment_id: Optional[int] = None


class SkinProgressPhotoResponse(BaseModel):
    id: int
    user_id: int
    logged_at: datetime
    photo_url: Optional[str] = None
    notes: Optional[str] = None
    associated_assessment_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class SkinHealthTrendPoint(BaseModel):
    logged_at: datetime
    overall_score: int
    improvement_delta: Optional[int] = 0
    acne: int
    hyperpigmentation: int
    dryness: int
    oiliness: int
    redness: int
    sensitivity: int

    model_config = ConfigDict(from_attributes=True)


class SkinHealthTrendsResponse(BaseModel):
    trends: List[SkinHealthTrendPoint]
