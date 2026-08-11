from typing import List, Dict
from app.schemas.routine import RoutineGenerateInput, RoutineStepSchema

class RoutineEngine:
    """
    Rule-Based Skincare Routine Generation Engine:
    Generates Morning, Evening, Weekly, and Seasonal skincare routines tailored
    to skin type, primary concerns, target season, and age group.
    
    Morning Flow: Morning -> Cleanser -> Treatment -> Moisturizer -> Sunscreen
    Evening Flow: Evening -> Cleanser -> Treatment -> Moisturizer -> Night Care
    Weekly Flow: Multi-day Exfoliation, Clay/Sheet Masking, and Intensive Treatment
    Seasonal Flow: Climate-adjusted barrier repair and photoprotection guidance
    """

    @staticmethod
    def generate(input_data: RoutineGenerateInput, user_id: int) -> List[RoutineStepSchema]:
        skin_type = (input_data.skin_type or "Normal").title()
        concern = (input_data.primary_concern or "General Maintenance").title()
        season = (input_data.season or "Summer").title()

        steps: List[RoutineStepSchema] = []

        # ====================================================
        # 1. MORNING ROUTINE (Morning -> Cleanser -> Treatment -> Moisturizer -> Sunscreen)
        # ====================================================
        
        # Step 1: Cleanser
        if skin_type in ["Oily", "Combination"]:
            m_cleanser_name = "Purifying Gel Cleanser with Salicylic Acid"
            m_cleanser_inst = "Foam gently over damp skin for 60 seconds with lukewarm water to clear overnight sebum."
            m_cleanser_ing = "Salicylic Acid & Zinc PCA"
        elif skin_type in ["Dry", "Sensitive"]:
            m_cleanser_name = "Gentle Hydrating Cream Cleanser"
            m_cleanser_inst = "Massage gently into damp face without scrubbing, rinse thoroughly to maintain lipid barrier."
            m_cleanser_ing = "Ceramides & Colloidal Oatmeal"
        else:
            m_cleanser_name = "Balanced Gentle Daily Cleanser"
            m_cleanser_inst = "Cleanse damp face in soft circular motions to refresh morning skin."
            m_cleanser_ing = "Green Tea & Glycerin"

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

        # Step 2: Treatment
        if "Acne" in concern or skin_type == "Oily":
            m_treat_name = "Niacinamide 10% & Zinc Pore Clarifying Serum"
            m_treat_inst = "Apply 3-4 drops evenly over face to regulate oil production and soothe inflammation."
            m_treat_ing = "Niacinamide (Vitamin B3) & Zinc"
        elif "Pigmentation" in concern or "Dark" in concern:
            m_treat_name = "Vitamin C 15% Antioxidant Radiance Serum"
            m_treat_inst = "Pat 3-5 drops onto cleansed skin to neutralize free radicals and fade dark spots."
            m_treat_ing = "L-Ascorbic Acid & Ferulic Acid"
        elif "Dry" in concern or skin_type == "Dry":
            m_treat_name = "Triple-Weight Hyaluronic Acid Plumping Serum"
            m_treat_inst = "Apply to slightly damp skin to lock in deep epidermal hydration."
            m_treat_ing = "Hyaluronic Acid & Sodium Hyaluronate"
        else:
            m_treat_name = "Multivitamin Defense & Hydration Serum"
            m_treat_inst = "Smooth 3 drops across face for daily environmental protection."
            m_treat_ing = "Vitamin B5 & Vitamin E"

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

        # Step 3: Moisturizer
        if skin_type == "Oily":
            m_moist_name = "Ultra-Lightweight Oil-Free Gel Moisturizer"
            m_moist_inst = "Smooth a nickel-sized amount over face; absorbs instantly without shine."
            m_moist_ing = "Centella Asiatica & Aloe Vera"
        elif skin_type in ["Dry", "Sensitive"]:
            m_moist_name = "Barrier Repair Cream with Essential Ceramides"
            m_moist_inst = "Apply generously over face and neck to fortify moisture barrier against environmental stressors."
            m_moist_ing = "Ceramides AP/NP & Squalane"
        else:
            m_moist_name = "Daily Hydrating Lotion with Peptides"
            m_moist_inst = "Apply evenly across face for smooth, balanced moisture retention."
            m_moist_ing = "Peptides & Glycerin"

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

        # Step 4: Sunscreen
        steps.append(RoutineStepSchema(
            user_id=user_id,
            time_of_day="MORNING",
            step_number=4,
            category="SUN_PROTECTION",
            step_name="Broad-Spectrum Mineral Sunscreen SPF 50+ PA++++",
            instructions="Apply two finger-lengths generously as final morning step 15 minutes before sun exposure.",
            recommended_ingredient="Zinc Oxide 12% & Titanium Dioxide",
            season="ALL_SEASONS",
            created_by_role="SYSTEM_AI"
        ))

        # ====================================================
        # 2. EVENING ROUTINE (Evening -> Cleanser -> Treatment -> Moisturizer -> Night Care)
        # ====================================================

        # Step 1: Cleanser
        steps.append(RoutineStepSchema(
            user_id=user_id,
            time_of_day="EVENING",
            step_number=1,
            category="CLEANSER",
            step_name="Double Cleansing Protocol (Micellar Oil + Foam Cleanser)",
            instructions="First melt away SPF, makeup, and urban micro-pollutants with oil cleanser, then wash with gentle foam.",
            recommended_ingredient="Jojoba Oil & Micellar Actives",
            season="ALL_SEASONS",
            created_by_role="SYSTEM_AI"
        ))

        # Step 2: Treatment
        if "Acne" in concern or skin_type == "Oily":
            e_treat_name = "Salicylic Acid 2% Exfoliating Solution"
            e_treat_inst = "Apply thin layer to target acne-prone zones 3 nights a week to unclog pores."
            e_treat_ing = "Salicylic Acid (BHA) & Tea Tree Extract"
        elif "Wrinkles" in concern or input_data.age_group in ["35-44", "45+"]:
            e_treat_name = "Advanced Granactive Retinoid 2% Renewal Serum"
            e_treat_inst = "Apply pea-sized amount to clean dry skin at night to stimulate collagen synthesis and cell turnover."
            e_treat_ing = "Retinol / Granactive Retinoid"
        elif "Pigmentation" in concern:
            e_treat_name = "Alpha Arbutin 2% & Kojic Acid Night Serum"
            e_treat_inst = "Apply to areas with stubborn spots to suppress melanin synthesis overnight."
            e_treat_ing = "Alpha Arbutin & Kojic Acid"
        else:
            e_treat_name = "Copper Peptide Cellular Repair Concentrate"
            e_treat_inst = "Massage 3 drops into skin to support nocturnal cellular repair."
            e_treat_ing = "Copper Tripeptide-1 & Hyaluronic Acid"

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

        # Step 3: Moisturizer
        steps.append(RoutineStepSchema(
            user_id=user_id,
            time_of_day="EVENING",
            step_number=3,
            category="MOISTURIZER",
            step_name="Intensive Overnight Moisture Barrier Recovery Cream",
            instructions="Massage generous layer into face and neck for deep overnight dermal replenishment.",
            recommended_ingredient="Ceramides, Cholesterol & Fatty Acids",
            season="ALL_SEASONS",
            created_by_role="SYSTEM_AI"
        ))

        # Step 4: Night Care
        steps.append(RoutineStepSchema(
            user_id=user_id,
            time_of_day="EVENING",
            step_number=4,
            category="NIGHT_CARE",
            step_name="Sleeping Mask & Dermal Lipid Shield",
            instructions="Apply final occlusive layer to seal in moisture and prevent transepidermal water loss while sleeping.",
            recommended_ingredient="Plant Squalane & Cica Complex",
            season="ALL_SEASONS",
            created_by_role="SYSTEM_AI"
        ))

        # ====================================================
        # 3. WEEKLY TREATMENT PLAN (Multi-Day Exfoliation & Masking)
        # ====================================================

        steps.append(RoutineStepSchema(
            user_id=user_id,
            time_of_day="WEEKLY",
            step_number=1,
            category="EXFOLIATION",
            step_name="Mid-Week Chemical Exfoliation (Wednesday Night)",
            instructions="Apply AHA/BHA liquid exfoliant once weekly after cleansing. Leave for 10 minutes then moisturize. Do not use retinoid on same night.",
            recommended_ingredient="Glycolic Acid 7% & Lactic Acid",
            season="ALL_SEASONS",
            created_by_role="SYSTEM_AI"
        ))

        steps.append(RoutineStepSchema(
            user_id=user_id,
            time_of_day="WEEKLY",
            step_number=2,
            category="MASK",
            step_name="Weekend Detox & Hydration Masking (Sunday)",
            instructions="Apply Kaolin Clay Mask to T-zone for 10 mins, followed by a Hydrating Bio-Cellulose Sheet Mask for 15 mins.",
            recommended_ingredient="French Green Clay & Hyaluronic Acid",
            season="ALL_SEASONS",
            created_by_role="SYSTEM_AI"
        ))

        steps.append(RoutineStepSchema(
            user_id=user_id,
            time_of_day="WEEKLY",
            step_number=3,
            category="TREATMENT",
            step_name="Weekly Lipid Barrier Repair Therapy (Friday Night)",
            instructions="Apply 3 drops of pure squalane oil over moisturizer to repair micro-cracks in skin barrier.",
            recommended_ingredient="100% Plant-Derived Squalane",
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
                step_name="Summer Sebum & Sweat Control Fluid",
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
                step_name="Summer Photoprotection & Reapplication Mist",
                instructions="Reapply SPF spray mist every 2 hours when outdoors to prevent UV pigmentation in summer sun.",
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
                step_name="Winter Deep Lipid Repair Balm",
                instructions="Apply rich ceramide balm before cold wind exposure to prevent dryness, redness, and flaking.",
                recommended_ingredient="Shea Butter & Ceramides AP/EOP",
                season="WINTER",
                created_by_role="SYSTEM_AI"
            ))
            steps.append(RoutineStepSchema(
                user_id=user_id,
                time_of_day="SEASONAL",
                step_number=2,
                category="MOISTURIZER",
                step_name="Winter Humidifier & Hydration Lock",
                instructions="Use indoor room humidifier at night and layer hyaluronic acid with occlusive creams.",
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
                step_name="Spring Dullness Renewal Essence",
                instructions="Incorporate mild PHA exfoliation to slough off dead winter skin cells and restore natural radiance.",
                recommended_ingredient="Gluconolactone (PHA) & Birch Juice",
                season="SPRING",
                created_by_role="SYSTEM_AI"
            ))
            steps.append(RoutineStepSchema(
                user_id=user_id,
                time_of_day="SEASONAL",
                step_number=2,
                category="TREATMENT",
                step_name="Spring Antihistamine & Soothing Complex",
                instructions="Soothe spring pollen sensitivity with Centella Asiatica (Cica) soothing gel.",
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
                step_name="Autumn Post-Summer UV Repair Serum",
                instructions="Use Vitamin C and Tranexamic Acid in autumn to fade solar spots accumulated over summer.",
                recommended_ingredient="Tranexamic Acid 3% & Vitamin C",
                season="AUTUMN",
                created_by_role="SYSTEM_AI"
            ))
            steps.append(RoutineStepSchema(
                user_id=user_id,
                time_of_day="SEASONAL",
                step_number=2,
                category="MOISTURIZER",
                step_name="Autumn Transition Moisture Cream",
                instructions="Gradually transition to medium-weight moisturizer as ambient humidity drops.",
                recommended_ingredient="Squalane & Hyaluronic Acid",
                season="AUTUMN",
                created_by_role="SYSTEM_AI"
            ))

        return steps
