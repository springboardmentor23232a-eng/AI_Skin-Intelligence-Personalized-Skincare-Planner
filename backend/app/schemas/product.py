import uuid
from typing import List, Optional

from pydantic import BaseModel


class IngredientOut(BaseModel):
    id: uuid.UUID
    name: str
    category: Optional[str]
    good_for: List[str]
    avoid_if: List[str]
    interacts_badly_with: List[str]
    description: Optional[str]

    class Config:
        from_attributes = True


class ProductOut(BaseModel):
    id: uuid.UUID
    name: str
    brand: Optional[str]
    category: Optional[str]
    key_ingredients: List[str]
    suitable_skin_types: List[str]
    targets_concerns: List[str]
    price: float
    description: Optional[str]
    suitability_score: Optional[float] = None

    class Config:
        from_attributes = True
