from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.security import get_current_user, get_optional_current_user, AuthenticatedUser
from app.engine.product_engine import ProductEngine
from app.schemas.product import (
    ProductResponse, ProductMatchResponse, ProductCompareRequest, ProductComparisonResponse
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
    skin_type: Optional[str] = Query("Combination", description="Skin type: Oily, Dry, Combination, Sensitive, Normal"),
    skin_concerns: Optional[List[str]] = Query(None, description="Skin concerns list e.g. Acne, Redness, Aging, Pores"),
    category: Optional[str] = Query(None, description="Product category"),
    max_price: Optional[float] = Query(None, description="Max budget price"),
    budget_only: Optional[bool] = Query(False, description="Budget only picks <= ₹500"),
    sort_by: Optional[str] = Query("suitability", description="Sort by option"),
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_optional_current_user)
):
    user_id = current_user.id if current_user else None
    return ProductEngine.get_recommendations_for_user(
        db=db,
        user_id=user_id,
        skin_type=skin_type,
        skin_concerns=skin_concerns or [],
        category=category,
        max_price=max_price,
        budget_only=budget_only,
        sort_by=sort_by
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

