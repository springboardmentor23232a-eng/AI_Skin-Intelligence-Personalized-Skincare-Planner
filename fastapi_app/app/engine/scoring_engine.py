from typing import Dict, List, Tuple, Optional
from app.schemas.scoring import (
    ScoreCalculationInput, SubScoreBreakdown, SkinImprovementScore, ScoreCalculationResponse
)

class SkinHealthScoringEngine:
    """
    Module 7: Skin Health Scoring Engine
    Implements the 5-factor weighted clinical scoring model:
      - Skin Condition Assessment: 35%
      - Lifestyle Habits: 20%
      - Sleep Quality: 15%
      - Routine Consistency: 20%
      - Hydration Level: 10%
    Also provides skin improvement scoring, sub-component breakdown, and targeted recommendations.
    """

    WEIGHT_CONDITION = 0.35
    WEIGHT_LIFESTYLE = 0.20
    WEIGHT_SLEEP = 0.15
    WEIGHT_ROUTINE = 0.20
    WEIGHT_HYDRATION = 0.10

    @classmethod
    def evaluate_skin_condition(cls, inputs: ScoreCalculationInput) -> Tuple[int, str]:
        score = 100
        
        # Penalties
        acne = (inputs.acne_severity or "None").title()
        pigment = (inputs.pigmentation or "None").title()
        dark_spots = (inputs.dark_spots or "None").title()
        redness = (inputs.redness_level or "None").title()
        wrinkles = (inputs.wrinkles or "None").title()
        oiliness = (inputs.oiliness or "Low").title()
        dryness = (inputs.dryness or "Low").title()

        if acne == "Mild": score -= 10
        elif acne == "Moderate": score -= 20
        elif acne == "Severe": score -= 35

        if pigment == "Mild": score -= 8
        elif pigment == "Moderate": score -= 16
        elif pigment == "Severe": score -= 25

        if dark_spots == "Mild": score -= 5
        elif dark_spots == "Moderate": score -= 10
        elif dark_spots == "Severe": score -= 18

        if redness == "Mild": score -= 8
        elif redness == "Moderate": score -= 15
        elif redness == "Severe": score -= 24

        if wrinkles == "Mild": score -= 5
        elif wrinkles == "Moderate": score -= 12
        elif wrinkles == "Severe": score -= 20

        if oiliness == "Medium": score -= 4
        elif oiliness == "High": score -= 10

        if dryness == "Medium": score -= 4
        elif dryness == "High": score -= 10

        final_score = max(0, min(100, score))
        if final_score >= 85: feedback = "Excellent skin condition with minimal inflammatory concerns."
        elif final_score >= 70: feedback = "Good skin condition with mild surface concerns."
        elif final_score >= 50: feedback = "Moderate skin condition requiring active clinical ingredients."
        else: feedback = "Elevated skin distress needing immediate barrier recovery."

        return final_score, feedback

    @classmethod
    def evaluate_lifestyle(cls, inputs: ScoreCalculationInput) -> Tuple[int, str]:
        stress = (inputs.stress_level or "Low").title()
        sun = (inputs.sun_exposure or "Moderate").title()
        alcohol = (inputs.alcohol or "None").title()
        is_smoking = bool(inputs.smoking)

        stress_score = 100 if stress == "Low" else (75 if stress == "Medium" else 40)
        sun_score = 100 if sun == "Low" else (80 if sun == "Moderate" else 50)
        smoking_score = 35 if is_smoking else 100
        alcohol_score = 100 if alcohol == "None" else (80 if alcohol == "Occasional" else 45)

        avg_score = round((stress_score + sun_score + smoking_score + alcohol_score) / 4.0)
        final_score = max(0, min(100, avg_score))

        if final_score >= 85: feedback = "Low environmental & lifestyle stress supporting rapid cellular turnover."
        elif final_score >= 70: feedback = "Moderate lifestyle impact; optimize stress and UV protection."
        else: feedback = "High lifestyle stress accelerates lipid breakdown & photo-aging."

        return final_score, feedback

    @classmethod
    def evaluate_sleep(cls, inputs: ScoreCalculationInput) -> Tuple[int, str]:
        hrs = inputs.sleep_hours if inputs.sleep_hours is not None else 7.5

        if hrs >= 8.0:
            score = 100
            feedback = "Optimal 8+ hours sleep unlocks full nocturnal epidermal restoration."
        elif hrs >= 7.0:
            score = 90
            feedback = "Good sleep duration supporting steady cellular repair."
        elif hrs >= 6.0:
            score = 75
            feedback = "Adequate sleep; consider increasing to 7.5+ hours for peak barrier healing."
        elif hrs >= 5.0:
            score = 55
            feedback = "Sub-optimal sleep increases dark circles & elevated cortisol breakdown."
        else:
            score = 35
            feedback = "Severe sleep deficit severely impairs nighttime micro-circulation."

        return score, feedback

    @classmethod
    def evaluate_routine_consistency(cls, inputs: ScoreCalculationInput) -> Tuple[int, str]:
        pct = inputs.routine_consistency_pct if inputs.routine_consistency_pct is not None else 85.0
        final_score = int(max(0.0, min(100.0, pct)))

        if final_score >= 90: feedback = "Outstanding routine discipline ensuring maximum active ingredient absorption."
        elif final_score >= 75: feedback = "Good routine adherence; maintain morning & night consistency."
        elif final_score >= 50: feedback = "Inconsistent routine execution reduces active compound efficacy."
        else: feedback = "Low adherence; set daily reminders to build lasting skincare habits."

        return final_score, feedback

    @classmethod
    def evaluate_hydration(cls, inputs: ScoreCalculationInput) -> Tuple[int, str]:
        liters = inputs.water_intake_liters if inputs.water_intake_liters is not None else 2.5

        if liters >= 3.0:
            score = 100
            feedback = "Superior fluid intake (3.0L+) maintains peak dermal turgor and hydration."
        elif liters >= 2.5:
            score = 90
            feedback = "Optimal hydration level supporting active intracellular fluid balance."
        elif liters >= 2.0:
            score = 80
            feedback = "Good water intake; aim for 2.5L to boost plumpness."
        elif liters >= 1.5:
            score = 65
            feedback = "Moderate hydration; increase fluid intake to prevent transepidermal water loss."
        elif liters >= 1.0:
            score = 45
            feedback = "Low fluid intake; skin barrier is prone to dryness and flakiness."
        else:
            score = 25
            feedback = "Critical dehydration levels impairing systemic cell turnover."

        return score, feedback

    @classmethod
    def calculate_weighted_score(cls, inputs: ScoreCalculationInput) -> ScoreCalculationResponse:
        # Evaluate 5 components
        cond_score, cond_fb = cls.evaluate_skin_condition(inputs)
        life_score, life_fb = cls.evaluate_lifestyle(inputs)
        sleep_score, sleep_fb = cls.evaluate_sleep(inputs)
        rout_score, rout_fb = cls.evaluate_routine_consistency(inputs)
        hydr_score, hydr_fb = cls.evaluate_hydration(inputs)

        # Apply exact weights (35%, 20%, 15%, 20%, 10%)
        cond_weighted = round(cond_score * cls.WEIGHT_CONDITION, 2)
        life_weighted = round(life_score * cls.WEIGHT_LIFESTYLE, 2)
        sleep_weighted = round(sleep_score * cls.WEIGHT_SLEEP, 2)
        rout_weighted = round(rout_score * cls.WEIGHT_ROUTINE, 2)
        hydr_weighted = round(hydr_score * cls.WEIGHT_HYDRATION, 2)

        overall = round(cond_weighted + life_weighted + sleep_weighted + rout_weighted + hydr_weighted)
        overall = max(0, min(100, overall))

        # Determine Score Rating
        if overall >= 85:
            rating = "Optimal Clinical Skin Health (Excellent)"
        elif overall >= 70:
            rating = "Good Health with Targeted Care Needed"
        elif overall >= 55:
            rating = "Moderate Skin Vitality (Action Recommended)"
        else:
            rating = "Compromised Barrier / High Maintenance Needed"

        # Sub-scores dict
        sub_scores = {
            "skin_condition": SubScoreBreakdown(
                name="Skin Condition Assessment",
                weight_pct=35.0,
                raw_score=cond_score,
                weighted_contribution=cond_weighted,
                status="Optimal" if cond_score >= 80 else ("Moderate" if cond_score >= 60 else "Needs Attention"),
                feedback=cond_fb
            ),
            "lifestyle": SubScoreBreakdown(
                name="Lifestyle Habits",
                weight_pct=20.0,
                raw_score=life_score,
                weighted_contribution=life_weighted,
                status="Optimal" if life_score >= 80 else ("Moderate" if life_score >= 60 else "Needs Attention"),
                feedback=life_fb
            ),
            "sleep": SubScoreBreakdown(
                name="Sleep Quality",
                weight_pct=15.0,
                raw_score=sleep_score,
                weighted_contribution=sleep_weighted,
                status="Optimal" if sleep_score >= 80 else ("Moderate" if sleep_score >= 60 else "Needs Attention"),
                feedback=sleep_fb
            ),
            "routine_consistency": SubScoreBreakdown(
                name="Routine Consistency",
                weight_pct=20.0,
                raw_score=rout_score,
                weighted_contribution=rout_weighted,
                status="Optimal" if rout_score >= 80 else ("Moderate" if rout_score >= 60 else "Needs Attention"),
                feedback=rout_fb
            ),
            "hydration": SubScoreBreakdown(
                name="Hydration Level",
                weight_pct=10.0,
                raw_score=hydr_score,
                weighted_contribution=hydr_weighted,
                status="Optimal" if hydr_score >= 80 else ("Moderate" if hydr_score >= 60 else "Needs Attention"),
                feedback=hydr_fb
            )
        }

        # Calculate Improvement Score
        prev = inputs.previous_score if inputs.previous_score is not None else 72
        delta = overall - prev
        pct_change = round(((delta) / max(1, prev)) * 100.0, 1)

        if delta > 5:
            imp_status = "Rapid Clinical Improvement"
        elif delta > 0:
            imp_status = "Steady Positive Trajectory"
        elif delta == 0:
            imp_status = "Stable Barrier Maintenance"
        else:
            imp_status = "Slight Score Regression"

        # Determine Primary Driver
        lowest_sub = min(sub_scores.values(), key=lambda x: x.raw_score)
        highest_sub = max(sub_scores.values(), key=lambda x: x.raw_score)
        primary_driver = f"Strengthened by {highest_sub.name} ({highest_sub.raw_score}/100); Bottlenecked by {lowest_sub.name} ({lowest_sub.raw_score}/100)"

        improvement = SkinImprovementScore(
            previous_score=prev,
            current_score=overall,
            delta=delta,
            percentage_change=pct_change,
            improvement_status=imp_status,
            primary_driver=primary_driver
        )

        # Generate Actionable Recommendations
        recommendations = []
        if cond_score < 75:
            recommendations.append("Apply active treatments (Niacinamide / Salicylic Acid) targeting key skin condition penalties.")
        if life_score < 75:
            recommendations.append("Enhance photoprotection with broad-spectrum SPF 50+ and practice daily stress reduction.")
        if sleep_score < 75:
            recommendations.append("Aim for 7.5 to 8.5 hours sleep to maximize overnight cellular regeneration.")
        if rout_score < 75:
            recommendations.append("Commit to both Morning & Evening steps without skipping daily cleansing or moisturizing.")
        if hydr_score < 75:
            recommendations.append("Increase daily fluid intake to 2.5L–3.0L to lock in skin moisture balance.")

        if not recommendations:
            recommendations.append("Excellent skin health maintained! Continue your current personalized regimen and hydration routine.")

        return ScoreCalculationResponse(
            overall_skin_health_score=overall,
            score_rating=rating,
            sub_scores=sub_scores,
            improvement=improvement,
            recommendations=recommendations
        )
