from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.product import Product
from app.models.assessment import SkinAssessment
from app.schemas.product import ProductMatchResponse, ProductResponse

class ProductEngine:
    """
    Module 6: Rule-Based Product Recommendation Engine
    Matches skincare products against user skin type, concerns, and sensitivity risk factors,
    generating dynamic match percentage scores and safety flags.
    """

    @staticmethod
    def get_all_products(db: Session, category: Optional[str] = None) -> List[Product]:
        query = db.query(Product)
        if category and category.upper() != "ALL":
            query = query.filter(Product.category.ilike(category))
        return query.order_by(Product.rating.desc()).all()

    @staticmethod
    def get_recommendations_for_user(
        db: Session,
        user_id: int,
        skin_type: Optional[str] = "Combination",
        skin_concerns: Optional[List[str]] = None,
        category: Optional[str] = None
    ) -> List[ProductMatchResponse]:
        skin_concerns = skin_concerns or []

        # If concerns not provided, fetch latest assessment for user
        if not skin_concerns:
            latest_assessment = db.query(SkinAssessment).filter(
                SkinAssessment.user_id == user_id
            ).order_by(SkinAssessment.created_at.desc()).first()

            if latest_assessment:
                skin_type = latest_assessment.overall_condition.split(" - ")[0] if latest_assessment.overall_condition else skin_type
                if latest_assessment.concerns:
                    skin_concerns = [c.concern_name for c in latest_assessment.concerns]

        products = db.query(Product).all()
        if category and category.upper() != "ALL":
            products = [p for p in products if p.category.lower() == category.lower()]

        results: List[ProductMatchResponse] = []
        user_skin_lower = skin_type.lower() if skin_type else "combination"
        user_concerns_lower = [c.lower() for c in skin_concerns]

        for p in products:
            match_score = 50
            matched_concerns = []
            matched_skin_type = False
            safety_warnings = []

            # 1. Skin Type Check
            prod_types_lower = p.target_skin_types.lower()
            if "all" in prod_types_lower or user_skin_lower in prod_types_lower:
                match_score += 25
                matched_skin_type = True

            # 2. Concerns Check
            prod_concerns_lower = p.target_concerns.lower()
            for uc in user_concerns_lower:
                if uc in prod_concerns_lower or prod_concerns_lower in uc:
                    match_score += 15
                    matched_concerns.append(uc.capitalize())

            # 3. Product Rating Boost
            if p.rating >= 4.5:
                match_score += 10

            # Cap match score between 60 and 98
            final_score = min(98, max(60, match_score))

            # Match Level Classification
            if final_score >= 88:
                match_level = "EXCELLENT_MATCH"
            elif final_score >= 75:
                match_level = "GOOD_MATCH"
            else:
                match_level = "MODERATE_MATCH"

            # Sensitive Skin Warning Check
            if "sensitive" in user_skin_lower and any(h in p.active_ingredients.lower() for h in ["glycolic", "retinol", "fragrance", "alcohol"]):
                safety_warnings.append("Contains active exfoliant/retinoid — patch test recommended for sensitive skin.")

            active_ing_list = [i.strip() for i in p.active_ingredients.split(",") if i.strip()]

            results.append(
                ProductMatchResponse(
                    id=p.id,
                    brand=p.brand,
                    name=p.name,
                    category=p.category,
                    active_ingredients=p.active_ingredients,
                    target_skin_types=p.target_skin_types,
                    target_concerns=p.target_concerns,
                    price=p.price,
                    rating=p.rating,
                    reviews_count=p.reviews_count,
                    image_url=p.image_url,
                    buy_url=p.buy_url,
                    created_at=p.created_at,
                    match_score=final_score,
                    match_level=match_level,
                    matched_concerns=matched_concerns if matched_concerns else ["General Skincare Maintenance"],
                    matched_skin_type=matched_skin_type,
                    active_ingredients_list=active_ing_list,
                    safety_warnings=safety_warnings
                )
            )

        # Sort results by match score descending
        results.sort(key=lambda x: x.match_score, reverse=True)
        return results
