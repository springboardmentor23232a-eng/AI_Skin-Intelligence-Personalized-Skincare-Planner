import os
from dotenv import load_dotenv

# Load env variables from backend root directory
load_dotenv()

class Settings:
    # Database URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/skin_intelligence")
    
    # JWT Authentication config
    JWT_SECRET: str = os.getenv("JWT_SECRET", "YOUR_FALLBACK_DEV_SECRET_KEY_FOR_LOCAL_DEV_ONLY")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    # Google Client SSO
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    
    # CORS Origins (fallback to wildcard if not provided)
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")

settings = Settings()
