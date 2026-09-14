"""
Module 11 — Reports & Export System.

Every report is scoped to the CURRENT user's own data (they export their own
skin assessment / routine / product / progress / skin-health history), and is
available as either a PDF or an Excel workbook via ?format=pdf|excel.
"""
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.deps import get_current_user
from app.utils.report_utils import build_pdf, build_excel
from app.ml.progress_analytics_engine import track_routine_adherence, analyze_trend

router = APIRouter(prefix="/api/reports", tags=["Reports & Export"])


def _respond(fmt: str, filename_stub: str, title: str, subtitle: str, sections):
    if fmt not in ("pdf", "excel"):
        raise HTTPException(status_code=400, detail="format must be 'pdf' or 'excel'.")
    if fmt == "pdf":
        content = build_pdf(title, subtitle, sections)
        media_type = "application/pdf"
        filename = f"{filename_stub}.pdf"
    else:
        content = build_excel(title, sections)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename = f"{filename_stub}.xlsx"
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/skin-assessment")
def skin_assessment_report(
    format: str = "pdf",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    assessments = (
        db.query(models.SkinAssessment)
        .filter(models.SkinAssessment.user_id == current_user.id)
        .order_by(models.SkinAssessment.assessment_date.asc())
        .all()
    )
    rows = [[
        a.assessment_date.strftime("%Y-%m-%d %H:%M"),
        a.skin_health_score,
        a.overall_condition or "-",
        a.detected_skin_type.value if a.detected_skin_type else "-",
        ", ".join(c.concern_name for c in a.concerns) or "-",
        ", ".join(f"{r.risk_name} ({r.risk_level.value})" for r in a.risk_factors) or "-",
    ] for a in assessments]
    columns = ["Date", "Score", "Condition", "Skin Type", "Concerns", "Risk Factors"]
    sections = [("Skin Assessment History", columns, rows)]
    return _respond(format, "skin_assessment_report", "Skin Assessment Report", current_user.full_name, sections)


@router.get("/routine")
def routine_report(
    format: str = "pdf",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    routines = (
        db.query(models.Routine)
        .filter(models.Routine.user_id == current_user.id, models.Routine.is_active == True)  # noqa: E712
        .all()
    )
    sections = []
    for r in routines:
        rows = [[s.step_order, s.category.replace("_", " ").title(), s.instruction, s.product.name if s.product else "-"]
                for s in sorted(r.steps, key=lambda s: s.step_order)]
        columns = ["#", "Category", "Instruction", "Product"]
        heading = f"{r.routine_type.title()} Routine" + (f" ({r.season})" if r.season else "")
        sections.append((heading, columns, rows))
    if not sections:
        sections = [("Routine", ["#", "Category", "Instruction", "Product"], [])]
    return _respond(format, "routine_report", "Personalized Routine Report", current_user.full_name, sections)


@router.get("/product-recommendations")
def product_recommendation_report(
    format: str = "pdf",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == current_user.id).first()
    latest = (
        db.query(models.SkinAssessment)
        .filter(models.SkinAssessment.user_id == current_user.id)
        .order_by(models.SkinAssessment.assessment_date.desc())
        .first()
    )
    concern_names = {c.concern_name.lower() for c in latest.concerns} if latest else set()
    skin_type = profile.skin_type.value if profile and profile.skin_type else None

    products = db.query(models.Product).all()
    rows = []
    for p in products:
        suitable_types = {t.strip().lower() for t in (p.suitable_skin_types or "").split(",") if t.strip()}
        targets = {t.strip().lower() for t in (p.targets_concerns or "").split(",") if t.strip()}
        if skin_type and skin_type not in suitable_types and not (targets & concern_names):
            continue
        rows.append([p.name, p.brand or "-", p.category, f"₹{p.price:.2f}", p.key_ingredients or "-"])

    columns = ["Product", "Brand", "Category", "Price", "Key Ingredients"]
    sections = [("Recommended Products", columns, rows)]
    return _respond(format, "product_recommendations_report", "Product Recommendation Report", current_user.full_name, sections)


@router.get("/progress")
def progress_report(
    format: str = "pdf",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    logs = (
        db.query(models.ProgressLog)
        .filter(models.ProgressLog.user_id == current_user.id)
        .order_by(models.ProgressLog.log_date.asc())
        .all()
    )
    rows = [[l.log_date.strftime("%Y-%m-%d %H:%M"), l.skin_health_score, f"{l.routine_adherence_pct}%", l.notes or "-"] for l in logs]
    columns = ["Date", "Skin Health Score", "Routine Adherence", "Notes"]
    sections = [("Progress Log History", columns, rows)]
    return _respond(format, "progress_report", "Progress Tracking Report", current_user.full_name, sections)


@router.get("/skin-health")
def skin_health_report(
    format: str = "pdf",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """A single comprehensive report: latest score, trend, adherence, and recent concerns."""
    assessments = (
        db.query(models.SkinAssessment)
        .filter(models.SkinAssessment.user_id == current_user.id)
        .order_by(models.SkinAssessment.assessment_date.asc())
        .all()
    )
    logs = (
        db.query(models.ProgressLog)
        .filter(models.ProgressLog.user_id == current_user.id)
        .order_by(models.ProgressLog.log_date.asc())
        .all()
    )
    trend = analyze_trend(assessments) if assessments else None
    adherence = track_routine_adherence(logs) if logs else None
    latest = assessments[-1] if assessments else None

    summary_rows = [
        ["Latest Skin Health Score", latest.skin_health_score if latest else "-"],
        ["Overall Condition", latest.overall_condition if latest else "-"],
        ["Trend Direction", trend["direction"] if trend else "Not enough data"],
        ["Average Routine Adherence", f"{adherence['average_pct']}%" if adherence else "No logs yet"],
        ["Total Assessments Logged", len(assessments)],
        ["Total Progress Logs", len(logs)],
    ]
    concern_rows = [[c.concern_name, c.severity.value, c.priority] for c in (latest.concerns if latest else [])]

    sections = [
        ("Summary", ["Metric", "Value"], summary_rows),
        ("Latest Concerns", ["Concern", "Severity", "Priority"], concern_rows),
    ]
    return _respond(format, "skin_health_report", "Skin Health Report", current_user.full_name, sections)
