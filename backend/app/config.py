import os
from dotenv import load_dotenv

# Load env variables from backend root directory
load_dotenv()

def _get_database_url() -> str:
    raw_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/skin_intelligence")
    if raw_url.startswith("postgres://"):
        return raw_url.replace("postgres://", "postgresql://", 1)
    return raw_url

class Settings:
    # Database URL (safely normalizes Render postgres:// to postgresql:// for SQLAlchemy 2.0)
    DATABASE_URL: str = _get_database_url()
    
    # JWT Authentication config
    JWT_SECRET: str = os.getenv("JWT_SECRET", "YOUR_FALLBACK_DEV_SECRET_KEY_FOR_LOCAL_DEV_ONLY")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    # Google Client SSO
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    
    # CORS Origins (fallback to wildcard if not provided)
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")
    
    # Email / SMTP Delivery Config
    EMAIL_ENABLED: bool = os.getenv("EMAIL_ENABLED", "false").lower() in ("true", "1", "yes")
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "noreply@aiskinintelligence.com")
    EMAIL_FROM_NAME: str = os.getenv("EMAIL_FROM_NAME", "AI Skin Intelligence")
    SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "true").lower() in ("true", "1", "yes")

settings = Settings()
