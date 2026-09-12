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
from app.services.report_generator import (
    generate_pdf_report,
    generate_csv_report,
    generate_xlsx_report,
    build_canonical_report_dataset
)
from app.services.notification_dispatcher import notification_dispatcher

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
    # Evaluate reminder rules & create fresh notifications with duplicate prevention
    active_reminders = db.query(ReminderSetting).filter(
        ReminderSetting.user_id == current_user.id,
        ReminderSetting.enabled == 1
    ).all()

    # Get start of today (UTC) to prevent duplicate reminders on the same day
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    existing_today_cats = set(
        cat[0] for cat in db.query(Notification.category).filter(
            Notification.user_id == current_user.id,
            Notification.created_at >= today_start
        ).all()
    )

    created_notifications = []
    for rem in active_reminders:
        if rem.reminder_type == "ROUTINE_MORNING":
            if "ROUTINE" not in existing_today_cats:
                n = Notification(
                    user_id=current_user.id,
                    category="ROUTINE",
                    priority="MEDIUM",
                    title="☀️ Morning Skincare Routine",
                    message="Time for your morning cleanser, Vitamin C serum, and SPF protection!"
                )
                db.add(n)
                created_notifications.append("Morning Routine Reminder")
                existing_today_cats.add("ROUTINE")
        elif rem.reminder_type == "ROUTINE_EVENING":
            if "ROUTINE_EVENING" not in existing_today_cats:
                n = Notification(
                    user_id=current_user.id,
                    category="ROUTINE_EVENING",
                    priority="MEDIUM",
                    title="🌙 Evening Skincare Routine",
                    message="Cleanse off daily impurities and apply your evening hydrating moisturizer."
                )
                db.add(n)
                created_notifications.append("Evening Routine Reminder")
                existing_today_cats.add("ROUTINE_EVENING")
        elif rem.reminder_type == "HYDRATION":
            if "HYDRATION" not in existing_today_cats:
                n = Notification(
                    user_id=current_user.id,
                    category="HYDRATION",
                    priority="LOW",
                    title="💧 Hydration Alert",
                    message="Remember to drink 500ml of water to support your skin barrier."
                )
                db.add(n)
                created_notifications.append("Hydration Reminder")
                existing_today_cats.add("HYDRATION")
        elif rem.reminder_type == "SLEEP":
            if "SLEEP" not in existing_today_cats:
                n = Notification(
                    user_id=current_user.id,
                    category="SLEEP",
                    priority="LOW",
                    title="🌙 Rest & Sleep Alert",
                    message="Adequate restful sleep allows your epidermal barrier to naturally regenerate."
                )
                db.add(n)
                created_notifications.append("Sleep Reminder")
                existing_today_cats.add("SLEEP")
        elif rem.reminder_type == "REPLENISHMENT":
            if "REFILL" not in existing_today_cats:
                n = Notification(
                    user_id=current_user.id,
                    category="REFILL",
                    priority="MEDIUM",
                    title="📦 Product Replenishment Alert",
                    message="Check your skincare product levels (cleanser, moisturizer, SPF) to ensure timely refill."
                )
                db.add(n)
                created_notifications.append("Replenishment Reminder")
                existing_today_cats.add("REFILL")
        elif rem.reminder_type == "ASSESSMENT_CHECK":
            if "ASSESSMENT" not in existing_today_cats:
                n = Notification(
                    user_id=current_user.id,
                    category="ASSESSMENT",
                    priority="LOW",
                    title="📋 Periodic Skin Assessment Check",
                    message="Take a new skin diagnostic assessment to update your personalized plan and health score."
                )
                db.add(n)
                created_notifications.append("Assessment Reminder")
                existing_today_cats.add("ASSESSMENT")

    db.commit()

    # Communication Identity Enforcement: Dispatch external notifications only if verified
    for notif_title in created_notifications:
        notification_dispatcher.dispatch_user_email(
            current_user,
            notif_title,
            f"Personalized reminder from AI Skin Intelligence: {notif_title}"
        )
        if getattr(current_user, "phone_verified", False) and getattr(current_user, "phone_number", None):
            notification_dispatcher.dispatch_user_sms(
                current_user,
                f"Skin Intelligence: {notif_title}"
            )

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
    ).order_by(SkinAssessment.created_at.desc(), SkinAssessment.id.desc()).first()

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
            "full_name": profile.full_name if (profile and profile.full_name) else current_user.full_name,
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
    format: str = Query("csv", pattern="^(csv|xlsx|pdf)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    canonical_data = build_canonical_report_dataset(db, current_user)

    fmt = format.lower().strip()
    if fmt == "csv":
        csv_bytes = generate_csv_report(canonical_data)
        return Response(
            content=csv_bytes,
            media_type="text/csv; charset=utf-8",
            headers={"Content-Disposition": 'attachment; filename="skin-health-report.csv"; filename*=UTF-8\'\'skin-health-report.csv'}
        )
    elif fmt == "xlsx":
        xlsx_bytes = generate_xlsx_report(canonical_data)
        return Response(
            content=xlsx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": 'attachment; filename="skin-health-report.xlsx"; filename*=UTF-8\'\'skin-health-report.xlsx'}
        )
    elif fmt == "pdf":
        pdf_bytes = generate_pdf_report(canonical_data)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="skin-health-report.pdf"; filename*=UTF-8\'\'skin-health-report.pdf'}
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported export format '{format}'. Allowed: csv, xlsx, pdf."
        )


@router.get("/reports/admin/summary")
def get_admin_reports_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin credentials required.")

    total_users = db.query(User).count()
    total_consultants = db.query(User).filter(User.role == "SKINCARE_CONSULTANT").count()
    total_dermatologists = db.query(User).filter(User.role == "DERMATOLOGIST").count()
    total_administrators = db.query(User).filter(User.role == "ADMIN").count()
    active_accounts = db.query(User).filter(User.is_active == 1, User.is_blocked == 0).count()
    blocked_accounts = db.query(User).filter(User.is_blocked == 1).count()

    total_assessments = db.query(SkinAssessment).count()
    total_routines = db.query(SkincareRoutine).count()
    total_recommendations = db.query(ProductRecommendation).count()
    total_consultations = db.query(Consultation).count()
    total_reviews = db.query(ClinicalReview).count()
    total_notifications = db.query(Notification).count()

    return {
        "platform_statistics": {
            "total_registered_users": total_users,
            "total_consultants": total_consultants,
            "total_dermatologists": total_dermatologists,
            "total_administrators": total_administrators,
            "active_accounts": active_accounts,
            "blocked_accounts": blocked_accounts,
            "total_ai_assessments": total_assessments,
            "total_routines": total_routines,
            "total_recommendations": total_recommendations,
            "total_clinical_consultations": total_consultations,
            "total_dermatologist_reviews": total_reviews,
            "total_system_notifications": total_notifications
        },
        "system_status": "OPERATIONAL",
        "timestamp": datetime.utcnow()
    }
