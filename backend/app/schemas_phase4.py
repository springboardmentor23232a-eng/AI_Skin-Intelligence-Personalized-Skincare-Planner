from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas_phase3 import ProductResponse

class RecommendationRequest(BaseModel):
    budget_tier: Optional[str] = "ALL"  # LOW, MEDIUM, PREMIUM, ALL

class RecommendedProductItem(BaseModel):
    product: ProductResponse
    suitability_score: float  # 0 to 100%
    match_reasons: List[str]
    allergy_warnings: List[str]
    budget_tier: str  # Low, Medium, Premium

class ProductRecommendationSessionResponse(BaseModel):
    id: int
    user_id: int
    budget_tier: str
    recommended_products: List[RecommendedProductItem]
    overall_match_score: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ProductComparisonRequest(BaseModel):
    product_ids: List[int]

class ProductComparisonItem(BaseModel):
    id: int
    brand: str
    name: str
    category: str
    price: float
    rating: float
    active_ingredients: List[str]
    suitable_skin_types: List[str]
    suitable_concerns: List[str]
    suitability_score: float
    pros: List[str]
    warnings: List[str]
    purchase_url: Optional[str] = None
    purchase_links: Optional[dict] = {}

class ProductComparisonResponse(BaseModel):
    comparison: List[ProductComparisonItem]
    best_match_product_id: int
    recommendation_note: str

class AlternativeProductItem(BaseModel):
    product: ProductResponse
    suitability_score: float
    price_difference: float
    reason: str

class AlternativeProductsResponse(BaseModel):
    original_product: ProductResponse
    alternatives: List[AlternativeProductItem]
