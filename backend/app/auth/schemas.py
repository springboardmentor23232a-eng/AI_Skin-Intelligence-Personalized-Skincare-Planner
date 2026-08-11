from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: Optional[str] = "USER"

# Alias for UserCreate compatibility
UserCreate = RegisterRequest

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    provider: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class GoogleAuthRequest(BaseModel):
    credential: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class GenericMessage(BaseModel):
    message: str
