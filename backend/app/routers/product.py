from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.deps import get_current_user, require_admin

router = APIRouter(prefix="/api/products", tags=["Product Recommendation"])


@router.get("", response_model=list[schemas.ProductOut])
def list_products(category: str | None = None, max_price: float | None = None, db: Session = Depends(get_db)):
    q = db.query(models.Product)
    if category:
        q = q.filter(models.Product.category == category)
    if max_price is not None:
        q = q.filter(models.Product.price <= max_price)
    return q.all()


@router.get("/recommended", response_model=list[schemas.ProductOut])
def recommended_products(
    budget: float | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Score & rank products by suitability for the user's skin type + top concerns."""
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    latest = (
        db.query(models.SkinAssessment)
        .filter(models.SkinAssessment.user_id == current_user.id)
        .order_by(models.SkinAssessment.assessment_date.desc())
        .first()
    )
    skin_type = profile.skin_type if profile else None
    concern_names = {c.concern_name.lower() for c in latest.concerns} if latest else set()

    products = db.query(models.Product).all()
    if budget:
        products = [p for p in products if p.price <= budget]

    scored = []
    for p in products:
        score = 0
        suitable_types = {t.strip().lower() for t in (p.suitable_skin_types or "").split(",") if t.strip()}
        targets = {t.strip().lower() for t in (p.targets_concerns or "").split(",") if t.strip()}
        if skin_type and skin_type in suitable_types:
            score += 3
        score += len(targets & concern_names) * 2
        scored.append((score, p))

    scored.sort(key=lambda x: -x[0])
    return [p for _, p in scored]


@router.get("/compare")
def compare_products(product_ids: str, db: Session = Depends(get_db)):
    ids = product_ids.split(",")
    products = db.query(models.Product).filter(models.Product.id.in_(ids)).all()
    return {"products": [schemas.ProductOut.model_validate(p) for p in products]}


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
