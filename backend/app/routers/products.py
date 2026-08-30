from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Product, RoutineProfile
from app.dependencies.auth import get_current_user
from app.schemas import (
    ProductResponse,
    ProductRecommendationResponse,
    ProductSuitabilityResponse,
    ProductComparisonRequest,
    ProductComparisonResponse,
    ProductComparisonItem
)
from app.services.product_recommendation_service import evaluate_product_suitability

router = APIRouter(prefix="/api/products", tags=["Product Recommendation Engine"])

@router.get("", response_model=List[ProductResponse])
async def list_products(
    category: Optional[str] = None,
    budget: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Lists products with optional category, budget tier, and keyword search filters."""
    query = db.query(Product).filter(Product.is_active == True)
    
    if category and category.lower() != "all":
        query = query.filter(Product.category.ilike(category))
        
    if budget and budget.lower() != "all":
        b_val = budget.lower()
        if b_val == "budget":
            query = query.filter(Product.price < 500)
        elif b_val == "moderate":
            query = query.filter(Product.price >= 500, Product.price < 1000)
        elif b_val == "premium":
            query = query.filter(Product.price >= 1000)
            
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Product.name.ilike(search_filter)) |
            (Product.brand.ilike(search_filter)) |
            (Product.description.ilike(search_filter))
        )
        
    return query.order_by(Product.name.asc()).all()

@router.get("/categories", response_model=List[str])
async def list_product_categories(db: Session = Depends(get_db)):
    """Returns a list of all unique supported product categories."""
    categories = db.query(Product.category).distinct().all()
    return [c[0] for c in categories if c[0]]

@router.get("/recommended", response_model=List[ProductRecommendationResponse])
async def get_personalized_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Calculates, ranks, and returns personalized product recommendations for the authenticated user."""
    profile = db.query(RoutineProfile).filter(RoutineProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile not found. Complete your Skin Profile to get personalized product recommendations."
        )
        
    products = db.query(Product).filter(Product.is_active == True).all()
    recommendations = []
    
    for prod in products:
        eval_res = evaluate_product_suitability(db, profile, prod)
        # Exclude allergy/avoidance matches entirely from recommendations
        if eval_res["is_allergy_excluded"]:
            continue
            
        recommendations.append(ProductRecommendationResponse(
            product=prod,
            suitability_score=eval_res["suitability_score"],
            match_reason=eval_res["match_reason"]
        ))
        
    # Rank recommendations by suitability score descending
    recommendations.sort(key=lambda x: x.suitability_score, reverse=True)
    return recommendations

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product_details(product_id: int, db: Session = Depends(get_db)):
    """Fetches full specifications for a single product by ID."""
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )
    return product

@router.get("/{product_id}/suitability", response_model=ProductSuitabilityResponse)
async def get_single_product_suitability(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Runs a direct suitability assessment of a specific product for the authenticated user."""
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )
        
    profile = db.query(RoutineProfile).filter(RoutineProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile not found. Please complete your Skin Profile Questionnaire first."
        )
        
    eval_res = evaluate_product_suitability(db, profile, product)
    return ProductSuitabilityResponse(
        product_id=product.id,
        product_name=product.name,
        suitability_score=eval_res["suitability_score"],
        match_reason=eval_res["match_reason"],
        is_allergy_excluded=eval_res["is_allergy_excluded"],
        warnings=eval_res["warnings"],
        usage_guidance=eval_res["usage_guidance"]
    )

@router.post("/compare", response_model=ProductComparisonResponse)
async def compare_products(
    payload: ProductComparisonRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Compares multiple products side-by-side, calculating scores and highlighting the best match."""
    if not payload.product_ids or len(payload.product_ids) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please select at least 2 products to compare."
        )
        
    profile = db.query(RoutineProfile).filter(RoutineProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile not found. Please complete your Skin Profile Questionnaire first."
        )
        
    products = db.query(Product).filter(Product.id.in_(payload.product_ids), Product.is_active == True).all()
    if len(products) != len(payload.product_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="One or more selected products were not found."
        )
        
    items = []
    highest_score = -1
    best_product_name = ""
    
    for prod in products:
        eval_res = evaluate_product_suitability(db, profile, prod)
        items.append({
            "product": prod,
            "suitability_score": eval_res["suitability_score"],
            "match_reason": eval_res["match_reason"],
            "is_more_suitable": False
        })
        if eval_res["suitability_score"] > highest_score:
            highest_score = eval_res["suitability_score"]
            best_product_name = prod.name
            
    # Mark the item with the highest score as the best match
    for item in items:
        if item["suitability_score"] == highest_score and highest_score > 0:
            item["is_more_suitable"] = True
            
    verdict = f"'{best_product_name}' is the better match for your current profile." if highest_score > 0 else "None of these products are suitable."
    
    return {
        "comparison_results": items,
        "verdict": verdict
    }

@router.get("/{product_id}/alternatives", response_model=List[ProductRecommendationResponse])
async def get_product_alternatives(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns safe and compatible alternative products from the same category."""
    product = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )
        
    profile = db.query(RoutineProfile).filter(RoutineProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile not found. Please complete your Skin Profile Questionnaire first."
        )
        
    # Fetch active products in the same category (excluding the current one)
    alternatives = db.query(Product).filter(
        Product.category == product.category,
        Product.id != product.id,
        Product.is_active == True
    ).all()
    
    rec_list = []
    for alt in alternatives:
        eval_res = evaluate_product_suitability(db, profile, alt)
        if eval_res["is_allergy_excluded"]:
            continue
            
        rec_list.append(ProductRecommendationResponse(
            product=alt,
            suitability_score=eval_res["suitability_score"],
            match_reason=eval_res["match_reason"]
        ))
        
    rec_list.sort(key=lambda x: x.suitability_score, reverse=True)
    return rec_list
