from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import User, SkinProfile, SkinAssessment, Product, ProductRecommendation, Ingredient
from app.auth import get_current_user
from app.routes.phase3 import CORE_PRODUCTS_DATA, seed_products
from app.schemas_phase3 import ProductResponse
from app.schemas_phase4 import (
    RecommendationRequest,
    RecommendedProductItem,
    ProductRecommendationSessionResponse,
    ProductComparisonRequest,
    ProductComparisonItem,
    ProductComparisonResponse,
    AlternativeProductItem,
    AlternativeProductsResponse
)

router = APIRouter(prefix="/api/recommendations", tags=["phase4"])


def calculate_product_suitability(
    product: Product,
    profile: Optional[SkinProfile],
    assessment: Optional[SkinAssessment]
) -> RecommendedProductItem:
    user_skin_type = profile.skin_type if profile else "Combination"
    user_concerns = profile.concerns if profile and profile.concerns else ["Acne / Breakouts", "Hyperpigmentation"]
    user_allergies = (profile.allergies or "").lower() if profile else ""
    user_sensitivities = (profile.sensitivities or "").lower() if profile else ""

    score = 0.0
    match_reasons = []
    allergy_warnings = []

    # 1. Skin Type Compatibility (Max 35 pts)
    skin_types_lower = [st.lower() for st in product.suitable_skin_types]
    if "all" in skin_types_lower or user_skin_type.lower() in skin_types_lower:
        score += 35.0
        match_reasons.append(f"Ideal match for {user_skin_type} skin type")
    elif any(st in skin_types_lower for st in ["normal", "combination"]):
        score += 20.0
        match_reasons.append(f"Compatible formulation for {user_skin_type} skin")

    # 2. Concern Alignment (Max 35 pts)
    product_concerns_lower = [sc.lower() for sc in product.suitable_concerns]
    matched_concerns = [c for c in user_concerns if any(c.lower() in pc or pc in c.lower() for pc in product_concerns_lower)]
    if matched_concerns:
        concern_pts = min(35.0, (len(matched_concerns) / max(1, len(user_concerns))) * 35.0)
        score += concern_pts
        match_reasons.append(f"Targets key concerns: {', '.join(matched_concerns)}")
    else:
        score += 10.0

    # 3. Rating & Quality Boost (Max 15 pts)
    rating_pts = (product.rating / 5.0) * 15.0
    score += rating_pts

    # 4. Active Ingredient Synergy (Max 15 pts)
    if product.active_ingredients:
        score += min(15.0, len(product.active_ingredients) * 5.0)
        match_reasons.append(f"Active clinical ingredients: {', '.join(product.active_ingredients)}")

    # 5. Allergy & Sensitivity Penalty
    for active_ing in product.active_ingredients:
        if active_ing.lower() in user_allergies or active_ing.lower() in user_sensitivities:
            score -= 40.0
            allergy_warnings.append(f"⚠️ Warning: Contains {active_ing} which matches user reported sensitivity/allergy.")

    if "fragrance" in user_allergies and "fragrance" in product.description.lower():
        score -= 30.0
        allergy_warnings.append("⚠️ Contains added fragrance.")

    final_score = round(min(100.0, max(0.0, score)), 1)

    # Determine Budget Tier (INR: Low <= 1500, Medium 1500-4000, Premium > 4000)
    inr_price = product.price * 85.0 if product.price < 300 else product.price
    if inr_price <= 1500.0:
        budget_tier = "Low"
    elif inr_price <= 4000.0:
        budget_tier = "Medium"
    else:
        budget_tier = "Premium"

    prod_schema = ProductResponse.model_validate(product)

    return RecommendedProductItem(
        product=prod_schema,
        suitability_score=final_score,
        match_reasons=match_reasons,
        allergy_warnings=allergy_warnings,
        budget_tier=budget_tier
    )


@router.post("/generate", response_model=ProductRecommendationSessionResponse, status_code=status.HTTP_201_CREATED)
def generate_recommendations(
    payload: RecommendationRequest = RecommendationRequest(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    assessment = db.query(SkinAssessment).filter(SkinAssessment.user_id == current_user.id).order_by(SkinAssessment.created_at.desc()).first()

    # Ensure products database has records and verified purchase_urls
    if db.query(Product).count() == 0 or db.query(Product).filter(Product.purchase_url.is_(None)).count() > 0:
        seed_products(db)

    all_products = db.query(Product).all()

    evaluated_items: List[RecommendedProductItem] = []
    for p in all_products:
        item = calculate_product_suitability(p, profile, assessment)

        # Budget Tier Filter matching INR specifications
        tier_filter = (payload.budget_tier or "ALL").upper()
        inr_p = item.product.price * 85.0 if item.product.price < 300 else item.product.price
        if tier_filter == "LOW" and inr_p > 1500.0:
            continue
        elif tier_filter == "MEDIUM" and (inr_p <= 1500.0 or inr_p > 4000.0):
            continue
        elif tier_filter == "PREMIUM" and inr_p <= 4000.0:
            continue

        evaluated_items.append(item)

    # Sort by suitability score descending
    evaluated_items.sort(key=lambda x: x.suitability_score, reverse=True)

    overall_score = round(
        sum(item.suitability_score for item in evaluated_items) / max(1, len(evaluated_items)), 1
    ) if evaluated_items else 0.0

    # Save persistent recommendation record to PostgreSQL
    rec_session = ProductRecommendation(
        user_id=current_user.id,
        budget_tier=payload.budget_tier or "ALL",
        recommended_products=[item.model_dump(mode="json") for item in evaluated_items],
        overall_match_score=overall_score
    )

    db.add(rec_session)
    db.commit()
    db.refresh(rec_session)

    return rec_session


@router.get("/history", response_model=List[ProductRecommendationSessionResponse])
def get_recommendation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(ProductRecommendation).filter(
        ProductRecommendation.user_id == current_user.id
    ).order_by(ProductRecommendation.created_at.desc()).all()

    # Dynamically enrich historical recommendation snapshots with live purchase_url and image_url
    all_prods_map = {p.id: p for p in db.query(Product).all()}
    for s in sessions:
        if s.recommended_products:
            updated_list = []
            for item in s.recommended_products:
                if isinstance(item, dict):
                    p_data = item.get("product", {})
                    p_id = p_data.get("id")
                    if p_id and p_id in all_prods_map:
                        live_p = all_prods_map[p_id]
                        p_data["purchase_url"] = live_p.purchase_url or p_data.get("purchase_url")
                        p_data["purchase_links"] = live_p.purchase_links or p_data.get("purchase_links", {})
                        p_data["image_url"] = live_p.image_url or p_data.get("image_url")
                        p_data["brand"] = live_p.brand
                        item["product"] = p_data
                updated_list.append(item)
            s.recommended_products = updated_list

    return sessions


@router.post("/compare", response_model=ProductComparisonResponse)
def compare_products(
    payload: ProductComparisonRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not payload.product_ids or len(payload.product_ids) < 2 or len(payload.product_ids) > 4:
        raise HTTPException(status_code=400, detail="Please select between 2 and 4 products for comparison.")

    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    assessment = db.query(SkinAssessment).filter(SkinAssessment.user_id == current_user.id).order_by(SkinAssessment.created_at.desc()).first()

    products = db.query(Product).filter(Product.id.in_(payload.product_ids)).all()
    if len(products) != len(payload.product_ids):
        raise HTTPException(status_code=404, detail="One or more selected products were not found.")

    comparison_items: List[ProductComparisonItem] = []
    best_id = products[0].id
    best_score = -1.0

    for p in products:
        evaluated = calculate_product_suitability(p, profile, assessment)
        if evaluated.suitability_score > best_score:
            best_score = evaluated.suitability_score
            best_id = p.id

        pros = evaluated.match_reasons.copy()
        pros.append(f"Clinical Rating: {p.rating} / 5.0")

        comparison_items.append(
            ProductComparisonItem(
                id=p.id,
                brand=p.brand,
                name=p.name,
                category=p.category,
                price=p.price,
                rating=p.rating,
                active_ingredients=p.active_ingredients,
                suitable_skin_types=p.suitable_skin_types,
                suitable_concerns=p.suitable_concerns,
                suitability_score=evaluated.suitability_score,
                pros=pros,
                warnings=evaluated.allergy_warnings,
                purchase_url=p.purchase_url,
                purchase_links=p.purchase_links or {}
            )
        )

    best_prod = next(p for p in products if p.id == best_id)
    note = f"Best overall match: '{best_prod.brand} {best_prod.name}' with a {best_score}% suitability rating."

    return ProductComparisonResponse(
        comparison=comparison_items,
        best_match_product_id=best_id,
        recommendation_note=note
    )


@router.get("/alternatives/{product_id}", response_model=AlternativeProductsResponse)
def get_product_alternatives(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_prod = db.query(Product).filter(Product.id == product_id).first()
    if not target_prod:
        raise HTTPException(status_code=404, detail="Product not found")

    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    assessment = db.query(SkinAssessment).filter(SkinAssessment.user_id == current_user.id).order_by(SkinAssessment.created_at.desc()).first()

    candidates = db.query(Product).filter(
        Product.id != target_prod.id,
        Product.category == target_prod.category
    ).all()

    alternatives: List[AlternativeProductItem] = []
    for cand in candidates:
        evaluated = calculate_product_suitability(cand, profile, assessment)
        diff = round(cand.price - target_prod.price, 2)
        inr_diff = round((cand.price - target_prod.price) * (85.0 if cand.price < 300 else 1.0))

        reason_parts = []
        if inr_diff < 0:
            reason_parts.append(f"Budget saver (₹{abs(inr_diff):,d} cheaper)")
        elif inr_diff > 0:
            reason_parts.append(f"Premium alternative (+₹{inr_diff:,d})")
        else:
            reason_parts.append("Same price point")

        # Active ingredient overlap
        shared_actives = [ing for ing in cand.active_ingredients if any(ing.lower() in ta.lower() for ta in target_prod.active_ingredients)]
        if shared_actives:
            reason_parts.append(f"Shares active ingredients: {', '.join(shared_actives)}")

        reason = " | ".join(reason_parts)
        prod_schema = ProductResponse.model_validate(cand)

        alternatives.append(
            AlternativeProductItem(
                product=prod_schema,
                suitability_score=evaluated.suitability_score,
                price_difference=diff,
                reason=reason
            )
        )

    # Sort alternatives by suitability score descending
    alternatives.sort(key=lambda x: x.suitability_score, reverse=True)

    return AlternativeProductsResponse(
        original_product=ProductResponse.model_validate(target_prod),
        alternatives=alternatives[:4]
    )
