from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.models.ingredient import Ingredient
from app.models.skin_profile import SkinProfile
from app.schemas.product import IngredientOut


router = APIRouter(
    prefix="/api/ingredients",
    tags=["Ingredient Intelligence"],
)


# =========================================================
# HELPER
# =========================================================

def normalize_list(values):
    """
    Convert values to normalized lowercase strings.
    """
    if not values:
        return set()

    return {
        str(value).strip().lower().replace("-", "_").replace(" ", "_")
        for value in values
        if value
    }


# Common aliases used when recording allergies/sensitivities.
# This helps match equivalent ingredient names.
INGREDIENT_ALIASES = {
    "retinoid": {
        "retinoid",
        "retinoids",
        "retinol",
        "retinal",
        "retinaldehyde",
        "tretinoin",
    },
    "niacinamide": {
        "niacinamide",
        "nicotinamide",
    },
    "vitamin_c": {
        "vitamin_c",
        "vitamin_c_derivative",
        "ascorbic_acid",
        "l_ascorbic_acid",
    },
    "hyaluronic_acid": {
        "hyaluronic_acid",
        "hyaluronan",
        "sodium_hyaluronate",
    },
    "salicylic_acid": {
        "salicylic_acid",
        "salicylates",
    },
    "ceramides": {
        "ceramides",
        "ceramide",
    },
    "peptides": {
        "peptides",
        "peptide",
    },
    "ahas_bhas": {
        "ahas_bhas",
        "aha",
        "ahas",
        "bha",
        "bhas",
        "chemical_exfoliants",
    },
}


CONCERN_ALIASES = {
    "acne": {
        "acne",
        "breakouts",
        "breakout",
        "pimples",
        "blemishes",
        "clogged_pores",
        "excess_oil",
        "oily_skin",
    },
    "hyperpigmentation": {
        "hyperpigmentation",
        "dark_spots",
        "uneven_skin_tone",
        "post_acne_marks",
        "pigmentation",
    },
    "wrinkles": {
        "wrinkles",
        "fine_lines",
        "aging",
        "signs_of_aging",
    },
    "dryness": {
        "dryness",
        "dehydration",
        "dehydrated_skin",
    },
}


def values_match(value: str, candidates: set) -> bool:
    """
    Check whether a value matches any candidate directly
    or through a known ingredient alias.
    """
    normalized_value = (
        str(value)
        .strip()
        .lower()
        .replace("-", "_")
        .replace(" ", "_")
    )

    if normalized_value in candidates:
        return True

    for canonical, aliases in INGREDIENT_ALIASES.items():
        if normalized_value in aliases and (
            canonical in candidates
            or bool(candidates.intersection(aliases))
        ):
            return True

    return False


def concern_matches_profile(
    profile_concerns: set,
    ingredient_good_for: set,
) -> list:
    """
    Match related skin concerns instead of requiring
    exact string equality.
    """
    matches = set()

    for concern in profile_concerns:
        for canonical, aliases in CONCERN_ALIASES.items():

            concern_is_alias = (
                concern == canonical
                or concern in aliases
            )

            if not concern_is_alias:
                continue

            for ingredient_concern in ingredient_good_for:
                if (
                    ingredient_concern == canonical
                    or ingredient_concern in aliases
                ):
                    matches.add(concern)

    # Also preserve exact matches for future database values.
    matches.update(
        profile_concerns.intersection(ingredient_good_for)
    )

    return sorted(matches)


# =========================================================
# GET ALL INGREDIENTS
# =========================================================

@router.get(
    "",
    response_model=List[IngredientOut]
)
def list_ingredients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Ingredient)
        .order_by(Ingredient.name.asc())
        .all()
    )


# =========================================================
# CREATE INGREDIENT
# =========================================================

@router.post(
    "",
    response_model=IngredientOut,
    dependencies=[
        Depends(require_roles(UserRole.admin))
    ],
)
def create_ingredient(
    payload: IngredientOut,
    db: Session = Depends(get_db),
):
    ingredient = Ingredient(
        **payload.dict(
            exclude={"id"}
        )
    )

    db.add(ingredient)
    db.commit()
    db.refresh(ingredient)

    return ingredient


# =========================================================
# INGREDIENT PERSONALIZED ANALYSIS
# =========================================================

@router.get("/{ingredient_id}/analysis")
def analyze_ingredient(
    ingredient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Analyze an ingredient against the logged-in
    patient's Skin Profile.

    Checks:
    - allergies
    - sensitivities
    - skin concerns
    - avoid_if
    - good_for
    """

    # -----------------------------------------------------
    # FIND INGREDIENT
    # -----------------------------------------------------

    ingredient = (
        db.query(Ingredient)
        .filter(
            Ingredient.id == ingredient_id
        )
        .first()
    )

    if not ingredient:
        raise HTTPException(
            status_code=404,
            detail="Ingredient not found",
        )

    # -----------------------------------------------------
    # FIND PATIENT SKIN PROFILE
    # -----------------------------------------------------

    profile = (
        db.query(SkinProfile)
        .filter(
            SkinProfile.user_id
            == current_user.id
        )
        .first()
    )

    # -----------------------------------------------------
    # NO PROFILE
    # -----------------------------------------------------

    if not profile:

        return {
            "ingredient": {
                "id": str(ingredient.id),
                "name": ingredient.name,
                "category": ingredient.category,
                "description": ingredient.description,
                "good_for": ingredient.good_for or [],
                "avoid_if": ingredient.avoid_if or [],
                "interacts_badly_with":
                    ingredient.interacts_badly_with
                    or [],
            },

            "profile_available": False,

            "status": "unknown",

            "score": None,

            "allergy_conflicts": [],

            "sensitivity_conflicts": [],

            "concern_matches": [],

            "avoid_matches": [],

            "recommendation":
                "Complete your Skin Profile to receive personalized ingredient analysis.",

            "reason":
                "No Skin Profile was found for this account.",
        }

    # -----------------------------------------------------
    # NORMALIZE PATIENT DATA
    # -----------------------------------------------------

    allergies = normalize_list(
        profile.allergies
    )

    sensitivities = normalize_list(
        profile.sensitivities
    )

    concerns = normalize_list(
        profile.skin_concerns
    )

    skin_type = (
        profile.skin_type.strip().lower()
        if profile.skin_type
        else ""
    )

    # -----------------------------------------------------
    # NORMALIZE INGREDIENT DATA
    # -----------------------------------------------------

    ingredient_name = (
        ingredient.name.strip().lower()
    )

    good_for = normalize_list(
        ingredient.good_for
    )

    avoid_if = normalize_list(
        ingredient.avoid_if
    )

    # -----------------------------------------------------
    # ALLERGY CHECK
    # -----------------------------------------------------

    allergy_conflicts = []

    if values_match(ingredient_name, allergies):
        allergy_conflicts.append(
            ingredient.name
        )

    # -----------------------------------------------------
    # SENSITIVITY CHECK
    # -----------------------------------------------------

    sensitivity_conflicts = []

    if values_match(ingredient_name, sensitivities):
        sensitivity_conflicts.append(
            ingredient.name
        )

    # -----------------------------------------------------
    # SKIN CONCERN MATCH
    # -----------------------------------------------------

    concern_matches = concern_matches_profile(
       concerns,
       good_for,
)
    # -----------------------------------------------------
    # AVOID IF CHECK
    # -----------------------------------------------------

    avoid_matches = []

    for concern in concerns:
       for avoid_item in avoid_if:

        concern_group = None

        for canonical, aliases in CONCERN_ALIASES.items():
            if concern == canonical or concern in aliases:
                concern_group = aliases
                break

        if concern_group:
            if (
                avoid_item in concern_group
                or avoid_item == concern
            ):
                avoid_matches.append(concern)
        elif concern == avoid_item:
            avoid_matches.append(concern)
    # Check skin type as well.
    if skin_type and skin_type in avoid_if:
        avoid_matches.append(
            skin_type
        )

    # Remove duplicates
    avoid_matches = sorted(
        set(avoid_matches)
    )

    # -----------------------------------------------------
    # SUITABILITY SCORE
    # -----------------------------------------------------

    score = 70

    # Strongest safety issue
    if allergy_conflicts:
        score = 0

    elif sensitivity_conflicts:
        score = 35

    else:

        # Helpful for patient's concerns
        score += (
            len(concern_matches) * 10
        )

        # Potential concern/skin-type issue
        score -= (
            len(avoid_matches) * 15
        )

        # Keep between 0 and 100
        score = max(
            0,
            min(100, score)
        )

    # -----------------------------------------------------
    # FINAL STATUS
    # -----------------------------------------------------

    if allergy_conflicts:

        status = "avoid"

        recommendation = (
            "Avoid this ingredient."
        )

        reason = (
            "This ingredient matches an allergy "
            "recorded in your Skin Profile."
        )

    elif sensitivity_conflicts:

        status = "caution"

        recommendation = (
            "Use with caution."
        )

        reason = (
            "This ingredient matches a sensitivity "
            "recorded in your Skin Profile."
        )

    elif avoid_matches:

        status = "caution"

        recommendation = (
            "Review this ingredient before use."
        )

        reason = (
            "This ingredient may not be ideal "
            "for one or more characteristics "
            "recorded in your Skin Profile."
        )

    elif concern_matches:

        status = "suitable"

        recommendation = (
            "Suitable for your current profile."
        )

        reason = (
            "This ingredient matches one or more "
            "of your recorded skin concerns."
        )

    else:

        status = "neutral"

        recommendation = (
            "No direct conflict found."
        )

        reason = (
            "No allergy, sensitivity, or direct "
            "skin-concern conflict was found "
            "from your current profile."
        )

    # -----------------------------------------------------
    # RETURN ANALYSIS
    # -----------------------------------------------------

    return {

        "profile_available": True,

        "ingredient": {
            "id": str(ingredient.id),
            "name": ingredient.name,
            "category": ingredient.category,
            "description": ingredient.description,
            "good_for": ingredient.good_for or [],
            "avoid_if": ingredient.avoid_if or [],
            "interacts_badly_with":
                ingredient.interacts_badly_with
                or [],
        },

        "status": status,

        "score": score,

        "allergy_conflicts":
            allergy_conflicts,

        "sensitivity_conflicts":
            sensitivity_conflicts,

        "concern_matches":
            concern_matches,

        "avoid_matches":
            avoid_matches,

        "recommendation":
            recommendation,

        "reason":
            reason,
    }