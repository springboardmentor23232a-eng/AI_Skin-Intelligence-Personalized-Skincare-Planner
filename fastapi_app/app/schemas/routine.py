from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from datetime import datetime

class RoutineGenerateInput(BaseModel):
    skin_type: Optional[str] = Field(default="Normal", description="Skin Type (Oily, Dry, Combination, Sensitive, Normal)")
    primary_concern: Optional[str] = Field(default="General Maintenance", description="Primary Concern (Acne, Hyperpigmentation, Dryness, Wrinkles, Redness)")
    season: Optional[str] = Field(default="Summer", description="Target Season (Summer, Winter, Spring, Autumn)")
    age_group: Optional[str] = Field(default="18-24", description="Age group")
    sensitivities: Optional[str] = Field(default="None", description="Known sensitivities or allergies")

class RoutineStepSchema(BaseModel):
    id: Optional[int] = None
    user_id: int
    time_of_day: str  # MORNING, EVENING, WEEKLY, SEASONAL
    step_number: int
    category: str  # CLEANSER, EXFOLIATION, TREATMENT, MOISTURIZER, SUN_PROTECTION, NIGHT_CARE, MASK, SEASONAL_CARE
    step_name: str
    instructions: str
    recommended_ingredient: Optional[str] = None
    season: Optional[str] = "ALL_SEASONS"
    created_by_role: Optional[str] = "SYSTEM_AI"
    doctor_notes: Optional[str] = None
    is_active: Optional[bool] = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RoutineGroupResponse(BaseModel):
    user_id: int
    skin_type: str
    season: str
    morning_routine: List[RoutineStepSchema]
    evening_routine: List[RoutineStepSchema]
    weekly_treatment: List[RoutineStepSchema]
    seasonal_recommendations: List[RoutineStepSchema]

class RoutineUpdateRequest(BaseModel):
    step_name: Optional[str] = None
    instructions: Optional[str] = None
    recommended_ingredient: Optional[str] = None
    doctor_notes: Optional[str] = None
    is_active: Optional[bool] = None

class RoutineStatsResponse(BaseModel):
    total_routines_generated: int
    morning_steps_count: int
    evening_steps_count: int
    weekly_steps_count: int
    seasonal_steps_count: int
    active_users_count: int
    traffic_status: str
