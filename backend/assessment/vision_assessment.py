"""
GlowMix Vision Assessment Module
--------------------------------
Acts as a reusable assessment bridge that wraps the Vision AI model inference
(predict_image.py) to provide image-based skin concern analysis for assessment pipelines.
"""

import os
import sys

# Resolve module paths dynamically
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

VISION_DIR = os.path.join(BASE_DIR, "ml", "vision")
if VISION_DIR not in sys.path:
    sys.path.insert(0, VISION_DIR)

# Import prediction function from predict_image.py without code duplication
try:
    from ml.vision.predict_image import predict_skin_concern
except ImportError:
    try:
        from predict_image import predict_skin_concern
    except ImportError:
        predict_skin_concern = None


def assess_image(image_path: str) -> dict:
    """
    Validates image path and delegates skin concern prediction to predict_image.py.

    Parameters:
    -----------
    image_path : str
        Path to the target input image file.

    Returns:
    --------
    dict : {"predicted_concern": "Acne", "confidence": "84.28%"}
    or
    dict : {"error": "Unable to analyze image."}
    """
    try:
        # Validate prediction function availability
        if predict_skin_concern is None:
            return {"error": "Prediction module 'predict_image.py' could not be loaded."}

        # Validate input path string
        if not image_path or not isinstance(image_path, str):
            return {"error": "Invalid image path provided."}

        clean_path = image_path.strip().strip("\"'")

        # 1. Validate image path existence
        if not os.path.exists(clean_path):
            print(f"[ERROR] Image path '{clean_path}' does not exist.")
            return {"error": f"Image file not found at '{clean_path}'"}

        if not os.path.isfile(clean_path):
            print(f"[ERROR] Path '{clean_path}' is not a valid file.")
            return {"error": f"Path '{clean_path}' is not a file"}

        # 2. Call prediction function from predict_image.py
        result = predict_skin_concern(image_path=clean_path)

        # Handle prediction failure or error response
        if not result or "error" in result:
            err_msg = result.get("error", "Unable to analyze image.") if isinstance(result, dict) else "Unable to analyze image."
            return {"error": err_msg}

        # 3. Return result unchanged
        return {
            "predicted_concern": result.get("predicted_concern"),
            "confidence": result.get("confidence"),
        }

    except Exception as e:
        print(f"[ERROR] Exception in vision assessment: {e}")
        return {"error": "Unable to analyze image."}


if __name__ == "__main__":
    print("=" * 60)
    print(" TESTING VISION ASSESSMENT MODULE (vision_assessment.py)")
    print("=" * 60)

    try:
        test_path = input("Enter image path: ").strip()
    except (KeyboardInterrupt, EOFError):
        print("\n[CANCELLED] Input cancelled by user.")
        sys.exit(0)

    # Perform assessment
    assessment_result = assess_image(test_path)

    print("\n--- Assessment Result ---")
    print(assessment_result)

    print("\n" + "=" * 42)
    print("VISION ASSESSMENT MODULE TEST COMPLETED")
    print("=" * 42)
