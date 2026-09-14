from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    category: str
    priority: str
    title: str
    message: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationCreate(BaseModel):
    category: str = "ROUTINE"
    priority: str = "MEDIUM"
    title: str
    message: str


class ReminderSettingResponse(BaseModel):
    id: int
    user_id: int
    reminder_type: str
    enabled: bool
    time_of_day: str
    recurrence: str

    model_config = ConfigDict(from_attributes=True)


class ReminderSettingCreate(BaseModel):
    reminder_type: str
    enabled: bool = True
    time_of_day: str = "08:00"
    recurrence: str = "DAILY"


class ReportSummaryResponse(BaseModel):
    generated_at: datetime
    patient: Any
    profile: Any
    latest_assessment: Any
    adherence: Any
    recommendations_summary: Any
    consultation_history: Any

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 4. SKIN HEALTH SCORING ENGINE (PHASE 7)
# ==========================================

class SkinHealthFactorDetail(BaseModel):
    name: str
    score: float
    weight: float
    weighted_contribution: float
    status: str
    description: str


class SkinHealthFactorsMap(BaseModel):
    skin_condition: SkinHealthFactorDetail
    lifestyle: SkinHealthFactorDetail
    sleep_quality: SkinHealthFactorDetail
    routine_consistency: SkinHealthFactorDetail
    hydration: SkinHealthFactorDetail


class SkinHealthScoreResponse(BaseModel):
    overall_score: float
    risk_level: str
    status_label: str
    interpretation: str
    summary: str
    factors: SkinHealthFactorsMap
    weights_total: float
    calculation_version: str
    evaluated_at: str
    disclaimer: str
    profile_completeness: Optional[float] = None
    confidence_level: Optional[str] = None
    missing_items: Optional[List[str]] = None
    skin_type_context: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


