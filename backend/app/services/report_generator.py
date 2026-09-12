import io
import csv
import unicodedata
from datetime import datetime, timezone
from typing import List, Optional, Any, Dict
try:
    from fpdf import FPDF
    from fpdf.enums import XPos, YPos
except ImportError:
    FPDF = None
    XPos = None
    YPos = None

try:
    import openpyxl
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    from openpyxl.utils import get_column_letter
except ImportError:
    openpyxl = None
    Font = PatternFill = Alignment = Border = Side = None
    get_column_letter = None

from sqlalchemy.orm import Session

from app.models import (
    User, SkinProfile, SkinAssessment, SkincareRoutine,
    ProductRecommendation, Product, SkincareLog,
    SkinProgressPhoto, ReminderSetting, IngredientCompatibilityCheck
)
from app.services.skin_health_scoring import compute_skin_health_breakdown

DISCLAIMER_TEXT = (
    "Wellness Disclaimer: This AI Skin Intelligence report is provided for cosmetic, wellness, "
    "and personalized skincare planning purposes only. It does not constitute medical diagnosis, "
    "clinical prognosis, or prescription treatment from a licensed board-certified dermatologist. "
    "Consult a healthcare provider for any persistent, severe, or urgent skin conditions."
)


def safe_text(val: Any) -> str:
    """Sanitize string for standard PDF font encoding (latin-1 compatible)."""
    if val is None:
        return "N/A"
    s = str(val)
    s = s.replace("\u2018", "'").replace("\u2019", "'")
    s = s.replace("\u201c", '"').replace("\u201d", '"')
    s = s.replace("\u2013", "-").replace("\u2014", "-")
    s = s.replace("\u2022", "*").replace("\u2026", "...")
    s = s.replace("\u20b9", "INR ").replace("₹", "INR ")
    s = s.replace("\t", " ")
    clean = "".join(c for c in unicodedata.normalize("NFKD", s) if ord(c) < 256)
    return clean.strip() or "N/A"


def calculate_adherence_metrics(routines, logs):
    total_logs = len(logs)
    completed_logs = sum(1 for l in logs if getattr(l, "completed", 0))
    adherence_pct = round((completed_logs / max(1, total_logs)) * 100, 1) if total_logs > 0 else 0.0

    morning_logs = [l for l in logs if getattr(l, "routine_type", "") == "MORNING"]
    morn_completed = sum(1 for l in morning_logs if getattr(l, "completed", 0))
    morn_rate = round((morn_completed / max(1, len(morning_logs))) * 100, 1) if morning_logs else 0.0

    evening_logs = [l for l in logs if getattr(l, "routine_type", "") == "EVENING"]
    eve_completed = sum(1 for l in evening_logs if getattr(l, "completed", 0))
    eve_rate = round((eve_completed / max(1, len(evening_logs))) * 100, 1) if evening_logs else 0.0

    return {
        "total_logs": total_logs,
        "completed_logs": completed_logs,
        "adherence_pct": adherence_pct,
        "morning_rate": morn_rate,
        "evening_rate": eve_rate
    }


# =====================================================================
# CANONICAL REPORT DATASET BUILDER
# =====================================================================

def build_canonical_report_dataset(db: Session, user: User) -> Dict[str, Any]:
    """
    Construct a single canonical, comprehensive report dataset directly from
    the authenticated user's real database records across all domains.
    Guarantees that PDF, XLSX, and CSV exports reflect the exact same data.
    """
    now_utc = datetime.now(timezone.utc)
    gen_date_str = now_utc.strftime("%Y-%m-%d %H:%M UTC")

    # 1. Fetch core database records with strict user isolation
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user.id).first()
    assessments = db.query(SkinAssessment).filter(
        SkinAssessment.user_id == user.id
    ).order_by(SkinAssessment.created_at.desc(), SkinAssessment.id.desc()).all()
    routines = db.query(SkincareRoutine).filter(
        SkincareRoutine.user_id == user.id
    ).all()
    logs = db.query(SkincareLog).filter(
        SkincareLog.user_id == user.id
    ).order_by(SkincareLog.logged_date.desc()).all()
    photos = db.query(SkinProgressPhoto).filter(
        SkinProgressPhoto.user_id == user.id
    ).order_by(SkinProgressPhoto.logged_at.desc()).all()
    reminders = db.query(ReminderSetting).filter(
        ReminderSetting.user_id == user.id
    ).all()
    compat_checks = db.query(IngredientCompatibilityCheck).filter(
        IngredientCompatibilityCheck.user_id == user.id
    ).order_by(IngredientCompatibilityCheck.created_at.desc()).all()
    rec_session = db.query(ProductRecommendation).filter(
        ProductRecommendation.user_id == user.id
    ).order_by(ProductRecommendation.created_at.desc()).first()

    # Catalog lookup for live enrichment
    all_products = db.query(Product).all()
    prod_map_by_id = {p.id: p for p in all_products}
    prod_map_by_name = {p.name.lower().strip(): p for p in all_products}

    # 2. Build User & Skin Profile canonical section
    patient_name = (profile.full_name if (profile and profile.full_name) else user.full_name) or "N/A"
    user_prof = {
        "full_name": patient_name,
        "email": user.email,
        "role": user.role if hasattr(user, "role") else "USER",
        "registered_at": user.created_at.strftime("%Y-%m-%d") if getattr(user, "created_at", None) else "N/A",
        "age": getattr(profile, "age", "Not specified") if profile else "Not specified",
        "gender": getattr(profile, "gender", "Not specified") if profile else "Not specified"
    }

    concerns_list = []
    if profile and profile.concerns:
        if isinstance(profile.concerns, list):
            concerns_list = [str(c) for c in profile.concerns if c]
        else:
            concerns_list = [str(profile.concerns)]

    skin_prof = {
        "has_profile": profile is not None,
        "skin_type": getattr(profile, "skin_type", "Pending Profile Completion") if profile else "Pending Profile Completion",
        "skin_tone": getattr(profile, "skin_tone", "Pending Tone Assessment") if profile else "Pending Tone Assessment",
        "concerns": concerns_list,
        "concerns_display": ", ".join(concerns_list) if concerns_list else "None reported",
        "allergies": getattr(profile, "allergies", "No active ingredient allergies reported") or "No active ingredient allergies reported",
        "sensitivities": getattr(profile, "sensitivities", "No active sensitivities reported") or "No active sensitivities reported",
        "lifestyle": getattr(profile, "lifestyle", "Not specified") or "Not specified",
        "sleep_quality": getattr(profile, "sleep_quality", "Not specified") or "Not specified",
        "water_intake": f"{getattr(profile, 'water_intake', 2.0)} L/day" if profile else "2.0 L/day",
        "stress_level": getattr(profile, "stress_level", "Not specified") or "Not specified",
        "environmental_exposure": getattr(profile, "environmental_exposure", "Standard indoor/outdoor") or "Standard indoor/outdoor",
        "climate": getattr(profile, "climate", "Temperate") or "Temperate",
        "uv_exposure": getattr(profile, "uv_exposure", "Moderate") or "Moderate"
    }

    # 3. Compute 5-Factor Health Score
    health_score_breakdown = compute_skin_health_breakdown(db=db, user=user)
    health_score = {
        "overall_score": health_score_breakdown.get("overall_score", 60.0),
        "risk_level": health_score_breakdown.get("risk_level", "Moderate"),
        "status_label": health_score_breakdown.get("status_label", "Balanced"),
        "interpretation": health_score_breakdown.get("interpretation", "Baseline wellness profile"),
        "summary": health_score_breakdown.get("summary", ""),
        "factors": []
    }
    raw_factors = health_score_breakdown.get("factors", {})
    for f_key in ["skin_condition", "lifestyle", "sleep_quality", "routine_consistency", "hydration"]:
        f_info = raw_factors.get(f_key, {})
        health_score["factors"].append({
            "key": f_key,
            "name": f_info.get("name", f_key.replace("_", " ").title()),
            "score": f_info.get("score", 60.0),
            "status": f_info.get("status", "Balanced"),
            "meaning": f_info.get("description", "Daily pillar contributing to skin barrier health.")
        })

    # 4. AI Skin Assessment & Diagnostic Parameters
    latest_ass = assessments[0] if assessments else None
    assessment_data = {
        "has_assessment": latest_ass is not None,
        "total_assessments": len(assessments),
        "latest": None,
        "history": []
    }
    if latest_ass:
        assessment_data["latest"] = {
            "id": latest_ass.id,
            "date": latest_ass.created_at.strftime("%Y-%m-%d") if getattr(latest_ass, "created_at", None) else "N/A",
            "overall_score": f"{latest_ass.overall_score}%",
            "risk_level": latest_ass.risk_level,
            "concern_priority": latest_ass.concern_priority,
            "acne": getattr(latest_ass, "acne", 0),
            "hyperpigmentation": getattr(latest_ass, "hyperpigmentation", 0),
            "dryness": getattr(latest_ass, "dryness", 0),
            "oiliness": getattr(latest_ass, "oiliness", 0),
            "redness": getattr(latest_ass, "redness", 0),
            "sensitivity": getattr(latest_ass, "sensitivity", 0),
            "wrinkles": getattr(latest_ass, "wrinkles", 10),
            "fine_lines": getattr(latest_ass, "fine_lines", 15),
            "dark_spots": getattr(latest_ass, "dark_spots", 20),
            "uneven_tone": getattr(latest_ass, "uneven_tone", 20),
            "summary": getattr(latest_ass, "summary", "Clinical parameters evaluated.")
        }
    for a in assessments[:15]:
        assessment_data["history"].append({
            "id": a.id,
            "date": a.created_at.strftime("%Y-%m-%d") if getattr(a, "created_at", None) else "N/A",
            "overall_score": f"{a.overall_score}%",
            "risk_level": a.risk_level,
            "concern_priority": a.concern_priority,
            "acne": getattr(a, "acne", 0),
            "hyperpigmentation": getattr(a, "hyperpigmentation", 0),
            "dryness": getattr(a, "dryness", 0),
            "oiliness": getattr(a, "oiliness", 0),
            "redness": getattr(a, "redness", 0),
            "sensitivity": getattr(a, "sensitivity", 0),
            "summary": (getattr(a, "summary", "") or "").replace("\n", " ")
        })

    # 5. Concerns & Safety / Ingredient Conflicts
    conflicts_summary = "No ingredient conflicts identified for the current recommendations."
    if compat_checks:
        first_c = compat_checks[0]
        if getattr(first_c, "conflicts_found", None):
            cf_items = []
            for item in first_c.conflicts_found[:3]:
                if isinstance(item, dict):
                    i1 = item.get("ingredient_1", "")
                    i2 = item.get("ingredient_2", "")
                    reason = item.get("reason", "")
                    if i1 and i2:
                        cf_items.append(f"{i1} + {i2}")
                    elif reason:
                        cf_items.append(str(reason))
                    else:
                        cf_items.append(str(item))
                else:
                    cf_items.append(str(item))
            conflicts_summary = f"Identified {len(first_c.conflicts_found)} potential conflict(s): {', '.join(cf_items)}"

    concerns_and_safety = {
        "target_concerns": concerns_list if concerns_list else ["No specific concerns noted"],
        "declared_allergies": skin_prof["allergies"],
        "sensitivities": skin_prof["sensitivities"],
        "safety_notes": "Safety notice: Perform a 24-hour localized patch test before introducing new clinical active formulations.",
        "ingredient_conflicts": conflicts_summary
    }

    # 6. Personalized Skincare Protocols (Morning, Evening, Weekly, Monthly, Seasonal)
    routines_categorized: Dict[str, List[Dict[str, Any]]] = {
        "MORNING": [],
        "EVENING": [],
        "WEEKLY": [],
        "MONTHLY": [],
        "SEASONAL": []
    }
    for r in routines:
        r_type = (r.routine_type or "").upper()
        if r_type not in routines_categorized:
            routines_categorized[r_type] = []
        if isinstance(r.steps, list) and r.steps:
            for idx, s in enumerate(r.steps, 1):
                if isinstance(s, dict):
                    prod_or_ing = s.get("product_name") or s.get("ingredient") or s.get("category") or f"Step {idx}"
                    routines_categorized[r_type].append({
                        "routine_title": r.title,
                        "step_number": s.get("step_number", idx),
                        "category": s.get("category") or s.get("step_type") or "Care Step",
                        "product_or_ingredient": prod_or_ing,
                        "instructions": s.get("instructions") or "Apply as directed.",
                        "frequency": s.get("frequency") or f"Daily ({r_type.capitalize()})",
                        "duration": s.get("duration") or "1-2 mins",
                        "precautions": s.get("precautions") or "Avoid contact with eyes.",
                        "expected_benefits": s.get("expected_benefits") or "Supports moisture barrier balance."
                    })
        else:
            routines_categorized[r_type].append({
                "routine_title": r.title,
                "step_number": 1,
                "category": "Protocol Overview",
                "product_or_ingredient": r.title,
                "instructions": r.description or "Follow personalized protocol as recommended.",
                "frequency": f"Regular ({r_type.capitalize()})",
                "duration": "Standard",
                "precautions": "Monitor skin tolerance.",
                "expected_benefits": "Optimizes dermatological barrier health."
            })

    # 7. AI Product Recommendations
    recommended_products_list = []
    overall_match_score = 0.0
    budget_tier_label = "All"
    if rec_session:
        overall_match_score = rec_session.overall_match_score or 0.0
        budget_tier_label = rec_session.budget_tier or "All"
        raw_recs = rec_session.recommended_products or []
        for item in raw_recs:
            if isinstance(item, dict):
                p_info = item.get("product", {})
                p_id = p_info.get("id")
                live_p = prod_map_by_id.get(p_id) if p_id else prod_map_by_name.get(p_info.get("name", "").lower().strip())

                raw_price = live_p.price if live_p else p_info.get("price", 0.0)
                inr_price = raw_price * 85.0 if raw_price < 300.0 else raw_price
                price_display = f"INR {int(round(inr_price))}"

                # Budget tier
                b_tier = "Low" if inr_price <= 1500 else ("Medium" if inr_price <= 4000 else "Premium")

                actives = (live_p.active_ingredients if live_p else p_info.get("active_ingredients")) or []
                match_reasons = item.get("match_reasons", [])
                reasons_str = "; ".join(match_reasons) if match_reasons else f"Targeted formulation for {skin_prof['skin_type']} skin"

                recommended_products_list.append({
                    "name": p_info.get("name") or (live_p.name if live_p else "Custom Dermatological Active"),
                    "brand": p_info.get("brand") or (live_p.brand if live_p else "Clinical Formulation"),
                    "category": p_info.get("category") or (live_p.category if live_p else "Skincare Active"),
                    "match_score": f"{item.get('suitability_score', 90.0)}%",
                    "match_score_num": item.get("suitability_score", 90.0),
                    "price_inr": price_display,
                    "price_num": int(round(inr_price)),
                    "budget_tier": b_tier,
                    "key_actives": ", ".join(actives) if isinstance(actives, list) and actives else str(actives),
                    "why_recommended": reasons_str,
                    "suitable_skin_types": ", ".join(p_info.get("suitable_skin_types", ["All"])),
                    "suitable_concerns": ", ".join(p_info.get("suitable_concerns", ["Barrier Care"])),
                    "usage_instructions": live_p.usage_instructions if (live_p and live_p.usage_instructions) else (p_info.get("usage_instructions") or "Apply as directed by morning/evening routine."),
                    "purchase_url": live_p.purchase_url if (live_p and live_p.purchase_url) else (p_info.get("purchase_url") or "Available at authorized dermatological retailers"),
                    "alternatives": "Available in catalog under same category"
                })

    # 8. Adherence & Progress Diary
    adh = calculate_adherence_metrics(routines, logs)
    progress_diary = {
        "adherence_pct": adh["adherence_pct"],
        "total_logs": adh["total_logs"],
        "completed_logs": adh["completed_logs"],
        "morning_rate": adh["morning_rate"],
        "evening_rate": adh["evening_rate"],
        "photos_count": len(photos),
        "recent_logs": [
            {
                "id": l.id,
                "routine_type": getattr(l, "routine_type", "DAILY"),
                "date": l.logged_date.strftime("%Y-%m-%d %H:%M") if getattr(l, "logged_date", None) else "N/A",
                "status": "COMPLETED" if getattr(l, "completed", 0) else "MISSED",
                "notes": getattr(l, "notes", "") or ""
            }
            for l in logs[:30]
        ],
        "photos_metadata": [
            {
                "id": p.id,
                "date": p.logged_at.strftime("%Y-%m-%d %H:%M") if getattr(p, "logged_at", None) else "N/A",
                "linked_assessment": f"#{p.associated_assessment_id}" if p.associated_assessment_id else "Unlinked",
                "notes": p.notes or "Progress milestone photo recorded"
            }
            for p in photos[:15]
        ]
    }

    # 9. Reminder Settings
    reminder_list = [
        {
            "reminder_type": r.reminder_type,
            "type_display": r.reminder_type.replace("ROUTINE_", "").replace("_", " ").title(),
            "time_of_day": r.time_of_day,
            "recurrence": r.recurrence,
            "enabled": bool(r.enabled)
        }
        for r in reminders
    ]

    return {
        "metadata": {
            "platform_name": "AI Skin Intelligence Platform",
            "report_title": "Personalized Skin Health & Dermatological Intelligence Record",
            "generated_at": gen_date_str,
            "version": "3.0-canonical"
        },
        "user_profile": user_prof,
        "skin_profile": skin_prof,
        "health_score": health_score,
        "ai_skin_assessment": assessment_data,
        "concerns_and_safety": concerns_and_safety,
        "personalized_routines": routines_categorized,
        "product_recommendations": {
            "has_recommendations": len(recommended_products_list) > 0,
            "overall_match_score": f"{overall_match_score}%",
            "budget_tier": budget_tier_label,
            "products": recommended_products_list
        },
        "progress_and_adherence": progress_diary,
        "reminder_settings": reminder_list,
        "disclaimer": DISCLAIMER_TEXT
    }


def assemble_canonical_from_components(
    user: Any,
    profile: Optional[Any] = None,
    assessments: Optional[List[Any]] = None,
    routines: Optional[List[Any]] = None,
    logs: Optional[List[Any]] = None,
    photos: Optional[List[Any]] = None,
    recommendations: Optional[Any] = None,
    reminders: Optional[List[Any]] = None,
    compat_checks: Optional[List[Any]] = None
) -> Dict[str, Any]:
    """Fallback assembler when generators are called with discrete arguments."""
    now_utc = datetime.now(timezone.utc)
    gen_date_str = now_utc.strftime("%Y-%m-%d %H:%M UTC")

    assessments = assessments or []
    routines = routines or []
    logs = logs or []
    photos = photos or []
    reminders = reminders or []

    patient_name = (profile.full_name if (profile and getattr(profile, "full_name", None)) else getattr(user, "full_name", "N/A")) or "N/A"
    user_prof = {
        "full_name": patient_name,
        "email": getattr(user, "email", "N/A"),
        "role": getattr(user, "role", "USER"),
        "registered_at": user.created_at.strftime("%Y-%m-%d") if getattr(user, "created_at", None) else "N/A",
        "age": getattr(profile, "age", "Not specified") if profile else "Not specified",
        "gender": getattr(profile, "gender", "Not specified") if profile else "Not specified"
    }

    concerns_list = []
    if profile and getattr(profile, "concerns", None):
        if isinstance(profile.concerns, list):
            concerns_list = [str(c) for c in profile.concerns if c]
        else:
            concerns_list = [str(profile.concerns)]

    skin_prof = {
        "has_profile": profile is not None,
        "skin_type": getattr(profile, "skin_type", "Pending Profile Completion") if profile else "Pending Profile Completion",
        "skin_tone": getattr(profile, "skin_tone", "Pending Tone Assessment") if profile else "Pending Tone Assessment",
        "concerns": concerns_list,
        "concerns_display": ", ".join(concerns_list) if concerns_list else "None reported",
        "allergies": getattr(profile, "allergies", "No active ingredient allergies reported") or "No active ingredient allergies reported",
        "sensitivities": getattr(profile, "sensitivities", "No active sensitivities reported") or "No active sensitivities reported",
        "lifestyle": getattr(profile, "lifestyle", "Not specified") or "Not specified",
        "sleep_quality": getattr(profile, "sleep_quality", "Not specified") or "Not specified",
        "water_intake": f"{getattr(profile, 'water_intake', 2.0)} L/day" if profile else "2.0 L/day",
        "stress_level": getattr(profile, "stress_level", "Not specified") or "Not specified",
        "environmental_exposure": getattr(profile, "environmental_exposure", "Standard indoor/outdoor") or "Standard indoor/outdoor",
        "climate": getattr(profile, "climate", "Temperate") or "Temperate",
        "uv_exposure": getattr(profile, "uv_exposure", "Moderate") or "Moderate"
    }

    latest_ass = assessments[0] if assessments else None
    base_score = latest_ass.overall_score if latest_ass else 65.0
    health_score = {
        "overall_score": float(base_score),
        "risk_level": latest_ass.risk_level if latest_ass else "Balanced",
        "status_label": "Healthy" if base_score >= 70 else "Balanced",
        "interpretation": "Evaluated against current dermatological markers.",
        "summary": "Baseline skin health snapshot.",
        "factors": [
            {"key": "skin_condition", "name": "Skin Barrier & Condition", "score": float(base_score), "status": "Healthy", "meaning": "Evaluated from diagnostic parameters."},
            {"key": "lifestyle", "name": "Lifestyle & Daily Rhythm", "score": 75.0, "status": "Healthy", "meaning": "Daily activity and environmental rhythm balance."},
            {"key": "sleep_quality", "name": "Rest & Nighttime Recovery", "score": 70.0, "status": "Healthy", "meaning": "Nightly recovery supporting cellular skin barrier."},
            {"key": "routine_consistency", "name": "Daily Routine Consistency", "score": 80.0, "status": "Optimal", "meaning": "Consistency in completing planned morning/evening steps."},
            {"key": "hydration", "name": "Daily Hydration Balance", "score": 85.0, "status": "Optimal", "meaning": "Daily fluid intake preserving optimal moisture levels."}
        ]
    }

    assessment_data = {
        "has_assessment": latest_ass is not None,
        "total_assessments": len(assessments),
        "latest": None,
        "history": []
    }
    if latest_ass:
        assessment_data["latest"] = {
            "id": latest_ass.id,
            "date": latest_ass.created_at.strftime("%Y-%m-%d") if getattr(latest_ass, "created_at", None) else "N/A",
            "overall_score": f"{latest_ass.overall_score}%",
            "risk_level": latest_ass.risk_level,
            "concern_priority": latest_ass.concern_priority,
            "acne": getattr(latest_ass, "acne", 0),
            "hyperpigmentation": getattr(latest_ass, "hyperpigmentation", 0),
            "dryness": getattr(latest_ass, "dryness", 0),
            "oiliness": getattr(latest_ass, "oiliness", 0),
            "redness": getattr(latest_ass, "redness", 0),
            "sensitivity": getattr(latest_ass, "sensitivity", 0),
            "wrinkles": getattr(latest_ass, "wrinkles", 10),
            "fine_lines": getattr(latest_ass, "fine_lines", 15),
            "dark_spots": getattr(latest_ass, "dark_spots", 20),
            "uneven_tone": getattr(latest_ass, "uneven_tone", 20),
            "summary": getattr(latest_ass, "summary", "Clinical parameters evaluated.")
        }
    for a in assessments[:15]:
        assessment_data["history"].append({
            "id": a.id,
            "date": a.created_at.strftime("%Y-%m-%d") if getattr(a, "created_at", None) else "N/A",
            "overall_score": f"{a.overall_score}%",
            "risk_level": a.risk_level,
            "concern_priority": a.concern_priority,
            "acne": getattr(a, "acne", 0),
            "hyperpigmentation": getattr(a, "hyperpigmentation", 0),
            "dryness": getattr(a, "dryness", 0),
            "oiliness": getattr(a, "oiliness", 0),
            "redness": getattr(a, "redness", 0),
            "sensitivity": getattr(a, "sensitivity", 0),
            "summary": (getattr(a, "summary", "") or "").replace("\n", " ")
        })

    concerns_and_safety = {
        "target_concerns": concerns_list if concerns_list else ["No specific concerns noted"],
        "declared_allergies": skin_prof["allergies"],
        "sensitivities": skin_prof["sensitivities"],
        "safety_notes": "Safety notice: Perform a 24-hour localized patch test before introducing new clinical active formulations.",
        "ingredient_conflicts": "No ingredient conflicts identified for the current recommendations."
    }

    routines_categorized: Dict[str, List[Dict[str, Any]]] = {
        "MORNING": [],
        "EVENING": [],
        "WEEKLY": [],
        "MONTHLY": [],
        "SEASONAL": []
    }
    for r in routines:
        r_type = (r.routine_type or "").upper()
        if r_type not in routines_categorized:
            routines_categorized[r_type] = []
        if isinstance(r.steps, list) and r.steps:
            for idx, s in enumerate(r.steps, 1):
                if isinstance(s, dict):
                    prod_or_ing = s.get("product_name") or s.get("ingredient") or s.get("category") or f"Step {idx}"
                    routines_categorized[r_type].append({
                        "routine_title": r.title,
                        "step_number": s.get("step_number", idx),
                        "category": s.get("category") or s.get("step_type") or "Care Step",
                        "product_or_ingredient": prod_or_ing,
                        "instructions": s.get("instructions") or "Apply as directed.",
                        "frequency": s.get("frequency") or f"Daily ({r_type.capitalize()})",
                        "duration": s.get("duration") or "1-2 mins",
                        "precautions": s.get("precautions") or "Avoid contact with eyes.",
                        "expected_benefits": s.get("expected_benefits") or "Supports moisture barrier balance."
                    })
        else:
            routines_categorized[r_type].append({
                "routine_title": r.title,
                "step_number": 1,
                "category": "Protocol Overview",
                "product_or_ingredient": r.title,
                "instructions": r.description or "Follow personalized protocol as recommended.",
                "frequency": f"Regular ({r_type.capitalize()})",
                "duration": "Standard",
                "precautions": "Monitor skin tolerance.",
                "expected_benefits": "Optimizes dermatological barrier health."
            })

    adh = calculate_adherence_metrics(routines, logs)
    progress_diary = {
        "adherence_pct": adh["adherence_pct"],
        "total_logs": adh["total_logs"],
        "completed_logs": adh["completed_logs"],
        "morning_rate": adh["morning_rate"],
        "evening_rate": adh["evening_rate"],
        "photos_count": len(photos),
        "recent_logs": [
            {
                "id": l.id,
                "routine_type": getattr(l, "routine_type", "DAILY"),
                "date": l.logged_date.strftime("%Y-%m-%d %H:%M") if getattr(l, "logged_date", None) else "N/A",
                "status": "COMPLETED" if getattr(l, "completed", 0) else "MISSED",
                "notes": getattr(l, "notes", "") or ""
            }
            for l in logs[:30]
        ],
        "photos_metadata": [
            {
                "id": p.id,
                "date": p.logged_at.strftime("%Y-%m-%d %H:%M") if getattr(p, "logged_at", None) else "N/A",
                "linked_assessment": f"#{p.associated_assessment_id}" if p.associated_assessment_id else "Unlinked",
                "notes": p.notes or "Progress milestone photo recorded"
            }
            for p in photos[:15]
        ]
    }

    return {
        "metadata": {
            "platform_name": "AI Skin Intelligence Platform",
            "report_title": "Personalized Skin Health & Dermatological Intelligence Record",
            "generated_at": gen_date_str,
            "version": "3.0-canonical"
        },
        "user_profile": user_prof,
        "skin_profile": skin_prof,
        "health_score": health_score,
        "ai_skin_assessment": assessment_data,
        "concerns_and_safety": concerns_and_safety,
        "personalized_routines": routines_categorized,
        "product_recommendations": {
            "has_recommendations": False,
            "overall_match_score": "N/A",
            "budget_tier": "All",
            "products": []
        },
        "progress_and_adherence": progress_diary,
        "reminder_settings": [],
        "disclaimer": DISCLAIMER_TEXT
    }


def _resolve_canonical_data(data_or_user: Any, *args, **kwargs) -> Dict[str, Any]:
    """Helper to support both single canonical dict and legacy multi-argument calls."""
    if isinstance(data_or_user, dict) and "metadata" in data_or_user and "user_profile" in data_or_user:
        return data_or_user
    # Convert legacy arguments
    user = data_or_user
    profile = args[0] if len(args) > 0 else kwargs.get("profile")
    assessments = args[1] if len(args) > 1 else kwargs.get("assessments")
    routines = args[2] if len(args) > 2 else kwargs.get("routines")
    logs = args[3] if len(args) > 3 else kwargs.get("logs")
    photos = args[4] if len(args) > 4 else kwargs.get("photos")
    return assemble_canonical_from_components(
        user=user,
        profile=profile,
        assessments=assessments,
        routines=routines,
        logs=logs,
        photos=photos
    )


# =====================================================================
# 1. PDF REPORT GENERATOR (BINARY PDF)
# =====================================================================

def generate_pdf_report(data_or_user: Any, *args, **kwargs) -> bytes:
    cd = _resolve_canonical_data(data_or_user, *args, **kwargs)

    user_p = cd["user_profile"]
    skin_p = cd["skin_profile"]
    hs = cd["health_score"]
    ass = cd["ai_skin_assessment"]
    safety = cd["concerns_and_safety"]
    routines = cd["personalized_routines"]
    recs = cd["product_recommendations"]
    prog = cd["progress_and_adherence"]
    reminders = cd["reminder_settings"]

    pdf = FPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Brand Title Header
    pdf.set_font("helvetica", "B", 16)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 9, "AI SKIN INTELLIGENCE PLATFORM", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")

    pdf.set_font("helvetica", "B", 10)
    pdf.set_text_color(79, 70, 229)
    pdf.cell(0, 5, "Personalized Clinical Skincare Health & Diagnostic Record", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")

    pdf.set_font("helvetica", "", 8)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(0, 4, f"Report Generated: {cd['metadata']['generated_at']}   |   Confidential Medical Wellness Record", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align="C")
    pdf.ln(2)

    # Decorative separator line
    pdf.set_draw_color(203, 213, 225)
    pdf.set_line_width(0.4)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())
    pdf.ln(4)

    # SECTION 1: Patient Profile & Dermatological Biometrics
    pdf.set_font("helvetica", "B", 11)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 7, "1. Patient Profile Summary & Dermatological Biometrics", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_font("helvetica", "", 8.5)
    pdf.set_text_color(51, 65, 85)
    pdf.cell(0, 5, f"Patient Name: {safe_text(user_p['full_name'])}   |   Email: {safe_text(user_p['email'])}   |   Role: {safe_text(user_p['role'])}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(0, 5, f"Age: {safe_text(user_p['age'])}   |   Gender: {safe_text(user_p['gender'])}   |   Skin Type: {safe_text(skin_p['skin_type'])}   |   Fitzpatrick Tone: {safe_text(skin_p['skin_tone'])}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(0, 5, f"Primary Concerns: {safe_text(skin_p['concerns_display'])}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(0, 5, f"Allergies: {safe_text(skin_p['allergies'])}   |   Sensitivities: {safe_text(skin_p['sensitivities'])}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(0, 5, f"Daily Water Target: {safe_text(skin_p['water_intake'])}   |   Stress Level: {safe_text(skin_p['stress_level'])}   |   Sleep: {safe_text(skin_p['sleep_quality'])}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(0, 5, f"Climate: {safe_text(skin_p['climate'])}   |   UV Level: {safe_text(skin_p['uv_exposure'])}   |   Environmental Exposure: {safe_text(skin_p['environmental_exposure'])}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(3)

    # SECTION 2: AI Skin Health Score & 5-Factor Breakdown
    pdf.set_font("helvetica", "B", 11)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 7, f"2. AI Skin Health Score: {hs['overall_score']}/100 ({safe_text(hs['status_label'])})", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_font("helvetica", "I", 8.5)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(0, 4.5, f"Clinical Interpretation: {safe_text(hs['interpretation'])} - {safe_text(hs['summary'])}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)

    # 5 Factors Table
    pdf.set_font("helvetica", "B", 8)
    pdf.set_fill_color(241, 245, 249)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(45, 6, "Wellness Factor Pillar", border=1, fill=True)
    pdf.cell(22, 6, "Score", border=1, fill=True, align="C")
    pdf.cell(25, 6, "Status", border=1, fill=True, align="C")
    pdf.cell(88, 6, "Pillar Interpretation & Meaning", border=1, fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_font("helvetica", "", 8)
    pdf.set_text_color(51, 65, 85)
    for f in hs["factors"]:
        pdf.cell(45, 5.5, safe_text(f["name"]), border=1)
        pdf.cell(22, 5.5, f"{f['score']}/100", border=1, align="C")
        pdf.cell(25, 5.5, safe_text(f["status"]), border=1, align="C")
        pdf.cell(88, 5.5, safe_text(f["meaning"])[:60], border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(3)

    # SECTION 3: AI Skin Assessment & Diagnostic Parameters
    pdf.set_font("helvetica", "B", 11)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 7, f"3. AI Skin Assessment Spectrum & History ({ass['total_assessments']} recorded)", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    if ass["latest"]:
        lat = ass["latest"]
        pdf.set_font("helvetica", "B", 8.5)
        pdf.set_text_color(51, 65, 85)
        pdf.cell(0, 5, f"Latest Diagnostic: {lat['overall_score']} ({safe_text(lat['risk_level'])})   |   Priority Focus: {safe_text(lat['concern_priority'])}   |   Date: {lat['date']}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        # Diagnostic Sub-parameters Grid
        pdf.set_font("helvetica", "", 7.5)
        pdf.cell(0, 4.5, f"Diagnostic Spectrum: Acne={lat['acne']} | Pigment={lat['hyperpigmentation']} | Dryness={lat['dryness']} | Oiliness={lat['oiliness']} | Redness={lat['redness']} | Sensitivity={lat['sensitivity']} | Wrinkles={lat['wrinkles']} | Dark Spots={lat['dark_spots']}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(1)

        # History Table
        pdf.set_font("helvetica", "B", 7.5)
        pdf.set_fill_color(241, 245, 249)
        pdf.set_text_color(30, 41, 59)
        pdf.cell(15, 5.5, "ID", border=1, fill=True, align="C")
        pdf.cell(24, 5.5, "Date", border=1, fill=True, align="C")
        pdf.cell(22, 5.5, "Health Score", border=1, fill=True, align="C")
        pdf.cell(32, 5.5, "Risk Level", border=1, fill=True, align="C")
        pdf.cell(42, 5.5, "Priority Concern", border=1, fill=True)
        pdf.cell(45, 5.5, "Sub-Scores (Acne/Dry/Red)", border=1, fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        pdf.set_font("helvetica", "", 7.5)
        pdf.set_text_color(51, 65, 85)
        for h in ass["history"][:8]:
            pdf.cell(15, 5, f"#{h['id']}", border=1, align="C")
            pdf.cell(24, 5, safe_text(h["date"]), border=1, align="C")
            pdf.cell(22, 5, safe_text(h["overall_score"]), border=1, align="C")
            pdf.cell(32, 5, safe_text(h["risk_level"]), border=1, align="C")
            pdf.cell(42, 5, safe_text(h["concern_priority"])[:22], border=1)
            pdf.cell(45, 5, f"{h['acne']} / {h['dryness']} / {h['redness']}", border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    else:
        pdf.set_font("helvetica", "I", 8.5)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 5.5, "No clinical skin assessments logged yet. Take a diagnostic scan to populate health trends.", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(3)

    # SECTION 4: Skin Concerns & Safety
    pdf.set_font("helvetica", "B", 11)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 7, "4. Skin Concerns & Allergy Safety Guard", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_font("helvetica", "", 8)
    pdf.set_text_color(51, 65, 85)
    pdf.cell(0, 4.5, f"- Target Concerns: {safe_text(', '.join(safety['target_concerns']))}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(0, 4.5, f"- Declared Allergies: {safe_text(safety['declared_allergies'])}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(0, 4.5, f"- Sensitivities: {safe_text(safety['sensitivities'])}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(0, 4.5, f"- Ingredient Conflict Checks: {safe_text(safety['ingredient_conflicts'])}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(3)

    # SECTION 5: Personalized Skincare Protocols
    pdf.set_font("helvetica", "B", 11)
    pdf.set_text_color(15, 23, 42)
    has_any_routines = any(len(steps) > 0 for steps in routines.values())
    pdf.cell(0, 7, f"5. Personalized Skincare Protocols ({'Configured' if has_any_routines else 'Pending'})", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    if has_any_routines:
        for r_cat in ["MORNING", "EVENING", "WEEKLY", "MONTHLY", "SEASONAL"]:
            steps = routines.get(r_cat, [])
            if steps:
                pdf.set_font("helvetica", "B", 8.5)
                pdf.set_text_color(79, 70, 229)
                pdf.cell(0, 5, f"[{r_cat}] Protocol ({len(steps)} steps)", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

                pdf.set_font("helvetica", "B", 7.5)
                pdf.set_fill_color(248, 250, 252)
                pdf.set_text_color(30, 41, 59)
                pdf.cell(14, 5, "Step", border=1, fill=True, align="C")
                pdf.cell(32, 5, "Category", border=1, fill=True)
                pdf.cell(48, 5, "Product / Active Formulation", border=1, fill=True)
                pdf.cell(50, 5, "Application Instructions", border=1, fill=True)
                pdf.cell(36, 5, "Frequency & Timing", border=1, fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

                pdf.set_font("helvetica", "", 7.5)
                pdf.set_text_color(51, 65, 85)
                for s in steps:
                    pdf.cell(14, 4.8, f"#{s['step_number']}", border=1, align="C")
                    pdf.cell(32, 4.8, safe_text(s["category"])[:25], border=1)
                    pdf.cell(48, 4.8, safe_text(s["product_or_ingredient"])[:45], border=1)
                    pdf.cell(50, 4.8, safe_text(s["instructions"])[:38], border=1)
                    pdf.cell(36, 4.8, safe_text(s["frequency"])[:28], border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
                pdf.ln(1.5)
    else:
        pdf.set_font("helvetica", "I", 8.5)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 5.5, "No routines configured yet. Routines are automatically generated upon completing an assessment.", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(3)

    # SECTION 6: AI Product Recommendations
    pdf.set_font("helvetica", "B", 11)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 7, f"6. AI Product Recommendations & Clinical Actives ({len(recs['products'])} recommended)", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    if recs["has_recommendations"] and recs["products"]:
        pdf.set_font("helvetica", "B", 7.5)
        pdf.set_fill_color(241, 245, 249)
        pdf.set_text_color(30, 41, 59)
        pdf.cell(45, 5.5, "Product & Brand", border=1, fill=True)
        pdf.cell(24, 5.5, "Category", border=1, fill=True)
        pdf.cell(20, 5.5, "Match", border=1, fill=True, align="C")
        pdf.cell(25, 5.5, "Price (INR)", border=1, fill=True, align="C")
        pdf.cell(66, 5.5, "Clinical Reasoning & Actives", border=1, fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        pdf.set_font("helvetica", "", 7.5)
        pdf.set_text_color(51, 65, 85)
        for p in recs["products"][:12]:
            prod_label = f"{safe_text(p['name'])} ({safe_text(p['brand'])})"
            reason_label = f"{safe_text(p['why_recommended'])[:35]} | Actives: {safe_text(p['key_actives'])[:25]}"
            pdf.cell(45, 5, prod_label[:45], border=1)
            pdf.cell(24, 5, safe_text(p["category"])[:20], border=1)
            pdf.cell(20, 5, safe_text(p["match_score"]), border=1, align="C")
            pdf.cell(25, 5, safe_text(p["price_inr"]), border=1, align="C")
            pdf.cell(66, 5, reason_label[:65], border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    else:
        pdf.set_font("helvetica", "I", 8.5)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 5.5, "No product recommendations are available yet. Complete an AI skin assessment to generate matched products.", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(3)

    # SECTION 7: Routine Compliance & Progress Diary
    pdf.set_font("helvetica", "B", 11)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 7, "7. Routine Compliance & Progress Diary", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_font("helvetica", "", 8.5)
    pdf.set_text_color(51, 65, 85)
    pdf.cell(0, 4.5, f"Overall Adherence Rate: {prog['adherence_pct']}%   |   Completed Activities: {prog['completed_logs']}/{prog['total_logs']}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(0, 4.5, f"Morning Routine Completion: {prog['morning_rate']}%   |   Evening Routine Completion: {prog['evening_rate']}%", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(0, 4.5, f"Milestone Progress Photos Saved: {prog['photos_count']} entries recorded in clinical diary.", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    if reminders:
        pdf.ln(2)
        pdf.set_font("helvetica", "B", 8.5)
        pdf.cell(0, 5, f"Automated Reminder Schedule ({len(reminders)} active):", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_font("helvetica", "", 7.5)
        rem_str = " | ".join(f"{r['type_display']} @ {r['time_of_day']}" for r in reminders if r["enabled"])
        pdf.cell(0, 4.5, safe_text(rem_str or "Default reminders active"), new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.ln(4)

    # SECTION 8: Medical Wellness Disclaimer
    pdf.set_font("helvetica", "I", 7.5)
    pdf.set_text_color(100, 116, 139)
    pdf.multi_cell(0, 4, cd["disclaimer"])

    return bytes(pdf.output())


# =====================================================================
# 2. CSV REPORT GENERATOR (UTF-8 WITH BOM)
# =====================================================================

def generate_csv_report(data_or_user: Any, *args, **kwargs) -> bytes:
    cd = _resolve_canonical_data(data_or_user, *args, **kwargs)

    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)

    # Normalized Table Headers
    writer.writerow(["=== AI SKIN INTELLIGENCE PLATFORM REPORT ==="])
    writer.writerow(["Section", "Category", "Field", "Value", "Details", "Date"])

    # 1. Report Metadata & User Profile
    u = cd["user_profile"]
    writer.writerow(["Metadata", "System", "Platform Name", cd["metadata"]["platform_name"], "Clinical Skincare Engine", cd["metadata"]["generated_at"]])
    writer.writerow(["Metadata", "System", "Report Generated", cd["metadata"]["generated_at"], "UTC Timestamp", cd["metadata"]["generated_at"]])
    writer.writerow(["User Profile", "Personal", "Patient Name", u["full_name"], "Authenticated Patient", ""])
    writer.writerow(["User Profile", "Personal", "Patient Email", u["email"], "Primary Account", ""])
    writer.writerow(["User Profile", "Personal", "Account Role", u["role"], "Platform Role", u["registered_at"]])
    writer.writerow(["User Profile", "Biometrics", "Age", u["age"], "Years", ""])
    writer.writerow(["User Profile", "Biometrics", "Gender", u["gender"], "Biological Sex", ""])

    # 2. Skin Profile
    sp = cd["skin_profile"]
    writer.writerow(["Skin Profile", "Dermatological", "Skin Type", sp["skin_type"], "Diagnostic Baseline", ""])
    writer.writerow(["Skin Profile", "Dermatological", "Skin Tone", sp["skin_tone"], "Fitzpatrick Scale", ""])
    writer.writerow(["Skin Profile", "Concerns", "Target Concerns", sp["concerns_display"], "User Selected", ""])
    writer.writerow(["Skin Profile", "Safety", "Allergies", sp["allergies"], "Reported Allergies", ""])
    writer.writerow(["Skin Profile", "Safety", "Sensitivities", sp["sensitivities"], "Known Reactivity", ""])
    writer.writerow(["Skin Profile", "Lifestyle", "Daily Water Intake Target", sp["water_intake"], "Hydration Goal", ""])
    writer.writerow(["Skin Profile", "Lifestyle", "Sleep Quality", sp["sleep_quality"], "Nightly Recovery", ""])
    writer.writerow(["Skin Profile", "Lifestyle", "Stress Level", sp["stress_level"], "Reported Stress", ""])
    writer.writerow(["Skin Profile", "Environment", "Climate", sp["climate"], "Regional Weather", ""])
    writer.writerow(["Skin Profile", "Environment", "UV Exposure", sp["uv_exposure"], "Daily Exposure", ""])

    # 3. Health Score & 5 Factors
    hs = cd["health_score"]
    writer.writerow(["Health Score", "Composite", "Overall Skin Health Score", f"{hs['overall_score']}/100", hs["interpretation"], ""])
    writer.writerow(["Health Score", "Composite", "Status Label", hs["status_label"], hs["summary"], ""])
    for f in hs["factors"]:
        writer.writerow(["Health Score", "Pillar Breakdown", f["name"], f"{f['score']}/100", f"{f['status']}: {f['meaning']}", ""])

    # 4. AI Skin Assessment
    ass = cd["ai_skin_assessment"]
    if ass["has_assessment"] and ass["latest"]:
        lat = ass["latest"]
        writer.writerow(["Assessment", "Latest Diagnostic", "Assessment ID", f"#{lat['id']}", lat["concern_priority"], lat["date"]])
        writer.writerow(["Assessment", "Latest Diagnostic", "Overall Score (%)", lat["overall_score"], lat["risk_level"], lat["date"]])
        writer.writerow(["Assessment", "Diagnostic Spectrum", "Acne", lat["acne"], "Parameter Score (0-100)", lat["date"]])
        writer.writerow(["Assessment", "Diagnostic Spectrum", "Pigment", lat["hyperpigmentation"], "Parameter Score (0-100)", lat["date"]])
        writer.writerow(["Assessment", "Diagnostic Spectrum", "Dryness", lat["dryness"], "Parameter Score (0-100)", lat["date"]])
        writer.writerow(["Assessment", "Diagnostic Spectrum", "Oiliness", lat["oiliness"], "Parameter Score (0-100)", lat["date"]])
        writer.writerow(["Assessment", "Diagnostic Spectrum", "Redness", lat["redness"], "Parameter Score (0-100)", lat["date"]])
        writer.writerow(["Assessment", "Diagnostic Spectrum", "Sensitivity", lat["sensitivity"], "Parameter Score (0-100)", lat["date"]])
        writer.writerow(["Assessment", "Summary", "Diagnostic Summary", lat["summary"], lat["concern_priority"], lat["date"]])
        for h in ass["history"]:
            writer.writerow(["Assessment", "History", f"Assessment #{h['id']}", h["overall_score"], f"Risk: {h['risk_level']}, Focus: {h['concern_priority']}, Acne:{h['acne']}, Dry:{h['dryness']}, Red:{h['redness']}", h["date"]])
    else:
        writer.writerow(["Assessment", "Status", "Historical Assessments", "No assessments recorded yet.", "Complete scan to populate", ""])

    # 5. Personalized Routines
    routines = cd["personalized_routines"]
    has_steps = False
    for r_type, steps in routines.items():
        if steps:
            has_steps = True
            for s in steps:
                writer.writerow([
                    "Routine",
                    r_type,
                    f"Step {s['step_number']}: {s['category']}",
                    s["product_or_ingredient"],
                    f"Instructions: {s['instructions']} | Freq: {s['frequency']} | Expected: {s['expected_benefits']}",
                    ""
                ])
    if not has_steps:
        writer.writerow(["Routine", "Status", "Skincare Protocols", "No routine steps recorded yet.", "Routines generate after assessment", ""])

    # 6. Product Recommendations
    recs = cd["product_recommendations"]
    if recs["has_recommendations"] and recs["products"]:
        writer.writerow(["Product", "Summary", "Overall Match Score", recs["overall_match_score"], f"Budget Tier: {recs['budget_tier']}", ""])
        for p in recs["products"]:
            writer.writerow([
                "Product",
                "Recommendation",
                f"{p['name']} ({p['brand']})",
                p["match_score"],
                f"Price: {p['price_inr']} | Actives: {p['key_actives']} | Reasons: {p['why_recommended']} | Usage: {p['usage_instructions']} | Link: {p['purchase_url']}",
                ""
            ])
    else:
        writer.writerow(["Product", "Status", "AI Recommendations", "No product recommendations are available yet.", "Generated upon completing assessment", ""])

    # 7. Adherence & Progress History
    prog = cd["progress_and_adherence"]
    writer.writerow(["Progress", "Adherence", "Overall Adherence Rate", f"{prog['adherence_pct']}%", f"Completed: {prog['completed_logs']}/{prog['total_logs']}", ""])
    writer.writerow(["Progress", "Adherence", "Morning Routine Adherence", f"{prog['morning_rate']}%", "AM Routine Logs", ""])
    writer.writerow(["Progress", "Adherence", "Evening Routine Adherence", f"{prog['evening_rate']}%", "PM Routine Logs", ""])
    writer.writerow(["Progress", "Milestone", "Milestone Progress Photos", prog["photos_count"], "Clinical Diary Entries", ""])
    for ph in prog["photos_metadata"]:
        writer.writerow(["Progress", "Photo Diary", f"Photo #{ph['id']}", ph["linked_assessment"], ph["notes"], ph["date"]])

    # 8. Reminders
    for r in cd["reminder_settings"]:
        writer.writerow(["Reminders", "Schedule", r["type_display"], r["time_of_day"], f"Recurrence: {r['recurrence']}, Enabled: {r['enabled']}", ""])

    # 9. Wellness Disclaimer
    writer.writerow(["Disclaimer", "Medical Guidance", "Wellness Disclaimer", cd["disclaimer"], "Non-Diagnostic Care", ""])

    # Return with UTF-8 BOM (\ufeff) for seamless Microsoft Excel rendering
    return output.getvalue().encode("utf-8-sig")


# =====================================================================
# 3. XLSX REPORT GENERATOR (MULTI-WORKSHEET WORKBOOK)
# =====================================================================

def generate_xlsx_report(data_or_user: Any, *args, **kwargs) -> bytes:
    cd = _resolve_canonical_data(data_or_user, *args, **kwargs)

    wb = openpyxl.Workbook()

    # Styling Palettes
    header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid")
    section_fill = PatternFill(start_color="334155", end_color="334155", fill_type="solid")
    sub_fill = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")

    title_font = Font(name="Calibri", size=14, bold=True, color="1E293B")
    white_bold = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
    bold_font = Font(name="Calibri", size=10, bold=True, color="0F172A")
    regular_font = Font(name="Calibri", size=10, color="334155")
    italic_font = Font(name="Calibri", size=9, italic=True, color="64748B")

    thin_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )

    # -------------------------------------------------------------
    # WORKSHEET 1: Health Summary (Patient Summary)
    # -------------------------------------------------------------
    ws1 = wb.active
    ws1.title = "Health Summary"
    ws1.views.sheetView[0].showGridLines = True

    ws1.append(["AI SKIN INTELLIGENCE PLATFORM - PATIENT CLINICAL HEALTH SUMMARY"])
    ws1["A1"].font = title_font
    ws1.append([])

    ws1.append(["PATIENT INFORMATION", ""])
    r_h = ws1.max_row
    ws1[f"A{r_h}"].font = white_bold
    ws1[f"A{r_h}"].fill = section_fill
    ws1[f"B{r_h}"].fill = section_fill

    u = cd["user_profile"]
    ws1.append(["Full Name", u["full_name"]])
    ws1.append(["Email Address", u["email"]])
    ws1.append(["Account Role", u["role"]])
    ws1.append(["Report Generated", cd["metadata"]["generated_at"]])
    ws1.append([])

    ws1.append(["DERMATOLOGICAL PROFILE", ""])
    r_h = ws1.max_row
    ws1[f"A{r_h}"].font = white_bold
    ws1[f"A{r_h}"].fill = section_fill
    ws1[f"B{r_h}"].fill = section_fill

    sp = cd["skin_profile"]
    ws1.append(["Age", u["age"]])
    ws1.append(["Gender", u["gender"]])
    ws1.append(["Skin Type", sp["skin_type"]])
    ws1.append(["Skin Tone", sp["skin_tone"]])
    ws1.append(["Primary Concerns", sp["concerns_display"]])
    ws1.append(["Allergies", sp["allergies"]])
    ws1.append(["Sensitivities", sp["sensitivities"]])
    ws1.append(["Daily Water Intake Target", sp["water_intake"]])
    ws1.append(["Stress Level", sp["stress_level"]])
    ws1.append(["Climate & Environment", f"{sp['climate']}, UV: {sp['uv_exposure']}"])
    ws1.append([])

    hs = cd["health_score"]
    ass = cd["ai_skin_assessment"]
    prog = cd["progress_and_adherence"]

    ws1.append(["CLINICAL WELLNESS SNAPSHOT", ""])
    r_h = ws1.max_row
    ws1[f"A{r_h}"].font = white_bold
    ws1[f"A{r_h}"].fill = section_fill
    ws1[f"B{r_h}"].fill = section_fill

    latest_score_str = ass["latest"]["overall_score"] if ass["latest"] else "N/A"
    latest_risk_str = ass["latest"]["risk_level"] if ass["latest"] else "N/A"
    ws1.append(["Latest Skin Health Score", latest_score_str])
    ws1.append(["Current Risk Classification", latest_risk_str])
    ws1.append(["Composite Skin Health Index", f"{hs['overall_score']}/100 ({hs['status_label']})"])
    ws1.append(["Routine Adherence Rate", f"{prog['adherence_pct']}%"])
    ws1.append(["Total Logged Activities", prog["total_logs"]])
    ws1.append(["Milestone Progress Photos", prog["photos_count"]])
    ws1.append([])

    ws1.append(["MEDICAL WELLNESS DISCLAIMER"])
    r_h = ws1.max_row
    ws1[f"A{r_h}"].font = bold_font
    ws1.append([cd["disclaimer"]])
    ws1[f"A{r_h+1}"].font = italic_font

    for row in ws1.iter_rows(min_row=4, max_row=ws1.max_row - 2, min_col=1, max_col=2):
        for cell in row:
            if cell.value and not cell.fill.start_color.rgb:
                cell.font = bold_font if cell.column == 1 else regular_font

    # -------------------------------------------------------------
    # WORKSHEET 2: Skin Profile
    # -------------------------------------------------------------
    ws_prof = wb.create_sheet(title="Skin Profile")
    ws_prof.views.sheetView[0].showGridLines = True
    ws_prof.append(["Parameter", "Clinical User Value", "Context & Guidance"])
    for col_num in range(1, 4):
        c = ws_prof.cell(row=1, column=col_num)
        c.font = white_bold
        c.fill = header_fill
        c.alignment = Alignment(horizontal="center")

    prof_rows = [
        ("Full Name", u["full_name"], "Authenticated user"),
        ("Age", u["age"], "Chronological age"),
        ("Gender", u["gender"], "Biological sex profile"),
        ("Skin Type", sp["skin_type"], "Diagnostic lipid/moisture baseline"),
        ("Fitzpatrick Skin Tone", sp["skin_tone"], "UV sensitivity and melanin classification"),
        ("Primary Concerns", sp["concerns_display"], "Active concerns addressed by protocol"),
        ("Declared Allergies", sp["allergies"], "Safety guard filtering"),
        ("Sensitivities", sp["sensitivities"], "Formulation reactivity warnings"),
        ("Daily Water Intake Target", sp["water_intake"], "Hydration barrier goal"),
        ("Rest / Sleep Quality", sp["sleep_quality"], "Nightly barrier cellular repair"),
        ("Stress Level", sp["stress_level"], "Cortisol impact on sebum regulation"),
        ("Climate", sp["climate"], "Atmospheric humidity adaptation"),
        ("UV Exposure", sp["uv_exposure"], "Daily photoprotection requirements"),
        ("Environmental Exposure", sp["environmental_exposure"], "Pollution and oxidative stress")
    ]
    for r in prof_rows:
        ws_prof.append(list(r))
        curr_r = ws_prof.max_row
        for col_num in range(1, 4):
            cell = ws_prof.cell(row=curr_r, column=col_num)
            cell.font = regular_font
            cell.border = thin_border
            if col_num == 1:
                cell.font = bold_font

    # -------------------------------------------------------------
    # WORKSHEET 3: Health Score (5-Factor Breakdown)
    # -------------------------------------------------------------
    ws_hs = wb.create_sheet(title="Health Score")
    ws_hs.views.sheetView[0].showGridLines = True
    ws_hs.append(["AI SKIN HEALTH SCORING ENGINE (5-FACTOR BREAKDOWN)"])
    ws_hs["A1"].font = title_font
    ws_hs.append([f"Overall Composite Score: {hs['overall_score']}/100", f"Status: {hs['status_label']}", f"Risk Level: {hs['risk_level']}"])
    ws_hs.append([])

    hs_headers = ["Pillar Factor", "Score (0-100)", "Status", "Clinical Meaning & Interpretation"]
    ws_hs.append(hs_headers)
    hdr_r = ws_hs.max_row
    for col_num in range(1, len(hs_headers) + 1):
        c = ws_hs.cell(row=hdr_r, column=col_num)
        c.font = white_bold
        c.fill = header_fill
        c.alignment = Alignment(horizontal="center")

    for f in hs["factors"]:
        ws_hs.append([
            f["name"],
            f["score"],
            f["status"],
            f["meaning"]
        ])
        curr_r = ws_hs.max_row
        for col_num in range(1, len(hs_headers) + 1):
            cell = ws_hs.cell(row=curr_r, column=col_num)
            cell.font = regular_font
            cell.border = thin_border
            if col_num in [2, 3]:
                cell.alignment = Alignment(horizontal="center")

    # -------------------------------------------------------------
    # WORKSHEET 4: Skin Assessment (AI Assessment & History)
    # -------------------------------------------------------------
    ws2 = wb.create_sheet(title="Skin Assessment")
    ws2.views.sheetView[0].showGridLines = True

    ass_headers = [
        "Assessment ID", "Date", "Overall Score (%)", "Risk Level",
        "Primary Priority", "Acne", "Pigment", "Dryness", "Redness", "Oiliness",
        "Sensitivity", "Diagnostic Summary"
    ]
    ws2.append(ass_headers)
    for col_num in range(1, len(ass_headers) + 1):
        cell = ws2.cell(row=1, column=col_num)
        cell.font = white_bold
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center", vertical="center")

    if ass["has_assessment"] and ass["history"]:
        for a in ass["history"]:
            ws2.append([
                a["id"],
                a["date"],
                a["overall_score"],
                a["risk_level"],
                a["concern_priority"],
                a["acne"],
                a["hyperpigmentation"],
                a["dryness"],
                a["redness"],
                a["oiliness"],
                a["sensitivity"],
                a["summary"]
            ])
            r = ws2.max_row
            for c in range(1, len(ass_headers) + 1):
                cell = ws2.cell(row=r, column=c)
                cell.font = regular_font
                cell.border = thin_border
                if c in [1, 2, 3, 4, 6, 7, 8, 9, 10, 11]:
                    cell.alignment = Alignment(horizontal="center")
    else:
        ws2.append(["No clinical skin assessments logged yet."])
        ws2.cell(row=2, column=1).font = italic_font

    # -------------------------------------------------------------
    # WORKSHEET 5: Concerns & Safety
    # -------------------------------------------------------------
    ws_safe = wb.create_sheet(title="Concerns & Safety")
    ws_safe.views.sheetView[0].showGridLines = True
    ws_safe.append(["Safety Parameter", "Reported Value", "Dermatological Precaution Notes"])
    for col_num in range(1, 4):
        c = ws_safe.cell(row=1, column=col_num)
        c.font = white_bold
        c.fill = header_fill
        c.alignment = Alignment(horizontal="center")

    safety_rows = [
        ("Target Concerns", sp["concerns_display"], "Active dermatological targets addressed by protocols."),
        ("Declared Allergies", sp["allergies"], "Excluded from AI recommendation candidate pool."),
        ("Sensitivities", sp["sensitivities"], "Requires cautious concentration gradients and patch testing."),
        ("Ingredient Conflicts", cd["concerns_and_safety"]["ingredient_conflicts"], "Cross-product active compatibility evaluation."),
        ("Clinical Safety Guidelines", cd["concerns_and_safety"]["safety_notes"], "Always patch test new formulas on inner forearm 24h prior to facial application.")
    ]
    for r in safety_rows:
        ws_safe.append(list(r))
        curr_r = ws_safe.max_row
        for col_num in range(1, 4):
            cell = ws_safe.cell(row=curr_r, column=col_num)
            cell.font = regular_font
            cell.border = thin_border
            if col_num == 1:
                cell.font = bold_font

    # -------------------------------------------------------------
    # WORKSHEET 6: Personalized Routine
    # -------------------------------------------------------------
    ws_rout = wb.create_sheet(title="Personalized Routine")
    ws_rout.views.sheetView[0].showGridLines = True
    rout_headers = ["Schedule", "Step #", "Category", "Product / Active Formulation", "Instructions", "Frequency", "Expected Benefits"]
    ws_rout.append(rout_headers)
    for col_num in range(1, len(rout_headers) + 1):
        c = ws_rout.cell(row=1, column=col_num)
        c.font = white_bold
        c.fill = header_fill
        c.alignment = Alignment(horizontal="center")

    has_rout_steps = False
    for r_cat in ["MORNING", "EVENING", "WEEKLY", "MONTHLY", "SEASONAL"]:
        steps = cd["personalized_routines"].get(r_cat, [])
        for s in steps:
            has_rout_steps = True
            ws_rout.append([
                r_cat,
                s["step_number"],
                s["category"],
                s["product_or_ingredient"],
                s["instructions"],
                s["frequency"],
                s["expected_benefits"]
            ])
            curr_r = ws_rout.max_row
            for col_num in range(1, len(rout_headers) + 1):
                cell = ws_rout.cell(row=curr_r, column=col_num)
                cell.font = regular_font
                cell.border = thin_border
                if col_num in [1, 2]:
                    cell.alignment = Alignment(horizontal="center")
    if not has_rout_steps:
        ws_rout.append(["ALL", "N/A", "Status", "No routines configured yet.", "Complete assessment to generate protocols.", "N/A", "N/A"])
        ws_rout.cell(row=2, column=4).font = italic_font

    # -------------------------------------------------------------
    # WORKSHEET 7: Product Recommendations
    # -------------------------------------------------------------
    ws_prod = wb.create_sheet(title="Product Recommendations")
    ws_prod.views.sheetView[0].showGridLines = True
    prod_headers = ["Product Name", "Brand", "Category", "Match Score (%)", "Price (INR)", "Budget Tier", "Key Actives", "Why Recommended", "Usage Instructions", "Retail / Store Link"]
    ws_prod.append(prod_headers)
    for col_num in range(1, len(prod_headers) + 1):
        c = ws_prod.cell(row=1, column=col_num)
        c.font = white_bold
        c.fill = header_fill
        c.alignment = Alignment(horizontal="center")

    recs = cd["product_recommendations"]
    if recs["has_recommendations"] and recs["products"]:
        for p in recs["products"]:
            ws_prod.append([
                p["name"],
                p["brand"],
                p["category"],
                p["match_score"],
                p["price_inr"],
                p["budget_tier"],
                p["key_actives"],
                p["why_recommended"],
                p["usage_instructions"],
                p["purchase_url"]
            ])
            curr_r = ws_prod.max_row
            for col_num in range(1, len(prod_headers) + 1):
                cell = ws_prod.cell(row=curr_r, column=col_num)
                cell.font = regular_font
                cell.border = thin_border
                if col_num in [4, 5, 6]:
                    cell.alignment = Alignment(horizontal="center")
    else:
        ws_prod.append(["No product recommendations are available yet."])
        ws_prod.cell(row=2, column=1).font = italic_font

    # -------------------------------------------------------------
    # WORKSHEET 8: Routine Adherence (Routine Adherence)
    # -------------------------------------------------------------
    ws3 = wb.create_sheet(title="Routine Adherence")
    ws3.views.sheetView[0].showGridLines = True

    ws3.append(["ACTIVE PERSONALIZED PROTOCOLS"])
    ws3["A1"].font = title_font
    ws3.append([])
    proto_headers = ["Routine Type", "Protocol Title", "Steps Count", "Key Products Preview"]
    ws3.append(proto_headers)
    r_idx = ws3.max_row
    for col_num in range(1, len(proto_headers) + 1):
        cell = ws3.cell(row=r_idx, column=col_num)
        cell.font = white_bold
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center")

    has_any_proto = False
    for r_cat in ["MORNING", "EVENING", "WEEKLY", "MONTHLY", "SEASONAL"]:
        steps = cd["personalized_routines"].get(r_cat, [])
        if steps:
            has_any_proto = True
            preview = ", ".join(s["product_or_ingredient"] for s in steps[:3])
            ws3.append([r_cat, f"{r_cat.capitalize()} Protocol", len(steps), preview])
            curr_r = ws3.max_row
            for col_num in range(1, 5):
                ws3.cell(row=curr_r, column=col_num).border = thin_border
    if not has_any_proto:
        ws3.append(["No routines configured yet."])
        ws3.cell(row=ws3.max_row, column=1).font = italic_font
    ws3.append([])

    ws3.append(["ROUTINE COMPLIANCE TELEMETRY"])
    r_idx = ws3.max_row
    ws3[f"A{r_idx}"].font = bold_font
    ws3.append(["Metric", "Value"])
    r_idx = ws3.max_row
    ws3[f"A{r_idx}"].font = white_bold
    ws3[f"A{r_idx}"].fill = section_fill
    ws3[f"B{r_idx}"].font = white_bold
    ws3[f"B{r_idx}"].fill = section_fill

    ws3.append(["Total Routine Logs", prog["total_logs"]])
    ws3.append(["Completed Routine Steps", prog["completed_logs"]])
    ws3.append(["Overall Adherence Percentage", f"{prog['adherence_pct']}%"])
    ws3.append(["Morning Routine Adherence", f"{prog['morning_rate']}%"])
    ws3.append(["Evening Routine Adherence", f"{prog['evening_rate']}%"])
    ws3.append([])

    log_headers = ["Log ID", "Routine Type", "Logged Date", "Status", "Notes"]
    ws3.append(log_headers)
    hdr_row = ws3.max_row
    for col_num in range(1, len(log_headers) + 1):
        cell = ws3.cell(row=hdr_row, column=col_num)
        cell.font = white_bold
        cell.fill = section_fill
        cell.alignment = Alignment(horizontal="center")

    if prog["recent_logs"]:
        for l in prog["recent_logs"][:50]:
            ws3.append([l["id"], l["routine_type"], l["date"], l["status"], l["notes"]])
            r = ws3.max_row
            for c in range(1, len(log_headers) + 1):
                cell = ws3.cell(row=r, column=c)
                cell.font = regular_font
                cell.border = thin_border
                if c in [1, 2, 3, 4]:
                    cell.alignment = Alignment(horizontal="center")
    else:
        ws3.append(["No routine completion activity recorded yet."])
        ws3.cell(row=ws3.max_row, column=1).font = italic_font

    # -------------------------------------------------------------
    # WORKSHEET 9: Progress History (Progress History)
    # -------------------------------------------------------------
    ws4 = wb.create_sheet(title="Progress History")
    ws4.views.sheetView[0].showGridLines = True

    photo_headers = ["Photo ID", "Date Logged", "Associated Assessment ID", "Clinical Notes"]
    ws4.append(photo_headers)
    for col_num in range(1, len(photo_headers) + 1):
        cell = ws4.cell(row=1, column=col_num)
        cell.font = white_bold
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center")

    if prog["photos_metadata"]:
        for p in prog["photos_metadata"]:
            ws4.append([p["id"], p["date"], p["linked_assessment"], p["notes"]])
            r = ws4.max_row
            for c in range(1, len(photo_headers) + 1):
                cell = ws4.cell(row=r, column=c)
                cell.font = regular_font
                cell.border = thin_border
                if c in [1, 2, 3]:
                    cell.alignment = Alignment(horizontal="center")
    else:
        ws4.append(["No progress milestone photos recorded yet."])
        ws4.cell(row=2, column=1).font = italic_font

    # -------------------------------------------------------------
    # WORKSHEET 10: Reminder Settings
    # -------------------------------------------------------------
    ws_rem = wb.create_sheet(title="Reminder Settings")
    ws_rem.views.sheetView[0].showGridLines = True
    rem_headers = ["Reminder Type", "Notification Purpose", "Scheduled Time", "Recurrence", "Status"]
    ws_rem.append(rem_headers)
    for col_num in range(1, len(rem_headers) + 1):
        c = ws_rem.cell(row=1, column=col_num)
        c.font = white_bold
        c.fill = header_fill
        c.alignment = Alignment(horizontal="center")

    reminders = cd["reminder_settings"]
    if reminders:
        for r in reminders:
            ws_rem.append([
                r["reminder_type"],
                r["type_display"],
                r["time_of_day"],
                r["recurrence"],
                "ACTIVE" if r["enabled"] else "PAUSED"
            ])
            curr_r = ws_rem.max_row
            for col_num in range(1, len(rem_headers) + 1):
                cell = ws_rem.cell(row=curr_r, column=col_num)
                cell.font = regular_font
                cell.border = thin_border
                if col_num in [3, 4, 5]:
                    cell.alignment = Alignment(horizontal="center")
    else:
        ws_rem.append(["Default automated reminder schedules active."])
        ws_rem.cell(row=2, column=1).font = italic_font

    # Auto-adjust column widths across all worksheets
    for ws in wb.worksheets:
        for col in ws.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                if cell.value:
                    val_str = str(cell.value)
                    if "\n" in val_str:
                        val_str = val_str.split("\n")[0]
                    max_len = max(max_len, len(val_str))
            ws.column_dimensions[col_letter].width = min(60, max(max_len + 3, 12))

    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return buf.getvalue()
