from pydantic import BaseModel
from datetime import datetime


# =========================================================
# ASSESSMENT SCHEMAS
# =========================================================

class AssessmentCreate(BaseModel):
    user_id: int
    skin_health_score: int
    overall_condition: str
    notes: str

    skin_type: str | None = None
    main_concern: str | None = None
    hydration: str | None = None
    acne_level: str | None = None
    pigmentation: str | None = None
    risk_level: str | None = None
    redness: str | None = None
    texture: str | None = None
    sensitivity: str | None = None


class AssessmentResponse(BaseModel):
    id: int
    user_id: int
    assessment_date: datetime

    skin_health_score: int
    overall_condition: str
    notes: str

    skin_type: str | None = None
    main_concern: str | None = None
    hydration: str | None = None
    acne_level: str | None = None
    pigmentation: str | None = None
    risk_level: str | None = None
    redness: str | None = None
    texture: str | None = None
    sensitivity: str | None = None

    created_at: datetime

    class Config:
        from_attributes = True


# =========================================================
# SKIN CONCERN SCHEMAS
# =========================================================

class SkinConcernCreate(BaseModel):
    assessment_id: int
    concern_name: str
    severity: str
    priority: str


# =========================================================
# RISK FACTOR SCHEMAS
# =========================================================

class RiskFactorCreate(BaseModel):
    assessment_id: int
    risk_name: str
    description: str
    risk_level: str


# =========================================================
# USER SCHEMAS
# =========================================================

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str = "USER"


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    provider: str

    class Config:
        from_attributes = True


# =========================================================
# JWT TOKEN SCHEMA
# =========================================================

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str


# =========================================================
# PROFILE UPDATE SCHEMA
# =========================================================

class ProfileUpdate(BaseModel):
    name: str


# =========================================================
# INGREDIENT SCHEMAS
# =========================================================

class IngredientCreate(BaseModel):
    name: str
    category: str | None = None
    description: str | None = None
    function: str | None = None


class IngredientResponse(BaseModel):
    id: int
    name: str
    category: str | None = None
    description: str | None = None
    function: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# =========================================================
# INGREDIENT BENEFIT SCHEMAS
# =========================================================

class IngredientBenefitCreate(BaseModel):
    ingredient_id: int
    skin_type: str | None = None
    skin_concern: str | None = None
    benefit: str | None = None
    suitability: str | None = None


class IngredientBenefitResponse(BaseModel):
    id: int
    ingredient_id: int
    skin_type: str | None = None
    skin_concern: str | None = None
    benefit: str | None = None
    suitability: str | None = None

    class Config:
        from_attributes = True


# =========================================================
# PRODUCT INGREDIENT SCHEMAS
# =========================================================

class ProductIngredientCreate(BaseModel):
    product_id: int
    ingredient_id: int
    concentration: str | None = None
    notes: str | None = None


class ProductIngredientResponse(BaseModel):
    id: int
    product_id: int
    ingredient_id: int
    concentration: str | None = None
    notes: str | None = None

    class Config:
        from_attributes = True


# =========================================================
# INGREDIENT INTERACTION SCHEMAS
# =========================================================

class IngredientInteractionCreate(BaseModel):
    ingredient_id_1: int
    ingredient_id_2: int
    interaction_type: str | None = None
    severity: str | None = None
    description: str | None = None
    recommendation: str | None = None


class IngredientInteractionResponse(BaseModel):
    id: int
    ingredient_id_1: int
    ingredient_id_2: int
    interaction_type: str | None = None
    severity: str | None = None
    description: str | None = None
    recommendation: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# =========================================================
# USER INGREDIENT ALLERGY SCHEMAS
# =========================================================

class UserIngredientAllergyCreate(BaseModel):
    ingredient_id: int
    reaction: str | None = None
    severity: str | None = None
    notes: str | None = None


class UserIngredientAllergyResponse(BaseModel):
    id: int
    user_id: int
    ingredient_id: int
    reaction: str | None = None
    severity: str | None = None
    notes: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# =========================================================
# INGREDIENT SUITABILITY SCHEMAS
# =========================================================

class IngredientSuitabilityCreate(BaseModel):
    ingredient_id: int
    skin_type: str | None = None
    skin_concern: str | None = None
    suitability: str | None = None
    reason: str | None = None
    caution: str | None = None


class IngredientSuitabilityResponse(BaseModel):
    id: int
    ingredient_id: int
    skin_type: str | None = None
    skin_concern: str | None = None
    suitability: str | None = None
    reason: str | None = None
    caution: str | None = None
    created_at: datetime
    # =========================================================
# INGREDIENT ALLERGY SCHEMAS
# =========================================================

class IngredientAllergyCreate(BaseModel):
    ingredient_id: int
    allergy_name: str | None = None
    symptoms: str | None = None
    severity: str | None = None
    warning: str | None = None


class IngredientAllergyResponse(BaseModel):
    id: int
    ingredient_id: int
    allergy_name: str | None = None
    symptoms: str | None = None
    severity: str | None = None
    warning: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# =========================================================
# INGREDIENT CATEGORY SCHEMAS
# =========================================================

class IngredientCategoryCreate(BaseModel):
    name: str
    description: str | None = None


class IngredientCategoryResponse(BaseModel):
    id: int
    name: str
    description: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


# =========================================================
# INGREDIENT ANALYSIS REQUEST
# =========================================================

class IngredientAnalysisRequest(BaseModel):
    user_id: int
    ingredient_id: int


# =========================================================
# INGREDIENT INTERACTION RESULT
# =========================================================

class IngredientInteractionResult(BaseModel):
    ingredient_name: str
    interaction_type: str | None = None
    severity: str | None = None
    description: str | None = None
    recommendation: str | None = None


# =========================================================
# INGREDIENT ALLERGY RESULT
# =========================================================

class IngredientAllergyResult(BaseModel):
    allergy_name: str | None = None
    symptoms: str | None = None
    severity: str | None = None
    warning: str | None = None


# =========================================================
# COMPLETE INGREDIENT ANALYSIS RESPONSE
# =========================================================

class IngredientAnalysisResponse(BaseModel):

    # Client information
    user_id: int
    client_name: str

    # Skin profile
    skin_type: str | None = None
    primary_concern: str | None = None
    sensitivity: str | None = None
    skin_score: int | None = None

    # Ingredient information
    ingredient_id: int
    ingredient_name: str
    category: str | None = None
    description: str | None = None
    function: str | None = None

    # Benefits
    benefits: list[str] = []

    # Suitability
    suitability: str
    suitability_reason: str | None = None
    precautions: str | None = None

    # Allergy
    allergy_status: str
    allergy_warnings: list[IngredientAllergyResult] = []

    # Interaction
    interaction_risk: str
    interactions: list[IngredientInteractionResult] = []

    # Education
    what_is_it: str | None = None
    who_may_benefit: str | None = None
    how_it_works: str | None = None
    important_precautions: str | None = None

    # Consultant recommendation
    consultant_recommendation: str | None = None

    class Config:
        from_attributes = True