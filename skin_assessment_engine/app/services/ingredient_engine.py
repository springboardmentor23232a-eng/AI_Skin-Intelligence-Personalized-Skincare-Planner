"""
Module 5: Ingredient Intelligence Engine
Performs ingredient suitability assessment, conflict/clash detection,
beneficial synergy analysis, allergen detection, and educational category catalog lookup.
"""

from typing import List, Dict, Any, Optional

# Knowledge Base of standard ingredients across 8 categories
INGREDIENT_KNOWLEDGE_BASE: List[Dict[str, Any]] = [
    {
        "id": 1,
        "name": "Retinol",
        "chemical_name": "Vitamin A Derivative",
        "category": "Retinoids",
        "description": "Accelerates cellular turnover, stimulates collagen production, reduces fine lines, and clears clogged pores.",
        "primary_benefit": "Anti-Aging, Cell Turnover & Acne Clearance",
        "recommended_conc_range": "0.1% - 1.0%",
        "comedogenicity_rating": 0,
        "irritant_rating": 3,
        "target_skin_types": ["Normal", "Oily", "Combination", "Aging"],
        "suitable_concerns": ["Fine Lines", "Wrinkles", "Acne", "Hyperpigmentation", "Uneven Texture"],
        "avoid_concerns": ["Severe Rosacea", "Eczema Flare-ups", "Compromised Skin Barrier"],
        "usage_tips": "Apply PM only on dry skin. Follow with moisturizer. Always use SPF 50 during daytime."
    },
    {
        "id": 2,
        "name": "Niacinamide",
        "chemical_name": "Vitamin B3 (Nicotinamide)",
        "category": "Niacinamide",
        "description": "Multi-functional lipid barrier repair agent, regulates sebum, fades dark spots, and reduces redness.",
        "primary_benefit": "Barrier Strengthening, Sebum Regulation & Erythema Reduction",
        "recommended_conc_range": "2.0% - 10.0%",
        "comedogenicity_rating": 0,
        "irritant_rating": 1,
        "target_skin_types": ["All", "Sensitive", "Oily", "Combination", "Dry"],
        "suitable_concerns": ["Redness", "Enlarged Pores", "Hyperpigmentation", "Oiliness", "Barrier Impairment"],
        "avoid_concerns": [],
        "usage_tips": "Can be used AM and PM. Pairs exceptionally well with Ceramides and Salicylic Acid."
    },
    {
        "id": 3,
        "name": "L-Ascorbic Acid",
        "chemical_name": "Vitamin C (Pure Form)",
        "category": "Vitamin C",
        "description": "Potent antioxidant neutralizing free radicals, brightening hyperpigmentation, and boosting collagen synthesis.",
        "primary_benefit": "Antioxidant Protection, Radiance & Collagen Synthesis",
        "recommended_conc_range": "10.0% - 20.0%",
        "comedogenicity_rating": 0,
        "irritant_rating": 2,
        "target_skin_types": ["Normal", "Combination", "Dull", "Hyperpigmented"],
        "suitable_concerns": ["Dark Spots", "Dullness", "Sun Damage", "Uneven Skin Tone"],
        "avoid_concerns": ["Highly Sensitive Skin", "Active Inflammatory Rosacea"],
        "usage_tips": "Best used in AM under SPF. Store in a cool dark place to prevent oxidation."
    },
    {
        "id": 4,
        "name": "Hyaluronic Acid",
        "chemical_name": "Sodium Hyaluronate",
        "category": "Hyaluronic Acid",
        "description": "Powerful humectant binding up to 1000x its weight in water to plump fine lines and restore moisture levels.",
        "primary_benefit": "Deep Surface & Sub-Surface Hydration",
        "recommended_conc_range": "1.0% - 2.0%",
        "comedogenicity_rating": 0,
        "irritant_rating": 0,
        "target_skin_types": ["All", "Dry", "Dehydrated", "Sensitive", "Oily"],
        "suitable_concerns": ["Dehydration", "Dryness", "Fine Lines", "Tightness"],
        "avoid_concerns": [],
        "usage_tips": "Apply to damp skin to trap moisture before sealing with an emollient moisturizer."
    },
    {
        "id": 5,
        "name": "Salicylic Acid",
        "chemical_name": "Beta Hydroxy Acid (BHA)",
        "category": "Salicylic Acid",
        "description": "Lipophilic acid penetrating deep into oil-filled pores to dissolve dead skin cells, sebum, and comedones.",
        "primary_benefit": "Deep Pore Exfoliation & Blackhead Removal",
        "recommended_conc_range": "0.5% - 2.0%",
        "comedogenicity_rating": 0,
        "irritant_rating": 2,
        "target_skin_types": ["Oily", "Combination", "Acne-Prone"],
        "suitable_concerns": ["Blackheads", "Acne", "Clogged Pores", "Excess Sebum"],
        "avoid_concerns": ["Extreme Dryness", "Aspirin Allergy"],
        "usage_tips": "Use 2-3 times per week in PM. Avoid layering with strong retinoids in the same application."
    },
    {
        "id": 6,
        "name": "Ceramide NP",
        "chemical_name": "Sphingolipid Ceramide Complex",
        "category": "Ceramides",
        "description": "Essential intercellular lipids cementing the skin barrier, preventing transepidermal water loss (TEWL).",
        "primary_benefit": "Skin Barrier Repair & Moisture Lock",
        "recommended_conc_range": "1.0% - 5.0%",
        "comedogenicity_rating": 0,
        "irritant_rating": 0,
        "target_skin_types": ["All", "Dry", "Sensitive", "Barrier-Damaged"],
        "suitable_concerns": ["Barrier Impairment", "Flakiness", "Sensitivity", "Redness"],
        "avoid_concerns": [],
        "usage_tips": "Ideal for daily restorative moisture. Layer after actives to soothe skin."
    },
    {
        "id": 7,
        "name": "Matrixyl 3000",
        "chemical_name": "Palmitoyl Tripeptide-1 & Palmitoyl Tetrapeptide-7",
        "category": "Peptides",
        "description": "Signal peptide complex signaling skin cells to produce new collagen and elastin fibers for firmer skin.",
        "primary_benefit": "Structural Collagen Support & Elasticity Enhancement",
        "recommended_conc_range": "3.0% - 8.0%",
        "comedogenicity_rating": 0,
        "irritant_rating": 0,
        "target_skin_types": ["All", "Aging", "Dry", "Normal"],
        "suitable_concerns": ["Sagging Skin", "Wrinkles", "Loss of Elasticity"],
        "avoid_concerns": [],
        "usage_tips": "Can be used twice daily. Works harmoniously with Niacinamide and Hyaluronic Acid."
    },
    {
        "id": 8,
        "name": "Glycolic Acid",
        "chemical_name": "Alpha Hydroxy Acid (AHA)",
        "category": "AHAs/BHAs",
        "description": "Smallest molecule AHA dissolving desmosomes binding dead surface cells, revealing radiant, smooth skin.",
        "primary_benefit": "Surface Exfoliation, Texture Smoothing & Glow Boost",
        "recommended_conc_range": "5.0% - 10.0%",
        "comedogenicity_rating": 0,
        "irritant_rating": 3,
        "target_skin_types": ["Normal", "Dry", "Combination", "Dull"],
        "suitable_concerns": ["Dullness", "Rough Texture", "Pigmentation"],
        "avoid_concerns": ["Sensitive Skin", "Rosacea", "Active Sunburn"],
        "usage_tips": "Use PM 1-2 times per week. Do not combine in same step as Retinoids or Benzoyl Peroxide."
    }
]

# Matrix of pairwise ingredient interactions (Conflicts & Synergies)
INGREDIENT_INTERACTION_RULES: List[Dict[str, Any]] = [
    {
        "pair": {"Retinol", "Glycolic Acid"},
        "ingredient_a": "Retinol",
        "ingredient_b": "Glycolic Acid",
        "interaction_type": "Conflict",
        "severity": "High",
        "description": "Combining strong Retinoids with AHAs (Glycolic Acid) causes excessive irritation, barrier disruption, and peeling.",
        "recommendation": "Alternate nights: Use Glycolic Acid on Night A and Retinol on Night B."
    },
    {
        "pair": {"Retinol", "L-Ascorbic Acid"},
        "ingredient_a": "Retinol",
        "ingredient_b": "L-Ascorbic Acid",
        "interaction_type": "Conflict",
        "severity": "Moderate",
        "description": "Pure Vitamin C (low pH) and Retinol can destabilize each other and increase redness when applied together.",
        "recommendation": "Apply Vitamin C in the morning (AM) and Retinol at night (PM)."
    },
    {
        "pair": {"Salicylic Acid", "Retinol"},
        "ingredient_a": "Salicylic Acid",
        "ingredient_b": "Retinol",
        "interaction_type": "Caution",
        "severity": "Moderate",
        "description": "Layering BHA and Retinol simultaneously may over-exfoliate and dry sensitive skin.",
        "recommendation": "Use BHA in morning cleanser or alternate evenings with Retinol."
    },
    {
        "pair": {"Hyaluronic Acid", "Ceramide NP"},
        "ingredient_a": "Hyaluronic Acid",
        "ingredient_b": "Ceramide NP",
        "interaction_type": "Synergy",
        "severity": "Synergistic",
        "description": "Hyaluronic Acid pulls deep hydration into epidermal layers while Ceramides seal the outer moisture barrier.",
        "recommendation": "Apply Hyaluronic Acid serum first, then lock in with Ceramide moisture cream."
    },
    {
        "pair": {"L-Ascorbic Acid", "Ferulic Acid"},
        "ingredient_a": "L-Ascorbic Acid",
        "ingredient_b": "Ferulic Acid",
        "interaction_type": "Synergy",
        "severity": "Synergistic",
        "description": "Ferulic Acid doubles the antioxidant stability and photoprotective efficacy of Vitamin C.",
        "recommendation": "Use combined Vitamin C + E + Ferulic serum every morning."
    },
    {
        "pair": {"Niacinamide", "Salicylic Acid"},
        "ingredient_a": "Niacinamide",
        "ingredient_b": "Salicylic Acid",
        "interaction_type": "Synergy",
        "severity": "Synergistic",
        "description": "BHA clears pore congestion while Niacinamide calms inflammation and balances sebum production.",
        "recommendation": "Layer BHA followed by Niacinamide serum for optimal acne care."
    }
]

# Standard allergen list
KNOWN_ALLERGENS = [
    "Fragrance (Parfum)",
    "Essential Oils",
    "Limonene",
    "Linalool",
    "Parabens",
    "Sulfates (SLS/SLES)",
    "Alcohol Denat",
    "Propylene Glycol",
    "Formaldehyde Releasers",
    "Synthetic Dyes"
]


class IngredientEngine:
    """Business logic class for Module 5 Ingredient Intelligence"""

    def get_category_dictionary(self) -> List[Dict[str, Any]]:
        """Returns educational info organized by the 8 required ingredient categories"""
        category_map: Dict[str, Dict[str, Any]] = {}
        for item in INGREDIENT_KNOWLEDGE_BASE:
            cat = item["category"]
            if cat not in category_map:
                category_map[cat] = {
                    "category": cat,
                    "description": item["description"],
                    "primary_benefit": item["primary_benefit"],
                    "recommended_conc_range": item["recommended_conc_range"],
                    "target_skin_types": item["target_skin_types"],
                    "key_ingredients": [item["name"]],
                    "usage_tips": item["usage_tips"]
                }
            else:
                category_map[cat]["key_ingredients"].append(item["name"])

        return list(category_map.values())

    def analyze_ingredients(
        self,
        ingredient_names: List[str],
        skin_type: str = "Combination",
        sensitivities: Optional[List[str]] = None,
        allergies: Optional[List[str]] = None,
        active_concerns: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Analyzes list of ingredients for suitability, clashes, synergies, and user allergies"""
        sensitivities = sensitivities or []
        allergies = allergies or []
        active_concerns = active_concerns or []

        suitability_items = []
        flagged_allergens = []
        safety_scores = []

        # 1. Evaluate individual ingredient suitability
        for name in ingredient_names:
            clean_name = name.strip()
            
            # Check allergen match
            is_allergen = False
            for alg in allergies:
                if alg.lower() in clean_name.lower() or clean_name.lower() in alg.lower():
                    is_allergen = True
                    flagged_allergens.append(clean_name)
                    break

            # Find in knowledge base or generate fallback evaluation
            kb_match = next((item for item in INGREDIENT_KNOWLEDGE_BASE if item["name"].lower() in clean_name.lower() or clean_name.lower() in item["name"].lower()), None)
            
            if is_allergen:
                status = "Avoid / Unsuitable"
                score = 0.0
                reason = f"Flagged as user allergen: '{clean_name}'"
                benefit = "N/A - Irritant / Allergen"
                tips = "Discontinue use immediately."
                category = "Allergen"
            elif kb_match:
                category = kb_match["category"]
                benefit = kb_match["primary_benefit"]
                tips = kb_match["usage_tips"]
                
                # Evaluate sensitivity match
                is_sensitive_clash = any(s.lower() in clean_name.lower() for s in sensitivities)
                
                if is_sensitive_clash:
                    status = "Use with Caution"
                    score = 45.0
                    reason = f"Contains active component sensitive to user profile."
                elif skin_type in kb_match["target_skin_types"] or "All" in kb_match["target_skin_types"]:
                    status = "Highly Beneficial"
                    score = 95.0
                    reason = f"Optimal fit for {skin_type} skin and target benefits ({benefit})."
                else:
                    status = "Suitable"
                    score = 80.0
                    reason = f"Safe general ingredient suitable for skin maintenance."
            else:
                category = "General Formulation"
                benefit = "Hydrating / Emollient base agent"
                tips = "Standard topical cosmetic ingredient."
                status = "Suitable"
                score = 85.0
                reason = "Safe standard cosmetics formulation component."

            safety_scores.append(score)
            suitability_items.append({
                "ingredient": clean_name,
                "category": category,
                "status": status,
                "safety_score": score,
                "reason": reason,
                "primary_benefit": benefit,
                "usage_tips": tips
            })

        # 2. Evaluate interactions (Conflicts & Synergies)
        detected_conflicts = []
        detected_synergies = []

        norm_names = [n.lower() for n in ingredient_names]
        for rule in INGREDIENT_INTERACTION_RULES:
            ing_a = rule["ingredient_a"]
            ing_b = rule["ingredient_b"]

            has_a = any(ing_a.lower() in n for n in norm_names)
            has_b = any(ing_b.lower() in n for n in norm_names)

            if has_a and has_b:
                interaction_data = {
                    "ingredient_a": ing_a,
                    "ingredient_b": ing_b,
                    "interaction_type": rule["interaction_type"],
                    "severity": rule["severity"],
                    "description": rule["description"],
                    "recommendation": rule["recommendation"]
                }
                if rule["interaction_type"] in ["Conflict", "Caution"]:
                    detected_conflicts.append(interaction_data)
                else:
                    detected_synergies.append(interaction_data)

        # 3. Compute overall safety score & rating
        avg_safety = sum(safety_scores) / max(len(safety_scores), 1)
        if flagged_allergens or any(c["severity"] == "High" for c in detected_conflicts):
            overall_rating = "Caution Required"
            avg_safety = min(avg_safety, 50.0)
        elif detected_conflicts:
            overall_rating = "Use with Caution"
            avg_safety = min(avg_safety, 70.0)
        else:
            overall_rating = "Safe / Optimal Match"

        recommendations = []
        if flagged_allergens:
            recommendations.append(f"⚠️ Allergen Warning: Product contains flagged allergen(s): {', '.join(flagged_allergens)}.")
        if detected_conflicts:
            for conf in detected_conflicts:
                recommendations.append(f"⚡ Conflict Alert ({conf['ingredient_a']} + {conf['ingredient_b']}): {conf['recommendation']}")
        if detected_synergies:
            for syn in detected_synergies:
                recommendations.append(f"✨ Beneficial Synergy ({syn['ingredient_a']} + {syn['ingredient_b']}): {syn['description']}")
        if not recommendations:
            recommendations.append("✅ Formulated with compatible, safe skincare ingredients.")

        return {
            "success": True,
            "overall_safety_rating": overall_rating,
            "safety_score": round(avg_safety, 1),
            "analyzed_count": len(ingredient_names),
            "flagged_allergens": flagged_allergens,
            "suitability_breakdown": suitability_items,
            "interactions": detected_conflicts,
            "synergies": detected_synergies,
            "recommendations": recommendations
        }


# Singleton instance
ingredient_engine = IngredientEngine()
