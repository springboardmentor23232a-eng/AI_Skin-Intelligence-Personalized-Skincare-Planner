"""
Personalized Skincare Recommendation Engine Module
--------------------------------------------------
Generates tailored morning/night skincare routines, recommended ingredients,
ingredients to avoid, lifestyle advice, and general guidance based on:
1. Predicted Skin Type
2. Skin Health Score
3. Identified Concerns
4. Environmental & Demographic Risk Factors
"""


def generate_recommendations(
    predicted_skin_type: str,
    health_score: int,
    concerns: list,
    risk_factors: list,
) -> dict:
    """
    Generates a personalized skincare recommendation payload.

    Parameters:
    -----------
    predicted_skin_type : str ('Dry', 'Oily', 'Combination', 'Normal')
    health_score        : int (0 to 100)
    concerns            : list of str (e.g. ['Barrier Weakness', 'Acne Prone'])
    risk_factors        : list of str (e.g. ['Low environmental humidity'])

    Returns:
    --------
    dict : {
        "morning_routine": [...],
        "night_routine": [...],
        "recommended_ingredients": [...],
        "ingredients_to_avoid": [...],
        "lifestyle_recommendations": [...],
        "general_advice": "..."
    }
    """
    try:
        # Input Validation & Normalization
        skin_type = str(predicted_skin_type).strip().capitalize()
        score = int(max(0, min(100, health_score)))
        concerns_list = list(concerns) if isinstance(concerns, (list, tuple, set)) else []
        risks_list = list(risk_factors) if isinstance(risk_factors, (list, tuple, set)) else []

        morning_routine = []
        night_routine = []
        recommended_ingredients = []
        ingredients_to_avoid = []
        lifestyle_recommendations = []
        general_advice = ""

        # 1. Skin Type Base Recommendations
        if skin_type == "Dry":
            morning_routine.extend([
                "Gentle Hydrating Cleanser",
                "Hydrating Hyaluronic Acid Serum",
                "Rich Barrier Moisture Cream",
                "Broad Spectrum SPF 30+ Sunscreen"
            ])
            night_routine.extend([
                "Nourishing Cleansing Balm / Oil Cleanser",
                "Gentle Hydrating Cleanser",
                "Restorative Night Cream & Facial Oil"
            ])
            recommended_ingredients.extend(["Hyaluronic Acid", "Ceramides", "Glycerin", "Squalane"])
            ingredients_to_avoid.extend(["Denatured Alcohol", "High-strength Salicylic Acid", "Harsh Physical Scrubs"])

        elif skin_type == "Oily":
            morning_routine.extend([
                "Refreshing Gel Cleanser",
                "Niacinamide Balance Serum",
                "Lightweight Oil-Free Gel Moisturizer",
                "Mattifying Sunscreen SPF 30+"
            ])
            night_routine.extend([
                "Salicylic Acid (BHA) Exfoliating Cleanser",
                "Oil-Free Hydrating Lotion"
            ])
            recommended_ingredients.extend(["Niacinamide", "Salicylic Acid", "Zinc PCA", "Tea Tree Oil"])
            ingredients_to_avoid.extend(["Heavy Mineral Oils", "Coconut Oil", "Pore-Clogging Butters"])

        elif skin_type == "Combination":
            morning_routine.extend([
                "Balanced Foaming Cleanser",
                "Lightweight Hydrating Serum",
                "Dual-Zone Balance Lotion",
                "Broad Spectrum SPF 30+ Sunscreen"
            ])
            night_routine.extend([
                "Gentle Balancing Cleanser",
                "Hydrating Gel-Cream"
            ])
            recommended_ingredients.extend(["Niacinamide", "Hyaluronic Acid", "Centella Asiatica"])
            ingredients_to_avoid.extend(["Extremely Heavy Creams", "Alcohol-based Toners"])

        else:  # Normal / Default
            morning_routine.extend([
                "Gentle Daily Cleanser",
                "Antioxidant Vitamin C Serum",
                "Hydrating Daily Moisturizer",
                "Sunscreen SPF 30+"
            ])
            night_routine.extend([
                "Gentle Cleanser",
                "Nourishing Night Cream"
            ])
            recommended_ingredients.extend(["Vitamin C", "Hyaluronic Acid", "Niacinamide"])
            ingredients_to_avoid.extend(["Harsh Abrasive Exfoliants"])

        # 2. Health Score Guidance & Adjustments
        if score < 60:
            general_advice = (
                "Your skin health score indicates a compromised state. Prioritize gentle hydration "
                "and barrier repair before introducing strong chemical exfoliants or actives."
            )
            lifestyle_recommendations.append("Simplify your daily routine to basic gentle steps only.")
        elif 60 <= score <= 74:
            general_advice = (
                "Your skin condition is fair. Maintain consistency with hydration, daily sun protection, "
                "and stress management."
            )
        elif 75 <= score <= 89:
            general_advice = (
                "Your skin is in good health! Continue your daily skincare regimen and protect against environmental stress."
            )
        else:
            general_advice = (
                "Your skin is in excellent condition! Focus on maintenance, antioxidant defense, and daily SPF protection."
            )

        # 3. Concern-Specific Adjustments
        if "Barrier Weakness" in concerns_list or "Sensitive Skin" in concerns_list or "Sensitive skin barrier" in risks_list:
            recommended_ingredients.extend(["Ceramides", "Centella Asiatica", "Panthenol (Vitamin B5)", "Allantoin"])
            ingredients_to_avoid.extend(["Synthetic Fragrance", "Essential Oils", "High-Concentration AHAs/BHAs", "Retinoids"])
            lifestyle_recommendations.append("Avoid hot water when washing face; use lukewarm water.")

        if "Acne Prone" in concerns_list or "Excess Sebum" in concerns_list or "High oil production may increase acne risk" in risks_list:
            recommended_ingredients.extend(["Niacinamide", "Salicylic Acid", "Azelaic Acid", "Zinc PCA"])
            ingredients_to_avoid.extend(["Isopropyl Myristate", "Comedogenic Oils"])
            lifestyle_recommendations.append("Change pillowcases frequently and avoid touching your face.")

        if "Dryness" in concerns_list or "Dehydration" in concerns_list or "Risk of dehydration" in risks_list:
            recommended_ingredients.extend(["Hyaluronic Acid", "Glycerin", "Polyglutamic Acid", "Ceramides"])
            ingredients_to_avoid.extend(["Sodium Lauryl Sulfate (SLS)", "Denatured Alcohol"])
            lifestyle_recommendations.append("Drink at least 2.5 to 3 liters of water daily.")

        # 4. Risk Factors Adjustments
        if "Age-related skin changes" in risks_list:
            recommended_ingredients.extend(["Peptides", "Retinol", "Antioxidants (Vitamin C)"])
            night_routine.append("Apply Age-Defying Peptide / Retinol Treatment")

        if "Low environmental humidity" in risks_list:
            lifestyle_recommendations.append("Use an indoor room humidifier to prevent transepidermal water loss.")

        if "Hot environmental conditions" in risks_list:
            lifestyle_recommendations.append("Reapply broad-spectrum sunscreen every 2 hours when outdoors.")

        # Deduplicate all recommendation lists while preserving insertion order
        morning_routine = list(dict.fromkeys(morning_routine))
        night_routine = list(dict.fromkeys(night_routine))
        recommended_ingredients = list(dict.fromkeys(recommended_ingredients))
        ingredients_to_avoid = list(dict.fromkeys(ingredients_to_avoid))
        lifestyle_recommendations = list(dict.fromkeys(lifestyle_recommendations))

        return {
            "morning_routine": morning_routine,
            "night_routine": night_routine,
            "recommended_ingredients": recommended_ingredients,
            "ingredients_to_avoid": ingredients_to_avoid,
            "lifestyle_recommendations": lifestyle_recommendations,
            "general_advice": general_advice,
        }

    except Exception as e:
        return {
            "error": str(e),
            "morning_routine": [],
            "night_routine": [],
            "recommended_ingredients": [],
            "ingredients_to_avoid": [],
            "lifestyle_recommendations": [],
            "general_advice": "Error generating recommendations.",
        }


if __name__ == "__main__":
    print("=" * 70)
    print(" TESTING RECOMMENDATION ENGINE MODULE (backend/assessment/recommendation_engine.py)")
    print("=" * 70)

    # Test Case 1: Sensitive & Barrier Compromised Dry Skin
    test_1 = {
        "predicted_skin_type": "Dry",
        "health_score": 52,
        "concerns": ["Dryness", "Dehydration", "Sensitive Skin", "Barrier Weakness"],
        "risk_factors": ["Sensitive skin barrier", "Low environmental humidity"],
    }
    res_1 = generate_recommendations(**test_1)
    print(f"Test Case 1 (Dry Sensitive Compromised):")
    print(f"Morning Routine          : {res_1['morning_routine']}")
    print(f"Recommended Ingredients  : {res_1['recommended_ingredients']}")
    print(f"General Advice           : {res_1['general_advice']}\n")

    # Test Case 2: High Sebum Oily Skin Profile
    test_2 = {
        "predicted_skin_type": "Oily",
        "health_score": 82,
        "concerns": ["Excess Sebum", "Acne Prone", "Oily Skin"],
        "risk_factors": ["High oil production may increase acne risk"],
    }
    res_2 = generate_recommendations(**test_2)
    print(f"Test Case 2 (Oily Acne Prone):")
    print(f"Night Routine            : {res_2['night_routine']}")
    print(f"Recommended Ingredients  : {res_2['recommended_ingredients']}")
    print(f"Ingredients to Avoid     : {res_2['ingredients_to_avoid']}\n")

    # Test Case 3: Mature Combination Skin in Hot Environment
    test_3 = {
        "predicted_skin_type": "Combination",
        "health_score": 78,
        "concerns": ["Mild Sensitivity", "Combination Skin"],
        "risk_factors": ["Age-related skin changes", "Hot environmental conditions"],
    }
    res_3 = generate_recommendations(**test_3)
    print(f"Test Case 3 (Mature Combination Hot Weather):")
    print(f"Recommended Ingredients  : {res_3['recommended_ingredients']}")
    print(f"Lifestyle Recommendations: {res_3['lifestyle_recommendations']}\n")

    # Test Case 4: Excellent Normal Skin Profile
    test_4 = {
        "predicted_skin_type": "Normal",
        "health_score": 95,
        "concerns": [],
        "risk_factors": [],
    }
    res_4 = generate_recommendations(**test_4)
    print(f"Test Case 4 (Excellent Normal Skin):")
    print(f"Morning Routine          : {res_4['morning_routine']}")
    print(f"General Advice           : {res_4['general_advice']}\n")

    print("=" * 70)
    print(" ALL TESTS COMPLETED")
    print("=" * 70)
