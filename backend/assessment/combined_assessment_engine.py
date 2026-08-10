"""
GlowMix Combined Assessment Engine Module
----------------------------------------
Unifies Questionnaire Skin Assessment (assessment_engine.py) and Vision AI Image
Assessment (vision_assessment.py) into a single, comprehensive AI skin report payload.
"""

import os
import sys
import json

# Ensure parent and sub-module directories are in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

ASSESSMENT_DIR = os.path.join(BASE_DIR, "assessment")
if ASSESSMENT_DIR not in sys.path:
    sys.path.insert(0, ASSESSMENT_DIR)

ML_DIR = os.path.join(BASE_DIR, "ml")
if ML_DIR not in sys.path:
    sys.path.insert(0, ML_DIR)

# Import existing modules directly without duplicating business logic
try:
    from assessment.assessment_engine import generate_complete_assessment
    from assessment.vision_assessment import assess_image
    print("[SUCCESS] Imported using package imports.")

except ImportError as e1:
    print("[IMPORT ERROR 1]", e1)

    try:
        from assessment_engine import generate_complete_assessment
        from vision_assessment import assess_image
        print("[SUCCESS] Imported using local imports.")

    except ImportError as e2:
        print("[IMPORT ERROR 2]", e2)
        generate_complete_assessment = None
        assess_image = None


def combined_assessment(questionnaire_data: dict, image_path: str = None) -> dict:
    """
    Merges Questionnaire Assessment and Vision AI Image Analysis into one unified payload.

    Parameters:
    -----------
    questionnaire_data : dict
        Demographic, biometric, and environmental input dictionary:
        {
            "age": 36,
            "gender": "Female",
            "hydration_level": "Medium",
            "oil_level": "High",
            "sensitivity": "Medium",
            "humidity": 45.0,
            "temperature": 24.0
        }
    image_path : str, optional
        Filepath to input skin image.

    Returns:
    --------
    dict : Unified assessment payload containing:
    {
        "assessment_summary": {...},
        "vision_analysis": {
            "predicted_concern": "...",
            "confidence": "..."
        },
        "concerns": [...],
        "priority_order": [...],
        "risk_factors": [...],
        "recommendations": {...}
    }
    """
    try:
        if generate_complete_assessment is None or assess_image is None:
            return {"error": "Unable to complete combined assessment: Sub-modules failed to load."}

        if not isinstance(questionnaire_data, dict):
            return {"error": "Invalid questionnaire data format. Expected dictionary."}

        # 1. Execute Questionnaire Assessment Engine
        quest_result = generate_complete_assessment(
            age=questionnaire_data.get("age", 30),
            gender=questionnaire_data.get("gender", "Female"),
            hydration_level=questionnaire_data.get("hydration_level", "Medium"),
            oil_level=questionnaire_data.get("oil_level", "Medium"),
            sensitivity=questionnaire_data.get("sensitivity", "Low"),
            humidity=questionnaire_data.get("humidity", 50.0),
            temperature=questionnaire_data.get("temperature", 22.0),
        )

        if not quest_result or "error" in quest_result:
            return {"error": quest_result.get("error", "Unable to complete combined assessment.")}

        # 2. Execute Vision AI Assessment Module
        vision_result = {}
        if image_path:
            clean_image_path = str(image_path).strip().strip("\"'")
            vision_result = assess_image(clean_image_path)
            if not vision_result or "error" in vision_result:
                vision_result = {
                    "predicted_concern": "Unknown / Image Analysis Error",
                    "confidence": "0.00%",
                    "note": vision_result.get("error", "Unable to analyze image.") if isinstance(vision_result, dict) else "Unable to analyze image."
                }
        else:
            vision_result = {
                "predicted_concern": "Not Provided",
                "confidence": "N/A"
            }

        # 3. Build Unified Response (Preserve questionnaire output & insert vision_analysis key)
        combined_payload = {
            "assessment_summary": quest_result.get("assessment_summary", {}),
            "vision_analysis": {
                "predicted_concern": vision_result.get("predicted_concern", "N/A"),
                "confidence": vision_result.get("confidence", "N/A")
            },
            "concerns": quest_result.get("concerns", []),
            "priority_order": quest_result.get("priority_order", []),
            "risk_factors": quest_result.get("risk_factors", []),
            "recommendations": quest_result.get("recommendations", {}),
        }

        # Include vision note if error occurred during vision processing
        if "note" in vision_result:
            combined_payload["vision_analysis"]["note"] = vision_result["note"]

        return combined_payload

    except Exception as e:
        print(f"[ERROR] Exception during combined assessment: {e}")
        return {"error": "Unable to complete combined assessment."}


if __name__ == "__main__":
    print("=" * 70)
    print(" TESTING COMBINED ASSESSMENT ENGINE (combined_assessment_engine.py)")
    print("=" * 70)

    # Sample Questionnaire Input Data
    sample_questionnaire = {
        "age": 36,
        "gender": "Female",
        "hydration_level": "Medium",
        "oil_level": "High",
        "sensitivity": "Medium",
        "humidity": 45.0,
        "temperature": 24.0,
    }

    print(f"\n[INFO] Sample Questionnaire Data:\n{json.dumps(sample_questionnaire, indent=4)}\n")

    try:
        user_image_path = input("Enter image path: ").strip()
    except (KeyboardInterrupt, EOFError):
        print("\n[CANCELLED] Input cancelled by user.")
        sys.exit(0)

    # Call Combined Assessment
    result_payload = combined_assessment(sample_questionnaire, user_image_path)

    print("\n" + "=" * 70)
    print(" UNIFIED COMBINED ASSESSMENT RESPONSE (JSON)")
    print("=" * 70)
    print(json.dumps(result_payload, indent=4))
    print("\n" + "=" * 58)
    print("COMBINED ASSESSMENT ENGINE TEST COMPLETED SUCCESSFULLY")
    print("=" * 58)
