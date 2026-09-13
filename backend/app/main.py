import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from app.database import engine, Base
from app import models
from app.routers import users, assessment, routine, ingredients, products, scoring, consultant, dermatologist, admin, notifications, hydration, sleep, products_purchase, reminders, reports, report_pdf, report_excel
from app.reminder_scheduler import start_scheduler, stop_scheduler

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Skin Intelligence API")

# Ensure uploads directory structure exists and mount static files
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(os.path.join(UPLOADS_DIR, "assessments"), exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Configure CORS Middleware with environment-driven allowed origins
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173"  # Local development default
)
# Parse comma-separated origins
allowed_origins_list = [origin.strip() for origin in ALLOWED_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """
    Add security headers to all responses.
    
    Headers added:
    - X-Content-Type-Options: Prevents MIME sniffing
    - X-Frame-Options: Prevents clickjacking
    - Content-Security-Policy: Restricts resource loading (API-appropriate policy)
    - Strict-Transport-Security: Forces HTTPS (production only)
    """
    response = await call_next(request)
    
    # Prevent MIME type sniffing
    response.headers["X-Content-Type-Options"] = "nosniff"
    
    # Prevent clickjacking attacks
    response.headers["X-Frame-Options"] = "DENY"
    
    # Content Security Policy appropriate for a backend API
    # Allows: same origin only, no inline scripts/styles
    # Note: Frontend is hosted separately on Vercel
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "  # unsafe-inline needed for Swagger UI
        "style-src 'self' 'unsafe-inline'; "   # unsafe-inline needed for Swagger UI
        "img-src 'self' data:; "                # data: needed for Swagger UI
        "font-src 'self' data:; "
        "connect-src 'self'; "
        "frame-ancestors 'none'"                # Prevents embedding in iframes
    )
    
    # Strict Transport Security (HSTS) - only for HTTPS
    # Check if request is HTTPS (production) or has X-Forwarded-Proto header (behind proxy)
    is_https = (
        request.url.scheme == "https" or 
        request.headers.get("X-Forwarded-Proto") == "https"
    )
    
    if is_https:
        # Force HTTPS for 1 year, include subdomains
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
    
    # Note: X-XSS-Protection header is intentionally omitted as it's deprecated
    # and can introduce vulnerabilities in older browsers. Modern browsers use CSP instead.
    
    return response


app.include_router(users.router)
app.include_router(assessment.router)
app.include_router(routine.router)
app.include_router(ingredients.router)
app.include_router(products.router)
app.include_router(scoring.router)
app.include_router(consultant.router)
app.include_router(dermatologist.router)
app.include_router(admin.router)
app.include_router(notifications.router)
app.include_router(hydration.router)
app.include_router(sleep.router)
app.include_router(products_purchase.router)
app.include_router(reminders.router)
app.include_router(reports.router)
app.include_router(report_pdf.router)
app.include_router(report_excel.router)


@app.on_event("startup")
def on_startup():
    start_scheduler()


@app.on_event("shutdown")
def on_shutdown():
    stop_scheduler()


@app.get("/")
def home():
    return {
        "message": "Welcome to AI Skin Intelligence Backend!"
    }