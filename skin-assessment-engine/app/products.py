from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .database import get_db
from . import models
from .auth import get_current_user


router = APIRouter(
    prefix="/products",
    tags=["Product Recommendations"]
)


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def split_values(value):
    """
    Convert comma-separated database values into a clean list.
    Example:
    'Dry, Combination, Sensitive'
    ->
    ['dry', 'combination', 'sensitive']
    """

    if not value:
        return []

    return [
        item.strip().lower()
        for item in str(value).split(",")
        if item.strip()
    ]


def text_contains(value, keywords):
    """
    Check whether any keyword exists in a text field.
    """

    text = str(value or "").lower()

    return any(
        keyword.lower() in text
        for keyword in keywords
    )


# =========================================================
# PRODUCT SUITABILITY / AI MATCH SCORE
# =========================================================

def calculate_match(product, assessment):

    score = 40
    reasons = []

    product_skin_types = split_values(
        product.skin_type
    )

    product_concerns = split_values(
        product.concern
    )

    assessment_skin_type = (
        str(assessment.skin_type or "").strip().lower()
    )

    assessment_concern = (
        str(assessment.main_concern or "").strip().lower()
    )

    # -----------------------------------------------------
    # 1. SKIN TYPE MATCH
    # -----------------------------------------------------

    if assessment_skin_type:

        if (
            assessment_skin_type in product_skin_types
            or "all" in product_skin_types
        ):

            score += 20

            reasons.append(
                f"Suitable for {assessment.skin_type} skin"
            )

    # -----------------------------------------------------
    # 2. MAIN CONCERN MATCH
    # -----------------------------------------------------

    if assessment_concern:

        concern_match = any(
            concern in assessment_concern
            or assessment_concern in concern
            for concern in product_concerns
        )

        if concern_match:

            score += 20

            reasons.append(
                f"Targets {assessment.main_concern}"
            )

    # -----------------------------------------------------
    # 3. ACNE
    # -----------------------------------------------------

    acne_level = str(
        assessment.acne_level or ""
    ).lower()

    if acne_level in [
        "mild",
        "moderate",
        "high",
        "severe"
    ]:

        if text_contains(
            product.concern,
            [
                "acne",
                "pimple",
                "blemish",
                "breakout"
            ]
        ):

            score += 10

            reasons.append(
                f"Relevant for {assessment.acne_level} acne"
            )

    # -----------------------------------------------------
    # 4. PIGMENTATION / DARK SPOTS
    # -----------------------------------------------------

    pigmentation = str(
        assessment.pigmentation or ""
    ).lower()

    if pigmentation in [
        "mild",
        "moderate",
        "high",
        "severe"
    ]:

        if text_contains(
            product.concern,
            [
                "dark",
                "spot",
                "pigment",
                "bright",
                "uneven"
            ]
        ):

            score += 10

            reasons.append(
                "Supports pigmentation and dark-spot care"
            )

    # -----------------------------------------------------
    # 5. SENSITIVITY
    # -----------------------------------------------------

    sensitivity = str(
        assessment.sensitivity or ""
    ).lower()

    if sensitivity in [
        "moderate",
        "high",
        "severe"
    ]:

        product_text = (
            str(product.description or "")
            + " "
            + str(product.suitable_for or "")
        ).lower()

        if any(
            word in product_text
            for word in [
                "gentle",
                "fragrance-free",
                "sensitive",
                "soothing",
                "calming",
                "barrier"
            ]
        ):

            score += 10

            reasons.append(
                "Suitable for sensitive skin"
            )

    # -----------------------------------------------------
    # 6. HYDRATION
    # -----------------------------------------------------

    hydration = str(
        assessment.hydration or ""
    ).lower()

    if hydration in [
        "poor",
        "low",
        "dry",
        "dehydrated"
    ]:

        if text_contains(
            product.description,
            [
                "hydrating",
                "hydration",
                "moisturizing",
                "moisturizer",
                "barrier"
            ]
        ):

            score += 10

            reasons.append(
                "Supports skin hydration"
            )

    # -----------------------------------------------------
    # 7. REDNESS
    # -----------------------------------------------------

    redness = str(
        assessment.redness or ""
    ).lower()

    if redness in [
        "moderate",
        "high",
        "severe"
    ]:

        if text_contains(
            product.description,
            [
                "soothing",
                "calming",
                "gentle",
                "sensitive",
                "barrier"
            ]
        ):

            score += 5

            reasons.append(
                "Supports redness and calming care"
            )

    # -----------------------------------------------------
    # FINAL SCORE
    # -----------------------------------------------------

    score = max(
        0,
        min(score, 100)
    )

    return score, reasons


# =========================================================
# PRODUCT RESPONSE BUILDER
# =========================================================

def product_to_dict(
    product,
    score=None,
    reasons=None
):

    return {

        "id": product.id,

        "name": product.name,

        "category": product.category,

        "description": product.description,

        "suitable_for": product.suitable_for,

        "skin_type": product.skin_type,

        "concern": product.concern,

        "price": product.price,

        "image_url": product.image_url,

        "match_score": score,

        "ai_reason": (
            " • ".join(reasons)
            if reasons
            else
            "Product information available."
        )
    }


# =========================================================
# GET LATEST USER ASSESSMENT
# =========================================================

def get_latest_assessment(
    db,
    user_id
):

    assessment = (
        db.query(models.SkinAssessment)
        .filter(
            models.SkinAssessment.user_id == user_id
        )
        .order_by(
            models.SkinAssessment.id.desc()
        )
        .first()
    )

    if assessment is None:

        raise HTTPException(
            status_code=404,
            detail="Please complete a skin assessment first."
        )

    return assessment


# =========================================================
# 1. PERSONALIZED PRODUCT RECOMMENDATIONS
# =========================================================

@router.get("/recommended")
def get_recommended_products(

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)

):

    user_id = current_user["id"]

    assessment = get_latest_assessment(
        db,
        user_id
    )

    products = (
        db.query(models.Product)
        .all()
    )

    recommendations = []

    for product in products:

        score, reasons = calculate_match(
            product,
            assessment
        )

        recommendations.append(
            product_to_dict(
                product,
                score,
                reasons
            )
        )

    # Best products first
    recommendations.sort(
        key=lambda x: x["match_score"],
        reverse=True
    )

    return {

        "user_id": user_id,

        "assessment_id": assessment.id,

        "skin_profile": {

            "skin_health_score":
                assessment.skin_health_score,

            "skin_type":
                assessment.skin_type,

            "main_concern":
                assessment.main_concern,

            "hydration":
                assessment.hydration,

            "acne_level":
                assessment.acne_level,

            "pigmentation":
                assessment.pigmentation,

            "sensitivity":
                assessment.sensitivity,

            "redness":
                assessment.redness,

            "texture":
                assessment.texture,

            "risk_level":
                assessment.risk_level
        },

        "total_products":
            len(recommendations),

        "products":
            recommendations[:8]
    }


# =========================================================
# 2. PRODUCT SUITABILITY SCORING
# =========================================================

@router.get("/suitability/{product_id}")
def get_product_suitability(

    product_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)

):

    user_id = current_user["id"]

    assessment = get_latest_assessment(
        db,
        user_id
    )

    product = (
        db.query(models.Product)
        .filter(
            models.Product.id == product_id
        )
        .first()
    )

    if product is None:

        raise HTTPException(
            status_code=404,
            detail="Product not found."
        )

    score, reasons = calculate_match(
        product,
        assessment
    )

    if score >= 85:
        suitability = "Excellent"

    elif score >= 70:
        suitability = "Very Good"

    elif score >= 55:
        suitability = "Good"

    elif score >= 40:
        suitability = "Moderate"

    else:
        suitability = "Low"

    return {

        "product_id":
            product.id,

        "product_name":
            product.name,

        "suitability_score":
            score,

        "suitability":
            suitability,

        "reasons":
            reasons,

        "skin_profile": {

            "skin_type":
                assessment.skin_type,

            "main_concern":
                assessment.main_concern,

            "acne_level":
                assessment.acne_level,

            "pigmentation":
                assessment.pigmentation,

            "sensitivity":
                assessment.sensitivity
        }
    }


# =========================================================
# 3. PRODUCT COMPARISON
# =========================================================

@router.get("/compare/{product_id_1}/{product_id_2}")
def compare_products(

    product_id_1: int,

    product_id_2: int,

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)

):

    user_id = current_user["id"]

    assessment = get_latest_assessment(
        db,
        user_id
    )

    product1 = (
        db.query(models.Product)
        .filter(
            models.Product.id == product_id_1
        )
        .first()
    )

    product2 = (
        db.query(models.Product)
        .filter(
            models.Product.id == product_id_2
        )
        .first()
    )

    if product1 is None:

        raise HTTPException(
            status_code=404,
            detail=f"Product {product_id_1} not found."
        )

    if product2 is None:

        raise HTTPException(
            status_code=404,
            detail=f"Product {product_id_2} not found."
        )

    score1, reasons1 = calculate_match(
        product1,
        assessment
    )

    score2, reasons2 = calculate_match(
        product2,
        assessment
    )

    if score1 > score2:
        better_match = product1.name

    elif score2 > score1:
        better_match = product2.name

    else:
        better_match = "Both products have the same suitability score."

    return {

        "comparison": {

            "product_1": product_to_dict(
                product1,
                score1,
                reasons1
            ),

            "product_2": product_to_dict(
                product2,
                score2,
                reasons2
            )
        },

        "better_match_for_user":
            better_match,

        "comparison_summary": {

            "price_difference":
                abs(
                    (product1.price or 0)
                    -
                    (product2.price or 0)
                ),

            "same_category":
                str(product1.category).lower()
                ==
                str(product2.category).lower(),

            "same_skin_type":
                str(product1.skin_type or "").lower()
                ==
                str(product2.skin_type or "").lower(),

            "same_concern":
                str(product1.concern or "").lower()
                ==
                str(product2.concern or "").lower()
        }
    }


# =========================================================
# 4. ALTERNATIVE PRODUCT SUGGESTIONS
# =========================================================

@router.get("/alternatives/{product_id}")
def get_alternative_products(

    product_id: int,

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)

):

    user_id = current_user["id"]

    assessment = get_latest_assessment(
        db,
        user_id
    )

    selected_product = (
        db.query(models.Product)
        .filter(
            models.Product.id == product_id
        )
        .first()
    )

    if selected_product is None:

        raise HTTPException(
            status_code=404,
            detail="Product not found."
        )

    all_products = (
        db.query(models.Product)
        .filter(
            models.Product.id != product_id
        )
        .all()
    )

    alternatives = []

    selected_category = str(
        selected_product.category or ""
    ).lower()

    selected_concerns = split_values(
        selected_product.concern
    )

    for product in all_products:

        score, reasons = calculate_match(
            product,
            assessment
        )

        alternative_score = score

        # Same category = stronger alternative
        if (
            str(product.category or "").lower()
            ==
            selected_category
        ):

            alternative_score += 10

        # Similar concern = stronger alternative
        product_concerns = split_values(
            product.concern
        )

        if any(
            concern in selected_concerns
            for concern in product_concerns
        ):

            alternative_score += 10

        alternative_score = min(
            alternative_score,
            100
        )

        alternatives.append(
            product_to_dict(
                product,
                alternative_score,
                reasons
            )
        )

    alternatives.sort(
        key=lambda x: x["match_score"],
        reverse=True
    )

    return {

        "original_product": {

            "id":
                selected_product.id,

            "name":
                selected_product.name,

            "category":
                selected_product.category,

            "price":
                selected_product.price
        },

        "alternatives":
            alternatives[:6]
    }


# =========================================================
# 5. BUDGET-BASED RECOMMENDATIONS
# =========================================================

@router.get("/budget")
def get_budget_products(

    max_price: int = Query(
        ...,
        ge=1,
        description="Maximum budget in Indian Rupees"
    ),

    db: Session = Depends(get_db),

    current_user=Depends(get_current_user)

):

    user_id = current_user["id"]

    assessment = get_latest_assessment(
        db,
        user_id
    )

    products = (
        db.query(models.Product)
        .filter(
            models.Product.price <= max_price
        )
        .all()
    )

    recommendations = []

    for product in products:

        score, reasons = calculate_match(
            product,
            assessment
        )

        recommendations.append(
            product_to_dict(
                product,
                score,
                reasons
            )
        )

    recommendations.sort(
        key=lambda x: (
            x["match_score"],
            -(x["price"] or 0)
        ),
        reverse=True
    )

    return {

        "user_id":
            user_id,

        "budget":
            max_price,

        "products_found":
            len(recommendations),

        "products":
            recommendations
    }


# =========================================================
# 6. COMPLETE PRODUCT ENGINE SUMMARY
# =========================================================

@router.get("/engine-status")
def product_engine_status(

    current_user=Depends(get_current_user)

):

    return {

        "module":
            "Product Recommendation Engine",

        "status":
            "COMPLETED",

        "features": {

            "personalized_recommendations":
                True,

            "product_suitability_scoring":
                True,

            "product_comparison":
                True,

            "alternative_product_suggestions":
                True,

            "budget_based_recommendations":
                True
        }
    }