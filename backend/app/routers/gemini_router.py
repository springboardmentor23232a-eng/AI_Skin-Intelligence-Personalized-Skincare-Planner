from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.deps import get_current_user
from app.config import settings

router = APIRouter(prefix="/api/ai", tags=["Gemini AI Assistant"])


def _build_context(db: Session, user: models.User) -> str:
    profile = db.query(models.SkinProfile).filter(models.SkinProfile.user_id == user.id).first()
    latest = (
        db.query(models.SkinAssessment)
        .filter(models.SkinAssessment.user_id == user.id)
        .order_by(models.SkinAssessment.assessment_date.desc())
        .first()
    )
    parts = [f"User: {user.full_name}"]
    if profile:
        parts.append(f"Skin type: {profile.skin_type}, Allergies: {profile.allergies}, Sensitivities: {profile.sensitivities}")
    if latest:
        concerns = ", ".join(c.concern_name for c in latest.concerns)
        parts.append(f"Latest skin health score: {latest.skin_health_score} ({latest.overall_condition})")
        parts.append(f"Current concerns: {concerns}")
    return " | ".join(parts)


@router.post("/chat", response_model=schemas.GeminiChatResponse)
def gemini_chat(
    payload: schemas.GeminiChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Sends a skincare-related question to Google Gemini, enriched with the
    user's skin profile & latest assessment as context, for personalized
    AI-generated skincare guidance.
    """
    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Gemini API key not configured. Set GEMINI_API_KEY in your .env file.",
        )

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-flash")

        context = payload.context or _build_context(db, current_user)
        full_prompt = (
            "You are a helpful, cautious AI skincare assistant embedded in the "
            "'AI Skin Intelligence' platform. You give general skincare "
            "guidance only, never a medical diagnosis, and you recommend seeing "
            "a dermatologist for serious concerns.\n\n"
            f"User context: {context}\n\n"
            f"User question: {payload.prompt}"
        )
        response = model.generate_content(full_prompt)
        return schemas.GeminiChatResponse(response=response.text)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini API error: {e}")
