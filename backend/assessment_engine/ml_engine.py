import os
import io
import json
import pickle
import time
import random
import numpy as np
import pandas as pd
from PIL import Image
from typing import Dict, List, Any, Tuple, Optional
from pydantic import BaseModel, Field

import torch
import torch.nn as nn
from torchvision import transforms, models
from fastapi import APIRouter, HTTPException, status, File, UploadFile, Form

# ==============================================================================
# GOOGLE GENAI SDK INITIALIZATION (GOOGLE AI STUDIO MODE)
# ==============================================================================
from google import genai
from google.genai import types

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_PRIMARY_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_FALLBACK_MODEL = os.getenv("GEMINI_FALLBACK_MODEL", "")

try:
    if GEMINI_API_KEY:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    else:
        # Fallback to standard client initialization (auto-reads GEMINI_API_KEY from environment)
        gemini_client = genai.Client()
    print("🤖 Skin Assessment Engine: Google AI Studio Client initialized successfully!")
except Exception as e:
    gemini_client = None
    print(f"⚠️ Skin Assessment Engine: Google AI Studio Client failed to initialize ({e}).")


# --- RETRY & FALLBACK UTILITY FOR 429 RESOURCE_EXHAUSTED RATE LIMITS ---

def generate_content_with_retry_and_fallback(
    client: genai.Client,
    contents: Any,
    config: Optional[types.GenerateContentConfig] = None,
    primary_model: str = GEMINI_PRIMARY_MODEL,
    fallback_model: str = GEMINI_FALLBACK_MODEL,
    max_retries_per_model: int = 3,
    initial_delay: float = 2.0
):
    """
    Executes synchronous Gemini content generation with exponential backoff for 429 / RESOURCE_EXHAUSTED errors,
    falls back between supported Flash models when daily quota limits are reached, and enforces proactive delays.
    """
    models_to_try = [primary_model, fallback_model, "gemini-3.7-flash"]
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
                # Proactive delay to avoid hitting free-tier requests per minute (RPM) limits
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
                        print(f"⚠️ 429 Rate Limit hit on {current_model}. Retrying in {delay:.2f}s... (Attempt {attempt + 1}/{max_retries_per_model})")
                        time.sleep(delay)
                    else:
                        print(f"⚠️ Model {current_model} daily quota or rate limit exhausted. Switching to fallback model...")
                        time.sleep(4)
                        break
                else:
                    print(f"⚠️ Model {current_model} error: {e}. Switching to fallback model...")
                    break

    if last_exception:
        raise last_exception
    raise RuntimeError("All configured Gemini models failed due to rate limits or quota exhaustion.")


# ==========================================
# ROUTER & DATABASE CONNECTION POOL HELPERS
# ==========================================
router = APIRouter(prefix="/api/assessment", tags=["Skin Assessment Engine"])

def get_db():
    """Database connection getter placeholder for FastAPI dependency injection."""
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        db_url = os.environ.get("DATABASE_URL", "postgresql://user:password@localhost:5432/derma_ai")
        conn = psycopg2.connect(db_url, cursor_factory=RealDictCursor)
        return conn
    except Exception:
        return None

def release_db(conn):
    """Database connection release placeholder."""
    if conn:
        try:
            conn.close()
        except Exception:
            pass

def init_engine():
    """Lifecycle hook for engine startup."""
    pass

def close_engine():
    """Lifecycle hook for engine shutdown."""
    pass

# ==========================================
# GEMINI STRUCTURED OUTPUT SCHEMAS
# ==========================================
class AssessmentSynthesisOutput(BaseModel):
    diagnostic_summary: str = Field(description="Clinical diagnostic summary of observed concerns")
    key_observations: List[str] = Field(description="Key observations from visual and lifestyle multi-modal analysis")
    lifestyle_recommendations: List[str] = Field(description="Actionable lifestyle interventions based on metrics")


# ==========================================
# MULTI-MODAL MODEL DEFINITION
# ==========================================
SKIN_CSV = "Skincare Treatment Dataset.csv"
CONCERNS_LIST = ["Acne", "Open Pores", "Redness", "Wrinkles", "Dark Spots"]

class MultiModalSkinModel(nn.Module):
    def __init__(self, num_outputs=5):
        super().__init__()
        resnet = models.resnet18()
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


class SkinAssessmentEngine:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = MultiModalSkinModel(num_outputs=5).to(self.device)
        
        if os.path.exists("model.pth"):
            try:
                self.model.load_state_dict(
                    torch.load("model.pth", map_location=self.device, weights_only=True)
                )
            except Exception:
                try:
                    self.model.load_state_dict(
                        torch.load("model.pth", map_location=self.device, weights_only=False)
                    )
                except Exception:
                    pass
        self.model.eval()

        try:
            self.treatment_df = pd.read_csv(SKIN_CSV)
        except Exception:
            self.treatment_df = pd.DataFrame()

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

    def _safe_float(self, val: Any, default: float) -> float:
        """Safely parses string inputs or missing values into standard floats."""
        if val is None:
            return default
        try:
            val_str = str(val).strip().split()[0]
            return float(val_str)
        except (ValueError, TypeError, IndexError):
            return default

    def query_treatments(self, age_group: str, skin_type: str, concern: str) -> List[Dict[str, Any]]:
        """Queries Skincare Treatment Dataset for active ingredients and effects."""
        if self.treatment_df.empty:
            return [{"ingredients": "Salicylic Acid + Niacinamide", "effects": "Controls sebum and reduces inflammation"}]

        matched = self.treatment_df[
            (self.treatment_df['Age_Group'] == age_group) &
            (self.treatment_df['Skin_Type'] == skin_type) &
            (self.treatment_df['Concern'].str.contains(concern, case=False, na=False))
        ]
        if matched.empty:
            matched = self.treatment_df[self.treatment_df['Concern'].str.contains(concern, case=False, na=False)]

        results = []
        for _, row in matched.head(2).iterrows():
            results.append({
                "ingredients": row.get('Ingredients', ''),
                "concentrations": row.get('Concentrations', ''),
                "effects": row.get('Effects', '')
            })
        return results if results else [{"ingredients": "Salicylic Acid + Niacinamide", "effects": "Controls sebum and reduces inflammation"}]

    def synthesize_clinical_notes_with_ai(self, health_score: int, concerns: List[Dict[str, Any]], form_data: Dict[str, Any]) -> Dict[str, Any]:
        """Uses Google AI Studio Gemini to generate clinical assessment notes."""
        if not gemini_client:
            return {
                "diagnostic_summary": "Automated multi-modal analysis completed successfully.",
                "key_observations": ["Multi-modal computer vision and tabular metrics analyzed."],
                "lifestyle_recommendations": ["Maintain adequate daily hydration and sunscreen application."]
            }

        try:
            prompt = f"""
            Synthesize clinical assessment notes for a dermatology evaluation:
            - Calculated Skin Health Score: {health_score}/100
            - Detected Primary Concerns: {json.dumps([c['concern_name'] for c in concerns])}
            - Patient Skin Type: {form_data.get('primary_skin_type', 'Normal')}
            - Water Intake: {form_data.get('water_intake')} L/day
            - Sun Exposure: {form_data.get('sun_exposure')}
            - Stress Level: {form_data.get('stress_level')}/10
            """

            response = generate_content_with_retry_and_fallback(
                client=gemini_client,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=AssessmentSynthesisOutput,
                    temperature=0.2,
                ),
                primary_model=GEMINI_PRIMARY_MODEL,
                fallback_model=GEMINI_FALLBACK_MODEL
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"⚠️ Gemini synthesis failed: {e}")
            return {
                "diagnostic_summary": "Automated multi-modal analysis completed.",
                "key_observations": ["Inference performed using neural network backbone."],
                "lifestyle_recommendations": ["Follow structured daily care routine."]
            }

    def analyze(self, image: Image.Image, form_data: Dict[str, Any]) -> Dict[str, Any]:
        """Executes multi-modal inference and computes metrics matching SQL tables."""
        rgb_image = image.convert("RGB")
        img_tensor = self.transform(rgb_image).unsqueeze(0).to(self.device)
        
        age = self._safe_float(form_data.get('age'), 25.0)
        sleep = self._safe_float(form_data.get('sleep'), 7.0)
        is_sensitive = 1.0 if form_data.get('is_sensitive', False) in [True, "true", "True", 1, "1"] else 0.0
        water = self._safe_float(form_data.get('water_intake'), 2.0)
        stress = self._safe_float(form_data.get('stress_level'), 5.0)

        tab_vector = torch.tensor([[
            age, sleep, is_sensitive, water, stress, 25.0, 7.5, 2.0
        ]], dtype=torch.float32).to(self.device)

        with torch.no_grad():
            severities = self.model(img_tensor, tab_vector).cpu().numpy()[0]

        detected_concerns = []
        for idx, name in enumerate(CONCERNS_LIST):
            sev = float(severities[idx])
            if sev >= 1.0:
                treatments = self.query_treatments(
                    str(form_data.get('age_group', '25-36')),
                    str(form_data.get('primary_skin_type', 'Normal')),
                    name
                )
                detected_concerns.append({
                    "concern_name": name,
                    "severity": f"{sev:.1f}/5.0",
                    "priority": int(sev * 20),
                    "treatments": treatments
                })

        detected_concerns = sorted(detected_concerns, key=lambda x: x['priority'], reverse=True)

        avg_sev = float(np.mean(severities)) if len(severities) > 0 else 0.0
        condition_score = max(20.0, 100.0 - (avg_sev * 16.0))
        
        consistency = self._safe_float(form_data.get('routine_consistency'), 80.0)
        
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

        max_detected_sev = max([float(c['severity'].split('/')[0]) for c in detected_concerns]) if detected_concerns else 0.0

        if max_detected_sev >= 3.5 or len(detected_concerns) >= 3:
            risk_level = "High"
            risk_notes.append(f"DYNAMIC ESCALATION: High visual severity ({max_detected_sev}/5.0) detected. Overall risk escalated to HIGH.")
        elif max_detected_sev >= 2.0 or sun == "High":
            risk_level = "Medium"
            risk_notes.append(f"Moderate visual severity ({max_detected_sev}/5.0) detected.")
        else:
            risk_notes.append("Skin markers and lifestyle habits are within healthy baselines.")

        # Generate Gemini AI clinical synthesis
        ai_synthesis = self.synthesize_clinical_notes_with_ai(health_score, detected_concerns, form_data)

        return {
            "skin_health_score": health_score,
            "overall_condition": f"{len(detected_concerns)} active concerns identified. Dominant: {detected_concerns[0]['concern_name'] if detected_concerns else 'None'}",
            "notes": ai_synthesis.get("diagnostic_summary"),
            "ai_clinical_synthesis": ai_synthesis,
            "concerns": detected_concerns,
            "risk_factor": {
                "risk_name": "Photo-Aging & Barrier Risk" if sun == "High" else "Dermal Integrity Risk",
                "description": " ".join(risk_notes),
                "risk_level": risk_level
            }
        }

engine = SkinAssessmentEngine()

# ==========================================
# FASTAPI ROUTE ENDPOINTS
# ==========================================
@router.post("/analyze", status_code=status.HTTP_200_OK)
async def analyze_skin(
    file: UploadFile = File(...),
    age: Optional[float] = Form(25.0),
    sleep: Optional[float] = Form(7.0),
    water_intake: Optional[float] = Form(2.0),
    stress_level: Optional[float] = Form(5.0),
    is_sensitive: Optional[bool] = Form(False),
    primary_skin_type: Optional[str] = Form("Normal"),
    sun_exposure: Optional[str] = Form("Moderate")
):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        form_data = {
            "age": age,
            "sleep": sleep,
            "water_intake": water_intake,
            "stress_level": stress_level,
            "is_sensitive": is_sensitive,
            "primary_skin_type": primary_skin_type,
            "sun_exposure": sun_exposure
        }
        
        results = engine.analyze(image, form_data)
        return {"status": "success", "data": results}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Skin Assessment Engine execution failed: {str(e)}"
        )