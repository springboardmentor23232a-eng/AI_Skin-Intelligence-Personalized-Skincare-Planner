from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.skin_profile import SkinProfile
from app.models.assessment import SkinAssessment
from app.schemas.product import ProductOut
from app.services.recommendation_service import (
    score_product_suitability,
    detect_allergy_conflicts,
)

router = APIRouter(
    prefix="/api/products",
    tags=["Product Recommendations"],
)


# =========================================================
# PRODUCT CATALOG
# =========================================================

@router.get("", response_model=List[ProductOut])
def list_products(
    search: str | None = None,
    category: str | None = None,
    sort: str = "name",
    db: Session = Depends(get_db),
):
    """
    Browse the complete product catalog.

    Examples:
        /api/products
        /api/products?search=face
        /api/products?category=serum
        /api/products?sort=rating
        /api/products?sort=bestseller
        /api/products?sort=price_low
        /api/products?sort=price_high
    """

    query = db.query(Product)

    # -----------------------------------------------------
    # SEARCH
    # -----------------------------------------------------

    if search:
        search_term = f"%{search.strip()}%"

        query = query.filter(
            (Product.name.ilike(search_term))
            | (Product.brand.ilike(search_term))
            | (Product.category.ilike(search_term))
        )

    # -----------------------------------------------------
    # CATEGORY
    # -----------------------------------------------------

    if category:
        query = query.filter(
            Product.category == category
        )

    # -----------------------------------------------------
    # SORTING
    # -----------------------------------------------------

    if sort == "rating":
        query = query.order_by(
            Product.rating.desc(),
            Product.review_count.desc(),
        )

    elif sort == "bestseller":
        query = query.order_by(
            Product.is_bestseller.desc(),
            Product.review_count.desc(),
            Product.rating.desc(),
        )

    elif sort == "price_low":
        query = query.order_by(
            Product.price.asc()
        )

    elif sort == "price_high":
        query = query.order_by(
            Product.price.desc()
        )

    else:
        query = query.order_by(
            Product.name.asc()
        )

    return query.all()


# =========================================================
# PERSONALIZED RECOMMENDATIONS
# =========================================================

@router.get(
    "/recommendations",
    response_model=List[ProductOut],
)
def get_recommendations(
    search: str | None = None,
    category: str | None = None,
    max_price: float | None = None,
    sort: str = "match",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return products ranked according to the user's:

    - Skin type
    - Age group
    - Skin concerns
    - Concern severity
    - Allergies
    - Sensitivities

    Search/category filters are applied first.
    Personalized suitability scoring is then applied.
    """

    # =====================================================
    # GET USER SKIN PROFILE
    # =====================================================

    profile = (
        db.query(SkinProfile)
        .filter(
            SkinProfile.user_id == current_user.id
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=400,
            detail="Create a skin profile first.",
        )

    # =====================================================
    # GET LATEST ASSESSMENT
    # =====================================================

    assessment = (
        db.query(SkinAssessment)
        .filter(
            SkinAssessment.user_id == current_user.id
        )
        .order_by(
            SkinAssessment.created_at.desc()
        )
        .first()
    )

    # =====================================================
    # BUILD CONCERN -> SEVERITY MAPPING
    # =====================================================

    concern_severity = {}

    if assessment:
        concern_severity = {
            concern.concern_name.lower(): concern.severity.lower()
            for concern in assessment.concerns
        }

    # =====================================================
    # START WITH COMPLETE PRODUCT CATALOG
    # =====================================================

    query = db.query(Product)

    # =====================================================
    # SEARCH ALIASES
    # =====================================================

    search_aliases = {
        # Face wash
        "face wash": "face_wash",
        "facewash": "face_wash",
        "cleanser": "face_wash",
        "cleansers": "face_wash",

        # Moisturizer
        "moisturizer": "moisturizer",
        "moisturiser": "moisturizer",
        "moisturizers": "moisturizer",
        "moisturisers": "moisturizer",

        # Serum
        "serum": "serum",
        "serums": "serum",

        # Sunscreen
        "sunscreen": "sunscreen",
        "sunscreens": "sunscreen",
        "sunblock": "sunscreen",

        # Toner
        "toner": "toner",
        "toners": "toner",

        # Treatment
        "treatment": "treatment",
        "treatments": "treatment",
    }

    # =====================================================
    # SEARCH
    # =====================================================

    if search:

        search_text = search.strip().lower()

        mapped_category = search_aliases.get(search_text)

        # Example:
        # search=face wash
        # becomes category=face_wash
        if mapped_category:

            query = query.filter(
                Product.category == mapped_category
            )

        else:

            # Normal text search
            #
            # Example:
            # search=niacinamide
            #
            # Searches:
            # - product name
            # - brand
            # - category

            search_term = f"%{search_text}%"

            query = query.filter(
                (Product.name.ilike(search_term))
                | (Product.brand.ilike(search_term))
                | (Product.category.ilike(search_term))
            )

    # =====================================================
    # CATEGORY FILTER
    # =====================================================

    if category:

        query = query.filter(
            Product.category == category
        )

    # =====================================================
    # PRICE FILTER
    # =====================================================

    if max_price is not None:

        query = query.filter(
            Product.price <= max_price
        )

    # =====================================================
    # GET PRODUCTS
    # =====================================================

    products = query.all()

    # =====================================================
    # SCORE PRODUCTS
    # =====================================================

    scored = []

    for product in products:

        # -------------------------------------------------
        # ALLERGY PROTECTION
        # -------------------------------------------------

        allergy_conflicts = detect_allergy_conflicts(
            product.key_ingredients or [],
            profile.allergies or [],
        )

        # Never recommend a known allergen
        if allergy_conflicts:
            continue

        # -------------------------------------------------
        # CALCULATE PERSONALIZED SCORE
        # -------------------------------------------------

        score = score_product_suitability(
            product_targets=product.targets_concerns or [],

            product_skin_types=(
                product.suitable_skin_types or []
            ),

            product_ingredients=(
                product.key_ingredients or []
            ),

            user_concerns=(
                profile.skin_concerns or []
            ),

            user_skin_type=(
                profile.skin_type or ""
            ),

            user_allergies=(
                profile.allergies or []
            ),

            concern_severity=concern_severity,

            user_sensitivities=(
                profile.sensitivities or []
            ),

            # AGE-BASED PERSONALIZATION
            product_age_groups=(
                product.age_groups or []
            ),

            user_age_group=(
                profile.age_group
            ),
        )

        # -------------------------------------------------
        # CREATE RESPONSE OBJECT
        # -------------------------------------------------

        out = ProductOut.model_validate(product)

        out.suitability_score = score

        scored.append(out)

    # =====================================================
    # SORT RESULTS
    # =====================================================

    if sort == "rating":

        scored.sort(
            key=lambda x: (
                x.rating or 0,
                x.review_count or 0,
            ),
            reverse=True,
        )

    elif sort == "bestseller":

        scored.sort(
            key=lambda x: (
                x.is_bestseller,
                x.suitability_score or 0,
                x.rating or 0,
                x.review_count or 0,
            ),
            reverse=True,
        )

    elif sort == "price_low":

        scored.sort(
            key=lambda x: x.price or 0
        )

    elif sort == "price_high":

        scored.sort(
            key=lambda x: x.price or 0,
            reverse=True,
        )

    else:

        # =================================================
        # DEFAULT = PERSONALIZED MATCH
        # =================================================
        #
        # Highest suitability comes first.
        #
        # If two products have the same score:
        # bestseller -> rating -> reviews
        #

        scored.sort(
            key=lambda x: (
                x.suitability_score or 0,
                x.is_bestseller,
                x.rating or 0,
                x.review_count or 0,
            ),
            reverse=True,
        )

    return scored