from pydantic import BaseModel, EmailStr
from typing import Any, Dict, List, Optional
from datetime import datetime


class UserCreate(BaseModel):
    full_name: Optional[str] = None
    name: Optional[str] = None
    email: EmailStr
    password: str
    role: Optional[str] = "USER"
    provider: Optional[str] = "LOCAL"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None

class GoogleAuthRequest(BaseModel):
    id_token: Optional[str] = None
    email: EmailStr
    name: Optional[str] = "Google User"
    full_name: Optional[str] = None
    role: Optional[str] = "USER"
    provider: Optional[str] = "GOOGLE"

class UserResponse(BaseModel):
    id: int
    full_name: Optional[str] = None
    email: EmailStr
    role: Optional[str] = "USER"
    provider: Optional[str] = "LOCAL"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: Optional[str] = "USER"
    email: Optional[str] = None
    full_name: Optional[str] = None
    provider: Optional[str] = "LOCAL"


class AssessmentCreate(BaseModel):
    age: int
    gender: Optional[str] = None
    hydration_level: Optional[str] = None
    oil_level: Optional[str] = None
    sensitivity: Optional[str] = None
    humidity: Optional[float] = None
    temperature: Optional[float] = None

    sleep_hours: Optional[float] = None
    sleep_quality: Optional[str] = None
    water_glasses: Optional[float] = None
    lifestyle_habits: Optional[Dict[str, Any]] = None
    allergies: Optional[List[str]] = None

    predicted_skin_type: str
    health_score: int
    overall_condition: str

    vision_predicted_concern: Optional[str] = None
    vision_confidence: Optional[str] = None

    concerns: Optional[List[str]] = None
    priority_order: Optional[List[str]] = None
    risk_factors: Optional[List[str]] = None
    recommendations: Optional[Dict[str, Any]] = None


class AssessmentUpdate(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    hydration_level: Optional[str] = None
    oil_level: Optional[str] = None
    sensitivity: Optional[str] = None
    humidity: Optional[float] = None
    temperature: Optional[float] = None

    sleep_hours: Optional[float] = None
    sleep_quality: Optional[str] = None
    water_glasses: Optional[float] = None
    lifestyle_habits: Optional[Dict[str, Any]] = None
    allergies: Optional[List[str]] = None

    predicted_skin_type: Optional[str] = None
    health_score: Optional[int] = None
    overall_condition: Optional[str] = None

    vision_predicted_concern: Optional[str] = None
    vision_confidence: Optional[str] = None

    concerns: Optional[List[str]] = None
    priority_order: Optional[List[str]] = None
    risk_factors: Optional[List[str]] = None
    recommendations: Optional[Dict[str, Any]] = None

class AssessmentResponse(BaseModel):
    id: int
    user_id: int

    age: int
    gender: Optional[str] = None
    hydration_level: Optional[str] = None
    oil_level: Optional[str] = None
    sensitivity: Optional[str] = None
    humidity: Optional[str] = None
    temperature: Optional[str] = None

    sleep_hours: Optional[float] = None
    sleep_quality: Optional[str] = None
    water_glasses: Optional[float] = None
    lifestyle_habits: Optional[Dict[str, Any]] = None
    allergies: Optional[List[str]] = None

    predicted_skin_type: str
    health_score: int
    overall_condition: str

    vision_predicted_concern: Optional[str] = None
    vision_confidence: Optional[str] = None

    concerns: Optional[List[str]] = None
    priority_order: Optional[List[str]] = None
    risk_factors: Optional[List[str]] = None
    recommendations: Optional[Dict[str, Any]] = None

    assessment_time: datetime

    class Config:
        from_attributes = True

class RoutineUpdate(BaseModel):
    routine_data: Dict[str, Any]