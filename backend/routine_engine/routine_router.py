import os
import json
import time
import random
from fastapi import APIRouter, HTTPException, status, Query, Body
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from skin_assessment_engine import get_db, release_db
from routine_engine import routine_engine, UserFeedback, SwappedProductOutput

# ==============================================================================
# GOOGLE GENAI SDK INITIALIZATION (GOOGLE AI STUDIO MODE)
# ==============================================================================
from google import genai
from google.genai import types

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
PRIMARY_MODEL = os.getenv("GEMINI_PRIMARY_MODEL", os.getenv("PRIMARY_MODEL", os.getenv("GEMINI_MODEL", "gemini-3.6-flash")))
FALLBACK_MODEL = os.getenv("GEMINI_FALLBACK_MODEL", os.getenv("FALLBACK_MODEL", "gemini-3.5-flash-lite"))

try:
    if GEMINI_API_KEY:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    else:
        gemini_client = genai.Client()
    print("🤖 Clinician Routine Router: Google AI Studio Client initialized successfully!")
except Exception as e:
    gemini_client = None
    print(f"⚠️ Clinician Routine Router: Gemini Client failed to initialize ({e}).")

# --- RETRY UTILITY WITH MODEL FALLBACK & RATE LIMIT HANDLING ---

def generate_content_with_fallback(
    client: genai.Client,
    contents: Any,
    config: Optional[types.GenerateContentConfig] = None,
    primary_model: str = PRIMARY_MODEL,
    fallback_model: str = FALLBACK_MODEL,
    max_retries_per_model: int = 3,
    initial_delay: float = 2.0
):
    models_to_try = [primary_model, fallback_model, "gemini-3.1-pro-preview"]
    models_to_try = list(dict.fromkeys(models_to_try))
    last_exception = None

    for current_model in models_to_try:
        for attempt in range(max_retries_per_model + 1):
            try:
                response = client.models.generate_content(
                    model=current_model,
                    contents=contents,
                    config=config,
                )
                time.sleep(4)
                return response
            except Exception as e:
                last_exception = e
                err_msg = str(e).lower()
                is_rate_limit = "429" in err_msg or "resource_exhausted" in err_msg or "quota" in err_msg
                
                if is_rate_limit:
                    if attempt < max_retries_per_model:
                        jitter = random.uniform(0.1, 0.5)
                        delay = (initial_delay * (2 ** attempt)) + jitter
                        print(f"⚠️ Rate limit hit on {current_model}. Retrying in {delay:.2f}s...")
                        time.sleep(delay)
                    else:
                        print(f"⚠️ Model {current_model} exhausted. Switching to fallback...")
                        time.sleep(4)
                        break
                else:
                    print(f"⚠️ Model {current_model} error: {e}. Switching to fallback...")
                    break
                    
    if last_exception:
        raise last_exception
    raise RuntimeError("All configured Gemini models failed due to rate limits or quota exhaustion.")


router = APIRouter(tags=["Module 4: Clinician Routine Generator"])

# --- PYDANTIC SCHEMAS ---

class SmartAdaptRequest(BaseModel):
    user_email: str
    feedback_notes: str = Field(..., json_schema_extra={"example": "Experiencing slight redness after applying salicylic acid."})
    current_season: Optional[str] = Field("Summer", json_schema_extra={"example": "Summer"})

class SwapProductRequest(BaseModel):
    user_email: Optional[str] = None
    patient_email: Optional[str] = None
    current_product: str = Field(..., json_schema_extra={"example": "CeraVe Renewing SA Cleanser"})
    current_active: Optional[str] = Field("", json_schema_extra={"example": "Salicylic Acid"})
    category: str = Field(..., json_schema_extra={"example": "🧼 Cleansing"})
    swap_reason: Optional[str] = Field("Looking for an alternative over-the-counter option", json_schema_extra={"example": "Looking for gentler alternative"})

class RoutineStepAdaptation(BaseModel):
    category: str = Field(description="Step category (e.g., Cleanser, Treatment, Hydration)")
    product: str = Field(description="Recommended product or active formulation")
    instructions: str = Field(description="Updated usage instructions based on user feedback")
    reason_for_change: str = Field(description="Clinical reason for adapting this step")

class SmartAdaptResponse(BaseModel):
    adaptation_summary: str = Field(description="Overall clinical rationale for routine modification")
    morning_adjustments: List[RoutineStepAdaptation]
    evening_adjustments: List[RoutineStepAdaptation]

# --- HELPER FUNCTIONS ---

def _normalize_row(row: Any, keys: List[str]) -> Dict[str, Any]:
    if not row:
        return {}
    if isinstance(row, dict):
        return {str(k).lower(): v for k, v in row.items()}
    elif isinstance(row, (tuple, list)):
        return {key.lower(): row[i] for i, key in enumerate(keys) if i < len(row)}
    return {}

def merge_routine_layers(ai_steps: List[Dict[str, Any]], clinical_steps: List[Dict[str, Any]], clinician_role: str) -> List[Dict[str, Any]]:
    combined = []
    
    # 1. Clinical overrides added with explicit clinician badges
    for c_step in clinical_steps:
        step_dict = _normalize_row(
            c_step, 
            ["step_order", "timing", "category", "product", "product_recommendation", "active_ingredient", "instructions", "adaptation_badge"]
        )
        combined.append({
            "step_order": 0,
            "category": step_dict.get("category") or "🩺 Prescribed Step",
            "product": step_dict.get("product_recommendation") or step_dict.get("product", ""),
            "active_ingredient": step_dict.get("active_ingredient", ""),
            "instructions": step_dict.get("instructions", ""),
            "adaptation_badge": step_dict.get("adaptation_badge") or f"{clinician_role} Prescription",
            "recommendation_source": f"{clinician_role} Recommended",
            "is_clinical_override": True
        })

    clinical_categories = {
        (_normalize_row(c, ["step_order", "timing", "category"]).get("category") or "").lower() 
        for c in clinical_steps
    }
    
    # 2. AI Steps added with AI Formulated tags
    for a_step in ai_steps:
        if (a_step.get("category") or "").lower() not in clinical_categories:
            a_step["is_clinical_override"] = False
            if not a_step.get("adaptation_badge") or "Prescription" in a_step.get("adaptation_badge"):
                a_step["adaptation_badge"] = "AI Formulated"
            if not a_step.get("recommendation_source") or "Dermatologist" in a_step.get("recommendation_source"):
                a_step["recommendation_source"] = "AI Recommended"
            combined.append(a_step)

    for idx, step in enumerate(combined, start=1):
        step["step_order"] = idx

    return combined

# ==========================================
# 1. ACTIVE ROUTINE ENDPOINT (GET)
# ==========================================
@router.get("/routine/active", status_code=status.HTTP_200_OK)
@router.get("/api/routine/active", status_code=status.HTTP_200_OK)
async def get_active_hybrid_routine(
    user_email: Optional[str] = Query(None),
    patient_email: Optional[str] = Query(None),
    season: str = Query("Summer")
):
    target_email = user_email or patient_email
    if not target_email:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
            detail="Query parameter 'user_email' or 'patient_email' is required."
        )

    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT id, name, email FROM USERS WHERE LOWER(EMAIL) = LOWER(%s);", (target_email.strip(),))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account record not found.")
        
        user_dict = _normalize_row(user, ["id", "name", "email"])
        user_id = user_dict.get("id")
        user_name = user_dict.get("name") or target_email.split('@')[0]

        # 1. Fetch Profile Data
        user_skin_type = "Combination"
        user_allergies = None
        user_sensitivities = None
        user_water = 2.0
        user_sleep = "Good"
        user_env = "Urban"

        try:
            cursor.execute(
                "SELECT skin_type, allergies, sensitivities, water_intake, sleep_quality, environment FROM SKIN_PROFILES WHERE USER_ID = %s LIMIT 1;", 
                (user_id,)
            )
            sp_row = cursor.fetchone()
            if sp_row:
                sp_dict = _normalize_row(sp_row, ["skin_type", "allergies", "sensitivities", "water_intake", "sleep_quality", "environment"])
                user_skin_type = sp_dict.get("skin_type") or "Combination"
                user_allergies = sp_dict.get("allergies")
                user_sensitivities = sp_dict.get("sensitivities")
                user_water = float(sp_dict.get("water_intake") or 2.0)
                user_sleep = sp_dict.get("sleep_quality") or "Good"
                user_env = sp_dict.get("environment") or "Urban"
        except Exception:
            pass

        # 2. Check for Clinician Manual Overrides
        dermatologist_steps = []
        has_override = False
        try:
            cursor.execute(
                "SELECT has_dermatologist_override, dermatologist_steps FROM ROUTINES WHERE USER_ID = %s AND IS_ACTIVE = TRUE ORDER BY ID DESC LIMIT 1;",
                (user_id,)
            )
            routine_meta = cursor.fetchone()
            if routine_meta:
                r_meta_dict = _normalize_row(routine_meta, ["has_dermatologist_override", "dermatologist_steps"])
                has_override = bool(r_meta_dict.get("has_dermatologist_override"))
                if has_override:
                    raw_steps = r_meta_dict.get("dermatologist_steps")
                    if isinstance(raw_steps, str) and raw_steps.strip():
                        try:
                            dermatologist_steps = json.loads(raw_steps)
                        except Exception:
                            pass
                    elif isinstance(raw_steps, list):
                        dermatologist_steps = raw_steps
        except Exception:
            pass

        # 3. Fetch Assessment Concerns & Deltas
        latest_concerns = []
        prev_concerns = []
        latest_health_score = 75

        try:
            cursor.execute(
                """SELECT ID, SKIN_HEALTH_SCORE 
                   FROM SKINASSESSMENT 
                   WHERE USER_ID = %s 
                   ORDER BY CREATED_AT DESC LIMIT 2;""",
                (user_id,)
            )
            assessments = cursor.fetchall() or []
            
            if assessments:
                first_asm = _normalize_row(assessments[0], ["id", "skin_health_score"])
                latest_asm_id = first_asm.get("id")
                latest_health_score = int(first_asm.get("skin_health_score") or 75)

                cursor.execute(
                    """SELECT CONCERN_NAME, SEVERITY, PRIORITY 
                       FROM SKINCONCERN 
                       WHERE ASSESSMENT_ID = %s 
                       ORDER BY PRIORITY ASC;""",
                    (latest_asm_id,)
                )
                c_rows = cursor.fetchall() or []
                latest_concerns = [_normalize_row(r, ["concern_name", "severity", "priority"]) for r in c_rows]

                if len(assessments) > 1:
                    second_asm = _normalize_row(assessments[1], ["id", "skin_health_score"])
                    prev_asm_id = second_asm.get("id")
                    cursor.execute(
                        """SELECT CONCERN_NAME, SEVERITY, PRIORITY 
                           FROM SKINCONCERN 
                           WHERE ASSESSMENT_ID = %s 
                           ORDER BY PRIORITY ASC;""",
                        (prev_asm_id,)
                    )
                    prev_c_rows = cursor.fetchall() or []
                    prev_concerns = [_normalize_row(r, ["concern_name", "severity", "priority"]) for r in prev_c_rows]
        except Exception as e:
            print(f"⚠️ Assessment fetch notice: {e}")

        dominant_concern = "General Maintenance"
        if latest_concerns:
            dominant_concern = latest_concerns[0].get("concern_name") or "General Maintenance"

        profile_payload = {
            "skin_type": user_skin_type,
            "allergies": user_allergies,
            "sensitivities": user_sensitivities,
            "score": latest_health_score,
            "is_sensitive": "sensitive" in (user_skin_type + (user_sensitivities or "")).lower(),
            "water_intake": user_water,
            "sleep_quality": user_sleep,
            "environment": user_env
        }

        # 4. Generate Dynamically via AI
        generated = routine_engine.generate_routine(
            profile=profile_payload,
            dominant_concern=dominant_concern,
            season=season,
            prev_concerns=prev_concerns,
            latest_concerns=latest_concerns,
            clinician_type="AI"
        )

        def is_timing(step: Any, target_timing: str) -> bool:
            step_dict = _normalize_row(step, ["step_order", "timing", "category", "product", "active_ingredient", "instructions", "adaptation_badge"])
            return (step_dict.get("timing") or "").lower() == target_timing.lower()

        morning_combined = merge_routine_layers(
            ai_steps=[s.model_dump() for s in generated.morning_routine],
            clinical_steps=[s for s in dermatologist_steps if is_timing(s, "morning")],
            clinician_role="Dermatologist"
        )

        evening_combined = merge_routine_layers(
            ai_steps=[s.model_dump() for s in generated.evening_routine],
            clinical_steps=[s for s in dermatologist_steps if is_timing(s, "evening")],
            clinician_role="Dermatologist"
        )

        return {
            "status": "success",
            "has_dermatologist_override": has_override,
            "clinician_type": "AI",
            "data": {
                "adaptation_summary": generated.adaptation_summary,
                "seasonal_recommendation": generated.seasonal_recommendation,
                "morning_routine": morning_combined,
                "evening_routine": evening_combined,
                "weekly_treatment_plan": [w.model_dump() for w in generated.weekly_treatment_plan]
            }
        }
    except HTTPException:
        if conn: conn.rollback()
        raise
    except Exception as e:
        print(f"❌ ERROR in GET /routine/active: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Execution error: {str(e)}")
    finally:
        if cursor and hasattr(cursor, 'close'):
            cursor.close()
        if conn:
            release_db(conn)

# ==========================================
# 2. GENERATE ROUTINE ENDPOINT (POST)
# ==========================================
@router.post("/routine/generate", status_code=status.HTTP_201_CREATED)
@router.post("/api/routine/generate", status_code=status.HTTP_201_CREATED)
async def generate_and_save_routine(
    user_email: Optional[str] = Query(None),
    patient_email: Optional[str] = Query(None),
    season: str = Query("Summer"),
    feedback: Optional[UserFeedback] = Body(None)
):
    target_email = user_email or patient_email
    if not target_email:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
            detail="Query parameter 'user_email' or 'patient_email' is required."
        )

    conn = None
    cursor = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name FROM USERS WHERE LOWER(EMAIL) = LOWER(%s);", (target_email.strip(),))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account record not found.")
        
        user_dict = _normalize_row(user, ["id", "name"])
        user_id = user_dict.get("id")
        user_name = user_dict.get("name") or target_email.split('@')[0]

        user_skin_type = "Combination"
        user_allergies = None
        user_sensitivities = None
        user_water = 2.0
        user_sleep = "Good"
        user_env = "Urban"

        try:
            cursor.execute(
                "SELECT skin_type, allergies, sensitivities, water_intake, sleep_quality, environment FROM SKIN_PROFILES WHERE USER_ID = %s LIMIT 1;", 
                (user_id,)
            )
            sp_row = cursor.fetchone()
            if sp_row:
                sp_dict = _normalize_row(sp_row, ["skin_type", "allergies", "sensitivities", "water_intake", "sleep_quality", "environment"])
                user_skin_type = sp_dict.get("skin_type") or "Combination"
                user_allergies = sp_dict.get("allergies")
                user_sensitivities = sp_dict.get("sensitivities")
                user_water = float(sp_dict.get("water_intake") or 2.0)
                user_sleep = sp_dict.get("sleep_quality") or "Good"
                user_env = sp_dict.get("environment") or "Urban"
        except Exception:
            pass

        latest_concerns = []
        prev_concerns = []
        latest_health_score = 75

        try:
            cursor.execute(
                """SELECT ID, SKIN_HEALTH_SCORE 
                   FROM SKINASSESSMENT 
                   WHERE USER_ID = %s 
                   ORDER BY CREATED_AT DESC LIMIT 2;""",
                (user_id,)
            )
            assessments = cursor.fetchall() or []
            
            if assessments:
                first_asm = _normalize_row(assessments[0], ["id", "skin_health_score"])
                latest_asm_id = first_asm.get("id")
                latest_health_score = int(first_asm.get("skin_health_score") or 75)

                cursor.execute(
                    """SELECT CONCERN_NAME, SEVERITY, PRIORITY 
                       FROM SKINCONCERN 
                       WHERE ASSESSMENT_ID = %s 
                       ORDER BY PRIORITY ASC;""",
                    (latest_asm_id,)
                )
                c_rows = cursor.fetchall() or []
                latest_concerns = [_normalize_row(r, ["concern_name", "severity", "priority"]) for r in c_rows]

                if len(assessments) > 1:
                    second_asm = _normalize_row(assessments[1], ["id", "skin_health_score"])
                    prev_asm_id = second_asm.get("id")
                    cursor.execute(
                        """SELECT CONCERN_NAME, SEVERITY, PRIORITY 
                           FROM SKINCONCERN 
                           WHERE ASSESSMENT_ID = %s 
                           ORDER BY PRIORITY ASC;""",
                        (prev_asm_id,)
                    )
                    prev_c_rows = cursor.fetchall() or []
                    prev_concerns = [_normalize_row(r, ["concern_name", "severity", "priority"]) for r in prev_c_rows]
        except Exception as e:
            print(f"⚠️ Assessment fetch notice: {e}")

        dominant_concern = "General Maintenance"
        if latest_concerns:
            dominant_concern = latest_concerns[0].get("concern_name") or "General Maintenance"

        profile_payload = {
            "skin_type": user_skin_type,
            "allergies": user_allergies,
            "sensitivities": user_sensitivities,
            "score": latest_health_score,
            "is_sensitive": "sensitive" in (user_skin_type + (user_sensitivities or "")).lower(),
            "water_intake": user_water,
            "sleep_quality": user_sleep,
            "environment": user_env
        }

        generated = routine_engine.generate_routine(
            profile=profile_payload,
            dominant_concern=dominant_concern,
            season=season,
            prev_concerns=prev_concerns,
            latest_concerns=latest_concerns,
            feedback=feedback,
            clinician_type="AI"
        )

        try:
            cursor.execute("UPDATE ROUTINES SET IS_ACTIVE = FALSE WHERE USER_ID = %s;", (user_id,))
            cursor.execute(
                """INSERT INTO ROUTINES (USER_ID, PATIENT_NAME, SEASONAL_NOTE, ADAPTATION_SUMMARY, IS_ACTIVE) 
                   VALUES (%s, %s, %s, %s, TRUE) RETURNING id;""",
                (user_id, user_name, generated.seasonal_recommendation, generated.adaptation_summary)
            )
            inserted = cursor.fetchone()
            routine_id = _normalize_row(inserted, ["id"]).get("id") if inserted else None

            if routine_id:
                for step in generated.morning_routine:
                    cursor.execute(
                        """INSERT INTO ROUTINE_STEPS (ROUTINE_ID, TIMING, STEP_ORDER, CATEGORY, PRODUCT_RECOMMENDATION, ACTIVE_INGREDIENT, INSTRUCTIONS, ADAPTATION_BADGE)
                           VALUES (%s, 'Morning', %s, %s, %s, %s, %s, %s);""",
                        (routine_id, step.step_order, step.category, step.product, step.active_ingredient, step.instructions, step.adaptation_badge)
                    )

                for step in generated.evening_routine:
                    cursor.execute(
                        """INSERT INTO ROUTINE_STEPS (ROUTINE_ID, TIMING, STEP_ORDER, CATEGORY, PRODUCT_RECOMMENDATION, ACTIVE_INGREDIENT, INSTRUCTIONS, ADAPTATION_BADGE)
                           VALUES (%s, 'Evening', %s, %s, %s, %s, %s, %s);""",
                        (routine_id, step.step_order, step.category, step.product, step.active_ingredient, step.instructions, step.adaptation_badge)
                    )

            conn.commit()
            return {"status": "success", "routine_id": routine_id, "data": generated.model_dump()}
        except Exception as db_err:
            if conn: conn.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database insert error: {str(db_err)}")
    except HTTPException:
        if conn: conn.rollback()
        raise
    except Exception as e:
        if conn: conn.rollback()
        print(f"❌ ERROR in POST /routine/generate: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    finally:
        if cursor and hasattr(cursor, 'close'):
            cursor.close()
        if conn:
            release_db(conn)

# ==========================================
# 3. SWAP PRODUCT ENDPOINT (AI ONLY)
# ==========================================
@router.post("/routine/swap-product", status_code=status.HTTP_200_OK)
@router.post("/api/routine/swap-product", status_code=status.HTTP_200_OK)
async def swap_product_endpoint(payload: SwapProductRequest):
    target_email = payload.user_email or payload.patient_email

    skin_type = "Combination"
    allergies = None

    if target_email:
        conn = None
        cursor = None
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute(
                """SELECT sp.skin_type, sp.allergies 
                   FROM USERS u 
                   LEFT JOIN SKIN_PROFILES sp ON u.ID = sp.USER_ID 
                   WHERE LOWER(u.EMAIL) = LOWER(%s);""",
                (target_email.strip(),)
            )
            row = cursor.fetchone()
            if row:
                r_dict = _normalize_row(row, ["skin_type", "allergies"])
                skin_type = r_dict.get("skin_type") or "Combination"
                allergies = r_dict.get("allergies")
        except Exception:
            pass
        finally:
            if cursor: cursor.close()
            if conn: release_db(conn)

    try:
        swapped = routine_engine.swap_product_ai(
            current_product=payload.current_product,
            current_active=payload.current_active or "",
            category=payload.category,
            swap_reason=payload.swap_reason or "Alternative requested by user",
            skin_type=skin_type,
            allergies=allergies
        )
        return {
            "status": "success",
            "data": swapped.model_dump()
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"AI Product Swap Failed: {str(e)}")

# ==========================================
# 4. SMART ADAPT ROUTINE ENDPOINT (POST)
# ==========================================
@router.post("/routine/smart-adapt", status_code=status.HTTP_200_OK)
@router.post("/api/routine/smart-adapt", status_code=status.HTTP_200_OK)
async def smart_adapt_routine(payload: SmartAdaptRequest):
    fallback_response = {
        "status": "success",
        "data": {
            "adaptation_summary": "Based on reported sensitivities, we have de-escalated active ingredient concentrations and introduced barrier-repairing ceramides to minimize erythema and restore epidermal health.",
            "morning_adjustments": [
                {
                    "category": "💧 Treatment",
                    "product": "Cocokind Ceramide Barrier Serum",
                    "instructions": "Swap out strong actives for this ceramide-rich serum to soothe the skin. Apply 2-3 drops immediately after cleansing.",
                    "reason_for_change": "Reduces active irritation while simultaneously reinforcing the lipid barrier."
                }
            ],
            "evening_adjustments": [
                {
                    "category": "🧴 Moisturizing",
                    "product": "La Roche-Posay Cicaplast Baume B5",
                    "instructions": "Use as your final evening step. Apply a thick layer directly over any affected or inflamed areas.",
                    "reason_for_change": "Contains Panthenol (Vitamin B5) and Madecassoside for accelerated epidermal recovery."
                }
            ]
        }
    }

    if not gemini_client:
        return fallback_response

    try:
        prompt = f"""
        Act as an expert cosmetic skincare formulator.
        Analyze user feedback and adapt their over-the-counter skincare routine:
        - User Email: {payload.user_email}
        - Current Season: {payload.current_season}
        - Reported Feedback: {payload.feedback_notes}

        Provide specific morning and evening routine modifications to address the feedback safely without prescribing medication.
        """

        response = generate_content_with_fallback(
            client=gemini_client,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=SmartAdaptResponse,
                temperature=0.7,
                automatic_function_calling=types.AutomaticFunctionCallingConfig(
                    disable=False,
                    maximum_remote_calls=5,
                ),
            ),
            primary_model=PRIMARY_MODEL,
            fallback_model=FALLBACK_MODEL
        )

        if not response or (not getattr(response, "text", None) and not getattr(response, "parsed", None)):
            return fallback_response

        if hasattr(response, "parsed") and response.parsed:
            if isinstance(response.parsed, BaseModel):
                data = response.parsed.model_dump()
            else:
                data = dict(response.parsed)
        else:
            data = json.loads(response.text)

        return {
            "status": "success",
            "data": data
        }
    except Exception as e:
        return fallback_response