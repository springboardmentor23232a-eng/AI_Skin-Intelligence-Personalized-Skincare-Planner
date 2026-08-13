def analyze_risks(data: dict) -> list:
    """
    Analyze health and environmental risk factors from skin profile data
    and return a list of risk dictionaries.
    """
    if not isinstance(data, dict):
        return []

    risks = []

    # Helper function for safe boolean/int checking
    def is_true(key):
        val = data.get(key, 0)
        if isinstance(val, bool):
            return val
        if isinstance(val, (int, float)):
            return val == 1
        if isinstance(val, str):
            return val.strip().lower() in ["1", "true", "yes"]
        return False

    # Helper function for safe string extraction
    def get_str(key):
        val = data.get(key, "")
        return str(val).strip() if val else ""

    sleep_quality = get_str("SleepQuality").lower()
    water_intake = get_str("WaterIntake").lower()

    # ----------------------------
    # Sleep
    # ----------------------------
    if sleep_quality == "poor":
        risks.append({
            "title": "Poor Sleep",
            "level": "High",
            "description": "Poor sleep slows skin repair and increases dullness and dark circles.",
            "recommendation": "Aim for 7-8 hours of quality restful sleep nightly."
        })
    elif sleep_quality == "average":
        risks.append({
            "title": "Average Sleep",
            "level": "Medium",
            "description": "Your sleep quality can be improved for healthier skin cell turnover.",
            "recommendation": "Try maintaining a consistent sleep schedule and relaxing pre-bed routine."
        })

    # ----------------------------
    # Water Intake
    # ----------------------------
    if water_intake == "low":
        risks.append({
            "title": "Low Hydration",
            "level": "High",
            "description": "Low hydration may cause dry, flaky skin and diminish natural elasticity.",
            "recommendation": "Drink at least 2.5 to 3 liters of water daily to maintain skin barrier moisture."
        })
    elif water_intake == "moderate":
        risks.append({
            "title": "Moderate Hydration",
            "level": "Low",
            "description": "Hydration is adequate but boosting fluid intake can improve skin glow.",
            "recommendation": "Try adding hydrating fruits or electrolyte fluids to your daily intake."
        })

    # ----------------------------
    # Stress
    # ----------------------------
    if is_true("Stress"):
        risks.append({
            "title": "High Stress",
            "level": "High",
            "description": "Elevated cortisol levels increase acne breakouts and slow overall skin healing.",
            "recommendation": "Practice mindfulness, meditation, or regular exercise to lower stress."
        })

    # ----------------------------
    # Smoking
    # ----------------------------
    if is_true("Smoking"):
        risks.append({
            "title": "Smoking",
            "level": "High",
            "description": "Smoking accelerates skin aging, degrades collagen, and restricts skin micro-circulation.",
            "recommendation": "Consider smoking cessation strategies to protect your skin structure."
        })

    # ----------------------------
    # Alcohol
    # ----------------------------
    if is_true("Alcohol"):
        risks.append({
            "title": "Alcohol Consumption",
            "level": "Medium",
            "description": "Alcohol dehydrates the body and skin, causing transient facial flushing and inflammation.",
            "recommendation": "Limit alcohol intake and drink extra water alongside alcoholic beverages."
        })

    # ----------------------------
    # Sun Exposure
    # ----------------------------
    if is_true("SunExposure"):
        risks.append({
            "title": "Sun Exposure",
            "level": "Medium",
            "description": "Frequent UV exposure accelerates photo-aging, hyperpigmentation, and collagen loss.",
            "recommendation": "Apply broad-spectrum SPF 30+ sunscreen every morning and reapply during extended sun exposure."
        })

    # ----------------------------
    # Pollution
    # ----------------------------
    if is_true("HighPollution"):
        risks.append({
            "title": "Environmental Pollution",
            "level": "Medium",
            "description": "Air pollutants and fine particulate matter generate free radicals damaging the skin barrier.",
            "recommendation": "Thoroughly double-cleanse your face after outdoor activities and use anti-oxidant serums."
        })

    # ----------------------------
    # Dry Climate
    # ----------------------------
    if is_true("DryClimate"):
        risks.append({
            "title": "Dry Climate",
            "level": "Low",
            "description": "Low humidity environments cause moisture evaporation from the epidermis.",
            "recommendation": "Use rich hydrating moisturizers and hyaluronic acid serums to lock in moisture."
        })

    # ----------------------------
    # Indoor AC
    # ----------------------------
    if is_true("IndoorAC"):
        risks.append({
            "title": "Air Conditioning Exposure",
            "level": "Low",
            "description": "Prolonged artificial indoor cooling strips ambient moisture, causing skin dryness.",
            "recommendation": "Keep a hydrating face mist nearby and use a facial moisturizer regularly."
        })

    # ----------------------------
    # Skin Type Specific Risks
    # ----------------------------
    if is_true("DrySkin"):
        risks.append({
            "title": "Dry Skin Barrier",
            "level": "Medium",
            "description": "Dry skin has a compromised lipid barrier, making it vulnerable to moisture loss and tightness.",
            "recommendation": "Use rich ceramide moisturizers and gentle non-foaming cleansers."
        })

    if is_true("OilySkin"):
        risks.append({
            "title": "Excess Sebum Production",
            "level": "Low",
            "description": "Overactive sebaceous glands can lead to shine, clogged pores, and congestion.",
            "recommendation": "Use oil-free gel moisturizers and niacinamide to regulate sebum."
        })

    if is_true("SensitiveSkin"):
        risks.append({
            "title": "Skin Hypersensitivity",
            "level": "Medium",
            "description": "Sensitive skin reacts easily to environmental stressors and harsh cosmetic ingredients.",
            "recommendation": "Use minimal ingredient products with soothing ingredients like centella or aloe."
        })

    # ----------------------------
    # Allergies & Sensitivities
    # ----------------------------
    if is_true("HasAllergy"):
        risks.append({
            "title": "Skin Allergies",
            "level": "High",
            "description": "Active skin allergies make your skin prone to acute inflammation and contact dermatitis.",
            "recommendation": "Perform patch tests before introducing new products and avoid harsh active chemicals."
        })

    if is_true("HasSensitivity"):
        risks.append({
            "title": "Sensitive Skin Barrier",
            "level": "Medium",
            "description": "Sensitive skin reacts easily to physical irritants, fragrance, or strong exfoliants.",
            "recommendation": "Opt for fragrance-free, gentle hypoallergenic formulas with soothing ceramides."
        })

    # ----------------------------
    # Skin Concerns
    # ----------------------------
    if is_true("Acne"):
        risks.append({
            "title": "Acne Flare-up Risk",
            "level": "Medium",
            "description": "Excess sebum or clogged pores can trigger localized inflammation and breakouts.",
            "recommendation": "Incorporate salicylic acid (BHA) or niacinamide to unclog pores and regulate sebum."
        })

    if is_true("Hyperpigmentation"):
        risks.append({
            "title": "Hyperpigmentation Risk",
            "level": "Medium",
            "description": "Uneven melanin production causes persistent dark patches and uneven skin tone.",
            "recommendation": "Use Vitamin C, alpha arbutin, and strict daily sun protection."
        })

    if is_true("DarkSpots"):
        risks.append({
            "title": "Dark Spots & Discoloration",
            "level": "Medium",
            "description": "Localized pigment spots from sun damage or past acne scarring.",
            "recommendation": "Apply targeted spot treatments with tranexamic acid, kojic acid, or Vitamin C."
        })

    if is_true("Dryness"):
        risks.append({
            "title": "Skin Dryness & Flaking",
            "level": "Medium",
            "description": "Lack of skin hydration leads to flaking, irritation, and fine dehydration lines.",
            "recommendation": "Layer hydrating toners under heavy occlusive creams containing hyaluronic acid."
        })

    if is_true("LargePores"):
        risks.append({
            "title": "Enlarged Pores",
            "level": "Low",
            "description": "Pores become enlarged due to excess oil buildup or reduced skin elasticity.",
            "recommendation": "Use gentle exfoliants like BHA (salicylic acid) and clay masks weekly."
        })

    if is_true("Dullness"):
        risks.append({
            "title": "Dull & Uneven Complexion",
            "level": "Low",
            "description": "Dead skin cell accumulation reduces natural skin radiance.",
            "recommendation": "Incorporate mild AHA exfoliants (like glycolic or lactic acid) 1-2 times a week."
        })

    if is_true("Aging"):
        risks.append({
            "title": "Premature Aging Risk",
            "level": "Low",
            "description": "Reduced collagen synthesis leads to fine lines, loss of elasticity, and sagging.",
            "recommendation": "Incorporate retinoids or peptide serums into your evening skincare routine."
        })

    if is_true("Redness"):
        risks.append({
            "title": "Facial Redness & Rosacea Risk",
            "level": "Medium",
            "description": "Capillary reactivity or rosacea tendencies cause persistent facial flushing.",
            "recommendation": "Avoid hot water, spicy foods, and use soothing azelaic acid or centella products."
        })

    if is_true("HighCaffeine"):
        risks.append({
            "title": "High Caffeine Intake",
            "level": "Low",
            "description": "Excess caffeine can have a mild diuretic effect, contributing to skin dehydration.",
            "recommendation": "Balance caffeine intake with extra glasses of pure water throughout the day."
        })

    return risks