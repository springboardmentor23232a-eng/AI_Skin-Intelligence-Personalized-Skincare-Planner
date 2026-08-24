import os
import json
import asyncio
import random
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import APIRouter, HTTPException, status, Query, Body
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from ingredient_engine import analyze_ingredient_intelligence

from google import genai
from google.genai import types

# ==============================================================================
# DATABASE CONNECTION FOR INGREDIENT ROUTER
# ==============================================================================
def get_db_conn():
    return psycopg2.connect(
        dbname=os.getenv("DB_NAME", "derma_ai"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "mango"),
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=os.getenv("DB_PORT", "5432"),
        cursor_factory=RealDictCursor
    )

# ==============================================================================
# GOOGLE GENAI SDK INITIALIZATION (GOOGLE AI STUDIO MODE)
# ==============================================================================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_PRIMARY_MODEL = os.getenv("GEMINI_PRIMARY_MODEL", "gemini-2.5-flash")
GEMINI_FALLBACK_MODEL = os.getenv("GEMINI_FALLBACK_MODEL", "gemini-3.5-flash-lite")

try:
    if GEMINI_API_KEY:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    else:
        # Fallback to standard client initialization (auto-reads GEMINI_API_KEY from environment)
        gemini_client = genai.Client()
    print("🤖 Ingredient Router: Google AI Studio Client initialized successfully!")
except Exception as e:
    gemini_client = None
    print(f"⚠️ Ingredient Router: Google AI Studio Client failed to initialize ({e}).")

router = APIRouter(tags=["Ingredient Intelligence"])


# --- RETRY & FALLBACK UTILITY FOR 429 RESOURCE_EXHAUSTED RATE LIMITS ---

async def generate_content_with_retry_and_fallback(
    client: genai.Client,
    contents: Any,
    config: Optional[types.GenerateContentConfig] = None,
    primary_model: str = GEMINI_PRIMARY_MODEL,
    fallback_model: str = GEMINI_FALLBACK_MODEL,
    max_retries_per_model: int = 3,
    initial_delay: float = 2.0
):
    """
    Executes asynchronous Gemini content generation with exponential backoff for 429 / RESOURCE_EXHAUSTED errors,
    falls back between supported Flash models when daily quota limits are reached, and enforces proactive delays.
    """
    models_to_try = [primary_model, fallback_model, "gemini-3.7-flash"]
    models_to_try = list(dict.fromkeys(models_to_try))
    last_exception = None

    for current_model in models_to_try:
        for attempt in range(max_retries_per_model + 1):
            try:
                response = await client.aio.models.generate_content(
                    model=current_model,
                    contents=contents,
                    config=config,
                )
                # Proactive delay to avoid hitting free-tier requests per minute (RPM) limits
                await asyncio.sleep(4)
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
                        await asyncio.sleep(delay)
                    else:
                        print(f"⚠️ Primary model {current_model} daily quota or rate limit exhausted. Switching to fallback model...")
                        await asyncio.sleep(4)
                        break
                else:
                    print(f"⚠️ Model {current_model} error: {e}. Switching to fallback model...")
                    break

    if last_exception:
        raise last_exception
    raise RuntimeError("All configured Gemini models failed due to rate limits or quota exhaustion.")


# --- PYDANTIC SCHEMAS ---

class IntelligencePayload(BaseModel):
    product_name: str = Field(default="")
    raw_ingredients: str = Field(default="")
    user_skin_type: Optional[str] = Field("Sensitive")
    user_allergies: Optional[List[str]] = Field(default_factory=list)
    user_sensitivities: Optional[List[str]] = Field(default_factory=list)
    user_email: Optional[str] = Field(default=None)


class QuickCheckPayload(BaseModel):
    ingredient_name: str = Field(...)
    user_skin_type: Optional[str] = Field("Sensitive")


class QuickCheckOutput(BaseModel):
    ingredient_name: str
    safety_rating: str = Field(description="Safe, Caution, or Avoid")
    primary_benefit: str = Field(description="Primary clinical benefit")
    potential_risks: List[str] = Field(description="Potential side effects or risks")


# --- ENDPOINTS ---

@router.post("/api/v1/ingredients/analyze-recommendation", status_code=status.HTTP_200_OK)
@router.get("/api/v1/ingredients/analyze-recommendation", status_code=status.HTTP_200_OK)
@router.post("/api/ingredients/analyze-recommendation", status_code=status.HTTP_200_OK)
@router.get("/api/ingredients/analyze-recommendation", status_code=status.HTTP_200_OK)
async def analyze_recommendation(
    product: Optional[str] = Query(None),
    active: Optional[str] = Query(None),
    product_name: Optional[str] = Query(None),
    raw_ingredients: Optional[str] = Query(None),
    user_skin_type: Optional[str] = Query(None),
    user_email: Optional[str] = Query(None),
    payload: Optional[IntelligencePayload] = Body(None)
) -> Dict[str, Any]:
    try:
        p_name = (
            (payload.product_name if payload else None) 
            or product_name 
            or product
        )
        
        r_ingredients = (
            (payload.raw_ingredients if payload else None) 
            or raw_ingredients 
            or active
        )

        if not p_name or not r_ingredients:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Both product name and ingredients/actives must be provided."
            )

        s_type = (payload.user_skin_type if payload else None) or user_skin_type or "Combination"
        allergies = (payload.user_allergies if payload and payload.user_allergies else [])
        sensitivities = (payload.user_sensitivities if payload and payload.user_sensitivities else [])
        t_email = (payload.user_email if payload else None) or user_email

        patient_name = "Patient"
        
        # DATABASE LOOKUP FOR PATIENT ALLERGIES & CONTEXT
        if t_email:
            conn = None
            cursor = None
            try:
                conn = get_db_conn()
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT sp.skin_type, sp.allergies, sp.sensitivities, u.name 
                    FROM users u
                    LEFT JOIN skin_profiles sp ON u.id = sp.user_id
                    WHERE LOWER(u.email) = LOWER(%s)
                """, (t_email.strip(),))
                db_data = cursor.fetchone()
                
                if db_data:
                    patient_name = db_data.get("name") or patient_name
                    
                    if not (payload and payload.user_skin_type) and not user_skin_type:
                        s_type = db_data.get("skin_type") or "Combination"
                        
                    db_alg = db_data.get("allergies")
                    if db_alg and str(db_alg).lower() not in ["none", ""]:
                        allergies.extend([a.strip() for a in str(db_alg).split(",")])
                        
                    db_sens = db_data.get("sensitivities")
                    if db_sens and str(db_sens).lower() not in ["none", ""]:
                        sensitivities.extend([s.strip() for s in str(db_sens).split(",")])
            except Exception as db_err:
                print(f"⚠️ DB Fetch Error for Ingredient Context: {db_err}")
            finally:
                if cursor: cursor.close()
                if conn: conn.close()
                
        # Remove duplicates
        allergies = list(dict.fromkeys(allergies))
        sensitivities = list(dict.fromkeys(sensitivities))

        results = analyze_ingredient_intelligence(
            product_name=p_name.strip(),
            raw_ingredients=r_ingredients.strip(),
            user_skin_type=s_type,
            user_allergies=allergies,
            user_sensitivities=sensitivities
        )
        
        return {
            "status": "success", 
            "context": {
                "patient_name": patient_name,
                "skin_type": s_type,
                "allergies": allergies if allergies else ["None"]
            },
            "data": results
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error during Gemini ingredient analysis: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gemini Analysis Engine Error: {str(e)}"
        )


@router.post("/api/v1/ingredients/quick-check", status_code=status.HTTP_200_OK)
@router.post("/api/ingredients/quick-check", status_code=status.HTTP_200_OK)
async def quick_ingredient_check(payload: QuickCheckPayload) -> Dict[str, Any]:
    """Fast single-ingredient evaluation via Google AI Studio Gemini."""
    if not gemini_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google AI Studio service is currently unavailable."
        )

    try:
        prompt = f"""
        Perform a rapid clinical assessment for the following cosmetic ingredient:
        - Ingredient: {payload.ingredient_name}
        - User Skin Type: {payload.user_skin_type}

        Provide a safety rating, primary benefit, and potential risks.
        """

        response = await generate_content_with_retry_and_fallback(
            client=gemini_client,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=QuickCheckOutput,
                temperature=0.1,
            ),
            primary_model=GEMINI_PRIMARY_MODEL,
            fallback_model=GEMINI_FALLBACK_MODEL
        )
        return {
            "status": "success",
            "data": json.loads(response.text)
        }
    except Exception as e:
        print(f"❌ Error during Google AI Studio Quick Check: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google AI Studio Quick Check Error: {str(e)}"
        )