from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.security import get_current_user, get_optional_current_user, AuthenticatedUser
from app.engine.product_engine import ProductEngine
from app.schemas.product import (
    ProductResponse, ProductMatchResponse, ProductCompareRequest, ProductComparisonResponse, CustomRecommendationRequest
)

router = APIRouter(prefix="", tags=["Product Recommendation & Comparison Engine"])

# 1. GET /product - List products
@router.get(
    "/product",
    response_model=List[ProductResponse],
    status_code=status.HTTP_200_OK,
    summary="Get All Products Catalog",
    description="Retrieves skincare products catalog with optional category filter."
)
def get_products(
    category: Optional[str] = Query(None, description="Category filter e.g. Cleanser, Facewash, Serum, Moisturizer, Sunscreen, Exfoliant, Mask, Facemask"),
    db: Session = Depends(get_db)
):
    return ProductEngine.get_all_products(db, category)

# 2. GET /product/recommendations/me - AI recommendations for current user
@router.get(
    "/product/recommendations/me",
    response_model=List[ProductMatchResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Personalized Product Recommendations & Suitability Scores",
    description="Generates suitability match scores (0-100%), budget friendly indicators, and shopping links for current user."
)
def get_my_recommendations(
    category: Optional[str] = Query(None, description="Category filter (Facewash, Facemask, Serum, Moisturizer, Sunscreen, Exfoliant)"),
    max_price: Optional[float] = Query(None, description="Maximum budget price filter in INR"),
    budget_only: Optional[bool] = Query(False, description="Filter only budget-friendly picks (<= ₹500)"),
    sort_by: Optional[str] = Query("suitability", description="Sorting option: suitability, price_asc, price_desc, rating"),
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return ProductEngine.get_recommendations_for_user(
        db=db,
        user_id=current_user.id,
        category=category,
        max_price=max_price,
        budget_only=budget_only,
        sort_by=sort_by
    )

# 3. POST /product/recommendations - Recommend products for explicit skin profile input
@router.post(
    "/product/recommendations",
    response_model=List[ProductMatchResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Recommendations for Custom Skin Profile",
    description="Calculates recommendations based on submitted skin type, concerns, category, and budget preferences."
)
def get_custom_recommendations(
    payload: Optional[CustomRecommendationRequest] = None,
    skin_type: Optional[str] = Query(None, description="Skin type: Oily, Dry, Combination, Sensitive, Normal"),
    skin_concerns: Optional[List[str]] = Query(None, description="Skin concerns list e.g. Acne, Redness, Aging, Pores"),
    category: Optional[str] = Query(None, description="Product category"),
    max_price: Optional[float] = Query(None, description="Max budget price"),
    budget_only: Optional[bool] = Query(None, description="Budget only picks <= ₹500"),
    sort_by: Optional[str] = Query(None, description="Sort by option"),
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_optional_current_user)
):
    user_id = current_user.id if current_user else None

    # Merge payload body and query params (body takes precedence if provided)
    effective_skin_type = (payload.skin_type if payload and payload.skin_type else None) or skin_type or "Combination"
    effective_skin_concerns = (payload.skin_concerns if payload and payload.skin_concerns is not None else None) or skin_concerns or []
    effective_category = (payload.category if payload and payload.category else None) or category
    effective_max_price = (payload.max_price if payload and payload.max_price is not None else None) or max_price
    effective_budget_only = (payload.budget_only if payload and payload.budget_only is not None else None) or budget_only or False
    effective_sort_by = (payload.sort_by if payload and payload.sort_by else None) or sort_by or "suitability"

    return ProductEngine.get_recommendations_for_user(
        db=db,
        user_id=user_id,
        skin_type=effective_skin_type,
        skin_concerns=effective_skin_concerns,
        category=effective_category,
        max_price=effective_max_price,
        budget_only=effective_budget_only,
        sort_by=effective_sort_by
    )


# 4. POST /product/compare - Compare multiple products side-by-side
@router.post(
    "/product/compare",
    response_model=ProductComparisonResponse,
    status_code=status.HTTP_200_OK,
    summary="Compare Products Side-by-Side",
    description="Calculates comparative metrics, best overall match, best budget pick, and suitability breakdown for selected product IDs."
)
def compare_products(
    payload: ProductCompareRequest,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_optional_current_user)
):
    user_id = current_user.id if current_user else None
    return ProductEngine.compare_products(
        db=db,
        product_ids=payload.product_ids,
        user_id=user_id,
        skin_type=payload.skin_type,
        skin_concerns=payload.skin_concerns
    )

# 5. GET /product/{product_id}/alternatives - Get budget & suitability alternative suggestions
@router.get(
    "/product/{product_id}/alternatives",
    response_model=List[ProductMatchResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Alternative Product Suggestions",
    description="Finds budget-friendly and high-suitability alternative products in the same category."
)
def get_product_alternatives(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_optional_current_user)
):
    user_id = current_user.id if current_user else None
    return ProductEngine.get_alternative_products(
        db=db,
        product_id=product_id,
        user_id=user_id
    )

