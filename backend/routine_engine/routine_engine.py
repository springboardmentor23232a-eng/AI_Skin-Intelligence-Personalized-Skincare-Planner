import ssl

# Bypass Windows Certificate Store loading bug in aiohttp
try:
    _orig_load_certs = ssl.SSLContext.load_default_certs
    def _patched_load_certs(self, purpose=ssl.Purpose.SERVER_AUTH):
        try:
            _orig_load_certs(self, purpose)
        except Exception:
            pass
    ssl.SSLContext.load_default_certs = _patched_load_certs
except AttributeError:
    pass

import os
import logging
import time
import random
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

logger = logging.getLogger("uvicorn.error")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_PRIMARY_MODEL = os.getenv("GEMINI_PRIMARY_MODEL", os.getenv("GEMINI_MODEL", "gemini-3.6-flash"))
GEMINI_FALLBACK_MODEL = os.getenv("GEMINI_FALLBACK_MODEL", "gemini-3.5-flash-lite")

# ==========================================
# RETRY & FALLBACK UTILITY FOR RATE LIMITS
# ==========================================

def generate_content_with_retry_and_fallback(
    client: genai.Client,
    contents: Any,
    config: Optional[types.GenerateContentConfig] = None,
    primary_model: str = GEMINI_PRIMARY_MODEL,
    fallback_model: str = GEMINI_FALLBACK_MODEL,
    max_retries_per_model: int = 3,
    initial_delay: float = 2.0
):
    models_to_try = [primary_model, fallback_model, "gemini-3.1-pro-preview"]
    models_to_try = list(dict.fromkeys(models_to_try))
    last_exception = None

    for current_model in models_to_try:
        for attempt in range(max_retries_per_model + 1):
            try:
                response = client.models.generate_content(
                    model=current_model,
                    contents=contents,
                    config=config,
                )
                time.sleep(4)
                return response
            except Exception as e:
                last_exception = e
                err_msg = str(e).lower()
                is_rate_limit = "429" in err_msg or "resource_exhausted" in err_msg or "quota" in err_msg

                if is_rate_limit:
                    if attempt < max_retries_per_model:
                        jitter = random.uniform(0.1, 0.5)
                        delay = (initial_delay * (2 ** attempt)) + jitter
                        logger.warning(
                            f"⚠️ 429 Rate Limit hit on {current_model}. Retrying in {delay:.2f}s... (Attempt {attempt + 1}/{max_retries_per_model})"
                        )
                        time.sleep(delay)
                    else:
                        logger.warning(
                            f"⚠️ Model {current_model} daily quota or rate limit exhausted. Switching to fallback model..."
                        )
                        time.sleep(4)
                        break
                else:
                    logger.warning(f"⚠️ Model {current_model} error: {e}. Switching to fallback model...")
                    break

    if last_exception:
        raise last_exception
    raise RuntimeError("All configured Gemini models failed due to rate limits or quota exhaustion.")


# ==========================================
# 1. AFC TOOLS (AUTOMATIC FUNCTION CALLING)
# ==========================================

def check_active_ingredient_contraindications(active_ingredient: str, reported_allergies: str) -> bool:
    if not reported_allergies or not active_ingredient:
        return False
    active_lower = active_ingredient.lower().strip()
    allergy_lower = reported_allergies.lower().strip()
    return active_lower in allergy_lower or allergy_lower in active_lower

ROUTINE_TOOLS = [check_active_ingredient_contraindications]


# ==========================================
# 2. PYDANTIC SCHEMAS
# ==========================================

class UserFeedback(BaseModel):
    is_routine_effective: bool = Field(default=True, description="Whether the user finds the routine effective")
    allergies_experienced: Optional[str] = Field(default=None, description="Reported allergies or irritations")
    products_disliked: Optional[str] = Field(default=None, description="Products or ingredients to avoid")
    user_notes: Optional[str] = Field(default=None, description="General user notes or requests")

class RoutineStep(BaseModel):
    step_order: int = Field(description="Numerical step order, e.g., 1, 2, 3")
    category: str = Field(description="Must be one of: 🧼 Cleansing, ✨ Exfoliation, 💧 Treatment, 🧴 Moisturizing, ☀️ Sun Protection, 🌙 Night Care")
    product: str = Field(description="Recommended real-world commercial product or formula")
    active_ingredient: str = Field(description="Primary active ingredient")
    instructions: str = Field(description="Directions for application")
    adaptation_badge: Optional[str] = Field(default="AI Formulated", description="Badge tag e.g., 'Targeted Active', 'AI Swapped Alternative', 'Barrier Safe', 'AI Formulated'")
    recommendation_source: str = Field(
        default="AI Recommended", 
        description="Explicit attribution tag: 'AI Recommended' or 'Dermatologist Recommended' or 'Consultant Recommended'"
    )

class SwappedProductOutput(BaseModel):
    category: str = Field(description="Category of the swapped product")
    product: str = Field(description="Name of the real-world replacement product")
    active_ingredient: str = Field(description="Key active ingredients in the replacement product")
    instructions: str = Field(description="Updated usage instructions for the replacement")
    adaptation_badge: str = Field(default="AI Swapped Alternative", description="Badge indicator")
    recommendation_source: str = Field(default="AI Recommended", description="Attribution tag")
    reason_for_swap: str = Field(description="Clinical reason explaining why this alternative is suitable")

class WeeklyTreatment(BaseModel):
    day: str = Field(description="Target day, e.g., Wednesday, Sunday")
    category: str = Field(default="✨ Exfoliation", description="Care category")
    treatment_type: str = Field(description="Type of treatment")
    product: str = Field(default="Targeted Treatment Mask", description="Specific product or mask name")
    instructions: str = Field(description="Application directions")

class GeneratedRoutineResponse(BaseModel):
    adaptation_summary: str = Field(description="Summary of adaptation logic applied based on assessment findings")
    seasonal_recommendation: str = Field(description="Seasonal skincare advice")
    morning_routine: List[RoutineStep] = Field(description="Morning skincare steps")
    evening_routine: List[RoutineStep] = Field(description="Evening skincare steps")
    weekly_treatment_plan: List[WeeklyTreatment] = Field(description="Weekly treatment plan")


# ==========================================
# 3. ROUTINE GENERATOR ENGINE
# ==========================================

class GeminiRoutineEngine:
    def __init__(self):
        try:
            if GEMINI_API_KEY:
                self.client = genai.Client(api_key=GEMINI_API_KEY)
            else:
                self.client = genai.Client()
            logger.info("🤖 Gemini Routine Engine initialized successfully!")
        except Exception as e:
            self.client = None
            logger.warning(f"⚠️ Gemini Routine Engine: Client failed to initialize ({e}).")

    def _safe_parse_severity(self, raw_val: Any) -> float:
        if raw_val is None:
            return 1.0
        try:
            val_str = str(raw_val).strip()
            first_part = val_str.split('/')[0] if '/' in val_str else val_str
            return float(first_part)
        except (ValueError, TypeError):
            return 1.0

    def compute_assessment_deltas(
        self, 
        prev_concerns: List[Dict[str, Any]], 
        latest_concerns: List[Dict[str, Any]]
    ) -> List[str]:
        if not prev_concerns:
            if latest_concerns:
                summary = ["Current assessment concerns detected:"]
                for c in latest_concerns:
                    name = c.get('concern_name') or c.get('CONCERN_NAME') or 'Active Marker'
                    sev = self._safe_parse_severity(c.get('severity') or c.get('SEVERITY'))
                    summary.append(f"- {name}: Severity {sev:.1f}/5.0")
                return summary
            return ["Initial baseline assessment."]

        prev_map = {c.get('concern_name', ''): self._safe_parse_severity(c.get('severity')) for c in prev_concerns if c.get('concern_name')}
        latest_map = {c.get('concern_name', ''): self._safe_parse_severity(c.get('severity')) for c in latest_concerns if c.get('concern_name')}
        
        deltas = []
        for name, new_sev in latest_map.items():
            old_sev = prev_map.get(name, new_sev)
            diff = new_sev - old_sev
            if diff <= -1.0:
                deltas.append(f"SIGNIFICANT IMPROVEMENT: {name} reduced from {old_sev:.1f}/5.0 to {new_sev:.1f}/5.0. Maintain lower active intensity.")
            elif diff < 0:
                deltas.append(f"SLIGHT IMPROVEMENT: {name} improved from {old_sev:.1f}/5.0 to {new_sev:.1f}/5.0.")
            elif diff >= 1.0:
                deltas.append(f"ESCALATION ALERT: {name} worsened from {old_sev:.1f}/5.0 to {new_sev:.1f}/5.0. Prioritize anti-inflammatory intervention.")
            else:
                deltas.append(f"STABLE: {name} maintained at {new_sev:.1f}/5.0.")
        return deltas

    def _generate_fallback_routine(
        self, 
        profile: Dict[str, Any], 
        dominant_concern: str, 
        season: str, 
        source_label: str = "AI Recommended",
        latest_concerns: Optional[List[Dict[str, Any]]] = None
    ) -> GeneratedRoutineResponse:
        """DYNAMIC CONCERN-SPECIFIC PROTOCOL FALLBACK"""
        skin_type_lower = str(profile.get('skin_type', 'Combination')).lower()
        all_concerns_str = " ".join([c.get('concern_name', '') for c in (latest_concerns or [])]).lower() + " " + dominant_concern.lower()

        # Step 1: Cleanser Selection
        if "oily" in skin_type_lower or "acne" in all_concerns_str:
            am_cleanser = RoutineStep(step_order=1, category="🧼 Cleansing", product="CeraVe Renewing SA Cleanser", active_ingredient="Salicylic Acid, Ceramides", instructions="Massage gently onto wet skin for 60 seconds to unclog pores.", adaptation_badge="Pore Clearing", recommendation_source=source_label)
            pm_cleanser = RoutineStep(step_order=1, category="🧼 Cleansing", product="La Roche-Posay Effaclar Purifying Foaming Gel", active_ingredient="Zinc PCA", instructions="Wash thoroughly to eliminate excess sebum.", adaptation_badge="Oil Control", recommendation_source=source_label)
        elif "dry" in skin_type_lower or "sensitive" in skin_type_lower:
            am_cleanser = RoutineStep(step_order=1, category="🧼 Cleansing", product="La Roche-Posay Toleriane Hydrating Gentle Cleanser", active_ingredient="Ceramide-3, Niacinamide, Glycerin", instructions="Wash with lukewarm water to protect moisture barrier.", adaptation_badge="Barrier Safe", recommendation_source=source_label)
            pm_cleanser = RoutineStep(step_order=1, category="🧼 Cleansing", product="Aveeno Calm + Restore Nourishing Oat Cleanser", active_ingredient="Feverfew, Oat Extract", instructions="Gently cleanse without stripping essential lipids.", adaptation_badge="Calming", recommendation_source=source_label)
        else:
            am_cleanser = RoutineStep(step_order=1, category="🧼 Cleansing", product="CeraVe Hydrating Facial Cleanser", active_ingredient="Hyaluronic Acid, Ceramides", instructions="Massage onto damp face and rinse clean.", adaptation_badge="AI Formulated", recommendation_source=source_label)
            pm_cleanser = RoutineStep(step_order=1, category="🧼 Cleansing", product="Vanicream Gentle Facial Cleanser", active_ingredient="Glycerin, Purified Water", instructions="Cleanse face thoroughly to remove daily pollutants.", adaptation_badge="AI Formulated", recommendation_source=source_label)

        morning_routine = [am_cleanser]
        evening_routine = [pm_cleanser]

        # Step 2: Targeted Treatments
        if "redness" in all_concerns_str or "rosacea" in all_concerns_str:
            morning_routine.append(RoutineStep(step_order=2, category="💧 Treatment", product="The Ordinary Azelaic Acid Suspension 10%", active_ingredient="Azelaic Acid 10%", instructions="Apply across flushed areas to reduce redness.", adaptation_badge="Anti-Redness", recommendation_source=source_label))
            evening_routine.append(RoutineStep(step_order=2, category="💧 Treatment", product="Paula's Choice 10% Niacinamide Booster", active_ingredient="Niacinamide 10%", instructions="Smooth 2-3 drops over face to strengthen barrier.", adaptation_badge="Barrier Support", recommendation_source=source_label))
        elif "hyperpigmentation" in all_concerns_str or "dark spot" in all_concerns_str:
            morning_routine.append(RoutineStep(step_order=2, category="💧 Treatment", product="Timeless 20% Vitamin C + E Ferulic Acid Serum", active_ingredient="L-Ascorbic Acid 20%, Ferulic Acid", instructions="Apply 3-4 drops under SPF to inhibit melanogenesis.", adaptation_badge="Pigment Correction", recommendation_source=source_label))
            evening_routine.append(RoutineStep(step_order=2, category="💧 Treatment", product="The Inkey List Tranexamic Acid Night Treatment", active_ingredient="Tranexamic Acid 2%, Acai Berry 2%", instructions="Apply overnight layer onto dark spots.", adaptation_badge="Brightening", recommendation_source=source_label))
        elif "wrinkle" in all_concerns_str or "fine line" in all_concerns_str:
            morning_routine.append(RoutineStep(step_order=2, category="💧 Treatment", product="The Ordinary Matrixyl 10% + HA", active_ingredient="Matrixyl 3000, Hyaluronic Acid", instructions="Pat gently onto forehead, crow's feet, and smile lines.", adaptation_badge="Collagen Support", recommendation_source=source_label))
            evening_routine.append(RoutineStep(step_order=2, category="💧 Treatment", product="Medik8 Bakuchiol Peptides Serum", active_ingredient="Bakuchiol 1.25%, Peptide Complex", instructions="Smooth over entire face for gentle cell turnover.", adaptation_badge="Firming", recommendation_source=source_label))
        elif "acne" in all_concerns_str or "pore" in all_concerns_str:
            morning_routine.append(RoutineStep(step_order=2, category="💧 Treatment", product="Paula's Choice 2% BHA Liquid Exfoliant", active_ingredient="Salicylic Acid 2%", instructions="Apply to congested areas (T-zone) avoiding eye area.", adaptation_badge="Exfoliation", recommendation_source=source_label))
            evening_routine.append(RoutineStep(step_order=2, category="💧 Treatment", product="Differin Adapalene Gel 0.1%", active_ingredient="Adapalene 0.1%", instructions="Apply a pea-sized amount across face on dry skin.", adaptation_badge="Cell Turnover", recommendation_source=source_label))
        else:
            morning_routine.append(RoutineStep(step_order=2, category="💧 Treatment", product="Vichy Minéral 89 Hyaluronic Acid Booster", active_ingredient="Hyaluronic Acid, Volcanic Water", instructions="Apply 2 drops to damp skin for hydration.", adaptation_badge="Hydration", recommendation_source=source_label))
            evening_routine.append(RoutineStep(step_order=2, category="💧 Treatment", product="Cocokind Ceramide Barrier Serum", active_ingredient="5 Essential Ceramides", instructions="Massage gently to reinforce the lipid barrier.", adaptation_badge="Repair", recommendation_source=source_label))

        # Step 3: Moisturizing Formulation
        if "dry" in skin_type_lower:
            morning_routine.append(RoutineStep(step_order=3, category="🧴 Moisturizing", product="CeraVe Moisturizing Cream", active_ingredient="Ceramides, Hyaluronic Acid", instructions="Smooth a dime-sized amount over face and neck.", adaptation_badge="Deep Hydration", recommendation_source=source_label))
            evening_routine.append(RoutineStep(step_order=3, category="🌙 Night Care", product="La Roche-Posay Cicaplast Baume B5+", active_ingredient="Panthenol 5%, Madecassoside", instructions="Apply as final step to lock in moisture and soothe skin.", adaptation_badge="Lipid Recovery", recommendation_source=source_label))
        else:
            morning_routine.append(RoutineStep(step_order=3, category="🧴 Moisturizing", product="Neutrogena Hydro Boost Water Gel", active_ingredient="Hyaluronic Acid", instructions="Apply evenly over cleansed face.", adaptation_badge="Lightweight Hydration", recommendation_source=source_label))
            evening_routine.append(RoutineStep(step_order=3, category="🌙 Night Care", product="CeraVe PM Facial Moisturizing Lotion", active_ingredient="Niacinamide, Ceramides", instructions="Apply 1-2 pumps over face and neck.", adaptation_badge="Night Repair", recommendation_source=source_label))

        # Step 4: SPF Photoprotection
        morning_routine.append(RoutineStep(
            step_order=4, 
            category="☀️ Sun Protection", 
            product="EltaMD UV Clear Broad-Spectrum SPF 46", 
            active_ingredient="Zinc Oxide 9.0%, Octinoxate 7.5%, Niacinamide", 
            instructions="Apply generously 15 minutes before UV exposure. Reapply every 2 hours if outdoors.", 
            adaptation_badge="Photoprotection", 
            recommendation_source=source_label
        ))

        weekly_plan = [
            WeeklyTreatment(
                day="Sunday",
                category="✨ Exfoliation",
                treatment_type="Targeted Recovery Care",
                product="I'm From Mugwort Soothing Mask",
                instructions="Apply generous layer on clean skin. Leave on for 15 minutes and rinse with cool water."
            )
        ]

        return GeneratedRoutineResponse(
            adaptation_summary=f"AI protocol adapted for {profile.get('skin_type', 'Combination')} skin addressing current assessment markers ({dominant_concern}).",
            seasonal_recommendation=f"During {season}, prioritize balancing targeted active treatments with barrier photoprotection.",
            morning_routine=morning_routine,
            evening_routine=evening_routine,
            weekly_treatment_plan=weekly_plan
        )

    def generate_routine(
        self, 
        profile: Dict[str, Any], 
        dominant_concern: str = "Acne", 
        season: str = "Summer",
        prev_concerns: Optional[List[Dict[str, Any]]] = None,
        latest_concerns: Optional[List[Dict[str, Any]]] = None,
        feedback: Optional[UserFeedback] = None,
        clinician_type: str = "AI",
        consultant_notes: Optional[str] = None
    ) -> GeneratedRoutineResponse:
        
        # Explicitly label AI Generated output
        source_label = "AI Recommended" if clinician_type.upper() in ["AI", "SYSTEM", "DEFAULT"] else f"{clinician_type} Recommended"

        if not self.client:
            return self._generate_fallback_routine(profile, dominant_concern, season, source_label, latest_concerns)

        deltas = self.compute_assessment_deltas(prev_concerns or [], latest_concerns or [])

        concerns_breakdown = []
        if latest_concerns:
            for c in latest_concerns:
                name = c.get('concern_name') or c.get('CONCERN_NAME') or 'Concern'
                sev = c.get('severity') or c.get('SEVERITY') or 'Moderate'
                concerns_breakdown.append(f"- {name} (Severity: {sev})")
        else:
            concerns_breakdown.append(f"- {dominant_concern}")

        concerns_text = "\n".join(concerns_breakdown)

        feedback_prompt = "None reported."
        if feedback:
            f_items = []
            if feedback.allergies_experienced:
                f_items.append(f"STRICT ALLERGY BAN: User reported: '{feedback.allergies_experienced}'. Execute 'check_active_ingredient_contraindications' to verify actives.")
            if feedback.products_disliked:
                f_items.append(f"DISLIKED PRODUCTS: Avoid '{feedback.products_disliked}'.")
            if feedback.user_notes:
                f_items.append(f"USER FEEDBACK NOTES: '{feedback.user_notes}'. Adjust formulas or textures accordingly.")
            if f_items:
                feedback_prompt = "\n".join(f_items)

        prompt = f"""
        You are an expert cosmetic skincare formulator.
        Translate clinical assessment metrics into an explicit, step-by-step over-the-counter skincare routine.
        Do not prescribe medication or provide medical diagnoses.

        PATIENT CLINICAL & ASSESSMENT PROFILE:
        - Primary Skin Type: {profile.get('skin_type', 'Combination')}
        - Overall Skin Health Score: {profile.get('score', 75)}/100
        - Sensitive Skin Flag: {profile.get('is_sensitive', False)}
        - Sensitivities: {profile.get('sensitivities', 'None')}
        - Allergies: {profile.get('allergies', 'None')}
        - Water Intake: {profile.get('water_intake', 2.0)} L/day
        - Sleep Quality: {profile.get('sleep_quality', 'Good')}
        - Living Environment: {profile.get('environment', 'Urban')}
        - Current Season: {season}

        ALL ACTIVE CONCERNS DETECTED IN THIS ASSESSMENT:
        {concerns_text}

        ASSESSMENT COMPARISON DELTAS:
        {chr(10).join(deltas)}

        SAFETY & USER PREFERENCES:
        {feedback_prompt}

        RECOMMENDATION CONSTRAINTS:
        1. Formulate distinct, targeted products addressing all active concerns listed above.
        2. If Hyperpigmentation / Dark Spots are active, include Vitamin C, Tranexamic Acid, or Alpha Arbutin.
        3. If Redness / Sensitive Skin is active, include Azelaic Acid, Centella Asiatica, or Niacinamide (exclude strong AHAs).
        4. If Acne / Pores are active, include Salicylic Acid (BHA) or Adapalene.
        5. If Dryness is active, include Ceramides, Peptides, and Hyaluronic Acid.
        6. Always recommend real-world over-the-counter brands (e.g., La Roche-Posay, Paula's Choice, CeraVe, The Ordinary).
        7. Set `recommendation_source` on every step to "{source_label}".
        8. Set `adaptation_badge` on each step to a relevant contextual tag (e.g. 'Targeted Active', 'Barrier Safe', 'AI Formulated').
        """

        try:
            response = generate_content_with_retry_and_fallback(
                client=self.client,
                contents=prompt,
                config=types.GenerateContentConfig(
                    tools=ROUTINE_TOOLS,
                    automatic_function_calling=types.AutomaticFunctionCallingConfig(
                        disable=False,
                        maximum_remote_calls=5,
                    ),
                    response_mime_type="application/json",
                    response_schema=GeneratedRoutineResponse,
                    temperature=0.7,
                ),
                primary_model=GEMINI_PRIMARY_MODEL,
                fallback_model=GEMINI_FALLBACK_MODEL
            )
            
            if not response or (not getattr(response, "text", None) and not getattr(response, "parsed", None)):
                logger.warning("Empty response received. Falling back to dynamic concern-aware algorithm.")
                return self._generate_fallback_routine(profile, dominant_concern, season, source_label, latest_concerns)

            if hasattr(response, "parsed") and response.parsed:
                if isinstance(response.parsed, GeneratedRoutineResponse):
                    return response.parsed
                elif isinstance(response.parsed, dict):
                    return GeneratedRoutineResponse.model_validate(response.parsed)
            return GeneratedRoutineResponse.model_validate_json(response.text)
        except Exception as e:
            logger.error(f"Gemini API Error: {str(e)}")
            return self._generate_fallback_routine(profile, dominant_concern, season, source_label, latest_concerns)

    def swap_product_ai(
        self,
        current_product: str,
        current_active: str,
        category: str,
        swap_reason: str,
        skin_type: str = "Combination",
        allergies: Optional[str] = None
    ) -> SwappedProductOutput:
        """Invokes Gemini AI to formulate an exact real-world alternative product."""
        if not self.client:
            raise RuntimeError("Gemini Client is required for AI Product Swapping.")

        prompt = f"""
        Act as an expert cosmetic skincare formulator.
        The user has requested to swap out a specific product from their routine.

        CURRENT PRODUCT TO REPLACE:
        - Product Name: {current_product}
        - Current Active: {current_active}
        - Category: {category}

        USER CLINICAL PROFILE & SWAP REASON:
        - User Skin Type: {skin_type}
        - User Known Allergies/Sensitivities: {allergies or 'None'}
        - Reason for swap request: {swap_reason or 'Looking for an alternative over-the-counter option.'}

        FORMULATION INSTRUCTIONS:
        1. Formulate a real-world, commercial over-the-counter alternative product (e.g., from La Roche-Posay, Paula's Choice, CeraVe, The Ordinary, K-Beauty brands).
        2. Ensure the replacement matches the category ({category}) and is safe for the user's skin type and allergies.
        3. Explain clearly why this replacement works in `reason_for_swap`.
        4. Set `adaptation_badge` to 'AI Swapped Alternative' and `recommendation_source` to 'AI Recommended'.
        5. Do NOT recommend prescription drugs.
        """

        response = generate_content_with_retry_and_fallback(
            client=self.client,
            contents=prompt,
            config=types.GenerateContentConfig(
                tools=ROUTINE_TOOLS,
                automatic_function_calling=types.AutomaticFunctionCallingConfig(
                    disable=False,
                    maximum_remote_calls=5,
                ),
                response_mime_type="application/json",
                response_schema=SwappedProductOutput,
                temperature=0.8,
            ),
            primary_model=GEMINI_PRIMARY_MODEL,
            fallback_model=GEMINI_FALLBACK_MODEL
        )

        if not response or (not getattr(response, "text", None) and not getattr(response, "parsed", None)):
            raise RuntimeError("Gemini did not return a valid swap response.")

        if hasattr(response, "parsed") and response.parsed:
            if isinstance(response.parsed, SwappedProductOutput):
                return response.parsed
            elif isinstance(response.parsed, dict):
                return SwappedProductOutput.model_validate(response.parsed)
        return SwappedProductOutput.model_validate_json(response.text)

routine_engine = GeminiRoutineEngine()
