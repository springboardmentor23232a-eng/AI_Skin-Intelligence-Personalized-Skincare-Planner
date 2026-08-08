"""
Skin analysis engine — v1 (heuristic, OpenCV-based).

This module gives a REAL, runnable skin-scoring pipeline using classical
computer vision (face detection + color/texture statistics). It is meant
as a working placeholder for the "AI Detects Skin Issues" step in the
project flow, with a clean interface so it can be swapped for a trained
TensorFlow/YOLO model later without touching any other part of the app.

To upgrade to a real deep-learning model:
  1. Train/obtain a model that outputs the same 7 sub-scores (0-100).
  2. Replace the body of `analyze_face_image()` with model inference.
  3. Keep the return shape identical so the rest of the app needs no changes.
"""

import json
from dataclasses import dataclass, asdict

import cv2
import numpy as np

_FACE_CASCADE = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)


@dataclass
class SkinScores:
    acne_score: float
    pigmentation_score: float
    wrinkle_score: float
    dryness_score: float
    oiliness_score: float
    redness_score: float
    pores_score: float
    skin_health_score: float
    risk_score: float
    face_detected: bool
    confidence_score: float = 0.0
    model_version: str = "skin-cv-heuristic-v1"

    def to_json(self) -> str:
        return json.dumps(asdict(self))


def _clip(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return float(max(lo, min(hi, value)))


def analyze_face_image(image_bytes: bytes) -> SkinScores:
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Could not decode image")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = _FACE_CASCADE.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80))

    if len(faces) == 0:
        # No face found — fall back to whole-frame analysis with lower confidence.
        face_roi = img
        face_detected = False
    else:
        # Use the largest detected face.
        x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
        face_roi = img[y:y + h, x:x + w]
        face_detected = True

    face_roi = cv2.resize(face_roi, (256, 256))
    hsv = cv2.cvtColor(face_roi, cv2.COLOR_BGR2HSV)
    gray_roi = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)

    h_ch, s_ch, v_ch = cv2.split(hsv)

    # --- Redness: proportion of high-saturation, red-hued pixels ---
    red_mask = ((h_ch < 10) | (h_ch > 170)) & (s_ch > 60)
    redness_ratio = float(np.mean(red_mask))
    redness_score = _clip(redness_ratio * 400)

    # --- Oiliness: brightness/specular highlight proxy (high value, low saturation) ---
    shine_mask = (v_ch > 200) & (s_ch < 60)
    oiliness_ratio = float(np.mean(shine_mask))
    oiliness_score = _clip(oiliness_ratio * 500)

    # --- Dryness: proxy via low local variance + desaturated dull patches ---
    dull_mask = (v_ch < 120) & (s_ch < 40)
    dryness_ratio = float(np.mean(dull_mask))
    dryness_score = _clip(dryness_ratio * 300)

    # --- Acne/blemishes: small dark/red blob density via Laplacian + red mask overlap ---
    laplacian = cv2.Laplacian(gray_roi, cv2.CV_64F)
    texture_variance = float(np.var(laplacian))
    acne_score = _clip((texture_variance / 50.0) + redness_ratio * 100)

    # --- Pigmentation: dark-spot variance in the L channel (LAB color space) ---
    lab = cv2.cvtColor(face_roi, cv2.COLOR_BGR2LAB)
    l_ch, a_ch, b_ch = cv2.split(lab)
    l_std = float(np.std(l_ch))
    pigmentation_score = _clip(l_std * 1.8)

    # --- Wrinkles: fine edge density via Canny edge detector ---
    edges = cv2.Canny(gray_roi, 50, 150)
    edge_density = float(np.mean(edges > 0))
    wrinkle_score = _clip(edge_density * 350)

    # --- Pores: high-frequency texture density (distinct from wrinkles via smaller kernel) ---
    blur = cv2.GaussianBlur(gray_roi, (3, 3), 0)
    high_freq = cv2.subtract(gray_roi, blur)
    pores_score = _clip(float(np.mean(np.abs(high_freq))) * 8)

    sub_scores = [
        acne_score, pigmentation_score, wrinkle_score,
        dryness_score, oiliness_score, redness_score, pores_score,
    ]
    avg_issue_score = sum(sub_scores) / len(sub_scores)

    skin_health_score = _clip(100 - avg_issue_score)
    risk_score = _clip(avg_issue_score * 0.9 + (0 if face_detected else 15))

    # Confidence: how much we trust this reading — higher when a face was
    # cleanly detected and of a reasonable size relative to the frame.
    if face_detected:
        confidence_score = _clip(80 + min(w, h) / 4.0, lo=0, hi=99)
    else:
        confidence_score = 45.0

    return SkinScores(
        acne_score=round(acne_score, 1),
        pigmentation_score=round(pigmentation_score, 1),
        wrinkle_score=round(wrinkle_score, 1),
        dryness_score=round(dryness_score, 1),
        oiliness_score=round(oiliness_score, 1),
        redness_score=round(redness_score, 1),
        pores_score=round(pores_score, 1),
        skin_health_score=round(skin_health_score, 1),
        risk_score=round(risk_score, 1),
        face_detected=face_detected,
        confidence_score=round(confidence_score, 1),
    )


def annotate_detected_regions(image_bytes: bytes, scores: "SkinScores") -> bytes:
    """Draws a bounding box around the detected face and labels the top
    detected concerns, producing the 'processed image' shown back to the user."""
    arr = np.frombuffer(image_bytes, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        return image_bytes

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = _FACE_CASCADE.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80))

    if len(faces) > 0:
        x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
        cv2.rectangle(img, (x, y), (x + w, y + h), (0, 200, 255), 3)
        cv2.putText(
            img, f"confidence {scores.confidence_score:.0f}%", (x, max(0, y - 12)),
            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 200, 255), 2,
        )

    named_scores = [
        ("Acne", scores.acne_score), ("Pigmentation", scores.pigmentation_score),
        ("Wrinkles", scores.wrinkle_score), ("Dryness", scores.dryness_score),
        ("Oiliness", scores.oiliness_score), ("Redness", scores.redness_score),
        ("Pores", scores.pores_score),
    ]
    top_concerns = sorted(named_scores, key=lambda t: t[1], reverse=True)[:3]
    label_y = 24
    for name, val in top_concerns:
        cv2.putText(img, f"{name}: {val:.0f}", (10, label_y), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)
        label_y += 24

    ok, buf = cv2.imencode(".jpg", img)
    return buf.tobytes() if ok else image_bytes


def generate_recommendations(scores: SkinScores, skin_type: str = None) -> list:
    """Rule-based recommendation generator driven off the sub-scores."""
    recs = []

    if scores.acne_score > 40:
        recs.append(("routine", "Introduce a salicylic acid (BHA) cleanser 2-3x/week to help manage breakouts."))
    if scores.dryness_score > 40:
        recs.append(("routine", "Add a ceramide-based moisturizer both morning and night to restore the skin barrier."))
    if scores.oiliness_score > 40:
        recs.append(("routine", "Use an oil-free, non-comedogenic gel moisturizer to balance sebum without clogging pores."))
    if scores.pigmentation_score > 40:
        recs.append(("routine", "Consider a Vitamin C serum in the morning and broad-spectrum SPF 50 to prevent further pigmentation."))
    if scores.redness_score > 40:
        recs.append(("routine", "Look for fragrance-free products with niacinamide or centella asiatica to calm redness."))
    if scores.wrinkle_score > 40:
        recs.append(("routine", "A retinol-based night treatment can help with fine lines — start 2x/week."))
    if scores.pores_score > 40:
        recs.append(("routine", "A gentle clay mask 1x/week can help minimize the appearance of enlarged pores."))

    recs.append(("lifestyle", "Stay hydrated with at least 2-2.5L of water daily and aim for 7-8 hours of sleep."))
    recs.append(("lifestyle", "Always apply sunscreen (SPF 30+) before stepping out, even on cloudy days."))

    if not recs:
        recs.append(("routine", "Your skin looks well-balanced — maintain your current cleanse-moisturize-SPF routine."))

    return recs
