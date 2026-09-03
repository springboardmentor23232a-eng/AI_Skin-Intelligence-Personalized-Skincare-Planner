import os
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

load_dotenv()


from app.database import Base, engine, get_db, SessionLocal
from app.models import (
    Admin, Assignment, Consultant, User, SkinProfile, AssessmentHistory,
    AssessmentRisk, AssessmentPriority, SkincareRoutine, RoutineStep,
    SeasonalRecommendation, RoutineCheckin
)
from app.services.routine_engine import generate_personalized_routine_data, get_current_season
from app.services.ingredient_intelligence import (
    generate_ingredient_intelligence_report,
    analyze_interactions,
    get_ingredient_categories_catalog,
    get_ingredient_education,
)
from app.services.product_engine import (
    PRODUCT_CATEGORIES,
    PRODUCT_CATALOG,
    calculate_product_suitability,
    get_personalized_recommendations,
    compare_products_side_by_side,
    get_product_alternatives,
    build_budget_optimized_routine,
)

from ML_models.risk_engine import analyze_risks
from ML_models.priority_concern import prioritize_concerns
from ML_models.scoring_engine import calculate_weighted_skin_health_score


# Automatically create database tables if missing
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not automatically create database tables: {e}")


SECRET_KEY = os.getenv("SECRET_KEY", "fallback-insecure-key-for-development").strip()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 5

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "Frontend"
INDEX_FILE = FRONTEND_DIR / "index.html"
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="Skincare Planner & Dermatological Intelligence API",
    version="2.0.0",
    description="Advanced AI-powered personalized skincare routines, ingredient intelligence, and product recommendation engine."
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


# ---------------------------------------------------------------------------
# Pydantic schemas
# ---------------------------------------------------------------------------

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str


class RegisterRequest(BaseModel):
    name: Optional[str] = ""
    email: str
    password: str
    role: str


class GoogleOAuthRequest(BaseModel):
    credential: str
    role: str
    name: Optional[str] = ""


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserPayload(BaseModel):
    email: str
    role: str


class UserProfileResponse(BaseModel):
    id: int
    name: Optional[str] = ""
    email: str
    role: str
    created_at: Optional[datetime] = None


class StatusResponse(BaseModel):
    status: str


class AssessmentRiskResponse(BaseModel):
    id: int
    risk_title: str
    risk_level: str
    description: str
    recommendation: str

    class Config:
        from_attributes = True


class AssessmentPriorityResponse(BaseModel):
    id: int
    concern_name: str
    priority_rank: int
    severity: str
    priority_score: int

    class Config:
        from_attributes = True


class AssessmentHistoryResponse(BaseModel):
    assessment_id: int
    user_id: int
    skin_profile_id: int
    skin_health_score: int
    skin_health_category: str
    overall_risk_level: str
    assessment_date: Optional[datetime] = None
    model_version: str
    image_url: Optional[str] = ""
    trigger_source: str
    notes: Optional[str] = ""
    created_at: Optional[datetime] = None
    risks: list[AssessmentRiskResponse] = []
    priorities: list[AssessmentPriorityResponse] = []

    class Config:
        from_attributes = True


class AssessmentHistoryListResponse(BaseModel):
    history: list[AssessmentHistoryResponse] = []


class AssessmentScoreResponse(BaseModel):
    skin_health_score: int
    skin_health_category: str


class ScoreBreakdownResponse(BaseModel):
    final_score: int
    category: str
    sub_scores: dict = {}
    weighted_contributions: dict = {}
    weights: dict = {}
    improvement: dict = {}
    ml_score_used: Optional[int] = None


class AssessmentRisksResponse(BaseModel):
    risks: list[AssessmentRiskResponse] = []


class RoutineStepResponse(BaseModel):
    id: int
    time_of_day: str
    step_order: int
    category: str
    category_icon: str
    step_title: str
    description: str
    active_ingredients: Optional[str] = ""
    frequency: str
    caution_notes: Optional[str] = ""
    is_active: bool = True
    is_customized: bool = False

    class Config:
        from_attributes = True


class SeasonalRecommendationResponse(BaseModel):
    id: int
    season: str
    title: str
    description: str
    tip: Optional[str] = ""

    class Config:
        from_attributes = True


class SkincareRoutineResponse(BaseModel):
    id: int
    user_id: int
    season: str
    last_adapted_at: Optional[datetime] = None
    adaptation_summary: Optional[str] = ""
    morning_steps: list[RoutineStepResponse] = []
    evening_steps: list[RoutineStepResponse] = []
    weekly_steps: list[RoutineStepResponse] = []
    seasonal_recommendations: list[SeasonalRecommendationResponse] = []

    class Config:
        from_attributes = True


class RoutineStepCreate(BaseModel):
    time_of_day: str  # morning, evening, weekly
    category: str
    step_title: str
    description: Optional[str] = ""
    active_ingredients: Optional[str] = ""
    frequency: Optional[str] = "Daily"
    caution_notes: Optional[str] = ""


class RoutineStepUpdate(BaseModel):
    step_title: Optional[str] = None
    category: Optional[str] = None
    time_of_day: Optional[str] = None
    description: Optional[str] = None
    active_ingredients: Optional[str] = None
    frequency: Optional[str] = None
    caution_notes: Optional[str] = None
    is_active: Optional[bool] = None


class RoutineCheckinRequest(BaseModel):
    time_of_day: str  # morning or evening
    completed: bool = True



class SkinProfileResponse(BaseModel):
    id: int
    user_id: int
    skin_type: Optional[str] = ""
    age_group: Optional[str] = ""
    skin_concerns: Optional[str] = ""
    allergies: Optional[str] = ""
    sensitivities: Optional[str] = ""
    lifestyle_habits: Optional[str] = ""
    sleep_quality: Optional[str] = ""
    water_intake: Optional[str] = ""
    environmental_exposure: Optional[str] = ""
    image_url: Optional[str] = ""
    skin_health_score: Optional[int] = 0
    risks: Optional[list] = []
    priority_concerns: Optional[list] = []
    score_breakdown: Optional[dict] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SkinProfileUpdate(BaseModel):
    skin_type: Optional[str] = ""
    age_group: Optional[str] = ""
    skin_concerns: Optional[str] = ""
    allergies: Optional[str] = ""
    sensitivities: Optional[str] = ""
    lifestyle_habits: Optional[str] = ""
    sleep_quality: Optional[str] = ""
    water_intake: Optional[str] = ""
    environmental_exposure: Optional[str] = ""
    image_url: Optional[str] = ""


class AssignRequest(BaseModel):
    user_id: int
    consultant_id: int


class AssessmentNotesUpdate(BaseModel):
    notes: Optional[str] = ""


class ConsultantRoutineStepCreate(BaseModel):
    time_of_day: str  # morning, evening, weekly
    category: str
    step_title: str
    description: Optional[str] = ""
    active_ingredients: Optional[str] = ""
    frequency: Optional[str] = "Daily"
    caution_notes: Optional[str] = ""


class ConsultantRoutineStepUpdate(BaseModel):
    step_title: Optional[str] = None
    category: Optional[str] = None
    time_of_day: Optional[str] = None
    description: Optional[str] = None
    active_ingredients: Optional[str] = None
    frequency: Optional[str] = None
    caution_notes: Optional[str] = None
    is_active: Optional[bool] = None


class ConsultantRecommendationAssign(BaseModel):
    title: str
    category: Optional[str] = "treatment"
    time_of_day: Optional[str] = "morning"
    description: Optional[str] = ""
    active_ingredients: Optional[str] = ""
    frequency: Optional[str] = "Daily"
    caution_notes: Optional[str] = ""
    tip: Optional[str] = ""


class IngredientAnalysisRequest(BaseModel):
    ingredients_text: str
    skin_type: Optional[str] = None
    concerns: Optional[list[str]] = None
    allergies: Optional[str] = None
    sensitivities: Optional[str] = None
    skin_health_score: Optional[int] = None


class IngredientInteractionCheckRequest(BaseModel):
    ingredients: list[str]


class ProductCompareRequest(BaseModel):
    product_ids: list[str]
    skin_type: Optional[str] = None
    concerns: Optional[list[str]] = None
    allergies: Optional[str] = None
    sensitivities: Optional[str] = None
    skin_health_score: Optional[int] = None
    season: Optional[str] = None


class BudgetRoutineRequest(BaseModel):
    max_budget: float = 5000.0
    routine_scope: str = "essential"  # essential, balanced, complete
    skin_type: Optional[str] = None
    concerns: Optional[list[str]] = None
    allergies: Optional[str] = None
    sensitivities: Optional[str] = None
    skin_health_score: Optional[int] = None
    season: Optional[str] = None


class AddProductToRoutineRequest(BaseModel):
    product_id: str
    time_of_day: Optional[str] = "morning"  # morning, evening, weekly
    custom_notes: Optional[str] = ""





# ---------------------------------------------------------------------------
# ML Model Loading & Prediction Helper
# ---------------------------------------------------------------------------
ML_MODEL = None

def load_ml_model():
    global ML_MODEL
    model_file = BASE_DIR / "ML_models" / "skin_health_score_model.pkl"
    if model_file.exists():
        try:
            import joblib
            ML_MODEL = joblib.load(model_file)
            print(f"ML Model successfully loaded from {model_file}")
        except Exception as e:
            print(f"Warning: Could not load ML model from {model_file}: {e}")
    else:
        print(f"Warning: ML model file not found at {model_file}")

load_ml_model()


def _has_val(val_list: list, target: str) -> int:
    return 1 if any(target.lower() in v.lower() for v in val_list) else 0


def _norm_title(val: Optional[str], default: str = "") -> str:
    if not val or not val.strip():
        return default
    v = val.strip().lower()
    if "dry" in v:
        return "Dry"
    elif "oily" in v:
        return "Oily"
    elif "combination" in v:
        return "Combination"
    elif "sensitive" in v:
        return "Sensitive"
    elif "normal" in v:
        return "Normal"
    elif "poor" in v:
        return "Poor"
    elif "average" in v:
        return "Average"
    elif "good" in v:
        return "Good"
    elif "excellent" in v:
        return "Excellent"
    elif "low" in v:
        return "Low"
    elif "moderate" in v:
        return "Moderate"
    elif "high" in v:
        return "High"
    return val.strip().title()


def _get_ml_prediction(profile: SkinProfile) -> Optional[int]:
    """Try to get ML model prediction. Returns None if model unavailable."""
    global ML_MODEL
    if not ML_MODEL:
        load_ml_model()
    if not ML_MODEL:
        return None

    try:
        import pandas as pd

        concerns = [c.strip() for c in (profile.skin_concerns or "").split(",") if c.strip()]
        habits = [h.strip() for h in (profile.lifestyle_habits or "").split(",") if h.strip()]
        env = [e.strip() for e in (profile.environmental_exposure or "").split(",") if e.strip()]

        input_data = {
            "SkinType": [_norm_title(profile.skin_type, "Normal")],
            "AgeGroup": [profile.age_group.strip() if profile.age_group and profile.age_group.strip() else "25-34"],
            "SleepQuality": [_norm_title(profile.sleep_quality, "Average")],
            "WaterIntake": [_norm_title(profile.water_intake, "Moderate")],
            "HasAllergy": [1 if profile.allergies and profile.allergies.strip().lower() not in ["", "none", "no"] else 0],
            "HasSensitivity": [1 if profile.sensitivities and profile.sensitivities.strip().lower() not in ["", "none", "no"] else 0],
            "Acne": [_has_val(concerns, "Acne")],
            "Aging": [_has_val(concerns, "Aging")],
            "Dryness": [_has_val(concerns, "Dryness")],
            "Hyperpigmentation": [_has_val(concerns, "Hyperpigmentation")],
            "Redness": [_has_val(concerns, "Redness")],
            "DarkSpots": [_has_val(concerns, "Dark Spots")],
            "LargePores": [1 if _has_val(concerns, "Pore") or _has_val(concerns, "Pores") else 0],
            "Dullness": [_has_val(concerns, "Dullness")],
            "Stress": [_has_val(habits, "Stress")],
            "Smoking": [_has_val(habits, "Smoking")],
            "Alcohol": [_has_val(habits, "Alcohol")],
            "HealthyDiet": [_has_val(habits, "Healthy Diet")],
            "RegularExercise": [1 if _has_val(habits, "Exercise") or _has_val(habits, "Active") else 0],
            "HighCaffeine": [_has_val(habits, "Caffeine")],
            "SunExposure": [_has_val(env, "Sun Exposure")],
            "HighPollution": [_has_val(env, "Pollution")],
            "DryClimate": [_has_val(env, "Climate")],
            "IndoorAC": [1 if _has_val(env, "AC") or _has_val(env, "Air Conditioning") else 0],
        }

        df_input = pd.DataFrame(input_data)
        score_pred = ML_MODEL.predict(df_input)[0]
        return int(round(max(0, min(100, float(score_pred)))))
    except Exception as err:
        print(f"Warning: ML model prediction failed: {err}")
        return None


def get_score_breakdown(profile: SkinProfile, db: Session, previous_score: Optional[int] = None) -> dict:
    """Compute the full weighted skin health score breakdown for a profile."""
    concerns = [c.strip() for c in (profile.skin_concerns or "").split(",") if c.strip()]
    habits = [h.strip() for h in (profile.lifestyle_habits or "").split(",") if h.strip()]
    env = [e.strip() for e in (profile.environmental_exposure or "").split(",") if e.strip()]

    # Combine lifestyle habits and environmental exposure factors for lifestyle/environment score
    all_habits = habits + env

    has_allergy = bool(profile.allergies and profile.allergies.strip().lower() not in ["", "none", "no", "n/a"])
    has_sensitivity = bool(profile.sensitivities and profile.sensitivities.strip().lower() not in ["", "none", "no", "n/a"])

    # Get routine adherence from check-in data
    adherence_pct = 0.0
    try:
        stats = get_user_adherence_stats(profile.user_id, db)
        adherence_pct = float(stats.get("adherence_percentage", 0))
    except Exception:
        adherence_pct = 0.0

    # Try ML model prediction
    ml_score = _get_ml_prediction(profile)

    breakdown = calculate_weighted_skin_health_score(
        skin_concerns=concerns,
        skin_type=_norm_title(profile.skin_type, "Normal"),
        has_allergy=has_allergy,
        has_sensitivity=has_sensitivity,
        lifestyle_habits=all_habits,
        sleep_quality=_norm_title(profile.sleep_quality, "Average"),
        water_intake=_norm_title(profile.water_intake, "Moderate"),
        adherence_percentage=adherence_pct,
        previous_score=previous_score,
        ml_score=ml_score,
    )
    return breakdown


def calculate_skin_health_score(profile: SkinProfile, db: Session = None) -> int:
    """Calculate skin health score (0-100) using the weighted scoring model."""
    if db is None:
        # Fallback: try ML model only
        ml = _get_ml_prediction(profile)
        return ml if ml is not None else 65

    try:
        breakdown = get_score_breakdown(profile, db)
        return breakdown["final_score"]
    except Exception as err:
        print(f"Error calculating weighted skin health score: {err}")
        ml = _get_ml_prediction(profile)
        return ml if ml is not None else 65


def get_skin_risks(profile: Optional[SkinProfile]) -> list:
    """Analyze risk factors from user profile using the risk engine."""
    if not profile:
        return []
    try:
        concerns = [c.strip() for c in (profile.skin_concerns or "").split(",") if c.strip()]
        habits = [h.strip() for h in (profile.lifestyle_habits or "").split(",") if h.strip()]
        env = [e.strip() for e in (profile.environmental_exposure or "").split(",") if e.strip()]

        skin_type = (profile.skin_type or "").strip().lower()

        risk_input = {
            "SleepQuality": profile.sleep_quality or "",
            "WaterIntake": profile.water_intake or "",
            "DrySkin": 1 if "dry" in skin_type else 0,
            "OilySkin": 1 if "oily" in skin_type else 0,
            "SensitiveSkin": 1 if "sensitive" in skin_type else 0,
            "HasAllergy": 1 if profile.allergies and profile.allergies.strip().lower() not in ["", "none", "no"] else 0,
            "HasSensitivity": 1 if profile.sensitivities and profile.sensitivities.strip().lower() not in ["", "none", "no"] else 0,
            "Stress": _has_val(habits, "Stress"),
            "Smoking": _has_val(habits, "Smoking"),
            "Alcohol": _has_val(habits, "Alcohol"),
            "HighCaffeine": _has_val(habits, "Caffeine"),
            "SunExposure": _has_val(env, "Sun Exposure"),
            "HighPollution": _has_val(env, "Pollution"),
            "DryClimate": _has_val(env, "Climate"),
            "IndoorAC": 1 if _has_val(env, "AC") or _has_val(env, "Air Conditioning") else 0,
            "Acne": _has_val(concerns, "Acne"),
            "Hyperpigmentation": _has_val(concerns, "Hyperpigmentation"),
            "DarkSpots": 1 if _has_val(concerns, "Dark Spots") or _has_val(concerns, "Dark") else 0,
            "Dryness": _has_val(concerns, "Dryness"),
            "LargePores": 1 if _has_val(concerns, "Pore") or _has_val(concerns, "Pores") else 0,
            "Aging": _has_val(concerns, "Aging"),
            "Redness": _has_val(concerns, "Redness"),
            "Dullness": _has_val(concerns, "Dullness"),
        }
        return analyze_risks(risk_input)
    except Exception as err:
        print(f"Error evaluating skin risks: {err}")
        return []


def get_priority_concerns(profile: Optional[SkinProfile]) -> list:
    """Calculate prioritized skin concerns for a user profile using ML scoring rules."""
    if not profile:
        return []
    try:
        concerns = [c.strip() for c in (profile.skin_concerns or "").split(",") if c.strip()]
        habits = [h.strip() for h in (profile.lifestyle_habits or "").split(",") if h.strip()]
        env = [e.strip() for e in (profile.environmental_exposure or "").split(",") if e.strip()]

        data = {
            "Acne": _has_val(concerns, "Acne"),
            "SkinType": _norm_title(profile.skin_type, "Normal"),
            "Stress": _has_val(habits, "Stress"),
            "SleepQuality": _norm_title(profile.sleep_quality, "Average"),
            "HighPollution": _has_val(env, "Pollution"),
            "Dryness": _has_val(concerns, "Dryness"),
            "WaterIntake": _norm_title(profile.water_intake, "Moderate"),
            "DryClimate": _has_val(env, "Climate"),
            "IndoorAC": 1 if _has_val(env, "AC") or _has_val(env, "Air Conditioning") else 0,
            "Hyperpigmentation": _has_val(concerns, "Hyperpigmentation"),
            "SunExposure": _has_val(env, "Sun Exposure"),
            "DarkSpots": 1 if _has_val(concerns, "Dark Spots") or _has_val(concerns, "Dark") else 0,
            "Aging": _has_val(concerns, "Aging"),
            "AgeGroup": (profile.age_group or "25-34").strip(),
            "Smoking": _has_val(habits, "Smoking"),
            "Redness": _has_val(concerns, "Redness"),
            "HasAllergy": 1 if profile.allergies and profile.allergies.strip().lower() not in ["", "none", "no"] else 0,
            "HasSensitivity": 1 if profile.sensitivities and profile.sensitivities.strip().lower() not in ["", "none", "no"] else 0,
            "LargePores": 1 if _has_val(concerns, "Pore") or _has_val(concerns, "Pores") else 0,
            "Dullness": _has_val(concerns, "Dullness"),
        }
        return prioritize_concerns(data)
    except Exception as err:
        print(f"Error calculating priority concerns: {err}")
        return []


def calculate_health_category(score: int) -> str:
    if score >= 80:
        return "Excellent"
    elif score >= 65:
        return "Good"
    elif score >= 50:
        return "Fair"
    else:
        return "Poor"


def calculate_overall_risk_level(risks: list) -> str:
    if not risks:
        return "Low"
    levels = [r.get("level", "").capitalize() for r in risks if isinstance(r, dict)]
    if "Critical" in levels:
        return "Critical"
    elif "High" in levels:
        return "High"
    elif "Medium" in levels:
        return "Medium"
    return "Low"


def record_assessment_history(
    db: Session, user_id: int, profile: SkinProfile, trigger_source: str = "survey_update"
) -> Optional[AssessmentHistory]:
    """Record a complete skin assessment session to assessment_history, risks, and priorities tables."""
    if not profile:
        return None
    try:
        score = profile.skin_health_score or 0
        category = calculate_health_category(score)
        risks_data = get_skin_risks(profile)
        priorities_data = get_priority_concerns(profile)
        overall_risk = calculate_overall_risk_level(risks_data)

        history_entry = AssessmentHistory(
            user_id=user_id,
            skin_profile_id=profile.id,
            skin_health_score=score,
            skin_health_category=category,
            overall_risk_level=overall_risk,
            model_version="v1.0.0",
            image_url=profile.image_url or "",
            trigger_source=trigger_source,
            notes=f"Assessment session recorded via {trigger_source.replace('_', ' ')}",
        )
        db.add(history_entry)
        db.flush()

        for r in risks_data:
            risk_rec = AssessmentRisk(
                assessment_id=history_entry.assessment_id,
                risk_title=r.get("title", "Risk Factor"),
                risk_level=r.get("level", "Low"),
                description=r.get("description", ""),
                recommendation=r.get("recommendation", ""),
            )
            db.add(risk_rec)

        for p in priorities_data:
            prio_rec = AssessmentPriority(
                assessment_id=history_entry.assessment_id,
                concern_name=p.get("concern", "Concern"),
                priority_rank=p.get("priority", 1),
                severity=p.get("severity", "Low"),
                priority_score=p.get("score", 0),
            )
            db.add(prio_rec)

        db.commit()
        db.refresh(history_entry)

        # Trigger adaptive routine update based on new assessment
        try:
            ensure_user_routine(db, user_id, force_regenerate=True)
        except Exception as r_err:
            print(f"Note: Adaptive routine update skipped: {r_err}")

        return history_entry
    except Exception as err:
        print(f"Error recording assessment history: {err}")
        db.rollback()
        return None


def assessment_history_to_dict(h: AssessmentHistory) -> dict:
    return {
        "assessment_id": h.assessment_id,
        "user_id": h.user_id,
        "skin_profile_id": h.skin_profile_id,
        "skin_health_score": h.skin_health_score,
        "skin_health_category": h.skin_health_category,
        "overall_risk_level": h.overall_risk_level,
        "assessment_date": h.assessment_date.isoformat() if h.assessment_date else None,
        "model_version": h.model_version,
        "image_url": h.image_url or "",
        "trigger_source": h.trigger_source or "survey_update",
        "notes": h.notes or "",
        "created_at": h.created_at.isoformat() if h.created_at else None,
        "risks": [
            {
                "id": r.id,
                "risk_title": r.risk_title,
                "risk_level": r.risk_level,
                "description": r.description,
                "recommendation": r.recommendation,
            }
            for r in h.risks
        ],
        "priorities": [
            {
                "id": p.id,
                "concern_name": p.concern_name,
                "priority_rank": p.priority_rank,
                "severity": p.severity,
                "priority_score": p.priority_score,
            }
            for p in h.priorities
        ],
    }


def ensure_user_routine(db: Session, user_id: int, force_regenerate: bool = False) -> SkincareRoutine:
    """Get or generate user skincare routine, adapting dynamically when skin assessment updates."""
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user_id).first()
    if not profile:
        profile = SkinProfile(user_id=user_id, skin_health_score=70)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # Fetch assessment history ordered by date descending
    history = (
        db.query(AssessmentHistory)
        .filter(AssessmentHistory.user_id == user_id)
        .order_by(AssessmentHistory.assessment_date.desc())
        .all()
    )
    latest_assessment = history[0] if history else None
    previous_assessment = history[1] if len(history) > 1 else None

    routine = db.query(SkincareRoutine).filter(SkincareRoutine.user_id == user_id).first()

    current_season = get_current_season()

    if routine and not force_regenerate:
        if routine.season != current_season:
            routine.season = current_season
            db.commit()
        return routine

    data = generate_personalized_routine_data(
        profile=profile,
        latest_assessment=latest_assessment,
        previous_assessment=previous_assessment,
        override_season=current_season
    )

    if not routine:
        routine = SkincareRoutine(
            user_id=user_id,
            season=data["season"],
            adaptation_summary=data["adaptation_summary"],
        )
        db.add(routine)
        db.flush()
    else:
        routine.season = data["season"]
        routine.adaptation_summary = data["adaptation_summary"]
        routine.last_adapted_at = datetime.now(timezone.utc)
        db.query(RoutineStep).filter(RoutineStep.routine_id == routine.id, RoutineStep.is_customized == False).delete()
        db.query(SeasonalRecommendation).filter(SeasonalRecommendation.routine_id == routine.id).delete()
        db.flush()

    # Insert Morning Steps
    for s in data["morning_steps"]:
        step = RoutineStep(
            routine_id=routine.id,
            time_of_day=s["time_of_day"],
            step_order=s["step_order"],
            category=s["category"],
            category_icon=s["category_icon"],
            step_title=s["step_title"],
            description=s["description"],
            active_ingredients=s.get("active_ingredients", ""),
            frequency=s.get("frequency", "Daily"),
            caution_notes=s.get("caution_notes", ""),
            is_active=True,
            is_customized=False
        )
        db.add(step)

    # Insert Evening Steps
    for s in data["evening_steps"]:
        step = RoutineStep(
            routine_id=routine.id,
            time_of_day=s["time_of_day"],
            step_order=s["step_order"],
            category=s["category"],
            category_icon=s["category_icon"],
            step_title=s["step_title"],
            description=s["description"],
            active_ingredients=s.get("active_ingredients", ""),
            frequency=s.get("frequency", "Nightly"),
            caution_notes=s.get("caution_notes", ""),
            is_active=True,
            is_customized=False
        )
        db.add(step)

    # Insert Weekly Steps
    for s in data["weekly_steps"]:
        step = RoutineStep(
            routine_id=routine.id,
            time_of_day=s["time_of_day"],
            step_order=s["step_order"],
            category=s["category"],
            category_icon=s["category_icon"],
            step_title=s["step_title"],
            description=s["description"],
            active_ingredients=s.get("active_ingredients", ""),
            frequency=s.get("frequency", "1x/week"),
            caution_notes=s.get("caution_notes", ""),
            is_active=True,
            is_customized=False
        )
        db.add(step)

    # Insert Seasonal Recommendations
    for r in data["seasonal_recommendations"]:
        rec = SeasonalRecommendation(
            routine_id=routine.id,
            season=r["season"],
            title=r["title"],
            description=r["description"],
            tip=r.get("tip", "")
        )
        db.add(rec)

    db.commit()
    db.refresh(routine)
    return routine


def get_model_for_role(role: str):
    """Return the SQLAlchemy model class for a given role string."""
    mapping = {"user": User, "consultant": Consultant, "admin": Admin}
    return mapping.get(role.lower())


def create_access_token(subject: str, role: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta is None:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.now(timezone.utc) + expires_delta
    payload = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)





def seed_admin() -> None:
    """Create the seed admin from .env if they don't already exist."""
    admin_email = os.getenv("ADMIN_EMAIL", "").strip().lower()
    admin_password = os.getenv("ADMIN_PASSWORD", "").strip()
    if not admin_email or not admin_password:
        print("Warning: ADMIN_EMAIL or ADMIN_PASSWORD not set in .env — skipping admin seed.")
        return
    db = SessionLocal()
    try:
        existing = db.query(Admin).filter(Admin.email == admin_email).first()
        if not existing:
            hashed = pwd_context.hash(admin_password)
            admin = Admin(email=admin_email, password_hash=hashed)
            db.add(admin)
            db.commit()
            print(f"Seed admin created: {admin_email}")
        else:
            print(f"Seed admin already exists: {admin_email}")
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------

@app.on_event("startup")
async def on_startup() -> None:
    seed_admin()


# ---------------------------------------------------------------------------
# Auth dependencies
# ---------------------------------------------------------------------------

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> UserPayload:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        role = payload.get("role")
        if not email or not role:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return UserPayload(email=email, role=role)
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc


async def require_admin(current_user: UserPayload = Depends(get_current_user)) -> UserPayload:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


# ---------------------------------------------------------------------------
# Static root
# ---------------------------------------------------------------------------

@app.get("/", include_in_schema=False)
async def root() -> FileResponse:
    return FileResponse(INDEX_FILE)


# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------

@app.post("/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    clean_email = request.email.strip().lower()
    clean_role = request.role.strip().lower()

    model = get_model_for_role(clean_role)
    if not model:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    try:
        db_user = db.query(model).filter(model.email == clean_email).first()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection error: {str(exc)}",
        ) from exc

    if not db_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    # Google OAuth users cannot log in with a password
    if db_user.password_hash == "google-oauth":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="This account uses Google Sign-In. Please use Google to log in.")

    try:
        password_valid = pwd_context.verify(request.password, db_user.password_hash)
    except Exception:
        password_valid = False

    if not password_valid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(db_user.email, clean_role)
    return TokenResponse(access_token=token)


@app.post("/auth/register", response_model=TokenResponse)
async def register(request: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    clean_email = request.email.strip().lower()
    clean_role = request.role.strip().lower()

    if clean_role == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin self-registration is not allowed",
        )

    if not clean_email or not request.password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email and password required")

    if len(request.password) < 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 6 characters long")

    model = get_model_for_role(clean_role)
    if not model:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    try:
        existing = db.query(model).filter(model.email == clean_email).first()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection error: {str(exc)}",
        ) from exc

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists",
        )

    hashed_password = pwd_context.hash(request.password)
    clean_name = request.name.strip() if request.name else ""
    new_record = model(name=clean_name, email=clean_email, password_hash=hashed_password, status="pending")
    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    token = create_access_token(new_record.email, clean_role)
    return TokenResponse(access_token=token)


@app.post("/auth/google", response_model=TokenResponse)
async def google_login(request: GoogleOAuthRequest, db: Session = Depends(get_db)) -> TokenResponse:
    clean_role = request.role.strip().lower()
    if not request.credential:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google credential token is required")

    google_client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    try:
        id_info = id_token.verify_oauth2_token(
            request.credential,
            google_requests.Request(),
            google_client_id if google_client_id else None
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid Google token: {str(exc)}") from exc

    email = (id_info.get("email") or "").strip().lower()
    google_name = (id_info.get("name") or "").strip()
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google account email not available")

    model = get_model_for_role(clean_role)
    if not model:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    try:
        existing = db.query(model).filter(model.email == email).first()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection error: {str(exc)}",
        ) from exc

    if not existing:
        if clean_role == "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin accounts cannot be created via Google Sign-In",
            )
        new_record = model(name=google_name, email=email, password_hash="google-oauth", status="pending")
        db.add(new_record)
        db.commit()
        db.refresh(new_record)

    token = create_access_token(email, clean_role)
    return TokenResponse(access_token=token)





@app.get("/auth/me", response_model=UserPayload)
async def get_me(current_user: UserPayload = Depends(get_current_user)) -> UserPayload:
    return current_user


@app.get("/auth/status", response_model=StatusResponse)
async def get_status(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StatusResponse:
    if current_user.role == "admin":
        return StatusResponse(status="approved")

    model = get_model_for_role(current_user.role)
    if not model:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    record = db.query(model).filter(model.email == current_user.email).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    return StatusResponse(status=record.status)


@app.get("/auth/profile", response_model=UserProfileResponse)
async def get_profile(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    model = get_model_for_role(current_user.role)
    if not model:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    record = db.query(model).filter(model.email == current_user.email).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User record not found in database")

    return UserProfileResponse(
        id=record.id,
        name=getattr(record, "name", "") or "",
        email=record.email,
        role=current_user.role,
        created_at=record.created_at,
    )


@app.get("/user/profile", response_model=SkinProfileResponse)
async def get_user_skin_profile(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SkinProfileResponse:
    if current_user.role != "user":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users can access skin profiles",
        )
    
    user_record = db.query(User).filter(User.email == current_user.email).first()
    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user_record.id).first()
    if not profile:
        profile = SkinProfile(user_id=user_record.id, skin_health_score=0)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    # If survey is submitted but score in DB is 0, update score in DB
    has_survey = bool(profile.skin_type or profile.age_group or profile.skin_concerns or profile.sleep_quality)
    if has_survey and (profile.skin_health_score is None or profile.skin_health_score == 0):
        profile.skin_health_score = calculate_skin_health_score(profile, db)
        db.commit()
        db.refresh(profile)
    
    profile.risks = get_skin_risks(profile)
    profile.priority_concerns = get_priority_concerns(profile)

    # Compute score breakdown
    breakdown = None
    if has_survey:
        try:
            prev_score = None
            prev_assessment = (
                db.query(AssessmentHistory)
                .filter(AssessmentHistory.user_id == user_record.id)
                .order_by(AssessmentHistory.assessment_date.desc())
                .offset(1).limit(1).first()
            )
            if prev_assessment:
                prev_score = prev_assessment.skin_health_score
            breakdown = get_score_breakdown(profile, db, previous_score=prev_score)
        except Exception as e:
            print(f"Warning: Could not compute score breakdown: {e}")

    resp = SkinProfileResponse.model_validate(profile)
    resp.score_breakdown = breakdown
    return resp


@app.post("/user/profile", response_model=SkinProfileResponse)
async def update_user_skin_profile(
    profile_update: SkinProfileUpdate,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SkinProfileResponse:
    if current_user.role != "user":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users can update skin profiles",
        )
    
    user_record = db.query(User).filter(User.email == current_user.email).first()
    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user_record.id).first()
    if not profile:
        profile = SkinProfile(user_id=user_record.id)
        db.add(profile)
    
    # Update fields
    profile.skin_type = profile_update.skin_type
    profile.age_group = profile_update.age_group
    profile.skin_concerns = profile_update.skin_concerns
    profile.allergies = profile_update.allergies
    profile.sensitivities = profile_update.sensitivities
    profile.lifestyle_habits = profile_update.lifestyle_habits
    profile.sleep_quality = profile_update.sleep_quality
    profile.water_intake = profile_update.water_intake
    profile.environmental_exposure = profile_update.environmental_exposure
    if profile_update.image_url is not None:
        profile.image_url = profile_update.image_url
    
    # Predict score via weighted scoring model when survey is submitted and save to database
    has_survey = bool(profile.skin_type or profile.age_group or profile.skin_concerns or profile.sleep_quality or profile.water_intake)
    if has_survey:
        profile.skin_health_score = calculate_skin_health_score(profile, db)
    else:
        profile.skin_health_score = 0

    db.commit()
    db.refresh(profile)
    profile.risks = get_skin_risks(profile)
    profile.priority_concerns = get_priority_concerns(profile)

    # Log assessment history session
    record_assessment_history(db, user_record.id, profile, trigger_source="survey_update")

    # Compute score breakdown
    breakdown = None
    if has_survey:
        try:
            prev_score = None
            prev_assessment = (
                db.query(AssessmentHistory)
                .filter(AssessmentHistory.user_id == user_record.id)
                .order_by(AssessmentHistory.assessment_date.desc())
                .offset(1).limit(1).first()
            )
            if prev_assessment:
                prev_score = prev_assessment.skin_health_score
            breakdown = get_score_breakdown(profile, db, previous_score=prev_score)
        except Exception as e:
            print(f"Warning: Could not compute score breakdown: {e}")

    resp = SkinProfileResponse.model_validate(profile)
    resp.score_breakdown = breakdown
    return resp


@app.get("/user/risks")
async def get_user_skin_risks(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "user":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users can access skin risks",
        )
    user_record = db.query(User).filter(User.email == current_user.email).first()
    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user_record.id).first()
    return {"risks": get_skin_risks(profile)}


@app.get("/user/priority-concerns")
async def get_user_priority_concerns(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "user":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users can access priority concerns",
        )
    user_record = db.query(User).filter(User.email == current_user.email).first()
    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user_record.id).first()
    return {"priority_concerns": get_priority_concerns(profile)}


@app.get("/user/assessment-history")
async def get_user_assessment_history(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "user":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users can access assessment history",
        )
    user_record = db.query(User).filter(User.email == current_user.email).first()
    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    history_records = (
        db.query(AssessmentHistory)
        .filter(AssessmentHistory.user_id == user_record.id)
        .order_by(AssessmentHistory.assessment_date.desc())
        .all()
    )

    return {"history": [assessment_history_to_dict(h) for h in history_records]}


@app.get("/user/routine", response_model=SkincareRoutineResponse)
async def get_user_routine_endpoint(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SkincareRoutineResponse:
    if current_user.role != "user":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users can access skincare routines",
        )
    user_record = db.query(User).filter(User.email == current_user.email).first()
    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    routine = ensure_user_routine(db, user_record.id, force_regenerate=False)

    morning_steps = [s for s in routine.steps if s.time_of_day == "morning" and s.is_active]
    evening_steps = [s for s in routine.steps if s.time_of_day == "evening" and s.is_active]
    weekly_steps = [s for s in routine.steps if s.time_of_day == "weekly" and s.is_active]

    resp_data = {
        "id": routine.id,
        "user_id": routine.user_id,
        "season": routine.season,
        "last_adapted_at": routine.last_adapted_at,
        "adaptation_summary": routine.adaptation_summary,
        "morning_steps": morning_steps,
        "evening_steps": evening_steps,
        "weekly_steps": weekly_steps,
        "seasonal_recommendations": routine.seasonal_recommendations,
    }
    return SkincareRoutineResponse.model_validate(resp_data)


@app.post("/user/routine/regenerate", response_model=SkincareRoutineResponse)
async def regenerate_user_routine_endpoint(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SkincareRoutineResponse:
    if current_user.role != "user":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users can regenerate skincare routines",
        )
    user_record = db.query(User).filter(User.email == current_user.email).first()
    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    routine = ensure_user_routine(db, user_record.id, force_regenerate=True)
    return await get_user_routine_endpoint(current_user, db)


@app.post("/user/routine/step", response_model=RoutineStepResponse)
async def add_routine_step_endpoint(
    step_data: RoutineStepCreate,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RoutineStepResponse:
    if current_user.role != "user":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    user_record = db.query(User).filter(User.email == current_user.email).first()
    if not user_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    routine = ensure_user_routine(db, user_record.id, force_regenerate=False)
    
    existing_steps = [s for s in routine.steps if s.time_of_day == step_data.time_of_day.lower()]
    next_order = len(existing_steps) + 1

    icon_map = {
        "cleansing": "🧼",
        "exfoliation": "✨",
        "treatment": "💧",
        "moisturizing": "🧴",
        "sun_protection": "☀️",
        "night_care": "🌙",
    }
    cat_lower = step_data.category.lower()
    icon = icon_map.get(cat_lower, "🧴")

    new_step = RoutineStep(
        routine_id=routine.id,
        time_of_day=step_data.time_of_day.lower(),
        step_order=next_order,
        category=cat_lower,
        category_icon=icon,
        step_title=step_data.step_title,
        description=step_data.description or "",
        active_ingredients=step_data.active_ingredients or "",
        frequency=step_data.frequency or "Daily",
        caution_notes=step_data.caution_notes or "",
        is_active=True,
        is_customized=True
    )
    db.add(new_step)
    db.commit()
    db.refresh(new_step)
    return RoutineStepResponse.model_validate(new_step)


@app.put("/user/routine/step/{step_id}", response_model=RoutineStepResponse)
async def update_routine_step_endpoint(
    step_id: int,
    step_update: RoutineStepUpdate,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RoutineStepResponse:
    if current_user.role != "user":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    user_record = db.query(User).filter(User.email == current_user.email).first()
    if not user_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    routine = ensure_user_routine(db, user_record.id, force_regenerate=False)
    step = db.query(RoutineStep).filter(RoutineStep.id == step_id, RoutineStep.routine_id == routine.id).first()
    if not step:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Step not found")

    try:
        if step_update.step_title is not None:
            step.step_title = step_update.step_title
        if step_update.category is not None:
            step.category = step_update.category.lower()
            icon_map = {
                "cleansing": "🧼", "exfoliation": "✨", "treatment": "💧",
                "moisturizing": "🧴", "sun_protection": "☀️", "night_care": "🌙"
            }
            step.category_icon = icon_map.get(step.category, "🧴")
        if step_update.time_of_day is not None:
            step.time_of_day = step_update.time_of_day.lower()
        if step_update.description is not None:
            step.description = step_update.description
        if step_update.active_ingredients is not None:
            step.active_ingredients = step_update.active_ingredients
        if step_update.frequency is not None:
            step.frequency = step_update.frequency
        if step_update.caution_notes is not None:
            step.caution_notes = step_update.caution_notes
        if step_update.is_active is not None:
            step.is_active = step_update.is_active

        step.is_customized = True
        db.commit()
        db.refresh(step)
        return RoutineStepResponse.model_validate(step)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to update step: {str(exc)}") from exc


@app.delete("/user/routine/step/{step_id}")
async def delete_routine_step_endpoint(
    step_id: int,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "user":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    user_record = db.query(User).filter(User.email == current_user.email).first()
    if not user_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    routine = ensure_user_routine(db, user_record.id, force_regenerate=False)
    step = db.query(RoutineStep).filter(RoutineStep.id == step_id, RoutineStep.routine_id == routine.id).first()
    if not step:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Step not found")

    try:
        db.delete(step)
        db.commit()
        return {"message": f"Step {step_id} deleted successfully"}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to delete step: {str(exc)}") from exc


@app.post("/user/routine/checkin")
async def routine_checkin_endpoint(
    checkin_data: RoutineCheckinRequest,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "user":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    user_record = db.query(User).filter(User.email == current_user.email).first()
    if not user_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    today_str = datetime.now().strftime("%Y-%m-%d")
    checkin = (
        db.query(RoutineCheckin)
        .filter(RoutineCheckin.user_id == user_record.id, RoutineCheckin.checkin_date == today_str)
        .first()
    )
    if not checkin:
        checkin = RoutineCheckin(user_id=user_record.id, checkin_date=today_str)
        db.add(checkin)

    if checkin_data.time_of_day.lower() == "morning":
        checkin.morning_completed = checkin_data.completed
    elif checkin_data.time_of_day.lower() == "evening":
        checkin.evening_completed = checkin_data.completed

    db.commit()
    db.refresh(checkin)
    return {
        "checkin_date": checkin.checkin_date,
        "morning_completed": checkin.morning_completed,
        "evening_completed": checkin.evening_completed,
    }


@app.get("/user/routine/checkin")
async def get_routine_checkin_endpoint(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "user":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    user_record = db.query(User).filter(User.email == current_user.email).first()
    if not user_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    today_str = datetime.now().strftime("%Y-%m-%d")
    checkin = (
        db.query(RoutineCheckin)
        .filter(RoutineCheckin.user_id == user_record.id, RoutineCheckin.checkin_date == today_str)
        .first()
    )
    return {
        "checkin_date": today_str,
        "morning_completed": checkin.morning_completed if checkin else False,
        "evening_completed": checkin.evening_completed if checkin else False,
    }


# ---------------------------------------------------------------------------
# Standard /assessment REST API Endpoints
# ---------------------------------------------------------------------------

@app.post("/assessment", response_model=SkinProfileResponse)
async def create_assessment(
    profile_update: SkinProfileUpdate,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """POST /assessment - Create/submit a new skin assessment session."""
    return await update_user_skin_profile(profile_update, current_user, db)


@app.get("/assessment", response_model=SkinProfileResponse)
async def get_latest_assessment(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """GET /assessment - Get the user's current assessment profile."""
    return await get_user_skin_profile(current_user, db)


@app.get("/assessment/history", response_model=AssessmentHistoryListResponse)
async def get_assessment_history_endpoint(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """GET /assessment/history - Retrieve all historical assessment sessions."""
    return await get_user_assessment_history(current_user, db)


@app.get("/assessment/score", response_model=AssessmentScoreResponse)
async def get_assessment_score(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """GET /assessment/score - Get user's current AI skin health score & category."""
    profile_resp = await get_user_skin_profile(current_user, db)
    return AssessmentScoreResponse(
        skin_health_score=profile_resp.skin_health_score,
        skin_health_category=calculate_health_category(profile_resp.skin_health_score or 0),
    )


@app.get("/user/score-breakdown", response_model=ScoreBreakdownResponse)
async def get_user_score_breakdown(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """GET /user/score-breakdown - Get detailed weighted score breakdown."""
    if current_user.role != "user":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users can access score breakdown",
        )
    user_record = db.query(User).filter(User.email == current_user.email).first()
    if not user_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user_record.id).first()
    if not profile:
        return ScoreBreakdownResponse(
            final_score=0,
            category="Not Assessed",
            sub_scores={},
            weighted_contributions={},
            weights={},
            improvement={"trend": "baseline", "change": 0, "label": "No assessment yet", "icon": "📊"},
        )

    # Get previous assessment score for improvement tracking
    prev_score = None
    prev_assessment = (
        db.query(AssessmentHistory)
        .filter(AssessmentHistory.user_id == user_record.id)
        .order_by(AssessmentHistory.assessment_date.desc())
        .offset(1).limit(1).first()
    )
    if prev_assessment:
        prev_score = prev_assessment.skin_health_score

    breakdown = get_score_breakdown(profile, db, previous_score=prev_score)
    return ScoreBreakdownResponse(**breakdown)


@app.get("/assessment/risks", response_model=AssessmentRisksResponse)
async def get_assessment_risks(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """GET /assessment/risks - Get identified health and environmental risk factors."""
    risks_response = await get_user_skin_risks(current_user, db)
    return AssessmentRisksResponse(risks=risks_response.get("risks", []))


@app.get("/assessment/{assessment_id}", response_model=AssessmentHistoryResponse)
async def get_assessment_by_id(
    assessment_id: int,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """GET /assessment/{id} - Get specific assessment session record by ID."""
    user_record = db.query(User).filter(User.email == current_user.email).first()
    if not user_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    h = (
        db.query(AssessmentHistory)
        .filter(AssessmentHistory.assessment_id == assessment_id, AssessmentHistory.user_id == user_record.id)
        .first()
    )
    if not h:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment record not found")

    return assessment_history_to_dict(h)


@app.put("/assessment/{assessment_id}")
async def update_assessment_notes(
    assessment_id: int,
    req: AssessmentNotesUpdate,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """PUT /assessment/{id} - Update notes on a specific assessment session."""
    user_record = db.query(User).filter(User.email == current_user.email).first()
    if not user_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    h = (
        db.query(AssessmentHistory)
        .filter(AssessmentHistory.assessment_id == assessment_id, AssessmentHistory.user_id == user_record.id)
        .first()
    )
    if not h:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment record not found")

    h.notes = req.notes or ""
    db.commit()
    db.refresh(h)
    return {"message": "Assessment record updated successfully", "assessment_id": h.assessment_id, "notes": h.notes}


@app.delete("/assessment/{assessment_id}")
async def delete_assessment_by_id(
    assessment_id: int,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """DELETE /assessment/{id} - Delete a specific assessment session record."""
    user_record = db.query(User).filter(User.email == current_user.email).first()
    if not user_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    h = (
        db.query(AssessmentHistory)
        .filter(AssessmentHistory.assessment_id == assessment_id, AssessmentHistory.user_id == user_record.id)
        .first()
    )
    if not h:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment record not found")

    db.delete(h)
    db.commit()
    return {"message": f"Assessment session #{assessment_id} deleted successfully"}



@app.post("/user/upload-image")
async def upload_skin_image(
    file: UploadFile = File(...),
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "user":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users can upload skin images",
        )

    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type and file.content_type.lower() not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Allowed formats: JPG, PNG, WEBP.",
        )

    user_record = db.query(User).filter(User.email == current_user.email).first()
    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    import uuid
    ext = Path(file.filename).suffix.lower() if file.filename else ".jpg"
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        ext = ".jpg"

    filename = f"user_{user_record.id}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = UPLOADS_DIR / filename

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    image_url = f"/uploads/{filename}"

    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user_record.id).first()
    if not profile:
        profile = SkinProfile(user_id=user_record.id)
        db.add(profile)

    profile.image_url = image_url
    if profile.skin_health_score is None or profile.skin_health_score == 0:
        has_survey = bool(profile.skin_type or profile.age_group or profile.skin_concerns or profile.sleep_quality)
        if has_survey:
            profile.skin_health_score = calculate_skin_health_score(profile, db)

    db.commit()
    db.refresh(profile)

    # Log assessment history session for photo upload scan
    record_assessment_history(db, user_record.id, profile, trigger_source="photo_scan")

    return {"image_url": image_url, "message": "Skin image uploaded successfully"}



# ---------------------------------------------------------------------------
# Admin approval endpoints
# ---------------------------------------------------------------------------

@app.get("/admin/pending")
async def get_pending(
    _: UserPayload = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    pending_users = db.query(User).filter(User.status == "pending").all()
    pending_consultants = db.query(Consultant).filter(Consultant.status == "pending").all()
    return {
        "users": [
            {
                "id": u.id,
                "name": u.name or "",
                "email": u.email,
                "role": "user",
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in pending_users
        ],
        "consultants": [
            {
                "id": c.id,
                "name": c.name or "",
                "email": c.email,
                "role": "consultant",
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in pending_consultants
        ],
    }


@app.get("/admin/all")
async def get_all_accounts(
    _: UserPayload = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    all_users = db.query(User).all()
    all_consultants = db.query(Consultant).all()
    return {
        "users": [
            {
                "id": u.id,
                "name": u.name or "",
                "email": u.email,
                "status": u.status,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in all_users
        ],
        "consultants": [
            {
                "id": c.id,
                "name": c.name or "",
                "email": c.email,
                "status": c.status,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in all_consultants
        ],
    }


@app.post("/admin/approve/{role}/{account_id}")
async def approve_account(
    role: str,
    account_id: int,
    _: UserPayload = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    model = get_model_for_role(role)
    if not model or role == "admin":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    record = db.query(model).filter(model.id == account_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    try:
        record.status = "approved"
        db.commit()
        return {"message": f"{role.capitalize()} approved successfully"}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Approval failed: {str(exc)}") from exc


@app.post("/admin/reject/{role}/{account_id}")
async def reject_account(
    role: str,
    account_id: int,
    _: UserPayload = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    model = get_model_for_role(role)
    if not model or role == "admin":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    record = db.query(model).filter(model.id == account_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    try:
        db.delete(record)
        db.commit()
        return {"message": f"{role.capitalize()} account rejected and deleted successfully"}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Rejection failed: {str(exc)}") from exc


# ---------------------------------------------------------------------------
# Admin allocation endpoints
# ---------------------------------------------------------------------------

@app.post("/admin/assign")
async def assign_user_to_consultant(
    req: AssignRequest,
    _: UserPayload = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.status != "approved":
        user.status = "approved"

    consultant = db.query(Consultant).filter(Consultant.id == req.consultant_id).first()
    if not consultant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultant not found")
    if consultant.status != "approved":
        consultant.status = "approved"

    existing = (
        db.query(Assignment)
        .filter(Assignment.user_id == req.user_id, Assignment.consultant_id == req.consultant_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This user is already assigned to this consultant")

    try:
        assignment = Assignment(user_id=req.user_id, consultant_id=req.consultant_id)
        db.add(assignment)
        db.commit()
        return {"message": "User assigned to consultant successfully"}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Assignment failed: {str(exc)}") from exc


@app.delete("/admin/unassign/{user_id}/{consultant_id}")
async def unassign_user_from_consultant(
    user_id: int,
    consultant_id: int,
    _: UserPayload = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    assignment = (
        db.query(Assignment)
        .filter(Assignment.user_id == user_id, Assignment.consultant_id == consultant_id)
        .first()
    )
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")

    try:
        db.delete(assignment)
        db.commit()
        return {"message": "Assignment removed successfully"}
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Unassignment failed: {str(exc)}") from exc


@app.get("/admin/assignments")
async def get_all_assignments(
    _: UserPayload = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    assignments = db.query(Assignment).all()
    result = []
    for a in assignments:
        user = a.user
        consultant = a.consultant
        result.append({
            "id": a.id,
            "user_id": a.user_id,
            "user_name": (user.name or user.email) if user else "—",
            "user_email": user.email if user else "—",
            "consultant_id": a.consultant_id,
            "consultant_name": (consultant.name or consultant.email) if consultant else "—",
            "consultant_email": consultant.email if consultant else "—",
            "assigned_at": a.assigned_at.isoformat() if a.assigned_at else None,
        })
    return {"assignments": result}


# ---------------------------------------------------------------------------
# Consultant — Comprehensive Client Synchronization & Management Endpoints
# ---------------------------------------------------------------------------

def get_user_adherence_stats(user_id: int, db: Session) -> dict:
    checkins = (
        db.query(RoutineCheckin)
        .filter(RoutineCheckin.user_id == user_id)
        .order_by(RoutineCheckin.checkin_date.desc())
        .limit(30)
        .all()
    )
    total_logged_days = len(checkins)
    if total_logged_days == 0:
        return {
            "total_logged_days": 0,
            "adherence_percentage": 0,
            "streak": 0,
            "morning_completed_count": 0,
            "evening_completed_count": 0,
            "today_morning": False,
            "today_evening": False,
        }

    today_str = datetime.now().strftime("%Y-%m-%d")
    today_rec = next((c for c in checkins if c.checkin_date == today_str), None)

    morning_count = sum(1 for c in checkins if c.morning_completed)
    evening_count = sum(1 for c in checkins if c.evening_completed)
    possible_checkins = total_logged_days * 2
    actual_checkins = morning_count + evening_count
    adherence_pct = round((actual_checkins / possible_checkins) * 100) if possible_checkins > 0 else 0

    curr_date = date.today()
    checkin_map = {c.checkin_date: (c.morning_completed or c.evening_completed) for c in checkins}
    streak = 0
    d_str = curr_date.strftime("%Y-%m-%d")
    if checkin_map.get(d_str, False):
        streak += 1
        curr_date -= timedelta(days=1)
    else:
        yesterday_str = (curr_date - timedelta(days=1)).strftime("%Y-%m-%d")
        if checkin_map.get(yesterday_str, False):
            curr_date -= timedelta(days=1)
        else:
            curr_date = None

    while curr_date:
        d_str = curr_date.strftime("%Y-%m-%d")
        if checkin_map.get(d_str, False):
            streak += 1
            curr_date -= timedelta(days=1)
        else:
            break

    return {
        "total_logged_days": total_logged_days,
        "adherence_percentage": adherence_pct,
        "streak": streak,
        "morning_completed_count": morning_count,
        "evening_completed_count": evening_count,
        "today_morning": today_rec.morning_completed if today_rec else False,
        "today_evening": today_rec.evening_completed if today_rec else False,
    }


def build_client_dossier(user: User, db: Session, assignment: Optional[Assignment] = None) -> dict:
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user.id).first()
    if not profile:
        profile = SkinProfile(user_id=user.id, skin_health_score=0)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    has_survey = bool(profile.skin_type or profile.age_group or profile.skin_concerns or profile.sleep_quality)
    if has_survey and (profile.skin_health_score is None or profile.skin_health_score == 0):
        profile.skin_health_score = calculate_skin_health_score(profile, db)
        db.commit()
        db.refresh(profile)

    risks = get_skin_risks(profile)
    priorities = get_priority_concerns(profile)
    health_score = profile.skin_health_score or 0
    health_cat = calculate_health_category(health_score) if has_survey else "Not Assessed"
    overall_risk = calculate_overall_risk_level(risks) if has_survey else "None"

    histories = (
        db.query(AssessmentHistory)
        .filter(AssessmentHistory.user_id == user.id)
        .order_by(AssessmentHistory.assessment_date.desc())
        .all()
    )
    history_list = [assessment_history_to_dict(h) for h in histories]

    routine = db.query(SkincareRoutine).filter(SkincareRoutine.user_id == user.id).first()
    routine_dict = None
    if routine:
        morning_steps = [
            {
                "id": s.id, "time_of_day": s.time_of_day, "step_order": s.step_order,
                "category": s.category, "category_icon": s.category_icon, "step_title": s.step_title,
                "description": s.description, "active_ingredients": s.active_ingredients or "",
                "frequency": s.frequency, "caution_notes": s.caution_notes or "",
                "is_active": s.is_active, "is_customized": s.is_customized
            } for s in routine.steps if s.time_of_day == "morning" and s.is_active
        ]
        evening_steps = [
            {
                "id": s.id, "time_of_day": s.time_of_day, "step_order": s.step_order,
                "category": s.category, "category_icon": s.category_icon, "step_title": s.step_title,
                "description": s.description, "active_ingredients": s.active_ingredients or "",
                "frequency": s.frequency, "caution_notes": s.caution_notes or "",
                "is_active": s.is_active, "is_customized": s.is_customized
            } for s in routine.steps if s.time_of_day == "evening" and s.is_active
        ]
        weekly_steps = [
            {
                "id": s.id, "time_of_day": s.time_of_day, "step_order": s.step_order,
                "category": s.category, "category_icon": s.category_icon, "step_title": s.step_title,
                "description": s.description, "active_ingredients": s.active_ingredients or "",
                "frequency": s.frequency, "caution_notes": s.caution_notes or "",
                "is_active": s.is_active, "is_customized": s.is_customized
            } for s in routine.steps if s.time_of_day == "weekly" and s.is_active
        ]
        seasonal_recs = [
            {
                "id": r.id, "season": r.season, "title": r.title, "description": r.description, "tip": r.tip or ""
            } for r in routine.seasonal_recommendations
        ]
        routine_dict = {
            "id": routine.id,
            "season": routine.season,
            "last_adapted_at": routine.last_adapted_at.isoformat() if routine.last_adapted_at else None,
            "adaptation_summary": routine.adaptation_summary or "",
            "morning_steps": morning_steps,
            "evening_steps": evening_steps,
            "weekly_steps": weekly_steps,
            "seasonal_recommendations": seasonal_recs,
            "total_steps": len(morning_steps) + len(evening_steps) + len(weekly_steps)
        }

    adherence = get_user_adherence_stats(user.id, db)

    recent_checkins = (
        db.query(RoutineCheckin)
        .filter(RoutineCheckin.user_id == user.id)
        .order_by(RoutineCheckin.checkin_date.desc())
        .limit(14)
        .all()
    )
    checkin_log = [
        {
            "checkin_date": c.checkin_date,
            "morning_completed": c.morning_completed,
            "evening_completed": c.evening_completed,
        } for c in recent_checkins
    ]

    assigned_at = assignment.assigned_at.isoformat() if assignment and assignment.assigned_at else None

    return {
        "id": user.id,
        "name": user.name or "",
        "email": user.email,
        "status": user.status,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "assigned_at": assigned_at,
        "profile": {
            "id": profile.id,
            "skin_type": profile.skin_type or "",
            "age_group": profile.age_group or "",
            "skin_concerns": profile.skin_concerns or "",
            "allergies": profile.allergies or "",
            "sensitivities": profile.sensitivities or "",
            "lifestyle_habits": profile.lifestyle_habits or "",
            "sleep_quality": profile.sleep_quality or "",
            "water_intake": profile.water_intake or "",
            "environmental_exposure": profile.environmental_exposure or "",
            "image_url": profile.image_url or "",
            "skin_health_score": health_score,
            "skin_health_category": health_cat,
            "overall_risk_level": overall_risk,
            "has_survey": has_survey,
            "updated_at": profile.updated_at.isoformat() if profile.updated_at else None,
        },
        "skin_type": profile.skin_type or "",
        "age_group": profile.age_group or "",
        "skin_concerns": profile.skin_concerns or "",
        "allergies": profile.allergies or "",
        "sensitivities": profile.sensitivities or "",
        "lifestyle_habits": profile.lifestyle_habits or "",
        "sleep_quality": profile.sleep_quality or "",
        "water_intake": profile.water_intake or "",
        "environmental_exposure": profile.environmental_exposure or "",
        "image_url": profile.image_url or "",
        "skin_health_score": health_score,
        "skin_health_category": health_cat,
        "overall_risk_level": overall_risk,
        "has_survey": has_survey,
        "risks": risks,
        "priority_concerns": priorities,
        "routine": routine_dict,
        "assessment_history": history_list,
        "assessment_count": len(history_list),
        "latest_assessment_date": history_list[0]["assessment_date"] if history_list else None,
        "adherence": adherence,
        "recent_checkins": checkin_log,
    }


def verify_consultant_client_access(current_user: UserPayload, client_id: int, db: Session) -> tuple[Optional[Consultant], User]:
    if current_user.role not in ["consultant", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Consultant access required")

    user = db.query(User).filter(User.id == client_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Client user not found")

    if current_user.role == "admin":
        return None, user

    consultant = db.query(Consultant).filter(Consultant.email == current_user.email).first()
    if not consultant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultant not found")

    assignment = db.query(Assignment).filter(Assignment.consultant_id == consultant.id, Assignment.user_id == client_id).first()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This client is not assigned to you")

    return consultant, user


@app.get("/consultant/my-clients")
async def get_my_clients(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    if current_user.role not in ["consultant", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Consultant access required")

    consultant = db.query(Consultant).filter(Consultant.email == current_user.email).first()
    if not consultant and current_user.role == "admin":
        users = db.query(User).all()
        clients = [build_client_dossier(u, db, None) for u in users]
        return {"clients": clients}

    if not consultant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultant not found")

    assignments = db.query(Assignment).filter(Assignment.consultant_id == consultant.id).all()
    clients = []
    for a in assignments:
        user = db.query(User).filter(User.id == a.user_id).first()
        if not user:
            continue
        clients.append(build_client_dossier(user, db, a))

    return {"clients": clients}


@app.get("/consultant/client/{client_id}")
async def get_consultant_client_detail(
    client_id: int,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    consultant, user = verify_consultant_client_access(current_user, client_id, db)
    assignment = None
    if consultant:
        assignment = db.query(Assignment).filter(Assignment.consultant_id == consultant.id, Assignment.user_id == client_id).first()
    return build_client_dossier(user, db, assignment)


@app.get("/consultant/reports")
async def get_consultant_reports(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    if current_user.role not in ["consultant", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Consultant access required")

    if current_user.role == "admin":
        users = db.query(User).all()
    else:
        consultant = db.query(Consultant).filter(Consultant.email == current_user.email).first()
        if not consultant:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultant not found")
        assignments = db.query(Assignment).filter(Assignment.consultant_id == consultant.id).all()
        user_ids = [a.user_id for a in assignments]
        users = db.query(User).filter(User.id.in_(user_ids)).all() if user_ids else []

    user_map = {u.id: u for u in users}
    user_ids = list(user_map.keys())

    if not user_ids:
        return {"reports": []}

    histories = (
        db.query(AssessmentHistory)
        .filter(AssessmentHistory.user_id.in_(user_ids))
        .order_by(AssessmentHistory.assessment_date.desc())
        .all()
    )

    reports = []
    for h in histories:
        u = user_map.get(h.user_id)
        u_name = (u.name if u and u.name else (u.email.split("@")[0] if u else "Client"))
        u_email = u.email if u else ""
        report_item = assessment_history_to_dict(h)
        report_item["client_id"] = h.user_id
        report_item["client_name"] = u_name
        report_item["client_email"] = u_email
        reports.append(report_item)

    return {"reports": reports}


@app.get("/consultant/progress")
async def get_consultant_progress(
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    if current_user.role not in ["consultant", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Consultant access required")

    if current_user.role == "admin":
        users = db.query(User).all()
    else:
        consultant = db.query(Consultant).filter(Consultant.email == current_user.email).first()
        if not consultant:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultant not found")
        assignments = db.query(Assignment).filter(Assignment.consultant_id == consultant.id).all()
        user_ids = [a.user_id for a in assignments]
        users = db.query(User).filter(User.id.in_(user_ids)).all() if user_ids else []

    total_clients = len(users)
    scores = []
    adherences = []
    high_risk_count = 0
    client_progress_items = []

    for user in users:
        profile = db.query(SkinProfile).filter(SkinProfile.user_id == user.id).first()
        score = profile.skin_health_score if profile and profile.skin_health_score else 0
        if score > 0:
            scores.append(score)

        risks = get_skin_risks(profile) if profile else []
        overall_risk = calculate_overall_risk_level(risks)
        if overall_risk in ["High", "Critical"]:
            high_risk_count += 1

        adherence_stats = get_user_adherence_stats(user.id, db)
        adherences.append(adherence_stats["adherence_percentage"])

        # Historical scores to determine trend
        histories = (
            db.query(AssessmentHistory)
            .filter(AssessmentHistory.user_id == user.id)
            .order_by(AssessmentHistory.assessment_date.asc())
            .all()
        )
        initial_score = histories[0].skin_health_score if histories else score
        current_score = histories[-1].skin_health_score if histories else score
        score_change = current_score - initial_score

        client_progress_items.append({
            "client_id": user.id,
            "client_name": user.name or user.email.split("@")[0],
            "client_email": user.email,
            "skin_type": profile.skin_type if profile else "Not Set",
            "initial_score": initial_score,
            "current_score": current_score,
            "score_change": score_change,
            "adherence_percentage": adherence_stats["adherence_percentage"],
            "streak": adherence_stats["streak"],
            "total_logged_days": adherence_stats["total_logged_days"],
            "overall_risk_level": overall_risk,
            "last_active": adherence_stats["today_morning"] or adherence_stats["today_evening"],
        })

    avg_score = round(sum(scores) / len(scores)) if scores else 0
    avg_adherence = round(sum(adherences) / len(adherences)) if adherences else 0

    return {
        "total_clients": total_clients,
        "assessed_clients_count": len(scores),
        "average_health_score": avg_score,
        "average_adherence_rate": avg_adherence,
        "high_risk_clients_count": high_risk_count,
        "client_progress": client_progress_items,
    }


@app.post("/consultant/client/{client_id}/routine-step", response_model=RoutineStepResponse)
async def consultant_add_client_routine_step(
    client_id: int,
    step_data: ConsultantRoutineStepCreate,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RoutineStepResponse:
    verify_consultant_client_access(current_user, client_id, db)
    routine = ensure_user_routine(db, client_id, force_regenerate=False)

    existing_steps = [s for s in routine.steps if s.time_of_day == step_data.time_of_day.lower()]
    next_order = len(existing_steps) + 1

    icon_map = {
        "cleansing": "🧼",
        "exfoliation": "✨",
        "treatment": "💧",
        "moisturizing": "🧴",
        "sun_protection": "☀️",
        "night_care": "🌙",
    }
    cat_lower = step_data.category.lower()
    icon = icon_map.get(cat_lower, "🧴")

    new_step = RoutineStep(
        routine_id=routine.id,
        time_of_day=step_data.time_of_day.lower(),
        step_order=next_order,
        category=cat_lower,
        category_icon=icon,
        step_title=step_data.step_title,
        description=step_data.description or "",
        active_ingredients=step_data.active_ingredients or "",
        frequency=step_data.frequency or "Daily",
        caution_notes=step_data.caution_notes or "",
        is_active=True,
        is_customized=True,
    )
    db.add(new_step)
    db.commit()
    db.refresh(new_step)
    return RoutineStepResponse.model_validate(new_step)


@app.put("/consultant/client/{client_id}/routine-step/{step_id}", response_model=RoutineStepResponse)
async def consultant_update_client_routine_step(
    client_id: int,
    step_id: int,
    step_update: ConsultantRoutineStepUpdate,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RoutineStepResponse:
    verify_consultant_client_access(current_user, client_id, db)
    routine = ensure_user_routine(db, client_id, force_regenerate=False)

    step = db.query(RoutineStep).filter(RoutineStep.id == step_id, RoutineStep.routine_id == routine.id).first()
    if not step:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Routine step not found")

    if step_update.step_title is not None:
        step.step_title = step_update.step_title
    if step_update.category is not None:
        step.category = step_update.category.lower()
        icon_map = {"cleansing": "🧼", "exfoliation": "✨", "treatment": "💧", "moisturizing": "🧴", "sun_protection": "☀️", "night_care": "🌙"}
        step.category_icon = icon_map.get(step.category, "🧴")
    if step_update.time_of_day is not None:
        step.time_of_day = step_update.time_of_day.lower()
    if step_update.description is not None:
        step.description = step_update.description
    if step_update.active_ingredients is not None:
        step.active_ingredients = step_update.active_ingredients
    if step_update.frequency is not None:
        step.frequency = step_update.frequency
    if step_update.caution_notes is not None:
        step.caution_notes = step_update.caution_notes
    if step_update.is_active is not None:
        step.is_active = step_update.is_active

    step.is_customized = True
    db.commit()
    db.refresh(step)
    return RoutineStepResponse.model_validate(step)


@app.delete("/consultant/client/{client_id}/routine-step/{step_id}")
async def consultant_delete_client_routine_step(
    client_id: int,
    step_id: int,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    verify_consultant_client_access(current_user, client_id, db)
    routine = ensure_user_routine(db, client_id, force_regenerate=False)

    step = db.query(RoutineStep).filter(RoutineStep.id == step_id, RoutineStep.routine_id == routine.id).first()
    if not step:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Routine step not found")

    db.delete(step)
    db.commit()
    return {"message": f"Routine step #{step_id} deleted successfully"}


@app.post("/consultant/client/{client_id}/recommendation")
async def consultant_assign_recommendation(
    client_id: int,
    req: ConsultantRecommendationAssign,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    verify_consultant_client_access(current_user, client_id, db)
    routine = ensure_user_routine(db, client_id, force_regenerate=False)

    cat_lower = (req.category or "treatment").lower()
    time_of_day = (req.time_of_day or "morning").lower()
    icon_map = {
        "cleansing": "🧼",
        "exfoliation": "✨",
        "treatment": "💧",
        "moisturizing": "🧴",
        "sun_protection": "☀️",
        "night_care": "🌙",
    }
    icon = icon_map.get(cat_lower, "🧴")

    existing_steps = [s for s in routine.steps if s.time_of_day == time_of_day]
    next_order = len(existing_steps) + 1

    desc = req.description or ""
    if req.tip and req.tip.strip():
        desc = f"{desc} (Expert Tip: {req.tip.strip()})".strip()

    new_step = RoutineStep(
        routine_id=routine.id,
        time_of_day=time_of_day,
        step_order=next_order,
        category=cat_lower,
        category_icon=icon,
        step_title=req.title,
        description=desc,
        active_ingredients=req.active_ingredients or "",
        frequency=req.frequency or "Daily",
        caution_notes=req.caution_notes or "",
        is_active=True,
        is_customized=True,
    )
    db.add(new_step)
    db.commit()
    db.refresh(new_step)
    return {
        "message": f"Recommendation '{req.title}' successfully assigned to client's routine!",
        "step_id": new_step.id,
        "client_id": client_id,
    }


@app.put("/consultant/assessment/{assessment_id}/notes")
async def consultant_update_assessment_notes(
    assessment_id: int,
    req: AssessmentNotesUpdate,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in ["consultant", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Consultant access required")

    h = db.query(AssessmentHistory).filter(AssessmentHistory.assessment_id == assessment_id).first()
    if not h:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment record not found")

    # Verify access to this assessment's client
    verify_consultant_client_access(current_user, h.user_id, db)

    h.notes = req.notes or ""
    db.commit()
    db.refresh(h)
    return {"message": "Assessment consultation notes updated successfully", "assessment_id": h.assessment_id, "notes": h.notes}


# ---------------------------------------------------------------------------
# Feature 5: Ingredient Intelligence Module Endpoints
# ---------------------------------------------------------------------------

@app.post("/api/ingredients/analyze")
async def analyze_product_ingredients(
    req: IngredientAnalysisRequest,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
):
    """
    Analyzes an ingredient list, checks against user skin profile/allergies,
    evaluates biochemical interactions, and generates a personalized suitability report.
    """
    user_profile = None
    if credentials:
        try:
            payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("sub")
            if email:
                user = db.query(User).filter(User.email == email.lower().strip()).first()
                if user:
                    user_profile = db.query(SkinProfile).filter(SkinProfile.user_id == user.id).first()
        except Exception:
            pass

    custom_profile = {
        "skin_type": req.skin_type or "Normal",
        "concerns": req.concerns or [],
        "allergies": req.allergies or "",
        "sensitivities": req.sensitivities or "",
        "skin_health_score": req.skin_health_score or 70
    } if (not user_profile or req.skin_type) else None

    report = generate_ingredient_intelligence_report(
        ingredients_text=req.ingredients_text,
        user_profile=user_profile,
        custom_profile=custom_profile
    )

    if report.get("status") == "empty":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No ingredients were detected to analyze.")

    return report


@app.post("/api/ingredients/interactions")
async def check_ingredient_interactions(
    req: IngredientInteractionCheckRequest,
):
    """
    Evaluates biochemical pairwise interactions among selected active ingredients.
    """
    if not req.ingredients or len(req.ingredients) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please select at least 2 active ingredients or categories to check interactions."
        )
    return analyze_interactions(req.ingredients)


@app.get("/api/ingredients/categories")
async def get_ingredient_categories():
    """
    Fetches the 8 core skincare ingredient categories with educational details,
    benefits, pH levels, and contraindications.
    """
    return get_ingredient_categories_catalog()


@app.get("/api/ingredients/education/{name}")
async def get_ingredient_education_dossier(name: str):
    """
    Fetches comprehensive scientific and dermatological educational dossier
    for a specific ingredient or category.
    """
    dossier = get_ingredient_education(name)
    if not dossier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Educational data not found for '{name}'."
        )
    return dossier


# ---------------------------------------------------------------------------
# Feature 6: Product Recommendation Engine Endpoints
# ---------------------------------------------------------------------------

@app.get("/api/products/categories")
async def get_product_categories():
    """
    Fetches all 7 core skincare product categories:
    Face Wash, Moisturizer, Sunscreen, Serum, Toner, Treatment Products, Face Masks.
    """
    return {
        "categories": list(PRODUCT_CATEGORIES.values()),
        "total_categories": len(PRODUCT_CATEGORIES)
    }


@app.get("/api/products/catalog")
async def get_product_catalog(
    category: Optional[str] = None,
    budget_tier: Optional[str] = None,
    skin_type: Optional[str] = None,
    concern: Optional[str] = None,
    allergy_safe_only: Optional[bool] = False,
    search: Optional[str] = None,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
):
    """
    Fetches product catalog with dynamic suitability scoring for authenticated user
    or query parameter overrides, with multi-facet filtering.
    """
    user_skin_type = skin_type or "Normal"
    user_concerns = [c.strip() for c in concern.split(",") if c.strip()] if concern else []
    user_allergies = ""
    user_sensitivities = ""
    user_health_score = 70
    season = get_current_season()

    if credentials:
        try:
            payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("sub")
            if email:
                user = db.query(User).filter(User.email == email.lower().strip()).first()
                if user:
                    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user.id).first()
                    if profile:
                        if not skin_type and profile.skin_type:
                            user_skin_type = profile.skin_type
                        if not concern and profile.skin_concerns:
                            user_concerns = [c.strip() for c in profile.skin_concerns.replace(";", ",").split(",") if c.strip()]
                        user_allergies = profile.allergies or ""
                        user_sensitivities = profile.sensitivities or ""
                        user_health_score = getattr(profile, "skin_health_score", 70) or 70
        except Exception:
            pass

    results = []
    search_clean = (search or "").strip().lower()

    for p in PRODUCT_CATALOG:
        # Category filter
        if category and category != "all" and p["category"] != category:
            continue

        # Budget tier filter
        if budget_tier and budget_tier != "all" and p["budget_tier"] != budget_tier:
            continue

        # Search filter across title, brand, actives, concerns
        if search_clean:
            searchable_text = f"{p['name']} {p['brand']} {' '.join(p['key_actives'])} {' '.join(p['target_concerns'])} {p['description']}".lower()
            if search_clean not in searchable_text:
                continue

        suitability = calculate_product_suitability(
            product=p,
            skin_type=user_skin_type,
            concerns=user_concerns,
            allergies=user_allergies,
            sensitivities=user_sensitivities,
            skin_health_score=user_health_score,
            current_season=season
        )

        if allergy_safe_only and suitability.get("has_allergy_clash"):
            continue

        item = dict(p)
        item.update(suitability)
        results.append(item)

    # Sort by suitability score descending
    results.sort(key=lambda x: (x["suitability_score"], x["rating"]), reverse=True)

    return {
        "products": results,
        "total_results": len(results),
        "user_context": {
            "skin_type": user_skin_type,
            "concerns": user_concerns,
            "health_score": user_health_score,
            "season": season
        }
    }


@app.get("/api/products/recommendations")
async def get_user_personalized_recommendations(
    category: Optional[str] = None,
    budget_tier: Optional[str] = None,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
):
    """
    Generates personalized recommendations, category best-picks, and profile match scores
    for the authenticated user.
    """
    user_skin_type = "Normal"
    user_concerns = []
    user_allergies = ""
    user_sensitivities = ""
    user_health_score = 70
    season = get_current_season()

    if credentials:
        try:
            payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("sub")
            if email:
                user = db.query(User).filter(User.email == email.lower().strip()).first()
                if user:
                    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user.id).first()
                    if profile:
                        user_skin_type = profile.skin_type or "Normal"
                        if profile.skin_concerns:
                            user_concerns = [c.strip() for c in profile.skin_concerns.replace(";", ",").split(",") if c.strip()]
                        user_allergies = profile.allergies or ""
                        user_sensitivities = profile.sensitivities or ""
                        user_health_score = getattr(profile, "skin_health_score", 70) or 70
        except Exception:
            pass

    return get_personalized_recommendations(
        skin_type=user_skin_type,
        concerns=user_concerns,
        allergies=user_allergies,
        sensitivities=user_sensitivities,
        skin_health_score=user_health_score,
        current_season=season,
        budget_tier=budget_tier,
        category=category
    )


@app.get("/api/products/{product_id}")
async def get_single_product_details(
    product_id: str,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
):
    """
    Fetches detailed product dossier with personalized suitability score for current user.
    """
    catalog_map = {p["id"]: p for p in PRODUCT_CATALOG}
    prod = catalog_map.get(product_id)
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    user_skin_type = "Normal"
    user_concerns = []
    user_allergies = ""
    user_sensitivities = ""
    user_health_score = 70
    season = get_current_season()

    if credentials:
        try:
            payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("sub")
            if email:
                user = db.query(User).filter(User.email == email.lower().strip()).first()
                if user:
                    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user.id).first()
                    if profile:
                        user_skin_type = profile.skin_type or "Normal"
                        if profile.skin_concerns:
                            user_concerns = [c.strip() for c in profile.skin_concerns.replace(";", ",").split(",") if c.strip()]
                        user_allergies = profile.allergies or ""
                        user_sensitivities = profile.sensitivities or ""
                        user_health_score = getattr(profile, "skin_health_score", 70) or 70
        except Exception:
            pass

    suitability = calculate_product_suitability(
        product=prod,
        skin_type=user_skin_type,
        concerns=user_concerns,
        allergies=user_allergies,
        sensitivities=user_sensitivities,
        skin_health_score=user_health_score,
        current_season=season
    )

    item = dict(prod)
    item.update(suitability)
    return item


@app.get("/api/products/{product_id}/alternatives")
async def get_product_alternatives_endpoint(
    product_id: str,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
):
    """
    Finds smart alternatives for a product (Budget Dupes, Sensitive Alternatives, Premium Upgrades).
    """
    user_skin_type = "Normal"
    user_concerns = []
    user_allergies = ""
    user_sensitivities = ""

    if credentials:
        try:
            payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("sub")
            if email:
                user = db.query(User).filter(User.email == email.lower().strip()).first()
                if user:
                    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user.id).first()
                    if profile:
                        user_skin_type = profile.skin_type or "Normal"
                        if profile.skin_concerns:
                            user_concerns = [c.strip() for c in profile.skin_concerns.replace(";", ",").split(",") if c.strip()]
                        user_allergies = profile.allergies or ""
                        user_sensitivities = profile.sensitivities or ""
        except Exception:
            pass

    res = get_product_alternatives(
        product_id=product_id,
        skin_type=user_skin_type,
        concerns=user_concerns,
        allergies=user_allergies,
        sensitivities=user_sensitivities
    )
    if res.get("status") == "error":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=res.get("message"))
    return res


@app.post("/api/products/compare")
async def compare_products_endpoint(
    req: ProductCompareRequest,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
):
    """
    Side-by-side comparison for 2-3 products with automated AI dermatological verdict.
    """
    if not req.product_ids or len(req.product_ids) < 2:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please select at least 2 products to compare.")

    user_skin_type = req.skin_type or "Normal"
    user_concerns = req.concerns or []
    user_allergies = req.allergies or ""
    user_sensitivities = req.sensitivities or ""
    user_health_score = req.skin_health_score or 70
    season = req.season or get_current_season()

    if credentials and not req.skin_type:
        try:
            payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("sub")
            if email:
                user = db.query(User).filter(User.email == email.lower().strip()).first()
                if user:
                    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user.id).first()
                    if profile:
                        user_skin_type = profile.skin_type or "Normal"
                        if profile.skin_concerns:
                            user_concerns = [c.strip() for c in profile.skin_concerns.replace(";", ",").split(",") if c.strip()]
                        user_allergies = profile.allergies or ""
                        user_sensitivities = profile.sensitivities or ""
                        user_health_score = getattr(profile, "skin_health_score", 70) or 70
        except Exception:
            pass

    return compare_products_side_by_side(
        product_ids=req.product_ids,
        skin_type=user_skin_type,
        concerns=user_concerns,
        allergies=user_allergies,
        sensitivities=user_sensitivities,
        skin_health_score=user_health_score,
        current_season=season
    )


@app.post("/api/products/budget-routine")
async def build_budget_routine_endpoint(
    req: BudgetRoutineRequest,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
):
    """
    Builds an optimized complete skincare routine within a maximum budget constraint.
    """
    user_skin_type = req.skin_type or "Normal"
    user_concerns = req.concerns or []
    user_allergies = req.allergies or ""
    user_sensitivities = req.sensitivities or ""
    user_health_score = req.skin_health_score or 70
    season = req.season or get_current_season()

    if credentials and not req.skin_type:
        try:
            payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("sub")
            if email:
                user = db.query(User).filter(User.email == email.lower().strip()).first()
                if user:
                    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user.id).first()
                    if profile:
                        user_skin_type = profile.skin_type or "Normal"
                        if profile.skin_concerns:
                            user_concerns = [c.strip() for c in profile.skin_concerns.replace(";", ",").split(",") if c.strip()]
                        user_allergies = profile.allergies or ""
                        user_sensitivities = profile.sensitivities or ""
                        user_health_score = getattr(profile, "skin_health_score", 70) or 70
        except Exception:
            pass

    return build_budget_optimized_routine(
        max_budget=req.max_budget,
        routine_scope=req.routine_scope,
        skin_type=user_skin_type,
        concerns=user_concerns,
        allergies=user_allergies,
        sensitivities=user_sensitivities,
        skin_health_score=user_health_score,
        current_season=season
    )


@app.post("/api/products/add-to-routine")
async def add_product_to_user_routine(
    req: AddProductToRoutineRequest,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Seamlessly adds a recommended product as an active step in the authenticated user's routine.
    """
    catalog_map = {p["id"]: p for p in PRODUCT_CATALOG}
    prod = catalog_map.get(req.product_id)
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found in catalog")

    user_record = db.query(User).filter(User.email == current_user.email).first()
    if not user_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    routine = ensure_user_routine(db, user_record.id, force_regenerate=False)

    time_of_day = req.time_of_day.lower() if req.time_of_day else "morning"
    if time_of_day not in ["morning", "evening", "weekly"]:
        time_of_day = "morning"

    # Map product category to routine step category & icon
    cat_mapping = {
        "face_wash": ("cleansing", "🧼"),
        "moisturizer": ("moisturizing", "🧴"),
        "sunscreen": ("sun_protection", "☀️"),
        "serum": ("treatment", "💧"),
        "toner": ("cleansing", "🌿"),
        "treatment_products": ("treatment", "🎯"),
        "face_masks": ("night_care", "✨"),
    }
    cat_step, icon = cat_mapping.get(prod["category"], ("treatment", "🧴"))

    existing_steps = [s for s in routine.steps if s.time_of_day == time_of_day]
    next_order = len(existing_steps) + 1

    desc = f"{prod['brand']} {prod['name']} — {prod['tagline']}."
    if req.custom_notes:
        desc += f" (Note: {req.custom_notes.strip()})"

    new_step = RoutineStep(
        routine_id=routine.id,
        time_of_day=time_of_day,
        step_order=next_order,
        category=cat_step,
        category_icon=icon,
        step_title=f"{prod['brand']} {prod['name']}",
        description=desc,
        active_ingredients=", ".join(prod["key_actives"]),
        frequency="Daily" if time_of_day in ["morning", "evening"] else "1-2x / week",
        caution_notes=prod["contraindications"] or "Patch test before initial use.",
        is_active=True,
        is_customized=True
    )
    db.add(new_step)
    db.commit()
    db.refresh(new_step)

    return {
        "message": f"Successfully added '{prod['brand']} {prod['name']}' to your {time_of_day.capitalize()} Routine!",
        "step_id": new_step.id,
        "routine_id": routine.id
    }


@app.get("/consultant/client/{client_id}/product-recommendations")
async def get_consultant_client_product_recommendations(
    client_id: int,
    category: Optional[str] = None,
    budget_tier: Optional[str] = None,
    current_user: UserPayload = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Enables consultants to view tailored product recommendations and suitability scores
    for an assigned client.
    """
    verify_consultant_client_access(current_user, client_id, db)

    profile = db.query(SkinProfile).filter(SkinProfile.user_id == client_id).first()
    skin_type = profile.skin_type if profile and profile.skin_type else "Normal"
    concerns = [c.strip() for c in profile.skin_concerns.replace(";", ",").split(",") if c.strip()] if profile and profile.skin_concerns else []
    allergies = profile.allergies if profile and profile.allergies else ""
    sensitivities = profile.sensitivities if profile and profile.sensitivities else ""
    health_score = getattr(profile, "skin_health_score", 70) if profile else 70

    return get_personalized_recommendations(
        skin_type=skin_type,
        concerns=concerns,
        allergies=allergies,
        sensitivities=sensitivities,
        skin_health_score=health_score,
        current_season=get_current_season(),
        budget_tier=budget_tier,
        category=category
    )



app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False)