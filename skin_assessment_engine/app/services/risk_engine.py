from typing import Dict, List, Any

def evaluate_risk_factors(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Evaluates rule-based risk factors based on skin parameters, environmental exposures, and extended clinical criteria.
    Includes compound risk interaction detection and extended rule evaluation.
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
    fitzpatrick = str(data.get("fitzpatrick_phototype", "Type III (Medium)"))
    makeup = str(data.get("makeup_usage", "Light Minimal Makeup"))

    risks: List[Dict[str, Any]] = []

    # Rule 1: UV Photoaging & Melanogenesis Risk
    if sun_exposure > 2.0 and spf in ["Never", "Occasional"]:
        if sun_exposure > 4.0 and spf == "Never":
            level = "CRITICAL"
            r_score = 92.0
        elif sun_exposure > 3.0 or spf == "Never":
            level = "HIGH"
            r_score = 78.0
        else:
            level = "MEDIUM"
            r_score = 55.0

        risks.append({
            "risk_name": "UV Photoaging & Melanogenesis Risk",
            "risk_level": level,
            "risk_score": r_score,
            "affected_areas": "Cheeks, Forehead, Nose, Neck",
            "description": f"Sun exposure of {sun_exposure:.1f} hrs/day with '{spf}' SPF usage exposes skin to cellular UV damage and premature collagen breakdown.",
            "mitigation_tip": "Apply broad-spectrum SPF 50+ daily every morning and reapply every 2 hours when exposed to direct sunlight."
        })

    # Rule 2: Transepidermal Barrier Breakdown Risk
    if hydration < 45.0 or (hydration < 55.0 and sensitivity > 40.0) or water_liters < 1.5:
        if hydration < 30.0 or sensitivity > 65.0:
            level = "HIGH"
            r_score = 82.0
        else:
            level = "MEDIUM"
            r_score = 58.0

        risks.append({
            "risk_name": "Transepidermal Barrier Breakdown Risk",
            "risk_level": level,
            "risk_score": r_score,
            "affected_areas": "Perioral Area, Cheeks, Outer Eyecorners",
            "description": f"Low stratum corneum hydration ({hydration:.1f}%) paired with daily water intake ({water_liters:.1f}L) indicates compromised lipid barrier protection.",
            "mitigation_tip": "Increase water intake to at least 2.5L/day and incorporate barrier repair moisturizers containing ceramides, cholesterol, fatty acids, and Centella Asiatica."
        })

    # Rule 3: Cortisol-Induced Inflammatory Breakout Risk
    if stress >= 6 and sleep < 7.0:
        if stress >= 8 and sleep < 6.0:
            level = "HIGH"
            r_score = 80.0
        else:
            level = "MEDIUM"
            r_score = 56.0

        risks.append({
            "risk_name": "Cortisol-Induced Inflammatory Breakout Risk",
            "risk_level": level,
            "risk_score": r_score,
            "affected_areas": "Jawline, Lower Face, Chin",
            "description": f"Elevated stress level ({stress}/10) and sub-optimal sleep ({sleep:.1f} hrs) trigger systemic inflammatory cytokines and hyper-sebaceous activity.",
            "mitigation_tip": "Prioritize 7-8 hours of quality sleep, engage in stress mitigation, and utilize soothing Niacinamide (3-5%) formulations."
        })

    # Rule 4: Comedogenic Occlusion Risk
    if (oiliness > 65.0 and acne > 20.0) or ("Heavy" in makeup or "Full" in makeup):
        if oiliness > 80.0 and acne > 40.0:
            level = "HIGH"
            r_score = 84.0
        else:
            level = "MEDIUM"
            r_score = 60.0

        risks.append({
            "risk_name": "Comedogenic Occlusion & Pore Blockage Risk",
            "risk_level": level,
            "risk_score": r_score,
            "affected_areas": "T-Zone (Forehead, Nose, Chin)",
            "description": f"Excess cutaneous sebum production ({oiliness:.1f}/100) combined with '{makeup}' cosmetic usage increases follicular occlusion likelihood.",
            "mitigation_tip": "Perform oil-based double cleansing every evening followed by a gentle 2% Salicylic Acid (BHA) cleanser."
        })

    # Rule 5: Over-Exfoliation & Chemical Acid Burn Risk (NEW)
    if "Over-Exfoliated" in exfoliation or ("Daily" in exfoliation and sensitivity > 30.0):
        risks.append({
            "risk_name": "Over-Exfoliation & Epidermal Desquamation Damage",
            "risk_level": "HIGH",
            "risk_score": 86.0,
            "affected_areas": "Full Face, Cheeks",
            "description": f"Exfoliating at frequency '{exfoliation}' strips stratum corneum lipids and causes severe chemical irritation on sensitive skin.",
            "mitigation_tip": "Cease all AHA/BHA chemical exfoliants and scrubs for 14 days. Use only gentle pH 5.5 cleanser and ceramide repair cream."
        })

    # Rule 6: High Urban Pollution Free Radical Damage Risk (NEW)
    if "Pollution" in climate:
        risks.append({
            "risk_name": "Urban Particulate Matter (PM2.5) Oxidative Stress",
            "risk_level": "MEDIUM",
            "risk_score": 68.0,
            "affected_areas": "Exposed Facial Skin",
            "description": "Living in a High Urban Pollution climate exposes skin to micro-particulate matter that generates free radicals and accelerates lipid peroxidation.",
            "mitigation_tip": "Apply morning antioxidant serum with stabilized Vitamin C or Ectoin, and thorough evening cleansing."
        })

    # Rule 7: Post-Inflammatory Hyperpigmentation (PIH) Vulnerability
    if (acne > 25.0 and pigmentation > 20.0) or ("Type IV" in fitzpatrick or "Type V" in fitzpatrick or "Type VI" in fitzpatrick):
        if acne > 50.0:
            level = "HIGH"
            r_score = 81.0
        else:
            level = "MEDIUM"
            r_score = 58.0

        risks.append({
            "risk_name": "Post-Inflammatory Hyperpigmentation (PIH) Vulnerability",
            "risk_level": level,
            "risk_score": r_score,
            "affected_areas": "Post-Blemish Lesion Sites, Cheeks",
            "description": f"Active acne lesions alongside Fitzpatrick Phototype '{fitzpatrick}' create high vulnerability for long-lasting post-acne dark spots.",
            "mitigation_tip": "Never pick active acne blemishes. Apply targeted treatments with Azelaic Acid (10%) or Alpha Arbutin."
        })

    # Compound Risk Cascade: Cortisol + Barrier Disruption
    risk_names = [r["risk_name"] for r in risks]
    if "Cortisol-Induced Inflammatory Breakout Risk" in risk_names and "Transepidermal Barrier Breakdown Risk" in risk_names:
        risks.append({
            "risk_name": "COMPOUND CASCADE: Neurogenic Inflammaging & Barrier Failure",
            "risk_level": "CRITICAL",
            "risk_score": 95.0,
            "affected_areas": "Full Facial Cutaneous Surface",
            "description": "Co-occurrence of stress-induced cortisol surge and severe barrier breakdown creates a self-amplifying cascade of chronic cutaneous inflammation.",
            "mitigation_tip": "Cease all active chemical exfoliants immediately. Strip back to a 2-step barrier repair protocol (Centella + Ceramides) and consult a dermatologist."
        })

    # Default low risk if no elevated risks triggered
    if not risks:
        risks.append({
            "risk_name": "General Skin Balance Maintenance",
            "risk_level": "LOW",
            "risk_score": 15.0,
            "affected_areas": "Full Face",
            "description": "Current skin parameters and lifestyle habits demonstrate well-balanced cutaneous equilibrium with minimal risk indicators.",
            "mitigation_tip": "Maintain your existing gentle cleansing, moisturizing, and sun protection routine."
        })

    return risks
