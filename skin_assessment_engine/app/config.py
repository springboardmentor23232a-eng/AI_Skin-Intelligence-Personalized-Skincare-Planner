import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "PanaceaAI Skin Assessment Engine API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/assessment"
    
    # Database Settings
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/skin_intelligence_db"
    )
    # Testing database fallback (SQLite in-memory or file if postgres is unavailable)
    TEST_DATABASE_URL: str = "sqlite:///./test_skin_assessment.db"
    
    # JWT Authentication Settings
    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY",
        "panacea_super_secret_jwt_key_2026_infosys_springboard"
    )
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
