from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class IngredientBase(BaseModel):
    name: str
    category: str
    comedogenic_rating: int = Field(default=0, ge=0, le=5)
    target_skin_types: Optional[str] = None
    target_concerns: Optional[str] = None
    description: Optional[str] = None
    benefits: Optional[str] = None

class IngredientCreate(IngredientBase):
    pass

class IngredientResponse(IngredientBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class IngredientConflictResponse(BaseModel):
    id: int
    ingredient_a: str
    ingredient_b: str
    severity: str  # HIGH, MEDIUM, LOW
    warning_message: str
    recommendation: Optional[str] = None

    class Config:
        from_attributes = True

class CompatibilityCheckInput(BaseModel):
    ingredients: List[str]
    skin_type: Optional[str] = "Combination"
    skin_concerns: Optional[List[str]] = []

class CompatibilityCheckResponse(BaseModel):
    overall_safety_rating: str  # SAFE, CAUTION, HIGH_RISK
    max_comedogenic_rating: int
    conflicts_found: List[IngredientConflictResponse]
    high_risk_ingredients: List[str]
    suitable_for_skin: bool
    summary: str
