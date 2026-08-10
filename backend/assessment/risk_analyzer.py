"""
Skin Risk Analyzer Module
-------------------------
Analyzes biometric parameters and environmental factors to identify potential
skin risks, sensitivities, and environmental stressors.
"""


def analyze_risk(
    age: int,
    hydration_level: str,
    oil_level: str,
    sensitivity: str,
    humidity: float,
    temperature: float,
) -> dict:
    """
    Analyzes risk factors for skin health based on user demographics, biometrics, and environment.

    Risk Evaluation Rules:
    ----------------------
    - Age >= 45           : Add "Age-related skin changes"
    - Hydration == Low    : Add "Risk of dehydration"
    - Oil Level == High   : Add "High oil production may increase acne risk"
    - Sensitivity == High : Add "Sensitive skin barrier"
    - Humidity < 35       : Add "Low environmental humidity"
    - Temperature > 30    : Add "Hot environmental conditions"

    Returns:
    --------
    dict : {"risk_factors": ["Age-related skin changes", "Sensitive skin barrier", ...]}
    """
    try:
        risk_factors = []

        # Input Validation & Type Casting
        age_val = int(age)
        humidity_val = float(humidity)
        temp_val = float(temperature)

        hydration_clean = str(hydration_level).strip().capitalize()
        oil_clean = str(oil_level).strip().capitalize()
        sensitivity_clean = str(sensitivity).strip().capitalize()

        # 1. Age Rule: Age >= 45
        if age_val >= 45:
            risk_factors.append("Age-related skin changes")

        # 2. Hydration Rule: Hydration == Low
        if hydration_clean == "Low":
            risk_factors.append("Risk of dehydration")

        # 3. Oil Level Rule: Oil Level == High
        if oil_clean == "High":
            risk_factors.append("High oil production may increase acne risk")

        # 4. Sensitivity Rule: Sensitivity == High
        if sensitivity_clean == "High":
            risk_factors.append("Sensitive skin barrier")

        # 5. Humidity Rule: Humidity < 35
        if humidity_val < 35.0:
            risk_factors.append("Low environmental humidity")

        # 6. Temperature Rule: Temperature > 30
        if temp_val > 30.0:
            risk_factors.append("Hot environmental conditions")

        # Deduplicate risk factors while preserving evaluation order
        unique_risks = list(dict.fromkeys(risk_factors))

        return {"risk_factors": unique_risks}

    except Exception as e:
        return {
            "error": str(e),
            "risk_factors": [],
        }


if __name__ == "__main__":
    print("=" * 70)
    print(" TESTING SKIN RISK ANALYZER MODULE (backend/assessment/risk_analyzer.py)")
    print("=" * 70)

    # Test Case 1: Mature & Sensitive Profile in Extreme Heat
    test_1 = {
        "age": 52,
        "hydration_level": "Low",
        "oil_level": "Medium",
        "sensitivity": "High",
        "humidity": 28.5,
        "temperature": 34.0,
    }
    res_1 = analyze_risk(**test_1)
    print(f"Test Case 1 (Mature & Sensitive Hot/Dry): {test_1}")
    print(f"Risk Factors                           : {res_1['risk_factors']}\n")

    # Test Case 2: Oily & Younger Profile
    test_2 = {
        "age": 24,
        "hydration_level": "High",
        "oil_level": "High",
        "sensitivity": "Low",
        "humidity": 50.0,
        "temperature": 24.0,
    }
    res_2 = analyze_risk(**test_2)
    print(f"Test Case 2 (Young Oily Profile)       : {test_2}")
    print(f"Risk Factors                           : {res_2['risk_factors']}\n")

    # Test Case 3: All Risks Triggered
    test_3 = {
        "age": 48,
        "hydration_level": "Low",
        "oil_level": "High",
        "sensitivity": "High",
        "humidity": 20.0,
        "temperature": 35.0,
    }
    res_3 = analyze_risk(**test_3)
    print(f"Test Case 3 (All Risks Triggered)       : {test_3}")
    print(f"Risk Factors                           : {res_3['risk_factors']}\n")

    # Test Case 4: Optimal Profile (No Risks Triggered)
    test_4 = {
        "age": 30,
        "hydration_level": "High",
        "oil_level": "Medium",
        "sensitivity": "Low",
        "humidity": 55.0,
        "temperature": 22.0,
    }
    res_4 = analyze_risk(**test_4)
    print(f"Test Case 4 (Optimal / Zero Risks)      : {test_4}")
    print(f"Risk Factors                           : {res_4['risk_factors']}\n")

    print("=" * 70)
    print(" ALL TESTS COMPLETED")
    print("=" * 70)
