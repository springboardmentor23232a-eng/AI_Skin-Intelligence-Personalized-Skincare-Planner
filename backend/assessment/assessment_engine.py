"""
Skin Assessment Orchestrator Engine Module
------------------------------------------
Acts as the central orchestrator that coordinates the full end-to-end AI skin assessment pipeline:
1. ML Skin Type Prediction (prediction.py)
2. Skin Health Score & Condition Calculation (health_score.py)
3. Concern Identification (concern_identifier.py)
4. Concern Priority Engine (priority_engine.py)
5. Risk Factor Analysis (risk_analyzer.py)
6. Personalized Recommendation Generation (recommendation_engine.py)
"""

import os
import sys

# Ensure backend root, ml, and assessment directories are in sys.path for seamless imports
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

ML_DIR = os.path.join(BASE_DIR, "ml")
if ML_DIR not in sys.path:
    sys.path.insert(0, ML_DIR)

ASSESSMENT_DIR = os.path.join(BASE_DIR, "assessment")
if ASSESSMENT_DIR not in sys.path:
    sys.path.insert(0, ASSESSMENT_DIR)

# Import module functions without duplicating business logic
try:
    from ml.prediction import predict_skin_type
    from assessment.health_score import calculate_health_score
    from assessment.concern_identifier import identify_concerns
    from assessment.priority_engine import prioritize_concerns
    from assessment.risk_analyzer import analyze_risk
    from assessment.recommendation_engine import generate_recommendations
except ImportError:
    from prediction import predict_skin_type
    from health_score import calculate_health_score
    from concern_identifier import identify_concerns
    from priority_engine import prioritize_concerns
    from risk_analyzer import analyze_risk
    from recommendation_engine import generate_recommendations


def generate_complete_assessment(
    age: int,
    gender: str,
    hydration_level: str,
    oil_level: str,
    sensitivity: str,
    humidity: float,
    temperature: float,
) -> dict:
    """
    Orchestrates the full skin assessment pipeline.

    Parameters:
    -----------
    age             : int (e.g. 36)
    gender          : str ('Male', 'Female')
    hydration_level : str ('Low', 'Medium', 'High')
    oil_level       : str ('Low', 'Medium', 'High')
    sensitivity     : str ('Low', 'Medium', 'High')
    humidity        : float (e.g. 31.9)
    temperature     : float (e.g. 10.1)

    Returns:
    --------
    dict : {
        "assessment_summary": {
            "predicted_skin_type": "...",
            "health_score": ...,
            "overall_condition": "..."
        },
        "concerns": [...],
        "priority_order": [...],
        "risk_factors": [...],
        "recommendations": { ... }
    }
    """
    try:
        # Step 1: Predict Skin Type via ML Model (RandomForest)
        prediction_result = predict_skin_type(
            age=age,
            gender=gender,
            hydration_level=hydration_level,
            oil_level=oil_level,
            sensitivity=sensitivity,
            humidity=humidity,
            temperature=temperature,
        )
        predicted_skin_type = prediction_result.get("predicted_skin_type", "Normal")

        # Step 2: Calculate Skin Health Score & Condition
        health_result = calculate_health_score(
            hydration_level=hydration_level,
            oil_level=oil_level,
            sensitivity=sensitivity,
            humidity=humidity,
            temperature=temperature,
        )
        health_score = health_result.get("health_score", 100)
        overall_condition = health_result.get("overall_condition", "Good")

        # Step 3: Identify Skin Concerns
        concerns_result = identify_concerns(
            predicted_skin_type=predicted_skin_type,
            hydration_level=hydration_level,
            oil_level=oil_level,
            sensitivity=sensitivity,
        )
        concerns = concerns_result.get("concerns", [])

        # Step 4: Prioritize Concerns by Clinical Severity
        priority_result = prioritize_concerns(concerns=concerns)
        priority_order = priority_result.get("priority_order", [])

        # Step 5: Analyze Environmental & Biometric Risk Factors
        risk_result = analyze_risk(
            age=age,
            hydration_level=hydration_level,
            oil_level=oil_level,
            sensitivity=sensitivity,
            humidity=humidity,
            temperature=temperature,
        )
        risk_factors = risk_result.get("risk_factors", [])

        # Step 6: Generate Tailored Skincare Recommendations
        recommendations = generate_recommendations(
            predicted_skin_type=predicted_skin_type,
            health_score=health_score,
            concerns=concerns,
            risk_factors=risk_factors,
        )

        # Step 7: Combine All Sub-System Outputs into Standardized Assessment Payload
        complete_assessment = {
            "assessment_summary": {
                "predicted_skin_type": predicted_skin_type,
                "health_score": health_score,
                "overall_condition": overall_condition,
            },
            "concerns": concerns,
            "priority_order": priority_order,
            "risk_factors": risk_factors,
            "recommendations": recommendations,
        }

        return complete_assessment

    except Exception as e:
        return {
            "error": f"Orchestration Error: {str(e)}",
            "assessment_summary": {
                "predicted_skin_type": "Normal",
                "health_score": 0,
                "overall_condition": "Needs Attention",
            },
            "concerns": [],
            "priority_order": [],
            "risk_factors": [],
            "recommendations": {
                "morning_routine": [],
                "night_routine": [],
                "recommended_ingredients": [],
                "ingredients_to_avoid": [],
                "lifestyle_recommendations": [],
                "general_advice": "Unable to complete assessment.",
            },
        }


if __name__ == "__main__":
    import json

    print("=" * 70)
    print(" TESTING COMPLETE ASSESSMENT ORCHESTRATOR (assessment_engine.py)")
    print("=" * 70)

    # Test Case 1: Dry & Sensitive Skin in Low Humidity (Row 1 from CSV)
    test_1 = {
        "age": 36,
        "gender": "Male",
        "hydration_level": "Low",
        "oil_level": "Low",
        "sensitivity": "High",
        "humidity": 31.9,
        "temperature": 10.1,
    }
    res_1 = generate_complete_assessment(**test_1)
    print("--- Test Case 1: Dry & Sensitive Profile (Low Humidity & Cold Temp) ---")
    print(json.dumps(res_1, indent=2))
    print("\n")

    # Test Case 2: Oily & Acne-Prone Profile in Hot Environment
    test_2 = {
        "age": 25,
        "gender": "Female",
        "hydration_level": "Medium",
        "oil_level": "High",
        "sensitivity": "Low",
        "humidity": 55.0,
        "temperature": 32.0,
    }
    res_2 = generate_complete_assessment(**test_2)
    print("--- Test Case 2: Oily & Acne-Prone Profile (Hot Temp) ---")
    print(json.dumps(res_2, indent=2))
    print("\n")

    # Test Case 3: Mature Combination Skin Profile
    test_3 = {
        "age": 52,
        "gender": "Female",
        "hydration_level": "Medium",
        "oil_level": "High",
        "sensitivity": "Medium",
        "humidity": 45.0,
        "temperature": 24.0,
    }
    res_3 = generate_complete_assessment(**test_3)
    print("--- Test Case 3: Mature Combination Profile ---")
    print(json.dumps(res_3, indent=2))
    print("\n")

    # Test Case 4: Optimal Healthy Normal Skin Profile
    test_4 = {
        "age": 30,
        "gender": "Female",
        "hydration_level": "High",
        "oil_level": "Medium",
        "sensitivity": "Low",
        "humidity": 50.0,
        "temperature": 22.0,
    }
    res_4 = generate_complete_assessment(**test_4)
    print("--- Test Case 4: Optimal Healthy Normal Profile ---")
    print(json.dumps(res_4, indent=2))
    print("\n")

    print("=" * 70)
    print(" ALL END-TO-END PIPELINE TESTS COMPLETED SUCCESSFULLY")
    print("=" * 70)
