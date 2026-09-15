import os
import io
import json
import time
import random
import numpy as np
import pandas as pd
from PIL import Image
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field

import onnxruntime as ort # Imported ONNX Runtime
from fastapi import APIRouter, HTTPException, status, File, UploadFile, Form
from google import genai
from google.genai import types

# ==============================================================================
# GOOGLE GENAI SDK INITIALIZATION 
# ==============================================================================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_PRIMARY_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
GEMINI_FALLBACK_MODEL = os.getenv("GEMINI_FALLBACK_MODEL", "gemini-3.5-flash-lite")

try:
    if GEMINI_API_KEY:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    else:
        gemini_client = genai.Client()
    print("🤖 Skin Assessment Engine: Google AI Client initialized successfully!")
except Exception as e:
    gemini_client = None
    print(f"⚠️ Skin Assessment Engine: Google AI Client failed to initialize ({e}).")

def generate_content_with_retry_and_fallback(
    client: genai.Client, contents: Any, config: Optional[types.GenerateContentConfig] = None,
    primary_model: str = GEMINI_PRIMARY_MODEL, fallback_model: str = GEMINI_FALLBACK_MODEL,
    max_retries_per_model: int = 3, initial_delay: float = 2.0
):
    models_to_try = list(dict.fromkeys([primary_model, fallback_model, "gemini-3.7-flash"]))
    last_exception = None

    for current_model in models_to_try:
        for attempt in range(max_retries_per_model + 1):
            try:
                return client.models.generate_content(model=current_model, contents=contents, config=config)
            except Exception as e:
                last_exception = e
                err_msg = str(e).lower()
                if "429" in err_msg or "resource_exhausted" in err_msg or "quota" in err_msg:
                    if attempt < max_retries_per_model:
                        time.sleep((initial_delay * (2 ** attempt)) + random.uniform(0.1, 0.5))
                    else:
                        time.sleep(4)
                        break
                else:
                    break
    raise last_exception or RuntimeError("All models failed.")

router = APIRouter(prefix="/api/assessment", tags=["Skin Assessment Engine"])
DATABASE_URL = os.getenv("DATABASE_URL")

def get_db():
    try:
        import psycopg2
        from psycopg2.extras import RealDictCursor
        return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    except Exception:
        return None

def release_db(conn):
    if conn:
        try: conn.close()
        except Exception: pass

class AssessmentSynthesisOutput(BaseModel):
    diagnostic_summary: str = Field(description="Clinical diagnostic summary of observed concerns")
    key_observations: List[str] = Field(description="Key observations from visual and lifestyle multi-modal analysis")
    lifestyle_recommendations: List[str] = Field(description="Actionable lifestyle interventions based on metrics")

# ==========================================
# ONNX MULTI-MODAL MODEL DEFINITION
# ==========================================
SKIN_CSV = "Skincare Treatment Dataset.csv"
CONCERNS_LIST = ["Acne", "Open Pores", "Redness", "Wrinkles", "Dark Spots"]

class SkinAssessmentEngine:
    def __init__(self):
        # Load the ONNX model instead of PyTorch
        self.session = ort.InferenceSession("model.onnx")
        
        try: self.treatment_df = pd.read_csv(SKIN_CSV)
        except Exception: self.treatment_df = pd.DataFrame()

    def _safe_float(self, val: Any, default: float) -> float:
        if val is None: return default
        try: return float(str(val).strip().split()[0])
        except (ValueError, TypeError, IndexError): return default

    def preprocess_image(self, image: Image.Image) -> np.ndarray:
        # Replaced torchvision transforms with pure NumPy logic
        img = image.convert("RGB").resize((224, 224))
        img_data = np.array(img).astype(np.float32) / 255.0
        img_data = (img_data - np.array([0.485, 0.456, 0.406])) / np.array([0.229, 0.224, 0.225])
        img_data = np.transpose(img_data, (2, 0, 1))
        return np.expand_dims(img_data, axis=0)

    def query_treatments(self, age_group: str, skin_type: str, concern: str) -> List[Dict[str, Any]]:
        if self.treatment_df.empty:
            return [{"ingredients": "Salicylic Acid + Niacinamide", "effects": "Controls sebum and reduces inflammation"}]
        matched = self.treatment_df[
            (self.treatment_df['Age_Group'] == age_group) &
            (self.treatment_df['Skin_Type'] == skin_type) &
            (self.treatment_df['Concern'].str.contains(concern, case=False, na=False))
        ]
        if matched.empty:
            matched = self.treatment_df[self.treatment_df['Concern'].str.contains(concern, case=False, na=False)]
        return [{"ingredients": row.get('Ingredients', ''), "concentrations": row.get('Concentrations', ''), "effects": row.get('Effects', '')} for _, row in matched.head(2).iterrows()] or [{"ingredients": "Salicylic Acid + Niacinamide", "effects": "Controls sebum and reduces inflammation"}]

    def synthesize_clinical_notes_with_ai(self, health_score: int, concerns: List[Dict[str, Any]], form_data: Dict[str, Any]) -> Dict[str, Any]:
        if not gemini_client:
            return {"diagnostic_summary": "Automated multi-modal analysis completed successfully.", "key_observations": ["Multi-modal metrics analyzed."], "lifestyle_recommendations": ["Maintain adequate daily hydration and sunscreen application."]}
        try:
            prompt = f"Synthesize clinical assessment notes: Score: {health_score}/100, Concerns: {json.dumps([c['concern_name'] for c in concerns])}, Type: {form_data.get('primary_skin_type', 'Normal')}, Water: {form_data.get('water_intake')} L/day, Sun: {form_data.get('sun_exposure')}, Stress: {form_data.get('stress_level')}/10"
            response = generate_content_with_retry_and_fallback(
                client=gemini_client, contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json", response_schema=AssessmentSynthesisOutput, temperature=0.2, max_output_tokens=250)
            )
            return json.loads(response.text)
        except Exception:
            return {"diagnostic_summary": "Automated multi-modal analysis completed.", "key_observations": ["Inference performed using neural network backbone."], "lifestyle_recommendations": ["Follow structured daily care routine."]}

    def analyze(self, image: Image.Image, form_data: Dict[str, Any]) -> Dict[str, Any]:
        img_array = self.preprocess_image(image)
        tab_array = np.array([[
            self._safe_float(form_data.get('age'), 25.0),
            self._safe_float(form_data.get('sleep'), 7.0),
            1.0 if form_data.get('is_sensitive', False) in [True, "true", "True", 1, "1"] else 0.0,
            self._safe_float(form_data.get('water_intake'), 2.0),
            self._safe_float(form_data.get('stress_level'), 5.0),
            25.0, 7.5, 2.0
        ]], dtype=np.float32)

        # Run inference using ONNX Runtime
        outputs = self.session.run(None, {'img': img_array, 'tab': tab_array})
        severities = outputs[0][0]

        detected_concerns = []
        for idx, name in enumerate(CONCERNS_LIST):
            sev = float(severities[idx])
            if sev >= 1.0:
                detected_concerns.append({
                    "concern_name": name, "severity": f"{sev:.1f}/5.0", "priority": int(sev * 20),
                    "treatments": self.query_treatments(str(form_data.get('age_group', '25-36')), str(form_data.get('primary_skin_type', 'Normal')), name)
                })

        detected_concerns = sorted(detected_concerns, key=lambda x: x['priority'], reverse=True)
        avg_sev = float(np.mean(severities)) if len(severities) > 0 else 0.0
        health_score = max(1, min(100, int((max(20.0, 100.0 - (avg_sev * 16.0)) * 0.35) + (self._safe_float(form_data.get('routine_consistency'), 80.0) * 0.20) + (min(100.0, (self._safe_float(form_data.get('sleep'), 7.0) / 8.0) * 100.0) * 0.15) + (min(100.0, (self._safe_float(form_data.get('water_intake'), 2.0) / 3.0) * 100.0) * 0.10) + (85.0 * 0.20))))

        risk_level, risk_notes, sun = "Low", [], form_data.get('sun_exposure', 'Moderate')
        if sun == "High": risk_notes.append("High UV exposure increases risk of photoaging and hyperpigmentation.")
        if self._safe_float(form_data.get('water_intake'), 2.0) < 1.5: risk_notes.append("Sub-optimal hydration impairs skin barrier restoration.")

        max_detected_sev = max([float(c['severity'].split('/')[0]) for c in detected_concerns]) if detected_concerns else 0.0
        if max_detected_sev >= 3.5 or len(detected_concerns) >= 3:
            risk_level = "High"
            risk_notes.append(f"DYNAMIC ESCALATION: High visual severity ({max_detected_sev}/5.0) detected. Overall risk escalated to HIGH.")
        elif max_detected_sev >= 2.0 or sun == "High":
            risk_level, risk_notes = "Medium", risk_notes + [f"Moderate visual severity ({max_detected_sev}/5.0) detected."]
        else:
            risk_notes.append("Skin markers and lifestyle habits are within healthy baselines.")

        ai_synthesis = self.synthesize_clinical_notes_with_ai(health_score, detected_concerns, form_data)
        return {
            "skin_health_score": health_score,
            "overall_condition": f"{len(detected_concerns)} active concerns identified. Dominant: {detected_concerns[0]['concern_name'] if detected_concerns else 'None'}",
            "notes": ai_synthesis.get("diagnostic_summary"), "ai_clinical_synthesis": ai_synthesis, "concerns": detected_concerns,
            "risk_factor": {"risk_name": "Photo-Aging & Barrier Risk" if sun == "High" else "Dermal Integrity Risk", "description": " ".join(risk_notes), "risk_level": risk_level}
        }

engine = SkinAssessmentEngine()

@router.post("/analyze", status_code=status.HTTP_200_OK)
async def analyze_skin(file: UploadFile = File(...), age: Optional[float] = Form(25.0), sleep: Optional[float] = Form(7.0), water_intake: Optional[float] = Form(2.0), stress_level: Optional[float] = Form(5.0), is_sensitive: Optional[bool] = Form(False), primary_skin_type: Optional[str] = Form("Normal"), sun_exposure: Optional[str] = Form("Moderate")):
    try:
        results = engine.analyze(Image.open(io.BytesIO(await file.read())), {"age": age, "sleep": sleep, "water_intake": water_intake, "stress_level": stress_level, "is_sensitive": is_sensitive, "primary_skin_type": primary_skin_type, "sun_exposure": sun_exposure})
        return {"status": "success", "data": results}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Skin Assessment Engine execution failed: {str(e)}")