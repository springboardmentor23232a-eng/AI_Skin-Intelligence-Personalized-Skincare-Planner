from pathlib import Path
from functools import lru_cache
import json

import numpy as np
from PIL import Image
import tensorflow as tf


# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[2]

MODEL_PATH = BASE_DIR / "ml" / "models" / "acne_severity_model.keras"
CLASS_NAMES_PATH = BASE_DIR / "ml" / "models" / "class_names.json"


# ---------------------------------------------------------
# Load model only once
# ---------------------------------------------------------

@lru_cache(maxsize=1)
def load_skin_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"ML model not found: {MODEL_PATH}"
        )

    model = tf.keras.models.load_model(MODEL_PATH)

    if not CLASS_NAMES_PATH.exists():
        raise FileNotFoundError(
            f"Class names file not found: {CLASS_NAMES_PATH}"
        )

    with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as file:
        class_names = json.load(file)

    return model, class_names


# ---------------------------------------------------------
# Predict skin severity from image
# ---------------------------------------------------------

def predict_skin_severity(image_bytes: bytes) -> dict:
    """
    Predict acne severity from an uploaded skin image.

    Returns:
        {
            "prediction": "Mild",
            "confidence": 36.38,
            "probabilities": {
                "Mild": 36.38,
                "Moderate": 26.00,
                "Severe": 32.37,
                "Very Severe": 5.25
            }
        }
    """

    model, class_names = load_skin_model()

    # Convert uploaded bytes into an image
    image = Image.open(
        __import__("io").BytesIO(image_bytes)
    ).convert("RGB")

    # Model was trained using 224 x 224 images
    image = image.resize((224, 224))

    # Convert image to numpy array
    image_array = np.array(image, dtype=np.float32)

    # Add batch dimension
    image_array = np.expand_dims(image_array, axis=0)

    # Predict
    predictions = model.predict(image_array, verbose=0)[0]

    predicted_index = int(np.argmax(predictions))

    prediction = class_names[predicted_index]
    confidence = float(predictions[predicted_index] * 100)

    probabilities = {
        class_names[i]: round(float(predictions[i] * 100), 2)
        for i in range(len(class_names))
    }

    return {
        "prediction": prediction,
        "confidence": round(confidence, 2),
        "probabilities": probabilities,
    }