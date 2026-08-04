from typing import Dict, List, Tuple
from app.schemas.assessment import SkinAssessmentInput, SkinConcernSchema, RiskFactorSchema

class SkinAssessmentEngine:
    """
    Rule-Based Skin Assessment Engine:
    Calculates skin health score (0-100), overall condition, skin concerns,
    severities, priorities, and risk factor analysis based on clinical & lifestyle parameters.
    """

    @staticmethod
    def evaluate(inputs: SkinAssessmentInput) -> Tuple[int, str, List[SkinConcernSchema], List[RiskFactorSchema]]:
        score_penalties = 0

        # Helper getters with default safety
        skin_type = (inputs.skin_type or "Normal").title()
        oiliness = (inputs.oiliness or "Low").title()
        dryness = (inputs.dryness or "Low").title()
        acne = (inputs.acne or "None").title()
        pigmentation = (inputs.pigmentation or "None").title()
        redness = (inputs.redness or "None").title()
        wrinkles = (inputs.wrinkles or "None").title()
        dark_spots = (inputs.dark_spots or "None").title()
        sun_exposure = (inputs.sun_exposure or "Moderate").title()
        stress_level = (inputs.stress_level or "Low").title()
        alcohol = (inputs.alcohol or "None").title()
        water_intake = inputs.water_intake if inputs.water_intake is not None else 2.0
        sleep_hours = inputs.sleep_hours if inputs.sleep_hours is not None else 7.0
        age = inputs.age if inputs.age is not None else 25
        
        # Handle smoking bool or string
        is_smoking = False
        if isinstance(inputs.smoking, bool):
            is_smoking = inputs.smoking
        elif isinstance(inputs.smoking, str):
            is_smoking = inputs.smoking.strip().lower() in ["true", "yes", "1"]

        # ----------------------------------------------------
        # 1. SCORE CALCULATION (Start at 100)
        # ----------------------------------------------------

        # Acne Penalties
        if acne == "Mild":
            score_penalties += 8
        elif acne == "Moderate":
            score_penalties += 16
        elif acne == "Severe":
            score_penalties += 26

        # Pigmentation & Dark Spots
        if pigmentation == "Mild":
            score_penalties += 5
        elif pigmentation == "Moderate":
            score_penalties += 12
        elif pigmentation == "Severe":
            score_penalties += 18

        if dark_spots == "Mild":
            score_penalties += 4
        elif dark_spots == "Moderate":
            score_penalties += 8
        elif dark_spots == "Severe":
            score_penalties += 14

        # Redness & Sensitivity
        if redness == "Mild":
            score_penalties += 5
        elif redness == "Moderate":
            score_penalties += 10
        elif redness == "Severe":
            score_penalties += 16

        # Wrinkles
        if wrinkles == "Mild":
            score_penalties += 4
        elif wrinkles == "Moderate":
            score_penalties += 9
        elif wrinkles == "Severe":
            score_penalties += 15

        # Oiliness & Dryness
        if oiliness == "High":
            score_penalties += 7
        elif oiliness == "Medium":
            score_penalties += 3

        if dryness == "High":
            score_penalties += 7
        elif dryness == "Medium":
            score_penalties += 3

        # Sun Exposure
        if sun_exposure == "High":
            score_penalties += 10
        elif sun_exposure == "Moderate":
            score_penalties += 4

        # Hydration / Water Intake
        if water_intake < 1.2:
            score_penalties += 12
        elif water_intake < 2.0:
            score_penalties += 5

        # Sleep Hours
        if sleep_hours < 5.5:
            score_penalties += 12
        elif sleep_hours < 7.0:
            score_penalties += 5

        # Stress Level
        if stress_level == "High":
            score_penalties += 10
        elif stress_level == "Medium":
            score_penalties += 4

        # Smoking & Alcohol
        if is_smoking:
            score_penalties += 18
        if alcohol == "Regular":
            score_penalties += 10
        elif alcohol == "Occasional":
            score_penalties += 3

        # Compute final score bounded between 0 and 100
        health_score = max(0, min(100, 100 - score_penalties))

        # ----------------------------------------------------
        # 2. OVERALL CONDITION
        # ----------------------------------------------------
        if health_score >= 85:
            overall_condition = "Excellent"
        elif health_score >= 70:
            overall_condition = "Good"
        elif health_score >= 50:
            overall_condition = "Moderate"
        else:
            overall_condition = "Poor"

        # ----------------------------------------------------
        # 3. IDENTIFY SKIN CONCERNS, SEVERITY & PRIORITY
        # ----------------------------------------------------
        concerns: List[SkinConcernSchema] = []

        # Acne Concern
        if acne in ["Mild", "Moderate", "Severe"]:
            severity_map = {"Mild": "Low", "Moderate": "Medium", "Severe": "High"}
            priority_map = {"Mild": "Medium", "Moderate": "High", "Severe": "Critical"}
            concerns.append(SkinConcernSchema(
                concern_name="Acne Breakouts & Blemishes",
                severity=severity_map[acne],
                priority=priority_map[acne]
            ))

        # Dry Skin / Dehydration Concern
        if dryness == "High" or water_intake < 1.5:
            sev = "High" if (dryness == "High" and water_intake < 1.2) else "Medium"
            prio = "High" if sev == "High" else "Medium"
            concerns.append(SkinConcernSchema(
                concern_name="Dry Skin & Dehydration",
                severity=sev,
                priority=prio
            ))

        # Oily Skin Concern
        if oiliness == "High":
            concerns.append(SkinConcernSchema(
                concern_name="Oily Skin & Excess Sebum",
                severity="Medium",
                priority="Medium"
            ))

        # Hyperpigmentation / Dark Spots
        if pigmentation in ["Mild", "Moderate", "Severe"] or dark_spots in ["Mild", "Moderate", "Severe"]:
            is_high = (pigmentation == "Severe" or dark_spots == "Severe")
            concerns.append(SkinConcernSchema(
                concern_name="Hyperpigmentation & Dark Spots",
                severity="High" if is_high else "Medium",
                priority="High" if is_high else "Medium"
            ))

        # Sensitive Skin & Redness
        if skin_type == "Sensitive" or redness in ["Mild", "Moderate", "Severe"]:
            is_high = (redness == "Severe" or skin_type == "Sensitive")
            concerns.append(SkinConcernSchema(
                concern_name="Sensitive Skin & Erythema",
                severity="High" if is_high else "Medium",
                priority="High" if is_high else "Medium"
            ))

        # Fine Lines & Wrinkles
        if wrinkles in ["Mild", "Moderate", "Severe"]:
            is_high = (wrinkles == "Severe")
            concerns.append(SkinConcernSchema(
                concern_name="Fine Lines & Wrinkles",
                severity="High" if is_high else "Low",
                priority="Medium" if is_high else "Low"
            ))

        # If no severe concerns identified, add general maintenance concern
        if not concerns:
            concerns.append(SkinConcernSchema(
                concern_name="General Barrier Maintenance",
                severity="Low",
                priority="Low"
            ))

        # ----------------------------------------------------
        # 4. GENERATE RISK FACTORS
        # ----------------------------------------------------
        risks: List[RiskFactorSchema] = []

        if sleep_hours < 6.0:
            risks.append(RiskFactorSchema(
                risk_name="Poor Sleep",
                description=f"Logged {sleep_hours} hrs sleep per night. Inadequate sleep suppresses nocturnal epidermal renewal and cellular repair.",
                risk_level="High"
            ))

        if stress_level == "High":
            risks.append(RiskFactorSchema(
                risk_name="High Stress",
                description="Elevated systemic cortisol increases sebum lipid oxidation and triggers inflammatory micro-breakouts.",
                risk_level="High"
            ))

        if water_intake < 1.5:
            risks.append(RiskFactorSchema(
                risk_name="Dehydration",
                description=f"Water intake of {water_intake}L/day is below recommended levels (2.5L), impairing transepidermal water retention.",
                risk_level="High" if water_intake < 1.0 else "Medium"
            ))

        if sun_exposure == "High":
            risks.append(RiskFactorSchema(
                risk_name="UV Damage",
                description="High solar exposure without adequate photoprotection degrades extracellular collagen fibers and increases photo-aging risk.",
                risk_level="High"
            ))

        if is_smoking:
            risks.append(RiskFactorSchema(
                risk_name="Smoking",
                description="Tobacco smoke vasoconstricts dermal capillaries, restricting cellular oxygenation and accelerating premature elasticity loss.",
                risk_level="Critical"
            ))

        if alcohol == "Regular":
            risks.append(RiskFactorSchema(
                risk_name="Alcohol Consumption",
                description="Frequent alcohol consumption depletes vitamin A levels and causes cutaneous vascular dilation.",
                risk_level="Medium"
            ))

        if not risks:
            risks.append(RiskFactorSchema(
                risk_name="Low Lifestyle Risk",
                description="Lifestyle habits support optimal skin regeneration with minimal environmental risk factors.",
                risk_level="Low"
            ))

        return health_score, overall_condition, concerns, risks
