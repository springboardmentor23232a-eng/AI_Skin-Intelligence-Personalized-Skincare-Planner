"""
Unit tests for Skin Health Scoring Engine
Tests the comprehensive scoring system with weighted components.
"""

import pytest
import math
from app.engine.skin_health_scoring import SkinHealthScoringEngine, scoring_engine


class TestSkinHealthScoringEngine:
    """Test suite for Skin Health Scoring Engine."""
    
    def setup_method(self):
        """Setup test fixtures."""
        self.engine = SkinHealthScoringEngine()
    
    def test_overall_score_calculation_normal(self):
        """Test normal calculation with sample values."""
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
        
        result = self.engine.calculate_overall_score(
            condition, lifestyle, sleep, routine, hydration
        )
        
        assert result == expected, f"Expected {expected}, got {result}"
    
    def test_all_scores_100(self):
        """Test when all component scores are 100."""
        result = self.engine.calculate_overall_score(100, 100, 100, 100, 100)
        assert result == 100.0
    
    def test_all_scores_0(self):
        """Test when all component scores are 0."""
        result = self.engine.calculate_overall_score(0, 0, 0, 0, 0)
        assert result == 0.0
    
    def test_weight_application(self):
        """Test correct application of all weights."""
        # Test with single component at 100, others at 0
        condition_only = self.engine.calculate_overall_score(100, 0, 0, 0, 0)
        assert condition_only == 35.0  # 100 * 0.35
        
        lifestyle_only = self.engine.calculate_overall_score(0, 100, 0, 0, 0)
        assert lifestyle_only == 20.0  # 100 * 0.20
        
        sleep_only = self.engine.calculate_overall_score(0, 0, 100, 0, 0)
        assert sleep_only == 15.0  # 100 * 0.15
        
        routine_only = self.engine.calculate_overall_score(0, 0, 0, 100, 0)
        assert routine_only == 20.0  # 100 * 0.20
        
        hydration_only = self.engine.calculate_overall_score(0, 0, 0, 0, 100)
        assert hydration_only == 10.0  # 100 * 0.10
    
    def test_scores_outside_range_handled(self):
        """Test that scores outside 0-100 are handled correctly."""
        # Test with scores > 100
        result = self.engine.calculate_overall_score(150, 120, 110, 130, 105)
        assert result == 100.0  # Should be clamped to 100
        
        # Test with negative scores
        result = self.engine.calculate_overall_score(-10, -20, -5, -15, -30)
        assert result == 0.0  # Should be clamped to 0
    
    def test_score_category_boundaries(self):
        """Test score category boundaries."""
        # Excellent (90-100)
        assert self.engine.get_score_category(90) == "Excellent"
        assert self.engine.get_score_category(95) == "Excellent"
        assert self.engine.get_score_category(100) == "Excellent"
        assert self.engine.get_score_category(89.9) == "Good"
        
        # Good (75-89)
        assert self.engine.get_score_category(75) == "Good"
        assert self.engine.get_score_category(80) == "Good"
        assert self.engine.get_score_category(89) == "Good"
        assert self.engine.get_score_category(74.9) == "Fair"
        
        # Fair (60-74)
        assert self.engine.get_score_category(60) == "Fair"
        assert self.engine.get_score_category(70) == "Fair"
        assert self.engine.get_score_category(74) == "Fair"
        assert self.engine.get_score_category(59.9) == "Needs Improvement"
        
        # Needs Improvement (40-59)
        assert self.engine.get_score_category(40) == "Needs Improvement"
        assert self.engine.get_score_category(50) == "Needs Improvement"
        assert self.engine.get_score_category(59) == "Needs Improvement"
        assert self.engine.get_score_category(39.9) == "Poor"
        
        # Poor (0-39)
        assert self.engine.get_score_category(0) == "Poor"
        assert self.engine.get_score_category(20) == "Poor"
        assert self.engine.get_score_category(39) == "Poor"
    
    def test_condition_score_calculation(self):
        """Test skin condition score calculation."""
        # Test with existing skin health score
        assessment_data = {'skin_health_score': 85}
        result = self.engine.calculate_condition_score(assessment_data)
        assert result == 85.0
        
        # Test with missing data (should default to 70)
        assessment_data = {}
        result = self.engine.calculate_condition_score(assessment_data)
        assert result == 70.0
        
        # Test with boundary values
        assessment_data = {'skin_health_score': 0}
        result = self.engine.calculate_condition_score(assessment_data)
        assert result == 0.0
        
        assessment_data = {'skin_health_score': 100}
        result = self.engine.calculate_condition_score(assessment_data)
        assert result == 100.0
    
    def test_lifestyle_score_calculation(self):
        """Test lifestyle score calculation."""
        # Perfect lifestyle
        assessment_data = {
            'smoking': False,
            'stress_level': 'low',
            'sun_exposure': 'low',
            'age': 25,
            'exercise_frequency': 'active',
            'diet_type': 'balanced',
            'alcohol_consumption': 'none'
        }
        result = self.engine.calculate_lifestyle_score(assessment_data)
        assert result == 100.0
        
        # Poor lifestyle
        assessment_data = {
            'smoking': True,
            'stress_level': 'high',
            'sun_exposure': 'high',
            'age': 55,
            'exercise_frequency': 'sedentary',
            'diet_type': None,
            'alcohol_consumption': 'heavy'
        }
        result = self.engine.calculate_lifestyle_score(assessment_data)
        assert result < 50.0  # Should be significantly lower
        
        # Missing optional data
        assessment_data = {
            'smoking': False,
            'stress_level': 'medium',
            'sun_exposure': 'medium',
            'age': 30
        }
        result = self.engine.calculate_lifestyle_score(assessment_data)
        assert 0.0 <= result <= 100.0
    
    def test_sleep_score_calculation(self):
        """Test sleep score calculation."""
        # Perfect sleep (7-9 hours)
        assessment_data = {'sleep_hours': 8, 'sleep_quality': 'excellent'}
        result = self.engine.calculate_sleep_score(assessment_data)
        assert result == 100.0
        
        # Good sleep (7 hours)
        assessment_data = {'sleep_hours': 7, 'sleep_quality': 'good'}
        result = self.engine.calculate_sleep_score(assessment_data)
        assert result >= 90.0
        
        # Poor sleep (4 hours)
        assessment_data = {'sleep_hours': 4, 'sleep_quality': 'poor'}
        result = self.engine.calculate_sleep_score(assessment_data)
        assert result < 50.0
        
        # Missing quality data
        assessment_data = {'sleep_hours': 6}
        result = self.engine.calculate_sleep_score(assessment_data)
        assert 0.0 <= result <= 100.0
    
    def test_routine_score_calculation(self):
        """Test routine consistency score calculation."""
        # Perfect adherence
        routine_data = {'completed_tasks': 10, 'expected_tasks': 10}
        result = self.engine.calculate_routine_score(routine_data)
        assert result == 100.0
        
        # Partial adherence
        routine_data = {'completed_tasks': 5, 'expected_tasks': 10}
        result = self.engine.calculate_routine_score(routine_data)
        assert result == 50.0
        
        # No completion
        routine_data = {'completed_tasks': 0, 'expected_tasks': 10}
        result = self.engine.calculate_routine_score(routine_data)
        assert result == 0.0
        
        # No routine set up
        routine_data = {'completed_tasks': 0, 'expected_tasks': 0}
        result = self.engine.calculate_routine_score(routine_data)
        assert result == 70.0  # Default neutral score
        
        # Exceeding expected (should still be 100)
        routine_data = {'completed_tasks': 15, 'expected_tasks': 10}
        result = self.engine.calculate_routine_score(routine_data)
        assert result == 100.0
    
    def test_hydration_score_calculation(self):
        """Test hydration score calculation."""
        # Perfect hydration
        assessment_data = {'water_intake': 2.5, 'target_intake': 2.5}
        result = self.engine.calculate_hydration_score(assessment_data)
        assert result == 100.0
        
        # Half target
        assessment_data = {'water_intake': 1.25, 'target_intake': 2.5}
        result = self.engine.calculate_hydration_score(assessment_data)
        assert result == 50.0
        
        # No intake
        assessment_data = {'water_intake': 0, 'target_intake': 2.5}
        result = self.engine.calculate_hydration_score(assessment_data)
        assert result == 0.0
        
        # Exceeding target (should still be 100)
        assessment_data = {'water_intake': 4.0, 'target_intake': 2.5}
        result = self.engine.calculate_hydration_score(assessment_data)
        assert result == 100.0
        
        # Missing target (should use default)
        assessment_data = {'water_intake': 2.0}
        result = self.engine.calculate_hydration_score(assessment_data)
        assert 0.0 <= result <= 100.0
    
    def test_improvement_calculation(self):
        """Test improvement metrics calculation."""
        # Improving trend
        result = self.engine.calculate_improvement_metrics(80, 70)
        assert result['absolute_change'] == 10.0
        assert result['percentage_change'] == pytest.approx(14.29, rel=0.1)
        assert result['trend'] == "Improving"
        
        # Declining trend
        result = self.engine.calculate_improvement_metrics(70, 80)
        assert result['absolute_change'] == -10.0
        assert result['percentage_change'] == pytest.approx(-12.5, rel=0.1)
        assert result['trend'] == "Declining"
        
        # Stable trend (small change)
        result = self.engine.calculate_improvement_metrics(71, 70)
        assert result['absolute_change'] == 1.0
        assert result['percentage_change'] == pytest.approx(1.43, rel=0.1)
        assert result['trend'] == "Stable"
        
        # No previous score
        result = self.engine.calculate_improvement_metrics(75, None)
        assert result['absolute_change'] is None
        assert result['percentage_change'] is None
        assert result['trend'] is None
        
        # Previous score of 0
        result = self.engine.calculate_improvement_metrics(50, 0)
        assert result['absolute_change'] == 50.0
        assert result['percentage_change'] is None  # Can't calculate percentage with 0
        assert result['trend'] is None
    
    def test_improving_trend(self):
        """Test improving trend detection."""
        result = self.engine.calculate_improvement_metrics(85, 75)
        assert result['trend'] == "Improving"
    
    def test_stable_trend(self):
        """Test stable trend detection."""
        result = self.engine.calculate_improvement_metrics(71, 70)
        assert result['trend'] == "Stable"
    
    def test_declining_trend(self):
        """Test declining trend detection."""
        result = self.engine.calculate_improvement_metrics(65, 75)
        assert result['trend'] == "Declining"
    
    def test_comprehensive_score_calculation(self):
        """Test comprehensive score calculation with all components."""
        assessment_data = {
            'skin_health_score': 72,
            'smoking': False,
            'stress_level': 'medium',
            'sun_exposure': 'low',
            'age': 30,
            'sleep_hours': 7,
            'water_intake': 2.0
        }
        
        routine_data = {
            'completed_tasks': 8,
            'expected_tasks': 10
        }
        
        result = self.engine.calculate_comprehensive_score(
            user_id="test_user",
            assessment_data=assessment_data,
            routine_data=routine_data,
            previous_score=70.0
        )
        
        assert 'error' not in result
        assert result['overall_score'] > 0
        assert result['overall_score'] <= 100
        assert result['category'] in ["Excellent", "Good", "Fair", "Needs Improvement", "Poor"]
        assert 'components' in result['calculation_details']
        assert 'improvement' in result
        assert result['improvement']['trend'] is not None
    
    def test_missing_optional_data(self):
        """Test handling of missing optional data."""
        minimal_data = {
            'skin_health_score': 70
        }
        
        result = self.engine.calculate_comprehensive_score(
            user_id="test_user",
            assessment_data=minimal_data,
            routine_data=None,
            previous_score=None
        )
        
        assert 'error' not in result
        assert result['overall_score'] > 0
        # Should use default values for missing components
    
    def test_validate_score(self):
        """Test score validation."""
        # Valid scores
        assert self.engine.validate_score(50) == 50.0
        assert self.engine.validate_score(0) == 0.0
        assert self.engine.validate_score(100) == 100.0
        
        # Invalid scores
        assert self.engine.validate_score(150) == 100.0  # Clamped to max
        assert self.engine.validate_score(-10) == 0.0   # Clamped to min
        
        # None and special values
        assert self.engine.validate_score(None) == 0.0
        assert self.engine.validate_score(float('nan')) == 0.0
        assert self.engine.validate_score(float('inf')) == 0.0
        assert self.engine.validate_score(float('-inf')) == 0.0
    
    def test_singleton_instance(self):
        """Test that the singleton instance works correctly."""
        result = scoring_engine.calculate_overall_score(72, 80, 65, 90, 70)
        expected = 75.95
        assert result == expected


class TestEdgeCases:
    """Test edge cases and error handling."""
    
    def setup_method(self):
        """Setup test fixtures."""
        self.engine = SkinHealthScoringEngine()
    
    def test_division_by_zero_protection(self):
        """Test protection against division by zero."""
        # Routine calculation with zero expected tasks
        routine_data = {'completed_tasks': 5, 'expected_tasks': 0}
        result = self.engine.calculate_routine_score(routine_data)
        assert result == 70.0  # Default score
        
        # Hydration calculation with zero target
        assessment_data = {'water_intake': 2.0, 'target_intake': 0}
        result = self.engine.calculate_hydration_score(assessment_data)
        assert 0.0 <= result <= 100.0  # Should handle gracefully
    
    def test_no_previous_score(self):
        """Test handling when no previous score exists."""
        result = self.engine.calculate_improvement_metrics(75, None)
        assert result['absolute_change'] is None
        assert result['percentage_change'] is None
        assert result['trend'] is None
    
    def test_empty_assessment_data(self):
        """Test handling of empty assessment data."""
        result = self.engine.calculate_comprehensive_score(
            user_id="test_user",
            assessment_data={},
            routine_data=None,
            previous_score=None
        )
        
        # Should not crash and should return a valid score
        assert 'error' not in result or result['error'] is None
        assert 0.0 <= result.get('overall_score', 0) <= 100.0
    
    def test_corrupted_data_handling(self):
        """Test handling of corrupted or invalid data."""
        # Invalid data types
        corrupted_data = {
            'skin_health_score': 'invalid',
            'sleep_hours': 'not_a_number',
            'water_intake': None
        }
        
        result = self.engine.calculate_comprehensive_score(
            user_id="test_user",
            assessment_data=corrupted_data,
            routine_data=None,
            previous_score=None
        )
        
        # Should handle gracefully without crashing
        assert result is not None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])