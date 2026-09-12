from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class SkinProfileBase(BaseModel):
    full_name: str
    age: int = Field(..., ge=1, le=120)
    gender: str
    skin_type: str
    skin_tone: str
    concerns: List[str] = []
    allergies: Optional[str] = None
    sensitivities: Optional[str] = None
    lifestyle: Optional[str] = "Moderate Activity"
    sleep_quality: Optional[str] = "7-8 Hours"
    water_intake: float = Field(2.0, ge=0.5, le=10.0)
    stress_level: Optional[str] = "Moderate"
    environmental_exposure: Optional[str] = "Urban"
    climate: Optional[str] = "Temperate"
    uv_exposure: Optional[str] = "Moderate"

class SkinProfileCreate(SkinProfileBase):
    pass

class SkinProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    skin_type: Optional[str] = None
    skin_tone: Optional[str] = None
    concerns: Optional[List[str]] = None
    allergies: Optional[str] = None
    sensitivities: Optional[str] = None
    lifestyle: Optional[str] = None
    sleep_quality: Optional[str] = None
    water_intake: Optional[float] = None
    stress_level: Optional[str] = None
    environmental_exposure: Optional[str] = None
    climate: Optional[str] = None
    uv_exposure: Optional[str] = None

class SkinProfileResponse(SkinProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SkinAssessmentCreate(BaseModel):
    acne: int = Field(20, ge=0, le=100)
    hyperpigmentation: int = Field(15, ge=0, le=100)
    dryness: int = Field(30, ge=0, le=100)
    oiliness: int = Field(25, ge=0, le=100)
    redness: int = Field(10, ge=0, le=100)
    sensitivity: int = Field(15, ge=0, le=100)
    wrinkles: int = Field(10, ge=0, le=100)
    fine_lines: int = Field(15, ge=0, le=100)
    dark_spots: int = Field(20, ge=0, le=100)
    uneven_tone: int = Field(20, ge=0, le=100)

class SkinAssessmentResponse(SkinAssessmentCreate):
    id: int
    user_id: int
    overall_score: int
    risk_level: str
    concern_priority: str
    summary: str
    created_at: datetime

    class Config:
        from_attributes = True
