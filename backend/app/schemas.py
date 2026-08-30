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


# --- Module 4: Routine Generation Schemas ---

class RoutineProfileCreateUpdate(BaseModel):
    age_group: str = Field(..., description="Q1: Age group")
    skin_type: str = Field(..., description="Q2: Skin type")
    sensitivity: str = Field(..., description="Q3: Skin sensitivity")
    concerns: List[str] = Field(..., description="Q4: Main skin concerns")
    acne_severity: str = Field(..., description="Q5: Acne severity")
    oiliness: str = Field(..., description="Q6: Oiliness")
    dryness: str = Field(..., description="Q7: Dryness/dehydration")
    redness_frequency: str = Field(..., description="Q8: Irritation/redness frequency")
    has_routine: str = Field(..., description="Q9: Follows routine")
    current_products: List[str] = Field(..., description="Q10: Current products list")
    routine_frequency: str = Field(..., description="Q11: Skincare routine frequency")
    skincare_irritation: str = Field(..., description="Q12: Irritation history")
    active_ingredients: List[str] = Field(..., description="Q13: Actives currently used")
    sleep_hours: str = Field(..., description="Q14: Daily sleep hours")
    water_intake: str = Field(..., description="Q15: Daily water intake")
    stress_level: str = Field(..., description="Q16: Stress level")
    exercise_frequency: str = Field(..., description="Q17: Weekly exercise frequency")
    outdoor_hours: str = Field(..., description="Q18: Outdoor hours")
    climate: str = Field(..., description="Q19: Environment climate")
    pollution_exposure: str = Field(..., description="Q20: Pollution exposure level")
    sunlight_exposure: str = Field(..., description="Q21: Sunlight exposure level")
    has_allergies: str = Field(..., description="Q22: Has allergies")
    avoid_ingredients: Optional[str] = Field(None, max_length=500, description="Q23: Ingredients to avoid")
    has_allergic_reaction: str = Field(..., description="Q24: Product reaction history")
    skincare_time: str = Field(..., description="Q25: Skincare time preference")
    routine_preference: str = Field(..., description="Q26: Skincare complexity preference")
    budget: str = Field(..., description="Q27: Skincare budget preference")
    skincare_goal: str = Field(..., max_length=100, description="Q28: Primary skincare goal")

class RoutineProfileResponse(RoutineProfileCreateUpdate):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RoutineItemSchema(BaseModel):
    id: int
    routine_type: str
    category: str
    step_order: int
    name: str
    description: str
    frequency: str
    notes: Optional[str] = None
    is_enabled: bool

    class Config:
        from_attributes = True

class RoutineResponse(BaseModel):
    id: int
    user_id: int
    profile_id: Optional[int] = None
    generated_at: datetime
    updated_at: datetime
    is_user_modified: bool
    items: List[RoutineItemSchema] = []

    class Config:
        from_attributes = True

class RoutineItemCreateUpdate(BaseModel):
    id: Optional[int] = None
    routine_type: str
    category: str
    step_order: int
    name: str
    description: str
    frequency: str
    notes: Optional[str] = None
    is_enabled: bool = True

class RoutineManualUpdateRequest(BaseModel):
    items: List[RoutineItemCreateUpdate]


# --- Module 5: Ingredient Intelligence Schemas ---

class IngredientResponse(BaseModel):
    id: int
    name: str
    category: str
    short_description: str
    benefits: List[str]
    suitable_skin_types: List[str]
    common_concerns: List[str]
    usage_guidance: str
    precautions: str
    typical_frequency: str
    irritation_level: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class IngredientSuitabilityRequest(BaseModel):
    ingredient_id: int

class IngredientSuitabilityResponse(BaseModel):
    ingredient: str
    suitability: str # SUITABLE, USE_WITH_CAUTION, NOT_RECOMMENDED, AVOID
    reason: str
    warnings: List[str]
    usage_guidance: str

class IngredientInteractionRequest(BaseModel):
    ingredient_ids: List[int]

class IngredientInteractionResponse(BaseModel):
    compatibility: str # COMPATIBLE, USE_WITH_CAUTION, AVOID_SAME_ROUTINE
    explanation: str
    recommended_usage: str

class ProfileContextResponse(BaseModel):
    has_profile: bool
    skin_type: Optional[str] = None
    sensitivity: Optional[str] = None
    concerns: List[str] = []
    avoid_ingredients: Optional[str] = None
    skincare_goal: Optional[str] = None
    has_allergies: Optional[str] = None
    has_allergic_reaction: Optional[str] = None


# --- Module 6: Product Recommendation Schemas ---

class ProductResponse(BaseModel):
    id: int
    name: str
    brand: str
    category: str
    description: str
    price: int
    ingredients: List[str]
    suitable_skin_types: List[str]
    suitable_concerns: List[str]
    benefits: List[str]
    usage_guidance: str
    precautions: str
    irritation_level: str
    rating: float
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProductRecommendationResponse(BaseModel):
    product: ProductResponse
    suitability_score: int
    match_reason: str
    is_allergy_excluded: bool = False

class ProductSuitabilityResponse(BaseModel):
    product_id: int
    product_name: str
    suitability_score: int
    match_reason: str
    is_allergy_excluded: bool
    warnings: List[str]
    usage_guidance: str

class ProductComparisonRequest(BaseModel):
    product_ids: List[int]

class ProductComparisonItem(BaseModel):
    product: ProductResponse
    suitability_score: int
    match_reason: str
    is_more_suitable: bool

class ProductComparisonResponse(BaseModel):
    comparison_results: List[ProductComparisonItem]
    verdict: str

