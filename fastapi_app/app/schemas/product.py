from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class ProductBase(BaseModel):
    brand: str
    name: str
    category: str  # Cleanser / Facewash, Serum, Moisturizer, Sunscreen, Exfoliant, Mask / Facemask
    active_ingredients: str
    target_skin_types: str
    target_concerns: str
    price: float
    rating: float = 4.5
    reviews_count: int = 120
    image_url: Optional[str] = None
    buy_url: Optional[str] = None
    nykaa_url: Optional[str] = None
    amazon_url: Optional[str] = None

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
    is_budget_friendly: bool = False

class ProductCompareRequest(BaseModel):
    product_ids: List[int] = Field(..., min_items=1, max_items=6, description="List of product IDs to compare")
    skin_type: Optional[str] = "Combination"
    skin_concerns: Optional[List[str]] = None

class ProductComparisonResponse(BaseModel):
    products: List[ProductMatchResponse]
    best_overall_id: Optional[int] = None
    best_budget_id: Optional[int] = None
    comparison_summary: str
