import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


# =========================================================
# REGISTER
# =========================================================

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.user


# =========================================================
# LOGIN
# =========================================================

class UserLogin(BaseModel):
    email: EmailStr
    password: str


# =========================================================
# USER RESPONSE
# =========================================================

class UserOut(BaseModel):
    id: uuid.UUID
    full_name: str
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# =========================================================
# UPDATE ACCOUNT
# =========================================================

class UserUpdate(BaseModel):
    full_name: str
    email: EmailStr


# =========================================================
# CHANGE PASSWORD
# =========================================================

class ChangePassword(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str


# =========================================================
# TOKEN
# =========================================================

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut