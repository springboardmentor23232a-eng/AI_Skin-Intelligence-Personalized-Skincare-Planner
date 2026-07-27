import io

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import openpyxl

from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.models.skin_profile import SkinProfile
from app.models.assessment import SkinAssessment
from app.models.routine import SkincareRoutine
from app.models.progress import ProgressLog

router = APIRouter(prefix="/api/reports", tags=["Reports & Export"])


def _gather_report_data(db: Session, user: User):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user.id).first()
    assessment = (
        db.query(SkinAssessment)
        .filter(SkinAssessment.user_id == user.id)
        .order_by(SkinAssessment.created_at.desc())
        .first()
    )
    routine = db.query(SkincareRoutine).filter(SkincareRoutine.user_id == user.id).first()
    logs = (
        db.query(ProgressLog)
        .filter(ProgressLog.user_id == user.id)
        .order_by(ProgressLog.log_date.desc())
        .limit(30)
        .all()
    )
    return profile, assessment, routine, logs


@router.get("/pdf")
def export_pdf(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile, assessment, routine, logs = _gather_report_data(db, current_user)

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    y = 750
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, y, f"Skin Health Report - {current_user.full_name}")
    y -= 30
    p.setFont("Helvetica", 11)

    if profile:
        p.drawString(50, y, f"Skin Type: {profile.skin_type or '-'} | Age Group: {profile.age_group or '-'}")
        y -= 18
        p.drawString(50, y, f"Concerns: {', '.join(profile.skin_concerns or []) or '-'}")
        y -= 18

    if assessment:
        p.drawString(50, y, f"Condition Score: {assessment.condition_score}")
        y -= 18
        p.drawString(50, y, f"Prioritized Concerns: {', '.join(assessment.prioritized_concerns or []) or '-'}")
        y -= 18

    if routine:
        y -= 10
        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, y, "Morning Routine:")
        p.setFont("Helvetica", 10)
        y -= 16
        for step in routine.morning_routine or []:
            p.drawString(60, y, f"- {step.get('category')}: {step.get('instruction')}")
            y -= 14

    p.showPage()
    p.save()
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=skin_health_report.pdf"},
    )


@router.get("/excel")
def export_excel(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile, assessment, routine, logs = _gather_report_data(db, current_user)

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Progress Log"
    ws.append(["Date", "Morning Followed", "Evening Followed", "Skin Health Score", "Note"])
    for log in logs:
        ws.append([
            log.log_date.strftime("%Y-%m-%d"),
            log.routine_followed_morning,
            log.routine_followed_evening,
            log.skin_health_score,
            log.skin_condition_note,
        ])

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=progress_report.xlsx"},
    )
