from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from app.schemas import (
    ProductRecommendationRequest,
    ProductRecommendationResponse,
    ProductComparisonRequest,
    ProductComparisonResponse,
    AlternativeProductResponse
)
from app.services.recommendation_engine import recommendation_engine

router = APIRouter(tags=["Module 6: Product Recommendation Engine"])


@router.post("/recommend", response_model=ProductRecommendationResponse)
def get_personalized_recommendations(payload: ProductRecommendationRequest):
    """
    Module 6: Generates personalized product recommendations with 0-100% suitability match scores.
    Supports filtering by product category and budget tiers (Budget $, Mid-Range $$, Premium $$$).
    """
    recs = recommendation_engine.recommend_products(
        category=payload.category,
        budget_tier=payload.budget_tier,
        max_price=payload.max_price,
        skin_type=payload.skin_type or "Combination",
        active_concerns=payload.active_concerns,
        allergies=payload.allergies,
        limit=payload.limit
    )

    return {
        "success": True,
        "user_id": payload.user_id or 1,
        "total_found": len(recs),
        "category_filter": payload.category,
        "budget_filter": payload.budget_tier,
        "recommendations": recs
    }


@router.post("/compare", response_model=ProductComparisonResponse)
def compare_products(payload: ProductComparisonRequest):
    """
    Module 6: Side-by-side comparative analysis for 2 or more products based on suitability,
    key actives, price, and allergen safety.
    """
    if len(payload.product_ids) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 product IDs to compare.")

    res = recommendation_engine.compare_products(
        product_ids=payload.product_ids
    )
    return res


@router.get("/alternatives/{product_id}", response_model=AlternativeProductResponse)
def get_alternative_products(product_id: int):
    """
    Module 6: Returns safer/higher-scoring alternative products in the same category.
    """
    res = recommendation_engine.suggest_alternatives(product_id=product_id)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message", "Product not found."))
    return res
