from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

class UserRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Full Name of the user")
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., min_length=6, description="Password (min 6 characters)")
    role: Optional[str] = Field("USER", description="Desired role (USER, CONSULTANT, DOCTOR, ADMIN)")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., description="Password")
    role: Optional[str] = Field(None, description="The selected login role option")

class UserResponse(BaseModel):
    id: int
    name: Optional[str] = None
    email: EmailStr
    role: str
    provider: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str

class ProfileUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Updated Full Name")

class GoogleAuthRequest(BaseModel):
    token: str = Field(..., description="Google client ID token")


# --- Module 3: Skin Assessment Schemas ---

class SkinConcernResponse(BaseModel):
    id: int
    concern_name: str
    severity: float
    priority: str

    class Config:
        from_attributes = True

class RiskFactorResponse(BaseModel):
    id: int
    risk_name: str
    description: str
    risk_level: str

    class Config:
        from_attributes = True

class SkinAssessmentResponse(BaseModel):
    id: int
    user_id: int
    assessment_date: datetime
    skin_health_score: int
    overall_condition: str
    notes: Optional[str] = None
    created_at: datetime
    concerns: List[SkinConcernResponse] = []
    risks: List[RiskFactorResponse] = []

    class Config:
        from_attributes = True

class SkinAssessmentHistoryResponse(BaseModel):
    id: int
    assessment_date: datetime
    skin_health_score: int
    overall_condition: str
    concerns_count: int
    risks_count: int

    class Config:
        from_attributes = True

class AssessmentUpdateNotesRequest(BaseModel):
    notes: str = Field(..., max_length=500, description="Updated assessment notes")
