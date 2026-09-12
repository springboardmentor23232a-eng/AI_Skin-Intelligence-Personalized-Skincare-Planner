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
    email_verified: bool = False
    email_verified_at: Optional[datetime] = None
    phone_number: Optional[str] = None
    phone_verified: bool = False
    phone_verified_at: Optional[datetime] = None
    is_active: int = 1
    is_blocked: int = 0
    is_verified: int = 1
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

class VerifyEmailRequest(BaseModel):
    token: str

class ResendVerificationRequest(BaseModel):
    email: Optional[EmailStr] = None

class SendPhoneOtpRequest(BaseModel):
    phone_number: str

class VerifyPhoneOtpRequest(BaseModel):
    phone_number: str
    otp: str

class VerificationStatusResponse(BaseModel):
    email: str
    email_verified: bool
    email_verified_at: Optional[datetime] = None
    phone_number: Optional[str] = None
    phone_verified: bool = False
    phone_verified_at: Optional[datetime] = None
    sms_provider_configured: bool = False
    sms_provider_name: str = "CONSOLE"
