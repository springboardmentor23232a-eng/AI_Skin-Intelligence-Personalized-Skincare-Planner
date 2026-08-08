from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Recommendation, RoleName
from ..schemas import RecommendationIn, RecommendationOut
from ..auth import get_current_user, require_roles

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.get("", response_model=list[RecommendationOut])
def list_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == RoleName.user:
        return (
            db.query(Recommendation)
            .filter(Recommendation.user_id == current_user.id)
            .order_by(Recommendation.created_at.desc())
            .all()
        )
    # staff roles see everything by default; filter client-side by user_id query in a real app
    return db.query(Recommendation).order_by(Recommendation.created_at.desc()).limit(200).all()


@router.post("", response_model=RecommendationOut, status_code=201)
def create_recommendation(
    payload: RecommendationIn,
    current_user: User = Depends(require_roles(RoleName.consultant, RoleName.dermatologist, RoleName.admin)),
    db: Session = Depends(get_db),
):
    rec = Recommendation(
        **payload.dict(),
        created_by_role=current_user.role.value,
        created_by_id=current_user.id,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


@router.put("/{rec_id}", response_model=RecommendationOut)
def update_recommendation(
    rec_id: str,
    payload: RecommendationIn,
    current_user: User = Depends(require_roles(RoleName.consultant, RoleName.dermatologist, RoleName.admin)),
    db: Session = Depends(get_db),
):
    rec = db.query(Recommendation).filter(Recommendation.id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(rec, field, value)
    db.commit()
    db.refresh(rec)
    return rec


@router.delete("/{rec_id}", status_code=204)
def delete_recommendation(
    rec_id: str,
    current_user: User = Depends(require_roles(RoleName.consultant, RoleName.dermatologist, RoleName.admin)),
    db: Session = Depends(get_db),
):
    rec = db.query(Recommendation).filter(Recommendation.id == rec_id).first()
    if rec:
        db.delete(rec)
        db.commit()
    return None
