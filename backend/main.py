import os
from dotenv import load_dotenv
load_dotenv("keys.env")
import time
import random
import logging
from contextlib import asynccontextmanager
from typing import Any, Optional
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exception_handlers import http_exception_handler

# Import Google GenAI SDK
from google import genai
from google.genai import types

from skin_assessment_engine import router as assessment_router, init_engine, close_engine
from routine_router import router as routine_router
from dermatologist_router import router as dermatologist_router
from progress_router import router as progress_router
from appointments_router import router as appointments_router
from ingredient_router import router as ingredient_router
from product_router import router as product_router
from scoring_router import router as scoring_router
    
logger = logging.getLogger("uvicorn.error")

# Model Configuration Constants
GEMINI_PRIMARY_MODEL = os.getenv("GEMINI_PRIMARY_MODEL", "gemini-2.5-flash")
GEMINI_FALLBACK_MODEL = os.getenv("GEMINI_FALLBACK_MODEL", "gemini-3.5-flash-lite")

# ==============================================================================
# RETRY & FALLBACK UTILITY FOR 429 RESOURCE_EXHAUSTED / RATE LIMITS
# ==============================================================================
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
    falls back between supported Flash models when daily quota limits are reached, and enforces proactive delays.
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
                # Proactive delay to avoid triggering free-tier requests per minute (RPM) limits
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
                        logger.warning(f"⚠️ 429 Rate Limit hit on {current_model}. Retrying in {delay:.2f}s... (Attempt {attempt + 1}/{max_retries_per_model})")
                        time.sleep(delay)
                    else:
                        logger.warning(f"⚠️ Model {current_model} daily quota or rate limit exhausted. Switching to fallback model...")
                        time.sleep(4)
                        break
                else:
                    logger.warning(f"⚠️ Model {current_model} error: {e}. Switching to fallback model...")
                    break

    if last_exception:
        raise last_exception
    raise RuntimeError("All configured Gemini models failed due to rate limits or quota exhaustion.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing DermaAI Engine resources...")
    
    # Initialize and register Google GenAI Client and utility state
    try:
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if gemini_api_key:
            app.state.genai_client = genai.Client(api_key=gemini_api_key)
        else:
            app.state.genai_client = genai.Client()
        
        app.state.primary_model = GEMINI_PRIMARY_MODEL
        app.state.fallback_model = GEMINI_FALLBACK_MODEL
        app.state.generate_content = generate_content_with_retry_and_fallback
        logger.info("🤖 Google GenAI SDK initialized successfully with rate-limit handling and model fallback capabilities.")
    except Exception as e:
        app.state.genai_client = None
        logger.warning(f"⚠️ Google GenAI SDK initialization warning: {e}")

    try:
        init_engine()
        yield
    finally:
        logger.info("Shutting down DermaAI Engine...")
        close_engine()

app = FastAPI(
    title="DermaAI Engine",
    version="2.0.0",
    description="Enterprise Multi-Modal Skincare Assessment & Routine Generation Engine",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
        "http://localhost:8000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Serve static assets and administrative HTML panels
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

if os.path.exists("admin_dashboard"):
    app.mount("/admin_dashboard", StaticFiles(directory="admin_dashboard", html=True), name="admin_dashboard")


@app.get("/", status_code=status.HTTP_200_OK)
@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    has_gemini_key = bool(os.environ.get("GEMINI_API_KEY"))
    genai_ready = getattr(app.state, "genai_client", None) is not None or has_gemini_key
    
    return {
        "status": "healthy" if genai_ready else "degraded",
        "engine": "DermaAI Engine",
        "genai_sdk": "active" if genai_ready else "missing_key",
        "primary_model": GEMINI_PRIMARY_MODEL,
        "fallback_model": GEMINI_FALLBACK_MODEL,
        "version": "2.0.0"
    }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return await http_exception_handler(request, exc)
    
    logger.error(f"Unhandled Exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"status": "error", "message": f"Internal Server Error: {str(exc)}"}
    )


# Include All System Engine Routers
app.include_router(assessment_router)
app.include_router(routine_router)
app.include_router(dermatologist_router)
app.include_router(progress_router)
app.include_router(appointments_router)
app.include_router(ingredient_router)
app.include_router(product_router)
app.include_router(scoring_router)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
