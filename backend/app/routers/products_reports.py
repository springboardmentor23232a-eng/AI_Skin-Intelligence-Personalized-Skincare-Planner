import json
import os
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Product, SkinAssessment, Report, RoleName
from ..schemas import ProductOut
from ..auth import get_current_user

router = APIRouter(prefix="/api", tags=["products-reports"])

REPORT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "reports")
os.makedirs(REPORT_DIR, exist_ok=True)


@router.get("/providers")
def list_providers(role: str, db: Session = Depends(get_db)):
    """Public-to-logged-in-users listing of consultants/dermatologists for booking."""
    if role not in ("consultant", "dermatologist"):
        raise HTTPException(status_code=400, detail="role must be 'consultant' or 'dermatologist'")
    providers = db.query(User).filter(User.role == RoleName(role), User.is_active == True).all()
    return [{"id": p.id, "full_name": p.full_name} for p in providers]


@router.get("/products", response_model=list[ProductOut])
def browse_products(category: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Product)
    if category:
        query = query.filter(Product.category == category)
    return query.order_by(Product.name).all()


@router.get("/reports")
def list_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == RoleName.user:
        reports = db.query(Report).filter(Report.user_id == current_user.id)
    else:
        reports = db.query(Report)
    reports = reports.order_by(Report.created_at.desc()).all()
    return [
        {"id": r.id, "user_id": r.user_id, "report_type": r.report_type, "created_at": r.created_at}
        for r in reports
    ]


@router.post("/reports/{assessment_id}", status_code=201)
def generate_report(
    assessment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    assessment = db.query(SkinAssessment).filter(SkinAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    if assessment.user_id != current_user.id and current_user.role == RoleName.user:
        raise HTTPException(status_code=403, detail="Not authorized")

    summary = {
        "assessment_id": assessment.id,
        "user_id": assessment.user_id,
        "generated_at": datetime.utcnow().isoformat(),
        "skin_health_score": assessment.skin_health_score,
        "risk_score": assessment.risk_score,
        "sub_scores": {
            "acne": assessment.acne_score,
            "pigmentation": assessment.pigmentation_score,
            "wrinkles": assessment.wrinkle_score,
            "dryness": assessment.dryness_score,
            "oiliness": assessment.oiliness_score,
            "redness": assessment.redness_score,
            "pores": assessment.pores_score,
        },
        "status": assessment.status,
    }

    filename = f"report_{uuid.uuid4()}.json"
    path = os.path.join(REPORT_DIR, filename)
    with open(path, "w") as f:
        json.dump(summary, f, indent=2)

    report = Report(
        user_id=assessment.user_id,
        generated_by_id=current_user.id,
        report_type="assessment_summary",
        file_path=path,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return {"id": report.id, "summary": summary}
