import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "AI Skin Intelligence"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://skin_user:skin_pass@db:5432/skin_intelligence_db",
    )
    SECRET_KEY: str = os.getenv("SECRET_KEY", "CHANGE_THIS_SECRET_KEY_IN_PRODUCTION")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
