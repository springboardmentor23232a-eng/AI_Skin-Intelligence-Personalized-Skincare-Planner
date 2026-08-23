"""
Image feature extraction for skin analysis.
Uses OpenCV to derive simple, explainable features from a face/skin patch image:
- brightness, redness ratio, texture variance (roughness proxy), oil-sheen proxy
  (specular highlight ratio), pore/texture density (edge density).
These features feed both the rule-based assessment engine and the trained
scikit-learn skin-type classifier (see ml/train_model.py).
"""
import cv2
import numpy as np


def load_image_bgr(path: str):
    img = cv2.imread(path)
    if img is None:
        raise ValueError(f"Could not read image at {path}")
    return img


def extract_skin_features(img_bgr: np.ndarray) -> dict:
    img = cv2.resize(img_bgr, (256, 256))
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Skin mask using HSV thresholds (broad, works across tones)
    lower = np.array([0, 20, 40], dtype=np.uint8)
    upper = np.array([25, 180, 255], dtype=np.uint8)
    mask = cv2.inRange(hsv, lower, upper)
    skin_pixels = img[mask > 0]
    if skin_pixels.size == 0:
        skin_pixels = img.reshape(-1, 3)

    # 1. Brightness (V channel mean) -> proxy for overall luminosity / dullness
    brightness = float(np.mean(hsv[:, :, 2]))

    # 2. Redness ratio -> proxy for irritation/redness/sensitivity
    b, g, r = cv2.split(img.astype(np.float32))
    redness = float(np.mean(r / (g + b + 1e-5)))

    # 3. Oil-sheen proxy: fraction of very bright (specular) pixels within skin mask
    v_channel = hsv[:, :, 2]
    specular_mask = (v_channel > 200) & (mask > 0)
    oil_sheen_ratio = float(np.sum(specular_mask) / (np.sum(mask > 0) + 1e-5))

    # 4. Texture roughness -> Laplacian variance (higher = rougher / more texture)
    texture_variance = float(cv2.Laplacian(gray, cv2.CV_64F).var())

    # 5. Pore/edge density -> Canny edge pixel ratio
    edges = cv2.Canny(gray, 60, 150)
    edge_density = float(np.sum(edges > 0) / edges.size)

    # 6. Saturation mean -> proxy for pigmentation unevenness
    saturation = float(np.mean(hsv[:, :, 1]))

    return {
        "brightness": brightness,
        "redness": redness,
        "oil_sheen_ratio": oil_sheen_ratio,
        "texture_variance": texture_variance,
        "edge_density": edge_density,
        "saturation": saturation,
    }


def feature_vector(features: dict) -> list:
    """Return features in a fixed order for the ML model."""
    return [
        features["brightness"],
        features["redness"],
        features["oil_sheen_ratio"],
        features["texture_variance"],
        features["edge_density"],
        features["saturation"],
    ]
