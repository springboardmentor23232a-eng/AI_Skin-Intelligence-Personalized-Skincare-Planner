from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from app.auth.security import get_current_user, get_optional_current_user, AuthenticatedUser
from app.service.gemini_service import GeminiService
from app.config import GEMINI_API_KEY

router = APIRouter(prefix="/api/ai", tags=["Gemini AI Assistant"])

class GeminiChatInput(BaseModel):
    prompt: str = Field(..., description="Skincare question or consultation prompt")
    skin_context: Optional[Dict[str, Any]] = Field(default=None, description="Optional user skin profile metadata")

class GeminiImageAnalysisInput(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded face or skin photo string")
    user_notes: Optional[str] = Field(default=None, description="Optional user comments or observations")

@router.get("/status")
def get_ai_status():
    """
    Returns current status of Gemini AI service integration and model availability.
    """
    configured = GeminiService.is_configured()
    return {
        "status": "ONLINE",
        "gemini_api_configured": configured,
        "active_model": "gemini-1.5-flash" if configured else "Rule-Based AI Engine (Fallback)",
        "message": "Gemini 1.5 Flash AI Service is active." if configured else "Gemini API key not configured. Operating in Rule-Based Fallback mode."
    }

@router.post("/chat")
def chat_with_ai(
    payload: GeminiChatInput,
    current_user: AuthenticatedUser = Depends(get_optional_current_user)
):
    """
    Interactive Skincare Consultation Endpoint.
    """
    if not payload.prompt or not payload.prompt.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt cannot be empty."
        )

    result = GeminiService.chat_consultation(
        prompt=payload.prompt,
        skin_context=payload.skin_context
    )
    return result

@router.post("/analyze-image")
def analyze_skin_image(
    payload: GeminiImageAnalysisInput,
    current_user: AuthenticatedUser = Depends(get_optional_current_user)
):
    """
    Multimodal Image Skin Analysis Endpoint.
    """
    if not payload.image_base64 or not payload.image_base64.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image data (Base64) is required."
        )

    result = GeminiService.analyze_skin_image(
        image_base64=payload.image_base64,
        user_notes=payload.user_notes
    )
    return result
