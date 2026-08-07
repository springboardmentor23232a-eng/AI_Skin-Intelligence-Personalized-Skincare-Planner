from pydantic import BaseModel
from datetime import datetime


# ==========================
# Assessment Schemas
# ==========================

class AssessmentCreate(BaseModel):
    user_id: int
    skin_health_score: int
    overall_condition: str
    notes: str


class AssessmentResponse(BaseModel):
    id: int
    user_id: int
    assessment_date: datetime
    skin_health_score: int
    overall_condition: str
    notes: str
    created_at: datetime

    class Config:
        from_attributes = True



# ==========================
# Skin Concern Schemas
# ==========================

class SkinConcernCreate(BaseModel):
    assessment_id: int
    concern_name: str
    severity: str
    priority: str



# ==========================
# Risk Factor Schemas
# ==========================

class RiskFactorCreate(BaseModel):
    assessment_id: int
    risk_name: str
    description: str
    risk_level: str



# ==========================
# User Schemas
# ==========================

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str = "USER"



class UserLogin(BaseModel):
    email: str
    password: str



class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    provider: str

    class Config:
        from_attributes = True



# ==========================
# JWT Token Schema
# ==========================

class TokenResponse(BaseModel):
    access_token: str
    token_type: str



# ==========================
# Profile Update Schema
# ==========================

class ProfileUpdate(BaseModel):
    name: str