"""
Skin Concern Priority Engine Module
-----------------------------------
Sorts and prioritizes identified skin concerns based on clinical severity mapping.
Determines which skin concerns require immediate intervention versus secondary care.
"""

# Fixed priority mapping dictionary (Lower number = Higher Priority)
PRIORITY_MAPPING = {
    "Barrier Weakness": 1,
    "Sensitive Skin": 2,
    "Acne Prone": 3,
    "Excess Sebum": 4,
    "Dehydration": 5,
    "Dryness": 6,
    "Oily Skin": 7,
    "Dry Skin": 8,
    "Combination Skin": 9,
    "Mild Sensitivity": 10,
    "Mild Dehydration": 11,
}


def prioritize_concerns(concerns: list) -> dict:
    """
    Prioritizes a list of skin concerns based on clinical severity mapping.

    Parameters:
    -----------
    concerns : list of str (e.g. ["Dry Skin", "Barrier Weakness", "Acne Prone"])

    Fixed Priority Order:
    ---------------------
    1.  Barrier Weakness
    2.  Sensitive Skin
    3.  Acne Prone
    4.  Excess Sebum
    5.  Dehydration
    6.  Dryness
    7.  Oily Skin
    8.  Dry Skin
    9.  Combination Skin
    10. Mild Sensitivity
    11. Mild Dehydration

    Returns:
    --------
    dict : {"priority_order": ["Barrier Weakness", "Acne Prone", "Dry Skin"]}
    """
    try:
        # Input Validation
        if not isinstance(concerns, (list, tuple, set)):
            raise TypeError(f"Invalid input type '{type(concerns).__name__}'. Expected list of concerns.")

        # Filter out invalid non-string entries and deduplicate while normalizing whitespace
        valid_concerns = []
        seen = set()

        for item in concerns:
            if isinstance(item, str) and item.strip():
                clean_item = item.strip()
                if clean_item not in seen:
                    seen.add(clean_item)
                    valid_concerns.append(clean_item)

        # Sort concerns based on PRIORITY_MAPPING rank (unknown items defaulted to 999)
        sorted_concerns = sorted(
            valid_concerns,
            key=lambda c: PRIORITY_MAPPING.get(c, 999)
        )

        return {"priority_order": sorted_concerns}

    except Exception as e:
        return {
            "error": str(e),
            "priority_order": [],
        }


if __name__ == "__main__":
    print("=" * 70)
    print(" TESTING CONCERN PRIORITY ENGINE MODULE (backend/assessment/priority_engine.py)")
    print("=" * 70)

    # Test Case 1: Mixed High and Low Severity Concerns
    test_1 = ["Dry Skin", "Barrier Weakness", "Mild Dehydration", "Acne Prone"]
    res_1 = prioritize_concerns(test_1)
    print(f"Test Case 1 Input  : {test_1}")
    print(f"Prioritized Output : {res_1['priority_order']}\n")

    # Test Case 2: Oily & Sensitive Concerns with Duplicates
    test_2 = ["Excess Sebum", "Sensitive Skin", "Oily Skin", "Excess Sebum", "Barrier Weakness"]
    res_2 = prioritize_concerns(test_2)
    print(f"Test Case 2 Input  : {test_2}")
    print(f"Prioritized Output : {res_2['priority_order']}\n")

    # Test Case 3: Dehydration & Combination Profile
    test_3 = ["Mild Sensitivity", "Dehydration", "Combination Skin", "Dryness"]
    res_3 = prioritize_concerns(test_3)
    print(f"Test Case 3 Input  : {test_3}")
    print(f"Prioritized Output : {res_3['priority_order']}\n")

    # Test Case 4: Complete List of All 11 Concerns (Unsorted)
    test_4 = [
        "Mild Dehydration",
        "Combination Skin",
        "Dry Skin",
        "Oily Skin",
        "Dryness",
        "Dehydration",
        "Excess Sebum",
        "Acne Prone",
        "Sensitive Skin",
        "Barrier Weakness",
        "Mild Sensitivity",
    ]
    res_4 = prioritize_concerns(test_4)
    print(f"Test Case 4 Input  : All 11 concerns (random order)")
    print(f"Prioritized Output : {res_4['priority_order']}\n")

    print("=" * 70)
    print(" ALL TESTS COMPLETED")
    print("=" * 70)
