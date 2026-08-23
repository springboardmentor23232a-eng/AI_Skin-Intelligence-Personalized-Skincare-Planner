from typing import Dict, List, Any

def identify_and_prioritize_concerns(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Analyzes user skin profile parameters to identify active skin concerns,
    classifies severity (Mild, Moderate, Severe, Critical), assigns prioritized ordering (1, 2, 3...),
    and attaches personalized treatment recommendations (active ingredients, AM/PM routine, avoid list).
    """
    hydration = float(data.get("hydration_level", 50.0))
    oiliness = float(data.get("oiliness_level", 50.0))
    sensitivity = float(data.get("sensitivity_level", 20.0))
    acne = float(data.get("acne_severity", 10.0))
    pigmentation = float(data.get("pigmentation_score", 15.0))
    wrinkles = float(data.get("wrinkles_score", 10.0))

    identified: List[Dict[str, Any]] = []

    # 1. Acne & Blemish Concern
    if acne > 15.0:
        if acne > 80.0:
            severity = "Critical"
            weight = 100
        elif acne > 60.0:
            severity = "Severe"
            weight = 85
        elif acne > 35.0:
            severity = "Moderate"
            weight = 65
        else:
            severity = "Mild"
            weight = 40
        
        identified.append({
            "concern_name": "Acne Vulgaris & Inflammatory Blemishes",
            "severity": severity,
            "category": "Inflammatory",
            "description": f"Active inflammatory breakouts and comedones detected (Severity index: {acne:.1f}/100).",
            "urgency_score": weight + acne * 0.5,
            "recommended_ingredients": ["Salicylic Acid (BHA 2%)", "Niacinamide (5%)", "Benzoyl Peroxide (2.5%)", "Tea Tree Extract"],
            "routine_advice": "AM: Gentle Foaming Cleanser + Niacinamide 5% + Lightweight Oil-Free Moisturizer + Mineral SPF 50. PM: 2% BHA Salicylic Acid Liquid + Barrier Gel.",
            "avoid_ingredients": ["Comedogenic Oils (Coconut, Palm)", "Heavy Occlusives (Petrolatum)", "Physical Scrubs"]
        })

    # 2. Hyperpigmentation Concern
    if pigmentation > 20.0:
        if pigmentation > 65.0:
            severity = "Severe"
            weight = 80
        elif pigmentation > 40.0:
            severity = "Moderate"
            weight = 60
        else:
            severity = "Mild"
            weight = 35

        identified.append({
            "concern_name": "Hyperpigmentation & Uneven Skin Tone",
            "severity": severity,
            "category": "Pigmentary",
            "description": f"Localized melanin clustering and dark spots detected (Pigmentation index: {pigmentation:.1f}/100).",
            "urgency_score": weight + pigmentation * 0.4,
            "recommended_ingredients": ["Alpha Arbutin (2%)", "Tranexamic Acid (3-5%)", "L-Ascorbic Acid (Vitamin C 15%)", "Azelaic Acid (10%)"],
            "routine_advice": "AM: Vitamin C Antioxidant Serum + Broad Spectrum Broad-Coverage SPF 50+. PM: Tranexamic Acid + Niacinamide Brightening Complex.",
            "avoid_ingredients": ["Unprotected Sun Exposure", "Harsh Mechanical Exfoliants"]
        })

    # 3. Skin Dehydration Concern
    if hydration < 50.0:
        if hydration < 25.0:
            severity = "Severe"
            weight = 85
        elif hydration < 40.0:
            severity = "Moderate"
            weight = 60
        else:
            severity = "Mild"
            weight = 35

        identified.append({
            "concern_name": "Transepidermal Water Loss / Skin Dehydration",
            "severity": severity,
            "category": "Moisture",
            "description": f"Depleted moisture content compromising skin suppleness (Hydration level: {hydration:.1f}/100).",
            "urgency_score": weight + (50.0 - hydration) * 0.8,
            "recommended_ingredients": ["Multi-Molecular Hyaluronic Acid", "Pentanediol", "Glycerin (10%)", "Polyglutamic Acid", "Beta-Glucan"],
            "routine_advice": "AM & PM: Apply Hyaluronic Acid serum on damp skin immediately after cleansing, sealed with a ceramide water cream.",
            "avoid_ingredients": ["Alcohol Denat", "Sodium Lauryl Sulfate (SLS)", "Astringent Toners"]
        })

    # 4. Skin Barrier Sensitivity Concern
    if sensitivity > 35.0:
        if sensitivity > 70.0:
            severity = "Severe"
            weight = 85
        elif sensitivity > 50.0:
            severity = "Moderate"
            weight = 60
        else:
            severity = "Mild"
            weight = 35

        identified.append({
            "concern_name": "Impaired Epidermal Barrier / High Reactivity",
            "severity": severity,
            "category": "Moisture",
            "description": f"Elevated cutaneous reactivity and barrier susceptibility (Sensitivity index: {sensitivity:.1f}/100).",
            "urgency_score": weight + sensitivity * 0.5,
            "recommended_ingredients": ["Ceramides (NP/AP/EOP)", "Centella Asiatica (Madecassoside)", "Colloidal Oatmeal", "Allantoin", "Panthenol (B5)"],
            "routine_advice": "AM & PM: Minimalist 3-step routine: Ultra-gentle pH-balanced hydrating cleanser + Panthenol B5 Barrier Repair Cream + Mineral Zinc Oxide SPF 50.",
            "avoid_ingredients": ["Synthetic Fragrance (Parfum)", "Essential Oils (Lavender, Citrus)", "High-Concentration AHAs/BHAs", "L-Ascorbic Acid > 10%"]
        })

    # 5. Excess Seborrhea Concern
    if oiliness > 65.0:
        if oiliness > 85.0:
            severity = "Severe"
            weight = 75
        elif oiliness > 75.0:
            severity = "Moderate"
            weight = 50
        else:
            severity = "Mild"
            weight = 30

        identified.append({
            "concern_name": "Hyperactive Seborrhea & Enlarged Pores",
            "severity": severity,
            "category": "Structural",
            "description": f"Overproduction of cutaneous sebum creating shiny t-zone (Oiliness level: {oiliness:.1f}/100).",
            "urgency_score": weight + oiliness * 0.3,
            "recommended_ingredients": ["Niacinamide (4-5%)", "Zinc PCA (1%)", "Green Tea Extract (EGCG)", "Clay/Kaolin"],
            "routine_advice": "AM: Gel-based Niacinamide & Zinc cleanser + Oil-control Mattifying Serum + Water Gel SPF. PM: Double cleanse with micellar water.",
            "avoid_ingredients": ["Heavy Emollients (Shea Butter)", "Mineral Oil", "Silicone-heavy primers"]
        })

    # 6. Premature Aging Concern
    if wrinkles > 25.0:
        if wrinkles > 65.0:
            severity = "Severe"
            weight = 70
        elif wrinkles > 45.0:
            severity = "Moderate"
            weight = 50
        else:
            severity = "Mild"
            weight = 30

        identified.append({
            "concern_name": "Fine Lines & Structural Collagen Depletion",
            "severity": severity,
            "category": "Structural",
            "description": f"Early superficial lines and reduced elastic resilience (Wrinkles index: {wrinkles:.1f}/100).",
            "urgency_score": weight + wrinkles * 0.3,
            "recommended_ingredients": ["Encapsulated Retinol (0.3-0.5%)", "Peptides (Matrixyl 3000)", "Copper Tripeptide-1", "Bakuchiol", "Adenosine"],
            "routine_advice": "AM: Peptide Firming Serum + Hydrating Cream + SPF 50. PM: Retinoid Cream 3 nights a week using sandwich technique.",
            "avoid_ingredients": ["Aggressive Exfoliants alongside Retinoids on same night", "Tanning beds"]
        })

    # Sort identified concerns by urgency_score descending
    identified.sort(key=lambda x: x["urgency_score"], reverse=True)

    # Assign priority rank (1, 2, 3...)
    concerns_result = []
    for idx, item in enumerate(identified, start=1):
        concerns_result.append({
            "concern_name": item["concern_name"],
            "severity": item["severity"],
            "priority": idx,
            "category": item["category"],
            "description": item["description"],
            "recommended_ingredients": item["recommended_ingredients"],
            "routine_advice": item["routine_advice"],
            "avoid_ingredients": item["avoid_ingredients"]
        })

    return concerns_result
