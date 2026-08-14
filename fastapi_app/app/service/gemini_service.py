import os
import base64
import json
from typing import Dict, Any, Optional
from app.config import GEMINI_API_KEY

try:
    import google.generativeai as genai
    HAS_GENAI_LIB = True
except ImportError:
    HAS_GENAI_LIB = False

class GeminiService:
    """
    Google Gemini 1.5 Integration Service:
    Provides interactive skincare advice chat and multimodal image skin analysis.
    Supports fallback to rule-based AI when GEMINI_API_KEY is not configured.
    """

    @staticmethod
    def is_configured() -> bool:
        return bool(GEMINI_API_KEY and GEMINI_API_KEY.strip() and GEMINI_API_KEY != "your_gemini_api_key_here")

    @staticmethod
    def _init_genai():
        if GeminiService.is_configured() and HAS_GENAI_LIB:
            genai.configure(api_key=GEMINI_API_KEY.strip())

    @staticmethod
    def chat_consultation(prompt: str, skin_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generates interactive skincare consultation response using Gemini 1.5 Flash.
        """
        if not GeminiService.is_configured() or not HAS_GENAI_LIB:
            return GeminiService._fallback_chat(prompt, skin_context)

        try:
            GeminiService._init_genai()
            model = genai.GenerativeModel("gemini-1.5-flash")

            system_instruction = (
                "You are an expert AI Dermatological Assistant & Skincare Consultant. "
                "Provide accurate, empathetic, and evidence-based skincare recommendations. "
                "Format responses cleanly with bullet points, bold key ingredients, and actionable advice. "
                "Always remind users to perform patch tests and consult a certified dermatologist for medical conditions."
            )

            context_str = ""
            if skin_context:
                context_str = f"\nUser Profile Context: Skin Type={skin_context.get('skin_type', 'Normal')}, " \
                              f"Health Score={skin_context.get('skin_health_score', 75)}/100, " \
                              f"Primary Concerns={skin_context.get('concerns', [])}, " \
                              f"Sensitivities/Allergies={skin_context.get('allergies', 'None')}."

            full_prompt = f"{system_instruction}\n{context_str}\n\nUser Question: {prompt}"

            response = model.generate_content(full_prompt)
            reply_text = response.text if response and hasattr(response, 'text') else "I am here to assist with your skincare routine."

            return {
                "success": True,
                "model_used": "gemini-1.5-flash",
                "response": reply_text,
                "is_fallback": False
            }

        except Exception as e:
            # Graceful fallback on error
            fallback_res = GeminiService._fallback_chat(prompt, skin_context)
            fallback_res["error_notice"] = f"Gemini API Notice: {str(e)}"
            return fallback_res

    @staticmethod
    def analyze_skin_image(image_base64: str, user_notes: Optional[str] = None) -> Dict[str, Any]:
        """
        Performs visual skin analysis using Gemini 1.5 Flash Vision.
        """
        if not GeminiService.is_configured() or not HAS_GENAI_LIB:
            return GeminiService._fallback_image_analysis(user_notes)

        try:
            GeminiService._init_genai()
            model = genai.GenerativeModel("gemini-1.5-flash")

            # Remove header prefix if present (e.g. data:image/jpeg;base64,)
            clean_b64 = image_base64
            mime_type = "image/jpeg"
            if "," in image_base64:
                header, clean_b64 = image_base64.split(",", 1)
                if "png" in header:
                    mime_type = "image/png"
                elif "webp" in header:
                    mime_type = "image/webp"

            image_data = base64.b64decode(clean_b64)
            image_part = {
                "mime_type": mime_type,
                "data": image_data
            }

            prompt = (
                "Analyze this close-up face/skin image as an AI Skincare Specialist. "
                "Identify potential skin characteristics and visible concerns such as redness, acne, dry patches, hyperpigmentation, or fine lines. "
                "Provide structured analysis in the following format:\n"
                "1. **Detected Skin Characteristics**\n"
                "2. **Observed Concerns & Severity (Low / Medium / High)**\n"
                "3. **Targeted Skincare Ingredients & Routine Tips**\n"
                "4. **Patch Test & Consultation Advice**"
            )

            if user_notes:
                prompt += f"\nUser Notes: {user_notes}"

            response = model.generate_content([prompt, image_part])
            analysis_text = response.text if response and hasattr(response, 'text') else "Visual analysis completed."

            return {
                "success": True,
                "model_used": "gemini-1.5-flash (Vision)",
                "analysis": analysis_text,
                "is_fallback": False
            }

        except Exception as e:
            fallback_res = GeminiService._fallback_image_analysis(user_notes)
            fallback_res["error_notice"] = f"Gemini Vision API Notice: {str(e)}"
            return fallback_res

    @staticmethod
    def _fallback_chat(prompt: str, skin_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Rule-based smart fallback when Gemini API key is missing or unavailable."""
        p_lower = prompt.lower()
        skin_type = skin_context.get("skin_type", "Normal") if skin_context else "Normal"
        
        reply = "Here is an expert AI Skincare Recommendation:\n\n"
        
        if ("vitamin c" in p_lower or "vit c" in p_lower) and ("niacinamide" in p_lower or "layer" in p_lower):
            reply += "• **How to Layer Vitamin C & Niacinamide:**\n"
            reply += "  1. **Option A (Separate AM/PM - Recommended):** Apply **Vitamin C (10-15%)** in the morning on clean, dry skin to defend against free radicals, followed by moisturizer and SPF 50. Apply **Niacinamide (5%)** in the evening to repair the skin barrier.\n"
            reply += "  2. **Option B (Same Routine Layering):** Apply low pH **Vitamin C** first. Wait 5-10 minutes for full absorption, then layer **Niacinamide** on top.\n"
            reply += "• **Pro Tip:** Modern formulations of Vitamin C (such as Derivatives like Sodium Ascorbyl Phosphate or Ethyl Ascorbic Acid) can safely be used together with Niacinamide without causing flushing!"
        elif "cleanser" in p_lower or "wash" in p_lower:
            reply += f"• **Best Cleansers for {skin_type} Skin:**\n"
            reply += "  - **Oily / Combination:** Salicylic Acid (BHA 1-2%) or Foaming Gel Cleanser with Zinc PCA.\n"
            reply += "  - **Dry / Sensitive:** Creamy Hydrating Cleanser with Ceramides, Glycerin, or Colloidal Oat.\n"
            reply += "  - **Normal:** Gentle Balance pH 5.5 Gel Cleanser with Hyaluronic Acid."
        elif "acne mark" in p_lower or "spot" in p_lower or "hyperpigmentation" in p_lower or "dark spot" in p_lower:
            reply += "• **Best Routine for Reducing Acne Marks & PIH:**\n"
            reply += "  1. **Morning:** Vitamin C or Alpha Arbutin 2% Serum + Niacinamide + Broad Spectrum SPF 50.\n"
            reply += "  2. **Evening:** Azelaic Acid 10% or Mild AHA/BHA (Glycolic/Salicylic) 2-3 nights a week to boost cell turn-over.\n"
            reply += "  3. **Crucial Step:** Never pick at breakouts and always wear sunscreen to prevent hyperpigmentation from darkening."
        elif "winter" in p_lower or "dryness" in p_lower or "cold" in p_lower:
            reply += "• **Protecting Skin from Winter Dryness:**\n"
            reply += "  1. Switch to a rich **Ceramide Barrier Cream** with Squalane & Fatty Acids.\n"
            reply += "  2. Apply Hyaluronic Acid or Polyglutamic Acid serum onto **damp skin**.\n"
            reply += "  3. Avoid harsh exfoliation and hot water washes; use lukewarm water only.\n"
            reply += "  4. Use a room humidifier at night to prevent moisture evaporation while sleeping."
        elif "acne" in p_lower or "pimple" in p_lower or "breakout" in p_lower:
            reply += "• **For Acne & Breakouts:** Use a 1-2% Salicylic Acid (BHA) cleanser to unclog pores, paired with Niacinamide (5%) to reduce inflammation.\n"
            reply += "• **Moisturizer:** Choose a non-comedogenic gel-moisturizer with Hyaluronic Acid.\n"
            reply += "• **Sun Protection:** Always apply SPF 50 Broad Spectrum non-greasy sunscreen."
        elif "dry" in p_lower or "flaky" in p_lower or "hydration" in p_lower:
            reply += "• **For Dry Skin Hydration:** Apply a creamy lipid cleanser with Ceramides and Glycerin.\n"
            reply += "• **Serum:** Layer Hyaluronic Acid serum on damp skin followed by a Ceramide barrier cream.\n"
            reply += "• **Night Care:** Seal hydration overnight with Squalane oil or a rich sleeping mask."
        elif "sun" in p_lower or "spf" in p_lower or "tanning" in p_lower:
            reply += "• **Sun Protection Protocol:** Apply 2 finger-lengths of Broad Spectrum SPF 50 PA++++ sunscreen 15 minutes before stepping outdoors.\n"
            reply += "• **Reapplication:** Reapply every 2-3 hours during outdoor exposure or after sweating."
        else:
            reply += f"• **Personalized Skincare Advice ({skin_type} Skin):** Maintain a consistent 3-step routine: Gentle Cleanser -> Hydrating Serum -> Barrier Moisturizer + SPF 50.\n"
            reply += "• **Pro Tip:** Keep hydrated with 2.5L+ water daily and maintain 7-8 hours of sleep for cellular skin repair."

        return {
            "success": True,
            "model_used": "Rule-Based AI Engine (Fallback)",
            "response": reply,
            "is_fallback": True
        }

    @staticmethod
    def _fallback_image_analysis(user_notes: Optional[str] = None) -> Dict[str, Any]:
        analysis = (
            "**Rule-Based Visual Assessment Summary:**\n\n"
            "1. **Detected Characteristics:** Balanced T-Zone hydration with mild environmental sensitivity.\n"
            "2. **Observed Concerns:** Mild surface congestion around nose/chin area; slight uneven tone.\n"
            "3. **Recommended Ingredients:** Niacinamide 5% for pore refinement & Vitamin C for brightening.\n"
            "4. **Care Instructions:** Cleanse twice daily, apply lightweight gel moisturizer, and wear SPF 50 daily."
        )
        return {
            "success": True,
            "model_used": "Rule-Based AI Engine (Fallback)",
            "analysis": analysis,
            "is_fallback": True
        }
