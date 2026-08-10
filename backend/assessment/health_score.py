"""
Skin Health Score Calculation Module
------------------------------------
Computes an overall skin health score (0-100) and categorizes overall skin condition
based on biometric levels (hydration, oil, sensitivity) and environmental metrics
(humidity, temperature).
"""


def calculate_health_score(
    hydration_level: str,
    oil_level: str,
    sensitivity: str,
    humidity: float,
    temperature: float,
) -> dict:
    """
    Calculates the skin health score and overall skin condition.

    Deduction Rules:
    ----------------
    - Base Score: 100

    - Hydration Level:
        - High   :  0
        - Medium : -5
        - Low    : -20

    - Oil Level:
        - Medium :  0
        - High   : -10
        - Low    : -5

    - Sensitivity:
        - Low    :  0
        - Medium : -8
        - High   : -15

    - Humidity:
        - 40 to 70 :  0
        - < 40     : -5
        - > 70     : -5

    - Temperature:
        - 18°C to 28°C :  0
        - < 18°C       : -8
        - > 28°C (>30°C): -8

    - Health Condition Categories:
        - 90–100 : Excellent
        - 75–89  : Good
        - 60–74  : Fair
        - Below 60: Needs Attention

    Returns:
    --------
    dict : {"health_score": 82, "overall_condition": "Good"}
    """
    try:
        score = 100

        # String normalization
        hydration_clean = str(hydration_level).strip().capitalize()
        oil_clean = str(oil_level).strip().capitalize()
        sensitivity_clean = str(sensitivity).strip().capitalize()

        # Numeric conversion
        humidity_val = float(humidity)
        temp_val = float(temperature)

        # 1. Hydration Level Deductions
        if hydration_clean == "High":
            score -= 0
        elif hydration_clean == "Medium":
            score -= 5
        elif hydration_clean == "Low":
            score -= 20
        else:
            raise ValueError(f"Invalid hydration_level '{hydration_level}'. Expected High, Medium, or Low.")

        # 2. Oil Level Deductions
        if oil_clean == "Medium":
            score -= 0
        elif oil_clean == "High":
            score -= 10
        elif oil_clean == "Low":
            score -= 5
        else:
            raise ValueError(f"Invalid oil_level '{oil_level}'. Expected Medium, High, or Low.")

        # 3. Sensitivity Deductions
        if sensitivity_clean == "Low":
            score -= 0
        elif sensitivity_clean == "Medium":
            score -= 8
        elif sensitivity_clean == "High":
            score -= 15
        else:
            raise ValueError(f"Invalid sensitivity '{sensitivity}'. Expected Low, Medium, or High.")

        # 4. Humidity Deductions
        if 40.0 <= humidity_val <= 70.0:
            score -= 0
        elif humidity_val < 40.0:
            score -= 5
        elif humidity_val > 70.0:
            score -= 5

        # 5. Temperature Deductions
        if 18.0 <= temp_val <= 28.0:
            score -= 0
        elif temp_val < 18.0:
            score -= 8
        elif temp_val > 28.0:
            score -= 8

        # Clamp final score between 0 and 100
        final_score = int(max(0, min(100, score)))

        # Determine overall skin condition category
        if 90 <= final_score <= 100:
            overall_condition = "Excellent"
        elif 75 <= final_score <= 89:
            overall_condition = "Good"
        elif 60 <= final_score <= 74:
            overall_condition = "Fair"
        else:
            overall_condition = "Needs Attention"

        return {
            "health_score": final_score,
            "overall_condition": overall_condition,
        }

    except Exception as e:
        return {
            "error": str(e),
            "health_score": 0,
            "overall_condition": "Needs Attention",
        }


if __name__ == "__main__":
    print("=" * 70)
    print(" TESTING SKIN HEALTH SCORE MODULE (backend/assessment/health_score.py)")
    print("=" * 70)

    # Test Case 1: Optimal Parameters -> Excellent Condition
    test_1 = {
        "hydration_level": "High",
        "oil_level": "Medium",
        "sensitivity": "Low",
        "humidity": 50.0,
        "temperature": 22.0,
    }
    res_1 = calculate_health_score(**test_1)
    print(f"Test 1 (Optimal)     : {test_1}")
    print(f"Result               : {res_1}\n")

    # Test Case 2: Moderate Parameters -> Good Condition (Score: 100 - 5 - 5 - 8 = 82)
    test_2 = {
        "hydration_level": "Medium",
        "oil_level": "Low",
        "sensitivity": "Medium",
        "humidity": 50.0,
        "temperature": 25.0,
    }
    res_2 = calculate_health_score(**test_2)
    print(f"Test 2 (Moderate)    : {test_2}")
    print(f"Result               : {res_2}\n")

    # Test Case 3: Adverse Parameters -> Needs Attention Condition
    test_3 = {
        "hydration_level": "Low",       # -20
        "oil_level": "High",           # -10
        "sensitivity": "High",         # -15
        "humidity": 30.0,              # -5
        "temperature": 32.0,           # -8
    }
    res_3 = calculate_health_score(**test_3)
    print(f"Test 3 (Severe)      : {test_3}")
    print(f"Result               : {res_3}\n")

    # Test Case 4: Invalid Parameter Error Handling
    test_4 = {
        "hydration_level": "Invalid",
        "oil_level": "Medium",
        "sensitivity": "Low",
        "humidity": 50.0,
        "temperature": 22.0,
    }
    res_4 = calculate_health_score(**test_4)
    print(f"Test 4 (Error Case)  : {test_4}")
    print(f"Result               : {res_4}\n")

    print("=" * 70)
    print(" ALL TESTS COMPLETED")
    print("=" * 70)
