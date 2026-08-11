from typing import List, Dict, Any
from app.schemas.routine import RoutineGenerateInput, RoutineStepSchema

class RoutineEngine:
    """
    Personalized Skincare Routine Engine (Item 2 & Item 3 Compliant):
    
    Generates personalized daily, weekly, and seasonal skincare protocols based on:
    1. Skin Type (Oily, Dry, Combination, Sensitive, Normal)
    2. Skin Concerns (Acne, Hyperpigmentation, Wrinkles, Redness, Dryness)
    3. Skin Health Score (0-100 from assessment)
    4. Allergies & Sensitivities (Fragrance, Retinoids, BHA, Sulfates, Nut Oils)
    5. Lifestyle (High Sun Exposure, High Stress, Late Night Sleep, Urban Pollution, Indoor AC)
    6. Previous Assessment Results (Historic score, condition, and risk factors)

    Supported Routine Categories:
    - 🧼 CLEANSER (Cleansing)
    - ✨ EXFOLIATION (Exfoliation)
    - 💧 TREATMENT (Treatment)
    - 🧴 MOISTURIZER (Moisturizing)
    - ☀️ SUN_PROTECTION (Sun Protection)
    - 🌙 NIGHT_CARE (Night Care)
    """

    @staticmethod
    def generate(input_data: RoutineGenerateInput, user_id: int) -> List[RoutineStepSchema]:
        skin_type = (input_data.skin_type or "Normal").title()
        concern = (input_data.primary_concern or "General Maintenance").title()
        season = (input_data.season or "Summer").title()
        score = input_data.skin_health_score if input_data.skin_health_score is not None else 75
        allergies = (input_data.allergies or input_data.sensitivities or "None").lower()
        lifestyle = (input_data.lifestyle or "Normal").lower()
        prev_results = input_data.previous_assessment_results or {}

        # Extract risk factors and condition from previous assessment results if available
        prev_condition = prev_results.get("overall_condition", "")
        prev_concerns = prev_results.get("concerns", [])

        steps: List[RoutineStepSchema] = []

        # ====================================================
        # 1. MORNING ROUTINE (Morning -> Cleanser -> Treatment -> Moisturizer -> Sun Protection)
        # ====================================================

        # Step 1: 🧼 Cleansing (CLEANSER)
        if "sulfate" in allergies or "sensitive" in allergies or skin_type == "Sensitive":
            m_cleanser_name = "Gentle Amino Acid Fragrance-Free Cleanser"
            m_cleanser_inst = "Foam softly with lukewarm water; 100% sulfate-free & hypoallergenic for reactive skin."
            m_cleanser_ing = "Colloidal Oatmeal & Sodium Cocoyl Glycinate"
        elif skin_type in ["Oily", "Combination"] or "acne" in concern.lower():
            m_cleanser_name = "Purifying Gel Cleanser with Salicylic & Zinc PCA"
            m_cleanser_inst = "Foam gently over damp skin for 60 seconds to clear overnight sebum and prevent clogged pores."
            m_cleanser_ing = "Salicylic Acid 1% & Zinc PCA"
        elif skin_type == "Dry":
            m_cleanser_name = "Creamy Lipid Hydrating Cleanser"
            m_cleanser_inst = "Massage softly onto damp face without harsh scrubbing to preserve moisture barrier."
            m_cleanser_ing = "Ceramides & Glycerin"
        else:
            m_cleanser_name = "Balanced Daily Green Tea Cleanser"
            m_cleanser_inst = "Cleanse damp face in soft circular motions to refresh morning skin."
            m_cleanser_ing = "Green Tea Polyphenols & Panthenol"

        steps.append(RoutineStepSchema(
            user_id=user_id,
            time_of_day="MORNING",
            step_number=1,
            category="CLEANSER",
            step_name=m_cleanser_name,
            instructions=m_cleanser_inst,
            recommended_ingredient=m_cleanser_ing,
            season="ALL_SEASONS",
            created_by_role="SYSTEM_AI"
        ))

        # Step 2: 💧 Treatment (TREATMENT)
        if "pollution" in lifestyle or "sun" in lifestyle or "hyperpigmentation" in concern.lower():
            m_treat_name = "Vitamin C 15% & Ferulic Acid Antioxidant Shield"
            m_treat_inst = "Pat 3-4 drops evenly onto cleansed skin to neutralize urban pollution & free radicals."
            m_treat_ing = "L-Ascorbic Acid 15%, Vitamin E & Ferulic Acid"
        elif "acne" in concern.lower() or skin_type == "Oily":
            m_treat_name = "Niacinamide 10% & Zinc Pore Clarifying Concentrate"
            m_treat_inst = "Apply 3-4 drops to balance sebum secretion, shrink enlarged pores, and calm redness."
            m_treat_ing = "Niacinamide (Vitamin B3) & Zinc PCA"
        elif "redness" in concern.lower() or skin_type == "Sensitive":
            m_treat_name = "Azelaic Acid 10% & Centella Redness Calming Serum"
            m_treat_inst = "Smooth 2-3 drops over sensitive areas to reduce facial erythema and blotchiness."
            m_treat_ing = "Azelaic Acid 10% & Madecassoside (Cica)"
        else:
            m_treat_name = "Triple-Weight Hyaluronic Acid & Hydration Serum"
            m_treat_inst = "Apply 3 drops onto damp skin for multi-layer epidermal hydration."
            m_treat_ing = "Hyaluronic Acid & Vitamin B5"

        steps.append(RoutineStepSchema(
            user_id=user_id,
            time_of_day="MORNING",
            step_number=2,
            category="TREATMENT",
            step_name=m_treat_name,
            instructions=m_treat_inst,
            recommended_ingredient=m_treat_ing,
            season="ALL_SEASONS",
            created_by_role="SYSTEM_AI"
        ))

        # Step 3: 🧴 Moisturizing (MOISTURIZER)
        if score < 60 or "damaged" in prev_condition.lower():
            m_moist_name = "Intensive Barrier Repair & Lipid Moisture Cream"
            m_moist_inst = "Apply generously to restore compromised skin barrier (Health Score: " + str(score) + "/100)."
            m_moist_ing = "Ceramides AP/NP/EOP & Phytosphingosine"
        elif skin_type == "Oily":
            m_moist_name = "Ultra-Lightweight Oil-Free Hydrating Gel"
            m_moist_inst = "Smooth nickel-sized amount over face; absorbs instantly without greasy residue."
            m_moist_ing = "Aloe Vera & Centella Asiatica Gel"
        elif skin_type in ["Dry", "Sensitive"]:
            m_moist_name = "Rich Ceramide & Squalane Moisture Cream"
            m_moist_inst = "Apply smoothly over face and neck to shield skin against dry air and moisture loss."
            m_moist_ing = "100% Plant Squalane & Ceramides"
        else:
            m_moist_name = "Peptide-Rich Daily Hydrating Fluid"
            m_moist_inst = "Apply evenly across face for smooth, supple moisture balance."
            m_moist_ing = "Peptides & Sodium Hyaluronate"

        steps.append(RoutineStepSchema(
            user_id=user_id,
            time_of_day="MORNING",
            step_number=3,
            category="MOISTURIZER",
            step_name=m_moist_name,
            instructions=m_moist_inst,
            recommended_ingredient=m_moist_ing,
            season="ALL_SEASONS",
            created_by_role="SYSTEM_AI"
        ))

        # Step 4: ☀️ Sun Protection (SUN_PROTECTION)
        if "sun" in lifestyle:
            m_sun_name = "Broad-Spectrum Mineral Sunscreen SPF 50+ PA++++ (High Sun Exposure)"
            m_sun_inst = "Apply two full finger-lengths 15 mins before stepping outdoors; reapply every 2 hours."
            m_sun_ing = "Zinc Oxide 15% & Titanium Dioxide"
        else:
            m_sun_name = "Invisible Hydrating Daily Sunscreen SPF 50+ PA++++"
            m_sun_inst = "Apply generously as final morning step to protect against UVA/UVB & HEV blue light."
            m_sun_ing = "Non-Comedogenic UV Shield & Vitamin E"

        steps.append(RoutineStepSchema(
            user_id=user_id,
            time_of_day="MORNING",
            step_number=4,
            category="SUN_PROTECTION",
            step_name=m_sun_name,
            instructions=m_sun_inst,
            recommended_ingredient=m_sun_ing,
            season="ALL_SEASONS",
            created_by_role="SYSTEM_AI"
        ))

        # ====================================================
        # 2. EVENING ROUTINE (Cleanser -> Exfoliation/Treatment -> Moisturizer -> Night Care)
        # ====================================================

        # Step 1: 🧼 Cleansing (CLEANSER - Double Cleansing)
        steps.append(RoutineStepSchema(
            user_id=user_id,
            time_of_day="EVENING",
            step_number=1,
            category="CLEANSER",
            step_name="Double Cleansing Protocol (Oil Cleanser + Purifying Wash)",
            instructions="First dissolve SPF, makeup & pollution with cleansing oil, then wash with gentle water-based gel.",
            recommended_ingredient="Jojoba Seed Oil & Chamomile Extract",
            season="ALL_SEASONS",
            created_by_role="SYSTEM_AI"
        ))

        # Step 2: 💧 Treatment (TREATMENT - Tailored to Retinoid Sensitivity)
        if "retinoid" in allergies or "retinol" in allergies or skin_type == "Sensitive":
            e_treat_name = "Bakuchiol 1% Natural Botanical Anti-Aging Serum"
            e_treat_inst = "Gentle plant alternative to Retinol for sensitive skin; stimulates collagen without irritation."
            e_treat_ing = "100% Natural Bakuchiol & Rosehip Oil"
        elif "acne" in concern.lower():
            e_treat_name = "Blemish Control Salicylic Acid 2% Night Solution"
            e_treat_inst = "Apply thin layer to acne zones to penetrate oily pores and reduce inflammation overnight."
            e_treat_ing = "Salicylic Acid (BHA) & Tea Tree Leaf Oil"
        elif "wrinkle" in concern.lower() or "aging" in concern.lower() or input_data.age_group in ["35-44", "45+"]:
            e_treat_name = "Encapsulated Retinol 0.5% & Peptide Cell Renewal Serum"
            e_treat_inst = "Apply pea-sized amount to dry skin at night to accelerate cellular turnover and smooth fine lines."
            e_treat_ing = "Pure Micro-Encapsulated Retinol & Matrixyl 3000"
        else:
            e_treat_name = "Niacinamide & Peptide Night Renewal Complex"
            e_treat_inst = "Massage 3 drops into skin to repair cellular structures while sleeping."
            e_treat_ing = "Niacinamide 5% & Copper Tripeptides"

        steps.append(RoutineStepSchema(
            user_id=user_id,
            time_of_day="EVENING",
            step_number=2,
            category="TREATMENT",
            step_name=e_treat_name,
            instructions=e_treat_inst,
            recommended_ingredient=e_treat_ing,
            season="ALL_SEASONS",
            created_by_role="SYSTEM_AI"
        ))

        # Step 3: 🧴 Moisturizing (MOISTURIZER)
        steps.append(RoutineStepSchema(
            user_id=user_id,
            time_of_day="EVENING",
            step_number=3,
            category="MOISTURIZER",
            step_name="Overnight Barrier Replenishment Moisture Cream",
            instructions="Massage generous layer into face and neck for nocturnal epidermal hydration.",
            recommended_ingredient="Ceramides, Cholesterol & Fatty Acids",
            season="ALL_SEASONS",
            created_by_role="SYSTEM_AI"
        ))

        # Step 4: 🌙 Night Care (NIGHT_CARE)
        if "stress" in lifestyle or "sleep" in lifestyle:
            e_night_name = "Nocturnal Stress-Recovery Sleeping Mask & Caffeine Eye Complex"
            e_night_inst = "Apply occlusive sleeping mask & dab caffeine serum under eyes to counter dark circles and fatigue."
            e_night_ing = "Caffeine 5%, EGCG & Centella Asiatica Mask"
        else:
            e_night_name = "Lipid Seal Occlusive Sleeping Balm (Night Care)",
            e_night_inst = "Apply thin final layer to lock in active serums and prevent transepidermal water loss overnight."
            e_night_ing = "Plant-Derived Squalane & Cica Lipid Shield"

        steps.append(RoutineStepSchema(
            user_id=user_id,
            time_of_day="EVENING",
            step_number=4,
            category="NIGHT_CARE",
            step_name=e_night_name if isinstance(e_night_name, str) else e_night_name[0],
            instructions=e_night_inst,
            recommended_ingredient=e_night_ing,
            season="ALL_SEASONS",
            created_by_role="SYSTEM_AI"
        ))

        # ====================================================
        # 3. WEEKLY TREATMENT PLAN (Exfoliation & Masking)
        # ====================================================

        # Step 1: ✨ Exfoliation (EXFOLIATION)
        if "bha" in allergies or "salicylic" in allergies or skin_type == "Sensitive":
            w_exf_name = "Gentle Polyhydroxy Acid (PHA) Micro-Exfoliant (Wednesday)"
            w_exf_inst = "Apply gentle PHA exfoliant once weekly. Large molecular size ensures non-irritating surface smoothing."
            w_exf_ing = "Gluconolactone (PHA) 5% & Lactobionic Acid"
        else:
            w_exf_name = "AHA 7% + BHA 2% Liquid Resurfacing Peel (Wednesday)"
            w_exf_inst = "Apply once weekly after cleansing. Leave for 10 minutes then moisturize; unclogs pores and dissolves dead skin cells."
            w_exf_ing = "Glycolic Acid 7% & Salicylic Acid 2%"

        steps.append(RoutineStepSchema(
            user_id=user_id,
            time_of_day="WEEKLY",
            step_number=1,
            category="EXFOLIATION",
            step_name=w_exf_name,
            instructions=w_exf_inst,
            recommended_ingredient=w_exf_ing,
            season="ALL_SEASONS",
            created_by_role="SYSTEM_AI"
        ))

        # Step 2: 💧 Treatment / Masking (TREATMENT / MASK)
        steps.append(RoutineStepSchema(
            user_id=user_id,
            time_of_day="WEEKLY",
            step_number=2,
            category="TREATMENT",
            step_name="Weekend Detox Clay & Hydrating Sheet Mask (Sunday)",
            instructions="Apply Kaolin Clay to oily T-zone for 10 mins, followed by a Bio-Cellulose Hyaluronic Sheet Mask for 15 mins.",
            recommended_ingredient="French Kaolin Clay & Bio-Cellulose HA",
            season="ALL_SEASONS",
            created_by_role="SYSTEM_AI"
        ))

        # Step 3: 🧴 Moisturizing Lipid Repair
        steps.append(RoutineStepSchema(
            user_id=user_id,
            time_of_day="WEEKLY",
            step_number=3,
            category="MOISTURIZER",
            step_name="Weekly Deep Lipid Barrier Repair Therapy (Friday)",
            instructions="Pat 3 drops of pure squalane oil over moisturizer to repair micro-cracks in skin barrier.",
            recommended_ingredient="100% Plant-Derived Squalane Oil",
            season="ALL_SEASONS",
            created_by_role="SYSTEM_AI"
        ))

        # ====================================================
        # 4. SEASONAL SKINCARE RECOMMENDATIONS
        # ====================================================

        if season == "Summer":
            steps.append(RoutineStepSchema(
                user_id=user_id,
                time_of_day="SEASONAL",
                step_number=1,
                category="SEASONAL_CARE",
                step_name="Summer Sebum & Sweat Control Gel Fluid",
                instructions="Switch heavy creams to ultra-light gel-creams during humid summer months to prevent pore clogging.",
                recommended_ingredient="Green Tea & Niacinamide",
                season="SUMMER",
                created_by_role="SYSTEM_AI"
            ))
            steps.append(RoutineStepSchema(
                user_id=user_id,
                time_of_day="SEASONAL",
                step_number=2,
                category="SUN_PROTECTION",
                step_name="Summer Photoprotection & SPF Reapplication Mist",
                instructions="Reapply SPF spray mist every 2 hours when outdoors under summer sun to prevent UV spot formation.",
                recommended_ingredient="Broad Spectrum UV Filters & Vitamin C",
                season="SUMMER",
                created_by_role="SYSTEM_AI"
            ))
        elif season == "Winter":
            steps.append(RoutineStepSchema(
                user_id=user_id,
                time_of_day="SEASONAL",
                step_number=1,
                category="SEASONAL_CARE",
                step_name="Winter Cold-Wind Lipid Barrier Shield Balm",
                instructions="Apply rich ceramide balm before cold wind exposure to prevent severe chapping, redness, and flaking.",
                recommended_ingredient="Shea Butter & Ceramides AP/EOP",
                season="WINTER",
                created_by_role="SYSTEM_AI"
            ))
            steps.append(RoutineStepSchema(
                user_id=user_id,
                time_of_day="SEASONAL",
                step_number=2,
                category="MOISTURIZER",
                step_name="Winter Indoor AC & Heater Moisture Lock",
                instructions="Use indoor room humidifier at night and layer hyaluronic acid with rich occlusive butter.",
                recommended_ingredient="Glycerin & Sodium Hyaluronate",
                season="WINTER",
                created_by_role="SYSTEM_AI"
            ))
        elif season == "Spring":
            steps.append(RoutineStepSchema(
                user_id=user_id,
                time_of_day="SEASONAL",
                step_number=1,
                category="SEASONAL_CARE",
                step_name="Spring Radiance & Cell Renewal Essence",
                instructions="Incorporate mild PHA exfoliation to slough off dull winter skin cells and restore natural radiance.",
                recommended_ingredient="Gluconolactone (PHA) & Birch Juice",
                season="SPRING",
                created_by_role="SYSTEM_AI"
            ))
            steps.append(RoutineStepSchema(
                user_id=user_id,
                time_of_day="SEASONAL",
                step_number=2,
                category="TREATMENT",
                step_name="Spring Allergy & Pollen Soothing Gel",
                instructions="Soothe spring pollen sensitivity and facial itchiness with Centella Asiatica gel.",
                recommended_ingredient="Centella Asiatica & Madecassoside",
                season="SPRING",
                created_by_role="SYSTEM_AI"
            ))
        else: # Autumn
            steps.append(RoutineStepSchema(
                user_id=user_id,
                time_of_day="SEASONAL",
                step_number=1,
                category="SEASONAL_CARE",
                step_name="Autumn Post-Summer UV Spot Fading Concentrate",
                instructions="Use Tranexamic Acid and Vitamin C in autumn to fade solar spots accumulated over summer months.",
                recommended_ingredient="Tranexamic Acid 3% & Vitamin C",
                season="AUTUMN",
                created_by_role="SYSTEM_AI"
            ))
            steps.append(RoutineStepSchema(
                user_id=user_id,
                time_of_day="SEASONAL",
                step_number=2,
                category="MOISTURIZER",
                step_name="Autumn Humidity Drop Moisture Lotion",
                instructions="Transition to medium-weight moisturizer as ambient air humidity decreases.",
                recommended_ingredient="Squalane & Hyaluronic Acid",
                season="AUTUMN",
                created_by_role="SYSTEM_AI"
            ))

        return steps
