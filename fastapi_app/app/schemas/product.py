from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class ProductBase(BaseModel):
    brand: str
    name: str
    category: str  # Cleanser, Serum, Moisturizer, Sunscreen, Exfoliant, Mask
    active_ingredients: str
    target_skin_types: str
    target_concerns: str
    price: float
    rating: float = 4.5
    reviews_count: int = 120
    image_url: Optional[str] = None
    buy_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProductMatchResponse(ProductResponse):
    match_score: int  # 0 to 100%
    match_level: str  # EXCELLENT_MATCH, GOOD_MATCH, MODERATE_MATCH
    matched_concerns: List[str]
    matched_skin_type: bool
    active_ingredients_list: List[str]
    safety_warnings: List[str] = []
