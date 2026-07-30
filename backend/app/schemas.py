from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    full_name: Optional[str] = None
    name: Optional[str] = None
    email: EmailStr
    password: str
    role: Optional[str] = "USER"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: Optional[str] = None
    email: EmailStr
    role: Optional[str] = "USER"

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str