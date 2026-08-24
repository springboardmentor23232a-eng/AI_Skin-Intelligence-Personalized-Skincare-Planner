from typing import Dict, Tuple, Any, List, Optional

def calculate_skin_health_score(data: Dict[str, Any]) -> Tuple[float, str, Dict[str, Any]]:
    """
    Calculates weighted skin health score (0-100), overall condition text,
    and detailed breakdown incorporating core parameters and extended clinical criteria.
    """
    hydration = float(data.get("hydration_level", 50.0))
    oiliness = float(data.get("oiliness_level", 50.0))
    sensitivity = float(data.get("sensitivity_level", 20.0))
    acne = float(data.get("acne_severity", 10.0))
    pigmentation = float(data.get("pigmentation_score", 15.0))
    wrinkles = float(data.get("wrinkles_score", 10.0))
    
    sun_exposure = float(data.get("sun_exposure_hours", 2.0))
    spf = str(data.get("spf_frequency", "Daily")).strip().capitalize()
    sleep = float(data.get("sleep_hours", 7.5))
    stress = int(data.get("stress_level", 4))

    # Extended criteria
    climate = str(data.get("climate_environment", "Temperate & Balanced"))
    water_liters = float(data.get("water_intake_liters", 2.0))
    exfoliation = str(data.get("exfoliation_frequency", "1-2 Times/Week"))
    makeup = str(data.get("makeup_usage", "Light Minimal Makeup"))

    # 1. Hydration & Barrier Component
    barrier_score = hydration
    if sensitivity > 30:
        barrier_score -= (sensitivity - 30) * 0.4
        
    if water_liters < 1.5:
        barrier_score -= (1.5 - water_liters) * 8.0
    elif water_liters >= 2.5:
        barrier_score += 4.0
        
    if "Over-Exfoliated" in exfoliation or "Daily" in exfoliation:
        barrier_score -= 15.0
        
    if "Arid" in climate or "Cold" in climate:
        barrier_score -= 6.0
        
    barrier_score = max(0.0, min(100.0, barrier_score))

    # 2. Sebum Balance Component
    sebum_dev = abs(oiliness - 50.0)
    sebum_score = max(0.0, min(100.0, 100.0 - (sebum_dev * 1.4)))
    if "Full Coverage" in makeup or "Heavy" in makeup:
        sebum_score -= 8.0
    sebum_score = max(0.0, min(100.0, sebum_score))

    # 3. Inflammatory & Acne Component
    acne_score = max(0.0, min(100.0, 100.0 - (acne * 1.5)))

    # 4. Tone & Structural Component
    tone_score = max(0.0, min(100.0, 100.0 - (pigmentation * 0.6 + wrinkles * 0.4)))

    # 5. Lifestyle & Environmental Impact Component
    lifestyle_score = 100.0
    if sleep < 7.0:
        lifestyle_score -= (7.0 - sleep) * 8.0
    lifestyle_score -= (stress - 1) * 3.5
    
    if sun_exposure > 2.0:
        sun_penalty = (sun_exposure - 2.0) * 5.0
        if spf in ["Never", "Occasional"]:
            sun_penalty *= 1.8
        elif spf == "Daily":
            sun_penalty *= 0.8
        elif spf == "Reapplied":
            sun_penalty *= 0.3
        lifestyle_score -= sun_penalty

    if "Pollution" in climate:
        lifestyle_score -= 10.0

    lifestyle_score = max(0.0, min(100.0, lifestyle_score))

    # Weighted Total Score
    overall_score = (
        (barrier_score * 0.25) +
        (sebum_score * 0.20) +
        (acne_score * 0.25) +
        (tone_score * 0.15) +
        (lifestyle_score * 0.15)
    )
    
    overall_score = round(max(0.0, min(100.0, overall_score)), 2)

    # Condition Classification
    if overall_score >= 85.0:
        condition = "Optimal Skin Condition"
    elif overall_score >= 70.0:
        condition = "Good Condition"
    elif overall_score >= 50.0:
        condition = "Moderate Concern"
    else:
        condition = "High Risk / Action Required"

    def get_status(score_val: float) -> str:
        if score_val >= 85.0:
            return "Optimal"
        elif score_val >= 70.0:
            return "Good"
        elif score_val >= 50.0:
            return "Needs Attention"
        return "Critical"

    barrier_rec = "Maintain lipid barrier with ceramide and Centella formulations." if barrier_score >= 70 else "Incorporate lipid barrier repair cream with 3:1:1 ceramide-cholesterol ratio and increase water intake."
    sebum_rec = "Sebum levels well regulated." if sebum_score >= 70 else ("Use gentle 2% Salicylic Acid to balance excessive sebum production." if oiliness > 60 else "Add hydrating hyaluronic acid emulsion to prevent dry flaking.")
    acne_rec = "Inflammatory acne index low." if acne_score >= 70 else "Apply targeted 10% Azelaic Acid or 2.5% Benzoyl Peroxide gel to active blemishes."
    tone_rec = "Skin tone and structural elasticity optimal." if tone_score >= 70 else "Incorporate morning Vitamin C antioxidant serum and evening Retinoid routine."
    lifestyle_rec = "Lifestyle factors support skin resilience." if lifestyle_score >= 70 else "Increase sleep to 7-8 hrs/day, apply broad spectrum SPF 50+ daily, and protect against urban pollution."

    breakdown = [
        {"name": "Moisture & Barrier Health", "score": round(barrier_score, 1), "weight": "25%", "status": get_status(barrier_score), "clinical_recommendation": barrier_rec},
        {"name": "Sebum & Pore Balance", "score": round(sebum_score, 1), "weight": "20%", "status": get_status(sebum_score), "clinical_recommendation": sebum_rec},
        {"name": "Inflammatory & Acne Index", "score": round(acne_score, 1), "weight": "25%", "status": get_status(acne_score), "clinical_recommendation": acne_rec},
        {"name": "Skin Tone & Structural Quality", "score": round(tone_score, 1), "weight": "15%", "status": get_status(tone_score), "clinical_recommendation": tone_rec},
        {"name": "Lifestyle & Environmental Resilience", "score": round(lifestyle_score, 1), "weight": "15%", "status": get_status(lifestyle_score), "clinical_recommendation": lifestyle_rec}
    ]

    return overall_score, condition, {"breakdown": breakdown}


def calculate_module7_weighted_score(
    skin_condition: float = 75.0,
    lifestyle_habits: float = 80.0,
    sleep_quality: float = 70.0,
    routine_consistency: float = 85.0,
    hydration_level: float = 80.0
) -> Dict[str, Any]:
    """
    Module 7: Skin Health Scoring Engine
    Calculates weighted score based on explicit 5-factor model:
      - Skin Condition Assessment (35%)
      - Lifestyle Habits (20%)
      - Sleep Quality (15%)
      - Routine Consistency (20%)
      - Hydration Level (10%)
    """
    cond = max(0.0, min(100.0, float(skin_condition)))
    life = max(0.0, min(100.0, float(lifestyle_habits)))
    sleep = max(0.0, min(100.0, float(sleep_quality)))
    cons = max(0.0, min(100.0, float(routine_consistency)))
    hydr = max(0.0, min(100.0, float(hydration_level)))

    weighted_total = (
        (cond * 0.35) +
        (life * 0.20) +
        (sleep * 0.15) +
        (cons * 0.20) +
        (hydr * 0.10)
    )

    weighted_total = round(weighted_total, 1)

    def get_cat_status(sc: float) -> str:
        if sc >= 85: return "Optimal"
        if sc >= 70: return "Good"
        if sc >= 55: return "Moderate"
        return "Needs Attention"

    def get_color(sc: float) -> str:
        if sc >= 85: return "#2E7D32" # Green
        if sc >= 70: return "#C59B27" # Gold
        if sc >= 55: return "#D97706" # Orange
        return "#DC2626" # Red

    breakdown = [
        {
            "category": "Skin Condition Assessment",
            "score": cond,
            "weight": 0.35,
            "weight_label": "35%",
            "weighted_contribution": round(cond * 0.35, 1),
            "status": get_cat_status(cond),
            "color": get_color(cond)
        },
        {
            "category": "Lifestyle Habits",
            "score": life,
            "weight": 0.20,
            "weight_label": "20%",
            "weighted_contribution": round(life * 0.20, 1),
            "status": get_cat_status(life),
            "color": get_color(life)
        },
        {
            "category": "Sleep Quality",
            "score": sleep,
            "weight": 0.15,
            "weight_label": "15%",
            "weighted_contribution": round(sleep * 0.15, 1),
            "status": get_cat_status(sleep),
            "color": get_color(sleep)
        },
        {
            "category": "Routine Consistency",
            "score": cons,
            "weight": 0.20,
            "weight_label": "20%",
            "weighted_contribution": round(cons * 0.20, 1),
            "status": get_cat_status(cons),
            "color": get_color(cons)
        },
        {
            "category": "Hydration Level",
            "score": hydr,
            "weight": 0.10,
            "weight_label": "10%",
            "weighted_contribution": round(hydr * 0.10, 1),
            "status": get_cat_status(hydr),
            "color": get_color(hydr)
        }
    ]

    grade = (
        "Optimal Barrier (A+)" if weighted_total >= 90 else
        "Good (Improving)" if weighted_total >= 75 else
        "Moderate Concern" if weighted_total >= 60 else
        "High Risk / Action Required"
    )

    insights = [
        f"Overall Skin Health Score: {weighted_total}/100 ({grade}).",
        f"Skin Condition contributes {round(cond * 0.35, 1)} points to overall score (35% weight).",
        f"Routine Consistency contributes {round(cons * 0.20, 1)} points (20% weight)."
    ]

    improvement_recs = []
    if sleep < 75:
        improvement_recs.append("💤 Sleep Optimization: Increase nightly restful sleep to 7.5+ hours to boost cell regeneration.")
    if cons < 80:
        improvement_recs.append("📅 Routine Consistency: Maintain daily AM/PM checklist logging to maximize routine adherence score.")
    if hydr < 75:
        improvement_recs.append("💧 Hydration Boost: Drink 2.5L water daily and use hyaluronic acid serums.")
    if not improvement_recs:
        improvement_recs.append("🌟 Excellent Routine! Continue current regimen and daily SPF sun protection.")

    return {
        "overall_skin_health_score": weighted_total,
        "grade": grade,
        "formula_used": "Skin Health Score = 35% Condition + 20% Lifestyle + 15% Sleep + 20% Routine Consistency + 10% Hydration",
        "breakdown": breakdown,
        "insights": insights,
        "improvement_recommendations": improvement_recs
    }
