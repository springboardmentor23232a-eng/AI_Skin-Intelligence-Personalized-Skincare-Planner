# scoring_engine.py
import os
import json
import random
import time
import requests
from typing import List, Tuple, Dict, Any, Optional
from pydantic import BaseModel
from google import genai
from google.genai import types

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
PRIMARY_MODEL = os.getenv("GEMINI_PRIMARY_MODEL", os.getenv("PRIMARY_MODEL", "gemini-3.6-flash"))
FALLBACK_MODEL = os.getenv("GEMINI_FALLBACK_MODEL", os.getenv("FALLBACK_MODEL", "gemini-3.5-flash-lite"))

try:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else genai.Client()
except Exception:
    gemini_client = None

class RawPillarMetrics(BaseModel):
    skin_condition: float
    lifestyle: float
    routine_consistency: float
    sleep_quality: float
    hydration: float

class SkinHealthOutput(BaseModel):
    overall_score: int
    improvement_delta: float
    focus_area: str
    breakdown: dict
    ai_insight: str
    actionable_takeaway: str
    predicted_next_week_score: int
    env_alert: str
    requires_intervention: bool

def fetch_environmental_alert(lat: float = 12.2958, lon: float = 76.6394) -> str:
    """Fetches free AQI and UV Index from Open-Meteo."""
    try:
        res = requests.get(f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&hourly=pm2_5,uv_index", timeout=3)
        data = res.json()
        uv = data["hourly"]["uv_index"][0]
        return "High UV Alert: SPF 50+ Required" if uv > 6 else "Optimal Environment"
    except Exception:
        return "Environment Data Unavailable"

def generate_forecast(score: int, focus: str, history: List[int]) -> Tuple[str, str, int]:
    # Updated active model routing hierarchy
    models_to_try = [
        PRIMARY_MODEL,
        FALLBACK_MODEL,
        "gemini-3.6-flash",
        "gemini-3.5-flash-lite",
        "gemini-3.1-pro-preview"
    ]
    models_to_try = list(dict.fromkeys([m for m in models_to_try if m]))
    
    default_diagnosis = f"Based on your diagnostic telemetry, your primary barrier vulnerability is {focus.lower()}."
    default_takeaway = f"Anchor your {focus.lower()} habits directly to an existing daily routine like brushing your teeth."

    if not gemini_client:
        return (default_diagnosis, default_takeaway, min(100, score + 2))
    
    prompt = f"""
    Act as a Board-Certified Dermatologist speaking to a patient.
    Current Score: {score}/100.
    Primary Vulnerability: {focus}.
    Recent Score History: {history}.

    Provide response in EXACT JSON format with these exact keys:
    {{
      "clinical_diagnosis": "1 to 2 sentences explaining the biological mechanism of why {focus} is causing issues without overwhelming jargon.",
      "actionable_takeaway": "1 concise, imperative sentence telling the patient exactly what to do today in plain English (e.g., 'Apply your treatment serum every night right after cleansing before moisturizer.').",
      "predicted_score": {min(100, score + 2)}
    }}
    """
    
    last_exception = None
    for current_model in models_to_try:
        for attempt in range(4):
            try:
                res = gemini_client.models.generate_content(
                    model=current_model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json", 
                        temperature=0.2,
                        max_output_tokens=300
                    )
                )
                raw_text = res.text.strip() if hasattr(res, 'text') and res.text else "{}"
                if raw_text.startswith("```"):
                    raw_text = raw_text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
                data = json.loads(raw_text)
                
                diagnosis = data.get("clinical_diagnosis", "").strip()
                takeaway = data.get("actionable_takeaway", "").strip()
                pred_score = int(data.get("predicted_score", min(100, score + 2)))
                
                if diagnosis and takeaway:
                    return (diagnosis, takeaway, pred_score)
            except Exception as e:
                last_exception = e
                err_msg = str(e).lower()
                is_rate_limit = "429" in err_msg or "resource_exhausted" in err_msg or "quota" in err_msg
                        
                if is_rate_limit:
                    if attempt < 3:
                        jitter = random.uniform(0.1, 0.5)
                        delay = (2 * (2 ** attempt)) + jitter
                        print(f"⚠️ Rate limit on {current_model}. Retrying in {delay:.2f}s... (Attempt {attempt + 1}/3)")
                        time.sleep(delay)
                    else:
                        print(f"⚠️ Model {current_model} quota exhausted. Switching fallback...")
                        time.sleep(1)
                        break
                else:
                    print(f"⚠️ Model {current_model} error: {e}. Switching fallback...")
                    break

    if last_exception:
        print(f"⚠️ All Gemini models exhausted. Using default diagnosis. Last error: {last_exception}")

    return (default_diagnosis, default_takeaway, min(100, score + 2))

def calculate_skin_health_score(metrics: RawPillarMetrics, historical_scores: List[int]) -> SkinHealthOutput:
    w_condition = round(metrics.skin_condition * 0.35, 2)
    w_lifestyle = round(metrics.lifestyle * 0.20, 2)
    w_consistency = round(metrics.routine_consistency * 0.20, 2)
    w_sleep = round(metrics.sleep_quality * 0.15, 2)
    w_hydration = round(metrics.hydration * 0.10, 2)

    total = int(round(w_condition + w_lifestyle + w_consistency + w_sleep + w_hydration))
    delta = round(float(total - historical_scores[0]), 2) if historical_scores else 0.0

    raw_pillars = {
        "Condition": metrics.skin_condition, 
        "Lifestyle": metrics.lifestyle, 
        "Consistency": metrics.routine_consistency, 
        "Sleep": metrics.sleep_quality, 
        "Hydration": metrics.hydration
    }
    focus_area = min(raw_pillars, key=raw_pillars.get)

    diagnosis, takeaway, pred_score = generate_forecast(total, focus_area, historical_scores)
    env_alert = fetch_environmental_alert()

    return SkinHealthOutput(
        overall_score=total, 
        improvement_delta=delta, 
        focus_area=focus_area,
        breakdown={
            "Condition": w_condition, 
            "Lifestyle": w_lifestyle, 
            "Consistency": w_consistency, 
            "Sleep": w_sleep, 
            "Hydration": w_hydration
        },
        ai_insight=diagnosis,
        actionable_takeaway=takeaway,
        predicted_next_week_score=pred_score, 
        env_alert=env_alert,
        requires_intervention=(total < 50)
    )