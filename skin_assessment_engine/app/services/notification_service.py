"""
PanaceaAI Notification & Reminder Service (Module 10)
Handles:
- Routine reminders (Morning AM & Evening PM)
- Smart product replenishment tracking & reorder alerts
- Hydration targets, intervals, and quick-logging
- Circadian sleep target tracking & epidermal regeneration reminders
- Progress streak milestones and clinical platform alerts
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models import (
    Notification, ReminderPreference, ProductReplenishment,
    HydrationLog, SleepLog
)

def utc_now():
    return datetime.now(timezone.utc)

def get_default_notifications(user_id: int) -> List[Dict[str, Any]]:
    """Generates comprehensive initial notifications across all 5 categories."""
    now = datetime.now(timezone.utc)
    return [
        {
            "id": 1,
            "user_id": user_id,
            "title": "🌅 Morning Routine Reminder",
            "message": "Time for your AM Vitamin C & SPF 50+ Shield routine! Lock in hydration before UV exposure.",
            "category": "routine",
            "type": "info",
            "is_read": False,
            "action_url": "#checklist-am",
            "metadata_json": {"routine_type": "morning", "steps_count": 4},
            "created_at": (now - timedelta(minutes=45)).isoformat()
        },
        {
            "id": 2,
            "user_id": user_id,
            "title": "💧 Daily Hydration Milestone",
            "message": "You've reached 1,750ml today! Drink 2 more glasses to hit your 2,500ml skin moisture target.",
            "category": "hydration_sleep",
            "type": "success",
            "is_read": False,
            "action_url": "#hydration-widget",
            "metadata_json": {"current_ml": 1750, "target_ml": 2500},
            "created_at": (now - timedelta(hours=2)).isoformat()
        },
        {
            "id": 3,
            "user_id": user_id,
            "title": "⚠️ Product Replenishment Alert",
            "message": "Your 'The Ordinary Niacinamide 10%' has ~5 days of usage remaining. 1-Click reorder is available.",
            "category": "product",
            "type": "warning",
            "is_read": False,
            "action_url": "https://www.nykaa.com",
            "metadata_json": {"product_name": "The Ordinary Niacinamide 10%", "days_left": 5, "remaining_pct": 12.0},
            "created_at": (now - timedelta(hours=5)).isoformat()
        },
        {
            "id": 4,
            "user_id": user_id,
            "title": "🔥 14-Day Consistency Streak!",
            "message": "Incredible dedication! Your 14-day routine streak has boosted barrier lipid strength by +24%.",
            "category": "system",
            "type": "success",
            "is_read": True,
            "action_url": "/progress",
            "metadata_json": {"streak_days": 14, "barrier_delta": 24.0},
            "created_at": (now - timedelta(days=1)).isoformat()
        },
        {
            "id": 5,
            "user_id": user_id,
            "title": "🩺 Dermatologist Prescription Update",
            "message": "Dr. Julian Rostova reviewed your optical scan and adjusted your Adapalene PM application frequency to 3x/wk.",
            "category": "clinical",
            "type": "alert",
            "is_read": True,
            "action_url": "/chat",
            "metadata_json": {"doctor_name": "Dr. Julian Rostova, MD", "rx": "Adapalene 0.1%"},
            "created_at": (now - timedelta(days=2)).isoformat()
        }
    ]

def get_user_notifications(db: Session, user_id: int = 1, category: Optional[str] = None) -> Dict[str, Any]:
    """Retrieves notifications for user, optionally filtered by category."""
    db_notifs = db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()
    
    if not db_notifs:
        # Seed default in-memory list
        defaults = get_default_notifications(user_id)
        if category and category != "all":
            defaults = [n for n in defaults if n["category"] == category]
        
        unread_count = sum(1 for n in defaults if not n["is_read"])
        return {
            "success": True,
            "user_id": user_id,
            "unread_count": unread_count,
            "total_count": len(defaults),
            "notifications": defaults
        }

    items = []
    for n in db_notifs:
        if category and category != "all" and n.category != category:
            continue
        items.append({
            "id": n.id,
            "user_id": n.user_id,
            "title": n.title,
            "message": n.message,
            "category": n.category,
            "type": n.type,
            "is_read": bool(n.is_read),
            "action_url": n.action_url,
            "metadata_json": n.metadata_json or {},
            "created_at": n.created_at.isoformat() if n.created_at else utc_now().isoformat()
        })

    unread_count = sum(1 for i in items if not i["is_read"])
    return {
        "success": True,
        "user_id": user_id,
        "unread_count": unread_count,
        "total_count": len(items),
        "notifications": items
    }

def mark_notification_as_read(db: Session, notification_id: int) -> Dict[str, Any]:
    """Marks a single notification as read."""
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if notif:
        notif.is_read = 1
        db.commit()
        db.refresh(notif)
    
    return {
        "success": True,
        "marked_count": 1,
        "unread_remaining": 0
    }

def mark_all_notifications_as_read(db: Session, user_id: int) -> Dict[str, Any]:
    """Marks all notifications for a given user as read."""
    updated = db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == 0).update({"is_read": 1})
    db.commit()
    return {
        "success": True,
        "marked_count": updated,
        "unread_remaining": 0
    }

def get_user_reminder_preferences(db: Session, user_id: int = 1) -> Dict[str, Any]:
    """Fetches user reminder preferences with realistic defaults."""
    pref = db.query(ReminderPreference).filter(ReminderPreference.user_id == user_id).first()
    if not pref:
        return {
            "user_id": user_id,
            "morning_routine_time": "08:00",
            "evening_routine_time": "21:30",
            "hydration_target_ml": 2500,
            "hydration_interval_hours": 2,
            "sleep_wind_down_time": "22:30",
            "sleep_target_hours": 8.0,
            "weekly_scan_day": "Sunday",
            "enable_routine_reminders": True,
            "enable_replenishment_alerts": True,
            "enable_hydration_reminders": True,
            "enable_sleep_reminders": True,
            "enable_progress_alerts": True,
            "enable_platform_notifications": True
        }
    
    return {
        "user_id": pref.user_id,
        "morning_routine_time": pref.morning_routine_time,
        "evening_routine_time": pref.evening_routine_time,
        "hydration_target_ml": pref.hydration_target_ml,
        "hydration_interval_hours": pref.hydration_interval_hours,
        "sleep_wind_down_time": pref.sleep_wind_down_time,
        "sleep_target_hours": float(pref.sleep_target_hours),
        "weekly_scan_day": pref.weekly_scan_day,
        "enable_routine_reminders": bool(pref.enable_routine_reminders),
        "enable_replenishment_alerts": bool(pref.enable_replenishment_alerts),
        "enable_hydration_reminders": bool(pref.enable_hydration_reminders),
        "enable_sleep_reminders": bool(pref.enable_sleep_reminders),
        "enable_progress_alerts": bool(pref.enable_progress_alerts),
        "enable_platform_notifications": bool(pref.enable_platform_notifications)
    }

def update_user_reminder_preferences(db: Session, user_id: int, updates: Dict[str, Any]) -> Dict[str, Any]:
    """Updates user reminder configurations."""
    pref = db.query(ReminderPreference).filter(ReminderPreference.user_id == user_id).first()
    if not pref:
        pref = ReminderPreference(user_id=user_id)
        db.add(pref)
    
    for key, val in updates.items():
        if hasattr(pref, key):
            if isinstance(val, bool):
                setattr(pref, key, 1 if val else 0)
            else:
                setattr(pref, key, val)
    
    db.commit()
    db.refresh(pref)
    return get_user_reminder_preferences(db, user_id)

def get_user_product_replenishments(db: Session, user_id: int = 1) -> Dict[str, Any]:
    """
    Computes product usage and predicts depletion dates & replenishment warnings.
    """
    db_items = db.query(ProductReplenishment).filter(ProductReplenishment.user_id == user_id).all()
    
    if not db_items:
        # Default realistic replenishment items
        items = [
            {
                "id": 1,
                "user_id": user_id,
                "product_id": 1,
                "product_name": "The Ordinary Niacinamide 10% + Zinc 1%",
                "category": "Serum",
                "total_volume_ml": 30.0,
                "daily_usage_ml": 0.8,
                "remaining_pct": 12.0,
                "days_left": 5,
                "status": "Low",
                "reorder_url": "https://www.nykaa.com",
                "estimated_depletion_date": (datetime.now(timezone.utc) + timedelta(days=5)).strftime("%d %b %Y")
            },
            {
                "id": 2,
                "user_id": user_id,
                "product_id": 2,
                "product_name": "CeraVe Hydrating Facial Cleanser",
                "category": "Face Wash",
                "total_volume_ml": 236.0,
                "daily_usage_ml": 3.0,
                "remaining_pct": 45.0,
                "days_left": 35,
                "status": "Adequate",
                "reorder_url": "https://www.amazon.in",
                "estimated_depletion_date": (datetime.now(timezone.utc) + timedelta(days=35)).strftime("%d %b %Y")
            },
            {
                "id": 3,
                "user_id": user_id,
                "product_id": 3,
                "product_name": "La Roche-Posay Anthelios SPF 50+",
                "category": "Sunscreen",
                "total_volume_ml": 50.0,
                "daily_usage_ml": 1.5,
                "remaining_pct": 18.0,
                "days_left": 6,
                "status": "Low",
                "reorder_url": "https://www.amazon.in",
                "estimated_depletion_date": (datetime.now(timezone.utc) + timedelta(days=6)).strftime("%d %b %Y")
            },
            {
                "id": 4,
                "user_id": user_id,
                "product_id": 4,
                "product_name": "Illiyoon Ceramide Ato Concentrate Cream",
                "category": "Moisturizer",
                "total_volume_ml": 200.0,
                "daily_usage_ml": 2.5,
                "remaining_pct": 70.0,
                "days_left": 56,
                "status": "Adequate",
                "reorder_url": "https://www.nykaa.com",
                "estimated_depletion_date": (datetime.now(timezone.utc) + timedelta(days=56)).strftime("%d %b %Y")
            }
        ]
        low_count = sum(1 for i in items if i["status"] in ["Low", "Critical"])
        return {
            "success": True,
            "user_id": user_id,
            "active_items": items,
            "low_stock_alerts_count": low_count
        }

    items = []
    for p in db_items:
        items.append({
            "id": p.id,
            "user_id": p.user_id,
            "product_id": p.product_id,
            "product_name": p.product_name,
            "category": p.category,
            "total_volume_ml": float(p.total_volume_ml),
            "daily_usage_ml": float(p.daily_usage_ml),
            "remaining_pct": float(p.remaining_pct),
            "days_left": p.days_left,
            "status": p.status,
            "reorder_url": p.reorder_url,
            "estimated_depletion_date": (datetime.now(timezone.utc) + timedelta(days=p.days_left)).strftime("%d %b %Y")
        })

    low_count = sum(1 for i in items if i["status"] in ["Low", "Critical"])
    return {
        "success": True,
        "user_id": user_id,
        "active_items": items,
        "low_stock_alerts_count": low_count
    }

def log_hydration_intake(db: Session, user_id: int, amount_ml: int, log_date: Optional[str] = None) -> Dict[str, Any]:
    """Logs water intake increment (e.g. +250ml) and calculates daily progress."""
    target_date = log_date or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    now_time = datetime.now(timezone.utc).strftime("%H:%M")

    record = db.query(HydrationLog).filter(
        HydrationLog.user_id == user_id,
        HydrationLog.log_date == target_date
    ).first()

    if not record:
        record = HydrationLog(
            user_id=user_id,
            log_date=target_date,
            intake_ml=amount_ml,
            target_ml=2500,
            logs_breakdown=[{"time": now_time, "amount": amount_ml}]
        )
        db.add(record)
    else:
        record.intake_ml += amount_ml
        breakdown = list(record.logs_breakdown or [])
        breakdown.append({"time": now_time, "amount": amount_ml})
        record.logs_breakdown = breakdown
        record.updated_at = utc_now()
    
    db.commit()
    db.refresh(record)

    pct = round((record.intake_ml / record.target_ml) * 100.0, 1)
    status = "Target Reached 🎉" if record.intake_ml >= record.target_ml else f"{record.target_ml - record.intake_ml}ml remaining"

    return {
        "success": True,
        "user_id": user_id,
        "log_date": target_date,
        "total_intake_ml": record.intake_ml,
        "target_ml": record.target_ml,
        "progress_percentage": min(100.0, pct),
        "status": status,
        "logged_at": utc_now().isoformat()
    }

def log_sleep_schedule(db: Session, user_id: int, sleep_hours: float, sleep_quality: str, wind_down_time: Optional[str] = "22:30", notes: Optional[str] = None, log_date: Optional[str] = None) -> Dict[str, Any]:
    """Logs sleep hours and computes circadian epidermal regeneration status."""
    target_date = log_date or datetime.now(timezone.utc).strftime("%Y-%m-%d")

    record = db.query(SleepLog).filter(
        SleepLog.user_id == user_id,
        SleepLog.log_date == target_date
    ).first()

    if not record:
        record = SleepLog(
            user_id=user_id,
            log_date=target_date,
            sleep_hours=sleep_hours,
            sleep_quality=sleep_quality,
            wind_down_time=wind_down_time or "22:30",
            notes=notes
        )
        db.add(record)
    else:
        record.sleep_hours = sleep_hours
        record.sleep_quality = sleep_quality
        record.wind_down_time = wind_down_time or record.wind_down_time
        record.notes = notes
    
    db.commit()
    db.refresh(record)

    # Circadian repair score calculation
    repair_score = min(100.0, (sleep_hours / 8.0) * 100.0)
    if sleep_quality == "Optimal":
        repair_score = min(100.0, repair_score + 5.0)
    elif sleep_quality == "Restless":
        repair_score = max(40.0, repair_score - 15.0)

    regeneration_status = "Optimal Cellular Mitosis" if repair_score >= 85 else ("Standard Barrier Recovery" if repair_score >= 70 else "Suboptimal Repair / Elevated Cortisol")

    return {
        "success": True,
        "user_id": user_id,
        "log_date": target_date,
        "sleep_hours": sleep_hours,
        "sleep_quality": sleep_quality,
        "circadian_repair_score": round(repair_score, 1),
        "skin_cellular_regeneration_status": regeneration_status,
        "recorded_at": utc_now().isoformat()
    }
