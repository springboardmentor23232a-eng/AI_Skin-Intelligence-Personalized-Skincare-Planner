from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.models.recommendation import Recommendation

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.get("/me")
def get_my_recommendations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    recs = (
        db.query(Recommendation)
        .filter(Recommendation.client_id == current_user.id)
        .order_by(Recommendation.created_at.desc())
        .all()
    )
    result = []
    for r in recs:
        author = db.query(User).filter(User.id == r.author_id).first()
        result.append({
            "id": str(r.id),
            "note": r.note,
            "author_name": author.full_name if author else "Unknown",
            "author_role": r.author_role,
            "created_at": r.created_at,
        })
    return result