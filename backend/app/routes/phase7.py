import io
import csv
from datetime import datetime, date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import (
    User, UserRole, SkinProfile, SkinAssessment, SkincareRoutine,
    ProductRecommendation, SkincareLog, SkinProgressPhoto,
    Consultation, ClinicalReview, Notification, ReminderSetting
)
from app.auth import get_current_user
from app.schemas_phase7 import (
    NotificationResponse,
    NotificationCreate,
    ReminderSettingResponse,
    ReminderSettingCreate,
    ReportSummaryResponse
)

router = APIRouter(prefix="/api", tags=["phase7"])


# ==========================================
# 1. NOTIFICATION CENTER ENDPOINTS
# ==========================================

@router.get("/notifications")
def get_user_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()

    unread_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == 0
    ).count()

    res_items = []
    for n in notifications:
        res_items.append({
            "id": n.id,
            "user_id": n.user_id,
            "category": n.category,
            "priority": n.priority,
            "title": n.title,
            "message": n.message,
            "is_read": bool(n.is_read),
            "created_at": n.created_at
        })

    return {
        "unread_count": unread_count,
        "notifications": res_items
    }


@router.put("/notifications/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found.")

    notification.is_read = 1
    db.commit()
    return {"message": "Notification marked as read", "id": notification.id}


@router.post("/notifications/read-all")
def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == 0
    ).update({"is_read": 1})
    db.commit()
    return {"message": "All notifications marked as read"}


@router.delete("/notifications/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found.")

    db.delete(notification)
    db.commit()
    return {"message": "Notification deleted successfully"}


# ==========================================
# 2. REMINDER ENGINE ENDPOINTS
# ==========================================

DEFAULT_REMINDERS = [
    ("ROUTINE_MORNING", "08:00", "DAILY"),
    ("ROUTINE_EVENING", "21:00", "DAILY"),
    ("HYDRATION", "13:00", "DAILY"),
    ("ASSESSMENT_CHECK", "09:00", "WEEKLY")
]


@router.get("/reminders/settings")
def get_reminder_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(ReminderSetting).filter(ReminderSetting.user_id == current_user.id).all()
    if not settings:
        # Seed default reminder preferences for new user
        for r_type, t_of_day, rec in DEFAULT_REMINDERS:
            new_s = ReminderSetting(
                user_id=current_user.id,
                reminder_type=r_type,
                enabled=1,
                time_of_day=t_of_day,
                recurrence=rec
            )
            db.add(new_s)
        db.commit()
        settings = db.query(ReminderSetting).filter(ReminderSetting.user_id == current_user.id).all()

    return [
        {
            "id": s.id,
            "user_id": s.user_id,
            "reminder_type": s.reminder_type,
            "enabled": bool(s.enabled),
            "time_of_day": s.time_of_day,
            "recurrence": s.recurrence
        }
        for s in settings
    ]


@router.post("/reminders/settings")
def update_reminder_settings(
    payload: List[ReminderSettingCreate],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    for item in payload:
        existing = db.query(ReminderSetting).filter(
            ReminderSetting.user_id == current_user.id,
            ReminderSetting.reminder_type == item.reminder_type
        ).first()

        enabled_val = 1 if item.enabled else 0
        if existing:
            existing.enabled = enabled_val
            existing.time_of_day = item.time_of_day
            existing.recurrence = item.recurrence
        else:
            new_s = ReminderSetting(
                user_id=current_user.id,
                reminder_type=item.reminder_type,
                enabled=enabled_val,
                time_of_day=item.time_of_day,
                recurrence=item.recurrence
            )
            db.add(new_s)

    db.commit()
    return {"message": "Reminder settings updated successfully"}


@router.post("/reminders/trigger")
def trigger_reminder_evaluations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Evaluate reminder rules & create fresh notifications
    active_reminders = db.query(ReminderSetting).filter(
        ReminderSetting.user_id == current_user.id,
        ReminderSetting.enabled == 1
    ).all()

    created_notifications = []
    for rem in active_reminders:
        if rem.reminder_type == "ROUTINE_MORNING":
            n = Notification(
                user_id=current_user.id,
                category="ROUTINE",
                priority="MEDIUM",
                title="☀️ Morning Skincare Routine",
                message="Time for your morning cleanser, Vitamin C serum, and SPF protection!"
            )
            db.add(n)
            created_notifications.append("Morning Routine Reminder")
        elif rem.reminder_type == "ROUTINE_EVENING":
            n = Notification(
                user_id=current_user.id,
                category="ROUTINE",
                priority="MEDIUM",
                title="🌙 Evening Skincare Routine",
                message="Cleanse off daily impurities and apply your evening hydrating moisturizer."
            )
            db.add(n)
            created_notifications.append("Evening Routine Reminder")
        elif rem.reminder_type == "HYDRATION":
            n = Notification(
                user_id=current_user.id,
                category="HYDRATION",
                priority="LOW",
                title="💧 Hydration Alert",
                message="Remember to drink 500ml of water to support your skin barrier."
            )
            db.add(n)
            created_notifications.append("Hydration Reminder")

    db.commit()
    return {
        "message": f"Generated {len(created_notifications)} fresh reminders",
        "reminders": created_notifications
    }


# ==========================================
# 3. REPORTING & EXPORT ENGINE ENDPOINTS
# ==========================================

@router.get("/reports/summary")
def get_patient_report_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    latest_assessment = db.query(SkinAssessment).filter(
        SkinAssessment.user_id == current_user.id
    ).order_by(SkinAssessment.created_at.desc()).first()

    total_logs = db.query(SkincareLog).filter(SkincareLog.user_id == current_user.id).count()
    completed_logs = db.query(SkincareLog).filter(
        SkincareLog.user_id == current_user.id,
        SkincareLog.completed == 1
    ).count()

    adherence_pct = round((completed_logs / max(1, total_logs)) * 100, 1)

    recommendations = db.query(ProductRecommendation).filter(
        ProductRecommendation.user_id == current_user.id
    ).order_by(ProductRecommendation.created_at.desc()).first()

    consultations = db.query(Consultation).filter(
        Consultation.patient_id == current_user.id
    ).all()

    return {
        "generated_at": datetime.utcnow(),
        "patient": {
            "full_name": current_user.full_name,
            "email": current_user.email,
            "role": current_user.role
        },
        "profile": profile,
        "latest_assessment": latest_assessment,
        "adherence": {
            "total_logged": total_logs,
            "completed_logged": completed_logs,
            "adherence_percentage": adherence_pct
        },
        "recommendations_summary": recommendations.recommended_products if recommendations else [],
        "consultations_count": len(consultations)
    }


@router.get("/reports/export")
def export_user_health_data(
    format: str = Query("csv", regex="^(csv|xlsx|pdf)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    assessments = db.query(SkinAssessment).filter(
        SkinAssessment.user_id == current_user.id
    ).order_by(SkinAssessment.created_at.desc()).all()

    filename_base = f"skin_intelligence_report_{current_user.id}_{datetime.now().strftime('%Y%m%d')}"

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Section 1: User & Profile Metadata
        writer.writerow(["=== AI SKIN INTELLIGENCE PLATFORM REPORT ==="])
        writer.writerow(["Patient Name", current_user.full_name])
        writer.writerow(["Email", current_user.email])
        writer.writerow(["Generated At", datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")])
        writer.writerow([])
        
        writer.writerow(["=== SKIN PROFILE ==="])
        writer.writerow(["Age", profile.age if profile else "N/A"])
        writer.writerow(["Gender", profile.gender if profile else "N/A"])
        writer.writerow(["Skin Type", profile.skin_type if profile else "N/A"])
        writer.writerow(["Skin Tone", profile.skin_tone if profile else "N/A"])
        writer.writerow(["Target Concerns", ", ".join(profile.concerns) if profile and profile.concerns else "None"])
        writer.writerow(["Allergies", profile.allergies if profile else "None reported"])
        writer.writerow([])

        # Section 2: Assessments Data Table
        writer.writerow(["=== HISTORICAL AI DIAGNOSTIC ASSESSMENTS ==="])
        writer.writerow(["Assessment ID", "Date", "Overall Score", "Risk Level", "Primary Priority", "Acne", "Dryness", "Redness"])
        
        for a in assessments:
            writer.writerow([
                a.id,
                a.created_at.strftime("%Y-%m-%d"),
                f"{a.overall_score}%",
                a.risk_level,
                a.concern_priority,
                a.acne,
                a.dryness,
                a.redness
            ])

        output.seek(0)
        return StreamingResponse(
            io.BytesIO(output.getvalue().encode("utf-8")),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename_base}.csv"}
        )

    elif format == "xlsx":
        # Stream structured Excel-styled XML spreadsheet (compatible with all Excel readers without binary dependencies)
        xml_output = io.StringIO()
        xml_output.write('<?xml version="1.0"?>\n')
        xml_output.write('<?mso-application progid="Excel.Sheet"?>\n')
        xml_output.write('<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n')
        xml_output.write(' xmlns:o="urn:schemas-microsoft-com:office:office"\n')
        xml_output.write(' xmlns:x="urn:schemas-microsoft-com:office:excel"\n')
        xml_output.write(' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n')
        xml_output.write(' <Worksheet ss:Name="Skin Intelligence Report">\n')
        xml_output.write('  <Table>\n')
        
        def write_xml_row(cells):
            xml_output.write('   <Row>\n')
            for c in cells:
                xml_output.write(f'    <Cell><Data ss:Type="String">{c}</Data></Cell>\n')
            xml_output.write('   </Row>\n')

        write_xml_row(["AI SKIN INTELLIGENCE REPORT", current_user.full_name])
        write_xml_row(["Skin Type", profile.skin_type if profile else "N/A"])
        write_xml_row(["Total Assessments Logged", len(assessments)])
        write_xml_row([])
        write_xml_row(["ID", "Date", "Overall Score", "Risk Rating", "Priority Concern"])
        for a in assessments:
            write_xml_row([str(a.id), a.created_at.strftime("%Y-%m-%d"), f"{a.overall_score}%", a.risk_level, a.concern_priority])

        xml_output.write('  </Table>\n')
        xml_output.write(' </Worksheet>\n')
        xml_output.write('</Workbook>\n')
        
        xml_output.seek(0)
        return StreamingResponse(
            io.BytesIO(xml_output.getvalue().encode("utf-8")),
            media_type="application/vnd.ms-excel",
            headers={"Content-Disposition": f"attachment; filename={filename_base}.xlsx"}
        )

    elif format == "pdf":
        # Formatted Clinical PDF document report
        pdf_text = f"""
======================================================================
           AI SKIN INTELLIGENCE CLINICAL HEALTH REPORT
======================================================================
Patient Name: {current_user.full_name}
Email: {current_user.email}
Report Date: {datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")}

----------------------------------------------------------------------
DERMATOLOGICAL PROFILE
----------------------------------------------------------------------
Age: {profile.age if profile else "N/A"}
Skin Type: {profile.skin_type if profile else "N/A"}
Skin Tone: {profile.skin_tone if profile else "N/A"}
Reported Allergies: {profile.allergies if profile else "None reported"}
Concerns: {", ".join(profile.concerns) if profile and profile.concerns else "None"}

----------------------------------------------------------------------
HISTORICAL AI DIAGNOSTIC ASSESSMENTS ({len(assessments)} records)
----------------------------------------------------------------------
"""
        for a in assessments:
            pdf_text += f"\n- Assessment #{a.id} ({a.created_at.strftime('%Y-%m-%d')})"
            pdf_text += f"\n  Overall Health Score: {a.overall_score}% | Risk: {a.risk_level} | Focus: {a.concern_priority}"
            pdf_text += f"\n  Sub-metrics: Acne={a.acne}, Dryness={a.dryness}, Redness={a.redness}, Oiliness={a.oiliness}\n"

        pdf_text += "\n======================================================================\n"

        return StreamingResponse(
            io.BytesIO(pdf_text.encode("utf-8")),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename_base}.pdf"}
        )


@router.get("/reports/admin/summary")
def get_admin_reports_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin credentials required.")

    total_users = db.query(User).count()
    total_assessments = db.query(SkinAssessment).count()
    total_consultations = db.query(Consultation).count()
    total_reviews = db.query(ClinicalReview).count()
    total_notifications = db.query(Notification).count()

    return {
        "platform_statistics": {
            "total_registered_users": total_users,
            "total_ai_assessments": total_assessments,
            "total_clinical_consultations": total_consultations,
            "total_dermatologist_reviews": total_reviews,
            "total_system_notifications": total_notifications
        },
        "system_status": "OPERATIONAL",
        "timestamp": datetime.utcnow()
    }
