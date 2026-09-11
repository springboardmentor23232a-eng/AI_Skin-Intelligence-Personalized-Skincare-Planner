import logging
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import DATABASE_URL

logger = logging.getLogger("skin_assessment_db")

Base = declarative_base()

def initialize_engine():
    # If running on Render/Cloud container and DATABASE_URL points to localhost without external PG DB
    if "localhost" in DATABASE_URL and (os.getenv("RENDER") or os.getenv("PORT")):
        logger.info("Cloud container detected without external DATABASE_URL. Using SQLite database.")
        return create_engine("sqlite:///./skincare_production.db", connect_args={"check_same_thread": False})

    try:
        eng = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20
        )
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))
        return eng
    except Exception as e:
        logger.warning(f"PostgreSQL connection warning ({e}). Using SQLite database fallback.")
        return create_engine("sqlite:///./skincare_production.db", connect_args={"check_same_thread": False})

engine = initialize_engine()
fallback_engine = engine

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
FallbackSessionLocal = SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


