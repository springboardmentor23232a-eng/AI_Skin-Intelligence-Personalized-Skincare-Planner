"""
Core inference logic: loads the trained demo model, runs a real forward
pass on a real image, and returns a structured result shaped to match
what the Node backend / frontend expect (skin type, concerns, health
score). Also usable as a CLI tool.

IMPORTANT: This is an AI-assisted informational estimate, not a medical
diagnosis. Every result carries a disclaimer field for exactly this
reason — see ml/README.md and the app's user-facing copy.
"""

import argparse
import json
import sys
from pathlib import Path

import numpy as np
import joblib

ML_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ML_DIR))

from preprocessing.preprocess import (  # noqa: E402
    load_image,
    extract_features,
    validate_image_file,
    InvalidImageError,
)

MODEL_PATH = ML_DIR / "models" / "demo_model.joblib"

DISCLAIMER = "AI-assisted informational estimate — not a medical diagnosis."

# Concern-detection heuristics derived from the same feature space the
# classifier uses (color histogram + LBP texture). This is a documented,
# deterministic rule layer for the demo track, standing in for the
# multi-label CNN head the production track (train_cnn.py) would train on
# real concern-labeled data. Thresholds were tuned against the synthetic
# sample set's known profiles (see generate_sample_dataset.py) and should
# be re-tuned against a real dataset before any production use.
CONCERN_RULES = [
    {
        "name": "Acne",
        "category": "Cleanser",
        "condition": lambda f: f["texture_variance"] > 0.028,
        "severity": "Moderate",
        "priority": 1,
        "advice": "Consider a salicylic acid (BHA) cleanser to help manage breakouts.",
    },
    {
        "name": "Dryness / Flaking",
        "category": "Moisturizer",
        "condition": lambda f: f["texture_variance"] > 0.030 and f["brightness"] > 0.72,
        "severity": "Mild",
        "priority": 2,
        "advice": "A ceramide-based moisturizer can help rebuild the skin barrier.",
    },
    {
        "name": "Oiliness / Excess Sebum",
        "category": "Moisturizer",
        "condition": lambda f: f["highlight_ratio"] > 0.10,
        "severity": "Moderate",
        "priority": 1,
        "advice": "An oil-free, lightweight gel moisturizer can help balance shine.",
    },
    {
        "name": "Redness / Irritation",
        "category": "Treatment",
        "condition": lambda f: f["red_dominance"] > 0.36,
        "severity": "Mild",
        "priority": 2,
        "advice": "A centella asiatica or niacinamide product may help calm irritation.",
    },
    {
        "name": "Uneven Skin Tone",
        "category": "Exfoliant",
        "condition": lambda f: f["color_variance"] > 0.020,
        "severity": "Low",
        "priority": 3,
        "advice": "Gentle weekly AHA exfoliation can help even out texture and tone.",
    },
    {
        "name": "Enlarged Pores",
        "category": "Serum",
        "condition": lambda f: f["texture_variance"] > 0.026 and f["highlight_ratio"] > 0.06,
        "severity": "Low",
        "priority": 3,
        "advice": "A niacinamide serum can help visibly refine pore appearance.",
    },
]


def _load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"No trained model found at {MODEL_PATH}. Run `python training/train_demo.py` first."
        )
    return joblib.load(MODEL_PATH)


def _derive_signal_features(img):
    """Interpretable summary stats (separate from the classifier's raw
    feature vector) used purely by the concern-detection rule layer."""
    arr = np.asarray(img, dtype=np.float32) / 255.0
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    brightness = float(arr.mean())
    color_variance = float(arr.var())
    red_dominance = float((r.mean()) / (r.mean() + g.mean() + b.mean() + 1e-6))
    highlight_ratio = float((arr.mean(axis=2) > 0.85).mean())
    gray = arr.mean(axis=2)
    gx = np.abs(np.diff(gray, axis=1))
    gy = np.abs(np.diff(gray, axis=0))
    texture_variance = float(np.concatenate([gx.ravel(), gy.ravel()]).var())
    return {
        "brightness": brightness,
        "color_variance": color_variance,
        "red_dominance": red_dominance,
        "highlight_ratio": highlight_ratio,
        "texture_variance": texture_variance,
    }


def _detect_concerns(signal_features):
    concerns = []
    for rule in CONCERN_RULES:
        if rule["condition"](signal_features):
            concerns.append({
                "name": rule["name"],
                "category": rule["category"],
                "severity": rule["severity"],
                "priority": rule["priority"],
                "advice": rule["advice"],
            })
    concerns.sort(key=lambda c: c["priority"])
    return concerns[:4]


def _health_score(concerns):
    score = 100
    for c in concerns:
        score -= {"Moderate": 8, "Mild": 5, "Low": 3}.get(c["severity"], 4)
    return max(35, min(98, score))


def _overall_condition(score):
    if score >= 85:
        return "Excellent"
    if score >= 70:
        return "Good"
    if score >= 55:
        return "Fair"
    return "Needs Attention"


def predict_from_path(image_path, model_bundle=None):
    validate_image_file(image_path, filename=image_path)
    img = load_image(image_path)
    return _predict_from_image(img, model_bundle)


def predict_from_bytes(file_bytes, filename, model_bundle=None):
    import io
    buf = io.BytesIO(file_bytes)
    validate_image_file(buf, filename=filename)
    buf.seek(0)
    img = load_image(buf)
    return _predict_from_image(img, model_bundle)


def _predict_from_image(img, model_bundle=None):
    bundle = model_bundle or _load_model()
    clf, encoder = bundle["classifier"], bundle["label_encoder"]

    features = extract_features(img).reshape(1, -1)
    proba = clf.predict_proba(features)[0]
    top_idx = int(np.argmax(proba))
    skin_type = str(encoder.inverse_transform([top_idx])[0]).capitalize()
    confidence = float(proba[top_idx])

    signal_features = _derive_signal_features(img)
    concerns = _detect_concerns(signal_features)
    score = _health_score(concerns)

    return {
        "skin_type": skin_type,
        "skin_type_confidence": round(confidence, 3),
        "concerns": concerns,
        "skin_health_score": score,
        "overall_condition": _overall_condition(score),
        "model": "demo-rf-v1",
        "disclaimer": DISCLAIMER,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run skin analysis inference on a single image.")
    parser.add_argument("--image", required=True, help="Path to a JPG/PNG image")
    args = parser.parse_args()

    try:
        result = predict_from_path(args.image)
    except (InvalidImageError, FileNotFoundError) as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

    print(json.dumps(result, indent=2))
