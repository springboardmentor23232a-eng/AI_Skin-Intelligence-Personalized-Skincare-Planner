from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.models.product import Product
from app.models.skin_profile import SkinProfile
from app.schemas.product import ProductOut
from app.services.recommendation_service import score_product_suitability, detect_allergy_conflicts

router = APIRouter(prefix="/api/products", tags=["Product Recommendations"])


@router.get("", response_model=List[ProductOut])
def list_products(category: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    return query.all()


@router.get("/recommendations", response_model=List[ProductOut])
def get_recommendations(
    max_price: float | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Create a skin profile first.")

    products = db.query(Product).all()
    scored = []
    for p in products:
        if max_price is not None and p.price > max_price:
            continue
        if detect_allergy_conflicts(p.key_ingredients or [], profile.allergies or []):
            continue  # never recommend products containing known allergens
        score = score_product_suitability(
            product_targets=p.targets_concerns or [],
            product_skin_types=p.suitable_skin_types or [],
            product_ingredients=p.key_ingredients or [],
            user_concerns=profile.skin_concerns or [],
            user_skin_type=profile.skin_type or "",
            user_allergies=profile.allergies or [],
        )
        out = ProductOut.from_orm(p)
        out.suitability_score = score
        scored.append(out)

    scored.sort(key=lambda x: x.suitability_score or 0, reverse=True)
    return scored
