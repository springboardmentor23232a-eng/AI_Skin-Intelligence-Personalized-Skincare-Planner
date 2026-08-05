from pydantic import BaseModel, EmailStr
from typing import Optional
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