"""
Skin Health Scoring Engine
Calculates comprehensive skin health scores using weighted component analysis.

Weighted Formula:
- Skin Condition Assessment: 35%
- Lifestyle Habits: 20%
- Sleep Quality: 15%
- Routine Consistency: 20%
- Hydration Level: 10%
"""

from typing import Dict, Optional, Tuple
from datetime import datetime, timedelta
import math


class SkinHealthScoringEngine:
    """
    Main scoring engine for calculating comprehensive skin health scores.
    """
    
    # Weight constants for the scoring formula
    WEIGHT_CONDITION = 0.35
    WEIGHT_LIFESTYLE = 0.20
    WEIGHT_SLEEP = 0.15
    WEIGHT_ROUTINE = 0.20
    WEIGHT_HYDRATION = 0.10
    
    # Score category boundaries
    CATEGORY_EXCELLENT_MIN = 90
    CATEGORY_GOOD_MIN = 75
    CATEGORY_FAIR_MIN = 60
    CATEGORY_NEEDS_IMPROVEMENT_MIN = 40
    
    # Trend calculation threshold (percentage change below this is considered stable)
    TREND_THRESHOLD = 2.0
    
    def __init__(self):
        """Initialize the scoring engine."""
        pass
    
    def calculate_overall_score(
        self,
        condition_score: float,
        lifestyle_score: float,
        sleep_score: float,
        routine_score: float,
        hydration_score: float
    ) -> float:
        """
        Calculate the overall weighted skin health score.
        
        Args:
            condition_score: Skin condition score (0-100)
            lifestyle_score: Lifestyle score (0-100)
            sleep_score: Sleep quality score (0-100)
            routine_score: Routine consistency score (0-100)
            hydration_score: Hydration level score (0-100)
            
        Returns:
            Overall weighted score (0-100)
        """
        # Apply weights to each component
        weighted_condition = condition_score * self.WEIGHT_CONDITION
        weighted_lifestyle = lifestyle_score * self.WEIGHT_LIFESTYLE
        weighted_sleep = sleep_score * self.WEIGHT_SLEEP
        weighted_routine = routine_score * self.WEIGHT_ROUTINE
        weighted_hydration = hydration_score * self.WEIGHT_HYDRATION
        
        # Calculate overall score
        overall_score = (
            weighted_condition +
            weighted_lifestyle +
            weighted_sleep +
            weighted_routine +
            weighted_hydration
        )
        
        # CRITICAL CASE HANDLING: Apply severe penalties for extreme unhealthy conditions
        critical_penalty = 0.0
        
        # Critical dehydration: 0 water intake or < 0.5L
        if hydration_score == 0.0:
            critical_penalty += 15.0  # Massive penalty for zero water intake
        
        # Critical sleep deprivation: < 3 hours
        if sleep_score <= 20.0:
            critical_penalty += 15.0  # Massive penalty for extreme sleep deprivation
        
        # Apply critical penalty
        overall_score -= critical_penalty
        
        # Round to 2 decimal places and clamp to 0-100
        overall_score = round(overall_score, 2)
        overall_score = max(0.0, min(100.0, overall_score))
        
        return overall_score
    
    def get_score_category(self, score: float) -> str:
        """
        Determine the category for a given score.
        
        Args:
            score: Overall score (0-100)
            
        Returns:
            Category string: Excellent, Good, Fair, Needs Improvement, Poor
        """
        if score >= self.CATEGORY_EXCELLENT_MIN:
            return "Excellent"
        elif score >= self.CATEGORY_GOOD_MIN:
            return "Good"
        elif score >= self.CATEGORY_FAIR_MIN:
            return "Fair"
        elif score >= self.CATEGORY_NEEDS_IMPROVEMENT_MIN:
            return "Needs Improvement"
        else:
            return "Poor"
    
    def calculate_condition_score(self, assessment_data: Dict) -> float:
        """
        Calculate skin condition score from assessment data.
        
        Uses the existing skin health score from the assessment engine,
        converting it to a 0-100 scale where higher is better.
        
        Args:
            assessment_data: Dictionary containing assessment data including skin_health_score
            
        Returns:
            Condition score (0-100)
        """
        try:
            # Use existing skin health score from assessment
            existing_score = assessment_data.get('skin_health_score', 70)
            
            # The existing scoring engine already produces 0-100 where higher is better
            # So we can use it directly
            condition_score = float(existing_score)
            
            # Clamp to valid range
            condition_score = max(0.0, min(100.0, condition_score))
            
            return condition_score
            
        except Exception as e:
            # Default to neutral score if calculation fails
            return 70.0
    
    def calculate_lifestyle_score(self, assessment_data: Dict) -> float:
        """
        Calculate lifestyle score from assessment data.
        
        DOCUMENTATION OF LIFESTYLE FACTORS AND WEIGHTS:
        ================================================
        The original specification requires "Lifestyle Habits" as a 20% component
        but does not prescribe specific factors or weights. The following factors
        are based on common dermatological research and lifestyle impact on skin health:
        
        REQUIRED FACTORS (from existing assessment data):
        - Smoking status: -35 points (major skin damage factor - increased severity)
        - Stress level: -20 (high) / -10 (medium) points (cortisol impact on skin - increased severity)
        - Sun exposure: -20 (high) / -10 (medium) points (UV damage - increased severity)
        - Age factor: -10 (>50) / -5 (>35) points (natural aging process)
        
        OPTIONAL FACTORS (when available in extended tracking):
        - Exercise frequency (minutes per day): +5 (30+ minutes) / +2.5 (15-30 minutes) points
        - Diet type: +5 (balanced/mediterranean) / +2.5 (vegetarian/vegan) points  
        - Alcohol consumption: -15 (heavy) / -7.5 (regular) points
        
        RATIONALE:
        - Smoking: Significant vasoconstriction and collagen damage
        - Stress: Increases inflammation and cortisol, affecting skin barrier
        - Sun exposure: Primary cause of premature aging and DNA damage
        - Age: Natural decline in skin function and repair capacity
        - Exercise: Improves circulation and nutrient delivery to skin
        - Diet: Antioxidants and nutrients support skin health
        - Alcohol: Dehydrating and inflammatory effects on skin
        
        Args:
            assessment_data: Dictionary containing lifestyle factors
            
        Returns:
            Lifestyle score (0-100)
        """
        try:
            score = 100.0
            
            # Smoking penalty (increased for health impact)
            if assessment_data.get('smoking', False):
                score -= 35.0  # Increased from 25.0
            
            # Stress penalty (increased for health impact)
            stress_level = assessment_data.get('stress_level', 'low')
            if stress_level == 'high':
                score -= 20.0  # Increased from 15.0
            elif stress_level == 'medium':
                score -= 10.0  # Increased from 7.5
            
            # Sun exposure penalty (increased for health impact)
            sun_exposure = assessment_data.get('sun_exposure', 'low')
            if sun_exposure == 'high':
                score -= 20.0  # Increased from 15.0
            elif sun_exposure == 'medium':
                score -= 10.0  # Increased from 7.5
            
            # Age factor (older skin needs more care)
            age = assessment_data.get('age', 25)
            if age > 50:
                score -= 10.0
            elif age > 35:
                score -= 5.0
            
            # Exercise bonus (if available) - now in minutes per day
            exercise_frequency = assessment_data.get('exercise_frequency')
            if exercise_frequency:
                try:
                    exercise_minutes = float(exercise_frequency)
                    if exercise_minutes >= 30:
                        score += 5.0  # Active/very_active (30+ minutes)
                    elif exercise_minutes >= 15:
                        score += 2.5  # Moderate (15-30 minutes)
                except (ValueError, TypeError):
                    pass  # If exercise_frequency is not a number, skip
            
            # Diet bonus (if available)
            diet_type = assessment_data.get('diet_type')
            if diet_type:
                if diet_type in ['balanced', 'mediterranean']:
                    score += 5.0
                elif diet_type in ['vegetarian', 'vegan']:
                    score += 2.5
            
            # Alcohol penalty (if available)
            alcohol_consumption = assessment_data.get('alcohol_consumption')
            if alcohol_consumption:
                if alcohol_consumption == 'heavy':
                    score -= 15.0
                elif alcohol_consumption == 'regular':
                    score -= 7.5
            
            # Clamp to valid range
            score = max(0.0, min(100.0, score))
            
            return round(score, 2)
            
        except Exception as e:
            # Default to neutral score if calculation fails
            return 70.0
    
    def calculate_sleep_score(self, assessment_data: Dict) -> float:
        """
        Calculate sleep quality score from assessment data.
        
        Factors considered:
        - Sleep duration (ideal: 7-9 hours)
        - Sleep quality (if available)
        - Sleep consistency (if available)
        
        Args:
            assessment_data: Dictionary containing sleep data
            
        Returns:
            Sleep score (0-100)
        """
        try:
            score = 100.0
            
            # Sleep duration calculation
            sleep_hours = assessment_data.get('sleep_hours', 8.0)
            
            # Ideal sleep is 7-9 hours
            if 7 <= sleep_hours <= 9:
                # Perfect score for ideal sleep
                pass
            elif sleep_hours >= 6:
                # Slight penalty for 6-7 hours
                score -= 15.0  # Increased from 10.0
            elif sleep_hours >= 5:
                # Moderate penalty for 5-6 hours
                score -= 35.0  # Increased from 25.0
            elif sleep_hours >= 3:
                # Severe penalty for 3-5 hours
                score -= 60.0  # Increased from 50.0
            else:
                # Extreme penalty for less than 3 hours
                score -= 80.0  # Increased from 70.0
            
            # Sleep quality factor (if available)
            sleep_quality = assessment_data.get('sleep_quality')
            if sleep_quality:
                if sleep_quality == 'excellent':
                    score += 5.0
                elif sleep_quality == 'good':
                    pass  # Neutral
                elif sleep_quality == 'fair':
                    score -= 10.0
                elif sleep_quality == 'poor':
                    score -= 20.0
            
            # Clamp to valid range
            score = max(0.0, min(100.0, score))
            
            return round(score, 2)
            
        except Exception as e:
            # Default to neutral score if calculation fails
            return 70.0
    
    def calculate_routine_score(self, routine_data: Dict) -> float:
        """
        Calculate routine consistency score from routine tracking data.
        
        Calculation: (completed tasks / expected tasks) * 100
        
        Args:
            routine_data: Dictionary containing routine adherence data
            
        Returns:
            Routine consistency score (0-100)
        """
        try:
            # Get routine adherence data
            completed_tasks = routine_data.get('completed_tasks', 0)
            expected_tasks = routine_data.get('expected_tasks', 0)
            
            # Handle case where no expected tasks exist
            if expected_tasks == 0:
                # If no routine is set up, return neutral score
                return 70.0
            
            # Calculate adherence percentage
            if completed_tasks == 0:
                return 0.0
            
            adherence_percentage = (completed_tasks / expected_tasks) * 100.0
            
            # Clamp to valid range
            adherence_percentage = max(0.0, min(100.0, adherence_percentage))
            
            return round(adherence_percentage, 2)
            
        except Exception as e:
            # Default to neutral score if calculation fails
            return 70.0
    
    def calculate_hydration_score(self, assessment_data: Dict) -> float:
        """
        Calculate hydration score from water intake data.
        
        Calculation: (actual intake / target intake) * 100
        
        Args:
            assessment_data: Dictionary containing hydration data
            
        Returns:
            Hydration score (0-100)
        """
        try:
            # Get hydration data
            water_intake = assessment_data.get('water_intake', 2.0)  # in liters
            target_intake = assessment_data.get('target_intake', 2.5)  # default target: 2.5L
            
            # Handle case where target is 0 or invalid
            if target_intake <= 0:
                target_intake = 2.5  # Use default target
            
            # Calculate hydration percentage
            if water_intake <= 0:
                return 0.0  # Zero water intake = zero score
            
            # Additional penalty for very low water intake
            if water_intake < 1.0:
                # Less than 1L is extremely dehydrated
                hydration_percentage = (water_intake / target_intake) * 50.0  # Additional 50% penalty

            hydration_percentage = (water_intake / target_intake) * 100.0
            
            # Clamp to valid range (don't reward exceeding target)
            hydration_percentage = max(0.0, min(100.0, hydration_percentage))
            
            return round(hydration_percentage, 2)
            
        except Exception as e:
            # Default to neutral score if calculation fails
            return 70.0
    
    def calculate_improvement_metrics(
        self,
        current_score: float,
        previous_score: Optional[float]
    ) -> Dict[str, Optional[float]]:
        """
        Calculate improvement metrics comparing current score to previous score.
        
        Args:
            current_score: Current overall score
            previous_score: Previous overall score (can be None)
            
        Returns:
            Dictionary containing absolute_change, percentage_change, and trend
        """
        if previous_score is None or previous_score == 0:
            return {
                'absolute_change': None,
                'percentage_change': None,
                'trend': None
            }
        
        # Calculate absolute change
        absolute_change = current_score - previous_score
        
        # Calculate percentage change
        percentage_change = (absolute_change / previous_score) * 100.0
        
        # Determine trend
        if abs(percentage_change) < self.TREND_THRESHOLD:
            trend = "Stable"
        elif percentage_change > 0:
            trend = "Improving"
        else:
            trend = "Declining"
        
        return {
            'absolute_change': round(absolute_change, 2),
            'percentage_change': round(percentage_change, 2),
            'trend': trend
        }
    
    def calculate_comprehensive_score(
        self,
        user_id: str,
        assessment_data: Dict,
        routine_data: Optional[Dict] = None,
        previous_score: Optional[float] = None
    ) -> Dict:
        """
        Calculate comprehensive skin health score with all components.
        
        MISSING DATA HANDLING STRATEGY:
        ==================================
        When component data is missing, the system uses neutral defaults (70.0)
        but marks the score as having incomplete data. This ensures:
        1. Users always get a score even with partial data
        2. The score is marked as incomplete for transparency
        3. Missing components don't artificially inflate or deflate the score
        
        Alternative strategies considered:
        A) Renormalize weights based on available components
        B) Return error/incomplete status when data is missing
        C) Use neutral defaults (current approach)
        
        Current approach chosen because:
        - Provides immediate value to users
        - Encourages data completion over time
        - Maintains consistent 35/20/15/20/10 weight structure
        - Transparency through incomplete flag
        
        Args:
            user_id: User identifier
            assessment_data: Dictionary containing assessment data
            routine_data: Optional dictionary containing routine adherence data
            previous_score: Optional previous overall score for comparison
            
        Returns:
            Dictionary containing all score components and metrics
        """
        try:
            # Track data completeness
            data_completeness = {
                'condition': bool(assessment_data.get('skin_health_score')),
                'lifestyle': bool(assessment_data.get('smoking') or assessment_data.get('stress_level') or assessment_data.get('sun_exposure') or assessment_data.get('exercise_frequency')),
                'sleep': bool(assessment_data.get('sleep_hours')),
                'routine': bool(routine_data and routine_data.get('expected_tasks', 0) > 0),
                'hydration': bool(assessment_data.get('water_intake'))
            }
            
            # Calculate individual component scores
            condition_score = self.calculate_condition_score(assessment_data)
            lifestyle_score = self.calculate_lifestyle_score(assessment_data)
            sleep_score = self.calculate_sleep_score(assessment_data)
            
            # Use routine data if provided, otherwise use neutral score
            if routine_data:
                routine_score = self.calculate_routine_score(routine_data)
            else:
                # If no routine data, use neutral score
                routine_score = 70.0
            
            hydration_score = self.calculate_hydration_score(assessment_data)
            
            # Calculate overall weighted score
            overall_score = self.calculate_overall_score(
                condition_score,
                lifestyle_score,
                sleep_score,
                routine_score,
                hydration_score
            )
            
            # Determine category
            category = self.get_score_category(overall_score)
            
            # Calculate improvement metrics
            improvement = self.calculate_improvement_metrics(overall_score, previous_score)
            
            # Determine if score is complete
            is_complete = all(data_completeness.values())
            
            # Prepare calculation details
            calculation_details = {
                'weights': {
                    'condition': self.WEIGHT_CONDITION,
                    'lifestyle': self.WEIGHT_LIFESTYLE,
                    'sleep': self.WEIGHT_SLEEP,
                    'routine': self.WEIGHT_ROUTINE,
                    'hydration': self.WEIGHT_HYDRATION
                },
                'weighted_components': {
                    'condition': round(condition_score * self.WEIGHT_CONDITION, 2),
                    'lifestyle': round(lifestyle_score * self.WEIGHT_LIFESTYLE, 2),
                    'sleep': round(sleep_score * self.WEIGHT_SLEEP, 2),
                    'routine': round(routine_score * self.WEIGHT_ROUTINE, 2),
                    'hydration': round(hydration_score * self.WEIGHT_HYDRATION, 2)
                },
                'component_scores': {
                    'condition': condition_score,
                    'lifestyle': lifestyle_score,
                    'sleep': sleep_score,
                    'routine': routine_score,
                    'hydration': hydration_score
                },
                'data_completeness': data_completeness,
                'is_complete': is_complete
            }
            
            return {
                'user_id': user_id,
                'condition_score': condition_score,
                'lifestyle_score': lifestyle_score,
                'sleep_score': sleep_score,
                'routine_score': routine_score,
                'hydration_score': hydration_score,
                'overall_score': overall_score,
                'category': category,
                'previous_score': previous_score,
                'improvement': improvement,
                'calculation_details': calculation_details,
                'is_complete': is_complete
            }
            
        except Exception as e:
            # Return error information
            return {
                'error': str(e),
                'user_id': user_id,
                'overall_score': 0.0,
                'category': 'Error',
                'is_complete': False
            }
    
    def validate_score(self, score: float) -> float:
        """
        Validate and clamp a score to the valid range (0-100).
        
        Args:
            score: Score to validate
            
        Returns:
            Validated score clamped to 0-100
        """
        if score is None or math.isnan(score) or math.isinf(score):
            return 0.0
        
        return max(0.0, min(100.0, float(score)))


# Singleton instance for easy import
scoring_engine = SkinHealthScoringEngine()
