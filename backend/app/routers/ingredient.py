from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.deps import get_current_user, require_admin

router = APIRouter(prefix="/api/ingredients", tags=["Ingredient Intelligence"])


@router.get("", response_model=list[schemas.IngredientOut])
def list_ingredients(category: str | None = None, db: Session = Depends(get_db)):
    q = db.query(models.Ingredient)
    if category:
        q = q.filter(models.Ingredient.category == category)
    return q.all()


@router.get("/{ingredient_id}", response_model=schemas.IngredientOut)
def get_ingredient(ingredient_id: str, db: Session = Depends(get_db)):
    ing = db.query(models.Ingredient).filter(models.Ingredient.id == ingredient_id).first()
    if not ing:
        raise HTTPException(status_code=404, detail="Ingredient not found.")
    return ing


@router.post("/check-suitability")
def check_suitability(
    payload: schemas.IngredientCheckRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Checks a list of ingredient names against the user's allergies/sensitivities
    and flags bad interactions between the listed ingredients."""
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    allergies = set()
    sensitivities = set()
    if profile:
        if profile.allergies:
            allergies = {a.strip().lower() for a in profile.allergies.split(",")}
        if profile.sensitivities:
            sensitivities = {s.strip().lower() for s in profile.sensitivities.split(",")}

    results = []
    ingredients = db.query(models.Ingredient).filter(models.Ingredient.name.in_(payload.ingredient_names)).all()
    ing_by_name = {i.name.lower(): i for i in ingredients}

    for name in payload.ingredient_names:
        ing = ing_by_name.get(name.lower())
        flags = []
        if not ing:
            results.append({"ingredient": name, "found": False, "flags": ["Not in database"]})
            continue

        avoid_list = {a.strip().lower() for a in (ing.avoid_if or "").split(",") if a.strip()}
        if avoid_list & allergies:
            flags.append(f"Conflicts with your allergy profile: {avoid_list & allergies}")
        if avoid_list & sensitivities:
            flags.append(f"May irritate your sensitivities: {avoid_list & sensitivities}")

        bad_interactions = {b.strip().lower() for b in (ing.interacts_badly_with or "").split(",") if b.strip()}
        other_names = {n.lower() for n in payload.ingredient_names if n.lower() != name.lower()}
        clashing = bad_interactions & other_names
        if clashing:
            flags.append(f"Should not be combined with: {clashing}")

        results.append({
            "ingredient": ing.name,
            "found": True,
            "category": ing.category,
            "good_for": ing.good_for,
            "flags": flags,
            "safe": len(flags) == 0,
        })

    return {"results": results}


@router.post("", response_model=schemas.IngredientOut, status_code=201)
def create_ingredient(payload: schemas.IngredientOut, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    ing = models.Ingredient(
        name=payload.name, category=payload.category, description=payload.description,
        good_for=payload.good_for, avoid_if=payload.avoid_if, interacts_badly_with=payload.interacts_badly_with,
    )
    db.add(ing)
    db.commit()
    db.refresh(ing)
    return ing
