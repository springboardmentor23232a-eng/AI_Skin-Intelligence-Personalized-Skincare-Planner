from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.security import get_current_user, get_optional_current_user, AuthenticatedUser
from app.engine.product_engine import ProductEngine
from app.schemas.product import ProductResponse, ProductMatchResponse

router = APIRouter(prefix="", tags=["Product Recommendation Engine"])

# 1. GET /product - List products
@router.get(
    "/product",
    response_model=List[ProductResponse],
    status_code=status.HTTP_200_OK,
    summary="Get All Products",
    description="Retrieves skincare products catalog, optional filter by category."
)
def get_products(
    category: Optional[str] = Query(None, description="Category filter e.g. Cleanser, Serum, Moisturizer, Sunscreen"),
    db: Session = Depends(get_db)
):
    return ProductEngine.get_all_products(db, category)

# 2. GET /product/recommendations/me - AI recommendations for current user
@router.get(
    "/product/recommendations/me",
    response_model=List[ProductMatchResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Personalized Product Recommendations",
    description="Generates AI match scores (0-100%) and personalized product recommendations based on user skin profile."
)
def get_my_recommendations(
    category: Optional[str] = Query(None, description="Category filter"),
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return ProductEngine.get_recommendations_for_user(
        db=db,
        user_id=current_user.id,
        category=category
    )

# 3. POST /product/recommendations - Recommend products for explicit skin input
@router.post(
    "/product/recommendations",
    response_model=List[ProductMatchResponse],
    status_code=status.HTTP_200_OK,
    summary="Get Recommendations for Specific Profile Input",
    description="Calculates recommendations based on submitted skin type, concerns, and category."
)
def get_custom_recommendations(
    skin_type: Optional[str] = "Combination",
    skin_concerns: Optional[List[str]] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_optional_current_user)
):
    return ProductEngine.get_recommendations_for_user(
        db=db,
        user_id=current_user.id,
        skin_type=skin_type,
        skin_concerns=skin_concerns or [],
        category=category
    )
