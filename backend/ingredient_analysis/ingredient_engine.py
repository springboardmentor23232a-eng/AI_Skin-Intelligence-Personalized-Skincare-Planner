import os
import json
import re
import time
import random
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

# ==============================================================================
# GOOGLE GENAI SDK INITIALIZATION (GOOGLE AI STUDIO MODE)
# ==============================================================================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_PRIMARY_MODEL = os.getenv("GEMINI_PRIMARY_MODEL", "gemini-2.5-flash")
GEMINI_FALLBACK_MODEL = os.getenv("GEMINI_FALLBACK_MODEL", "gemini-3.5-flash-lite")

try:
    if GEMINI_API_KEY:
        client = genai.Client(api_key=GEMINI_API_KEY)
    else:
        # Fallback to standard client initialization (auto-reads GEMINI_API_KEY from environment)
        client = genai.Client()
    print("🤖 Skincare Intelligence Engine: Google AI Studio Client initialized successfully!")
except Exception as e:
    client = None
    print(f"⚠️ Skincare Intelligence Engine: Google AI Studio Client failed to initialize ({e}).")

# --- RETRY & FALLBACK UTILITY FOR 429 RESOURCE_EXHAUSTED RATE LIMITS ---

def generate_content_with_retry_and_fallback(
    client: genai.Client,
    contents: Any,
    config: Optional[types.GenerateContentConfig] = None,
    primary_model: str = GEMINI_PRIMARY_MODEL,
    fallback_model: str = GEMINI_FALLBACK_MODEL,
    max_retries_per_model: int = 3,
    initial_delay: float = 2.0
):
    """
    Executes synchronous Gemini content generation with exponential backoff for 429 / RESOURCE_EXHAUSTED errors,
    falls back from primary model to fallback models when daily limits/quotas are reached, and enforces proactive delays.
    """
    models_to_try = [primary_model, fallback_model, "gemini-3.7-flash"]
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
                # Proactive delay to avoid hitting free-tier requests per minute (RPM) limits
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
                        print(f"⚠️ 429 Rate Limit hit on {current_model}. Retrying in {delay:.2f}s... (Attempt {attempt + 1}/{max_retries_per_model})")
                        time.sleep(delay)
                    else:
                        print(f"⚠️ Model {current_model} daily quota or rate limit exhausted. Switching to fallback model...")
                        time.sleep(4)
                        break
                else:
                    print(f"⚠️ Model {current_model} error: {e}. Switching to fallback model...")
                    break

    if last_exception:
        raise last_exception
    raise RuntimeError("All configured Gemini models failed due to rate limits or quota exhaustion.")

# --- PYDANTIC SCHEMAS FOR STRUCTURED OUTPUT ---

class FormulationAnalysis(BaseModel):
    barrier_compatibility: str = Field(description="High, Moderate, or Low")
    ph_dependency_note: str = Field(description="Brief note on pH level requirement or stability")
    estimated_active_concentration: str = Field(description="Low <1%, Moderate 1-5%, or High >5%")

class SuitabilityAssessment(BaseModel):
    verdict: str = Field(description="Highly Compatible, Moderate Risk, or Not Recommended")
    summary: str = Field(description="2 concise sentences explaining suitability for user skin profile")

class CategorizedIngredient(BaseModel):
    category: str = Field(
        description="Must be one of: Retinoids | Niacinamide | Vitamin C | Hyaluronic Acid | Salicylic Acid | Ceramides | Peptides | AHAs/BHAs | Other"
    )
    ingredient_name: str
    function: str = Field(description="Role/function of the ingredient in the formula")
    education_summary: str = Field(description="1-2 sentences plain-English explanation")
    blog_slug: str = Field(description="e.g., retinoids, niacinamide, vitamin-c, hyaluronic-acid, salicylic-acid, ceramides, peptides, ahas-bhas")

class IngredientInteraction(BaseModel):
    pair: str = Field(description="e.g., Salicylic Acid + Retinol")
    type: str = Field(description="CONFLICT | SYNERGY | CAUTION")
    severity: str = Field(description="HIGH | MODERATE | LOW")
    explanation: str = Field(description="Why they interact")
    guidance: str = Field(description="Actionable application advice")

class SkincareAnalysisOutput(BaseModel):
    formulation_analysis: FormulationAnalysis
    suitability_score: int = Field(description="Integer rating between 0 and 100")
    suitability_assessment: SuitabilityAssessment
    categorized_ingredients: List[CategorizedIngredient]
    ingredient_interactions: List[IngredientInteraction]


# --- DETERMINISTIC ALLERGY EVALUATOR ---

def evaluate_deterministic_allergies(raw_ingredients: str, user_allergies: List[str], user_sensitivities: List[str]) -> Dict[str, Any]:
    raw_tokens = [t.strip().lower() for t in re.split(r'[,;\n]', raw_ingredients) if t.strip()]
    alerts, penalty = [], 0

    for token in raw_tokens:
        clean_token = re.sub(r'[^a-zA-Z0-9\s\-]', '', token).strip()
        if not clean_token:
            continue

        for allergen in user_allergies:
            if allergen and allergen.lower() in clean_token:
                alerts.append({
                    "ingredient": clean_token.title(),
                    "type": "CRITICAL_ALLERGY",
                    "message": f"Matches your declared allergy: '{allergen.title()}'"
                })
                penalty += 45

        for sensitivity in user_sensitivities:
            if sensitivity and sensitivity.lower() in clean_token:
                alerts.append({
                    "ingredient": clean_token.title(),
                    "type": "SENSITIVITY_WARNING",
                    "message": f"Contains reactive trigger matching sensitivity profile: '{sensitivity.title()}'"
                })
                penalty += 15

    return {"alerts": alerts, "penalty": penalty}


# --- MAIN ANALYSIS ENGINE ---

def analyze_ingredient_intelligence(
    product_name: str,
    raw_ingredients: str,
    user_skin_type: str = "Sensitive",
    user_allergies: Optional[List[str]] = None,
    user_sensitivities: Optional[List[str]] = None
) -> Dict[str, Any]:
    user_allergies = user_allergies or []
    user_sensitivities = user_sensitivities or []

    allergy_res = evaluate_deterministic_allergies(raw_ingredients, user_allergies, user_sensitivities)

    if not client:
        # Fallback if Google AI Studio client failed initialization
        return {
            "product_name": product_name,
            "raw_ingredients": raw_ingredients,
            "suitability_score": max(0, 100 - allergy_res["penalty"]),
            "suitability_assessment": {
                "verdict": "Moderate Risk" if allergy_res["penalty"] > 0 else "Highly Compatible",
                "summary": "Google AI Studio client unavailable. Deterministic allergy check applied."
            },
            "formulation_analysis": {
                "barrier_compatibility": "Moderate",
                "ph_dependency_note": "Standard formulation check pending AI connection.",
                "estimated_active_concentration": "Moderate 1-5%"
            },
            "allergy_alerts": allergy_res["alerts"],
            "categorized_ingredients": [],
            "ingredient_interactions": []
        }

    # ENHANCED: Inject patient allergy context directly into AI model evaluation
    alg_str = ", ".join(user_allergies) if user_allergies else "None"
    sens_str = ", ".join(user_sensitivities) if user_sensitivities else "None"

    prompt = f"""
    You are a Skincare Intelligence AI specializing in cosmetic chemistry and formulation analysis.
    Analyze the provided product ingredients against the specific patient's profile.

    Product Name: {product_name}
    Raw Ingredients (INCI): {raw_ingredients}
    Patient Skin Type: {user_skin_type}
    Patient Declared Allergies: {alg_str}
    Patient Sensitivities: {sens_str}

    Task 1: Breakdown formulation attributes (estimate concentration tier, pH dependencies, barrier compatibility).
    Task 2: Classify all detected active compounds under standard categories (Retinoids, Niacinamide, Vitamin C, Hyaluronic Acid, Salicylic Acid, Ceramides, Peptides, AHAs/BHAs, Other).
    Task 3: Evaluate ingredient interactions and overall suitability for this specific skin type and allergy profile. Highlight any clinical red flags.
    """

    try:
        response = generate_content_with_retry_and_fallback(
            client=client,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=SkincareAnalysisOutput,
                temperature=0.2,
            ),
            primary_model=GEMINI_PRIMARY_MODEL,
            fallback_model=GEMINI_FALLBACK_MODEL
        )
        ai_data = json.loads(response.text)
    except Exception as e:
        print(f"⚠️ Google AI Studio generation error: {e}")
        ai_data = {}

    ai_score = ai_data.get("suitability_score", 100)
    final_score = max(0, min(100, ai_score - allergy_res["penalty"]))

    return {
        "product_name": product_name,
        "raw_ingredients": raw_ingredients,
        "suitability_score": final_score,
        "suitability_assessment": ai_data.get("suitability_assessment", {}),
        "formulation_analysis": ai_data.get("formulation_analysis", {}),
        "allergy_alerts": allergy_res["alerts"],
        "categorized_ingredients": ai_data.get("categorized_ingredients", []),
        "ingredient_interactions": ai_data.get("ingredient_interactions", [])
    }