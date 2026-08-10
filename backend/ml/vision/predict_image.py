"""
GlowMix Vision Image Concern Prediction Script
-----------------------------------------------
Loads the trained EfficientNetB0 vision model (vision_model.keras) and class names,
preprocesses a single input skin image, predicts the primary skin concern,
and displays confidence percentage metrics.
"""

import os
import sys
import json
import numpy as np

# Resolve model asset filepaths dynamically relative to script path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODELS_DIR, "vision_model.keras")
CLASS_NAMES_PATH = os.path.join(MODELS_DIR, "class_names.json")

_MODEL = None
_CLASS_NAMES = None


def load_vision_assets():
    """
    Loads the trained Keras vision model and class names JSON.
    Caches assets in memory for fast prediction performance.
    """
    global _MODEL, _CLASS_NAMES

    if _MODEL is not None and _CLASS_NAMES is not None:
        return _MODEL, _CLASS_NAMES

    try:
        import tensorflow as tf
    except ImportError:
        print("[ERROR] TensorFlow is not installed in your Python environment.")
        print("Please install TensorFlow using: pip install tensorflow")
        sys.exit(1)

    # 1. Load Trained Keras Model
    if not os.path.exists(MODEL_PATH):
        print(f"[ERROR] Trained vision model file not found at '{MODEL_PATH}'.")
        print("Please run 'train_vision_model.py' to train and save the vision model first.")
        sys.exit(1)

    try:
        _MODEL = tf.keras.models.load_model(MODEL_PATH)
        print("[SUCCESS] Vision model loaded successfully.")
    except Exception as e:
        print(f"[ERROR] Failed loading vision model from '{MODEL_PATH}': {e}")
        sys.exit(1)

    # 2. Load Class Names JSON
    if not os.path.exists(CLASS_NAMES_PATH):
        print(f"[ERROR] Class names JSON file not found at '{CLASS_NAMES_PATH}'.")
        sys.exit(1)

    try:
        with open(CLASS_NAMES_PATH, "r") as f:
            _CLASS_NAMES = json.load(f)
        print(f"[INFO] Loaded Class Names: {_CLASS_NAMES}\n")
    except Exception as e:
        print(f"[ERROR] Failed reading class names JSON from '{CLASS_NAMES_PATH}': {e}")
        sys.exit(1)

    return _MODEL, _CLASS_NAMES


def predict_skin_concern(image_path: str = None) -> dict:
    """
    Predicts skin concern from an input image path.

    Parameters:
    -----------
    image_path : str, optional
        Path to input skin image file.
        If None, prompts user via console input.

    Returns:
    --------
    dict : {"predicted_concern": "acne", "confidence": "96.42%"}
    """
    try:
        import tensorflow as tf
        from tensorflow.keras.applications.efficientnet import preprocess_input
    except ImportError:
        print("[ERROR] TensorFlow is not installed in your Python environment.")
        sys.exit(1)

    # Load model and class names
    model, class_names = load_vision_assets()

    # 3. Prompt user for image path if not provided
    if not image_path:
        try:
            image_path = input("Enter image path: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\n[CANCELLED] Image path input cancelled by user.")
            sys.exit(0)

    if image_path:
        image_path = image_path.strip("\"'")

    # Validate image path existence
    if not image_path or not os.path.exists(image_path):
        print(f"\n[ERROR] Image file does not exist at '{image_path}'.")
        return {"error": f"Image file not found at '{image_path}'", "predicted_concern": None, "confidence": "0.00%"}

    if not os.path.isfile(image_path):
        print(f"\n[ERROR] Provided path '{image_path}' is not a file.")
        return {"error": f"Path '{image_path}' is not a file", "predicted_concern": None, "confidence": "0.00%"}

    # 4. Image Preprocessing
    try:
        # Load image, resize to (224, 224), and convert to RGB
        img = tf.keras.utils.load_img(
            image_path,
            target_size=(224, 224),
            color_mode="rgb",
        )
        img_array = tf.keras.utils.img_to_array(img)
        img_batch = np.expand_dims(img_array, axis=0)

        # Apply EfficientNet preprocessing
        img_preprocessed = preprocess_input(img_batch)

    except Exception as e:
        print(f"\n[ERROR] Invalid image format or failed preprocessing '{image_path}': {e}")
        return {"error": f"Invalid image format: {e}", "predicted_concern": None, "confidence": "0.00%"}

    # 5. Prediction
    try:
        predictions = model.predict(img_preprocessed, verbose=0)
        pred_idx = int(np.argmax(predictions[0]))
        predicted_concern = str(class_names[pred_idx]).title()
        confidence_score = float(predictions[0][pred_idx]) * 100.0
        confidence_str = f"{confidence_score:.2f}%"

        # 6. Print Results
        print("\n" + "=" * 40)
        print("IMAGE ANALYSIS RESULT")
        print("=" * 40)
        print(f"Predicted Concern : {predicted_concern}")
        print(f"Confidence        : {confidence_str}")
        print("=" * 40 + "\n")

        print("=" * 41)
        print("IMAGE PREDICTION COMPLETED SUCCESSFULLY")
        print("=" * 41)

        # 7. Return Result Dictionary
        return {
            "predicted_concern": predicted_concern,
            "confidence": confidence_str,
        }

    except Exception as e:
        print(f"\n[ERROR] Exception occurred during model prediction: {e}")
        return {"error": f"Prediction error: {e}", "predicted_concern": None, "confidence": "0.00%"}


if __name__ == "__main__":
    predict_skin_concern()
