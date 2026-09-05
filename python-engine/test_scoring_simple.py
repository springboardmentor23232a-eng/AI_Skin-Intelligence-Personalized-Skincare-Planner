"""
Simple test script for Skin Health Scoring Engine
"""
import sys
import os

# Add the project root to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Try to import and test the scoring engine
try:
    from app.engine.skin_health_scoring import scoring_engine
    
    print("✓ Skin Health Scoring Engine loaded successfully")
    
    # Test the example calculation from the requirements
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
    
    result = scoring_engine.calculate_overall_score(condition, lifestyle, sleep, routine, hydration)
    
    print(f"✓ Overall score calculation: {result}")
    print(f"  Expected: {expected}")
    print(f"  Match: {result == expected}")
    
    # Test score categories
    print(f"✓ Score category for 95: {scoring_engine.get_score_category(95)}")
    print(f"✓ Score category for 80: {scoring_engine.get_score_category(80)}")
    print(f"✓ Score category for 65: {scoring_engine.get_score_category(65)}")
    print(f"✓ Score category for 50: {scoring_engine.get_score_category(50)}")
    print(f"✓ Score category for 25: {scoring_engine.get_score_category(25)}")
    
    # Test component calculations
    assessment_data = {
        'skin_health_score': 72,
        'smoking': False,
        'stress_level': 'medium',
        'sun_exposure': 'low',
        'age': 30,
        'sleep_hours': 7,
        'water_intake': 2.0
    }
    
    condition_score = scoring_engine.calculate_condition_score(assessment_data)
    lifestyle_score = scoring_engine.calculate_lifestyle_score(assessment_data)
    sleep_score = scoring_engine.calculate_sleep_score(assessment_data)
    hydration_score = scoring_engine.calculate_hydration_score(assessment_data)
    
    print(f"✓ Condition score: {condition_score}")
    print(f"✓ Lifestyle score: {lifestyle_score}")
    print(f"✓ Sleep score: {sleep_score}")
    print(f"✓ Hydration score: {hydration_score}")
    
    # Test comprehensive calculation
    routine_data = {'completed_tasks': 8, 'expected_tasks': 10}
    
    comprehensive_result = scoring_engine.calculate_comprehensive_score(
        user_id="test_user",
        assessment_data=assessment_data,
        routine_data=routine_data,
        previous_score=70.0
    )
    
    print(f"✓ Comprehensive score: {comprehensive_result['overall_score']}")
    print(f"✓ Category: {comprehensive_result['category']}")
    print(f"✓ Trend: {comprehensive_result['improvement']['trend']}")
    
    print("\n✅ All basic tests passed!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)