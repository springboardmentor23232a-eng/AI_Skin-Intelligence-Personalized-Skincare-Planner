from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class ScoreDataPoint(BaseModel):
    date: str
    skin_score: int
    moisture_level: int
    routine_completed: bool

class ConcernDistribution(BaseModel):
    concern: str
    percentage: float
    count: int

class UserAnalyticsResponse(BaseModel):
    user_id: int
    current_skin_score: int
    score_change_pct: float
    hydration_avg: float
    compliance_rate: float
    total_assessments: int
    total_progress_logs: int
    active_streak_days: int
    score_trajectory: List[ScoreDataPoint]
    top_concerns: List[ConcernDistribution]
    recommendations_summary: List[str]

class SystemAnalyticsResponse(BaseModel):
    total_registered_users: int
    total_assessments_run: int
    total_routines_generated: int
    total_progress_logs: int
    avg_system_skin_score: float
    top_global_concerns: List[ConcernDistribution]
    active_users_7d: int
