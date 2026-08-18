from typing import Dict, List


def generate_routine(assessment, previous_assessment=None) -> Dict:
    """
    Generates a personalized skincare routine based on
    the user's skin assessment.

    Module 4:
    - Personalized routine generation
    - Morning routine
    - Evening routine
    - Weekly treatment plan
    - Seasonal recommendations
    - Required routine categories
    """

    # --------------------------------------------------
    # 1. READ ASSESSMENT DATA
    # --------------------------------------------------

    skin_type = (assessment.predicted_skin_type or "").lower()

    concerns = [
        str(concern).lower()
        for concern in (assessment.concerns or [])
    ]

    priority_order = [
        str(priority).lower()
        for priority in (assessment.priority_order or [])
    ]

    sensitivity = (
        str(assessment.sensitivity or "")
        .lower()
    )

    health_score = assessment.health_score or 0

    # These fields may not exist in the current database yet.
    # getattr() prevents the routine engine from breaking until
    # allergy/lifestyle fields are added.
    allergies = getattr(assessment, "allergies", None) or []

    if isinstance(allergies, str):
        allergies = [allergies]

    allergies = [
        str(allergy).lower()
        for allergy in allergies
    ]

    sleep_hours = getattr(assessment, "sleep_hours", None)
    water_glasses = getattr(assessment, "water_glasses", None)

    # Combine concerns and priorities.
    skin_conditions = set(concerns + priority_order)

    # --------------------------------------------------
# Adaptive routine comparison
# --------------------------------------------------

    resolved_concerns = set()
    new_concerns = set()

    if previous_assessment is not None:
        previous_concerns = {
            str(concern).lower()
            for concern in (previous_assessment.concerns or [])
        }

        current_concerns = {
            str(concern).lower()
            for concern in (assessment.concerns or [])
        }

        resolved_concerns = previous_concerns - current_concerns
        new_concerns = current_concerns - previous_concerns

    acne_improved = (
        "acne prone" in resolved_concerns
        or any("acne" in concern for concern in resolved_concerns)
    )

    acne_new = (
        "acne prone" in new_concerns
        or any("acne" in concern for concern in new_concerns)
    )

    sebum_improved = (
        "excess sebum" in resolved_concerns
        or "oily skin" in resolved_concerns
    )

    sensitivity_improved = (
        "mild sensitivity" in resolved_concerns
        or any("sensitivity" in concern for concern in resolved_concerns)
    )
    condition_text = " ".join(skin_conditions)

    # --------------------------------------------------
    # 2. PERSONALIZATION FLAGS
    # --------------------------------------------------

    acne_prone = (
        "acne" in condition_text
        or "acne prone" in skin_conditions
    )

    excess_sebum = (
        "excess sebum" in condition_text
        or "oily skin" in condition_text
        or "oily" in skin_type
    )

    hyperpigmentation = (
        "dark spots" in condition_text
        or "hyperpigmentation" in condition_text
        or "uneven skin tone" in condition_text
    )

    dehydration = (
        "dehydration" in condition_text
        or "mild dehydration" in condition_text
    )

    sensitive_skin = (
        "sensitivity" in sensitivity
        or "sensitive" in sensitivity
        or "sensitivity" in condition_text
        or "sensitive" in condition_text
        or "mild sensitivity" in condition_text
    )

    # Lower health scores should receive a gentler,
    # barrier-support focused routine.
    low_health_score = health_score < 60

    # Lifestyle indicators
    low_sleep = (
        sleep_hours is not None
        and sleep_hours < 6
    )

    low_hydration = (
        water_glasses is not None
        and water_glasses < 6
    )

    moderate_sleep = (
        sleep_hours is not None
        and 6 <= sleep_hours < 7
    )

    moderate_hydration = (
        water_glasses is not None
        and 6 <= water_glasses < 8
    )
    # --------------------------------------------------
    # 3. ALLERGY CHECK HELPERS
    # --------------------------------------------------

    def has_allergy(keyword: str) -> bool:
        return any(
            keyword in allergy
            for allergy in allergies
        )

    # Example: if the user reports fragrance sensitivity/allergy,
    # avoid explicitly fragranced products.
    fragrance_sensitive = (
        has_allergy("fragrance")
        or has_allergy("perfume")
        or has_allergy("parfum")
    )

    def allergy_safe_name(default_name: str, safe_name: str) -> str:
        """
        Returns an allergy-aware product name when
        fragrance sensitivity is reported.
        """
        if fragrance_sensitive:
            return safe_name
        return default_name
    # --------------------------------------------------
    # 4. MORNING ROUTINE
    # --------------------------------------------------

    morning_routine: List[Dict] = []

    # Category 1 — Cleansing
    if sensitive_skin or low_health_score:
        morning_cleanser = {
            "step": 1,
            "category": "Cleansing",
            "name": "Gentle Fragrance-Free Cleanser",
            "description": (
                "Use a gentle cleanser to help maintain "
                "skin comfort and barrier support."
            ),
            "benefit": "Gentle Cleansing"
        }
    else:
        morning_cleanser = {
            "step": 1,
            "category": "Cleansing",
            "name": "Gentle Cleanser",
            "description": (
                "Cleanse the skin without stripping its natural moisture."
            ),
            "benefit": "Daily Cleansing"
        }

    morning_routine.append(morning_cleanser)

    # Category 2 — Treatment
    if acne_prone or excess_sebum:
        treatment = {
            "step": 2,
            "category": "Treatment",
            "name": "Niacinamide Serum",
            "description": (
                "Helps support balanced-looking skin "
                "and reduce the appearance of excess oil."
            ),
            "benefit": "Oil Balance"
        }

    elif hyperpigmentation:
        treatment = {
            "step": 2,
            "category": "Treatment",
            "name": "Brightening Serum",
            "description": (
                "Helps improve the appearance of "
                "uneven skin tone and dark spots."
            ),
            "benefit": "Brightening"
        }

    elif dehydration or low_hydration:
        treatment = {
            "step": 2,
            "category": "Treatment",
            "name": "Hydrating Serum",
            "description": (
                "Provides hydration-focused care "
                "for dehydrated-looking skin."
            ),
            "benefit": "Hydration Support"
        }

    else:
        treatment = {
            "step": 2,
            "category": "Treatment",
            "name": "Antioxidant Serum",
            "description": (
                "Provides antioxidant support for "
                "the daily skincare routine."
            ),
            "benefit": "Antioxidant Support"
        }

    # If the user has sensitivity or a low health score,
    # prioritize gentler treatment.

    
    if (
        sensitive_skin
        or low_health_score
        or low_sleep
        or low_hydration
    ) and not acne_improved:
        treatment = {
            "step": 2,
            "category": "Treatment",
            "name": "Soothing Barrier Serum",
            "description": (
                "Provides gentle hydration and "
                "barrier-support focused care."
            ),
            "benefit": "Barrier Support"
        }

    if acne_improved and not acne_new:
        treatment = {
            "step": 2,
            "category": "Treatment",
            "name": "Balanced Maintenance Serum",
            "description": (
                "Provides gentle maintenance care after improvement "
                "in previously identified acne-prone concerns."
            ),
            "benefit": "Maintenance Care"
        }
    
    morning_routine.append(treatment)

    # Category 3 — Moisturizing
    if "oily" in skin_type:
        if dehydration or low_hydration:
            moisturizer = {
               "step": 3,
               "category": "Moisturizing",
                "name": "Lightweight Hydrating Gel Moisturizer",
                "description": (
                    "Provides lightweight hydration while supporting "
                    "the needs of oily, dehydrated-looking skin."
                ),
                "benefit": "Hydration + Oil Balance"
            }
        else:
            moisturizer = {
                "step": 3,
                "category": "Moisturizing",
                "name": "Lightweight Oil-Free Gel Moisturizer",
                "description": (
                    "Provides lightweight hydration "
                    "without a heavy finish."
                ),
                "benefit": "Lightweight Hydration"
            }

    elif "dry" in skin_type:
        moisturizer = {
            "step": 3,
            "category": "Moisturizing",
            "name": "Rich Barrier Moisturizer",
            "description": (
                "Provides richer hydration "
                "and supports the skin barrier."
            ),
            "benefit": "Barrier Support"
        }

    else:
        moisturizer = {
            "step": 3,
            "category": "Moisturizing",
            "name": "Balanced Daily Moisturizer",
            "description": (
                "Provides comfortable daily hydration."
            ),
            "benefit": "Daily Hydration"
        }

    morning_routine.append(moisturizer)

    # Category 4 — Sun Protection
    morning_routine.append({
        "step": 4,
        "category": "Sun Protection",
        "name": allergy_safe_name(
            "Broad Spectrum SPF 50+ Sunscreen",
            "Fragrance-Free Broad Spectrum SPF 50+ Sunscreen"
        ),
        "description": (
            "Helps protect skin from daily UV exposure."
        ),
        "benefit": "Essential UV Protection"
    })

    # --------------------------------------------------
    # 5. EVENING ROUTINE
    # --------------------------------------------------

    evening_routine: List[Dict] = []

    # Category 1 — Cleansing
    evening_routine.append({
        "step": 1,
        "category": "Cleansing",
        "name": (
            "Gentle Fragrance-Free Evening Cleanser"
            if sensitive_skin or fragrance_sensitive
            else "Gentle Evening Cleanser"
        ),
        "description": (
            "Remove accumulated oil, dirt "
            "and environmental impurities."
        ),
        "benefit": "Evening Cleansing"
    })

    # Category 2 — Exfoliation
    #
    # Sensitive skin and low health scores receive
    # a gentle recovery-focused step instead of
    # aggressive exfoliation.
    if not sensitive_skin and not low_health_score:

        if acne_prone or excess_sebum:
            exfoliation = {
                "step": 2,
                "category": "Exfoliation",
                "name": "Gentle BHA Exfoliation",
                "description": (
                    "A gentle exfoliating step focused "
                    "on excess oil and congestion."
                ),
                "benefit": "Pore & Oil Care"
            }

        elif hyperpigmentation:
            exfoliation = {
                "step": 2,
                "category": "Exfoliation",
                "name": "Gentle Exfoliating Treatment",
                "description": (
                    "Supports smoother-looking skin "
                    "and more even-looking tone."
                ),
                "benefit": "Skin Renewal"
            }

        else:
            exfoliation = {
                "step": 2,
                "category": "Exfoliation",
                "name": "Gentle Weekly Exfoliation",
                "description": (
                    "Provides occasional gentle exfoliation "
                    "as part of the skincare routine."
                ),
                "benefit": "Skin Renewal"
            }

        evening_routine.append(exfoliation)

    # Category 3 — Treatment
    if sensitive_skin or low_health_score:
        evening_treatment = {
            "step": 2 if sensitive_skin or low_health_score else 3,
            "category": "Treatment",
            "name": "Soothing Barrier Serum",
            "description": (
                "Provides gentle treatment focused "
                "on skin comfort and barrier support."
            ),
            "benefit": "Soothing Care"
        }

    elif hyperpigmentation:
        evening_treatment = {
            "step": 3,
            "category": "Treatment",
            "name": "Targeted Brightening Treatment",
            "description": (
                "Provides targeted care for "
                "uneven-looking skin tone."
            ),
            "benefit": "Tone Support"
        }

    elif acne_prone and not acne_improved:
        evening_treatment = {
            "step": 3,
            "category": "Treatment",
            "name": "Acne-Focused Treatment",
            "description": (
                "Provides targeted care for "
                "acne-prone-looking skin."
            ),
            "benefit": "Acne Care"
        }

    elif acne_improved:
        evening_treatment = {
            "step": 3,
            "category": "Treatment",
            "name": "Maintenance Treatment",
            "description": (
                "Provides gentle maintenance care after improvement "
                "in previously identified acne-prone concerns."
            ),
            "benefit": "Maintenance Care"
        }
    
    else:
        evening_treatment = {
            "step": 3,
            "category": "Treatment",
            "name": "Hydrating Treatment Serum",
            "description": (
                "Adds hydration-focused care "
                "to the evening routine."
            ),
            "benefit": "Hydration Support"
        }

    evening_routine.append(evening_treatment)

    # Category 4 — Moisturizing
    evening_routine.append({
        "step": len(evening_routine) + 1,
        "category": "Moisturizing",
        "name": allergy_safe_name(
            "Barrier Support Moisturizer",
            "Fragrance-Free Barrier Support Moisturizer"
        ),
        "description": (
            "Helps maintain overnight hydration "
            "and skin barrier support."
        ),
        "benefit": "Overnight Recovery"
    })

    # Category 5 — Night Care
    # Category 5 — Night Care
    if low_sleep or low_hydration:
        night_care_description = (
            "Prioritize overnight skin recovery and "
            "consistent hydration while supporting healthy lifestyle habits."
        )
        night_care_benefit = "Recovery & Hydration"
    else:
        night_care_description = (
            "Allow the skin to rest and recover overnight."
        )
        night_care_benefit = "Night Care"

    evening_routine.append({
        "step": len(evening_routine) + 1,
        "category": "Night Care",
        "name": "Overnight Skin Recovery",
        "description": night_care_description,
        "benefit": night_care_benefit
    })

    # --------------------------------------------------
    # 6. WEEKLY TREATMENT / EXFOLIATION PLAN
    # --------------------------------------------------

    if sensitive_skin or low_health_score:
        weekly_treatment = {
            "day": "Sunday",
            "category": "Night Care",
            "title": "Barrier Recovery Treatment",
            "description": (
                "Use a gentle recovery-focused treatment "
                "and prioritize skin comfort."
            )
        }

    elif acne_prone or excess_sebum:
        weekly_treatment = {
            "day": "Sunday",
            "category": "Exfoliation",
            "title": "Clarifying Treatment",
            "description": (
                "Use a gentle clarifying treatment "
                "focused on excess oil and congestion."
            )
        }

    elif dehydration or low_hydration:
        weekly_treatment = {
            "day": "Sunday",
            "category": "Treatment",
            "title": "Hydration Treatment",
            "description": (
                "Use a hydrating treatment to support "
                "comfortable, hydrated-looking skin."
            )
        }

    else:
        weekly_treatment = {
            "day": "Sunday",
            "category": "Exfoliation",
            "title": "Gentle Skin Renewal",
            "description": (
                "Use a gentle weekly exfoliation treatment "
                "as tolerated by the skin."
            )
        }

    # --------------------------------------------------
    # 7. SEASONAL RECOMMENDATIONS
    # --------------------------------------------------



    from datetime import datetime

    seasonal_guidance = {
        "summer": [
            "Prefer lightweight, non-comedogenic moisturizers.",
            "Use broad-spectrum sunscreen consistently.",
            "Reapply sunscreen during prolonged outdoor exposure."
        ],
        "monsoon": [
            "Keep the routine lightweight when humidity is high.",
            "Cleanse after heavy sweating or prolonged outdoor exposure.",
            "Choose non-comedogenic skincare products."
        ],
        "winter": [
            "Increase moisturization when the skin feels dry.",
            "Use gentle cleansers to avoid excessive dryness.",
            "Support the skin barrier with a suitable moisturizer."
        ],
        "spring": [
            "Maintain consistent sun protection.",
            "Introduce routine changes gradually.",
            "Monitor the skin for changes in sensitivity or hydration."
        ]
    }

# Determine the current season based on the month.
# India-focused seasonal mapping:
#
# March - May       → Summer
# June - September → Monsoon
# October           → Spring / transition
# November - February → Winter

    current_month = datetime.now().month

    if current_month in [3, 4, 5]:
        current_season = "summer"
        next_season = "monsoon"

    elif current_month in [6, 7, 8, 9]:
        current_season = "monsoon"
        next_season = "winter"

    elif current_month == 10:
        current_season = "spring"
        next_season = "winter"

    else:
        current_season = "winter"
        next_season = "summer"


    current_recommendations = seasonal_guidance[current_season]

# Add personalized seasonal guidance based on the
# user's current assessment.

    if "oily" in skin_type:
        current_recommendations = current_recommendations + [
            "Prefer lightweight products that do not leave a heavy finish."
        ]
 
    if "dry" in skin_type:
        current_recommendations = current_recommendations + [
            "Pay additional attention to hydration and barrier-supportive moisturization."
        ]

    if sensitive_skin:
        current_recommendations = current_recommendations + [
            "Prefer gentle, fragrance-free products and avoid unnecessary routine changes."
        ]

    if low_hydration:
        current_recommendations = current_recommendations + [
            "Prioritize hydration if the skin feels dry or dehydrated."
        ]

    seasonal_recommendations = {
        "current_season": current_season.capitalize(),
        "next_season": next_season.capitalize(),
        "recommendations": current_recommendations,
        "upcoming_season_note": (
            f"{next_season.capitalize()} is approaching. "
            "Gradually adjust the routine according to changes in "
            "hydration, sensitivity and skin comfort."
        )
    }

    # --------------------------------------------------
    # 8. PERSONALIZATION NOTES
    # --------------------------------------------------

    personalization_notes = []

    if "oily" in skin_type:
        personalization_notes.append(
            "Routine adjusted for oily skin."
        )

    if acne_prone:
        personalization_notes.append(
            "Routine prioritized acne-prone skin concerns."
        )

    if acne_improved:
        personalization_notes.append(
            "Previously identified acne-prone concerns improved, "
            "so acne-focused treatment was reduced."
        )

    if acne_new:
        personalization_notes.append(
            "A newly identified acne-prone concern was prioritized "
            "in the current routine."
        )
    
    if hyperpigmentation:
        personalization_notes.append(
            "Routine includes tone and pigmentation-focused care."
        )

    if sensitive_skin:
        personalization_notes.append(
            "Routine adjusted for sensitivity with gentler care."
        )

    if low_health_score:
        personalization_notes.append(
            "Lower health score triggered a barrier-support focused routine."
        )

    if low_sleep:
        personalization_notes.append(
            "Lower reported sleep duration was considered; the routine emphasizes gentle recovery and hydration."
        )
    elif moderate_sleep:
        personalization_notes.append(
            "Moderate reported sleep duration was considered when selecting recovery-focused care."
        )

    if low_hydration:
        personalization_notes.append(
            "Lower reported water intake was considered; the routine emphasizes hydration support."
        )
    elif moderate_hydration:
        personalization_notes.append(
            "Moderate reported water intake was considered when planning hydration support."
        )
    if allergies:
        personalization_notes.append(
            "Reported allergy information was considered when selecting routine options."
        )


    # --------------------------------------------------
# 9. PREVIOUS ASSESSMENT COMPARISON
# --------------------------------------------------

    progress_summary = []
    
    if previous_assessment is not None:

        previous_score = previous_assessment.health_score or 0
        current_score = health_score

        if current_score > previous_score:
            progress_summary.append(
                f"Health score improved from {previous_score} to {current_score}."
            )
        elif current_score < previous_score:
            progress_summary.append(
                f"Health score decreased from {previous_score} to {current_score}."
            )
        else:
            progress_summary.append(
                "Health score remained unchanged compared with the previous assessment."
            )

        previous_concerns = {
            str(concern).lower()
            for concern in (previous_assessment.concerns or [])
        }

        current_concerns = {
            str(concern).lower()
            for concern in (assessment.concerns or [])
        }

        resolved_concerns = previous_concerns - current_concerns
        new_concerns = current_concerns - previous_concerns

                # --------------------------------------------------
        # Adaptive routine flags
        # --------------------------------------------------

        acne_improved = (
            "acne prone" in resolved_concerns
            or any(
                "acne" in concern
                for concern in resolved_concerns
            )
        )

        acne_new = (
            "acne prone" in new_concerns
            or any(
                "acne" in concern
                for concern in new_concerns
            )
        )

        sebum_improved = (
            "excess sebum" in resolved_concerns
            or "oily skin" in resolved_concerns
        )

        sensitivity_improved = (
            "mild sensitivity" in resolved_concerns
            or any(
                "sensitivity" in concern
                for concern in resolved_concerns
            )
        )

        
        if resolved_concerns:
            progress_summary.append(
                "Previously identified concerns no longer present: "
                + ", ".join(sorted(resolved_concerns))
                + "."
            )

        if new_concerns:
            progress_summary.append(
                "Newly identified concerns: "
                + ", ".join(sorted(new_concerns))
                + "."
            )

        if not resolved_concerns and not new_concerns:
            progress_summary.append(
                "The identified skin concerns remained consistent with the previous assessment."
            )
    # --------------------------------------------------
    # 9. FINAL RESPONSE
    # --------------------------------------------------

    return {
        "assessment_id": assessment.id,
        "skin_type": assessment.predicted_skin_type,
        "health_score": assessment.health_score,
        "overall_condition": assessment.overall_condition,

        "main_concerns": assessment.concerns or [],
        "priority_order": assessment.priority_order or [],

        "personalization_notes": personalization_notes,
        "progress_summary": progress_summary,
        "adaptive_update": {
            "routine_updated": bool(resolved_concerns or new_concerns),
            "resolved_concerns": sorted(resolved_concerns)
                if previous_assessment is not None else [],
            "new_concerns": sorted(new_concerns)
                if previous_assessment is not None else []
        },
        "morning_routine": morning_routine,
        "evening_routine": evening_routine,

        "weekly_treatment_plan": weekly_treatment,

        "seasonal_recommendations": seasonal_recommendations
    }