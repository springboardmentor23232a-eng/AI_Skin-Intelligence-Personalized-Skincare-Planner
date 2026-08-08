from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr

from .models import RoleName


# ---------- Auth ----------

class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: RoleName = RoleName.user


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    id_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: RoleName


class RefreshRequest(BaseModel):
    refresh_token: str


# ---------- User / Profile ----------

class UserOut(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    role: RoleName
    phone: Optional[str] = None
    occupation: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    occupation: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None


# ---------- Skin Profile ----------

class SkinProfileIn(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    skin_type: Optional[str] = None
    known_concerns: Optional[str] = None
    allergies: Optional[str] = None
    current_products: Optional[str] = None
    sun_exposure: Optional[str] = None
    sleep_hours_avg: Optional[float] = None
    water_intake_l_avg: Optional[float] = None

    # Lifestyle
    diet: Optional[str] = None
    smoking: Optional[bool] = None
    alcohol: Optional[bool] = None
    exercise: Optional[str] = None
    stress_level: Optional[str] = None
    screen_time_hours: Optional[float] = None

    # Allergies
    allergy_food: Optional[bool] = None
    allergy_cosmetics: Optional[bool] = None
    allergy_medicine: Optional[bool] = None
    allergy_chemical: Optional[bool] = None

    # Sensitivity
    sensitivity_sunlight: Optional[bool] = None
    sensitivity_dust: Optional[bool] = None
    sensitivity_pollution: Optional[bool] = None
    sensitivity_fragrance: Optional[bool] = None
    sensitivity_alcohol: Optional[bool] = None

    # Environmental exposure
    humidity: Optional[str] = None
    pollution_level: Optional[str] = None
    uv_exposure: Optional[str] = None
    outdoor_hours: Optional[float] = None
    climate: Optional[str] = None


class SkinProfileOut(SkinProfileIn):
    id: str
    user_id: str
    updated_at: datetime

    class Config:
        from_attributes = True


# ---------- Assessment ----------

class AssessmentOut(BaseModel):
    id: str
    user_id: str
    image_id: Optional[str]
    processed_image_id: Optional[str] = None
    confidence_score: float = 0.0
    concern_priority: Optional[str] = None
    acne_score: float
    pigmentation_score: float
    wrinkle_score: float
    dryness_score: float
    oiliness_score: float
    redness_score: float
    pores_score: float
    skin_health_score: float
    risk_score: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Recommendations ----------

class RecommendationIn(BaseModel):
    user_id: str
    assessment_id: Optional[str] = None
    product_id: Optional[str] = None
    category: Optional[str] = None
    text: str


class RecommendationOut(RecommendationIn):
    id: str
    created_by_role: str
    created_by_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Products ----------

class ProductIn(BaseModel):
    name: str
    brand: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    ingredients: Optional[str] = None
    price: Optional[float] = None
    suitable_for: Optional[str] = None


class ProductOut(ProductIn):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Appointments ----------

class AppointmentIn(BaseModel):
    provider_id: str
    provider_role: RoleName
    scheduled_at: datetime
    notes: Optional[str] = None


class AppointmentOut(BaseModel):
    id: str
    user_id: str
    provider_id: str
    provider_role: RoleName
    scheduled_at: datetime
    status: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class AppointmentStatusUpdate(BaseModel):
    status: str


# ---------- Consultant / Dermatologist notes ----------

class ConsultantNoteIn(BaseModel):
    user_id: str
    assessment_id: Optional[str] = None
    note: str


class DermatologistNoteIn(BaseModel):
    user_id: str
    assessment_id: Optional[str] = None
    diagnosis: Optional[str] = None
    prescription: Optional[str] = None
    treatment_plan: Optional[str] = None
    follow_up_date: Optional[datetime] = None


# ---------- Messages ----------

class MessageIn(BaseModel):
    receiver_id: str
    text: str


class MessageOut(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    text: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Admin ----------

class RoleUpdate(BaseModel):
    role: RoleName


class ActiveStatusUpdate(BaseModel):
    is_active: bool


class AdminStats(BaseModel):
    total_users: int
    total_consultants: int
    total_dermatologists: int
    total_assessments: int
    total_appointments: int
    avg_skin_health_score: float
    avg_risk_score: float
