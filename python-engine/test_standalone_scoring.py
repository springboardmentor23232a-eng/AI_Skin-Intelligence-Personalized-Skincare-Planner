"""
Standalone test for Skin Health Scoring Engine logic
Tests the mathematical formulas without dependencies
"""

class SkinHealthScoringEngine:
    """Standalone version for testing."""
    
    WEIGHT_CONDITION = 0.35
    WEIGHT_LIFESTYLE = 0.20
    WEIGHT_SLEEP = 0.15
    WEIGHT_ROUTINE = 0.20
    WEIGHT_HYDRATION = 0.10
    
    def calculate_overall_score(self, condition, lifestyle, sleep, routine, hydration):
        """Calculate the overall weighted skin health score."""
        weighted_condition = condition * self.WEIGHT_CONDITION
        weighted_lifestyle = lifestyle * self.WEIGHT_LIFESTYLE
        weighted_sleep = sleep * self.WEIGHT_SLEEP
        weighted_routine = routine * self.WEIGHT_ROUTINE
        weighted_hydration = hydration * self.WEIGHT_HYDRATION
        
        overall_score = (
            weighted_condition +
            weighted_lifestyle +
            weighted_sleep +
            weighted_routine +
            weighted_hydration
        )
        
        overall_score = round(overall_score, 2)
        overall_score = max(0.0, min(100.0, overall_score))
        
        return overall_score
    
    def get_score_category(self, score):
        """Determine the category for a given score."""
        if score >= 90:
            return "Excellent"
        elif score >= 75:
            return "Good"
        elif score >= 60:
            return "Fair"
        elif score >= 40:
            return "Needs Improvement"
        else:
            return "Poor"


def test_scoring_engine():
    """Test the scoring engine logic."""
    engine = SkinHealthScoringEngine()
    
    print("Testing Skin Health Scoring Engine")
    print("=" * 50)
    
    # Test 1: Example from requirements
    print("\nTest 1: Example calculation from requirements")
    condition = 72
    lifestyle = 80
    sleep = 65
    routine = 90
    hydration = 70
    
    expected = (
        72 * 0.35 +    # 25.20
        80 * 0.20 +    # 16.00
        65 * 0.15 +    # 9.75
        90 * 0.20 +    # 18.00
        70 * 0.10      # 7.00
    )
    expected = round(expected, 2)  # 75.95
    
    result = engine.calculate_overall_score(condition, lifestyle, sleep, routine, hydration)
    
    print(f"  Input: condition={condition}, lifestyle={lifestyle}, sleep={sleep}, routine={routine}, hydration={hydration}")
    print(f"  Expected: {expected}")
    print(f"  Result: {result}")
    print(f"  ✅ PASS" if result == expected else f"  ❌ FAIL")
    
    # Test 2: All scores = 100
    print("\nTest 2: All scores = 100")
    result = engine.calculate_overall_score(100, 100, 100, 100, 100)
    print(f"  Result: {result}")
    print(f"  Expected: 100.0")
    print(f"  ✅ PASS" if result == 100.0 else f"  ❌ FAIL")
    
    # Test 3: All scores = 0
    print("\nTest 3: All scores = 0")
    result = engine.calculate_overall_score(0, 0, 0, 0, 0)
    print(f"  Result: {result}")
    print(f"  Expected: 0.0")
    print(f"  ✅ PASS" if result == 0.0 else f"  ❌ FAIL")
    
    # Test 4: Weight application
    print("\nTest 4: Weight application")
    condition_only = engine.calculate_overall_score(100, 0, 0, 0, 0)
    lifestyle_only = engine.calculate_overall_score(0, 100, 0, 0, 0)
    sleep_only = engine.calculate_overall_score(0, 0, 100, 0, 0)
    routine_only = engine.calculate_overall_score(0, 0, 0, 100, 0)
    hydration_only = engine.calculate_overall_score(0, 0, 0, 0, 100)
    
    print(f"  Condition only (100,0,0,0,0): {condition_only} (expected 35.0)")
    print(f"  Lifestyle only (0,100,0,0,0): {lifestyle_only} (expected 20.0)")
    print(f"  Sleep only (0,0,100,0,0): {sleep_only} (expected 15.0)")
    print(f"  Routine only (0,0,0,100,0): {routine_only} (expected 20.0)")
    print(f"  Hydration only (0,0,0,0,100): {hydration_only} (expected 10.0)")
    
    weight_tests_pass = (
        condition_only == 35.0 and
        lifestyle_only == 20.0 and
        sleep_only == 15.0 and
        routine_only == 20.0 and
        hydration_only == 10.0
    )
    print(f"  ✅ PASS" if weight_tests_pass else f"  ❌ FAIL")
    
    # Test 5: Score categories
    print("\nTest 5: Score categories")
    test_cases = [
        (95, "Excellent"),
        (80, "Good"),
        (65, "Fair"),
        (50, "Needs Improvement"),
        (25, "Poor"),
        (90, "Excellent"),
        (75, "Good"),
        (60, "Fair"),
        (40, "Needs Improvement"),
        (39, "Poor")
    ]
    
    category_tests_pass = True
    for score, expected_category in test_cases:
        result_category = engine.get_score_category(score)
        status = "✅" if result_category == expected_category else "❌"
        print(f"  {status} Score {score}: {result_category} (expected {expected_category})")
        if result_category != expected_category:
            category_tests_pass = False
    
    print(f"  Overall: ✅ PASS" if category_tests_pass else f"  Overall: ❌ FAIL")
    
    # Test 6: Boundary handling
    print("\nTest 6: Boundary handling")
    # Test with scores > 100
    result = engine.calculate_overall_score(150, 120, 110, 130, 105)
    print(f"  Scores > 100: {result} (expected 100.0)")
    print(f"  ✅ PASS" if result == 100.0 else f"  ❌ FAIL")
    
    # Test with negative scores
    result = engine.calculate_overall_score(-10, -20, -5, -15, -30)
    print(f"  Negative scores: {result} (expected 0.0)")
    print(f"  ✅ PASS" if result == 0.0 else f"  ❌ FAIL")
    
    print("\n" + "=" * 50)
    print("Testing complete!")

if __name__ == "__main__":
    test_scoring_engine()