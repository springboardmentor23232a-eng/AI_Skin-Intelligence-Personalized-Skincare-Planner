import io
import re
import os
import json
import time
import random
import numpy as np
import pandas as pd
from PIL import Image
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

import torch
import torch.nn as nn
from torchvision import transforms, models

import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from fastapi import APIRouter, Form, File, UploadFile, HTTPException, status, Query
from fastapi.concurrency import run_in_threadpool

# ==============================================================================
# GOOGLE GENAI SDK INITIALIZATION (GOOGLE AI STUDIO MODE)
# ==============================================================================
from google import genai
from google.genai import types

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
PRIMARY_MODEL = os.getenv("GEMINI_PRIMARY_MODEL", os.getenv("PRIMARY_MODEL", "gemini-3.6-flash"))
FALLBACK_MODEL = os.getenv("GEMINI_FALLBACK_MODEL", os.getenv("FALLBACK_MODEL", "gemini-3.5-flash-lite"))

try:
    if GEMINI_API_KEY:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    else:
        gemini_client = genai.Client()
    print("🤖 Module 3 Assessment: Google AI Studio Client initialized successfully!")
except Exception as e:
    gemini_client = None
    print(f"⚠️ Module 3 Assessment: Gemini Client failed to initialize ({e}).")


# --- RETRY UTILITY WITH MODEL FALLBACK & 429 RATE LIMIT HANDLING ---

def generate_content_with_fallback(
    client: genai.Client,
    contents: Any,
    config: Optional[types.GenerateContentConfig] = None,
    primary_model: str = PRIMARY_MODEL,
    fallback_model: str = FALLBACK_MODEL,
    max_retries_per_model: int = 3,
    initial_delay: float = 2.0
):
    """Generates content with backoff for 429 rate limits, and falls back across active Gemini models on quota exhaustion."""
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
                        print(f"⚠️ Rate limit on {current_model}. Retrying in {delay:.2f}s... (Attempt {attempt + 1}/{max_retries_per_model})")
                        time.sleep(delay)
                    else:
                        print(f"⚠️ Model {current_model} quota/rate limit exhausted. Switching to fallback model...")
                        time.sleep(4)
                        break
                else:
                    print(f"⚠️ Model {current_model} error: {e}. Switching to fallback model...")
                    break
                    
    if last_exception:
        raise last_exception
    raise RuntimeError("All Gemini models exhausted available quotas and rate limits.")


# Database-backed tools for Automatic Function Calling (AFC)
def lookup_clinical_treatments(concern: str) -> str:
    """Queries the database for clinical treatment ingredients and effects based on skin concern."""
    conn = get_db()
    if not conn:
        return "Database connection unavailable."
    cursor = None
    try:
        cursor = conn.cursor()
        cursor.execute(
            """SELECT ingredients, concentrations, effects 
               FROM skincare_treatments 
               WHERE LOWER(concern) LIKE LOWER(%s);""",
            (f"%{concern.strip()}%",)
        )
        rows = cursor.fetchall()
        return json.dumps(rows, default=str) if rows else "No active treatments found in database."
    except Exception as e:
        return f"Error querying treatment database: {e}"
    finally:
        if cursor:
            cursor.close()
        release_db(conn)

def fetch_patient_historical_sensitivities(user_id: int) -> str:
    """Retrieves patient recorded allergies and sensitivities directly from the database profile."""
    conn = get_db()
    if not conn:
        return "Database connection unavailable."
    cursor = None
    try:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT allergies, sensitivities, skin_type FROM skin_profiles WHERE user_id = %s;",
            (user_id,)
        )
        profile = cursor.fetchone()
        return json.dumps(profile, default=str) if profile else "No existing profile sensitivities on record."
    except Exception as e:
        return f"Error querying user skin profile: {e}"
    finally:
        if cursor:
            cursor.close()
        release_db(conn)

ASSESSMENT_TOOLS = [lookup_clinical_treatments, fetch_patient_historical_sensitivities]

router = APIRouter(tags=["Module 3: Skin Assessment"])

DATA_DIR = "data"
SKIN_CSV = os.path.join(DATA_DIR, "Skincare Treatment Dataset.csv")

CONCERNS_LIST = [
    "Acne", "Hyperpigmentation", "Dark Spots", "Dry Skin", "Oily Skin",
    "Sensitive Skin", "Wrinkles", "Fine Lines", "Redness", "Uneven Skin Tone"
]

# ==========================================
# GEMINI STRUCTURED OUTPUT SCHEMAS
# ==========================================
class AssessmentSynthesisOutput(BaseModel):
    diagnostic_summary: str = Field(description="Clinical diagnostic summary of observed skin concerns")
    key_observations: List[str] = Field(description="Key clinical observations based on visual and tabular metrics")
    lifestyle_recommendations: List[str] = Field(description="Actionable lifestyle interventions based on input parameters")


# ==========================================
# 1. DATABASE CONNECTION POOL
# ==========================================
db_pool: Optional[psycopg2.pool.ThreadedConnectionPool] = None

def init_db_pool():
    global db_pool
    if db_pool is None:
        db_pool = psycopg2.pool.ThreadedConnectionPool(
            minconn=1,
            maxconn=20,
            dbname=os.getenv("DB_NAME", "derma_ai"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "mango"),
            host=os.getenv("DB_HOST", "127.0.0.1"),
            port=os.getenv("DB_PORT", "5432")
        )

def close_db_pool():
    global db_pool
    if db_pool:
        db_pool.closeall()
        db_pool = None

def get_db():
    if db_pool is None:
        init_db_pool()
    conn = db_pool.getconn()
    conn.cursor_factory = RealDictCursor
    return conn

def release_db(conn):
    if db_pool and conn:
        db_pool.putconn(conn)


# ==========================================
# 2. MULTI-MODAL MODEL & ENGINE LOGIC
# ==========================================
class MultiModalSkinModel(nn.Module):
    def __init__(self, num_outputs=5):
        super().__init__()
        resnet = models.resnet18(weights=None)
        resnet.fc = nn.Identity()
        self.backbone = resnet
        self.fc = nn.Sequential(
            nn.Linear(512 + 8, 128),
            nn.ReLU(),
            nn.Linear(128, num_outputs)
        )

    def forward(self, img, tab):
        feats = self.backbone(img)
        fused = torch.cat([feats, tab], dim=1)
        return torch.relu(self.fc(fused))


def compute_actionable_mitigation(
    risk_level: str, 
    sun_exposure: str, 
    water_intake: float, 
    allergies: str, 
    sensitivities: str, 
    concerns: list
) -> List[Dict[str, str]]:
    actions = []
    
    if sun_exposure == "High":
        actions.append({
            "title": "UV Photoprotection Shield",
            "type": "Urgent",
            "detail": "Apply Broad-Spectrum Mineral Sunscreen (SPF 50+) every 2 hours. High UV index exacerbates photosensitivity and hyperpigmentation."
        })
    
    if water_intake < 2.0:
        actions.append({
            "title": "Epidermal Barrier Rehydration",
            "type": "Daily",
            "detail": "Increase hydration by at least +1.0L daily. Low fluid levels impair trans-epidermal moisture retention."
        })

    sens_lower = sensitivities.lower() if sensitivities else ""
    allerg_lower = allergies.lower() if allergies else ""

    if "retinol" in sens_lower or "retinoid" in sens_lower or "aha" in sens_lower:
        actions.append({
            "title": "Chemical Exfoliant / Retinoid Warning",
            "type": "Conflict Alert",
            "detail": "Active skin reactivity detected: Pause strong AHAs/BHAs or Retinoids for 48-72 hours to allow lipid barrier restoration."
        })

    if "fragrance" in allerg_lower or "essential oils" in allerg_lower:
        actions.append({
            "title": "Allergen Conflict Avoidance",
            "type": "Conflict Alert",
            "detail": "Known fragrance sensitivity logged. Exclude artificial scents and essential oils to avoid contact dermatitis."
        })

    for c in concerns:
        raw_sev = str(c.get('severity') or c.get('SEVERITY') or '0').split('/')[0]
        try:
            sev = float(raw_sev)
        except ValueError:
            sev = 0.0
        c_name = c.get('concern_name') or c.get('CONCERN_NAME') or ''
        
        if c_name in ["Acne", "Redness"] and sev >= 3.0:
            actions.append({
                "title": f"Active Flare Care: {c_name}",
                "type": "Treatment",
                "detail": "Incorporate soothing Centella Asiatica, 10% Azelaic Acid, or Niacinamide. Avoid abrasive facial scrubs."
            })
        elif c_name == "Hyperpigmentation" and sev >= 2.5:
            actions.append({
                "title": "Melanin Suppression Protocol",
                "type": "Treatment",
                "detail": "Introduce Tranexamic Acid or Alpha Arbutin daily to inhibit tyrosinase activity."
            })

    if not actions:
        actions.append({
            "title": "Maintenance Protocol",
            "type": "Preventative",
            "detail": "Maintain current gentle cleansing, ceramide hydration, and daily SPF protection routines."
        })
        
    return actions


class SkinAssessmentEngine:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = MultiModalSkinModel(num_outputs=5).to(self.device)
        
        model_path = "model.pth"
        if os.path.exists(model_path):
            try:
                checkpoint = torch.load(model_path, map_location=self.device)
                if isinstance(checkpoint, dict):
                    self.model.load_state_dict(checkpoint, strict=False)
            except Exception as e:
                print(f"⚠️ Model weights load skipped: {e}")
        self.model.eval()

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

    def query_treatments(self, age_group: str, skin_type: str, concern: str) -> List[Dict[str, Any]]:
        conn = get_db()
        if not conn:
            return []
        cursor = None
        try:
            cursor = conn.cursor()
            cursor.execute(
                """SELECT ingredients, concentrations, effects 
                   FROM skincare_treatments 
                   WHERE LOWER(concern) LIKE LOWER(%s) AND LOWER(skin_type) = LOWER(%s)
                   LIMIT 2;""",
                (f"%{concern}%", skin_type)
            )
            rows = cursor.fetchall() or []
            return [dict(r) for r in rows]
        except Exception as e:
            print(f"Treatment query error: {e}")
            return []
        finally:
            if cursor:
                cursor.close()
            release_db(conn)

    def generate_ai_clinical_notes(
        self, 
        health_score: int, 
        concerns: List[Dict[str, Any]], 
        form_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Synthesizes assessment metrics using Gemini with Fallback Strategy and Retry logic."""
        if not gemini_client:
            raise RuntimeError("Gemini Client is required for clinical synthesis.")

        prompt = f"""
        Synthesize a clinical skincare evaluation based on these patient assessment metrics:
        - Patient User ID: {form_data.get('user_id')}
        - Calculated Skin Health Score: {health_score}/100
        - Primary Active Concerns: {json.dumps([c['concern_name'] for c in concerns])}
        - Skin Type: {form_data.get('primary_skin_type', 'Combination')}
        - Water Intake: {form_data.get('water_intake', 2.0)} L/day
        - Sun Exposure: {form_data.get('sun_exposure', 'Moderate')}

        Utilize provided tool functions if patient historical sensitivities or specific database treatment lookups are required.
        Generate a concise diagnostic summary, key observations, and target lifestyle recommendations.
        """

        try:
            response = generate_content_with_fallback(
                client=gemini_client,
                contents=prompt,
                config=types.GenerateContentConfig(
                    tools=ASSESSMENT_TOOLS,
                    automatic_function_calling=types.AutomaticFunctionCallingConfig(
                        disable=False,
                        maximum_remote_calls=5,
                    ),
                    response_mime_type="application/json",
                    response_schema=AssessmentSynthesisOutput,
                    temperature=0.2,
                ),
                primary_model=PRIMARY_MODEL,
                fallback_model=FALLBACK_MODEL
            )
            
            # UPGRADE: Add strict safety check to handle AI filters returning None[cite: 29]
            if not response or not hasattr(response, 'text') or not response.text:
                print("⚠️ AI Safety Filter Triggered or Empty Response in Assessment. Falling back to dummy data.")
                return {
                    "diagnostic_summary": "Standard cosmetic assessment applied due to AI offline mode or safety filter intervention. Recommend manual review.",
                    "key_observations": ["Mild surface congestion detected", "Standard epidermal texture observed"],
                    "lifestyle_recommendations": ["Maintain consistent hydration", "Ensure adequate SPF protection daily"]
                }
                
            raw_text = response.text.strip()
            if raw_text.startswith("```"):
                raw_text = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_text, flags=re.MULTILINE)
            return json.loads(raw_text)
        except Exception as e:
            print(f"⚠️ Gemini clinical synthesis failed: {e}")
            raise RuntimeError(f"Gemini Synthesis Error: {str(e)}")

    def analyze(self, image: Image.Image, form_data: Dict[str, Any]) -> Dict[str, Any]:
        img_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        tab_vector = torch.tensor([[
            float(form_data.get('age', 25)),
            float(form_data.get('sleep', 7.0)),
            1.0 if form_data.get('is_sensitive', False) else 0.0,
            float(form_data.get('water_intake', 2.0)),
            float(form_data.get('stress_level', 5.0)),
            25.0, 7.5, 2.0
        ]], dtype=torch.float32).to(self.device)

        with torch.no_grad():
            raw_severities = self.model(img_tensor, tab_vector).cpu().numpy()[0]

        ml_map = {
            "Acne": raw_severities[0] if len(raw_severities) > 0 else 0.5,
            "Open Pores": raw_severities[1] if len(raw_severities) > 1 else 0.5,
            "Redness": raw_severities[2] if len(raw_severities) > 2 else 0.5,
            "Wrinkles": raw_severities[3] if len(raw_severities) > 3 else 0.5,
            "Dark Spots": raw_severities[4] if len(raw_severities) > 4 else 0.5,
        }

        selected = form_data.get('selected_concerns', [])
        sensitivities = form_data.get('sensitivities', '').lower()
        allergies = form_data.get('allergies', '')
        detected_concerns = []

        for name in CONCERNS_LIST:
            sev = float(ml_map.get(name, 0.0))

            if any(c.lower() in name.lower() or name.lower() in c.lower() for c in selected):
                sev = max(sev, 3.5)

            if name == "Dry Skin" and form_data.get('primary_skin_type') == "Dry":
                sev = max(sev, 3.5)
            elif name == "Oily Skin" and form_data.get('primary_skin_type') == "Oily":
                sev = max(sev, 3.5)
            elif name == "Sensitive Skin" and (form_data.get('is_sensitive') or "sensitive" in sensitivities):
                sev = max(sev, 3.5)

            if sev >= 0.5:
                treatments = self.query_treatments(
                    form_data.get('age_group', '25-36'),
                    form_data.get('primary_skin_type', 'Normal'),
                    name
                )
                detected_concerns.append({
                    "concern_name": name,
                    "severity": f"{sev:.1f}/5.0",
                    "priority": int(sev * 20),
                    "clinical_rationale": f"Visual marker density for {name} evaluated at {sev:.1f}/5.0.",
                    "treatments": treatments
                })

        detected_concerns = sorted(detected_concerns, key=lambda x: x['priority'], reverse=True)

        severities_arr = [float(c['severity'].split('/')[0]) for c in detected_concerns]
        avg_sev = float(np.mean(severities_arr)) if severities_arr else 0.0
        condition_score = max(20.0, 100.0 - (avg_sev * 12.0))
        
        water = form_data.get('water_intake', 2.0)
        sleep = form_data.get('sleep', 7.0)
        consistency = form_data.get('routine_consistency', 80.0)

        health_score = int(
            (condition_score * 0.35) +
            (consistency * 0.20) +
            (min(100.0, (sleep / 8.0) * 100.0) * 0.15) +
            (min(100.0, (water / 3.0) * 100.0) * 0.10) +
            (85.0 * 0.20)
        )
        health_score = max(1, min(100, health_score))

        risk_level = "Low"
        risk_notes = []
        sun = form_data.get('sun_exposure', 'Moderate')
        if sun == "High":
            risk_notes.append("High UV exposure increases risk of photoaging and hyperpigmentation.")
        if water < 1.5:
            risk_notes.append("Sub-optimal hydration impairs skin barrier restoration.")

        max_detected_sev = max(severities_arr) if severities_arr else 0.0
        if max_detected_sev >= 3.5 or len(detected_concerns) >= 4:
            risk_level = "High"
            risk_notes.append("DYNAMIC ESCALATION: High concern severity detected. Overall risk escalated to HIGH.")
        elif max_detected_sev >= 2.0 or sun == "High":
            risk_level = "Medium"
            risk_notes.append("Moderate concern severity detected.")
        else:
            risk_notes.append("Skin markers and lifestyle habits are within healthy baselines.")

        actions = compute_actionable_mitigation(
            risk_level=risk_level,
            sun_exposure=sun,
            water_intake=water,
            allergies=allergies,
            sensitivities=sensitivities,
            concerns=detected_concerns
        )

        ai_clinical_synthesis = self.generate_ai_clinical_notes(health_score, detected_concerns, form_data)

        return {
            "skin_health_score": health_score,
            "overall_condition": f"{len(detected_concerns)} active concerns identified. Dominant: {detected_concerns[0]['concern_name'] if detected_concerns else 'None'}",
            "notes": ai_clinical_synthesis.get("diagnostic_summary"),
            "ai_synthesis": ai_clinical_synthesis,
            "concerns": detected_concerns,
            "action_items": actions,
            "risk_factor": {
                "risk_name": "Photo-Aging & Barrier Risk" if sun == "High" else "Dermal Integrity Risk",
                "description": " ".join(risk_notes),
                "risk_level": risk_level
            }
        }

engine: Optional[SkinAssessmentEngine] = None

def init_engine():
    global engine
    init_db_pool()
    if engine is None:
        engine = SkinAssessmentEngine()

def close_engine():
    close_db_pool()

def decode_image_bytes(raw_bytes: Optional[bytes], b64_str: Optional[str]) -> Image.Image:
    try:
        if raw_bytes and len(raw_bytes) > 0:
            return Image.open(io.BytesIO(raw_bytes)).convert("RGB")
        if b64_str and len(b64_str.strip()) > 0:
            clean = re.sub(r"^data:image/.+;base64,", "", b64_str.strip())
            return Image.open(io.BytesIO(__import__('base64').b64decode(clean))).convert("RGB")
        return Image.new("RGB", (224, 224), color=(240, 220, 200))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Image decoding failed: {str(e)}")


# ==========================================
# 3. REST API ENDPOINTS
# ==========================================

@router.post("/assessment", status_code=status.HTTP_201_CREATED)
async def create_assessment(
    user_id: int = Form(1),
    email: Optional[str] = Form(None),
    age: int = Form(25),
    age_group: str = Form("25-36"),
    primary_skin_type: str = Form("Combination"),
    is_sensitive: bool = Form(False),
    water_intake: float = Form(2.5),
    sleep: float = Form(7.5),
    sun_exposure: str = Form("Moderate"),
    stress_level: float = Form(5.0),
    routine_consistency: float = Form(80.0),
    concerns_list: Optional[str] = Form(None),
    allergies: Optional[str] = Form(None),
    sensitivities: Optional[str] = Form(None),
    image_file: Optional[UploadFile] = File(None),
    webcam_base64: Optional[str] = Form(None)
):
    global engine
    if engine is None:
        init_engine()

    conn = get_db()
    cursor = None
    try:
        if not conn:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
                detail="Database connection unavailable."
            )

        selected_concerns = []
        if concerns_list:
            try:
                selected_concerns = json.loads(concerns_list)
            except Exception:
                selected_concerns = []

        raw_bytes = await image_file.read() if image_file and image_file.filename else None
        pil_img = await run_in_threadpool(decode_image_bytes, raw_bytes, webcam_base64)
        
        form_data = {
            "user_id": user_id, "age": age, "age_group": age_group,
            "primary_skin_type": primary_skin_type, "is_sensitive": is_sensitive,
            "water_intake": water_intake, "sleep": sleep, "sun_exposure": sun_exposure,
            "stress_level": stress_level, "routine_consistency": routine_consistency,
            "selected_concerns": selected_concerns,
            "allergies": allergies or "",
            "sensitivities": sensitivities or ""
        }

        analysis = await run_in_threadpool(engine.analyze, pil_img, form_data)
        cursor = conn.cursor()

        resolved_user_id = user_id
        if email:
            clean_email = email.strip().lower()
            cursor.execute("SELECT ID FROM USERS WHERE LOWER(EMAIL) = %s;", (clean_email,))
            urow = cursor.fetchone()
            if urow:
                resolved_user_id = urow.get('id') or urow.get('ID')

        cursor.execute(
            """
            INSERT INTO SKINASSESSMENT (USER_ID, SKIN_HEALTH_SCORE, OVERALL_CONDITION, NOTES)
            VALUES (%s, %s, %s, %s)
            RETURNING ID, ASSESSMENT_DATE, CREATED_AT;
            """,
            (resolved_user_id, analysis["skin_health_score"], analysis["overall_condition"], analysis["notes"])
        )
        assessment_row = cursor.fetchone()
        assessment_id = assessment_row.get('id') or assessment_row.get('ID')

        concerns_records = []
        for c in analysis["concerns"]:
            cursor.execute(
                """
                INSERT INTO SKINCONCERN (ASSESSMENT_ID, CONCERN_NAME, SEVERITY, PRIORITY)
                VALUES (%s, %s, %s, %s)
                RETURNING ID, CONCERN_NAME, SEVERITY, PRIORITY;
                """,
                (assessment_id, c["concern_name"], c["severity"], c["priority"])
            )
            concerns_records.append(cursor.fetchone())

        risk_data = analysis["risk_factor"]
        cursor.execute(
            """
            INSERT INTO RISKFACTOR (ASSESSMENT_ID, RISK_NAME, DESCRIPTION, RISK_LEVEL)
            VALUES (%s, %s, %s, %s)
            RETURNING ID, RISK_NAME, DESCRIPTION, RISK_LEVEL;
            """,
            (assessment_id, risk_data["risk_name"], risk_data["description"], risk_data["risk_level"])
        )
        risk_record = cursor.fetchone()

        conn.commit()

        assessment_date_val = assessment_row.get('assessment_date') or assessment_row.get('ASSESSMENT_DATE')

        return {
            "status": "success",
            "data": {
                "assessment": {
                    "id": assessment_id,
                    "user_id": resolved_user_id,
                    "skin_health_score": analysis["skin_health_score"],
                    "overall_condition": analysis["overall_condition"],
                    "notes": analysis["notes"],
                    "ai_synthesis": analysis["ai_synthesis"],
                    "assessment_date": str(assessment_date_val) if assessment_date_val else None
                },
                "concerns": concerns_records,
                "risk_factor": risk_record,
                "action_items": analysis["action_items"]
            }
        }
    except Exception as e:
        if conn and hasattr(conn, "rollback"):
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database or AI process failed: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        release_db(conn)


@router.get("/assessment/history", status_code=status.HTTP_200_OK)
async def get_assessment_history(user_id: Optional[int] = Query(None), email: Optional[str] = Query(None)):
    conn = get_db()
    cursor = None
    clean_email = email.strip().lower() if email else None

    try:
        if not conn:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE, 
                detail="Database connection unavailable."
            )
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT sa.* FROM SKINASSESSMENT sa
            LEFT JOIN USERS u ON sa.USER_ID = u.ID
            WHERE (%s::INT IS NULL OR sa.USER_ID = %s) AND (%s::TEXT IS NULL OR LOWER(u.EMAIL) = %s)
            ORDER BY sa.CREATED_AT DESC;
            """,
            (user_id, user_id, clean_email, clean_email)
        )
        assessments = cursor.fetchall() or []

        history = []
        for asm in assessments:
            aid = asm.get('id') or asm.get('ID')
            u_id = asm.get('user_id') or asm.get('USER_ID')

            cursor.execute("SELECT * FROM SKINCONCERN WHERE ASSESSMENT_ID = %s;", (aid,))
            concerns = cursor.fetchall() or []
            
            cursor.execute("SELECT * FROM RISKFACTOR WHERE ASSESSMENT_ID = %s;", (aid,))
            risk = cursor.fetchone()

            cursor.execute(
                """SELECT sp.ALLERGIES, sp.SENSITIVITIES, sp.WATER_INTAKE 
                   FROM SKIN_PROFILES sp WHERE sp.USER_ID = %s;""",
                (u_id,)
            )
            profile = cursor.fetchone() or {}

            water_val = profile.get('water_intake') if 'water_intake' in profile else profile.get('WATER_INTAKE')
            water_float = float(water_val) if water_val is not None else 2.5

            risk_lvl = risk.get('risk_level') if risk and ('risk_level' in risk) else (risk.get('RISK_LEVEL') if risk else 'Low')

            actions = compute_actionable_mitigation(
                risk_level=risk_lvl or 'Low',
                sun_exposure='Moderate',
                water_intake=water_float,
                allergies=profile.get('allergies') or profile.get('ALLERGIES') or '',
                sensitivities=profile.get('sensitivities') or profile.get('SENSITIVITIES') or '',
                concerns=concerns
            )

            history.append({
                "assessment": asm,
                "concerns": concerns,
                "risk_factor": risk or {},
                "action_items": actions
            })

        return {"status": "success", "count": len(history), "data": history}
    except Exception as e:
        if conn and hasattr(conn, "rollback"):
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        release_db(conn)


@router.delete("/assessment/{assessment_id}", status_code=status.HTTP_200_OK)
async def delete_assessment(assessment_id: int):
    conn = get_db()
    cursor = None
    
    if not conn:
        raise HTTPException(status_code=503, detail="Database connection unavailable.")
        
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM SKINCONCERN WHERE ASSESSMENT_ID = %s;", (assessment_id,))
        cursor.execute("DELETE FROM RISKFACTOR WHERE ASSESSMENT_ID = %s;", (assessment_id,))
        cursor.execute("DELETE FROM SKINASSESSMENT WHERE ID = %s;", (assessment_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Assessment not found.")
            
        conn.commit()
        return {"status": "success", "message": f"Assessment {assessment_id} deleted successfully."}
        
    except HTTPException:
        if conn:
            conn.rollback()
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor:
            cursor.close()
        release_db(conn)