from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict

class RoutineStepSchema(BaseModel):
    step_number: int
    category: str
    ingredient: str
    instructions: str
    frequency: str
    duration: str
    precautions: str
    expected_benefits: str

class SkincareRoutineResponse(BaseModel):
    id: int
    user_id: int
    routine_type: str
    title: str
    description: str
    steps: List[RoutineStepSchema]
    created_at: datetime
    updated_at: datetime
    adapted_from_previous_assessment: Optional[bool] = False
    adaptation_summary: Optional[str] = None
    assessment_changes: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)

class SkincareRoutineUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    steps: Optional[List[RoutineStepSchema]] = None

class IngredientBase(BaseModel):
    name: str
    category: str
    description: str
    benefits: List[str]
    side_effects: List[str]
    suitable_skin_types: List[str]
    suitable_skin_concerns: List[str]
    usage_time: str
    compatible_ingredients: List[str]
    conflicting_ingredients: List[str]
    safety_warnings: Optional[str] = None

class IngredientCreate(IngredientBase):
    pass

class IngredientResponse(IngredientBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CompatibilityCheckRequest(BaseModel):
    selected_ingredients: List[str]

class ConflictDetail(BaseModel):
    ingredient_a: str
    ingredient_b: str
    warning: str
    risk_level: str

class CompatibilityCheckResponse(BaseModel):
    id: int
    user_id: int
    selected_ingredients: List[str]
    is_safe: bool
    conflicts_found: List[ConflictDetail]
    recommendation: str
    user_allergy_conflicts: Optional[List[str]] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    brand: str
    name: str
    category: str
    price: float = 0.0
    rating: float = 4.5
    active_ingredients: List[str] = []
    suitable_skin_types: List[str] = []
    suitable_concerns: List[str] = []
    description: str
    usage_instructions: Optional[str] = None
    image_url: Optional[str] = None
    purchase_url: Optional[str] = None
    purchase_links: Optional[dict] = {}

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
