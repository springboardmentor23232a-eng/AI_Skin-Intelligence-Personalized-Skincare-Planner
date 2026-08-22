"""
Ingredient Intelligence Module
Handles ingredient analysis, suitability assessment, interaction analysis, allergy detection, and education
"""
from typing import List, Dict, Optional, Tuple
import json
import os

try:
    from groq import Groq
except ModuleNotFoundError:
    Groq = None

class IngredientIntelligence:
    def __init__(self):
        # Initialize ingredient database with comprehensive ingredient information
        self.ingredient_database = self._initialize_ingredient_database()
        self.groq_client = None
        groq_api_key = os.getenv("GROQ_API_KEY") or os.getenv("GROQ_API")
        if Groq is not None and groq_api_key and groq_api_key != "your_groq_api_key_here":
            self.groq_client = Groq(api_key=groq_api_key)
        self.ingredient_aliases = {
            "niacinimide": "niacinamide",
            "nicotinamide": "niacinamide",
            "vitamin b3": "niacinamide",
            "hyaluronic acid": "hyaluronic_acid",
            "salicylic acid": "salicylic_acid",
            "ceramide np": "ceramide_np",
            "ceramide ap": "ceramide_ap",
            "ascorbic acid": "ascorbic_acid",
            "retinal": "retinaldehyde"
        }
        
    def _initialize_ingredient_database(self) -> Dict[str, dict]:
        """Initialize comprehensive ingredient database"""
        return {
            # Retinoids
            "retinol": {
                "category": "retinoids",
                "description": "A derivative of vitamin A that accelerates skin cell turnover and collagen production",
                "benefits": ["Anti-aging", "Reduces fine lines", "Improves skin texture", "Unclogs pores", "Reduces hyperpigmentation"],
                "concerns": ["Irritation", "Dryness", "Sun sensitivity", "Purging period"],
                "suitable_skin_types": ["normal", "oily", "combination"],
                "concentration_range": "0.1% - 1.0%",
                "interactions": [
                    {"ingredient": "ahas", "severity": "caution", "reason": "May increase irritation"},
                    {"ingredient": "bhAs", "severity": "caution", "reason": "May increase irritation"},
                    {"ingredient": "vitamin_c", "severity": "safe", "reason": "Can be used together but may cause irritation"}
                ],
                "common_allergens": ["retinoid sensitivity"],
                "educational_info": {
                    "what_it_does": "Speeds up cell turnover and boosts collagen production",
                    "how_to_use": "Apply at night, start with low concentration, use sunscreen daily",
                    "when_to_expect_results": "4-12 weeks for visible results",
                    "best_practices": "Start slowly, use every other night initially, avoid mixing with other actives"
                }
            },
            "retinaldehyde": {
                "category": "retinoids",
                "description": "A more potent form of retinoid that converts to retinoic acid in the skin",
                "benefits": ["Anti-aging", "Faster results than retinol", "Reduces acne", "Improves texture"],
                "concerns": ["Irritation", "Dryness", "Sun sensitivity"],
                "suitable_skin_types": ["normal", "oily", "combination"],
                "concentration_range": "0.05% - 0.1%",
                "interactions": [
                    {"ingredient": "ahas", "severity": "caution", "reason": "May increase irritation"},
                    {"ingredient": "bhAs", "severity": "caution", "reason": "May increase irritation"}
                ],
                "common_allergens": ["retinoid sensitivity"],
                "educational_info": {
                    "what_it_does": "More potent than retinol, converts directly to active form",
                    "how_to_use": "Apply at night, use sunscreen during day",
                    "when_to_expect_results": "2-8 weeks for visible results",
                    "best_practices": "Use less frequently than retinol due to potency"
                }
            },
            
            # Niacinamide
            "niacinamide": {
                "category": "niacinamide",
                "description": "Form of vitamin B3 that strengthens skin barrier and reduces inflammation",
                "benefits": ["Strengthens skin barrier", "Reduces inflammation", "Minimizes pores", "Controls oil", "Reduces hyperpigmentation"],
                "concerns": ["Rare irritation", "Flushing at high concentrations"],
                "suitable_skin_types": ["normal", "oily", "dry", "combination", "sensitive"],
                "concentration_range": "2% - 10%",
                "interactions": [
                    {"ingredient": "vitamin_c", "severity": "caution", "reason": "May reduce effectiveness of vitamin C at high pH"},
                    {"ingredient": "ahas", "severity": "safe", "reason": "Good combination for exfoliation and barrier support"}
                ],
                "common_allergens": ["rare"],
                "educational_info": {
                    "what_it_does": "Strengthens skin barrier, reduces inflammation, regulates oil production",
                    "how_to_use": "Can be used morning and night, compatible with most ingredients",
                    "when_to_expect_results": "2-4 weeks for visible improvements",
                    "best_practices": "Start with 5% concentration, can be layered with other products"
                }
            },
            
            # Vitamin C
            "vitamin_c": {
                "category": "vitamin_c",
                "description": "Powerful antioxidant that brightens skin and protects against environmental damage",
                "benefits": ["Brightens skin", "Reduces hyperpigmentation", "Antioxidant protection", "Collagen production", "Reduces sun damage"],
                "concerns": ["Irritation", "Stability issues", "Potential for oxidation"],
                "suitable_skin_types": ["normal", "oily", "dry", "combination"],
                "concentration_range": "10% - 20%",
                "interactions": [
                    {"ingredient": "niacinamide", "severity": "caution", "reason": "May reduce effectiveness at high pH"},
                    {"ingredient": "retinol", "severity": "safe", "reason": "Can be used in different times of day"},
                    {"ingredient": "ahas", "severity": "caution", "reason": "May increase irritation"}
                ],
                "common_allergens": ["sensitive skin"],
                "educational_info": {
                    "what_it_does": "Brightens skin, fights free radicals, boosts collagen",
                    "how_to_use": "Apply in morning before sunscreen, store in cool dark place",
                    "when_to_expect_results": "4-8 weeks for visible brightening",
                    "best_practices": "Use in morning, follow with sunscreen, check for oxidation (yellow color)"
                }
            },
            "ascorbic_acid": {
                "category": "vitamin_c",
                "description": "Most potent form of vitamin C, but least stable",
                "benefits": ["Most effective vitamin C form", "Brightening", "Antioxidant", "Collagen production"],
                "concerns": ["High irritation potential", "Instability", "Requires low pH"],
                "suitable_skin_types": ["normal", "oily", "combination"],
                "concentration_range": "10% - 20%",
                "interactions": [
                    {"ingredient": "niacinamide", "severity": "caution", "reason": "May form complex at high pH"},
                    {"ingredient": "retinol", "severity": "safe", "reason": "Use at different times"}
                ],
                "common_allergens": ["sensitive skin"],
                "educational_info": {
                    "what_it_does": "Most effective form of vitamin C for skin brightening",
                    "how_to_use": "Morning use, requires proper formulation and storage",
                    "when_to_expect_results": "4-6 weeks",
                    "best_practices": "Look for L-ascorbic acid in proper concentration and pH"
                }
            },
            
            # Hyaluronic Acid
            "hyaluronic_acid": {
                "category": "hyaluronic_acid",
                "description": "Humectant that attracts and retains moisture in the skin",
                "benefits": ["Hydration", "Plumps skin", "Reduces fine lines", "Improves skin texture", "Soothes skin"],
                "concerns": ["Rare", "Can cause dryness if not sealed with moisturizer"],
                "suitable_skin_types": ["normal", "oily", "dry", "combination", "sensitive"],
                "concentration_range": "0.1% - 2%",
                "interactions": [
                    {"ingredient": "retinol", "severity": "safe", "reason": "Helps counteract dryness from retinol"},
                    {"ingredient": "ahas", "severity": "safe", "reason": "Provides hydration after exfoliation"}
                ],
                "common_allergens": ["rare"],
                "educational_info": {
                    "what_it_does": "Attracts and holds moisture, plumps skin, reduces appearance of fine lines",
                    "how_to_use": "Apply to damp skin, follow with moisturizer to seal in hydration",
                    "when_to_expect_results": "Immediate hydration, long-term benefits in 4-6 weeks",
                    "best_practices": "Apply to damp skin, use consistently, layer with occlusive"
                }
            },
            "sodium_hyaluronate": {
                "category": "hyaluronic_acid",
                "description": "Salt form of hyaluronic acid with smaller molecular size for better penetration",
                "benefits": ["Better penetration", "Hydration", "Plumping", "Skin smoothing"],
                "concerns": ["Minimal"],
                "suitable_skin_types": ["normal", "oily", "dry", "combination", "sensitive"],
                "concentration_range": "0.1% - 2%",
                "interactions": [
                    {"ingredient": "all", "severity": "safe", "reason": "Compatible with all ingredients"}
                ],
                "common_allergens": ["rare"],
                "educational_info": {
                    "what_it_does": "Smaller molecule penetrates deeper, provides hydration",
                    "how_to_use": "Can be layered with other products",
                    "when_to_expect_results": "Immediate hydration",
                    "best_practices": "Apply to damp skin for maximum benefit"
                }
            },
            
            # Salicylic Acid
            "salicylic_acid": {
                "category": "salicylic_acid",
                "description": "BHA that exfoliates inside pores and reduces acne",
                "benefits": ["Unclogs pores", "Reduces acne", "Exfoliates", "Reduces inflammation", "Controls oil"],
                "concerns": ["Dryness", "Irritation", "Sun sensitivity", "Initial purging"],
                "suitable_skin_types": ["oily", "combination", "normal"],
                "concentration_range": "0.5% - 2%",
                "interactions": [
                    {"ingredient": "retinol", "severity": "caution", "reason": "May increase irritation"},
                    {"ingredient": "ahas", "severity": "caution", "reason": "May increase irritation"},
                    {"ingredient": "benzoyl_peroxide", "severity": "caution", "reason": "May increase irritation"}
                ],
                "common_allergens": ["aspirin sensitivity"],
                "educational_info": {
                    "what_it_does": "Oil-soluble exfoliant that penetrates pores, reduces acne",
                    "how_to_use": "Start with lower concentration, use sunscreen, can be drying",
                    "when_to_expect_results": "2-6 weeks for acne improvement",
                    "best_practices": "Start slowly, use every other day, follow with moisturizer"
                }
            },
            
            # Ceramides
            "ceramide_np": {
                "category": "ceramides",
                "description": "Lipid molecules that form the skin barrier and retain moisture",
                "benefits": ["Strengthens skin barrier", "Retains moisture", "Protects against environmental damage", "Soothes skin"],
                "concerns": ["Minimal"],
                "suitable_skin_types": ["normal", "dry", "combination", "sensitive"],
                "concentration_range": "0.1% - 1%",
                "interactions": [
                    {"ingredient": "all", "severity": "safe", "reason": "Compatible with all ingredients"}
                ],
                "common_allergens": ["rare"],
                "educational_info": {
                    "what_it_does": "Replenishes skin's natural lipids, strengthens barrier function",
                    "how_to_use": "Can be used morning and night, excellent for dry skin",
                    "when_to_expect_results": "Immediate improvement in hydration, barrier repair in 2-4 weeks",
                    "best_practices": "Use consistently, especially after exfoliation or retinoid use"
                }
            },
            "ceramide_ap": {
                "category": "ceramides",
                "description": "Another form of ceramide that supports skin barrier function",
                "benefits": ["Skin barrier support", "Moisture retention", "Skin protection"],
                "concerns": ["Minimal"],
                "suitable_skin_types": ["normal", "dry", "combination", "sensitive"],
                "concentration_range": "0.1% - 1%",
                "interactions": [
                    {"ingredient": "all", "severity": "safe", "reason": "Compatible with all ingredients"}
                ],
                "common_allergens": ["rare"],
                "educational_info": {
                    "what_it_does": "Works with other ceramides to strengthen skin barrier",
                    "how_to_use": "Combine with other ceramides for optimal results",
                    "when_to_expect_results": "2-4 weeks for barrier improvement",
                    "best_practices": "Look for ceramide complexes with multiple types"
                }
            },
            
            # Peptides
            "palmitoyl_pentapeptide_4": {
                "category": "peptides",
                "description": "Signal peptide that stimulates collagen production",
                "benefits": ["Anti-aging", "Collagen production", "Reduces fine lines", "Improves firmness"],
                "concerns": ["Minimal"],
                "suitable_skin_types": ["normal", "dry", "oily", "combination", "sensitive"],
                "concentration_range": "2% - 10%",
                "interactions": [
                    {"ingredient": "retinol", "severity": "safe", "reason": "Complementary anti-aging effects"},
                    {"ingredient": "vitamin_c", "severity": "safe", "reason": "Supports collagen production"}
                ],
                "common_allergens": ["rare"],
                "educational_info": {
                    "what_it_does": "Signals skin to produce more collagen, reduces appearance of fine lines",
                    "how_to_use": "Can be used morning and night, consistent use required",
                    "when_to_expect_results": "8-12 weeks for visible improvements",
                    "best_practices": "Use consistently, combine with sunscreen for best results"
                }
            },
            "copper_peptide": {
                "category": "peptides",
                "description": "Peptide complex that promotes wound healing and collagen production",
                "benefits": ["Wound healing", "Collagen production", "Anti-inflammatory", "Skin firming"],
                "concerns": ["Temporary blue tint", "Potential for irritation"],
                "suitable_skin_types": ["normal", "dry", "combination"],
                "concentration_range": "1% - 5%",
                "interactions": [
                    {"ingredient": "vitamin_c", "severity": "caution", "reason": "May reduce effectiveness"},
                    {"ingredient": "retinol", "severity": "safe", "reason": "Complementary effects"}
                ],
                "common_allergens": ["rare"],
                "educational_info": {
                    "what_it_does": "Promotes healing, collagen production, has anti-inflammatory properties",
                    "how_to_use": "Apply at night, may cause temporary blue tint",
                    "when_to_expect_results": "4-8 weeks for visible improvements",
                    "best_practices": "Use at night, be patient with results"
                }
            },
            
            # AHAs/BHAs
            "glycolic_acid": {
                "category": "ahas_bhas",
                "description": "AHA with small molecular size for deep exfoliation",
                "benefits": ["Exfoliation", "Brightening", "Improves texture", "Reduces fine lines", "Hydrates"],
                "concerns": ["Irritation", "Sun sensitivity", "Dryness", "Initial purging"],
                "suitable_skin_types": ["normal", "oily", "combination"],
                "concentration_range": "5% - 10%",
                "interactions": [
                    {"ingredient": "retinol", "severity": "caution", "reason": "May increase irritation"},
                    {"ingredient": "salicylic_acid", "severity": "caution", "reason": "May increase irritation"},
                    {"ingredient": "vitamin_c", "severity": "caution", "reason": "May increase irritation"}
                ],
                "common_allergens": ["sensitive skin"],
                "educational_info": {
                    "what_it_does": "Exfoliates surface skin, improves texture and brightness",
                    "how_to_use": "Start with low concentration, use sunscreen, may cause purging",
                    "when_to_expect_results": "2-4 weeks for texture improvement",
                    "best_practices": "Start slowly, use every other day, always follow with sunscreen"
                }
            },
            "lactic_acid": {
                "category": "ahas_bhas",
                "description": "Gentle AHA that exfoliates and hydrates",
                "benefits": ["Gentle exfoliation", "Hydration", "Brightening", "Improves texture"],
                "concerns": ["Mild irritation", "Sun sensitivity"],
                "suitable_skin_types": ["normal", "dry", "combination", "sensitive"],
                "concentration_range": "5% - 12%",
                "interactions": [
                    {"ingredient": "retinol", "severity": "caution", "reason": "May increase irritation"},
                    {"ingredient": "salicylic_acid", "severity": "safe", "reason": "Gentle combination"}
                ],
                "common_allergens": ["rare"],
                "educational_info": {
                    "what_it_does": "Gentle exfoliation with hydrating properties",
                    "how_to_use": "Good for sensitive skin, use sunscreen",
                    "when_to_expect_results": "2-4 weeks",
                    "best_practices": "Good starting AHA for sensitive skin types"
                }
            },
            "mandelic_acid": {
                "category": "ahas_bhas",
                "description": "Gentle AHA with larger molecular size, suitable for sensitive skin",
                "benefits": ["Very gentle exfoliation", "Antibacterial", "Brightening", "Safe for sensitive skin"],
                "concerns": ["Minimal"],
                "suitable_skin_types": ["normal", "dry", "combination", "sensitive"],
                "concentration_range": "5% - 15%",
                "interactions": [
                    {"ingredient": "all", "severity": "safe", "reason": "Very gentle, good combinations"}
                ],
                "common_allergens": ["rare"],
                "educational_info": {
                    "what_it_does": "Gentle exfoliation with antibacterial properties",
                    "how_to_use": "Excellent for sensitive skin, can be used daily",
                    "when_to_expect_results": "3-6 weeks",
                    "best_practices": "Best AHA choice for sensitive or acne-prone skin"
                }
            }
        }
    
    def analyze_ingredient(self, request_data: dict) -> dict:
        """
        Analyze an ingredient for suitability based on user profile
        """
        ingredient_name = self._normalize_ingredient_name(request_data.get('ingredient_name', ''))
        skin_type = request_data.get('skin_type', 'normal')
        skin_concerns = request_data.get('skin_concerns') or []
        allergies = request_data.get('allergies') or []
        current_ingredients = request_data.get('current_ingredients') or []
        
        # Get ingredient data
        ingredient_data = self.ingredient_database.get(ingredient_name)
        
        if not ingredient_data:
            return {
                'error': f'Ingredient {ingredient_name} not found in database',
                'available_ingredients': list(self.ingredient_database.keys())
            }
        
        # Calculate suitability score
        suitability_score, is_suitable, suitability_reason = self._calculate_suitability(
            ingredient_data, skin_type, skin_concerns, allergies, ingredient_name=ingredient_name
        )
        
        # Check for interactions
        interaction_warnings = self._check_interactions(ingredient_name, current_ingredients)
        
        # Check for allergies
        allergy_alerts = self._check_allergies(ingredient_data, allergies, ingredient_name)

        if allergy_alerts:
            suitability_score = 0
            is_suitable = False
            extra = f"Allergy alert: {', '.join(allergy_alerts)}"
            suitability_reason = extra if not suitability_reason else f"{extra}; {suitability_reason}"
        elif interaction_warnings:
            for warning in interaction_warnings:
                if warning.upper().startswith('AVOID'):
                    suitability_score -= 40
                elif warning.upper().startswith('CAUTION'):
                    suitability_score -= 15
            suitability_score = max(0, min(100, suitability_score))
            is_suitable = suitability_score >= 60
            suitability_reason = f"{suitability_reason}; Interaction risk with current ingredients"
        
        # Generate educational summary
        educational_summary = self._generate_educational_summary(ingredient_data)
        
        # Generate recommendations
        recommendations = self._generate_ingredient_recommendations(
            ingredient_data, skin_type, skin_concerns, is_suitable
        )
        ai_recommendation = self._get_ai_recommendation(
            ingredient_name=ingredient_name,
            ingredient_data=ingredient_data,
            skin_type=skin_type,
            skin_concerns=skin_concerns,
            allergies=allergies,
            suitability_score=suitability_score,
            is_suitable=is_suitable,
            interaction_warnings=interaction_warnings,
            allergy_alerts=allergy_alerts,
        )
        if ai_recommendation:
            recommendations = ai_recommendation["recommendations"]

        return {
            'ingredient': {
                'name': ingredient_name.replace('_', ' ').title(),
                'category': ingredient_data['category'],
                'description': ingredient_data['description'],
                'benefits': ingredient_data['benefits'],
                'concerns': ingredient_data['concerns'],
                'suitable_skin_types': ingredient_data['suitable_skin_types'],
                'concentration_range': ingredient_data['concentration_range'],
                'interactions': ingredient_data['interactions'],
                'common_allergens': ingredient_data['common_allergens'],
                'educational_info': ingredient_data['educational_info']
            },
            'suitability_score': suitability_score,
            'is_suitable': is_suitable,
            'suitability_reason': suitability_reason,
            'interaction_warnings': interaction_warnings,
            'allergy_alerts': allergy_alerts,
            'educational_summary': educational_summary,
            'recommendations': recommendations,
            'ai_recommendation': ai_recommendation
        }

    def _get_ai_recommendation(
        self,
        ingredient_name: str,
        ingredient_data: dict,
        skin_type: str,
        skin_concerns: list,
        allergies: list,
        suitability_score: int,
        is_suitable: bool,
        interaction_warnings: list,
        allergy_alerts: list,
    ) -> Optional[dict]:
        """Explain the rule result with Groq without changing score or suitability."""
        if not self.groq_client:
            return None

        safety_context = {
            "ingredient": ingredient_name,
            "skin_type": skin_type,
            "skin_concerns": skin_concerns,
            "allergies": allergies,
            "rule_score": suitability_score,
            "rule_is_suitable": is_suitable,
            "interaction_warnings": interaction_warnings,
            "allergy_alerts": allergy_alerts,
            "known_concerns": ingredient_data["concerns"],
            "concentration_range": ingredient_data["concentration_range"],
        }
        prompt = f"""
Personalize ingredient guidance using this verified safety context:
{json.dumps(safety_context, indent=2)}

Return only valid JSON with this exact shape:
{{
  "summary": "one short personalized explanation",
  "recommendations": ["2-4 concise practical recommendations"],
  "usage_plan": "short morning/evening usage plan",
  "safety_note": "short safety note"
}}

Do not diagnose medical conditions. Do not contradict rule_is_suitable, allergy_alerts,
or interaction_warnings. If allergy_alerts or interaction_warnings are present, prioritize
avoiding the risk and clearly say so.
"""
        try:
            response = self.groq_client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a cautious, evidence-informed skincare assistant.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
                max_tokens=500,
                response_format={"type": "json_object"},
            )
            content = response.choices[0].message.content
            result = json.loads(content)
            recommendations = result.get("recommendations")
            if not isinstance(recommendations, list) or not all(
                isinstance(item, str) for item in recommendations
            ):
                raise ValueError("Groq returned invalid recommendations")
            return {
                "provider": "groq",
                "summary": str(result.get("summary", "")),
                "recommendations": recommendations[:4],
                "usage_plan": str(result.get("usage_plan", "")),
                "safety_note": str(result.get("safety_note", "")),
            }
        except (ValueError, TypeError, json.JSONDecodeError) as exc:
            print(f"Groq ingredient response could not be parsed: {exc}")
            return None
        except Exception as exc:
            print(f"Groq ingredient recommendation failed: {exc}")
            return None
    
    def _calculate_suitability(self, ingredient_data: dict, skin_type: str,
                             skin_concerns: list, allergies: list,
                             ingredient_name: str = '') -> Tuple[int, bool, str]:
        """Calculate a risk-first score; this decision is never delegated to the LLM."""
        score = 100
        reasons = []
        normalized_skin_type = (skin_type or 'normal').lower()
        normalized_allergies = {str(value).lower().strip() for value in allergies if str(value).strip()}
        common_allergens = {
            str(value).lower().strip()
            for value in ingredient_data.get('common_allergens', [])
        }
        matching_allergies = normalized_allergies.intersection(common_allergens)
        if matching_allergies:
            return 0, False, f"Not suitable because of a potential allergy: {', '.join(sorted(matching_allergies))}"

        display_name = (ingredient_name or '').replace('_', ' ')
        for allergy in normalized_allergies:
            allergy_norm = self._normalize_ingredient_name(allergy)
            if allergy_norm == (ingredient_name or '').lower():
                return 0, False, f"Not suitable because you listed an allergy to {display_name or 'this ingredient'}"
            if len(allergy) >= 4 and (allergy in display_name or display_name in allergy):
                return 0, False, f"Not suitable because you listed an allergy to {display_name or 'this ingredient'}"
            if 'retin' in allergy and ingredient_data.get('category') == 'retinoids':
                return 0, False, "Not suitable because of a retinoid allergy"

        if normalized_skin_type not in ingredient_data['suitable_skin_types']:
            score -= 25
            reasons.append(f"Not ideal for {normalized_skin_type} skin")
        else:
            reasons.append(f"Suitable for {normalized_skin_type} skin")

        ingredient_name = ingredient_name.lower()
        high_irritation = {'retinol', 'retinaldehyde', 'glycolic_acid'}
        moderate_irritation = {'salicylic_acid', 'ascorbic_acid', 'lactic_acid', 'mandelic_acid'}
        if ingredient_name in high_irritation and normalized_skin_type in {'sensitive', 'dry'}:
            score -= 35
            reasons.append("Higher irritation risk for this skin type")
        elif ingredient_name in moderate_irritation and normalized_skin_type == 'sensitive':
            score -= 20
            reasons.append("May irritate sensitive skin")
        elif ingredient_name == 'salicylic_acid' and normalized_skin_type == 'dry':
            score -= 15
            reasons.append("May increase dryness")

        matching_concerns = self._match_concerns(ingredient_data['benefits'], skin_concerns)
        if matching_concerns:
            score += min(15, len(matching_concerns) * 5)
            reasons.append(f"Addresses concerns: {', '.join(matching_concerns)}")

        is_suitable = score >= 60
        suitability_reason = "; ".join(reasons) if reasons else "Generally suitable"
        return max(0, min(100, score)), is_suitable, suitability_reason

    def _normalize_ingredient_name(self, ingredient_name: str) -> str:
        """Normalize common ingredient spellings and aliases."""
        normalized = ingredient_name.lower().strip().replace(" ", "_")
        return self.ingredient_aliases.get(normalized, normalized)
    
    def _match_concerns(self, benefits: list, concerns: list) -> list:
        """Match ingredient benefits to user concerns"""
        matching = []
        concern_keywords = {
            'acne': ['acne', 'pores', 'oil'],
            'aging': ['anti-aging', 'fine lines', 'collagen', 'wrinkles'],
            'dark_spots': ['hyperpigmentation', 'dark spots', 'brightening'],
            'dullness': ['brightening', 'radiance', 'texture'],
            'dryness': ['hydration', 'moisture', 'dry'],
            'sensitivity': ['soothes', 'calms', 'barrier']
        }
        
        for concern in concerns:
            keywords = concern_keywords.get(concern.lower(), [])
            for benefit in benefits:
                if any(keyword in benefit.lower() for keyword in keywords):
                    matching.append(concern)
                    break
        
        return matching
    
    def _check_interactions(self, ingredient_name: str, current_ingredients: list) -> list:
        """Check for ingredient interactions"""
        warnings = []
        ingredient_data = self.ingredient_database.get(ingredient_name)
        
        if not ingredient_data or not current_ingredients:
            return warnings
        
        for interaction in ingredient_data.get('interactions', []):
            interact_ingredient = interaction['ingredient']
            severity = interaction['severity']
            reason = interaction['reason']
            
            # Check if the interacting ingredient is in current ingredients
            for current in current_ingredients:
                current_normalized = self._normalize_ingredient_name(str(current))
                interaction_matches = interact_ingredient.lower() in current.lower()
                if interact_ingredient.lower() == "ahas":
                    interaction_matches = current_normalized in {
                        "glycolic_acid", "lactic_acid", "mandelic_acid"
                    }
                elif interact_ingredient.lower() == "bhas":
                    interaction_matches = current_normalized == "salicylic_acid"
                if interaction_matches:
                    warnings.append(f"{severity.upper()}: {current} - {reason}")
        
        return warnings
    
    def _check_allergies(self, ingredient_data: dict, user_allergies: list, ingredient_name: str = '') -> list:
        """Check for potential allergy concerns"""
        alerts = []
        name_key = (ingredient_name or '').lower()
        display_name = name_key.replace('_', ' ')

        for allergy in user_allergies:
            allergy_lower = str(allergy).lower().strip()
            if not allergy_lower:
                continue
            allergy_norm = self._normalize_ingredient_name(allergy_lower)
            if allergy_norm == name_key or allergy_lower in display_name or display_name in allergy_lower:
                alerts.append(f"You listed an allergy to {display_name or 'this ingredient'}")
                continue
            if 'retin' in allergy_lower and ingredient_data.get('category') == 'retinoids':
                alerts.append(f"Potential retinoid concern from allergy: {allergy}")
                continue
            for allergen in ingredient_data.get('common_allergens', []):
                allergen_text = str(allergen).lower()
                if allergen_text in {'rare', 'minimal'}:
                    continue
                if allergy_lower in allergen_text or allergen_text in allergy_lower:
                    alerts.append(f"Potential {allergy} concern")
                    break

        return alerts
    
    def _generate_educational_summary(self, ingredient_data: dict) -> str:
        """Generate educational summary about the ingredient"""
        edu_info = ingredient_data.get('educational_info', {})
        
        summary = f"""
{ingredient_data['description'].capitalize()}

What it does: {edu_info.get('what_it_does', 'N/A')}
How to use: {edu_info.get('how_to_use', 'N/A')}
When to expect results: {edu_info.get('when_to_expect_results', 'N/A')}
Best practices: {edu_info.get('best_practices', 'N/A')}

Key benefits: {', '.join(ingredient_data['benefits'][:3])}
Potential concerns: {', '.join(ingredient_data['concerns'][:2])}
Recommended concentration: {ingredient_data['concentration_range']}
"""
        return summary.strip()
    
    def _generate_ingredient_recommendations(self, ingredient_data: dict, skin_type: str, 
                                           skin_concerns: list, is_suitable: bool) -> list:
        """Generate personalized recommendations"""
        recommendations = []
        
        if is_suitable:
            recommendations.append(f"This ingredient is suitable for your {skin_type} skin type")
            
            # Add specific recommendations based on concerns
            if 'acne' in skin_concerns and 'pores' in str(ingredient_data['benefits']):
                recommendations.append("Excellent choice for acne-prone skin")
            
            if 'aging' in skin_concerns and 'anti-aging' in str(ingredient_data['benefits']):
                recommendations.append("Good anti-aging properties for your concerns")
            
            if 'dryness' in skin_concerns and 'hydration' in str(ingredient_data['benefits']):
                recommendations.append("Will help address dryness concerns")
            
            # Usage recommendations
            if ingredient_data['category'] in ['retinoids', 'ahas_bhas']:
                recommendations.append("Use sunscreen during the day when using this ingredient")
                recommendations.append("Start with lower concentration to build tolerance")
            
            if ingredient_data['category'] == 'vitamin_c':
                recommendations.append("Best used in morning routine before sunscreen")
            
            if ingredient_data['category'] in ['ceramides', 'hyaluronic_acid']:
                recommendations.append("Can be used both morning and night")
                recommendations.append("Apply to damp skin for best results")
        else:
            recommendations.append("This ingredient may not be ideal for your current skin profile")
            recommendations.append("Consider alternatives that better match your skin type and concerns")
        
        return recommendations
    
    def analyze_ingredient_interactions(self, ingredients: list) -> dict:
        """
        Analyze interactions between multiple ingredients
        """
        interaction_results = []
        has_conflicts = False
        max_severity = "safe"
        
        for i, ingredient1 in enumerate(ingredients):
            for ingredient2 in ingredients[i+1:]:
                result = self._check_pair_interaction(ingredient1, ingredient2)
                if result:
                    interaction_results.append(result)
                    if result['severity'] in ['caution', 'avoid']:
                        has_conflicts = True
                        if result['severity'] == 'avoid':
                            max_severity = 'avoid'
                        elif max_severity != 'avoid':
                            max_severity = 'caution'
        
        # Generate recommendations based on interactions
        recommendations = self._generate_interaction_recommendations(interaction_results, max_severity)
        
        return {
            'ingredients': ingredients,
            'interactions': interaction_results,
            'has_conflicts': has_conflicts,
            'severity': max_severity,
            'recommendations': recommendations
        }
    
    def _check_pair_interaction(self, ingredient1: str, ingredient2: str) -> dict:
        """Check interaction between two ingredients"""
        # Normalize ingredient names
        ing1_normalized = ingredient1.lower().replace(' ', '_')
        ing2_normalized = ingredient2.lower().replace(' ', '_')
        
        # Get ingredient data
        data1 = self.ingredient_database.get(ing1_normalized)
        data2 = self.ingredient_database.get(ing2_normalized)
        
        if not data1 or not data2:
            return None
        
        # Check interactions in both directions
        for interaction in data1.get('interactions', []):
            if interaction['ingredient'].lower() in ing2_normalized:
                return {
                    'ingredient1': ingredient1,
                    'ingredient2': ingredient2,
                    'severity': interaction['severity'],
                    'reason': interaction['reason']
                }
        
        for interaction in data2.get('interactions', []):
            if interaction['ingredient'].lower() in ing1_normalized:
                return {
                    'ingredient1': ingredient1,
                    'ingredient2': ingredient2,
                    'severity': interaction['severity'],
                    'reason': interaction['reason']
                }
        
        return None
    
    def _generate_interaction_recommendations(self, interactions: list, severity: str) -> list:
        """Generate recommendations based on interaction analysis"""
        recommendations = []
        
        if severity == 'avoid':
            recommendations.append("AVOID: Some ingredient combinations may be harmful")
            recommendations.append("Consider removing conflicting ingredients")
        elif severity == 'caution':
            recommendations.append("CAUTION: Some combinations may cause irritation")
            recommendations.append("Introduce products gradually and monitor skin reaction")
            recommendations.append("Consider using these ingredients at different times of day")
        else:
            recommendations.append("SAFE: These ingredients can generally be used together")
        
        # Specific recommendations based on interaction types
        for interaction in interactions:
            if 'retinol' in str(interaction).lower() and 'exfoliation' in str(interaction).lower():
                recommendations.append("Use retinol and exfoliants on different nights")
            
            if 'vitamin_c' in str(interaction).lower() and 'niacinamide' in str(interaction).lower():
                recommendations.append("Apply vitamin C first, wait 10 minutes before niacinamide")
        
        return recommendations
    
    def get_ingredient_by_category(self, category: str) -> list:
        """Get all ingredients in a specific category"""
        ingredients = []
        for name, data in self.ingredient_database.items():
            if data['category'] == category:
                ingredients.append({
                    'name': name.replace('_', ' ').title(),
                    'description': data['description'],
                    'benefits': data['benefits']
                })
        return ingredients
    
    def search_ingredients(self, query: str) -> list:
        """Search for ingredients by name or benefit"""
        results = []
        query_lower = query.lower()
        
        for name, data in self.ingredient_database.items():
            # Search in name
            if query_lower in name.replace('_', ' '):
                results.append({
                    'name': name.replace('_', ' ').title(),
                    'category': data['category'],
                    'description': data['description']
                })
                continue
            
            # Search in benefits
            for benefit in data['benefits']:
                if query_lower in benefit.lower():
                    results.append({
                        'name': name.replace('_', ' ').title(),
                        'category': data['category'],
                        'description': data['description']
                    })
                    break
        
        return results
