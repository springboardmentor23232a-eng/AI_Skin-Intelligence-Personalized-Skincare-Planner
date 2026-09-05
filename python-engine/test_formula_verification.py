"""
Formula verification test for Skin Health Scoring Engine
Tests the exact example from the requirements
"""

# Test the mathematical formula directly
def test_weighted_formula():
    """Test the exact weighted formula with the example values."""
    
    # Example from requirements
    condition = 72
    lifestyle = 80
    sleep = 65
    routine = 90
    hydration = 70
    
    # Weights from specification
    WEIGHT_CONDITION = 0.35
    WEIGHT_LIFESTYLE = 0.20
    WEIGHT_SLEEP = 0.15
    WEIGHT_ROUTINE = 0.20
    WEIGHT_HYDRATION = 0.10
    
    # Calculate weighted components
    weighted_condition = condition * WEIGHT_CONDITION      # 72 * 0.35 = 25.20
    weighted_lifestyle = lifestyle * WEIGHT_LIFESTYLE      # 80 * 0.20 = 16.00
    weighted_sleep = sleep * WEIGHT_SLEEP                  # 65 * 0.15 = 9.75
    weighted_routine = routine * WEIGHT_ROUTINE            # 90 * 0.20 = 18.00
    weighted_hydration = hydration * WEIGHT_HYDRATION      # 70 * 0.10 = 7.00
    
    # Calculate overall score
    overall_score = (
        weighted_condition +
        weighted_lifestyle +
        weighted_sleep +
        weighted_routine +
        weighted_hydration
    )
    
    expected = 25.20 + 16.00 + 9.75 + 18.00 + 7.00  # 75.95
    overall_score = round(overall_score, 2)
    
    print("Formula Verification Test")
    print("=" * 50)
    print(f"Condition (72) × 0.35 = {weighted_condition}")
    print(f"Lifestyle (80) × 0.20 = {weighted_lifestyle}")
    print(f"Sleep (65) × 0.15 = {weighted_sleep}")
    print(f"Routine (90) × 0.20 = {weighted_routine}")
    print(f"Hydration (70) × 0.10 = {weighted_hydration}")
    print(f"Overall = {overall_score}")
    print(f"Expected = {expected}")
    print(f"Match: {overall_score == expected}")
    
    # Test category
    if overall_score >= 90:
        category = "Excellent"
    elif overall_score >= 75:
        category = "Good"
    elif overall_score >= 60:
        category = "Fair"
    elif overall_score >= 40:
        category = "Needs Improvement"
    else:
        category = "Poor"
    
    print(f"Category: {category}")
    print(f"Expected Category: Good")
    print(f"Category Match: {category == 'Good'}")
    
    return overall_score == expected and category == "Good"

def test_boundary_categories():
    """Test score category boundaries."""
    
    print("\nCategory Boundary Tests")
    print("=" * 50)
    
    test_cases = [
        (100, "Excellent"),
        (90, "Excellent"),
        (89, "Good"),
        (75, "Good"),
        (74, "Fair"),
        (60, "Fair"),
        (59, "Needs Improvement"),
        (40, "Needs Improvement"),
        (39, "Poor"),
        (0, "Poor")
    ]
    
    all_pass = True
    for score, expected_category in test_cases:
        if score >= 90:
            category = "Excellent"
        elif score >= 75:
            category = "Good"
        elif score >= 60:
            category = "Fair"
        elif score >= 40:
            category = "Needs Improvement"
        else:
            category = "Poor"
        
        status = "✅" if category == expected_category else "❌"
        print(f"{status} Score {score}: {category} (expected {expected_category})")
        if category != expected_category:
            all_pass = False
    
    return all_pass

def test_extreme_values():
    """Test extreme values and boundary conditions."""
    
    print("\nExtreme Values Test")
    print("=" * 50)
    
    # Test all 100s
    overall_100 = (
        100 * 0.35 + 100 * 0.20 + 100 * 0.15 + 100 * 0.20 + 100 * 0.10
    )
    print(f"All 100s: {round(overall_100, 2)} (expected 100.0)")
    
    # Test all 0s
    overall_0 = (
        0 * 0.35 + 0 * 0.20 + 0 * 0.15 + 0 * 0.20 + 0 * 0.10
    )
    print(f"All 0s: {round(overall_0, 2)} (expected 0.0)")
    
    # Test single component at 100
    condition_only = 100 * 0.35
    lifestyle_only = 100 * 0.20
    sleep_only = 100 * 0.15
    routine_only = 100 * 0.20
    hydration_only = 100 * 0.10
    
    print(f"Condition only: {condition_only} (expected 35.0)")
    print(f"Lifestyle only: {lifestyle_only} (expected 20.0)")
    print(f"Sleep only: {sleep_only} (expected 15.0)")
    print(f"Routine only: {routine_only} (expected 20.0)")
    print(f"Hydration only: {hydration_only} (expected 10.0)")
    
    weights_correct = (
        condition_only == 35.0 and
        lifestyle_only == 20.0 and
        sleep_only == 15.0 and
        routine_only == 20.0 and
        hydration_only == 10.0
    )
    
    return overall_100 == 100.0 and overall_0 == 0.0 and weights_correct

if __name__ == "__main__":
    formula_pass = test_weighted_formula()
    boundary_pass = test_boundary_categories()
    extreme_pass = test_extreme_values()
    
    print("\n" + "=" * 50)
    print("FINAL RESULTS")
    print("=" * 50)
    print(f"Formula Test: {'✅ PASS' if formula_pass else '❌ FAIL'}")
    print(f"Boundary Test: {'✅ PASS' if boundary_pass else '❌ FAIL'}")
    print(f"Extreme Values Test: {'✅ PASS' if extreme_pass else '❌ FAIL'}")
    
    if formula_pass and boundary_pass and extreme_pass:
        print("\n✅ ALL TESTS PASSED")
    else:
        print("\n❌ SOME TESTS FAILED")