"""
FastAPI Router for Module 6 Product Recommendation Engine
---------------------------------------------------------
Endpoints for personalized product recommendations, suitability scoring,
side-by-side product comparison, budget filtering, and alternative suggestions.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.database import get_db
from app import models
from app.dependencies import get_current_user
from app.product_engine import (
    get_personalized_recommendations,
    get_alternative_products,
    compare_products
)

router = APIRouter(
    prefix="/products",
    tags=["Product Recommendations"]
)


class CompareProductsRequest(BaseModel):
    product_ids: List[int]


def _build_user_profile_from_db(current_user: models.User, db: Session) -> dict:
    """
    Retrieves the authenticated user's latest assessment record from PostgreSQL
    and constructs the user profile dictionary for the recommendation engine.
    """
    latest_assessment = (
        db.query(models.Assessment)
        .filter(models.Assessment.user_id == current_user.id)
        .order_by(models.Assessment.assessment_time.desc())
        .first()
    )

    if latest_assessment:
        return {
            "predicted_skin_type": latest_assessment.predicted_skin_type or "Combination",
            "sensitivity": latest_assessment.sensitivity or "Low",
            "concerns": latest_assessment.concerns or [],
            "allergies": latest_assessment.allergies or [],
            "health_score": latest_assessment.health_score or 100,
            "overall_condition": latest_assessment.overall_condition or "Good"
        }

    # Default fallback profile if user has not completed assessment yet
    return {
        "predicted_skin_type": "Combination",
        "sensitivity": "Low",
        "concerns": ["Hyperpigmentation", "Uneven Skin Tone"],
        "allergies": [],
        "health_score": 85,
        "overall_condition": "Good"
    }


@router.get("/recommendations")
def get_recommendations_api(
    category: str = Query("All", description="Product category filter"),
    max_price: Optional[float] = Query(None, description="Maximum price budget filter"),
    min_price: Optional[float] = Query(None, description="Minimum price budget filter"),
    sort_by: str = Query("match_score", description="Sort option: match_score, price_low_to_high, price_high_to_low, rating"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns personalized skincare product recommendations based on the authenticated user's
    latest skin assessment profile stored in PostgreSQL.
    """
    try:
        user_profile = _build_user_profile_from_db(current_user, db)

        recommendations = get_personalized_recommendations(
            user_profile=user_profile,
            category=category,
            max_price=max_price,
            min_price=min_price,
            sort_by=sort_by
        )

        return {
            "status": "success",
            "user_profile_summary": {
                "skin_type": user_profile["predicted_skin_type"],
                "sensitivity": user_profile["sensitivity"],
                "concerns": user_profile["concerns"],
                "allergies": user_profile["allergies"],
            },
            "category_filter": category,
            "total_products": len(recommendations),
            "products": recommendations
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate product recommendations: {str(e)}"
        )


@router.post("/compare")
def compare_products_api(
    payload: CompareProductsRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns a side-by-side comparison matrix for selected product IDs
    evaluated against the user's skin profile.
    """
    try:
        if not payload.product_ids or len(payload.product_ids) < 2:
            raise HTTPException(
                status_code=400,
                detail="Please select at least 2 products for comparison."
            )

        user_profile = _build_user_profile_from_db(current_user, db)
        comparison_result = compare_products(payload.product_ids, user_profile)

        return {
            "status": "success",
            "comparison": comparison_result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate product comparison: {str(e)}"
        )


@router.get("/{product_id}/alternatives")
def get_product_alternatives_api(
    product_id: int,
    max_price: Optional[float] = Query(None, description="Maximum price budget filter"),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns alternative product suggestions for a specific product.
    """
    try:
        user_profile = _build_user_profile_from_db(current_user, db)
        alternatives = get_alternative_products(product_id, user_profile, max_price=max_price)

        return {
            "status": "success",
            "product_id": product_id,
            "total_alternatives": len(alternatives),
            "alternatives": alternatives
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve alternative products: {str(e)}"
        )
