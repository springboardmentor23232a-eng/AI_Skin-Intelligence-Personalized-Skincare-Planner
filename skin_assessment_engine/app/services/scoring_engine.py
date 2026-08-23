from typing import Dict, Tuple, Any

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
        
    # Water intake modifier
    if water_liters < 1.5:
        barrier_score -= (1.5 - water_liters) * 8.0
    elif water_liters >= 2.5:
        barrier_score += 4.0
        
    # Over-exfoliation penalty
    if "Over-Exfoliated" in exfoliation or "Daily" in exfoliation:
        barrier_score -= 15.0
        
    # Arid / Cold climate penalty on barrier
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

    # Pollution penalty
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

    # Per-component clinical recommendations
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
