"""
GlowSense AI - ML Service (FastAPI)
====================================
This service provides AI/ML-based skin health assessment predictions.

Architecture:
  Node.js Backend -> Python FastAPI ML Service -> scikit-learn Model -> Prediction

The service supports:
  - RandomForestClassifier / RandomForestRegressor
  - ColumnTransformer / OneHotEncoder
  - Pipeline
  - pandas / numpy
  - pickle / joblib model loading

If trained model files are not available, the service runs in DEVELOPMENT MODE
using a rule-based heuristic assessment. This is clearly marked in the response.
"""

import os
import json
import pickle
import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="GlowSense AI ML Service", version="1.0.0")

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
MODEL_PATH = os.path.join(MODEL_DIR, "skin_model.pkl")
PIPELINE_PATH = os.path.join(MODEL_DIR, "pipeline.pkl")

# Try to load trained model
model = None
pipeline = None
try:
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)
    if os.path.exists(PIPELINE_PATH):
        with open(PIPELINE_PATH, "rb") as f:
            pipeline = pickle.load(f)
except Exception as e:
    print(f"Warning: Could not load model files: {e}")
    print("Running in DEVELOPMENT MODE (heuristic-based assessment).")

MODEL_AVAILABLE = model is not None and pipeline is not None


# ==================== REQUEST/RESPONSE MODELS ====================

class AssessmentData(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    skin_type: Optional[str] = None
    skin_sensitivity: Optional[str] = None
    oiliness: Optional[int] = 3
    dryness: Optional[int] = 3
    acne_frequency: Optional[int] = 3
    pigmentation: Optional[int] = 3
    dark_spots: Optional[int] = 3
    redness: Optional[int] = 3
    uneven_tone: Optional[int] = 3
    fine_lines: Optional[int] = 3
    visible_pores: Optional[int] = 3
    water_intake: Optional[str] = None
    sleep_duration: Optional[str] = None
    stress_level: Optional[str] = None
    exercise_frequency: Optional[str] = None
    smoking: Optional[str] = None
    alcohol: Optional[str] = None
    cleanser_usage: Optional[str] = None
    moisturizer_usage: Optional[str] = None
    sunscreen_usage: Optional[str] = None
    skincare_routine: Optional[str] = None
    sun_exposure: Optional[str] = None
    pollution_exposure: Optional[str] = None
    climate: Optional[str] = None


class ImageData(BaseModel):
    image: Optional[str] = None


# ==================== HEALTH CHECK ====================

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "model_loaded": MODEL_AVAILABLE,
        "mode": "production" if MODEL_AVAILABLE else "development",
    }


# ==================== ASSESS ENDPOINT (FORM DATA) ====================

@app.post("/assess")
def assess(data: AssessmentData):
    if MODEL_AVAILABLE:
        return predict_with_model(data)
    return heuristic_assessment(data)


# ==================== PREDICT ENDPOINT (IMAGE DATA) ====================

@app.post("/predict")
def predict(data: ImageData):
    if MODEL_AVAILABLE:
        return predict_image_with_model(data)
    return heuristic_image_assessment(data)


# ==================== MODEL-BASED PREDICTION ====================

def predict_with_model(data: AssessmentData) -> Dict[str, Any]:
    """Use trained scikit-learn model for prediction."""
    try:
        df = pd.DataFrame([data.dict()])
        if pipeline:
            features = pipeline.transform(df)
        else:
            features = df

        score = model.predict(features)[0]
        skin_type = "Combination"
        risk_level = "Low" if score >= 75 else "Moderate" if score >= 50 else "High"

        return {
            "skin_health_score": int(score),
            "skin_type": skin_type,
            "concerns": [],
            "risk_level": risk_level,
            "risk_factors": [],
            "recommendations": [],
            "_source": "trained_model",
        }
    except Exception as e:
        print(f"Model prediction error: {e}")
        return heuristic_assessment(data)


def predict_image_with_model(data: ImageData) -> Dict[str, Any]:
    """Use trained CV model for image prediction (placeholder for future integration)."""
    return heuristic_image_assessment(data)


# ==================== HEURISTIC ASSESSMENT (DEVELOPMENT MODE) ====================

def heuristic_assessment(data: AssessmentData) -> Dict[str, Any]:
    """Rule-based assessment when trained model is not available."""
    score = 75
    concerns = []
    risk_factors = []
    recommendations = []

    skin_type = data.skin_type or "Combination"

    oiliness = data.oiliness or 3
    dryness = data.dryness or 3
    acne = data.acne_frequency or 3
    pigmentation = data.pigmentation or 3
    redness = data.redness or 3
    fine_lines = data.fine_lines or 3
    pores = data.visible_pores or 3

    if acne >= 4:
        score -= 8
        concerns.append({"concern_name": "Acne", "severity": "High" if acne >= 5 else "Moderate", "priority": "high", "explanation": "Your assessment indicates frequent acne breakouts."})
    if dryness >= 4:
        score -= 5
        concerns.append({"concern_name": "Dryness", "severity": "High" if dryness >= 5 else "Moderate", "priority": "medium", "explanation": "Your skin shows signs of dryness."})
    if oiliness >= 4:
        score -= 4
        concerns.append({"concern_name": "Oiliness", "severity": "Moderate", "priority": "medium", "explanation": "Excess oil production detected."})
    if pigmentation >= 4:
        score -= 5
        concerns.append({"concern_name": "Pigmentation", "severity": "High" if pigmentation >= 5 else "Moderate", "priority": "medium", "explanation": "Signs of uneven pigmentation detected."})
    if redness >= 4:
        score -= 4
        concerns.append({"concern_name": "Sensitivity", "severity": "Moderate", "priority": "medium", "explanation": "Skin shows signs of redness or sensitivity."})
    if fine_lines >= 4:
        score -= 3
        concerns.append({"concern_name": "Fine Lines", "severity": "Low", "priority": "low", "explanation": "Early signs of fine lines noted."})
    if pores >= 4:
        score -= 2
        concerns.append({"concern_name": "Visible Pores", "severity": "Low", "priority": "low", "explanation": "Enlarged pore visibility detected."})

    water = data.water_intake or ""
    if "0" in water or "1" in water or "2" in water:
        score -= 5
        risk_factors.append({"risk_name": "Low Hydration", "severity": "High", "explanation": "Insufficient water intake.", "preventive_action": "Drink at least 8 glasses of water daily."})
    sleep = data.sleep_duration or ""
    if "less" in sleep or "3" in sleep or "4" in sleep or "5" in sleep:
        score -= 6
        risk_factors.append({"risk_name": "Poor Sleep", "severity": "High", "explanation": "Inadequate sleep impacts skin regeneration.", "preventive_action": "Aim for 7-9 hours of sleep per night."})
    if data.stress_level in ("High", "Very High"):
        score -= 4
        risk_factors.append({"risk_name": "High Stress", "severity": "Moderate", "explanation": "High stress can trigger skin issues.", "preventive_action": "Practice stress management techniques."})
    if data.smoking in ("Yes", "Regularly"):
        score -= 8
        risk_factors.append({"risk_name": "Smoking", "severity": "High", "explanation": "Smoking accelerates skin aging.", "preventive_action": "Consider a smoking cessation program."})
    if data.sun_exposure in ("High", "Very High"):
        score -= 6
        risk_factors.append({"risk_name": "Sun Exposure", "severity": "High", "explanation": "Excessive sun exposure increases damage risk.", "preventive_action": "Apply SPF 30+ sunscreen daily."})
    if data.sunscreen_usage in ("Never", "Rarely"):
        score -= 5
        risk_factors.append({"risk_name": "No Sun Protection", "severity": "High", "explanation": "Lack of sunscreen increases UV damage risk.", "preventive_action": "Use broad-spectrum SPF 30+ daily."})

    score = max(20, min(100, score))
    risk_level = "Low" if score >= 75 else "Moderate" if score >= 50 else "High"

    recommendations.append({"category": "Morning Routine", "recommendation_text": "Cleanse with a gentle face wash, apply vitamin C serum, and finish with broad-spectrum SPF 30+ sunscreen."})
    recommendations.append({"category": "Evening Routine", "recommendation_text": "Remove makeup, cleanse thoroughly, apply night cream or retinol serum."})
    recommendations.append({"category": "Sun Protection", "recommendation_text": "Reapply sunscreen every 2 hours outdoors. Avoid peak sun hours (10am-4pm)."})
    recommendations.append({"category": "Hydration", "recommendation_text": "Drink at least 8 glasses of water daily."})
    recommendations.append({"category": "Lifestyle", "recommendation_text": "Aim for 7-9 hours of sleep. Manage stress with exercise or meditation."})

    return {
        "skin_health_score": score,
        "skin_type": skin_type,
        "concerns": concerns,
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "recommendations": recommendations,
        "_source": "heuristic_development_mode",
    }


def heuristic_image_assessment(data: ImageData) -> Dict[str, Any]:
    """Placeholder for CV model. Returns a clearly-marked development response."""
    return {
        "skin_health_score": 72,
        "skin_type": "Combination",
        "concerns": [
            {"concern_name": "Acne", "severity": "Moderate", "priority": "high", "explanation": "Image analysis indicates possible acne-related concerns in the T-zone area."},
            {"concern_name": "Dryness", "severity": "Low", "priority": "medium", "explanation": "Mild dryness detected around cheek areas."},
        ],
        "risk_level": "Moderate",
        "risk_factors": [
            {"risk_name": "Sun Exposure", "severity": "Moderate", "explanation": "Signs of sun damage detected.", "preventive_action": "Apply SPF 30+ sunscreen daily."},
        ],
        "recommendations": [
            {"category": "Morning Routine", "recommendation_text": "Cleanse gently, apply antioxidant serum, and use SPF 30+ sunscreen."},
            {"category": "Evening Routine", "recommendation_text": "Double cleanse, apply retinol or niacinamide serum, and moisturize."},
        ],
        "_source": "heuristic_development_mode_image",
    }


# ==================== STARTUP ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
