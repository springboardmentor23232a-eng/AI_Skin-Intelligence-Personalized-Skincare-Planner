def prioritize_concerns(data):

    concerns = {}

    # -----------------------------
    # Acne
    # -----------------------------
    acne_score = 0

    if data["Acne"] == 1:
        acne_score += 5

    if data["SkinType"] in ["Oily", "Combination"]:
        acne_score += 3

    if data["Stress"] == 1:
        acne_score += 2

    if data["SleepQuality"] == "Poor":
        acne_score += 2

    if data["HighPollution"] == 1:
        acne_score += 1

    if acne_score > 0:
        concerns["Acne"] = acne_score

    # -----------------------------
    # Dryness
    # -----------------------------
    dryness_score = 0

    if data["Dryness"] == 1:
        dryness_score += 5

    if data["SkinType"] in ["Dry", "Combination"]:
        dryness_score += 3

    if data["WaterIntake"] == "Low":
        dryness_score += 3

    if data["DryClimate"] == 1:
        dryness_score += 2

    if data["IndoorAC"] == 1:
        dryness_score += 1

    if dryness_score > 0:
        concerns["Dryness"] = dryness_score

    # -----------------------------
    # Hyperpigmentation
    # -----------------------------
    hyper_score = 0

    if data["Hyperpigmentation"] == 1:
        hyper_score += 5

    if data["SunExposure"] == 1:
        hyper_score += 3

    if data["DarkSpots"] == 1:
        hyper_score += 2

    if hyper_score > 0:
        concerns["Hyperpigmentation"] = hyper_score

    # -----------------------------
    # Aging
    # -----------------------------
    aging_score = 0

    if data["Aging"] == 1:
        aging_score += 5

    if data["AgeGroup"] in ["45-54", "55+"]:
        aging_score += 3

    if data["Smoking"] == 1:
        aging_score += 2

    if data["SunExposure"] == 1:
        aging_score += 2

    if aging_score > 0:
        concerns["Aging"] = aging_score

    # -----------------------------
    # Redness
    # -----------------------------
    redness_score = 0

    if data["Redness"] == 1:
        redness_score += 5

    if data["SkinType"] in ["Sensitive", "Combination"]:
        redness_score += 3

    if data["HasAllergy"] == 1:
        redness_score += 2

    if data["HasSensitivity"] == 1:
        redness_score += 2

    if redness_score > 0:
        concerns["Redness"] = redness_score

    # -----------------------------
    # Dark Spots
    # -----------------------------
    dark_score = 0

    if data["DarkSpots"] == 1:
        dark_score += 5

    if data["SunExposure"] == 1:
        dark_score += 2

    if dark_score > 0:
        concerns["Dark Spots"] = dark_score

    # -----------------------------
    # Large Pores
    # -----------------------------
    pore_score = 0

    if data["LargePores"] == 1:
        pore_score += 5

    if data["SkinType"] in ["Oily", "Combination"]:
        pore_score += 3

    if pore_score > 0:
        concerns["Large Pores"] = pore_score

    # -----------------------------
    # Dullness
    # -----------------------------
    dull_score = 0

    if data["Dullness"] == 1:
        dull_score += 5

    if data["SleepQuality"] == "Poor":
        dull_score += 2

    if data["Stress"] == 1:
        dull_score += 2

    if data["Smoking"] == 1:
        dull_score += 1

    if dull_score > 0:
        concerns["Dullness"] = dull_score

    # -----------------------------
    # Sort by score
    # -----------------------------

    ranked = sorted(
        concerns.items(),
        key=lambda x: x[1],
        reverse=True
    )

    results = []

    for i, (concern, score) in enumerate(ranked, start=1):

        if score >= 9:
            severity = "High"
        elif score >= 6:
            severity = "Medium"
        else:
            severity = "Low"

        results.append({

            "priority": i,

            "concern": concern,

            "score": score,

            "severity": severity

        })

    return results