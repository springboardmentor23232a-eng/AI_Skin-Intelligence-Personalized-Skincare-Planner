from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.deps import get_current_user, require_admin

router = APIRouter(prefix="/api/products", tags=["Product Recommendation"])


PRODUCT_CATEGORIES = ["face_wash", "moisturizer", "sunscreen", "serum", "toner", "treatment", "mask"]


@router.get("/categories")
def list_categories():
    """The fixed set of product categories the catalog is organized into."""
    return {"categories": PRODUCT_CATEGORIES}


@router.get("", response_model=list[schemas.ProductOut])
def list_products(category: str | None = None, max_price: float | None = None, db: Session = Depends(get_db)):
    q = db.query(models.Product)
    if category:
        q = q.filter(models.Product.category == category)
    if max_price is not None:
        q = q.filter(models.Product.price <= max_price)
    return q.all()


def _score_product(p: models.Product, skin_type: str | None, concern_names: set) -> tuple[int, list[str]]:
    """Weighted suitability score (0-100) for one product, with human-readable reasons."""
    suitable_types = {t.strip().lower() for t in (p.suitable_skin_types or "").split(",") if t.strip()}
    targets = {t.strip().lower() for t in (p.targets_concerns or "").split(",") if t.strip()}
    matched_concerns = targets & concern_names

    # Max attainable points for THIS user, so the score is a meaningful percentage
    # rather than an unbounded raw total.
    max_points = 3 + max(len(concern_names), 1) * 2
    points = 0
    reasons = []

    if skin_type and skin_type in suitable_types:
        points += 3
        reasons.append(f"Formulated for {skin_type} skin")
    points += len(matched_concerns) * 2
    for concern in matched_concerns:
        reasons.append(f"Targets your {concern} concern")

    if not reasons:
        reasons.append("General-purpose pick for your routine")

    match_score = max(0, min(100, round((points / max_points) * 100)))
    return match_score, reasons


@router.get("/recommended", response_model=list[schemas.ProductRecommendationOut])
def recommended_products(
    budget: float | None = None,
    category: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Score & rank products by suitability for the user's skin type + top concerns,
    optionally narrowed by budget and/or category (Personalized Recommendations,
    Suitability Scoring, Budget-Based Recommendations)."""
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    latest = (
        db.query(models.SkinAssessment)
        .filter(models.SkinAssessment.user_id == current_user.id)
        .order_by(models.SkinAssessment.assessment_date.desc())
        .first()
    )
    skin_type = profile.skin_type if profile else None
    concern_names = {c.concern_name.lower() for c in latest.concerns} if latest else set()

    q = db.query(models.Product)
    if category:
        q = q.filter(models.Product.category == category)
    products = q.all()
    if budget:
        products = [p for p in products if p.price <= budget]

    scored = []
    for p in products:
        match_score, reasons = _score_product(p, skin_type, concern_names)
        scored.append((match_score, p, reasons))

    scored.sort(key=lambda x: -x[0])
    return [
        schemas.ProductRecommendationOut(
            **schemas.ProductOut.model_validate(p).model_dump(),
            match_score=score,
            match_reasons=reasons,
        )
        for score, p, reasons in scored
    ]


@router.get("/compare", response_model=schemas.ProductCompareOut)
def compare_products(product_ids: str, db: Session = Depends(get_db)):
    """Side-by-side comparison of 2+ products (Product Comparison)."""
    ids = [i.strip() for i in product_ids.split(",") if i.strip()]
    if len(ids) < 2:
        raise HTTPException(status_code=400, detail="Provide at least two product_ids to compare.")
    products = db.query(models.Product).filter(models.Product.id.in_(ids)).all()
    if len(products) < 2:
        raise HTTPException(status_code=404, detail="Could not find at least two matching products.")
    attributes = ["brand", "category", "price", "suitable_skin_types", "targets_concerns", "key_ingredients"]
    return schemas.ProductCompareOut(
        products=[schemas.ProductOut.model_validate(p) for p in products],
        attributes=attributes,
    )


@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: str, db: Session = Depends(get_db)):
    p = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found.")
    return p


@router.get("/{product_id}/alternatives", response_model=list[schemas.ProductOut])
def product_alternatives(product_id: str, db: Session = Depends(get_db)):
    p = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found.")
    return db.query(models.Product).filter(
        models.Product.category == p.category, models.Product.id != p.id
    ).limit(5).all()


@router.post("", response_model=schemas.ProductOut, status_code=201)
def create_product(payload: schemas.ProductCreate, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    product = models.Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    p = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found.")
    db.delete(p)
    db.commit()
    return None
