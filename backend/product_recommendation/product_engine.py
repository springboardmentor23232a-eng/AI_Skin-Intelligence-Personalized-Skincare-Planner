import os
from dotenv import load_dotenv
load_dotenv("keys.env")
import json
import time
import random
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

# ==============================================================================
# GOOGLE GENAI SDK INITIALIZATION
# ==============================================================================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_PRIMARY_MODEL = os.getenv("GEMINI_PRIMARY_MODEL", "gemini-2.5-flash")
GEMINI_FALLBACK_MODEL = os.getenv("GEMINI_FALLBACK_MODEL", "gemini-3.5-flash-lite")

try:
    if GEMINI_API_KEY:
        client = genai.Client(api_key=GEMINI_API_KEY)
    else:
        client = genai.Client()
    print("🤖 Product Recommendation Engine: Gemini Client initialized successfully!")
except Exception as e:
    client = None
    print(f"⚠️ Product Recommendation Engine: Gemini Client failed to initialize ({e}).")

def generate_content_with_retry(
    client: genai.Client,
    contents: Any,
    config: Optional[types.GenerateContentConfig] = None,
    primary_model: str = GEMINI_PRIMARY_MODEL,
    fallback_model: str = GEMINI_FALLBACK_MODEL,
    max_retries: int = 3
):
    models = [primary_model, fallback_model, "gemini-3.7-flash"]
    last_err = None

    for model in models:
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(model=model, contents=contents, config=config)
                time.sleep(2)
                return response
            except Exception as e:
                last_err = e
                if "429" in str(e) or "quota" in str(e).lower():
                    time.sleep((2 ** attempt) + random.uniform(0.1, 0.5))
                else:
                    break
    raise RuntimeError(f"All models failed. Last error: {last_err}")

# --- PYDANTIC SCHEMAS ---

class ProductScoreBreakdown(BaseModel):
    ingredient_safety: int = Field(description="Score out of 40: Evaluates clinical safety, absence of irritants, and quality of actives.")
    concern_targeting: int = Field(description="Score out of 40: Evaluates how directly the formulation treats the user's primary concerns.")
    skin_type_compatibility: int = Field(description="Score out of 20: Evaluates formulation weight/texture synergy with user's skin type.")
    total_score: int = Field(description="The exact mathematical sum of the three scores above (max 100).")

class Product(BaseModel):
    brand: str
    product_name: str
    active_ingredients: str = Field(description="Key active ingredients")
    score_breakdown: ProductScoreBreakdown = Field(description="Strict clinical rubric score breakdown.")
    price_tier: str = Field(description="₹, ₹₹, or ₹₹₹")
    price_estimate: str = Field(description="Estimated price in Indian Rupees (INR) e.g., ₹450")
    rating: float = Field(default=4.6, description="Verified customer star rating out of 5.0 (e.g. 4.7)")
    review_count: int = Field(default=1240, description="Total verified customer review count (e.g. 1820)")
    target_concerns: List[str] = Field(description="List of specific skin concerns targeted by this product")
    reason_for_recommendation: str = Field(description="Why this fits the user's skin profile")
    allergy_safe: bool = Field(description="Is this safe based on declared allergies?")
    is_vegan: bool = Field(description="Is the product vegan?")
    is_cruelty_free: bool = Field(description="Is the product cruelty free?")
    alternative_suggestion: str = Field(description="A substitute product if this is unavailable")

class CategoryRecommendations(BaseModel):
    category: str = Field(description="Face Wash, Moisturizer, Sunscreen, Serum, Toner, Treatment Products, or Face Masks")
    recommendations: List[Product] = Field(description="At least 4 distinct products matching the user's budget. DO NOT include cheaper/budget alternatives if user selected higher budget.")

class ProductRecommendationOutput(BaseModel):
    overall_strategy: str = Field(description="Brief summary of the product strategy for this skin type")
    categories: List[CategoryRecommendations]

class ProductAnalysisItem(BaseModel):
    product_name: str
    analysis: str = Field(description="Pros and cons of this specific product for the user's skin type")

class ProductComparisonOutput(BaseModel):
    product_analyses: List[ProductAnalysisItem] = Field(description="Analysis for each product requested")
    winner: str = Field(description="The name of the ultimate winning product from the list")
    clinical_verdict: str = Field(description="Why the winner is better suited for the patient's specific concerns and allergies compared to the rest")

class DupeOutput(BaseModel):
    luxury_product_name: str = Field(description="The expensive product the user asked about")
    dupe_recommendation: Product = Field(description="The affordable Indian alternative")
    similarity_explanation: str = Field(description="Explain chemically why this is a good dupe (e.g., matching INCI actives)")

# --- MAIN ENGINE FUNCTIONS ---

def generate_product_recommendations(
    skin_type: str,
    concerns: List[str],
    allergies: List[str],
    sensitivities: List[str],
    budget_preference: str = "Mid-Range (₹500 - ₹1500)",
    preferences: List[str] = None,
    avoid_ingredients: str = ""
) -> Dict[str, Any]:
    
    if not client:
        return {"error": "AI Client offline."}

    alg_str = ", ".join(allergies) if allergies else "None"
    sens_str = ", ".join(sensitivities) if sensitivities else "None"
    concerns_str = ", ".join(concerns) if concerns else "General Care"
    prefs_str = ", ".join(preferences) if preferences else "Standard"
    avoid_str = avoid_ingredients if avoid_ingredients else "None"

    budget_clean = str(budget_preference).lower()
    if "under" in budget_clean or "friendly" in budget_clean:
        price_instruction = (
            "STRICT BUDGET REQUIREMENT: UNDER ₹500 INR PER PRODUCT. "
            "You MUST ONLY recommend products whose actual retail price in India is strictly between ₹100 and ₹499 INR. "
            "CRITICAL: If you suggest a product priced at ₹500 or above, it is a failure. Keep it UNDER ₹500."
        )
    elif "luxury" in budget_clean or "medical" in budget_clean or "above" in budget_clean:
        price_instruction = (
            "STRICT BUDGET REQUIREMENT: ABOVE ₹1500 INR PER PRODUCT. "
            "You MUST ONLY recommend high-end, premium, or medical-grade products whose retail price in India is above ₹1500 INR."
        )
    else:
        price_instruction = (
            "STRICT BUDGET REQUIREMENT: ₹500 TO ₹1500 INR PER PRODUCT. "
            "You MUST ONLY recommend mid-range products whose retail price in India is strictly between ₹500 and ₹1500 INR."
        )

    prompt = f"""
    Act as an expert cosmetic dermatologist and formulation chemist based in India.
    Generate a curated list of real-world, commercially available skincare products for a patient in the Indian market.

    Patient Profile:
    - Skin Type: {skin_type}
    - Primary Concerns: {concerns_str}
    - Declared Medical Allergies: {alg_str} (CRITICAL: DO NOT RECOMMEND)
    - User Dislikes / Ingredients to AVOID: {avoid_str} (CRITICAL: DO NOT RECOMMEND ANY PRODUCT CONTAINING THESE SPECIFIC INGREDIENTS)
    - Sensitivities: {sens_str}
    - Budget Preference: {budget_preference}
    - {price_instruction}
    - Ethical/Formulation Preferences: {prefs_str}

    Target Categories: Face Wash, Moisturizer, Sunscreen, Serum, Toner, Treatment Products, Face Masks.

    CLINICAL SCORING RUBRIC (CRITICAL INSTRUCTION):
    Do NOT guess a random suitability score. You must mathematically score each product using this breakdown:
    1. ingredient_safety (0 to 40): Rate the quality of the actives and absence of common irritants.
    2. concern_targeting (0 to 40): Rate how directly the ingredients treat {concerns_str}.
    3. skin_type_compatibility (0 to 20): Rate if the formulation texture (gel, cream, etc.) suits {skin_type} skin.
    Ensure total_score is the exact mathematical sum of these three values.

    For EACH category, provide AT LEAST 4 distinct recommendations aligning with the strict budget constraints.
    """

    try:
        response = generate_content_with_retry(
            client=client,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ProductRecommendationOutput,
                temperature=0.2,
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Engine Error: {e}")
        return {"error": str(e)}

def compare_multiple_products(
    product_names: List[str], 
    skin_type: str, 
    concerns: List[str], 
    allergies: List[str]
) -> Dict[str, Any]:
    
    if not client:
        return {"error": "AI Client offline."}

    alg_str = ", ".join(allergies) if allergies else "None"
    concerns_str = ", ".join(concerns) if concerns else "General Care"
    products_str = ", ".join(product_names)

    prompt = f"""
    Act as a cosmetic chemist and clinical dermatologist.
    The patient is choosing between the following specific skincare products:
    Products to compare: {products_str}

    Patient Profile:
    - Skin Type: {skin_type}
    - Concerns: {concerns_str}
    - Allergies/Sensitivities to AVOID: {alg_str}

    Provide an analysis of ALL products in the list based on their known INCI ingredients, declare ONE clear winner for this specific patient, and explain the clinical verdict.
    """

    try:
        response = generate_content_with_retry(
            client=client,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ProductComparisonOutput,
                temperature=0.2,
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Comparison Engine Error: {e}")
        return {"error": str(e)}

def find_product_dupe(
    luxury_product: str,
    skin_type: str,
    concerns: List[str],
    allergies: List[str]
) -> Dict[str, Any]:
    
    if not client:
        return {"error": "AI Client offline."}

    alg_str = ", ".join(allergies) if allergies else "None"
    
    prompt = f"""
    Act as a master formulation chemist. The patient wants a cheaper alternative (dupe) for the following high-end product:
    Luxury Product: {luxury_product}

    Patient Constraints:
    - Skin Type: {skin_type}
    - AVOID Ingredients: {alg_str}

    Find a commercially available, budget-friendly (Under ₹800 INR) alternative in the Indian drugstore market (e.g., Minimalist, Plum, Derma Co, Deconstruct) that has a highly similar active INCI list.
    Provide the dupe and explain chemically why it is a valid match.
    """

    try:
        response = generate_content_with_retry(
            client=client,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=DupeOutput,
                temperature=0.2,
            )
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Dupe Engine Error: {e}")
        return {"error": str(e)}