from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import date, datetime

class SkinProgressLogCreate(BaseModel):
    skin_score: int = Field(..., ge=0, le=100)
    moisture_level: int = Field(..., ge=0, le=100)
    acne_severity: Optional[str] = "Low"  # None, Low, Medium, High
    redness_level: Optional[str] = "Low"  # None, Low, Medium, High
    routine_completed: Optional[bool] = True
    photo_url: Optional[str] = None
    notes: Optional[str] = None

class SkinProgressLogResponse(BaseModel):
    id: int
    user_id: int
    log_date: date
    skin_score: int
    moisture_level: int
    acne_severity: str
    redness_level: str
    routine_completed: bool
    photo_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProgressStatsResponse(BaseModel):
    total_logs: int
    streak_days: int
    avg_skin_score: float
    avg_moisture_level: float
    compliance_rate_pct: float
    latest_score: int
    score_change_last_30d: int
    recent_logs: List[SkinProgressLogResponse]
