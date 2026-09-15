from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import get_db
from . import models, schemas
from .auth import get_current_user


router = APIRouter(
    prefix="/ingredients",
    tags=["Ingredient Intelligence"]
)


# =========================================================
# 1. CREATE INGREDIENT
# =========================================================

@router.post(
    "/",
    response_model=schemas.IngredientResponse
)
def create_ingredient(
    ingredient: schemas.IngredientCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    existing = (
        db.query(models.Ingredient)
        .filter(
            models.Ingredient.name == ingredient.name
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Ingredient already exists."
        )

    new_ingredient = models.Ingredient(
        name=ingredient.name,
        category=ingredient.category,
        description=ingredient.description,
        function=ingredient.function
    )

    db.add(new_ingredient)
    db.commit()
    db.refresh(new_ingredient)

    return new_ingredient


# =========================================================
# 2. GET ALL INGREDIENTS
# =========================================================

@router.get("/")
def get_ingredients(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    ingredients = (
        db.query(models.Ingredient)
        .order_by(
            models.Ingredient.name.asc()
        )
        .all()
    )

    return ingredients


# =========================================================
# 3. ADD INGREDIENT BENEFIT
# =========================================================

@router.post(
    "/benefit",
    response_model=schemas.IngredientBenefitResponse
)
def create_ingredient_benefit(
    benefit: schemas.IngredientBenefitCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    ingredient = (
        db.query(models.Ingredient)
        .filter(
            models.Ingredient.id
            == benefit.ingredient_id
        )
        .first()
    )

    if ingredient is None:
        raise HTTPException(
            status_code=404,
            detail="Ingredient not found."
        )

    new_benefit = models.IngredientBenefit(
        ingredient_id=benefit.ingredient_id,
        skin_type=benefit.skin_type,
        skin_concern=benefit.skin_concern,
        benefit=benefit.benefit,
        suitability=benefit.suitability
    )

    db.add(new_benefit)
    db.commit()
    db.refresh(new_benefit)

    return new_benefit


# =========================================================
# 4. ADD INGREDIENT TO PRODUCT
# =========================================================

@router.post(
    "/product",
    response_model=schemas.ProductIngredientResponse
)
def add_product_ingredient(
    data: schemas.ProductIngredientCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    product = (
        db.query(models.Product)
        .filter(
            models.Product.id == data.product_id
        )
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found."
        )

    ingredient = (
        db.query(models.Ingredient)
        .filter(
            models.Ingredient.id
            == data.ingredient_id
        )
        .first()
    )

    if ingredient is None:
        raise HTTPException(
            status_code=404,
            detail="Ingredient not found."
        )

    existing = (
        db.query(models.ProductIngredient)
        .filter(
            models.ProductIngredient.product_id
            == data.product_id,
            models.ProductIngredient.ingredient_id
            == data.ingredient_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Ingredient is already linked to this product."
        )

    product_ingredient = models.ProductIngredient(
        product_id=data.product_id,
        ingredient_id=data.ingredient_id,
        concentration=data.concentration,
        notes=data.notes
    )

    db.add(product_ingredient)
    db.commit()
    db.refresh(product_ingredient)

    return product_ingredient


# =========================================================
# 5. GET PRODUCT INGREDIENTS
# =========================================================

@router.get("/product/{product_id}")
def get_product_ingredients(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

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

    mappings = (
        db.query(models.ProductIngredient)
        .filter(
            models.ProductIngredient.product_id
            == product_id
        )
        .all()
    )

    result = []

    for mapping in mappings:

        ingredient = (
            db.query(models.Ingredient)
            .filter(
                models.Ingredient.id
                == mapping.ingredient_id
            )
            .first()
        )

        if ingredient:

            result.append({
                "ingredient_id": ingredient.id,
                "ingredient_name": ingredient.name,
                "category": ingredient.category,
                "description": ingredient.description,
                "function": ingredient.function,
                "concentration": mapping.concentration,
                "notes": mapping.notes
            })

    return {
        "product_id": product_id,
        "product_name": product.name,
        "total_ingredients": len(result),
        "ingredients": result
    }


# =========================================================
# 6. INGREDIENT SUITABILITY
# =========================================================

@router.get("/suitability/{ingredient_id}")
def ingredient_suitability(
    ingredient_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    ingredient = (
        db.query(models.Ingredient)
        .filter(
            models.Ingredient.id
            == ingredient_id
        )
        .first()
    )

    if ingredient is None:
        raise HTTPException(
            status_code=404,
            detail="Ingredient not found."
        )

    benefits = (
        db.query(models.IngredientBenefit)
        .filter(
            models.IngredientBenefit.ingredient_id
            == ingredient_id
        )
        .all()
    )

    suitability = (
        db.query(models.IngredientSuitability)
        .filter(
            models.IngredientSuitability.ingredient_id
            == ingredient_id
        )
        .all()
    )

    return {
        "ingredient": {
            "id": ingredient.id,
            "name": ingredient.name,
            "category": ingredient.category,
            "description": ingredient.description,
            "function": ingredient.function
        },

        "benefits": [
            {
                "skin_type": item.skin_type,
                "skin_concern": item.skin_concern,
                "benefit": item.benefit,
                "suitability": item.suitability
            }
            for item in benefits
        ],

        "suitability": [
            {
                "skin_type": item.skin_type,
                "skin_concern": item.skin_concern,
                "suitability": item.suitability,
                "reason": item.reason,
                "caution": item.caution
            }
            for item in suitability
        ]
    }


# =========================================================
# 7. INGREDIENT EDUCATION
# =========================================================

@router.get("/education/{ingredient_id}")
def ingredient_education(
    ingredient_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    ingredient = (
        db.query(models.Ingredient)
        .filter(
            models.Ingredient.id
            == ingredient_id
        )
        .first()
    )

    if ingredient is None:
        raise HTTPException(
            status_code=404,
            detail="Ingredient not found."
        )

    benefits = (
        db.query(models.IngredientBenefit)
        .filter(
            models.IngredientBenefit.ingredient_id
            == ingredient_id
        )
        .all()
    )

    return {
        "id": ingredient.id,
        "name": ingredient.name,
        "category": ingredient.category,
        "what_it_is": ingredient.description,
        "function": ingredient.function,

        "benefits": [
            {
                "skin_type": benefit.skin_type,
                "skin_concern": benefit.skin_concern,
                "benefit": benefit.benefit,
                "suitability": benefit.suitability
            }
            for benefit in benefits
        ]
    }


# =========================================================
# 8. CREATE INGREDIENT INTERACTION
# =========================================================

@router.post(
    "/interaction",
    response_model=schemas.IngredientInteractionResponse
)
def create_ingredient_interaction(
    data: schemas.IngredientInteractionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    if data.ingredient_id_1 == data.ingredient_id_2:
        raise HTTPException(
            status_code=400,
            detail="An ingredient cannot interact with itself."
        )

    ingredient_1 = (
        db.query(models.Ingredient)
        .filter(
            models.Ingredient.id
            == data.ingredient_id_1
        )
        .first()
    )

    if ingredient_1 is None:
        raise HTTPException(
            status_code=404,
            detail="First ingredient not found."
        )

    ingredient_2 = (
        db.query(models.Ingredient)
        .filter(
            models.Ingredient.id
            == data.ingredient_id_2
        )
        .first()
    )

    if ingredient_2 is None:
        raise HTTPException(
            status_code=404,
            detail="Second ingredient not found."
        )

    existing = (
        db.query(models.IngredientInteraction)
        .filter(
            (
                (
                    models.IngredientInteraction.ingredient_id_1
                    == data.ingredient_id_1
                )
                &
                (
                    models.IngredientInteraction.ingredient_id_2
                    == data.ingredient_id_2
                )
            )
            |
            (
                (
                    models.IngredientInteraction.ingredient_id_1
                    == data.ingredient_id_2
                )
                &
                (
                    models.IngredientInteraction.ingredient_id_2
                    == data.ingredient_id_1
                )
            )
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="This ingredient interaction already exists."
        )

    new_interaction = models.IngredientInteraction(
        ingredient_id_1=data.ingredient_id_1,
        ingredient_id_2=data.ingredient_id_2,
        interaction_type=data.interaction_type,
        severity=data.severity,
        description=data.description,
        recommendation=data.recommendation
    )

    db.add(new_interaction)
    db.commit()
    db.refresh(new_interaction)

    return new_interaction


# =========================================================
# 9. GET ALL INGREDIENT INTERACTIONS
# =========================================================

@router.get("/interactions")
def get_all_ingredient_interactions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    interactions = (
        db.query(models.IngredientInteraction)
        .all()
    )

    result = []

    for interaction in interactions:

        ingredient_1 = (
            db.query(models.Ingredient)
            .filter(
                models.Ingredient.id
                == interaction.ingredient_id_1
            )
            .first()
        )

        ingredient_2 = (
            db.query(models.Ingredient)
            .filter(
                models.Ingredient.id
                == interaction.ingredient_id_2
            )
            .first()
        )

        result.append({
            "id": interaction.id,

            "ingredient_1": (
                ingredient_1.name
                if ingredient_1
                else "Unknown"
            ),

            "ingredient_2": (
                ingredient_2.name
                if ingredient_2
                else "Unknown"
            ),

            "interaction_type":
                interaction.interaction_type,

            "severity":
                interaction.severity,

            "description":
                interaction.description,

            "recommendation":
                interaction.recommendation,

            "created_at":
                interaction.created_at
        })

    return {
        "total_interactions": len(result),
        "interactions": result
    }


# =========================================================
# 10. ADD USER INGREDIENT ALLERGY
# =========================================================

@router.post(
    "/allergy",
    response_model=schemas.UserIngredientAllergyResponse
)
def add_user_ingredient_allergy(
    data: schemas.UserIngredientAllergyCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    user_id = current_user["id"]

    ingredient = (
        db.query(models.Ingredient)
        .filter(
            models.Ingredient.id
            == data.ingredient_id
        )
        .first()
    )

    if ingredient is None:
        raise HTTPException(
            status_code=404,
            detail="Ingredient not found."
        )

    existing = (
        db.query(models.UserIngredientAllergy)
        .filter(
            models.UserIngredientAllergy.user_id
            == user_id,
            models.UserIngredientAllergy.ingredient_id
            == data.ingredient_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="You have already added this ingredient allergy."
        )

    new_allergy = models.UserIngredientAllergy(
        user_id=user_id,
        ingredient_id=data.ingredient_id,
        reaction=data.reaction,
        severity=data.severity,
        notes=data.notes
    )

    db.add(new_allergy)
    db.commit()
    db.refresh(new_allergy)

    return new_allergy


# =========================================================
# 11. GET MY INGREDIENT ALLERGIES
# =========================================================

@router.get("/allergy")
def get_my_ingredient_allergies(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    user_id = current_user["id"]

    allergies = (
        db.query(models.UserIngredientAllergy)
        .filter(
            models.UserIngredientAllergy.user_id
            == user_id
        )
        .all()
    )

    result = []

    for allergy in allergies:

        ingredient = (
            db.query(models.Ingredient)
            .filter(
                models.Ingredient.id
                == allergy.ingredient_id
            )
            .first()
        )

        result.append({
            "id": allergy.id,

            "ingredient_id":
                allergy.ingredient_id,

            "ingredient_name": (
                ingredient.name
                if ingredient
                else "Unknown"
            ),

            "reaction":
                allergy.reaction,

            "severity":
                allergy.severity,

            "notes":
                allergy.notes,

            "created_at":
                allergy.created_at
        })

    return {
        "total_allergies": len(result),
        "allergies": result
    }


# =========================================================
# 12. CHECK PRODUCT FOR USER ALLERGIES
# =========================================================

@router.get("/allergy/product/{product_id}")
def check_product_allergies(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    user_id = current_user["id"]

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

    product_ingredients = (
        db.query(models.ProductIngredient)
        .filter(
            models.ProductIngredient.product_id
            == product_id
        )
        .all()
    )

    user_allergies = (
        db.query(models.UserIngredientAllergy)
        .filter(
            models.UserIngredientAllergy.user_id
            == user_id
        )
        .all()
    )

    allergy_map = {
        allergy.ingredient_id: allergy
        for allergy in user_allergies
    }

    warnings = []

    for mapping in product_ingredients:

        if mapping.ingredient_id in allergy_map:

            ingredient = (
                db.query(models.Ingredient)
                .filter(
                    models.Ingredient.id
                    == mapping.ingredient_id
                )
                .first()
            )

            allergy = allergy_map[
                mapping.ingredient_id
            ]

            warnings.append({
                "ingredient_id":
                    mapping.ingredient_id,

                "ingredient_name": (
                    ingredient.name
                    if ingredient
                    else "Unknown"
                ),

                "reaction":
                    allergy.reaction,

                "severity":
                    allergy.severity,

                "warning":
                    "This product contains an ingredient "
                    "you have marked as an allergy or sensitivity."
            })

    return {
        "product_id":
            product.id,

        "product_name":
            product.name,

        "safe":
            len(warnings) == 0,

        "total_warnings":
            len(warnings),

        "warnings":
            warnings
    }


# =========================================================
# 13. GET ONE INGREDIENT
# =========================================================
# IMPORTANT:
# Keep this route at the VERY END.
# Otherwise /allergy, /education, /suitability, etc.
# can be incorrectly treated as an ingredient_id.
# =========================================================

@router.get("/{ingredient_id}")
def get_ingredient(
    ingredient_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    ingredient = (
        db.query(models.Ingredient)
        .filter(
            models.Ingredient.id == ingredient_id
        )
        .first()
    )

    if ingredient is None:
        raise HTTPException(
            status_code=404,
            detail="Ingredient not found."
        )

    return ingredient
# =========================================================
# 16. CHECK INGREDIENT INTERACTION
# =========================================================

@router.get(
    "/interaction/check/{ingredient_id_1}/{ingredient_id_2}"
)
def check_ingredient_interaction(
    ingredient_id_1: int,
    ingredient_id_2: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    # Same ingredient check
    if ingredient_id_1 == ingredient_id_2:
        raise HTTPException(
            status_code=400,
            detail="An ingredient cannot interact with itself."
        )

    # Check first ingredient
    ingredient_1 = (
        db.query(models.Ingredient)
        .filter(
            models.Ingredient.id == ingredient_id_1
        )
        .first()
    )

    if ingredient_1 is None:
        raise HTTPException(
            status_code=404,
            detail="First ingredient not found."
        )

    # Check second ingredient
    ingredient_2 = (
        db.query(models.Ingredient)
        .filter(
            models.Ingredient.id == ingredient_id_2
        )
        .first()
    )

    if ingredient_2 is None:
        raise HTTPException(
            status_code=404,
            detail="Second ingredient not found."
        )

    # Check interaction in either direction
    interaction = (
        db.query(models.IngredientInteraction)
        .filter(
            (
                (models.IngredientInteraction.ingredient_id_1 == ingredient_id_1)
                &
                (models.IngredientInteraction.ingredient_id_2 == ingredient_id_2)
            )
            |
            (
                (models.IngredientInteraction.ingredient_id_1 == ingredient_id_2)
                &
                (models.IngredientInteraction.ingredient_id_2 == ingredient_id_1)
            )
        )
        .first()
    )

    # No interaction found
    if interaction is None:
        return {
            "ingredient_1": ingredient_1.name,
            "ingredient_2": ingredient_2.name,
            "interaction_found": False,
            "safe_to_combine": True,
            "message": "No known interaction found between these ingredients."
        }

    # Interaction found
    return {
        "ingredient_1": ingredient_1.name,
        "ingredient_2": ingredient_2.name,
        "interaction_found": True,
        "safe_to_combine": False,
        "interaction_type": interaction.interaction_type,
        "severity": interaction.severity,
        "description": interaction.description,
        "recommendation": interaction.recommendation
    }
# =========================================================
# 17. CHECK PRODUCT INGREDIENT INTERACTIONS
# =========================================================

@router.get("/interaction/product/{product_id}")
def check_product_interactions(
    product_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    # Check product
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

    # Get all ingredients belonging to the product
    product_ingredients = (
        db.query(models.ProductIngredient)
        .filter(
            models.ProductIngredient.product_id
            == product_id
        )
        .all()
    )

    ingredient_ids = [
        item.ingredient_id
        for item in product_ingredients
    ]

    # If product has fewer than 2 ingredients
    if len(ingredient_ids) < 2:
        return {
            "product_id": product.id,
            "product_name": product.name,
            "interaction_found": False,
            "safe_to_use": True,
            "total_interactions": 0,
            "message": "Product does not contain enough ingredients to check interactions.",
            "interactions": []
        }

    interactions_found = []

    # Check every ingredient combination
    for i in range(len(ingredient_ids)):

        for j in range(i + 1, len(ingredient_ids)):

            ingredient_id_1 = ingredient_ids[i]
            ingredient_id_2 = ingredient_ids[j]

            interaction = (
                db.query(models.IngredientInteraction)
                .filter(
                    (
                        (
                            models.IngredientInteraction.ingredient_id_1
                            == ingredient_id_1
                        )
                        &
                        (
                            models.IngredientInteraction.ingredient_id_2
                            == ingredient_id_2
                        )
                    )
                    |
                    (
                        (
                            models.IngredientInteraction.ingredient_id_1
                            == ingredient_id_2
                        )
                        &
                        (
                            models.IngredientInteraction.ingredient_id_2
                            == ingredient_id_1
                        )
                    )
                )
                .first()
            )

            if interaction:

                ingredient_1 = (
                    db.query(models.Ingredient)
                    .filter(
                        models.Ingredient.id
                        == ingredient_id_1
                    )
                    .first()
                )

                ingredient_2 = (
                    db.query(models.Ingredient)
                    .filter(
                        models.Ingredient.id
                        == ingredient_id_2
                    )
                    .first()
                )

                interactions_found.append({
                    "ingredient_1": (
                        ingredient_1.name
                        if ingredient_1
                        else "Unknown"
                    ),

                    "ingredient_2": (
                        ingredient_2.name
                        if ingredient_2
                        else "Unknown"
                    ),

                    "interaction_type":
                        interaction.interaction_type,

                    "severity":
                        interaction.severity,

                    "description":
                        interaction.description,

                    "recommendation":
                        interaction.recommendation
                })

    return {
        "product_id": product.id,

        "product_name":
            product.name,

        "interaction_found":
            len(interactions_found) > 0,

        "safe_to_use":
            len(interactions_found) == 0,

        "total_interactions":
            len(interactions_found),

        "interactions":
            interactions_found
    }
# =========================================================
# 18. PERSONALIZED INGREDIENT ANALYSIS
# =========================================================

@router.get("/analyze/{user_id}/{ingredient_id}")
def analyze_ingredient(
    user_id: int,
    ingredient_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    # -----------------------------------------------------
    # 1. Get client
    # -----------------------------------------------------

    user = (
        db.query(models.User)
        .filter(models.User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="Client not found."
        )

    # -----------------------------------------------------
    # 2. Get latest skin assessment
    # -----------------------------------------------------

    assessment = (
        db.query(models.SkinAssessment)
        .filter(
            models.SkinAssessment.user_id == user_id
        )
        .order_by(
            models.SkinAssessment.assessment_date.desc()
        )
        .first()
    )

    # -----------------------------------------------------
    # 3. Get ingredient
    # -----------------------------------------------------

    ingredient = (
        db.query(models.Ingredient)
        .filter(
            models.Ingredient.id == ingredient_id
        )
        .first()
    )

    if ingredient is None:
        raise HTTPException(
            status_code=404,
            detail="Ingredient not found."
        )

    # -----------------------------------------------------
    # 4. Default profile values
    # -----------------------------------------------------

    skin_type = None
    primary_concern = None
    sensitivity = None
    skin_score = None

    if assessment:

        skin_type = assessment.skin_type
        primary_concern = assessment.main_concern
        sensitivity = assessment.sensitivity
        skin_score = assessment.skin_health_score

    # -----------------------------------------------------
    # 5. Get ingredient benefits
    # -----------------------------------------------------

    benefits = (
        db.query(models.IngredientBenefit)
        .filter(
            models.IngredientBenefit.ingredient_id
            == ingredient_id
        )
        .all()
    )

    benefit_list = []

    for benefit in benefits:

        if benefit.benefit:
            benefit_list.append(
                benefit.benefit
            )

    # -----------------------------------------------------
    # 6. Check personalized suitability
    # -----------------------------------------------------

    suitability = "Generally Suitable"

    suitability_reason = (
        "No major conflict found with the available "
        "client profile."
    )

    precautions = ingredient.description

    # High sensitivity
    if sensitivity == "High":

        suitability = "Use With Caution"

        suitability_reason = (
            "The client has high skin sensitivity. "
            "Introduce this ingredient gradually and "
            "monitor for irritation."
        )

    # Dry skin + hydration ingredients
    elif (
        skin_type == "Dry"
        and ingredient.name.lower()
        in ["hyaluronic acid", "ceramides"]
    ):

        suitability = "Highly Suitable"

        suitability_reason = (
            "This ingredient is well aligned with "
            "the client's dry skin profile."
        )

    # Oily skin + acne ingredients
    elif (
        skin_type in ["Oily", "Combination"]
        and ingredient.name.lower()
        in ["salicylic acid", "niacinamide"]
    ):

        suitability = "Suitable"

        suitability_reason = (
            "This ingredient may support the client's "
            "oily or combination skin concerns."
        )

    # Acne concern
    elif (
        primary_concern
        and "acne" in primary_concern.lower()
        and ingredient.name.lower()
        in ["salicylic acid", "niacinamide"]
    ):

        suitability = "Suitable"

        suitability_reason = (
            "This ingredient may be beneficial for "
            "the client's acne-related concern."
        )

    # Pigmentation
    elif (
        primary_concern
        and "pigmentation" in primary_concern.lower()
        and ingredient.name.lower()
        in ["vitamin c", "niacinamide"]
    ):

        suitability = "Suitable"

        suitability_reason = (
            "This ingredient is aligned with the "
            "client's pigmentation concern."
        )

    # -----------------------------------------------------
    # 7. Check user-specific ingredient allergy
    # -----------------------------------------------------

    user_allergy = (
        db.query(models.UserIngredientAllergy)
        .filter(
            models.UserIngredientAllergy.user_id
            == user_id,

            models.UserIngredientAllergy.ingredient_id
            == ingredient_id
        )
        .first()
    )

    if user_allergy:

        allergy_status = "Review Required"

        suitability = "Avoid / Review"

        precautions = (
            "The client has a recorded allergy or "
            "sensitivity to this ingredient."
        )

    else:

        allergy_status = "Clear"

    # -----------------------------------------------------
    # 8. Return complete analysis
    # -----------------------------------------------------

    return {

        "user_id": user.id,

        "client_name": user.name,

        "skin_type": skin_type,

        "primary_concern": primary_concern,

        "sensitivity": sensitivity,

        "skin_score": skin_score,

        "ingredient_id": ingredient.id,

        "ingredient_name": ingredient.name,

        "category": ingredient.category,

        "description": ingredient.description,

        "function": ingredient.function,

        "benefits": benefit_list,

        "suitability": suitability,

        "suitability_reason": suitability_reason,

        "precautions": precautions,

        "allergy_status": allergy_status,

        "allergy_warning": (
            user_allergy.notes
            if user_allergy
            else None
        )
    }