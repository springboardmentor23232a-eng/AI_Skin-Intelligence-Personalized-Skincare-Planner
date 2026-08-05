from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Full Name of the user")
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., min_length=6, description="Password (min 6 characters)")
    role: Optional[str] = Field("USER", description="Desired role (USER, CONSULTANT, DOCTOR, ADMIN)")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., description="Password")

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
