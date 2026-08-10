"""
Skin Concern Identifier Module
------------------------------
Analyzes predicted skin type and biometric levels (hydration, oil, sensitivity)
to identify personalized skin concerns and vulnerabilities.
"""


def identify_concerns(
    predicted_skin_type: str,
    hydration_level: str,
    oil_level: str,
    sensitivity: str,
) -> dict:
    """
    Identifies skin concerns based on predicted skin type and biometric parameters.

    Rules Matrix:
    -------------
    1. Hydration:
        - Low    : Add "Dryness", "Dehydration"
        - Medium : Add "Mild Dehydration"
        - High   : None

    2. Oil Level:
        - High   : Add "Excess Sebum", "Acne Prone"
        - Low    : Add "Dry Skin"
        - Medium : None

    3. Sensitivity:
        - High   : Add "Sensitive Skin", "Barrier Weakness"
        - Medium : Add "Mild Sensitivity"
        - Low    : None

    4. Predicted Skin Type:
        - Dry         : Add "Dry Skin"
        - Oily        : Add "Oily Skin"
        - Combination : Add "Combination Skin"
        - Normal      : None

    Returns:
    --------
    dict : {"concerns": ["Dryness", "Dehydration", "Dry Skin", ...]}
    """
    try:
        concerns_list = []

        # String normalization
        skin_type_clean = str(predicted_skin_type).strip().capitalize()
        hydration_clean = str(hydration_level).strip().capitalize()
        oil_clean = str(oil_level).strip().capitalize()
        sensitivity_clean = str(sensitivity).strip().capitalize()

        # 1. Hydration Rules
        if hydration_clean == "Low":
            concerns_list.extend(["Dryness", "Dehydration"])
        elif hydration_clean == "Medium":
            concerns_list.append("Mild Dehydration")

        # 2. Oil Level Rules
        if oil_clean == "High":
            concerns_list.extend(["Excess Sebum", "Acne Prone"])
        elif oil_clean == "Low":
            concerns_list.append("Dry Skin")

        # 3. Sensitivity Rules
        if sensitivity_clean == "High":
            concerns_list.extend(["Sensitive Skin", "Barrier Weakness"])
        elif sensitivity_clean == "Medium":
            concerns_list.append("Mild Sensitivity")

        # 4. Predicted Skin Type Rules
        if skin_type_clean == "Dry":
            concerns_list.append("Dry Skin")
        elif skin_type_clean == "Oily":
            concerns_list.append("Oily Skin")
        elif skin_type_clean == "Combination":
            concerns_list.append("Combination Skin")
        elif skin_type_clean == "Normal":
            pass  # Do not add any concern for Normal skin type

        # Deduplicate concerns while preserving original order
        unique_concerns = list(dict.fromkeys(concerns_list))

        return {"concerns": unique_concerns}

    except Exception as e:
        return {
            "error": str(e),
            "concerns": [],
        }


if __name__ == "__main__":
    print("=" * 70)
    print(" TESTING CONCERN IDENTIFIER MODULE (backend/assessment/concern_identifier.py)")
    print("=" * 70)

    # Test Case 1: Dry Skin + Low Hydration + Low Oil + High Sensitivity
    test_1 = {
        "predicted_skin_type": "Dry",
        "hydration_level": "Low",
        "oil_level": "Low",
        "sensitivity": "High",
    }
    res_1 = identify_concerns(**test_1)
    print(f"Test Case 1 (Dry & Sensitive) : {test_1}")
    print(f"Result                         : {res_1}\n")

    # Test Case 2: Oily Skin + High Oil + Medium Hydration + Low Sensitivity
    test_2 = {
        "predicted_skin_type": "Oily",
        "hydration_level": "Medium",
        "oil_level": "High",
        "sensitivity": "Low",
    }
    res_2 = identify_concerns(**test_2)
    print(f"Test Case 2 (Oily & Acne Prone): {test_2}")
    print(f"Result                         : {res_2}\n")

    # Test Case 3: Combination Skin + High Hydration + Medium Oil + Medium Sensitivity
    test_3 = {
        "predicted_skin_type": "Combination",
        "hydration_level": "High",
        "oil_level": "Medium",
        "sensitivity": "Medium",
    }
    res_3 = identify_concerns(**test_3)
    print(f"Test Case 3 (Combination)     : {test_3}")
    print(f"Result                         : {res_3}\n")

    # Test Case 4: Normal Skin + Optimal Metrics
    test_4 = {
        "predicted_skin_type": "Normal",
        "hydration_level": "High",
        "oil_level": "Medium",
        "sensitivity": "Low",
    }
    res_4 = identify_concerns(**test_4)
    print(f"Test Case 4 (Normal & Healthy) : {test_4}")
    print(f"Result                         : {res_4}\n")

    print("=" * 70)
    print(" ALL TESTS COMPLETED")
    print("=" * 70)
