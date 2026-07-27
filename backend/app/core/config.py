from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SECRET_KEY: str = "dev-secret-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DATABASE_URL: str = "postgresql://skincare:skincare@localhost:5432/skincare_db"
    MONGO_URL: str = "mongodb://localhost:27017"
    MONGO_DB: str = "skincare_docs"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()