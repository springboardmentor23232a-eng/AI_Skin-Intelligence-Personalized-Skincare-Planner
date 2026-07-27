from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.deps import get_current_user, require_roles
from app.models.user import User, UserRole
from app.models.skin_profile import SkinProfile
from app.models.assessment import SkinAssessment
from app.models.routine import SkincareRoutine
from app.models.progress import ProgressLog
from app.models.product import Product
from app.services.scoring_service import detect_declining_trend
from app.services.recommendation_service import score_product_suitability, detect_allergy_conflicts

router = APIRouter(prefix="/api/dashboard", tags=["Dashboards"])


@router.get("/user")
def user_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    latest_assessment = (
        db.query(SkinAssessment)
        .filter(SkinAssessment.user_id == current_user.id)
        .order_by(SkinAssessment.created_at.desc())
        .first()
    )
    routine = db.query(SkincareRoutine).filter(SkincareRoutine.user_id == current_user.id).first()
    recent_logs = (
        db.query(ProgressLog)
        .filter(ProgressLog.user_id == current_user.id)
        .order_by(ProgressLog.log_date.desc())
        .limit(10)
        .all()
    )

    chronological_scores = [l.skin_health_score for l in reversed(recent_logs)]
    routine_needs_review = detect_declining_trend(chronological_scores)

    top_products = []
    if profile:
        scored = []
        for p in db.query(Product).all():
            if detect_allergy_conflicts(p.key_ingredients or [], profile.allergies or []):
                continue
            score = score_product_suitability(
                product_targets=p.targets_concerns or [],
                product_skin_types=p.suitable_skin_types or [],
                product_ingredients=p.key_ingredients or [],
                user_concerns=profile.skin_concerns or [],
                user_skin_type=profile.skin_type or "",
                user_allergies=profile.allergies or [],
            )
            scored.append({"id": str(p.id), "name": p.name, "category": p.category, "suitability_score": score})
        scored.sort(key=lambda x: x["suitability_score"], reverse=True)
        top_products = scored[:3]

    return {
        "has_profile": profile is not None,
        "skin_health_score": recent_logs[0].skin_health_score if recent_logs else None,
        "latest_condition_score": latest_assessment.condition_score if latest_assessment else None,
        "has_routine": routine is not None,
        "routine_needs_review": routine_needs_review,
        "routine": {
            "morning_routine": routine.morning_routine,
            "evening_routine": routine.evening_routine,
            "season": routine.season,
        } if routine else None,
        "top_products": top_products,
        "recent_progress": [
            {"date": l.log_date, "score": l.skin_health_score} for l in recent_logs
        ],
    }


@router.get("/admin", dependencies=[Depends(require_roles(UserRole.admin))])
def admin_dashboard(db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).scalar()
    total_profiles = db.query(func.count(SkinProfile.id)).scalar()
    total_assessments = db.query(func.count(SkinAssessment.id)).scalar()
    total_routines = db.query(func.count(SkincareRoutine.id)).scalar()

    return {
        "total_users": total_users,
        "total_profiles": total_profiles,
        "total_assessments": total_assessments,
        "total_routines": total_routines,
    }


@router.get("/consultant", dependencies=[Depends(require_roles(UserRole.consultant, UserRole.dermatologist, UserRole.admin))])
def consultant_dashboard(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.role == UserRole.user).all()
    return {"client_count": len(users), "clients": [{"id": u.id, "name": u.full_name, "email": u.email} for u in users]}