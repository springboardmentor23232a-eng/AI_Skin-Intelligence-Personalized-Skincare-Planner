"""
Skincare Routine Generator Service
Handles AI-powered personalized skincare routine generation using Groq
"""
import os
from typing import List, Dict, Optional, Tuple
from groq import Groq
import json

class RoutineGenerator:
    def __init__(self):
        # Try to get API key from environment
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        
        # If not found, try alternative environment variable names
        if not self.groq_api_key:
            self.groq_api_key = os.getenv("GROQ_API")
        
        # For development, you can also set it directly (remove in production)
        if not self.groq_api_key:
            # Fallback to a default key for testing (should be removed in production)
            self.groq_api_key = "your_groq_api_key_here"
        
        if self.groq_api_key and self.groq_api_key != "your_groq_api_key_here":
            try:
                self.client = Groq(api_key=self.groq_api_key)
                print("Groq AI client initialized successfully")
            except Exception as e:
                print(f"Warning: Failed to initialize Groq client: {e}")
                self.client = None
        else:
            self.client = None
            print("Warning: GROQ_API_KEY not found or invalid, AI features will use fallback recommendations")
    
    def should_update_routine(self, old_assessment: dict, new_assessment: dict) -> tuple[bool, str]:
        """
        Determine if a routine should be updated based on assessment changes.
        Returns (should_update, reason)
        """
        significant_changes = []
        
        # Check skin type changes
        if old_assessment.get('skin_type') != new_assessment.get('skin_type'):
            significant_changes.append(f"Skin type changed from {old_assessment.get('skin_type')} to {new_assessment.get('skin_type')}")
        
        # Check skin health score changes (significant if change > 10 points)
        old_score = old_assessment.get('skin_health_score', 0)
        new_score = new_assessment.get('skin_health_score', 0)
        if abs(old_score - new_score) > 10:
            significant_changes.append(f"Skin health score changed from {old_score} to {new_score}")
        
        # Check concern severity changes
        old_concerns = set(old_assessment.get('skin_concerns', []))
        new_concerns = set(new_assessment.get('skin_concerns', []))
        
        if old_concerns != new_concerns:
            added_concerns = new_concerns - old_concerns
            removed_concerns = old_concerns - new_concerns
            
            if added_concerns:
                significant_changes.append(f"New concerns added: {', '.join(added_concerns)}")
            if removed_concerns:
                significant_changes.append(f"Concerns resolved: {', '.join(removed_concerns)}")
        
        # Check allergy changes
        old_allergies = set(old_assessment.get('allergies', []))
        new_allergies = set(new_assessment.get('allergies', []))
        
        if old_allergies != new_allergies:
            significant_changes.append("Allergies updated - product recommendations need adjustment")
        
        # Check lifestyle changes
        old_lifestyle = old_assessment.get('lifestyle_factors', {})
        new_lifestyle = new_assessment.get('lifestyle_factors', {})
        
        lifestyle_changes = []
        for key in ['diet', 'exercise', 'stress']:
            if old_lifestyle.get(key) != new_lifestyle.get(key):
                lifestyle_changes.append(f"{key} changed")
        
        if lifestyle_changes:
            significant_changes.append(f"Lifestyle factors changed: {', '.join(lifestyle_changes)}")
        
        should_update = len(significant_changes) > 0
        reason = "; ".join(significant_changes) if significant_changes else "No significant changes"
        
        return should_update, reason
    
    def adapt_routine_for_changes(self, existing_routine: dict, new_assessment: dict) -> dict:
        """
        Adapt an existing routine based on new assessment data.
        This makes intelligent adjustments rather than completely regenerating.
        """
        old_factors = existing_routine.get('personalized_factors', {})
        existing_steps = existing_routine.get('routine_steps', [])
        
        # Check if update is needed
        should_update, reason = self.should_update_routine(old_factors, new_assessment)
        
        if not should_update:
            return {
                'updated': False,
                'reason': reason,
                'routine': existing_routine
            }
        
        # Make adaptive changes
        adapted_steps = []
        step_changes = []
        
        for step in existing_steps:
            adapted_step = step.copy()
            category = step.get('category')
            step_name = step.get('step_name')
            
            # Adapt based on assessment changes
            if category == 'treatment':
                # Adjust treatment intensity based on health score and concerns
                new_concerns = new_assessment.get('skin_concerns', [])
                old_concerns = old_factors.get('skin_concerns', [])
                
                # If acne severity reduced (concern removed or health improved)
                if 'acne' in old_concerns and 'acne' not in new_concerns:
                    adapted_step['step_name'] = adapted_step['step_name'].replace('Acne Treatment', 'Maintenance Treatment')
                    adapted_step['description'] = "Use maintenance treatment to prevent acne recurrence"
                    step_changes.append("Reduced acne treatment intensity")
                
                # If new concern added
                if 'acne' in new_concerns and 'acne' not in old_concerns:
                    adapted_step['step_name'] = f"Acne Treatment - {adapted_step['step_name']}"
                    adapted_step['description'] = "Add acne-focused treatment to address new concern"
                    step_changes.append("Added acne treatment for new concern")
                
                # Adjust based on health score
                old_score = old_factors.get('skin_health_score', 70)
                new_score = new_assessment.get('skin_health_score', 70)
                
                if new_score > old_score + 10:
                    # Skin improved - reduce intensive treatments
                    if 'Intensive' in step_name or 'Strong' in step_name:
                        adapted_step['step_name'] = step_name.replace('Intensive', 'Gentle').replace('Strong', 'Mild')
                        step_changes.append("Reduced treatment intensity due to improved skin health")
                
                elif new_score < old_score - 10:
                    # Skin worsened - increase treatment intensity
                    if 'Gentle' in step_name or 'Mild' in step_name:
                        adapted_step['step_name'] = step_name.replace('Gentle', 'Intensive').replace('Mild', 'Strong')
                        step_changes.append("Increased treatment intensity due to skin health decline")
            
            elif category == 'exfoliation':
                # Adjust exfoliation frequency based on skin health
                old_score = old_factors.get('skin_health_score', 70)
                new_score = new_assessment.get('skin_health_score', 70)
                
                if new_score < old_score - 15:
                    # Skin sensitivity increased - reduce exfoliation
                    if '2-3x' in step_name:
                        adapted_step['step_name'] = step_name.replace('2-3x', '1x')
                        adapted_step['description'] = "Reduce exfoliation frequency due to increased skin sensitivity"
                        step_changes.append("Reduced exfoliation frequency")
                
                elif new_score > old_score + 15:
                    # Skin resilience improved - can handle more exfoliation
                    if '1x' in step_name or '1-2x' in step_name:
                        adapted_step['step_name'] = step_name.replace('1x', '2-3x').replace('1-2x', '2-3x')
                        step_changes.append("Increased exfoliation frequency")
            
            elif category == 'moisturizing':
                # Adjust moisturizer based on skin type changes
                old_type = old_factors.get('skin_type', 'normal')
                new_type = new_assessment.get('skin_type', 'normal')
                
                if old_type != new_type:
                    if new_type == 'dry':
                        adapted_step['step_name'] = 'Rich Moisturizer'
                        adapted_step['description'] = "Use richer, cream-based moisturizer for dry skin"
                        step_changes.append(f"Switched to moisturizer for {new_type} skin")
                    elif new_type == 'oily':
                        adapted_step['step_name'] = 'Oil-Free Moisturizer'
                        adapted_step['description'] = "Use lightweight, oil-free moisturizer for oily skin"
                        step_changes.append(f"Switched to moisturizer for {new_type} skin")
            
            # Filter out allergens if they changed
            old_allergies = set(old_factors.get('allergies', []))
            new_allergies = set(new_assessment.get('allergies', []))
            
            if new_allergies - old_allergies:  # New allergies added
                new_allergens = new_allergies - old_allergies
                description = adapted_step.get('description', '')
                
                for allergen in new_allergens:
                    if allergen.lower() in description.lower():
                        adapted_step['description'] = description + f" (Avoid: {allergen})"
                        step_changes.append(f"Filtered out products containing {allergen}")
            
            adapted_steps.append(adapted_step)
        
        # Update personalized factors
        updated_routine = existing_routine.copy()
        updated_routine['routine_steps'] = adapted_steps
        updated_routine['personalized_factors'] = new_assessment
        # Don't set updated_at here, let the database handle it
        # updated_routine['updated_at'] = datetime.utcnow().isoformat()
        
        return {
            'updated': True,
            'reason': reason,
            'changes': step_changes,
            'routine': updated_routine
        }

    def generate_routine(self, request_data: dict) -> dict:
        """
        Generate a personalized skincare routine based on user data and AI recommendations
        """
        routine_type = request_data.get('routine_type', 'morning')
        skin_type = request_data.get('skin_type', 'normal')
        skin_concerns = request_data.get('skin_concerns', [])
        skin_health_score = request_data.get('skin_health_score', 70)
        allergies = request_data.get('allergies', [])
        lifestyle_factors = request_data.get('lifestyle_factors', {})
        season = request_data.get('season', 'all')
        
        # Generate routine based on type
        if routine_type == 'morning':
            routine_steps = self._generate_morning_routine(skin_type, skin_concerns, allergies)
        elif routine_type == 'evening':
            routine_steps = self._generate_evening_routine(skin_type, skin_concerns, allergies)
        elif routine_type == 'weekly':
            routine_steps = self._generate_weekly_routine(skin_type, skin_concerns, skin_health_score)
        elif routine_type == 'seasonal':
            routine_steps = self._generate_seasonal_routine(season, skin_type, skin_concerns)
        else:
            routine_steps = self._generate_morning_routine(skin_type, skin_concerns, allergies)
        
        # Get AI-powered personalization if available
        ai_recommendations = self._get_ai_personalization({
            'skin_type': skin_type,
            'skin_concerns': skin_concerns,
            'skin_health_score': skin_health_score,
            'allergies': allergies,
            'lifestyle_factors': lifestyle_factors,
            'routine_type': routine_type,
            'season': season,
            'routine_steps': routine_steps
        })
        
        # Merge AI recommendations with base routine
        if ai_recommendations:
            routine_steps = ai_recommendations.get('routine_steps', routine_steps)
            personalized_recommendations = ai_recommendations.get('personalized_recommendations', '')
            product_suggestions = ai_recommendations.get('product_suggestions', [])
            lifestyle_tips = ai_recommendations.get('lifestyle_tips', [])
        else:
            personalized_recommendations = self._get_default_recommendations(skin_type, skin_concerns)
            product_suggestions = self._get_default_products(skin_type, skin_concerns)
            lifestyle_tips = self._get_default_lifestyle_tips(lifestyle_factors)
        
        return {
            'routine_steps': routine_steps,
            'personalized_factors': {
                'skin_type': skin_type,
                'skin_concerns': skin_concerns,
                'skin_health_score': skin_health_score,
                'allergies': allergies,
                'lifestyle_factors': lifestyle_factors,
                'season': season
            },
            'products': product_suggestions,
            'personalized_recommendations': personalized_recommendations,
            'lifestyle_tips': lifestyle_tips
        }

    def _generate_morning_routine(self, skin_type: str, concerns: List[str], allergies: List[str]) -> List[dict]:
        """Generate morning skincare routine steps"""
        steps = [
            {
                'step_order': 1,
                'category': 'cleansing',
                'step_name': 'Gentle Cleanser',
                'description': self._get_cleanser_description(skin_type, 'morning'),
                'duration_minutes': 1
            },
            {
                'step_order': 2,
                'category': 'exfoliation',
                'step_name': 'Exfoliating Toner (2-3x/week)',
                'description': 'Use gentle exfoliating toner with AHAs/BHAs to remove dead skin cells',
                'duration_minutes': 1
            },
            {
                'step_order': 3,
                'category': 'treatment',
                'step_name': 'Treatment Serum',
                'description': self._get_treatment_description(concerns, 'morning'),
                'duration_minutes': 2
            },
            {
                'step_order': 4,
                'category': 'moisturizing',
                'step_name': 'Moisturizer',
                'description': self._get_moisturizer_description(skin_type, 'morning'),
                'duration_minutes': 1
            },
            {
                'step_order': 5,
                'category': 'sun_protection',
                'step_name': 'Sunscreen SPF 30+',
                'description': 'Apply broad-spectrum sunscreen to protect from UV damage',
                'duration_minutes': 1
            }
        ]
        
        return self._filter_allergens(steps, allergies)

    def _generate_evening_routine(self, skin_type: str, concerns: List[str], allergies: List[str]) -> List[dict]:
        """Generate evening skincare routine steps"""
        steps = [
            {
                'step_order': 1,
                'category': 'cleansing',
                'step_name': 'Double Cleanse',
                'description': self._get_cleanser_description(skin_type, 'evening'),
                'duration_minutes': 2
            },
            {
                'step_order': 2,
                'category': 'exfoliation',
                'step_name': 'Exfoliating Treatment (1-2x/week)',
                'description': 'Use gentle exfoliating treatment to remove dead skin cells and promote cell turnover',
                'duration_minutes': 2
            },
            {
                'step_order': 3,
                'category': 'treatment',
                'step_name': 'Treatment Serum',
                'description': self._get_treatment_description(concerns, 'evening'),
                'duration_minutes': 2
            },
            {
                'step_order': 4,
                'category': 'moisturizing',
                'step_name': 'Night Moisturizer',
                'description': self._get_moisturizer_description(skin_type, 'evening'),
                'duration_minutes': 1
            },
            {
                'step_order': 5,
                'category': 'night_care',
                'step_name': 'Eye Cream',
                'description': 'Apply eye cream to hydrate and protect delicate eye area',
                'duration_minutes': 1
            },
            {
                'step_order': 6,
                'category': 'night_care',
                'step_name': 'Overnight Treatment',
                'description': 'Apply overnight treatment mask or sleeping pack for intensive repair',
                'duration_minutes': 1
            }
        ]
        
        return self._filter_allergens(steps, allergies)

    def _generate_weekly_routine(self, skin_type: str, concerns: List[str], health_score: int) -> List[dict]:
        """Generate weekly treatment plan"""
        steps = [
            {
                'step_order': 1,
                'category': 'cleansing',
                'step_name': 'Deep Cleansing (2x/week)',
                'description': 'Use deep cleansing mask or purifying cleanser to thoroughly clean pores',
                'duration_minutes': 5
            },
            {
                'step_order': 2,
                'category': 'exfoliation',
                'step_name': 'Weekly Exfoliation (1-2x/week)',
                'description': 'Use gentle chemical exfoliant to remove dead skin cells',
                'duration_minutes': 3
            },
            {
                'step_order': 3,
                'category': 'treatment',
                'step_name': 'Face Mask (1x/week)',
                'description': self._get_mask_recommendation(skin_type, concerns),
                'duration_minutes': 15
            },
            {
                'step_order': 4,
                'category': 'moisturizing',
                'step_name': 'Intensive Moisture Treatment (1x/week)',
                'description': 'Apply hydrating mask or overnight moisturizing treatment',
                'duration_minutes': 10
            },
            {
                'step_order': 5,
                'category': 'night_care',
                'step_name': 'Overnight Repair Treatment (1x/week)',
                'description': 'Apply intensive overnight treatment for skin repair and rejuvenation',
                'duration_minutes': 2
            },
            {
                'step_order': 6,
                'category': 'sun_protection',
                'step_name': 'After-Sun Recovery (as needed)',
                'description': 'Use after-sun recovery products if you had significant sun exposure',
                'duration_minutes': 5
            }
        ]
        
        return steps

    def _generate_seasonal_routine(self, season: str, skin_type: str, concerns: List[str]) -> List[dict]:
        """Generate seasonal skincare recommendations"""
        seasonal_advice = {
            'winter': [
                {
                    'step_order': 1,
                    'category': 'cleansing',
                    'step_name': 'Creamy Cleanser',
                    'description': 'Use gentle, creamy cleanser to avoid stripping natural oils',
                    'duration_minutes': 2
                },
                {
                    'step_order': 2,
                    'category': 'exfoliation',
                    'step_name': 'Gentle Exfoliation (1x/week)',
                    'description': 'Reduce exfoliation frequency to prevent irritation in cold weather',
                    'duration_minutes': 2
                },
                {
                    'step_order': 3,
                    'category': 'treatment',
                    'step_name': 'Hydrating Serum',
                    'description': 'Add hyaluronic acid serum for extra hydration',
                    'duration_minutes': 1
                },
                {
                    'step_order': 4,
                    'category': 'moisturizing',
                    'step_name': 'Rich Moisturizer',
                    'description': 'Use heavier, cream-based moisturizer to combat dryness',
                    'duration_minutes': 2
                },
                {
                    'step_order': 5,
                    'category': 'sun_protection',
                    'step_name': 'SPF 30+ (Still needed in winter)',
                    'description': 'Continue sun protection even in cloudy weather',
                    'duration_minutes': 1
                },
                {
                    'step_order': 6,
                    'category': 'night_care',
                    'step_name': 'Overnight Repair Mask',
                    'description': 'Use nourishing overnight mask to repair winter damage',
                    'duration_minutes': 2
                }
            ],
            'summer': [
                {
                    'step_order': 1,
                    'category': 'cleansing',
                    'step_name': 'Light Cleanser',
                    'description': 'Use lighter, gel-based cleanser to control oil',
                    'duration_minutes': 1
                },
                {
                    'step_order': 2,
                    'category': 'exfoliation',
                    'step_name': 'Exfoliating Toner (2-3x/week)',
                    'description': 'Increase exfoliation to manage oil and sweat buildup',
                    'duration_minutes': 1
                },
                {
                    'step_order': 3,
                    'category': 'treatment',
                    'step_name': 'Lightweight Serum',
                    'description': 'Use lightweight antioxidant serums for environmental protection',
                    'duration_minutes': 1
                },
                {
                    'step_order': 4,
                    'category': 'moisturizing',
                    'step_name': 'Light Moisturizer',
                    'description': 'Switch to lightweight, oil-free moisturizer',
                    'duration_minutes': 1
                },
                {
                    'step_order': 5,
                    'category': 'sun_protection',
                    'step_name': 'SPF 50+',
                    'description': 'Use high SPF sunscreen and reapply frequently',
                    'duration_minutes': 1
                },
                {
                    'step_order': 6,
                    'category': 'night_care',
                    'step_name': 'Calming Overnight Treatment',
                    'description': 'Use calming overnight treatment to repair sun exposure',
                    'duration_minutes': 1
                }
            ],
            'spring': [
                {
                    'step_order': 1,
                    'category': 'cleansing',
                    'step_name': 'Balancing Cleanser',
                    'description': 'Use balancing cleanser to adapt to changing weather',
                    'duration_minutes': 1
                },
                {
                    'step_order': 2,
                    'category': 'exfoliation',
                    'step_name': 'Gentle Exfoliation',
                    'description': 'Increase exfoliation to refresh skin after winter',
                    'duration_minutes': 2
                },
                {
                    'step_order': 3,
                    'category': 'treatment',
                    'step_name': 'Antioxidant Serum',
                    'description': 'Use vitamin C serum to protect against environmental damage',
                    'duration_minutes': 1
                },
                {
                    'step_order': 4,
                    'category': 'moisturizing',
                    'step_name': 'Lightweight Moisturizer',
                    'description': 'Transition to lighter moisturizer as weather warms',
                    'duration_minutes': 1
                },
                {
                    'step_order': 5,
                    'category': 'sun_protection',
                    'step_name': 'SPF 30+',
                    'description': 'Start consistent sun protection routine',
                    'duration_minutes': 1
                },
                {
                    'step_order': 6,
                    'category': 'night_care',
                    'step_name': 'Repair Night Cream',
                    'description': 'Use repairing night cream to address winter damage',
                    'duration_minutes': 1
                }
            ],
            'fall': [
                {
                    'step_order': 1,
                    'category': 'cleansing',
                    'step_name': 'Nourishing Cleanser',
                    'description': 'Start using more nourishing cleanser as weather cools',
                    'duration_minutes': 2
                },
                {
                    'step_order': 2,
                    'category': 'exfoliation',
                    'step_name': 'Gentle Exfoliation',
                    'description': 'Maintain gentle exfoliation routine',
                    'duration_minutes': 2
                },
                {
                    'step_order': 3,
                    'category': 'treatment',
                    'step_name': 'Repairing Serum',
                    'description': 'Use repairing serums to address summer sun damage',
                    'duration_minutes': 1
                },
                {
                    'step_order': 4,
                    'category': 'moisturizing',
                    'step_name': 'Transitional Moisturizer',
                    'description': 'Start using richer moisturizer to prepare for winter',
                    'duration_minutes': 2
                },
                {
                    'step_order': 5,
                    'category': 'sun_protection',
                    'step_name': 'SPF 30+',
                    'description': 'Continue sun protection even in cooler weather',
                    'duration_minutes': 1
                },
                {
                    'step_order': 6,
                    'category': 'night_care',
                    'step_name': 'Restorative Night Treatment',
                    'description': 'Use restorative overnight treatments for skin barrier repair',
                    'duration_minutes': 2
                }
            ]
        }
        
        return seasonal_advice.get(season.lower(), seasonal_advice['spring'])

    def _get_ai_personalization(self, data: dict) -> Optional[dict]:
        """Get AI-powered personalization using Groq"""
        if not self.client:
            return None
        
        try:
            prompt = self._build_ai_prompt(data)
            
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",  # Using Groq's Llama model
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional skincare expert specializing in personalized skincare routines. Provide detailed, evidence-based skincare recommendations."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1024
            )
            
            ai_response = response.choices[0].message.content
            return self._parse_ai_response(ai_response, data['routine_steps'])
            
        except Exception as e:
            print(f"Error getting AI personalization: {e}")
            return None

    def _build_ai_prompt(self, data: dict) -> str:
        """Build the prompt for AI personalization"""
        prompt = f"""
Generate a personalized skincare routine with the following details:

Skin Type: {data['skin_type']}
Skin Concerns: {', '.join(data['skin_concerns'])}
Skin Health Score: {data['skin_health_score']}/100
Allergies: {', '.join(data['allergies']) if data['allergies'] else 'None'}
Routine Type: {data['routine_type']}
Season: {data.get('season', 'N/A')}

Lifestyle Factors:
{json.dumps(data['lifestyle_factors'], indent=2)}

Current Routine Steps:
{json.dumps(data['routine_steps'], indent=2)}

Please provide:
1. Optimized routine steps (maintaining the same structure)
2. Personalized recommendations explaining why this routine works for this specific profile
3. Product suggestions with ingredient recommendations
4. Lifestyle tips to support the skincare routine

Format your response as JSON with this structure:
{{
    "routine_steps": [step objects with same structure as input],
    "personalized_recommendations": "detailed explanation",
    "product_suggestions": ["list of product types and key ingredients"],
    "lifestyle_tips": ["list of lifestyle recommendations"]
}}
"""
        return prompt

    def _parse_ai_response(self, ai_response: str, default_steps: List[dict]) -> dict:
        """Parse AI response and merge with default steps"""
        try:
            # Try to extract JSON from the response
            start_idx = ai_response.find('{')
            end_idx = ai_response.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = ai_response[start_idx:end_idx]
                parsed = json.loads(json_str)
                
                # Ensure routine_steps maintain proper structure
                if 'routine_steps' in parsed:
                    for i, step in enumerate(parsed['routine_steps']):
                        if 'step_order' not in step:
                            step['step_order'] = i + 1
                        else:
                            # Ensure step_order is always an integer
                            step['step_order'] = int(step['step_order'])
                        if 'category' not in step:
                            step['category'] = 'treatment'
                        if 'step_name' not in step:
                            step['step_name'] = 'Treatment Step'
                        if 'duration_minutes' not in step:
                            step['duration_minutes'] = 1
                        else:
                            # Ensure duration_minutes is always an integer
                            step['duration_minutes'] = int(step['duration_minutes'])
                
                return parsed
        except Exception as e:
            print(f"Error parsing AI response: {e}")
        
        # Return default if parsing fails
        return {
            'routine_steps': default_steps,
            'personalized_recommendations': 'AI personalization unavailable. Using standard recommendations.',
            'product_suggestions': [],
            'lifestyle_tips': []
        }

    def _get_cleanser_description(self, skin_type: str, time_of_day: str) -> str:
        """Get cleanser description based on skin type"""
        cleanser_info = {
            'oily': 'Use foaming or gel cleanser to control excess oil',
            'dry': 'Use creamy, hydrating cleanser to maintain moisture barrier',
            'combination': 'Use gentle gel-cream cleanser for balanced cleansing',
            'normal': 'Use gentle cleanser that maintains skin balance',
            'sensitive': 'Use fragrance-free, hypoallergenic gentle cleanser'
        }
        return cleanser_info.get(skin_type, 'Use gentle cleanser suitable for your skin type')

    def _get_treatment_description(self, concerns: List[str], time_of_day: str) -> str:
        """Get treatment description based on concerns"""
        concern_treatments = {
            'acne': 'Use salicylic acid or benzoyl peroxide for acne treatment',
            'aging': 'Use retinol or peptide serum for anti-aging benefits',
            'dark_spots': 'Use vitamin C serum or niacinamide for brightening',
            'dullness': 'Use glycolic acid or vitamin C for radiance',
            'dryness': 'Use hyaluronic acid for hydration',
            'sensitivity': 'Use soothing ingredients like aloe vera or chamomile'
        }
        
        treatments = []
        for concern in concerns:
            if concern.lower() in concern_treatments:
                treatments.append(concern_treatments[concern.lower()])
        
        if treatments:
            return ' | '.join(treatments)
        return 'Use treatment serum targeting your specific skin concerns'

    def _get_moisturizer_description(self, skin_type: str, time_of_day: str) -> str:
        """Get moisturizer description based on skin type"""
        moisturizer_info = {
            'oily': 'Use lightweight, oil-free moisturizer or gel formula',
            'dry': 'Use rich, cream-based moisturizer with ceramides',
            'combination': 'Use balanced moisturizer that hydrates without being heavy',
            'normal': 'Use lightweight moisturizer that maintains skin balance',
            'sensitive': 'Use fragrance-free, hypoallergenic moisturizer'
        }
        return moisturizer_info.get(skin_type, 'Use moisturizer suitable for your skin type')

    def _get_mask_recommendation(self, skin_type: str, concerns: List[str]) -> str:
        """Get face mask recommendation"""
        if 'acne' in concerns:
            return 'Use clay mask to detoxify and clear pores'
        elif 'dryness' in concerns or skin_type == 'dry':
            return 'Use hydrating sheet mask or cream mask'
        elif 'dullness' in concerns:
            return 'Use brightening mask with vitamin C or enzymes'
        elif 'aging' in concerns:
            return 'Use anti-aging mask with peptides or retinol'
        else:
            return 'Use hydrating mask suitable for your skin type'

    def _filter_allergens(self, steps: List[dict], allergies: List[str]) -> List[dict]:
        """Filter out products that contain allergens"""
        if not allergies:
            return steps
        
        # Simple allergen filtering - in production, this would be more sophisticated
        allergen_keywords = {
            'fragrance': ['fragrance', 'perfume', 'scent'],
            'parabens': ['paraben', 'methylparaben', 'propylparaben'],
            'sulfates': ['sulfate', 'sls', 'sles'],
            'alcohol': ['alcohol', 'denatured alcohol', 'isopropyl alcohol']
        }
        
        filtered_steps = []
        for step in steps:
            step_description = step.get('description', '').lower()
            step_allergens = []
            
            for allergy in allergies:
                allergy_lower = allergy.lower()
                if allergy_lower in allergen_keywords:
                    keywords = allergen_keywords[allergy_lower]
                    if any(keyword in step_description for keyword in keywords):
                        step_allergens.append(allergy)
            
            if not step_allergens:
                filtered_steps.append(step)
            else:
                # Add note about allergen
                step['description'] += f' (Avoid: {", ".join(step_allergens)})'
                filtered_steps.append(step)
        
        return filtered_steps

    def _get_default_recommendations(self, skin_type: str, concerns: List[str]) -> str:
        """Get default recommendations when AI is unavailable"""
        return f"Based on your {skin_type} skin type and concerns ({', '.join(concerns)}), this routine focuses on balancing your skin while addressing specific issues."

    def _get_default_products(self, skin_type: str, concerns: List[str]) -> List[str]:
        """Get default product suggestions"""
        products = []
        
        # Base products
        if skin_type == 'oily':
            products.extend(['Foaming cleanser', 'Oil-free moisturizer', 'Salicylic acid treatment'])
        elif skin_type == 'dry':
            products.extend(['Hydrating cleanser', 'Rich moisturizer', 'Hyaluronic acid serum'])
        elif skin_type == 'combination':
            products.extend(['Gel-cream cleanser', 'Balanced moisturizer', 'Niacinamide serum'])
        else:
            products.extend(['Gentle cleanser', 'Lightweight moisturizer', 'Vitamin C serum'])
        
        # Concern-specific products
        for concern in concerns:
            if concern == 'acne':
                products.append('Benzoyl peroxide spot treatment')
            elif concern == 'aging':
                products.append('Retinol serum')
            elif concern == 'dark_spots':
                products.append('Vitamin C serum')
        
        return products

    def _get_default_lifestyle_tips(self, lifestyle_factors: dict) -> List[str]:
        """Get default lifestyle tips"""
        tips = [
            'Drink 8 glasses of water daily for hydration',
            'Get 7-8 hours of quality sleep',
            'Manage stress through meditation or exercise',
            'Avoid touching your face throughout the day'
        ]
        
        if lifestyle_factors:
            if lifestyle_factors.get('diet') == 'poor':
                tips.append('Incorporate more fruits and vegetables into your diet')
            if lifestyle_factors.get('exercise') == 'low':
                tips.append('Increase physical activity to improve circulation')
            if lifestyle_factors.get('smoking'):
                tips.append('Consider quitting smoking to improve skin health')
        
        return tips