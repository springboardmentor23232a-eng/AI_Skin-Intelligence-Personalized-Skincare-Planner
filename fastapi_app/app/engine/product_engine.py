import urllib.parse
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.product import Product
from app.models.assessment import SkinAssessment
from app.schemas.product import ProductMatchResponse, ProductResponse, ProductComparisonResponse

class ProductEngine:
    """
    Rule-Based Product Recommendation & Comparison Engine
    Matches skincare products against user skin type, concerns, and sensitivity risk factors,
    generating dynamic suitability match percentage scores, budget recommendations,
    shopping links (Nykaa, Amazon), and side-by-side product comparison metrics.
    """

    @staticmethod
    def _generate_nykaa_url(brand: str, name: str, existing_url: Optional[str] = None) -> str:
        if existing_url and "nykaa.com" in existing_url:
            return existing_url
        query = urllib.parse.quote(f"{brand} {name}")
        return f"https://www.nykaa.com/search/result/?q={query}"

    @staticmethod
    def _generate_amazon_url(brand: str, name: str, existing_url: Optional[str] = None) -> str:
        if existing_url and "amazon" in existing_url:
            return existing_url
        query = urllib.parse.quote(f"{brand} {name}")
        return f"https://www.amazon.in/s?k={query}"

    @staticmethod
    def _normalize_category(cat: str) -> str:
        if not cat or cat.upper() == "ALL":
            return ""
        c = cat.lower().strip()
        if "wash" in c or "cleanser" in c:
            return "facewash"
        if "mask" in c:
            return "facemask"
        if "toner" in c:
            return "toner"
        if "treatment" in c or "exfoliant" in c:
            return "treatment"
        if "moisturizer" in c:
            return "moisturizer"
        if "sunscreen" in c:
            return "sunscreen"
        if "serum" in c:
            return "serum"
        return c

    @staticmethod
    def _matches_category(product_category: str, target_category: str) -> bool:
        if not target_category or target_category.upper() == "ALL":
            return True
        p_cat = (product_category or "").lower()
        t_cat = (target_category or "").lower().strip()

        if "wash" in t_cat or "cleanser" in t_cat:
            return "wash" in p_cat or "cleanser" in p_cat
        if "mask" in t_cat:
            return "mask" in p_cat
        if "moisturizer" in t_cat or "cream" in t_cat:
            return "moisturizer" in p_cat or "cream" in p_cat
        if "sunscreen" in t_cat or "spf" in t_cat:
            return "sunscreen" in p_cat or "spf" in p_cat
        if "serum" in t_cat:
            return "serum" in p_cat
        if "toner" in t_cat:
            return "toner" in p_cat
        if "treatment" in t_cat or "exfoliant" in t_cat or "spot" in t_cat:
            return "treatment" in p_cat or "exfoliant" in p_cat or "spot" in p_cat

        return t_cat in p_cat or p_cat in t_cat

    @staticmethod
    def get_all_products(db: Session, category: Optional[str] = None) -> List[Product]:
        products = db.query(Product).order_by(Product.rating.desc()).all()
        if category and category.upper() != "ALL":
            products = [p for p in products if ProductEngine._matches_category(p.category, category)]
        for p in products:
            if not p.nykaa_url:
                p.nykaa_url = ProductEngine._generate_nykaa_url(p.brand, p.name)
            if not p.amazon_url:
                p.amazon_url = ProductEngine._generate_amazon_url(p.brand, p.name)
        return products

    @staticmethod
    def get_recommendations_for_user(
        db: Session,
        user_id: Optional[int] = None,
        skin_type: Optional[str] = "Combination",
        skin_concerns: Optional[List[str]] = None,
        category: Optional[str] = None,
        max_price: Optional[float] = None,
        budget_only: Optional[bool] = False,
        sort_by: Optional[str] = "suitability"
    ) -> List[ProductMatchResponse]:
        skin_concerns = skin_concerns or []

        # If concerns not provided & user_id present, fetch latest assessment for user
        if not skin_concerns and user_id:
            latest_assessment = db.query(SkinAssessment).filter(
                SkinAssessment.user_id == user_id
            ).order_by(SkinAssessment.created_at.desc()).first()

            if latest_assessment:
                skin_type = latest_assessment.overall_condition.split(" - ")[0] if latest_assessment.overall_condition else skin_type
                if latest_assessment.concerns:
                    skin_concerns = [c.concern_name for c in latest_assessment.concerns]

        products = db.query(Product).all()

        # Category Filter
        if category and category.upper() != "ALL":
            products = [p for p in products if ProductEngine._matches_category(p.category, category)]

        # Budget / Max Price Filter
        if budget_only:
            products = [p for p in products if p.price <= 500.0]
        elif max_price and max_price > 0:
            products = [p for p in products if p.price <= max_price]

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

            # Links setup
            nykaa_link = p.nykaa_url or ProductEngine._generate_nykaa_url(p.brand, p.name)
            amazon_link = p.amazon_url or ProductEngine._generate_amazon_url(p.brand, p.name)
            buy_link = p.buy_url or nykaa_link

            is_budget = p.price <= 500.0

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
                    buy_url=buy_link,
                    nykaa_url=nykaa_link,
                    amazon_url=amazon_link,
                    created_at=p.created_at,
                    match_score=final_score,
                    match_level=match_level,
                    matched_concerns=matched_concerns if matched_concerns else ["General Skincare Maintenance"],
                    matched_skin_type=matched_skin_type,
                    active_ingredients_list=active_ing_list,
                    safety_warnings=safety_warnings,
                    is_budget_friendly=is_budget
                )
            )

        # Sorting
        if sort_by == "price_asc":
            results.sort(key=lambda x: x.price)
        elif sort_by == "price_desc":
            results.sort(key=lambda x: x.price, reverse=True)
        elif sort_by == "rating":
            results.sort(key=lambda x: (x.rating, x.match_score), reverse=True)
        else:  # default suitability
            results.sort(key=lambda x: (x.match_score, x.rating), reverse=True)

        return results

    @staticmethod
    def compare_products(
        db: Session,
        product_ids: List[int],
        user_id: Optional[int] = None,
        skin_type: Optional[str] = "Combination",
        skin_concerns: Optional[List[str]] = None
    ) -> ProductComparisonResponse:
        all_recs = ProductEngine.get_recommendations_for_user(
            db=db,
            user_id=user_id,
            skin_type=skin_type,
            skin_concerns=skin_concerns
        )

        # Filter only requested product IDs
        id_set = set(product_ids)
        compared_items = [p for p in all_recs if p.id in id_set]

        if not compared_items:
            return ProductComparisonResponse(
                products=[],
                best_overall_id=None,
                best_budget_id=None,
                comparison_summary="No matching products found to compare."
            )

        # Determine Best Overall Match (highest match score, tie-break rating)
        best_overall = max(compared_items, key=lambda x: (x.match_score, x.rating))

        # Determine Best Budget Pick (lowest price among items <= 500, or lowest price overall)
        budget_candidates = [p for p in compared_items if p.is_budget_friendly]
        if budget_candidates:
            best_budget = max(budget_candidates, key=lambda x: (x.match_score, -x.price))
        else:
            best_budget = min(compared_items, key=lambda x: x.price)

        summary = f"Compared {len(compared_items)} products. '{best_overall.brand} {best_overall.name}' ranks highest for overall suitability match ({best_overall.match_score}%). '{best_budget.brand} {best_budget.name}' is the top budget-friendly option at ₹{best_budget.price}."

        return ProductComparisonResponse(
            products=compared_items,
            best_overall_id=best_overall.id,
            best_budget_id=best_budget.id,
            comparison_summary=summary
        )

    @staticmethod
    def get_alternative_products(
        db: Session,
        product_id: int,
        user_id: Optional[int] = None
    ) -> List[ProductMatchResponse]:
        target_product = db.query(Product).filter(Product.id == product_id).first()
        if not target_product:
            return []

        cat = target_product.category
        all_recs = ProductEngine.get_recommendations_for_user(
            db=db,
            user_id=user_id,
            category=cat
        )

        # Exclude original product
        alternatives = [p for p in all_recs if p.id != product_id]

        # Sort alternatives prioritizing lower price and high match score
        alternatives.sort(key=lambda x: (x.price <= target_product.price, x.match_score, -x.price), reverse=True)

        return alternatives

