from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict


# ---------------- AUTH / USER ----------------
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: Optional[str] = "user"   # user, consultant, dermatologist, admin (admin creation restricted)
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    full_name: str
    email: EmailStr
    role: str
    is_active: bool
    phone: Optional[str] = None
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user: UserOut


class GoogleOAuthIn(BaseModel):
    id_token: str


# ---------------- SKIN PROFILE ----------------
class SkinProfileIn(BaseModel):
    skin_type: Optional[str] = None
    age_group: Optional[str] = None
    allergies: Optional[str] = None
    sensitivities: Optional[str] = None
    lifestyle_habits: Optional[str] = None
    sleep_quality: Optional[int] = None
    water_intake_liters: Optional[float] = None
    environmental_exposure: Optional[str] = None
    hydration_level: Optional[int] = None


class SkinProfileOut(SkinProfileIn):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    updated_at: datetime


# ---------------- SKIN ASSESSMENT ----------------
class SkinConcernOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    concern_name: str
    severity: str
    priority: int


class RiskFactorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    risk_name: str
    description: Optional[str]
    risk_level: str


class SkinAssessmentCreate(BaseModel):
    notes: Optional[str] = None
    # manual concern input (optional; can be auto-derived from image / profile)
    concerns: Optional[List[str]] = None


class SkinAssessmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    assessment_date: datetime
    skin_health_score: float
    overall_condition: Optional[str]
    detected_skin_type: Optional[str]
    image_path: Optional[str]
    notes: Optional[str]
    concerns: List[SkinConcernOut] = []
    risk_factors: List[RiskFactorOut] = []


class SkinAssessmentUpdate(BaseModel):
    notes: Optional[str] = None
    overall_condition: Optional[str] = None


# ---------------- ROUTINE ----------------
class RoutineStepOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    step_order: int
    category: str
    instruction: str
    product_id: Optional[str] = None


class RoutineOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    routine_type: str
    season: Optional[str]
    generated_at: datetime
    is_active: bool
    steps: List[RoutineStepOut] = []


# ---------------- INGREDIENT ----------------
class IngredientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    category: Optional[str]
    description: Optional[str]
    good_for: Optional[str]
    avoid_if: Optional[str]
    interacts_badly_with: Optional[str]


class IngredientCheckRequest(BaseModel):
    ingredient_names: List[str]


# ---------------- PRODUCT ----------------
class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    brand: Optional[str]
    category: str
    price: float
    suitable_skin_types: Optional[str]
    targets_concerns: Optional[str]
    key_ingredients: Optional[str]
    image_url: Optional[str]


class ProductCreate(BaseModel):
    name: str
    brand: Optional[str] = None
    category: str
    price: float = 0.0
    suitable_skin_types: Optional[str] = None
    targets_concerns: Optional[str] = None
    key_ingredients: Optional[str] = None
    image_url: Optional[str] = None


# ---------------- PROGRESS ----------------
class ProgressLogCreate(BaseModel):
    assessment_id: Optional[str] = None
    routine_adherence_pct: float
    skin_health_score: float
    notes: Optional[str] = None


class ProgressLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    log_date: datetime
    routine_adherence_pct: float
    skin_health_score: float
    notes: Optional[str]


# ---------------- NOTIFICATIONS ----------------
class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    message: str
    category: str
    is_read: bool
    created_at: datetime


# ---------------- GEMINI AI CHAT ----------------
class GeminiChatRequest(BaseModel):
    prompt: str
    context: Optional[str] = None


class GeminiChatResponse(BaseModel):
    response: str


# ---------------- PROFESSIONAL RECOMMENDATION ----------------
class RecommendationCreate(BaseModel):
    client_id: str
    assessment_id: Optional[str] = None
    recommendation_text: str


class RecommendationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    professional_id: str
    client_id: str
    assessment_id: Optional[str]
    recommendation_text: str
    created_at: datetime
