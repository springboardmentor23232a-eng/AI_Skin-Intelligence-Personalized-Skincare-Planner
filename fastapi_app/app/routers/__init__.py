from app.routers.assessment_router import router as assessment_router
from app.routers import (
    routine_router, gemini_router, ingredient_router,
    product_router, progress_router, analytics_router, scoring_router
)

__all__ = [
    "assessment_router", "routine_router", "gemini_router",
    "ingredient_router", "product_router", "progress_router",
    "analytics_router", "scoring_router"
]
